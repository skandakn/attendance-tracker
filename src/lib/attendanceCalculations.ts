import {
  AttendanceRecord,
  ExtraClass,
  Holiday,
  OverallAttendanceStats,
  Period,
  Subject,
  SubjectAttendanceStats,
  UserSettings,
} from '@/types';

/**
 * Calculates current attendance percentage.
 * Returns 100 if no classes have been conducted yet.
 */
export function calculatePercentage(attended: number, conducted: number): number {
  if (conducted <= 0) return 100;
  if (attended <= 0) return 0;
  return Math.round((attended / conducted) * 1000) / 10;
}

/**
 * Calculates the maximum additional classes that can be missed
 * while maintaining attendance >= targetPercentage.
 *
 * Formula:
 * A / (C + M) >= target / 100
 * => C + M <= (A * 100) / target
 * => M <= floor((A * 100) / target) - C
 *
 * Returns 0 if already below target or if conducted is 0.
 */
export function calculateCanMissClasses(
  attended: number,
  conducted: number,
  targetPercentage: number = 75
): number {
  if (conducted <= 0 || attended <= 0) return 0;
  if (targetPercentage <= 0) return 999;
  const currentPct = (attended / conducted) * 100;
  if (currentPct < targetPercentage) return 0;

  const maxTotalConduct = Math.floor((attended * 100) / targetPercentage);
  const canMiss = maxTotalConduct - conducted;
  return Math.max(0, canMiss);
}

/**
 * Calculates the minimum consecutive classes that must be attended
 * to reach targetPercentage from a deficit.
 *
 * Formula:
 * (A + N) / (C + N) >= target / 100
 * => 100(A + N) >= target(C + N)
 * => (100 - target)N >= target*C - 100*A
 * => N >= ceil((target*C - 100*A) / (100 - target))
 *
 * For target = 75: N >= ceil((75C - 100A) / 25) = 3C - 4A
 *
 * Returns 0 if already >= target or if conducted is 0.
 */
export function calculateClassesNeeded(
  attended: number,
  conducted: number,
  targetPercentage: number = 75
): number {
  if (conducted <= 0) return 0;
  if (targetPercentage <= 0) return 0;
  const currentPct = (attended / conducted) * 100;
  if (currentPct >= targetPercentage) return 0;

  const denominator = 100 - targetPercentage;
  if (denominator <= 0) {
    return conducted > attended ? 999 : 0;
  }

  const numerator = targetPercentage * conducted - 100 * attended;
  const needed = Math.ceil(numerator / denominator);
  return Math.max(0, needed);
}

/**
 * Calculate future projected percentages
 */
export function calculateProjections(
  attended: number,
  conducted: number
): {
  projectedNextAttended: number;
  projectedNextMissed: number;
  projected5Attended: number;
  projected10Attended: number;
} {
  return {
    projectedNextAttended: calculatePercentage(attended + 1, conducted + 1),
    projectedNextMissed: calculatePercentage(attended, conducted + 1),
    projected5Attended: calculatePercentage(attended + 5, conducted + 5),
    projected10Attended: calculatePercentage(attended + 10, conducted + 10),
  };
}

/**
 * Helper to determine if a period is an academic class (not break/lunch/free)
 */
export function isAcademicPeriod(period: Period): boolean {
  if (!period) return false;
  const type = (period.type || '').toLowerCase();
  const subject = (period.subject || '').toLowerCase();
  const nonAcademicTypes = ['break', 'lunch', 'free', 'recess', 'empty', 'interval'];
  if (nonAcademicTypes.includes(type)) return false;
  if (nonAcademicTypes.some((t) => subject.includes(t))) return false;
  if (!subject.trim()) return false;
  return true;
}

/**
 * Determines if a class period applies to a user's selected batch.
 * Example batch values: 'D1', 'D2', 'D1+D2', 'B1', 'All', null
 */
export function isPeriodForBatch(
  periodBatch: string | null | undefined,
  userBatch?: string | null
): boolean {
  if (!userBatch || userBatch === 'All' || userBatch.trim() === '') return true;
  if (!periodBatch || periodBatch.trim() === '' || periodBatch.toLowerCase() === 'all') return true;

  const cleanUser = userBatch.trim().toUpperCase();
  const cleanPeriod = periodBatch.trim().toUpperCase();

  if (cleanPeriod === cleanUser) return true;

  // Handles 'D1+D2', 'D1, D2', 'D1/D2', 'D1 & D2'
  const subBatches = cleanPeriod
    .split(/[\+,\/&]/)
    .map((b) => b.trim().toUpperCase())
    .filter(Boolean);

  return subBatches.includes(cleanUser);
}

/**
 * Computes individual subject statistics based on attendance records and extra classes.
 */
