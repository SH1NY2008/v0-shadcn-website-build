/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  allowedDevOrigins: ['192.168.86.78'],
};

module.exports = nextConfig;
