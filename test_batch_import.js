// 测试批量导入的ID生成和世界观应用
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

console.log('=== 测试批量导入ID生成 ===');

// 模拟现有数据
let existingSceneIds = ['S001', 'S002'];
let existingLayerIds = ['L001', 'L002'];
let existingPlayIds = ['P001'];
let existingCommandIds = ['C001'];

console.log('现有场景ID:', existingSceneIds);
console.log('现有层级ID:', existingLayerIds);
console.log('现有玩法ID:', existingPlayIds);
console.log('现有指令ID:', existingCommandIds);

// 模拟批量导入3个场景
console.log('\n--- 批量导入3个场景 ---');
let currentIds = [...existingSceneIds];
for (let i = 0; i < 3; i++) {
  const newId = generateSequentialId('S', currentIds, 1);
  currentIds.push(newId);
  console.log(`第${i+1}个场景ID: ${newId}`);
}
console.log('场景ID数组:', currentIds);

// 模拟批量导入2个层级
console.log('\n--- 批量导入2个层级 ---');
currentIds = [...existingLayerIds];
for (let i = 0; i < 2; i++) {
  const newId = generateSequentialId('L', currentIds, 1);
  currentIds.push(newId);
  console.log(`第${i+1}个层级ID: ${newId}`);
}
console.log('层级ID数组:', currentIds);

console.log('\n=== 测试世界观逻辑 ===');

// 模拟世界观提取逻辑
function testWorldviewExtraction(type, enableWorldviewFilter, selectedWorldview, lines, layers, batchLayerId, batchCommandScope, scenes) {
  let worldviewName = "";
  
  if (enableWorldviewFilter && selectedWorldview) {
    worldviewName = selectedWorldview;
  } else if (type === 'scene' && lines.length > 0) {
    const firstLine = lines[0].trim().replace(/^[\d\-\.\、\)\(]+\s*/, '');
    const name = firstLine.split(/[|｜:：]/)[0]?.trim();
    worldviewName = name || "未命名世界观";
  } else if (type === 'play') {
    if (batchLayerId) {
      const targetLayer = layers.find(l => l.layer_id === batchLayerId);
      if (targetLayer && targetLayer.worldview) {
        worldviewName = targetLayer.worldview;
      }
    } else {
      const layerWithWorldview = layers.find(l => l.worldview);
      if (layerWithWorldview) {
        worldviewName = layerWithWorldview.worldview;
      }
    }
  } else if (type === 'command') {
    if (batchCommandScope === 'SCENE' && scenes.length > 0) {
      const sceneWithWorldview = scenes.find(s => s.worldview);
      if (sceneWithWorldview) {
        worldviewName = sceneWithWorldview.worldview;
      }
    } else if (batchCommandScope === 'LAYER' && layers.length > 0) {
      const layerWithWorldview = layers.find(l => l.worldview);
      if (layerWithWorldview) {
        worldviewName = layerWithWorldview.worldview;
      }
    } else if (layers.length > 0) {
      const layerWithWorldview = layers.find(l => l.worldview);
      if (layerWithWorldview) {
        worldviewName = layerWithWorldview.worldview;
      }
    }
  }
  
  if (!worldviewName) {
    worldviewName = "默认世界观";
  }
  
  return worldviewName;
}

// 测试数据
const mockLayers = [
  { layer_id: 'L001', worldview: '科幻世界' },
  { layer_id: 'L002', worldview: '奇幻世界' }
];

const mockScenes = [
  { id: 'S001', worldview: '科幻世界' },
  { id: 'S002', worldview: '奇幻世界' }
];

// 测试场景
console.log('场景导入（无筛选）:', testWorldviewExtraction('scene', false, '', ['实验室|阴暗潮湿'], mockLayers, '', '', mockScenes));
console.log('场景导入（启用筛选）:', testWorldviewExtraction('scene', true, '武侠世界', ['密室|幽暗'], mockLayers, '', '', mockScenes));
console.log('玩法导入（指定层级）:', testWorldviewExtraction('play', false, '', [], mockLayers, 'L001', '', mockScenes));
console.log('玩法导入（无指定层级）:', testWorldviewExtraction('play', false, '', [], mockLayers, '', '', mockScenes));
console.log('指令导入（SCENE作用域）:', testWorldviewExtraction('command', false, '', [], mockLayers, '', 'SCENE', mockScenes));
console.log('指令导入（LAYER作用域）:', testWorldviewExtraction('command', false, '', [], mockLayers, '', 'LAYER', mockScenes));
console.log('指令导入（GLOBAL作用域）:', testWorldviewExtraction('command', false, '', [], mockLayers, '', 'GLOBAL', mockScenes));