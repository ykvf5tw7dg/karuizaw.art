import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "轻井泽国际禅修营｜在轻井泽，留一段时间静下来。",
  description: "在轻井泽的森林与四季之间，支持个人与团体禅修驻留，让阅读、绘画、书法、闻香、插花与品茶融入静心生活。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
