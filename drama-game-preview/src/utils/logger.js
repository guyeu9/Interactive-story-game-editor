// 详细日志记录系统
export class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // 最大日志条数
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };
    this.currentLevel = this.logLevels.DEBUG;
  }

  // 格式化时间戳
  timestamp() {
    return new Date().toISOString();
  }

  // 添加日志
  log(level, category, message, data = null) {
    const logEntry = {
      timestamp: this.timestamp(),
      level,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      id: Math.random().toString(36).substr(2, 9)
    };

    this.logs.push(logEntry);

    // 保持日志数量限制
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 控制台输出
    const consoleMessage = `[${logEntry.timestamp}] ${level} [${category}] ${message}`;
    
    switch (level) {
      case 'ERROR':
        console.error(consoleMessage, data);
        break;
      case 'WARN':
        console.warn(consoleMessage, data);
        break;
      case 'INFO':
        console.info(consoleMessage, data);
        break;
      case 'DEBUG':
      default:
        console.log(consoleMessage, data);
        break;
    }
  }

  // 便捷方法
  debug(category, message, data) {
    this.log('DEBUG', category, message, data);
  }

  info(category, message, data) {
    this.log('INFO', category, message, data);
  }

  warn(category, message, data) {
    this.log('WARN', category, message, data);
  }

  error(category, message, data) {
    this.log('ERROR', category, message, data);
  }

  // 获取所有日志
  getAllLogs() {
    return [...this.logs];
  }

  // 按类别获取日志
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  // 按级别获取日志
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  // 获取最近的日志
  getRecentLogs(count = 50) {
    return this.logs.slice(-count);
  }

  // 清空日志
  clearLogs() {
    this.logs = [];
    this.info('LOGGER', '日志已清空');
  }

  // 导出日志
  exportLogs() {
    // 检查浏览器环境
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('无法在非浏览器环境中导出日志');
      return;
    }

    const logData = {
      exportTime: this.timestamp(),
      totalLogs: this.logs.length,
      logs: this.logs
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drama-game-logs-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// 创建全局日志实例
export const logger = new Logger();

// React Hook for logging
export const useLogger = () => {
  return {
    log: (level, category, message, data) => logger.log(level, category, message, data),
    debug: (category, message, data) => logger.debug(category, message, data),
    info: (category, message, data) => logger.info(category, message, data),
    warn: (category, message, data) => logger.warn(category, message, data),
    error: (category, message, data) => logger.error(category, message, data),
    getLogs: () => logger.getAllLogs(),
    getRecentLogs: (count) => logger.getRecentLogs(count),
    exportLogs: () => logger.exportLogs(),
    clearLogs: () => logger.clearLogs()
  };
};

// 错误边界日志记录
export const logError = (error, errorInfo = null, context = null) => {
  logger.error('ERROR_BOUNDARY', '未捕获的错误', {
    error: error.message,
    stack: error.stack,
    errorInfo,
    context,
    timestamp: new Date().toISOString()
  });
};

// 性能监控
export const logPerformance = (name, startTime, endTime = null, data = null) => {
  const duration = endTime ? endTime - startTime : performance.now() - startTime;
  logger.info('PERFORMANCE', `${name} 耗时`, {
    duration: `${duration.toFixed(2)}ms`,
    ...data
  });
  return duration;
};

// 用户操作记录
export const logUserAction = (action, details = null) => {
  logger.info('USER_ACTION', action, details);
};

// 数据变化记录
export const logDataChange = (dataType, operation, before, after, identifier = null) => {
  logger.info('DATA_CHANGE', `${dataType} ${operation}`, {
    identifier,
    before: before ? JSON.parse(JSON.stringify(before)) : null,
    after: after ? JSON.parse(JSON.stringify(after)) : null,
    timestamp: new Date().toISOString()
  });
};