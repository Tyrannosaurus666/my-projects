package com.example.recruitment.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ScheduleRequest {
    @NotBlank(message = "面试时间不能为空")
    private String interviewTime;

    private String place;

    private String title;

    private String status;
}
