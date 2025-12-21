// 测试ID生成逻辑 - 世界观分组版本
const chineseToFirstLetters = (chineseStr) => {
  const pinyinMap = {
    '废': 'F', '弃': 'Q', '实': 'S', '验': 'Y', '室': 'S', '中': 'Z', '央': 'Y', 
    '公': 'G', '园': 'Y', '图': 'T', '书': 'S', '馆': 'G', '商': 'S', '店': 'D',
    '学': 'X', '校': 'X', '教': 'J', '堂': 'T', '医': 'Y', '院': 'Y', '派': 'P',
    '出': 'C', '所': 'S', '警': 'J', '察': 'C', '局': 'J', '银': 'Y', '行': 'H',
    '车': 'C', '站': 'Z', '机': 'J', '场': 'C', '码': 'M', '头': 'T', '港': 'G',
    '市': 'S', '政': 'Z', '府': 'F', '体': 'T', '育': 'Y', '场': 'C', '文': 'W',
    '化': 'H', '中': 'Z', '心': 'X', '公': 'G', '园': 'Y', '森': 'S', '林': 'L',
    '山': 'S', '顶': 'D', '海': 'H', '边': 'B', '湖': 'H', '泊': 'B', '河': 'H',
    '谷': 'G', '峡': 'X', '瀑': 'P', '布': 'B', '洞': 'D', '穴': 'X', '岛': 'D',
    '古': 'G', '城': 'C', '镇': 'Z', '乡': 'X', '村': 'C', '街': 'J', '道': 'D',
    '路': 'L', '桥': 'Q', '门': 'M', '楼': 'L', '塔': 'T', '寺': 'S', '庙': 'M',
    '观': 'G', '阁': 'G', '台': 'T', '殿': 'D', '堂': 'T', '苑': 'Y', '轩': 'X',
    '居': 'J', '庐': 'L', '舍': 'S', '斋': 'Z', '馆': 'G', '榭': 'X', '亭': 'T',
    '廊': 'L', '轩': 'X', '室': 'S', '房': 'F', '厅': 'T', '堂': 'T', '楼': 'L',
    '阁': 'G', '殿': 'D', '宫': 'G', '府': 'F', '邸': 'D', '第': 'D', '庄': 'Z',
    '园': 'Y', '林': 'L', '圃': 'P', '圃': 'P', '苑': 'Y', '囿': 'Y', '苑': 'Y',
    '城': 'C', '堡': 'B', '寨': 'Z', '关': 'G', '卡': 'K', '站': 'Z', '场': 'C',
    '港': 'G', '湾': 'W', '澳': 'A', '村': 'C', '庄': 'Z', '镇': 'Z', '县': 'X',
    '市': 'S', '区': 'Q', '州': 'Z', '府': 'F', '省': 'S', '京': 'J', '都': 'D',
    '会': 'H', '堂': 'T', '中': 'Z', '心': 'X', '广': 'G', '场': 'C', '馆': 'G',
    '博': 'B', '物': 'W', '院': 'Y', '展': 'Z', '览': 'L', '中': 'Z', '心': 'X',
    '科': 'K', '技': 'J', '园': 'Y', '工': 'G', '业': 'Y', '园': 'Y', '创': 'C',
    '业': 'Y', '园': 'Y', '文': 'W', '化': 'H', '园': 'Y', '艺': 'Y', '术': 'S',
    '中': 'Z', '心': 'X', '运': 'Y', '动': 'D', '场': 'C', '体': 'T', '育': 'Y',
    '中': 'Z', '心': 'X', '游': 'Y', '乐': 'L', '场': 'C', '公': 'G', '园': 'Y',
    '植': 'Z', '物': 'W', '园': 'Y', '动': 'D', '物': 'W', '园': 'Y', '野': 'Y',
    '生': 'S', '园': 'Y', '水': 'S', '族': 'Z', '馆': 'G', '海': 'H', '洋': 'Y',
    '馆': 'G', '天': 'T', '文': 'W', '馆': 'G', '历': 'L', '史': 'S', '博': 'B',
    '物': 'W', '馆': 'G', '自': 'Z', '然': 'R', '博': 'B', '物': 'W', '馆': 'G'
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
      // 如果是英文字母，直接使用
      result += char.toUpperCase();
      charCount++;
    }
  }
  
  // 如果没有找到足够的字符，用A补齐到3位
  while (result.length < 3) {
    result += 'A';
  }
  
  return result;
};

// 修复后的按组递增序号生成函数
const generateSequentialId = (prefix, existingIds, groupPrefix = '', type = 'default') => {
  // 清理和验证existingIds
  const validIds = (existingIds || []).filter(id => id && typeof id === 'string');
  
  if (type === 'layer') {
    // 层级使用3个英文+2位数字格式
    const letters = groupPrefix || 'SET'; // 如果没有指定前缀，使用默认
    
    const existingLayerNumbers = validIds
      .filter(id => id.startsWith(prefix) && id.includes(letters))
      .map(id => {
        const match = id.match(new RegExp(`^${prefix}${letters}(\\d{2})$`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = existingLayerNumbers.length > 0 ? Math.max(...existingLayerNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    return `${prefix}${letters}${nextNumber.toString().padStart(2, '0')}`;
  } else {
    // 其他类型（场景、玩法、指令）使用首字母+3位数字格式
    const letters = groupPrefix || 'AAA'; // 如果没有指定前缀，使用默认
    
    const existingNumbers = validIds
      .filter(id => id.startsWith(prefix) && id.includes(letters))
      .map(id => {
        const match = id.match(new RegExp(`^${prefix}${letters}(\\d{3})$`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    const nextNumber = maxNumber + 1;
    
    return `${prefix}${letters}${nextNumber.toString().padStart(3, '0')}`;
  }
};

// 测试用例
console.log('=== 测试ID生成逻辑 ===');

// 测试1: 空列表生成第一个ID
console.log('\n测试1: 空列表生成第一个ID');
let sceneIds = [];
let prefix = chineseToFirstLetters('废弃实验室');
console.log(`场景前缀: ${prefix}`);
console.log(`生成的ID: ${generateSequentialId('S', sceneIds, prefix, 'scene')}`);

// 测试2: 递增生成
console.log('\n测试2: 递增生成');
sceneIds.push('SFQS001');
console.log(`已有ID: ${sceneIds}`);
console.log(`生成的ID: ${generateSequentialId('S', sceneIds, prefix, 'scene')}`);

// 测试3: 不同前缀的ID
console.log('\n测试3: 不同前缀的ID');
let differentPrefix = chineseToFirstLetters('中央公园');
console.log(`新前缀: ${differentPrefix}`);
console.log(`生成的ID: ${generateSequentialId('S', sceneIds, differentPrefix, 'scene')}`);

// 测试4: 层级ID生成
console.log('\n测试4: 层级ID生成');
let layerIds = [];
let layerPrefix = chineseToFirstLetters('废弃实验室');
console.log(`层级前缀: ${layerPrefix}`);
console.log(`生成的层级ID: ${generateSequentialId('L', layerIds, layerPrefix, 'layer')}`);
layerIds.push('LFQS01');
console.log(`已有ID: ${layerIds}`);
console.log(`生成的层级ID: ${generateSequentialId('L', layerIds, layerPrefix, 'layer')}`);

// 测试5: 默认前缀
console.log('\n测试5: 默认前缀');
console.log(`生成的默认ID: ${generateSequentialId('P', [], '', 'play')}`);

console.log('\n=== 测试完成 ===');