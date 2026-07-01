# 校园二手交易平台 — 项目标定卡

## 一、项目概述

| 项目 | 内容 |
|------|------|
| 项目名称 | 校园二手交易平台 |
| 英文名称 | Campus Second-hand Trading Platform |
| 开发工具 | 微信开发者工具 (WeChat DevTools) |
| 项目类型 | 微信小程序 + 后端服务 |
| 目标用户 | 在校大学生（同校或同城高校） |
| 项目定位 | 安全、便捷、校园专属的闲置物品交易平台 |

---

## 二、技术栈

| 层级 | 技术选型 |
|------|----------|
| 前端框架 | 微信小程序原生 (WXML + WXSS + JavaScript/TypeScript) |
| 后端服务 | Taro / uni-app（跨端备选）/ Node.js + Express/Koa |
| 数据库 | MySQL（关系型）+ Redis（缓存） |
| 存储 | 微信云存储 / 阿里云OSS / 腾讯云COS |
| 部署 | 微信云托管 / 云服务器 |
| 即时通讯 | 微信云开发 WebSocket / 环信 / 融云 |

> 推荐方案：微信云开发（云数据库 + 云函数 + 云存储），无需自建后端，适合毕设快速落地。

---

## 三、项目架构

```
campus-second-hand/
├── client/                        # 微信小程序前端
│   ├── pages/                     # 页面
│   │   ├── index/                 # 首页（商品推荐流）
│   │   ├── category/             # 分类页
│   │   ├── search/               # 搜索页
│   │   ├── goods/                # 商品详情
│   │   ├── publish/             # 发布商品
│   │   ├── user/                 # 个人中心
│   │   ├── chat/                 # 聊天列表
│   │   ├── chat-detail/         # 聊天详情
│   │   ├── favorite/            # 收藏夹
│   │   └── my-goods/            # 我的发布
│   ├── components/                # 公共组件
│   ├── utils/                     # 工具函数
│   ├── api/                       # 接口封装
│   ├── store/                     # 全局状态管理
│   ├── app.js / app.json / app.wxss
│   └── project.config.json
│
├── server/                        # 后端服务（如不使用云开发）
│   ├── routes/                    # 路由
│   ├── controllers/               # 控制器
│   ├── models/                    # 数据模型
│   ├── middleware/                # 中间件
│   ├── utils/                     # 工具
│   └── app.js                     # 入口
│
├── docs/                          # 文档
└── README.md
```

---

## 四、功能模块（按优先级划分）

> **P0** = 核心链路，必须完成
> **P1** = 重要功能，建议完成
> **P2** = 锦上添花，有余力再做

---

### P0（核心链路，必须完成）

#### 1. 用户模块
- [ ] 微信授权一键登录（wx.login → openid → 自动注册）
- [ ] 个人中心页面（头像、昵称、信用分展示）
- [ ] 用户信息编辑（昵称、学校、校区、联系方式）

#### 2. 商品模块
- [ ] 商品发布（拍照/相册、标题、描述、价格、分类、成色、校区）
- [ ] 商品列表首页（按发布时间倒序，分页加载10条/次）
- [ ] 商品详情页（图片轮播、价格、描述、卖家信息）
- [ ] 商品状态管理（在售 / 已售出 / 下架）

#### 3. 互动模块
- [ ] 私信聊天（消息写入messages表，前端每5秒轮询拉取）
- [ ] 会话列表（按最后消息时间排序，未读红点提示）
- [ ] 商品卡片消息（从详情页发起聊天自动携带商品信息）

#### 4. 交易模块
- [ ] "我想要"按钮 → 跳转聊天并发送商品卡片
- [ ] 卖家标记已售出
- [ ] 交易互评（1-5星评分 + 文字评价）
- [ ] 信用分动态计算

---

### P1（重要功能，建议完成）

#### 1. 用户模块
- [ ] 我的发布（查看/编辑/下架自己发布的商品）
- [ ] 我的收藏（收藏列表查看/取消收藏）
- [ ] 学号认证（登记学号姓名，完善身份信息）

#### 2. 商品模块
- [ ] 商品搜索（关键词匹配标题+描述）
- [ ] 分类筛选 + 价格区间筛选 + 校区筛选
- [ ] 商品列表排序切换（最新 / 最热）
- [ ] 分类页（从数据库读分类列表，点击进对应商品列表）

