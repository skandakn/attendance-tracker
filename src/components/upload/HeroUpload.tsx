'use client';

import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  FileImage,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Eye,
  Loader2,
  Calendar,
  Layers,
  Zap,
} from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { ExtractedTimetable, Subject } from '@/types';

interface HeroUploadProps {
  onExtractionComplete: (extracted: {
    timetable: ExtractedTimetable;
    subjects: Subject[];
    detectedBatches: string[];
  }) => void;
  onClose?: () => void;
}

const PROGRESS_STEPS = [
  { step: 1, label: 'Uploading image & checking format' },
  { step: 2, label: 'Reading timetable grid with Gemini Vision AI' },
  { step: 3, label: 'Detecting subjects, faculty & room codes' },
  { step: 4, label: 'Understanding schedule & batch divisions (D1/D2)' },
  { step: 5, label: 'Building your personalized attendance tracker' },
];

export default function HeroUpload({ onExtractionComplete, onClose }: HeroUploadProps) {
  const { loadDemoData, showToast } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoPreview, setShowDemoPreview] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a supported format (PNG, JPG, JPEG, WEBP, or PDF).');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const startExtraction = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setCurrentStepIndex(0);

    // Progressive animation step timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PROGRESS_STEPS.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 1200);

    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          // extract only raw base64 part
          const base64Part = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64Part);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const response = await fetch('/api/extract-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: selectedFile.type,
        }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok || !data.success) {
        if (data.error === 'MISSING_API_KEY') {
          setErrorMessage(
            'GEMINI_API_KEY is not set in your server .env. You can add your API key or click "Try Demo" below to experience the complete app with realistic timetable data!'
          );
        } else {
          setErrorMessage(
            data.message ||
              "We couldn't confidently read some parts of your timetable. Please try a clearer image or use manual editing."
          );
        }
        setIsProcessing(false);
        return;
      }

      // Finish steps animation
      setCurrentStepIndex(PROGRESS_STEPS.length - 1);
      setTimeout(() => {
        setIsProcessing(false);
        onExtractionComplete({
          timetable: data.timetable,
          subjects: data.subjects,
          detectedBatches: data.detectedBatches || [],
        });
      }, 700);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMessage(
        err?.message || 'Network error occurred while analyzing timetable. Please try again.'
      );
    }
  };

  const handleTryDemo = () => {
    loadDemoData();
    if (onClose) onClose();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '940px', margin: '0 auto', width: '100%' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.825rem',
            fontWeight: 700,
            marginBottom: '16px',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Sparkles size={16} />
          <span>AI-Powered Vision Timetable Scanner</span>
        </div>
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '14px',
          }}
        >
          Turn Your Timetable Into Your <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Attendance Tracker
          </span>
        </h1>
        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Upload your timetable. Let AI build your personalized attendance dashboard with automatic 75%
          calculations, batch filters, and smart bunk insights.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="card glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        {!isProcessing ? (
          <div>
            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-strong)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'var(--primary-light)' : 'var(--bg-card)',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
              />

              {previewUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={previewUrl}
                    alt="Timetable Preview"
                    style={{
                      maxHeight: '180px',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileImage size={18} style={{ color: 'var(--primary)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedFile?.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({Math.round((selectedFile?.size || 0) / 1024)} KB)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                    Click or drag another file to replace
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      marginBottom: '4px',
                    }}
                  >
                    <Upload size={32} />
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Drop your timetable image here, or{' '}
                    <span style={{ color: 'var(--primary)' }}>browse</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '440px' }}>
                    Supports PNG, JPG, JPEG, WEBP or PDF. Cell photos, screenshots, and university portal
                    exports work great.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                className="animate-fade-in"
                style={{
                  marginTop: '20px',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-light)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  color: 'var(--danger-text)',
                  fontSize: '0.9rem',
                }}
              >
                <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>{errorMessage}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                marginTop: '28px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={startExtraction}
                  disabled={!selectedFile}
                  className="btn btn-primary"
                  style={{
                    padding: '12px 24px',
                    fontSize: '1rem',
                    opacity: selectedFile ? 1 : 0.5,
                    cursor: selectedFile ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Sparkles size={18} />
                  <span>Analyze Timetable</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={handleTryDemo}
                  className="btn btn-secondary"
                  style={{ padding: '12px 20px', fontSize: '0.95rem' }}
                >
                  <Zap size={18} style={{ color: 'var(--warning)' }} />
                  <span>Try Demo (Instant)</span>
                </button>
              </div>

              <button
                onClick={() => setShowDemoPreview(!showDemoPreview)}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem', gap: '6px' }}
              >
                <Eye size={16} />
                <span>{showDemoPreview ? 'Hide Sample' : 'View Sample Timetable'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Stepped Progress Animation */
          <div style={{ padding: '20px 8px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  marginBottom: '14px',
                }}
              >
                <Loader2 size={28} className="animate-spin-slow" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                Analyzing Your Timetable with Gemini AI
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Please wait a moment while we scan cells, detect batches, and format your schedule...
              </p>
            </div>

            {/* Stepper Display */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                maxWidth: '520px',
                margin: '0 auto',
              }}
            >
              {PROGRESS_STEPS.map((item, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={item.step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent
                        ? 'var(--primary-light)'
                        : isDone
                        ? 'var(--bg-card)'
                        : 'transparent',
                      border: isCurrent
                        ? '1px solid var(--border-glow)'
                        : '1px solid transparent',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: isDone
                          ? 'var(--success)'
                          : isCurrent
                          ? 'var(--primary)'
                          : 'var(--bg-input)',
                        color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                      }}
                    >
                      {isDone ? <CheckCircle2 size={16} /> : isCurrent ? <Loader2 size={14} className="animate-spin-slow" /> : item.step}
                    </div>

                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: isCurrent ? 700 : isDone ? 500 : 400,
                        color: isCurrent
                          ? 'var(--text-primary)'
                          : isDone
                          ? 'var(--text-secondary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sample Timetable Lightbox Preview */}
      {showDemoPreview && (
        <div
          className="card animate-fade-in"
          style={{
            marginBottom: '24px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                Example Supported College Timetable Layout
              </span>
            </div>
            <button
              onClick={() => setShowDemoPreview(false)}
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
            >
              Close
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.8rem',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>Day</th>
                  <th style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>09:00 - 10:00</th>
                  <th style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>10:00 - 11:00</th>
                  <th style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>11:15 - 12:15</th>
                  <th style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>13:00 - 15:00 (Labs)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>Mon</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>Operating Systems (301)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>Computer Networks (302)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>DBMS (304)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>D1: Web Lab</span> | D3: DBMS Lab
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>Tue</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>Theory of Comp (302)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>Operating Systems (301)</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>Professional Ethics</td>
                  <td style={{ padding: '8px 12px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>D1: DBMS Lab</span> | D3: Web Lab
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
              }}
            >
              <Zap size={18} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Automatic 75% Math</h4>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Instantly computes how many classes you can afford to miss or how many consecutive classes you must
            attend to reach 75%.
          </p>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#ec4899',
              }}
            >
              <Layers size={18} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Batch-Aware Schedules</h4>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Recognizes lab batches like D1, D2, D3, D4 so your tracker only shows classes relevant to your
            assigned batch.
          </p>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--success-light)',
                color: 'var(--success)',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Zero Data Harvesting</h4>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Uploaded images are only processed in memory to extract schedule data and are never stored. Data is
            stored locally in your browser.
          </p>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          padding: '12px',
        }}
      >
        <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
        <span>
          Your timetable is processed only to extract your schedule. API credentials are never exposed to the
          browser.
        </span>
      </div>
    </div>
  );
}
