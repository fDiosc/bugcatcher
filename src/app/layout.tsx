import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BugCatcherWidget } from "@bugcatcher/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BugCatcher",
  description: "Intelligent bug capture with session replay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <BugCatcherWidget apiKey="bc_3d92c3e3" />
      </body>
    </html>
  );
}
