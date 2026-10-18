import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MVP에서는 Cache Components를 끈다 (쿠키를 읽는 페이지마다 Suspense가 필요해져 복잡해짐)
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
