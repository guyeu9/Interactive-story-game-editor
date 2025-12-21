// 创建模拟API来测试世界观筛选修复效果
const http = require('http');
const fs = require('fs');
const path = require('path');

// 读取修复后的测试数据
const mockData = JSON.parse(fs.readFileSync(path.join(__dirname, 'text_game_weaver_data_fixed.json'), 'utf8'));

const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // 模拟数据API端点
  if (url.pathname === '/api/scenes') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.scenes));
  } else if (url.pathname === '/api/layers') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.layers));
  } else if (url.pathname === '/api/plays') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.plays));
  } else if (url.pathname === '/api/commands') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData.commands));
  } else if (url.pathname === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockData));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 模拟API服务器启动在 http://localhost:${PORT}`);
  console.log(`📊 可用端点:`);
  console.log(`  - GET /api/scenes - 获取场景数据`);
  console.log(`  - GET /api/layers - 获取层数据`);
  console.log(`  - GET /api/plays - 获取玩法数据`);
  console.log(`  - GET /api/commands - 获取指令数据`);
  console.log(`  - GET /api/data - 获取完整数据`);
  console.log(`\n🧪 现在可以测试世界观筛选功能了！`);
});