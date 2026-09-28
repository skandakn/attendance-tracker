import { AppDataStore, ExtractedTimetable, Subject, UserSettings } from '@/types';

export const DEMO_SUBJECTS: Subject[] = [
  {
    id: 'sub_os',
    name: 'Operating Systems',
    code: 'BCS501',
    faculty: 'Prof. A. Sharma',
    room: 'Room 301',
    color: '#4F46E5', // Indigo
    targetPercentage: 75,
  },
  {
    id: 'sub_cn',
    name: 'Computer Networks',
    code: 'BCS502',
    faculty: 'Dr. Priya Nair',
    room: 'Room 302',
    color: '#D97706', // Amber (Alert!)
    targetPercentage: 75,
  },
  {
    id: 'sub_dbms',
    name: 'Database Management Systems',
    code: 'BCS503',
    faculty: 'Prof. Rajesh Verma',
    room: 'Room 304',
    color: '#059669', // Emerald (High attendance)
    targetPercentage: 75,
  },
  {
    id: 'sub_toc',
    name: 'Theory of Computation',
    code: 'BCS504',
    faculty: 'Dr. K. Patel',
    room: 'Room 302',
    color: '#7C3AED', // Violet (Borderline)
    targetPercentage: 75,
  },
  {
    id: 'sub_web',
    name: 'Web Technologies Lab',
    code: 'BCS505',
    faculty: 'Prof. Mehra',
    room: 'CS Lab 2',
    color: '#DB2777', // Pink
    targetPercentage: 75,
  },
  {
    id: 'sub_ethics',
    name: 'Professional Ethics',
    code: 'BCS506',
    faculty: 'Dr. Sunita Rao',
    room: 'Room 305',
    color: '#0891B2', // Cyan
    targetPercentage: 75,
  },
];

