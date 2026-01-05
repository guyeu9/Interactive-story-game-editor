#!/bin/bash
set -Eeuo pipefail

WORK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

kill_port_if_listening() {
    local pids
    # 使用多种方法查找占用端口的进程
    pids=$(lsof -ti :${DEV_RUN_PORT} 2>/dev/null || true)
    if [[ -z "${pids}" ]]; then
        # 备用方法：使用ss命令
        pids=$(ss -H -lntp 2>/dev/null | awk -v port="${DEV_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | tr '\n' ' ' || true)
    fi
    
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEV_RUN_PORT} is free."
      return
    fi
    
    echo "Port ${DEV_RUN_PORT} in use by PIDs: ${pids}"
    
    # 逐个终止进程
    for pid in $pids; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "Killing process $pid..."
            kill -9 "$pid" 2>/dev/null || true
        fi
    done
    
    sleep 3
    
    # 再次检查
    local remaining_pids
    remaining_pids=$(lsof -ti :${DEV_RUN_PORT} 2>/dev/null || true)
    if [[ -n "${remaining_pids}" ]]; then
        # 最后尝试：使用fuser强制清理
        echo "Final attempt with fuser..."
        fuser -k ${DEV_RUN_PORT}/tcp 2>/dev/null || true
        sleep 2
        remaining_pids=$(lsof -ti :${DEV_RUN_PORT} 2>/dev/null || true)
        if [[ -n "${remaining_pids}" ]]; then
            echo "Error: port ${DEV_RUN_PORT} still busy after all attempts, PIDs: ${remaining_pids}"
            exit 1
        fi
    else
        echo "Port ${DEV_RUN_PORT} cleared successfully."
    fi
}

start_service() {
    cd "$WORK_DIR/drama-game-preview"
    echo "启动剧情织造机服务（静态导出模式），端口: ${DEV_RUN_PORT}"
    # 使用 serve 来服务静态导出的文件
    npx serve@latest out -l ${DEV_RUN_PORT}
}

echo "Clearing port ${DEV_RUN_PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${DEV_RUN_PORT} for dev..."
start_service
