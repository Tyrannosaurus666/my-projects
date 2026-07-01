package com.knowledgebase.controller;

import com.knowledgebase.common.Result;
import com.knowledgebase.entity.KnowledgeBase;
import com.knowledgebase.service.KnowledgeBaseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/knowledge-bases")
public class KnowledgeBaseController {

    private final KnowledgeBaseService kbService;

    public KnowledgeBaseController(KnowledgeBaseService kbService) {
        this.kbService = kbService;
    }

    @GetMapping
    public Result<List<KnowledgeBase>> list() {
        return Result.ok(kbService.list());
    }

    @PostMapping
    public Result<KnowledgeBase> create(@RequestBody KnowledgeBase kb) {
        kbService.save(kb);
        return Result.ok(kb);
    }

    @PutMapping("/{id}")
    public Result<KnowledgeBase> update(@PathVariable Long id, @RequestBody KnowledgeBase kb) {
        kb.setId(id);
        kbService.updateById(kb);
        return Result.ok(kb);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        kbService.removeKnowledgeBase(id);
        return Result.ok();
    }
}
