'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Dashboard', href: '/', icon: '📊' },
    { label: 'New Bet', href: '/new-bet', icon: '🎯' },
    { label: 'Bet History', href: '/bets', icon: '📜' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ]

  return (
    <nav className="bg-dark-card border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-accent-green rounded-lg flex items-center justify-center">
                <span className="text-dark-bg font-bold text-base sm:text-lg">E</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">Edge Ledger</span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-white bg-dark-hover'
                        : 'text-text-secondary hover:text-white hover:bg-dark-hover'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-dark-hover rounded-lg border border-dark-border">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
              <span className="text-sm text-text-secondary">Live</span>
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-text-secondary hover:text-white hover:bg-dark-hover transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-dark-border bg-dark-card">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-dark-hover'
                      : 'text-text-secondary hover:text-white hover:bg-dark-hover'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
          <div className="px-4 pb-3">
            <div className="flex items-center space-x-2 px-4 py-2 bg-dark-hover rounded-lg border border-dark-border">
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
              <span className="text-sm text-text-secondary">Live Data Connected</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
