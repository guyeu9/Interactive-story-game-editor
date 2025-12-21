// 测试世界观分组ID生成逻辑
const chineseToFirstLetters = (chineseStr) => {
    const pinyinMap = {
      '王': 'W', '勇': 'Y', '和': 'H', '体': 'T', '育': 'Y', '生': 'S', '月': 'Y',
    };

    if (!chineseStr) return 'AAA';
    
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
  };

const generateSequentialId = (prefix, existingIds, groupPrefix = '', type = 'default', worldviewName = '') => {
    const validIds = (existingIds || []).filter(id => id && typeof id === 'string');
    
    // [关键修复] 生成世界观分组前缀
    const worldviewPrefix = worldviewName ? chineseToFirstLetters(worldviewName).substring(0, 3) : '';
    const combinedPrefix = groupPrefix || worldviewPrefix || 'AAA';
    
    if (type === 'layer') {
      // 层级使用世界观前缀+英文+2位数字格式
      const fullPrefix = worldviewPrefix + combinedPrefix.substring(0, 2);
      
      const existingLayerNumbers = validIds
        .filter(id => id.startsWith(prefix) && id.includes(worldviewPrefix))
        .map(id => {
          const match = id.match(new RegExp(`^${prefix}${worldviewPrefix}[A-Z]{2}(\\d{2})$`));
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);

      const maxNumber = existingLayerNumbers.length > 0 ? Math.max(...existingLayerNumbers) : 0;
      const nextNumber = maxNumber + 1;
      
      return `${prefix}${worldviewPrefix}${combinedPrefix.substring(0, 2)}${nextNumber.toString().padStart(2, '0')}`;
    } else {
      // 其他类型（场景、玩法、指令）使用世界观前缀+首字母+3位数字格式
      const fullPrefix = worldviewPrefix + combinedPrefix.substring(0, 2);
      
      const existingNumbers = validIds
        .filter(id => id.startsWith(prefix) && id.includes(worldviewPrefix))
        .map(id => {
          const match = id.match(new RegExp(`^${prefix}${worldviewPrefix}[A-Z]{2}(\\d{3})$`));
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);

      const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      const nextNumber = maxNumber + 1;
      
      return `${prefix}${worldviewPrefix}${combinedPrefix.substring(0, 2)}${nextNumber.toString().padStart(3, '0')}`;
    }
  };

console.log('=== 测试世界观分组ID生成 ===');

console.log('\n测试1: 王勇和体育生故事');
const existingSceneIds = [];
const wySceneId1 = generateSequentialId('S', existingSceneIds, '', 'scene', '王勇和体育生故事');
console.log('王勇世界观场景1:', wySceneId1);
existingSceneIds.push(wySceneId1);

const wySceneId2 = generateSequentialId('S', existingSceneIds, '', 'scene', '王勇和体育生故事');
console.log('王勇世界观场景2:', wySceneId2);

console.log('\n测试2: 月王故事');
const ywSceneId1 = generateSequentialId('S', existingSceneIds, '', 'scene', '月王故事');
console.log('月王世界观场景1:', ywSceneId1);

const ywSceneId2 = generateSequentialId('S', existingSceneIds, '', 'scene', '月王故事');
console.log('月王世界观场景2:', ywSceneId2);

console.log('\n测试3: 再次添加王勇世界观数据');
const wySceneId3 = generateSequentialId('S', existingSceneIds, '', 'scene', '王勇和体育生故事');
console.log('王勇世界观场景3:', wySceneId3);

console.log('\n测试4: 玩法ID测试');
const existingPlayIds = [];
const wyPlayId1 = generateSequentialId('P', existingPlayIds, '', 'play', '王勇和体育生故事');
console.log('王勇世界观玩法1:', wyPlayId1);

const ywPlayId1 = generateSequentialId('P', existingPlayIds, '', 'play', '月王故事');
console.log('月王世界观玩法1:', ywPlayId1);

const wyPlayId2 = generateSequentialId('P', existingPlayIds, '', 'play', '王勇和体育生故事');
console.log('王勇世界观玩法2:', wyPlayId2);

console.log('\n测试5: 指令ID测试');
const existingCommandIds = [];
const wyCommandId1 = generateSequentialId('C', existingCommandIds, '', 'command', '王勇和体育生故事');
console.log('王勇世界观指令1:', wyCommandId1);

const ywCommandId1 = generateSequentialId('C', existingCommandIds, '', 'command', '月王故事');
console.log('月王世界观指令1:', ywCommandId1);

const wyCommandId2 = generateSequentialId('C', existingCommandIds, '', 'command', '王勇和体育生故事');
console.log('王勇世界观指令2:', wyCommandId2);

console.log('\n=== 最终ID列表 ===');
console.log('场景IDs:', existingSceneIds);
console.log('玩法IDs:', existingPlayIds);
console.log('指令IDs:', existingCommandIds);
console.log('\n=== 测试完成 ===');