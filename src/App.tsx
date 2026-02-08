import { useState, useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useRecords } from './hooks/useRecords';
import { Calendar } from './components/Calendar';
import { UploadModal } from './components/UploadModal';
import { DetailModal } from './components/DetailModal';

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
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">MilkyWay Calendar</h1>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setUploadOpen(true)}
        >
          打卡
        </button>
      </header>
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
