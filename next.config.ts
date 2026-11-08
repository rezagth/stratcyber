import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
