# 剧情织造机 - Android APK 构建指南

## 概述

本文档说明如何将剧情织造机构建为 Android APK 应用程序。

## 方法一：使用静态导出构建（推荐）

### 前提条件

- Node.js 18+ 已安装
- Java JDK 8+ 已安装
- Android SDK 已安装
- pnpm 包管理器

### 构建步骤

1. **运行构建脚本**
   ```bash
   cd drama-game-preview
   ./build-apk-static.sh
   ```

2. **构建完成后**
   - APK 文件位于：`apk-output/drama-weaver-debug.apk`
   - 文件大小约 10-20 MB

3. **安装到 Android 设备**
   - 将 APK 传输到 Android 设备
   - 点击 APK 文件开始安装
   - 允许"未知来源"应用安装

## 方法二：使用服务器模式构建

如果应用需要服务器功能，使用此方法：

```bash
./build-apk.sh
```

**注意**：此方法需要应用运行在服务器端，APK仅包含客户端代码。

## 手动构建步骤

如果自动脚本失败，可以手动执行以下步骤：

### 1. 安装 Cordova CLI

```bash
npm install -g cordova
```

### 2. 安装 Android SDK

确保已安装以下组件：
- Android SDK Platform Tools
- Android SDK Build-Tools
- Android SDK Platform (API 24+)

### 3. 构建 Next.js 应用

```bash
cd drama-game-preview
pnpm run build
```

### 4. 准备 Cordova 项目

```bash
cd cordova-project
npm install
```

### 5. 添加 Android 平台

```bash
cordova platform add android
```

### 6. 构建 APK

```bash
# Debug 版本
cordova build android

# Release 版本（需要签名）
cordova build android --release
```

## 前端导出功能

### 导出项目数据

应用内置了导出功能，可以导出以下内容：

1. **项目数据备份** - JSON 格式的完整项目数据
2. **场景数据** - 所有场景的配置
3. **玩法数据** - 所有玩法的配置
4. **层级数据** - 所有层级的配置

### 导出步骤

1. 打开应用
2. 进入"设置"页面
3. 点击"导出数据"按钮
4. 选择要导出的内容
5. 确认导出
6. 文件将自动下载到设备

### 下载触发器说明

导出功能使用以下技术触发系统下载器：

```javascript
// 创建 Blob 对象
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

// 创建下载链接
const url = URL.createObjectURL(blob);

// 创建临时链接元素
const link = document.createElement('a');
link.href = url;
link.download = `drama-weaver-backup-${Date.now()}.json`;

// 触发下载
document.body.appendChild(link);
link.click();

// 清理
document.body.removeChild(link);
URL.revokeObjectURL(url);
```

## 常见问题

### Q1: 构建失败提示"ANDROID_HOME 未设置"

**解决方案**：
```bash
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Q2: JDK 版本不兼容

**解决方案**：
- 使用 JDK 8 或 JDK 11
- 确保 JAVA_HOME 指向正确的 JDK 版本

### Q3: Cordova 平台添加失败

**解决方案**：
```bash
cd cordova-project
cordova platform remove android
cordova platform add android --no-insight
```

### Q4: APK 安装时提示"解析包错误"

**解决方案**：
- 确保下载的 APK 文件完整
- 尝试重新构建 APK
- 检查 Android 设备版本（需要 Android 7.0+）

### Q5: 应用无法启动

**解决方案**：
- 检查应用权限是否已授予
- 查看 Android Logcat 日志
- 确保静态导出配置正确

## 发布到应用商店

如果要发布到 Google Play 或其他应用商店：

1. **生成签名密钥**
   ```bash
   keytool -genkey -v -keystore drama-weaver.keystore -alias drama-weaver -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **签名 APK**
   ```bash
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore drama-weaver.keystore app-release-unsigned.apk drama-weaver

   zipalign -v 4 app-release-unsigned.apk drama-weaver-release.apk
   ```

3. **上传到应用商店**

## 性能优化建议

1. **减小 APK 大小**
   - 使用 ProGuard/R8 进行代码混淆和优化
   - 移除未使用的库
   - 压缩图片资源

2. **提升应用性能**
   - 启用 Next.js 静态导出
   - 优化图片加载
   - 使用 Service Worker 缓存资源

3. **减少启动时间**
   - 预加载关键资源
   - 优化 JavaScript 代码
   - 使用 Web Workers 处理耗时任务

## 技术支持

如有问题，请访问：
- GitHub: https://github.com/guyeu9/Interactive-story-game-editor
- Issue Tracker: https://github.com/guyeu9/Interactive-story-game-editor/issues

## 版本历史

- v1.0.0 - 初始版本
  - 支持静态导出构建
  - 支持调试和发布版本
  - 包含前端导出功能
