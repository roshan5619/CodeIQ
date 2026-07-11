import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // A stray lockfile higher up the tree makes Next mis-infer the workspace
    // root; pin it to this project.
    root: process.cwd(),
  },
};

export default nextConfig;
