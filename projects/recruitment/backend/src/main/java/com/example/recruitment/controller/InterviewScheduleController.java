package com.example.recruitment.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.common.BusinessException;
import com.example.recruitment.common.Result;
import com.example.recruitment.entity.Application;
import com.example.recruitment.entity.InterviewSchedule;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.dto.ScheduleRequest;
import com.example.recruitment.mapper.ApplicationMapper;
import com.example.recruitment.mapper.InterviewScheduleMapper;
import com.example.recruitment.mapper.JobMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class InterviewScheduleController {

    private final InterviewScheduleMapper scheduleMapper;
    private final ApplicationMapper appMapper;
    private final JobMapper jobMapper;

    public InterviewScheduleController(InterviewScheduleMapper scheduleMapper,
                                        ApplicationMapper appMapper,
                                        JobMapper jobMapper) {
        this.scheduleMapper = scheduleMapper;
        this.appMapper = appMapper;
        this.jobMapper = jobMapper;
    }

    @GetMapping
    public Result<List<InterviewSchedule>> list(
            @RequestParam(required = false) Long appId,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        LambdaQueryWrapper<InterviewSchedule> wrapper = new LambdaQueryWrapper<>();
        if (appId != null) {
            wrapper.eq(InterviewSchedule::getAppId, appId);
        } else if (!"admin".equals(role)) {
            wrapper.eq(InterviewSchedule::getHrId, userId);
        }
        wrapper.orderByDesc(InterviewSchedule::getInterviewTime);
        return Result.success(scheduleMapper.selectList(wrapper));
    }

    @PostMapping
    public Result<InterviewSchedule> create(@Valid @RequestBody ScheduleRequest req,
                                             @RequestParam Long appId,
                                             HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        Application app = appMapper.selectById(appId);
        if (app == null) {
            throw new BusinessException(3002, "投递记录不存在");
        }
        JobPost job = jobMapper.selectById(app.getJobId());
        if (!"admin".equals(role) && !job.getHrId().equals(userId)) {
            throw new BusinessException(4001, "只能为自己职位下的投递安排面试");
        }

        InterviewSchedule schedule = new InterviewSchedule();
        schedule.setAppId(appId);
        schedule.setHrId(userId);
        schedule.setInterviewTime(LocalDateTime.parse(req.getInterviewTime(),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        schedule.setPlace(req.getPlace());
        schedule.setTitle(req.getTitle());
        schedule.setStatus("已安排");
        scheduleMapper.insert(schedule);

        // 模拟邮件通知（教学简化）
        System.out.println("[教学简化] 模拟邮件发送: 面试安排在 " + req.getInterviewTime() + " 地点: " + req.getPlace());

        return Result.success(schedule, "面试安排成功");
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody ScheduleRequest req,
                                HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        InterviewSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BusinessException(3002, "面试日程不存在");
        }
        if (!schedule.getHrId().equals(userId)) {
            throw new BusinessException(4001, "只能修改自己安排的面试");
        }

        if (req.getInterviewTime() != null && !req.getInterviewTime().isBlank()) {
            schedule.setInterviewTime(LocalDateTime.parse(req.getInterviewTime(),
                    DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        }
        if (req.getPlace() != null) {
            schedule.setPlace(req.getPlace());
        }
        if (req.getTitle() != null) {
            schedule.setTitle(req.getTitle());
        }
        if (req.getStatus() != null) {
            schedule.setStatus(req.getStatus());
        }
        scheduleMapper.updateById(schedule);
        return Result.success(null, "更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        InterviewSchedule schedule = scheduleMapper.selectById(id);
        if (schedule == null) {
            throw new BusinessException(3002, "面试日程不存在");
        }
        if (!schedule.getHrId().equals(userId)) {
            throw new BusinessException(4001, "只能取消自己安排的面试");
        }
        scheduleMapper.deleteById(id);
        return Result.success(null, "已取消");
    }
}
