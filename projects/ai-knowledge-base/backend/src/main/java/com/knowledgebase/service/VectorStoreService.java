package com.knowledgebase.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgebase.entity.DocumentChunk;
import com.knowledgebase.mapper.DocumentChunkMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VectorStoreService {

    private final DocumentChunkMapper chunkMapper;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${kn.search.top-k:5}")
    private int topK;

    @Value("${kn.search.similarity-threshold:0.5}")
    private double similarityThreshold;

    public VectorStoreService(DocumentChunkMapper chunkMapper) {
        this.chunkMapper = chunkMapper;
    }

    public void saveEmbedding(DocumentChunk chunk, List<Double> embedding) {
        try {
            chunk.setEmbedding(mapper.writeValueAsString(embedding));
            if (chunk.getId() != null) {
                chunkMapper.updateById(chunk);
            } else {
                chunkMapper.insert(chunk);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<DocumentChunk> searchSimilar(Long kbId, List<Double> queryEmbedding) {
        List<DocumentChunk> allChunks = chunkMapper.selectList(
            new LambdaQueryWrapper<DocumentChunk>()
                .eq(DocumentChunk::getKbId, kbId)
                .isNotNull(DocumentChunk::getEmbedding)
        );

        List<ScoredChunk> scored = new ArrayList<>();
        for (DocumentChunk chunk : allChunks) {
            try {
                List<Double> chunkEmbedding = mapper.readValue(chunk.getEmbedding(),
                    new TypeReference<List<Double>>() {});
                double similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
                if (similarity >= similarityThreshold) {
                    scored.add(new ScoredChunk(chunk, similarity));
                }
            } catch (Exception ignored) {}
        }

        scored.sort((a, b) -> Double.compare(b.score, a.score));
        return scored.stream()
            .limit(topK)
            .map(s -> s.chunk)
            .collect(Collectors.toList());
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private record ScoredChunk(DocumentChunk chunk, double score) {}
}
