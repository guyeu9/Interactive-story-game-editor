const fs = require('fs');
const path = require('path');

// 读取原始数据
const testFilePath = path.join(__dirname, 'text_game_weaver_data_1766264987457.json');
const testData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));

// 按世界观分组并修复重复ID
const worldviews = ['废弃实验室', '月王故事', '王勇和体育生故事'];

// 创建新的数据结构，确保ID唯一
const fixedData = {
  scenes: [],
  layers: [],
  plays: [],
  commands: []
};

// 修复场景ID - 使用全局计数器确保唯一性
let globalSceneCounter = 1;
testData.scenes.forEach(scene => {
  fixedData.scenes.push({
    ...scene,
    id: `S${globalSceneCounter.toString().padStart(3, '0')}`
  });
  globalSceneCounter++;
});

// 修复层级ID - 使用全局计数器确保唯一性
let globalLayerCounter = 1;
testData.layers.forEach(layer => {
  fixedData.layers.push({
    ...layer,
    layer_id: `L${globalLayerCounter.toString().padStart(3, '0')}`
  });
  globalLayerCounter++;
});

// 修复玩法ID - 使用全局计数器确保唯一性
let globalPlayCounter = 1;
testData.plays.forEach(play => {
  fixedData.plays.push({
    ...play,
    id: `P${globalPlayCounter.toString().padStart(3, '0')}`
  });
  globalPlayCounter++;
});

// 修复指令ID - 使用全局计数器确保唯一性
let globalCommandCounter = 1;
testData.commands.forEach(command => {
  fixedData.commands.push({
    ...command,
    id: `C${globalCommandCounter.toString().padStart(3, '0')}`
  });
  globalCommandCounter++;
});

// 更新fk_layer_id关联 - 创建旧ID到新ID的映射
const oldToNewLayerMap = {};
let newLayerIndex = 0;

testData.layers.forEach(layer => {
  const oldId = layer.layer_id;
  const newLayer = fixedData.layers[newLayerIndex];
  if (newLayer && newLayer.layer_name === layer.layer_name) {
    oldToNewLayerMap[oldId] = newLayer.layer_id;
  }
  newLayerIndex++;
});

// 更新玩法中的fk_layer_id
fixedData.plays.forEach(play => {
  const oldLayerId = play.fk_layer_id;
  if (oldToNewLayerMap[oldLayerId]) {
    play.fk_layer_id = oldToNewLayerMap[oldLayerId];
  }
});

// 保存修复后的数据
const fixedDataPath = path.join(__dirname, 'text_game_weaver_data_fixed.json');
fs.writeFileSync(fixedDataPath, JSON.stringify(fixedData, null, 2), 'utf8');

console.log('✅ 数据修复完成!');
console.log(`- 修复后场景数量: ${fixedData.scenes.length}`);
console.log(`- 修复后层级数量: ${fixedData.layers.length}`);
console.log(`- 修复后玩法数量: ${fixedData.plays.length}`);
console.log(`- 修复后指令数量: ${fixedData.commands.length}`);

// 验证ID唯一性
const sceneIds = new Set();
const layerIds = new Set();
const playIds = new Set();
const commandIds = new Set();

let hasDuplicates = false;

fixedData.scenes.forEach(scene => {
  if (sceneIds.has(scene.id)) {
    console.log(`❌ 场景ID重复: ${scene.id}`);
    hasDuplicates = true;
  }
  sceneIds.add(scene.id);
});

fixedData.layers.forEach(layer => {
  if (layerIds.has(layer.layer_id)) {
    console.log(`❌ 层级ID重复: ${layer.layer_id}`);
    hasDuplicates = true;
  }
  layerIds.add(layer.layer_id);
});

fixedData.plays.forEach(play => {
  if (playIds.has(play.id)) {
    console.log(`❌ 玩法ID重复: ${play.id}`);
    hasDuplicates = true;
  }
  playIds.add(play.id);
});

fixedData.commands.forEach(command => {
  if (commandIds.has(command.id)) {
    console.log(`❌ 指令ID重复: ${command.id}`);
    hasDuplicates = true;
  }
  commandIds.add(command.id);
});

if (!hasDuplicates) {
  console.log('✅ 所有ID现在都是唯一的!');
}