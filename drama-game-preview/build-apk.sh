#!/bin/bash
# ==========================================
# 剧情织造机 - Android APK 构建脚本
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
WEB_APP_DIR="$PROJECT_ROOT"
APK_OUTPUT_DIR="$PROJECT_ROOT/apk-output"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  剧情织造机 - Android APK 构建工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查必要的工具
echo -e "${YELLOW}[1/7] 检查构建环境...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}错误: 未找到 Node.js${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}错误: 未找到 npm${NC}" >&2; exit 1; }
echo -e "${GREEN}✓ 构建环境检查通过${NC}"
echo ""

# 清理并创建输出目录
echo -e "${YELLOW}[2/7] 准备构建目录...${NC}"
rm -rf "$APK_OUTPUT_DIR"
mkdir -p "$APK_OUTPUT_DIR"
echo -e "${GREEN}✓ 输出目录已清理${NC}"
echo ""

# 构建 Next.js 应用
echo -e "${YELLOW}[3/7] 构建 Next.js 应用...${NC}"
cd "$WEB_APP_DIR"
pnpm run build
echo -e "${GREEN}✓ Next.js 构建完成${NC}"
echo ""

# 复制构建产物到 Cordova www 目录
echo -e "${YELLOW}[4/7] 准备 Cordova 项目...${NC}"
mkdir -p "$CORDOVA_DIR/www"
cp -r "$WEB_APP_DIR/.next/static" "$CORDOVA_DIR/www/"
cp -r "$WEB_APP_DIR/public" "$CORDOVA_DIR/www/"
echo -e "${GREEN}✓ 构建产物已复制到 Cordova${NC}"
echo ""

# 创建 Cordova index.html
echo -e "${YELLOW}[5/7] 生成 Cordova 入口文件...${NC}"
cat > "$CORDOVA_DIR/www/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="format-detection" content="telephone=no">
    <title>剧情织造机</title>
    <script type="module" src="/_next/static/chunks/main-app.js"></script>
</head>
<body>
    <div id="__next"></div>
    <script src="cordova.js"></script>
</body>
</html>
EOF
echo -e "${GREEN}✓ Cordova 入口文件已生成${NC}"
echo ""

# 安装 Cordova 依赖
echo -e "${YELLOW}[6/7] 安装 Cordova 依赖...${NC}"
cd "$CORDOVA_DIR"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Cordova 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ Cordova 依赖已存在${NC}"
fi
echo ""

# 构建 APK
echo -e "${YELLOW}[7/7] 构建 Android APK...${NC}"
cd "$CORDOVA_DIR"

# 检查是否已经安装了 Cordova
if ! command -v cordova >/dev/null 2>&1; then
    echo "安装 Cordova CLI..."
    npm install -g cordova
fi

# 初始化 Cordova 项目（如果尚未初始化）
if [ ! -d "platforms/android" ]; then
    cordova platform add android
fi

# 构建调试版本 APK
cordova build android

# 复制 APK 到输出目录
LATEST_APK=$(find "$CORDOVA_DIR/platforms/android/app/build/outputs/apk/debug" -name "*.apk" | sort -r | head -1)
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
    echo -e "${YELLOW}提示: 调试版 APK 需要手动安装，安装时请允许"未知来源"应用${NC}"
else
    echo -e "${RED}❌ APK 构建失败${NC}" >&2
    exit 1
fi
