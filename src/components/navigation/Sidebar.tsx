'use client';

import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  TableProperties,
  BookOpen,
  CalendarDays,
  BarChart3,
  Settings,
  Sparkles,
  Upload,
  Sun,
  Moon,
  GraduationCap,
} from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';

export type NavTab =
  | 'dashboard'
  | 'today'
  | 'subjects'
  | 'timetable'
  | 'calendar'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenUpload: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onOpenUpload }: SidebarProps) {
  const { store, stats, updateSettings } = useAttendance();
  const theme = store.settings.theme || 'dark';

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      id: 'today',
      label: 'Today',
      icon: <CalendarCheck size={19} />,
      badge: stats.classesRemainingToday > 0 ? stats.classesRemainingToday : undefined,
    },
    {
      id: 'subjects',
      label: 'Subjects & 75%',
      icon: <BookOpen size={19} />,
      badge: stats.subjectsBelowTarget > 0 ? `${stats.subjectsBelowTarget} alert` : undefined,
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: <TableProperties size={19} />,
    },
    {
      id: 'calendar',
      label: 'Calendar / History',
      icon: <CalendarDays size={19} />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 size={19} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={19} />,
    },
  ];

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
                Attend<span style={{ color: 'var(--primary)' }}>AI</span>
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  letterSpacing: '0.05em',
                }}
              >
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Timetable & Tracker</p>
          </div>
        </div>
      </div>

      {/* Student / Batch Quick Info */}
      <div
        style={{
          padding: '14px 20px',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
          }}
        >
          <GraduationCap size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {store.settings.studentName || 'Student'}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
            Batch: {store.settings.selectedBatch || 'All'} • {store.settings.semester || 'College'}
          </div>
        </div>
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background:
              stats.percentage >= (store.settings.targetPercentage || 75)
                ? 'var(--success-light)'
                : 'var(--danger-light)',
            color:
              stats.percentage >= (store.settings.targetPercentage || 75)
                ? 'var(--success-text)'
                : 'var(--danger-text)',
          }}
        >
          {stats.percentage}%
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '0 8px 10px',
          }}
        >
          Menu
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ color: isActive ? 'var(--primary)' : 'currentColor' }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        background:
                          typeof item.badge === 'string'
                            ? 'var(--danger-light)'
                            : 'var(--primary)',
                        color: typeof item.badge === 'string' ? 'var(--danger-text)' : '#ffffff',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Upload Timetable action */}
        <div style={{ marginTop: '24px', padding: '0 4px' }}>
          <button
            onClick={onOpenUpload}
            className="btn btn-secondary"
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '10px 14px',
              fontSize: '0.85rem',
            }}
          >
            <Upload size={16} style={{ color: 'var(--primary)' }} />
            <span>Upload New Timetable</span>
          </button>
        </div>
      </nav>

      {/* Footer / Theme Toggle */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Theme Mode</span>
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 10px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          <span style={{ textTransform: 'capitalize' }}>{theme}</span>
        </button>
      </div>
    </aside>
  );
}
