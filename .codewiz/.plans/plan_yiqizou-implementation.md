# 一起走 - 出行协作 Todo 小程序 实施计划

> 项目名称: 一起走  
> 项目类型: 微信小程序 + 云开发  
> 制定日期: 2026-07-13  
> 状态: 实施规划

---

## 1. 项目概述

"一起走"是一款微信小程序，用于解决朋友出行时的协作 Todo 管理问题。用户可以创建行程、邀请成员、维护共享 Todo 清单，并通过广场功能发布和复用模板。

**技术栈:**
- 前端: 微信小程序原生
- 后端: 微信云开发（云函数 + 云数据库）
- 登录: 微信登录（openId）
- 同步: 轮询 + 订阅消息（MVP 不含）

**MVP 范围:** 行程管理、Todo 协作、广场模板、轮询同步

---

## 2. 项目结构设计

### 2.1 前端目录结构

```
miniprogram/
├── app.js                          # 小程序入口
├── app.json                        # 小程序配置
├── app.wxss                        # 全局样式
├── pages/
│   ├── trips/                      # 行程相关页面
│   │   ├── list/
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   ├── create/
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   ├── detail/
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   └── invite/
│   │       ├── index.js
│   │       ├── index.json
│   │       ├── index.wxml
│   │       └── index.wxss
│   ├── square/                     # 广场相关页面
│   │   ├── index/
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   └── detail/
│   │       ├── index.js
│   │       ├── index.json
│   │       ├── index.wxml
│   │       └── index.wxss
│   ├── profile/                    # 个人页面
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── template-publish/           # 模板发布页面
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── components/                     # 可复用组件
│   ├── todo-item/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── trip-card/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── template-card/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   ├── add-todo-modal/
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   └── member-selector/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
├── utils/
│   ├── api.js                      # API 调用封装
│   ├── auth.js                     # 认证相关
│   ├── storage.js                  # 本地存储
│   ├── sync.js                     # 轮询同步逻辑
│   ├── date.js                     # 日期工具
│   └── constants.js                # 常量定义
└── styles/
    ├── variables.wxss              # 样式变量
    └── common.wxss                 # 通用样式
```

### 2.2 云开发目录结构

```
cloudfunctions/
├── login/                          # 登录云函数
│   ├── index.js
│   └── package.json
├── user/                           # 用户相关
│   ├── index.js
│   └── package.json
├── trip/                           # 行程相关
│   ├── index.js
│   └── package.json
├── todo/                           # Todo 相关
│   ├── index.js
│   └── package.json
├── template/                       # 模板相关
│   ├── index.js
│   └── package.json
├── like/                           # 点赞相关
│   ├── index.js
│   └── package.json
└── invite/                         # 邀请相关
    ├── index.js
    └── package.json
```

---

## 3. 分阶段实施计划

### 第一阶段: 基础架构搭建（第 1-2 周）

#### 3.1.1 项目初始化

**任务:**
1. 创建微信小程序项目结构
2. 配置 app.json（Tab 栏、页面路由、权限）
3. 初始化云开发环境
4. 配置云函数基础框架

**关键文件:**
- `app.json` - 配置 3 个 Tab（行程、广场、我的）
- `cloudfunctions/` - 初始化云函数目录

**输出:**
- 完整的项目目录结构
- 可运行的空白小程序

#### 3.1.2 用户认证系统

**任务:**
1. 实现微信登录流程（wx.login）
2. 创建 login 云函数，获取 openId
3. 创建/更新用户记录到云数据库
4. 实现本地 token 存储和自动登录

**关键文件:**
- `cloudfunctions/login/index.js` - 处理登录逻辑
- `utils/auth.js` - 前端认证工具
- `app.js` - 应用启动时自动登录

**数据库操作:**
- 创建 users 集合
- 字段: _id, openId, nickName, avatarUrl, createdAt

**输出:**
- 用户可自动登录
- 用户信息存储到云数据库

#### 3.1.3 基础 API 封装

**任务:**
1. 创建 API 调用统一接口
2. 实现云函数调用封装
3. 实现错误处理和重试机制
4. 实现请求拦截（自动添加 token）

**关键文件:**
- `utils/api.js` - API 调用封装

**输出:**
- 统一的 API 调用方式
- 完善的错误处理

---

