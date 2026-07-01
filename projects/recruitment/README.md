# 招聘管理与人才看板系统

> HR 与候选人；核心是「职位 + 投递 + 面试状态」；P0 职位公开列表，单企业或多 HR 同 user 表 role 区分

## 一、项目简介
- **题目**: 招聘管理与人才看板系统
- **核心实体**: user、job_post、application、interview_note
- **角色**: candidate、hr、admin
- **当前 Phase**: Phase 8 (全部完成 · P0 全栈交付)

## 二、技术栈

### 后端
- JDK 21 + SpringBoot 3.5.14 + MyBatis-Plus 3.5.15(starter + jsqlparser 子模块)
- MySQL 8.0(驱动 mysql-connector-j 8.4.0)
- Redis 3.2.100(Spring Data Redis + Lettuce + commons-pool2, 5 分钟 TTL 缓存)
- JJWT 0.13.0(模块化引入)+ Lombok 1.18.46 + spring-security-crypto 6.3.4

### 前端
- Vue 3.5.34 + Vue Router 5.0.6 + Pinia 3.0.4
- Element Plus 2.13.7 + Axios 1.15.2 + Vite 8.0.0 + pnpm 10.33.4

## 三、项目结构
```
├── backend/                ← SpringBoot 3.5.14 后端 (33 Java 源文件)
│   ├── pom.xml
│   └── src/main/java/com/example/recruitment/
│       ├── controller/     ← 3 个 Controller (11 API)
│       ├── service/        ← 3 接口 + 3 实现
│       ├── mapper/         ← 4 个 Mapper
│       ├── entity/         ← 4 Entity + 6 DTO
│       ├── config/         ← CorsConfig / MybatisPlusConfig / WebMvcConfig / RedisConfig
│       ├── interceptor/    ← LoginInterceptor (JWT)
│       ├── util/           ← JwtUtils
│       └── common/         ← Result / BusinessException / GlobalExceptionHandler
├── frontend/               ← Vue 3.5.34 前端 (8 源文件)
│   ├── src/api/            ← auth.js / job.js / application.js
│   ├── src/views/          ← 5 页面 (Login / JobSquare / JobDetail / MyApplications / MyJobs)
│   └── src/router/         ← 5 条路由 + beforeEach 守卫
├── docs/                   ← 文档 (6 份)
│   ├── 00-选题标定.md / PRD.md / DATABASE_DESIGN.md / DEPLOY.md
│   └── 01-系统开发流程文档.md / 02-项目阶段开发说明.md
├── sql/01-init.sql         ← 数据库初始化 (7 表 + 测试数据)
└── CLAUDE.md               ← AI 编码规则
```

## 四、数据库设计
- 表数量: 7 (4 P0 + 2 P1 + 1 P2)
- 表名: user / job_post / application / interview_note / job_tag / application_stage / interview_schedule
- 详见 [docs/DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md)

## 五、API 接口
- 接口数量: 21 (P0+P1+P2 全覆盖)
- URL 前缀: `/api/...`

### P0 API 清单 (12 个)

| # | 方法 | URL | 说明 | 权限 |
|---|---|---|---|---|
| 1 | POST | /api/auth/register | 用户注册 | 公开 |
| 2 | POST | /api/auth/login | 用户登录 | 公开 |
| 3 | GET | /api/auth/me | 获取当前用户 | 登录 |
| 4 | GET | /api/jobs | 职位列表(分页+搜索+标签筛选) | 登录 |
| 5 | GET | /api/jobs/{id} | 职位详情(含标签) | 登录 |
| 6 | POST | /api/jobs | 创建职位(含标签) | HR/Admin |
| 7 | PUT | /api/jobs/{id} | 编辑职位(含标签) | HR(自己)/Admin |
| 8 | DELETE | /api/jobs/{id} | 下架职位 | HR(自己)/Admin |
| 9 | POST | /api/applications | 投递职位(含文件上传) | Candidate |
| 10 | GET | /api/applications | 申请列表(scope=mine/jobId) | 登录 |
| 11 | PUT | /api/applications/{id}/status | 更新申请状态+备注(含状态机校验) | HR |
| 12 | GET | /api/applications/{id}/notes | 面试备注列表 | 登录 |

### P1 API 清单 (3 个)

| # | 方法 | URL | 说明 | 权限 |
|---|---|---|---|---|
| 13 | GET | /api/statistics/funnel | 招聘漏斗数据 | 登录 |
| 14 | GET | /api/applications/{id}/stages | 阶段历史 | 登录 |
| 15 | GET | /api/jobs?tag=xxx | 标签筛选 | 登录 |

### P2 API 清单 (6 个)

| # | 方法 | URL | 说明 | 权限 |
|---|---|---|---|---|
| 16 | GET | /api/schedules | 面试日程列表 | 登录 |
| 17 | POST | /api/schedules | 安排面试(模拟邮件) | HR/Admin |
| 18 | PUT | /api/schedules/{id} | 修改日程 | HR(自己) |
| 19 | DELETE | /api/schedules/{id} | 取消日程 | HR(自己) |
| 20 | GET | /api/applications/{id}/offer | 生成Offer(教学简化) | HR(自己)/Admin |
| 21 | GET | /api/jobs?keyword=x&status=x&salaryKeyword=x&tag=x | 多条件搜索 | 登录 |

## 六、快速开始

### 1. 启动 Redis
```bash
D:\Redis-x64-3.2.100\redis-server.exe
```

### 2. 数据库初始化
```bash
mysql -u root -p < sql/01-init.sql
```

### 3. 后端
```bash
cd backend
mvn clean compile
mvn spring-boot:run    # http://localhost:8080
```

### 4. 前端
```bash
cd frontend
pnpm install
pnpm dev               # http://localhost:5173
```

> ⚠️ 启动前先改 `backend/src/main/resources/application.yml` 数据库密码。
> 💡 还没装 pnpm? 跑 `npm install -g pnpm`

### 4. 测试账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | admin888 |
| HR | hr01 | hr123 |
| 候选人 | candidate01 | 123456 |

## 七、文档索引
- [PRD 需求规格](docs/PRD.md) — 23 功能全量 P0+P1+P2
- [数据库设计](docs/DATABASE_DESIGN.md) — 7 表 ER 图 + SQL + 测试数据
- [部署文档](docs/DEPLOY.md) — 部署步骤 + 故障排查
- [系统开发流程](docs/01-系统开发流程文档.md) — 9 章完整流程
- [阶段开发说明](docs/02-项目阶段开发说明.md) — Phase 0-10 逐阶段记录
- [选题标定](docs/00-选题标定.md)

## 八、验收清单
- [x] 5 项硬地基: backend 编译 / frontend 跑通 / 数据库就位 / Gitee push / CLAUDE.md 完整
- [x] commit 17 次 (Phase 0-10 全流程)
- [x] 数据库 7 张表含测试数据
- [x] 21 个 API (P0+P1+P2) 全实现+测试通过
- [x] 7 个前端页面含完整交互 + 看板拖拽
- [x] 单元测试 8/8 通过
- [x] 安全审查 10 项全通过
- [x] docs/ 完整 (PRD / DATABASE_DESIGN / DEPLOY)
