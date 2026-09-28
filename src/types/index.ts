export type PeriodType = 'lecture' | 'lab' | 'tutorial' | 'break' | 'lunch' | 'free' | 'other';

export interface Period {
  id: string;
  start: string;
  end: string;
  subject: string;
  subject_code?: string;
  faculty?: string;
  room?: string;
  type: PeriodType;
  batch?: string | null; // e.g., 'D1', 'D2', 'D1+D2', null for all batches
  isUncertain?: boolean;
  uncertaintyReason?: string;
}

export interface DaySchedule {
  day: string; // e.g. 'Monday', 'Tuesday'
  periods: Period[];
}

export interface ExtractedTimetable {
  college?: string;
  department?: string;
  semester?: string;
  section?: string;
  academic_year?: string;
  days: DaySchedule[];
  detectedBatches?: string[];
  notes?: string[];
  uncertaintyNotes?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  faculty?: string;
  room?: string;
  color: string;
  targetPercentage: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'unmarked';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  periodId: string;
  subjectId: string;
  status: AttendanceStatus;
  note?: string;
  isExtraClass?: boolean;
  timeSlot?: string;
  batch?: string | null;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  isRecurring?: boolean;
}

export interface ExtraClass {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  subjectId: string;
  faculty?: string;
  room?: string;
  topic?: string;
}

export interface UserSettings {
  studentName?: string;
  collegeName?: string;
  department?: string;
  semester?: string;
  section?: string;
  selectedBatch?: string; // e.g., 'All', 'D1', 'D2', 'D3', 'D4'
  targetPercentage: number; // default: 75
  semesterStartDate: string; // YYYY-MM-DD
  semesterEndDate?: string;
  trackingMode: 'from_today' | 'from_start';
  theme: 'light' | 'dark' | 'system';
  initialAttendance?: Record<string, { attended: number; conducted: number }>;
}

export interface SubjectAttendanceStats {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  faculty?: string;
  room?: string;
  color: string;
  targetPercentage: number;
  attended: number;
  conducted: number;
  cancelled: number;
  unmarked: number;
  percentage: number; // 0 to 100
  canMiss: number; // Max additional classes that can be missed while remaining >= target%
  needed: number; // Min consecutive classes to attend to reach target%
  projectedNextAttended: number; // % if next conducted class is attended
  projectedNextMissed: number; // % if next conducted class is missed
  projected5Attended: number; // % if next 5 classes are attended
  projected10Attended: number; // % if next 10 classes are attended
  status: 'above' | 'warning' | 'critical';
}

export interface OverallAttendanceStats {
  totalAttended: number;
  totalConducted: number;
  totalCancelled: number;
  totalUnmarked: number;
  percentage: number;
  targetPercentage: number;
  classesRemainingToday: number;
  subjectsBelowTarget: number;
  currentStreak: number;
  status: 'above' | 'warning' | 'critical';
  smartInsights: string[];
}

export interface AppDataStore {
  version: number;
  settings: UserSettings;
  timetable: ExtractedTimetable;
  subjects: Subject[];
  attendanceRecords: AttendanceRecord[];
  holidays: Holiday[];
  extraClasses: ExtraClass[];
  lastUpdated: string;
}
