import type { Metadata, Viewport } from "next";
import { Overpass, Cabin, Gloria_Hallelujah } from "next/font/google";
import "./globals.css";

const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
});

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
});

const gloria = Gloria_Hallelujah({
  variable: "--font-gloria",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Momcar - Caronas entre Mães",
  description: "Plataforma de caronas seguras para mães do mesmo colégio.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

import { Providers } from "@/components/providers/providers";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${overpass.variable} ${cabin.variable} ${gloria.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
