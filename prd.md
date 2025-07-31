好的，这是一个非常清晰的产品需求文档 (PRD)。基于您的要求，我将把它整理成一份详细的技术实现文档，专门为 AI (如 Claude) 或其他开发者使用。

本文档将严格遵循您指定的技术栈和架构模式 (MVVM)，并提供清晰的结构、代码定义和实现步骤。

---

### **资产管理移动端应用 - 技术实现文档**

#### **1. 项目概述与技术选型**

**1.1. 项目目标**
本项目旨在将一份产品需求文档 (PRD) 转化为一个功能性的移动端 Web 应用。应用的核心功能是扫描资产二维码，查看、修改和新增资产信息。

**1.2. 技术栈**

- **框架 (Framework):** Next.js 14+ (使用 App Router)
- **UI 库 (UI Library):** React + TypeScript
- **样式 (Styling):** Tailwind CSS
- **UI 组件 (UI Components):** shadcn/ui
- **状态管理 (State Management):** Redux Toolkit (作为 ViewModel)
- **数据库 (Database):** SQLite
- **二维码扫描 (QR Code Scanning):** `react-qr-reader` 或类似库

**1.3. 核心架构：MVVM (Model-View-ViewModel)**
我们将严格遵循 MVVM 模式进行开发，以实现业务逻辑与 UI 的分离。

- **Model (模型):** 定义资产数据的 TypeScript 类型接口。此模型也对应于数据库中的表结构。
- **View (视图):** 由 React (.tsx) 组件构成，负责纯粹的 UI 展示。视图通过从 ViewModel 中订阅数据来渲染，并通过派发 (dispatch) action 来通知 ViewModel 用户的意图。视图本身不包含任何数据修改逻辑。
- **ViewModel (视图模型):** 由 Redux Store 实现。它负责：
  - 存储应用的全局状态 (如资产列表、当前查看的资产)。
  - 包含所有的业务逻辑 (通过 Redux Thunks 或 Sagas 与后端 API 交互)。
  - 向后端 API 发起请求，获取或修改数据。
  - 接收 View 的 action，更新状态，并将新状态通知给所有订阅了该状态的 View。

#### **2. 文件与目录结构**

为了保持代码的组织性和可维护性，建议采用以下目录结构：

```
.
├── /app                  # Next.js App Router (所有页面和路由)
│   ├── /asset
│   │   ├── /new
│   │   │   └── page.tsx      # FR4: 新增资产页面
│   │   ├── /[id]
│   │   │   ├── page.tsx      # FR2: 资产详情页 (只读)
│   │   │   └── /edit
│   │   │       └── page.tsx  # FR3: 资产修改页
│   ├── /scan
│   │   └── page.tsx          # FR1: 扫码页面
│   ├── layout.tsx            # 根布局
│   └── page.tsx              # 应用首页 (可作为引导或放置一个大的“扫码”按钮)
│
├── /components           # 可复用的 React 组件 (View)
│   └── /ui               # shadcn/ui 生成的组件
│
├── /lib                  # 工具函数和后端逻辑
│   ├── actions.ts          # 服务端操作 (Server Actions) - 与数据库交互
│   └── db.ts               # SQLite 数据库连接和初始化逻辑
│
├── /models               # 数据模型定义 (Model)
│   └── asset.ts            # 资产数据类型接口
│
├── /store                # Redux 相关文件 (ViewModel)
│   ├── assetSlice.ts       # 资产相关的 state 和 reducers
│   ├── store.ts            # Redux Store 配置
│   └── Provider.tsx        # Redux Provider 组件
│
├── tailwind.config.ts    # Tailwind CSS 配置文件
└── next.config.js        # Next.js 配置文件
```

#### **3. 数据模型 (Model)**

在 `models/asset.ts` 文件中定义资产的数据结构。这个接口将贯穿前端和后端。

```typescript
// /models/asset.ts

export interface Asset {
  id: string; // 唯一资产编码, e.g., "ZC-2025-025", 由系统生成
  name: string; // 资产名称
  purchaseDate: string; // 购置时间 (YYYY-MM-DD)
  location: "茶山" | "松山湖" | "其他"; // 所属地点
  price: number; // 购置价格 (数值)
  invoiceType: "普票" | "专票" | "无票"; // 发票类型
  taxRate: number; // 税点 (百分比, e.g., 0.06 for 6%)
  modelSpec: string; // 规格型号 (长文本)
  category: "电子设备" | "办公家具" | "其他"; // 类别
  lastCheckDate: string; // 盘点日期 (YYYY-MM-DD)
  imageUrl?: string; // 资产照片 URL (可选)
  status: "在用" | "闲置" | "维修中" | "报废"; // 使用状态
  storagePlace: string; // 存放地点
  owner: string; // 责任人
}
```

