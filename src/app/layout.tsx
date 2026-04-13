import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { InstallPrompt } from "@/components/install-prompt";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  title: "Prayer App",
  description: "Post a prayer. Get prayed for.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Prayer",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="bg-cream text-gray-900 min-h-full flex flex-col">
        <Providers>
          {children}
          <InstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
