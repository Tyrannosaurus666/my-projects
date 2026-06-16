package com.example.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("application_stage")
public class ApplicationStage implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long appId;

    private String fromStatus;

    private String toStatus;

    private Long operatorId;

    private Integer legacy;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
