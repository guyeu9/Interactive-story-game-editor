// 测试ID生成逻辑 - 修复版本
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
    
    const worldviewPrefix = worldviewName ? chineseToFirstLetters(worldviewName).substring(0, 3) : '';
    const combinedPrefix = groupPrefix || worldviewPrefix || 'AAA';
    
    if (type === 'layer') {
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

console.log('\n=== 最终ID列表 ===');
console.log('场景IDs:', existingSceneIds);