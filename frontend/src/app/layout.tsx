import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Title fonts
const orbitron = Orbitron({
  variable: "--font-orbitron",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fishy",
  description: "Fishy is a fish tracking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${rajdhani.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
