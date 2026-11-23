import type { NextConfig } from "next"

const isDev = process.env.NODE_ENV !== "production"
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Next.js needs inline scripts for its own bootstrapping, so scripts allow 'unsafe-inline'.
// Everything else is locked to this site, the API and the font host.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:" + (isDev ? " http://localhost:5000" : ""),
  `connect-src 'self' ${apiUrl}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'"
].join("; ")

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "Content-Security-Policy", value: csp }
        ]
      }
    ]
  }
}

export default nextConfig
