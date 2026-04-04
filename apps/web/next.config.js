/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/ui'],
  // Запити до dev-сервера з іншого host (телефон у LAN): додайте http://<IP-ПК>:3000
  allowedDevOrigins: ['http://172.18.240.1:3000'],
};

export default nextConfig;
