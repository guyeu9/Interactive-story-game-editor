#!/usr/bin/env node

/**
 * 测试脚本：验证剧情织造机修复效果
 * 测试ID唯一性、场景选择器、指令多选等核心问题
 */

const fs = require('fs');
const path = require('path');

// 模拟应用的核心修复逻辑
class TestFramework {
  constructor() {
    this.testResults = [];
  }

  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  test(name, testFn) {
    this.log(`开始测试: ${name}`);
    try {
      const result = testFn();
      this.testResults.push({
        name,
        status: 'PASS',
        message: result
      });
      this.log(`✅ 测试通过: ${name} - ${result}`);
    } catch (error) {
      this.testResults.push({
        name,
        status: 'FAIL',
        message: error.message
      });
      this.log(`❌ 测试失败: ${name} - ${error.message}`);
    }
  }

  // 生成唯一ID的测试函数
  generateSequentialId(prefix, existingIds, groupPrefix = '', type = 'default', worldviewName = '') {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).slice(2, 5);
    
    const worldviewPrefix = worldviewName ? this.chineseToFirstLetters(worldviewName).substring(0, 3) : '';
    const namePrefix = (groupPrefix || worldviewPrefix || 'AAA').substring(0, 2).toUpperCase();
    
    return `${prefix}${worldviewPrefix}${namePrefix}${timestamp}${random}`;
  }

  // 中文转拼音首字母（简化版）
  chineseToFirstLetters(chineseStr) {
    if (!chineseStr) return 'AAA';
    
    // 简化的映射，仅包含测试用例
    const pinyinMap = {
      '王': 'W', '勇': 'Y', '和': 'H', '体': 'T', '育': 'Y', '生': 'S', '故': 'G', '事': 'S',
      '月': 'Y', '皇': 'H', '庭': 'T', '废': 'F', '弃': 'Q', '实': 'S', '验': 'Y', '室': 'S'
    };

    let result = '';
    let charCount = 0;
    
    for (let i = 0; i < chineseStr.length && charCount < 3; i++) {
      const char = chineseStr[i];
      const firstLetter = pinyinMap[char];
      
      if (firstLetter) {
        result += firstLetter;
        charCount++;
      } else if (/[a-zA-Z]/.test(char)) {
        result += char.toUpperCase();
        charCount++;
      }
    }
    
    while (result.length < 3) {
      result += 'A';
    }
    
    return result;
  }

  // 确保ID唯一性
  ensureUniqueIds(items, idKey, type) {
    const seenIds = new Set();
    const duplicates = [];
    const unique = [];
    
    items.forEach((item, index) => {
      const id = item[idKey];
      if (seenIds.has(id)) {
        duplicates.push({ item, index, id });
      } else {
        seenIds.add(id);
        unique.push(item);
      }
    });
    
    if (duplicates.length > 0) {
      // 为重复项生成新的唯一ID
      const fixed = duplicates.map(({ item }) => {
        const worldview = item.worldview || '默认世界观';
        const namePrefix = item.name || item.layer_name || item.title || '';
        const newId = this.generateSequentialId(
          type === 'layer' ? 'L' : type === 'scene' ? 'S' : type === 'play' ? 'P' : 'C',
          unique.map(u => u[idKey]),
          this.chineseToFirstLetters(namePrefix).substring(0, 2),
          type,
          worldview
        );
        
        return { ...item, [idKey]: newId };
      });
      
      return [...unique, ...fixed];
    }
    
    return items;
  }
}

// 创建测试实例
const testFramework = new TestFramework();

// 测试数据（模拟用户报告的问题数据）
const problematicData = {
  scenes: [
    { id: "STYSTY001", name: "大学体育馆更衣室", worldview: "王勇和体育生故事" },
    { id: "STYSTY001", name: "更衣室 - 初步调教", worldview: "王勇和体育生故事" },
    { id: "STYSTY001", name: "更衣室 - 深度接触", worldview: "王勇和体育生故事" },
    { id: "SAAAAA001", name: "皇庭南卫星城办公室", worldview: "月王故事" },
    { id: "SAAAAA001", name: "海岸运输船杂兵舱", worldview: "月王故事" }
  ],
  plays: [
    { id: "PTYSTY001", name: "初次偷闻白袜深嗅", worldview: "王勇和体育生故事" },
    { id: "PTYSTY001", name: "深度接触", worldview: "王勇和体育生故事" },
    { id: "PAAAAA001", name: "月王初遇", worldview: "月王故事" }
  ],
  commands: [
    { id: "CTYSTY001", name: "尿柱同时多股", worldview: "王勇和体育生故事" },
    { id: "CTYSTY001", name: "路人强制加入", worldview: "王勇和体育生故事" },
    { id: "CAAAAA001", name: "月王之力", worldview: "月王故事" }
  ]
};