### 第二阶段: 行程管理功能（第 3-4 周）

#### 3.2.1 行程 CRUD 操作

**任务:**
1. 创建行程列表页面（trips/list）
2. 创建行程创建页面（trips/create）
3. 实现行程详情页面（trips/detail）
4. 创建 trip 云函数处理 CRUD

**关键文件:**
- `pages/trips/list/index.js` - 行程列表逻辑
- `pages/trips/create/index.js` - 创建行程逻辑
- `pages/trips/detail/index.js` - 行程详情逻辑
- `cloudfunctions/trip/index.js` - 行程云函数
- `components/trip-card/` - 行程卡片组件

**数据库操作:**
- 创建 trips 集合
- 字段: _id, name, destination, startDate, endDate, creatorId, memberIds, inviteCode, status, createdAt, updatedAt

**功能:**
- 创建行程（填写名称、目的地、日期）
- 查询用户的行程列表
- 按"进行中"和"已结束"分组
- 更新行程信息
- 删除/归档行程

**输出:**
- 完整的行程管理功能
- 行程列表展示（分组显示）

#### 3.2.2 成员邀请系统

**任务:**
1. 生成邀请码（6 位随机码）
2. 创建邀请页面（trips/invite）
3. 实现邀请码扫描/输入加入
4. 实现小程序卡片分享

**关键文件:**
- `pages/trips/invite/index.js` - 邀请页面
- `cloudfunctions/invite/index.js` - 邀请处理云函数
- `utils/constants.js` - 邀请码生成逻辑

**功能:**
- 生成 6 位邀请码
- 生成二维码（包含邀请码）
- 分享小程序卡片
- 输入邀请码加入行程
- 扫码加入行程

**输出:**
- 完整的邀请系统
- 支持多种加入方式

#### 3.2.3 行程详情页面

**任务:**
1. 设计行程详情页布局
2. 显示行程信息和成员列表
3. 实现 Todo 列表展示
4. 实现筛选功能（全部/我的/未完成）

**关键文件:**
- `pages/trips/detail/index.js` - 详情页逻辑
- `pages/trips/detail/index.wxml` - 详情页模板

**功能:**
- 显示行程基本信息
- 显示成员头像列表
- 显示 Todo 清单
- 支持筛选（全部/我的/未完成）
- 底部操作栏（添加 Todo/用模板）

**输出:**
- 完整的行程详情页面

---

### 第三阶段: Todo 协作功能（第 5-6 周）

#### 3.3.1 Todo CRUD 操作

**任务:**
1. 创建 add-todo-modal 组件（底部弹窗）
2. 创建 member-selector 组件（成员选择）
3. 实现 todo 云函数
4. 实现 Todo 列表展示

**关键文件:**
- `components/add-todo-modal/` - 添加 Todo 弹窗
- `components/member-selector/` - 成员选择器
- `components/todo-item/` - Todo 项组件
- `cloudfunctions/todo/index.js` - Todo 云函数

**数据库操作:**
- 创建 todos 集合
- 字段: _id, tripId, content, assignType, assigneeIds, dueDate, note, completed, completedBy, completedAt, creatorId, createdAt

**功能:**
- 添加 Todo（内容、指派人、截止时间、备注）
- 编辑 Todo
- 删除 Todo（左滑删除）
- 完成 Todo（点击圆圈勾选）
- 查询 Todo 列表

**输出:**
- 完整的 Todo 管理功能
- 支持指派和截止时间

#### 3.3.2 Todo 指派和完成

**任务:**
1. 实现指派类型选择（所有人/指定人）
2. 实现成员多选
3. 实现 Todo 完成状态管理
4. 实现完成人和完成时间记录

**关键文件:**
- `components/add-todo-modal/index.js` - 指派逻辑
- `cloudfunctions/todo/index.js` - 完成状态更新

**功能:**
- 选择指派类型（所有人/指定人）
- 多选成员指派
- 点击圆圈完成 Todo
- 记录完成人和完成时间
- 已完成项显示删除线

**输出:**
- 完整的指派和完成功能

#### 3.3.3 Todo 筛选和搜索

**任务:**
1. 实现筛选 Tab（全部/我的/未完成）
2. 实现本地筛选逻辑
3. 实现 Todo 搜索功能

**关键文件:**
- `pages/trips/detail/index.js` - 筛选逻辑

