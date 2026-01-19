'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

interface User {
  id: string
  startingBankroll: number
  currentBankroll: number
}

interface Bet {
  id: string
  sport: string
  homeTeam: string
  awayTeam: string
  gameDate: string
  prediction: string
  confidence: number
  betType: string
  odds: number
  line: number | null
  betSize: number
  potentialPayout: number
  status: string
  profit: number | null
  createdAt: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, betsRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/bets?userId=default-user')
        ])
        
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }
        
        if (betsRes.ok) {
          const betsData = await betsRes.json()
          setBets(betsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const settledBets = bets.filter(b => b.status === 'Won' || b.status === 'Lost' || b.status === 'Push')
  const wonBets = bets.filter(b => b.status === 'Won')
  const lostBets = bets.filter(b => b.status === 'Lost')
  const pendingBets = bets.filter(b => b.status === 'Pending')
  
  const totalPL = settledBets.reduce((sum, b) => sum + (b.profit || 0), 0)
  const winRate = settledBets.length > 0 ? (wonBets.length / settledBets.length) * 100 : 0
  const totalWagered = settledBets.reduce((sum, b) => sum + b.betSize, 0)
  const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0
  const avgConfidence = bets.length > 0 
    ? bets.reduce((sum, b) => sum + b.confidence, 0) / bets.length 
    : 0

  const currentBankroll = user?.currentBankroll || 1000
  const startingBankroll = user?.startingBankroll || 1000
  const bankrollChange = ((currentBankroll - startingBankroll) / startingBankroll) * 100

  const recentBets = bets.slice(0, 5)

  const formatOdds = (odds: number) => {
    if (odds > 0) return `+${odds}`
    return odds.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Won': return 'text-accent-green bg-accent-green/20'
      case 'Lost': return 'text-red-400 bg-red-400/20'
      case 'Push': return 'text-yellow-400 bg-yellow-400/20'
      default: return 'text-accent-blue bg-accent-blue/20'
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track your betting performance and analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Current Bankroll" 
              value={`$${currentBankroll.toFixed(2)}`}
              change={`${bankrollChange >= 0 ? '+' : ''}${bankrollChange.toFixed(2)}%`}
              positive={bankrollChange >= 0}
            />
            <StatCard
              label="Total P/L"
              value={`${totalPL >= 0 ? '+' : ''}$${Math.abs(totalPL).toFixed(2)}`}
              positive={totalPL >= 0}
              colorValue
            />
            <StatCard 
              label="Win Rate" 
              value={`${winRate.toFixed(0)}%`}
              subtext={`${wonBets.length}/${settledBets.length} bets`}
            />
            <StatCard 
              label="ROI" 
              value={`${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`}
              subtext="All time"
            />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Bankroll Performance</h2>
              <div className="flex items-center space-x-2">
                <TimeFilter label="1D" active />
                <TimeFilter label="1W" />
                <TimeFilter label="1M" />
                <TimeFilter label="1Y" />
                <TimeFilter label="All" />
              </div>
            </div>
            <div className="h-64 flex items-center justify-center border border-dark-border rounded-lg bg-dark-bg">
              <div className="text-center">
                <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <p className="text-text-muted text-sm">
                  {settledBets.length === 0 
                    ? 'No settled bets yet. Settle your bets to see performance charts.'
                    : 'Performance chart coming soon'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Recent Bets</h2>
              <Link href="/bets" className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors">
                View All
              </Link>
            </div>
            {recentBets.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-text-muted mb-4">No bets yet. Create your first bet to get started!</p>
                <Link href="/new-bet" className="btn-primary inline-block">
                  Create New Bet
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBets.map((bet) => (
                  <div key={bet.id} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {bet.awayTeam} @ {bet.homeTeam}
                      </p>
                      <p className="text-text-muted text-xs">
                        {bet.sport} • {bet.prediction} • {formatOdds(bet.odds)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white text-sm">${bet.betSize.toFixed(2)}</p>
                        <p className="text-text-muted text-xs">{format(new Date(bet.gameDate), 'MMM d')}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/new-bet" 
                className="flex items-center justify-between p-3 bg-dark-hover rounded-lg hover:bg-dark-border transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">New Bet</p>
                    <p className="text-text-muted text-sm">Create AI prediction</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link 
                href="/bets" 
                className="flex items-center justify-between p-3 bg-dark-hover rounded-lg hover:bg-dark-border transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Bet History</p>
                    <p className="text-text-muted text-sm">View all bets</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Betting Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Total Bets</span>
                <span className="text-white font-medium">{bets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Pending</span>
                <span className="badge-yellow">{pendingBets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Won</span>
                <span className="badge-green">{wonBets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Lost</span>
                <span className="badge-red">{lostBets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Avg. Confidence</span>
                <span className="text-white font-medium">
                  {bets.length > 0 ? `${avgConfidence.toFixed(0)}%` : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent-green/10 to-transparent border-accent-green/30">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">AI-Powered</h3>
                <p className="text-text-secondary text-sm">Get predictions powered by Gemini AI with real-time odds from top sportsbooks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  change,
  subtext,
  positive,
  colorValue
}: {
  label: string
  value: string
  change?: string
  subtext?: string
  positive?: boolean
  colorValue?: boolean
}) {
  return (
    <div className="card">
      <p className="stat-label mb-1">{label}</p>
      <p className={`stat-value ${colorValue ? (positive ? 'text-accent-green' : 'text-red-400') : ''}`}>
        {value}
      </p>
      {change && (
        <p className={`text-sm mt-1 ${positive ? 'text-accent-green' : 'text-red-400'}`}>
          {change}
        </p>
      )}
      {subtext && (
        <p className="text-sm text-text-muted mt-1">{subtext}</p>
      )}
    </div>
  )
}

function TimeFilter({ label, active }: { label: string; active?: boolean }) {
  return (
    <button 
      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
        active 
          ? 'bg-dark-hover text-white' 
          : 'text-text-muted hover:text-white hover:bg-dark-hover'
      }`}
    >
      {label}
    </button>
  )
}
