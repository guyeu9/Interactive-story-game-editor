// 测试用户提供的真实数据
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function importTestData() {
  console.log('=== 导入用户提供的测试数据 ===');

  // 检查文件是否存在
  const testFilePath = path.join(__dirname, 'text_game_weaver_data_1766264987457.json');
  if (!fs.existsSync(testFilePath)) {
    console.error('❌ 测试文件不存在:', testFilePath);
    process.exit(1);
  }

  // 读取文件内容
  const testData = JSON.parse(fs.readFileSync(testFilePath, 'utf8'));
  
  // 使用修复后的数据
  const fixedDataPath = path.join(__dirname, 'text_game_weaver_data_fixed.json');
  if (fs.existsSync(fixedDataPath)) {
    console.log('📝 使用修复后的数据文件');
    const fixedData = JSON.parse(fs.readFileSync(fixedDataPath, 'utf8'));
    var importData = fixedData;
  } else {
    console.log('📝 使用原始数据文件');
    var importData = testData;
  }

  console.log('📊 测试数据分析:');
  console.log(`- 场景数量: ${importData.scenes ? importData.scenes.length : 0}`);
  console.log(`- 层级数量: ${importData.layers ? importData.layers.length : 0}`);
  console.log(`- 玩法数量: ${importData.plays ? importData.plays.length : 0}`);
  console.log(`- 指令数量: ${importData.commands ? importData.commands.length : 0}`);

  // 分析世界观分布
  const worldviews = {
    scenes: {},
    layers: {},
    plays: {},
    commands: {}
  };

  if (importData.scenes) {
    importData.scenes.forEach(scene => {
      const worldview = scene.worldview || '未知';
      worldviews.scenes[worldview] = (worldviews.scenes[worldview] || 0) + 1;
    });
  }

  if (importData.layers) {
    importData.layers.forEach(layer => {
      const worldview = layer.worldview || '未知';
      worldviews.layers[worldview] = (worldviews.layers[worldview] || 0) + 1;
    });
  }

  if (importData.plays) {
    importData.plays.forEach(play => {
      const worldview = play.worldview || '未知';
      worldviews.plays[worldview] = (worldviews.plays[worldview] || 0) + 1;
    });
  }

  if (importData.commands) {
    importData.commands.forEach(command => {
      const worldview = command.worldview || '未知';
      worldviews.commands[worldview] = (worldviews.commands[worldview] || 0) + 1;
    });
  }

  console.log('\n🌍 世界观分布:');
  Object.keys(worldviews.scenes).forEach(wv => {
    console.log(`${wv}:`);
    console.log(`  - 场景: ${worldviews.scenes[wv]}`);
    console.log(`  - 层级: ${worldviews.layers[wv] || 0}`);
    console.log(`  - 玩法: ${worldviews.plays[wv] || 0}`);
    console.log(`  - 指令: ${worldviews.commands[wv] || 0}`);
  });

  // 检查重复ID
  const sceneIds = {};
  const layerIds = {};
  const playIds = {};
  const commandIds = {};

  let duplicateFound = false;

  console.log('\n🔍 ID重复检查:');
  if (importData.scenes) {
    importData.scenes.forEach(scene => {
      if (sceneIds[scene.id]) {
        console.log(`❌ 场景ID重复: ${scene.id} (${sceneIds[scene.id]} 和 ${scene.name})`);
        duplicateFound = true;
      } else {
        sceneIds[scene.id] = scene.name;
      }
    });
  }

  if (importData.layers) {
    importData.layers.forEach(layer => {
      if (layerIds[layer.layer_id]) {
        console.log(`❌ 层级ID重复: ${layer.layer_id} (${layerIds[layer.layer_id]} 和 ${layer.layer_name})`);
        duplicateFound = true;
      } else {
        layerIds[layer.layer_id] = layer.layer_name;
      }
    });
  }

  if (importData.plays) {
    importData.plays.forEach(play => {
      if (playIds[play.id]) {
        console.log(`❌ 玩法ID重复: ${play.id} (${playIds[play.id]} 和 ${play.name})`);
        duplicateFound = true;
      } else {
        playIds[play.id] = play.name;
      }
    });
  }

  if (importData.commands) {
    importData.commands.forEach(command => {
      if (commandIds[command.id]) {
        console.log(`❌ 指令ID重复: ${command.id} (${commandIds[command.id]} 和 ${command.name})`);
        duplicateFound = true;
      } else {
        commandIds[command.id] = command.name;
      }
    });
  }

  if (!duplicateFound) {
    console.log('✅ 未发现重复ID');
  }

  // 清理现有数据并导入新数据
  try {
    // 连接数据库并清理现有数据
    console.log('\n🗑️ 清理现有数据...');
    const pool = new Pool({
      connectionString: 'postgresql://text_game_user:text_game_pass@localhost:5432/text_game_db'
    });

    await pool.query('DELETE FROM game_commands');
    await pool.query('DELETE FROM game_plays');
    await pool.query('DELETE FROM game_layers');
    await pool.query('DELETE FROM game_scenes');
    
    console.log('✅ 现有数据清理完成');

    // 导入场景数据
    if (importData.scenes && importData.scenes.length > 0) {
      console.log('\n📥 导入场景数据...');
      for (const scene of importData.scenes) {
        await pool.query(`
          INSERT INTO game_scenes (id, name, description, tags, worldview)
          VALUES ($1, $2, $3, $4, $5)
        `, [scene.id, scene.name, scene.description, JSON.stringify(scene.tags || []), scene.worldview || '']);
      }
      console.log(`✅ 导入 ${importData.scenes.length} 个场景`);
    }

    // 导入层级数据
    if (importData.layers && importData.layers.length > 0) {
      console.log('\n📥 导入层级数据...');
      for (const layer of importData.layers) {
        await pool.query(`
          INSERT INTO game_layers (layer_id, layer_name, sequence, worldview)
          VALUES ($1, $2, $3, $4)
        `, [layer.layer_id, layer.layer_name, layer.sequence, layer.worldview || '']);
      }
      console.log(`✅ 导入 ${importData.layers.length} 个层级`);
    }

    // 导入玩法数据
    if (importData.plays && importData.plays.length > 0) {
      console.log('\n📥 导入玩法数据...');
      for (const play of importData.plays) {
        await pool.query(`
          INSERT INTO game_plays (id, name, description, trigger_condition, result, fk_layer_id, tags, worldview)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          play.id,
          play.name,
          play.description,
          play.trigger_condition || '',
          play.result || '',
          play.fk_layer_id || '',
          JSON.stringify(play.tags || []),
          play.worldview || ''
        ]);
      }
      console.log(`✅ 导入 ${importData.plays.length} 个玩法`);
    }

    // 导入指令数据
    if (importData.commands && importData.commands.length > 0) {
      console.log('\n📥 导入指令数据...');
      for (const command of importData.commands) {
        await pool.query(`
          INSERT INTO game_commands (id, name, description, probability, scope_type, fk_target_id, worldview)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          command.id,
          command.name,
          command.description,
          command.probability || 0,
          command.scope_type || '',
          command.fk_target_id || '',
          command.worldview || ''
        ]);
      }
      console.log(`✅ 导入 ${importData.commands.length} 个指令`);
    }

    await pool.end();
    console.log('\n🎉 测试数据导入完成!');

  } catch (error) {
    console.error('❌ 导入失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

importTestData();