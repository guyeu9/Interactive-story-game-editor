// 测试新修复的功能
const generateSequentialId = (prefix, existingIds, groupStartNumber = 1, type = 'default') => {
  if (type === 'layer') {
    // 层级使用3个英文+2位数字格式
    const existingLayerNumbers = existingIds
      .filter(id => id && id.startsWith(prefix))
      .map(id => {
        const match = id.match(new RegExp(`^${prefix}([A-Z]{3})(\\d{2})$`));
        return match ? { letters: match[1], number: parseInt(match[2]) } : null;
      })
      .filter(item => item);

    let maxNumber = 0;
    if (existingLayerNumbers.length > 0) {
      maxNumber = Math.max(...existingLayerNumbers.map(item => item.number));
    }
    
    const nextNumber = maxNumber + 1;
    const defaultLetters = prefix === 'L' ? 'SET' : 'AAA'; // 默认字母
    
    // 查找是否存在相同的letters前缀，如果有则使用最大的数字
    const existingWithDefaultLetters = existingLayerNumbers.filter(item => item.letters === defaultLetters);
    if (existingWithDefaultLetters.length > 0) {
      maxNumber = Math.max(...existingWithDefaultLetters.map(item => item.number));
    }
    
    const finalNumber = existingWithDefaultLetters.length > 0 ? maxNumber + 1 : groupStartNumber;
    return `${prefix}${defaultLetters}${finalNumber.toString().padStart(2, '0')}`;
  } else {
    // 其他类型保持原有的3位数字格式
    const existingNumbers = existingIds
      .filter(id => id && id.startsWith(prefix))
      .map(id => {
        const match = id.match(new RegExp(`^${prefix}(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : groupStartNumber - 1;
    const nextNumber = maxNumber + 1;
    
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }
};

const chineseToFirstLetters = (chineseStr) => {
  const pinyinMap = {
    '废': 'F', '弃': 'Q', '实': 'S', '验': 'Y', '室': 'S', '中': 'Z', '央': 'Y', 
    '公': 'G', '园': 'Y', '图': 'T', '书': 'S', '馆': 'G', '商': 'S', '店': 'D',
    '学': 'X', '校': 'X', '教': 'J', '堂': 'T', '医': 'Y', '院': 'Y', '派': 'P',
    '出': 'C', '所': 'S', '警': 'J', '察': 'C', '局': 'J', '银': 'Y', '行': 'H',
    '车': 'C', '站': 'Z', '机': 'J', '场': 'C', '码': 'M', '头': 'T', '港': 'G'
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

console.log('=== 测试中文转首字母 ===');
console.log('废弃实验室:', chineseToFirstLetters('废弃实验室'));
console.log('中央公园:', chineseToFirstLetters('中央公园'));
console.log('图书馆:', chineseToFirstLetters('图书馆'));
console.log('购物中心:', chineseToFirstLetters('购物中心'));

console.log('\n=== 测试层级ID生成 ===');
let layerIds = [];
for (let i = 0; i < 5; i++) {
  const newId = generateSequentialId('L', layerIds, 1, 'layer');
  layerIds.push(newId);
  console.log(`层级 ${i+1}: ${newId}`);
}

console.log('\n=== 测试使用场景名称作为层级前缀 ===');
const sceneName = '废弃实验室';
const sceneFirstLetters = chineseToFirstLetters(sceneName);
console.log(`场景 "${sceneName}" 的首字母: ${sceneFirstLetters}`);

let specialLayerIds = [];
for (let i = 0; i < 3; i++) {
  // 模拟生成基于场景名称的层级ID
  const existingNumbers = specialLayerIds
    .filter(id => id.startsWith(`L${sceneFirstLetters}`))
    .map(id => {
      const match = id.match(new RegExp(`^L${sceneFirstLetters}(\\d{2})$`));
      return match ? parseInt(match[1]) : 0;
    })
    .filter(num => num > 0);
  
  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  const nextNumber = maxNumber + 1;
  const newId = `L${sceneFirstLetters}${nextNumber.toString().padStart(2, '0')}`;
  specialLayerIds.push(newId);
  
  console.log(`特殊层级 ${i+1}: ${newId}`);
}

console.log('\n=== 测试场景ID生成（保持原格式）===');
let sceneIds = [];
for (let i = 0; i < 3; i++) {
  const newId = generateSequentialId('S', sceneIds, 1, 'scene');
  sceneIds.push(newId);
  console.log(`场景 ${i+1}: ${newId}`);
}