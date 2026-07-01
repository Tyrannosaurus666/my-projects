package com.knowledgebase.service.parser;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentParserService {

    @Value("${kn.chunk.max-size:500}")
    private int maxChunkSize;

    @Value("${kn.chunk.overlap:50}")
    private int overlap;

    public String extractText(byte[] fileBytes, String fileName) {
        String text = new String(fileBytes, java.nio.charset.StandardCharsets.UTF_8);
        return text.trim();
    }

    public List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) return chunks;

        String[] paragraphs = text.split("\\n\\s*\\n");
        StringBuilder current = new StringBuilder();

        for (String para : paragraphs) {
            para = para.trim();
            if (para.isBlank()) continue;

            if (current.length() + para.length() > maxChunkSize && current.length() > 0) {
                chunks.add(current.toString().trim());
                String overlap = getOverlap(current.toString());
                current = new StringBuilder(overlap);
            }
            if (current.length() > 0) current.append("\n\n");
            current.append(para);
        }

        if (current.length() > 0) {
            chunks.add(current.toString().trim());
        }

        return chunks;
    }

    private String getOverlap(String text) {
        if (text.length() <= overlap) return "";
        int lastPeriod = text.lastIndexOf('.', text.length() - 1);
        int start = Math.max(lastPeriod + 1, text.length() - overlap);
        return text.substring(start).trim();
    }
}
