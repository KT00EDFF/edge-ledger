import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Edge Ledger - Sports Betting Analytics',
  description: 'AI-powered sports betting analytics and prediction platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-bg">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
