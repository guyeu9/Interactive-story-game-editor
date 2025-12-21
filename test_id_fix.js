// 测试ID修复功能的脚本
const fs = require('fs');

// 模拟数据
const testData = {
  scenes: [
    { id: "S001", name: "废弃实验室", worldview: "默认世界观" },
    { id: "S002", name: "中央公园", worldview: "默认世界观" },
    { id: "STYSTY001", name: "大学体育馆更衣室 - 初次潜入", worldview: "王勇和体育生故事" },
    { id: "STYSTY001", name: "更衣室 - 初步调教", worldview: "王勇和体育生故事" },
    { id: "STYSTY001", name: "更衣室 - 深度接触", worldview: "王勇和体育生故事" },
    { id: "SAAAAA001", name: "皇庭南卫星城办公室", worldview: "月王故事" },
    { id: "SAAAAA001", name: "海岸运输船杂兵舱", worldview: "月王故事" }
  ],
  plays: [
    { id: "P001", name: "搜寻物资", worldview: "默认世界观" },
    { id: "PTYSTY001", name: "初次偷闻白袜", worldview: "王勇和体育生故事" },
    { id: "PTYSTY001", name: "含袜拍照", worldview: "王勇和体育生故事" }
  ],
  commands: [
    { id: "C001", name: "突发地震", worldview: "默认世界观" },
    { id: "CTYSTY001", name: "尿柱同时多股", worldview: "王勇和体育生故事" },
    { id: "CTYSTY001", name: "围观嘲笑", worldview: "王勇和体育生故事" }
  ]
};

// 中文字符转拼音（简化版）
function chineseToFirstLetters(str) {
  const pinyinMap = {
    '王': 'W', '勇': 'Y', '和': 'H', '体': 'T', '育': 'Y', '生': 'S',
    '月': 'Y', '皇': 'H', '庭': 'T', '南': 'N', '卫': 'W', '星': 'X', '城': 'C',
    '废': 'F', '弃': 'Q', '实': 'S', '验': 'Y', '室': 'S', '中': 'Z', '央': 'Y',
    '公': 'G', '园': 'Y', '大': 'D', '学': 'X', '体': 'T', '育': 'Y', '馆': 'G',
    '更': 'G', '衣': 'Y', '室': 'S', '初': 'C', '次': 'C', '潜': 'Q', '入': 'R',
    '调': 'D', '教': 'J', '深': 'S', '度': 'D', '接': 'J', '触': 'C',
    '校': 'X', '园': 'Y', '操': 'C', '场': 'C', '夜': 'Y', '间': 'J', '暴': 'B',
    '露': 'L', '空': 'K', '教': 'J', '室': 'S', '捆': 'K', '绑': 'B', '与': 'Y',
    '尿': 'N', '浴': 'Y', '公': 'G', '厕': 'C', '隔': 'G', '间': 'J', '群': 'Q',
    '训': 'X', '狗': 'G', '宿': 'S', '舍': 'S', '走': 'Z', '廊': 'L', '轮': 'L',
    '操': 'C', '图': 'T', '书': 'S', '馆': 'G', '架': 'J', '隐': 'Y', '秘': 'M',
    '闻': 'W', '街': 'J', '头': 'T', '极': 'J', '致': 'Z', '淋': 'L', '浴': 'Y',
    '间': 'J', '最': 'Z', '终': 'Z', '群': 'Q', '舍': 'S', '床': 'C', '底': 'D',
    '隐': 'Y', '藏': 'C', '偷': 'T', '窥': 'K', '野': 'Y', '外': 'W', '湖': 'H',
    '边': 'B', '求': 'Q', '健': 'J', '身': 'S', '房': 'F', '器': 'Q', '械': 'X',
    '屋': 'W', '顶': 'D', '间': 'J', '群': 'Q', '调': 'D', '教': 'J', '学': 'X',
    '楼': 'L', '走': 'Z', '廊': 'L', '隐': 'Y', '秘': 'M', '自': 'Z', '辱': 'R'
  };
  
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    result += pinyinMap[char] || char;
  }
  return result;
}

