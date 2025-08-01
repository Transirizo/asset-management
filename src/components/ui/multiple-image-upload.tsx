"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import imageCompression from 'browser-image-compression';

interface MultipleImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function MultipleImageUpload({ 
  value = [], 
  onChange, 
  disabled,
  maxImages = 5 
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed max images
    if (value.length + files.length > maxImages) {
      toast.error(`最多只能上传${maxImages}张图片`);
      return;
    }

    // Validate all files first
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("只支持图片文件");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 大小不能超过10MB`);
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // 压缩图片
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
        };

        console.log(`原始文件 ${file.name} 大小:`, (file.size / 1024 / 1024).toFixed(2) + 'MB');
        const compressedFile = await imageCompression(file, options);
        console.log(`压缩后文件 ${file.name} 大小:`, (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB');

        const formData = new FormData();
        formData.append("file", compressedFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || `上传 ${file.name} 失败`);
        }

        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newUrls = [...value, ...uploadedUrls];
      onChange(newUrls);
      toast.success(`成功上传${uploadedUrls.length}张图片`);
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("图片上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(newUrls);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* 已上传的图片展示 */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={url}
                  alt={`图片 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {value.length < maxImages && (
        <div
          className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleClick}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">上传中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              {value.length === 0 ? (
                <ImageIcon className="h-8 w-8 text-gray-400" />
              ) : (
                <Plus className="h-8 w-8 text-gray-400" />
              )}
              <p className="text-sm text-gray-500">
                {value.length === 0 ? "点击上传图片" : "添加更多图片"}
              </p>
              <p className="text-xs text-gray-400">
                支持 JPG、PNG 格式，最大 10MB，最多{maxImages}张
              </p>
              <p className="text-xs text-gray-400">
                已上传 {value.length}/{maxImages} 张
              </p>
            </div>
          )}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || uploading || value.length >= maxImages}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {value.length === 0 ? "上传图片" : `添加图片 (${value.length}/${maxImages})`}
      </Button>
    </div>
  );
}