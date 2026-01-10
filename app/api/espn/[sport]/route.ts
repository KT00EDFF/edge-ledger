import { NextRequest, NextResponse } from 'next/server'
import { getEspnEndpoint, parseEspnScoreboard, getSportConfig } from '@/lib/sports-mapper'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sport: string }> }
) {
  try {
    const { sport: sportKey } = await params
    const sport = getSportConfig(sportKey)
    
    if (!sport) {
      return NextResponse.json(
        { error: 'Invalid sport key' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date') || undefined

    const endpoint = getEspnEndpoint(sportKey, date)
    
    const response = await fetch(endpoint, {
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      throw new Error(`ESPN API returned ${response.status}`)
    }

    const data = await response.json()
    const matchups = parseEspnScoreboard(data, sportKey)

    return NextResponse.json({
      sport: sport.name,
      sportKey: sport.key,
      matchups,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('ESPN API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matchups' },
      { status: 500 }
    )
  }
}