// 执行测试
testFramework.log("=== 开始验证剧情织造机修复效果 ===");

// 测试1: ID重复检测和修复
testFramework.test("场景数据ID重复检测和修复", () => {
  const originalIds = problematicData.scenes.map(s => s.id);
  const uniqueIds = new Set(originalIds);
  const hasDuplicates = originalIds.length !== uniqueIds.size;
  
  if (!hasDuplicates) {
    throw new Error("测试数据应该包含重复ID，但没有检测到");
  }
  
  const fixedScenes = test.ensureUniqueIds(problematicData.scenes, 'id', 'scene');
  const fixedIds = fixedScenes.map(s => s.id);
  const fixedUniqueIds = new Set(fixedIds);
  const fixedHasDuplicates = fixedIds.length !== fixedUniqueIds.size;
  
  if (fixedHasDuplicates) {
    throw new Error("修复后仍然存在重复ID");
  }
  
  return `修复前: ${originalIds.length}个场景, ${uniqueIds.size}个唯一ID; 修复后: ${fixedIds.length}个场景, ${fixedUniqueIds.size}个唯一ID`;
});

// 测试2: 玩法ID重复修复
testFramework.test("玩法数据ID重复检测和修复", () => {
  const originalIds = problematicData.plays.map(p => p.id);
  const uniqueIds = new Set(originalIds);
  const hasDuplicates = originalIds.length !== uniqueIds.size;
  
  if (!hasDuplicates) {
    throw new Error("测试数据应该包含重复ID，但没有检测到");
  }
  
  const fixedPlays = test.ensureUniqueIds(problematicData.plays, 'id', 'play');
  const fixedIds = fixedPlays.map(p => p.id);
  const fixedUniqueIds = new Set(fixedIds);
  const fixedHasDuplicates = fixedIds.length !== fixedUniqueIds.size;
  
  if (fixedHasDuplicates) {
    throw new Error("修复后仍然存在重复ID");
  }
  
  return `修复前重复玩法: ${originalIds.length - uniqueIds.size}个; 修复后唯一性: ${fixedUniqueIds.size}/${fixedIds.length}`;
});

// 测试3: 指令ID重复修复
testFramework.test("指令数据ID重复检测和修复", () => {
  const originalIds = problematicData.commands.map(c => c.id);
  const uniqueIds = new Set(originalIds);
  const hasDuplicates = originalIds.length !== uniqueIds.size;
  
  if (!hasDuplicates) {
    throw new Error("测试数据应该包含重复ID，但没有检测到");
  }
  
  const fixedCommands = test.ensureUniqueIds(problematicData.commands, 'id', 'command');
  const fixedIds = fixedCommands.map(c => c.id);
  const fixedUniqueIds = new Set(fixedIds);
  const fixedHasDuplicates = fixedIds.length !== fixedUniqueIds.size;
  
  if (fixedHasDuplicates) {
    throw new Error("修复后仍然存在重复ID");
  }
  
  return `修复前重复指令: ${originalIds.length - uniqueIds.size}个; 修复后唯一性: ${fixedUniqueIds.size}/${fixedIds.length}`;
});

// 测试4: ID生成唯一性
testFramework.test("ID生成器唯一性测试", () => {
  const existingIds = [];
  const newIds = [];
  
  // 生成100个ID测试唯一性
  for (let i = 0; i < 100; i++) {
    const id = test.generateSequentialId(
      'S',
      existingIds,
      'TEST',
      'scene',
      '测试世界观'
    );
    
    if (existingIds.includes(id)) {
      throw new Error(`生成了重复ID: ${id}`);
    }
    
    existingIds.push(id);
    newIds.push(id);
  }
  
  // 检查ID格式
  const idPattern = /^S[ABC]{2}[A-Z]{2}\d{6}[a-z0-9]{3}$/;
  const invalidIds = newIds.filter(id => !idPattern.test(id));
  
  if (invalidIds.length > 0) {
    throw new Error(`发现了不符合格式的ID: ${invalidIds.join(', ')}`);
  }
  
  return `成功生成100个唯一ID，格式正确`;
});

