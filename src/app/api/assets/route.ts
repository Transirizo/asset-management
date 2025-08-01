// /app/api/assets/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Asset } from "@/models/asset";

// GET /api/assets - 获取所有资产
export async function GET() {
  try {
    const stmt = db.prepare("SELECT * FROM assets");
    const assets = stmt.all() as Asset[];
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

// POST /api/assets - 创建新资产
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    let id: string;
    let newAssetData: Omit<Asset, "id">;

    if (requestData.id) {
      // Use provided ID (from scanned QR code)
      id = requestData.id;
      const { id: _, ...assetData } = requestData;
      newAssetData = assetData;
    } else {
      // Generate unique ID
      const year = new Date().getFullYear();
      const randomSuffix = Math.random().toString(36).substr(2, 3).toUpperCase();
      id = `ZC-${year}-${randomSuffix}`;
      newAssetData = requestData;
    }

    const asset: Asset = {
      id,
      ...newAssetData,
    };

    const stmt = db.prepare(`
      INSERT INTO assets (id, name, purchaseDate, location, price, invoiceType, taxRate, modelSpec, category, lastCheckDate, imageUrl, status, storagePlace, owner)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      asset.id,
      asset.name,
      asset.purchaseDate,
      asset.location,
      asset.price,
      asset.invoiceType,
      asset.taxRate,
      asset.modelSpec,
      asset.category,
      asset.lastCheckDate,
      asset.imageUrl,
      asset.status,
      asset.storagePlace,
      asset.owner
    );

    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
