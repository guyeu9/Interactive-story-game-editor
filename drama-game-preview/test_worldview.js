// 测试世界观筛选功能
const testWorldviewFilter = () => {
  console.log("=== 世界观筛选功能测试 ===");
  
  // 模拟数据
  const testData = [
    { id: 'S001', name: '场景1', worldview: '奇幻世界' },
    { id: 'S002', name: '场景2', worldview: '现代都市' },
    { id: 'S003', name: '场景3', worldview: '' }, // 无世界观
    { id: 'S004', name: '场景4' } // 无worldview字段
  ];
  
  // 模拟筛选函数
  const filterByWorldview = (data, type, selectedWorldview, enableWorldviewFilter) => {
    if (!enableWorldviewFilter || !selectedWorldview) return data;
    
    return data.filter(item => {
      // 修复后的逻辑
      if (type === 'scene') return item.worldview && item.worldview === selectedWorldview;
      return false;
    });
  };
  
  // 测试用例
  const testCases = [
    {
      name: "启用筛选，选择奇幻世界",
      enableWorldviewFilter: true,
      selectedWorldview: '奇幻世界',
      expected: 1
    },
    {
      name: "启用筛选，选择现代都市",
      enableWorldviewFilter: true,
      selectedWorldview: '现代都市',
      expected: 1
    },
    {
      name: "启用筛选，选择不存在的世界观",
      enableWorldviewFilter: true,
      selectedWorldview: '科幻世界',
      expected: 0
    },
    {
      name: "禁用筛选",
      enableWorldviewFilter: false,
      selectedWorldview: '奇幻世界',
      expected: 4 // 返回所有数据
    }
  ];
  
  testCases.forEach(testCase => {
    const result = filterByWorldview(testData, 'scene', testCase.selectedWorldview, testCase.enableWorldviewFilter);
    const passed = result.length === testCase.expected;
    
    console.log(`${testCase.name}: ${passed ? '✅ 通过' : '❌ 失败'} (期望 ${testCase.expected}，实际 ${result.length})`);
    if (!passed) {
      console.log(`  结果:`, result);
    }
  });
};

testWorldviewFilter();