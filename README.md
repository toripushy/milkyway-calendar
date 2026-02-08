# MilkyWay Calendar 🧋

奶茶饮用记录网页应用 — 以日历为核心交互界面，实现"饮品生活数字化"。

## 项目概述

MilkyWay Calendar 是一个基于 React + TypeScript + Vite 的全栈应用，支持 AI 智能识别奶茶照片、自动提取商品信息和热量数据，在日历上展示个性化图标，方便回顾自己的饮品消费记录。

## 技术栈

| 维度 | 技术方案 | 版本/说明 |
| --- | --- | --- |
| **前端框架** | React + TypeScript | React 19, TS 5.9 |
| **构建工具** | Vite | 7.3 |
| **后端服务** | Node.js + Express | Node 20 |
| **数据库** | SQLite (sql.js) | 纯 JS 实现 |
| **AI 识别** | 通义千问 VL (qwen-vl-max) | 阿里云 |
| **日期处理** | Day.js | 1.11 |
| **图标库** | Lucide React | 0.563 |
| **部署方式** | Docker Compose | Nginx + Node.js |

## 项目结构

```
milkyway-calendar/
├── src/                        # 前端源码
│   ├── App.tsx                 # 主应用组件
│   ├── main.tsx                # 应用入口
│   ├── index.css               # 全局样式（抹茶绿+咖啡色主题）
│   ├── components/
│   │   ├── Calendar.tsx        # 日历组件（显示商品名+热量）
│   │   ├── UploadModal.tsx     # 上传弹窗（AI OCR 识别）
│   │   ├── DetailModal.tsx     # 详情弹窗
│   │   └── TeaIcon.tsx         # 茶饮图标组件
│   ├── hooks/
│   │   └── useRecords.ts       # 数据管理 Hook（支持 API 同步）
│   ├── utils/
│   │   ├── storage.ts          # 存储工具（localStorage + API）
│   │   └── calorieMatch.ts     # 本地热量匹配
│   ├── services/
│   │   └── qwenVL.ts           # 通义千问 AI 识别服务
│   ├── data/
│   │   └── calorieDB.json      # 本地热量数据库
│   └── types/
│       └── record.ts           # TypeScript 类型定义
├── server/                     # 后端服务
│   ├── index.js                # Express API 服务
│   ├── package.json            # 后端依赖
│   └── Dockerfile              # 后端镜像
├── docker-compose.yml          # Docker 编排
├── Dockerfile                  # 前端镜像
├── nginx.conf                  # Nginx 配置（含 API 代理）
└── .env                        # 环境变量（API Key，不提交）
```

## 核心功能

### 1. AI 智能识别 (OCR)

- **自动识别**：上传奶茶照片，AI 自动识别文字信息
- **信息提取**：
  - 品牌名（喜茶、奈雪、瑞幸等）
  - 商品名称
  - 配料信息（珍珠、椰果等）
  - 糖度/冰度
  - 价格
  - 店铺名称
- **热量搜索**：AI 联网搜索真实热量数据（小红书、官网等）
- **智能图标**：根据识别结果自动选择对应图标

### 2. 交互日历界面

- **月视图切换**：支持左右切换月份
- **信息展示**：
  - 已打卡日期显示饮品图标
  - 图标下方显示商品名和热量
  - 多条记录显示数量徽章
- **悬浮预览**：显示品牌、名称和备注

### 3. 打卡上传功能

- **多种上传方式**：
  - 选择照片（支持 HEIC 格式）
  - 直接拍照上传（推荐，避免格式问题）
- **信息录入**：
  - 自动填充：AI 识别的所有字段
  - 手动补充：评分、心情备注等
- **Q弹动画**：保存后图标弹跳落入日历

### 4. 数据持久化

- **SQLite 数据库**：服务器端持久存储
- **跨设备同步**：同一内网所有设备共享数据
- **离线回退**：网络异常时使用 localStorage 缓存

## 数据模型

```typescript
interface MilkTeaRecord {
  id: string;           // 唯一标识
  date: string;         // 日期 (YYYY-MM-DD)
  name: string;         // 商品名称
  brand?: string;       // 品牌名
  ingredients?: string; // 配料
  calories?: number;    // 热量（千卡）
  imageBase64?: string; // 图片 Base64
  price?: string;       // 价格
  sugarIce?: string;    // 糖度/冰度
  rating?: number;      // 评分 1-5
  shop?: string;        // 店铺名称
  moodNote?: string;    // 心情/备注
  iconId: IconId;       // 图标类型
  createdAt: string;    // 创建时间 ISO
}

type IconId = 'pearl' | 'fruit' | 'coffee' | 'milk' | 'matcha';
```

## UI/UX 设计

### 色彩系统

采用抹茶绿 + 咖啡色系的可爱风格：

| 变量 | 颜色值 | 用途 |
| --- | --- | --- |
| `--matcha` | #8FBC8F | 主色调（抹茶绿） |
| `--matcha-light` | #C8E6C9 | 浅抹茶 |
| `--coffee` | #8B4513 | 咖啡棕 |
| `--coffee-light` | #D2B48C | 浅咖啡 |
| `--cream` | #FFFEF7 | 奶油白 |

### 动画效果

- 页面加载渐入动画
- 日历格子弹跳动画
- 图标摇晃动画
- 弹窗弹出动画
- 按钮悬停效果

## 部署指南

### 本地开发

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..

# 启动前端开发服务器
npm run dev

# 启动后端（另一个终端）
cd server && npm start
```

### Docker 部署

```bash
# 构建前端
npm run build

# 启动服务（前端 + 后端）
docker compose up -d

# 查看日志
docker logs milkyway-frontend-1
docker logs milkyway-backend-1

# 停止服务
docker compose down
```

### 环境变量

创建 `.env` 文件：

```env
VITE_QWEN_API_KEY=你的通义千问API密钥
```

## API 接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/records` | 获取所有记录 |
| GET | `/api/records/month/:year/:month` | 按月获取记录 |
| POST | `/api/records` | 新增记录 |
| PUT | `/api/records/:id` | 更新记录 |
| DELETE | `/api/records/:id` | 删除记录 |
| GET | `/api/health` | 健康检查 |

## 运维命令

```bash
# 重启服务
docker compose restart

# 查看运行状态
docker ps

# 备份数据库
cp data/records.db backup/records_$(date +%Y%m%d).db

# 更新部署
npm run build
docker compose up -d --build
```

## 更新日志

### 2026-02-08

- 新增 SQLite 数据库后端，支持数据持久化
- 新增 Docker Compose 部署支持
- 前端改为 API 调用 + localStorage 缓存双模式
- 部署至本地服务器 (192.168.0.138:8088)
- 推送至 GitHub 仓库

### 2026-02-07

- 新增 AI OCR 识别功能（通义千问 VL）
- 新增热量 AI 联网搜索
- 新增品牌、配料、热量字段
- 日历显示商品名和热量
- UI 改为抹茶绿+咖啡色可爱风格
- 新增拍照上传功能（解决 HEIC 兼容性）

### 初始版本

- 基础日历打卡功能
- 图片上传和 localStorage 存储
- 5 种预设图标

## 相关链接

- **GitHub 仓库**：https://github.com/toripushy/milkyway-calendar
- **在线访问**：http://192.168.0.138:8088 (内网)

---

**技术支持**: 本项目使用通义千问 VL 进行 AI 图像识别。
