package com.knowledgebase.controller;

import com.knowledgebase.common.Result;
import com.knowledgebase.entity.QAHistory;
import com.knowledgebase.mapper.QAHistoryMapper;
import com.knowledgebase.service.RAGService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/qa")
public class QAController {

    private final RAGService ragService;
    private final QAHistoryMapper qaHistoryMapper;

    public QAController(RAGService ragService, QAHistoryMapper qaHistoryMapper) {
        this.ragService = ragService;
        this.qaHistoryMapper = qaHistoryMapper;
    }

    @PostMapping("/ask")
    public Result<Map<String, Object>> ask(@RequestBody Map<String, Object> request) {
        Long kbId = Long.valueOf(request.get("kbId").toString());
        String question = request.get("question").toString();

        Map<String, Object> result = ragService.ask(kbId, question);

        QAHistory history = new QAHistory();
        history.setKbId(kbId);
        history.setQuestion(question);
        history.setAnswer((String) result.get("answer"));
        history.setSourceChunks(result.get("sources").toString());
        qaHistoryMapper.insert(history);

        return Result.ok(result);
    }

    @GetMapping("/history/{kbId}")
    public Result<List<QAHistory>> history(@PathVariable Long kbId) {
        return Result.ok(qaHistoryMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<QAHistory>()
                .eq(QAHistory::getKbId, kbId)
                .orderByDesc(QAHistory::getCreateTime)));
    }
}