// 生成序号ID（修复版）
function generateSequentialId(prefix, existingIds, groupPrefix = '', type = 'default', worldviewName = '') {
  const validIds = (existingIds || []).filter(id => id && typeof id === 'string');
  const worldviewPrefix = worldviewName ? chineseToFirstLetters(worldviewName).substring(0, 3) : '';
  const namePrefix = (groupPrefix || worldviewPrefix || 'AAA').substring(0, 2).toUpperCase();
  
  if (type === 'layer') {
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

// 修复重复ID
function fixDuplicateIds(data) {
  const fixDataArray = (items, idKey, prefix, type) => {
    const fixedItems = [];
    const allExistingIds = [];
    
    // 按世界观分组处理
    const groupedByWorldview = {};
    items.forEach(item => {
      const worldview = item.worldview || '默认世界观';
      if (!groupedByWorldview[worldview]) {
        groupedByWorldview[worldview] = [];
      }
      groupedByWorldview[worldview].push(item);
    });

    Object.keys(groupedByWorldview).forEach(worldview => {
      const worldviewItems = groupedByWorldview[worldview];
      const worldviewPrefix = chineseToFirstLetters(worldview).substring(0, 3);
      
      worldviewItems.forEach((item, index) => {
        const namePrefix = item.name || item.layer_name || item.title || '';
        const namePart = chineseToFirstLetters(namePrefix).substring(0, 2).toUpperCase();
        
        const existingForWorldview = fixedItems
          .filter(fixed => fixed.worldview === worldview)
          .map(fixed => fixed[idKey]);
        
        const allExisting = [...allExistingIds, ...existingForWorldview];
        
        const newId = generateSequentialId(prefix, allExisting, namePart, type, worldview);
        
        const oldId = item[idKey];
        const fixedItem = {
          ...item,
          [idKey]: newId
        };
        
        fixedItems.push(fixedItem);
        allExistingIds.push(newId);
        
        console.log(`修复${type}项ID: ${oldId} -> ${newId} (${item.name || '未知'}, ${worldview})`);
      });
    });
    
    return fixedItems;
  };

  return {
    scenes: fixDataArray(data.scenes || [], 'id', 'S', 'scene'),
    plays: fixDataArray(data.plays || [], 'id', 'P', 'play'),
    commands: fixDataArray(data.commands || [], 'id', 'C', 'command')
  };
}

// 测试修复功能
console.log('=== 测试ID修复功能 ===');

// 分析原始数据
console.log('\n--- 原始数据分析 ---');
const originalScenes = testData.scenes.map(s => s.id);
const originalSceneIds = new Set(originalScenes);
console.log('场景ID:', originalScenes);
console.log('重复场景ID:', originalScenes.filter((id, index) => originalScenes.indexOf(id) !== index));

const originalPlays = testData.plays.map(p => p.id);
const originalPlayIds = new Set(originalPlays);
console.log('玩法ID:', originalPlays);
console.log('重复玩法ID:', originalPlays.filter((id, index) => originalPlays.indexOf(id) !== index));

const originalCommands = testData.commands.map(c => c.id);
const originalCommandIds = new Set(originalCommands);
console.log('指令ID:', originalCommands);
console.log('重复指令ID:', originalCommands.filter((id, index) => originalCommands.indexOf(id) !== index));

// 执行修复
console.log('\n--- 开始修复 ---');
const fixedData = fixDuplicateIds(testData);

// 验证修复结果
console.log('\n--- 修复后数据分析 ---');
const fixedScenes = fixedData.scenes.map(s => s.id);
const fixedSceneIds = new Set(fixedScenes);
console.log('修复后场景ID:', fixedScenes);
console.log('场景ID唯一性:', fixedScenes.length === fixedSceneIds.size);

const fixedPlays = fixedData.plays.map(p => p.id);
const fixedPlayIds = new Set(fixedPlays);
console.log('修复后玩法ID:', fixedPlays);
console.log('玩法ID唯一性:', fixedPlays.length === fixedPlayIds.size);

const fixedCommands = fixedData.commands.map(c => c.id);
const fixedCommandIds = new Set(fixedCommands);
console.log('修复后指令ID:', fixedCommands);
console.log('指令ID唯一性:', fixedCommands.length === fixedCommandIds.size);

// 输出修复后的数据结构
console.log('\n--- 修复后数据示例 ---');
console.log('场景示例:');
fixedData.scenes.slice(0, 3).forEach(scene => {
  console.log(`  ${scene.id}: ${scene.name} (${scene.worldview})`);
});

console.log('玩法示例:');
fixedData.plays.slice(0, 2).forEach(play => {
  console.log(`  ${play.id}: ${play.name} (${play.worldview})`);
});

console.log('指令示例:');
fixedData.commands.slice(0, 2).forEach(command => {
  console.log(`  ${command.id}: ${command.name} (${command.worldview})`);
});

// 保存修复后的数据
const outputPath = '/workspace/projects/fixed_test_data.json';
fs.writeFileSync(outputPath, JSON.stringify(fixedData, null, 2));
console.log(`\n修复后的数据已保存到: ${outputPath}`);

console.log('\n=== 测试完成 ===');