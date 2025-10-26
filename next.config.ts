import type { NextConfig } from "next";

/*
const nextConfig: NextConfig = {
   config options here 
};
*/

const nextConfig = {
  output: "export",
  basePath: "cuda-indexer", // Change this to your repository name
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
