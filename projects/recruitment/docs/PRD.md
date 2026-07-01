# 招聘管理与人才看板系统 - 需求规格说明书

> **文档版本**: v1.0 · 2026-05-20  
> **对应标定卡**: `docs/00-选题标定.md`(R-00 已审已修)  
> **全量覆盖**: P0(必做·60 分) + P1(应做·70-80 分) + P2(可选·85+ 分)

---

## 1. 项目概述

招聘管理与人才看板系统面向 HR 与候选人两端，围绕「职位发布 → 候选人投递 → 面试状态跟踪」三条主线建设。HR 发布职位并管理候选人流程，候选人在职位广场浏览并投递简历。系统以看板形式直观展示招聘漏斗各阶段的人才分布，支持从投递到录用的全生命周期管理。

---

## 2. 用户角色定义

- **candidate(候选人)** · 浏览职位广场、投递简历、查看个人申请状态 · 可访问: 职位广场、职位详情、我的申请
- **hr(招聘方)** · 发布/管理职位、筛选候选人、更新申请状态、记录面试备注 · 可访问: 职位管理、候选人列表、招聘漏斗
- **admin(管理员)** · 全量数据管理、用户管理、系统配置 · 可访问: 管理后台(P1/P2)

---

## 3. 功能需求列表

### P0-1 · 用户注册

<!-- R-01-issue-8: 已修复 - 补充用户删除场景说明:教学简化不做用户删除,仅 admin 可禁用账号 -->

- **实现优先级**: P0 必做
- **描述**: 新用户注册账号并选择角色(candidate/hr)
- **前置条件**: 未登录
- **主流程**:
  1. 用户访问注册页 → 填写用户名、密码、选择角色(candidate/hr)
  2. 系统校验用户名唯一性 → BCrypt 加密密码 → 写入 user 表
  3. 返回注册成功 → 跳转登录页
- **异常流程**:
  - ① 输入校验:用户名为空/密码不足 6 位 → 400 提示"用户名/密码格式错误"
  - ① 重复值:用户名已存在 → BusinessException(1001,"用户名已存在")
  - ④ 权限边界:admin 角色只能由已有 admin 创建或数据库直接插入,前端注册页不展示 admin 选项
- **业务规则**:
  - ① 数据约束:用户名 3-20 字符,密码 6-32 字符,role ∈ {candidate, hr}
  - ④ 教学简化:注册后角色不可更改,如需切换角色需重新注册;不做用户删除功能,仅 admin 可禁用账号(user.status=0),保留投递历史记录
- **API 形态**:
  - `POST /api/auth/register` → `Result<Void>`(注册,body: username+password+role)
- **关联页面**: LoginPage(注册 Tab)

### P0-2 · 用户登录

<!-- R-01-issue-6: 已修复 - 新增 GET /api/auth/me 接口定义 -->

- **实现优先级**: P0 必做
- **描述**: 用户登录并获取 JWT token
- **前置条件**: 已注册
- **主流程**:
  1. 用户输入用户名+密码 → 提交
  2. 系统查 user 表 → BCrypt 验密 → 签发 JWT(含 userId+role,过期 2h)
  3. 前端存 token 到 localStorage → 跳转首页
- **异常流程**:
  - ① 输入校验:用户名或密码为空 → 400
  - ① 数据不存在:用户名不存在 → 404"用户不存在"
  - ① 密码错误:BCrypt 不匹配 → BusinessException(1002,"密码错误")
  - ③ 并发:同一用户多次登录 → 每次签发新 token,旧 token 在过期前仍有效(教学简化:不做 token 黑名单)
- **业务规则**:
  - ④ 教学简化:不做 refresh_token 双 token 机制,单 token 过期时间 2h;不做 token 黑名单/登出失效
- **API 形态**:
  - `POST /api/auth/login` → `Result<LoginResponse>`(返回 token+userId+role+username)
  - `GET /api/auth/me` → `Result<UserInfo>`(返回当前登录用户的 userId+username+role,前端页面刷新后调用以恢复导航栏用户信息)
- **关联页面**: LoginPage(登录 Tab)

