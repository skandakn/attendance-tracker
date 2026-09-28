'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Calculator,
} from 'lucide-react';
import { isAcademicPeriod, isPeriodForBatch } from '@/lib/attendanceCalculations';
import { NavTab } from '../navigation/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onSelectSubject?: (subjectId: string) => void;
}

export default function DashboardView({ setActiveTab, onSelectSubject }: DashboardViewProps) {
  const { store, stats, subjectStatsList, markAttendance, fireConfetti } = useAttendance();
  const [selectedProjectionSubject, setSelectedProjectionSubject] = useState<string | null>(null);

  const target = store.settings.targetPercentage || 75;
  const isAbove = stats.percentage >= target;

  // Find today's day schedule
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days[new Date().getDay()];
  const todaySchedule = store.timetable.days.find(
    (d) => d.day.toLowerCase() === todayName.toLowerCase()
  );

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = store.attendanceRecords.filter((r) => r.date === todayDateStr);

  // Filter today's academic periods by user batch
  const todayAcademicClasses = (todaySchedule?.periods || []).filter((period) => {
    if (!isAcademicPeriod(period)) return false;
    return isPeriodForBatch(period.batch, store.settings.selectedBatch);
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Welcome / Header */}
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Hello, {store.settings.studentName || 'Student'} 👋
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {store.settings.collegeName
              ? `${store.settings.collegeName} • ${store.settings.semester || ''} • Batch ${
                  store.settings.selectedBatch || 'All'
                }`
              : 'Here is your real-time attendance overview and 75% calculator.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('today')}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem' }}
          >
            <Clock size={16} />
            <span>Mark Today&apos;s Attendance</span>
          </button>
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Overall Attendance Card */}
        <div
          className="card card-hover"
          style={{
            gridColumn: 'span 2',
            background: isAbove
              ? 'linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.08) 100%)'
              : 'linear-gradient(135deg, var(--bg-card) 0%, rgba(244, 63, 94, 0.08) 100%)',
            borderColor: isAbove ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-muted)',
                }}
              >
                Overall Attendance
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '6px' }}>
                <span
                  style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    color: isAbove ? 'var(--success-text)' : 'var(--danger-text)',
                  }}
                >
                  {stats.percentage}%
                </span>
                <span
                  className={`badge ${isAbove ? 'badge-above' : 'badge-critical'}`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {isAbove ? 'Above requirement' : 'Below 75%'}
                </span>
              </div>
            </div>

            {/* Circular Ring or Progress Gauge */}
            <div
              onClick={() => isAbove && fireConfetti()}
              title={isAbove ? 'Click for celebration!' : undefined}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-full)',
                background: isAbove ? 'var(--success-light)' : 'var(--danger-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAbove ? 'var(--success)' : 'var(--danger)',
                cursor: isAbove ? 'pointer' : 'default',
              }}
            >
              {isAbove ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>
              Attended: <strong style={{ color: 'var(--text-primary)' }}>{stats.totalAttended}</strong> /{' '}
              {stats.totalConducted} conducted
            </span>
            <span>
              Required:{' '}
              <strong style={{ color: 'var(--primary)' }}>{target}%</strong>
            </span>
          </div>
        </div>

        {/* Classes Attended */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Classes Attended
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--success-light)',
                color: 'var(--success)',
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {stats.totalAttended}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            of {stats.totalConducted} classes conducted
          </span>
        </div>

        {/* Classes Conducted */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Classes Conducted
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {stats.totalConducted}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stats.totalCancelled} cancelled classes excluded
          </span>
        </div>

        {/* Classes Remaining Today */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Remaining Today
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            {stats.classesRemainingToday}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {todayAcademicClasses.length} total scheduled today
          </span>
        </div>

        {/* Current Streak */}
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Current Streak
            </span>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--warning)',
              }}
            >
              <Flame size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: 'var(--warning-text)' }}>
            {stats.currentStreak}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            consecutive classes attended
          </span>
        </div>
      </div>

      {/* Smart Insights Banner */}
      <div
        className="card glass-panel"
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.08) 100%)',
          borderColor: 'var(--border-glow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Sparkles size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Smart Attendance Insights &amp; Recommendations
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stats.smartInsights.map((insight, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary)',
                  marginTop: '7px',
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1 }}>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule Quick Action Section */}
      <div className="card" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Today&apos;s Schedule — {todayName.toUpperCase()}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mark classes directly here. Attendance percentages update immediately.
            </span>
          </div>

          <button
            onClick={() => setActiveTab('today')}
            className="btn btn-ghost"
            style={{ fontSize: '0.825rem', gap: '4px' }}
          >
            <span>Full Today Page</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {todayAcademicClasses.length === 0 ? (
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              background: 'var(--bg-input)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No academic classes scheduled for you today ({todayName}) in batch{' '}
            {store.settings.selectedBatch || 'All'}. Enjoy your free time!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayAcademicClasses.map((period) => {
              const rec = todayRecords.find((r) => r.periodId === period.id);
              const status = rec?.status || 'unmarked';

              // Find subject ID for this period
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        minWidth: '100px',
                      }}
                    >
                      {period.start} - {period.end}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{period.subject}</span>
                        {period.batch && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              fontWeight: 600,
                            }}
                          >
                            {period.batch}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {period.room && `${period.room} • `}
                        {period.faculty || ''}
                      </div>
                    </div>
                  </div>

                  {/* Marking Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() =>
                        markAttendance({
                          date: todayDateStr,
                          periodId: period.id,
                          subjectId: subId,
                          status: 'present',
                          timeSlot: `${period.start} - ${period.end}`,
                          batch: period.batch,
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
                      <CheckCircle2 size={15} />
                      <span>Present</span>
                    </button>

                    <button
                      onClick={() =>
                        markAttendance({
                          date: todayDateStr,
                          periodId: period.id,
                          subjectId: subId,
                          status: 'absent',
                          timeSlot: `${period.start} - ${period.end}`,
                          batch: period.batch,
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
                      <XCircle size={15} />
                      <span>Absent</span>
                    </button>

                    <button
                      onClick={() =>
                        markAttendance({
                          date: todayDateStr,
                          periodId: period.id,
                          subjectId: subId,
                          status: 'cancelled',
                          timeSlot: `${period.start} - ${period.end}`,
                          batch: period.batch,
                        })
                      }
                      className={`btn btn-secondary`}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        opacity: status === 'cancelled' ? 1 : 0.7,
                        border: status === 'cancelled' ? '1px solid var(--warning)' : undefined,
                        color: status === 'cancelled' ? 'var(--warning-text)' : undefined,
                      }}
                    >
                      <span>Cancelled</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject-Wise Attendance Cards Grid */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Subject-Wise 75% Tracker</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Independent calculations per subject with exact buffer / recovery classes
            </p>
          </div>

          <button
            onClick={() => setActiveTab('subjects')}
            className="btn btn-secondary"
            style={{ fontSize: '0.825rem' }}
          >
            <span>View All Details</span>
            <ChevronRight size={16} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {subjectStatsList.map((subStat) => {
            const isSubAbove = subStat.percentage >= target;

            return (
              <div
                key={subStat.subjectId}
                className="card card-hover"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderLeft: `4px solid ${subStat.color || 'var(--primary)'}`,
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{subStat.subjectName}</h4>
                      {subStat.subjectCode && (
                        <span
                          style={{
                            fontSize: '0.725rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {subStat.subjectCode}
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          color: isSubAbove ? 'var(--success-text)' : 'var(--danger-text)',
                        }}
                      >
                        {subStat.percentage}%
                      </div>
                      <span
                        className={`badge ${isSubAbove ? 'badge-above' : 'badge-critical'}`}
                        style={{ fontSize: '0.675rem', padding: '2px 6px' }}
                      >
                        {isSubAbove ? 'Safe' : 'Below 75%'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    {subStat.attended} / {subStat.conducted} classes attended
                  </div>

                  {/* 75% Buffer / Recovery Stat */}
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      background: isSubAbove ? 'var(--success-light)' : 'var(--danger-light)',
                      border: `1px solid ${
                        isSubAbove ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
                      }`,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isSubAbove ? (
                      <>
                        <ShieldCheck size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                        <span>
                          You can safely miss{' '}
                          <strong style={{ color: 'var(--success-text)' }}>{subStat.canMiss}</strong> more{' '}
                          {subStat.canMiss === 1 ? 'class' : 'classes'}.
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                        <span>
                          Attend next{' '}
                          <strong style={{ color: 'var(--danger-text)' }}>{subStat.needed}</strong>{' '}
                          consecutive {subStat.needed === 1 ? 'class' : 'classes'} to reach {target}%.
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Footer projection button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {subStat.faculty ? `Faculty: ${subStat.faculty}` : ''}
                  </span>
                  <button
                    onClick={() => {
                      if (onSelectSubject) onSelectSubject(subStat.subjectId);
                      setActiveTab('subjects');
                    }}
                    className="btn btn-ghost"
                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                  >
                    <span>View Projections</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
