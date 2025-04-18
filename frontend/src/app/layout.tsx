import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import JQueryLoader from "./components/JQueryLoader";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tezos DAL-o-meter",
  description: "Dashboard for monitoring Tezos DAL adoption metrics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <JQueryLoader />
        {children}
      </body>
    </html>
  );
}
