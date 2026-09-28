'use client';

import React from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function AnalyticsView() {
  const { store, stats, subjectStatsList } = useAttendance();

  const target = store.settings.targetPercentage ?? 75;
  const totalMissed = stats.totalConducted - stats.totalAttended;

  // Breakdown by day of week
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts: Record<string, { attended: number; missed: number }> = {};
  dayNames.forEach((d) => (dayCounts[d] = { attended: 0, missed: 0 }));

  store.attendanceRecords.forEach((rec) => {
    const dObj = new Date(rec.date + 'T00:00:00');
    const dName = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][dObj.getDay()];

    if (dayCounts[dName]) {
      if (rec.status === 'present') dayCounts[dName].attended++;
      else if (rec.status === 'absent') dayCounts[dName].missed++;
    }
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Attendance Analytics &amp; Reports
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Visual insights, subject performance trends, and day-of-week attendance patterns.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Overall Attendance
            </span>
            <TrendingUp
              size={18}
              style={{ color: stats.percentage >= target ? 'var(--success)' : 'var(--danger)' }}
            />
          </div>
          <div
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              marginTop: '6px',
              color: stats.percentage >= target ? 'var(--success-text)' : 'var(--danger-text)',
            }}
          >
            {stats.percentage}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Target: {target}% minimum
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Classes Attended
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px' }}>
            {stats.totalAttended}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Present across all courses
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Classes Missed
            </span>
            <XCircle size={18} style={{ color: 'var(--danger)' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px', color: 'var(--danger-text)' }}>
            {totalMissed}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Unexcused absences
          </span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Cancelled Classes
            </span>
            <Clock size={18} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '6px' }}>
            {stats.totalCancelled}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Excluded from conducted
          </span>
        </div>
      </div>

      {/* Subject-Wise Comparison Bar Chart */}
      <div className="card glass-panel" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Subject-Wise Comparison</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Dotted line indicates the mandatory {target}% threshold benchmark
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {subjectStatsList.map((stat) => {
            const isAboveSub = stat.percentage >= target;
            return (
              <div key={stat.subjectId}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: 'var(--radius-full)',
                        background: stat.color || 'var(--primary)',
                      }}
                    />
                    <strong style={{ fontWeight: 700 }}>{stat.subjectName}</strong>
                    {stat.subjectCode && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        ({stat.subjectCode})
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {stat.attended}/{stat.conducted} classes
                    </span>
                    <strong
                      style={{
                        color: isAboveSub ? 'var(--success-text)' : 'var(--danger-text)',
                        minWidth: '48px',
                        textAlign: 'right',
                      }}
                    >
                      {stat.percentage}%
                    </strong>
                  </div>
                </div>

                {/* Progress Bar Container with Benchmark Line */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '14px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Fill */}
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(stat.percentage, 100)}%`,
                      background: isAboveSub
                        ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }}
                  />

                  {/* Benchmark 75% tick mark */}
                  <div
                    style={{
                      position: 'absolute',
                      left: `${target}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      zIndex: 2,
                    }}
                    title={`Requirement: ${target}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '16px',
            marginTop: '16px',
            fontSize: '0.775rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--success)' }} />
            <span>&ge; {target}% (Safe)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--danger)' }} />
            <span>&lt; {target}% (Warning)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: 'rgba(255, 255, 255, 0.7)' }} />
            <span>{target}% Target Line</span>
          </div>
        </div>
      </div>

      {/* Grid: Attended vs Missed Distribution & Day-of-Week Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Attended vs Missed Ratio */}
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Attendance Distribution</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Proportion of conducted classes
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '20px 0' }}>
            {/* SVG Donut Chart */}
            <svg width="120" height="120" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="var(--bg-input)"
                strokeWidth="3.8"
              />
              {/* Attended slice */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                stroke="var(--success)"
                strokeWidth="3.8"
                strokeDasharray={`${stats.percentage} ${100 - stats.percentage}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--success)' }} />
                  <span>Attended</span>
                </div>
                <strong style={{ fontSize: '1.1rem', paddingLeft: '16px' }}>
                  {stats.totalAttended} classes ({stats.percentage}%)
                </strong>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--danger)' }} />
                  <span>Missed</span>
                </div>
                <strong style={{ fontSize: '1.1rem', paddingLeft: '16px', color: 'var(--danger-text)' }}>
                  {totalMissed} classes ({stats.totalConducted > 0 ? (100 - stats.percentage).toFixed(1) : 0}%)
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Day of Week Pattern */}
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Weekly Attendance Pattern</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Classes attended vs missed by weekday
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {dayNames.map((d) => {
              const data = dayCounts[d] || { attended: 0, missed: 0 };
              const total = data.attended + data.missed;
              const rate = total > 0 ? Math.round((data.attended / total) * 100) : 100;

              return (
                <div
                  key={d}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ minWidth: '85px', fontWeight: 600 }}>{d}</span>

                  <div
                    style={{
                      flex: 1,
                      height: '8px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-full)',
                      margin: '0 12px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${rate}%`,
                        background: rate >= target ? 'var(--success)' : 'var(--danger)',
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>

                  <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 700 }}>
                    {total > 0 ? `${rate}%` : 'N/A'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
