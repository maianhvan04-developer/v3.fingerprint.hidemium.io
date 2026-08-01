import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Vercel Services routes the frontend through a service rewrite. In this
    // setup the Next image optimizer endpoint (`/_next/image`) is not exposed
    // and returns 404, even though the source images exist. Serve the original
    // image URLs so local public assets and Vercel Blob assets render normally.
    unoptimized: process.env.VERCEL === "1",
    // Product images are served by the local Express backend from
    // backend/public/uploads during development.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "nikolas.vn",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.vietqr.io",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "cdn.vietqr.io",
        pathname: "/img/**",
      },
      {
        protocol: "https",
        hostname: "0jkvp5gzimglp6ji.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  output: "standalone",
};

export default nextConfig;
