package com.aiagent.controller;

import com.aiagent.common.Result;
import com.aiagent.entity.Agent;
import com.aiagent.entity.Message;
import com.aiagent.entity.Task;
import com.aiagent.service.agent.AgentService;
import com.aiagent.service.workflow.WorkflowEngine;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AgentController {

    private final AgentService agentService;
    private final WorkflowEngine workflowEngine;

    public AgentController(AgentService agentService, WorkflowEngine workflowEngine) {
        this.agentService = agentService;
        this.workflowEngine = workflowEngine;
    }

    @PostMapping("/session")
    public Result<Map<String, String>> createSession() {
        String sessionId = workflowEngine.createSession();
        return Result.success(Map.of("sessionId", sessionId));
    }

    @PostMapping("/task/execute")
    public Result<Task> executeTask(@RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        String objective = body.get("objective");
        Task task = workflowEngine.executeTask(sessionId, objective);
        return Result.success(task);
    }

    @GetMapping("/task/{taskId}")
    public Result<Task> getTask(@PathVariable String taskId) {
        return Result.success(workflowEngine.getTask(taskId));
    }

    @GetMapping("/session/{sessionId}/messages")
    public Result<List<Message>> getSessionMessages(@PathVariable String sessionId) {
        return Result.success(workflowEngine.getSessionMessages(sessionId));
    }

    @PostMapping("/agents")
    public Result<Agent> createAgent(@RequestBody Agent agent) {
        return Result.success(agentService.createAgent(agent));
    }

    @GetMapping("/agents")
    public Result<List<Agent>> listAgents() {
        return Result.success(agentService.getAllAgents());
    }

    @DeleteMapping("/agents/{id}")
    public Result<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return Result.success();
    }
}
