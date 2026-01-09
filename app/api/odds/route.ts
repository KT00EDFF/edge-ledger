import { NextRequest, NextResponse } from 'next/server'
import { fetchOdds, getBestOdds } from '@/lib/odds-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { sport, homeTeam, awayTeam, userSportsbooks } = body

    // Validate input
    if (!sport || !homeTeam || !awayTeam || !Array.isArray(userSportsbooks)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Fetch odds from user's sportsbooks
    const oddsData = await fetchOdds(sport, homeTeam, awayTeam, userSportsbooks)

    // Group odds by bet type for easier consumption
    const groupedOdds = {
      moneyline: oddsData.filter((o) => o.betType === 'Moneyline'),
      spread: oddsData.filter((o) => o.betType === 'Spread'),
      total: oddsData.filter((o) => o.betType === 'Total'),
    }

    return NextResponse.json({
      odds: oddsData,
      grouped: groupedOdds,
    })
  } catch (error) {
    console.error('Error in odds API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch odds' },
      { status: 500 }
    )
  }
}
