import type {NextConfig} from "next";
const nextConfig:NextConfig={output:"standalone",serverExternalPackages:["node:sqlite"],experimental:{cpus:2},poweredByHeader:false};
export default nextConfig;
