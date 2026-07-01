package com.knowledgebase.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

@Data
@TableName("kb_document_chunk")
public class DocumentChunk {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long kbId;
    private Long docId;
    private Integer chunkIndex;
    private String content;
    private Integer tokenCount;
    private String embedding;
}
