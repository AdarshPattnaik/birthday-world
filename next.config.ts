import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@dimforge/rapier3d-compat'],
  turbopack: {},
};

export default nextConfig;
