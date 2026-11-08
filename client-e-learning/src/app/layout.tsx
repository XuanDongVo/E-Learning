import type { Metadata } from "next";
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
    <html
      lang="vi"
      className="h-full antialiased notranslate"
      translate="no"
      data-scroll-behavior="smooth"
    >
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-full flex flex-col notranslate" translate="no">
        {children}
      </body>
    </html>
  );
}

