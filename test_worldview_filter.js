// 测试世界观筛选功能的脚本
const testData = {
  scenes: [
    { id: "S001", name: "废弃实验室", worldview: "默认世界观" },
    { id: "S002", name: "中央公园", worldview: "默认世界观" },
    { id: "S003", name: "皇庭南卫星城办公室", worldview: "月王故事" },
    { id: "S004", name: "大学体育馆更衣室", worldview: "王勇和体育生故事" },
    { id: "wy001", name: "初遇体育生", worldview: "王勇和体育生故事多分支世界观" },
    { id: "yw001", name: "月王降临", worldview: "月王故事世界观" }
  ]
};

// 模拟 filterByWorldview 函数
function filterByWorldview(data, type, enableWorldviewFilter, selectedWorldview) {
  if (!enableWorldviewFilter || !selectedWorldview) return data;
  
  return data.filter(item => {
    if (type === 'scene') return item.worldview === selectedWorldview;
    if (type === 'layer') return item.worldview === selectedWorldview;
    if (type === 'play') return item.worldview === selectedWorldview;
    if (type === 'command') return item.worldview === selectedWorldview;
    return false;
  });
}

console.log("=== 测试世界观筛选功能 ===\n");

// 测试1: 不启用筛选
console.log("测试1: 不启用世界观筛选");
let result1 = filterByWorldview(testData.scenes, 'scene', false, '');
console.log("结果数量:", result1.length);
console.log("场景列表:", result1.map(s => `${s.name} (${s.worldview})`));
console.log();

// 测试2: 启用筛选，选择"月王故事"
console.log("测试2: 启用筛选，选择世界观: 月王故事");
let result2 = filterByWorldview(testData.scenes, 'scene', true, '月王故事');
console.log("结果数量:", result2.length);
console.log("场景列表:", result2.map(s => `${s.name} (${s.worldview})`));
console.log();

// 测试3: 启用筛选，选择"王勇和体育生故事"
console.log("测试3: 启用筛选，选择世界观: 王勇和体育生故事");
let result3 = filterByWorldview(testData.scenes, 'scene', true, '王勇和体育生故事');
console.log("结果数量:", result3.length);
console.log("场景列表:", result3.map(s => `${s.name} (${s.worldview})`));
console.log();

// 测试4: 启用筛选，选择"月王故事世界观" (完整名称)
console.log("测试4: 启用筛选，选择世界观: 月王故事世界观");
let result4 = filterByWorldview(testData.scenes, 'scene', true, '月王故事世界观');
console.log("结果数量:", result4.length);
console.log("场景列表:", result4.map(s => `${s.name} (${s.worldview})`));
console.log();

// 测试5: 启用筛选，选择"王勇和体育生故事多分支世界观" (完整名称)
console.log("测试5: 启用筛选，选择世界观: 王勇和体育生故事多分支世界观");
let result5 = filterByWorldview(testData.scenes, 'scene', true, '王勇和体育生故事多分支世界观');
console.log("结果数量:", result5.length);
console.log("场景列表:", result5.map(s => `${s.name} (${s.worldview})`));
console.log();

console.log("=== 测试完成 ===");