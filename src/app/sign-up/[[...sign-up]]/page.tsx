import { SignUp } from '@clerk/nextjs';
import { Sparkles, CalendarCheck, ShieldCheck, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Sign Up — AttendAI',
  description: 'Create an account on AttendAI to track your attendance and timetable.',
};

export default function SignUpPage() {
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
            Join AttendAI and{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              stay in control
            </span>{' '}
            of your semester.
          </h1>

          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Set up in seconds. Scan your timetable image and let AI calculate your attendance margin,
            safe bunks, and class goals automatically.
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
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI Timetable Extraction</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Upload photos, PDFs, or screenshots of your college routine.
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
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Automated Bunk Targets</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Never do mental math again before deciding whether to attend a lecture.
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
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Private & Secure</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Industry-grade Clerk authentication to keep your records safe.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Clerk SignUp Box */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
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
