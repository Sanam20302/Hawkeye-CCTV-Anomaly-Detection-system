import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Smart CCTV",
  description: "AI-Powered Anomaly Detection System",
};

import { AuthProvider } from "@/context/AuthContext";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-hidden`}
      >
        <AuthProvider>
          <AuthenticatedLayout>
            {children}
          </AuthenticatedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
