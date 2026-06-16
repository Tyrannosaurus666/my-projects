package com.example.recruitment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.recruitment.common.Result;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.dto.JobRequest;
import com.example.recruitment.service.JobService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping
    public Result<Page<JobPost>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String salaryKeyword,
            @RequestParam(required = false) String reqKeyword,
            @RequestParam(required = false) String tag) {
        return Result.success(jobService.listJobs(pageNum, pageSize, keyword, status, salaryKeyword, reqKeyword, tag));
    }

    @GetMapping("/{id}")
    public Result<JobPost> detail(@PathVariable Long id) {
        return Result.success(jobService.getJobDetail(id));
    }

    @PostMapping
    public Result<Void> create(@Valid @RequestBody JobRequest req, HttpServletRequest request) {
        Long hrId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if (!"hr".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "只有HR可以发布职位");
        }
        jobService.createJob(req, hrId);
        return Result.success(null, "发布成功");
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody JobRequest req,
                                HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        jobService.updateJob(id, req, userId, role);
        return Result.success(null, "更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        jobService.deleteJob(id, userId, role);
        return Result.success(null, "下架成功");
    }
}
