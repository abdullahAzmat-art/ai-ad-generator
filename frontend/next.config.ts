import type { NextConfig } from "next";

// Single source of truth for the backend origin — override with BACKEND_URL
// in .env (see .env.example). Every /api/* call in the app is proxied here.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Proxy /api/* from the browser to the Express backend, so the frontend only
  // ever calls same-origin paths and no CORS setup is needed.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
  experimental: {
    // The scrape/resume pipeline can run for minutes (Firecrawl + LLM +
    // JSON2Video render); the default 30s proxy timeout would abort it.
    proxyTimeout: 600000,
  },
};

export default nextConfig;
