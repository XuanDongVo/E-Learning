import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";
import { Toaster } from "@/components/layout/toast";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/dist/client/components/navigation";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
  title: "LearnUp - English Learning Platform",
  description: "Modern, interactive English learning web application",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <html className="h-full antialiased">
        <body className="min-h-full flex flex-col bg-[#F8FAFC]">
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </NextIntlClientProvider>
  );
}
