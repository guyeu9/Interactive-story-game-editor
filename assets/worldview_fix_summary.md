# 剧情织造机世界观筛选问题修复总结

## 🎯 问题描述

用户反馈：选择世界观后剧情游戏中玩法和指令读取ID不对，保存和显示另一个世界观的内容。

## 🔍 根本原因分析

### 1. 数据层面问题
- **重复ID**: 原始测试数据中存在大量重复ID（场景、层级、玩法、指令）
- **世界观缺失**: 部分数据对象缺少worldview字段

### 2. 代码层面问题
- **筛选不完整**: `getCandidatesForCurrentLayer`函数虽然应用了世界观筛选，但后续处理函数仍使用原始数据
- **数据不一致**: `handleInteractiveChoice`和`renderInteractiveMode`函数在获取筛选数据后，后续处理时又回到了原始数据
- **索引越界风险**: 筛选后数据变少，但索引计算仍使用原始数组长度

## 🛠️ 修复方案

### Step 1: 修复数据重复问题
```javascript
// 使用全局计数器确保ID唯一性
let globalSceneCounter = 1;
testData.scenes.forEach(scene => {
  fixedData.scenes.push({
    ...scene,
    id: `S${globalSceneCounter.toString().padStart(3, '0')}`
  });
  globalSceneCounter++;
});
```

### Step 2: 修复getCandidatesForCurrentLayer函数
```javascript
const getCandidatesForCurrentLayer = (scene, layerIndex) => {
  // [关键修复] 应用世界观筛选到所有相关数据
  let filteredLayers = layers;
  let filteredPlays = plays;
  let filteredCommands = commands;
  
  if (enableWorldviewFilter && selectedWorldview) {
    filteredLayers = layers.filter(l => l.worldview === selectedWorldview);
    filteredPlays = plays.filter(p => p.worldview === selectedWorldview);
    filteredCommands = commands.filter(c => c.worldview === selectedWorldview);
  }
  
  // [新增] 返回筛选后的数据，确保后续处理使用正确的数据
  return {
    plays: selectedPlays,
    commands: triggeredCommands,
    filteredData: {
      layers: filteredLayers,
      plays: filteredPlays,
      commands: filteredCommands
    }
  };
};
```

### Step 3: 修复handleInteractiveChoice函数
```javascript
const handleInteractiveChoice = () => {
  // [关键修复] 使用getCandidatesForCurrentLayer获取筛选后的数据，确保数据一致性
  const { filteredData } = getCandidatesForCurrentLayer(currentScene, currentLayerIndex);
  const filteredLayers = filteredData.layers;
  const filteredPlays = filteredData.plays;
  const filteredCommands = filteredData.commands;
  
  // [额外安全检查] 确保筛选后的数据不为空
  if (!filteredLayers || filteredLayers.length === 0) {
    showToast("当前筛选条件下没有可用层级", "error");
    return;
  }
  
  // 后续处理全部使用筛选后的数据...
};
```

### Step 4: 修复renderInteractiveMode函数
```javascript
const renderInteractiveMode = () => {
  // [关键修复] 使用getCandidatesForCurrentLayer获取筛选后的数据，确保数据一致性
  const { filteredData } = getCandidatesForCurrentLayer(currentScene, currentLayerIndex);
  const filteredLayers = filteredData.layers;
  const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
  
  // [关键修复] 防止索引越界，确保当前层级存在
  let currentLayer = null;
  if (currentLayerIndex >= 0 && currentLayerIndex < sortedLayers.length) {
    currentLayer = sortedLayers[currentLayerIndex];
  }
  
  // 后续渲染全部使用筛选后的数据...
};
```

## 🧪 验证测试

### 模拟数据测试结果
```
🧪 测试废弃实验室世界观筛选
  - 当前层级: 开场准备
  - 世界观匹配: 废弃实验室
  - 可用玩法数量: 1 (全部属于废弃实验室)
  - 可用指令数量: 1 (全部属于废弃实验室)
  - 世界观匹配验证: ✅ 通过

🧪 测试月王故事世界观筛选
  - 当前层级: 卧底准备与初次潜入
  - 世界观匹配: 月王故事
  - 可用玩法数量: 1 (全部属于月王故事)
  - 可用指令数量: 1 (全部属于月王故事)
  - 世界观匹配验证: ✅ 通过

🧪 测试王勇和体育生故事世界观筛选
  - 当前层级: 开场准备 - 初次偷闻与被发现
  - 世界观匹配: 王勇和体育生故事
  - 可用玩法数量: 1 (全部属于王勇和体育生故事)
  - 可用指令数量: 1 (全部属于王勇和体育生故事)
  - 世界观匹配验证: ✅ 通过
```

## ✅ 修复效果

1. **数据一致性**: 确保所有函数使用相同的筛选后数据源
2. **世界观隔离**: 彻底消除跨世界观数据污染问题
3. **安全性提升**: 防止索引越界，增强错误处理
4. **ID唯一性**: 修复重复ID问题，确保数据完整性
5. **调试友好**: 增加详细日志，便于问题排查

## 📁 相关文件

- `drama-game-preview/src/components/DramaGameComponent.jsx` - 主要修复文件
- `assets/fix_duplicate_ids.js` - 数据重复ID修复工具
- `assets/test_worldview_fix.js` - 修复效果验证工具
- `text_game_weaver_data_fixed.json` - 修复后的测试数据

## 🎉 结论

通过系统性的修复，彻底解决了选择世界观后剧情游戏中玩法和指令读取ID不对的问题。现在系统能够：

1. 正确按世界观筛选和隔离数据
2. 确保保存和显示对应世界观的内容
3. 防止数据交叉污染
4. 提供一致的用户体验

修复已完成并通过验证测试！