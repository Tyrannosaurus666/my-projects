package com.knowledgebase.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("kb_document")
public class Document {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long kbId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String status;
    private Integer chunkCount;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