#### 3. 互动与交易
- [ ] 收藏/取消收藏（商品详情页心形按钮）
- [ ] 我的足迹（浏览历史记录）
- [ ] 卖家信用分在个人主页展示
- [ ] 商品分享给微信好友/群

#### 4. 体验优化
- [ ] 下拉刷新页面
- [ ] 图片懒加载
- [ ] 空状态引导页（无商品/无消息/无收藏时）

---

### P2（锦上添花，有余力再做）

- [ ] 商品举报 / 投诉
- [ ] 管理员后台（商品审核、用户管理、数据统计）
- [ ] 消息已读/未读详情
- [ ] 图片消息支持
- [ ] 商品重新上架
- [ ] 热门搜索 / 搜索历史
- [ ] 首页轮播 Banner（运营位）
- [ ] 毕业季专区 / 批量处理闲置

---

## 五、核心数据流

### 5.1 用户登录流程
```
用户打开小程序
  → 调用 wx.login() 获取 code
  → 云函数 login：code 换 openid
  → 查 users 表是否有此 openid
     ├─ 有 → 返回用户信息
     └─ 无 → users.add() 创建新用户 → 返回用户信息
  → 前端存储 openid 到全局变量 / 缓存
  → 跳转首页
```

### 5.2 商品发布流程
```
用户填写发布表单（标题/价格/分类/成色/描述/校区）
  → 选择图片（1-9张）
     └─ wx.chooseImage() → 逐张调云存储 uploadFile → 返回 fileID 列表
  → 点击"发布"
     └─ 云函数 createGoods：校验必填项 → goods.add() 写入数据库
  → 发布成功 → 跳转商品详情页
```

### 5.3 商品浏览与搜索流程
```
用户进入首页
  → 云函数 getGoodsList({ status:1, page:1, pageSize:10 })
  → goods 表查询 where status=1，orderBy create_time desc，skip(0).limit(10)
  → 返回商品列表 → 前端渲染瀑布流
  → 用户下拉 → page+1 → 再次调云函数，skip(10).limit(10) → 追加渲染

用户搜索：
  → 输入关键词 + 选择筛选条件（分类/价格区间/校区）
  → 云函数 searchGoods({ keyword, category, priceMin, priceMax, campus, sort })
  → goods 表组合查询：
     where status=1
     .where({ title: db.RegExp(keyword) })
     .where({ category, campus, price: {$gte:min, $lte:max} })
     .orderBy(sort)
  → 返回结果列表
```

### 5.4 私信聊天流程
```
买家在商品详情页点击"我想要"
  → 前端判断是否已有该买家+卖家+商品的会话
     ├─ 有 → 跳转已有聊天页
     └─ 无 → 自动创建会话，发送商品卡片消息

消息发送（买家/卖家）：
  → 输入文字/选择图片
  → 云函数 sendMessage：
     messages.add({ from_id, to_id, goods_id, content, type, is_read:false, create_time })
  → 前端消息列表即时追加（乐观更新）

消息接收（轮询）：
  → 前端 setInterval(5000) 调云函数 getNewMessages({ userId, lastTime })
  → 云函数查 messages 表：
     where to_id=userId && create_time > lastTime
     .orderBy(create_time asc)
  → 返回新消息列表 → 前端追加到聊天页 / 更新会话列表未读数
```

### 5.5 交易与评价流程
```
买家与卖家沟通达成一致
  → 卖家在"我的发布"中点击"标记已售"
  → 云函数 markAsSold：goods 表更新 status=2
  → 商品详情页显示"已售出"标签，不再出现在首页列表

交易完成后：
  → 系统向双方推送评价入口
  → 用户提交评价（1-5星 + 文字）
  → 云函数 submitReview：
     reviews.add({ from_id, to_id, goods_id, rating, content })
     → 计算卖家新信用分：
        avg = 该卖家所有评价 rating 的平均值 * 20（折算为百分制）
        users表更新 credit_score = avg
  → 评价和信用分在卖家个人主页展示
```

---

## 六、数据库设计

### 5.1 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT/VARCHAR | 主键 |
| openid | VARCHAR | 微信openid |
| nickname | VARCHAR | 昵称 |
| avatar | VARCHAR | 头像URL |
| school | VARCHAR | 学校 |
| campus | VARCHAR | 校区 |
| phone | VARCHAR | 联系方式 |
| credit_score | INT | 信用分 |
| create_time | DATETIME | 注册时间 |

