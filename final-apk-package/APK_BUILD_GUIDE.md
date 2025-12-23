# APK构建指南

## 方法1：使用Android Studio（推荐）

1. **下载Android Studio**: https://developer.android.com/studio
2. **导入项目**：
   - 打开Android Studio
   - 选择"Open an existing Android Studio project"
   - 导入 `simple-android` 目录
3. **构建APK**：
   - 点击 Build > Build Bundle(s) / APK(s) > Build APK(s)
   - APK文件将生成在 `app/build/outputs/apk/debug/`

## 方法2：使用命令行

### 前提条件
- Android SDK (API 21+)
- Java 8+ 
- Gradle 6.7+

### 构建步骤
```bash
cd simple-android
# 设置环境变量
export ANDROID_HOME=/path/to/android-sdk
export JAVA_HOME=/path/to/java

# 构建debug APK
./gradlew assembleDebug
```

## 方法3：使用在线构建服务

### PhoneGap Build
1. 访问：https://build.phonegap.com/
2. 注册账户
3. 上传 `cordova-project` 或 `simple-todo-app` 目录
4. 选择Android平台
5. 点击Build
6. 下载生成的APK

### AppGyver
1. 访问：https://appgyver.com/
2. 注册账户
3. 创建新项目
4. 上传HTML文件
5. 构建APK

## 项目特性

### 待办事项应用功能
- ✅ 添加新待办事项
- ✅ 标记完成状态
- ✅ 删除待办事项
- ✅ 本地数据存储
- ✅ 蓝色主题设计
- ✅ 响应式布局

### 技术规格
- **最小Android版本**: 5.0 (API 21)
- **目标Android版本**: 10.0 (API 29)
- **编程语言**: HTML5/CSS3/JavaScript
- **数据存储**: localStorage
- **界面**: Material Design

## APK信息

生成的APK将包含：
- 包名：com.simpletodo
- 应用名称：Simple Todo
- 版本：1.0 (version code: 1)
- 权限：INTERNET (如果需要网络功能)

## 安装说明

1. 在Android设备上启用"未知来源"安装
2. 下载APK文件到设备
3. 点击APK文件进行安装
4. 启动应用即可使用

## 故障排除

如果构建失败，请检查：
1. Java版本是否正确 (Java 8+)
2. Android SDK是否正确安装
3. 环境变量是否设置正确
4. 项目依赖是否完整

支持平台：
- ✅ Android 5.0+
- ✅ Android 6.0+  
- ✅ Android 7.0+
- ✅ Android 8.0+
- ✅ Android 9.0+
- ✅ Android 10+
- ✅ Android 11+
