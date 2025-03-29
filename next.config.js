/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  distDir: ".output", // This moves .next/ outside of public/
  output: "export", // Ensures Next.js exports static files for Cloudflare
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
};

module.exports = nextConfig;
