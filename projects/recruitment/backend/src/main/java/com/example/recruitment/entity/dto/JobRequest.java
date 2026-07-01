package com.example.recruitment.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class JobRequest {

    @NotBlank(message = "职位标题不能为空")
    @Size(min = 1, max = 100, message = "标题1-100个字符")
    private String title;

    @Size(max = 50, message = "薪资描述最多50个字符")
    private String salaryText;

    @Size(max = 2000, message = "岗位要求最多2000个字符")
    private String requirements;

    private String deadline;

    private String tags;
}
