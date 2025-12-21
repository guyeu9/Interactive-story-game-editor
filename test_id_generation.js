// 测试修复后的ID生成逻辑

// 模拟组件中的函数
const generateSequentialId = (prefix, existingIds, groupStartNumber = 1) => {
  // 提取现有ID中相同前缀的数字部分
  const existingNumbers = existingIds
    .filter(id => id && id.startsWith(prefix))
    .map(id => {
      const match = id.match(new RegExp(`^${prefix}(\\d+)`));
      return match ? parseInt(match[1]) : 0;
    })
    .filter(num => num > 0);

  // 找出最大的数字，如果为空则从组开始数字开始
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : groupStartNumber - 1;
  
  // 生成下一个递增的数字
  const nextNumber = maxNumber + 1;
  
  // 格式化为3位数字，保持与原始数据格式一致
  return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
};

// 测试场景
console.log('=== 测试ID生成逻辑 ===');

// 测试1：空数据集
let existingIds = [];
console.log('测试1 - 空数据集:');
console.log('生成的ID:', generateSequentialId('S', existingIds, 1)); // 应该是 S001

// 测试2：已有S001-S003
existingIds = ['S001', 'S002', 'S003'];
console.log('\n测试2 - 已有S001-S003:');
console.log('生成的ID:', generateSequentialId('S', existingIds, 1)); // 应该是 S004

// 测试3：混合ID
existingIds = ['S001', 'S003', 'P001', 'L001'];
console.log('\n测试3 - 混合ID (S001, S003):');
console.log('生成的ID:', generateSequentialId('S', existingIds, 1)); // 应该是 S004

// 测试4：层级ID
existingIds = ['L1_SETUP', 'L2_CORE', 'L3_ENDING'];
console.log('\n测试4 - 层级ID:');
console.log('生成的ID:', generateSequentialId('L', existingIds, 1)); // 应该是 L004

// 测试5：玩法ID
existingIds = ['P001', 'P002', 'P005'];
console.log('\n测试5 - 玩法ID (P001, P002, P005):');
console.log('生成的ID:', generateSequentialId('P', existingIds, 1)); // 应该是 P006

// 测试6：指令ID
existingIds = ['C001', 'C002'];
console.log('\n测试6 - 指令ID:');
console.log('生成的ID:', generateSequentialId('C', existingIds, 1)); // 应该是 C003

// 测试批量导入场景
console.log('\n=== 测试批量导入场景 ===');
let sceneIds = [];
for (let i = 0; i < 5; i++) {
  const newId = generateSequentialId('S', sceneIds, 1);
  sceneIds.push(newId);
  console.log(`第${i+1}个场景ID: ${newId}`);
}

// 测试模拟assets/自己制作.json的导入
console.log('\n=== 模拟多数据集导入 ===');
let allScenes = [];
let allLayers = [];
let allPlays = [];
let allCommands = [];

// 模拟4个数据集的导入
for (let dataset = 1; dataset <= 4; dataset++) {
  console.log(`\n数据集 ${dataset}:`);
  
  // 每个数据集12个场景
  for (let i = 0; i < 12; i++) {
    const sceneId = generateSequentialId('S', allScenes, 1);
    allScenes.push(sceneId);
  }
  
  // 每个数据集6个层级
  for (let i = 0; i < 6; i++) {
    const layerId = generateSequentialId('L', allLayers, 1);
    allLayers.push(layerId);
  }
  
  // 每个数据集22个玩法
  for (let i = 0; i < 22; i++) {
    const playId = generateSequentialId('P', allPlays, 1);
    allPlays.push(playId);
  }
  
  // 每个数据集12个指令
  for (let i = 0; i < 12; i++) {
    const commandId = generateSequentialId('C', allCommands, 1);
    allCommands.push(commandId);
  }
  
  console.log(`场景: ${allScenes.slice(-12)[0]} ~ ${allScenes.slice(-1)[0]}`);
  console.log(`层级: ${allLayers.slice(-6)[0]} ~ ${allLayers.slice(-1)[0]}`);
  console.log(`玩法: ${allPlays.slice(-22)[0]} ~ ${allPlays.slice(-1)[0]}`);
  console.log(`指令: ${allCommands.slice(-12)[0]} ~ ${allCommands.slice(-1)[0]}`);
}

console.log('\n=== 最终统计 ===');
console.log(`总场景数: ${allScenes.length}, 最后一个ID: ${allScenes[allScenes.length-1]}`);
console.log(`总层数: ${allLayers.length}, 最后一个ID: ${allLayers[allLayers.length-1]}`);
console.log(`总玩法数: ${allPlays.length}, 最后一个ID: ${allPlays[allPlays.length-1]}`);
console.log(`总指令数: ${allCommands.length}, 最后一个ID: ${allCommands[allCommands.length-1]}`);

// 验证ID唯一性
const uniqueScenes = new Set(allScenes).size;
const uniqueLayers = new Set(allLayers).size;
const uniquePlays = new Set(allPlays).size;
const uniqueCommands = new Set(allCommands).size;

console.log('\n=== 唯一性验证 ===');
console.log(`场景ID唯一性: ${uniqueScenes === allScenes.length ? '✅ 通过' : '❌ 失败'}`);
console.log(`层级ID唯一性: ${uniqueLayers === allLayers.length ? '✅ 通过' : '❌ 失败'}`);
console.log(`玩法ID唯一性: ${uniquePlays === allPlays.length ? '✅ 通过' : '❌ 失败'}`);
console.log(`指令ID唯一性: ${uniqueCommands === allCommands.length ? '✅ 通过' : '❌ 失败'}`);