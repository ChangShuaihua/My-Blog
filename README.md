# Shuaihua's Web

基于 **Next.js 16** + **React 19** + **TypeScript** + **Tailwind CSS 4** 构建的个人网站，集个人介绍、博客知识库、作品展示、实时留言室于一体。

> 🚀 在线访问：[my-blog-two-red.vercel.app](https://my-blog-two-red.vercel.app/)

[![Deploy Next.js Blog to GitHub Pages](https://github.com/ChangShuaihua/My-Blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/ChangShuaihua/My-Blog/actions/workflows/deploy.yml)

---

## 📋 目录

- [功能概览](#-功能概览)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [可用脚本](#-可用脚本)
- [页面路由](#-页面路由)
- [API 接口](#-api-接口)
- [数据库](#-数据库)
- [部署](#-部署)
- [CSDN 博客迁移](#-csdn-博客迁移)

---

## ✨ 功能概览

### 🏠 首页
- 打字机动画自我介绍
- 暗色/亮色主题切换（跟随系统偏好）
- 兴趣标签：点击弹出图片查看器、音乐播放器、视频播放器，支持弹幕效果
- 社交链接：GitHub、QQ、微信（展示二维码弹窗）
- GitHub 年度贡献热力图
- 个人经历时间线
- 导航卡片：作品集 / 文章 / 留言室

### 📝 博客
- **32 篇技术文章**，涵盖 JavaScript、Vue、React、TypeScript 等前端知识
- 文章按分类筛选（CSDN迁移、技术分享会、阶段学习笔记、随笔碎碎念）
- 全文搜索（标题、描述、标签）
- Markdown 渲染：代码高亮、表格、列表、引用块、图片、链接
- 文章详情页含目录导航，滚动自动高亮当前章节
- 博客统计面板：总文章数、分类分布、目录结构树
- 移动端适配响应式布局

### 💼 作品集
- 全屏滚动吸附（Scroll Snap）式项目展示
- 项目详情抽屉（技术栈、特性、功能截图/视频）
- 图片点击放大查看
- 导航指示器

### 💬 留言室
- 多房间实时聊天
- 昵称设置（持久化到 localStorage）
- 不文明词汇过滤 + 昵称验证
- 消息发送防抖
- 移动端侧边栏抽屉
- 骨架屏加载状态

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/) (Pages Router + Turbopack) |
| UI 库 | [React 19](https://react.dev/) |
| 语言 | [TypeScript](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS 4](https://tailwindcss.com/) |
| 数据库 | [PostgreSQL](https://www.postgresql.org/) (Neon) + [Prisma ORM](https://www.prisma.io/) |
| 实时通信 | [Pusher](https://pusher.com/) |
| Markdown | [gray-matter](https://github.com/jonschlinkert/gray-matter) (解析 frontmatter) |
| 日期处理 | [dayjs](https://day.js.org/) |
| 包管理器 | [pnpm](https://pnpm.io/) |
| 部署 | GitHub Pages + Vercel |

---

## 📁 项目结构

```
template-web-main/
├── .github/workflows/         # GitHub Actions CI/CD
│   └── deploy.yml             # 部署到 GitHub Pages
├── prisma/
│   └── schema.prisma          # 数据库模型定义
├── public/                    # 静态资源
│   ├── images/                # 图片资源
│   ├── svgs/                  # SVG 图标
│   ├── blogimage/             # 博客文章图片
│   └── ci/                    # CI 相关资源
├── scripts/
│   ├── generate-count.js      # 博客统计文件生成脚本
│   └── watch-blogs.js         # 监听博客目录变化，自动更新统计
├── src/
│   ├── blogs/                 # 📝 博客文章 (Markdown)
│   │   ├── csdn/              #   CSDN 迁移文章 (20篇)
│   │   ├── 技术分享会/         #   技术分享笔记 (3篇)
│   │   ├── 阶段学习笔记/       #   学习笔记 (7篇)
│   │   └── 随笔，碎碎念/       #   随笔 (2篇)
│   ├── components/            # 可复用组件
│   │   ├── DanmakuComponent   # 弹幕组件
│   │   ├── GitHubHeatmap      # GitHub 贡献热力图
│   │   ├── ImageModal         # 图片查看弹窗
│   │   ├── MusicModal         # 音乐播放弹窗
│   │   ├── VideoModal         # 视频播放弹窗
│   │   ├── CommentModal       # 评论弹窗
│   │   ├── LoadingAnimation   # 加载动画
│   │   ├── SvgIcon            # SVG 图标组件
│   │   └── ThemeToggle        # 主题切换按钮
│   ├── contexts/
│   │   └── ThemeContext.tsx    # 主题上下文 (亮/暗)
│   ├── data/
│   │   ├── tagConfigs.ts      # 兴趣标签弹窗配置
│   │   ├── works.ts           # 作品集数据
│   │   └── experience.ts      # 个人经历数据
│   ├── lib/
│   │   ├── prisma.ts          # Prisma 单例客户端
│   │   └── pusher.ts          # Pusher 实例
│   ├── pages/
│   │   ├── _app.tsx           # 应用入口 (主题、布局、加载动画)
│   │   ├── _document.tsx      # HTML 文档结构
│   │   ├── index.tsx          # 🏠 首页
│   │   ├── blog.tsx           # 📝 博客页
│   │   ├── works.tsx          # 💼 作品集页
│   │   ├── chat.tsx           # 💬 留言室页
│   │   └── api/               # API 路由
│   │       ├── blogs.ts       #   获取博客列表
│   │       ├── blog-stats.ts  #   获取博客统计
│   │       ├── comments.ts    #   评论接口 (已注释)
│   │       ├── reactions.ts   #   点赞接口 (已注释)
│   │       ├── chat/          #   聊天相关接口
│   │       └── pusher/        #   Pusher 认证
│   └── utils/
│       └── contentFilter.ts   # 不良内容过滤器
├── csdn-md.js                 # CSDN 博客爬取迁移工具
├── next.config.ts             # Next.js 配置
├── tailwind.config.ts         # Tailwind 配置
├── tsconfig.json              # TypeScript 配置
├── vercel.json                # Vercel 部署配置
└── package.json               # 项目依赖与脚本
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 20
- **pnpm** >= 9（推荐，也可使用 npm/yarn）

### 安装与运行

```bash
# 1. 克隆项目
git clone https://github.com/ChangShuaihua/My-Blog.git
cd My-Blog/template-web-main

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
# 编辑 .env 文件，填入你的数据库连接和 Pusher 配置
cp .env.example .env  # 如果有示例文件

# 4. 初始化数据库（需要 PostgreSQL）
npx prisma db push
npx prisma generate

# 5. 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看效果。

### 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 (Neon 推荐) | 聊天/评论功能需要 |
| `DIRECT_URL` | 直连数据库 URL | 推荐 |
| `PUSHER_APP_ID` | Pusher 应用 ID | 实时聊天需要 |
| `PUSHER_KEY` | Pusher 密钥 | 实时聊天需要 |
| `PUSHER_SECRET` | Pusher 密钥 | 实时聊天需要 |
| `PUSHER_CLUSTER` | Pusher 集群 (如 `mt1`) | 实时聊天需要 |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher 公钥 (客户端) | 实时聊天需要 |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher 集群 (客户端) | 实时聊天需要 |

---

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (Turbopack) |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint 检查 |
| `pnpm count` | 生成博客统计文件 `src/blogs/count.md` |
| `pnpm watch-blogs` | 监听博客目录变化，自动更新统计 |
| `pnpm push-db` | 推送 Prisma schema 到数据库 |
| `pnpm generate` | 生成 Prisma 客户端 |
| `pnpm deploy` | 构建并部署到 GitHub Pages |

---

## 🗺 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 个人介绍、标签互动、导航入口 |
| `/blog` | 博客 | 文章列表、分类筛选、搜索、Markdown 阅读 |
| `/works` | 作品集 | 全屏滚动项目展示、详情抽屉 |
| `/chat` | 留言室 | 多房间实时聊天 |

---

## 🔌 API 接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/blogs` | GET | 获取所有博客文章（含分类、标签、描述） |
| `/api/blog-stats` | GET | 获取博客统计信息（文章数、分类分布、目录树） |
| `/api/chat/rooms` | GET/POST | 聊天室管理 |
| `/api/chat/messages` | GET/POST | 聊天消息收发 |
| `/api/pusher/auth` | POST | Pusher 实时通信认证 |
| `/api/comments` | GET/POST | 评论系统（当前已注释） |
| `/api/reactions` | GET/POST | 点赞系统（当前已注释） |

---

## 🗄 数据库

项目使用 **Prisma ORM** + **PostgreSQL**。主要模型：

### ChatRoom（聊天室）
```prisma
model ChatRoom {
  id          String    @id @default(cuid())
  name        String
  description String?
  isPrivate   Boolean   @default(false)
  messages    Message[]
}
```

### Message（消息）
```prisma
model Message {
  id        String   @id @default(cuid())
  content   String
  userId    String
  userName  String
  roomId    String
  room      ChatRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)
}
```

### 初始化数据库

```bash
npx prisma db push      # 同步 schema 到数据库
npx prisma generate     # 生成 Prisma 客户端
npx prisma studio       # 打开 Prisma 数据管理界面
```

---

## 🚢 部署

### Vercel（推荐）

项目已配置 `vercel.json`，可直接导入 Vercel：

```bash
vercel --prod
```

### GitHub Pages

推送代码到 `main` 分支后，GitHub Actions 自动构建并部署到 GitHub Pages。

配置文件：`.github/workflows/deploy.yml`

> **注意**：GitHub Pages 部署需要设置 `NEXT_PUBLIC_BASE_PATH` 环境变量，在 Action 中已自动配置。

---

## 📥 CSDN 博客迁移

项目包含一个 CSDN 博客爬取迁移工具 `csdn-md.js`，可将 CSDN 博客文章批量下载并转换为 Markdown 格式保存到 `src/blogs/csdn/` 目录。

### 使用方法

1. 编辑 `csdn-md.js` 中的配置：
   ```js
   const BASE_URL = 'https://blog.csdn.net/your_username?type=blog'
   const OUTPUT_DIR = 'path/to/output'
   ```

2. 运行迁移脚本：
   ```bash
   node csdn-md.js
   ```

### 转换特性
- HTML 内容 → Markdown（Turndown）
- 自动提取标题、日期、标签到 frontmatter
- 下载文章图片到本地 `images/` 子目录
- 生成 `index.md` 格式，与博客系统完全兼容

---

## 📝 博客文章管理

### 添加新文章

在 `src/blogs/` 对应分类目录下创建 `.md` 文件：

```markdown
---
title: 文章标题
published: 2026-06-11
description: 文章简述
tags: [Vue, 前端]
category: 技术分享会
---

## 正文内容...
```

### 文章分类

- **`category`** (frontmatter)：用于博客页面的分类筛选，优先使用
- **目录路径**：作为子分类展示，提供更细粒度的位置信息
- 如果没有在 frontmatter 中指定 `category`，系统会自动使用目录路径作为分类

### 自动统计

```bash
# 手动生成统计
pnpm count

# 自动监听文件变化生成统计
pnpm watch-blogs
```

统计文件 `src/blogs/count.md` 会根据文章变化自动更新。

---

## 🎨 主题系统

项目支持亮色/暗色两种主题：

- 首次加载跟随系统偏好
- 手动切换后持久化到 `localStorage`
- 右上角固定主题切换按钮
- 不同主题对应不同的背景图片

---

## 📄 许可证

[MIT](LICENSE) © [ChangShuaihua](https://github.com/ChangShuaihua)

---

🤖 *Generated with [Claude Code](https://claude.com/claude-code)*
