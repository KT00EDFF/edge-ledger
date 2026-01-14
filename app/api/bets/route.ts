import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst({
    where: { email: 'default@edgeledger.app' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'default@edgeledger.app',
        startingBankroll: 1000,
        currentBankroll: 1000,
      }
    })
  }
  
  return user
}

async function getOrCreateSportsbook(name: string) {
  let sportsbook = await prisma.sportsbook.findFirst({
    where: { name }
  })
  
  if (!sportsbook) {
    sportsbook = await prisma.sportsbook.create({
      data: {
        name,
        apiKey: name.toLowerCase().replace(/\s+/g, '_'),
        isActive: true
      }
    })
  }
  
  return sportsbook
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdParam = searchParams.get('userId')
    
    const user = await getOrCreateDefaultUser()
    const userId = userIdParam || user.id

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      sport,
      homeTeam,
      awayTeam,
      gameDate,
      betType,
      selection,
      odds,
      line,
      sportsbook: sportsbookName,
      amount,
      potentialPayout,
      confidence: providedConfidence,
      aiReasoning: providedReasoning
    } = body

    if (
      !sport ||
      !homeTeam ||
      !awayTeam ||
      !gameDate ||
      !betType ||
      !selection ||
      typeof odds !== 'number' ||
      typeof amount !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const user = await getOrCreateDefaultUser()
    const sportsbook = await getOrCreateSportsbook(sportsbookName || 'Unknown')

    if (user.currentBankroll < amount) {
      return NextResponse.json(
        { error: 'Insufficient bankroll' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        currentBankroll: { decrement: amount }
      }
    })

    const bet = await prisma.bet.create({
      data: {
        userId: user.id,
        sportsbookId: sportsbook.id,
        sport: sport.toUpperCase(),
        homeTeam,
        awayTeam,
        gameDate: new Date(gameDate),
        prediction: selection,
        confidence: providedConfidence || 60,
        aiReasoning: providedReasoning || 'User placed bet',
        betType,
        odds,
        oddsDecimal: odds > 0 ? 1 + (odds / 100) : 1 + (100 / Math.abs(odds)),
        line: line !== undefined ? line : null,
        betSize: amount,
        potentialPayout: potentialPayout || amount * 2,
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
