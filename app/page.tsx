import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Track your betting performance and analytics</p>
      </div>

      {/* Placeholder for metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Current Bankroll</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">$1,000.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Total P/L</p>
          <p className="text-3xl font-bold text-green-600 mt-2">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">Win Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm font-medium text-gray-600">ROI</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0%</p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
        <p className="text-gray-600 mb-4">
          Welcome to Edge Ledger! Start by creating your first prediction and bet.
        </p>
        <Link
          href="/new-bet"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Bet
        </Link>
      </div>

      {/* Recent Bets Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Bets</h2>
        <p className="text-gray-500 text-center py-8">No bets yet. Create your first bet to get started!</p>
      </div>
    </div>
  )
}
