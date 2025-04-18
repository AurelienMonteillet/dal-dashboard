import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import JQueryLoader from './components/JQueryLoader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAL Dashboard',
  description: 'Tezos DAL Statistics Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JQueryLoader />
        {children}
      </body>
    </html>
  )
}
