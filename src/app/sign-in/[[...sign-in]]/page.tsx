import { SignIn } from '@clerk/nextjs';
import { Sparkles, CalendarCheck, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Sign In — AttendAI',
  description: 'Sign in to access your AttendAI timetable and attendance tracker.',
};

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #090d16 60%, #030712 100%)',
        padding: '32px 16px',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1050px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
        }}
      >
        {/* Left Side: Product Branding & Highlights */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 25px rgba(99, 102, 241, 0.45)',
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
                  Attend<span style={{ color: '#818cf8' }}>AI</span>
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  PRO
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Smart College Attendance Tracker</p>
            </div>
          </div>

          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '16px',
              letterSpacing: '-0.03em',
            }}
          >
            Never risk falling below{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              75% attendance
            </span>{' '}
            again.
          </h1>

          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Turn your college timetable image into an automated attendance tracker with real-time
            bunk calculations, batch-wise schedule support, and predictive insights.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                }}
              >
                <CalendarCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>One-Click Attendance Logging</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Quick Present, Absent, Cancelled, or Proxy marking.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                }}
              >
                <TrendingUp size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Safe Bunk & Recovery Predictor</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Know exact classes you can skip or need to attend to stay safe.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Secure & Cloud-Sync Ready</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Protected account and seamless access across all your devices.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clerk SignIn Box */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              variables: {
                colorPrimary: '#6366f1',
                colorBackground: '#111827',
                colorInputBackground: '#0b1120',
                colorInputText: '#f8fafc',
                colorText: '#f8fafc',
                colorTextSecondary: '#94a3b8',
                borderRadius: '0.75rem',
              },
              elements: {
                card: {
                  backgroundColor: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                },
                headerTitle: {
                  color: '#f8fafc',
                },
                headerSubtitle: {
                  color: '#94a3b8',
                },
                socialButtonsBlockButton: {
                  backgroundColor: '#1f2937',
                  borderColor: '#374151',
                  color: '#f8fafc',
                },
                formButtonPrimary: {
                  backgroundColor: '#6366f1',
                  '&:hover': {
                    backgroundColor: '#4f46e5',
                  },
                },
                footerActionLink: {
                  color: '#818cf8',
                  '&:hover': {
                    color: '#a5b4fc',
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
