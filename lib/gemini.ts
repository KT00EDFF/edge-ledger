import { GoogleGenerativeAI } from '@google/generative-ai'
import { PredictionResult, MatchupInput } from '@/types'

const SPORT_CONFIG: Record<string, {
  analyticalMetrics: string[]
  sharpIntangibles: string[]
  typicalScoreRange: string
}> = {
  NFL: {
    analyticalMetrics: [
      'EPA/play (Expected Points Added per play) for offense and defense',
      'Success Rate (% of plays that gain positive expected points)',
      'DVOA (Defense-adjusted Value Over Average) rankings',
      'Offensive/Defensive line win rates - trench matchup metrics',
      'Red zone efficiency (TD% inside the 20)',
      'Pressure rate and sack percentage',
      'Third-down conversion rates (offensive and defensive)'
    ],
    sharpIntangibles: [
      'Reverse Line Movement: Track if public is 70%+ on one side but line moves opposite',
      'Motivational/Situational Spots: Look-ahead games, trap games, revenge spots, division rivalry intensity',
      'Weather Impact: Wind speeds >15mph affect passing/kicking, temperature for outdoor games',
      'Injury News: Focus on "glue" players (O-line, linebackers) not just skill position stars',
      'Days of rest differential (bye week advantage, short week disadvantage)',
      'Travel distance and time zone changes'
    ],
    typicalScoreRange: '17-35 points per team'
  },
  NBA: {
    analyticalMetrics: [
      'Adjusted Net Rating (points per 100 possessions, strength of schedule adjusted)',
      'Pace (possessions per game) - crucial for total projections',
      'True Shooting % (accounts for 3-pointers and free throws)',
      'Effective Field Goal % differential',
      'Rebounding rates (offensive and defensive)',
      'Turnover percentage and points off turnovers',
      'Defensive rating per 100 possessions'
    ],
    sharpIntangibles: [
      'Rest Advantage: Teams on back-to-backs (2nd night) vs well-rested opponents',
      'Days of rest patterns (0, 1, 2, 3+ days)',
      'Cross-country travel and time zone changes (East to West coast)',
      'Load management patterns for star players',
      'Altitude factor (Denver home games)',
      'Referee tendencies: Some refs call more fouls (higher pace/scoring)',
      'Motivational spots: Statement games, playoff positioning'
    ],
    typicalScoreRange: '95-125 points per team'
  },
  MLB: {
    analyticalMetrics: [
      'FIP (Fielding Independent Pitching) for starting pitchers - better than ERA',
      'Bullpen xFIP (expected FIP) and recent workload (innings pitched last 3 days)',
      'wRC+ (Weighted Runs Created Plus) adjusted for ballpark factors',
      'Batting vs. handedness splits (RHP vs LHP)',
      'Team strikeout and walk rates',
      'BABIP (Batting Average on Balls in Play) regression indicators',
      'Bullpen availability and high-leverage reliever usage'
    ],
    sharpIntangibles: [
      'Day game after night game (fatigue factor)',
      'Starting pitcher days of rest (4th vs 5th day)',
      'Bullpen fatigue: Check last 3 games usage',
      'Weather: Wind direction (blowing in/out affects totals significantly)',
      'Ballpark factors: Some parks heavily favor hitters or pitchers',
      'Umpire tendencies: Strike zone size affects runs scored',
      'Divisional familiarity (teams see each other 19 times)'
    ],
    typicalScoreRange: '3-6 runs per team'
  },
  NCAAF: {
    analyticalMetrics: [
      'SP+ ratings (Success Rate and explosiveness combined)',
      'FEI (Frequency, Efficiency, Impact) rankings',
      'Yards per play differential (offensive vs defensive)',
      'Explosive play rate (plays of 15+ yards)',
      'Turnover margin and turnover luck regression',
      'Rushing success rate (critical in college football)',
      'Defensive havoc rate (TFLs, sacks, forced fumbles)'
    ],
    sharpIntangibles: [
      'Conference vs non-conference matchups (motivation levels)',
      'Rivalry game intensity and historical patterns',
      'Bye week preparation advantage',
      'Trap games: Teams looking ahead to marquee matchups',
      'Weather conditions (especially cold, rain for passing teams)',
      'Home field advantage (larger in college - passionate student sections)',
      'Coaching matchup history and tendencies'
    ],
    typicalScoreRange: '14-45 points per team (wide variance)'
  },
  NCAAB: {
    analyticalMetrics: [
      'KenPom rankings: AdjO (Adjusted Offensive Efficiency) and AdjD (Adjusted Defensive Efficiency)',
      'Effective Field Goal % and eFG% defense',
      'Turnover percentage (offensive and defensive)',
      'Offensive and defensive rebounding rates',
      'Free throw rate and opponent free throw rate',
      'Tempo-free statistics (per 100 possessions)',
      'Three-point shooting % and volume'
    ],
    sharpIntangibles: [
      'Conference tournament fatigue (teams playing 4 games in 4 days)',
      'Travel distance for road games',
      'Revenge spots (teams that lost earlier matchup)',
      'Rest days between games (especially during conference play)',
      'Home court advantage: Small gyms can be worth 5-6 points vs large arenas at 3-4 points',
      'Foul trouble and bench depth',
      'Coaching chess match (especially in tournament settings)'
    ],
    typicalScoreRange: '60-80 points per team'
  }
}

