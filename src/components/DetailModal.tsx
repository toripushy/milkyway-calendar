import { useState } from 'react';
import type { MilkTeaRecord } from '../types/record';
import type { IconId } from '../types/record';
import { ICON_PRESETS } from '../constants/icons';
import { TeaIcon } from './TeaIcon';

interface DetailModalProps {
  date: string;
  records: MilkTeaRecord[];
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<MilkTeaRecord>) => void;
  onDelete: (id: string) => void;
}

export function DetailModal({ date, records, onClose, onUpdate, onDelete }: DetailModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (records.length === 0) {
    onClose();
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--detail pixel-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>{date} · 共 {records.length} 条记录</h3>
          <button type="button" className="modal__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="modal__body detail-list">
          {records.map((record) => (
            <DetailCard
              key={record.id}
              record={record}
              isEditing={editingId === record.id}
              onStartEdit={() => setEditingId(record.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={(patch) => {
                onUpdate(record.id, patch);
                setEditingId(null);
              }}
              onDelete={() => {
                if (confirm('确定删除这条记录吗？')) {
                  onDelete(record.id);
                  if (records.length <= 1) onClose();
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface DetailCardProps {
  record: MilkTeaRecord;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: Partial<MilkTeaRecord>) => void;
  onDelete: () => void;
}

function DetailCard({
  record,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
}: DetailCardProps) {
  const [name, setName] = useState(record.name);
  const [price, setPrice] = useState(record.price ?? '');
  const [sugarIce, setSugarIce] = useState(record.sugarIce ?? '');
  const [rating, setRating] = useState<number | ''>(record.rating ?? '');
  const [shop, setShop] = useState(record.shop ?? '');
  const [moodNote, setMoodNote] = useState(record.moodNote ?? '');
  const [iconId, setIconId] = useState<IconId>(record.iconId);
  // 新增字段
  const [brand, setBrand] = useState(record.brand ?? '');
  const [ingredients, setIngredients] = useState(record.ingredients ?? '');
  const [calories, setCalories] = useState<number | ''>(record.calories ?? '');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      name: trimmedName,
      price: price.trim() || undefined,
      sugarIce: sugarIce.trim() || undefined,
      rating: rating === '' ? undefined : Number(rating),
      shop: shop.trim() || undefined,
      moodNote: moodNote.trim() || undefined,
      iconId,
      brand: brand.trim() || undefined,
      ingredients: ingredients.trim() || undefined,
      calories: calories === '' ? undefined : Number(calories),
    });
  };

  if (isEditing) {
    return (
      <div className="detail-card detail-card--editing">
        <div className="detail-card__media">
          {record.imageBase64 ? (
            <img src={record.imageBase64} alt={record.name} />
          ) : (
            <div className="detail-card__no-image">
              <TeaIcon iconId={record.iconId} size={48} />
            </div>
          )}
        </div>
        <div className="detail-card__form">
          <label className="form-row">
            <span className="form-label">品牌名</span>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="form-input"
              placeholder="如：喜茶"
            />
          </label>
          <label className="form-row">
            <span className="form-label">商品名称</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </label>
          <label className="form-row">
            <span className="form-label">配料</span>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="form-input"
              placeholder="如：珍珠、椰果"
            />
          </label>
          <div className="form-row-group">
            <label className="form-row form-row--half">
              <span className="form-label">价格</span>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
              />
            </label>
            <label className="form-row form-row--half">
              <span className="form-label">热量 (kcal)</span>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value ? Number(e.target.value) : '')}
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
              className="form-input"
            />
          </label>
          <label className="form-row">
            <span className="form-label">评分</span>
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
            <span className="form-label">店铺</span>
            <input
              type="text"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className="form-input"
            />
          </label>
          <label className="form-row">
            <span className="form-label">心情/备注</span>
            <input
              type="text"
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              className="form-input"
            />
          </label>
          <div className="form-row">
            <span className="form-label">图标</span>
            <div className="icon-picker icon-picker--small">
              {ICON_PRESETS.map(({ id }) => (
                <button
                  key={id}
                  type="button"
                  className={`icon-picker__item ${iconId === id ? 'icon-picker__item--active' : ''}`}
                  onClick={() => setIconId(id)}
                >
                  <TeaIcon iconId={id} size={24} />
                </button>
              ))}
            </div>
          </div>
          <div className="detail-card__actions">
            <button type="button" className="btn btn--secondary" onClick={onCancelEdit}>
              取消
            </button>
            <button type="button" className="btn btn--primary" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-card">
      <div className="detail-card__media">
        {record.imageBase64 ? (
          <img src={record.imageBase64} alt={record.name} />
        ) : (
          <div className="detail-card__no-image">
            <TeaIcon iconId={record.iconId} size={48} />
          </div>
        )}
      </div>
      <div className="detail-card__body">
        <div className="detail-card__title-row">
          {record.brand && <span className="detail-card__brand">{record.brand}</span>}
          <h4 className="detail-card__name">{record.name}</h4>
        </div>
        <dl className="detail-card__meta">
          {record.ingredients && (
            <>
              <dt>配料</dt>
              <dd>{record.ingredients}</dd>
            </>
          )}
          {record.shop && (
            <>
              <dt>店铺</dt>
              <dd>{record.shop}</dd>
            </>
          )}
          {record.price != null && record.price !== '' && (
            <>
              <dt>价格</dt>
              <dd>¥{record.price}</dd>
            </>
          )}
          {record.calories != null && (
            <>
              <dt>热量</dt>
              <dd>{record.calories} kcal</dd>
            </>
          )}
          {record.sugarIce && (
            <>
              <dt>糖度/冰度</dt>
              <dd>{record.sugarIce}</dd>
            </>
          )}
          {record.rating != null && (
            <>
              <dt>评分</dt>
              <dd>{'★'.repeat(record.rating)}{'☆'.repeat(5 - record.rating)}</dd>
            </>
          )}
          {record.moodNote && (
            <>
              <dt>备注</dt>
              <dd>{record.moodNote}</dd>
            </>
          )}
        </dl>
        <div className="detail-card__actions">
          <button type="button" className="btn btn--secondary" onClick={onStartEdit}>
            编辑
          </button>
          <button type="button" className="btn btn--danger" onClick={onDelete}>
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