### P0-3 · 职位公开列表

- **实现优先级**: P0 必做
- **描述**: 候选人/HR 浏览所有「招聘中」的职位,支持分页
- **前置条件**: 登录后即可访问(无额外权限)
- **主流程**:
  1. 用户进入职位广场 → 系统返回 status=招聘中的职位列表(分页,默认 pageNum=1, pageSize=10)
  2. 用户翻页 → 系统返回对应页数据
- **异常流程**:
  - ① 输入校验:pageNum≤0 → 后端兼容为第 1 页
- **业务规则**:
  - ① 数据约束:只返回 status=招聘中且 is_deleted=0 的职位;分页默认 10 条/页
  - ③ 可空外键:job_post.deadline 为 NULL 表示"长期有效",列表展示为"长期有效"
  - ③ 可空外键:job_post.hr_id 不可空(发布时必填,由当前登录 HR 的 userId 自动填入)
- **API 形态**:
  - `GET /api/jobs?pageNum=1&pageSize=10` → `Result<PageResult<JobPost>>`(列表,含分页信息)
- **关联页面**: JobSquarePage(职位广场)

### P0-4 · 职位详情

- **实现优先级**: P0 必做
- **描述**: 查看单个职位的完整信息(含 title/salary_text/要求/deadline/HR 信息)
- **前置条件**: 登录后即可访问
- **主流程**:
  1. 用户在职位广场点击某职位卡片 → 跳转详情页
  2. 系统返回该职位的全部字段 + 发布者 HR 的 username
- **异常流程**:
  - ① 关联实体不存在:职位 id 无效或已删除 → 404"职位不存在"
- **业务规则**:
  - ① 数据约束:详情页展示 title/status/salary_text/hr 姓名/create_time/deadline
  - ③ 可空外键:deadline 为 NULL → 展示"长期有效"
- **API 形态**:
  - `GET /api/jobs/{id}` → `Result<JobPostDetail>`(详情,含 hrName)
- **关联页面**: JobDetailPage(职位详情)

### P0-5 · HR 发布职位

<!-- R-01-issue-4: 已修复 - 补充 requirements 字段类型 TEXT,长度上限 2000 字符 -->

- **实现优先级**: P0 必做
- **描述**: HR 创建新职位并发布
- **前置条件**: 登录角色为 hr/admin
- **主流程**:
  1. HR 点击"发布职位" → 填写 title/salary_text/要求/deadline(可选)
  2. 系统校验字段 → hr_id 取当前登录用户 → status 初始为"招聘中" → 写入 job_post 表
  3. 返回创建成功 → 职位出现在广场列表
- **异常流程**:
  - ① 输入校验:title 为空/超过 100 字符 → 400
  - ④ 权限边界:candidate 角色调用 → 403"只有 HR 可以发布职位"
- **业务规则**:
  - ① 数据约束:title 1-100 字符,salary_text 0-50 字符,requirements TEXT 类型 ≤ 2000 字符,status 默认"招聘中",deadline 可空
  - ④ 教学简化:不需要审核流程,发布即上架
- **API 形态**:
  - `POST /api/jobs` → `Result<Void>`(创建职位,body: title+salaryText+requirements+deadline)
- **关联页面**: MyJobsPage(我的职位 → 发布按钮 → 发布弹窗)

### P0-6 · HR 编辑职位

- **实现优先级**: P0 必做
- **描述**: HR 编辑自己发布的职位信息
- **前置条件**: 登录角色为 hr/admin,且为职位发布者本人(或 admin)
- **主流程**:
  1. HR 在"我的职位"列表点击某职位"编辑" → 弹出编辑表单(预填当前值)
  2. 修改字段 → 提交 → 系统校验 → 更新 job_post 表
  3. 返回更新成功
- **异常流程**:
  - ① 关联实体不存在:职位已删除 → 404
  - ④ 权限边界:非发布者 HR 编辑他人职位 → 403"只能编辑自己的职位"
  - ④ admin 可编辑任意职位(教学简化:admin 拥有全量权限)
