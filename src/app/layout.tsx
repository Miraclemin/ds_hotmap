import type { Metadata } from "next";
// 暂时禁用 next/font 以解决构建问题
// import { Inter } from "next/font/google";
import "./globals.css";

// 使用静态CSS类名替代字体载入
// const inter = Inter({ subsets: ["latin"] });
const interClass = "font-sans"; // 使用Tailwind默认字体

export const metadata: Metadata = {
  title: "DeepSeek中国部署热力图",
  description: "展示DeepSeek在中国各地的部署情况与影响力",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={interClass}>{children}</body>
    </html>
  );
}
