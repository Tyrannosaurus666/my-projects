# 招聘管理与人才看板系统 - API 接口设计

> **文档版本**: v1.0 · 2026-05-21
> **基于**: `docs/PRD.md`(v1.0) + 后端 Controller 代码实际实现
> **接口总数**: 21(P0=12 + P1=3 + P2=6)

---

## 1. 接口约定

### 1.1 通用规则

| 规则项 | 约定 |
|---|---|
| URL 前缀 | `/api` (vite.config.js proxy → `http://localhost:8080`) |
| 请求格式 | JSON (`Content-Type: application/json`) |
| 响应格式 | 统一 `Result<T>` 包装(见 §4.1) |
| 认证方式 | JWT Bearer Token (`Authorization: Bearer <token>`) |
| 时间格式 | ISO 8601 (`yyyy-MM-dd HH:mm:ss`)，后端 `LocalDateTime` 自动序列化 |
| 分页参数 | `pageNum`(默认1) + `pageSize`(默认10) |
| RESTful 风格 | GET=查询, POST=创建, PUT=更新, DELETE=删除(软删除) |

### 1.2 认证白名单

以下接口无需 JWT Token(LoginInterceptor 放行):
- `POST /api/auth/login`
- `POST /api/auth/register`

其他所有 `/api/**` 接口均需在 Header 携带有效 JWT Token。

### 1.3 角色权限速查

| 角色 | 可访问的接口 |
|---|---|
| `candidate` | 浏览职位 + 查看详情 + 投递简历 + 查看自己的申请 |
| `hr` | candidate权限 + 发布/编辑/下架自己的职位 + 查看自己职位的投递 + 更新状态 + 看板 + 统计 |
| `admin` | 全部权限 + 跨 HR 查看数据 + 编辑/下架任意职位 |

---

## 2. 接口清单

### 2.1 认证模块 (3 个)

| # | 方法 | URL | 说明 | 优先级 | 认证 |
|---|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | 用户注册 | P0 | 否 |
| 2 | POST | `/api/auth/login` | 用户登录 | P0 | 否 |
| 3 | GET | `/api/auth/me` | 获取当前用户信息 | P0 | 是 |

### 2.2 职位模块 (5 个)

| # | 方法 | URL | 说明 | 优先级 | 认证 | 角色 |
|---|---|---|---|---|---|---|
| 4 | GET | `/api/jobs` | 职位列表(分页+搜索) | P0/P1 | 是 | 全部 |
| 5 | GET | `/api/jobs/{id}` | 职位详情(含标签) | P0 | 是 | 全部 |
| 6 | POST | `/api/jobs` | 创建职位 | P0 | 是 | hr/admin |
| 7 | PUT | `/api/jobs/{id}` | 编辑职位 | P0 | 是 | hr/admin |
| 8 | DELETE | `/api/jobs/{id}` | 下架职位(软删除) | P0 | 是 | hr/admin |

### 2.3 投递模块 (8 个)

| # | 方法 | URL | 说明 | 优先级 | 认证 | 角色 |
|---|---|---|---|---|---|---|
| 9 | POST | `/api/applications` | 投递简历(含文件上传) | P0 | 是 | candidate |
| 10 | GET | `/api/applications` | 申请列表(scope模式) | P0 | 是 | 全部 |
| 11 | PUT | `/api/applications/{id}/status` | 更新申请状态+备注 | P0 | 是 | hr/admin |
| 12 | GET | `/api/applications/{id}/notes` | 面试备注历史 | P0 | 是 | 全部 |
| 13 | GET | `/api/applications/{id}/stages` | 状态变更历史 | P1 | 是 | 全部 |
| 14 | GET | `/api/applications/{id}/offer` | 生成Offer模板 | P2 | 是 | hr/admin |
| 15 | GET | `/api/applications/{id}/resume` | 获取简历解析文本 | P2 | 是 | (权限校验) |
| 16 | GET | `/api/applications/duplicates` | 简历MD5查重 | P2 | 是 | hr/admin |

### 2.4 统计模块 (1 个)

| # | 方法 | URL | 说明 | 优先级 | 认证 | 角色 |
|---|---|---|---|---|---|---|
| 17 | GET | `/api/statistics/funnel` | 招聘漏斗数据 | P1 | 是 | hr/admin |