**功能:**
- 全部 Todo
- 我的 Todo（指派给我的）
- 未完成 Todo
- 搜索 Todo 内容

**输出:**
- 完整的筛选功能

---

### 第四阶段: 数据同步（第 7 周）

#### 3.4.1 轮询同步机制

**任务:**
1. 实现轮询同步逻辑
2. 设置轮询间隔（10-30 秒）
3. 实现增量更新
4. 处理离线场景

**关键文件:**
- `utils/sync.js` - 轮询同步逻辑
- `pages/trips/detail/index.js` - 集成轮询

**功能:**
- 页面打开时启动轮询
- 每 10-30 秒拉取最新数据
- 自动更新 UI
- 页面关闭时停止轮询

**输出:**
- 完整的轮询同步机制

#### 3.4.2 本地缓存管理

**任务:**
1. 实现本地存储封装
2. 缓存行程和 Todo 数据
3. 实现缓存过期机制
4. 处理缓存一致性

**关键文件:**
- `utils/storage.js` - 本地存储工具

**功能:**
- 缓存行程数据
- 缓存 Todo 数据
- 缓存用户信息
- 自动过期清理

**输出:**
- 完整的缓存管理系统

---

### 第五阶段: 广场功能（第 8-9 周）

#### 3.5.1 模板浏览和搜索

**任务:**
1. 创建广场首页（square/index）
2. 实现模板列表展示
3. 实现标签筛选
4. 实现搜索功能

**关键文件:**
- `pages/square/index/index.js` - 广场首页逻辑
- `components/template-card/` - 模板卡片组件
- `cloudfunctions/template/index.js` - 模板云函数

**数据库操作:**
- 创建 templates 集合
- 字段: _id, name, tags, items, visibility, creatorId, likeCount, useCount, createdAt

**功能:**
- 显示公开模板列表
- 按标签筛选（海边、露营、滑雪、出国等）
- 搜索模板
- 显示点赞数和使用次数

**输出:**
- 完整的广场浏览功能

#### 3.5.2 模板详情和使用

**任务:**
1. 创建模板详情页（square/detail）
2. 实现一键使用功能
3. 实现 Todo 项复制逻辑
4. 实现点赞功能

**关键文件:**
- `pages/square/detail/index.js` - 模板详情逻辑
- `cloudfunctions/template/index.js` - 模板使用逻辑
- `cloudfunctions/like/index.js` - 点赞逻辑

**数据库操作:**
- 创建 likes 集合
- 字段: _id, templateId, userId, createdAt

**功能:**
- 显示模板详情
- 显示模板中的 Todo 项
- 一键使用（复制 Todo 到当前行程）
- 点赞/取消点赞
- 更新使用次数

**输出:**
- 完整的模板使用功能

#### 3.5.3 模板发布

**任务:**
1. 创建模板发布页面（template-publish）
2. 实现模板信息编辑
3. 实现可见度设置
4. 实现模板发布逻辑

**关键文件:**
- `pages/template-publish/index.js` - 发布页面逻辑
- `cloudfunctions/template/index.js` - 模板创建逻辑

**功能:**
- 选择行程
- 设置模板名称
- 选择标签
- 设置可见度（公开/链接可见/私有）
- 发布模板

**输出:**
- 完整的模板发布功能

---

### 第六阶段: 个人页面和完善（第 10 周）

#### 3.6.1 个人页面

**任务:**
1. 创建个人页面（profile）
2. 显示用户信息
3. 显示发布的模板列表
4. 实现设置入口

**关键文件:**
- `pages/profile/index.js` - 个人页面逻辑

**功能:**
- 显示头像和昵称
- 显示发布的模板列表
- 设置入口
- 退出登录

**输出:**
- 完整的个人页面

#### 3.6.2 功能完善和优化

**任务:**
1. 完善错误处理
2. 优化加载性能
3. 实现加载动画
4. 实现空状态提示
5. 完善交互反馈

**关键文件:**
- 全部页面和组件

**输出:**
- 完整的用户体验优化

#### 3.6.3 测试和调试

**任务:**
1. 功能测试
2. 性能测试
3. 兼容性测试
4. 云函数调试

**输出:**
- 完整的测试报告

---

## 4. 关键技术点

### 4.1 微信小程序特性

