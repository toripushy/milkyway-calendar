import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import type { MilkTeaRecord } from '../types/record';
import type { IconId } from '../types/record';
import { ICON_PRESETS, DEFAULT_ICON_ID } from '../constants/icons';
import { TeaIcon } from './TeaIcon';
import { recognizeMilkTea } from '../services/qwenVL';
import { matchCalories } from '../utils/calorieMatch';

// HEIC 转换函数
async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    // 动态导入 heic2any
    const heic2any = (await import('heic2any')).default;
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.85
    });
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch (err) {
    console.error('HEIC 转换失败:', err);
    throw err;
  }
}

interface UploadModalProps {
  onClose: () => void;
  onSubmit: (record: MilkTeaRecord) => void;
  onBounceDate?: (date: string) => void;
}

function generateId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function UploadModal({ onClose, onSubmit, onBounceDate }: UploadModalProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [sugarIce, setSugarIce] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [shop, setShop] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [iconId, setIconId] = useState<IconId>(DEFAULT_ICON_ID);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  
  // 新增字段
  const [brand, setBrand] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  
  // OCR 状态
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [ocrError, setOcrError] = useState('');

  const handleFile = async (file: File | null) => {
    setOcrError('');
    
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      setImageBase64(null);
      return;
    }
    
    // 检查是否是 HEIC 格式
    const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif') ||
                   file.type === 'image/heic' ||
                   file.type === 'image/heif';
    
    // 检查文件类型
    const isImage = file.type.startsWith('image/') || isHeic || file.type === '';
    if (!isImage) {
      setOcrError('请上传图片文件（JPG、PNG 等）');
      return;
    }
    
    let processedFile = file;
    
    // 尝试转换 HEIC 格式
    if (isHeic) {
      setOcrError('正在转换 HEIC 格式，请稍候...');
      setIsRecognizing(true);
      try {
        processedFile = await convertHeicToJpeg(file);
        setOcrError('');
        console.log('HEIC 转换成功');
      } catch (err) {
        console.error('HEIC 转换失败:', err);
        setOcrError('HEIC 转换失败，建议点击下方"拍照"按钮直接拍照上传');
        setIsRecognizing(false);
        return;
      }
    }
    
    setImageFile(processedFile);
    
    // 转换为 base64
    try {
      const base64 = await fileToBase64(processedFile);
      setImageBase64(base64);
      
      // 检查是否是有效的图片预览
      if (base64.startsWith('data:image/')) {
        setImagePreview(base64);
      } else {
        setImagePreview('heic'); // 无法预览时显示占位符
      }
      
      // 自动触发 OCR 识别
      setIsRecognizing(true);
      setOcrError('');
      
      try {
        const result = await recognizeMilkTea(base64);
        console.log('OCR 识别结果:', result);
        
        // 自动填充识别结果
        if (result.name) setName(result.name);
        if (result.brand) setBrand(result.brand);
        if (result.ingredients) setIngredients(result.ingredients);
        if (result.price) setPrice(result.price);
        if (result.shop) setShop(result.shop);
        
        // 合并糖量和冰量
        const sugarIceText = [result.sugar, result.ice].filter(Boolean).join(' / ');
        if (sugarIceText) setSugarIce(sugarIceText);
        
        // 使用 AI 返回的热量
        if (result.calories && result.calories > 0) {
          setCalories(result.calories);
          console.log('AI 估算热量:', result.calories);
        } else if (result.name) {
          // 如果 AI 没返回热量，尝试本地匹配
          const matchedCalories = matchCalories(result.brand || '', result.name);
          console.log('本地匹配热量:', matchedCalories);
          if (matchedCalories) {
            setCalories(matchedCalories);
          }
        }
        
        // 根据品牌/商品名自动选择图标
        autoSelectIcon(result.name || '', result.brand || '');
        
      } catch (err) {
        console.error('OCR 识别失败:', err);
        setOcrError('识别失败，请手动填写信息');
      } finally {
        setIsRecognizing(false);
      }
      
    } catch (err) {
      console.error('图片处理失败:', err);
      setOcrError('图片处理失败');
    }
  };
  
  // 根据商品名自动选择图标
  const autoSelectIcon = (productName: string, brandName: string) => {
    const text = `${productName} ${brandName}`.toLowerCase();
    
    if (text.includes('咖啡') || text.includes('拿铁') || text.includes('美式') || 
        text.includes('瑞幸') || text.includes('星巴克') || text.includes('coffee')) {
      setIconId('coffee');
    } else if (text.includes('抹茶') || text.includes('绿茶') || text.includes('茉莉')) {
      setIconId('matcha');
    } else if (text.includes('果') || text.includes('柠檬') || text.includes('橙') || 
               text.includes('葡萄') || text.includes('草莓') || text.includes('芒')) {
      setIconId('fruit');
    } else if (text.includes('鲜奶') || text.includes('牛乳') || text.includes('纯奶')) {
      setIconId('milk');
    } else {
      setIconId('pearl'); // 默认珍珠奶茶
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('请填写商品名称');
      return;
    }
    
    const record: MilkTeaRecord = {
      id: generateId(),
      date,
      name: trimmedName,
      imageBase64: imageBase64 || undefined,
      price: price.trim() || undefined,
      sugarIce: sugarIce.trim() || undefined,
      rating: rating === '' ? undefined : Number(rating),
      shop: shop.trim() || undefined,
      moodNote: moodNote.trim() || undefined,
      iconId,
      createdAt: new Date().toISOString(),
      // 新增字段
      brand: brand.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      calories: calories === '' ? undefined : Number(calories),
    };
    onSubmit(record);
    onBounceDate?.(date);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--upload pixel-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>打卡 · 记录一杯奶茶</h3>
          <button type="button" className="modal__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal__body">
          {/* 拍照按钮（解决 HEIC 问题） */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="upload-zone__input"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          
          <div className="upload-buttons">
            <button
              type="button"
              className="btn btn--secondary upload-btn"
              onClick={() => inputRef.current?.click()}
            >
              选择照片
            </button>
            <button
              type="button"
              className="btn btn--primary upload-btn"
              onClick={() => cameraRef.current?.click()}
            >
              拍照上传
            </button>
          </div>
          
          <div
            className={`upload-zone ${dragOver ? 'upload-zone--active' : ''} ${isRecognizing ? 'upload-zone--recognizing' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="upload-zone__input"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {imagePreview ? (
              <div className="upload-zone__preview-wrapper">
                {imagePreview === 'heic' ? (
                  <div className="upload-zone__heic-placeholder">
                    <span className="upload-zone__heic-icon">📷</span>
                    <span>HEIC 格式已上传</span>
                    <span className="upload-zone__heic-hint">（浏览器无法预览，但 AI 可以识别）</span>
                  </div>
                ) : (
                  <img src={imagePreview} alt="预览" className="upload-zone__preview" />
                )}
                {isRecognizing && (
                  <div className="upload-zone__recognizing">
                    <span className="upload-zone__spinner"></span>
                    <span>AI 识别中...</span>
                  </div>
                )}
              </div>
            ) : (
              <span className="upload-zone__hint">拖拽照片到此处，或点击上方按钮</span>
            )}
          </div>
          
          {ocrError && <p className="form-warning">{ocrError}</p>}

          {/* 品牌名 */}
          <label className="form-row">
            <span className="form-label">品牌名</span>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="如：喜茶、奈雪、瑞幸"
              className="form-input"
            />
          </label>

          <label className="form-row">
            <span className="form-label">商品名称 <em>*</em></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：珍珠奶茶"
              className="form-input"
            />
          </label>
          
          {/* 配料 */}
          <label className="form-row">
            <span className="form-label">配料</span>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="如：珍珠、椰果、芋圆"
              className="form-input"
            />
          </label>
          
          <label className="form-row">
            <span className="form-label">饮用日期 <em>*</em></span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
            />
          </label>
          
          <div className="form-row-group">
            <label className="form-row form-row--half">
              <span className="form-label">价格</span>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="如：18"
                className="form-input"
              />
            </label>
            <label className="form-row form-row--half">
              <span className="form-label">热量 (kcal)</span>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')}
                placeholder="自动匹配"
                className="form-input"
              />
            </label>
          </div>
          
          <label className="form-row">
            <span className="form-label">糖度/冰度</span>
            <input
              type="text"
              value={sugarIce}
              onChange={(e) => setSugarIce(e.target.value)}
              placeholder="如：少糖少冰"
              className="form-input"
            />
          </label>
          <label className="form-row">
            <span className="form-label">评分 (1-5)</span>
            <div className="form-stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`form-star ${rating !== '' && n <= Number(rating) ? 'form-star--on' : ''}`}
                  onClick={() => setRating(n)}
                >
                  ★
                </button>
              ))}
            </div>
          </label>
          <label className="form-row">
            <span className="form-label">店铺/门店</span>
            <input
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="选填，如：国贸店"
              className="form-input"
            />
          </label>
          <label className="form-row">
            <span className="form-label">心情/备注</span>
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="选填，悬停日历时会显示"
              className="form-input"
            />
          </label>

          <div className="form-row">
            <span className="form-label">日历图标</span>
            <div className="icon-picker">
              {ICON_PRESETS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`icon-picker__item ${iconId === id ? 'icon-picker__item--active' : ''}`}
                  onClick={() => setIconId(id)}
                  title={label}
                >
                  <TeaIcon iconId={id} size={28} />
                  <span className="icon-picker__label">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn--primary" disabled={isRecognizing}>
              {isRecognizing ? '识别中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
