/**
 * 热量匹配工具
 * 根据品牌和商品名匹配热量数据
 */

import calorieDB from '../data/calorieDB.json';

type CalorieDatabase = Record<string, Record<string, number>>;

/**
 * 模糊匹配热量
 * @param brand 品牌名
 * @param productName 商品名
 * @returns 热量（千卡），未匹配到返回 undefined
 */
export function matchCalories(brand: string, productName: string): number | undefined {
  const db = calorieDB as CalorieDatabase;
  
  // 如果没有品牌，尝试从所有品牌中搜索
  if (!productName) return undefined;
  
  // 标准化品牌名
  const normalizedBrand = brand ? normalizeBrand(brand) : '';
  
  // 如果有品牌，先在品牌下查找
  if (normalizedBrand) {
    const brandData = findBrandData(db, normalizedBrand);
    if (brandData) {
      const calories = findProductCalories(brandData, productName);
      if (calories !== undefined) return calories;
    }
  }
  
  // 如果没找到，尝试从所有品牌中搜索
  for (const brandData of Object.values(db)) {
    const calories = findProductCalories(brandData, productName);
    if (calories !== undefined) return calories;
  }
  
  return undefined;
}

/**
 * 标准化品牌名（处理常见变体）
 */
function normalizeBrand(brand: string): string {
  const brandMap: Record<string, string> = {
    '喜茶': '喜茶',
    'HEYTEA': '喜茶',
    '奈雪': '奈雪的茶',
    '奈雪的茶': '奈雪的茶',
    'NAYUKI': '奈雪的茶',
    '茶百道': '茶百道',
    '霸王茶姬': '霸王茶姬',
    '瑞幸': '瑞幸',
    '瑞幸咖啡': '瑞幸',
    'LUCKIN': '瑞幸',
    '星巴克': '星巴克',
    'STARBUCKS': '星巴克',
    '蜜雪冰城': '蜜雪冰城',
    '古茗': '古茗',
    '沪上阿姨': '沪上阿姨',
    '书亦烧仙草': '书亦烧仙草',
    '书亦': '书亦烧仙草',
    'CoCo': 'CoCo都可',
    'COCO': 'CoCo都可',
    'CoCo都可': 'CoCo都可',
    '一点点': '一点点',
  };
  
  // 尝试直接匹配
  const upperBrand = brand.toUpperCase();
  for (const [key, value] of Object.entries(brandMap)) {
    if (key.toUpperCase() === upperBrand || brand.includes(key)) {
      return value;
    }
  }
  
  return brand;
}

/**
 * 查找品牌数据（支持模糊匹配）
 */
function findBrandData(db: CalorieDatabase, brand: string): Record<string, number> | undefined {
  // 直接匹配
  if (db[brand]) return db[brand];
  
  // 模糊匹配
  for (const key of Object.keys(db)) {
    if (key.includes(brand) || brand.includes(key)) {
      return db[key];
    }
  }
  
  return undefined;
}

/**
 * 查找产品热量（支持模糊匹配）
 */
function findProductCalories(brandData: Record<string, number>, productName: string): number | undefined {
  // 直接匹配
  if (brandData[productName] !== undefined) {
    return brandData[productName];
  }
  
  // 模糊匹配
  for (const [name, calories] of Object.entries(brandData)) {
    // 产品名包含关系
    if (productName.includes(name) || name.includes(productName)) {
      return calories;
    }
    
    // 关键词匹配
    const keywords = extractKeywords(productName);
    const nameKeywords = extractKeywords(name);
    const matchCount = keywords.filter(k => nameKeywords.includes(k)).length;
    if (matchCount >= 2) {
      return calories;
    }
  }
  
  return undefined;
}

/**
 * 提取关键词
 */
function extractKeywords(text: string): string[] {
  const keywords = [
    '奶茶', '拿铁', '美式', '咖啡', '芋泥', '波波', '珍珠',
    '芋圆', '葡萄', '草莓', '芒果', '椰', '抹茶', '乌龙',
    '茉莉', '柠檬', '橙', '烧仙草', '杨枝甘露', '血糯米'
  ];
  
  return keywords.filter(k => text.includes(k));
}

/**
 * 获取所有支持的品牌列表
 */
export function getSupportedBrands(): string[] {
  return Object.keys(calorieDB as CalorieDatabase);
}