| 特性 | 实现方案 |
|------|--------|
| 登录 | wx.login + 云函数获取 openId |
| 分享 | wx.shareAppMessage 分享小程序卡片 |
| 二维码 | 云函数生成二维码，前端展示 |
| 订阅消息 | 预留接口，MVP 后接入 |
| 本地存储 | wx.setStorage / wx.getStorage |

### 4.2 云开发特性

| 特性 | 实现方案 |
|------|--------|
| 认证 | 云函数内获取 openId，无需额外认证 |
| 数据库 | 云数据库 NoSQL，支持实时监听 |
| 云函数 | Node.js 运行环境，支持 npm 包 |
| 存储 | 云存储用于头像等文件 |

### 4.3 数据同步

| 方案 | 说明 |
|------|------|
| 轮询 | 页面打开时每 10-30 秒拉取数据 |
| 本地缓存 | 减少网络请求，提升体验 |
| 增量更新 | 只更新变化的数据 |
| 离线支持 | 使用本地缓存，恢复连接后同步 |

---

## 5. 数据库设计详解

### 5.1 集合设计

#### users 集合
```javascript
{
  _id: "user_123",
  openId: "oXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  nickName: "张三",
  avatarUrl: "https://...",
  createdAt: new Date()
}
```

#### trips 集合
```javascript
{
  _id: "trip_123",
  name: "周末海边游",
  destination: "青岛",
  startDate: new Date("2026-07-20"),
  endDate: new Date("2026-07-22"),
  creatorId: "user_123",
  memberIds: ["user_123", "user_456"],
  inviteCode: "ABC123",
  status: "active", // active / archived
  createdAt: new Date(),
  updatedAt: new Date()
}
```

#### todos 集合
```javascript
{
  _id: "todo_123",
  tripId: "trip_123",
  content: "准备防晒霜",
  assignType: "specific", // all / specific
  assigneeIds: ["user_123"],
  dueDate: new Date("2026-07-19"),
  note: "SPF50+",
  completed: false,
  completedBy: null,
  completedAt: null,
  creatorId: "user_123",
  createdAt: new Date()
}
```

#### templates 集合
```javascript
{
  _id: "template_123",
  name: "海边出行必备清单",
  tags: ["海边", "夏季"],
  items: [
    { content: "防晒霜", assignType: "all" },
    { content: "泳衣", assignType: "specific", assigneeIds: [] }
  ],
  visibility: "public", // public / link / private
  creatorId: "user_123",
  likeCount: 10,
  useCount: 5,
  createdAt: new Date()
}
```

#### likes 集合
```javascript
{
  _id: "like_123",
  templateId: "template_123",
  userId: "user_123",
  createdAt: new Date()
}
```

### 5.2 索引设计

| 集合 | 索引字段 | 说明 |
|------|--------|------|
| trips | creatorId, memberIds | 查询用户的行程 |
| todos | tripId, assigneeIds | 查询行程的 Todo |
| templates | visibility, creatorId | 查询公开模板和用户模板 |
| likes | templateId, userId | 查询点赞记录 |

---

## 6. 云函数设计

### 6.1 login 云函数

**功能:** 处理用户登录，获取 openId，创建/更新用户记录

**输入:**
```javascript
{
  code: "code_from_wx_login"
}
```

**输出:**
```javascript
{
  success: true,
  userId: "user_123",
  token: "token_xxx"
}
```

### 6.2 trip 云函数

**功能:** 处理行程 CRUD 操作

**操作:**
- create: 创建行程
- read: 查询行程
- update: 更新行程
- delete: 删除行程
- list: 查询用户行程列表
- addMember: 添加成员
- removeMember: 移除成员

### 6.3 todo 云函数

**功能:** 处理 Todo CRUD 操作

**操作:**
- create: 创建 Todo
- read: 查询 Todo
- update: 更新 Todo
- delete: 删除 Todo
- list: 查询行程的 Todo 列表
- complete: 标记完成
- uncomplete: 取消完成

### 6.4 template 云函数

**功能:** 处理模板相关操作

**操作:**
- create: 发布模板
- read: 查询模板
- list: 查询模板列表（支持筛选和搜索）
- use: 使用模板（复制 Todo）
- delete: 删除模板

### 6.5 like 云函数

**功能:** 处理点赞操作