**注意:** `id` 将作为数据库的主键和二维码的内容。

#### **4. 状态管理 (ViewModel)**

使用 Redux Toolkit 来管理资产数据。

**文件: `/store/assetSlice.ts`**
此文件定义了资产相关的 state、reducers 和 thunks (用于处理异步 API 请求)。

```typescript
// /store/assetSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Asset } from "@/models/asset";

// 异步 Thunk: 从后端 API 获取所有资产
export const fetchAssets = createAsyncThunk("assets/fetchAll", async () => {
  const response = await fetch("/api/assets");
  return (await response.json()) as Asset[];
});

// 异步 Thunk: 根据 ID 获取单个资产
export const fetchAssetById = createAsyncThunk("assets/fetchById", async (id: string) => {
  const response = await fetch(`/api/assets/${id}`);
  if (!response.ok) throw new Error("Asset not found");
  return (await response.json()) as Asset;
});

// 异步 Thunk: 创建新资产
export const createAsset = createAsyncThunk(
  "assets/create",
  async (newAssetData: Omit<Asset, "id">) => {
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAssetData),
    });
    return (await response.json()) as Asset;
  }
);

// 异步 Thunk: 更新资产
export const updateAsset = createAsyncThunk("assets/update", async (updatedAsset: Asset) => {
  const response = await fetch(`/api/assets/${updatedAsset.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedAsset),
  });
  return (await response.json()) as Asset;
});

interface AssetState {
  items: Asset[];
  currentItem: Asset | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AssetState = {
  items: [],
  currentItem: null,
  status: "idle",
  error: null,
};

const assetSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    // 同步 Reducers (如果需要)
    setCurrentItem: (state, action: PayloadAction<Asset | null>) => {
      state.currentItem = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 处理 fetchAssetById
      .addCase(fetchAssetById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentItem = action.payload;
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch asset";
      })
      // 处理 updateAsset
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.currentItem = action.payload;
        // Optionally update the list item as well
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // 处理 createAsset
      .addCase(createAsset.fulfilled, (state, action) => {
        state.items.push(action.payload);
        // 可以选择将新创建的资产设为当前项
        state.currentItem = action.payload;
      });
  },
});

