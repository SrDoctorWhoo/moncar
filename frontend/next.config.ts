import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  disable: false, // temporarily enabled in dev so the user can see the install button
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withPWA(nextConfig);
