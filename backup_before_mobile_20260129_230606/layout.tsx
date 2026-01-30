import { BannedGuard } from "@/components/BannedGuard";

import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "TREXAI",
  description: "TREXAI Chat",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden antialiased">
        <BannedGuard>{children}
      </BannedGuard>

      </body>
    </html>
  );
}
