import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-primary",
  subsets: ["latin", "thai"],
});

export const metadata: Metadata = {
  title: "HuntPass",
  description: "Scavenger Hunt Platform for Animacode City",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${kanit.variable} font-primary min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
