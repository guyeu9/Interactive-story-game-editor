/**
 * 下载助手工具类
 * 提供各种文件下载功能，使用 Blob URL 触发系统下载器
 */

/**
 * 下载 JSON 文件
 * @param {Object} data - 要下载的 JSON 数据
 * @param {string} filename - 文件名（不含扩展名）
 */
export function downloadJSON(data, filename) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * 下载文本文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名（含扩展名）
 * @param {string} mimeType - MIME 类型（默认 text/plain）
 */
export function downloadText(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * 下载 Blob 对象
 * @param {Blob} blob - Blob 对象
 * @param {string} filename - 文件名
 */
export function downloadBlob(blob, filename) {
  if (typeof window === 'undefined') {
    console.error('downloadBlob 只能在浏览器环境中使用');
    return;
  }

  try {
    // 创建 Blob URL
    const url = URL.createObjectURL(blob);

    // 创建临时下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // 添加到 DOM
    document.body.appendChild(link);
    
    // 触发下载
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('下载失败:', error);
    throw error;
  }
}

/**
 * 下载 URL（跨域）
 * @param {string} url - 文件 URL
 * @param {string} filename - 文件名
 */
export async function downloadURL(url, filename) {
  if (typeof window === 'undefined') {
    console.error('downloadURL 只能在浏览器环境中使用');
    return;
  }

  try {
    // 获取文件内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP 错误! 状态: ${response.status}`);
    }

    const blob = await response.blob();
    return downloadBlob(blob, filename);
  } catch (error) {
    console.error('下载 URL 失败:', error);
    throw error;
  }
}

/**
 * 导出项目数据备份
 * @param {Object} data - 项目数据 { scenes, layers, plays, commands }
 * @param {string} projectName - 项目名称
 */
export function exportProjectBackup(data, projectName = 'drama-weaver') {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${projectName}-backup-${timestamp}`;
  return downloadJSON(data, filename);
}

/**
 * 导出场景数据
 * @param {Array} scenes - 场景数据数组
 * @param {string} projectName - 项目名称
 */
export function exportScenes(scenes, projectName = 'drama-weaver') {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${projectName}-scenes-${timestamp}`;
  return downloadJSON(scenes, filename);
}

/**
 * 导出玩法数据
 * @param {Array} plays - 玩法数据数组
 * @param {string} projectName - 项目名称
 */
export function exportPlays(plays, projectName = 'drama-weaver') {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${projectName}-plays-${timestamp}`;
  return downloadJSON(plays, filename);
}

/**
 * 导出层级数据
 * @param {Array} layers - 层级数据数组
 * @param {string} projectName - 项目名称
 */
export function exportLayers(layers, projectName = 'drama-weaver') {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${projectName}-layers-${timestamp}`;
  return downloadJSON(layers, filename);
}

/**
 * 导出指令数据
 * @param {Array} commands - 指令数据数组
 * @param {string} projectName - 项目名称
 */
export function exportCommands(commands, projectName = 'drama-weaver') {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `${projectName}-commands-${timestamp}`;
  return downloadJSON(commands, filename);
}

/**
 * 从文件导入 JSON 数据
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} 解析后的 JSON 数据
 */
export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('JSON 解析失败: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file);
  });
}

/**
 * 创建下载按钮
 * @param {Function} onClick - 点击事件处理器
 * @param {string} text - 按钮文本
 * @param {Object} props - 其他属性
 * @returns {JSX.Element} React 按钮元素
 */
export function createDownloadButton(onClick, text, props = {}) {
  const { Download } = require('lucide-react');
  
  return (
    <button
      onClick={onClick}
      {...props}
      className={`flex items-center justify-center rounded-lg font-medium transition-colors active:scale-95 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 px-4 py-2 text-sm cursor-pointer ${props.className || ''}`}
    >
      <Download size={16} className="mr-2" />
      {text}
    </button>
  );
}
