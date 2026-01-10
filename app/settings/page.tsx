'use client'

import { useState } from 'react'

const INITIAL_SETTINGS = {
  startingBankroll: 1000,
  currentBankroll: 1000,
  minBetSize: 10,
  maxBetSize: 500,
  useKellyCriterion: false,
}

const AVAILABLE_SPORTSBOOKS = [
  { id: 'draftkings', name: 'DraftKings', logo: 'DK' },
  { id: 'fanduel', name: 'FanDuel', logo: 'FD' },
  { id: 'betmgm', name: 'BetMGM', logo: 'BM' },
  { id: 'caesars', name: 'Caesars', logo: 'CS' },
  { id: 'pointsbet', name: 'PointsBet', logo: 'PB' },
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure your bankroll and betting preferences</p>
      </div>

      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Bankroll Management</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="startingBankroll" className="label-dark">
                Starting Bankroll
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <input
                  type="number"
                  id="startingBankroll"
                  name="startingBankroll"
                  value={settings.startingBankroll}
                  onChange={handleChange}
                  className="input-dark pl-8"
                  step="10"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="currentBankroll" className="label-dark">
                Current Bankroll
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <input
                  type="number"
                  id="currentBankroll"
                  name="currentBankroll"
                  value={settings.currentBankroll}
                  readOnly
                  className="input-dark pl-8 bg-dark-hover cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-text-muted mt-2">Updated automatically based on bet results</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="minBetSize" className="label-dark">
                  Minimum Bet Size
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    type="number"
                    id="minBetSize"
                    name="minBetSize"
                    value={settings.minBetSize}
                    onChange={handleChange}
                    className="input-dark pl-8"
                    step="5"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxBetSize" className="label-dark">
                  Maximum Bet Size
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    type="number"
                    id="maxBetSize"
                    name="maxBetSize"
                    value={settings.maxBetSize}
                    onChange={handleChange}
                    className="input-dark pl-8"
                    step="10"
                    min={settings.minBetSize}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  id="useKellyCriterion"
                  name="useKellyCriterion"
                  checked={settings.useKellyCriterion}
                  onChange={handleChange}
                  className="w-5 h-5 rounded bg-dark-card border-dark-border text-accent-green focus:ring-accent-green focus:ring-offset-dark-bg"
                />
              </div>
              <div>
                <label htmlFor="useKellyCriterion" className="text-white font-medium cursor-pointer">
                  Use Kelly Criterion for bet sizing
                </label>
                <p className="text-sm text-text-muted mt-1">
                  Calculate optimal bet sizes based on odds and confidence level
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-2">My Sportsbooks</h2>
          <p className="text-text-secondary mb-6">
            Select the sportsbooks where you have accounts. We'll find the best odds from these books.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_SPORTSBOOKS.map((book) => {
              const isSelected = selectedBooks.includes(book.id)
              return (
                <button
                  key={book.id}
                  onClick={() => toggleSportsbook(book.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-dark-border hover:border-text-muted bg-dark-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-accent-green text-dark-bg' : 'bg-dark-border text-text-secondary'
                      }`}>
                        {book.logo}
                      </div>
                      <span className={`font-medium ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
                        {book.name}
                      </span>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-accent-green" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border-accent-blue/30">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">API Configuration</h3>
              <p className="text-text-secondary text-sm mb-3">
                API keys are configured via environment variables for security.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span className="text-sm text-text-secondary">OpenAI API: Configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span className="text-sm text-text-secondary">Odds API: Configured</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saveMessage && (
            <div className={`flex items-center space-x-2 ${saveMessage.includes('Failed') ? 'text-accent-red' : 'text-accent-green'}`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{saveMessage}</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