**操作:**
- like: 点赞
- unlike: 取消点赞
- getCount: 获取点赞数

### 6.6 invite 云函数

**功能:** 处理邀请相关操作

**操作:**
- generateCode: 生成邀请码
- joinByCode: 通过邀请码加入
- generateQRCode: 生成二维码

---

## 7. 前端页面详细设计

### 7.1 行程列表页 (trips/list)

**布局:**
- 顶部: 标题 + 右上角"+"按钮
- 中间: 分组列表（进行中/已结束）
- 卡片: 行程名称、日期、完成进度、成员头像

**交互:**
- 点击"+"创建新行程
- 点击卡片进入行程详情
- 长按卡片显示操作菜单（编辑/删除/归档）

### 7.2 创建行程页 (trips/create)

**表单:**
- 行程名称（必填）
- 目的地（可选）
- 出行日期（必填）
- 结束日期（可选）

**交互:**
- 填写完成后点击"创建"
- 创建成功后跳转到行程详情页

### 7.3 行程详情页 (trips/detail)

**布局:**
- 顶部: 行程信息（名称、日期、目的地）
- 成员列表: 显示所有成员头像
- 筛选 Tab: 全部/我的/未完成
- Todo 列表: 显示 Todo 项
- 底部操作栏: 添加 Todo / 用模板 / 邀请成员

**交互:**
- 点击成员头像显示成员信息
- 点击"添加 Todo"打开弹窗
- 点击"用模板"跳转到模板选择页
- 点击"邀请成员"显示邀请码和二维码
- 左滑 Todo 项显示删除按钮
- 点击 Todo 项圆圈完成/取消完成
- 点击 Todo 项内容编辑

### 7.4 添加 Todo 弹窗 (add-todo-modal)

**布局:**
- 底部半屏弹窗
- 内容输入框
- 指派人选择（所有人/指定人）
- 截止时间选择
- 备注输入框
- 确认/取消按钮

**交互:**
- 输入内容
- 选择指派类型
- 选择指派人（多选）
- 选择截止时间
- 输入备注
- 点击确认创建 Todo

### 7.5 广场首页 (square/index)

**布局:**
- 顶部: 搜索栏
- 标签筛选: 横向滚动标签列表
- 模板列表: 卡片列表展示

**交互:**
- 输入搜索关键词
- 点击标签筛选
- 点击模板卡片进入详情
- 下拉刷新
- 上拉加载更多

### 7.6 模板详情页 (square/detail)

**布局:**
- 顶部: 模板名称、创建者信息
- 中间: 模板 Todo 项列表
- 底部: 点赞按钮 + 一键使用按钮

**交互:**
- 点击点赞按钮点赞/取消点赞
- 点击"一键使用"复制 Todo 到当前行程
- 显示点赞数和使用次数

### 7.7 模板发布页 (template-publish)

**布局:**
- 行程选择
- 模板名称输入
- 标签选择（多选）
- 可见度选择（单选）
- 发布按钮

**交互:**
- 选择要发布的行程
- 输入模板名称
- 选择标签
- 选择可见度
- 点击发布

### 7.8 个人页面 (profile)

**布局:**
- 顶部: 头像、昵称
- 中间: 我发布的模板列表
- 底部: 设置、退出登录

**交互:**
- 点击模板卡片查看详情
- 点击设置进入设置页
- 点击退出登录

---

## 8. 组件设计

### 8.1 trip-card 组件

**属性:**
- trip: 行程对象
- onTap: 点击回调

**显示:**
- 行程名称
- 日期范围
- 完成进度（已完成/总数）
- 成员头像列表（最多显示 3 个）

### 8.2 todo-item 组件

**属性:**
- todo: Todo 对象
- members: 成员列表
- onComplete: 完成回调
- onEdit: 编辑回调
- onDelete: 删除回调

**显示:**
- 完成状态圆圈
- Todo 内容（完成时显示删除线）
- 指派人信息
- 截止时间（如有）

### 8.3 template-card 组件

**属性:**
- template: 模板对象
- onTap: 点击回调

**显示:**
- 模板名称
- 标签列表
- 点赞数
- 使用次数
- 创建者信息

### 8.4 add-todo-modal 组件

**属性:**
- tripId: 行程 ID
- members: 成员列表
- onConfirm: 确认回调
- onCancel: 取消回调

