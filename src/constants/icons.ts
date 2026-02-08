import type { IconId } from '../types/record';
import { Citrus, Coffee, CupSoda, Leaf, Milk } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const ICON_PRESETS: { id: IconId; label: string; Icon: LucideIcon }[] = [
  { id: 'pearl', label: '珍珠奶茶', Icon: CupSoda },
  { id: 'fruit', label: '水果茶', Icon: Citrus },
  { id: 'coffee', label: '咖啡', Icon: Coffee },
  { id: 'milk', label: '鲜奶', Icon: Milk },
  { id: 'matcha', label: '抹茶', Icon: Leaf },
];

export const DEFAULT_ICON_ID: IconId = 'pearl';

export function getIconById(id: IconId) {
  return ICON_PRESETS.find((p) => p.id === id) ?? ICON_PRESETS[0];
}
