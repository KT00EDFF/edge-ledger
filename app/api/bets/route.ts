import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBankrollSnapshot } from '@/lib/analytics'

// GET all bets for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const bets = await prisma.bet.findMany({
      where: { userId },
      include: {
        sportsbook: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bets)
  } catch (error) {
    console.error('Error fetching bets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    )
  }
}

// POST create new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      userId,
      sportsbookId,
      sport,
      homeTeam,
      awayTeam,
      gameDate,
      prediction,
      confidence,
      aiReasoning,
      betType,
      odds,
      oddsDecimal,
      line,
      betSize,
      potentialPayout,
    } = body

    // Validate required fields
    if (
      !userId ||
      !sportsbookId ||
      !sport ||
      !homeTeam ||
      !awayTeam ||
      !gameDate ||
      !prediction ||
      typeof confidence !== 'number' ||
      !aiReasoning ||
      !betType ||
      typeof odds !== 'number' ||
      typeof betSize !== 'number' ||
      typeof potentialPayout !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the bet
    const bet = await prisma.bet.create({
      data: {
        userId,
        sportsbookId,
        sport,
        homeTeam,
        awayTeam,
        gameDate: new Date(gameDate),
        prediction,
        confidence,
        aiReasoning,
        betType,
        odds,
        oddsDecimal: oddsDecimal || null,
        line: line || null,
        betSize,
        potentialPayout,
        status: 'Pending',
      },
      include: {
        sportsbook: true,
      },
    })

    return NextResponse.json(bet, { status: 201 })
  } catch (error) {
    console.error('Error creating bet:', error)
    return NextResponse.json({ error: 'Failed to create bet' }, { status: 500 })
  }
}
