package com.example.recruitment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.recruitment.entity.JobPost;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobMapper extends BaseMapper<JobPost> {
}
