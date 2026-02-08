import { useState, useEffect, useCallback } from 'react';
import type { MilkTeaRecord } from '../types/record';
import * as storage from '../utils/storage';

const UPDATE_EVENT = 'milkyway-records-update';

function loadRecords(): MilkTeaRecord[] {
  return storage.getAllRecords();
}

export function useRecords() {
  const [records, setRecords] = useState<MilkTeaRecord[]>(loadRecords);

  // 初始化时从服务器同步数据
  useEffect(() => {
    storage.syncFromServer().then(() => {
      setRecords(loadRecords());
    });
  }, []);

  useEffect(() => {
    const handler = () => setRecords(loadRecords());
    window.addEventListener(UPDATE_EVENT, handler);
    return () => window.removeEventListener(UPDATE_EVENT, handler);
  }, []);

  const addRecord = useCallback((record: MilkTeaRecord) => {
    storage.addRecord(record);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }, []);

  const updateRecord = useCallback((id: string, patch: Partial<MilkTeaRecord>) => {
    storage.updateRecord(id, patch);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }, []);

  const deleteRecord = useCallback((id: string) => {
    storage.deleteRecord(id);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  }, []);

  return { records, addRecord, updateRecord, deleteRecord };
}

export function useRecordsByMonth(year: number, month: number): Record<string, MilkTeaRecord[]> {
  const [byDate, setByDate] = useState<Record<string, MilkTeaRecord[]>>(() =>
    storage.getRecordsByMonth(year, month)
  );

  // 从服务器获取当月数据
  useEffect(() => {
    storage.getRecordsByMonthAsync(year, month).then(setByDate);
  }, [year, month]);

  useEffect(() => {
    const handler = () => {
      storage.getRecordsByMonthAsync(year, month).then(setByDate);
    };
    window.addEventListener(UPDATE_EVENT, handler);
    return () => window.removeEventListener(UPDATE_EVENT, handler);
  }, [year, month]);

  return byDate;
}
