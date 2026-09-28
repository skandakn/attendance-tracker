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
  updateTimetablePeriod: (
    dayName: string,
    periodId: string,
    updated: Partial<Period>,
    applyToAllDays?: boolean
  ) => void;
  addTimetablePeriod: (
    dayName: string,
    period: Period,
    applyToAllDays?: boolean
  ) => void;
  deleteTimetablePeriod: (
    dayName: string,
    periodId: string,
    applyToAllDays?: boolean
  ) => void;

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

  // Timetable Period actions (Master Timetable)
  const updateTimetablePeriod = (
    dayName: string,
    periodId: string,
    updated: Partial<Period>,
    applyToAllDays: boolean = false
  ) => {
    setStore((prev) => {
      // Find previous period to detect if subject name or details changed
      let oldPeriod: Period | undefined;
      for (const d of prev.timetable.days) {
        const found = d.periods.find((p) => p.id === periodId);
        if (found) {
          oldPeriod = found;
          break;
        }
      }

      const oldSubjectName = (oldPeriod?.subject || '').trim().toLowerCase();
      const newSubjectName = (updated.subject !== undefined ? updated.subject : oldPeriod?.subject || '').trim();

      const days = prev.timetable.days.map((d) => {
        const isTargetDay = d.day.toLowerCase() === dayName.toLowerCase();
        if (!isTargetDay && !applyToAllDays) return d;

        const updatedPeriods = d.periods.map((p) => {
          const isMatchingPeriod =
            p.id === periodId ||
            (applyToAllDays && oldSubjectName && p.subject.toLowerCase() === oldSubjectName);

          if (isMatchingPeriod) {
            return { ...p, ...updated };
          }
          return p;
        });

        // If applyToAllDays and this day doesn't already have this period/subject, replicate it
        if (
          applyToAllDays &&
          !updatedPeriods.some(
            (p) =>
              p.id === periodId ||
              (newSubjectName && p.subject.toLowerCase() === newSubjectName.toLowerCase())
          )
        ) {
          updatedPeriods.push({
            id: `p_${d.day.toLowerCase()}_${Date.now().toString(36)}_${Math.random()
              .toString(36)
              .substring(2, 5)}`,
            start: updated.start || oldPeriod?.start || '09:00',
            end: updated.end || oldPeriod?.end || '10:00',
            subject: newSubjectName,
            subject_code: updated.subject_code ?? oldPeriod?.subject_code,
            faculty: updated.faculty ?? oldPeriod?.faculty,
            room: updated.room ?? oldPeriod?.room,
            type: updated.type || oldPeriod?.type || 'lecture',
            batch: updated.batch !== undefined ? updated.batch : oldPeriod?.batch,
          });
        }

        return {
          ...d,
          periods: updatedPeriods,
        };
      });

      // Synchronize subjects in store.subjects so 75% analytics & tracker stay accurate
      let updatedSubjects = [...prev.subjects];
      if (newSubjectName) {
        const existingSubjectIdx = updatedSubjects.findIndex(
          (s) =>
            (oldSubjectName && s.name.toLowerCase() === oldSubjectName) ||
            s.name.toLowerCase() === newSubjectName.toLowerCase()
        );

        if (existingSubjectIdx >= 0) {
          updatedSubjects[existingSubjectIdx] = {
            ...updatedSubjects[existingSubjectIdx],
            name: newSubjectName,
            code: updated.subject_code ?? updatedSubjects[existingSubjectIdx].code,
            faculty: updated.faculty ?? updatedSubjects[existingSubjectIdx].faculty,
            room: updated.room ?? updatedSubjects[existingSubjectIdx].room,
          };
        } else {
          // Register new subject in subjects list
          const colorPalette = [
            '#4F46E5', '#059669', '#2563EB', '#D97706',
            '#7C3AED', '#DB2777', '#0891B2', '#EA580C',
          ];
          updatedSubjects.push({
            id: `subj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
            name: newSubjectName,
            code: updated.subject_code || '',
            faculty: updated.faculty || '',
            room: updated.room || '',
            color: colorPalette[updatedSubjects.length % colorPalette.length],
            targetPercentage: prev.settings.targetPercentage || 75,
          });
        }
      }

      // Synchronize existing attendanceRecords timeslot and batch if changed
      const updatedAttendanceRecords = prev.attendanceRecords.map((r) => {
        if (r.periodId === periodId) {
          const newTimeSlot =
            updated.start && updated.end ? `${updated.start} - ${updated.end}` : r.timeSlot;
          return {
            ...r,
            timeSlot: newTimeSlot,
            batch: updated.batch !== undefined ? updated.batch : r.batch,
          };
        }
        return r;
      });

      return {
        ...prev,
        timetable: { ...prev.timetable, days },
        subjects: updatedSubjects,
        attendanceRecords: updatedAttendanceRecords,
      };
    });

    const msg = applyToAllDays
      ? `Updated "${updated.subject || 'class'}" across all days in timetable`
      : `Updated "${updated.subject || 'class'}" for all ${dayName}s in master timetable`;
    showToast(msg, 'success');
  };

  const addTimetablePeriod = (
    dayName: string,
    period: Period,
    applyToAllDays: boolean = false
  ) => {
    setStore((prev) => {
      const days = prev.timetable.days.map((d) => {
        const isTarget = d.day.toLowerCase() === dayName.toLowerCase();
        if (!isTarget && !applyToAllDays) return d;

        const newP: Period = {
          ...period,
          id: isTarget
            ? period.id
            : `p_${d.day.toLowerCase()}_${Date.now().toString(36)}_${Math.random()
                .toString(36)
                .substring(2, 5)}`,
        };

        return {
          ...d,
          periods: [...d.periods, newP],
        };
      });

      // Ensure subject is tracked in store.subjects
      let updatedSubjects = [...prev.subjects];
      const trimmedSub = (period.subject || '').trim();
      const isAcademic = !['break', 'lunch', 'free'].includes(period.type);

      if (trimmedSub && isAcademic) {
        const exists = updatedSubjects.some(
          (s) => s.name.toLowerCase() === trimmedSub.toLowerCase()
        );
        if (!exists) {
          const colorPalette = [
            '#4F46E5', '#059669', '#2563EB', '#D97706',
            '#7C3AED', '#DB2777', '#0891B2', '#EA580C',
          ];
          updatedSubjects.push({
            id: `subj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
            name: trimmedSub,
            code: period.subject_code || '',
            faculty: period.faculty || '',
            room: period.room || '',
            color: colorPalette[updatedSubjects.length % colorPalette.length],
            targetPercentage: prev.settings.targetPercentage || 75,
          });
        }
      }

      return {
        ...prev,
        timetable: { ...prev.timetable, days },
        subjects: updatedSubjects,
      };
    });

    const msg = applyToAllDays
      ? `Added "${period.subject}" to all days in timetable`
      : `Added "${period.subject}" for all ${dayName}s in master timetable`;
    showToast(msg, 'success');
  };

  const deleteTimetablePeriod = (
    dayName: string,
    periodId: string,
    applyToAllDays: boolean = false
  ) => {
    setStore((prev) => {
      let targetSubject = '';
      for (const d of prev.timetable.days) {
        const p = d.periods.find((item) => item.id === periodId);
        if (p) {
          targetSubject = p.subject.toLowerCase();
          break;
        }
      }

      const days = prev.timetable.days.map((d) => {
        const isTarget = d.day.toLowerCase() === dayName.toLowerCase();
        if (!isTarget && !applyToAllDays) return d;

        return {
          ...d,
          periods: d.periods.filter((p) => {
            if (applyToAllDays && targetSubject) {
              return p.id !== periodId && p.subject.toLowerCase() !== targetSubject;
            }
            return p.id !== periodId;
          }),
        };
      });

      return {
        ...prev,
        timetable: { ...prev.timetable, days },
      };
    });

    const msg = applyToAllDays
      ? 'Removed class slot from all days in timetable'
      : `Removed class slot for all ${dayName}s in master timetable`;
    showToast(msg, 'info');
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
