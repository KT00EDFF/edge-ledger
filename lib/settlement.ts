import { prisma } from './prisma'

export interface GameResult {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  status: string
}

export interface SettlementResult {
  betId: string
  outcome: 'Won' | 'Lost' | 'Push'
  profit: number
  homeScore: number
  awayScore: number
}

function parseTeamFromPrediction(prediction: string, homeTeam: string, awayTeam: string): 'home' | 'away' | null {
  const predLower = prediction.toLowerCase()
  
  const homeWords = homeTeam.toLowerCase().split(/\s+/)
  const awayWords = awayTeam.toLowerCase().split(/\s+/)
  
  const homeLast = homeWords[homeWords.length - 1] || ''
  const awayLast = awayWords[awayWords.length - 1] || ''
  const homeFirst = homeWords[0] || ''
  const awayFirst = awayWords[0] || ''
  
  const homeAbbrev = homeTeam.replace(/[^A-Z]/g, '').toLowerCase()
  const awayAbbrev = awayTeam.replace(/[^A-Z]/g, '').toLowerCase()
  
  const predWords = prediction.replace(/[+\-\d.]/g, ' ').toLowerCase().split(/\s+/).filter(w => w.length > 0)
  
  for (const word of predWords) {
    if (word.length >= 3) {
      if (word === homeLast || word === homeFirst || word === homeAbbrev || 
          homeLast.includes(word) || word.includes(homeLast)) {
        return 'home'
      }
      if (word === awayLast || word === awayFirst || word === awayAbbrev ||
          awayLast.includes(word) || word.includes(awayLast)) {
        return 'away'
      }
    }
  }
  
  if (predLower.includes('home')) return 'home'
  if (predLower.includes('away')) return 'away'
  
  return null
}

export function determineBetOutcome(
  betType: string,
  prediction: string,
  line: number | null,
  odds: number,
  betSize: number,
  homeTeam: string,
  awayTeam: string,
  homeScore: number,
  awayScore: number
): { outcome: 'Won' | 'Lost' | 'Push'; netProfit: number; bankrollReturn: number } {
  const scoreDiff = homeScore - awayScore
  const totalScore = homeScore + awayScore
  const predLower = prediction.toLowerCase()
  
  const pickedSide = parseTeamFromPrediction(prediction, homeTeam, awayTeam)
  const pickedOver = predLower.includes('over')
  const pickedUnder = predLower.includes('under')

  let won = false
  let push = false

  const betTypeLower = betType.toLowerCase()
  
  if (betTypeLower === 'moneyline' || betTypeLower === 'ml') {
    if (homeScore === awayScore) {
      push = true
    } else if (pickedSide === 'home') {
      won = homeScore > awayScore
    } else if (pickedSide === 'away') {
      won = awayScore > homeScore
    } else {
      return { outcome: 'Lost', netProfit: -betSize, bankrollReturn: 0 }
    }
  } else if (betTypeLower === 'spread' || betTypeLower === 'spr') {
    if (line === null || pickedSide === null) {
      return { outcome: 'Lost', netProfit: -betSize, bankrollReturn: 0 }
    }
    
    let coverMargin: number
    if (pickedSide === 'home') {
      coverMargin = scoreDiff + line
    } else {
      coverMargin = -scoreDiff + line
    }
    
    if (coverMargin === 0) {
      push = true
    } else {
      won = coverMargin > 0
    }
  } else if (betTypeLower === 'total' || betTypeLower === 'o/u' || betTypeLower === 'over/under') {
    if (line === null) {
      return { outcome: 'Lost', netProfit: -betSize, bankrollReturn: 0 }
    }
    
    if (totalScore === line) {
      push = true
    } else if (pickedOver) {
      won = totalScore > line
    } else if (pickedUnder) {
      won = totalScore < line
    } else {
      return { outcome: 'Lost', netProfit: -betSize, bankrollReturn: 0 }
    }
  } else {
    return { outcome: 'Lost', netProfit: -betSize, bankrollReturn: 0 }
  }

  if (push) {
    return { outcome: 'Push', netProfit: 0, bankrollReturn: betSize }
  }

  if (won) {
    const winnings = calculateProfit(betSize, odds)
    return { outcome: 'Won', netProfit: winnings, bankrollReturn: betSize + winnings }
  }

  return { outcome: 'Lost', netProfit: -betSize, bankrollReturn: 0 }
}

function calculateProfit(betSize: number, americanOdds: number): number {
  if (americanOdds > 0) {
    return betSize * (americanOdds / 100)
  } else {
    return betSize * (100 / Math.abs(americanOdds))
  }
}

