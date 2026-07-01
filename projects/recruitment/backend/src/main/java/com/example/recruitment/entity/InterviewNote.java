package com.example.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("interview_note")
public class InterviewNote {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long appId;

    private Long hrId;

    private String content;

    private String nextStage;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
