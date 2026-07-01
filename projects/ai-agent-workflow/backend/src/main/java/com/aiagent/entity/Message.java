package com.aiagent.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Message {
    private String id;
    private String sessionId;
    private String taskId;
    private String role;
    private String agentName;
    private String content;
    private String toolCall;
    private String toolResult;
    private LocalDateTime timestamp;
}