const SYSTEM_PROMPT = `You are a Professional Sports Betting Lead Quantitative Analyst and "Sharp" Handicapper.

Your role is to provide rigorous, data-driven betting analysis using advanced statistical modeling and professional handicapping techniques. You approach each matchup with the mindset of a professional bettor seeking +EV (positive expected value) opportunities.

## Core Principles:
1. **Model-Based Projections**: Use sport-specific advanced metrics, NOT simple season averages
2. **Sharp Handicapping**: Identify situational edges the public overlooks
3. **Honesty Over Action**: If there's no clear edge, recommend PASSING on the game
4. **Value-Focused**: A small edge at a good price beats a likely winner at a bad price

## Confidence Rating Scale (1-10):
- **9-10**: "Hammer" play - Extremely rare, multiple converging edges
- **7-8**: Strong edge with solid data support and situational factors aligned
- **5-6**: Moderate edge, proceed with normal sizing
- **3-4**: Slight edge, consider smaller sizing or passing
- **1-2**: No clear edge or insufficient data - PASS on this game

## Critical Rule:
If you cannot identify a clear edge (confidence rating below 5), you MUST set shouldPass to true and explain why there's insufficient evidence to bet this game. Never force a pick when the data doesn't support it.

You MUST respond with ONLY valid JSON matching the exact structure requested. No markdown, no code blocks, just raw JSON.`

