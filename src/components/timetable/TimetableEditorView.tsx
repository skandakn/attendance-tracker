'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  User,
  MapPin,
  Layers,
  Sparkles,
  Filter,
  X,
} from 'lucide-react';
import { Period } from '@/types';
import { isPeriodForBatch } from '@/lib/attendanceCalculations';

export default function TimetableEditorView() {
  const { store, updateTimetablePeriod, addTimetablePeriod, deleteTimetablePeriod, updateSettings } =
    useAttendance();

  const [activeBatchFilter, setActiveBatchFilter] = useState<string>(
    store.settings.selectedBatch || 'All'
  );
  const [selectedDayName, setSelectedDayName] = useState<string>(
    store.timetable.days[0]?.day || 'Monday'
  );

  const [editingPeriodModal, setEditingPeriodModal] = useState<{
    dayName: string;
    period: Period;
    isNew?: boolean;
  } | null>(null);
  const [applyToAllDays, setApplyToAllDays] = useState(false);

  // Available batches
  const detectedBatches = Array.from(
    new Set([
      'All',
      ...(store.timetable.detectedBatches || []),
      'D1',
      'D2',
      'D3',
      'D4',
      'D1+D2',
      'D3+D4',
    ])
  ).filter(Boolean);

  const activeDaySchedule = store.timetable.days.find(
    (d) => d.day.toLowerCase() === selectedDayName.toLowerCase()
  );

  const periodsForActiveDay = (activeDaySchedule?.periods || []).filter((period) =>
    isPeriodForBatch(period.batch, activeBatchFilter)
  );

  const handleSavePeriod = (period: Period) => {
    if (!editingPeriodModal) return;

    if (editingPeriodModal.isNew) {
      addTimetablePeriod(editingPeriodModal.dayName, period, applyToAllDays);
    } else {
      updateTimetablePeriod(editingPeriodModal.dayName, period.id, period, applyToAllDays);
    }

    setEditingPeriodModal(null);
    setApplyToAllDays(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Batch Selector */}
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
            College Timetable &amp; Schedule
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            View and manage your master schedule. Changes automatically synchronize with your attendance
            tracker.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Filter Batch:</span>
            <select
              value={activeBatchFilter}
              onChange={(e) => {
                setActiveBatchFilter(e.target.value);
                updateSettings({ selectedBatch: e.target.value });
              }}
              className="input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 600 }}
            >
              {detectedBatches.map((b) => (
                <option key={b} value={b}>
                  Batch {b}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setEditingPeriodModal({
                dayName: selectedDayName,
                period: {
                  id: `p_${Date.now()}`,
                  start: '09:00',
                  end: '10:00',
                  subject: '',
                  type: 'lecture',
                  batch: activeBatchFilter === 'All' ? null : activeBatchFilter,
                },
                isNew: true,
              });
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Add Class Slot</span>
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
        {store.timetable.days.map((d) => {
          const isSelected = d.day.toLowerCase() === selectedDayName.toLowerCase();
          const count = d.periods.filter((p) => isPeriodForBatch(p.batch, activeBatchFilter)).length;

          return (
            <button
              key={d.day}
              onClick={() => setSelectedDayName(d.day)}
              className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 18px', fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              <span>{d.day}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--bg-input)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Day Timetable Schedule Cards */}
      <div className="card glass-panel" style={{ padding: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
            {selectedDayName} Schedule
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing classes for Batch: <strong style={{ color: 'var(--primary)' }}>{activeBatchFilter}</strong>
          </span>
        </div>

        {periodsForActiveDay.length === 0 ? (
          <div
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
            }}
          >
            No classes scheduled for {selectedDayName} under batch {activeBatchFilter}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {periodsForActiveDay.map((period) => {
              const sub = store.subjects.find(
                (s) =>
                  s.name.toLowerCase() === period.subject.toLowerCase() ||
                  (s.code && period.subject_code && s.code.toLowerCase() === period.subject_code.toLowerCase())
              );
              const isNonAcademic = ['break', 'lunch', 'free'].includes(period.type);

              return (
                <div
                  key={period.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    padding: '14px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: isNonAcademic ? 'var(--bg-primary)' : 'var(--bg-card-hover)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: `4px solid ${
                      isNonAcademic ? 'var(--border-subtle)' : sub?.color || 'var(--primary)'
                    }`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        minWidth: '110px',
                      }}
                    >
                      <Clock size={15} style={{ color: 'var(--primary)' }} />
                      <span>{period.start} - {period.end}</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>
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
                                : isNonAcademic
                                ? 'var(--bg-input)'
                                : 'var(--primary-light)',
                            color:
                              period.type === 'lab'
                                ? '#ec4899'
                                : isNonAcademic
                                ? 'var(--text-muted)'
                                : 'var(--primary)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {period.type}
                        </span>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() =>
                        setEditingPeriodModal({
                          dayName: selectedDayName,
                          period: { ...period },
                        })
                      }
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove this ${period.subject} slot?`)) {
                          deleteTimetablePeriod(selectedDayName, period.id);
                        }
                      }}
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', color: 'var(--danger-text)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Period Modal */}
      {editingPeriodModal && (
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
              maxWidth: '480px',
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
                {editingPeriodModal.isNew ? 'Add Timetable Period' : 'Edit Timetable Period'}
              </h4>
              <button
                onClick={() => setEditingPeriodModal(null)}
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
                  value={editingPeriodModal.period.subject}
                  onChange={(e) =>
                    setEditingPeriodModal({
                      ...editingPeriodModal,
                      period: { ...editingPeriodModal.period, subject: e.target.value },
                    })
                  }
                  className="input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input
                    type="text"
                    value={editingPeriodModal.period.start}
                    onChange={(e) =>
                      setEditingPeriodModal({
                        ...editingPeriodModal,
                        period: { ...editingPeriodModal.period, start: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input
                    type="text"
                    value={editingPeriodModal.period.end}
                    onChange={(e) =>
                      setEditingPeriodModal({
                        ...editingPeriodModal,
                        period: { ...editingPeriodModal.period, end: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Period Type
                  </label>
                  <select
                    value={editingPeriodModal.period.type}
                    onChange={(e) =>
                      setEditingPeriodModal({
                        ...editingPeriodModal,
                        period: { ...editingPeriodModal.period, type: e.target.value as any },
                      })
                    }
                    className="input"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Lab</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="break">Break</option>
                    <option value="lunch">Lunch</option>
                    <option value="free">Free Period</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Batch (optional)
                  </label>
                  <input
                    type="text"
                    value={editingPeriodModal.period.batch || ''}
                    onChange={(e) =>
                      setEditingPeriodModal({
                        ...editingPeriodModal,
                        period: {
                          ...editingPeriodModal.period,
                          batch: e.target.value.trim() ? e.target.value.trim() : null,
                        },
                      })
                    }
                    placeholder="e.g. D1, D2"
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    value={editingPeriodModal.period.faculty || ''}
                    onChange={(e) =>
                      setEditingPeriodModal({
                        ...editingPeriodModal,
                        period: { ...editingPeriodModal.period, faculty: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={editingPeriodModal.period.room || ''}
                    onChange={(e) =>
                      setEditingPeriodModal({
                        ...editingPeriodModal,
                        period: { ...editingPeriodModal.period, room: e.target.value },
                      })
                    }
                    className="input"
                  />
                </div>
              </div>

              {/* All Days Sync Option */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={applyToAllDays}
                    onChange={(e) => setApplyToAllDays(e.target.checked)}
                    style={{ marginTop: '3px', cursor: 'pointer' }}
                  />
                  <div>
                    <span>Apply to all days (Monday – Friday)</span>
                    <p style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>
                      {applyToAllDays
                        ? `Will replicate/update this class slot across every weekday in the master schedule.`
                        : `Default: Applies to all ${editingPeriodModal.dayName}s across the semester.`}
                    </p>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button onClick={() => setEditingPeriodModal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={() => handleSavePeriod(editingPeriodModal.period)}
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
