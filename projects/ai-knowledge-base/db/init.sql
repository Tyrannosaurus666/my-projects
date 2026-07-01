CREATE DATABASE IF NOT EXISTS ai_knowledge_base DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_knowledge_base;

CREATE TABLE IF NOT EXISTS knowledge_base (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL COMMENT '知识库名称',
    description TEXT COMMENT '知识库描述',
    doc_count   INT DEFAULT 0 COMMENT '文档数量',
    chunk_count INT DEFAULT 0 COMMENT '分块数量',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kb_document (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    kb_id       BIGINT NOT NULL COMMENT '所属知识库',
    file_name   VARCHAR(500) NOT NULL COMMENT '文件名',
    file_type   VARCHAR(20) COMMENT '文件类型',
    file_size   BIGINT COMMENT '文件大小(bytes)',
    status      VARCHAR(20) DEFAULT 'pending' COMMENT '状态: pending/processing/done/failed',
    chunk_count INT DEFAULT 0 COMMENT '分块数',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_kb_id (kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kb_document_chunk (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    kb_id        BIGINT NOT NULL,
    doc_id       BIGINT NOT NULL,
    chunk_index  INT NOT NULL COMMENT '块序号',
    content      TEXT NOT NULL COMMENT '文本内容',
    token_count  INT DEFAULT 0 COMMENT 'token数',
    embedding    TEXT COMMENT '向量嵌入(JSON数组)',
    INDEX idx_doc_id (doc_id),
    INDEX idx_kb_id (kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kb_qa_history (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    kb_id         BIGINT NOT NULL,
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    source_chunks TEXT COMMENT '引用来源(JSON数组)',
    create_time   DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_kb_id (kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
