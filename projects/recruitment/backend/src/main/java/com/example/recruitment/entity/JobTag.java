package com.example.recruitment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("job_tag")
public class JobTag {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long jobId;

    private String tagName;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
