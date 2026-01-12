import { PredictionResult, OddsData, MatchupInput } from '@/types'

export function generateMockPrediction(matchup: MatchupInput): PredictionResult {
  const confidence = Math.floor(Math.random() * 30) + 65
  
  const isHomeWin = Math.random() > 0.45
  const predictedWinner = isHomeWin ? matchup.homeTeam : matchup.awayTeam
  
  const homeScore = Math.floor(Math.random() * 20) + 17
  const awayScore = isHomeWin 
    ? Math.floor(Math.random() * 15) + 10 
    : Math.floor(Math.random() * 20) + 20
  
  const totalPoints = homeScore + awayScore
  const spread = homeScore - awayScore
  
  const betTypes: Array<'moneyline' | 'spread' | 'total'> = ['moneyline', 'spread', 'total']
  const randomBetType = betTypes[Math.floor(Math.random() * betTypes.length)]
  
  let recommendedBet: PredictionResult['recommendedBet']
  
  if (randomBetType === 'moneyline') {
    recommendedBet = {
      betType: 'moneyline',
      selection: predictedWinner,
      reasoning: `Strong value on the moneyline with ${predictedWinner} showing dominant recent form`
    }
  } else if (randomBetType === 'spread') {
    const spreadLine = Math.round(spread * 2) / 2
    recommendedBet = {
      betType: 'spread',
      selection: isHomeWin ? `${matchup.homeTeam} ${spreadLine > 0 ? '+' : ''}${-spreadLine}` : `${matchup.awayTeam} ${spreadLine > 0 ? '-' : '+'}${Math.abs(spreadLine)}`,
      line: isHomeWin ? -spreadLine : spreadLine,
      reasoning: `The spread offers better value than the moneyline given the expected margin of victory`
    }
  } else {
    const line = Math.round((totalPoints + (Math.random() * 6 - 3)) * 2) / 2
    const isOver = totalPoints > line
    recommendedBet = {
      betType: 'total',
      selection: isOver ? `Over ${line}` : `Under ${line}`,
      line: line,
      reasoning: `${isOver ? 'Both offenses' : 'Both defenses'} are performing ${isOver ? 'above' : 'below'} average, making the ${isOver ? 'over' : 'under'} the best play`
    }
  }

  return {
    predictedWinner,
    confidence,
    predictedScore: {
      home: homeScore,
      away: awayScore
    },
    analysis: `Based on recent performance trends and historical matchup data between ${matchup.homeTeam} and ${matchup.awayTeam}, the model projects ${predictedWinner} to win. The home team has shown strong form in recent games.`,
    keyFactors: [
      `${matchup.homeTeam} has won 3 of their last 5 home games`,
      `${matchup.awayTeam} struggling with injuries to key players`,
      'Weather conditions favor the home team\'s playing style',
      'Historical head-to-head record leans toward home advantage',
    ],
    recommendedBet
  }
}

export function generateMockOdds(
  homeTeam: string,
  awayTeam: string
): OddsData[] {
  const mockOdds: OddsData[] = []

  const sportsbooks = [
    { name: 'DraftKings', key: 'draftkings' },
    { name: 'FanDuel', key: 'fanduel' },
    { name: 'BetMGM', key: 'betmgm' },
  ]

  sportsbooks.forEach((book) => {
    const homeOdds = -Math.floor(Math.random() * 200) - 100
    const awayOdds = Math.floor(Math.random() * 200) + 100

    mockOdds.push({
      sportsbook: book.name,
      sportsbookId: book.key,
      betType: 'Moneyline',
      odds: homeOdds,
      oddsDecimal: americanToDecimal(homeOdds),
    })

    mockOdds.push({
      sportsbook: book.name,
      sportsbookId: book.key,
      betType: 'Moneyline',
      odds: awayOdds,
      oddsDecimal: americanToDecimal(awayOdds),
    })

    const spread = (Math.random() * 10 - 5).toFixed(1)
    mockOdds.push({
      sportsbook: book.name,
      sportsbookId: book.key,
      betType: 'Spread',
      odds: -110,
      oddsDecimal: 1.91,
      line: parseFloat(spread),
    })

    const total = (Math.random() * 20 + 40).toFixed(1)
    mockOdds.push(
      {
        sportsbook: book.name,
        sportsbookId: book.key,
        betType: 'Total',
        odds: -110,
        oddsDecimal: 1.91,
        line: parseFloat(total),
      },
      {
        sportsbook: book.name,
        sportsbookId: book.key,
        betType: 'Total',
        odds: -110,
        oddsDecimal: 1.91,
        line: -parseFloat(total),
      }
    )
  })

  return mockOdds
}

function americanToDecimal(americanOdds: number): number {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1
  } else {
    return 100 / Math.abs(americanOdds) + 1
  }
}

export function isMockMode(): {
  predictions: boolean
  odds: boolean
} {
  return {
    predictions: !process.env.OPENAI_API_KEY,
    odds: !process.env.ODDS_API_KEY,
  }
}
