/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow processing timetable image uploads up to 10MB
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      'pk_test_ZGlzdGluY3QtbW9yYXktODE3OC5jbGVyay5hY2NvdW50cy5kZXYk',
    CLERK_SECRET_KEY:
      process.env.CLERK_SECRET_KEY ||
      'sk_test_a8lVLmDeLX14avuEBTExi6kXO5naAbA0TWvb8UiGpj',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/',
  },
};

export default nextConfig;

