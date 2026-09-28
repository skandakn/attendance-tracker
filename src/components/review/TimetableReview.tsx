'use client';

import React, { useState } from 'react';
import {
  ExtractedTimetable,
  Period,
  Subject,
  UserSettings,
} from '@/types';
import {
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  MapPin,
  Layers,
  Calendar,
  X,
  Building,
} from 'lucide-react';

interface TimetableReviewProps {
  initialTimetable: ExtractedTimetable;
  initialSubjects: Subject[];
  initialBatches: string[];
  onConfirm: (
    timetable: ExtractedTimetable,
    subjects: Subject[],
    settings: Partial<UserSettings>
  ) => void;
  onCancel: () => void;
}

export default function TimetableReview({
  initialTimetable,
  initialSubjects,
  initialBatches,
  onConfirm,
  onCancel,
}: TimetableReviewProps) {
  const [timetable, setTimetable] = useState<ExtractedTimetable>(initialTimetable);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Personalization fields
  const [studentName, setStudentName] = useState('');
  const [collegeName, setCollegeName] = useState(initialTimetable.college || '');
  const [department, setDepartment] = useState(initialTimetable.department || '');
  const [semester, setSemester] = useState(initialTimetable.semester || '');
  const [section, setSection] = useState(initialTimetable.section || '');
  const [selectedBatch, setSelectedBatch] = useState<string>(
    initialBatches.length > 0 ? initialBatches[0] : 'All'
  );
  const [targetPercentage, setTargetPercentage] = useState(75);
  const [trackingMode, setTrackingMode] = useState<'from_today' | 'from_start'>('from_today');

  // Edit Period Modal
  const [editingPeriod, setEditingPeriod] = useState<{
    dayIndex: number;
    period: Period;
    isNew?: boolean;
  } | null>(null);

  const activeDay = timetable.days[selectedDayIndex] || timetable.days[0];

  const handleUpdatePeriod = (updatedPeriod: Period) => {
    if (!editingPeriod) return;
    const { dayIndex, isNew } = editingPeriod;

    setTimetable((prev) => {
      const days = [...prev.days];
      const targetDay = { ...days[dayIndex] };

      if (isNew) {
        targetDay.periods = [...targetDay.periods, updatedPeriod];
      } else {
        targetDay.periods = targetDay.periods.map((p) =>
          p.id === updatedPeriod.id ? updatedPeriod : p
        );
      }

      days[dayIndex] = targetDay;
      return { ...prev, days };
    });

    // Also sync subject list if new subject name entered
    if (updatedPeriod.subject.trim()) {
      const exists = subjects.some(
        (s) => s.name.toLowerCase() === updatedPeriod.subject.toLowerCase()
      );
      if (!exists && !['break', 'lunch', 'free'].includes(updatedPeriod.type)) {
        const newSub: Subject = {
          id: `subj_${Date.now()}`,
          name: updatedPeriod.subject,
          code: updatedPeriod.subject_code || '',
          faculty: updatedPeriod.faculty || '',
          room: updatedPeriod.room || '',
          color: '#6366f1',
          targetPercentage: 75,
        };
        setSubjects((prev) => [...prev, newSub]);
      }
    }

    setEditingPeriod(null);
  };

  const handleDeletePeriod = (dayIndex: number, periodId: string) => {
    setTimetable((prev) => {
      const days = [...prev.days];
      days[dayIndex] = {
        ...days[dayIndex],
        periods: days[dayIndex].periods.filter((p) => p.id !== periodId),
      };
      return { ...prev, days };
    });
  };

  const handleConfirmReview = () => {
    onConfirm(timetable, subjects, {
      studentName: studentName.trim() || undefined,
      collegeName: collegeName.trim() || undefined,
      department: department.trim() || undefined,
      semester: semester.trim() || undefined,
      section: section.trim() || undefined,
      selectedBatch,
      targetPercentage,
      trackingMode,
    });
  };

  // Compile unique batches list for selector
  const allBatches = Array.from(
    new Set([
      'All',
      ...initialBatches,
      'D1',
      'D2',
      'D3',
      'D4',
      'D1+D2',
      'D3+D4',
    ])
  ).filter(Boolean);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--success-light)',
              color: 'var(--success-text)',
              fontSize: '0.775rem',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <CheckCircle2 size={14} />
            <span>AI Extraction Successful</span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Review Your Timetable
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Verify detected subjects, periods, and batches. Edit anything that needs correction before
            generating your tracker.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleConfirmReview} className="btn btn-primary" style={{ gap: '8px' }}>
            <Sparkles size={18} />
            <span>Looks Correct — Create Tracker</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Uncertainty Warnings if detected */}
      {timetable.uncertaintyNotes && timetable.uncertaintyNotes.length > 0 && (
        <div
          className="card"
          style={{
            background: 'var(--warning-light)',
            borderColor: 'rgba(245, 158, 11, 0.4)',
            marginBottom: '20px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
            <span style={{ fontWeight: 700, color: 'var(--warning-text)', fontSize: '0.9rem' }}>
              Items needing your verification:
            </span>
          </div>
          <ul style={{ paddingLeft: '24px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            {timetable.uncertaintyNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Personalization & College Info Card */}
      <div className="card glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building size={18} style={{ color: 'var(--primary)' }} />
          <span>Student & College Personalization</span>
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              College / University
            </label>
            <input
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              placeholder="e.g. St. Xavier Institute"
              className="input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Semester & Section
            </label>
            <input
              type="text"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. 5th Sem, Sec B"
              className="input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Which Batch are you in?
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="input"
              style={{ fontWeight: 600 }}
            >
              {allBatches.map((b) => (
                <option key={b} value={b}>
                  Batch {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Attendance Target Percentage: <span style={{ color: 'var(--primary)' }}>{targetPercentage}%</span>
            </label>
            <input
              type="range"
              min={60}
              max={90}
              step={1}
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>60% (Flexible)</span>
              <span>75% (Standard University)</span>
              <span>85% (Strict)</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
              Attendance Tracking Mode
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setTrackingMode('from_today')}
                className={`btn ${trackingMode === 'from_today' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
              >
                Start from Today
              </button>
              <button
                type="button"
                onClick={() => setTrackingMode('from_start')}
                className={`btn ${trackingMode === 'from_start' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }}
              >
                Semester Beginning
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
        {timetable.days.map((d, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIndex(idx)}
            className={`btn ${selectedDayIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 18px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
          >
            {d.day}
            <span
              style={{
                fontSize: '0.7rem',
                opacity: 0.8,
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.2)',
              }}
            >
              {d.periods.length}
            </span>
          </button>
        ))}

        <button
          onClick={() => {
            const newDayName = prompt('Enter new day name (e.g. Saturday):', 'Saturday');
            if (newDayName && newDayName.trim()) {
              setTimetable((prev) => ({
                ...prev,
                days: [...prev.days, { day: newDayName.trim(), periods: [] }],
              }));
              setSelectedDayIndex(timetable.days.length);
            }
          }}
          className="btn btn-ghost"
          style={{ fontSize: '0.85rem', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Plus size={16} />
          <span>Add Day</span>
        </button>
      </div>

      {/* Active Day Periods List */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {activeDay?.day || 'Schedule'} Periods
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Classes will only count toward attendance if applicable to batch: {selectedBatch}
            </span>
          </div>

          <button
            onClick={() => {
              setEditingPeriod({
                dayIndex: selectedDayIndex,
                period: {
                  id: `p_new_${Date.now()}`,
                  start: '09:00',
                  end: '10:00',
                  subject: '',
                  type: 'lecture',
                  batch: selectedBatch === 'All' ? null : selectedBatch,
                },
                isNew: true,
              });
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', gap: '6px' }}
          >
            <Plus size={16} style={{ color: 'var(--primary)' }} />
            <span>Add Class / Period</span>
          </button>
        </div>

        {activeDay?.periods.length === 0 ? (
          <div
            style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            No periods detected for this day. Click &ldquo;Add Class / Period&rdquo; to insert one.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeDay?.periods.map((period) => {
              const isBreakOrLunch = ['break', 'lunch', 'free'].includes(period.type);

              return (
                <div
                  key={period.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isBreakOrLunch
                      ? 'var(--bg-primary)'
                      : period.isUncertain
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'var(--bg-card-hover)',
                    border: period.isUncertain
                      ? '1px dashed var(--warning)'
                      : '1px solid var(--border-subtle)',
                  }}
                >
                  {/* Left: Time and Subject */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        minWidth: '110px',
                      }}
                    >
                      <Clock size={15} style={{ color: 'var(--primary)' }} />
                      <span>{period.start} - {period.end}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.975rem' }}>
                          {period.subject || 'Free Period'}
                        </span>
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
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-full)',
                            background:
                              period.type === 'lab'
                                ? 'rgba(236, 72, 153, 0.15)'
                                : isBreakOrLunch
                                ? 'var(--bg-input)'
                                : 'var(--primary-light)',
                            color:
                              period.type === 'lab'
                                ? '#ec4899'
                                : isBreakOrLunch
                                ? 'var(--text-muted)'
                                : 'var(--primary)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {period.type}
                        </span>
                      </div>

                      {/* Room & Faculty details */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.785rem',
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
                        {period.batch && (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: 'var(--primary)',
                              fontWeight: 600,
                            }}
                          >
                            <Layers size={13} />
                            Batch: {period.batch}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Uncertainty indicator */}
                  {period.isUncertain && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.785rem',
                        color: 'var(--warning-text)',
                        background: 'var(--warning-light)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      <AlertTriangle size={14} />
                      <span>{period.uncertaintyReason || 'Uncertain AI detection — please verify'}</span>
                    </div>
                  )}

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() =>
                        setEditingPeriod({
                          dayIndex: selectedDayIndex,
                          period: { ...period },
                        })
                      }
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      <Edit2 size={15} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeletePeriod(selectedDayIndex, period.id)}
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Final Confirmation Button */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <button
          onClick={handleConfirmReview}
          className="btn btn-primary"
          style={{
            padding: '16px 36px',
            fontSize: '1.1rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Sparkles size={20} />
          <span>Looks Correct — Create My Attendance Tracker</span>
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Edit Period Modal */}
      {editingPeriod && (
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
              maxWidth: '500px',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
              }}
            >
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {editingPeriod.isNew ? 'Add Class Period' : 'Edit Class Period'}
              </h4>
              <button
                onClick={() => setEditingPeriod(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={editingPeriod.period.subject}
                  onChange={(e) =>
                    setEditingPeriod({
                      ...editingPeriod,
                      period: { ...editingPeriod.period, subject: e.target.value },
                    })
                  }
                  placeholder="e.g. Operating Systems"
                  className="input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editingPeriod.period.start}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        period: { ...editingPeriod.period, start: e.target.value },
                      })
                    }
                    placeholder="09:00"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editingPeriod.period.end}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        period: { ...editingPeriod.period, end: e.target.value },
                      })
                    }
                    placeholder="10:00"
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={editingPeriod.period.subject_code || ''}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        period: { ...editingPeriod.period, subject_code: e.target.value },
                      })
                    }
                    placeholder="e.g. BCS501"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Period Type
                  </label>
                  <select
                    value={editingPeriod.period.type}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        period: { ...editingPeriod.period, type: e.target.value as any },
                      })
                    }
                    className="input"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab / Practical</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="break">Break</option>
                    <option value="lunch">Lunch</option>
                    <option value="free">Free Period</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    value={editingPeriod.period.faculty || ''}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        period: { ...editingPeriod.period, faculty: e.target.value },
                      })
                    }
                    placeholder="Prof. Sharma"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={editingPeriod.period.room || ''}
                    onChange={(e) =>
                      setEditingPeriod({
                        ...editingPeriod,
                        period: { ...editingPeriod.period, room: e.target.value },
                      })
                    }
                    placeholder="Room 302"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Batch (leave empty if for all students)
                </label>
                <input
                  type="text"
                  value={editingPeriod.period.batch || ''}
                  onChange={(e) =>
                    setEditingPeriod({
                      ...editingPeriod,
                      period: {
                        ...editingPeriod.period,
                        batch: e.target.value.trim() ? e.target.value.trim() : null,
                      },
                    })
                  }
                  placeholder="e.g. D1, D2, or D1+D2"
                  className="input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button onClick={() => setEditingPeriod(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // clear uncertainty when user manually verifies/saves
                    handleUpdatePeriod({
                      ...editingPeriod.period,
                      isUncertain: false,
                    });
                  }}
                  className="btn btn-primary"
                >
                  Save Period
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
