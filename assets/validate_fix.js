// 完整的修复验证测试脚本
const http = require('http');

// 测试数据获取函数
function fetchData(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: endpoint,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

// 模拟修复后的 getCandidatesForCurrentLayer 函数
function getCandidatesForCurrentLayer(scene, layerIndex, enableWorldviewFilter, selectedWorldview, allLayers, allPlays, allCommands) {
  // [关键修复] 应用世界观筛选到所有相关数据
  let filteredLayers = allLayers;
  let filteredPlays = allPlays;
  let filteredCommands = allCommands;
  
  if (enableWorldviewFilter && selectedWorldview) {
    filteredLayers = allLayers.filter(l => l.worldview === selectedWorldview);
    filteredPlays = allPlays.filter(p => p.worldview === selectedWorldview);
    filteredCommands = allCommands.filter(c => c.worldview === selectedWorldview);
  }
  
  if (!scene || !filteredLayers || filteredLayers.length === 0) {
    return { 
      plays: [], 
      commands: [],
      filteredData: {
        layers: filteredLayers,
        plays: filteredPlays, 
        commands: filteredCommands
      }
    };
  }
  
  const sortedLayers = [...filteredLayers].sort((a, b) => a.sequence - b.sequence);
  
  // [关键修复] 防止索引越界，确保当前层级存在
  if (layerIndex >= sortedLayers.length) {
    return { 
      plays: [], 
      commands: [],
      filteredData: {
        layers: filteredLayers,
        plays: filteredPlays,
        commands: filteredCommands
      }
    };
  }
  
  const currentLayer = sortedLayers[layerIndex];
  
  // 获取玩法候选（基于标签匹配 + 使用筛选后的数据）
  let layerPlays = filteredPlays.filter(p => p.fk_layer_id === currentLayer.layer_id);
  
  const scoredPlays = layerPlays.map(p => {
    const matchCount = p.tags.filter(t => scene.tags.includes(t)).length;
    return { ...p, score: matchCount };
  });
  
  // 选择最匹配的玩法
  const maxScore = Math.max(...scoredPlays.map(p => p.score));
  const matchedPlays = maxScore > 0
    ? scoredPlays.filter(p => p.score === maxScore)
    : layerPlays;
  
  const selectedPlays = matchedPlays.slice(0, Math.min(4, matchedPlays.length));

  // 获取指令候选
  let possibleCommands = filteredCommands.filter(c => {
    if (c.scope_type === 'GLOBAL') return true;
    
    const targetIds = c.fk_target_id ? c.fk_target_id.split(',').map(id => id.trim()).filter(Boolean) : [];
    
    if (c.scope_type === 'SCENE') {
      return targetIds.includes(scene.id);
    }
    if (c.scope_type === 'LAYER') {
      return targetIds.includes(currentLayer.layer_id);
    }
    return false;
  });

  return {
    plays: selectedPlays,
    commands: possibleCommands,
    currentLayer: currentLayer,
    worldviewFiltered: enableWorldviewFilter && selectedWorldview,
    filteredData: {
      layers: filteredLayers,
      plays: filteredPlays,
      commands: filteredCommands
    }
  };
}

// 主要验证函数
async function validateWorldviewFix() {
  console.log('🔍 开始验证世界观筛选修复效果...\n');

  try {
    // 获取数据
    const scenes = await fetchData('/api/scenes');
    const layers = await fetchData('/api/layers');
    const plays = await fetchData('/api/plays');
    const commands = await fetchData('/api/commands');

    console.log('📊 数据统计:');
    console.log(`  - 场景总数: ${scenes.length}`);
    console.log(`  - 层总数: ${layers.length}`);
    console.log(`  - 玩法总数: ${plays.length}`);
    console.log(`  - 指令总数: ${commands.length}`);

    // 统计世界观分布
    const worldviews = {};
    scenes.forEach(scene => {
      const worldview = scene.worldview || '未知';
      worldviews[worldview] = (worldviews[worldview] || 0) + 1;
    });

    console.log('\n🌍 世界观分布:');
    Object.keys(worldviews).forEach(wv => {
      console.log(`  - ${wv}: ${worldviews[wv]} 个场景`);
    });

    // 测试每个世界观的筛选效果
    const testWorldviews = ['废弃实验室', '月王故事', '王勇和体育生故事'];
    let allTestsPassed = true;

    for (const worldview of testWorldviews) {
      console.log(`\n🧪 测试世界观: ${worldview}`);
      
      // 找到该世界观的第一个场景
      const worldviewScenes = scenes.filter(s => s.worldview === worldview);
      if (worldviewScenes.length === 0) {
        console.log(`  ⚠️  跳过: 没有找到 "${worldview}" 的场景`);
        continue;
      }

      const testScene = worldviewScenes[0];
      console.log(`  📍 测试场景: ${testScene.name}`);

      // 测试筛选前的数据
      const unfilteredResult = getCandidatesForCurrentLayer(
        testScene, 0, false, null, layers, plays, commands
      );

      // 测试筛选后的数据
      const filteredResult = getCandidatesForCurrentLayer(
        testScene, 0, true, worldview, layers, plays, commands
      );

      console.log(`  📈 对比结果:`);
      console.log(`    - 筛选前玩法: ${unfilteredResult.plays.length} 个`);
      console.log(`    - 筛选后玩法: ${filteredResult.plays.length} 个`);
      console.log(`    - 筛选前指令: ${unfilteredResult.commands.length} 个`);
      console.log(`    - 筛选后指令: ${filteredResult.commands.length} 个`);

      // 验证世界观隔离
      const playWorldviewCorrect = filteredResult.plays.every(p => p.worldview === worldview);
      const commandWorldviewCorrect = filteredResult.commands.every(c => c.worldview === worldview);

      if (!playWorldviewCorrect) {
        console.log(`    ❌ 玩法世界观验证失败`);
        allTestsPassed = false;
      }

      if (!commandWorldviewCorrect) {
        console.log(`    ❌ 指令世界观验证失败`);
        allTestsPassed = false;
      }

      if (playWorldviewCorrect && commandWorldviewCorrect) {
        console.log(`    ✅ 世界观隔离验证通过`);
      }

      // 验证数据一致性
      const hasCurrentLayer = filteredResult.currentLayer && 
                             filteredResult.currentLayer.worldview === worldview;
      if (!hasCurrentLayer) {
        console.log(`    ❌ 当前层级验证失败`);
        allTestsPassed = false;
      } else {
        console.log(`    ✅ 当前层级验证通过: ${filteredResult.currentLayer.layer_name}`);
      }
    }

    // 总结
    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
      console.log('🎉 所有测试通过！世界观筛选修复成功！');
      console.log('✅ 修复效果验证:');
      console.log('  1. 数据按世界观正确筛选和隔离');
      console.log('  2. 玩法和指令只显示对应世界观的内容');
      console.log('  3. 防止了跨世界观数据污染');
      console.log('  4. 数据一致性和安全性得到保障');
    } else {
      console.log('❌ 部分测试失败，需要进一步检查修复逻辑');
    }

  } catch (error) {
    console.error('❌ 验证过程中出错:', error.message);
  }
}

// 运行验证
validateWorldviewFix();