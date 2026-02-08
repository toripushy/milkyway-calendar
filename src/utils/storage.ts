import type { MilkTeaRecord } from '../types/record';

// API 基础地址 - 在 Docker 中通过 nginx 代理到 /api
const API_BASE = '/api';

// localStorage 作为缓存/回退
const STORAGE_KEY = 'milkyway_records';

// 本地缓存操作
function loadLocal(): MilkTeaRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MilkTeaRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocal(records: MilkTeaRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ============ 异步 API 函数 ============

export async function getAllRecordsAsync(): Promise<MilkTeaRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/records`);
    if (!res.ok) throw new Error('API 请求失败');
    const records = await res.json();
    saveLocal(records); // 同步到本地缓存
    return records;
  } catch (error) {
    console.warn('从 API 获取失败，使用本地缓存:', error);
    return loadLocal();
  }
}

export async function getRecordsByMonthAsync(year: number, month: number): Promise<Record<string, MilkTeaRecord[]>> {
  try {
    const res = await fetch(`${API_BASE}/records/month/${year}/${month}`);
    if (!res.ok) throw new Error('API 请求失败');
    return await res.json();
  } catch (error) {
    console.warn('从 API 获取失败，使用本地缓存:', error);
    // 回退到本地计算
    const records = loadLocal();
    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}-`;
    const out: Record<string, MilkTeaRecord[]> = {};
    for (const r of records) {
      if (r.date.startsWith(prefix)) {
        if (!out[r.date]) out[r.date] = [];
        out[r.date].push(r);
      }
    }
    for (const key of Object.keys(out)) {
      out[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    return out;
  }
}

export async function addRecordAsync(record: MilkTeaRecord): Promise<void> {
  // 先更新本地缓存（乐观更新）
  const list = loadLocal();
  list.push(record);
  saveLocal(list);

  try {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('API 请求失败');
  } catch (error) {
    console.warn('保存到 API 失败，数据已保存在本地:', error);
  }
}

export async function updateRecordAsync(id: string, patch: Partial<MilkTeaRecord>): Promise<void> {
  // 先更新本地缓存
  const list = loadLocal();
  const i = list.findIndex((r) => r.id === id);
  if (i !== -1) {
    list[i] = { ...list[i], ...patch };
    saveLocal(list);
  }

  try {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('API 请求失败');
  } catch (error) {
    console.warn('更新 API 失败，数据已保存在本地:', error);
  }
}

export async function deleteRecordAsync(id: string): Promise<void> {
  // 先更新本地缓存
  const list = loadLocal().filter((r) => r.id !== id);
  saveLocal(list);

  try {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('API 请求失败');
  } catch (error) {
    console.warn('从 API 删除失败，本地已删除:', error);
  }
}

// ============ 同步函数（用于兼容性，读取本地缓存） ============

export function getAllRecords(): MilkTeaRecord[] {
  return loadLocal();
}

export function getRecordsByDate(date: string): MilkTeaRecord[] {
  return loadLocal().filter((r) => r.date === date);
}

export function getRecordsByMonth(year: number, month: number): Record<string, MilkTeaRecord[]> {
  const records = loadLocal();
  const monthStr = String(month).padStart(2, '0');
  const prefix = `${year}-${monthStr}-`;
  const out: Record<string, MilkTeaRecord[]> = {};
  for (const r of records) {
    if (r.date.startsWith(prefix)) {
      if (!out[r.date]) out[r.date] = [];
      out[r.date].push(r);
    }
  }
  for (const key of Object.keys(out)) {
    out[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return out;
}

export function addRecord(record: MilkTeaRecord): void {
  const list = loadLocal();
  list.push(record);
  saveLocal(list);
  // 异步同步到服务器
  addRecordAsync(record).catch(() => {});
}

export function updateRecord(id: string, patch: Partial<MilkTeaRecord>): void {
  const list = loadLocal();
  const i = list.findIndex((r) => r.id === id);
  if (i === -1) return;
  list[i] = { ...list[i], ...patch };
  saveLocal(list);
  // 异步同步到服务器
  updateRecordAsync(id, patch).catch(() => {});
}

export function deleteRecord(id: string): void {
  const list = loadLocal().filter((r) => r.id !== id);
  saveLocal(list);
  // 异步同步到服务器
  deleteRecordAsync(id).catch(() => {});
}

// 初始化时从服务器同步数据
export async function syncFromServer(): Promise<void> {
  try {
    const records = await getAllRecordsAsync();
    saveLocal(records);
    console.log('已从服务器同步数据，共', records.length, '条记录');
  } catch (error) {
    console.warn('从服务器同步失败:', error);
  }
}
