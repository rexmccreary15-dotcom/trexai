import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import AuthProvider from "@/components/AuthProvider";
import HeartbeatProvider from "@/components/HeartbeatProvider";
import { BannedGuard } from "@/components/BannedGuard";

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
        <BannedGuard>
          <AuthProvider>
            <Suspense fallback={<div className="p-4 text-center text-gray-400">Loading...</div>}>
              <HeartbeatProvider>{children}</HeartbeatProvider>
            </Suspense>
          </AuthProvider>
        </BannedGuard>
      </body>
    </html>
  );
}
