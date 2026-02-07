import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskFlow — 개인 할일 & 프로젝트 관리",
  description:
    "프로젝트별 칸반 보드로 할일을 직관적으로 관리하세요. 드래그 앤 드롭, 우선순위, 마감일 관리까지.",
  keywords: ["할일 관리", "칸반 보드", "프로젝트 관리", "task management", "kanban"],
  authors: [{ name: "TaskFlow" }],
  openGraph: {
    title: "TaskFlow — 당신의 할일을 흐름으로",
    description: "개인 프로젝트를 칸반 보드로 관리하세요. 무료.",
    type: "website",
    locale: "ko_KR",
    siteName: "TaskFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow — Personal Task Management",
    description: "개인 프로젝트를 칸반 보드로 관리하세요.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