**功能:**
- 输入 Todo 内容
- 选择指派类型和指派人
- 选择截止时间
- 输入备注

### 8.5 member-selector 组件

**属性:**
- members: 成员列表
- selected: 已选成员 ID 列表
- onChange: 选择变化回调

**功能:**
- 显示成员列表
- 支持多选
- 显示选中状态

---

## 9. 工具函数设计

### 9.1 api.js - API 调用封装

```javascript
// 统一的云函数调用接口
export function callCloudFunction(name, data) {
  // 实现云函数调用
  // 自动添加 token
  // 处理错误
  // 实现重试
}

// 具体的 API 方法
export const api = {
  // 用户相关
  login: (code) => callCloudFunction('login', { code }),
  
  // 行程相关
  createTrip: (data) => callCloudFunction('trip', { action: 'create', ...data }),
  getTrip: (tripId) => callCloudFunction('trip', { action: 'read', tripId }),
  listTrips: () => callCloudFunction('trip', { action: 'list' }),
  updateTrip: (tripId, data) => callCloudFunction('trip', { action: 'update', tripId, ...data }),
  deleteTrip: (tripId) => callCloudFunction('trip', { action: 'delete', tripId }),
  
  // Todo 相关
  createTodo: (data) => callCloudFunction('todo', { action: 'create', ...data }),
  getTodo: (todoId) => callCloudFunction('todo', { action: 'read', todoId }),
  listTodos: (tripId) => callCloudFunction('todo', { action: 'list', tripId }),
  updateTodo: (todoId, data) => callCloudFunction('todo', { action: 'update', todoId, ...data }),
  deleteTodo: (todoId) => callCloudFunction('todo', { action: 'delete', todoId }),
  completeTodo: (todoId) => callCloudFunction('todo', { action: 'complete', todoId }),
  
  // 模板相关
  createTemplate: (data) => callCloudFunction('template', { action: 'create', ...data }),
  getTemplate: (templateId) => callCloudFunction('template', { action: 'read', templateId }),
  listTemplates: (query) => callCloudFunction('template', { action: 'list', ...query }),
  useTemplate: (templateId, tripId) => callCloudFunction('template', { action: 'use', templateId, tripId }),
  
  // 点赞相关
  likeTemplate: (templateId) => callCloudFunction('like', { action: 'like', templateId }),
  unlikeTemplate: (templateId) => callCloudFunction('like', { action: 'unlike', templateId }),
  
  // 邀请相关
  generateInviteCode: (tripId) => callCloudFunction('invite', { action: 'generateCode', tripId }),
  joinByCode: (code) => callCloudFunction('invite', { action: 'joinByCode', code })
};
```

### 9.2 auth.js - 认证工具

```javascript
// 自动登录
export async function autoLogin() {
  // 检查本地 token
  // 如果没有，调用 wx.login 获取 code
  // 调用 login 云函数获取 openId 和 token
  // 保存 token 到本地存储
}

// 获取当前用户 ID
export function getCurrentUserId() {
  // 从本地存储获取
}

// 检查是否已登录
export function isLoggedIn() {
  // 检查本地 token 是否存在
}

// 退出登录
export function logout() {
  // 清除本地 token
  // 清除用户信息
}
```

### 9.3 sync.js - 轮询同步

```javascript
// 启动轮询
export function startPolling(tripId, interval = 15000) {
  // 设置定时器
  // 每隔 interval 毫秒拉取一次数据
  // 更新本地数据
  // 触发 UI 更新
}

// 停止轮询
export function stopPolling() {
  // 清除定时器
}

// 手动同步
export async function syncData(tripId) {
  // 拉取最新数据
  // 更新本地缓存
  // 返回更新的数据
}
```

### 9.4 storage.js - 本地存储

```javascript
// 缓存行程数据
export function cacheTrip(trip) {
  // 保存到本地存储
}

// 获取缓存的行程
export function getCachedTrip(tripId) {
  // 从本地存储获取
}

// 缓存 Todo 列表
export function cacheTodos(tripId, todos) {
  // 保存到本地存储
}

// 获取缓存的 Todo 列表
export function getCachedTodos(tripId) {
  // 从本地存储获取
}

// 清除过期缓存
export function clearExpiredCache() {
  // 检查缓存时间
  // 删除过期缓存
}
```

