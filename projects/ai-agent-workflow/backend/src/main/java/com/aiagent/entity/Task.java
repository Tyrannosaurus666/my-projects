package com.aiagent.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class Task {
    private String taskId;
    private String sessionId;
    private String objective;
    private String status;
    private String result;
    private List<Agent> agents;
    private List<Message> messages;
    private Map<String, Object> context;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