### 5.2 商品表 (goods)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT/VARCHAR | 主键 |
| user_id | INT | 卖家ID |
| title | VARCHAR | 标题 |
| description | TEXT | 描述 |
| price | DECIMAL | 售价 |
| original_price | DECIMAL | 原价 |
| category_id | INT | 分类 |
| condition | TINYINT | 成色（1-全新 2-几乎全新 3-良好 4-一般） |
| images | JSON | 图片列表 |
| status | TINYINT | 状态（1-在售 2-已售 3-下架） |
| campus | VARCHAR | 所在校区 |
| view_count | INT | 浏览次数 |
| like_count | INT | 收藏数 |
| create_time | DATETIME | 发布时间 |
| update_time | DATETIME | 更新时间 |

### 5.3 分类表 (categories)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| name | VARCHAR | 分类名称 |
| icon | VARCHAR | 图标 |
| sort | INT | 排序 |

### 5.4 收藏表 (favorites)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| user_id | INT | 用户ID |
| goods_id | INT | 商品ID |
| create_time | DATETIME | 收藏时间 |

### 5.5 消息表 (messages)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| from_id | INT | 发送者 |
| to_id | INT | 接收者 |
| goods_id | INT | 关联商品 |
| content | TEXT | 消息内容 |
| type | TINYINT | 类型（1-文本 2-图片 3-系统） |
| is_read | TINYINT | 是否已读 |
| create_time | DATETIME | 发送时间 |

### 5.6 评价表 (reviews)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键 |
| order_id | INT | 关联交易 |
| from_id | INT | 评价者 |
| to_id | INT | 被评价者 |
| rating | TINYINT | 评分 1-5 |
| content | TEXT | 评价内容 |
| create_time | DATETIME | 评价时间 |

---

## 六、页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| pages/index/index | 首页 | 推荐商品流、分类入口、搜索入口 |
| pages/category/category | 分类页 | 按分类浏览 |
| pages/search/search | 搜索页 | 关键词 + 筛选 |
| pages/goods/detail | 商品详情 | 图片、信息、卖家、互动 |
| pages/publish/publish | 发布商品 | 表单 + 图片上传 |
| pages/user/user | 个人中心 | 个人信息、功能入口 |
| pages/chat/chat | 消息列表 | 会话列表 |
| pages/chat/detail | 聊天详情 | 即时通讯 |
| pages/favorite/favorite | 收藏夹 | 收藏的商品 |
| pages/my-goods/my-goods | 我的发布 | 管理已发布商品 |
| pages/history/history | 浏览记录 | 足迹 |
| pages/review/review | 评价页面 | 交易评价 |

---

## 七、开发计划

### Phase 1 — 基础搭建（1-2 周）
- 微信小程序项目初始化
- 底部 Tab 导航（首页、分类/发布、消息、我的）
- 全局状态管理搭建
- 云开发环境初始化 / 后端项目搭建

### Phase 2 — 用户与商品（2-3 周）
- 微信登录流程
- 商品发布页面
- 商品列表与详情（数据渲染）
- 商品搜索与分类筛选

### Phase 3 — 互动与消息（2 周）
- 收藏功能
- 私信聊天（云开发 WebSocket / IM SDK）
- 留言功能

### Phase 4 — 交易闭环（1-2 周）
- "想要" → 联系卖家流程
- 交易标记
- 评价功能

### Phase 5 — 收尾（1 周）
- 性能优化
- 体验优化（加载态、空态、错误处理）
- 论文素材整理
- 部署上线

---

## 八、关键设计决策

1. **登录方式**：微信静默授权 + 手机号绑定，降低用户流失
2. **交易流程**：平台只做信息撮合，不介入资金交易（降低毕设复杂度），支持站内私信议价
3. **信用体系**：基于校内实名 + 交易评价构建基础信用
4. **推荐策略**：按最新发布 + 同校优先排序，未来可引入协同过滤
5. **图片安全**：接入微信内容安全检测接口，过滤违规图片

---

## 九、扩展方向（论文加分项）

- 基于协同过滤/标签的个性化推荐
- LBS 附近二手物品（基于校区位置）
- 拍卖模式（竞价）
- 以物换物
- 毕业季专区（批量处理闲置）
- 管理员 Web 管理后台（React/Vue）

---

*文档版本：v0.1 | 最后更新：2026-06-16*
