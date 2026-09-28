import { AppDataStore } from '@/types';
import { generateDemoStore } from './demoData';

const STORAGE_KEY = 'attendai_real_data_v2';

export function createEmptyStore(): AppDataStore {
  return {
    version: 2,
    settings: {
      studentName: '',
      collegeName: '',
      department: '',
      semester: '',
      section: '',
      selectedBatch: 'All',
      targetPercentage: 75,
      semesterStartDate: new Date().toISOString().split('T')[0],
      trackingMode: 'from_today',
      theme: 'dark',
    },
    timetable: { days: [] },
    subjects: [],
    attendanceRecords: [],
    holidays: [],
    extraClasses: [],
    lastUpdated: new Date().toISOString(),
  };
}

export function getInitialAppData(): AppDataStore {
  if (typeof window === 'undefined') {
    return createEmptyStore();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.subjects) && parsed.timetable) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load AttendAI data from localStorage:', err);
  }

  // Default to clean real empty store for actual timetable upload
  return createEmptyStore();
}

export function saveAppData(data: AppDataStore): void {
  if (typeof window === 'undefined') return;
  try {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save AttendAI data to localStorage:', err);
  }
}

export function clearAppData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}

export function exportAppDataJSON(data: AppDataStore): string {
  return JSON.stringify(data, null, 2);
}

export function importAppDataJSON(jsonString: string): AppDataStore {
  const parsed = JSON.parse(jsonString) as AppDataStore;
  if (!parsed.timetable || !parsed.subjects || !Array.isArray(parsed.attendanceRecords)) {
    throw new Error('Invalid AttendAI backup file format.');
  }
  return parsed;
}
