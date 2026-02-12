import { useState, useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useRecords } from './hooks/useRecords';
import { Calendar } from './components/Calendar';
import { UploadModal } from './components/UploadModal';
import { DetailModal } from './components/DetailModal';
import { CatMascot } from './components/CatMascot';

function App() {
  const { records, addRecord, updateRecord, deleteRecord } = useRecords();
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(() => dayjs());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [bounceDate, setBounceDate] = useState<string | null>(null);

  useEffect(() => {
    if (!bounceDate) return;
    const t = setTimeout(() => setBounceDate(null), 600);
    return () => clearTimeout(t);
  }, [bounceDate]);

  const handleDateClick = (date: string) => {
    setDetailDate(date);
  };

  const handleCloseDetail = () => {
    setDetailDate(null);
  };

  const detailRecordsForDate = detailDate
    ? records.filter((r) => r.date === detailDate)
    : [];

  return (
    <div className="app app-container">
      <header className="app-header">
        <div className="app-header__logo-wrap">
          <div className="pixel-snowfall" aria-hidden>
            {Array.from({ length: 24 }, (_, i) => (
              <span
                key={i}
                className="pixel-star"
                style={{
                  left: `${(i * 4.5) % 100}%`,
                  animationDelay: `${(i * 0.4) % 5}s`,
                  animationDuration: `${4 + (i % 3)}s`,
                }}
              />
            ))}
          </div>
          <img
            src="/milkyway-calendar-headline-pixel.svg"
            alt="MilkyWay calendar"
            className="app-logo"
          />
        </div>
        <div className="app-header__bottom">
          <button
            type="button"
            className="btn btn--primary pixel-btn app-header__action"
            onClick={() => setUploadOpen(true)}
          >
            ~bring your own drinks~
          </button>
        </div>
      </header>
      <CatMascot />
      <Calendar
        currentMonth={currentMonth}
        onPrevMonth={() => setCurrentMonth((m) => m.subtract(1, 'month'))}
        onNextMonth={() => setCurrentMonth((m) => m.add(1, 'month'))}
        onDateClick={(date) => handleDateClick(date)}
        bounceDate={bounceDate}
      />
      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onSubmit={addRecord}
          onBounceDate={setBounceDate}
        />
      )}
      {detailDate && detailRecordsForDate.length > 0 && (
        <DetailModal
          date={detailDate}
          records={detailRecordsForDate}
          onClose={handleCloseDetail}
          onUpdate={updateRecord}
          onDelete={deleteRecord}
        />
      )}
    </div>
  );
}

export default App;
