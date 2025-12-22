#!/bin/bash

echo "开始构建Android APK..."

cd /workspace/projects/native-todo-app

# 设置环境变量
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_HOME=/usr/lib/android-sdk

# 创建local.properties
echo "sdk.dir=$ANDROID_HOME" > local.properties

# 生成debug keystore
if [ ! -f "app/debug.keystore" ]; then
    keytool -genkey -v -keystore app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US" 2>/dev/null
fi

# 创建签名配置
mkdir -p app/src/main/java/com/todoapp

# 修改build.gradle以包含签名配置
cat >> build.gradle << 'EOF'

android {
    signingConfigs {
        debug {
            storeFile file('app/debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
    }
}
EOF

# 尝试构建
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "=== 构建成功! ==="
    echo "APK文件位置："
    find . -name "*.apk" -type f
    ls -la app/build/outputs/apk/debug/
else
    echo "=== 构建失败 ==="
    echo "尝试其他方法..."
fi