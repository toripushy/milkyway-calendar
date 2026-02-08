export type IconId = 'pearl' | 'fruit' | 'coffee' | 'milk' | 'matcha';

export interface MilkTeaRecord {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  imageBase64?: string;
  price?: string;
  sugarIce?: string;
  rating?: number; // 1-5
  shop?: string;
  moodNote?: string;
  iconId: IconId;
  createdAt: string; // ISO
  // 新增字段
  brand?: string;       // 品牌名（如喜茶、奈雪等）
  ingredients?: string; // 配料（如珍珠、椰果等）
  calories?: number;    // 热量（千卡）
}
