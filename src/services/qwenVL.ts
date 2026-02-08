/**
 * 通义千问 VL (Vision Language) API 服务
 * 用于识别奶茶照片中的文字信息
 */

export interface OcrResult {
  brand: string;       // 品牌名
  name: string;        // 商品名
  ingredients: string; // 配料
  sugar: string;       // 糖量
  ice: string;         // 冰量
  price: string;       // 价格（如果能识别到）
  shop: string;        // 店铺/门店名
  calories: number;    // 估算热量（千卡）
}

const API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

const OCR_PROMPT = `你是一个奶茶订单识别专家和营养师。请仔细观察这张奶茶照片（可能是杯身标签、小票或外卖订单截图），提取以下信息：

1. brand: 品牌名（如喜茶、奈雪、瑞幸、茶百道、霸王茶姬等）
2. name: 商品名/饮品名称
3. ingredients: 配料/加料（如珍珠、椰果、芋圆等，多个用逗号分隔）
4. sugar: 糖量（如正常糖、少糖、半糖、三分糖、无糖等）
5. ice: 冰量（如正常冰、少冰、去冰、温、热等）
6. price: 价格（如果能看到，只写数字）
7. shop: 店铺/门店名（如果能看到，如"国贸店"、"三里屯店"等）
8. calories: 请联网搜索该品牌该饮品的真实热量数据（可参考小红书、官网、美团等平台的热量信息），返回千卡数字。如果搜索不到，根据饮品类型估算。

请严格按照以下JSON格式返回，如果某项识别不到就返回空字符串，calories必须返回一个数字：
{
  "brand": "",
  "name": "",
  "ingredients": "",
  "sugar": "",
  "ice": "",
  "price": "",
  "shop": "",
  "calories": 0
}

只返回JSON，不要有其他文字。`;

/**
 * 调用通义千问 VL API 识别图片
 * @param imageBase64 图片的 base64 编码（包含 data:image/xxx;base64, 前缀）
 * @returns 识别结果
 */
export async function recognizeMilkTea(imageBase64: string): Promise<OcrResult> {
  const apiKey = import.meta.env.VITE_QWEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('未配置 API Key，请在 .env 文件中设置 VITE_QWEN_API_KEY');
  }

  // 提取 base64 数据部分（去掉 data:image/xxx;base64, 前缀）
  const base64Data = imageBase64.includes(',') 
    ? imageBase64.split(',')[1] 
    : imageBase64;
  
  // 获取图片类型
  const mimeMatch = imageBase64.match(/data:([^;]+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const requestBody = {
    model: 'qwen-vl-max',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`
            }
          },
          {
            type: 'text',
            text: OCR_PROMPT
          }
        ]
      }
    ],
    max_tokens: 800,
    // 启用联网搜索功能
    enable_search: true
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`API 调用失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // 提取返回的文本内容
  const content = data.choices?.[0]?.message?.content || '';
  
  // 解析 JSON 结果
  try {
    // 尝试从返回内容中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]) as OcrResult;
      return {
        brand: result.brand || '',
        name: result.name || '',
        ingredients: result.ingredients || '',
        sugar: result.sugar || '',
        ice: result.ice || '',
        price: result.price || '',
        shop: result.shop || '',
        calories: Number(result.calories) || 0
      };
    }
  } catch (e) {
    console.error('JSON 解析失败:', content, e);
  }

  // 如果解析失败，返回空结果
  return {
    brand: '',
    name: '',
    ingredients: '',
    sugar: '',
    ice: '',
    price: '',
    shop: '',
    calories: 0
  };
}
