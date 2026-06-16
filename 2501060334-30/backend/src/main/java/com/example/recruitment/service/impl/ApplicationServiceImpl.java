package com.example.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.recruitment.common.BusinessException;
import com.example.recruitment.entity.Application;
import com.example.recruitment.entity.ApplicationStage;
import com.example.recruitment.entity.InterviewNote;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.dto.StatusUpdateRequest;
import com.example.recruitment.mapper.ApplicationMapper;
import com.example.recruitment.mapper.ApplicationStageMapper;
import com.example.recruitment.mapper.InterviewNoteMapper;
import com.example.recruitment.mapper.JobMapper;
import com.example.recruitment.service.ApplicationService;
import com.example.recruitment.util.ResumeParseUtil;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationMapper appMapper;
    private final JobMapper jobMapper;
    private final InterviewNoteMapper noteMapper;
    private final ApplicationStageMapper stageMapper;

    private static final Set<String> VALID_STATUSES =
            Set.of("待筛选", "已面试", "已录用", "已拒绝");

    private static final Map<String, Set<String>> ALLOWED_TRANSITIONS = Map.of(
            "待筛选", Set.of("已面试", "已拒绝"),
            "已面试", Set.of("已录用", "已拒绝")
    );

    public ApplicationServiceImpl(ApplicationMapper appMapper, JobMapper jobMapper,
                                  InterviewNoteMapper noteMapper,
                                  ApplicationStageMapper stageMapper) {
        this.appMapper = appMapper;
        this.jobMapper = jobMapper;
        this.noteMapper = noteMapper;
        this.stageMapper = stageMapper;
    }

    @Override
    public void apply(Long jobId, Long userId, String resumeUrl) {
        JobPost job = jobMapper.selectById(jobId);
        if (job == null) {
            throw new BusinessException(2001, "职位不存在");
        }
        if (!"招聘中".equals(job.getStatus())) {
            throw new BusinessException(2003, "该职位已停止招聘");
        }
        Application exist = appMapper.selectOne(new LambdaQueryWrapper<Application>()
                .eq(Application::getJobId, jobId)
                .eq(Application::getUserId, userId));
        if (exist != null) {
            throw new BusinessException(1003, "您已投递过该职位");
        }
        Application app = new Application();
        app.setJobId(jobId);
        app.setUserId(userId);
        app.setStatus("待筛选");
        app.setResumeUrl(resumeUrl != null ? resumeUrl : "");
        appMapper.insert(app);
    }

    @Override
    public Page<Map<String, Object>> listApplications(String scope, Long jobId,
                                                       Long userId, String role,
                                                       Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<Application> wrapper = new LambdaQueryWrapper<>();
        if ("mine".equals(scope) && !"admin".equals(role)) {
            wrapper.eq(Application::getUserId, userId);
        } else if ("myJobs".equals(scope)) {
            List<JobPost> myJobs = jobMapper.selectList(
                    new LambdaQueryWrapper<JobPost>().eq(JobPost::getHrId, userId));
            List<Long> myJobIds = myJobs.stream().map(JobPost::getId).toList();
            if (myJobIds.isEmpty()) {
                return new Page<>(pageNum, pageSize);
            }
            wrapper.in(Application::getJobId, myJobIds);
        } else if ("jobId".equals(scope) && jobId != null) {
            JobPost job = jobMapper.selectById(jobId);
            if (job == null) {
                throw new BusinessException(2001, "职位不存在");
            }
            if (!"admin".equals(role) && !job.getHrId().equals(userId)) {
                throw new BusinessException(2002, "无权查看该职位的投递列表");
            }
            wrapper.eq(Application::getJobId, jobId);
        }
        wrapper.orderByDesc(Application::getCreateTime);
        return appMapper.selectMapsPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public void updateStatus(Long appId, StatusUpdateRequest req, Long hrId, String role) {
        if (!VALID_STATUSES.contains(req.getStatus())) {
            throw new BusinessException(400, "无效的状态值");
        }
        Application app = appMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(3002, "投递记录不存在");
        }
        JobPost job = jobMapper.selectById(app.getJobId());
        if (!"admin".equals(role) && !job.getHrId().equals(hrId)) {
            throw new BusinessException(4001, "只能更新自己职位下的投递状态");
        }

        String fromStatus = app.getStatus();
        String toStatus = req.getStatus();
        Set<String> allowed = ALLOWED_TRANSITIONS.get(fromStatus);
        if (allowed != null && !allowed.contains(toStatus)) {
            throw new BusinessException(3004,
                    "不允许的状态流转: " + fromStatus + " → " + toStatus);
        }

        app.setStatus(toStatus);
        appMapper.updateById(app);

        ApplicationStage stage = new ApplicationStage();
        stage.setAppId(appId);
        stage.setFromStatus(fromStatus);
        stage.setToStatus(toStatus);
        stage.setOperatorId(hrId);
        stage.setLegacy(0);
        stageMapper.insert(stage);

        InterviewNote note = new InterviewNote();
        note.setAppId(appId);
        note.setHrId(hrId);
        note.setContent(req.getContent() != null ? req.getContent() : "");
        note.setNextStage(req.getNextStage());
        noteMapper.insert(note);
    }

    @Override
    public List<ApplicationStage> getStageHistory(Long appId) {
        return stageMapper.selectList(new LambdaQueryWrapper<ApplicationStage>()
                .eq(ApplicationStage::getAppId, appId)
                .orderByAsc(ApplicationStage::getCreateTime));
    }

    private static final java.util.Set<String> ALLOWED_EXTENSIONS =
            java.util.Set.of(".pdf", ".doc", ".docx", ".txt");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    @Override
    public void applyWithFile(Long jobId, Long userId, String originalFilename, byte[] bytes) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BusinessException(400, "不支持的文件类型，仅允许 PDF/DOC/DOCX");
        }
        String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BusinessException(400, "不支持的文件类型，仅允许 PDF/DOC/DOCX");
        }
        if (bytes.length > MAX_FILE_SIZE) {
            throw new BusinessException(400, "文件大小不能超过 10MB");
        }

        String hash = ResumeParseUtil.md5Hash(bytes);
        checkDuplicateHash(hash, userId);

        String safeName = originalFilename.replaceAll("[^a-zA-Z0-9._\\-]", "_");
        String dir = "uploads/resume/" + userId;
        new File(dir).mkdirs();
        String filename = System.currentTimeMillis() + "_" + safeName;
        String filepath = dir + "/" + filename;
        try (FileOutputStream fos = new FileOutputStream(filepath)) {
            fos.write(bytes);
        } catch (IOException e) {
            throw new BusinessException(3003, "简历文件保存失败");
        }

        String resumeText = ResumeParseUtil.extractText(bytes, originalFilename);

        JobPost job = jobMapper.selectById(jobId);
        if (job == null) {
            throw new BusinessException(2001, "职位不存在");
        }
        if (!"招聘中".equals(job.getStatus())) {
            throw new BusinessException(2003, "该职位已停止招聘");
        }
        Application exist = appMapper.selectOne(new LambdaQueryWrapper<Application>()
                .eq(Application::getJobId, jobId)
                .eq(Application::getUserId, userId));
        if (exist != null) {
            throw new BusinessException(1003, "您已投递过该职位");
        }

        Application app = new Application();
        app.setJobId(jobId);
        app.setUserId(userId);
        app.setStatus("待筛选");
        app.setResumeUrl(filepath);
        app.setResumeHash(hash);
        app.setResumeText(resumeText);
        appMapper.insert(app);
    }

    private void checkDuplicateHash(String hash, Long currentUserId) {
        List<Application> same = appMapper.selectList(
                new LambdaQueryWrapper<Application>()
                        .eq(Application::getResumeHash, hash)
                        .ne(Application::getUserId, currentUserId));
        if (!same.isEmpty()) {
            System.out.println("[教学简化] 简历重复检测: 用户 " + currentUserId
                    + " 的简历与用户 " + same.get(0).getUserId() + " 的简历 MD5 相同 (hash=" + hash + ")");
        }
    }
}
