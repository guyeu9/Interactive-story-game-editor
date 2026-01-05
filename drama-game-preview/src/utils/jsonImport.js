// JSON导入工具函数
export const importFromCustomJson = (jsonContent, currentData, showToast) => {
  try {
    const data = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    
    if (!Array.isArray(data)) {
      showToast("JSON文件格式错误：应为数组格式", "error");
      return null;
    }

    let totalImported = {
      scenes: 0,
      layers: 0,
      plays: 0,
      commands: 0
    };

    // 处理每个数据集
    const result = {
      scenes: [...(currentData.scenes || [])],
      layers: [...(currentData.layers || [])],
      plays: [...(currentData.plays || [])],
      commands: [...(currentData.commands || [])]
    };

    data.forEach((dataset, index) => {
      if (dataset.scenes && Array.isArray(dataset.scenes)) {
        result.scenes.push(...dataset.scenes);
        totalImported.scenes += dataset.scenes.length;
      }

      if (dataset.layers && Array.isArray(dataset.layers)) {
        result.layers.push(...dataset.layers);
        totalImported.layers += dataset.layers.length;
      }

      if (dataset.plays && Array.isArray(dataset.plays)) {
        result.plays.push(...dataset.plays);
        totalImported.plays += dataset.plays.length;
      }

      if (dataset.commands && Array.isArray(dataset.commands)) {
        result.commands.push(...dataset.commands);
        totalImported.commands += dataset.commands.length;
      }
    });

    const summary = `成功导入 ${data.length} 个数据集：场景 ${totalImported.scenes} 个，层级 ${totalImported.layers} 个，玩法 ${totalImported.plays} 个，指令 ${totalImported.commands} 个`;
    
    return {
      data: result,
      summary: summary
    };
  } catch (error) {
    console.error("JSON解析错误:", error);
    showToast(`JSON解析失败: ${error.message}`, "error");
    return null;
  }
};