/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config) => {
    // 增强模块解析配置
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
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
  // 确保输出目录设置正确
  distDir: '.next',
};

module.exports = nextConfig; 