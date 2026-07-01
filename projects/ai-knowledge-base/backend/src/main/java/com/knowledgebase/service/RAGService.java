package com.knowledgebase.service;

import com.knowledgebase.entity.DocumentChunk;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RAGService {

    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;
    private final LLMService llmService;

    public RAGService(EmbeddingService embeddingService, VectorStoreService vectorStoreService, LLMService llmService) {
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
        this.llmService = llmService;
    }

    public Map<String, Object> ask(Long kbId, String question) {
        List<Double> queryEmbedding = embeddingService.getEmbedding(question);
        if (queryEmbedding == null) {
            return Map.of("answer", "Failed to generate embedding for query.", "sources", List.of());
        }

        List<DocumentChunk> relevantChunks = vectorStoreService.searchSimilar(kbId, queryEmbedding);
        if (relevantChunks.isEmpty()) {
            return Map.of("answer", "No relevant information found in the knowledge base.", "sources", List.of());
        }

        String context = relevantChunks.stream()
            .map(c -> "[" + c.getChunkIndex() + "] " + c.getContent())
            .collect(Collectors.joining("\n\n---\n\n"));

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
            "You are a knowledge base Q&A assistant. Answer the user's question based ONLY on the provided context. " +
            "If the context doesn't contain enough information, say so. Cite sources as [chunk_number]."));
        messages.add(Map.of("role", "user", "content",
            "Context:\n" + context + "\n\nQuestion: " + question));

        String answer = llmService.chat(messages);
        if (answer == null) {
            answer = "Failed to get answer from LLM.";
        }

        List<String> sources = relevantChunks.stream()
            .map(c -> "[" + c.getChunkIndex() + "] " + c.getContent().substring(0, Math.min(100, c.getContent().length())) + "...")
            .collect(Collectors.toList());

        return Map.of("answer", answer, "sources", sources);
    }
}
