package com.knowledgebase.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.knowledgebase.common.Result;
import com.knowledgebase.entity.Document;
import com.knowledgebase.mapper.DocumentMapper;
import com.knowledgebase.service.DocumentProcessService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentMapper documentMapper;
    private final DocumentProcessService documentProcessService;

    public DocumentController(DocumentMapper documentMapper, DocumentProcessService documentProcessService) {
        this.documentMapper = documentMapper;
        this.documentProcessService = documentProcessService;
    }

    @GetMapping("/kb/{kbId}")
    public Result<List<Document>> listByKb(@PathVariable Long kbId) {
        return Result.ok(documentMapper.selectList(
            new LambdaQueryWrapper<Document>().eq(Document::getKbId, kbId)
                .orderByDesc(Document::getCreateTime)));
    }

    @PostMapping("/upload")
    public Result<Document> upload(@RequestParam Long kbId, @RequestParam("file") MultipartFile file) throws IOException {
        Document doc = new Document();
        doc.setKbId(kbId);
        doc.setFileName(file.getOriginalFilename());
        doc.setFileType(file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".") + 1));
        doc.setFileSize(file.getSize());
        doc.setStatus("pending");
        documentMapper.insert(doc);

        byte[] bytes = file.getBytes();
        new Thread(() -> documentProcessService.processDocument(doc.getId(), bytes, file.getOriginalFilename())).start();

        return Result.ok(doc);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        documentMapper.deleteById(id);
        return Result.ok();
    }
}
