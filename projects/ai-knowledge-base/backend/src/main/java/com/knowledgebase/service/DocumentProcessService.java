package com.knowledgebase.service;

import com.knowledgebase.entity.Document;
import com.knowledgebase.entity.DocumentChunk;
import com.knowledgebase.entity.KnowledgeBase;
import com.knowledgebase.mapper.DocumentChunkMapper;
import com.knowledgebase.mapper.DocumentMapper;
import com.knowledgebase.mapper.KnowledgeBaseMapper;
import com.knowledgebase.service.parser.DocumentParserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DocumentProcessService {

    private final DocumentMapper documentMapper;
    private final DocumentChunkMapper chunkMapper;
    private final KnowledgeBaseMapper kbMapper;
    private final DocumentParserService parserService;
    private final EmbeddingService embeddingService;
    private final VectorStoreService vectorStoreService;

    public DocumentProcessService(DocumentMapper documentMapper, DocumentChunkMapper chunkMapper,
                                  KnowledgeBaseMapper kbMapper, DocumentParserService parserService,
                                  EmbeddingService embeddingService, VectorStoreService vectorStoreService) {
        this.documentMapper = documentMapper;
        this.chunkMapper = chunkMapper;
        this.kbMapper = kbMapper;
        this.parserService = parserService;
        this.embeddingService = embeddingService;
        this.vectorStoreService = vectorStoreService;
    }

    @Transactional
    public void processDocument(Long docId, byte[] fileBytes, String fileName) {
        Document doc = documentMapper.selectById(docId);
        if (doc == null) return;

        doc.setStatus("processing");
        documentMapper.updateById(doc);

        try {
            String text = parserService.extractText(fileBytes, fileName);
            List<String> chunks = parserService.chunkText(text);

            Long kbId = doc.getKbId();
            int index = 0;

            for (String chunkText : chunks) {
                DocumentChunk chunk = new DocumentChunk();
                chunk.setKbId(kbId);
                chunk.setDocId(docId);
                chunk.setChunkIndex(index++);
                chunk.setContent(chunkText);
                chunk.setTokenCount(chunkText.length() / 4);
                chunkMapper.insert(chunk);

                List<Double> embedding = embeddingService.getEmbedding(chunkText);
                if (embedding != null) {
                    vectorStoreService.saveEmbedding(chunk, embedding);
                }
            }

            doc.setStatus("done");
            doc.setChunkCount(index);
            documentMapper.updateById(doc);

            KnowledgeBase kb = kbMapper.selectById(kbId);
            if (kb != null) {
                long totalChunks = chunkMapper.selectCount(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<DocumentChunk>()
                        .eq(DocumentChunk::getKbId, kbId));
                long totalDocs = documentMapper.selectCount(
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Document>()
                        .eq(Document::getKbId, kbId));
                kb.setDocCount((int) totalDocs);
                kb.setChunkCount((int) totalChunks);
                kbMapper.updateById(kb);
            }

        } catch (Exception e) {
            doc.setStatus("failed");
            documentMapper.updateById(doc);
            e.printStackTrace();
        }
    }
}