export function calculateSubjectStats(
  subject: Subject,
  records: AttendanceRecord[],
  targetPercentage: number = 75,
  initialAttendance?: { attended: number; conducted: number }
): SubjectAttendanceStats {
  const subjectRecords = records.filter((r) => r.subjectId === subject.id);

  let attended = initialAttendance?.attended || 0;
  let conducted = initialAttendance?.conducted || 0;
  let cancelled = 0;
  let unmarked = 0;

  for (const record of subjectRecords) {
    if (record.status === 'present') {
      attended += 1;
      conducted += 1;
    } else if (record.status === 'absent') {
      conducted += 1;
    } else if (record.status === 'cancelled') {
      cancelled += 1;
    } else if (record.status === 'unmarked') {
      unmarked += 1;
    }
  }

  const percentage = calculatePercentage(attended, conducted);
  const canMiss = calculateCanMissClasses(attended, conducted, targetPercentage);
  const needed = calculateClassesNeeded(attended, conducted, targetPercentage);
  const projections = calculateProjections(attended, conducted);

  let status: 'above' | 'warning' | 'critical' = 'above';
  if (conducted > 0) {
    if (percentage < targetPercentage) {
      status = 'critical';
    } else if (percentage < targetPercentage + 5 || canMiss <= 1) {
      status = 'warning';
    }
  }

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    subjectCode: subject.code,
    faculty: subject.faculty,
    room: subject.room,
    color: subject.color,
    targetPercentage,
    attended,
    conducted,
    cancelled,
    unmarked,
    percentage,
    canMiss,
    needed,
    ...projections,
    status,
  };
}

/**
 * Calculates overall attendance stats across ALL subjects.
 * IMPORTANT: Overall attendance is calculated by:
 *   (total attended across all subjects) / (total conducted across all subjects) * 100
 * NEVER by averaging subject percentages!
 */
export function calculateOverallStats(
  subjects: Subject[],
  records: AttendanceRecord[],
  settings: UserSettings,
  todayRemainingClassesCount: number = 0
): OverallAttendanceStats {
  let totalAttended = 0;
  let totalConducted = 0;
  let totalCancelled = 0;
  let totalUnmarked = 0;
  let subjectsBelowTarget = 0;

  const subjectStatsList: SubjectAttendanceStats[] = [];

  const target = settings.targetPercentage ?? 75;

  for (const subject of subjects) {
    const init = settings.initialAttendance?.[subject.id];
    const sStats = calculateSubjectStats(subject, records, target, init);
    subjectStatsList.push(sStats);

    totalAttended += sStats.attended;
    totalConducted += sStats.conducted;
    totalCancelled += sStats.cancelled;
    totalUnmarked += sStats.unmarked;

    if (sStats.conducted > 0 && sStats.percentage < target) {
      subjectsBelowTarget += 1;
    }
  }

  const overallPercentage = calculatePercentage(totalAttended, totalConducted);

  let status: 'above' | 'warning' | 'critical' = 'above';
  if (totalConducted > 0) {
    if (overallPercentage < target) {
      status = 'critical';
    } else if (overallPercentage < target + 5) {
      status = 'warning';
    }
  }

  // Calculate streak: consecutive conducted classes marked 'present' leading up to latest
  const sortedRecords = [...records]
    .filter((r) => r.status === 'present' || r.status === 'absent')
    .sort((a, b) => b.date.localeCompare(a.date));

  let currentStreak = 0;
  for (const rec of sortedRecords) {
    if (rec.status === 'present') {
      currentStreak++;
    } else {
      break;
    }
  }

  // Generate Smart Rule-Based Insights
  const smartInsights: string[] = [];

  if (totalConducted === 0) {
    smartInsights.push('No classes conducted yet. You have a fresh slate for this semester!');
  } else {
    smartInsights.push(`Your overall attendance is ${overallPercentage}% (${totalAttended}/${totalConducted} classes attended).`);

    if (overallPercentage >= target) {
      const overallCanMiss = calculateCanMissClasses(totalAttended, totalConducted, target);
      if (overallCanMiss > 0) {
        smartInsights.push(`You can miss up to ${overallCanMiss} total class${overallCanMiss > 1 ? 'es' : ''} across your schedule while staying above ${target}%.`);
      } else {
        smartInsights.push(`You are right at your ${target}% threshold. Missing the next class will put you below target.`);
      }
    } else {
      const overallNeeded = calculateClassesNeeded(totalAttended, totalConducted, target);
      smartInsights.push(`You need to attend the next ${overallNeeded} consecutive class${overallNeeded > 1 ? 'es' : ''} to recover above ${target}%.`);
    }

    // Find subject with lowest attendance
    const conductedSubjects = subjectStatsList.filter((s) => s.conducted > 0);
    if (conductedSubjects.length > 0) {
      const lowest = [...conductedSubjects].sort((a, b) => a.percentage - b.percentage)[0];
      if (lowest.percentage < target) {
        smartInsights.push(
          `Priority Alert: ${lowest.subjectName} is at ${lowest.percentage}%. Attend the next ${lowest.needed} class${lowest.needed > 1 ? 'es' : ''} to reach ${target}%.`
        );
      }

      // Find subject with highest safety buffer
      const highestBuffer = [...conductedSubjects].sort((a, b) => b.canMiss - a.canMiss)[0];
      if (highestBuffer.canMiss > 0) {
        smartInsights.push(
          `Safe Buffer: You can miss ${highestBuffer.canMiss} more ${highestBuffer.subjectName} class${highestBuffer.canMiss > 1 ? 'es' : ''} before falling below ${target}%.`
        );
      }
    }
  }

  return {
    totalAttended,
    totalConducted,
    totalCancelled,
    totalUnmarked,
    percentage: overallPercentage,
    targetPercentage: target,
    classesRemainingToday: todayRemainingClassesCount,
    subjectsBelowTarget,
    currentStreak,
    status,
    smartInsights,
  };
}

/**
 * Check if a date is a registered holiday
 */
export function isHoliday(dateStr: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find((h) => h.date === dateStr);
}
