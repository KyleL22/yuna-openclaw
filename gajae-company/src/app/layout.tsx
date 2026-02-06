import type { Metadata } from "next";
import "./globals.css";
import { GNB } from "@/common/component/gnb";

export const metadata: Metadata = {
  title: "GAJAE-BIP | Sanctuary Archive",
  description: "The official archive of the Gajae Sanctuary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <GNB />
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
