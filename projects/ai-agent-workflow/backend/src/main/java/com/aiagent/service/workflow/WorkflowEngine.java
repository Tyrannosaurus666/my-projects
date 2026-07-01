package com.aiagent.service.workflow;

import com.aiagent.entity.Message;
import com.aiagent.entity.Task;
import com.aiagent.service.llm.LLMService;
import com.aiagent.service.tool.ToolService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

@Service
public class WorkflowEngine {

    private final LLMService llmService;
    private final ToolService toolService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, Task> tasks = new ConcurrentHashMap<>();
    private final Map<String, List<Message>> sessions = new ConcurrentHashMap<>();

    public WorkflowEngine(LLMService llmService, ToolService toolService) {
        this.llmService = llmService;
        this.toolService = toolService;
    }

    public Task executeTask(String sessionId, String objective) {
        Task task = new Task();
        task.setTaskId(UUID.randomUUID().toString().substring(0, 8));
        task.setSessionId(sessionId);
        task.setObjective(objective);
        task.setStatus("running");
        task.setMessages(new ArrayList<>());
        task.setContext(new HashMap<>());
        task.setCreateTime(LocalDateTime.now());
        tasks.put(task.getTaskId(), task);

        sessions.computeIfAbsent(sessionId, k -> new ArrayList<>());

        CompletableFuture.runAsync(() -> executeAsync(task));
        return task;
    }

    private void executeAsync(Task task) {
        try {
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content",
                    "You are an AI assistant with access to tools. " +
                    "Analyze the task, use tools when needed, and provide a complete answer. " +
                    "You can search the web, do calculations, fetch URLs, and check time."));
            messages.add(Map.of("role", "user", "content", task.getObjective()));

            int maxIterations = 10;
            for (int i = 0; i < maxIterations; i++) {
                String response = llmService.chat(messages, toolService.getToolDefinitions());
                var responseMap = mapper.readValue(response, new TypeReference<Map<String, Object>>() {});

                String content = (String) responseMap.get("content");
                var toolCalls = (List<Map<String, Object>>) responseMap.get("tool_calls");

                if (content != null && !content.isBlank()) {
                    addMessage(task, "assistant", "AI", content, null, null);
                }

                if (toolCalls != null && !toolCalls.isEmpty()) {
                    for (var tc : toolCalls) {
                        var func = (Map<String, Object>) tc.get("function");
                        String toolName = (String) func.get("name");
                        String args = (String) func.get("arguments");
                        String toolCallId = (String) tc.get("id");

                        addMessage(task, "assistant", "AI", null, toolName + "(" + args + ")", null);

                        String result = toolService.executeTool(toolName, args);

                        messages.add(Map.of("role", "assistant", "content",
                                content != null ? content : ""));
                        messages.add(Map.of("role", "tool", "content", result,
                                "tool_call_id", toolCallId));

                        addMessage(task, "tool", toolName, result, null, null);
                    }
                } else {
                    if (content != null && !content.isBlank()) {
                        task.setResult(content);
                    }
                    break;
                }
            }

            if (task.getResult() == null) {
                task.setResult("Task completed after processing.");
            }
            task.setStatus("completed");

        } catch (Exception e) {
            task.setStatus("failed");
            task.setResult("Error: " + e.getMessage());
        }
        task.setUpdateTime(LocalDateTime.now());
    }

    private void addMessage(Task task, String role, String agentName, String content, String toolCall, String toolResult) {
        Message msg = new Message();
        msg.setId(UUID.randomUUID().toString().substring(0, 8));
        msg.setSessionId(task.getSessionId());
        msg.setTaskId(task.getTaskId());
        msg.setRole(role);
        msg.setAgentName(agentName);
        msg.setContent(content);
        msg.setToolCall(toolCall);
        msg.setToolResult(toolResult);
        msg.setTimestamp(LocalDateTime.now());
        task.getMessages().add(msg);

        List<Message> sessionMsgs = sessions.get(task.getSessionId());
        if (sessionMsgs != null) {
            sessionMsgs.add(msg);
        }
    }

    public Task getTask(String taskId) {
        return tasks.get(taskId);
    }

    public List<Message> getSessionMessages(String sessionId) {
        return sessions.getOrDefault(sessionId, List.of());
    }

    public String createSession() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
