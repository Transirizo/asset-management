import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToOSS } from '@/lib/oss';

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理上传请求');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('文件信息:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    if (!file) {
      console.log('错误: 没有找到文件');
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      console.log('错误: 不是图片文件');
      return NextResponse.json(
        { error: '只支持图片文件' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log('错误: 文件太大');
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      );
    }

    console.log('开始上传到OSS');
    const imageUrl = await uploadImageToOSS(file);
    console.log('OSS上传成功:', imageUrl);

    return NextResponse.json({
      success: true,
      url: imageUrl,
      message: '图片上传成功'
    });

  } catch (error) {
    console.error('上传错误详情:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '上传失败，请重试' },
      { status: 500 }
    );
  }
}