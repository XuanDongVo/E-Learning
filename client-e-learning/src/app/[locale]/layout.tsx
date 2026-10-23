import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "@/components/layout/toast";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import "../globals.css";

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
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC]">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
