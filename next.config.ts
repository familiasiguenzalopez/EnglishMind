import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El linting se activará en una iteración posterior (Fase 0 cierre).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
