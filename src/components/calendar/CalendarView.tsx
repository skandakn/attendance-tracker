'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Palmtree,
  Calendar as CalendarIcon,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { isAcademicPeriod, isPeriodForBatch, isHoliday } from '@/lib/attendanceCalculations';

export default function CalendarView() {
  const { store, markAttendance, addHoliday, removeHoliday } = useAttendance();

  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  // Calendar calculations
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Inspect selected date
  const selDateObj = new Date(selectedDateStr + 'T00:00:00');
  const selDayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][selDateObj.getDay()];

  const selDaySchedule = store.timetable.days.find(
    (d) => d.day.toLowerCase() === selDayName.toLowerCase()
  );

  const selHoliday = isHoliday(selectedDateStr, store.holidays);

  const selAcademicPeriods = (selDaySchedule?.periods || []).filter((period) => {
    if (!isAcademicPeriod(period)) return false;
    return isPeriodForBatch(period.batch, store.settings.selectedBatch);
  });

  const selDateRecords = store.attendanceRecords.filter((r) => r.date === selectedDateStr);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Attendance History &amp; Calendar
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Review your daily attendance history, correct previous records, or manage holidays.
          </p>
        </div>

        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '160px', textAlign: 'center' }}>
            {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)',
          gap: '24px',
        }}
      >
        {/* Calendar Grid Card */}
        <div className="card glass-panel" style={{ padding: '24px' }}>
          {/* Day of week headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}
          >
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '6px',
            }}
          >
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '70px', opacity: 0.2 }} />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = selectedDateStr === dateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              const dayHoliday = isHoliday(dateStr, store.holidays);
              const dayRecs = store.attendanceRecords.filter((r) => r.date === dateStr);
              const presentCount = dayRecs.filter((r) => r.status === 'present').length;
              const absentCount = dayRecs.filter((r) => r.status === 'absent').length;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDateStr(dateStr)}
                  style={{
                    height: '74px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected
                      ? 'var(--primary-light)'
                      : isToday
                      ? 'var(--bg-card-hover)'
                      : 'var(--bg-card)',
                    border: isSelected
                      ? '2px solid var(--primary)'
                      : isToday
                      ? '1px solid var(--border-glow)'
                      : '1px solid var(--border-subtle)',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: isToday || isSelected ? 800 : 500,
                        color: isSelected
                          ? 'var(--primary)'
                          : isToday
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      }}
                    >
                      {dayNum}
                    </span>

                    {dayHoliday && (
                      <span title={dayHoliday.name} style={{ color: '#3b82f6', fontSize: '0.7rem' }}>
                        🌴
                      </span>
                    )}
                  </div>

                  {/* Attendance dots */}
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                    {presentCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--success-light)',
                          color: 'var(--success-text)',
                        }}
                      >
                        +{presentCount}
                      </span>
                    )}
                    {absentCount > 0 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--danger-light)',
                          color: 'var(--danger-text)',
                        }}
                      >
                        -{absentCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Inspector Drawer */}
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {selDayName}, {selDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedDateStr}
              </span>
            </div>

            {selHoliday ? (
              <button
                onClick={() => removeHoliday(selHoliday.id)}
                className="btn btn-secondary"
                style={{ fontSize: '0.775rem', padding: '6px 10px' }}
              >
                Remove Holiday
              </button>
            ) : (
              <button
                onClick={() => {
                  const name = prompt('Enter Holiday Name:', 'College Holiday');
                  if (name && name.trim()) {
                    addHoliday({ date: selectedDateStr, name: name.trim() });
                  }
                }}
                className="btn btn-ghost"
                style={{ fontSize: '0.775rem', gap: '4px' }}
              >
                <Palmtree size={14} style={{ color: '#3b82f6' }} />
                <span>Mark Holiday</span>
              </button>
            )}
          </div>

          {selHoliday && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.12)',
                color: '#60a5fa',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '16px',
              }}
            >
              🌴 Marked as Holiday: {selHoliday.name}
            </div>
          )}

          {/* Classes list for selected date */}
          <h4
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '10px',
            }}
          >
            Classes on this date ({selAcademicPeriods.length})
          </h4>

          {selAcademicPeriods.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              No scheduled classes on {selDayName} for batch {store.settings.selectedBatch || 'All'}.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selAcademicPeriods.map((period) => {
                const rec = selDateRecords.find((r) => r.periodId === period.id);
                const status = rec?.status || 'unmarked';

                const sub = store.subjects.find(
                  (s) =>
                    s.name.toLowerCase() === period.subject.toLowerCase() ||
                    (s.code && period.subject_code && s.code.toLowerCase() === period.subject_code.toLowerCase())
                );
                const subId = sub?.id || 'unknown';

                return (
                  <div
                    key={period.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.925rem' }}>{period.subject}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {period.start} - {period.end}
                        </div>
                      </div>

                      <span
                        className={`badge ${
                          status === 'present'
                            ? 'badge-above'
                            : status === 'absent'
                            ? 'badge-critical'
                            : 'badge-warning'
                        }`}
                        style={{ fontSize: '0.675rem' }}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Quick status change buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() =>
                          markAttendance({
                            date: selectedDateStr,
                            periodId: period.id,
                            subjectId: subId,
                            status: 'present',
                          })
                        }
                        className={`btn ${status === 'present' ? 'btn-success' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
                      >
                        Present
                      </button>
                      <button
                        onClick={() =>
                          markAttendance({
                            date: selectedDateStr,
                            periodId: period.id,
                            subjectId: subId,
                            status: 'absent',
                          })
                        }
                        className={`btn ${status === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ flex: 1, padding: '5px 8px', fontSize: '0.75rem' }}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() =>
                          markAttendance({
                            date: selectedDateStr,
                            periodId: period.id,
                            subjectId: subId,
                            status: 'cancelled',
                          })
                        }
                        className="btn btn-secondary"
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.75rem',
                          color: status === 'cancelled' ? 'var(--warning-text)' : undefined,
                        }}
                      >
                        Cancel
                      </button>
                      {status !== 'unmarked' && (
                        <button
                          onClick={() =>
                            markAttendance({
                              date: selectedDateStr,
                              periodId: period.id,
                              subjectId: subId,
                              status: 'unmarked',
                            })
                          }
                          className="btn btn-ghost"
                          style={{ padding: '5px 8px' }}
                          title="Reset to unmarked"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
