import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/tezos-logo.svg" />
      </head>
      <body
        className={`${inter.className} text-white`}
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(90deg, #0F61FF 0%, #9F329F 100%)',
        }}
      >
        <JQueryLoader />
        <header style={{ display: 'flex', alignItems: 'center', padding: '1rem 2rem', position: 'relative' }}>
          <img src="/tezos-logo-white.svg" alt="Tezos Logo" style={{ height: '40px', marginRight: '1rem' }} />
          <span style={{ fontWeight: 'normal', fontSize: '2rem', letterSpacing: '0.05em', fontFamily: 'inherit' }}>Tezos</span>
        </header>
        {children}
        <footer style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 2rem', fontSize: '1rem', background: 'transparent', color: 'white', marginTop: '2rem' }}>
          <div style={{ opacity: 0.8 }}>&copy; 2025 Nomadic Labs</div>
          <div style={{ opacity: 0.8 }}>
            Powered by <a href="https://tezos.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline', marginLeft: '0.3em' }}>Tezos</a>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
} 