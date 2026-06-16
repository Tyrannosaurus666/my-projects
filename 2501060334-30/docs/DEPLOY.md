# 招聘管理与人才看板系统 - 部署文档

## 1. 部署架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Vue 3 前端  │────▶│ SpringBoot  │────▶│  MySQL 8.0  │
│  :5173       │     │  :8080      │     │  :3306      │
│  Vite/Rolldown│    │  Tomcat     │     │  recruitment_db│
└─────────────┘     └─────────────┘     └─────────────┘
```

- 前端: Vite 开发服务器 (端口 5173), 生产构建为静态文件
- 后端: SpringBoot 嵌入式 Tomcat (端口 8080)
- 数据库: MySQL 8.0, 库名 `recruitment_db`
- 反向代理: Vite proxy `/api` → `http://localhost:8080`

## 2. 环境要求

| 组件 | 版本要求 | 验证命令 |
|---|---|---|
| JDK | 21+ | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| MySQL | 8.0+ | `mysql --version` |
| Node.js | 24 LTS | `node -v` |
| pnpm | 10.33.4+ | `pnpm -v` |

## 3. 部署步骤

### 3.1 数据库初始化

```bash
# 1. 启动 MySQL 服务
# 2. 执行初始化脚本
mysql -u root -p < sql/01-init.sql
```

> 密码: 按实际环境填写 (开发环境默认 `root`)

### 3.2 后端部署

```bash
cd backend

# 1. 修改数据库密码
# 编辑 src/main/resources/application.yml
# 将 spring.datasource.password 改为实际密码

# 2. 编译
mvn clean compile

# 3. 启动
mvn spring-boot:run
# 后端运行在 http://localhost:8080
```

### 3.3 前端部署

```bash
cd frontend

# 1. 安装依赖
pnpm install

# 2. 开发模式启动
pnpm dev
# 前端运行在 http://localhost:5173

# 3. 生产构建 (可选)
pnpm build
# 产出在 dist/ 目录, 可部署到 Nginx 等静态服务器
```

## 4. 启动验证

### 4.1 后端健康检查

```bash
# 公开接口 (无需登录)
curl http://localhost:8080/api/jobs?pageNum=1&pageSize=5

# 期望返回: {"code":200,"message":"操作成功","data":{"records":[...],"total":N}}
```

### 4.2 前端验证

浏览器打开 `http://localhost:5173`, 应自动跳转到登录页。

### 4.3 登录测试

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin01 | admin123 |
| HR | hr01 | hr123 |
| 候选人 | candidate01 | 123456 |

### 4.4 完整流程验证

1. 浏览器打开 `http://localhost:5173` → 登录页
2. 用 HR 账号登录 → 职位广场
3. 点击"我的职位" → 发布新职位
4. 退出 → 用 Candidate 登录 → 投递职位
5. 退出 → 用 HR 登录 → 查看投递列表 → 更新状态

## 5. 故障排查

| 现象 | 原因 | 解决 |
|---|---|---|
| 后端启动报 "Port 8080 already in use" | 端口被占用 | `netstat -ano \| findstr 8080` 找到 PID 后 `taskkill /PID xxx` |
| 后端启动报 "Access denied for user" | 数据库密码错误 | 检查 application.yml 中 `spring.datasource.password` |
| 前端 `pnpm dev` 报 ENOENT | 依赖未安装 | 执行 `pnpm install` |
| 登录报 500 | 数据库未初始化 | 执行 `mysql -u root -p < sql/01-init.sql` |
| API 返回中文乱码 | 请求未指定 UTF-8 | 确保 Content-Type 为 `application/json; charset=utf-8` |
| 前端页面空白 | Vite proxy 未生效 | 确认后端 8080 端口已启动 |