export const DEMO_TIMETABLE: ExtractedTimetable = {
  college: 'St. Xavier Institute of Technology',
  department: 'Computer Science & Engineering',
  semester: '5th Semester',
  section: 'Section B',
  academic_year: '2026-2027',
  detectedBatches: ['D1', 'D2', 'D3', 'D4', 'D1+D2', 'D3+D4'],
  notes: [
    'Labs operate in 2-hour slots for designated batches.',
    'Attendance below 75% results in detention per university regulation.',
  ],
  days: [
    {
      day: 'Monday',
      periods: [
        {
          id: 'mon_1',
          start: '09:00',
          end: '10:00',
          subject: 'Operating Systems',
          subject_code: 'BCS501',
          faculty: 'Prof. A. Sharma',
          room: 'Room 301',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'mon_2',
          start: '10:00',
          end: '11:00',
          subject: 'Computer Networks',
          subject_code: 'BCS502',
          faculty: 'Dr. Priya Nair',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'mon_brk',
          start: '11:00',
          end: '11:15',
          subject: 'Tea Break',
          type: 'break',
        },
        {
          id: 'mon_3',
          start: '11:15',
          end: '12:15',
          subject: 'Database Management Systems',
          subject_code: 'BCS503',
          faculty: 'Prof. Rajesh Verma',
          room: 'Room 304',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'mon_lnch',
          start: '12:15',
          end: '13:00',
          subject: 'Lunch Break',
          type: 'lunch',
        },
        {
          id: 'mon_lab_d1',
          start: '13:00',
          end: '15:00',
          subject: 'Web Technologies Lab',
          subject_code: 'BCS505',
          faculty: 'Prof. Mehra',
          room: 'CS Lab 2',
          type: 'lab',
          batch: 'D1+D2',
        },
        {
          id: 'mon_lab_d3',
          start: '13:00',
          end: '15:00',
          subject: 'Database Management Systems',
          subject_code: 'BCS503',
          faculty: 'Prof. Rajesh Verma',
          room: 'DBMS Lab',
          type: 'lab',
          batch: 'D3+D4',
        },
      ],
    },
    {
      day: 'Tuesday',
      periods: [
        {
          id: 'tue_1',
          start: '09:00',
          end: '10:00',
          subject: 'Theory of Computation',
          subject_code: 'BCS504',
          faculty: 'Dr. K. Patel',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'tue_2',
          start: '10:00',
          end: '11:00',
          subject: 'Operating Systems',
          subject_code: 'BCS501',
          faculty: 'Prof. A. Sharma',
          room: 'Room 301',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'tue_brk',
          start: '11:00',
          end: '11:15',
          subject: 'Tea Break',
          type: 'break',
        },
        {
          id: 'tue_3',
          start: '11:15',
          end: '12:15',
          subject: 'Professional Ethics',
          subject_code: 'BCS506',
          faculty: 'Dr. Sunita Rao',
          room: 'Room 305',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'tue_lnch',
          start: '12:15',
          end: '13:00',
          subject: 'Lunch Break',
          type: 'lunch',
        },
        {
          id: 'tue_lab_d1',
          start: '13:00',
          end: '15:00',
          subject: 'Database Management Systems',
          subject_code: 'BCS503',
          faculty: 'Prof. Rajesh Verma',
          room: 'DBMS Lab',
          type: 'lab',
          batch: 'D1+D2',
        },
        {
          id: 'tue_lab_d3',
          start: '13:00',
          end: '15:00',
          subject: 'Web Technologies Lab',
          subject_code: 'BCS505',
          faculty: 'Prof. Mehra',
          room: 'CS Lab 2',
          type: 'lab',
          batch: 'D3+D4',
        },
      ],
    },
    {
      day: 'Wednesday',
      periods: [
        {
          id: 'wed_1',
          start: '09:00',
          end: '10:00',
          subject: 'Computer Networks',
          subject_code: 'BCS502',
          faculty: 'Dr. Priya Nair',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'wed_2',
          start: '10:00',
          end: '11:00',
          subject: 'Database Management Systems',
          subject_code: 'BCS503',
          faculty: 'Prof. Rajesh Verma',
          room: 'Room 304',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'wed_brk',
          start: '11:00',
          end: '11:15',
          subject: 'Tea Break',
          type: 'break',
        },
        {
          id: 'wed_3',
          start: '11:15',
          end: '12:15',
          subject: 'Theory of Computation',
          subject_code: 'BCS504',
          faculty: 'Dr. K. Patel',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'wed_lnch',
          start: '12:15',
          end: '13:00',
          subject: 'Lunch Break',
          type: 'lunch',
        },
        {
          id: 'wed_4',
          start: '13:00',
          end: '14:00',
          subject: 'Operating Systems',
          subject_code: 'BCS501',
          faculty: 'Prof. A. Sharma',
          room: 'Room 301',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'wed_5',
          start: '14:00',
          end: '15:00',
          subject: 'Professional Ethics',
          subject_code: 'BCS506',
          faculty: 'Dr. Sunita Rao',
          room: 'Room 305',
          type: 'lecture',
          batch: null,
        },
      ],
    },
    {
      day: 'Thursday',
      periods: [
        {
          id: 'thu_1',
          start: '09:00',
          end: '10:00',
          subject: 'Operating Systems',
          subject_code: 'BCS501',
          faculty: 'Prof. A. Sharma',
          room: 'Room 301',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'thu_2',
          start: '10:00',
          end: '11:00',
          subject: 'Theory of Computation',
          subject_code: 'BCS504',
          faculty: 'Dr. K. Patel',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'thu_brk',
          start: '11:00',
          end: '11:15',
          subject: 'Tea Break',
          type: 'break',
        },
        {
          id: 'thu_3',
          start: '11:15',
          end: '12:15',
          subject: 'Computer Networks',
          subject_code: 'BCS502',
          faculty: 'Dr. Priya Nair',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'thu_lnch',
          start: '12:15',
          end: '13:00',
          subject: 'Lunch Break',
          type: 'lunch',
        },
        {
          id: 'thu_lab_d1',
          start: '13:00',
          end: '15:00',
          subject: 'Web Technologies Lab',
          subject_code: 'BCS505',
          faculty: 'Prof. Mehra',
          room: 'CS Lab 2',
          type: 'lab',
          batch: 'D1',
        },
      ],
    },
    {
      day: 'Friday',
      periods: [
        {
          id: 'fri_1',
          start: '09:00',
          end: '10:00',
          subject: 'Database Management Systems',
          subject_code: 'BCS503',
          faculty: 'Prof. Rajesh Verma',
          room: 'Room 304',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'fri_2',
          start: '10:00',
          end: '11:00',
          subject: 'Computer Networks',
          subject_code: 'BCS502',
          faculty: 'Dr. Priya Nair',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'fri_brk',
          start: '11:00',
          end: '11:15',
          subject: 'Tea Break',
          type: 'break',
        },
        {
          id: 'fri_3',
          start: '11:15',
          end: '12:15',
          subject: 'Theory of Computation',
          subject_code: 'BCS504',
          faculty: 'Dr. K. Patel',
          room: 'Room 302',
          type: 'lecture',
          batch: null,
        },
        {
          id: 'fri_lnch',
          start: '12:15',
          end: '13:00',
          subject: 'Lunch Break',
          type: 'lunch',
        },
        {
          id: 'fri_4',
          start: '13:00',
          end: '14:00',
          subject: 'Professional Ethics',
          subject_code: 'BCS506',
          faculty: 'Dr. Sunita Rao',
          room: 'Room 305',
          type: 'lecture',
          batch: null,
        },
      ],
    },
  ],
};

