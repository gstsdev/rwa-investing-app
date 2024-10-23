import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import ContextProviders from "@/context";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "RWA Investing DApp",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = (await headers()).get("cookie");

  return (
    <html lang="en">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <ContextProviders cookies={cookies}>{children}</ContextProviders>
      </body>
    </html>
  );
}
