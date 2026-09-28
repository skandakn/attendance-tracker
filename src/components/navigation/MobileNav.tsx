'use client';

import React from 'react';
import { LayoutDashboard, CalendarCheck, BookOpen, CalendarDays, BarChart3, Settings } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export default function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const items: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} /> },
    { id: 'today', label: 'Today', icon: <CalendarCheck size={20} /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen size={20} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={20} /> },
    { id: 'analytics', label: 'Stats', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="mobile-nav">
      {items.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 8px',
              fontSize: '0.7rem',
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
