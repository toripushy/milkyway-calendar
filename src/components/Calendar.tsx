import dayjs, { type Dayjs } from 'dayjs';
import { useRecordsByMonth } from '../hooks/useRecords';
import { TeaIcon } from './TeaIcon';
import type { MilkTeaRecord } from '../types/record';

interface CalendarProps {
  currentMonth: Dayjs;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (date: string, records: MilkTeaRecord[]) => void;
  bounceDate: string | null;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function Calendar({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  bounceDate,
}: CalendarProps) {
  const year = currentMonth.year();
  const month = currentMonth.month();
  const byDate = useRecordsByMonth(year, month + 1);

  const start = currentMonth.startOf('month');
  const startWeekday = start.day();
  const daysInMonth = currentMonth.daysInMonth();
  const prevMonth = currentMonth.subtract(1, 'month');
  const prevDays = prevMonth.daysInMonth();
  const cells: { date: string; day: number; isCurrentMonth: boolean }[] = [];

  for (let i = 0; i < startWeekday; i++) {
    const d = prevDays - startWeekday + 1 + i;
    const date = prevMonth.date(d).format('YYYY-MM-DD');
    cells.push({ date, day: d, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = currentMonth.date(d).format('YYYY-MM-DD');
    cells.push({ date, day: d, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  const nextMonth = currentMonth.add(1, 'month');
  for (let d = 1; d <= remaining; d++) {
    const date = nextMonth.date(d).format('YYYY-MM-DD');
    cells.push({ date, day: d, isCurrentMonth: false });
  }

  // 计算当天总热量
  const getTotalCalories = (records: MilkTeaRecord[]): number => {
    return records.reduce((sum, r) => sum + (r.calories || 0), 0);
  };

  return (
    <section className="calendar">
      <header className="calendar__header">
        <button type="button" className="calendar__nav" onClick={onPrevMonth} aria-label="上一月">
          ‹
        </button>
        <h2 className="calendar__title">
          {currentMonth.format('MMMM YYYY')}
        </h2>
        <button type="button" className="calendar__nav" onClick={onNextMonth} aria-label="下一月">
          ›
        </button>
      </header>
      <div className="calendar__weekdays">
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar__weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar__grid">
        {cells.map(({ date, day, isCurrentMonth }) => {
          const records = byDate[date] ?? [];
          const first = records[0];
          const hasBounce = bounceDate === date;
          const totalCalories = getTotalCalories(records);
          const isToday = date === dayjs().format('YYYY-MM-DD');

          return (
            <div
              key={date}
              className={`calendar__cell ${!isCurrentMonth ? 'calendar__cell--other' : ''} ${records.length ? 'calendar__cell--has-record' : ''} ${isToday ? 'calendar__cell--highlight' : ''}`}
            >
              <span className="calendar__cell-day">{day}</span>
              {first && (
                <button
                  type="button"
                  className={`calendar__cell-icon ${hasBounce ? 'calendar__cell-icon--bounce' : ''}`}
                  onClick={() => onDateClick(date, records)}
                  title={[first.brand, first.name, first.moodNote].filter(Boolean).join(' · ')}
                >
                  <TeaIcon iconId={first.iconId} size={24} bounce={hasBounce} />
                  {records.length > 1 && (
                    <span className="calendar__cell-badge">{records.length}</span>
                  )}
                </button>
              )}
              {first && (
                <div className="calendar__cell-info">
                  <span className="calendar__cell-name">{first.name}</span>
                  {totalCalories > 0 && (
                    <span className="calendar__cell-calories">{totalCalories}kcal</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
