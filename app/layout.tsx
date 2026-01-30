// revert-mobile
import { BannedGuard } from "@/components/BannedGuard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TREXAI",
  description: "TREXAI Chat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <BannedGuard>{children}
      </BannedGuard>

      </body>
    </html>
  );
}
