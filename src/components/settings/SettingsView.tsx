'use client';

import React, { useRef, useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import {
  Settings,
  Save,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Key,
  ShieldCheck,
  CheckCircle2,
  Building,
  Layers,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { exportAppDataJSON, importAppDataJSON } from '@/lib/storage';

export default function SettingsView() {
  const { store, updateSettings, loadDemoData, resetAllData, showToast } = useAttendance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState({
    studentName: store.settings.studentName || '',
    collegeName: store.settings.collegeName || '',
    department: store.settings.department || '',
    semester: store.settings.semester || '',
    section: store.settings.section || '',
    selectedBatch: store.settings.selectedBatch || 'All',
    targetPercentage: store.settings.targetPercentage || 75,
    trackingMode: store.settings.trackingMode || 'from_today',
    theme: store.settings.theme || 'dark',
  });

  const batches = Array.from(
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...formState,
      targetPercentage: Number(formState.targetPercentage) || 75,
    });
  };

  const handleExportBackup = () => {
    const jsonStr = exportAppDataJSON(store);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded successfully', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = importAppDataJSON(content);
        updateSettings(parsed.settings);
        showToast('Backup restored successfully!', 'success');
        window.location.reload();
      } catch (err: any) {
        showToast(err?.message || 'Invalid backup file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
          Settings &amp; Personalization
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Manage student profile, batch assignment, attendance thresholds, and data backups.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile & College Card */}
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Building size={18} style={{ color: 'var(--primary)' }} />
            <span>Profile &amp; Academic Info</span>
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '16px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Student Name
              </label>
              <input
                type="text"
                value={formState.studentName}
                onChange={(e) => setFormState({ ...formState, studentName: e.target.value })}
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
                value={formState.collegeName}
                onChange={(e) => setFormState({ ...formState, collegeName: e.target.value })}
                placeholder="e.g. St. Xavier Institute"
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Semester &amp; Section
              </label>
              <input
                type="text"
                value={formState.semester}
                onChange={(e) => setFormState({ ...formState, semester: e.target.value })}
                placeholder="e.g. 5th Sem, Sec B"
                className="input"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                Assigned Batch (Lab Filter)
              </label>
              <select
                value={formState.selectedBatch}
                onChange={(e) => setFormState({ ...formState, selectedBatch: e.target.value })}
                className="input"
                style={{ fontWeight: 600 }}
              >
                {batches.map((b) => (
                  <option key={b} value={b}>
                    Batch {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Attendance & Thresholds */}
        <div className="card glass-panel" style={{ padding: '24px' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
            <span>Attendance Requirements</span>
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Target Attendance Requirement:
              </label>
              <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                {formState.targetPercentage}%
              </strong>
            </div>
            <input
              type="range"
              min={60}
              max={90}
              step={1}
              value={formState.targetPercentage}
              onChange={(e) =>
                setFormState({ ...formState, targetPercentage: Number(e.target.value) })
              }
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
              }}
            >
              <span>60% (Lenient)</span>
              <span>75% (Standard University Requirement)</span>
              <span>85% (Scholarship / Honors)</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px' }}>
              Theme Preference
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, theme: 'dark' })}
                className={`btn ${formState.theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
              >
                <Moon size={16} />
                <span>Dark Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, theme: 'light' })}
                className={`btn ${formState.theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
              >
                <Sun size={16} />
                <span>Light Theme</span>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </form>

      {/* Gemini AI & Privacy Information Card */}
      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Key size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Gemini AI Vision Integration &amp; Privacy</h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Timetable extraction is performed via server-side Google Gemini Vision API calls.
          Your <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>GEMINI_API_KEY</code> is
          loaded securely from the server environment (<code style={{ fontFamily: 'var(--font-mono)' }}>.env</code>)
          and is <strong>never</strong> exposed in client-side code or browser requests.
        </p>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
          <span>Timetable images are processed in-memory for extraction only and are never saved to disk.</span>
        </div>
      </div>

      {/* Data Backup & Reset Card */}
      <div className="card" style={{ padding: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
          Data Backup &amp; Storage Management
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Your attendance records and custom schedules are preserved automatically in browser localStorage.
          You can download a JSON backup or restore from one anytime.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <button onClick={handleExportBackup} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <Download size={16} />
            <span>Export Backup (JSON)</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportBackup}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <Upload size={16} />
            <span>Restore Backup</span>
          </button>

          <button onClick={loadDemoData} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            <RotateCcw size={16} />
            <span>Reload Demo Data</span>
          </button>

          <button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to clear all attendance data? This action cannot be undone unless you have a backup.'
                )
              ) {
                resetAllData();
              }
            }}
            className="btn btn-ghost"
            style={{ fontSize: '0.85rem', color: 'var(--danger-text)' }}
          >
            <Trash2 size={16} />
            <span>Reset All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
