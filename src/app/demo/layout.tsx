import type { Metadata } from "next";
import "@/styles/vnexpress.css";

export const metadata: Metadata = {
  title: "Tin tức Vật liệu Xây dựng",
  description: "Cập nhật tin tức mới nhất về vật liệu xây dựng, giá cả thị trường, công nghệ xây dựng",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, background: "#f5f5f5", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
