package com.knowledgebase.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
public class LLMService {

    @Value("${llm.api-key}")
    private String apiKey;

    @Value("${llm.api-url}")
    private String apiUrl;

    @Value("${llm.chat-model:gpt-3.5-turbo}")
    private String chatModel;

    @Value("${llm.max-tokens:2048}")
    private int maxTokens;

    @Value("${llm.temperature:0.3}")
    private double temperature;

    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public String chat(List<Map<String, String>> messages) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", chatModel);
            body.put("messages", messages);
            body.put("max_tokens", maxTokens);
            body.put("temperature", temperature);

            String json = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + "/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> result = mapper.readValue(response.body(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) result.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
