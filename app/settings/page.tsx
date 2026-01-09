'use client'

import { useState } from 'react'

// Mock user settings - in production, fetch from database
const INITIAL_SETTINGS = {
  startingBankroll: 1000,
  currentBankroll: 1000,
  minBetSize: 10,
  maxBetSize: 500,
  useKellyCriterion: false,
}

const AVAILABLE_SPORTSBOOKS = [
  { id: 'draftkings', name: 'DraftKings' },
  { id: 'fanduel', name: 'FanDuel' },
  { id: 'betmgm', name: 'BetMGM' },
  { id: 'caesars', name: 'Caesars' },
  { id: 'pointsbet', name: 'PointsBet' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS)
  const [selectedBooks, setSelectedBooks] = useState(['draftkings', 'fanduel', 'betmgm'])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : parseFloat(e.target.value)
    setSettings({
      ...settings,
      [e.target.name]: value,
    })
  }

  const toggleSportsbook = (bookId: string) => {
    if (selectedBooks.includes(bookId)) {
      setSelectedBooks(selectedBooks.filter((id) => id !== bookId))
    } else {
      setSelectedBooks([...selectedBooks, bookId])
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSaveMessage('✅ Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('❌ Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your bankroll and betting preferences</p>
      </div>

      <div className="space-y-6">
        {/* Bankroll Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Bankroll Management</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="startingBankroll" className="block text-sm font-medium text-gray-700 mb-2">
                Starting Bankroll
              </label>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">$</span>
                <input
                  type="number"
                  id="startingBankroll"
                  name="startingBankroll"
                  value={settings.startingBankroll}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  step="10"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currentBankroll" className="block text-sm font-medium text-gray-700 mb-2">
                Current Bankroll (Display Only)
              </label>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">$</span>
                <input
                  type="number"
                  id="currentBankroll"
                  name="currentBankroll"
                  value={settings.currentBankroll}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Updated automatically based on bet results</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minBetSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Bet Size
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">$</span>
                  <input
                    type="number"
                    id="minBetSize"
                    name="minBetSize"
                    value={settings.minBetSize}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="5"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxBetSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Bet Size
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">$</span>
                  <input
                    type="number"
                    id="maxBetSize"
                    name="maxBetSize"
                    value={settings.maxBetSize}
                    onChange={handleChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    step="10"
                    min={settings.minBetSize}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="useKellyCriterion"
                name="useKellyCriterion"
                checked={settings.useKellyCriterion}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useKellyCriterion" className="ml-2 block text-sm text-gray-700">
                Use Kelly Criterion for bet sizing
              </label>
            </div>
            <p className="text-sm text-gray-500">
              When enabled, bet sizes are calculated using the Kelly Criterion formula based on odds and confidence level.
            </p>
          </div>
        </div>

        {/* Sportsbooks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Sportsbooks</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select the sportsbooks where you have accounts. The app will find the best odds from these books.
          </p>
          <div className="space-y-3">
            {AVAILABLE_SPORTSBOOKS.map((book) => (
              <div
                key={book.id}
                onClick={() => toggleSportsbook(book.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedBooks.includes(book.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{book.name}</span>
                  {selectedBooks.includes(book.id) && (
                    <span className="text-blue-600 font-semibold">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Configuration Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">API Configuration</h3>
          <p className="text-sm text-yellow-800 mb-2">
            API keys are configured via environment variables in <code className="bg-yellow-100 px-1 rounded">.env.local</code>
          </p>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>
              <strong>OPENAI_API_KEY:</strong> {process.env.OPENAI_API_KEY ? '✅ Configured' : '⚠️  Not configured (using mock data)'}
            </li>
            <li>
              <strong>ODDS_API_KEY:</strong> {process.env.ODDS_API_KEY ? '✅ Configured' : '⚠️  Not configured (using mock data)'}
            </li>
          </ul>
        </div>

        {/* Save Button */}
        <div>
          {saveMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
              {saveMessage}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
