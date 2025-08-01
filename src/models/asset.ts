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
  imageUrls?: string[]; // 资产照片 URLs (可选，多张图片)
  status: "在用" | "闲置" | "维修中" | "报废"; // 使用状态
  storagePlace: string; // 存放地点
  owner: string; // 责任人
}