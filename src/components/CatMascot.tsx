import { useState, useEffect, useCallback } from 'react';

const MESSAGES = [
  '这奶盖油得能糊住我的爪子，你是喝润滑油吗喵？',
  '明亮的果酸像刚摘的猫薄荷，这杯算你有眼光喵。',
  '满杯淀粉小料，你是打算煮一碗乱炖鱼粥吗喵？',
  '糖分高得能把我腌成腊肉，你是想直接冬眠吗喵？',
  '这豆子带着一股烟灰缸味，是在仓库里吃灰多年喵？',
  '抹茶的苦回甘得刚刚好，总算没亵渎那片绿意喵。',
  '只有死甜没有层次，这玩意儿只适合还没断奶喵。',
  '谷物香气处理得还行，勉强算你有平衡的艺术喵。',
  '满杯冰块加色素，你喝的是商家的营销套路喵。',
  '奶泡塌得像个旧猫窝，但豆子新鲜就饶了你喵。',
];

function pickRandomIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  let next = Math.floor(Math.random() * total);
  if (next === current) next = (next + 1) % total;
  return next;
}

type Phase = 'typing' | 'visible' | 'hiding' | 'hidden';

const TYPING_INTERVAL = 80;
const VISIBLE_DURATION = 5000;
const HIDING_DURATION = 300;
const HIDDEN_DURATION = 5000;

export function CatMascot() {
  const [phase, setPhase] = useState<Phase>('hidden');
  const [messageIndex, setMessageIndex] = useState(0);
  const [visibleLength, setVisibleLength] = useState(0);
  const [showBubble, setShowBubble] = useState(false);

  const message = MESSAGES[messageIndex];

  const advancePhase = useCallback(() => {
    if (phase === 'hidden') {
      setPhase('typing');
      setVisibleLength(0);
      setShowBubble(true);
      setMessageIndex((i) => pickRandomIndex(i, MESSAGES.length));
    } else if (phase === 'typing') {
      if (visibleLength >= message.length) {
        setPhase('visible');
      } else {
        setVisibleLength((n) => n + 1);
      }
    } else if (phase === 'visible') {
      setPhase('hiding');
    } else if (phase === 'hiding') {
      setShowBubble(false);
      setPhase('hidden');
    }
  }, [phase, visibleLength, message.length]);

  useEffect(() => {
    if (phase === 'hidden') {
      const t = setTimeout(advancePhase, HIDDEN_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === 'typing') {
      if (visibleLength >= message.length) {
        const t = setTimeout(advancePhase, 0);
        return () => clearTimeout(t);
      }
      const t = setTimeout(advancePhase, TYPING_INTERVAL);
      return () => clearTimeout(t);
    }
    if (phase === 'visible') {
      const t = setTimeout(advancePhase, VISIBLE_DURATION);
      return () => clearTimeout(t);
    }
    if (phase === 'hiding') {
      const t = setTimeout(advancePhase, HIDING_DURATION);
      return () => clearTimeout(t);
    }
  }, [phase, visibleLength, message.length, advancePhase]);

  useEffect(() => {
    const t = setTimeout(() => {
      setMessageIndex(Math.floor(Math.random() * MESSAGES.length));
      setPhase('typing');
      setShowBubble(true);
      setVisibleLength(0);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="cat-mascot">
      {showBubble && (
        <div
          className={`cat-mascot__bubble ${phase === 'hiding' ? 'cat-mascot__bubble--hiding' : ''}`}
        >
          <span className="cat-mascot__bubble-text">
            {message.slice(0, visibleLength)}
            {phase === 'typing' && <span className="cat-mascot__bubble-cursor">|</span>}
          </span>
        </div>
      )}
      <img
        src="/jes-index3.svg"
        alt=""
        className="cat-mascot__img"
      />
    </div>
  );
}
