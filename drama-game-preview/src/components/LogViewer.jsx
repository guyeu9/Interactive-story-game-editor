import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { Download, Trash2, Search, Filter, ChevronDown, ChevronUp, AlertCircle, Info, Bug, AlertTriangle } from 'lucide-react';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // 定期更新日志
    const updateLogs = () => {
      const allLogs = logger.getAllLogs();
      setLogs(allLogs);
      
      // 提取所有类别
      const uniqueCategories = [...new Set(allLogs.map(log => log.category))];
      setCategories(uniqueCategories.sort());
      
      // 应用过滤
      applyFilters(allLogs);
    };

    updateLogs();
    const interval = setInterval(updateLogs, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters(logs);
  }, [logs, searchTerm, selectedLevel, selectedCategory]);

  const applyFilters = (logData) => {
    let filtered = logData;

    // 按级别过滤
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // 按类别过滤
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(log => log.category === selectedCategory);
    }

    // 按搜索词过滤
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchLower))
      );
    }

    setFilteredLogs(filtered);
  };

  const toggleLogExpansion = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    setFilteredLogs([]);
  };

  const exportLogs = () => {
    logger.exportLogs();
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'WARN':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'INFO':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'DEBUG':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const formatData = (data) => {
    if (!data) return '';
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">应用日志查看器</h1>
            <div className="flex space-x-2">
              <button
                onClick={exportLogs}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                导出日志
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                清空日志
              </button>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{logs.length}</div>
              <div className="text-gray-500">总日志数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.level === 'ERROR').length}
              </div>
              <div className="text-gray-500">错误</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {logs.filter(l => l.level === 'WARN').length}
              </div>
              <div className="text-gray-500">警告</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredLogs.length}
              </div>
              <div className="text-gray-500">已筛选</div>
            </div>
          </div>
        </div>

        {/* 过滤器 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索日志内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 级别过滤 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="ALL">所有级别</option>
                <option value="ERROR">错误</option>
                <option value="WARN">警告</option>
                <option value="INFO">信息</option>
                <option value="DEBUG">调试</option>
              </select>
            </div>

            {/* 类别过滤 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="ALL">所有类别</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 日志列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                没有找到匹配的日志记录
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border-b border-gray-200 ${getLevelColor(log.level)}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getLevelIcon(log.level)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{log.category}</span>
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                          <div className="text-sm">{log.message}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleLogExpansion(log.id)}
                        className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expandedLogs.has(log.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* 展开的详细数据 */}
                    {expandedLogs.has(log.id) && log.data && (
                      <div className="mt-3 pl-7">
                        <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                          {formatData(log.data)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;