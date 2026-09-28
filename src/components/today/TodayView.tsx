'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  Palmtree,
  CheckCheck,
  RotateCcw,
  Layers,
  MapPin,
  User,
  X,
} from 'lucide-react';
import { isAcademicPeriod, isPeriodForBatch, isHoliday } from '@/lib/attendanceCalculations';

export default function TodayView() {
  const {
    store,
    markAttendance,
    bulkMarkDay,
    addHoliday,
    removeHoliday,
    addExtraClass,
    showToast,
  } = useAttendance();

  // Current viewed date (defaults to today)
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [extraClassData, setExtraClassData] = useState({
    subjectId: store.subjects[0]?.id || '',
    startTime: '14:00',
    endTime: '15:00',
    room: 'Room 302',
    topic: 'Extra Tutorial',
  });

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const dayIndex = dateObj.getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[dayIndex];

  // Find schedule for dayName
  const daySchedule = store.timetable.days.find(
    (d) => d.day.toLowerCase() === dayName.toLowerCase()
  );

  // Check if holiday
  const holiday = isHoliday(selectedDate, store.holidays);

  // Filter periods for selected batch
  const academicPeriods = (daySchedule?.periods || []).filter((period) => {
    if (!isAcademicPeriod(period)) return false;
    return isPeriodForBatch(period.batch, store.settings.selectedBatch);
  });

  // Get records for this date
  const dateRecords = store.attendanceRecords.filter((r) => r.date === selectedDate);

  // Extra classes for this date
  const dateExtraClasses = store.extraClasses.filter((e) => e.date === selectedDate);

  // Navigate date
  const changeDateBy = (days: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const jumpToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const handleCreateExtraClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraClassData.subjectId) return;

    addExtraClass({
      date: selectedDate,
      startTime: extraClassData.startTime,
      endTime: extraClassData.endTime,
      subjectId: extraClassData.subjectId,
      room: extraClassData.room,
      topic: extraClassData.topic,
    });

    setIsExtraModalOpen(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Top Header & Date Navigation */}
      <div
        className="card glass-panel"
        style={{
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <CalendarIcon size={24} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {isToday ? 'TODAY — ' : ''}
                {dayName.toUpperCase()}
              </h2>
              {isToday && (
                <span
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                  }}
                >
                  Current Day
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {dateObj.toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Date Selector Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => changeDateBy(-1)}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Previous Day"
          >
            <ChevronLeft size={18} />
          </button>

          {!isToday && (
            <button onClick={jumpToToday} className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
              Today
            </button>
          )}

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.875rem' }}
          />

          <button
            onClick={() => changeDateBy(1)}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Next Day"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Holiday Banner if Date is Holiday */}
      {holiday ? (
        <div
          className="card"
          style={{
            background: 'rgba(59, 130, 246, 0.12)',
            borderColor: 'rgba(59, 130, 246, 0.4)',
            marginBottom: '20px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Palmtree size={24} style={{ color: '#3b82f6' }} />
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa' }}>
                Holiday: {holiday.name}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Timetable classes on this date are not counted as conducted.
              </p>
            </div>
          </div>

          <button
            onClick={() => removeHoliday(holiday.id)}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            Remove Holiday
          </button>
        </div>
      ) : (
        /* Quick Action Toolbar */
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => bulkMarkDay(selectedDate, 'present')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '7px 12px', gap: '6px' }}
            >
              <CheckCheck size={15} style={{ color: 'var(--success)' }} />
              <span>Mark All Present</span>
            </button>
            <button
              onClick={() => bulkMarkDay(selectedDate, 'absent')}
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '7px 12px', gap: '6px' }}
            >
              <XCircle size={15} style={{ color: 'var(--danger)' }} />
              <span>Mark All Absent</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                const name = prompt('Enter Holiday Name:', 'College Holiday');
                if (name && name.trim()) {
                  addHoliday({ date: selectedDate, name: name.trim() });
                }
              }}
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', gap: '6px' }}
            >
              <Palmtree size={15} style={{ color: '#3b82f6' }} />
              <span>Mark Date as Holiday</span>
            </button>

            <button
              onClick={() => setIsExtraModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 14px', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Add Extra Class</span>
            </button>
          </div>
        </div>
      )}

      {/* Extra Classes for Today */}
      {dateExtraClasses.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4
            style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Extra / Special Classes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dateExtraClasses.map((ec) => {
              const sub = store.subjects.find((s) => s.id === ec.subjectId);
              const rec = dateRecords.find((r) => r.periodId === ec.id);
              const status = rec?.status || 'unmarked';

              return (
                <div
                  key={ec.id}
                  className="card"
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderColor: 'var(--border-glow)',
                    background: 'rgba(99, 102, 241, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {ec.startTime} - {ec.endTime}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700 }}>{sub?.name || 'Extra Class'}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--primary)',
                            color: '#ffffff',
                          }}
                        >
                          Extra
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ec.topic && `${ec.topic} • `}
                        {ec.room || ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() =>
                        markAttendance({
                          date: selectedDate,
                          periodId: ec.id,
                          subjectId: ec.subjectId,
                          status: 'present',
                        })
                      }
                      className={`btn ${status === 'present' ? 'btn-success' : 'btn-secondary'}`}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: status === 'present' ? 'var(--success)' : undefined,
                        color: status === 'present' ? '#ffffff' : undefined,
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Present</span>
                    </button>
                    <button
                      onClick={() =>
                        markAttendance({
                          date: selectedDate,
                          periodId: ec.id,
                          subjectId: ec.subjectId,
                          status: 'absent',
                        })
                      }
                      className={`btn ${status === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        background: status === 'absent' ? 'var(--danger)' : undefined,
                        color: status === 'absent' ? '#ffffff' : undefined,
                      }}
                    >
                      <XCircle size={14} />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scheduled Classes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {academicPeriods.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.95rem',
            }}
          >
            No scheduled classes found for {dayName} in your selected batch (
            {store.settings.selectedBatch || 'All'}).
          </div>
        ) : (
          academicPeriods.map((period, idx) => {
            const rec = dateRecords.find((r) => r.periodId === period.id);
            const status = rec?.status || 'unmarked';

            const sub = store.subjects.find(
              (s) =>
                s.name.toLowerCase() === period.subject.toLowerCase() ||
                (s.code && period.subject_code && s.code.toLowerCase() === period.subject_code.toLowerCase())
            );
            const subId = sub?.id || `subj_${idx}`;

            return (
              <div
                key={period.id}
                className="card card-hover"
                style={{
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderLeft: `4px solid ${sub?.color || 'var(--primary)'}`,
                  opacity: holiday ? 0.6 : 1,
                }}
              >
                {/* Time & Subject Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      minWidth: '115px',
                    }}
                  >
                    <Clock size={16} style={{ color: 'var(--primary)' }} />
                    <span>
                      {period.start} - {period.end}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{period.subject}</span>
                      {period.subject_code && (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-input)',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {period.subject_code}
                        </span>
                      )}
                      {period.batch && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--primary-light)',
                            color: 'var(--primary)',
                          }}
                        >
                          Batch {period.batch}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      {period.faculty && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={13} />
                          {period.faculty}
                        </span>
                      )}
                      {period.room && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} />
                          {period.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Marking Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() =>
                      markAttendance({
                        date: selectedDate,
                        periodId: period.id,
                        subjectId: subId,
                        status: 'present',
                        timeSlot: `${period.start} - ${period.end}`,
                        batch: period.batch,
                      })
                    }
                    className={`btn ${status === 'present' ? 'btn-success' : 'btn-secondary'}`}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      background: status === 'present' ? 'var(--success)' : undefined,
                      color: status === 'present' ? '#ffffff' : undefined,
                      boxShadow: status === 'present' ? '0 2px 10px rgba(16, 185, 129, 0.4)' : undefined,
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Present</span>
                  </button>

                  <button
                    onClick={() =>
                      markAttendance({
                        date: selectedDate,
                        periodId: period.id,
                        subjectId: subId,
                        status: 'absent',
                        timeSlot: `${period.start} - ${period.end}`,
                        batch: period.batch,
                      })
                    }
                    className={`btn ${status === 'absent' ? 'btn-danger' : 'btn-secondary'}`}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      background: status === 'absent' ? 'var(--danger)' : undefined,
                      color: status === 'absent' ? '#ffffff' : undefined,
                      boxShadow: status === 'absent' ? '0 2px 10px rgba(244, 63, 94, 0.4)' : undefined,
                    }}
                  >
                    <XCircle size={16} />
                    <span>Absent</span>
                  </button>

                  <button
                    onClick={() =>
                      markAttendance({
                        date: selectedDate,
                        periodId: period.id,
                        subjectId: subId,
                        status: 'cancelled',
                        timeSlot: `${period.start} - ${period.end}`,
                        batch: period.batch,
                      })
                    }
                    className={`btn btn-secondary`}
                    style={{
                      padding: '8px 14px',
                      fontSize: '0.85rem',
                      border: status === 'cancelled' ? '1px solid var(--warning)' : undefined,
                      color: status === 'cancelled' ? 'var(--warning-text)' : undefined,
                    }}
                  >
                    <span>Cancelled</span>
                  </button>

                  {status !== 'unmarked' && (
                    <button
                      onClick={() =>
                        markAttendance({
                          date: selectedDate,
                          periodId: period.id,
                          subjectId: subId,
                          status: 'unmarked',
                        })
                      }
                      className="btn btn-ghost"
                      style={{ padding: '8px', color: 'var(--text-muted)' }}
                      title="Clear status"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Extra Class Modal */}
      {isExtraModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '16px',
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Schedule Extra / Special Class
              </h4>
              <button
                onClick={() => setIsExtraModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExtraClass} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subject
                </label>
                <select
                  value={extraClassData.subjectId}
                  onChange={(e) => setExtraClassData({ ...extraClassData, subjectId: e.target.value })}
                  className="input"
                  required
                >
                  {store.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || 'No code'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={extraClassData.startTime}
                    onChange={(e) => setExtraClassData({ ...extraClassData, startTime: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input
                    type="text"
                    value={extraClassData.endTime}
                    onChange={(e) => setExtraClassData({ ...extraClassData, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Topic / Description
                </label>
                <input
                  type="text"
                  value={extraClassData.topic}
                  onChange={(e) => setExtraClassData({ ...extraClassData, topic: e.target.value })}
                  placeholder="e.g. Saturday Remedial Session"
                  className="input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Room / Hall
                </label>
                <input
                  type="text"
                  value={extraClassData.room}
                  onChange={(e) => setExtraClassData({ ...extraClassData, room: e.target.value })}
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsExtraModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Extra Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
