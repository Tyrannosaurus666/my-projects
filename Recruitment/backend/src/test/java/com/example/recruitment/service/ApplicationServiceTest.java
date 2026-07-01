package com.example.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.common.BusinessException;
import com.example.recruitment.entity.Application;
import com.example.recruitment.entity.ApplicationStage;
import com.example.recruitment.entity.JobPost;
import com.example.recruitment.entity.dto.StatusUpdateRequest;
import com.example.recruitment.mapper.ApplicationMapper;
import com.example.recruitment.mapper.ApplicationStageMapper;
import com.example.recruitment.mapper.InterviewNoteMapper;
import com.example.recruitment.mapper.JobMapper;
import com.example.recruitment.service.impl.ApplicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private ApplicationMapper appMapper;
    @Mock
    private JobMapper jobMapper;
    @Mock
    private InterviewNoteMapper noteMapper;
    @Mock
    private ApplicationStageMapper stageMapper;

    @InjectMocks
    private ApplicationServiceImpl service;

    private JobPost job;
    private Application app;

    @BeforeEach
    void setUp() {
        job = new JobPost();
        job.setId(1L);
        job.setHrId(3L);
        job.setStatus("招聘中");

        app = new Application();
        app.setId(10L);
        app.setJobId(1L);
        app.setUserId(100L);
        app.setStatus("待筛选");
    }

    @Test
    void apply_shouldThrowWhenDuplicate() {
        when(jobMapper.selectById(1L)).thenReturn(job);
        when(appMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(new Application());

        assertThrows(BusinessException.class, () ->
                service.apply(1L, 100L, "resume.pdf"));
    }

    @Test
    void apply_shouldThrowWhenJobNotRecruiting() {
        job.setStatus("停招");
        when(jobMapper.selectById(1L)).thenReturn(job);

        assertThrows(BusinessException.class, () ->
                service.apply(1L, 100L, "resume.pdf"));
    }

    @Test
    void updateStatus_shouldRejectIllegalTransition() {
        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setStatus("已录用");

        when(appMapper.selectById(10L)).thenReturn(app);
        when(jobMapper.selectById(1L)).thenReturn(job);

        BusinessException ex = assertThrows(BusinessException.class, () ->
                service.updateStatus(10L, req, 3L, "hr"));
        assertEquals(3004, ex.getCode());
        assertTrue(ex.getMessage().contains("不允许的状态流转"));
    }

    @Test
    void updateStatus_shouldAllowLegalTransition() {
        app.setStatus("已面试");
        StatusUpdateRequest req = new StatusUpdateRequest();
        req.setStatus("已录用");

        when(appMapper.selectById(10L)).thenReturn(app);
        when(jobMapper.selectById(1L)).thenReturn(job);
        when(appMapper.updateById(any(Application.class))).thenReturn(1);
        when(stageMapper.insert(any(ApplicationStage.class))).thenReturn(1);
        when(noteMapper.insert(any(com.example.recruitment.entity.InterviewNote.class))).thenReturn(1);

        assertDoesNotThrow(() ->
                service.updateStatus(10L, req, 3L, "hr"));

        verify(stageMapper).insert(any(ApplicationStage.class));
        assertEquals("已录用", app.getStatus());
    }
}