- **业务规则**:
  - ① 数据约束:同 P0-5(title 1-100 字符,salary_text 0-50 字符)
- **API 形态**:
  - `PUT /api/jobs/{id}` → `Result<Void>`(编辑职位,body: title+salaryText+requirements+deadline)
- **关联页面**: MyJobsPage(编辑按钮)

### P0-7 · HR 下架职位

- **实现优先级**: P0 必做
- **描述**: HR 将自己发布的职位下架(软删除),下架后不再出现在广场
- **前置条件**: 登录角色为 hr/admin,且为职位发布者本人(或 admin)
- **主流程**:
  1. HR 在"我的职位"列表点击"下架" → 二次确认弹窗
  2. 确认后 → 系统将 job_post.status 设为"停招" + is_deleted=1(软删除)
  3. 返回下架成功 → 广场列表不再显示
- **异常流程**:
  - ② 数据关联约束:职位下有 N 条投递记录(application) → 软删除(保留历史投递数据),已投递的候选人仍可在"我的申请"中看到记录,状态显示为"职位已下架"
  - ④ 权限边界:非发布者 HR 下架他人职位 → 403
- **业务规则**:
  - ② 状态机:招聘中 → 停招(不可逆,如需恢复由 admin 数据库操作)
- **API 形态**:
  - `DELETE /api/jobs/{id}` → `Result<Void>`(下架,实际软删除)
- **关联页面**: MyJobsPage(下架按钮)

### P0-8 · 投递简历

- **实现优先级**: P0 必做
- **描述**: 候选人对某个职位投递简历(上传简历文件 + 记录投递)
- **前置条件**: 登录角色为 candidate
- **主流程**:
  1. 候选人在职位详情页点击"投递简历" → 弹出上传框(支持 PDF/Word)
  2. 上传简历文件 → 系统保存到 uploads/ 目录 → 写入 application 表(status=待筛选)
  3. 返回投递成功
- **异常流程**:
  - ① 输入校验:未上传文件 → 400"请上传简历"
  - ① 重复值:同一 candidate 重复投递同一职位 → BusinessException(1003,"您已投递过该职位")
  - ③ 并发:双窗口同时投递 → DB 层 job_id+user_id 联合唯一索引防重
  - ④ 权限边界:hr/admin 角色调用 → 403"只有候选人可以投递"
- **业务规则**:
  - ① 数据约束:resume_url 存储文件路径,文件类型限制 PDF/DOC/DOCX,大小 ≤ 10MB
  - ② 状态机:新投递 status="待筛选"
- **API 形态**:
  - `POST /api/applications` → `Result<Void>`(投递,body: jobId + multipart file)
- **关联页面**: JobDetailPage(投递按钮)

### P0-9 · 申请列表查询

<!-- R-01-issue-2: 已修复 - 补充 admin 角色查询范围:scope=mine 返回空,scope=jobId 可查看任意职位 -->

- **实现优先级**: P0 必做
- **描述**: 统一查询申请列表,支持 scope=mine(候选人看自己)和 scope=jobId(HR 看某职位下所有投递)
- **前置条件**: 登录
- **主流程**:
  1. candidate 访问"我的申请" → scope=mine → 返回当前用户的所有申请(含职位 title + 状态)
  2. HR 在"我的职位"点击某职位"查看候选人" → scope=jobId → 返回该职位下所有投递
- **异常流程**:
  - ④ 权限边界:scope=mine 时自动过滤为当前用户,不可查看他人申请;scope=jobId 时检查是否为该职位发布者 HR(或 admin,admin 可查看任意职位的投递);admin 调用 scope=mine 返回空(admin 无投递记录)
- **业务规则**:
  - ① 数据约束:返回字段含 application.id / job.title / user.username / status / resume_url / create_time
  - ③ 可空外键:resume_url 不可空(投递时必填)
- **API 形态**:
  - `GET /api/applications?scope=mine&pageNum=1&pageSize=10` → `Result<PageResult<ApplicationVO>>`
  - `GET /api/applications?scope=jobId&jobId={id}&pageNum=1` → `Result<PageResult<ApplicationVO>>`