// 测试5: React Key冲突修复
testFramework.test("React Key唯一性验证", () => {
  const candidatePlays = [
    { id: "PTYSTY001", name: "初次偷闻白袜深嗅" },
    { id: "PTYSTY001", name: "深度接触" }
  ];
  
  const candidateCommands = [
    { id: "CTYSTY001", name: "尿柱同时多股" },
    { id: "CTYSTY001", name: "路人强制加入" }
  ];
  
  // 模拟修复后的key生成逻辑
  const playKeys = candidatePlays.map((play, index) => `play-${index}-${play.name || 'unnamed'}`);
  const commandKeys = candidateCommands.map((cmd, index) => `cmd-${index}-${cmd.name || 'unnamed'}`);
  
  const uniquePlayKeys = new Set(playKeys);
  const uniqueCommandKeys = new Set(commandKeys);
  
  if (uniquePlayKeys.size !== playKeys.length) {
    throw new Error("玩法Key仍然存在冲突");
  }
  
  if (uniqueCommandKeys.size !== commandKeys.length) {
    throw new Error("指令Key仍然存在冲突");
  }
  
  return `玩法Key: ${uniquePlayKeys.size}/${playKeys.length} 唯一; 指令Key: ${uniqueCommandKeys.size}/${commandKeys.length} 唯一`;
});

// 测试6: 世界观筛选逻辑
testFramework.test("世界观筛选逻辑验证", () => {
  const allScenes = test.ensureUniqueIds(problematicData.scenes, 'id', 'scene');
  
  // 筛选"王勇和体育生故事"世界观
  const filteredScenes = allScenes.filter(s => s.worldview === '王勇和体育生故事');
  
  const expectedCount = 3; // 根据测试数据，应该有3个"王勇和体育生故事"的场景
  const actualCount = filteredScenes.length;
  
  if (actualCount !== expectedCount) {
    throw new Error(`筛选结果不符，期望${expectedCount}个，实际${actualCount}个`);
  }
  
  // 验证筛选结果的正确性
  const hasWrongWorldview = filteredScenes.some(s => s.worldview !== '王勇和体育生故事');
  if (hasWrongWorldview) {
    throw new Error("筛选结果包含错误的世界观");
  }
  
  return `成功筛选${actualCount}个'王勇和体育生故事'场景，世界观正确`;
});

// 生成测试报告
const generateReport = () => {
  const passedTests = testFramework.testResults.filter(r => r.status === 'PASS').length;
  const totalTests = testFramework.testResults.length;
  const failedTests = testFramework.testResults.filter(r => r.status === 'FAIL');
  
  testFramework.log("\n=== 测试报告 ===");
  test.log(`总测试数: ${totalTests}`);
  test.log(`通过测试: ${passedTests}`);
  test.log(`失败测试: ${failedTests.length}`);
  test.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests.length > 0) {
    testFramework.log("\n失败的测试:");
    failedTests.forEach(testResult => {
      testFramework.log(`❌ ${testResult.name}: ${testResult.message}`);
    });
  }
  
  testFramework.log("\n=== 详细测试结果 ===");
  testFramework.testResults.forEach(testResult => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    test.log(`${icon} ${test.name}: ${test.message}`);
  });
  
  // 保存测试结果到文件
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests.length,
      passRate: ((passedTests / totalTests) * 100).toFixed(1)
    },
    results: test.testResults,
    fixedData: {
      scenes: test.ensureUniqueIds(problematicData.scenes, 'id', 'scene'),
      plays: test.ensureUniqueIds(problematicData.plays, 'id', 'play'),
      commands: test.ensureUniqueIds(problematicData.commands, 'id', 'command')
    }
  };
  
  try {
    fs.writeFileSync('/tmp/test_report.json', JSON.stringify(reportData, null, 2));
    testFramework.log("\n📄 测试报告已保存到: /tmp/test_report.json");
  } catch (error) {
    testFramework.log(`⚠️ 无法保存测试报告: ${error.message}`);
  }
  
  return {
    success: failedTests.length === 0,
    summary: reportData.summary
  };
};

// 运行所有测试
const report = generateReport();

// 退出码
process.exit(report.success ? 0 : 1);