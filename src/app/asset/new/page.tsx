"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { QRCodeSVG } from "qrcode.react";
import { createAsset } from "@/store/assetSlice";
import { AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, CheckCircle, QrCode, Download } from "lucide-react";
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

function NewAssetPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [createdAsset, setCreatedAsset] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [presetCode, setPresetCode] = useState<string>("");

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: "",
      purchaseDate: new Date().toISOString().split('T')[0],
      location: "茶山",
      price: 0,
      invoiceType: "普票",
      taxRate: 0.06,
      modelSpec: "",
      category: "电子设备",
      lastCheckDate: new Date().toISOString().split('T')[0],
      imageUrl: "",
      status: "在用",
      storagePlace: "",
      owner: "",
    },
  });

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setPresetCode(code);
    }
  }, [searchParams]);

  const onSubmit = async (data: AssetFormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (presetCode) {
        // Use direct API call when we have a preset code
        const assetData = {
          id: presetCode,
          ...data,
        };
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(assetData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create asset');
        }
        
        result = await response.json();
      } else {
        // Use Redux action for auto-generated ID
        result = await dispatch(createAsset(data)).unwrap();
      }
      
      setCreatedAsset(result);
      toast.success("资产创建成功！");
    } catch (error) {
      toast.error("创建失败，请重试");
      console.error("Create failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQRCode = () => {
    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `asset-${createdAsset.id}-qr.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Success page after asset creation
  if (createdAsset) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Success Header */}
          <div className="text-center pt-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">创建成功！</h1>
            <p className="text-gray-600">资产已成功添加到系统</p>
          </div>

          {/* Asset Info */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-center text-green-800">
                {createdAsset.name}
              </CardTitle>
              <p className="text-center text-green-600 font-mono">
                {createdAsset.id}
              </p>
            </CardHeader>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-center">资产二维码</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <QRCodeSVG
                  id="qr-code"
                  value={createdAsset.id}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600">
                请打印或截图保存此二维码，并粘贴到对应资产上
              </p>
              <Button onClick={downloadQRCode} variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                下载二维码
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Link href={`/asset/${createdAsset.id}`}>
              <Button className="w-full" size="lg">
                查看资产详情
              </Button>
            </Link>
            <Link href="/asset/new">
              <Button variant="outline" className="w-full" size="lg">
                继续添加资产
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full" size="lg">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Create form
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
          <h1 className="font-semibold text-gray-900">新增资产</h1>
          <div className="w-16"></div>
        </div>

        {/* Preset Code Display */}
        {presetCode && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <QrCode className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">扫描到的编码</p>
                  <p className="text-lg font-mono text-blue-600">{presetCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                      <FormLabel>资产名称 *</FormLabel>
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
                      <FormLabel>类别 *</FormLabel>
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
                      <FormLabel>使用状态 *</FormLabel>
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
                      <FormLabel>购置时间 *</FormLabel>
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
                      <FormLabel>购置价格 (元) *</FormLabel>
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
                      <FormLabel>发票类型 *</FormLabel>
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
                      <FormLabel>税点 (%) *</FormLabel>
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
                      <FormLabel>所属地点 *</FormLabel>
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
                      <FormLabel>存放地点 *</FormLabel>
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
                      <FormLabel>规格型号 *</FormLabel>
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
                      <FormLabel>责任人 *</FormLabel>
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
                      <FormLabel>最后盘点日期 *</FormLabel>
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
            <div className="pb-4">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    创建资产
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default function NewAssetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center py-8">
            <p className="text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    }>
      <NewAssetPageContent />
    </Suspense>
  );
}