### 9.5 date.js - 日期工具

```javascript
// 格式化日期
export function formatDate(date, format = 'YYYY-MM-DD') {
  // 实现日期格式化
}

// 计算日期差
export function dateDiff(date1, date2) {
  // 计算两个日期的差值
}

// 检查是否过期
export function isExpired(dueDate) {
  // 检查截止时间是否已过
}

// 获取相对时间
export function getRelativeTime(date) {
  // 返回"刚刚"、"1 小时前"等相对时间
}
```

### 9.6 constants.js - 常量定义

```javascript
// 标签列表
export const TEMPLATE_TAGS = ['海边', '露营', '滑雪', '出国', '自驾', '登山'];

// 可见度选项
export const VISIBILITY_OPTIONS = [
  { label: '公开', value: 'public' },
  { label: '链接可见', value: 'link' },
  { label: '私有', value: 'private' }
];

// 行程状态
export const TRIP_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
};

// Todo 指派类型
export const ASSIGN_TYPE = {
  ALL: 'all',
  SPECIFIC: 'specific'
};

// 轮询间隔（毫秒）
export const POLLING_INTERVAL = 15000; // 15 秒

// 缓存过期时间（毫秒）
export const CACHE_EXPIRY = 3600000; // 1 小时
```

---

## 10. 依赖关系和实施顺序

### 10.1 模块依赖关系

```
基础架构
├── 用户认证 (login)
│   └── API 封装 (api.js)
│       ├── 行程管理 (trip)
│       │   ├── 成员邀请 (invite)
│       │   └── 行程详情页
│       │       └── Todo 管理 (todo)
│       │           ├── Todo 列表展示
│       │           ├── 添加 Todo 弹窗
│       │           └── 数据同步 (sync.js)
│       ├── 广场功能 (template)
│       │   ├── 模板浏览
│       │   ├── 模板搜索和筛选
│       │   ├── 模板详情
│       │   ├── 点赞功能 (like)
│       │   └── 模板使用
│       └── 个人页面 (profile)
└── 本地存储 (storage.js)
```

### 10.2 实施顺序

1. **第 1-2 周: 基础架构**
   - 项目初始化
   - 用户认证系统
   - API 封装

2. **第 3-4 周: 行程管理**
   - 行程 CRUD
   - 成员邀请
   - 行程详情页

3. **第 5-6 周: Todo 协作**
   - Todo CRUD
   - 指派和完成
   - 筛选功能

4. **第 7 周: 数据同步**
   - 轮询同步
   - 本地缓存

5. **第 8-9 周: 广场功能**
   - 模板浏览和搜索
   - 模板详情和使用
   - 模板发布

6. **第 10 周: 完善**
   - 个人页面
   - 功能完善
   - 测试调试

---

## 11. 潜在挑战和解决方案

### 11.1 实时同步

**挑战:** 多用户同时编辑 Todo 时的数据一致性

**解决方案:**
- 使用轮询而非实时监听，降低复杂度
- 实现乐观更新，先更新 UI，后同步服务器
- 使用版本号或时间戳检测冲突
- 冲突时提示用户刷新

### 11.2 离线支持

**挑战:** 网络不稳定时的用户体验

**解决方案:**
- 使用本地缓存存储数据
- 离线时使用缓存数据
- 恢复连接后自动同步
- 提示用户当前是否为离线模式

### 11.3 性能优化

**挑战:** 大量 Todo 项时的列表性能

**解决方案:**
- 实现虚拟列表（只渲染可见项）
- 分页加载 Todo 项
- 使用 setData 时只更新变化的部分
- 优化图片加载（头像等）

### 11.4 云函数成本

**挑战:** 频繁的轮询可能导致云函数调用次数过多

**解决方案:**
- 合理设置轮询间隔（10-30 秒）
- 实现增量更新，减少数据传输
- 使用本地缓存减少不必要的请求
- 监控云函数调用次数

### 11.5 邀请码安全

**挑战:** 邀请码被滥用

**解决方案:**
- 邀请码设置过期时间（如 24 小时）
- 邀请码与行程绑定，不可跨行程使用
- 限制邀请码生成频率
- 记录邀请码使用日志

### 11.6 模板内容审核

**挑战:** 用户发布不当内容

