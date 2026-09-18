import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnUp - English Learning Platform",
  description: "Modern, interactive English learning web application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">
        <QueryProvider><AuthProvider>{children}</AuthProvider></QueryProvider>
      </body>
    </html>
  );
}
