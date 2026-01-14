import { GoogleGenerativeAI } from '@google/generative-ai'
import { PredictionResult, MatchupInput } from '@/types'

const SPORT_CONFIG: Record<string, {
  keyMetrics: string[]
  situationalFactors: string[]
  keyNumbers: string[]
  publicBiases: string[]
}> = {
  NFL: {
    keyMetrics: [
      'DVOA rankings (offense/defense)',
      'Red zone efficiency',
      'Turnover differential',
      'Third-down conversion rates',
      'Pressure rate and sack percentage'
    ],
    situationalFactors: [
      'Days of rest between games',
      'Travel distance and time zones',
      'Division rivalry dynamics',
      'Coming off bye vs short week',
      'Weather conditions (outdoor games)'
    ],
    keyNumbers: [
      '3 and 7 are key margins (FG and TD)',
      '-3 is the most common final margin',
      'Home field worth ~2.5 points'
    ],
    publicBiases: [
      'Public overvalues recent offensive explosions',
      'Public loves home favorites',
      'Prime time games get inflated lines'
    ]
  },
  NBA: {
    keyMetrics: [
      'Offensive/defensive rating per 100 possessions',
      'Pace of play',
      'Effective field goal percentage',
      'Rebounding rates',
      'Three-point shooting splits'
    ],
    situationalFactors: [
      'Back-to-back fatigue (2nd night)',
      'Days of rest (0, 1, 2, 3+)',
      'Cross-country travel',
      'Load management patterns',
      'Altitude games (Denver)'
    ],
    keyNumbers: [
      'Home court worth ~3-4 points',
      'Large favorites (-10+) often fail to cover',
      'First half often tells different story'
    ],
    publicBiases: [
      'Public overvalues star power',
      'Public ignores rest advantages',
      'Public chases overs'
    ]
  },
  MLB: {
    keyMetrics: [
      'Starting pitcher ERA, WHIP, FIP',
      'Bullpen ERA and workload',
      'Team batting vs handedness splits',
      'On-base percentage and OPS'
    ],
    situationalFactors: [
      'Day game after night game',
      'Pitcher days rest',
      'Bullpen availability',
      'Weather and wind direction',
      'Ballpark factors'
    ],
    keyNumbers: [
      'Run line (-1.5/+1.5) value',
      'First 5 innings isolates starters',
      'Home field minimal (~54% win rate)'
    ],
    publicBiases: [
      'Public overvalues win streaks',
      'Public bets favorites too heavily',
      'Public ignores bullpen fatigue'
    ]
  },
  NCAAF: {
    keyMetrics: [
      'SP+ and FEI ratings',
      'Yards per play differential',
      'Explosive play rate',
      'Turnover margin'
    ],
    situationalFactors: [
      'Conference vs non-conference',
      'Rivalry motivation',
      'Bye week preparation',
      'Weather conditions',
      'Trap games before marquee matchups'
    ],
    keyNumbers: [
      '3 and 7 still key like NFL',
      'Larger spreads common (20+ favorites)',
      'Home field worth 3-4 points'
    ],
    publicBiases: [
      'Public overvalues blue bloods',
      'Public ignores G5 teams with strong metrics',
      'Public loves big favorites'
    ]
  },
  NCAAB: {
    keyMetrics: [
      'KenPom rankings (AdjO, AdjD)',
      'Effective field goal percentage',
      'Turnover percentage',
      'Rebounding rates'
    ],
    situationalFactors: [
      'Conference tournament fatigue',
      'Travel distance',
      'Revenge spots',
      'Rest days between games'
    ],
    keyNumbers: [
      'Home court worth 3-4 points',
      'Small gyms can be 5-6 points',
      '12-5 upset rate ~35% in March'
    ],
    publicBiases: [
      'Public loves big-name programs',
      'Public undervalues mid-majors',
      'Public ignores tempo differences'
    ]
  }
}

const SYSTEM_PROMPT = `You are an elite sports betting analyst. Your goal is to find VALUE where the market has mispriced a game.

## Core Philosophy:
1. **Value Over Winners**: A 60% winner at -200 is worse than a 45% underdog at +180
2. **Contrarian Thinking**: When everyone loves a team, ask why the line isn't higher
3. **Situational Edges**: Rest, travel, motivation create exploitable spots
4. **Fade the Public**: Recreational bettors have predictable biases

## Confidence Scoring (Based on Edge Size):
- 75-90%: Clear mispricing with strong support (rare)
- 60-74%: Solid edge with supporting factors
- 50-59%: Slight edge, proceed with caution
- Below 50%: No clear edge, consider passing

You MUST respond with ONLY valid JSON matching the exact structure requested. No markdown, no code blocks, just raw JSON.`

