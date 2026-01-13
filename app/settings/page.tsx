'use client'

import { useState, useEffect } from 'react'
import { AVAILABLE_SPORTSBOOKS, DEFAULT_SELECTED_BOOKS } from '@/lib/sportsbooks'

interface Settings {
  startingBankroll: number
  currentBankroll: number
  minBetSize: number
  maxBetSize: number
  useKellyCriterion: boolean
}

function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return {
      startingBankroll: 1000,
      currentBankroll: 1000,
      minBetSize: 10,
      maxBetSize: 500,
      useKellyCriterion: false,
    }
  }
  
  const saved = localStorage.getItem('edgeLedgerSettings')
  if (saved) {
    return JSON.parse(saved)
  }
  return {
    startingBankroll: 1000,
    currentBankroll: 1000,
    minBetSize: 10,
    maxBetSize: 500,
    useKellyCriterion: false,
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    startingBankroll: 1000,
    currentBankroll: 1000,
    minBetSize: 10,
    maxBetSize: 500,
    useKellyCriterion: false,
  })
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [addFundsAmount, setAddFundsAmount] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loaded = loadSettings()
    setSettings(loaded)
    
    const savedBooks = localStorage.getItem('edgeLedgerSportsbooks')
    if (savedBooks) {
      setSelectedBooks(JSON.parse(savedBooks))
    } else {
      setSelectedBooks(DEFAULT_SELECTED_BOOKS)
    }
    
    setIsLoaded(true)
    
    if (loaded.currentBankroll <= 0) {
      setShowAddFundsModal(true)
    }
  }, [])

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
      const existingSettings = localStorage.getItem('edgeLedgerSettings')
      let updatedSettings = { ...settings }
      
      if (!existingSettings) {
        updatedSettings.currentBankroll = settings.startingBankroll
      }
      
      localStorage.setItem('edgeLedgerSettings', JSON.stringify(updatedSettings))
      localStorage.setItem('edgeLedgerSportsbooks', JSON.stringify(selectedBooks))
      
      setSettings(updatedSettings)
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddFunds = () => {
    const amount = parseFloat(addFundsAmount)
    if (amount > 0) {
      const newSettings = {
        ...settings,
        startingBankroll: amount,
        currentBankroll: amount,
      }
      setSettings(newSettings)
      localStorage.setItem('edgeLedgerSettings', JSON.stringify(newSettings))
      setShowAddFundsModal(false)
      setAddFundsAmount('')
      setSaveMessage('Funds added successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-card rounded w-32 mb-4"></div>
          <div className="h-4 bg-dark-card rounded w-64 mb-8"></div>
          <div className="card h-64"></div>
        </div>
      </div>
    )
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
              <p className="text-sm text-text-muted mt-2">
                This is your initial bankroll amount. Your current balance of{' '}
                <span className={`font-semibold ${settings.currentBankroll > 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  ${settings.currentBankroll.toFixed(2)}
                </span>{' '}
                updates automatically based on bet results.
              </p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {AVAILABLE_SPORTSBOOKS.map((book) => {
              const isSelected = selectedBooks.includes(book.id)
              return (
                <button
                  key={book.id}
                  onClick={() => toggleSportsbook(book.id)}
                  className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-dark-border hover:border-text-muted bg-dark-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm ${
                        isSelected ? 'bg-accent-green text-dark-bg' : 'bg-dark-border text-text-secondary'
                      }`}>
                        {book.logo}
                      </div>
                      <span className={`font-medium text-xs sm:text-sm ${isSelected ? 'text-white' : 'text-text-secondary'}`}>
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

      {showAddFundsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowAddFundsModal(false)} />
          
          <div className="relative bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-4 sm:p-6 mx-2 sm:mx-0">
            <button
              onClick={() => setShowAddFundsModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent-red/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Bankroll Empty</h2>
              <p className="text-text-secondary text-sm">
                Your current bankroll has hit $0. Add funds to continue placing bets.
              </p>
            </div>

            <div className="mb-6">
              <label className="label-dark">Add Funds</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <input
                  type="number"
                  value={addFundsAmount}
                  onChange={(e) => setAddFundsAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-dark pl-8"
                  min="1"
                  step="10"
                  autoFocus
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                This will set both your starting and current bankroll to this amount.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddFundsModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFunds}
                disabled={!addFundsAmount || parseFloat(addFundsAmount) <= 0}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
