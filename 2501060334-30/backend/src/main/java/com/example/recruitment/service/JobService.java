package com.example.recruitment.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.dto.JobRequest;

public interface JobService {
    Page<JobPost> listJobs(Integer pageNum, Integer pageSize, String keyword, String status, String salaryKeyword, String reqKeyword, String tag);
    JobPost getJobDetail(Long id);
    void createJob(JobRequest req, Long hrId);
    void updateJob(Long id, JobRequest req, Long userId, String role);
    void deleteJob(Long id, Long userId, String role);
}
