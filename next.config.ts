import type { NextConfig } from "next";

// En-têtes de sécurité sur toutes les réponses. La CSP stricte est à étudier à part (scripts inline de Next).
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  // Chromium embarqué : ne doit pas être empaqueté par le bundler (sinon le PDF échoue sur Vercel).
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // ESLint reste non bloquant : ~230 erreurs de style (apostrophes JSX, any) à résorber progressivement.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Les erreurs de type bloquent désormais le build (elles étaient ignorées et masquaient de vrais bugs).
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
