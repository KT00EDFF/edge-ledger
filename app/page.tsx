import Link from 'next/link'

export default function Home() {
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
              value="$1,000.00" 
              change="+0.00%" 
              positive={true}
            />
            <StatCard 
              label="Total P/L" 
              value="$0.00" 
              change="0.00%" 
              positive={true}
            />
            <StatCard 
              label="Win Rate" 
              value="0%" 
              subtext="0/0 bets"
            />
            <StatCard 
              label="ROI" 
              value="0%" 
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
                <p className="text-text-muted text-sm">No data yet. Place your first bet to see performance charts.</p>
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
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-text-muted mb-4">No bets yet. Create your first bet to get started!</p>
              <Link href="/new-bet" className="btn-primary inline-block">
                Create New Bet
              </Link>
            </div>
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
                <span className="text-white font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Pending</span>
                <span className="badge-yellow">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Won</span>
                <span className="badge-green">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Lost</span>
                <span className="badge-red">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Avg. Confidence</span>
                <span className="text-white font-medium">-</span>
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
                <p className="text-text-secondary text-sm">Get predictions powered by GPT-4 with real-time odds from top sportsbooks.</p>
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
  positive 
}: { 
  label: string
  value: string
  change?: string
  subtext?: string
  positive?: boolean
}) {
  return (
    <div className="card">
      <p className="stat-label mb-1">{label}</p>
      <p className="stat-value">{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${positive ? 'positive' : 'negative'}`}>
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
