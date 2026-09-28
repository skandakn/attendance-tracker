'use client';

import React, { useState } from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import Sidebar, { NavTab } from '@/components/navigation/Sidebar';
import MobileNav from '@/components/navigation/MobileNav';
import HeroUpload from '@/components/upload/HeroUpload';
import TimetableReview from '@/components/review/TimetableReview';
import DashboardView from '@/components/dashboard/DashboardView';
import TodayView from '@/components/today/TodayView';
import SubjectsView from '@/components/subjects/SubjectsView';
import TimetableEditorView from '@/components/timetable/TimetableEditorView';
import CalendarView from '@/components/calendar/CalendarView';
import AnalyticsView from '@/components/analytics/AnalyticsView';
import SettingsView from '@/components/settings/SettingsView';
import { ExtractedTimetable, Subject, UserSettings } from '@/types';
import { Sparkles, Upload, X } from 'lucide-react';

export default function Home() {
  const { store, isInitialized, applyExtractedTimetable } = useAttendance();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Upload & Review Flow states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reviewData, setReviewData] = useState<{
    timetable: ExtractedTimetable;
    subjects: Subject[];
    batches: string[];
  } | null>(null);

  // If loading storage initial data
  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Sparkles size={24} className="animate-spin-slow" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Loading AttendAI...</h2>
        </div>
      </div>
    );
  }

  // Handle successful extraction from AI
  const handleExtractionComplete = (extracted: {
    timetable: ExtractedTimetable;
    subjects: Subject[];
    detectedBatches: string[];
  }) => {
    setIsUploadOpen(false);
    setReviewData({
      timetable: extracted.timetable,
      subjects: extracted.subjects,
      batches: extracted.detectedBatches,
    });
  };

  // Handle final confirmation from review screen
  const handleConfirmReview = (
    confirmedTimetable: ExtractedTimetable,
    confirmedSubjects: Subject[],
    settings: Partial<UserSettings>
  ) => {
    applyExtractedTimetable(confirmedTimetable, confirmedSubjects, settings);
    setReviewData(null);
    setActiveTab('dashboard');
  };

  // If reviewing an extracted timetable
  if (reviewData) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '32px 20px' }}>
        <TimetableReview
          initialTimetable={reviewData.timetable}
          initialSubjects={reviewData.subjects}
          initialBatches={reviewData.batches}
          onConfirm={handleConfirmReview}
          onCancel={() => setReviewData(null)}
        />
      </div>
    );
  }

  // If user has no timetable setup at all yet, show the HeroUpload landing directly
  const hasTimetable =
    store.timetable &&
    store.timetable.days &&
    store.timetable.days.some((d) => d.periods && d.periods.length > 0);

  if (!hasTimetable && !isUploadOpen) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '40px 20px' }}>
        <HeroUpload onExtractionComplete={handleExtractionComplete} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedSubjectId(null);
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-inner">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onSelectSubject={(id) => {
                setSelectedSubjectId(id);
                setActiveTab('subjects');
              }}
            />
          )}

          {activeTab === 'today' && <TodayView />}

          {activeTab === 'subjects' && (
            <SubjectsView initialSelectedSubjectId={selectedSubjectId} />
          )}

          {activeTab === 'timetable' && <TimetableEditorView />}

          {activeTab === 'calendar' && <CalendarView />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Upload Timetable Modal if triggered from sidebar */}
      {isUploadOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            overflowY: 'auto',
            padding: '32px 16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div style={{ position: 'relative', width: '100%', maxWidth: '940px' }}>
            <button
              onClick={() => setIsUploadOpen(false)}
              className="btn btn-secondary"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 10,
                borderRadius: 'var(--radius-full)',
                padding: '8px',
              }}
              title="Close"
            >
              <X size={20} />
            </button>

            <HeroUpload
              onExtractionComplete={handleExtractionComplete}
              onClose={() => setIsUploadOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
