'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  AppDataStore,
  AttendanceRecord,
  AttendanceStatus,
  ExtractedTimetable,
  ExtraClass,
  Holiday,
  OverallAttendanceStats,
  Period,
  Subject,
  SubjectAttendanceStats,
  UserSettings,
} from '@/types';
import {
  calculateOverallStats,
  calculateSubjectStats,
  isAcademicPeriod,
  isPeriodForBatch,
} from '@/lib/attendanceCalculations';
import { generateDemoStore } from '@/lib/demoData';
import { createEmptyStore, getInitialAppData, saveAppData } from '@/lib/storage';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AttendanceContextType {
  store: AppDataStore;
  stats: OverallAttendanceStats;
  subjectStatsList: SubjectAttendanceStats[];
  subjectStatsMap: Record<string, SubjectAttendanceStats>;
  isInitialized: boolean;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Attendance actions
  markAttendance: (params: {
    date: string;
    periodId: string;
    subjectId: string;
    status: AttendanceStatus;
    note?: string;
    timeSlot?: string;
    batch?: string | null;
  }) => void;
  bulkMarkDay: (date: string, status: AttendanceStatus) => void;

  // Subject actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;

  // Timetable actions
  updateTimetablePeriod: (dayName: string, periodId: string, updated: Partial<Period>) => void;
  addTimetablePeriod: (dayName: string, period: Period) => void;
  deleteTimetablePeriod: (dayName: string, periodId: string) => void;

  // Holidays & Extra classes
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  removeHoliday: (id: string) => void;
  addExtraClass: (extra: Omit<ExtraClass, 'id'>) => void;
  removeExtraClass: (id: string) => void;

  // Settings & System
  updateSettings: (settings: Partial<UserSettings>) => void;
  loadDemoData: () => void;
  applyExtractedTimetable: (
    timetable: ExtractedTimetable,
    subjects: Subject[],
    settings: Partial<UserSettings>
  ) => void;
  resetAllData: () => void;
  fireConfetti: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<AppDataStore>(createEmptyStore);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Load from local storage once on mount
  useEffect(() => {
    const data = getInitialAppData();
    setStore(data);
    setIsInitialized(true);

    // Set initial theme on HTML root
    const theme = data.settings.theme || 'dark';
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  // Save to local storage whenever store changes
  useEffect(() => {
    if (isInitialized) {
      saveAppData(store);
    }
  }, [store, isInitialized]);

  // Toast notifications helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899'],
    });
  };

  // Compute subject-wise statistics
  const subjectStatsList = useMemo(() => {
    return store.subjects.map((sub) => {
      const init = store.settings.initialAttendance?.[sub.id];
      return calculateSubjectStats(
        sub,
        store.attendanceRecords,
        store.settings.targetPercentage || 75,
        init
      );
    });
  }, [store.subjects, store.attendanceRecords, store.settings]);

  const subjectStatsMap = useMemo(() => {
    const map: Record<string, SubjectAttendanceStats> = {};
    subjectStatsList.forEach((s) => {
      map[s.subjectId] = s;
    });
    return map;
  }, [subjectStatsList]);

  // Count remaining academic classes today
  const todayRemainingCount = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todaySchedule = store.timetable.days.find(
      (d) => d.day.toLowerCase() === todayName.toLowerCase()
    );

    if (!todaySchedule) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const todayRecords = store.attendanceRecords.filter((r) => r.date === todayStr);

    let remaining = 0;
    todaySchedule.periods.forEach((p) => {
      if (!isAcademicPeriod(p)) return;
      if (!isPeriodForBatch(p.batch, store.settings.selectedBatch)) return;
      const recorded = todayRecords.find((r) => r.periodId === p.id);
      if (!recorded || recorded.status === 'unmarked') {
        remaining++;
      }
    });

    return remaining;
  }, [store.timetable, store.attendanceRecords, store.settings.selectedBatch]);

  // Overall statistics
  const stats = useMemo(() => {
    return calculateOverallStats(
      store.subjects,
      store.attendanceRecords,
      store.settings,
      todayRemainingCount
    );
  }, [store.subjects, store.attendanceRecords, store.settings, todayRemainingCount]);

  // Attendance actions
  const markAttendance = ({
    date,
    periodId,
    subjectId,
    status,
    note,
    timeSlot,
    batch,
  }: {
    date: string;
    periodId: string;
    subjectId: string;
    status: AttendanceStatus;
    note?: string;
    timeSlot?: string;
    batch?: string | null;
  }) => {
    setStore((prev) => {
      const existingIdx = prev.attendanceRecords.findIndex(
        (r) => r.date === date && r.periodId === periodId
      );

      const updatedRecords = [...prev.attendanceRecords];
      if (existingIdx >= 0) {
        if (status === 'unmarked') {
          // Remove record if unmarked
          updatedRecords.splice(existingIdx, 1);
        } else {
          updatedRecords[existingIdx] = {
            ...updatedRecords[existingIdx],
            status,
            note: note ?? updatedRecords[existingIdx].note,
            timeSlot: timeSlot ?? updatedRecords[existingIdx].timeSlot,
          };
        }
      } else if (status !== 'unmarked') {
        updatedRecords.push({
          id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          date,
          periodId,
          subjectId,
          status,
          note,
          timeSlot,
          batch,
        });
      }

      return {
        ...prev,
        attendanceRecords: updatedRecords,
      };
    });

    if (status === 'present') {
      showToast('Marked Present', 'success');
    } else if (status === 'absent') {
      showToast('Marked Absent', 'error');
    } else if (status === 'cancelled') {
      showToast('Class Cancelled', 'info');
    }
  };

  const bulkMarkDay = (date: string, status: AttendanceStatus) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dateObj = new Date(date);
    const dayName = days[dateObj.getDay()];
    const daySchedule = store.timetable.days.find(
      (d) => d.day.toLowerCase() === dayName.toLowerCase()
    );

    if (!daySchedule) return;

    setStore((prev) => {
      let records = [...prev.attendanceRecords];

      daySchedule.periods.forEach((period) => {
        if (!isAcademicPeriod(period)) return;
        if (!isPeriodForBatch(period.batch, prev.settings.selectedBatch)) return;

        // Find subject ID
        const sub = prev.subjects.find(
          (s) =>
            s.name.toLowerCase() === period.subject.toLowerCase() ||
            (s.code && period.subject_code && s.code.toLowerCase() === period.subject_code.toLowerCase())
        );

        if (!sub) return;

        const existingIdx = records.findIndex((r) => r.date === date && r.periodId === period.id);
        if (existingIdx >= 0) {
          records[existingIdx] = { ...records[existingIdx], status };
        } else {
          records.push({
            id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            date,
            periodId: period.id,
            subjectId: sub.id,
            status,
            timeSlot: `${period.start} - ${period.end}`,
            batch: period.batch,
          });
        }
      });

      return {
        ...prev,
        attendanceRecords: records,
      };
    });

    showToast(`Marked all classes as ${status} for ${date}`, 'success');
  };

  // Subject actions
  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `subj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setStore((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    showToast(`Added ${newSubject.name}`, 'success');
  };

  const updateSubject = (subject: Subject) => {
    setStore((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subject.id ? subject : s)),
    }));
    showToast(`Updated ${subject.name}`, 'success');
  };

  const deleteSubject = (subjectId: string) => {
    setStore((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
      attendanceRecords: prev.attendanceRecords.filter((r) => r.subjectId !== subjectId),
    }));
    showToast('Subject deleted', 'info');
  };

  // Timetable Period actions
  const updateTimetablePeriod = (dayName: string, periodId: string, updated: Partial<Period>) => {
    setStore((prev) => {
      const days = prev.timetable.days.map((d) => {
        if (d.day.toLowerCase() !== dayName.toLowerCase()) return d;
        return {
          ...d,
          periods: d.periods.map((p) => (p.id === periodId ? { ...p, ...updated } : p)),
        };
      });

      return {
        ...prev,
        timetable: { ...prev.timetable, days },
      };
    });
    showToast('Period updated', 'success');
  };

  const addTimetablePeriod = (dayName: string, period: Period) => {
    setStore((prev) => {
      const days = prev.timetable.days.map((d) => {
        if (d.day.toLowerCase() !== dayName.toLowerCase()) return d;
        return {
          ...d,
          periods: [...d.periods, period],
        };
      });

      return {
        ...prev,
        timetable: { ...prev.timetable, days },
      };
    });
    showToast('Period added', 'success');
  };

  const deleteTimetablePeriod = (dayName: string, periodId: string) => {
    setStore((prev) => {
      const days = prev.timetable.days.map((d) => {
        if (d.day.toLowerCase() !== dayName.toLowerCase()) return d;
        return {
          ...d,
          periods: d.periods.filter((p) => p.id !== periodId),
        };
      });

      return {
        ...prev,
        timetable: { ...prev.timetable, days },
      };
    });
    showToast('Period removed', 'info');
  };

  // Holidays
  const addHoliday = (holiday: Omit<Holiday, 'id'>) => {
    const newHoliday: Holiday = {
      ...holiday,
      id: `hol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setStore((prev) => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday],
    }));
    showToast(`Holiday "${newHoliday.name}" added`, 'success');
  };

  const removeHoliday = (id: string) => {
    setStore((prev) => ({
      ...prev,
      holidays: prev.holidays.filter((h) => h.id !== id),
    }));
    showToast('Holiday removed', 'info');
  };

  // Extra classes
  const addExtraClass = (extra: Omit<ExtraClass, 'id'>) => {
    const newExtra: ExtraClass = {
      ...extra,
      id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setStore((prev) => ({
      ...prev,
      extraClasses: [...prev.extraClasses, newExtra],
    }));
    showToast('Extra class scheduled', 'success');
  };

  const removeExtraClass = (id: string) => {
    setStore((prev) => ({
      ...prev,
      extraClasses: prev.extraClasses.filter((e) => e.id !== id),
    }));
    showToast('Extra class removed', 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setStore((prev) => {
      const updated = { ...prev.settings, ...newSettings };
      if (newSettings.theme) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newSettings.theme);
      }
      return {
        ...prev,
        settings: updated,
      };
    });
    showToast('Settings saved', 'success');
  };

  // Reset to Demo
  const loadDemoData = () => {
    const demo = generateDemoStore();
    setStore(demo);
    showToast('Demo data loaded successfully!', 'success');
    fireConfetti();
  };

  // Apply new extracted timetable from AI
  const applyExtractedTimetable = (
    timetable: ExtractedTimetable,
    subjects: Subject[],
    settings: Partial<UserSettings>
  ) => {
    const newStore: AppDataStore = {
      version: 1,
      timetable,
      subjects,
      attendanceRecords: [],
      holidays: [],
      extraClasses: [],
      settings: {
        ...store.settings,
        studentName: settings.studentName || store.settings.studentName,
        collegeName: timetable.college || settings.collegeName || store.settings.collegeName,
        department: timetable.department || store.settings.department,
        semester: timetable.semester || store.settings.semester,
        section: timetable.section || store.settings.section,
        selectedBatch: settings.selectedBatch || 'All',
        targetPercentage: settings.targetPercentage || 75,
        semesterStartDate: settings.semesterStartDate || new Date().toISOString().split('T')[0],
        trackingMode: settings.trackingMode || 'from_today',
        theme: store.settings.theme || 'dark',
      },
      lastUpdated: new Date().toISOString(),
    };

    setStore(newStore);
    showToast('Personalized attendance tracker generated!', 'success');
    fireConfetti();
  };

  const resetAllData = () => {
    const empty: AppDataStore = {
      version: 1,
      timetable: { days: [] },
      subjects: [],
      attendanceRecords: [],
      holidays: [],
      extraClasses: [],
      settings: {
        studentName: '',
        collegeName: '',
        targetPercentage: 75,
        semesterStartDate: new Date().toISOString().split('T')[0],
        trackingMode: 'from_today',
        theme: 'dark',
      },
      lastUpdated: new Date().toISOString(),
    };
    setStore(empty);
    showToast('All attendance data reset', 'info');
  };

  return (
    <AttendanceContext.Provider
      value={{
        store,
        stats,
        subjectStatsList,
        subjectStatsMap,
        isInitialized,
        toasts,
        showToast,
        removeToast,
        markAttendance,
        bulkMarkDay,
        addSubject,
        updateSubject,
        deleteSubject,
        updateTimetablePeriod,
        addTimetablePeriod,
        deleteTimetablePeriod,
        addHoliday,
        removeHoliday,
        addExtraClass,
        removeExtraClass,
        updateSettings,
        loadDemoData,
        applyExtractedTimetable,
        resetAllData,
        fireConfetti,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
