import type { Metadata } from "next";
import { Geist } from "next/font/google";
import AuthSessionRescue from "./_components/AuthSessionRescue";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CommonGround NYC",
  description: "Free and low-cost events at NYC libraries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-stone-50 font-sans">
        <AuthSessionRescue />
        {children}
      </body>
    </html>
  );
}
