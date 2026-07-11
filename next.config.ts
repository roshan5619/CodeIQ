import type { NextConfig } from "next";

import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // A stray lockfile higher up the tree makes Next mis-infer the workspace
    // root; pin it to this project.
    root: path.join(__dirname),
  },
};

export default nextConfig;