**解决方案:**
- MVP 阶段不做自动审核
- 提供举报功能（后续迭代）
- 建立内容审核规则
- 违规内容下架处理

---

## 12. 测试计划

### 12.1 单元测试

- 工具函数测试（date.js, constants.js 等）
- 云函数逻辑测试
- 数据验证测试

### 12.2 集成测试

- 登录流程测试
- 行程创建和邀请流程
- Todo 创建、编辑、完成流程
- 模板发布和使用流程
- 数据同步测试

### 12.3 功能测试

- 所有页面的交互测试
- 所有操作的成功和失败场景
- 边界条件测试（空列表、长文本等）
- 权限控制测试

### 12.4 性能测试

- 列表加载性能
- 轮询同步性能
- 云函数响应时间
- 内存占用

### 12.5 兼容性测试

- 不同微信版本
- 不同手机型号
- 不同网络环境

---

## 13. 部署和发布

### 13.1 开发环境

- 本地开发
- 云开发环境配置
- 测试数据库

### 13.2 测试环境

- 云开发测试环境
- 测试用户账号
- 测试数据

### 13.3 生产环境

- 云开发生产环境
- 生产数据库备份
- 监控和告警

### 13.4 发布流程

1. 完成功能开发和测试
2. 代码审查
3. 部署到测试环境
4. 测试验证
5. 部署到生产环境
6. 提交微信小程序审核
7. 发布上线

---

## 14. 后续迭代计划

### 14.1 第二期功能

- 订阅消息通知
- 模板评论功能
- 行程聊天功能
- 费用 AA 分摊

### 14.2 优化方向

- 实时同步（WebSocket）
- 离线优先架构
- 性能优化
- 用户体验优化

---

## 15. 文件清单

### 15.1 前端文件

**页面文件:**
- pages/trips/list/index.{js,json,wxml,wxss}
- pages/trips/create/index.{js,json,wxml,wxss}
- pages/trips/detail/index.{js,json,wxml,wxss}
- pages/trips/invite/index.{js,json,wxml,wxss}
- pages/square/index/index.{js,json,wxml,wxss}
- pages/square/detail/index.{js,json,wxml,wxss}
- pages/profile/index.{js,json,wxml,wxss}
- pages/template-publish/index.{js,json,wxml,wxss}

**组件文件:**
- components/trip-card/index.{js,json,wxml,wxss}
- components/todo-item/index.{js,json,wxml,wxss}
- components/template-card/index.{js,json,wxml,wxss}
- components/add-todo-modal/index.{js,json,wxml,wxss}
- components/member-selector/index.{js,json,wxml,wxss}

**工具文件:**
- utils/api.js
- utils/auth.js
- utils/storage.js
- utils/sync.js
- utils/date.js
- utils/constants.js

**样式文件:**
- styles/variables.wxss
- styles/common.wxss

**配置文件:**
- app.js
- app.json
- app.wxss

### 15.2 云函数文件

- cloudfunctions/login/index.js
- cloudfunctions/user/index.js
- cloudfunctions/trip/index.js
- cloudfunctions/todo/index.js
- cloudfunctions/template/index.js
- cloudfunctions/like/index.js
- cloudfunctions/invite/index.js

### 15.3 文档文件

- docs/superpowers/specs/2026-07-13-yiqizou-design.md（设计文档）
- docs/implementation-plan.md（本实施计划）
- docs/api-documentation.md（API 文档）
- docs/database-schema.md（数据库设计文档）

---

## 16. 总结

本实施计划基于"一起走"设计文档，分为 6 个阶段，共 10 周完成 MVP 开发。

**关键特点:**
- 清晰的分阶段实施，每个阶段有明确的目标和交付物
- 详细的技术方案和架构设计
- 完整的数据库和云函数设计
- 全面的页面和组件设计
- 充分的风险识别和解决方案

**成功要素:**
- 严格按照实施顺序进行开发
- 及时进行功能测试和集成测试
- 保持代码质量和可维护性
- 与设计文档保持同步
- 定期进行进度评审

**预期成果:**
- 完整的微信小程序应用
- 完善的云开发后端
- 良好的用户体验
- 可扩展的架构设计

---

**计划制定日期:** 2026-07-13  
**计划版本:** 1.0  
**下一步:** 开始第一阶段 - 项目初始化和用户认证系统开发
