/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow processing timetable image uploads up to 10MB
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
