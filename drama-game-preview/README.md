# 剧情织造机 (Drama Weaver)

交互式剧情游戏编辑器 - 创建和管理你的故事世界。

## 特性

- 🎬 **场景管理** - 创建和管理故事场景
- 🎭 **玩法设计** - 设计互动玩法和选择
- 📚 **层级系统** - 组织故事结构
- ⚡ **指令系统** - 添加随机事件和特殊效果
- 🌍 **世界观筛选** - 支持多个独立的故事世界
- 📱 **PWA 支持** - 可安装到移动设备
- 🤖 **Android APK** - 导出为独立应用

## 快速开始

### 开发模式

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:5000](http://localhost:5000) 查看应用。

### 构建生产版本

```bash
pnpm run build
pnpm run start
```

## Android APK 构建

### 方法一：使用 Web 界面构建

1. 打开应用并进入"设置"页面
2. 找到"Android APK 构建"部分
3. 点击"构建并下载 APK"按钮
4. 等待构建完成，APK 将自动下载

### 方法二：使用命令行构建

```bash
# 使用静态导出构建（推荐）
./build-apk-static.sh

# 使用服务器模式构建
./build-apk.sh
```

构建完成后，APK 文件位于 `apk-output/drama-weaver-debug.apk`

### 安装 APK

1. 将 APK 传输到 Android 设备
2. 在设备上点击 APK 文件
3. 允许"未知来源"应用安装
4. 按照提示完成安装

详细的构建指南请参考 [APK_BUILD_GUIDE.md](./APK_BUILD_GUIDE.md)

## 数据管理

### 导出数据

应用支持多种数据导出方式：

1. **JSON 导出** - 导出完整的项目数据
2. **数据链接** - 生成可分享的 Data URI 链接
3. **场景/玩法/层级** - 单独导出特定类型的数据

### 导入数据

- 支持从 JSON 文件导入项目数据
- 自动生成唯一 ID，避免冲突
- 支持自定义 JSON 格式

## 技术栈

- **Framework**: Next.js 16.0.10 (App Router)
- **Runtime**: React 19.2.1
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Mobile**: Cordova (APK 构建)

## 项目结构

```
drama-game-preview/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API 路由
│   │   └── layout.tsx   # 根布局
│   ├── components/      # React 组件
│   │   └── DramaGameComponent.jsx  # 主组件
│   └── utils/          # 工具函数
├── public/             # 静态资源
├── cordova-project/    # Cordova 项目（APK 构建）
├── apk-output/         # APK 构建输出
├── build-apk-static.sh # APK 构建脚本
└── package.json        # 项目配置
```

## 文档

- [快速开始指南](./QUICK_START.md)
- [使用指南](./GUIDE.md)
- [项目导出说明](./PROJECT_EXPORT.md)
- [APK 构建指南](./APK_BUILD_GUIDE.md)
- [示例项目](./EXAMPLES.md)

## 贡献

欢迎贡献代码！请提交 Issue 或 Pull Request。

## 许可证

MIT License

## 支持

- GitHub: https://github.com/guyeu9/Interactive-story-game-editor
- 问题反馈: https://github.com/guyeu9/Interactive-story-game-editor/issues

---

**版本**: 1.3.20
