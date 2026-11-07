import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
