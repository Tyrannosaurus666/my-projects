package com.example.recruitment.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.common.Result;
import com.example.recruitment.entity.Application;
import com.example.recruitment.mapper.ApplicationMapper;
import com.example.recruitment.util.ResumeParseUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ApplicationMapper appMapper;

    private static final Set<String> ALLOWED_EXTENSIONS =
            Set.of(".pdf", ".doc", ".docx", ".txt");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    public ResumeController(ApplicationMapper appMapper) {
        this.appMapper = appMapper;
    }

    @PostMapping("/parse")
    public Result<Map<String, Object>> parse(@RequestParam MultipartFile file,
                                              HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return Result.error(400, "不支持的文件类型，仅允许 PDF/DOC/DOCX/TXT");
        }
        String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            return Result.error(400, "不支持的文件类型，仅允许 PDF/DOC/DOCX/TXT");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return Result.error(400, "文件大小不能超过 10MB");
        }

        try {
            byte[] bytes = file.getBytes();
            String hash = ResumeParseUtil.md5Hash(bytes);
            String text = ResumeParseUtil.extractText(bytes, originalFilename);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("hash", hash);
            data.put("text", text);
            data.put("textLength", text != null ? text.length() : 0);
            data.put("filename", originalFilename);

            // 去重检测：查相同 hash 的其他投递
            List<Application> dupes = appMapper.selectList(
                    new LambdaQueryWrapper<Application>()
                            .eq(Application::getResumeHash, hash)
                            .ne(Application::getUserId, userId));
            data.put("duplicateCount", dupes.size());
            if (!dupes.isEmpty()) {
                List<Map<String, Object>> dupList = new ArrayList<>();
                for (Application d : dupes) {
                    Map<String, Object> dupInfo = new LinkedHashMap<>();
                    dupInfo.put("appId", d.getId());
                    dupInfo.put("otherUserId", d.getUserId());
                    dupInfo.put("jobId", d.getJobId());
                    dupList.add(dupInfo);
                }
                data.put("duplicates", dupList);
            }
            return Result.success(data, "简历解析完成" + (dupes.isEmpty() ? "" : "，检测到重复简历"));
        } catch (Exception e) {
            return Result.error(500, "简历解析失败: " + e.getMessage());
        }
    }
}