- **关联页面**: MyApplicationsPage(我的申请) / MyJobsPage(每职位的候选人 Tab)

### P0-10 · 更新申请状态 + 面试备注

<!-- R-01-issue-5: 已修复 - P0-10 新增 GET /api/applications/{id}/notes 面试备注查询接口 -->

- **实现优先级**: P0 必做
- **描述**: HR 更新候选人申请状态,同时写入面试备注(interview_note)
- **前置条件**: 登录角色为 hr/admin,且为该投递对应职位的发布者
- **主流程**:
  1. HR 在候选人列表点击"更新状态" → 选择新状态(待筛选/已面试/已录用/已拒绝) + 填写备注内容 + 选择下一阶段(可选)
  2. 系统更新 application.status → 写入 interview_note(app_id+hr_id+content+next_stage)
  3. 返回更新成功
- **异常流程**:
  - ① 无效枚举值:status 不在{待筛选,已面试,已录用,已拒绝} → 400
  - ③ 并发:双 HR 同时改同一申请状态 → 乐观锁(version 字段) 或 最后写入生效(教学简化:最后写入生效)
  - ④ 权限边界:非该职位发布者 HR → 403;candidate 角色 → 403
- **业务规则**:
  - ① 数据约束:status ∈ {待筛选, 已面试, 已录用, 已拒绝};next_stage ∈ {初筛, 技术面, HR面, 终面, offer, null}
  - ② 状态机:P0 不限制流转方向(如允许"已录用→已拒绝"的回退操作,教学简化,如 P1 实现则加约束)
  - ③ 可空外键:interview_note.next_stage 可为 NULL(HR 不填下一阶段时)
- **API 形态**:
  - `PUT /api/applications/{id}/status` → `Result<Void>`(更新状态+备注,body: status+content+nextStage)
  - `GET /api/applications/{id}/notes` → `Result<List<InterviewNote>>`(查询某申请的所有面试备注历史)
- **关联页面**: MyJobsPage(候选人列表 → 更新状态弹窗)

---

### P1-1 · 职位多条件搜索

- **实现优先级**: P1 应做
- **描述**: 支持按关键词(title 模糊)+ 状态(招聘中/停招)+ 薪资范围 + 发布时间 组合搜索职位
- **前置条件**: 登录
- **主流程**:
  1. 用户在搜索栏输入关键词/选择筛选条件 → 点击搜索
  2. 系统按条件组合查询 → 返回匹配结果(分页)
- **异常流程**:
  - ① 输入校验:搜索关键词为空 → 返回全部(等价于无筛选)
- **业务规则**:
  - ① 数据约束:关键词搜索 title 字段 LIKE %keyword%;状态筛选用 eq;薪资范围因 salary_text 为文本字段,搜索为 LIKE
  - ④ 教学简化:薪资范围搜索简单 LIKE,不做数值区间解析
- **API 形态**:
  - `GET /api/jobs?keyword=xxx&status=招聘中&pageNum=1&pageSize=10` → `Result<PageResult<JobPost>>`
- **关联页面**: JobSquarePage(搜索栏)

### P1-2 · 简历关键词搜索

- **实现优先级**: P1 应做
- **描述**: HR 在候选人列表中按简历关键词筛选(文件名或简历内容)
- **前置条件**: 登录角色为 hr/admin
- **主流程**:
  1. HR 在候选人列表输入关键词(如"Java"、"3年") → 搜索
  2. 系统模糊匹配 resume_url 文件名 → 返回匹配结果
- **异常流程**:
  - ① 输入校验:关键词为空 → 返回全部
- **业务规则**:
  - ④ 教学简化:仅匹配文件名,不做简历内容全文解析(全文解析为 P2 功能)
- **API 形态**:
  - `GET /api/applications?scope=jobId&jobId={id}&keyword=xxx` → `Result<PageResult<ApplicationVO>>`
- **关联页面**: MyJobsPage(候选人 Tab 内搜索)

### P1-3 · 状态流转约束