### 2.5 面试日程模块 (4 个)

| # | 方法 | URL | 说明 | 优先级 | 认证 | 角色 |
|---|---|---|---|---|---|---|
| 18 | GET | `/api/schedules` | 面试日程列表 | P2 | 是 | 全部 |
| 19 | POST | `/api/schedules` | 安排面试 | P2 | 是 | hr/admin |
| 20 | PUT | `/api/schedules/{id}` | 更新日程 | P2 | 是 | hr(本人) |
| 21 | DELETE | `/api/schedules/{id}` | 取消日程 | P2 | 是 | hr(本人) |

---

## 3. 接口详情

### 3.1 认证模块

#### #1 POST /api/auth/register — 用户注册

**请求参数** (JSON Body):
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| username | String | 是 | 用户名，3-20 字符 |
| password | String | 是 | 密码，6-32 字符 |
| role | String | 是 | 角色: `candidate` 或 `hr`(admin 不开放注册) |

**请求示例**:
```json
{
  "username": "candidate01",
  "password": "123456",
  "role": "candidate"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "注册成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 400 | 用户名/密码格式错误 | `@Valid` 校验失败 |
| 1001 | 用户名已存在 | 用户名重复 |

---

#### #2 POST /api/auth/login — 用户登录

**请求参数** (JSON Body):
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| username | String | 是 | 用户名 |
| password | String | 是 | 密码 |

**请求示例**:
```json
{
  "username": "hr01",
  "password": "123456"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": 3,
    "role": "hr",
    "username": "hr01"
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 400 | 用户名/密码不能为空 | 参数校验失败 |
| 404 | 用户不存在 | 用户名查不到 |
| 1002 | 密码错误 | BCrypt 不匹配 |

---

#### #3 GET /api/auth/me — 获取当前用户信息

**请求头**:
```
Authorization: Bearer <token>
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "userId": 3,
    "username": "hr01",
    "role": "hr",
    "status": 1
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 401 | 未登录或 token 已过期 | 无 token / token 无效 |

---

### 3.2 职位模块

#### #4 GET /api/jobs — 职位列表(分页+多条件搜索)

**Query 参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| pageNum | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 10 | 每页条数 |
| keyword | String | 否 | - | 标题/要求模糊搜索 |
| status | String | 否 | "招聘中" | 状态筛选(不传默认"招聘中") |
| salaryKeyword | String | 否 | - | 薪资字段模糊搜索 |
| reqKeyword | String | 否 | - | 要求字段模糊搜索 |
| tag | String | 否 | - | 标签筛选(精确匹配) |

**调用示例**:
```
GET /api/jobs?pageNum=1&pageSize=10&keyword=Java&tag=急聘
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "title": "Java后端开发工程师",
        "salaryText": "15K-25K",
        "requirements": "3年以上Java开发经验,熟悉SpringBoot、MySQL",
        "status": "招聘中",
        "hrId": 3,
        "deadline": "2026-07-01T00:00:00",
        "tags": ["Java", "SpringBoot", "急聘"],
        "createTime": "2026-05-20T10:30:00"
      }
    ],
    "total": 5,
    "size": 10,
    "current": 1,
    "pages": 1
  }
}
```

**说明**:
- 不传 `status` 时默认只返回"招聘中"的职位
- 传了 `status`(如"停招")则按传入值精确筛选
- `tags` 字段为批量填充的标签名称数组(非数据库字段，由 Service 动态注入)
- 此接口使用 Redis 缓存(TTL 5min)

---

#### #5 GET /api/jobs/{id} — 职位详情

**路径参数**:
| 参数 | 类型 | 说明 |
|---|---|---|
| id | Long | 职位ID |

**调用示例**:
```
GET /api/jobs/1
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": 1,
    "title": "Java后端开发工程师",
    "salaryText": "15K-25K",
    "requirements": "3年以上Java开发经验,熟悉SpringBoot、MySQL",
    "status": "招聘中",
    "hrId": 3,
    "deadline": "2026-07-01T00:00:00",
    "tags": ["Java", "SpringBoot"],
    "createTime": "2026-05-20T10:30:00",
    "updateTime": "2026-05-20T10:30:00"
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 2001 | 职位不存在 | id 无效或已删除 |

---

