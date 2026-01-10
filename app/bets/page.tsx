import Link from 'next/link'

export default function BetsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Bet History</h1>
          <p className="page-subtitle">View and manage all your bets</p>
        </div>
        <Link href="/new-bet" className="btn-primary">
          New Bet
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-2">
            <FilterTab label="All" count={0} active />
            <FilterTab label="Pending" count={0} />
            <FilterTab label="Won" count={0} />
            <FilterTab label="Lost" count={0} />
          </div>
          <div className="flex items-center space-x-3">
            <select className="input-dark py-2 px-3 w-auto">
              <option value="">All Sports</option>
              <option value="NFL">NFL</option>
              <option value="NBA">NBA</option>
              <option value="MLB">MLB</option>
              <option value="NHL">NHL</option>
            </select>
            <select className="input-dark py-2 px-3 w-auto">
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
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
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-text-muted text-lg mb-2">No bets found</p>
                  <p className="text-text-muted text-sm mb-6">Create your first bet to start tracking your performance</p>
                  <Link href="/new-bet" className="btn-primary">
                    Create Your First Bet
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function FilterTab({ label, count, active }: { label: string; count: number; active?: boolean }) {
  return (
    <button 
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
