import { NextRequest, NextResponse } from 'next/server'
import { generatePrediction, PredictionError } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sport, homeTeam, awayTeam, gameDate } = body

    console.log('=== PREDICTION API CALLED ===')
    console.log('Body:', JSON.stringify(body, null, 2))

    if (!sport || !homeTeam || !awayTeam || !gameDate) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          errorType: 'validation_error',
          details: `sport: ${!!sport}, homeTeam: ${!!homeTeam}, awayTeam: ${!!awayTeam}, gameDate: ${!!gameDate}`
        },
        { status: 400 }
      )
    }

    const prediction = await generatePrediction({
      sport,
      homeTeam,
      awayTeam,
      gameDate
    })

    return NextResponse.json(prediction)
  } catch (err: unknown) {
    console.error('=== PREDICTION API ERROR ===', err)

    if (err instanceof PredictionError) {
      return NextResponse.json(
        {
          error: err.message,
          errorType: err.type,
          details: err.details
        },
        { status: 500 }
      )
    }

    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      {
        error: message,
        errorType: 'unknown_error',
        details: 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}
