package com.knowledgebase.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("kb_qa_history")
public class QAHistory {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long kbId;
    private String question;
    private String answer;
    private String sourceChunks;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
