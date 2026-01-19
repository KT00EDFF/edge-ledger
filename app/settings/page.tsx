'use client'

import { useState, useEffect } from 'react'
import { AVAILABLE_SPORTSBOOKS, DEFAULT_SELECTED_BOOKS } from '@/lib/sportsbooks'

interface User {
  id: string
  startingBankroll: number
  currentBankroll: number
}

interface Settings {
  minBetSize: number
  maxBetSize: number
  useKellyCriterion: boolean
}

function loadSettings(): Settings {
  if (typeof window === 'undefined') {
    return {
      minBetSize: 10,
      maxBetSize: 500,
      useKellyCriterion: false,
    }
  }
  
  const saved = localStorage.getItem('edgeLedgerSettings')
  if (saved) {
    const parsed = JSON.parse(saved)
    return {
      minBetSize: parsed.minBetSize || 10,
      maxBetSize: parsed.maxBetSize || 500,
      useKellyCriterion: parsed.useKellyCriterion || false,
    }
  }
  return {
    minBetSize: 10,
    maxBetSize: 500,
    useKellyCriterion: false,
  }
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<Settings>({
    minBetSize: 10,
    maxBetSize: 500,
    useKellyCriterion: false,
  })
  const [selectedBooks, setSelectedBooks] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)

  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [addFundsAmount, setAddFundsAmount] = useState('')
  const [isAddingFunds, setIsAddingFunds] = useState(false)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetAmount, setResetAmount] = useState('1000')
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/user')
        if (res.ok) {
          const userData = await res.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }

    const loaded = loadSettings()
    setSettings(loaded)
    
    const savedBooks = localStorage.getItem('edgeLedgerSportsbooks')
    if (savedBooks) {
      setSelectedBooks(JSON.parse(savedBooks))
    } else {
      setSelectedBooks(DEFAULT_SELECTED_BOOKS)
    }
    
    fetchUser()
    setIsLoaded(true)
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
      localStorage.setItem('edgeLedgerSettings', JSON.stringify(settings))
      localStorage.setItem('edgeLedgerSportsbooks', JSON.stringify(selectedBooks))
      
      setSaveMessage('Settings saved successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddFunds = async () => {
    const amount = parseFloat(addFundsAmount)
    if (amount <= 0) return

    setIsAddingFunds(true)
    try {
      const res = await fetch('/api/user/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setShowAddFundsModal(false)
        setAddFundsAmount('')
        setSaveMessage(`Added $${amount.toFixed(2)} to bankroll!`)
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        const error = await res.json()
        setSaveMessage(error.error || 'Failed to add funds')
      }
    } catch (error) {
      setSaveMessage('Failed to add funds')
    } finally {
      setIsAddingFunds(false)
    }
  }

  const handleReset = async () => {
    const amount = parseFloat(resetAmount)
    if (amount <= 0) return

    setIsResetting(true)
    try {
      const res = await fetch('/api/user/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingBankroll: amount })
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setShowResetModal(false)
        setResetAmount('1000')
        setSaveMessage('Account reset successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        const error = await res.json()
        setSaveMessage(error.error || 'Failed to reset account')
      }
    } catch (error) {
      setSaveMessage('Failed to reset account')
    } finally {
      setIsResetting(false)
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
          
          <div className="bg-dark-hover rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-text-muted text-sm mb-1">Current Bankroll</p>
                <p className={`text-3xl font-bold ${(user?.currentBankroll || 0) > 0 ? 'text-accent-green' : 'text-red-400'}`}>
                  ${(user?.currentBankroll || 0).toFixed(2)}
                </p>
                {user && (
                  <p className="text-text-muted text-sm mt-1">
                    Started with ${user.startingBankroll.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddFundsModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Funds
                </button>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="btn-secondary flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Account
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
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
                  <span className="text-sm text-text-secondary">Gemini API: Configured</span>
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
            <div className={`flex items-center space-x-2 ${saveMessage.includes('Failed') ? 'text-red-400' : 'text-accent-green'}`}>
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
          
          <div className="relative bg-dark-card border border-dark-border rounded-xl w-full max-w-md p-6">
            <button
              onClick={() => setShowAddFundsModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-accent-green/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Add Funds</h2>
              <p className="text-text-secondary text-sm">
                Add money to your current bankroll balance.
              </p>
            </div>

            <div className="mb-6">
              <label className="label-dark">Amount to Add</label>
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
                Current balance: ${(user?.currentBankroll || 0).toFixed(2)}
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
                disabled={!addFundsAmount || parseFloat(addFundsAmount) <= 0 || isAddingFunds}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingFunds ? 'Adding...' : 'Add Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowResetModal(false)} />
          
          <div className="relative bg-dark-card border border-red-400/30 rounded-xl w-full max-w-md p-6">
            <button
              onClick={() => setShowResetModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-400/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Reset Account</h2>
              <p className="text-text-secondary text-sm">
                This will <span className="text-red-400 font-medium">delete all your bet history</span> and reset your bankroll to a fresh start.
              </p>
            </div>

            <div className="mb-6">
              <label className="label-dark">New Starting Bankroll</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                <input
                  type="number"
                  value={resetAmount}
                  onChange={(e) => setResetAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="input-dark pl-8"
                  min="1"
                  step="100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={!resetAmount || parseFloat(resetAmount) <= 0 || isResetting}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Resetting...' : 'Reset Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
