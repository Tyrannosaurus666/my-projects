# Phase 1 R-01 SRS 审核报告 · 2026-05-20

## 审核元数据
- 审核日期: 2026-05-20
- 使用模型: Claude Opus 4.7 (同源自审 · 教学可接受)
- 输入摘要: docs/PRD.md · ~485 行 · 6 节(§1 概述 / §2 角色 / §3 23 功能全量 / §4 非功能需求 / §5 映射表 / §6 调整说明)

---

## 审核报告

### 维度 1: 完整性

- **issue-1** [严重度: 高]: 缺少统一错误码规范表
  - **位置**: PRD §4 非功能需求末尾(或 §3 之前应新增 §3.0)
  - **修复建议**: 在 §4 末尾或 §3 开头新增错误码规范表,至少覆盖:全局异常码(400/401/403/404/500) + 业务异常码段(1xxx 用户模块 / 2xxx 职位模块 / 3xxx 投递模块 / 4xxx 面试模块)。P0-1/P0-2/P0-8 中零散出现的 1001/1002/1003/1005 需要收录到统一表中。下游 api-designer 依赖此表生成 API_DESIGN.md §4。

- **issue-2** [严重度: 中]: P0-9 申请列表未明确 admin 角色的查询范围
  - **位置**: PRD §3 · P0-9 · 异常流程④
  - **修复建议**: 补充说明 admin 调用 scope=mine 时的行为(admin 无"自己"的投递 → 返回空)或 scope=jobId 时 admin 可查看任意职位(全量权限)。

- P0 功能 10 项与标定卡 §三 一致;P1 8 项覆盖标定卡 §四全部;P2 5 项覆盖标定卡 §五全部。功能总量 23 项完整。
- 每个功能 8 字段齐全,实现优先级值均 ∈ {P0必做, P1应做, P2可选}。编号格式 P0-N/P1-M/P2-K 正确。

### 维度 2: 一致性

- §5 映射表 23 行与 §3 功能编号一一对应,无遗漏、无多余。实现优先级列与 §3 一致。
- §2 角色(candidate/hr/admin)与 CLAUDE.md 起手段一致。
- §3 各功能前置条件中的角色引用与 §2 一致。

- **issue-3** [严重度: 低]: P1-3 与 P1-8 中 `GET /api/applications/{id}/history` 接口重复声明
  - **位置**: PRD §3 · P1-3 API 形态 + P1-8 API 形态
  - **修复建议**: 该接口应只在 P1-8(申请阶段历史记录)中声明,P1-3 的 API 形态引用 P1-8 即可,避免下游误以为需要实现两次。

### 维度 3: 可行性

- P0 10 个功能 ≈ 10 个接口,对标定卡"约 10 接口"锚点,大学生+AI 辅助 12h 可完成。
- P0 主流程步数均 ≤ 5 步,无超 8 步的复杂功能。
- 无外部 API 依赖,文件上传使用本地 uploads/ 目录,可行。
- P2-1 看板拖拽(vuedraggable)为成熟 Vue 生态库,接入可行。

### 维度 4: 明确性

- 全文无「等功能」「相关信息」「根据需要」等模糊表述。
- 数值范围已明确(用户名 3-20 字符/密码 6-32 字符/title 1-100 字符/salary_text 0-50 字符/文件 ≤ 10MB)。
- 角色权限粒度已到行级(HR 只能改自己发布的职位)。

- **issue-4** [严重度: 中]: P0-5/P0-6 中 "requirements" 字段的类型和长度约束未明确
  - **位置**: PRD §3 · P0-5 · 业务规则
  - **修复建议**: 补充 requirements 字段的数据类型(TEXT)和长度上限(建议 2000 字符)。

### 维度 5: 业务规则

#### 5.1 边界 / 异常 / 权限

- 输入校验、重复值、权限边界三类异常在 P0 各功能中均有覆盖。
- P0-7 删除操作明确写了软删除 + 保留历史投递记录。

#### 5.2 CRUD 完整性(逐实体)

| 实体 | 创建 | 查询 | 更新 | 删除 | 依赖处理 |
|---|---|---|---|---|---|
| user | P0-1 注册 | P0-2 登录 | (无) | (无) | N/A |
| job_post | P0-5 发布 | P0-3 列表/P0-4 详情 | P0-6 编辑 | P0-7 下架(软删除) | ✅ 有 N 条 application → 软删除保留历史 |
| application | P0-8 投递 | P0-9 列表 | P0-10 状态更新 | (无) | N/A |
| interview_note | P0-10(隐式创建) | (无独立查询) | (无) | (无) | N/A |
| job_tag | P1-7 | P1-7/P0-3 | (无) | P1-7 | ✅ 级联删除 |
| application_stage | P1-8(自动) | P1-8 历史查询 | (无) | (无) | N/A |

