# QCPR 前端开发文档

> Quick Calculation Practice Records（速算练习记录）
> 一款记录公考资料分析速算练习成绩的网页应用

本文档用于指导 QCPR 前端从零搭建，涵盖需求梳理、技术选型、数据模型、模块设计、核心流程与实施路线，供开发者直接据此编码。

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈与依赖](#2-技术栈与依赖)
3. [目录结构](#3-目录结构)
4. [数据模型](#4-数据模型)
5. [存储层设计](#5-存储层设计)
6. [状态管理](#6-状态管理)
7. [路由与页面](#7-路由与页面)
8. [核心交互流程](#8-核心交互流程)
9. [图表与数据分析](#9-图表与数据分析)
10. [样式与设计规范](#10-样式与设计规范)
11. [开发里程碑](#11-开发里程碑)
12. [未来扩展：出题 + 自动判题](#12-未来扩展出题--自动判题)

---

## 1. 项目概述

### 定位

QCPR 是一款**自托管、单用户、无需登录**的网页应用，专注于记录公考「资料分析」备考中的**速算练习成绩**，并通过数据可视化帮助用户发现薄弱环节、追踪进步。成绩数据保存在服务器**项目目录下的 JSON 文件**（`data/records.json`），便于备份与迁移。

### 目标用户

正在备考公务员考试、需要长期练习速算并希望量化自己进步的个人用户。

### 核心场景

| 场景 | 说明 |
|---|---|
| 练习后记录 | 用户在纸面/其它工具完成一组速算题后，用本应用计时或补录，保存本次用时与错题数 |
| 查看进步 | 主页查看近期成绩、各模块的正确率/用时趋势 |
| 定位弱项 | 通过「弱模块分析」了解哪个模块最需要加强 |

### 速算模块

速算练习共 **6 个模块**，六个模块同属一个**集合**（用四位数字标识，如 `1866`，每条记录必带所属集合编号）：

| 模块 id | 名称 | 题量 | 限时 |
|---|---|---|---|
| `mul_2` | 两位数乘 | 40 | 1.5 分钟（90s） |
| `add_sub_2` | 两位数加减 | 20 | 2 分钟（120s） |
| `add_sub_3` | 三位数加减 | 20 | 3 分钟（180s） |
| `div_2` | 除两位 | 20 | 1 分钟（60s） |
| `div_3` | 除三位 | 20 | 4 分钟（240s） |
| `div_4` | 除四位 | 20 | 6 分钟（360s） |

> 模块顺序即录入界面展示顺序（`MODULES` 数组顺序，两位数乘置于最前）。

> ⚠️ **需求出入提示**：`README.md` 正文称速算练习"分为四部分"，但随后列出了 **6 个模块**。本文档以 **6 个模块**为准。建议后续修正 README 中"四部分"的表述，使二者一致。

### 本期范围

- ✅ **记录成绩**：一键计时练习记录 + 手动补录历史成绩
- ✅ **查看成绩**：近期成绩概览、分模块进步趋势、弱模块分析
- ✅ **数据管理**：服务器 JSON 文件存储、导入/导出备份

### 非目标（本期不做，仅预留扩展点）

- ❌ 应用内**自动出题**（题目仍由用户在别处完成）
- ❌ 应用内**自动判题/对答案**
- ❌ 多设备云同步、账号系统

> 第 12 章说明了架构上如何为「出题 + 判题」预留扩展。

---

## 2. 技术栈与依赖

| 类别 | 选型 | 理由 |
|---|---|---|
| 框架 | **React 18** | 组件化、生态成熟 |
| 构建工具 | **Vite** | 启动快、配置简单、HMR 体验好 |
| 路由 | **React Router v6** | 两页应用的标准路由方案 |
| 图表 | **Recharts** | 专为 React 设计，声明式 API，折线趋势图开箱即用 |
| 样式 | **Tailwind CSS** | 原子化、开发快、风格统一，移动优先 |
| **UI 组件** | **shadcn/ui**（Radix + cva） | 官方级无障碍组件（Button/Select/Tabs/Input/Dialog/Collapsible/Badge…），代码在 `src/components/ui/`、完全可控；主题走本项目语义变量 |
| 图标 | **lucide-react** | 一致的 SVG 线性图标（设计规范禁用 emoji 图标） |
| 提示 | **sonner** | toast 轻提示（保存/删除/导入反馈） |
| 存储 | **项目目录 JSON 文件** | 自写 Vite 插件挂 `/api/records`（纯 Node，零后端框架依赖），读写 `data/records.json`，前后端同源同端口 |

### 环境要求

- **Node.js** ≥ 18（Vite 5 要求）
- **包管理器**：pnpm（推荐）/ npm / yarn 任一
- 路径别名 `@` → `src`（`vite.config.js` + `jsconfig.json`）；`components.json` 配置 shadcn（`tsx:false` 出 JSX）

### 依赖清单

```jsonc
{
  "dependencies": {
    "react": "^18.3", "react-dom": "^18.3",
    "react-router-dom": "^6.26", "recharts": "^2.12",
    "lucide-react": "^1.24", "sonner": "^1",
    // shadcn/ui 运行时
    "class-variance-authority": "*", "clsx": "*", "tailwind-merge": "*",
    "@radix-ui/react-slot": "*", "@radix-ui/react-tabs": "*",
    "@radix-ui/react-select": "*", "@radix-ui/react-label": "*",
    "@radix-ui/react-collapsible": "*", "@radix-ui/react-alert-dialog": "*"
  },
  "devDependencies": {
    "vite": "^5.4", "@vitejs/plugin-react": "^4.3",
    "tailwindcss": "^3.4", "tailwindcss-animate": "*",
    "postcss": "^8.4", "autoprefixer": "^10.4"
  }
}
```

> 版本号为编写时的建议下限，落地时以脚手架实际拉取的最新稳定版为准。

---

## 3. 目录结构

```
QCPR/
├─ README.md
├─ docs/
│  └─ frontend-dev.md          # 本文档
├─ index.html
├─ package.json
├─ vite.config.js              # 挂载 recordsApi 插件；host:true
├─ tailwind.config.js
├─ postcss.config.js
├─ server/
│  ├─ store.js                 # data/records.json 原子读写（写队列、字段补全）
│  └─ apiPlugin.js             # Vite 插件：/api/records REST 中间件
├─ data/
│  └─ records.json             # 成绩数据（运行时生成；部署时备份此目录）
└─ src/
   ├─ main.jsx                 # 应用入口，挂载 Router
   ├─ App.jsx                  # 路由表 + 布局
   ├─ pages/
   │  ├─ HomePage.jsx          # 主页：成绩查看
   │  └─ RecordPage.jsx        # 记录页：计时 / 补录
   ├─ components/
   │  ├─ layout/
   │  │  ├─ AppLayout.jsx      # 整体骨架（含导航）
   │  │  └─ NavBar.jsx         # 顶部/底部导航
   │  ├─ home/
   │  │  ├─ RecentScores.jsx   # 近期成绩列表
   │  │  ├─ StatCard.jsx       # 概览指标卡
   │  │  ├─ TrendChart.jsx     # 进步趋势图（Recharts）
   │  │  └─ WeakModuleAnalysis.jsx  # 弱模块分析
   │  ├─ record/
   │  │  ├─ ModulePicker.jsx   # 模块选择
   │  │  ├─ SetIdInput.jsx     # 集合编号输入（四位数字）
   │  │  ├─ TimerPractice.jsx  # 一键计时练习（含 Wake Lock）
   │  │  ├─ Timer.jsx          # 番茄钟圆环计时展示
   │  │  ├─ ResultForm.jsx     # 结束后填错题数（WrongCountPicker）
   │  │  ├─ WrongCountPicker.jsx # 错题数：快捷 0–3 + 原生 select
   │  │  ├─ DurationPicker.jsx # 用时：input type=time（分:秒 同一弹窗）
   │  │  └─ ManualEntry.jsx    # 手动补录表单
   │  └─ ui/                   # shadcn/ui 组件（button/card/tabs/select/input/…）
   │     └─ native-select.jsx  # 原生 select + shadcn 外观（iOS 原生滚轮）
   ├─ hooks/
   │  ├─ useRecords.js         # 成绩数据读写 hook
   │  ├─ useTimer.js           # 计时器 hook
   │  └─ useWakeLock.js        # 屏幕常亮（防息屏）
   ├─ lib/
   │  ├─ modules.js            # 6 个模块常量（唯一数据源）
   │  ├─ storage.js            # /api/records 的 fetch 封装（全 async）
   │  ├─ analytics.js          # 趋势/弱模块计算
   │  └─ format.js             # 时间、百分比格式化
   └─ styles/
      └─ index.css             # Tailwind 入口 + 全局样式
```

---

## 4. 数据模型

### 4.1 模块常量（`lib/modules.js`）

模块定义是全局唯一数据源，所有下拉、图表、算法都引用它，避免硬编码散落各处。

```js
// lib/modules.js
export const MODULES = [
  { id: 'add_sub_2', name: '两位数加减', count: 20, limitSec: 120 },
  { id: 'mul_2',     name: '两位数乘',   count: 40, limitSec: 90  },
  { id: 'add_sub_3', name: '三位数加减', count: 20, limitSec: 180 },
  { id: 'div_2',     name: '除两位',     count: 20, limitSec: 60  },
  { id: 'div_3',     name: '除三位',     count: 20, limitSec: 240 },
  { id: 'div_4',     name: '除四位',     count: 20, limitSec: 240 },
];

export const MODULE_MAP = Object.fromEntries(
  MODULES.map((m) => [m.id, m])
);

export const getModule = (id) => MODULE_MAP[id];
```

### 4.2 成绩记录（Record）

一次练习成绩对应一条 Record：

```js
/**
 * @typedef {Object} Record
 * @property {string}  id            唯一 id，crypto.randomUUID()
 * @property {string}  setId         所属集合编号（四位数字字符串，如 "1866"）
 * @property {string}  moduleId      关联模块 id（见 MODULES）
 * @property {string}  date          练习时间，ISO 字符串
 * @property {number}  durationSec   实际用时（秒）
 * @property {number}  wrongCount    错题数
 * @property {number}  totalCount    题量快照（记录时的 module.count）
 * @property {'timer'|'manual'} source  来源：计时 or 手动补录
 * @property {number}  schemaVersion 数据结构版本，当前为 1
 */
```

> **集合（setId）**：六个模块同属一个「集合」，用四位数字标识（如 `1866`）。录入时必填、严格四位数字校验（`lib/format.js` 的 `isValidSetId`）；由前端表单提供，随 `add()` 传入，服务端不强制校验。录入界面用 localStorage 键 `qcpr:lastSetId` 记住上次输入，连续练同一套免重填。主页可按集合筛选分析（`lib/analytics.js` 的 `getSetIds`）。

**设计要点**

- `totalCount` 存**快照**而非实时从模块读取，这样即便未来调整模块题量，历史记录仍然准确。
- `source` 区分数据来自计时练习还是手动补录，便于展示与统计。
- `schemaVersion` 便于未来结构升级时做数据迁移。

### 4.3 派生指标（不入库，实时计算）

| 指标 | 计算 |
|---|---|
| 正确题数 | `totalCount - wrongCount` |
| 正确率 | `(totalCount - wrongCount) / totalCount` |
| 是否超时 | `durationSec > module.limitSec` |
| 用时比 | `durationSec / module.limitSec`（越小越好） |

派生指标统一放在 `lib/analytics.js` / `lib/format.js` 中计算，组件层不重复实现。

---

## 5. 存储层设计（服务器 JSON 文件 + `/api/records`）

### 5.1 存储约定

- **数据文件**：`<项目根>/data/records.json`，内容为 `Record[]` 的格式化 JSON
- **服务端**：自写 Vite 插件（`server/apiPlugin.js`）在 `configureServer`（开发）与 `configurePreviewServer`（生产 preview）挂载同一套 `/api/records` middleware —— 前后端**同源同端口**，无需 proxy 与 CORS
- **文件读写**（`server/store.js`）：所有磁盘访问收敛于此
  - **原子写**：先写 `records.json.tmp` 再 `rename`，读者永远看到完整文件
  - **写队列**：Promise 链串行化并发写，防止相互撕裂
  - **损坏保护**：文件不存在视为空数组（首次运行）；但 JSON 损坏时**抛错返 500**，绝不当作空数组，避免"坏读后覆盖"真实数据
  - `id`（`crypto.randomUUID`）/ `date` / `schemaVersion` 由**服务端**补全
- 主题偏好（`qcpr:theme`）是纯 UI 偏好，仍存 localStorage，不走服务器

### 5.2 API 端点

| 方法 | 路径 | 说明 | 成功响应 |
|---|---|---|---|
| GET | `/api/records` | 全部记录 | 200 `Record[]` |
| POST | `/api/records` | 新增（服务端补全字段） | 201 完整记录 |
| PATCH | `/api/records/:id` | 局部更新 | 200 更新后记录 |
| DELETE | `/api/records/:id` | 删除 | 204 |
| PUT | `/api/records` | 整体覆盖（导入），body 须为数组 | 200 `{count}` |

错误约定：400 校验失败（如导入非数组）、404 未知 id、405 方法不允许、500 文件异常。

### 5.3 前端封装（`lib/storage.js`）

前端 `storage.js` 是对上述 API 的 fetch 封装，**全部函数 async**，签名与旧版一致：
`getRecords / addRecord / updateRecord / deleteRecord / exportJSON / importJSON`。
统一 `request()` helper：非 2xx 抛错（携带服务端 error 文案），业务层 try/catch 展示。

### 5.4 备份与迁移

- `exportJSON` / `importJSON`（UI 上的导出/导入按钮）用于手动备份、跨环境迁移
- 服务器上直接备份 `data/` 目录即可（纯文本 JSON）
- **localStorage 一次性自动迁移**：首次访问时若服务器数据为空且浏览器存在旧键 `qcpr:records:v1`，自动导入服务器；本地键改名为 `qcpr:records:v1:migrated` 保留备份（见 6 章）

---

## 6. 状态管理

本应用数据量小、读写简单，**不引入 Redux / Zustand**，用自定义 hook 即可。

### `useRecords`（`hooks/useRecords.js`）

封装记录的读取与增删改，并监听跨标签页的 storage 变更：

```js
// hooks/useRecords.js（要点示意，完整实现见源码）
export function useRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 挂载时异步拉取；首次拉取顺带执行 localStorage 一次性迁移
  const load = useCallback(async () => {
    try {
      setError(null);
      let data = await storage.getRecords();
      // 一次性迁移：服务器为空且本地有旧键 qcpr:records:v1 → PUT 导入，
      // 本地键改名 qcpr:records:v1:migrated 留作备份
      setRecords(data);
    } catch (e) {
      setError(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // 页面重新可见 / 获得焦点时刷新（手机切回、跨标签修改后自动同步）
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== 'hidden') load();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => { /* 相应移除 */ };
  }, [load]);

  // add / update / remove 均为 async：调用 storage 成功后 await load()
  return { records, loading, error, add, update, remove, refresh: load };
}
```

**调用方约定**

- `HomePage`：`loading` 时显示占位（避免闪空态）；`error` 时显示失败提示 + 重试按钮
- `TimerPractice` / `ManualEntry`：`await add(...)` **成功后才跳转主页**，失败提示并保留表单（防丢数据）；保存期间禁用按钮防重复提交
- `DataManager`：导出/导入均 await，失败 alert

> 原 localStorage 方案依赖 `storage` 事件做跨标签同步；服务器化后改为 **focus / visibilitychange 时重新拉取**，对"手机记录、电脑分析"的双端场景同样生效。

---

## 7. 路由与页面

### 路由表

| 路径 | 页面 | 说明 |
|---|---|---|
| `/` | `HomePage` | 主页，成绩查看 |
| `/record` | `RecordPage` | 记录成绩（计时 / 补录） |

```jsx
// App.jsx
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import RecordPage from './pages/RecordPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/record" element={<RecordPage />} />
      </Routes>
    </AppLayout>
  );
}
```

### 7.1 主页 HomePage

自上而下三段：

1. **近期成绩概览**（`RecentScores` + `StatCard`）
   - 最近若干次练习的概览指标：练习总次数、近 7 天次数、平均正确率等
   - 近期记录列表（模块、日期、正确率、用时、是否超时）
2. **进步趋势图**（`TrendChart`）
   - 可切换**模块**与**指标**（正确率 / 用时）
   - Recharts 折线图展示时间序列
3. **弱模块分析**（`WeakModuleAnalysis`）
   - 展示最需加强的模块 + 文字建议

无数据时显示 `EmptyState`，引导用户前往 `/record` 记录第一条成绩。

### 7.2 记录页 RecordPage

用 `Tabs` 切换两种记录方式：

- **一键计时**（`TimerPractice`）
- **手动补录**（`ManualEntry`）

---

## 8. 核心交互流程

### 8.1 一键计时练习

```
填写集合编号 (SetIdInput) + 选择模块 (ModulePicker)
   │  · 集合编号：四位数字，必填，预填上次值（qcpr:lastSetId）
   │  · 集合编号合法且选了模块，「开始」才可用
   ▼
点击「开始」
   │
   ▼
计时中 (Timer)
   │  · 番茄钟式圆环 + 大号计时（已用时 / 剩余时间）
   │  · 顶部显示 #集合编号 · 题量 · 限时
   │  · 超过 limitSec 后圆环与数字转警示色（不强制结束）
   │  · 支持暂停 / 继续
   ▼
点击「结束」
   │
   ▼
填写结果 (ResultForm)
   │  · 错题数用原生 select 选择（0 ~ totalCount）
   │  · 展示用时、自动算出的正确率
   ▼
保存 → addRecord({ source: 'timer', ... }) → 跳转主页
```

**要点**

- 计时进行中申请 **Wake Lock** 保持屏幕常亮（见 8.4），暂停/结束/离开时释放。
- 超时后**不自动结束**，只做视觉警示——用户可能想做完看真实用时。
- 结束后只需填**错题数**，用时由计时器自动带入。

### 8.2 手动补录

```
表单 (ManualEntry)
   │  · 集合编号（四位数字，必填，预填上次值）
   │  · 模块（下拉，来自 MODULES）
   │  · 日期 + 时间（默认当前时刻，可改；精确到分钟，支持一天多次练习）
   │  · 用时（DurationPicker：复用 `<input type="time">`，分:秒在同一弹窗选）
   │  · 错题数（WrongCountPicker：快捷按钮 0–3 一键选 + 原生 select 兜底大值）
   ▼
校验（集合编号为四位数字、错题数 ≤ 题量、用时 > 0、日期时间合法且不晚于当前）
   ▼
保存 → addRecord({ setId, source: 'manual', ... })
```

> **集合筛选（主页）**：`HomePage` 顶部提供集合筛选器（`SetFilter`，多于一个集合时才显示），选择后过滤记录传给概览、趋势图、弱模块与列表。趋势图在所选模块于当前集合无数据时，自动回落到最近有数据的模块。

> **原生控件录入**：错题数用 **WrongCountPicker**——快捷按钮 0–3（覆盖绝大多数情况，一键选中）+ **原生 `<select>`** 兜底选更大值（`ui/native-select.jsx` 套 shadcn 外观，选中值双向同步）；用时用 **`<input type="time">`**（与"练习时间"同款控件），把时间控件的"时:分"两个滚轮映射为用时的"分:秒"——分、秒在**同一个原生弹窗**里分开选，`02:35` 即 2 分 35 秒，对外以总秒数交互。关键动机：**iOS Safari 将原生 select 与 time 控件都渲染为系统原生滚轮**，移动端录入体验最佳；时间/用时输入框限宽（`w-28`），避免 iOS 全宽居中显得空旷。

### 8.4 防息屏（Wake Lock）

`useWakeLock` 封装 `navigator.wakeLock`，计时进行中（`running`）申请屏幕常亮，暂停/结束/离开释放；切后台被系统释放后、回到前台自动重新申请。

- **前提**：Wake Lock API 需**安全上下文（HTTPS 或 localhost）**且页面可见聚焦。部署域名 `qcpr.20020527.xyz` 须启用 HTTPS 才生效。
- **降级**：不支持的浏览器或申请被拒时**静默降级**（feature-detect + try/catch），不影响计时功能。

### 8.3 计时器 `useTimer`

```js
// hooks/useTimer.js
import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * 基于时间戳校正的计时器，避免 setInterval 在后台标签页掉帧导致计时不准。
 * 返回已用秒数与控制方法。
 */
export function useTimer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef(0);     // 本段开始时间戳
  const accRef = useRef(0);       // 已累计毫秒（暂停前）
  const rafRef = useRef(null);

  const tick = useCallback(() => {
    setElapsedMs(accRef.current + (Date.now() - startRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (running) return;
    startRef.current = Date.now();
    setRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [running, tick]);

  const pause = useCallback(() => {
    if (!running) return;
    cancelAnimationFrame(rafRef.current);
    accRef.current += Date.now() - startRef.current;
    setRunning(false);
  }, [running]);

  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    accRef.current = 0;
    setElapsedMs(0);
    setRunning(false);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { elapsedSec: Math.floor(elapsedMs / 1000), running, start, pause, reset };
}
```

> **为何用时间戳校正**：`setInterval` 在浏览器后台标签页会被节流甚至暂停，导致纯累加计时严重偏慢。以 `Date.now()` 差值为准，即使掉帧最终读数仍准确。

---

## 9. 图表与数据分析（`lib/analytics.js`）

### 9.1 趋势数据

```js
// lib/analytics.js
import { getModule } from './modules';

/**
 * 取某模块的时间序列，用于折线图
 * @param metric 'accuracy' | 'duration'
 * @returns [{ date, value }]
 */
export function getModuleTrend(records, moduleId, metric = 'accuracy') {
  return records
    .filter((r) => r.moduleId === moduleId)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((r) => ({
      date: r.date,
      value:
        metric === 'accuracy'
          ? (r.totalCount - r.wrongCount) / r.totalCount
          : r.durationSec,
    }));
}
```

对应 Recharts：

```jsx
// TrendChart.jsx（片段）
<LineChart data={data}>
  <XAxis dataKey="date" tickFormatter={fmtDate} />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#2563eb" dot />
</LineChart>
```

### 9.2 弱模块分析算法

对每个模块综合打分，分越低越"弱"，据此排序并给出建议。

```js
const RECENT_N = 5; // 参与近期趋势判断的记录数

/**
 * 计算每个模块的评分与弱项排序
 * @returns [{ moduleId, name, sampleCount, avgAccuracy, avgTimeRatio,
 *            trend, score, advice }]  按 score 升序（最弱在前）
 */
export function getWeakModules(records) {
  return MODULES.map((m) => {
    const rs = records
      .filter((r) => r.moduleId === m.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (rs.length === 0) {
      return { moduleId: m.id, name: m.name, sampleCount: 0,
               score: null, advice: '尚无记录，建议先练习几次' };
    }

    // 1) 平均正确率（权重最高）
    const avgAccuracy =
      rs.reduce((s, r) => s + (r.totalCount - r.wrongCount) / r.totalCount, 0) / rs.length;

    // 2) 平均用时 / 限时 比值（>1 说明普遍超时）
    const avgTimeRatio =
      rs.reduce((s, r) => s + r.durationSec / m.limitSec, 0) / rs.length;

    // 3) 近期趋势：最近 N 次相对更早的正确率变化（正=进步，负=退步）
    const recent = rs.slice(-RECENT_N);
    const earlier = rs.slice(0, -RECENT_N);
    const trend = earlier.length
      ? avg(recent.map(acc)) - avg(earlier.map(acc))
      : 0;

    // 综合评分：正确率主导，超时与退步各扣分
    const score =
      avgAccuracy * 0.7
      - Math.max(0, avgTimeRatio - 1) * 0.2
      + trend * 0.1;

    return {
      moduleId: m.id, name: m.name, sampleCount: rs.length,
      avgAccuracy, avgTimeRatio, trend, score,
      advice: buildAdvice({ avgAccuracy, avgTimeRatio, trend }),
    };
  }).sort((a, b) => (a.score ?? 1) - (b.score ?? 1)); // 最弱在前

  function acc(r) { return (r.totalCount - r.wrongCount) / r.totalCount; }
  function avg(arr) { return arr.reduce((s, x) => s + x, 0) / arr.length; }
}

/** 依据指标拼装文字建议 */
function buildAdvice({ avgAccuracy, avgTimeRatio, trend }) {
  const parts = [];
  if (avgAccuracy < 0.8) parts.push('正确率偏低，注意准确性');
  if (avgTimeRatio > 1) parts.push('普遍超时，需提升速度');
  if (trend < 0) parts.push('近期有退步，建议加练');
  return parts.length ? parts.join('；') : '表现稳定，保持练习';
}
```

**权重说明（可按实际调参）**

| 因子 | 权重 | 方向 |
|---|---|---|
| 平均正确率 | 0.7 | 越高越好 |
| 超时惩罚 `max(0, 用时比-1)` | −0.2 | 越超时扣越多 |
| 近期趋势 | +0.1 | 进步加分、退步减分 |

### 9.3 近期概览

```js
/** 主页概览卡片数据 */
export function getRecentSummary(records) {
  const total = records.length;
  const last7 = records.filter(
    (r) => Date.now() - new Date(r.date) < 7 * 864e5
  ).length;
  const avgAccuracy = total
    ? records.reduce((s, r) => s + (r.totalCount - r.wrongCount) / r.totalCount, 0) / total
    : 0;
  return { total, last7, avgAccuracy };
}
```

---

## 10. 样式与设计规范

### 10.1 组件体系与语义色（shadcn/ui）

UI 采用 **shadcn/ui**（Radix + cva），组件位于 `src/components/ui/`；工具 `cn()`（`src/lib/utils.js`）合并类名。业务组件优先复用 ui 组件，不再手写控件。

颜色走 **shadcn 标准语义变量**（HSL）：`src/styles/index.css` 的 `:root` / `.dark` 定义 `--background/--foreground/--card/--primary/--secondary/--muted/--destructive/--border/--ring/--radius`（+ 业务扩展 `--success/--warning`），`tailwind.config.js` 以 `hsl(var(--x))` 映射。组件只用语义类（`bg-card`、`text-foreground`、`text-muted-foreground`、`border-border`、`bg-primary`、`text-destructive` 等），不写死色值。

主色基调 **青碧 Teal** 映射进 `--primary`（light teal-600 / dark teal-400），**警示红**映射 `--destructive`——主色与警示解耦，避免主色被误读为警告。

| shadcn token | 语义 |
|---|---|
| `background` / `card` / `muted` | 页面底 / 卡片 / 次级面 |
| `foreground` / `muted-foreground` | 主文字 / 次要弱化文字 |
| `border` / `input` / `ring` | 边框 / 输入边框 / 聚焦环 |
| `primary` / `primary-foreground` | 主色青碧 / 其上的文字 |
| `destructive` | 警示红（删除/超时/错误） |
| `success` / `warning` | 达标绿 / 临界黄（业务扩展） |

**圆角层级**（`--radius: 0.75rem`）：容器 `rounded-2xl`、控件 `rounded-xl`(=`rounded-lg` token)、小项 `rounded-md/lg`，统一层级、消除混搭。

**主题机制**（`useTheme.jsx`）：localStorage 无值时**实时跟随系统** `prefers-color-scheme`（监听 change 事件）；点击切换按钮则锁定为对应模式。`index.html` 内联脚本按同规则在首屏前挂 `dark` class 防闪烁。

**切换过渡**：全局对 `background-color/border-color/color/fill/stroke` 等统一 200ms 过渡（`index.css` 的 `*` 规则），整屏同步渐变、无分层边缘；`prefers-reduced-motion` 时关闭。

### 10.2 语义色规则

| 场景 | 颜色 |
|---|---|
| 正确率 ≥ 90% | `success` 绿 |
| 正确率 70%–90% | `warning` 黄 |
| 正确率 < 70% | `destructive` 红 |
| 用时 ≤ 限时 | `success` |
| 用时 > 限时 | `destructive` |

将其收敛为工具函数（`format.js` 的 `accuracyColorClass(rate)`），组件统一调用。

### 10.3 响应式

- **移动优先**：默认样式面向手机竖屏，`md:`/`lg:` 断点向上适配。
- 主要交互（开始计时、填错题数）在拇指可达区域，按钮足够大。
- 导航在移动端可用底部 Tab Bar，桌面端用顶部导航。

### 10.4 通用组件视觉

组件统一来自 shadcn/ui（`src/components/ui/`）：

| 组件 | 来源 / 用途 |
|---|---|
| `Button` | shadcn（variant: default/secondary/destructive/ghost/outline；size: sm/default/lg/icon，默认高度 ≥44px 触控） |
| `Card` | shadcn（`rounded-xl` + `shadow-sm` + `border`） |
| `Tabs` | shadcn（Radix 分段控件）——记录页切换、趋势图指标切换共用 |
| `Select` | shadcn（Radix 弹层）——模块选择、集合筛选 |
| `NativeSelect` | 原生 `<select>` + shadcn 外观——用时、错题数（iOS 原生滚轮） |
| `Input` / `Label` | shadcn——集合编号、日期时间等表单控件 |
| `Badge` | shadcn——集合编号 `#1866`、补录标记 |
| `AlertDialog` | shadcn——删除记录、导入覆盖二次确认（替代 `window.confirm`） |
| `Skeleton` | shadcn——主页加载占位 |
| `Toaster`(sonner) | 保存/删除/导入的 toast 反馈（替代 `window.alert`） |
| `EmptyState` / `DurationPicker` / `Timer` 圆环 / 底部 TabBar | 无官方对应，自研（`DurationPicker` 基于 `NativeSelect`），样式对齐 shadcn token |

> `src/components/common/Button.jsx`、`Card.jsx` 为薄兼容层，内部渲染对应 shadcn 组件，兼容旧调用（variant 名映射），逐步可由调用点直接改用 `@/components/ui/*`。

---

## 11. 开发里程碑

建议按下列顺序实施，每步都能独立跑通、便于验证。

| 阶段 | 内容 | 产出 |
|---|---|---|
| **M1 脚手架** | Vite + React + Tailwind + Router + Recharts，跑通空壳与两页路由 | 可访问的空应用 |
| **M2 数据层** | `modules.js` + `storage.js` + `useRecords` | 可读写 `data/records.json` |
| **M3 记录闭环** | 先做**手动补录**（`ManualEntry`），最快形成可用数据 | 能录入并落库 |
| **M4 计时练习** | `useTimer` + `TimerPractice` + `ResultForm` | 计时练习可保存 |
| **M5 主页展示** | 近期成绩 → 趋势图（Recharts）→ 弱模块分析 | 完整查看能力 |
| **M6 打磨** | 空状态、响应式适配、数据导入/导出、删除记录 | 可发布版本 |

> **为何 M3 先做手动补录**：手动补录无需计时器即可产生数据，能让 M5 的图表与分析尽早有真实数据可测，避免开发后期才发现数据结构问题。

---

## 11b. 部署（自托管）

单进程，无需独立后端：Vite 的 preview 服务器同时托管前端构建产物与 `/api/records`。

```bash
npm install
npm run build      # 产出 dist/
npm start          # = vite preview --host，默认 4173，监听 0.0.0.0
```

- **数据目录**：`data/records.json` 首次写入时自动生成。**备份 = 拷贝 `data/` 目录**（纯文本 JSON）。
- **端口**：`npm start -- --port 8080` 可改；`--host` 已开启，手机可经服务器局域网/公网 IP 访问。
- **进程守护**：生产可用 `pm2 start npm --name qcpr -- start` 之类保持常驻。
- **⚠️ 鉴权**：本期按"内网/个人使用"**不做鉴权**——任何能访问到该地址的人都可读写数据。若部署到公网，请在前面加一层反向代理（Nginx Basic Auth / 单点登录 / IP 白名单），本应用不内置。

---

## 12. 未来扩展：出题 + 自动判题

本期不做出题/判题，但架构上已为其预留空间。未来接入时的设计方向：

### 12.1 出题模块（`lib/generator.js`）

按模块规则生成题目，与现有 `MODULES` 常量对齐：

```js
// 预留接口示意
export function generateProblems(moduleId) {
  const m = getModule(moduleId);
  // 依据 moduleId 的运算类型与位数生成 m.count 道题
  // 返回 [{ id, operands, operator, answer }]
}
```

各模块生成规则（示意）：

| 模块 | 规则 |
|---|---|
| `add_sub_2` | 两个两位数（10–99）加或减 |
| `mul_2` | 两个两位数相乘 |
| `add_sub_3` | 两个三位数（100–999）加或减 |
| `div_2/3/4` | 被除数为对应位数，除数使结果为合理整数或保留位数 |

### 12.2 答题与判题界面

- 新增答题页：逐题展示 `generateProblems` 的输出，用户输入答案
- 提交后对照 `answer` 自动算出 `wrongCount`，直接生成 Record，**无需手填错题数**

### 12.3 数据结构兼容

Record 结构无需破坏性改动，仅**可选新增**答题明细：

```js
{
  // ...现有字段不变
  answers: [                    // 可选，仅出题模式产生
    { problemId, userAnswer, correct: boolean }
  ]
}
```

- 通过 `schemaVersion` 升级到 2，旧数据（无 `answers`）依然兼容。
- `source` 可新增 `'quiz'` 值，区分"应用内出题练习"。

### 12.4 现有架构中已预留的扩展点

| 预留点 | 说明 |
|---|---|
| `MODULES` 常量集中管理 | 出题规则可直接挂在模块定义上（新增 `range`、`operator` 等字段） |
| `source` 字段 | 已用枚举区分来源，新增 `'quiz'` 无需改结构 |
| `totalCount` 快照 | 出题数量变化不影响历史统计 |
| `schemaVersion` | 支撑 `answers` 明细的平滑迁移 |
| 存储层收敛在 `storage.js` | 新增字段只改一处 |

---

*文档结束。如需据此搭建脚手架或开始编码，可在此文档基础上按第 11 章里程碑推进。*
