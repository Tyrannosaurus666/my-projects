package com.aiagent.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Agent {
    private Long id;
    private String name;
    private String role;
    private String systemPrompt;
    private String model;
    private Double temperature;
    private List<String> tools;
    private Long sessionId;
    private LocalDateTime createTime;
}