export async function fetchEspnGameResult(
  sport: string,
  homeTeam: string,
  awayTeam: string,
  gameDate: Date
): Promise<GameResult | null> {
  try {
    const sportConfig = getSportEspnConfig(sport)
    if (!sportConfig) return null

    const dateStr = gameDate.toISOString().split('T')[0].replace(/-/g, '')
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sportConfig.espnSport}/${sportConfig.espnLeague}/scoreboard?dates=${dateStr}`

    const response = await fetch(url, { next: { revalidate: 60 } })
    if (!response.ok) return null

    const data = await response.json()
    
    for (const event of data.events || []) {
      const competition = event.competitions?.[0]
      if (!competition) continue

      const homeCompetitor = competition.competitors?.find((c: any) => c.homeAway === 'home')
      const awayCompetitor = competition.competitors?.find((c: any) => c.homeAway === 'away')

      if (!homeCompetitor || !awayCompetitor) continue

      const eventHomeTeam = homeCompetitor.team?.displayName || homeCompetitor.team?.name || ''
      const eventAwayTeam = awayCompetitor.team?.displayName || awayCompetitor.team?.name || ''

      const homeMatch = teamsMatch(homeTeam, eventHomeTeam)
      const awayMatch = teamsMatch(awayTeam, eventAwayTeam)

      if (homeMatch && awayMatch) {
        const statusName = event.status?.type?.name || ''
        
        if (statusName === 'STATUS_FINAL' || statusName === 'STATUS_FULL_TIME') {
          return {
            homeTeam: eventHomeTeam,
            awayTeam: eventAwayTeam,
            homeScore: parseInt(homeCompetitor.score || '0', 10),
            awayScore: parseInt(awayCompetitor.score || '0', 10),
            status: 'final'
          }
        }
        
        return {
          homeTeam: eventHomeTeam,
          awayTeam: eventAwayTeam,
          homeScore: 0,
          awayScore: 0,
          status: statusName
        }
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching ESPN game result:', error)
    return null
  }
}

function teamsMatch(team1: string, team2: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const t1 = normalize(team1)
  const t2 = normalize(team2)
  
  if (t1 === t2) return true
  if (t1.includes(t2) || t2.includes(t1)) return true
  
  const words1 = team1.toLowerCase().split(/\s+/)
  const words2 = team2.toLowerCase().split(/\s+/)
  
  for (const w1 of words1) {
    if (w1.length >= 4) {
      for (const w2 of words2) {
        if (w2.length >= 4 && w1 === w2) return true
      }
    }
  }
  
  return false
}

function getSportEspnConfig(sport: string): { espnSport: string; espnLeague: string } | null {
  const configs: Record<string, { espnSport: string; espnLeague: string }> = {
    'nfl': { espnSport: 'football', espnLeague: 'nfl' },
    'nba': { espnSport: 'basketball', espnLeague: 'nba' },
    'mlb': { espnSport: 'baseball', espnLeague: 'mlb' },
    'ncaaf': { espnSport: 'football', espnLeague: 'college-football' },
    'ncaab': { espnSport: 'basketball', espnLeague: 'mens-college-basketball' }
  }
  return configs[sport.toLowerCase()] || null
}

async function getDefaultUser() {
  let user = await prisma.user.findFirst({
    where: { email: 'default@edgeledger.app' }
  })
  return user
}

export async function settlePendingBets(userId?: string): Promise<{
  settled: SettlementResult[]
  errors: string[]
  bankrollChange: number
}> {
  const settled: SettlementResult[] = []
  const errors: string[] = []
  let bankrollChange = 0

  try {
    let finalUserId = userId
    if (!finalUserId || finalUserId === 'default-user') {
      const defaultUser = await getDefaultUser()
      if (defaultUser) {
        finalUserId = defaultUser.id
      }
    }

    const whereClause: any = { status: 'Pending' }
    if (finalUserId) {
      whereClause.userId = finalUserId
    }

    const pendingBets = await prisma.bet.findMany({
      where: whereClause,
      include: { user: true }
    })

    console.log(`Found ${pendingBets.length} pending bets to settle`)

    for (const bet of pendingBets) {
      try {
        const gameResult = await fetchEspnGameResult(
          bet.sport,
          bet.homeTeam,
          bet.awayTeam,
          bet.gameDate
        )

        if (!gameResult) {
          console.log(`No game result found for ${bet.awayTeam} @ ${bet.homeTeam}`)
          continue
        }

        if (gameResult.status !== 'final') {
          console.log(`Game not final: ${bet.awayTeam} @ ${bet.homeTeam} - ${gameResult.status}`)
          continue
        }

        const { outcome, netProfit, bankrollReturn } = determineBetOutcome(
          bet.betType,
          bet.prediction,
          bet.line,
          bet.odds,
          bet.betSize,
          bet.homeTeam,
          bet.awayTeam,
          gameResult.homeScore,
          gameResult.awayScore
        )

        await prisma.bet.update({
          where: { id: bet.id },
          data: {
            status: outcome,
            profit: netProfit,
            actualResult: `${gameResult.awayScore}-${gameResult.homeScore}`,
            settledAt: new Date()
          }
        })

        await prisma.user.update({
          where: { id: bet.userId },
          data: {
            currentBankroll: {
              increment: bankrollReturn
            }
          }
        })

        settled.push({
          betId: bet.id,
          outcome,
          profit: netProfit,
          homeScore: gameResult.homeScore,
          awayScore: gameResult.awayScore
        })

        bankrollChange += netProfit

        console.log(`Settled bet ${bet.id}: ${outcome}, net profit: ${netProfit}, bankroll return: ${bankrollReturn}`)
      } catch (betError) {
        const errorMsg = `Error settling bet ${bet.id}: ${betError}`
        console.error(errorMsg)
        errors.push(errorMsg)
      }
    }
  } catch (error) {
    const errorMsg = `Settlement error: ${error}`
    console.error(errorMsg)
    errors.push(errorMsg)
  }

  return { settled, errors, bankrollChange }
}
