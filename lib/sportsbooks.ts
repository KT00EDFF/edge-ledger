export interface Sportsbook {
  id: string
  name: string
  logo: string
}

export const AVAILABLE_SPORTSBOOKS: Sportsbook[] = [
  { id: 'draftkings', name: 'DraftKings', logo: 'DK' },
  { id: 'fanduel', name: 'FanDuel', logo: 'FD' },
  { id: 'betmgm', name: 'BetMGM', logo: 'BM' },
  { id: 'williamhill_us', name: 'Caesars', logo: 'CS' },
  { id: 'pointsbetus', name: 'PointsBet', logo: 'PB' },
  { id: 'betrivers', name: 'BetRivers', logo: 'BR' },
  { id: 'unibet_us', name: 'Unibet', logo: 'UB' },
  { id: 'wynnbet', name: 'WynnBET', logo: 'WB' },
  { id: 'superbook', name: 'SuperBook', logo: 'SB' },
  { id: 'bovada', name: 'Bovada', logo: 'BV' },
  { id: 'betonlineag', name: 'BetOnline', logo: 'BO' },
  { id: 'lowvig', name: 'LowVig', logo: 'LV' },
  { id: 'mybookieag', name: 'MyBookie', logo: 'MB' },
  { id: 'betus', name: 'BetUS', logo: 'BU' },
  { id: 'pinnacle', name: 'Pinnacle', logo: 'PN' },
  { id: 'espnbet', name: 'ESPN BET', logo: 'EB' },
  { id: 'fliff', name: 'Fliff', logo: 'FL' },
  { id: 'hardrockbet', name: 'Hard Rock', logo: 'HR' },
  { id: 'fanatics', name: 'Fanatics', logo: 'FN' },
]

export const DEFAULT_SELECTED_BOOKS = ['draftkings', 'fanduel', 'betmgm']

export function getBookmakerName(bookmakerKey: string): string {
  const found = AVAILABLE_SPORTSBOOKS.find(b => b.id === bookmakerKey)
  return found ? found.name : bookmakerKey
}

export function getBookmakerKey(bookmakerName: string): string | undefined {
  const nameLower = bookmakerName.toLowerCase()
  const found = AVAILABLE_SPORTSBOOKS.find(b => 
    b.name.toLowerCase() === nameLower || 
    b.id.toLowerCase() === nameLower
  )
  return found?.id
}

export function getSavedSportsbooks(): string[] {
  if (typeof window === 'undefined') return DEFAULT_SELECTED_BOOKS
  const saved = localStorage.getItem('edgeLedgerSportsbooks')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return DEFAULT_SELECTED_BOOKS
    }
  }
  return DEFAULT_SELECTED_BOOKS
}