#### #6 POST /api/jobs — 创建职位

**权限**: hr / admin

**请求参数** (JSON Body):
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | String | 是 | 职位名称，1-100 字符 |
| salaryText | String | 否 | 薪资描述，≤50 字符(默认"") |
| requirements | String | 是 | 岗位要求，TEXT ≤2000 字符 |
| deadline | String | 否 | 截止日期(`yyyy-MM-dd HH:mm:ss`)，可空=长期有效 |
| tags | String | 否 | 标签，逗号分隔(如"Java,SpringBoot") |

**请求示例**:
```json
{
  "title": "Java后端开发工程师",
  "salaryText": "15K-25K",
  "requirements": "3年以上Java开发经验,熟悉SpringBoot、MySQL",
  "deadline": "2026-07-01 00:00:00",
  "tags": "Java,SpringBoot,急聘"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "发布成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 400 | 参数校验失败 | title 为空/超过 100 字符 |
| 403 | 只有HR可以发布职位 | candidate 调用 |

---

#### #7 PUT /api/jobs/{id} — 编辑职位

**权限**: hr(发布者本人) / admin

**路径参数**: `id` — 职位ID

**请求体**: 同 #6 POST /api/jobs

**成功响应** (200):
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 2001 | 职位不存在 | id 无效或已删除 |
| 2002 | 只能编辑自己发布的职位 | 非发布者 HR |

---

#### #8 DELETE /api/jobs/{id} — 下架职位(软删除)

**权限**: hr(发布者本人) / admin

**路径参数**: `id` — 职位ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "下架成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 2001 | 职位不存在 | id 无效或已删除 |
| 2002 | 只能下架自己发布的职位 | 非发布者 HR |

**说明**: 软删除 — `status` 设为"停招"，`is_deleted` 设为 1(使用 MyBatis-Plus `@TableLogic`)。

---

### 3.3 投递模块

#### #9 POST /api/applications — 投递简历

**权限**: candidate

**请求参数** (multipart/form-data):
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| jobId | Long | 是 | 职位ID |
| file | MultipartFile | 否 | 简历文件(支持 .pdf/.doc/.docx/.txt, ≤10MB) |

**调用示例**:
```
POST /api/applications
Content-Type: multipart/form-data

jobId: 1
file: resume.pdf
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "投递成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 403 | 只有候选人可以投递 | hr/admin 调用 |
| 400 | 不支持的文件类型，仅允许 PDF/DOC/DOCX | 文件类型不符 |
| 400 | 文件大小不能超过 10MB | 文件过大 |
| 2001 | 职位不存在 | jobId 无效 |
| 2003 | 该职位已停止招聘 | 职位状态非"招聘中" |
| 1003 | 您已投递过该职位 | 重复投递 |

**说明**:
- 有文件时: 保存到 `uploads/resume/{userId}/{timestamp}_{filename}`，自动计算 MD5 哈希 + 提取文本内容
- 无文件时: `resumeUrl` 为空字符串
- 重复投递由 DB 层 `UNIQUE(job_id, user_id)` 索引保证

---

#### #10 GET /api/applications — 申请列表(scope 模式)

**Query 参数**:
| 参数 | 类型 | 必填 | 默认值 | 说明 |
|---|---|---|---|---|
| scope | String | 否 | "mine" | 查询范围: `mine` / `myJobs` / `jobId` |
| jobId | Long | 条件必填 | - | scope=jobId 时必填 |
| pageNum | Integer | 否 | 1 | 页码 |
| pageSize | Integer | 否 | 10 | 每页条数 |

**scope 说明**:
| scope 值 | 查询逻辑 | 适用角色 |
|---|---|---|
| `mine` | 当前登录用户的所有投递 | candidate(admin 返回空) |
| `myJobs` | 当前 HR 发布的所有职位下的投递 | hr / admin |
| `jobId` | 指定职位下的投递(需校验权限) | hr(自己的职位) / admin(任意) |

