import { NextRequest, NextResponse } from 'next/server'
import { generatePrediction } from '@/lib/openai'
import { MatchupInput } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: MatchupInput = await request.json()

    const { sport, homeTeam, awayTeam, gameDate } = body

    // Validate input
    if (!sport || !homeTeam || !awayTeam || !gameDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate AI prediction
    const prediction = await generatePrediction({
      sport,
      homeTeam,
      awayTeam,
      gameDate,
    })

    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Error in predictions API:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}
