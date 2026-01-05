import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * POST /api/build-apk
 * 构建 Android APK 的 API 端点
 * 
 * 请求体:
 * - buildType: 'debug' | 'release' | 'static'
 * 
 * 返回:
 * - success: boolean
 * - message: string
 * - apkPath: string (如果构建成功)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { buildType = 'static' } = body;

    // 验证构建类型
    if (!['debug', 'release', 'static'].includes(buildType)) {
      return NextResponse.json(
        { success: false, message: '无效的构建类型' },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const scriptPath = buildType === 'static' 
      ? path.join(projectRoot, 'build-apk-static.sh')
      : path.join(projectRoot, 'build-apk.sh');

    // 检查脚本是否存在
    try {
      await fs.access(scriptPath);
    } catch {
      return NextResponse.json(
        { success: false, message: '构建脚本不存在' },
        { status: 404 }
      );
    }

    // 执行构建脚本
    console.log(`开始构建 APK (${buildType})...`);
    const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, {
      cwd: projectRoot,
      timeout: 300000, // 5分钟超时
    });

    console.log('构建输出:', stdout);
    
    if (stderr) {
      console.error('构建错误:', stderr);
    }

    // 检查 APK 是否生成
    const apkOutputDir = path.join(projectRoot, 'apk-output');
    const apkFileName = 'drama-weaver-debug.apk';
    const apkPath = path.join(apkOutputDir, apkFileName);

    try {
      await fs.access(apkPath);
      const stats = await fs.stat(apkPath);
      
      return NextResponse.json({
        success: true,
        message: 'APK 构建成功',
        apkPath: `/api/download-apk?file=${apkFileName}`,
        fileName: apkFileName,
        fileSize: stats.size,
        buildType
      });
    } catch {
      return NextResponse.json(
        { 
          success: false, 
          message: 'APK 构建失败，未找到生成的文件',
          output: stdout,
          error: stderr 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('构建 APK 时出错:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '构建过程中发生错误: ' + error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/build-apk
 * 获取构建状态信息
 */
export async function GET() {
  const projectRoot = process.cwd();
  const apkOutputDir = path.join(projectRoot, 'apk-output');

  try {
    const files = await fs.readdir(apkOutputDir);
    const apkFiles = files.filter(f => f.endsWith('.apk'));

    return NextResponse.json({
      success: true,
      hasAPK: apkFiles.length > 0,
      apkFiles: apkFiles.map(file => ({
        fileName: file,
        downloadUrl: `/api/download-apk?file=${file}`
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      hasAPK: false,
      apkFiles: []
    });
  }
}