**调用示例**:
```
GET /api/applications?scope=myJobs&pageNum=1&pageSize=10
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "records": [
      {
        "id": 1,
        "jobId": 1,
        "job_id": 1,
        "userId": 1,
        "user_id": 1,
        "username": "candidate01",
        "jobTitle": "Java后端开发工程师",
        "status": "待筛选",
        "resume_url": "uploads/resume/1/1716200000_resume.pdf",
        "create_time": "2026-05-20T10:30:00"
      }
    ],
    "total": 3,
    "size": 10,
    "current": 1
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 2001 | 职位不存在 | scope=jobId 时 jobId 无效 |
| 2002 | 无权查看该职位的投递列表 | scope=jobId 时非发布者 HR |

**说明**: 使用 `selectMapsPage` 查询，返回字段为数据库原始列名(下划线格式)。

---

#### #11 PUT /api/applications/{id}/status — 更新申请状态

**权限**: hr(该投递对应职位的发布者) / admin

**路径参数**: `id` — 投递记录ID

**请求参数** (JSON Body):
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| status | String | 是 | 目标状态: 待筛选 / 已面试 / 已录用 / 已拒绝 |
| content | String | 否 | 面试备注内容 |
| nextStage | String | 否 | 下一阶段建议: 初筛 / 技术面 / HR面 / 终面 / offer |

**请求示例**:
```json
{
  "status": "已面试",
  "content": "Java基础扎实，项目经验丰富，推荐进入下一轮",
  "nextStage": "技术面"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 403 | 只有HR可以更新申请状态 | candidate 调用 |
| 400 | 无效的状态值 | status 不在合法枚举内 |
| 3002 | 投递记录不存在 | id 无效 |
| 4001 | 只能更新自己职位下的投递状态 | 非发布者 HR |
| 3004 | 不允许的状态流转: X → Y | 状态机校验失败(如已录用→待筛选) |

**说明**: 此接口同时完成 3 个操作:
1. 更新 `application.status`
2. 写入 `application_stage` 记录(from_status → to_status, operator_id)
3. 写入 `interview_note` 记录(content, next_stage)

状态机合法流转:
- 待筛选 → 已面试 / 已拒绝
- 已面试 → 已录用 / 已拒绝
- 已录用 / 已拒绝 → 终态(不可流转)

---

#### #12 GET /api/applications/{id}/notes — 面试备注历史

**路径参数**: `id` — 投递记录ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "appId": 2,
      "hrId": 3,
      "content": "Java基础扎实，项目经验丰富，推荐进入下一轮",
      "nextStage": "技术面",
      "createTime": "2026-05-20T14:30:00"
    },
    {
      "id": 2,
      "appId": 2,
      "hrId": 3,
      "content": "技术面通过，沟通能力好，建议HR面",
      "nextStage": "HR面",
      "createTime": "2026-05-21T09:00:00"
    }
  ]
}
```

**说明**: 按 `createTime` 降序排列。

---

#### #13 GET /api/applications/{id}/stages — 状态变更历史(P1)

**路径参数**: `id` — 投递记录ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "appId": 2,
      "fromStatus": null,
      "toStatus": "待筛选",
      "operatorId": 1,
      "legacy": 0,
      "createTime": "2026-05-20T10:30:00"
    },
    {
      "id": 2,
      "appId": 2,
      "fromStatus": "待筛选",
      "toStatus": "已面试",
      "operatorId": 3,
      "legacy": 0,
      "createTime": "2026-05-20T14:30:00"
    }
  ]
}
```

**说明**: 按 `createTime` 升序排列。首次创建时 `fromStatus` 为 null。`legacy=1` 表示 P0 阶段产生的逆序记录(P1 状态机校验时跳过)。

---

#### #14 GET /api/applications/{id}/offer — 生成Offer模板(P2)

**权限**: hr(该投递对应职位的发布者) / admin

**路径参数**: `id` — 投递记录ID(申请状态必须为"已录用")

