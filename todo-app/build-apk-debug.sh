#!/bin/bash

# 进入项目目录
cd /workspace/projects/todo-app

# 设置环境变量
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

# 生成debug keystore（如果没有的话）
if [ ! -f "android/app/debug.keystore" ]; then
    echo "生成debug keystore..."
    keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"
fi

# 构建debug APK
echo "开始构建debug APK..."
cd android
./gradlew assembleDebug

# 检查构建结果
if [ $? -eq 0 ]; then
    echo "APK构建成功！"
    ls -la app/build/outputs/apk/debug/
else
    echo "APK构建失败！"
    exit 1
fi