- **issue-5** [严重度: 高]: interview_note 无独立查询接口
  - **位置**: PRD §3 · P0-10
  - **修复建议**: HR 更新状态后需要查看某次申请的所有面试备注历史。当前 P0-10 只有"写入"操作,P1-8 的 GET /api/applications/{id}/history 只返回 application_stage 表的状态变更,不包含 interview_note 的备注内容。建议 P1-8 接口返回合并数据,或新增 `GET /api/applications/{id}/notes` 查询面试备注列表。

#### 5.3 API ↔ UI 入口对照(双向)

**正向(UI 按钮 → API)**: 逐个检查 §5 关联页面的隐含操作:

| UI 入口 | 对应 API | 状态 |
|---|---|---|
| LoginPage 登录按钮 | POST /api/auth/login | ✅ |
| LoginPage 注册 Tab | POST /api/auth/register | ✅ |
| JobSquarePage 列表 | GET /api/jobs | ✅ |
| JobDetailPage 投递按钮 | POST /api/applications | ✅ |
| MyJobsPage 发布按钮 | POST /api/jobs | ✅ |
| MyJobsPage 编辑按钮 | PUT /api/jobs/{id} | ✅ |
| MyJobsPage 下架按钮 | DELETE /api/jobs/{id} | ✅ |
| MyJobsPage 候选人列表 | GET /api/applications?scope=jobId | ✅ |
| MyJobsPage 状态更新弹窗 | PUT /api/applications/{id}/status | ✅ |
| MyApplicationsPage 列表 | GET /api/applications?scope=mine | ✅ |
| 页面刷新后获取当前用户 | ❌ 缺失 | **孤儿按钮** |

**反向(API → UI 入口)**:

| API | UI 入口 | 状态 |
|---|---|---|
| POST /api/auth/register | LoginPage 注册 Tab | ✅ |
| POST /api/auth/login | LoginPage 登录按钮 | ✅ |
| GET /api/jobs | JobSquarePage | ✅ |
| GET /api/jobs/{id} | JobDetailPage | ✅ |
| POST /api/jobs | MyJobsPage 发布按钮 | ✅ |
| PUT /api/jobs/{id} | MyJobsPage 编辑按钮 | ✅ |
| DELETE /api/jobs/{id} | MyJobsPage 下架按钮 | ✅ |
| POST /api/applications | JobDetailPage 投递按钮 | ✅ |
| GET /api/applications | MyApplicationsPage / MyJobsPage | ✅ |
| PUT /api/applications/{id}/status | MyJobsPage 状态弹窗 | ✅ |

- **issue-6** [严重度: 高]: 缺少 `GET /api/auth/me` 接口 → 前端刷新后无法获取当前用户信息
  - **位置**: PRD §3 · P0-2 · API 形态
  - **修复建议**: P0-2 新增 `GET /api/auth/me` → `Result<UserInfo>`(返回当前登录用户的 userId+username+role),供前端 App.vue onMounted 或路由守卫调用,解决页面刷新后导航栏用户名消失的问题。

### 维度 6: 阶段演进

#### 6.1 状态机 / 字段 / 角色 迁移说明

- **issue-7** [严重度: 高]: P0→P1 状态流转约束的迁移方案未说明
  - **位置**: PRD §3 · P0-10 ↔ P1-3
  - **推演**: P0 允许"已录用→待筛选"回退操作 · P1 实现 P1-3 后禁止逆序流转 → P0 阶段已产生的逆序数据在 P1 后如何处理?
  - **修复建议**: 在 P1-3 业务规则中补充迁移说明:"P1-3 上线前,P0 阶段已存在的逆序状态记录标记为 `legacy=true`(或新增字段),P1 状态流转校验时跳过 legacy 记录;新产生的状态变更严格执行正向流转约束"。

#### 6.2 教学简化的边界声明

| 简化项 | 是否声明 | 位置 |
|---|---|---|
| 不做 token 黑名单/refresh | ✅ "教学简化" | P0-2 |
| 不做审核流程,发布即上架 | ✅ "教学简化" | P0-5 |
| 并发最后写入生效 | ✅ "教学简化" | P0-10 |
| 简历解析不做 NLP | ✅ "教学简化" | P2-4 |
| 邮件通知模拟 | ✅ "教学简化" | P2-2 |
| 薪资搜索简单 LIKE | ✅ "教学简化" | P1-1 |

全部教学简化均有显式声明,无遗漏。

#### 6.3 错误码 / 通用规约缺失