<!-- R-01-issue-7: 已修复 - 补充 P0→P1 状态机迁移方案:P0 已有逆序数据标记 legacy,P1 新变更严格执行正向约束 -->
<!-- R-01-issue-3: 已修复 - P1-3 移除重复的 history 接口声明,统一由 P1-8 提供 -->

- **实现优先级**: P1 应做
- **描述**: 对 P0-10 的状态流转增加合法性校验,禁止逆序操作(如已录用→待筛选)
- **前置条件**: P0-10 已实现基础状态更新
- **主流程**:
  1. HR 更新状态 → 系统检查当前状态 → 新状态的合法性
  2. 合法 → 执行更新;非法 → 拒绝
- **异常流程**:
  - ① P0 允许的逆序在本功能中变为拒绝 → BusinessException(1005,"不允许逆向流转")
  - ③ 并发:同 P0-10(最后写入生效)
- **业务规则**:
  - ② 状态机:合法流转 → 待筛选→已面试, 待筛选→已拒绝(直接筛掉), 已面试→已录用, 已面试→已拒绝;非法流转 → 已录用→任意, 已拒绝→任意
  - ④ P0→P1 迁移: P0 阶段已产生的逆序状态记录标记为 `legacy=true`(application_stage 表新增字段),P1 状态流转校验时跳过 legacy 记录;新产生的状态变更严格执行正向流转约束
- **API 形态**:
  - 复用 `PUT /api/applications/{id}/status` → `Result<Void>`(增加状态合法性校验逻辑)
- **关联页面**: MyJobsPage(候选人列表)

### P1-4 · 招聘漏斗

- **实现优先级**: P1 应做
- **描述**: HR 查看招聘漏斗图(ECharts),展示各状态候选人数量及转化率
- **前置条件**: 登录角色为 hr/admin
- **主流程**:
  1. HR 进入"招聘漏斗"页 → 选择统计范围(全部职位/单个职位)
  2. 系统按 status 分组统计 application 数量 → 渲染 ECharts 漏斗图
  3. 漏斗各层:待筛选 → 已面试 → 已录用(自上而下,宽度递减)
- **异常流程**:
  - ① 数据不存在:某状态数量为 0 → 漏斗该层显示 0,不报错
- **业务规则**:
  - ① 数据约束:统计范围为当前 HR 发布的职位下的投递;admin 可查看全量
- **API 形态**:
  - `GET /api/applications/funnel?jobId={id}` → `Result<FunnelData>`(漏斗数据,各 status 计数;不传 jobId 则统计该 HR 全部职位)
- **关联页面**: FunnelPage(招聘漏斗)

### P1-5 · 看板列视图

- **实现优先级**: P1 应做
- **描述**: 以四列卡片形式展示候选人分布(待筛选/已面试/已录用/已拒绝)
- **前置条件**: 登录角色为 hr/admin
- **主流程**:
  1. HR 进入看板视图 → 系统按 status 分组查询该 HR 职位下的所有投递
  2. 前端渲染四列(el-table 或自定义四列布局),每列顶部显示状态名+数量,下方为候选人卡片列表
- **异常流程**:
  - ① 数据不存在:某列无数据 → 显示"暂无候选人"
- **业务规则**:
  - ① 数据约束:候选人卡片含 candidate 姓名/投递时间/简历链接
- **API 形态**:
  - `GET /api/applications/kanban?hrId={hrId}` → `Result<KanbanData>`(按 status 分组的候选人列表)
- **关联页面**: KanbanPage(看板)

### P1-6 · 简历文件上传

- **实现优先级**: P1 应做
- **描述**: 完善简历上传功能,支持预览和重新上传
- **前置条件**: 登录角色为 candidate
- **主流程**:
  1. candidate 在投递时或"我的申请"中上传/更新简历文件
  2. 系统保存到 uploads/ → 更新 application.resume_url
- **异常流程**:
  - ① 输入校验:文件类型非 PDF/DOC/DOCX → 400;文件超过 10MB → 400
  - ① 文件安全:上传空文件 → 400
- **业务规则**:
  - ① 数据约束:文件限制类型 PDF/DOC/DOCX,≤10MB;存储路径 uploads/resume/{userId}/{timestamp}_{filename}
