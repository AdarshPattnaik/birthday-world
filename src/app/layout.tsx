import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Happy Birthday Tannuuu 🎂",
  description: "A special birthday driving adventure for Tannu! Drive around and discover birthday surprises. 🎉🚗",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
