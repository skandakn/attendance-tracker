import { describe, it, expect } from 'vitest';
import {
  calculatePercentage,
  calculateCanMissClasses,
  calculateClassesNeeded,
  calculateProjections,
  calculateSubjectStats,
  calculateOverallStats,
  isAcademicPeriod,
  isPeriodForBatch,
  isHoliday,
} from './attendanceCalculations';
import { AttendanceRecord, Holiday, Period, Subject, UserSettings } from '@/types';

describe('Attendance Calculation Engine', () => {
  // Test 1: 0/0 edge case
  it('handles 0/0 edge case correctly (100% or 0 conducted, 0 can miss, 0 needed)', () => {
    expect(calculatePercentage(0, 0)).toBe(100);
    expect(calculateCanMissClasses(0, 0, 75)).toBe(0);
    expect(calculateClassesNeeded(0, 0, 75)).toBe(0);
  });

  // Test 2: 0/10 edge case
  it('handles 0/10 attendance correctly (0%, 0 can miss, 30 needed to reach 75%)', () => {
    expect(calculatePercentage(0, 10)).toBe(0);
    expect(calculateCanMissClasses(0, 10, 75)).toBe(0);
    // (0 + N) / (10 + N) >= 0.75 => N >= (75*10 - 0)/25 = 750/25 = 30
    expect(calculateClassesNeeded(0, 10, 75)).toBe(30);
    // Check math: 30 / 40 = 0.75
    expect(calculatePercentage(30, 40)).toBe(75);
  });

  // Test 3: 10/10 edge case
  it('handles 10/10 attendance correctly (100%, 3 can miss, 0 needed)', () => {
    expect(calculatePercentage(10, 10)).toBe(100);
    // 10 / (10 + M) >= 0.75 => 10 + M <= 1000/75 = 13.333 => M = 3
    expect(calculateCanMissClasses(10, 10, 75)).toBe(3);
    expect(calculateClassesNeeded(10, 10, 75)).toBe(0);
    // If 3 missed: 10/13 = 76.92% (>= 75)
    expect(calculatePercentage(10, 13)).toBeGreaterThanOrEqual(75);
    // If 4 missed: 10/14 = 71.4% (< 75)
    expect(calculatePercentage(10, 14)).toBeLessThan(75);
  });

  // Test 4: 7/10 edge case
  it('handles 7/10 attendance correctly (70%, 0 can miss, 2 needed to reach 75%)', () => {
    expect(calculatePercentage(7, 10)).toBe(70);
    expect(calculateCanMissClasses(7, 10, 75)).toBe(0);
    // (7 + N) / (10 + N) >= 0.75 => 3(10) - 4(7) = 30 - 28 = 2
    expect(calculateClassesNeeded(7, 10, 75)).toBe(2);
    // If 2 attended: 9 / 12 = 75.0%
    expect(calculatePercentage(7 + 2, 10 + 2)).toBe(75);
  });

  // Test 5: Exactly 75% edge case
  it('handles exactly 75% correctly (e.g. 15/20 or 75/100, 0 can miss, 0 needed)', () => {
    expect(calculatePercentage(15, 20)).toBe(75);
    // If they miss 1 class, 15/21 = 71.4% (< 75), so can miss 0
    expect(calculateCanMissClasses(15, 20, 75)).toBe(0);
    expect(calculateClassesNeeded(15, 20, 75)).toBe(0);
  });

  // Test 6: Below 75% edge cases
  it('handles below 75% with different targets', () => {
    // 74/100 = 74%
    expect(calculatePercentage(74, 100)).toBe(74);
    expect(calculateCanMissClasses(74, 100, 75)).toBe(0);
    // 3(100) - 4(74) = 300 - 296 = 4 needed
    expect(calculateClassesNeeded(74, 100, 75)).toBe(4);
    expect(calculatePercentage(78, 104)).toBe(75);

    // Custom target 80%: 75/100 = 75% (below 80)
    // (75 + N)/(100 + N) >= 0.8 => N >= (8000 - 7500)/20 = 500/20 = 25
    expect(calculateClassesNeeded(75, 100, 80)).toBe(25);
    expect(calculatePercentage(100, 125)).toBe(80);
  });

  // Test 7 & 8: Classes needed to reach 75% and max can miss
  it('calculates projections and can-miss buffer accurately for high attendance', () => {
    // 45/50 = 90%
    expect(calculatePercentage(45, 50)).toBe(90);
    // 45 / (50 + M) >= 0.75 => 4500 / 75 = 60 => 60 - 50 = 10 classes can be missed
    expect(calculateCanMissClasses(45, 50, 75)).toBe(10);
    expect(calculatePercentage(45, 60)).toBe(75);
    expect(calculatePercentage(45, 61)).toBeLessThan(75);

    const projections = calculateProjections(45, 50);
    expect(projections.projectedNextAttended).toBe(calculatePercentage(46, 51));
    expect(projections.projectedNextMissed).toBe(calculatePercentage(45, 51));
    expect(projections.projected5Attended).toBe(calculatePercentage(50, 55));
    expect(projections.projected10Attended).toBe(calculatePercentage(55, 60));
  });

  // Test 9: Cancelled classes do not count as conducted
  it('does NOT count cancelled classes in conducted count', () => {
    const dummySubject: Subject = {
      id: 'sub1',
      name: 'Computer Networks',
      code: 'CS401',
      color: '#3B82F6',
      targetPercentage: 75,
    };

    const records: AttendanceRecord[] = [
      { id: '1', date: '2026-09-01', periodId: 'p1', subjectId: 'sub1', status: 'present' },
      { id: '2', date: '2026-09-02', periodId: 'p1', subjectId: 'sub1', status: 'present' },
      { id: '3', date: '2026-09-03', periodId: 'p1', subjectId: 'sub1', status: 'absent' },
      { id: '4', date: '2026-09-04', periodId: 'p1', subjectId: 'sub1', status: 'cancelled' },
      { id: '5', date: '2026-09-05', periodId: 'p1', subjectId: 'sub1', status: 'cancelled' },
    ];

    const stats = calculateSubjectStats(dummySubject, records, 75);
    expect(stats.attended).toBe(2);
    expect(stats.conducted).toBe(3); // 2 present + 1 absent = 3 conducted. Cancelled excluded!
    expect(stats.cancelled).toBe(2);
    expect(stats.percentage).toBe(66.7); // 2/3 = 66.7%
  });

  // Test 10: Holidays checking
  it('correctly identifies holidays to prevent counting', () => {
    const holidays: Holiday[] = [
      { id: 'h1', date: '2026-10-02', name: 'Gandhi Jayanti' },
      { id: 'h2', date: '2026-12-25', name: 'Christmas' },
    ];

    expect(isHoliday('2026-10-02', holidays)?.name).toBe('Gandhi Jayanti');
    expect(isHoliday('2026-10-03', holidays)).toBeUndefined();
  });

  // Test 11: Multiple subjects - Overall attendance is (sum attended)/(sum conducted), NOT average of percentages!
  it('calculates overall attendance strictly as totalAttended / totalConducted, NEVER average of percentages', () => {
    const subA: Subject = { id: 'a', name: 'Sub A', code: 'A', color: '#10B981', targetPercentage: 75 };
    const subB: Subject = { id: 'b', name: 'Sub B', code: 'B', color: '#6366F1', targetPercentage: 75 };

    // Sub A: 1/1 = 100%
    // Sub B: 20/40 = 50%
    // Average of percentages would be: (100 + 50) / 2 = 75.0%
    // Real overall attendance: (1 + 20) / (1 + 40) = 21 / 41 = 51.2%
    const records: AttendanceRecord[] = [
      { id: '1', date: '2026-09-01', periodId: 'p1', subjectId: 'a', status: 'present' },
    ];

    for (let i = 0; i < 20; i++) {
      records.push({ id: `b_p_${i}`, date: '2026-09-02', periodId: 'p2', subjectId: 'b', status: 'present' });
    }
    for (let i = 0; i < 20; i++) {
      records.push({ id: `b_a_${i}`, date: '2026-09-03', periodId: 'p2', subjectId: 'b', status: 'absent' });
    }

    const settings: UserSettings = {
      targetPercentage: 75,
      semesterStartDate: '2026-08-01',
      trackingMode: 'from_start',
      theme: 'dark',
    };

    const overall = calculateOverallStats([subA, subB], records, settings);
    expect(overall.totalAttended).toBe(21);
    expect(overall.totalConducted).toBe(41);
    expect(overall.percentage).toBe(51.2);
    // Verify it is NOT 75.0
    expect(overall.percentage).not.toBe(75.0);
  });

  // Test batch filtering
  it('correctly filters periods by batch', () => {
    expect(isPeriodForBatch(null, 'D1')).toBe(true);
    expect(isPeriodForBatch('', 'D1')).toBe(true);
    expect(isPeriodForBatch('All', 'D1')).toBe(true);
    expect(isPeriodForBatch('D1', 'D1')).toBe(true);
    expect(isPeriodForBatch('D2', 'D1')).toBe(false);
    expect(isPeriodForBatch('D1+D2', 'D1')).toBe(true);
    expect(isPeriodForBatch('D1+D2', 'D2')).toBe(true);
    expect(isPeriodForBatch('D1+D2', 'D3')).toBe(false);
    expect(isPeriodForBatch('D3, D4', 'D4')).toBe(true);
  });

  // Test academic vs non-academic periods
  it('identifies breaks, lunch, and free periods correctly', () => {
    const periodBreak: Period = { id: 'p1', start: '10:00', end: '10:15', subject: 'Tea Break', type: 'break' };
    const periodLunch: Period = { id: 'p2', start: '12:30', end: '13:15', subject: 'Lunch', type: 'lunch' };
    const periodLecture: Period = { id: 'p3', start: '09:00', end: '10:00', subject: 'Algorithms', type: 'lecture' };
    const periodLab: Period = { id: 'p4', start: '14:00', end: '16:00', subject: 'DBMS Lab', type: 'lab', batch: 'D1' };

    expect(isAcademicPeriod(periodBreak)).toBe(false);
    expect(isAcademicPeriod(periodLunch)).toBe(false);
    expect(isAcademicPeriod(periodLecture)).toBe(true);
    expect(isAcademicPeriod(periodLab)).toBe(true);
  });
});