**成功响应** (200):
```json
{
  "code": 200,
  "message": "Offer生成成功",
  "data": {
    "title": "录用通知书",
    "candidateName": "candidate01",
    "jobTitle": "Java后端开发工程师",
    "salary": "15K-25K",
    "date": "2026-05-21",
    "content": "恭喜您通过面试筛选，已被正式录用！请携带身份证件于指定日期报到。\n(教学简化：此为Offer文本模板占位，实际项目可对接PDF生成服务)"
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 403 | 只有HR可以生成Offer | candidate 调用 |
| 3002 | 投递记录不存在 | id 无效 |
| 400 | 只有已录用的申请才能生成Offer | status ≠ "已录用" |
| 4001 | 只能为自己职位下的投递生成Offer | 非发布者 HR |

---

#### #15 GET /api/applications/{id}/resume — 获取简历解析文本(P2)

**权限**: admin / 投递者本人 / 该投递对应职位的发布者 HR

**路径参数**: `id` — 投递记录ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "resumeUrl": "uploads/resume/1/1716200000_resume.pdf",
    "resumeHash": "d41d8cd98f00b204e9800998ecf8427e",
    "resumeText": "姓名: 张三\n学历: 本科\n..."
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 3002 | 投递记录不存在 | id 无效 |
| 4001 | 无权查看该简历 | 既非 admin、非投递者本人、也非职位发布者 HR |

---

#### #16 GET /api/applications/duplicates — 简历MD5查重(P2)

**权限**: hr / admin

**Query 参数**:
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| hash | String | 是 | 简历文件的 MD5 哈希值 |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "找到 2 份相同简历(MD5)",
  "data": [
    {
      "id": 1,
      "jobId": 1,
      "userId": 1,
      "resumeHash": "d41d8cd98f00b204e9800998ecf8427e",
      "resumeUrl": "uploads/resume/1/resume.pdf"
    },
    {
      "id": 5,
      "jobId": 2,
      "userId": 3,
      "resumeHash": "d41d8cd98f00b204e9800998ecf8427e",
      "resumeUrl": "uploads/resume/3/resume_copy.pdf"
    }
  ]
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 403 | 只有HR/Admin可以查询简历重复 | candidate 调用 |

---

### 3.4 统计模块

#### #17 GET /api/statistics/funnel — 招聘漏斗(P1)

**权限**: hr / admin

**Query 参数**:
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| hrId | Long | 否 | 指定HR的ID(不传则 admin 看全量，hr 看自己) |

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    { "status": "待筛选", "count": 5 },
    { "status": "已面试", "count": 3 },
    { "status": "已录用", "count": 2 },
    { "status": "已拒绝", "count": 1 }
  ]
}
```

**说明**: 按状态分组统计 application 数量。`hrId` 参数传入时，仅统计该 HR 发布职位下的投递。

---

### 3.5 面试日程模块

#### #18 GET /api/schedules — 面试日程列表(P2)

**Query 参数**:
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| appId | Long | 否 | 投递记录ID(传则只查该投递的日程) |

**说明**:
- 不传 `appId`: admin 查全量，hr 查自己安排的日程
- 传了 `appId`: 查指定投递记录的所有日程

**成功响应** (200):
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "appId": 2,
      "hrId": 3,
      "interviewTime": "2026-06-01T14:00:00",
      "place": "会议室A",
      "title": "技术面试",
      "status": "已安排",
      "createTime": "2026-05-21T10:00:00"
    }
  ]
}
```

---

#### #19 POST /api/schedules — 安排面试(P2)

**权限**: hr(对应职位发布者) / admin

**Query 参数**:
| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| appId | Long | 是 | 投递记录ID |

**请求体** (JSON):
| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| title | String | 否 | 面试标题 |
| interviewTime | String | 是 | 面试时间(`yyyy-MM-dd HH:mm:ss`) |
| place | String | 否 | 面试地点 |

**请求示例**:
```
POST /api/schedules?appId=2
Content-Type: application/json

