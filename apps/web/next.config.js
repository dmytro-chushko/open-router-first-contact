/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  // Dev server from another host (e.g. phone on LAN): add http://<PC-IP>:3000
  allowedDevOrigins: ['http://172.18.240.1:3000'],
};

export default nextConfig;
