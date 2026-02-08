import { getIconById, DEFAULT_ICON_ID } from '../constants/icons';
import type { IconId } from '../types/record';

interface TeaIconProps {
  iconId: IconId;
  size?: number;
  className?: string;
  bounce?: boolean;
}

const VALID_ICON_IDS: IconId[] = ['pearl', 'fruit', 'coffee', 'milk', 'matcha'];

export function TeaIcon({ iconId, size = 24, className = '', bounce = false }: TeaIconProps) {
  const safeId = (iconId && VALID_ICON_IDS.includes(iconId as IconId) ? iconId : DEFAULT_ICON_ID) as IconId;
  const { Icon } = getIconById(safeId);
  return (
    <span className={`tea-icon ${bounce ? 'tea-icon--bounce' : ''} ${className}`.trim()}>
      <Icon size={size} strokeWidth={2} aria-hidden />
    </span>
  );
}