{
  "title": "技术面试",
  "interviewTime": "2026-06-01 14:00:00",
  "place": "会议室A"
}
```

**成功响应** (200):
```json
{
  "code": 200,
  "message": "面试安排成功",
  "data": {
    "id": 1,
    "appId": 2,
    "hrId": 3,
    "interviewTime": "2026-06-01T14:00:00",
    "place": "会议室A",
    "title": "技术面试",
    "status": "已安排"
  }
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 3002 | 投递记录不存在 | appId 无效 |
| 4001 | 只能为自己职位下的投递安排面试 | 非发布者 HR |

**说明**: 后端会打印模拟邮件通知日志 `[教学简化] 模拟邮件发送: ...`。

---

#### #20 PUT /api/schedules/{id} — 更新日程(P2)

**权限**: hr(该日程的创建者本人)

**路径参数**: `id` — 日程ID
**请求体**: 同 #19 POST(所有字段均可选，传哪些更新哪些)

**成功响应** (200):
```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 3002 | 面试日程不存在 | id 无效 |
| 4001 | 只能修改自己安排的面试 | 非创建者 |

---

#### #21 DELETE /api/schedules/{id} — 取消日程(P2)

**权限**: hr(该日程的创建者本人)

**路径参数**: `id` — 日程ID

**成功响应** (200):
```json
{
  "code": 200,
  "message": "已取消",
  "data": null
}
```

**异常响应**:
| code | message | 场景 |
|---|---|---|
| 3002 | 面试日程不存在 | id 无效 |
| 4001 | 只能取消自己安排的面试 | 非创建者 |

---

## 4. 通用响应格式 + 异常码表

### 4.1 Result\<T\> 统一响应格式

**成功响应**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": <T>
}
```

**业务异常响应**:
```json
{
  "code": <业务异常码>,
  "message": "<异常描述>",
  "data": null
}
```

**字段说明**:
| 字段 | 类型 | 说明 |
|---|---|---|
| code | Integer | 200=成功, 其他=异常 |
| message | String | 提示信息(前端 `ElMessage.error` 直接展示) |
| data | T / null | 业务数据(异常时为 null) |

**前端拦截器处理逻辑** (`frontend/src/api/request.js`):
1. `code === 200` → 返回 `res` 给业务层, 走 `.data` 取数据
2. `code === 401` → 清 localStorage token + 跳 `/login` + `ElMessage.error('未登录')`
3. 其他 code → `ElMessage.error(msg)` + reject

### 4.2 全局异常码

| code | 说明 | 触发场景 |
|---|---|---|
| 200 | 操作成功 | 正常响应 |
| 400 | 参数校验失败 / 业务参数错误 | `@Valid` 校验不通过 / 文件类型/大小不合法 / 无效的状态值 |
| 401 | 未登录或 token 已过期 | 无 token / token 无效 / token 过期(2h) |
| 403 | 无权限 | 角色权限不足(如 candidate 发布职位) |
| 404 | 资源不存在 | 用户/职位/投递不存在 |
| 500 | 服务器内部错误 | 未捕获的运行时异常 |

### 4.3 业务异常码(模块分段)

| 码段 | 范围 | 说明 |
|---|---|---|
| 1xxx | 用户/认证模块 | 1001=用户名重复, 1002=密码错误, 1003=重复投递, 1004=token无效 |
| 2xxx | 职位模块 | 2001=职位不存在, 2002=无权操作该职位, 2003=职位已下架/停招 |
| 3xxx | 投递/简历模块 | 3001=已投递过该职位, 3002=投递记录/日程不存在, 3003=简历文件无效, 3004=非法的状态流转 |
| 4xxx | 权限/面试模块 | 4001=无权更新状态/安排面试/查看简历 |

### 4.4 业务异常码完整表

| code | message | 所属模块 | 触发场景 |
|---|---|---|---|
| 1001 | 用户名已存在 | 用户模块 | 注册时用户名重复 |
| 1002 | 密码错误 | 用户模块 | 登录时 BCrypt 不匹配 |
| 1003 | 您已投递过该职位 | 投递模块 | 同一 candidate 重复投递同一职位 |
| 2001 | 职位不存在 | 职位模块 | 查/改/删职位时 id 无效 |
| 2002 | 只能编辑/下架自己发布的职位 | 职位模块 | 非发布者 HR 操作他人职位 |
| 2003 | 该职位已停止招聘 | 职位模块 | 投递时职位非"招聘中" |
| 3002 | 投递记录不存在 | 投递模块 | 查/改投递时 id 无效 |
| 3003 | 简历文件保存失败 | 投递模块 | 文件 IO 异常 |
| 3004 | 不允许的状态流转 | 投递模块 | 状态机校验失败(如已录用 → 已面试) |
| 4001 | 只能为自己职位下的投递操作 | 权限模块 | 非发布者 HR 操作他人职位的投递 |

---

> **接口实现对照**: 本文档与后端实际 Controller 代码一一对应，详见:
> - `AuthController.java` → #1~#3
> - `JobController.java` → #4~#8
> - `ApplicationController.java` → #9~#16
> - `StatisticsController.java` → #17
> - `InterviewScheduleController.java` → #18~#21
