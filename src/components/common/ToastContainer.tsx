'use client';

import React from 'react';
import { useAttendance } from '@/context/AttendanceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useAttendance();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="animate-slide-in"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              background: isError
                ? 'var(--danger-light)'
                : isSuccess
                ? 'var(--success-light)'
                : 'var(--bg-card)',
              color: isError
                ? 'var(--danger-text)'
                : isSuccess
                ? 'var(--success-text)'
                : 'var(--text-primary)',
              border: `1px solid ${
                isError
                  ? 'rgba(244, 63, 94, 0.4)'
                  : isSuccess
                  ? 'rgba(16, 185, 129, 0.4)'
                  : 'var(--border-subtle)'
              }`,
              boxShadow: 'var(--shadow-lg)',
              backdropFilter: 'blur(12px)',
              fontSize: '0.925rem',
              fontWeight: 500,
              minWidth: '260px',
              maxWidth: '400px',
            }}
          >
            {isSuccess && <CheckCircle2 size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />}
            {isError && <AlertCircle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />}
            {!isSuccess && !isError && <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />}

            <span style={{ flex: 1 }}>{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'currentColor',
                opacity: 0.6,
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
