import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El linting se activará en una iteración posterior (Fase 0 cierre).
  eslint: { ignoreDuringBuilds: true },
};

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Desactivado en dev para evitar problemas de caché al desarrollar.
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
