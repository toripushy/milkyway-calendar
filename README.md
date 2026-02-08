# MilkyWay Calendar 🧋

奶茶饮用记录网页应用 — 以日历为核心交互界面，实现"饮品生活数字化"。

## 项目概述

MilkyWay Calendar 是一个基于 React + TypeScript + Vite 的前端应用，用户可以通过上传奶茶照片并记录饮用信息，在日历对应日期上展示个性化图标，方便回顾自己的饮品消费记录。

## 技术栈

| 维度 | 技术方案 | 版本 |
| --- | --- | --- |
| **框架** | React + TypeScript | React 19.2, TS 5.9 |
| **构建工具** | Vite | 7.2 |
| **日期处理** | Day.js | 1.11 |
| **图标库** | Lucide React | 0.563 |
| **存储方式** | LocalStorage | - |

## 项目结构

```
milkyway-calendar/
├── src/
│   ├── App.tsx              # 主应用组件，管理状态和路由
│   ├── main.tsx             # 应用入口
│   ├── index.css            # 全局样式（奶茶色系主题）
│   ├── App.css              # 组件样式
│   ├── components/
│   │   ├── Calendar.tsx     # 日历组件 - 月视图展示
│   │   ├── UploadModal.tsx  # 上传弹窗 - 打卡记录表单
│   │   ├── DetailModal.tsx  # 详情弹窗 - 查看/编辑/删除记录
│   │   └── TeaIcon.tsx      # 茶饮图标组件
│   ├── hooks/
│   │   └── useRecords.ts    # 记录数据管理 Hook
│   ├── utils/
│   │   └── storage.ts       # LocalStorage 存储工具函数
│   ├── types/
│   │   └── record.ts        # TypeScript 类型定义
│   └── constants/
│       └── icons.ts         # 图标预设配置
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 核心功能

### 1. 交互日历界面

- **月视图切换**：默认显示当前月份，支持左右切换
- **状态展示**：
  - 未打卡日期：显示常规日期数字
  - 已打卡日期：显示可爱的饮品图标
  - 多条记录：右上角显示数量徽章
- **悬浮预览**：鼠标悬停显示奶茶名称和备注

### 2. 打卡上传功能

- **图片上传**：支持拖拽或点击上传
- **信息录入**：
  - 必填项：商品名称、饮用日期（默认当天）
  - 选填项：价格、糖度/冰度、评分（1-5星）、店铺名称、心情备注
- **图标选择**：5 种预设图标（珍珠奶茶、水果茶、咖啡、鲜奶、抹茶）
- **Q弹动画**：保存后图标以弹跳效果落入日历

### 3. 详情回顾

- **点击查看**：点击日历图标打开详情弹窗
- **完整信息**：展示照片、所有填写的参数
- **编辑功能**：支持修改记录信息
- **删除功能**：确认后删除记录

## 数据模型

```typescript
interface MilkTeaRecord {
  id: string;           // 唯一标识
  date: string;         // 日期 (YYYY-MM-DD)
  name: string;         // 商品名称
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

采用温暖的奶茶色系：

| 变量 | 颜色值 | 用途 |
| --- | --- | --- |
| `--color-bg` | #F5F5DC | 页面背景（米色） |
| `--color-surface` | #FFFEF7 | 卡片背景 |
| `--color-accent` | #D2B48C | 主色调（棕色） |
| `--color-accent-dark` | #B8956B | 深色强调 |
| `--color-text` | #3d3629 | 主文字 |
| `--color-text-muted` | #6b5d4a | 次要文字 |

### 响应式适配

- 移动端优化：适配 320px 及以上宽度
- 触摸友好：按钮和交互区域足够大
- 弹窗自适应：在小屏幕上占满可用空间

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 数据存储

当前版本使用浏览器 LocalStorage 进行数据持久化：

- 存储 Key：`milkyway_records`
- 数据格式：JSON 数组
- 图片存储：Base64 编码

> 注意：图片以 Base64 形式存储在 LocalStorage 中，大量图片可能导致存储空间不足。

## 未来规划

- [ ] 数据统计：月度消费杯数、金额统计
- [ ] 健康预警：连续打卡超过 3 天提醒糖分摄入
- [ ] AI 识别：自动识别奶茶品牌和文字
- [ ] 云端同步：支持 Supabase/Firebase 存储
- [ ] 数据导出：支持导出记录为 CSV/JSON

## 相关文件

- 需求文档：`../# 奶茶饮用记录网页（MilkyWay Calendar）需求文档.ini`
- Cursor Skill：`../.cursor/skills/ui-ux-pro-max/SKILL.md`

---

**技术支持**: 本项目使用 [ui-ux-pro-max](../.cursor/skills/ui-ux-pro-max/SKILL.md) Cursor Skill 进行 UI/UX 设计辅助。
