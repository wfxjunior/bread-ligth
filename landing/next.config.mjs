/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Landing is static-friendly; no server data. Keeps Vercel deploy trivial.
};
export default nextConfig;
