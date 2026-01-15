'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

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
  actualResult: string | null
  settledAt: string | null
  createdAt: string
  sportsbook?: {
    name: string
  }
}

type FilterStatus = 'all' | 'Pending' | 'Won' | 'Lost' | 'Push'

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [settling, setSettling] = useState(false)
  const [settleResult, setSettleResult] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('all')

  useEffect(() => {
    fetchBets()
  }, [])

  const fetchBets = async () => {
    try {
      const response = await fetch('/api/bets')
      if (response.ok) {
        const data = await response.json()
        setBets(data)
      }
    } catch (error) {
      console.error('Error fetching bets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettleBets = async () => {
    setSettling(true)
    setSettleResult(null)

    try {
      const response = await fetch('/api/bets/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.settledCount > 0) {
          const profitStr = data.bankrollChange >= 0 
            ? `+$${data.bankrollChange.toFixed(2)}` 
            : `-$${Math.abs(data.bankrollChange).toFixed(2)}`
          setSettleResult(`Settled ${data.settledCount} bet(s). Bankroll change: ${profitStr}`)
        } else {
          setSettleResult('No bets ready to settle. Games may still be in progress.')
        }
        fetchBets()
      } else {
        setSettleResult(`Error: ${data.error}`)
      }
    } catch (error) {
      setSettleResult('Failed to settle bets')
    } finally {
      setSettling(false)
    }
  }

  const filteredBets = bets.filter(bet => {
    if (filter === 'all') return true
    return bet.status === filter
  })

  const counts = {
    all: bets.length,
    Pending: bets.filter(b => b.status === 'Pending').length,
    Won: bets.filter(b => b.status === 'Won').length,
    Lost: bets.filter(b => b.status === 'Lost').length,
    Push: bets.filter(b => b.status === 'Push').length
  }

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

  const getProfitColor = (profit: number | null) => {
    if (profit === null) return 'text-text-muted'
    if (profit > 0) return 'text-accent-green'
    if (profit < 0) return 'text-red-400'
    return 'text-text-muted'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Bet History</h1>
          <p className="page-subtitle">View and manage all your bets</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSettleBets}
            disabled={settling || counts.Pending === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {settling ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Settling...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Settle Bets
              </>
            )}
          </button>
          <Link href="/new-bet" className="btn-primary">
            New Bet
          </Link>
        </div>
      </div>

      {settleResult && (
        <div className={`mb-6 p-4 rounded-lg border ${
          settleResult.includes('Error') || settleResult.includes('Failed')
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-accent-green/10 border-accent-green/30 text-accent-green'
        }`}>
          {settleResult}
        </div>
      )}

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-2">
            <FilterTab label="All" count={counts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterTab label="Pending" count={counts.Pending} active={filter === 'Pending'} onClick={() => setFilter('Pending')} />
            <FilterTab label="Won" count={counts.Won} active={filter === 'Won'} onClick={() => setFilter('Won')} />
            <FilterTab label="Lost" count={counts.Lost} active={filter === 'Lost'} onClick={() => setFilter('Lost')} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">Matchup</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">Prediction</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">Odds</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">Bet Size</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">Confidence</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">Status</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-sm">P/L</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <p className="text-text-muted mt-4">Loading bets...</p>
                  </td>
                </tr>
              ) : filteredBets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-text-muted text-lg mb-2">
                      {filter === 'all' ? 'No bets found' : `No ${filter.toLowerCase()} bets`}
                    </p>
                    <p className="text-text-muted text-sm mb-6">
                      {filter === 'all' ? 'Create your first bet to start tracking your performance' : 'Try a different filter'}
                    </p>
                    {filter === 'all' && (
                      <Link href="/new-bet" className="btn-primary">
                        Create Your First Bet
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                filteredBets.map((bet) => (
                  <tr key={bet.id} className="border-b border-dark-border/50 hover:bg-dark-hover/30">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white font-medium text-sm">
                          {bet.awayTeam} @ {bet.homeTeam}
                        </p>
                        <p className="text-text-muted text-xs mt-1">
                          {bet.sport} • {format(new Date(bet.gameDate), 'MMM d, yyyy')}
                        </p>
                        {bet.actualResult && (
                          <p className="text-text-secondary text-xs mt-1">
                            Final: {bet.actualResult}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-white text-sm">{bet.prediction}</p>
                        <p className="text-text-muted text-xs capitalize">{bet.betType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-accent-green font-medium text-sm">
                        {formatOdds(bet.odds)}
                      </span>
                      {bet.line !== null && (
                        <span className="text-text-muted text-xs ml-1">
                          ({bet.line > 0 ? '+' : ''}{bet.line})
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white text-sm">${bet.betSize.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-white text-sm">{bet.confidence}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bet.status)}`}>
                        {bet.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-medium text-sm ${getProfitColor(bet.profit)}`}>
                        {bet.profit !== null 
                          ? (bet.profit >= 0 ? `+$${bet.profit.toFixed(2)}` : `-$${Math.abs(bet.profit).toFixed(2)}`)
                          : '-'
                        }
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function FilterTab({ 
  label, 
  count, 
  active, 
  onClick 
}: { 
  label: string
  count: number
  active?: boolean
  onClick: () => void 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active 
          ? 'bg-dark-hover text-white' 
          : 'text-text-muted hover:text-white hover:bg-dark-hover'
      }`}
    >
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        active ? 'bg-dark-border text-white' : 'bg-dark-border text-text-muted'
      }`}>
        {count}
      </span>
    </button>
  )
}