- **API 形态**:
  - `POST /api/files/upload` → `Result<String>`(上传,返回文件 URL)
  - `GET /api/files/{filename}` → 文件流(预览/下载)
- **关联页面**: JobDetailPage(投递时上传) / MyApplicationsPage(更新简历)

### P1-7 · 职位标签管理

- **实现优先级**: P1 应做
- **描述**: HR 为职位打标签(如"急聘"、"校招"、"社招"),方便候选人筛选
- **前置条件**: 登录角色为 hr/admin
- **主流程**:
  1. HR 发布/编辑职位时选择或创建标签
  2. 系统写入 job_tag 关联表(job_id + tag_name)
  3. 职位广场可按标签筛选
- **异常流程**:
  - ① 输入校验:标签名重复(同一职位下) → 忽略,不重复插入
  - ② 删除职位时 → 级联删除关联的 job_tag 记录
- **业务规则**:
  - ① 数据约束:tag_name 1-20 字符;标签为全局共享(如 tag_name="急聘"可被多个职位使用,但每个职位-标签对唯一)
- **API 形态**:
  - `POST /api/jobs/{id}/tags` → `Result<Void>`(添加标签,body: tagName)
  - `DELETE /api/jobs/{id}/tags/{tagId}` → `Result<Void>`(移除标签)
  - `GET /api/jobs?tag=急聘&pageNum=1` → `Result<PageResult<JobPost>>`(按标签筛选)
- **关联页面**: MyJobsPage(标签编辑) / JobSquarePage(标签筛选)

### P1-8 · 申请阶段历史记录

- **实现优先级**: P1 应做
- **描述**: 记录每次状态变更的历史轨迹(谁在什么时间把状态从 X 改为 Y)
- **前置条件**: P0-10 已实现状态更新
- **主流程**:
  1. HR 每次更新申请状态 → 系统自动写入 application_stage 表(app_id+from_status+to_status+operator_id+create_time)
  2. HR/候选人可查看某申请的状态变更历史时间线
- **异常流程**:
  - 无额外异常(写历史记录是附带操作,写入失败不影响状态更新主流程)
- **业务规则**:
  - ① 数据约束:from_status/to_status ∈ {待筛选, 已面试, 已录用, 已拒绝};首次创建时 from_status=NULL
- **API 形态**:
  - `GET /api/applications/{id}/history` → `Result<List<ApplicationStage>>`(状态变更历史)
- **关联页面**: MyJobsPage(候选人详情 → 状态历史时间线) / MyApplicationsPage(我的申请 → 查看进度)

---

### P2-1 · 看板拖拽改状态

<!-- R-01-issue-9: 已修复 - 补充批量 PATCH 返回每条结果数组,前端逐个处理 -->

- **实现优先级**: P2 可选
- **描述**: 在看板视图中,HR 通过拖拽卡片到不同列来修改候选人状态(vuedraggable)
- **前置条件**: P1-5 看板列视图已实现
- **主流程**:
  1. HR 在看板页面拖拽候选人卡片从"待筛选"列到"已面试"列
  2. 前端 vuedraggable 触发 change 事件 → 调用批量 PATCH 接口更新 status
  3. 后端校验状态合法性 → 批量更新 → 返回结果
- **异常流程**:
  - ② 防逆序:拖拽到非法列(如已录用→待筛选) → 后端拒绝 → 前端回弹卡片到原位
  - ③ 并发:批量 PATCH 逐条更新,返回每条结果数组 `[{id, success, message}]`,前端按结果逐个处理:成功更新 UI,失败回弹对应卡片
- **业务规则**:
  - ② 状态机:同 P1-3 合法流转规则
- **API 形态**:
  - `PATCH /api/applications/batch-status` → `Result<BatchStatusResult>`(批量更新,body: [{id, newStatus}])
- **关联页面**: KanbanPage(拖拽交互)

### P2-2 · 日历排面试

