import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import AuthProvider from "@/components/AuthProvider";
import HeartbeatProvider from "@/components/HeartbeatProvider";

export const metadata: Metadata = {
  title: "TREXAI",
  description: "Chat with multiple AI providers including ChatGPT, Gemini, and Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
          <AuthProvider>
            <HeartbeatProvider>{children}</HeartbeatProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
