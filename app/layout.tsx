import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TREXAI",
  description: "Chat with multiple AI providers including ChatGPT, Gemini, and Claude",
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
