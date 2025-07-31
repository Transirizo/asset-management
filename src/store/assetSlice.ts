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