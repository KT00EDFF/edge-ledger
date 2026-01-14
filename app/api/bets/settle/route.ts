import { NextRequest, NextResponse } from 'next/server'
import { settlePendingBets } from '@/lib/settlement'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const userId = body.userId

    console.log('Settlement requested for user:', userId || 'all users')

    const result = await settlePendingBets(userId)

    return NextResponse.json({
      success: true,
      settledCount: result.settled.length,
      bankrollChange: result.bankrollChange,
      settled: result.settled,
      errors: result.errors
    })
  } catch (error) {
    console.error('Settlement API error:', error)
    return NextResponse.json(
      { error: 'Failed to settle bets', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const result = await settlePendingBets(userId || undefined)

    return NextResponse.json({
      success: true,
      settledCount: result.settled.length,
      bankrollChange: result.bankrollChange,
      settled: result.settled,
      errors: result.errors
    })
  } catch (error) {
    console.error('Settlement API error:', error)
    return NextResponse.json(
      { error: 'Failed to settle bets', details: String(error) },
      { status: 500 }
    )
  }
}
