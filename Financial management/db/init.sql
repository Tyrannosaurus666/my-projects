-- 创建数据库
CREATE DATABASE IF NOT EXISTS finance_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finance_db;

-- 用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(200) NOT NULL COMMENT '密码',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像',
    `status` TINYINT DEFAULT 1 COMMENT '状态 0禁用 1启用',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除 0未删除 1已删除',
    UNIQUE KEY `uk_username` (`username`)
) COMMENT '用户表';

-- 账户表
CREATE TABLE IF NOT EXISTS `account` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '账户名称',
    `type` VARCHAR(20) NOT NULL COMMENT '账户类型 bank银行卡 cash现金',
    `balance` DECIMAL(15,2) DEFAULT 0.00 COMMENT '余额',
    `currency` VARCHAR(10) DEFAULT 'CNY' COMMENT '货币类型',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    KEY `idx_user_id` (`user_id`)
) COMMENT '账户表';

-- 流水记录表
CREATE TABLE IF NOT EXISTS `transaction` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `account_id` BIGINT DEFAULT NULL COMMENT '账户ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `type` VARCHAR(20) NOT NULL COMMENT '类型 income收入 expense支出',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '金额',
    `transaction_time` DATETIME NOT NULL COMMENT '交易时间',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `image` VARCHAR(500) DEFAULT NULL COMMENT '图片',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    KEY `idx_user_id` (`user_id`),
    KEY `idx_account_id` (`account_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_transaction_time` (`transaction_time`)
) COMMENT '流水记录表';

-- 分类表
CREATE TABLE IF NOT EXISTS `category` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `type` VARCHAR(20) NOT NULL COMMENT '类型 income收入 expense支出',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
    `color` VARCHAR(20) DEFAULT '#409eff' COMMENT '颜色',
    `sort` INT DEFAULT 0 COMMENT '排序',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    KEY `idx_user_id` (`user_id`)
) COMMENT '分类表';

-- 预算表
CREATE TABLE IF NOT EXISTS `budget` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '预算金额',
    `spent_amount` DECIMAL(15,2) DEFAULT 0.00 COMMENT '已用金额',
    `start_date` DATE DEFAULT NULL COMMENT '开始日期',
    `end_date` DATE DEFAULT NULL COMMENT '结束日期',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `status` TINYINT DEFAULT 1 COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    KEY `idx_user_id` (`user_id`)
) COMMENT '预算表';

-- 账单表
CREATE TABLE IF NOT EXISTS `bill` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `account_id` BIGINT DEFAULT NULL COMMENT '账户ID',
    `name` VARCHAR(100) NOT NULL COMMENT '账单名称',
    `amount` DECIMAL(15,2) NOT NULL COMMENT '金额',
    `due_date` DATE DEFAULT NULL COMMENT '到期日',
    `remind_day` INT DEFAULT 3 COMMENT '提前提醒天数',
    `status` VARCHAR(20) DEFAULT 'unpaid' COMMENT '状态 unpaid未支付 paid已支付',
    `remark` VARCHAR(200) DEFAULT NULL COMMENT '备注',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `deleted` TINYINT DEFAULT 0,
    KEY `idx_user_id` (`user_id`)
) COMMENT '账单表';

-- 插入默认分类数据
INSERT INTO `category` (`user_id`, `name`, `type`, `icon`, `color`, `sort`) VALUES
(NULL, '工资', 'income', 'Money', '#67c23a', 1),
(NULL, '兼职', 'income', 'Coin', '#409eff', 2),
(NULL, '投资', 'income', 'TrendCharts', '#e6a23c', 3),
(NULL, '其他收入', 'income', 'CirclePlus', '#909399', 4),
(NULL, '餐饮', 'expense', 'Food', '#f56c6c', 1),
(NULL, '购物', 'expense', 'ShoppingCart', '#e6a23c', 2),
(NULL, '交通', 'expense', 'Van', '#409eff', 3),
(NULL, '住房', 'expense', 'HomeFilled', '#67c23a', 4),
(NULL, '娱乐', 'expense', 'Camera', '#909399', 5),
(NULL, '医疗', 'expense', 'FirstAidKit', '#f56c6c', 6),
(NULL, '教育', 'expense', 'Reading', '#9b59b6', 7),
(NULL, '其他支出', 'expense', 'CircleClose', '#909399', 8);
