package com.example.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("interview_schedule")
public class InterviewSchedule implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long appId;

    private Long hrId;

    private LocalDateTime interviewTime;

    private String place;

    private String title;

    private String status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
