import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { OddsData } from '@/lib/new-bet-context'

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4'
const API_KEY = process.env.ODDS_API_KEY

interface OddsApiBookmaker {
  key: string
  title: string
  markets: Array<{
    key: string
    outcomes: Array<{
      name: string
      price: number
      point?: number
    }>
  }>
}

interface OddsApiResponse {
  id: string
  sport_key: string
  home_team: string
  away_team: string
  bookmakers: OddsApiBookmaker[]
}

function generateMockOdds(homeTeam: string, awayTeam: string): OddsData[] {
  const bookmakers = ['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'PointsBet']
  
  return bookmakers.map(bookmaker => {
    const baseSpread = Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : -(Math.floor(Math.random() * 10) + 1)
    const homeML = baseSpread < 0 ? -(100 + Math.floor(Math.random() * 50)) : 100 + Math.floor(Math.random() * 150)
    const awayML = baseSpread > 0 ? -(100 + Math.floor(Math.random() * 50)) : 100 + Math.floor(Math.random() * 150)
    const total = 40 + Math.floor(Math.random() * 20)

    return {
      bookmaker,
      spreads: {
        home: { point: baseSpread, price: -110 + Math.floor(Math.random() * 10) - 5 },
        away: { point: -baseSpread, price: -110 + Math.floor(Math.random() * 10) - 5 }
      },
      moneyline: {
        home: homeML,
        away: awayML
      },
      totals: {
        over: { point: total, price: -110 + Math.floor(Math.random() * 10) - 5 },
        under: { point: total, price: -110 + Math.floor(Math.random() * 10) - 5 }
      }
    }
  })
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sport = searchParams.get('sport')
    const homeTeam = searchParams.get('homeTeam')
    const awayTeam = searchParams.get('awayTeam')

    if (!sport || !homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: 'Missing required parameters: sport, homeTeam, awayTeam' },
        { status: 400 }
      )
    }

    if (!API_KEY) {
      console.log('📊 Using mock odds data (ODDS_API_KEY not configured)')
      await new Promise(resolve => setTimeout(resolve, 500))
      return NextResponse.json({
        odds: generateMockOdds(homeTeam, awayTeam),
        source: 'mock'
      })
    }

    const response = await axios.get<OddsApiResponse[]>(
      `${ODDS_API_BASE_URL}/sports/${sport}/odds`,
      {
        params: {
          apiKey: API_KEY,
          regions: 'us',
          markets: 'h2h,spreads,totals',
          oddsFormat: 'american'
        }
      }
    )

    const homeTeamLower = homeTeam.toLowerCase()
    const awayTeamLower = awayTeam.toLowerCase()

    const game = response.data.find(g => {
      const gameHome = g.home_team.toLowerCase()
      const gameAway = g.away_team.toLowerCase()
      return (
        (gameHome.includes(homeTeamLower) || homeTeamLower.includes(gameHome)) &&
        (gameAway.includes(awayTeamLower) || awayTeamLower.includes(gameAway))
      )
    })

    if (!game) {
      console.log('⚠️ Game not found in Odds API, using mock data')
      return NextResponse.json({
        odds: generateMockOdds(homeTeam, awayTeam),
        source: 'mock'
      })
    }

    const odds: OddsData[] = game.bookmakers.map(bookmaker => {
      const h2hMarket = bookmaker.markets.find(m => m.key === 'h2h')
      const spreadsMarket = bookmaker.markets.find(m => m.key === 'spreads')
      const totalsMarket = bookmaker.markets.find(m => m.key === 'totals')

      const homeH2h = h2hMarket?.outcomes.find(o => 
        o.name.toLowerCase().includes(game.home_team.toLowerCase().split(' ').pop() || '')
      )
      const awayH2h = h2hMarket?.outcomes.find(o => 
        o.name.toLowerCase().includes(game.away_team.toLowerCase().split(' ').pop() || '')
      )

      const homeSpread = spreadsMarket?.outcomes.find(o => 
        o.name.toLowerCase().includes(game.home_team.toLowerCase().split(' ').pop() || '')
      )
      const awaySpread = spreadsMarket?.outcomes.find(o => 
        o.name.toLowerCase().includes(game.away_team.toLowerCase().split(' ').pop() || '')
      )

      const over = totalsMarket?.outcomes.find(o => o.name === 'Over')
      const under = totalsMarket?.outcomes.find(o => o.name === 'Under')

      return {
        bookmaker: bookmaker.title,
        spreads: homeSpread && awaySpread ? {
          home: { point: homeSpread.point || 0, price: homeSpread.price },
          away: { point: awaySpread.point || 0, price: awaySpread.price }
        } : undefined,
        moneyline: homeH2h && awayH2h ? {
          home: homeH2h.price,
          away: awayH2h.price
        } : undefined,
        totals: over && under ? {
          over: { point: over.point || 0, price: over.price },
          under: { point: under.point || 0, price: under.price }
        } : undefined
      }
    })

    return NextResponse.json({
      odds,
      source: 'live'
    })

  } catch (error) {
    console.error('Error fetching odds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch odds' },
      { status: 500 }
    )
  }
}
