#!/bin/bash

# 进入项目目录
cd /workspace/projects/todo-app

# 设置环境变量
export EXPO_ANDROID_KEYSTORE_BASE64=""
export EXPO_ANDROID_KEYSTORE_ALIAS=""
export EXPO_ANDROID_KEYSTORE_PASSWORD=""
export EXPO_ANDROID_KEY_PASSWORD=""

# 尝试使用EAS构建
echo "开始构建APK..."
npx eas build --platform android --profile preview --local

# 如果EAS构建失败，尝试使用expo build:android
if [ $? -ne 0 ]; then
    echo "EAS构建失败，尝试使用expo build:android..."
    npx expo build:android --type apk --release-channel production
fi