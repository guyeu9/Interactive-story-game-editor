// 测试导入逻辑的脚本

// 模拟测试数据
const testData1 = {
  worldviewName: "王勇和体育生故事多分支世界观",
  scenarios: [
    {
      id: "wy001",
      title: "初遇体育生",
      description: "王勇在健身房第一次遇到了体育生",
      worldview: "王勇和体育生故事多分支世界观",
      choices: [
        { id: "wy001_01", text: "主动打招呼", next: "wy002" },
        { id: "wy001_02", text: "默默观察", next: "wy003" }
      ]
    },
    {
      id: "wy002",
      title: "成为朋友",
      description: "王勇和体育生开始建立友谊",
      worldview: "王勇和体育生故事多分支世界观"
    }
  ]
};

// 模拟 chineseToFirstLetters 函数（简化版）
function chineseToFirstLetters(text) {
  // 简化的拼音转换，仅用于测试
  const pinyinMap = {
    '王': 'W',
    '勇': 'Y',
    '和': 'H',
    '体': 'T',
    '育': 'Y',
    '生': 'S',
    '故': 'G',
    '事': 'S',
    '月': 'Y',
    '王': 'W'
  };
  
  return text.split('').map(char => pinyinMap[char] || char).join('').substring(0, 3);
}

// 模拟 generateSequentialId 函数（修复后版本）
function generateSequentialId(prefix, existingIds, groupPrefix = '', type = 'default', worldviewName = '') {
  // 清理和验证existingIds
  const validIds = (existingIds || []).filter(id => id && typeof id === 'string');
  
  // [关键修复] 生成世界观分组前缀
  const worldviewPrefix = worldviewName ? chineseToFirstLetters(worldviewName).substring(0, 3) : '';
  const namePrefix = (groupPrefix || worldviewPrefix || 'AAA').substring(0, 2).toUpperCase();
  
  if (type === 'layer') {
    // 层级使用世界观前缀+名称前缀+2位数字格式：L+世界观前缀(3位)+名称前缀(2位)+序号(2位)
    const basePattern = `${prefix}${worldviewPrefix}${namePrefix}`;
    
    const existingLayerNumbers = validIds
      .filter(id => id.startsWith(basePattern))
      .map(id => {
        const match = id.match(new RegExp(`^${basePattern}(\\d{2})$`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = existingLayerNumbers.length > 0 ? Math.max(...existingLayerNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    return `${basePattern}${nextNumber.toString().padStart(2, '0')}`;
  } else {
    // 其他类型（场景、玩法、指令）使用世界观前缀+名称前缀+3位数字格式：S+世界观前缀(3位)+名称前缀(2位)+序号(3位)
    const basePattern = `${prefix}${worldviewPrefix}${namePrefix}`;
    
    const existingNumbers = validIds
      .filter(id => id.startsWith(basePattern))
      .map(id => {
        const match = id.match(new RegExp(`^${basePattern}(\\d{3})$`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    return `${basePattern}${nextNumber.toString().padStart(3, '0')}`;
  }
}

// 模拟导入逻辑
function processWorldviewImport(dataset) {
  console.log("=== 处理世界观数据导入 ===");
  
  let worldviewName = "";
  let processedScenes = [];
  
  // 检查是否为新格式
  if (dataset.worldviewName && dataset.scenarios) {
    worldviewName = dataset.worldviewName;
    console.log(`✓ 检测到新格式，世界观: ${worldviewName}`);
    
    // 将 scenarios 转换为 scenes 格式
    processedScenes = dataset.scenarios.map(scenario => ({
      id: scenario.id,
      name: scenario.title,
      description: scenario.description,
      worldview: scenario.worldview || worldviewName,
      tags: [],
      choices: scenario.choices || []
    }));
    
    console.log(`✓ 转换了 ${processedScenes.length} 个场景`);
    processedScenes.forEach((scene, index) => {
      console.log(`  ${index + 1}. ${scene.name} (${scene.worldview})`);
    });
    
  } else {
    console.log("✗ 不支持的格式");
    return null;
  }
  
  // 生成新ID（使用修复后的逻辑）
  const existingSceneIds = ['S001', 'S002', 'S003', 'S004']; // 模拟现有ID
  const groupPrefix = processedScenes.length > 0 ? chineseToFirstLetters(processedScenes[0].name) : 'AAA';
  
  const scenesWithNewIds = [];
  
  processedScenes.forEach((scene, index) => {
    // [关键修复] 动态更新现有ID列表，确保每个场景获得唯一ID
    const currentExistingIds = [...existingSceneIds, ...scenesWithNewIds.map(s => s.id)];
    const newId = generateSequentialId('S', currentExistingIds, groupPrefix, 'scene', worldviewName);
    scenesWithNewIds.push({
      ...scene,
      id: newId,
      worldview: worldviewName
    });
  });
  
  console.log(`✓ 生成新ID，使用前缀: ${groupPrefix}`);
  scenesWithNewIds.forEach((scene, index) => {
    console.log(`  ${index + 1}. ${scene.id}: ${scene.name}`);
  });
  
  return {
    worldviewName,
    scenes: scenesWithNewIds,
    totalImported: scenesWithNewIds.length
  };
}

// 测试导入
console.log("开始测试导入逻辑...\n");

const result = processWorldviewImport(testData1);

console.log("\n=== 导入结果 ===");
if (result) {
  console.log(`世界观: ${result.worldviewName}`);
  console.log(`导入场景数量: ${result.totalImported}`);
  console.log("导入详情:");
  result.scenes.forEach((scene, index) => {
    console.log(`  ${index + 1}. [${scene.id}] ${scene.name} - ${scene.description}`);
    console.log(`     世界观: ${scene.worldview}`);
    if (scene.choices && scene.choices.length > 0) {
      console.log(`     选项数量: ${scene.choices.length}`);
    }
  });
}

console.log("\n=== 测试完成 ===");