- 见 issue-1(维度 1),缺少统一错误码规范表。

### 维度 7: 反例推演(推演过程显式记录)

#### 7.1 删除依赖推演

| 实体 | 被引用方 | 推演 | PRD 是否说明 | 判定 |
|---|---|---|---|---|
| job_post | application(N:1) | 假设职位已有 3 条投递,HR 点下架 → application 数据如何? | ✅ P0-7:软删除保留历史 | OK |
| job_post | job_tag(N:1) | 假设职位有 2 个标签,HR 点下架 → 标签如何处理? | ✅ P1-7:级联删除 | OK |
| user(candidate) | application(N:1) | 假设候选人已投递 5 个职位,账号被删除 → 投递记录如何处理? | ❌ 未提及 | **issue-8** |

- **issue-8** [严重度: 中]: 用户删除场景未定义依赖处理
  - **位置**: PRD §3 · 无用户删除功能,但应在前置说明中补充
  - **推演**: 假设 candidate 有 5 条投递记录 → 删除该用户 → application.user_id 外键如何处理? application_stage.operator_id 如何处理?
  - **修复建议**: 在 §3 开头或 P0-1 补充"用户删除为 P2 功能(或教学简化:不做用户删除,仅 admin 可禁用账号)。如需删除,采用软删除(user.is_deleted=1),保留投递历史记录"。

#### 7.2 NULL / 空集合推演

| 可空字段 | 所在表 | 推演 | PRD 是否说明 | 判定 |
|---|---|---|---|---|
| job_post.deadline | job_post | deadline=NULL → 列表如何展示? 搜索/排序如何处理? | ✅ 展示"长期有效" | OK |
| interview_note.next_stage | interview_note | next_stage=NULL → 看板/漏斗是否统计? | ✅ P0-10:可为 NULL | OK |

NULL 语义基本覆盖。

#### 7.3 并发 / 重复操作推演

| 操作 | 推演 | PRD 是否说明 | 判定 |
|---|---|---|---|
| P0-8 投递简历 | 双窗口同时点投递 → 两条请求同时到 → DB 唯一索引防重 | ✅ 联合唯一索引 | OK |
| P0-10 更新状态 | 两个 HR 同时改同一申请 → 后写覆盖先写 | ✅ "最后写入生效" | OK |
| P0-1 注册 | 双窗口同时注册同一用户名 → 一条成功,一条报 1001 | ✅ 用户名唯一约束 | OK |
| P2-1 批量 PATCH | 拖拽多个卡片同时提交 → 部分成功,部分失败? | ❌ 未说明回滚策略 | **issue-9** |

- **issue-9** [严重度: 低]: P2-1 批量状态更新未定义部分失败回滚策略
  - **位置**: PRD §3 · P2-1 · 异常流程
  - **推演**: 拖拽 3 个卡片(2 个合法流转 + 1 个非法逆序) → 批量 PATCH → 合法 2 个成功但非法 1 个失败 → 前端不知道哪个成功哪个失败
  - **修复建议**: 补充"批量 PATCH 返回每条结果数组 [{id, success, message}],前端逐个处理,合法流转更新 UI,非法流转回弹对应卡片"。

#### 7.4 跨角色访问推演

| 角色 | 推演 | 判定 |
|---|---|---|
| candidate 访问 POST /api/jobs | 后端返回 403 → 前端拦截器提示"无权限" | ✅ P0-5 已定义 |
| hr 访问 POST /api/applications | 后端返回 403 → 前端拦截器提示 | ✅ P0-8 已定义 |
| 未登录访问 GET /api/jobs | 路由守卫拦截 → 跳转 /login | ✅ router/index.js 已设计 |
| admin 访问任意接口 | 各功能应明确 admin 权限边界 | ⚠️ 部分不明确(见 issue-2) |

---

## 修复行动建议

按严重度排序:

1. **[高] issue-1**: 新增统一错误码规范表(§4 末尾或 §3 之前),收录全局异常码 + 1xxx/2xxx/3xxx/4xxx 业务码段
2. **[高] issue-6**: P0-2 新增 `GET /api/auth/me` 接口定义
3. **[高] issue-5**: P0-10/P1-8 补充 interview_note 查询接口
4. **[高] issue-7**: P1-3 补充 P0→P1 状态机迁移方案说明
5. **[中] issue-2**: P0-9 补充 admin 角色查询范围
6. **[中] issue-4**: P0-5 补充 requirements 字段类型和长度
7. **[中] issue-8**: 补充用户删除场景的依赖处理说明
8. **[低] issue-3**: P1-3 移除重复的 history 接口声明
9. **[低] issue-9**: P2-1 补充批量 PATCH 部分失败回滚策略

