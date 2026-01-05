import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

/**
 * GET /api/download-apk?file=xxx.apk
 * 下载生成的 APK 文件
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    if (!file || !file.endsWith('.apk')) {
      return NextResponse.json(
        { success: false, message: '无效的文件名' },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const apkOutputDir = path.join(projectRoot, 'apk-output');
    const filePath = path.join(apkOutputDir, file);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, message: '文件不存在' },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filePath);
    const stats = await fs.stat(filePath);

    // 返回文件
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': `attachment; filename="${file}"`,
        'Content-Length': stats.size.toString(),
      },
    });

  } catch (error) {
    console.error('下载 APK 时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '下载失败: ' + error.message 
      },
      { status: 500 }
    );
  }
}
