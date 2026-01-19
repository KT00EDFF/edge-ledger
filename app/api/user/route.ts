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

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser()
    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
