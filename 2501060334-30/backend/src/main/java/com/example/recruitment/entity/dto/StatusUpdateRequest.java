package com.example.recruitment.entity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotBlank(message = "状态不能为空")
    private String status;

    private String content;

    private String nextStage;
}
