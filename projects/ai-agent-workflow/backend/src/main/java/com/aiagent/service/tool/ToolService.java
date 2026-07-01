package com.aiagent.service.tool;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
public class ToolService {

    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<Map<String, Object>> getToolDefinitions() {
        List<Map<String, Object>> tools = new ArrayList<>();
        tools.add(webSearchTool());
        tools.add(calculatorTool());
        tools.add(webFetchTool());
        tools.add(currentTimeTool());
        return tools;
    }

    public String executeTool(String toolName, String argsJson) throws Exception {
        Map<String, Object> args = mapper.readValue(argsJson, new TypeReference<>() {});
        return switch (toolName) {
            case "web_search" -> webSearch((String) args.get("query"));
            case "calculator" -> calculate((String) args.get("expression"));
            case "web_fetch" -> webFetch((String) args.get("url"));
            case "current_time" -> currentTime();
            default -> "Unknown tool: " + toolName;
        };
    }

    private Map<String, Object> webSearchTool() {
        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "function");
        Map<String, Object> func = new HashMap<>();
        func.put("name", "web_search");
        func.put("description", "Search the web for current information");
        Map<String, Object> params = new HashMap<>();
        params.put("type", "object");
        Map<String, Object> props = new HashMap<>();
        Map<String, Object> query = new HashMap<>();
        query.put("type", "string");
        query.put("description", "Search query");
        props.put("query", query);
        params.put("properties", props);
        params.put("required", List.of("query"));
        func.put("parameters", params);
        tool.put("function", func);
        return tool;
    }

    private Map<String, Object> calculatorTool() {
        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "function");
        Map<String, Object> func = new HashMap<>();
        func.put("name", "calculator");
        func.put("description", "Evaluate a mathematical expression");
        Map<String, Object> params = new HashMap<>();
        params.put("type", "object");
        Map<String, Object> props = new HashMap<>();
        Map<String, Object> expr = new HashMap<>();
        expr.put("type", "string");
        expr.put("description", "Math expression e.g. 2 + 3 * 4");
        props.put("expression", expr);
        params.put("properties", props);
        params.put("required", List.of("expression"));
        func.put("parameters", params);
        tool.put("function", func);
        return tool;
    }

    private Map<String, Object> webFetchTool() {
        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "function");
        Map<String, Object> func = new HashMap<>();
        func.put("name", "web_fetch");
        func.put("description", "Fetch content from a URL");
        Map<String, Object> params = new HashMap<>();
        params.put("type", "object");
        Map<String, Object> props = new HashMap<>();
        Map<String, Object> url = new HashMap<>();
        url.put("type", "string");
        url.put("description", "URL to fetch");
        props.put("url", url);
        params.put("properties", props);
        params.put("required", List.of("url"));
        func.put("parameters", params);
        tool.put("function", func);
        return tool;
    }

    private Map<String, Object> currentTimeTool() {
        Map<String, Object> tool = new HashMap<>();
        tool.put("type", "function");
        Map<String, Object> func = new HashMap<>();
        func.put("name", "current_time");
        func.put("description", "Get current date and time");
        func.put("parameters", Map.of("type", "object", "properties", Map.of(), "required", List.of()));
        tool.put("function", func);
        return tool;
    }

    private String webSearch(String query) throws Exception {
        String url = "https://api.duckduckgo.com/?q=" + java.net.URLEncoder.encode(query, "UTF-8") + "&format=json";
        HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        return "Search results: " + res.body().substring(0, Math.min(res.body().length(), 2000));
    }

    private String calculate(String expression) {
        try {
            javax.script.ScriptEngineManager mgr = new javax.script.ScriptEngineManager();
            javax.script.ScriptEngine engine = mgr.getEngineByName("JavaScript");
            Object result = engine.eval(expression);
            return "Result: " + result;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String webFetch(String url) throws Exception {
        HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
        String text = res.body().replaceAll("<[^>]+>", " ");
        return text.substring(0, Math.min(text.length(), 3000));
    }

    private String currentTime() {
        return "Current time: " + new Date().toString();
    }
}
