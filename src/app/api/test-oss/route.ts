import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 检查环境变量
    const config = {
      region: process.env.NEXT_PUBLIC_OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID ? '已设置' : '未设置',
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ? '已设置' : '未设置',
      bucket: process.env.OSS_BUCKET,
    };

    return NextResponse.json({
      success: true,
      config,
      message: 'OSS配置检查完成'
    });

  } catch (error) {
    console.error('OSS配置检查错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '检查失败' },
      { status: 500 }
    );
  }
}