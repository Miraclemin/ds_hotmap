/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  eslint: {
    // 在生产构建期间忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 在生产构建期间忽略TypeScript错误
    ignoreBuildErrors: true,
  },
  experimental: {
    // 禁用部分可能导致问题的实验性功能
    serverComponentsExternalPackages: [],
    optimizeCss: false,
  },
  // 确保使用SWC编译器
  swcMinify: true,
  // 禁用Babel
  compiler: {
    emotion: false,
    reactRemoveProperties: false,
    removeConsole: false,
    styledComponents: false,
  },
  // 确保输出目录设置正确
  distDir: '.next',
};

module.exports = nextConfig; 