- **实现优先级**: P2 可选
- **描述**: HR 在日历视图上为候选人安排面试时间,与 interview_note 联动
- **前置条件**: P0-10 面试备注已实现
- **主流程**:
  1. HR 在候选人详情页点击"安排面试" → 打开日历选择日期时间
  2. 填写面试标题/地点 → 写入 interview 扩展字段(或新建 interview_schedule 表)
  3. 系统发送邮件通知候选人(模拟)
- **异常流程**:
  - ① 输入校验:面试时间在过去 → 400"面试时间不能在过去"
  - ③ 时间冲突:同一 HR 同一时段已有面试 → 提示冲突但仍允许(教学简化:不做严格冲突检测)
- **业务规则**:
  - ① 数据约束:interview_time DATETIME, interview_place VARCHAR(100)
  - ④ 教学简化:邮件通知为模拟(仅在日志中打印,不真实发送)
- **API 形态**:
  - `POST /api/interviews` → `Result<Void>`(安排面试,body: appId+interviewTime+place+title)
  - `GET /api/interviews?hrId={hrId}&startDate=xxx&endDate=xxx` → `Result<List<InterviewSchedule>>`(查询面试日历)
- **关联页面**: CalendarPage(面试日历)

### P2-3 · Offer PDF 模板

- **实现优先级**: P2 可选
- **描述**: HR 对「已录用」候选人生成 Offer PDF,含候选人信息+职位信息+薪资
- **前置条件**: application.status=已录用
- **主流程**:
  1. HR 在候选人列表点击"生成 Offer" → 预览 Offer 内容
  2. 确认后 → 后端生成 PDF(含候选人姓名/职位 title/薪资/入职日期占位)
  3. 返回 PDF 下载链接
- **异常流程**:
  - ① 关联实体:候选人状态非"已录用" → 400"仅已录用候选人可生成 Offer"
- **业务规则**:
  - ④ 教学简化:PDF 使用固定模板,入职日期、薪资等字段部分从 job_post 和 application 读取,部分为占位符(如"入职日期:____年____月____日")
- **API 形态**:
  - `POST /api/applications/{id}/offer` → `Result<String>`(生成 Offer,返回 PDF URL)
  - `GET /api/files/offer/{filename}` → PDF 文件流(下载)
- **关联页面**: MyJobsPage(候选人列表 → 生成 Offer 按钮)

### P2-4 · 简历解析去重

- **实现优先级**: P2 可选
- **描述**: 上传简历时自动提取关键词,并检测重复简历
- **前置条件**: P1-6 简历上传已实现
- **主流程**:
  1. candidate 上传简历 → 后端解析文件提取文本(教学简化:仅文件名+文件大小哈希)
  2. 对比已上传简历 → 相同文件哈希 → 提示"该简历已存在"
- **异常流程**:
  - ① 文件解析失败(如加密 PDF) → 跳过解析,正常上传(不阻断投递)
- **业务规则**:
  - ④ 教学简化:仅做文件哈希去重,不做内容级 NLP 解析;真实关键词提取需要调用 NLP 服务,本项目不做
- **API 形态**:
  - 复用 `POST /api/files/upload`(增加哈希去重逻辑,返回时附加 `duplicate: true/false`)
- **关联页面**: JobDetailPage(投递提示)

### P2-5 · 单元测试覆盖

- **实现优先级**: P2 可选
- **描述**: 为核心 Service 编写 JUnit 5 单元测试,覆盖 ≥ 4 个关键模块
- **前置条件**: Phase 4 后端编码已完成
- **主流程**:
  1. 为 UserService/JobService/ApplicationService/JwtUtils 编写测试类
  2. 正常场景 + 异常场景 + 边界值全覆盖
- **异常流程**:
  - 无
- **业务规则**:
  - ① 数据约束:测试覆盖率 ≥ 80%(Service 层);使用 H2 内存数据库隔离测试环境
- **API 形态**:
  - 无(测试阶段,不涉及 API)
- **关联页面**: 无

---

## 4. 非功能需求

<!-- R-01-issue-1: 已修复 - 新增统一错误码规范表,覆盖全局异常码+业务异常码段 1xxx/2xxx/3xxx/4xxx -->

