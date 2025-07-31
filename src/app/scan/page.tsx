"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Camera, CameraOff, QrCode } from "lucide-react";
import { toast } from "sonner";

export default function ScanPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleScanResult = async (result: any) => {
    const scannedText = result?.[0]?.rawValue || result?.data || result;
    console.log("QR code detected:", scannedText);
    
    // Temporarily stop scanning to prevent multiple scans
    setIsScanning(false);

    try {
      // First check if asset exists in database
      const response = await fetch(`/api/assets/${encodeURIComponent(scannedText)}`);
      
      if (response.ok) {
        // Asset exists, navigate to asset detail page
        toast.success(`识别到资产: ${scannedText}`);
        router.push(`/asset/${scannedText}`);
      } else if (response.status === 404) {
        // Asset doesn't exist, navigate to new asset page with pre-filled code
        toast.info("资产不存在，跳转到新增页面");
        router.push(`/asset/new?code=${encodeURIComponent(scannedText)}`);
      } else {
        throw new Error("查询资产失败");
      }
    } catch (error) {
      console.error("Failed to check asset:", error);
      toast.error("查询资产时出现错误");
      
      // Show dialog asking if user wants to create new asset
      setTimeout(() => {
        const shouldCreate = confirm(
          "无法查询资产信息。是否要创建新资产？"
        );
        if (shouldCreate) {
          router.push(`/asset/new?code=${encodeURIComponent(scannedText)}`);
        } else {
          // Restart scanning
          setTimeout(() => {
            setIsScanning(true);
          }, 500);
        }
      }, 1000);
    }
  };

  const handleError = (err: any) => {
    console.error("Scanner error:", err);
    setError(err?.message || "扫描时出现错误");
    toast.error("扫描器初始化失败");
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    setError(null);
  };

  if (error) {
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
            <CardHeader>
              <CardTitle className="text-center text-red-600">扫描器错误</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <CameraOff className="mx-auto h-16 w-16 text-red-400" />
              <CardDescription>
                {error}
              </CardDescription>
              <Button onClick={() => window.location.reload()} className="w-full">
                刷新页面
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </Link>
          <h1 className="text-white font-semibold">扫描二维码</h1>
          <div className="w-16"></div>
        </div>

        {/* Scanner */}
        <div className="relative rounded-lg overflow-hidden">
          {isScanning ? (
            <Scanner
              onScan={handleScanResult}
              onError={handleError}
              constraints={{
                facingMode: 'environment',
              }}
              styles={{
                container: {
                  width: '100%',
                  height: '320px',
                },
                video: {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                },
              }}
            />
          ) : (
            <div className="w-full h-80 bg-gray-800 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <CameraOff className="mx-auto h-16 w-16 mb-4 text-gray-400" />
                <p className="text-gray-300">扫描已暂停</p>
              </div>
            </div>
          )}
          
          {/* Scanning overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <QrCode className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">将二维码对准此区域</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 space-y-4">
          <Button
            onClick={toggleScanning}
            className="w-full"
            variant={isScanning ? "destructive" : "default"}
          >
            {isScanning ? (
              <>
                <CameraOff className="mr-2 h-4 w-4" />
                停止扫描
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                开始扫描
              </>
            )}
          </Button>

          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <CardDescription className="text-gray-300 text-center">
                扫描资产上的二维码即可查看详细信息
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}