export const DEMO_SETTINGS: UserSettings = {
  studentName: 'Alex Rivera',
  collegeName: 'St. Xavier Institute of Technology',
  department: 'Computer Science & Engineering',
  semester: '5th Semester',
  section: 'Section B',
  selectedBatch: 'D1',
  targetPercentage: 75,
  semesterStartDate: '2026-09-01',
  semesterEndDate: '2026-12-20',
  trackingMode: 'from_start',
  theme: 'dark',
};

/**
 * Generate 4 weeks of realistic attendance records for the demo.
 * Demonstrates:
 * - OS: 18 / 22 (81.8% - safe)
 * - Computer Networks: 14 / 20 (70.0% - ALERT below 75%, 2 classes needed!)
 * - DBMS: 17 / 18 (94.4% - high buffer, 4 classes can be missed)
 * - Theory of Computation: 15 / 20 (75.0% - exactly on threshold!)
 * - Web Tech Lab: 6 / 6 (100%)
 * - Professional Ethics: 8 / 9 (88.9%)
 * Total: 78 / 95 = 82.1% (Above 75% target)
 */
export function generateDemoStore(): AppDataStore {
  const records = [
    // OS records (18 present, 4 absent, 1 cancelled)
    ...generateSubjectRecords('sub_os', 18, 4, 1, '2026-09-01'),
    // Computer Networks (14 present, 6 absent, 2 cancelled) -> 14/20 = 70.0% (Under 75%!)
    ...generateSubjectRecords('sub_cn', 14, 6, 2, '2026-09-01'),
    // DBMS (17 present, 1 absent, 1 cancelled) -> 17/18 = 94.4%
    ...generateSubjectRecords('sub_dbms', 17, 1, 1, '2026-09-02'),
    // TOC (15 present, 5 absent) -> 15/20 = 75.0% (Exact threshold!)
    ...generateSubjectRecords('sub_toc', 15, 5, 0, '2026-09-02'),
    // Web Lab (6 present, 0 absent) -> 6/6 = 100%
    ...generateSubjectRecords('sub_web', 6, 0, 1, '2026-09-07'),
    // Ethics (8 present, 1 absent) -> 8/9 = 88.9%
    ...generateSubjectRecords('sub_ethics', 8, 1, 0, '2026-09-03'),
  ];

  return {
    version: 1,
    settings: DEMO_SETTINGS,
    timetable: DEMO_TIMETABLE,
    subjects: DEMO_SUBJECTS,
    attendanceRecords: records,
    holidays: [
      { id: 'h_1', date: '2026-09-15', name: 'Engineers Day' },
      { id: 'h_2', date: '2026-10-02', name: 'Gandhi Jayanti' },
    ],
    extraClasses: [
      {
        id: 'ec_1',
        date: '2026-09-19',
        startTime: '10:00',
        endTime: '12:00',
        subjectId: 'sub_cn',
        room: 'Seminar Hall 1',
        topic: 'Routing Protocols & BGP Deep Dive',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function generateSubjectRecords(
  subjectId: string,
  presentCount: number,
  absentCount: number,
  cancelledCount: number,
  startDateStr: string
) {
  const result: any[] = [];
  const baseDate = new Date(startDateStr);
  let idCounter = 1;

  for (let i = 0; i < presentCount; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + (i * 2) % 25);
    result.push({
      id: `rec_${subjectId}_p_${idCounter++}`,
      date: d.toISOString().split('T')[0],
      periodId: `p_${subjectId}`,
      subjectId,
      status: 'present',
    });
  }

  for (let i = 0; i < absentCount; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + ((i * 3 + 1) % 25));
    result.push({
      id: `rec_${subjectId}_a_${idCounter++}`,
      date: d.toISOString().split('T')[0],
      periodId: `p_${subjectId}`,
      subjectId,
      status: 'absent',
    });
  }

  for (let i = 0; i < cancelledCount; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + ((i * 4 + 2) % 25));
    result.push({
      id: `rec_${subjectId}_c_${idCounter++}`,
      date: d.toISOString().split('T')[0],
      periodId: `p_${subjectId}`,
      subjectId,
      status: 'cancelled',
      note: 'Faculty on university duty',
    });
  }

  return result;
}
