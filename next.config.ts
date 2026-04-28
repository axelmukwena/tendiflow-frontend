// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  // Add security headers
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // {
          //   key: "Cache-Control",
          //   value: "no-cache, no-store",
          // },
          // {
          //   key: "Content-Security-Policy",
          //   value:
          //     "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.miro.com https://*.sentry.io https://cdnjs.cloudflare.com; connect-src 'self' https://api.miro.com https://*.sentry.io; img-src 'self' data: blob: https://storage.googleapis.com https://cdn.miro.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self'; frame-src 'self' https://miro.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://miro.com",
          // },
          // {
          //   key: "Permissions-Policy",
          //   value:
          //     "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          // },
        ],
      },
    ];
  },
};

export default nextConfig;
