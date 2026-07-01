package com.example.recruitment.util;

import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class ResumeParseUtil {

    private static final int MAX_TEXT_LENGTH = 5000;

    public static String md5Hash(byte[] bytes) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(bytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 algorithm not available", e);
        }
    }

    public static String extractText(byte[] bytes, String filename) {
        if (filename == null) return "";
        String lower = filename.toLowerCase();
        try {
            if (lower.endsWith(".txt")) {
                return truncate(new String(bytes, StandardCharsets.UTF_8));
            }
            if (lower.endsWith(".doc")) {
                return extractDocText(bytes);
            }
            if (lower.endsWith(".docx")) {
                return extractDocxText(bytes);
            }
            if (lower.endsWith(".pdf")) {
                return extractPdfText(bytes);
            }
        } catch (Exception e) {
            return "(教学简化: 文本提取失败 - " + e.getMessage() + ")";
        }
        return "(教学简化: " + lower.substring(lower.lastIndexOf('.') + 1) + " 格式暂不支持文本提取)";
    }

    private static String extractDocText(byte[] bytes) throws IOException {
        try (HWPFDocument doc = new HWPFDocument(new ByteArrayInputStream(bytes));
             WordExtractor extractor = new WordExtractor(doc)) {
            String text = extractor.getText();
            if (text == null || text.isBlank()) {
                return "(doc 文件中未找到文本内容)";
            }
            return truncate(text.trim());
        }
    }

    private static String extractDocxText(byte[] bytes) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            String text = extractor.getText();
            if (text == null || text.isBlank()) {
                return "(docx 文件中未找到文本内容)";
            }
            return truncate(text.trim());
        }
    }

    private static String extractPdfText(byte[] bytes) {
        String raw = new String(bytes, StandardCharsets.ISO_8859_1);
        StringBuilder sb = new StringBuilder();
        boolean inText = false;
        for (String line : raw.split("\r?\n")) {
            if (line.contains("BT")) inText = true;
            if (inText && !line.startsWith("%")) {
                String cleaned = line.replaceAll("\\\\([()])", "$1")
                        .replaceAll("\\([^)]*\\)", " ")
                        .replaceAll("\\s+", " ").trim();
                if (!cleaned.isEmpty() && !cleaned.startsWith("/") && !cleaned.startsWith("BT")
                        && !cleaned.startsWith("ET") && !cleaned.equals("Tj") && !cleaned.equals("TJ")) {
                    sb.append(cleaned).append(" ");
                }
            }
            if (line.contains("ET")) inText = false;
        }
        String text = sb.toString().replaceAll("\\s+", " ").trim();
        if (text.isEmpty()) {
            return "(教学简化: PDF 文本提取为占位实现，实际项目请用 PDFBox)";
        }
        return truncate(text);
    }

    private static String truncate(String text) {
        if (text.length() <= MAX_TEXT_LENGTH) return text;
        return text.substring(0, MAX_TEXT_LENGTH) + "...(截断)";
    }
}
