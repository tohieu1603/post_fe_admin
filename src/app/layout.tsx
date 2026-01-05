import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import "@/styles/animations.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Quản lý Bài viết",
  description: "Hệ thống quản lý bài viết và danh mục",
};

// Suppress WebSocket HMR errors in production
const suppressHmrScript = `
  if (typeof window !== 'undefined') {
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args[0]?.toString() || '';
      if (
        msg.includes('webpack-hmr') ||
        msg.includes('WebSocket') ||
        msg.includes('_next/webpack') ||
        msg.includes('_nextjs_original-stack-frames')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    // Suppress unhandled WebSocket errors
    window.addEventListener('error', (e) => {
      if (e.message?.includes('WebSocket') || e.filename?.includes('webpack-hmr')) {
        e.preventDefault();
        return false;
      }
    });
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <Script
          id="suppress-hmr-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: suppressHmrScript }}
        />
      </head>
      <body>
        <AntdRegistry>
          {children}
        </AntdRegistry>
      </body>
    </html>
  );
}
