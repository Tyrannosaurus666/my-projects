package com.knowledgebase.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.knowledgebase.entity.KnowledgeBase;

public interface KnowledgeBaseService extends IService<KnowledgeBase> {
    boolean removeKnowledgeBase(Long id);
}
