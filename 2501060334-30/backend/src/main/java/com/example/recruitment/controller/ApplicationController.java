package com.example.recruitment.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.recruitment.common.Result;
import com.example.recruitment.entity.ApplicationStage;
import com.example.recruitment.entity.InterviewNote;
import com.example.recruitment.entity.dto.StatusUpdateRequest;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.entity.Application;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.User;
import com.example.recruitment.mapper.ApplicationMapper;
import com.example.recruitment.mapper.InterviewNoteMapper;
import com.example.recruitment.mapper.JobMapper;
import com.example.recruitment.mapper.UserMapper;
import com.example.recruitment.service.ApplicationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService appService;
    private final InterviewNoteMapper noteMapper;
    private final ApplicationMapper appMapper;
    private final JobMapper jobMapper;
    private final UserMapper userMapper;

    public ApplicationController(ApplicationService appService, InterviewNoteMapper noteMapper,
                                  ApplicationMapper appMapper, JobMapper jobMapper, UserMapper userMapper) {
        this.appService = appService;
        this.noteMapper = noteMapper;
        this.appMapper = appMapper;
        this.jobMapper = jobMapper;
        this.userMapper = userMapper;
    }

    @PostMapping
    public Result<Void> apply(@RequestParam Long jobId,
                               @RequestParam(required = false) MultipartFile file,
                               HttpServletRequest request) throws IOException {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if (!"candidate".equals(role)) {
            return Result.error(403, "只有候选人可以投递");
        }
        if (file != null && !file.isEmpty()) {
            appService.applyWithFile(jobId, userId,
                    file.getOriginalFilename(), file.getBytes());
        } else {
            appService.apply(jobId, userId, null);
        }
        return Result.success(null, "投递成功");
    }

    @GetMapping
    public Result<Page<Map<String, Object>>> list(
            @RequestParam(defaultValue = "mine") String scope,
            @RequestParam(required = false) Long jobId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        return Result.success(appService.listApplications(scope, jobId, userId, role, pageNum, pageSize));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody StatusUpdateRequest req,
                                      HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if (!"hr".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "只有HR可以更新申请状态");
        }
        appService.updateStatus(id, req, userId, role);
        return Result.success(null, "状态更新成功");
    }

    @GetMapping("/{id}/notes")
    public Result<List<InterviewNote>> getNotes(@PathVariable Long id) {
        List<InterviewNote> notes = noteMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<InterviewNote>()
                        .eq(InterviewNote::getAppId, id)
                        .orderByDesc(InterviewNote::getCreateTime));
        return Result.success(notes);
    }

    @GetMapping("/{id}/stages")
    public Result<List<ApplicationStage>> getStages(@PathVariable Long id) {
        return Result.success(appService.getStageHistory(id));
    }

    @GetMapping("/{id}/offer")
    public Result<Map<String, String>> getOffer(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        if (!"hr".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "只有HR可以生成Offer");
        }
        Application app = appMapper.selectById(id);
        if (app == null) {
            return Result.error(3002, "投递记录不存在");
        }
        if (!"已录用".equals(app.getStatus())) {
            return Result.error(400, "只有已录用的申请才能生成Offer");
        }
        JobPost job = jobMapper.selectById(app.getJobId());
        if (!"admin".equals(role) && !job.getHrId().equals(userId)) {
            return Result.error(4001, "只能为自己职位下的投递生成Offer");
        }
        User candidate = userMapper.selectById(app.getUserId());
        Map<String, String> offer = new LinkedHashMap<>();
        offer.put("title", "录用通知书");
        offer.put("candidateName", candidate != null ? candidate.getUsername() : "未知");
        offer.put("jobTitle", job != null ? job.getTitle() : "未知职位");
        offer.put("salary", job != null ? (job.getSalaryText() != null ? job.getSalaryText() : "面议") : "面议");
        offer.put("date", java.time.LocalDate.now().toString());
        offer.put("content", "恭喜您通过面试筛选，已被正式录用！请携带身份证件于指定日期报到。\n(教学简化：此为Offer文本模板占位，实际项目可对接PDF生成服务)");
        return Result.success(offer, "Offer生成成功");
    }

    @GetMapping("/{id}/resume")
    public Result<Map<String, Object>> getResumeText(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        Application app = appMapper.selectById(id);
        if (app == null) {
            return Result.error(3002, "投递记录不存在");
        }
        // Permission: HR who owns the job, admin, or the candidate themselves
        if (!"admin".equals(role)) {
            JobPost job = jobMapper.selectById(app.getJobId());
            if (!userId.equals(app.getUserId()) && (job == null || !job.getHrId().equals(userId))) {
                return Result.error(4001, "无权查看该简历");
            }
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("resumeUrl", app.getResumeUrl());
        data.put("resumeHash", app.getResumeHash());
        data.put("resumeText", app.getResumeText() != null ? app.getResumeText() : "");
        return Result.success(data);
    }

    @GetMapping("/duplicates")
    public Result<List<Application>> listDuplicates(@RequestParam String hash, HttpServletRequest request) {
        String role = (String) request.getAttribute("role");
        if (!"hr".equals(role) && !"admin".equals(role)) {
            return Result.error(403, "只有HR/Admin可以查询简历重复");
        }
        List<Application> dupes = appMapper.selectList(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getResumeHash, hash));
        return Result.success(dupes, "找到 " + dupes.size() + " 份相同简历(MD5)");
    }
}