| 维度 | 标准 |
|---|---|
| 响应时间 | < 3 秒(P95) |
| 浏览器 | Chrome / Edge 最新版 |
| 数据库 | MySQL 8.4 LTS |
| 并发 | ~20 人(60 人课堂分组测试上限) |
| API 响应包装 | 统一用 `Result<T>`(见 CLAUDE.md §一·三) |

### 4.1 统一错误码规范

| 码段 | 范围 | 说明 |
|---|---|---|
| 全局异常 | 400/401/403/404/500 | 参数校验/未登录/无权限/资源不存在/服务器错误 |
| 1xxx 用户模块 | 1001-1005 | 1001=用户名重复, 1002=密码错误, 1003=重复投递, 1004=token无效, 1005=非法的状态流转 |
| 2xxx 职位模块 | 2001-2003 | 2001=职位不存在, 2002=无权操作该职位, 2003=职位已下架 |
| 3xxx 投递模块 | 3001-3003 | 3001=已投递过该职位, 3002=投递不存在, 3003=简历文件无效 |
| 4xxx 面试模块 | 4001-4002 | 4001=无权更新状态, 4002=面试备注不能为空 |

---

## 5. 功能与页面映射表

| 功能编号 | 功能名 | 实现优先级 | 对应页面 |
|:---:|---|---|---|
| P0-1 | 用户注册 | P0 | LoginPage(注册 Tab) |
| P0-2 | 用户登录 | P0 | LoginPage(登录 Tab) |
| P0-3 | 职位公开列表 | P0 | JobSquarePage(职位广场) |
| P0-4 | 职位详情 | P0 | JobDetailPage(职位详情) |
| P0-5 | HR 发布职位 | P0 | MyJobsPage(发布按钮→弹窗) |
| P0-6 | HR 编辑职位 | P0 | MyJobsPage(编辑按钮→弹窗) |
| P0-7 | HR 下架职位 | P0 | MyJobsPage(下架按钮) |
| P0-8 | 投递简历 | P0 | JobDetailPage(投递按钮) |
| P0-9 | 申请列表查询 | P0 | MyApplicationsPage / MyJobsPage(候选人 Tab) |
| P0-10 | 更新申请状态+面试备注 | P0 | MyJobsPage(候选人列表→状态弹窗) |
| P1-1 | 职位多条件搜索 | P1 | JobSquarePage(搜索栏) |
| P1-2 | 简历关键词搜索 | P1 | MyJobsPage(候选人 Tab 内搜索) |
| P1-3 | 状态流转约束 | P1 | MyJobsPage(候选人列表) |
| P1-4 | 招聘漏斗 | P1 | FunnelPage(招聘漏斗) |
| P1-5 | 看板列视图 | P1 | KanbanPage(看板) |
| P1-6 | 简历文件上传 | P1 | JobDetailPage / MyApplicationsPage |
| P1-7 | 职位标签管理 | P1 | MyJobsPage / JobSquarePage(标签筛选) |
| P1-8 | 申请阶段历史记录 | P1 | MyJobsPage / MyApplicationsPage(时间线) |
| P2-1 | 看板拖拽改状态 | P2 | KanbanPage(拖拽交互) |
| P2-2 | 日历排面试 | P2 | CalendarPage(面试日历) |
| P2-3 | Offer PDF 模板 | P2 | MyJobsPage(生成 Offer 按钮) |
| P2-4 | 简历解析去重 | P2 | JobDetailPage(投递提示) |
| P2-5 | 单元测试覆盖 | P2 | (后端测试,无独立页面) |

---

## 6. 优先级调整说明

##### R-00 标定卡层调整

本选题 R-00 审核后无调整,与 `docs/00-选题标定.md` 原始标定一致。

##### R-01 SRS 层调整

本次 SRS 基于标定卡 §三/§四/§五 全量展开,功能编号 P0-1~P0-10 / P1-1~P1-8 / P2-1~P2-5 与标定卡一一对应,无额外增删。等待 R-01 /srs-reviewer 审核完成后可能产生调整记录。
