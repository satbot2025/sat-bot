// Next.js config with PWA (simple service worker via runtime caching can be added later)
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '127.0.0.1:3000', 'www.sat-bot.com']
    }
  }
};
export default nextConfig;
