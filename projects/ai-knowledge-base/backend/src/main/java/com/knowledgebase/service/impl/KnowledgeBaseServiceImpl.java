package com.knowledgebase.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.knowledgebase.entity.Document;
import com.knowledgebase.entity.DocumentChunk;
import com.knowledgebase.entity.KnowledgeBase;
import com.knowledgebase.mapper.DocumentChunkMapper;
import com.knowledgebase.mapper.DocumentMapper;
import com.knowledgebase.mapper.KnowledgeBaseMapper;
import com.knowledgebase.service.KnowledgeBaseService;
import org.springframework.stereotype.Service;

@Service
public class KnowledgeBaseServiceImpl extends ServiceImpl<KnowledgeBaseMapper, KnowledgeBase> implements KnowledgeBaseService {

    private final DocumentMapper documentMapper;
    private final DocumentChunkMapper chunkMapper;

    public KnowledgeBaseServiceImpl(DocumentMapper documentMapper, DocumentChunkMapper chunkMapper) {
        this.documentMapper = documentMapper;
        this.chunkMapper = chunkMapper;
    }

    @Override
    public boolean removeKnowledgeBase(Long id) {
        documentMapper.delete(new LambdaQueryWrapper<Document>().eq(Document::getKbId, id));
        chunkMapper.delete(new LambdaQueryWrapper<DocumentChunk>().eq(DocumentChunk::getKbId, id));
        return removeById(id);
    }
}