function buildPrompt(matchup: MatchupInput): string {
  const { sport, homeTeam, awayTeam, gameDate } = matchup
  const sportKey = sport.toUpperCase().replace(/\s+/g, '')
  const config = SPORT_CONFIG[sportKey] || SPORT_CONFIG['NFL']

  return `## MATCHUP TO ANALYZE

**Sport:** ${sport}
**Matchup:** ${awayTeam} @ ${homeTeam}
**Game Date:** ${gameDate}

---

## PHASE 1: THE ANALYTICAL BASELINE

Use sport-specific advanced modeling to establish a projected score. Do NOT use simple season averages.

**For ${sport}, analyze these key metrics:**
${config.analyticalMetrics.map(m => `• ${m}`).join('\n')}

**Typical Score Range for ${sport}:** ${config.typicalScoreRange}

Build your model projection considering:
- How each team performs in these advanced metrics
- Head-to-head matchup advantages in specific areas
- Expected game script and pace

---

## PHASE 2: THE "SHARP" INTANGIBLES (THE EDGE)

Adjust your baseline using these high-level handicapping factors:

${config.sharpIntangibles.map(f => `• ${f}`).join('\n')}

**Critical Questions to Answer:**
1. Is there Reverse Line Movement? (Public on one side, line moving opposite)
2. What's the motivational/situational spot? (Look-ahead, trap, revenge)
3. Are there high-impact news or weather factors?
4. Where is the "smart money" likely positioned?

---

## PHASE 3: THE OUTPUT

Analyze ${awayTeam} @ ${homeTeam} and respond with ONLY this JSON structure (no markdown, no code blocks):

{
  "modelProjection": {
    "projectedScore": {
      "home": 24,
      "away": 21
    },
    "methodology": "Brief explanation of your Phase 1 modeling approach and key metrics used"
  },
  "sharpAngle": "ONE specific reason the betting market might be wrong about this game (Phase 2 insight)",
  "edgeAnalysis": {
    "marketLine": "Current estimated spread/total",
    "fairLine": "Your calculated fair line based on model",
    "edgePercent": 3.5,
    "publicSide": "Which side the public is betting",
    "sharpSide": "Which side sharp money appears to favor",
    "reverseLineMovement": "If applicable: description of RLM pattern",
    "motivationalSpot": "If applicable: situational edge description",
    "weatherImpact": "If applicable: weather factor impact"
  },
  "predictedWinner": "${homeTeam} or ${awayTeam}",
  "confidence": 75,
  "confidenceRating": 8,
  "predictedScore": {
    "home": 24,
    "away": 21
  },
  "analysis": "2-3 sentences explaining where the betting value is and why",
  "keyFactors": [
    "Primary edge driver from analytics",
    "Secondary supporting factor",
    "Sharp intangible being exploited"
  ],
  "shouldPass": false,
  "recommendedBet": {
    "betType": "spread",
    "selection": "${awayTeam} +3 or Under 45.5",
    "line": -3,
    "reasoning": "Why this specific bet offers the best value given your edge analysis"
  }
}

**IMPORTANT RULES:**
1. **confidenceRating** is 1-10 scale (1=no edge, 10=hammer)
2. **confidence** is percentage 0-100 (for UI compatibility, map from confidenceRating × 10)
3. If confidenceRating < 5, set **shouldPass: true** and set recommendedBet to null
4. When shouldPass is true, explain in analysis WHY there's no clear edge
5. **betType** must be exactly "spread", "moneyline", or "total"
6. Generate realistic scores appropriate for ${sport} (${config.typicalScoreRange})
7. Be brutally honest - passing is better than forcing weak picks
8. All numeric fields in edgeAnalysis are optional - only include if you have data
9. Return ONLY the JSON object, nothing else`
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

  // Use Gemini 2.0 Flash Thinking mode for deeper reasoning
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-thinking-exp',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8000,  // Increased for thinking mode
      responseMimeType: 'application/json'
    }
  })

  const prompt = buildPrompt(matchup)

  console.log('=== GEMINI 2.0 FLASH THINKING MODE PREDICTION REQUEST ===')
  console.log('Model: gemini-2.0-flash-thinking-exp')
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
      // Clean potential markdown artifacts
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      raw = JSON.parse(cleanedResponse)
    } catch {
      throw new PredictionError('parse_error', 'Invalid JSON from Gemini', responseText.substring(0, 200))
    }

    // Build prediction result with new fields
    const prediction: PredictionResult = {
      // Core fields
      predictedWinner: raw.predictedWinner || matchup.homeTeam,
      confidence: Math.max(0, Math.min(100, raw.confidence || (raw.confidenceRating ? raw.confidenceRating * 10 : 50))),
      predictedScore: raw.predictedScore || raw.modelProjection?.projectedScore,
      analysis: raw.analysis || '',
      keyFactors: raw.keyFactors || [],

      // Edge analysis with new optional fields
      edgeAnalysis: raw.edgeAnalysis ? {
        marketLine: raw.edgeAnalysis.marketLine || '',
        fairLine: raw.edgeAnalysis.fairLine || '',
        edgePercent: raw.edgeAnalysis.edgePercent || 0,
        publicSide: raw.edgeAnalysis.publicSide || '',
        sharpSide: raw.edgeAnalysis.sharpSide || '',
        reverseLineMovement: raw.edgeAnalysis.reverseLineMovement,
        motivationalSpot: raw.edgeAnalysis.motivationalSpot,
        weatherImpact: raw.edgeAnalysis.weatherImpact
      } : undefined,

      // Recommended bet (null if shouldPass is true)
      recommendedBet: raw.shouldPass ? undefined : (raw.recommendedBet ? {
        betType: validateBetType(raw.recommendedBet.betType),
        selection: raw.recommendedBet.selection || raw.predictedWinner,
        line: raw.recommendedBet.line,
        reasoning: raw.recommendedBet.reasoning || ''
      } : undefined),

      // New Gemini 3 Thinking Mode fields
      shouldPass: raw.shouldPass || false,
      modelProjection: raw.modelProjection,
      sharpAngle: raw.sharpAngle,
      confidenceRating: raw.confidenceRating
    }

    console.log('=== PARSED PREDICTION ===')
    console.log('Winner:', prediction.predictedWinner)
    console.log('Confidence Rating:', prediction.confidenceRating, '/10')
    console.log('Confidence %:', prediction.confidence, '%')
    console.log('Should Pass:', prediction.shouldPass)
    console.log('Recommended:', prediction.recommendedBet?.selection || 'PASS')
    console.log('Sharp Angle:', prediction.sharpAngle)

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
