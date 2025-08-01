"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssetById } from "@/store/assetSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  Package,
  User,
  Building,
  Camera,
  Trash,
} from "lucide-react";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentItem: asset, status, error } = useSelector((state: RootState) => state.assets);

  const assetId = params.id as string;

  useEffect(() => {
    if (assetId) {
      dispatch(fetchAssetById(assetId));
    }
  }, [dispatch, assetId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "failed" || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">资产未找到</h2>
              <p className="text-gray-600 mb-4">{error || "请确认资产编码是否正确"}</p>
              <Button onClick={() => router.back()}>返回上一页</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "在用":
        return "bg-green-100 text-green-800";
      case "闲置":
        return "bg-blue-100 text-blue-800";
      case "维修中":
        return "bg-orange-100 text-orange-800";
      case "报废":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </Link>
          <h1 className="font-semibold text-gray-900">资产详情</h1>
          <Link href={`/asset/${assetId}/edit`}>
            <Button size="sm">
              <Edit className="mr-1 h-4 w-4" />
              编辑
            </Button>
          </Link>
        </div>

        {/* Asset Image */}
        {asset.imageUrl && (
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <Image src={asset.imageUrl} alt={asset.name} fill className="object-cover" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{asset.name}</CardTitle>
              <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
            </div>
            <p className="text-sm text-gray-600 font-mono">{asset.id}</p>
          </CardHeader>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">资产信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">购置时间</p>
                  <p className="text-sm font-medium">{asset.purchaseDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">购置价格</p>
                  <p className="text-sm font-medium">¥{asset.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">所属地点</p>
                  <p className="text-sm font-medium">{asset.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">存放地点</p>
                  <p className="text-sm font-medium">{asset.storagePlace}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">责任人</p>
                <p className="text-sm font-medium">{asset.owner}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">技术规格</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">类别</p>
              <Badge variant="secondary">{asset.category}</Badge>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">规格型号</p>
              <p className="text-sm bg-gray-50 p-2 rounded">{asset.modelSpec}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">发票类型</p>
                <p className="text-sm font-medium">{asset.invoiceType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">税点</p>
                <p className="text-sm font-medium">{(asset.taxRate * 100).toFixed(0)}%</p>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500">最后盘点日期</p>
              <p className="text-sm font-medium">{asset.lastCheckDate}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="pb-4 flex justify-center items-center gap-10">
          <Link className="w-2/5" href={`/asset/${assetId}/edit`}>
            <Button className="w-full" size="lg">
              <Edit className="mr-2 h-4 w-4" />
              编辑资产信息
            </Button>
          </Link>
          <Button
            className="w-2/5"
            size="lg"
            variant="destructive"
            onClick={() => handleDelete(asset.id)}
          >
            <Trash className="mr-2 h-4 w-4" />
            删除资产
          </Button>
        </div>
      </div>
    </div>
  );
}
