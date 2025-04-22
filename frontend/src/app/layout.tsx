'use client';

import './globals.css';
import { Inter } from 'next/font/google';

// Google Fonts
const inter = Inter({ subsets: ['latin'] });

// Page metadata
export const metadata = {
  title: 'Tezos DAL Dashboard',
  description: 'Dashboard for Data Availability Layer (DAL) participation on the Tezos network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Include jQuery to allow for additional functionality later */}
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" defer></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
