'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  ShieldCheck,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calculator,
  User,
  MapPin,
  X,
  Sparkles,
} from 'lucide-react';
import { Subject, SubjectAttendanceStats } from '@/types';
import { calculatePercentage } from '@/lib/attendanceCalculations';

interface SubjectsViewProps {
  initialSelectedSubjectId?: string | null;
}

export default function SubjectsView({ initialSelectedSubjectId }: SubjectsViewProps) {
  const { store, subjectStatsList, addSubject, updateSubject, deleteSubject } = useAttendance();

  const [activeSubjectModal, setActiveSubjectModal] = useState<SubjectAttendanceStats | null>(() => {
    if (initialSelectedSubjectId) {
      return subjectStatsList.find((s) => s.subjectId === initialSelectedSubjectId) || null;
    }
    return null;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // What-If Simulator state inside modal
  const [simAttend, setSimAttend] = useState(0);
  const [simMiss, setSimMiss] = useState(0);

  // New Subject Form State
  const [newSubForm, setNewSubForm] = useState({
    name: '',
    code: '',
    faculty: '',
    room: '',
    color: '#6366F1',
    targetPercentage: 75,
  });

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubForm.name.trim()) return;

    addSubject({
      name: newSubForm.name.trim(),
      code: newSubForm.code.trim(),
      faculty: newSubForm.faculty.trim(),
      room: newSubForm.room.trim(),
      color: newSubForm.color,
      targetPercentage: Number(newSubForm.targetPercentage) || 75,
    });

    setIsAddModalOpen(false);
    setNewSubForm({
      name: '',
      code: '',
      faculty: '',
      room: '',
      color: '#6366F1',
      targetPercentage: 75,
    });
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    updateSubject(editingSubject);
    setEditingSubject(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
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
            Subject Breakdown &amp; 75% Calculator
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Precise attendance formulas, safety margins, and future attendance projections for every course.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary"
          style={{ fontSize: '0.875rem', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {subjectStatsList.map((stat) => {
          const target = stat.targetPercentage ?? store.settings.targetPercentage ?? 75;
          const isAbove = stat.percentage >= target;

          return (
            <div
              key={stat.subjectId}
              className="card card-hover"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `5px solid ${stat.color || 'var(--primary)'}`,
              }}
            >
              <div>
                {/* Header: Title & Code */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{stat.subjectName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      {stat.subjectCode && (
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
                          {stat.subjectCode}
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Target: {target}%
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        color: isAbove ? 'var(--success-text)' : 'var(--danger-text)',
                      }}
                    >
                      {stat.percentage}%
                    </div>
                    <span
                      className={`badge ${isAbove ? 'badge-above' : 'badge-critical'}`}
                      style={{ fontSize: '0.675rem' }}
                    >
                      {isAbove ? 'Above Target' : 'Below 75%'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                    marginBottom: '14px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(stat.percentage, 100)}%`,
                      height: '100%',
                      background: isAbove ? 'var(--success)' : 'var(--danger)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                {/* Counts */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '16px',
                  }}
                >
                  <span>
                    Attended: <strong style={{ color: 'var(--text-primary)' }}>{stat.attended}</strong> /{' '}
                    {stat.conducted} conducted
                  </span>
                  <span>{stat.cancelled} cancelled</span>
                </div>

                {/* Mathematical Insight Pill */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isAbove ? 'var(--success-light)' : 'var(--danger-light)',
                    border: `1px solid ${
                      isAbove ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'
                    }`,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '16px',
                  }}
                >
                  {isAbove ? (
                    <>
                      <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      <span>
                        You can safely miss{' '}
                        <strong style={{ color: 'var(--success-text)' }}>{stat.canMiss}</strong> more{' '}
                        {stat.canMiss === 1 ? 'class' : 'classes'} and stay above {target}%.
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                      <span>
                        Attend next{' '}
                        <strong style={{ color: 'var(--danger-text)' }}>{stat.needed}</strong>{' '}
                        consecutive {stat.needed === 1 ? 'class' : 'classes'} to reach {target}%.
                      </span>
                    </>
                  )}
                </div>

                {/* Faculty & Room details */}
                {(stat.faculty || stat.room) && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      fontSize: '0.785rem',
                      color: 'var(--text-muted)',
                      marginBottom: '16px',
                    }}
                  >
                    {stat.faculty && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} />
                        {stat.faculty}
                      </span>
                    )}
                    {stat.room && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} />
                        {stat.room}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      const orig = store.subjects.find((s) => s.id === stat.subjectId);
                      if (orig) setEditingSubject({ ...orig });
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                    title="Edit Course Info"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${stat.subjectName}?`)) {
                        deleteSubject(stat.subjectId);
                      }
                    }}
                    className="btn btn-ghost"
                    style={{ padding: '6px 8px', color: 'var(--danger-text)' }}
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setActiveSubjectModal(stat);
                    setSimAttend(0);
                    setSimMiss(0);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px', gap: '6px' }}
                >
                  <Calculator size={14} style={{ color: 'var(--primary)' }} />
                  <span>Calculator &amp; Projections</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Projections & What-If Calculator Modal */}
      {activeSubjectModal && (
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
              maxWidth: '540px',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
              maxHeight: '90vh',
              overflowY: 'auto',
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
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {activeSubjectModal.subjectName}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  75% Attendance Forecaster &amp; Projections
                </span>
              </div>
              <button
                onClick={() => setActiveSubjectModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Current Status Box */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Attendance</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                  {activeSubjectModal.percentage}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeSubjectModal.attended} of {activeSubjectModal.conducted} classes
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Margin</span>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      activeSubjectModal.percentage >= 75
                        ? 'var(--success-text)'
                        : 'var(--danger-text)',
                  }}
                >
                  {activeSubjectModal.percentage >= 75
                    ? `+${activeSubjectModal.canMiss} classes`
                    : `-${activeSubjectModal.needed} classes`}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {activeSubjectModal.percentage >= 75
                    ? 'Can safely miss'
                    : 'Needed to reach 75%'}
                </span>
              </div>
            </div>

            {/* Future Projection Table */}
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
              }}
            >
              Projected Scenarios
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  fontSize: '0.85rem',
                }}
              >
                <span>If you attend next class:</span>
                <strong style={{ color: 'var(--success-text)' }}>
                  {activeSubjectModal.projectedNextAttended}%
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  fontSize: '0.85rem',
                }}
              >
                <span>If you miss next class:</span>
                <strong style={{ color: 'var(--danger-text)' }}>
                  {activeSubjectModal.projectedNextMissed}%
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  fontSize: '0.85rem',
                }}
              >
                <span>If you attend next 5 classes:</span>
                <strong style={{ color: 'var(--success-text)' }}>
                  {activeSubjectModal.projected5Attended}%
                </strong>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  fontSize: '0.85rem',
                }}
              >
                <span>If you attend next 10 classes:</span>
                <strong style={{ color: 'var(--success-text)' }}>
                  {activeSubjectModal.projected10Attended}%
                </strong>
              </div>
            </div>

            {/* Interactive What-If Simulator */}
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={15} />
              <span>Interactive What-If Simulator</span>
            </h4>
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Classes to Attend: {simAttend}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={simAttend}
                    onChange={(e) => setSimAttend(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--success)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                    Classes to Miss: {simMiss}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={simMiss}
                    onChange={(e) => setSimMiss(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--danger)' }}
                  />
                </div>
              </div>

              {(() => {
                const simulatedAttended = activeSubjectModal.attended + simAttend;
                const simulatedConducted = activeSubjectModal.conducted + simAttend + simMiss;
                const simulatedPct = calculatePercentage(simulatedAttended, simulatedConducted);
                const isSimAbove = simulatedPct >= 75;

                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSimAbove ? 'var(--success-light)' : 'var(--danger-light)',
                      border: `1px solid ${
                        isSimAbove ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'
                      }`,
                    }}
                  >
                    <span style={{ fontSize: '0.85rem' }}>
                      Simulated Attendance ({simulatedAttended}/{simulatedConducted}):
                    </span>
                    <strong
                      style={{
                        fontSize: '1.15rem',
                        color: isSimAbove ? 'var(--success-text)' : 'var(--danger-text)',
                      }}
                    >
                      {simulatedPct}%
                    </strong>
                  </div>
                );
              })()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setActiveSubjectModal(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
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
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add New Subject</h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={newSubForm.name}
                  onChange={(e) => setNewSubForm({ ...newSubForm, name: e.target.value })}
                  placeholder="e.g. Artificial Intelligence"
                  className="input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={newSubForm.code}
                    onChange={(e) => setNewSubForm({ ...newSubForm, code: e.target.value })}
                    placeholder="e.g. CS601"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Target %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newSubForm.targetPercentage}
                    onChange={(e) => setNewSubForm({ ...newSubForm, targetPercentage: Number(e.target.value) })}
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
                    value={newSubForm.faculty}
                    onChange={(e) => setNewSubForm({ ...newSubForm, faculty: e.target.value })}
                    placeholder="Dr. Rao"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Room / Hall
                  </label>
                  <input
                    type="text"
                    value={newSubForm.room}
                    onChange={(e) => setNewSubForm({ ...newSubForm, room: e.target.value })}
                    placeholder="Room 304"
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Badge Color
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#4F46E5', '#059669', '#2563EB', '#D97706', '#7C3AED', '#DB2777', '#0891B2'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewSubForm({ ...newSubForm, color })}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--radius-full)',
                          background: color,
                          border:
                            newSubForm.color === color
                              ? '3px solid #ffffff'
                              : '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                        }}
                      />
                    )
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subject Modal */}
      {editingSubject && (
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
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Subject Info</h4>
              <button
                onClick={() => setEditingSubject(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={editingSubject.name}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Subject Code
                  </label>
                  <input
                    type="text"
                    value={editingSubject.code}
                    onChange={(e) => setEditingSubject({ ...editingSubject, code: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Target %
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editingSubject.targetPercentage}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, targetPercentage: Number(e.target.value) })
                    }
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
                    value={editingSubject.faculty || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, faculty: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Room / Hall
                  </label>
                  <input
                    type="text"
                    value={editingSubject.room || ''}
                    onChange={(e) => setEditingSubject({ ...editingSubject, room: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" onClick={() => setEditingSubject(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
