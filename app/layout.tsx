import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "퍼널별 미션 & KPI 대시보드",
  description: "마케팅 퍼널 KPI 추적 및 업무 관리 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
