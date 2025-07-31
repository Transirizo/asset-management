"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { fetchAssetById, updateAsset } from "@/store/assetSlice";
import { RootState, AppDispatch } from "@/store/store";
import { Asset } from "@/models/asset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";

const assetSchema = z.object({
  name: z.string().min(1, "资产名称不能为空"),
  purchaseDate: z.string().min(1, "购置时间不能为空"),
  location: z.enum(["茶山", "松山湖", "其他"]),
  price: z.number().min(0, "价格不能为负数"),
  invoiceType: z.enum(["普票", "专票", "无票"]),
  taxRate: z.number().min(0).max(1, "税率必须在0-1之间"),
  modelSpec: z.string().min(1, "规格型号不能为空"),
  category: z.enum(["电子设备", "办公家具", "其他"]),
  lastCheckDate: z.string().min(1, "盘点日期不能为空"),
  imageUrl: z.string().optional(),
  status: z.enum(["在用", "闲置", "维修中", "报废"]),
  storagePlace: z.string().min(1, "存放地点不能为空"),
  owner: z.string().min(1, "责任人不能为空"),
});

type AssetFormData = z.infer<typeof assetSchema>;

export default function AssetEditPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentItem: asset, status } = useSelector((state: RootState) => state.assets);

  const assetId = params.id as string;

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      purchaseDate: "",
      location: "茶山",
      price: 0,
      invoiceType: "普票",
      taxRate: 0.06,
      modelSpec: "",
      category: "电子设备",
      lastCheckDate: "",
      imageUrl: "",
      status: "在用",
      storagePlace: "",
      owner: "",
    },
  });

  useEffect(() => {
    if (assetId && !asset) {
      dispatch(fetchAssetById(assetId));
    }
  }, [dispatch, assetId, asset]);

  useEffect(() => {
    if (asset) {
      form.reset({
        name: asset.name,
        purchaseDate: asset.purchaseDate,
        location: asset.location,
        price: asset.price,
        invoiceType: asset.invoiceType,
        taxRate: asset.taxRate,
        modelSpec: asset.modelSpec,
        category: asset.category,
        lastCheckDate: asset.lastCheckDate,
        imageUrl: asset.imageUrl || "",
        status: asset.status,
        storagePlace: asset.storagePlace,
        owner: asset.owner,
      });
    }
  }, [asset, form]);

  const onSubmit = async (data: AssetFormData) => {
    if (!asset) return;

    const updatedAsset: Asset = {
      ...asset,
      ...data,
    };

    try {
      await dispatch(updateAsset(updatedAsset)).unwrap();
      toast.success("资产信息更新成功");
      router.push(`/asset/${assetId}`);
    } catch (error) {
      toast.error("更新失败，请重试");
      console.error("Update failed:", error);
    }
  };

  if (status === "loading" || !asset) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <Link href={`/asset/${assetId}`}>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={`/asset/${assetId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </Link>
          <h1 className="font-semibold text-gray-900">编辑资产</h1>
          <div className="w-16"></div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>资产名称</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入资产名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>类别</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择类别" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="电子设备">电子设备</SelectItem>
                          <SelectItem value="办公家具">办公家具</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>使用状态</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择状态" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="在用">在用</SelectItem>
                          <SelectItem value="闲置">闲置</SelectItem>
                          <SelectItem value="维修中">维修中</SelectItem>
                          <SelectItem value="报废">报废</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Purchase Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">购置信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>购置时间</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>购置价格 (元)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发票类型</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择发票类型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="普票">普票</SelectItem>
                          <SelectItem value="专票">专票</SelectItem>
                          <SelectItem value="无票">无票</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>税点 (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="6"
                          {...field}
                          onChange={(e) => field.onChange((parseFloat(e.target.value) || 0) / 100)}
                          value={(field.value * 100).toString()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">位置信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>所属地点</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择地点" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="茶山">茶山</SelectItem>
                          <SelectItem value="松山湖">松山湖</SelectItem>
                          <SelectItem value="其他">其他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="storagePlace"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>存放地点</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入具体存放地点" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">技术规格</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="modelSpec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>规格型号</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="请输入规格型号详细信息"
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>责任人</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入责任人姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastCheckDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最后盘点日期</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>资产照片 URL (可选)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex space-x-4 pb-4">
              <Button type="submit" className="flex-1" size="lg">
                <Save className="mr-2 h-4 w-4" />
                保存更改
              </Button>
              <Link href={`/asset/${assetId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full" size="lg">
                  <X className="mr-2 h-4 w-4" />
                  取消
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}