function buildPrompt(matchup: MatchupInput): string {
  const { sport, homeTeam, awayTeam, gameDate } = matchup
  const sportKey = sport.toUpperCase().replace(/\s+/g, '')
  const config = SPORT_CONFIG[sportKey] || SPORT_CONFIG['NFL']

  return `## MATCHUP TO ANALYZE

**Sport:** ${sport}
**Home Team:** ${homeTeam}
**Away Team:** ${awayTeam}
**Game Date:** ${gameDate}

---

## SPORT-SPECIFIC CONTEXT (${sport}):

**Key Metrics to Consider:**
${config.keyMetrics.map(m => `• ${m}`).join('\n')}

**Situational Factors:**
${config.situationalFactors.map(f => `• ${f}`).join('\n')}

**Key Numbers:**
${config.keyNumbers.map(n => `• ${n}`).join('\n')}

**Public Biases to Exploit:**
${config.publicBiases.map(b => `• ${b}`).join('\n')}

---

## YOUR TASK:

Analyze ${awayTeam} @ ${homeTeam} and find the best betting value.

Respond with ONLY this JSON structure (no markdown, no code blocks, just raw JSON):

{
  "predictedWinner": "${homeTeam} or ${awayTeam}",
  "confidence": 65,
  "predictedScore": {
    "home": 105,
    "away": 102
  },
  "edgeAnalysis": {
    "marketLine": "Estimated market line",
    "fairLine": "Your calculated fair line",
    "edgePercent": 3.5,
    "publicSide": "Which side public favors",
    "sharpSide": "Which side sharps favor"
  },
  "analysis": "2-3 sentences explaining where the value is and why the market is wrong.",
  "keyFactors": [
    "Primary edge driver",
    "Supporting factor",
    "Public bias being exploited"
  ],
  "recommendedBet": {
    "betType": "spread",
    "selection": "Team +3.5 or Under 215.5",
    "line": -3.5,
    "reasoning": "Why this bet type offers best value"
  }
}

IMPORTANT: 
- betType must be exactly "spread", "moneyline", or "total"
- Generate realistic scores for ${sport}
- Be honest if there's no clear edge
- Return ONLY the JSON object, nothing else`
}

export type PredictionErrorType = 'quota_exceeded' | 'api_key_missing' | 'api_error' | 'parse_error'

export class PredictionError extends Error {
  type: PredictionErrorType
  details?: string

  constructor(type: PredictionErrorType, message: string, details?: string) {
    super(message)
    this.name = 'PredictionError'
    this.type = type
    this.details = details
  }
}

export async function generatePrediction(
  matchup: MatchupInput
): Promise<PredictionResult> {
  const apiKey = process.env.GOOGLE_API_KEY
  
  if (!apiKey) {
    throw new PredictionError(
      'api_key_missing',
      'Google API key not configured',
      'Add your GOOGLE_API_KEY in Settings > Secrets'
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      responseMimeType: 'application/json'
    }
  })

  const prompt = buildPrompt(matchup)

  console.log('=== GEMINI PREDICTION REQUEST ===')
  console.log('Sport:', matchup.sport)
  console.log('Matchup:', matchup.awayTeam, '@', matchup.homeTeam)
  console.log('Date:', matchup.gameDate)

  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt }
    ])

    const responseText = result.response.text()
    console.log('=== GEMINI RAW RESPONSE ===')
    console.log(responseText)

    if (!responseText) {
      throw new PredictionError('api_error', 'No response from Gemini')
    }

    let raw: any
    try {
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      raw = JSON.parse(cleanedResponse)
    } catch {
      throw new PredictionError('parse_error', 'Invalid JSON from Gemini', responseText.substring(0, 100))
    }

    const prediction: PredictionResult = {
      predictedWinner: raw.predictedWinner || matchup.homeTeam,
      confidence: Math.max(0, Math.min(100, raw.confidence || 50)),
      predictedScore: raw.predictedScore,
      analysis: raw.analysis || '',
      keyFactors: raw.keyFactors || [],
      edgeAnalysis: raw.edgeAnalysis || undefined,
      recommendedBet: raw.recommendedBet ? {
        betType: validateBetType(raw.recommendedBet.betType),
        selection: raw.recommendedBet.selection || raw.predictedWinner,
        line: raw.recommendedBet.line,
        reasoning: raw.recommendedBet.reasoning || ''
      } : undefined
    }

    console.log('=== PARSED PREDICTION ===')
    console.log('Winner:', prediction.predictedWinner)
    console.log('Confidence:', prediction.confidence)
    console.log('Recommended:', prediction.recommendedBet?.selection)

    return prediction
  } catch (err: any) {
    console.error('=== GEMINI ERROR ===', err)

    if (err instanceof PredictionError) {
      throw err
    }

    if (err?.status === 429 || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new PredictionError(
        'quota_exceeded',
        'Google API quota exhausted',
        'Check your quota at console.cloud.google.com'
      )
    }

    if (err?.status === 401 || err?.status === 403 || err?.message?.includes('API_KEY_INVALID')) {
      throw new PredictionError(
        'api_key_missing',
        'Invalid Google API key',
        'Check your GOOGLE_API_KEY in Settings > Secrets'
      )
    }

    throw new PredictionError(
      'api_error',
      err?.message || 'Unknown error occurred',
      'Try again in a moment'
    )
  }
}

function validateBetType(betType: string | undefined): 'moneyline' | 'spread' | 'total' {
  const bt = (betType || '').toLowerCase()
  if (bt === 'spread' || bt === 'moneyline' || bt === 'total') {
    return bt
  }
  return 'moneyline'
}
