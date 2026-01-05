# Android APK 自动构建指南

本项目使用 GitHub Actions 实现 Android APK 的自动化构建，无需本地搭建复杂的开发环境。

## 📋 概述

- **平台**: Cordova + Android
- **自动化工具**: GitHub Actions
- **构建触发**: Push 到 main/master 分支、Pull Request、手动触发
- **产物**: Android APK 文件

## 🚀 快速开始

### 方式一：自动触发（推荐）

1. **提交代码到 main 或 master 分支**
   ```bash
   git add .
   git commit -m "update: 准备构建 APK"
   git push origin main
   ```

2. **等待构建完成**
   - 进入 GitHub 仓库的 "Actions" 标签页
   - 查看 "Build Android APK" 工作流运行状态
   - 通常需要 5-10 分钟

3. **下载 APK**
   - 在工作流运行页面，向下滚动到 "Artifacts" 部分
   - 点击 `dramaweaver-android-apk` 下载
   - 解压后获得 `.apk` 文件

### 方式二：手动触发

1. 进入 GitHub 仓库的 "Actions" 标签页
2. 选择 "Build Android APK" 工作流
3. 点击右侧的 "Run workflow" 按钮
4. 选择分支（默认 main），点击 "Run workflow"

## 🔐 APK 签名（可选）

默认构建的 APK 是未签名的，可以正常安装但在发布应用商店前需要签名。

### 配置签名密钥

1. **生成密钥库文件**
   ```bash
   keytool -genkey -v -keystore release.keystore -alias your-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **将密钥库转换为 Base64**
   ```bash
   base64 -i release.keystore | pbcopy  # macOS
   base64 -i release.keystore -w 0     # Linux
   ```

3. **在 GitHub 仓库设置中添加 Secrets**
   - 进入仓库 Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `KEYSTORE_BASE64`: 密钥库文件的 Base64 编码
     - `KEYSTORE_PASSWORD`: 密钥库密码
     - `KEY_PASSWORD`: 密钥密码
     - `KEY_ALIAS`: 密钥别名

### 签名后构建

配置好 Secrets 后，每次构建都会自动进行签名处理。

## 📦 构建产物说明

- **文件名格式**: `dramaweaver-{version}-{timestamp}.apk`
- **保留时间**: 30 天
- **下载方式**: GitHub Actions Artifacts

## 📱 安装 APK

### 方法一：通过设备安装

1. 在 Android 设备上启用"未知来源应用"
   - 设置 → 安全 → 允许安装未知来源应用
2. 下载 APK 文件到设备
3. 在文件管理器中找到 APK 文件
4. 点击安装

### 方法二：通过 ADB 安装

```bash
adb install dramaweaver-1.0.0-20240101-120000.apk
```

## 🔧 工作流配置详情

### 触发条件

```yaml
on:
  push:
    branches:
      - main
      - master
  pull_request:
    branches:
      - main
      - master
  workflow_dispatch:  # 手动触发
```

### 构建步骤

1. 检出代码
2. 设置 Node.js 环境（v20）
3. 设置 Java 环境（v17）
4. 设置 Android SDK
5. 安装 Cordova CLI（v12.0.0）
6. 创建/更新 Cordova 项目
7. 添加 Android 平台
8. 构建 APK
9. 签名 APK（可选）
10. 上传构建产物

### 关键配置

- **Android SDK**: API 22 (min) - API 34 (target)
- **Cordova**: v12.0.0
- **Android Platform**: v12.0.1
- **Node.js**: v20

## 🛠️ 自定义构建

### 修改应用信息

编辑 `.github/workflows/build-android-apk.yml` 中的 `config.xml` 部分：

```xml
<widget id="com.dramaweaver.app" version="1.0.0">
    <name>剧情织造机</name>
    <description>你的应用描述</description>
    <author email="your@email.com">作者信息</author>
</widget>
```

### 修改网页内容

编辑 `cordova-todo/www/index.html` 文件，更新应用的前端界面和功能。

### 添加 Cordova 插件

在工作流的 "Add Android platform" 步骤之后添加：

```yaml
- name: Add plugins
  run: |
    cd cordova-todo/todo-cordova
    cordova plugin add cordova-plugin-camera
    cordova plugin add cordova-plugin-file
```

## ❓ 常见问题

### Q: 构建失败怎么办？

**A**: 检查 Actions 日志，常见原因：
- 网络问题导致依赖下载失败 → 重试工作流
- Cordova 版本不兼容 → 检查版本号
- 代码语法错误 → 本地测试后重新提交

### Q: APK 无法安装？

**A**: 
- 确认设备开启了"未知来源应用"
- 尝试卸载旧版本后重新安装
- 检查 Android 版本是否符合要求（API 22+）

### Q: 如何更新应用版本？

**A**: 修改工作流中的 `config.xml` 中的 `version` 字段：
```xml
<widget id="com.dramaweaver.app" version="1.0.1">
```

### Q: 可以构建 iOS 应用吗？

**A**: iOS 应用构建需要 macOS 环境和 Apple Developer 账号，当前工作流仅支持 Android。

### Q: 如何减少构建时间？

**A**: 
- 启用 GitHub Actions 缓存（已配置）
- 使用固定版本号避免版本检查
- 删除不必要的插件

## 📚 相关资源

- [Cordova 官方文档](https://cordova.apache.org/docs/en/latest/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Android 开发指南](https://developer.android.com/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进构建流程！

## 📄 许可证

本项目采用 MIT 许可证。
