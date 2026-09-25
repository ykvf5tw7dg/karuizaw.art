import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "轻井泽国际艺术村｜在自然中创作，在艺术中相遇",
  description: "首批招募100位各类艺术家，目标每年支持30–50位艺术家驻留。欢迎艺术家、赞助伙伴及别墅空间参与共建。版权归属轻井泽国际艺术中心（筹）。",
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
