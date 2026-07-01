CREATE DATABASE IF NOT EXISTS ai_agent_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_agent_db;

CREATE TABLE IF NOT EXISTS `session` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `session_id` VARCHAR(50) NOT NULL UNIQUE,
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_session_id` (`session_id`)
) COMMENT '会话表';

CREATE TABLE IF NOT EXISTS `message` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `session_id` VARCHAR(50) NOT NULL,
    `task_id` VARCHAR(50) DEFAULT NULL,
    `role` VARCHAR(20) NOT NULL,
    `agent_name` VARCHAR(50) DEFAULT NULL,
    `content` TEXT,
    `tool_call` VARCHAR(500) DEFAULT NULL,
    `tool_result` TEXT,
    `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY `idx_session_id` (`session_id`)
) COMMENT '消息表';
