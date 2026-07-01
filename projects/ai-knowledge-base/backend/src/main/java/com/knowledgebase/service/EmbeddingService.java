package com.knowledgebase.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    @Value("${llm.api-key}")
    private String apiKey;

    @Value("${llm.api-url}")
    private String apiUrl;

    @Value("${llm.embedding-model:text-embedding-ada-002}")
    private String embeddingModel;

    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<Double> getEmbedding(String text) {
        try {
            Map<String, Object> body = Map.of(
                "model", embeddingModel,
                "input", text
            );
            String json = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl + "/embeddings"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                Map<String, Object> result = mapper.readValue(response.body(), Map.class);
                List<Map<String, Object>> data = (List<Map<String, Object>>) result.get("data");
                if (data != null && !data.isEmpty()) {
                    return (List<Double>) data.get(0).get("embedding");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
