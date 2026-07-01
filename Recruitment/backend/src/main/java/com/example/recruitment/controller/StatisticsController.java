package com.example.recruitment.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.common.Result;
import com.example.recruitment.entity.Application;
import com.example.recruitment.mapper.ApplicationMapper;
import com.example.recruitment.mapper.JobMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final ApplicationMapper appMapper;
    private final JobMapper jobMapper;

    private static final List<String> STATUS_ORDER =
            List.of("待筛选", "已面试", "已录用", "已拒绝");

    public StatisticsController(ApplicationMapper appMapper, JobMapper jobMapper) {
        this.appMapper = appMapper;
        this.jobMapper = jobMapper;
    }

    @GetMapping("/funnel")
    public Result<List<Map<String, Object>>> funnel(
            @RequestParam(required = false) Long hrId,
            HttpServletRequest request) {
        String role = (String) request.getAttribute("role");

        List<Map<String, Object>> result = new ArrayList<>();
        for (String status : STATUS_ORDER) {
            LambdaQueryWrapper<Application> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(Application::getStatus, status);

            if (hrId != null) {
                List<Long> jobIds = jobMapper.selectObjs(
                        new LambdaQueryWrapper<com.example.recruitment.entity.JobPost>()
                                .eq(com.example.recruitment.entity.JobPost::getHrId, hrId)
                                .select(com.example.recruitment.entity.JobPost::getId));
                if (jobIds.isEmpty()) {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("status", status);
                    item.put("count", 0);
                    result.add(item);
                    continue;
                }
                wrapper.in(Application::getJobId, jobIds);
            }

            long count = appMapper.selectCount(wrapper);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("status", status);
            item.put("count", count);
            result.add(item);
        }

        return Result.success(result);
    }
}
