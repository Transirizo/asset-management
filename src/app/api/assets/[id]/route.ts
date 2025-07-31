// /app/api/assets/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Asset } from "@/models/asset";

// GET /api/assets/[id] - 获取单个资产
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stmt = db.prepare("SELECT * FROM assets WHERE id = ?");
    const asset = stmt.get(id) as Asset | undefined;
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(asset);
  } catch (error) {
    console.error("Failed to fetch asset:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

// PUT /api/assets/[id] - 更新资产
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updatedAsset: Asset = await request.json();
    
    const stmt = db.prepare(`
      UPDATE assets SET 
        name = ?, purchaseDate = ?, location = ?, price = ?, invoiceType = ?, 
        taxRate = ?, modelSpec = ?, category = ?, lastCheckDate = ?, imageUrl = ?, 
        status = ?, storagePlace = ?, owner = ?
      WHERE id = ?
    `);
    
    const result = stmt.run(
      updatedAsset.name,
      updatedAsset.purchaseDate,
      updatedAsset.location,
      updatedAsset.price,
      updatedAsset.invoiceType,
      updatedAsset.taxRate,
      updatedAsset.modelSpec,
      updatedAsset.category,
      updatedAsset.lastCheckDate,
      updatedAsset.imageUrl,
      updatedAsset.status,
      updatedAsset.storagePlace,
      updatedAsset.owner,
      id
    );
    
    if (result.changes === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedAsset);
  } catch (error) {
    console.error("Failed to update asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}