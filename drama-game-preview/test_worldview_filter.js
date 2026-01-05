// 测试世界观筛选功能
const testData = [
  { id: "S001", name: "废弃实验室", worldview: "默认世界观" },
  { id: "S002", name: "中央公园", worldview: "默认世界观" },
  { id: "S003", name: "皇庭南卫星城办公室", worldview: "月王故事" },
  { id: "S004", name: "大学体育馆更衣室", worldview: "王勇和体育生故事" }
];

// 模拟filterByWorldview函数
const filterByWorldview = (data, type, enableWorldviewFilter, selectedWorldview) => {
  if (!enableWorldviewFilter || !selectedWorldview) return data;
  
  return data.filter(item => {
    if (type === 'scene') return item.worldview === selectedWorldview;
    return false;
  });
};

// 测试用例
const testCases = [
  {
    name: "禁用筛选",
    enableWorldviewFilter: false,
    selectedWorldview: "月王故事",
    expected: 4 // 应该返回所有场景
  },
  {
    name: "启用筛选，选择月王故事",
    enableWorldviewFilter: true,
    selectedWorldview: "月王故事",
    expected: 1 // 应该只返回1个场景
  },
  {
    name: "启用筛选，选择默认世界观",
    enableWorldviewFilter: true,
    selectedWorldview: "默认世界观",
    expected: 2 // 应该返回2个场景
  },
  {
    name: "启用筛选，选择不存在世界观",
    enableWorldviewFilter: true,
    selectedWorldview: "不存在",
    expected: 0 // 应该返回0个场景
  }
];

console.log("=== 测试世界观筛选功能 ===\n");

testCases.forEach(testCase => {
  const result = filterByWorldview(testData, 'scene', testCase.enableWorldviewFilter, testCase.selectedWorldview);
  const passed = result.length === testCase.expected;
  
  console.log(`${testCase.name}: ${passed ? '✅ 通过' : '❌ 失败'}`);
  console.log(`  期望: ${testCase.expected}, 实际: ${result.length}`);
  
  if (!passed) {
    console.log(`  结果:`, result.map(item => ({ id: item.id, name: item.name, worldview: item.worldview })));
  }
  console.log('');
});

console.log("=== 测试完成 ===");