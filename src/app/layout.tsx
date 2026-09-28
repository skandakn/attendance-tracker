import type { Metadata } from 'next';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { AttendanceProvider } from '@/context/AttendanceContext';
import ToastContainer from '@/components/common/ToastContainer';

export const metadata: Metadata = {
  title: 'AttendAI — AI-Powered Attendance Calculator & Tracker',
  description:
    'Turn your college timetable image into a personalized attendance tracker with automatic 75% calculations, smart insights, and batch support.',
  keywords: [
    'attendance calculator',
    '75 percent attendance',
    'college timetable scanner',
    'AI attendance tracker',
    'bunk calculator',
    'university attendance',
  ],
};

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  'pk_test_ZGlzdGluY3QtbW9yYXktODE3OC5jbGVyay5hY2NvdW50cy5kZXYk';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <html lang="en" className="dark">
        <body>
          <AttendanceProvider>
            {children}
            <ToastContainer />
          </AttendanceProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
