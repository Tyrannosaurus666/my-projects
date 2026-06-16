package com.example.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.recruitment.common.BusinessException;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.JobTag;
import com.example.recruitment.entity.dto.JobRequest;
import com.example.recruitment.mapper.JobMapper;
import com.example.recruitment.mapper.JobTagMapper;
import com.example.recruitment.service.JobService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobMapper jobMapper;
    private final JobTagMapper jobTagMapper;

    public JobServiceImpl(JobMapper jobMapper, JobTagMapper jobTagMapper) {
        this.jobMapper = jobMapper;
        this.jobTagMapper = jobTagMapper;
    }

    @Override
    @Cacheable(value = "jobs", key = "#pageNum + ':' + #pageSize + ':' + (#keyword ?: '') + ':' + (#status ?: '') + ':' + (#salaryKeyword ?: '') + ':' + (#reqKeyword ?: '') + ':' + (#tag ?: '')")
    public Page<JobPost> listJobs(Integer pageNum, Integer pageSize, String keyword,
                                   String status, String salaryKeyword, String reqKeyword, String tag) {
        LambdaQueryWrapper<JobPost> wrapper = new LambdaQueryWrapper<>();
        if (status != null && !status.isBlank()) {
            wrapper.eq(JobPost::getStatus, status);
        } else {
            wrapper.eq(JobPost::getStatus, "招聘中");
        }
        if (keyword != null && !keyword.isBlank()) {
            wrapper.and(w -> w.like(JobPost::getTitle, keyword)
                             .or().like(JobPost::getRequirements, keyword));
        }
        if (salaryKeyword != null && !salaryKeyword.isBlank()) {
            wrapper.like(JobPost::getSalaryText, salaryKeyword);
        }
        if (reqKeyword != null && !reqKeyword.isBlank()) {
            wrapper.like(JobPost::getRequirements, reqKeyword);
        }
        if (tag != null && !tag.isBlank()) {
            wrapper.exists("SELECT 1 FROM job_tag WHERE job_tag.job_id = job_post.id AND job_tag.tag_name = {0}", tag);
        }
        wrapper.orderByDesc(JobPost::getCreateTime);
        Page<JobPost> page = jobMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        batchFillTags(page.getRecords());
        return page;
    }

    @Override
    @Cacheable(value = "jobDetail", key = "#id")
    public JobPost getJobDetail(Long id) {
        JobPost job = jobMapper.selectById(id);
        if (job == null) {
            throw new BusinessException(2001, "职位不存在");
        }
        batchFillTags(Collections.singletonList(job));
        return job;
    }

    @Override
    @CacheEvict(value = "jobs", allEntries = true)
    public void createJob(JobRequest req, Long hrId) {
        JobPost job = new JobPost();
        job.setTitle(req.getTitle());
        job.setSalaryText(req.getSalaryText() != null ? req.getSalaryText() : "");
        job.setRequirements(req.getRequirements());
        job.setStatus("招聘中");
        job.setHrId(hrId);
        if (req.getDeadline() != null && !req.getDeadline().isBlank()) {
            job.setDeadline(parseDeadline(req.getDeadline()));
        }
        jobMapper.insert(job);
        saveTags(job.getId(), req.getTags());
    }

    @Override
    @CacheEvict(value = {"jobs", "jobDetail"}, allEntries = true)
    public void updateJob(Long id, JobRequest req, Long userId, String role) {
        JobPost job = jobMapper.selectById(id);
        if (job == null) {
            throw new BusinessException(2001, "职位不存在");
        }
        if (!"admin".equals(role) && !job.getHrId().equals(userId)) {
            throw new BusinessException(2002, "只能编辑自己发布的职位");
        }
        job.setTitle(req.getTitle());
        job.setSalaryText(req.getSalaryText() != null ? req.getSalaryText() : "");
        job.setRequirements(req.getRequirements());
        if (req.getDeadline() != null && !req.getDeadline().isBlank()) {
            job.setDeadline(parseDeadline(req.getDeadline()));
        }
        jobMapper.updateById(job);
        clearTags(id);
        saveTags(id, req.getTags());
    }

    private LocalDateTime parseDeadline(String deadline) {
        if (deadline == null || deadline.isBlank()) return null;
        String d = deadline.trim();
        DateTimeFormatter[] formatters = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("yyyy-M-d"),
            DateTimeFormatter.ofPattern("yyyy/M/d"),
            DateTimeFormatter.ofPattern("yyyy/M/d HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-M-d HH:mm:ss"),
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,
            DateTimeFormatter.ISO_LOCAL_DATE,
        };
        for (DateTimeFormatter fmt : formatters) {
            try {
                if (d.length() <= 10) {
                    return LocalDateTime.of(LocalDate.parse(d, fmt), LocalTime.MIN);
                }
                return LocalDateTime.parse(d, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        throw new BusinessException(2003, "日期格式不正确，请使用 yyyy-MM-dd 格式");
    }

    private void saveTags(Long jobId, String tags) {
        if (tags == null || tags.isBlank()) return;
        Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(t -> !t.isEmpty())
                .distinct()
                .forEach(tagName -> {
                    JobTag tag = new JobTag();
                    tag.setJobId(jobId);
                    tag.setTagName(tagName);
                    jobTagMapper.insert(tag);
                });
    }

    private void clearTags(Long jobId) {
        jobTagMapper.delete(new LambdaQueryWrapper<JobTag>().eq(JobTag::getJobId, jobId));
    }

    private void batchFillTags(List<JobPost> jobs) {
        if (jobs == null || jobs.isEmpty()) return;
        List<Long> jobIds = jobs.stream().map(JobPost::getId).collect(Collectors.toList());
        List<JobTag> allTags = jobTagMapper.selectList(
                new LambdaQueryWrapper<JobTag>().in(JobTag::getJobId, jobIds));
        Map<Long, List<String>> tagMap = allTags.stream()
                .collect(Collectors.groupingBy(JobTag::getJobId,
                        Collectors.mapping(JobTag::getTagName, Collectors.toList())));
        jobs.forEach(j -> j.setTags(tagMap.getOrDefault(j.getId(), Collections.emptyList())));
    }

    @Override
    @CacheEvict(value = {"jobs", "jobDetail"}, allEntries = true)
    public void deleteJob(Long id, Long userId, String role) {
        JobPost job = jobMapper.selectById(id);
        if (job == null) {
            throw new BusinessException(2001, "职位不存在");
        }
        if (!"admin".equals(role) && !job.getHrId().equals(userId)) {
            throw new BusinessException(2002, "只能下架自己发布的职位");
        }
        job.setStatus("停招");
        jobMapper.deleteById(id);
    }
}
