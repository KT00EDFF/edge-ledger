import { OddsData } from './new-bet-context'
import { RecommendedBet } from '@/types'
import { calculateBetSize } from './bet-sizing'

export interface BestOddsResult {
  bookmaker: string
  odds: number
  line?: number
  selection: string
  betType: 'spread' | 'moneyline' | 'total'
  impliedProbability: number
  kellyRecommendation?: {
    betSize: number
    percentage: number
    method: 'kelly' | 'confidence'
  }
}

function getImpliedProbability(americanOdds: number): number {
  if (americanOdds > 0) {
    return 100 / (americanOdds + 100)
  } else {
    return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100)
  }
}

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractLineFromSelection(selection: string): number | null {
  const match = selection.match(/([+-]?\d+\.?\d*)\s*$/);
  if (match) {
    return parseFloat(match[1])
  }
  const innerMatch = selection.match(/([+-]?\d+\.?\d*)/);
  if (innerMatch) {
    return parseFloat(innerMatch[1])
  }
  return null
}

function teamsMatch(selection: string, teamName: string, shortName?: string): boolean {
  const selNorm = normalizeTeamName(selection)
  const teamNorm = normalizeTeamName(teamName)
  const shortNorm = shortName ? normalizeTeamName(shortName) : null

  if (selNorm.includes(teamNorm) || teamNorm.includes(selNorm)) {
    return true
  }

  if (shortNorm && (selNorm.includes(shortNorm) || shortNorm === selNorm.split(' ')[0])) {
    return true
  }

  const teamWords = teamNorm.split(' ')
  for (const word of teamWords) {
    if (word.length >= 4 && selNorm.includes(word)) {
      return true
    }
  }

  return false
}

function determineHomeOrAway(
  selection: string, 
  homeTeam: string, 
  awayTeam: string,
  homeShort?: string,
  awayShort?: string
): 'home' | 'away' | null {
  const homeMatch = teamsMatch(selection, homeTeam, homeShort)
  const awayMatch = teamsMatch(selection, awayTeam, awayShort)

  if (homeMatch && !awayMatch) return 'home'
  if (awayMatch && !homeMatch) return 'away'
  return null
}

function isTotalOver(selection: string): boolean | null {
  const selLower = selection.toLowerCase()
  if (selLower.includes('over') || /\bo\s*\d/.test(selLower) || selLower.startsWith('o ')) {
    return true
  }
  if (selLower.includes('under') || /\bu\s*\d/.test(selLower) || selLower.startsWith('u ')) {
    return false
  }
  return null
}

function lineIsAcceptable(
  aiLine: number | undefined, 
  bookLine: number, 
  betType: 'spread' | 'total',
  isOverOrHome?: boolean
): boolean {
  if (aiLine === undefined) return true
  
  if (betType === 'spread') {
    return bookLine >= aiLine
  }
  
  if (betType === 'total') {
    if (isOverOrHome === true) {
      return bookLine <= aiLine
    } else if (isOverOrHome === false) {
      return bookLine >= aiLine
    }
  }
  
  return true
}

export function findBestOddsForPick(
  recommendedBet: RecommendedBet,
  oddsData: OddsData[],
  homeTeam: string,
  awayTeam: string,
  confidence: number,
  bankroll: number,
  minBet: number,
  maxBet: number,
  useKelly: boolean,
  homeShort?: string,
  awayShort?: string
): BestOddsResult | null {
  if (!recommendedBet || !oddsData || oddsData.length === 0) {
    return null
  }

  const { betType, selection } = recommendedBet
  let aiLine = recommendedBet.line
  
  if (aiLine === undefined && (betType === 'spread' || betType === 'total')) {
    const extracted = extractLineFromSelection(selection)
    if (extracted !== null) {
      aiLine = extracted
    }
  }
  let bestResult: BestOddsResult | null = null
  let bestOddsValue = -Infinity

  const side = determineHomeOrAway(selection, homeTeam, awayTeam, homeShort, awayShort)

  for (const book of oddsData) {
    let candidateOdds: number | null = null
    let candidateLine: number | undefined
    let candidateSelection: string = selection
    let isValidCandidate = false

    if (betType === 'moneyline' && book.moneyline) {
      if (side === 'home') {
        candidateOdds = book.moneyline.home
        candidateSelection = homeTeam
        isValidCandidate = true
      } else if (side === 'away') {
        candidateOdds = book.moneyline.away
        candidateSelection = awayTeam
        isValidCandidate = true
      }
    } else if (betType === 'spread' && book.spreads) {
      if (side === 'home') {
        const bookLine = book.spreads.home.point
        if (lineIsAcceptable(aiLine, bookLine, 'spread')) {
          candidateOdds = book.spreads.home.price
          candidateLine = bookLine
          candidateSelection = `${homeTeam} ${bookLine > 0 ? '+' : ''}${bookLine}`
          isValidCandidate = true
        }
      } else if (side === 'away') {
        const bookLine = book.spreads.away.point
        if (lineIsAcceptable(aiLine, bookLine, 'spread')) {
          candidateOdds = book.spreads.away.price
          candidateLine = bookLine
          candidateSelection = `${awayTeam} ${bookLine > 0 ? '+' : ''}${bookLine}`
          isValidCandidate = true
        }
      }
    } else if (betType === 'total' && book.totals) {
      const isOver = isTotalOver(selection)
      if (isOver === true) {
        const bookLine = book.totals.over.point
        if (lineIsAcceptable(aiLine, bookLine, 'total', true)) {
          candidateOdds = book.totals.over.price
          candidateLine = bookLine
          candidateSelection = `Over ${candidateLine}`
          isValidCandidate = true
        }
      } else if (isOver === false) {
        const bookLine = book.totals.under.point
        if (lineIsAcceptable(aiLine, bookLine, 'total', false)) {
          candidateOdds = book.totals.under.price
          candidateLine = bookLine
          candidateSelection = `Under ${candidateLine}`
          isValidCandidate = true
        }
      }
    }

    if (isValidCandidate && candidateOdds !== null && candidateOdds > bestOddsValue) {
      bestOddsValue = candidateOdds
      bestResult = {
        bookmaker: book.bookmaker,
        odds: candidateOdds,
        line: candidateLine,
        selection: candidateSelection,
        betType,
        impliedProbability: getImpliedProbability(candidateOdds)
      }
    }
  }

  if (bestResult && bankroll > 0) {
    const kelly = calculateBetSize(
      bankroll,
      confidence,
      minBet,
      maxBet,
      useKelly,
      bestResult.odds
    )
    bestResult.kellyRecommendation = kelly
  }

  return bestResult
}

export function formatOddsDisplay(odds: number): string {
  if (odds > 0) return `+${odds}`
  return odds.toString()
}
