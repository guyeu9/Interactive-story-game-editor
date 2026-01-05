#!/bin/bash
# ==========================================
# 剧情织造机 - Android APK 构建脚本（静态导出版本）
# ==========================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
CORDOVA_DIR="$PROJECT_ROOT/cordova-project"
APK_OUTPUT_DIR="$PROJECT_ROOT/apk-output"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  剧情织造机 - APK 构建工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查必要的工具
echo -e "${YELLOW}[1/6] 检查构建环境...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}错误: 未找到 Node.js${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ 构建环境检查通过${NC}"
echo ""

# 清理并创建输出目录
echo -e "${YELLOW}[2/6] 准备构建目录...${NC}"
rm -rf "$APK_OUTPUT_DIR"
mkdir -p "$APK_OUTPUT_DIR"
echo -e "${GREEN}✓ 输出目录已清理${NC}"
echo ""

# 构建静态版本
echo -e "${YELLOW}[3/6] 构建 Next.js 静态导出...${NC}"
cd "$PROJECT_ROOT"

# 检查是否支持静态导出
if grep -q '"output": "export"' next.config.ts 2>/dev/null || grep -q '"output": "export"' package.json 2>/dev/null; then
    echo "使用静态导出模式..."
    pnpm run build
else
    echo "配置静态导出..."
    # 临时修改配置启用静态导出
    cp next.config.ts next.config.ts.backup 2>/dev/null || true

    # 更新 next.config.ts 以支持静态导出
    cat > next.config.ts << 'EOF'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
EOF

    pnpm run build

    # 恢复原始配置
    mv next.config.ts.backup next.config.ts 2>/dev/null || echo "原始配置不存在，跳过恢复"
fi

echo -e "${GREEN}✓ 静态导出完成${NC}"
echo ""

# 复制构建产物到 Cordova www 目录
echo -e "${YELLOW}[4/6] 准备 Cordova 项目...${NC}"
mkdir -p "$CORDOVA_DIR/www"
cp -r out/* "$CORDOVA_DIR/www/"
echo -e "${GREEN}✓ 构建产物已复制到 Cordova${NC}"
echo ""

# 创建 Cordova 配置（如果不存在）
echo -e "${YELLOW}[5/6] 配置 Cordova 项目...${NC}"
if [ ! -f "$CORDOVA_DIR/config.xml" ]; then
    echo "错误: Cordova 配置文件不存在"
    exit 1
fi

# 安装 Cordova 依赖
cd "$CORDOVA_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Cordova 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ Cordova 依赖已存在${NC}"
fi
echo ""

# 构建 APK
echo -e "${YELLOW}[6/6] 构建 Android APK...${NC}"

# 检查是否已经安装了 Cordova
if ! command -v cordova >/dev/null 2>&1; then
    echo "安装 Cordova CLI..."
    npm install -g cordova
fi

# 初始化 Cordova 项目（如果尚未初始化）
if [ ! -d "platforms/android" ]; then
    cordova platform add android --no-insight
fi

# 构建调试版本 APK
cordova build android --no-insight

# 复制 APK 到输出目录
LATEST_APK=$(find "$CORDOVA_DIR/platforms/android/app/build/outputs/apk/debug" -name "*.apk" 2>/dev/null | sort -r | head -1)

if [ -f "$LATEST_APK" ]; then
    cp "$LATEST_APK" "$APK_OUTPUT_DIR/drama-weaver-debug.apk"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✅ APK 构建成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}APK 位置: ${NC}$APK_OUTPUT_DIR/drama-weaver-debug.apk"
    echo -e "${BLUE}文件大小: $(du -h "$APK_OUTPUT_DIR/drama-weaver-debug.apk" | cut -f1)${NC}"
    echo ""
    echo -e "${YELLOW}安装方法:${NC}"
    echo "1. 将 APK 传输到 Android 设备"
    echo "2. 在设备上点击 APK 文件"
    echo "3. 允许安装"未知来源"应用"
    echo "4. 按照提示完成安装"
else
    echo -e "${RED}❌ APK 构建失败${NC}" >&2
    echo ""
    echo "检查日志以了解详细错误信息"
    exit 1
fi
