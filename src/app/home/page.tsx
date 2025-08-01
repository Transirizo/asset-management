"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QrCode, Search, Trash } from "lucide-react";
import { Asset } from "@/models/asset";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  }, [searchQuery, assets]);

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      if (response.ok) {
        const data = await response.json();
        setAssets(data);
        setFilteredAssets(data);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">资产管理系统</h1>
            <p className="text-gray-600">管理和查看所有资产信息</p>
          </div>
          <Link href="/scan">
            <Button size="sm" className="bg-black hover:bg-gray-800">
              <QrCode className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索资产名称、编号、类别或位置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Asset List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{searchQuery ? "未找到匹配的资产" : "暂无资产记录"}</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <Card key={asset.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <Link href={`/asset/${asset.id}`} className="block">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{asset.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">编号: {asset.id}</p>
                        {asset.category && (
                          <p className="text-sm text-gray-500 mb-1">类别: {asset.category}</p>
                        )}
                        {asset.location && (
                          <p className="text-sm text-gray-500">位置: {asset.location}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {asset.price && (
                          <p className="text-sm font-medium text-gray-900">¥{asset.price}</p>
                        )}
                        <p
                          className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            asset.status === "在用"
                              ? "bg-green-100 text-green-800"
                              : asset.status === "维修中"
                              ? "bg-yellow-100 text-yellow-800"
                              : asset.status === "闲置"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {asset.status || "未知"}
                        </p>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
