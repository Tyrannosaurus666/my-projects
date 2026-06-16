package com.example.recruitment.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.recruitment.entity.ApplicationStage;
import com.example.recruitment.entity.dto.StatusUpdateRequest;
import java.util.List;
import java.util.Map;

public interface ApplicationService {
    void apply(Long jobId, Long userId, String resumeUrl);
    Page<Map<String, Object>> listApplications(String scope, Long jobId, Long userId, String role, Integer pageNum, Integer pageSize);
    void updateStatus(Long appId, StatusUpdateRequest req, Long hrId, String role);
    void applyWithFile(Long jobId, Long userId, String originalFilename, byte[] bytes);
    List<ApplicationStage> getStageHistory(Long appId);
}