export const { setCurrentItem } = assetSlice.actions;
export default assetSlice.reducer;
```

#### **5. 视图与路由 (View)**

**UI 风格:** 简洁、明了，类似 Apple UI。使用 `shadcn/ui` 组件库，这有助于快速构建高质量的 UI。大量留白、清晰的字体层次和无边框输入框将是关键。

**5.1. 首页: `app/page.tsx`**

- **内容:** 一个简洁的欢迎页面，包含一个醒目的、居中的 "扫描资产" 按钮。
- **交互:** 点击按钮后，路由跳转到 `/scan`。
- **组件:** `shadcn/ui` 的 `Button`。

**5.2. 扫码页: `app/scan/page.tsx` (FR1)**

- **内容:**
  - 全屏或大面积的摄像头预览区域。
  - 使用 `react-qr-reader` 组件实现。
  - 提示用户授权摄像头权限。
- **交互:**
  - 扫描成功后，从二维码中解析出资产 `id`。
  - 如果解析出的 `id` 符合系统格式 (e.g., "ZC-...")，则立即路由到 `/asset/[id]`。
  - **根据 PRD 的特殊需求**: "若扫描的二维码在数据库中不存在，则添加一个新的资产，然后填写信息。" 这个流程可以调整为：
    1.  扫描到一个非系统内的二维码。
    2.  弹窗提示“未找到资产，是否要将此码作为新资产的标识并创建？”
    3.  用户确认后，跳转到 `/asset/new`，并将这个码预填写到某个字段或作为参数传递。
    4.  (更优方案) 为避免混乱，建议流程简化为：**扫描只用于查找，新增资产必须通过“新增”按钮进行，系统自动生成 ID 和二维码。** 此技术文档将遵循此优化方案。

**5.3. 资产详情页: `app/asset/[id]/page.tsx` (FR2)**

- **数据获取:**
  1.  页面加载时，从 URL 中获取 `id`。
  2.  派发 (dispatch) `fetchAssetById(id)` 这个 thunk。
  3.  在组件中，使用 `useSelector` 从 Redux store 中订阅 `currentItem` 和 `status`。
  4.  根据 `status` 显示加载中 (loading spinner) 或错误信息。
  5.  `currentItem` 加载成功后，渲染资产信息。
- **UI 布局:**
  - 使用一个清晰的列表或卡片来展示资产的各个字段。
  - `资产照片` (`imageUrl`) 使用 `next/image` 组件展示，支持点击放大 (可使用一个简单的 Modal 组件)。
  - 页面底部有一个 "修改" 按钮 (`<Button>`)，点击后跳转到 `/asset/[id]/edit`。
- **此页面为只读，不包含任何表单元素。**

**5.4. 资产修改页: `app/asset/[id]/edit/page.tsx` (FR3)**

- **数据预填:**
  1.  页面加载时，Redux store 中应该已经有 `currentItem` (从详情页过来)。如果没有，则重新派发 `fetchAssetById(id)`。
  2.  将 `currentItem` 的数据作为表单的初始值。
- **UI 组件 (使用 `shadcn/ui`):**
  - `资产名称`, `规格型号`, `责任人` 等: `<Input />`
  - `购置时间`, `盘点日期`: `<Popover>` + `<Calendar />` 组成的 `DatePicker`。
  - `购置价格`: `<Input type="number" />`。
  - `使用状态`, `类别`, `发票类型` 等选项: `<Select />` 组件。
  - `资产照片`: 一个带有 "上传/替换" 按钮的区域，点击后触发 `<Input type="file" />`。
- **交互:**
  1.  用户修改表单。
  2.  点击 "保存" 按钮。
  3.  表单收集所有数据，构建一个 `Asset` 对象。
  4.  派发 (dispatch) `updateAsset(updatedAsset)` thunk。
  5.  thunk 成功后，显示成功提示 (e.g., `Toast` from shadcn)，并使用 `useRouter` 跳转回 `/asset/[id]` 详情页。
  6.  点击 "取消" 按钮，直接跳转回 `/asset/[id]` 详情页。

**5.5. 新增资产页: `app/asset/new/page.tsx` (FR4)**

- **流程:** 与修改页非常相似，但表单是空的。
- **交互:**
  1.  用户填写所有必填信息。
  2.  点击 "保存"。
  3.  表单收集数据，构建一个 `Omit<Asset, 'id'>` 对象 (因为 `id` 是后端生成的)。
  4.  派发 `createAsset(newAssetData)` thunk。
  5.  thunk 成功后，后端会返回新创建的完整 `Asset` 对象 (包含新 `id`)。
  6.  **重要**: 页面需要显示新生成的 `id` (e.g., ZC-2025-025) 和对应的二维码 (可使用 `qrcode.react` 库生成)。
  7.  提示用户 "创建成功！请打印或截图下面的二维码并粘贴到资产上。"
  8.  提供一个按钮，让用户可以跳转到新创建的资产详情页 `/asset/[newId]`。

#### **6. 后端与数据库 (Next.js API Routes & SQLite)**

由于无需登录和复杂的权限管理，使用 Next.js 的 API Routes 结合 SQLite 是一个轻量且高效的选择。

**文件: `/lib/db.ts`**

```typescript
// /lib/db.ts
import Database from "better-sqlite3";

// 使用 better-sqlite3 库
export const db = new Database("assets.db");

// 初始化数据库表结构
// 在应用启动时执行一次即可
db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    purchaseDate TEXT,
    location TEXT,
    price REAL,
    invoiceType TEXT,
    taxRate REAL,
    modelSpec TEXT,
    category TEXT,
    lastCheckDate TEXT,
    imageUrl TEXT,
    status TEXT,
    storagePlace TEXT,
    owner TEXT
  )
`);
```

**API Endpoints:**
在 `app/api/assets` 目录下创建相应的 `route.ts` 文件。

- **`GET /api/assets/[id]`:**

  - 从数据库中查询指定 `id` 的资产。
  - 返回单个 `Asset` 对象或 404 错误。

- **`PUT /api/assets/[id]`:**

  - 从请求体中接收 `Asset` 对象。
  - 在数据库中更新对应的资产记录。
  - 返回更新后的 `Asset` 对象。

- **`POST /api/assets`:**

  - 从请求体中接收 `Omit<Asset, 'id'>` 数据。
  - **生成唯一的 `id`** (例如: `ZC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`)。
  - 将新资产数据插入数据库。
  - 返回包含新 `id` 的完整 `Asset` 对象。

---

此技术文档提供了从架构到具体编码实现的完整蓝图。AI 或开发者可以按照此文档的结构和规范，分步骤完成整个应用的开发。
