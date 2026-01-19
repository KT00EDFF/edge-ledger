# CLAUDE.md - AI Assistant Guide for Edge Ledger

This document provides comprehensive guidance for AI assistants working on the Edge Ledger codebase. It covers architecture, conventions, patterns, and critical gotchas.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Development Setup](#development-setup)
5. [Codebase Structure](#codebase-structure)
6. [Key Patterns & Conventions](#key-patterns--conventions)
7. [State Management](#state-management)
8. [Database & Prisma](#database--prisma)
9. [API Integration](#api-integration)
10. [AI Integration (Gemini)](#ai-integration-gemini)
11. [Critical Gotchas](#critical-gotchas)
12. [Common Tasks](#common-tasks)
13. [Testing Strategy](#testing-strategy)
14. [Deployment](#deployment)

---

## Project Overview

**Edge Ledger** is an AI-powered sports betting analytics and bankroll management platform. It combines real-time odds aggregation, AI predictions, and smart bet sizing to help users make informed betting decisions.

### Core Features

- **AI Predictions**: Gemini 2.0 Flash powered predictions with confidence scoring
- **Odds Aggregation**: Real-time odds from The Odds API across multiple sportsbooks
- **Smart Bet Sizing**: Kelly Criterion and confidence-based sizing
- **Bankroll Management**: Real-time tracking with historical snapshots
- **Multi-Sport Support**: NFL, NBA, MLB, NCAAF, NCAAB
- **Mock Data Mode**: Full functionality without API keys for development

### Key Philosophy

**Graceful Degradation**: The app works perfectly with mock data when API keys are missing. This is intentional and should be preserved.

---

## Architecture

### Next.js App Router Structure

```
edge-ledger/
├── app/                      # Next.js App Router
│   ├── api/                 # API Routes (serverless functions)
│   │   ├── analytics/       # Analytics calculations
│   │   ├── bets/           # Bet CRUD + settlement
│   │   ├── espn/[sport]/   # ESPN scoreboard data
│   │   ├── odds/           # The Odds API integration
│   │   └── predictions/    # AI prediction generation
│   ├── bets/               # Bet history page
│   ├── new-bet/            # Multi-step bet creation
│   ├── settings/           # User settings
│   ├── layout.tsx          # Root layout (dark mode)
│   ├── page.tsx            # Dashboard (home)
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── bets/              # Bet workflow components
│   └── layout/            # Navigation, layout
├── lib/                   # Business logic & utilities
│   ├── gemini.ts          # AI prediction logic
│   ├── odds-api.ts        # The Odds API client
│   ├── sports-mapper.ts   # ESPN API integration
│   ├── bet-sizing.ts      # Kelly Criterion calculations
│   ├── analytics.ts       # Performance analytics
│   ├── settlement.ts      # Bet outcome calculation
│   ├── mock-data.ts       # Mock data generators
│   ├── prisma.ts          # Prisma client singleton
│   ├── env.ts             # Environment validation
│   └── validation.ts      # Zod schemas
├── prisma/
│   └── schema.prisma      # Database schema
├── types/
│   └── index.ts           # TypeScript types
└── [config files]
```

### Architectural Decisions

1. **No src/ directory** - Root-level organization
2. **Client Components everywhere** - All pages use `'use client'` (optimization opportunity)
3. **No Server Components** - Not leveraging RSC benefits (yet)
4. **Path aliases** - `@/*` maps to root directory
5. **Standalone output** - Docker-optimized Next.js builds
6. **Dark mode only** - Hardcoded in root layout

---

## Tech Stack

### Frontend

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5.9** (strict mode)
- **Tailwind CSS 3.4** (utility-first, custom dark theme)
- **Recharts 3.6** (data visualization)

### Backend

- **Next.js API Routes** (serverless)
- **Prisma 6.0** (ORM)
- **PostgreSQL 16** (database)

### External APIs

- **Google Gemini 2.0 Flash** (AI predictions)
- **The Odds API** (live sports odds)
- **ESPN API** (game schedules, public API)

### State Management

- **React Context + useReducer** (primary state management)
- **Local Storage** (settings persistence)

### DevOps

- **Docker** + **Docker Compose** (containerization)
- **Alpine Linux** (base images)

---

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys (optional)

# 3. Start PostgreSQL
docker-compose up db -d

# 4. Run migrations
npx prisma migrate dev

# 5. Generate Prisma client (auto-runs via postinstall)
npm run prisma:generate

# 6. Start dev server
npm run dev

# Access at http://localhost:3000
```

### Docker Development

```bash
# Build and start all services
docker-compose up --build

# Run migrations inside container
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

### Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string

**Optional (app uses mock data if missing):**
- `GOOGLE_API_KEY` - Gemini API key (Note: .env.example says OPENAI_API_KEY but code uses GOOGLE_API_KEY)
- `ODDS_API_KEY` - The Odds API key

**Configuration:**
- `NEXT_PUBLIC_APP_URL` - App URL for client-side
- `NODE_ENV` - development/production/test

---

## Codebase Structure

### Directory Organization

**app/** - Next.js App Router pages and API routes
- Each route is a directory with `page.tsx` or `route.ts`
- All pages are Client Components (`'use client'`)
- API routes follow REST-like conventions

**components/** - React components organized by feature
- `bets/` - Bet creation workflow components
- `layout/` - Navigation, global layout

**lib/** - Business logic, utilities, external integrations
- Pure TypeScript modules (no React)
- Exported functions, no default exports
- Each file has a single responsibility

**prisma/** - Database schema and migrations
- `schema.prisma` - Single source of truth
- Migrations managed with `prisma migrate dev`

**types/** - TypeScript type definitions
- `index.ts` - All shared types in one file
- Interfaces preferred over types

### Import Conventions

```typescript
// Path alias for all imports
import { Component } from '@/components/bets/Component'
import { function } from '@/lib/module'

// External dependencies first
import React from 'react'
import { prisma } from '@/lib/prisma'
```

### File Naming

- **Components**: PascalCase (`BetConfirmation.tsx`)
- **Utilities**: kebab-case (`bet-sizing.ts`)
- **API Routes**: `route.ts`
- **Pages**: `page.tsx`

---

## Key Patterns & Conventions

### API Route Pattern

All API routes follow this structure:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json()

    // 2. Validate input
    if (!requiredField) {
      return NextResponse.json(
        { error: 'Validation error message' },
        { status: 400 }
      )
    }

    // 3. Business logic
    const result = await someOperation()

    // 4. Return success
    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Operation failed:', error)
    return NextResponse.json(
      { error: 'User-friendly error message' },
      { status: 500 }
    )
  }
}
```

**Error Response Shape**: Always `{ error: string }`

**Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Validation error
- `500` - Server error

### Component Pattern

```typescript
'use client'

import React, { useState, useEffect } from 'react'

interface Props {
  // Props definition
}

export default function Component({ prop }: Props) {
  // 1. Hooks
  const [state, setState] = useState()

  // 2. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies])

  // 3. Event handlers
  const handleEvent = async () => {
    try {
      // Handler logic
    } catch (error) {
      // Error handling
    }
  }

  // 4. Render
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  )
}
```

### Error Handling

**API Routes:**
```typescript
try {
  // operation
} catch (error) {
  console.error('Context:', error)
  return NextResponse.json({ error: 'Message' }, { status: 500 })
}
```

**Components:**
```typescript
try {
  const response = await fetch('/api/endpoint')
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Operation failed')
  }

  // Success path
} catch (error) {
  setError(error.message)
}
```

### Mock Data Strategy

Every external API has a mock fallback:

```typescript
// Pattern in /lib modules
export async function fetchData() {
  const apiKey = process.env.API_KEY

  if (!apiKey) {
    console.log('📊 Using mock data')
    await simulateDelay(800)
    return generateMockData()
  }

  try {
    // Real API call
    return realData
  } catch (error) {
    console.log('⚠️ API error, falling back to mock')
    return generateMockData()
  }
}
```

**Mock data is production-quality** - realistic, varied, team-aware.

---

## State Management

### React Context Pattern (Primary)

The app uses **React Context + useReducer**, NOT Zustand (despite it being in package.json).

**Location**: `/lib/new-bet-context.tsx`

**State Shape**:
```typescript
interface NewBetState {
  selectedSport: string
  matchups: NormalizedMatchup[]
  matchupsLoading: boolean
  matchupsError: string | null
  selectedMatchup: NormalizedMatchup | null
  odds: OddsData[]
  oddsLoading: boolean
  oddsError: string | null
  aiEnabled: boolean
  aiPrediction: any | null
  aiLoading: boolean
  aiError: string | null
  betSelection: BetSelection | null
  showConfirmModal: boolean
}
```

**Actions**:
- `SET_SPORT` - Changes sport, resets dependent state
- `SET_MATCHUPS` - Updates game list
- `SELECT_MATCHUP` - Selects game, triggers odds fetch
- `SET_ODDS` - Updates odds data
- `TOGGLE_AI` - Enables/disables AI predictions
- `SET_AI_PREDICTION` - Stores AI prediction
- `SET_BET_SELECTION` - User selects a bet
- `SHOW_CONFIRM_MODAL` - Shows confirmation dialog
- `RESET` - Returns to initial state

**Usage**:
```typescript
// Provider at app level
<NewBetProvider>
  <YourComponent />
</NewBetProvider>

// Hook in components
const { state, dispatch, selectSport, selectMatchup } = useNewBet()
```

### Local State (useState)

Used for:
- UI-specific state (modals, dropdowns)
- Form inputs
- Loading indicators

### Settings Persistence

User settings stored in `localStorage`:
```typescript
localStorage.setItem('edgeLedger_settings', JSON.stringify(settings))
```

---

## Database & Prisma

### Schema Overview

**4 Core Models:**

1. **User** - Bankroll settings
2. **Bet** - Individual bet records
3. **Sportsbook** - Reference data for bookmakers
4. **BankrollSnapshot** - Historical tracking

### User Model

```prisma
model User {
  id                String   @id @default(cuid())
  email             String?  @unique
  startingBankroll  Float    @default(1000)
  currentBankroll   Float    @default(1000)
  minBetSize        Float    @default(10)
  maxBetSize        Float    @default(500)
  useKellyCriterion Boolean  @default(false)

  bets              Bet[]
  sportsbooks       UserSportsbook[]
  snapshots         BankrollSnapshot[]
}
```

### Bet Model

```prisma
model Bet {
  id                String    @id @default(cuid())
  userId            String
  sportsbookId      String

  // Matchup
  sport             String
  homeTeam          String
  awayTeam          String
  gameDate          DateTime

  // Prediction
  prediction        String
  confidence        Float
  aiReasoning       String    @db.Text

  // Odds
  betType           String
  odds              Float
  oddsDecimal       Float?
  line              Float?

  // Bet
  betSize           Float
  potentialPayout   Float

  // Result
  status            String    @default("Pending")
  actualResult      String?
  profit            Float?
  settledAt         DateTime?

  user              User       @relation(fields: [userId], references: [id])
  sportsbook        Sportsbook @relation(fields: [sportsbookId], references: [id])

  @@index([userId, status])
  @@index([sport])
}
```

### Common Patterns

**Singleton Client** (`/lib/prisma.ts`):
```typescript
// Reuse client in development, new instance in production
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Auto-create Default User**:
```typescript
async function getOrCreateDefaultUser() {
  let user = await prisma.user.findFirst({
    where: { email: 'default@edgeledger.app' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'default@edgeledger.app',
        startingBankroll: 1000,
        currentBankroll: 1000
      }
    })
  }

  return user
}
```

**Atomic Bankroll Updates**:
```typescript
// Decrement when placing bet
await prisma.user.update({
  where: { id: user.id },
  data: { currentBankroll: { decrement: betSize } }
})

// Increment when settling bet
await prisma.user.update({
  where: { id: user.id },
  data: { currentBankroll: { increment: payout } }
})
```

**Include Relations**:
```typescript
const bets = await prisma.bet.findMany({
  where: { userId },
  include: { sportsbook: true },
  orderBy: { createdAt: 'desc' }
})
```

### Migrations

**Current State**: No migration files committed (run manually)

**Development Workflow**:
```bash
# Create migration
npx prisma migrate dev --name description

# Generate client (auto-runs on npm install)
npx prisma generate

# View database
npx prisma studio
```

**Production (Docker)**:
```bash
docker-compose exec app npx prisma migrate deploy
```

---

## API Integration

### User API

**Location**: `/app/api/user/route.ts`

**Purpose**: Fetch or create the default user's bankroll information

**Endpoint**:
```typescript
GET /api/user
```

**Response**:
```typescript
{
  id: string
  startingBankroll: number
  currentBankroll: number
  minBetSize: number
  maxBetSize: number
  useKellyCriterion: boolean
}
```

**Implementation Pattern**:
```typescript
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
```

**Usage**:
```typescript
// In components (e.g., dashboard)
const response = await fetch('/api/user')
const user = await response.json()
```

**Notes**:
- Auto-creates default user if none exists
- No authentication required (single-user system)
- Used primarily by dashboard for bankroll display

### The Odds API

**Location**: `/lib/odds-api.ts`, `/app/api/odds/matchup/route.ts`

**Purpose**: Fetch live betting odds for specific matchups

**Request**:
```typescript
GET https://api.the-odds-api.com/v4/sports/{sportKey}/odds
Params:
  - apiKey: process.env.ODDS_API_KEY
  - regions: 'us'
  - markets: 'h2h,spreads,totals'  // Moneyline, spread, totals
  - oddsFormat: 'american'
  - bookmakers: 'draftkings,fanduel,betmgm,...'
```

**Response Transformation**:
```typescript
interface OddsData {
  bookmaker: string
  spreads?: {
    home: { point: number; price: number }
    away: { point: number; price: number }
  }
  moneyline?: {
    home: number
    away: number
  }
  totals?: {
    over: { point: number; price: number }
    under: { point: number; price: number }
  }
}
```

**Team Matching** (fuzzy):
```typescript
// ESPN teams vs The Odds API teams may differ slightly
const game = response.data.find(g => {
  const gameHome = g.home_team.toLowerCase()
  const gameAway = g.away_team.toLowerCase()
  return (
    (gameHome.includes(homeTeamLower) || homeTeamLower.includes(gameHome)) &&
    (gameAway.includes(awayTeamLower) || awayTeamLower.includes(gameAway))
  )
})
```

**Mock Fallback**: Automatic if API key missing or error occurs

### ESPN API

**Location**: `/lib/sports-mapper.ts`, `/app/api/espn/[sport]/route.ts`

**Purpose**: Fetch game schedules and team data

**Public API** (no key required):
```typescript
GET https://site.api.espn.com/apis/site/v2/sports/{espnSport}/{espnLeague}/scoreboard
Params:
  - dates: YYYYMMDD or YYYYMMDD-YYYYMMDD (optional)
```

**Sport Mapping**:
```typescript
SUPPORTED_SPORTS = [
  { key: 'nfl', espnSport: 'football', espnLeague: 'nfl' },
  { key: 'nba', espnSport: 'basketball', espnLeague: 'nba' },
  { key: 'mlb', espnSport: 'baseball', espnLeague: 'mlb' },
  { key: 'ncaaf', espnSport: 'football', espnLeague: 'college-football' },
  { key: 'ncaab', espnSport: 'basketball', espnLeague: 'mens-college-basketball' }
]
```

**Game Filtering**:
```typescript
// Only show upcoming games
.filter(event => {
  const statusName = event.status?.type?.name
  const isNotCompleted = statusName !== 'STATUS_FINAL'
  const isNotInProgress = statusName !== 'STATUS_IN_PROGRESS'
  const hasNotStarted = gameDate > now
  return isNotCompleted && (isNotInProgress || hasNotStarted)
})
```

**Normalized Output**:
```typescript
interface NormalizedMatchup {
  id: string
  sportKey: string
  homeTeam: { name, shortName, logo }
  awayTeam: { name, shortName, logo }
  startTime: string  // ISO format
  status: string
  venue?: string
}
```

**Error Handling**: Returns empty array on error (no fallback data)

---

## AI Integration (Gemini)

### Overview

The app uses **Google Gemini 2.0 Flash** for AI-powered predictions. The `.env.example` file correctly uses `GOOGLE_API_KEY`.

### Location

**File**: `/lib/gemini.ts`

### Model Configuration

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000,
    responseMimeType: 'application/json'  // Forces JSON
  }
})
```

### Prediction Flow

1. **Build Context** - Sport-specific metrics, situational factors
2. **Generate Prompt** - Matchup details + analysis framework
3. **Call API** - Gemini generates prediction as JSON
4. **Parse Response** - Clean markdown artifacts, validate JSON
5. **Return Prediction** - Structured prediction object

### Prompt Engineering

**Sport-Specific Configuration**:
```typescript
SPORT_CONFIG = {
  NFL: {
    keyMetrics: ['DVOA', 'EPA/play', 'Success Rate', 'Turnover Differential'],
    situationalFactors: ['Rest advantage', 'Weather', 'Divisional matchup'],
    keyNumbers: [3, 7, 10, 14],  // Critical NFL margins
    publicBiases: ['Home favorites', 'Big brands', 'Overs']
  },
  // ... NBA, MLB, NCAAF, NCAAB
}
```

**System Prompt Philosophy**:
- "Value Over Winners" - Find mispriced lines
- "Contrarian Thinking" - Fade public sentiment
- Confidence based on edge size, not arbitrary
- Forces structured JSON output

**Expected Response**:
```json
{
  "predictedWinner": "Kansas City Chiefs",
  "confidence": 72,
  "predictedScore": { "home": 27, "away": 24 },
  "edgeAnalysis": {
    "pregameSpread": -3.5,
    "impliedSpread": -4.2,
    "edge": 0.7,
    "valueRating": "Moderate"
  },
  "analysis": "Detailed reasoning...",
  "keyFactors": ["Factor 1", "Factor 2"],
  "recommendedBet": {
    "betType": "spread",
    "selection": "Chiefs -3.5",
    "line": -3.5,
    "reasoning": "..."
  }
}
```

### Error Types

```typescript
class PredictionError extends Error {
  type: 'quota_exceeded' | 'api_key_missing' | 'api_error' | 'parse_error'
  details?: string
}
```

**Handling**:
- `quota_exceeded` - Google API quota exhausted
- `api_key_missing` - No `GOOGLE_API_KEY` env var
- `api_error` - Network/API failure
- `parse_error` - Invalid JSON response

**No automatic mock fallback** - Errors bubble to UI

### Response Parsing

```typescript
// Clean markdown code blocks if AI disobeys
const cleanedResponse = responseText
  .replace(/```json\n?/g, '')
  .replace(/```\n?/g, '')
  .trim()

const raw = JSON.parse(cleanedResponse)
```

---

## Critical Gotchas

### 1. ~~Zustand is NOT Used~~ ✅ FIXED

**Issue**: `zustand` was in `package.json` but NEVER imported/used anywhere.

**Reality**: State management uses React Context + useReducer.

**Resolution**: Removed from dependencies along with `openai`, `react-hook-form`, and `@tanstack/react-query`.

### 2. ~~Gemini, Not OpenAI~~ ✅ FIXED

**Issue**: `.env.example` said `OPENAI_API_KEY` and `openai` package was installed.

**Reality**: Code uses `@google/generative-ai` and reads `GOOGLE_API_KEY`.

**Resolution**: Updated `.env.example` to use `GOOGLE_API_KEY` with correct documentation link. Removed unused `openai` package.

### 3. No Migration Files

**Issue**: `/prisma/` directory has no migration files.

**Reality**: Migrations run manually, not committed to git.

**Action**: Always run `npx prisma migrate dev` after pulling schema changes.

### 4. All Pages are Client Components

**Issue**: Every page has `'use client'` directive.

**Reality**: No Server Components used, missing RSC benefits.

**Opportunity**: Could optimize by making pages Server Components where possible.

### 5. ~~Form Libraries Not Used~~ ✅ FIXED

**Issue**: `react-hook-form` and `zod` were installed.

**Reality**:
- `zod` only used for API-side validation
- `react-hook-form` NOT used anywhere
- Forms use plain controlled inputs with `useState`

**Resolution**: Removed `react-hook-form` from dependencies. Kept `zod` as it's used for API validation.

### 6. ~~TanStack Query Not Used~~ ✅ FIXED

**Issue**: `@tanstack/react-query` was installed.

**Reality**: NOT used anywhere, manual `fetch` calls instead.

**Resolution**: Removed from dependencies.

### 7. Single User System

**Issue**: No authentication/authorization.

**Reality**: Auto-creates `default@edgeledger.app` user on first use.

**Action**: If adding multi-user support, need full auth system.

### 8. No Tests

**Issue**: No test files or framework configured.

**Reality**: Zero test coverage.

**Action**: Would need to add Jest/Vitest + React Testing Library from scratch.

### 9. Console Logging Only

**Issue**: All logging uses `console.log`, `console.error`.

**Reality**: No structured logging library.

**Action**: For production, consider Pino, Winston, or similar.

### 10. ~~Manual Docker Migrations~~ ✅ FIXED

**Issue**: After `docker-compose up`, app crashed until migrations were run manually.

**Reality**: Previously required manual `docker-compose exec app npx prisma migrate deploy`.

**Resolution**: Created `docker-entrypoint.sh` script that:
- Waits for database to be ready
- Automatically runs migrations on container start
- Then starts the Next.js server

No manual intervention required anymore.

### 11. Dashboard Components Defined Inline

**Issue**: Dashboard has multiple reusable components (StatCard, TimeFilter).

**Reality**: Components are defined inline within `/app/page.tsx` instead of extracted to `/components/`.

**Opportunity**: Could extract for reusability and cleaner code organization.

### 12. Non-Functional Time Filter

**Issue**: Dashboard has time filter buttons (1D, 1W, 1M, 1Y, All).

**Reality**: UI is rendered but has no click handlers or filtering logic.

**Action**: Time filtering is a placeholder for future implementation.

### 13. Client-Side Analytics Calculations

**Issue**: Analytics (P/L, ROI, win rate) recalculated on every render.

**Reality**: No memoization or server-side calculation used.

**Opportunity**: Could optimize with `useMemo` or move to API route for better performance.

---

## Common Tasks

### Adding a New Sport

1. **Update** `/lib/sports-mapper.ts`:
   ```typescript
   SUPPORTED_SPORTS.push({
     key: 'nhl',
     espnSport: 'hockey',
     espnLeague: 'nhl'
   })
   ```

2. **Add sport config** in `/lib/gemini.ts`:
   ```typescript
   NHL: {
     keyMetrics: ['xG', 'Save %', 'PP%'],
     situationalFactors: ['Back-to-back', 'Home ice'],
     keyNumbers: [1],
     publicBiases: ['Original Six teams']
   }
   ```

3. **Update UI** in `/components/bets/SportsSwitcher.tsx`

### Adding a New Sportsbook

1. **Update** `/lib/sportsbooks.ts`:
   ```typescript
   AVAILABLE_SPORTSBOOKS.push({
     id: 'new-book',
     name: 'New Sportsbook',
     apiKey: 'new_sportsbook_api_key'
   })
   ```

2. **Seed database**:
   ```typescript
   await prisma.sportsbook.create({
     data: { name: 'New Sportsbook', apiKey: 'new_book' }
   })
   ```

### Modifying AI Prompt

1. **Edit** `/lib/gemini.ts` - `generatePrediction()` function
2. **Test with various matchups** to ensure JSON parsing works
3. **Update type definitions** in `/types/index.ts` if response shape changes

### Adding a New API Route

1. **Create** `/app/api/your-route/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server'

   export async function GET(request: NextRequest) {
     try {
       // Your logic
       return NextResponse.json(data)
     } catch (error) {
       return NextResponse.json({ error: 'Message' }, { status: 500 })
     }
   }
   ```

2. **Call from component**:
   ```typescript
   const response = await fetch('/api/your-route')
   const data = await response.json()
   ```

### Updating Database Schema

1. **Edit** `/prisma/schema.prisma`
2. **Create migration**:
   ```bash
   npx prisma migrate dev --name description
   ```
3. **Client auto-regenerates** via postinstall hook
4. **Update TypeScript types** in `/types/index.ts` if needed

### Adding a New Page

1. **Create** `/app/your-page/page.tsx`:
   ```typescript
   'use client'

   export default function YourPage() {
     return <div>Your page</div>
   }
   ```

2. **Add navigation** in `/components/layout/Navbar.tsx`

### Fetching and Displaying Real Data (Dashboard Pattern)

The dashboard (`/app/page.tsx`) demonstrates the standard pattern for fetching and displaying real data.

**Pattern**:
```typescript
'use client'

interface User {
  id: string
  startingBankroll: number
  currentBankroll: number
}

interface Bet {
  // ... bet fields
  status: string
  profit: number | null
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Parallel API calls for performance
        const [userRes, betsRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/bets?userId=default-user')
        ])

        if (!userRes.ok || !betsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const userData = await userRes.json()
        const betsData = await betsRes.json()

        setUser(userData)
        setBets(betsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      {/* Render data */}
    </div>
  )
}
```

**Key Points**:
- Use `Promise.all()` for parallel API calls when data is independent
- Handle loading state with spinner UI
- Error handling with try/catch and console logging
- Single useEffect with empty dependency array for initial load

### Calculating Client-Side Analytics

The dashboard demonstrates client-side analytics calculation from fetched bet data.

**Pattern**:
```typescript
// Filter bets by status
const settledBets = bets.filter(b =>
  b.status === 'Won' || b.status === 'Lost' || b.status === 'Push'
)
const wonBets = bets.filter(b => b.status === 'Won')
const pendingBets = bets.filter(b => b.status === 'Pending')

// Calculate metrics
const totalPL = settledBets.reduce((sum, bet) => sum + (bet.profit || 0), 0)
const winRate = settledBets.length > 0
  ? (wonBets.length / settledBets.length) * 100
  : 0
const totalWagered = settledBets.reduce((sum, bet) => sum + bet.betSize, 0)
const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0
const avgConfidence = bets.length > 0
  ? bets.reduce((sum, bet) => sum + bet.confidence, 0) / bets.length
  : 0
```

**Status Color Coding**:
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Won': return 'text-accent-green bg-accent-green/20'
    case 'Lost': return 'text-red-400 bg-red-400/20'
    case 'Push': return 'text-yellow-400 bg-yellow-400/20'
    default: return 'text-accent-blue bg-accent-blue/20'
  }
}
```

**Component Pattern (Inline)**:
```typescript
// Dashboard defines components inline rather than in /components
function StatCard({
  label,
  value,
  change,
  subtext
}: {
  label: string
  value: string | number
  change?: number
  subtext?: string
}) {
  return (
    <div className="dark-card p-6">
      <p className="text-sm text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {change !== undefined && (
        <p className={`text-sm ${change >= 0 ? 'text-accent-green' : 'text-red-400'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </p>
      )}
      {subtext && <p className="text-xs text-text-secondary mt-1">{subtext}</p>}
    </div>
  )
}
```

**Notes**:
- Analytics calculated on every render (could be optimized with useMemo)
- Components defined inline in page rather than extracted to /components
- Time filter UI present but non-functional (no state handlers)

---

## Testing Strategy

### Current State

**NO TESTS** - Zero test coverage, no framework configured.

### Recommended Approach

1. **Unit Tests** (Vitest or Jest):
   - `/lib/bet-sizing.ts` - Kelly Criterion calculations
   - `/lib/analytics.ts` - Win rate, ROI calculations
   - `/lib/best-odds.ts` - Odds comparison logic

2. **Integration Tests**:
   - API routes (`/app/api/**/route.ts`)
   - Database operations (with test database)

3. **E2E Tests** (Playwright):
   - Complete bet placement workflow
   - Settings update and persistence
   - Bet settlement flow

### Setup Steps

```bash
# Install Vitest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Create vitest.config.ts
# Create __tests__/ directories
# Write first test
```

---

## Deployment

### Docker Production

```bash
# Build optimized image
docker-compose build

# Start in production mode
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Set environment variables**:
   - `DATABASE_URL` (use Vercel Postgres or external)
   - `GOOGLE_API_KEY`
   - `ODDS_API_KEY`
3. **Deploy** - Vercel auto-detects Next.js
4. **Run migrations** via Vercel CLI or manual script

### Environment Checklist

**Production**:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Rotate API keys regularly
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Enable HTTPS
- [ ] Set CORS policies if needed

---

## Additional Resources

- **README.md** - User-facing setup guide
- **SECURITY.md** - Security best practices
- **BUILD_LOG.md** - Development history
- **GETTING_STARTED.md** - Quick start tutorial
- **Prisma Docs** - https://www.prisma.io/docs
- **Next.js Docs** - https://nextjs.org/docs
- **Gemini API Docs** - https://ai.google.dev/docs
- **The Odds API Docs** - https://the-odds-api.com/liveapi/guides/v4

---

## File Change Frequency

**Most Frequently Modified**:
1. `/app/page.tsx` - Dashboard UI and analytics
2. `/lib/gemini.ts` - AI prompt tuning
3. `/components/bets/AiInsightsPanel.tsx` - Prediction UI
4. `/lib/sports-mapper.ts` - ESPN data parsing
5. `/app/api/bets/route.ts` - Bet creation logic
6. `/lib/settlement.ts` - Settlement logic

**Configuration Files**:
1. `.env.local` - API keys (never commit!)
2. `prisma/schema.prisma` - Database schema
3. `tailwind.config.ts` - Design system
4. `next.config.js` - Next.js settings

**API Routes**:
1. `/app/api/user/route.ts` - User data endpoint
2. `/app/api/bets/route.ts` - Bet CRUD operations
3. `/app/api/predictions/route.ts` - AI predictions
4. `/app/api/odds/matchup/route.ts` - Live odds fetching

---

## Code Style

### TypeScript

- **Strict mode enabled**
- **Interfaces over types** (mostly)
- **Optional chaining** used liberally (`?.`)
- **Type assertions** minimal

### Naming Conventions

- **Variables/Functions**: `camelCase`
- **Components/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Files**: Component files `PascalCase.tsx`, utilities `kebab-case.ts`

### Tailwind CSS

- **Utility-first approach**
- **Custom classes** in `globals.css` via `@layer components`
- **Responsive design**: Mobile-first with `sm:`, `md:`, `lg:` prefixes
- **Dark theme**: Custom color system (`dark-bg`, `dark-card`, `dark-border`)

### Comments

- **Why, not what** - Code should be self-documenting
- **Complex logic** gets explanation
- **TODO comments** for known issues/improvements
- **API documentation** above public functions

---

## Architecture Strengths

1. **Graceful Degradation** - Works perfectly without API keys
2. **Type Safety** - Full TypeScript coverage
3. **Clean Separation** - API routes, business logic, UI components
4. **Docker-Ready** - Production deployment simplified
5. **Extensible** - Easy to add sports, sportsbooks, features

## Architecture Weaknesses

1. **No Authentication** - Single user system
2. **No Tests** - Zero coverage
3. **No Caching** - API calls not cached
4. **Client-Heavy** - Missing Server Component benefits
5. **Manual Migrations** - Not automated in Docker
6. **Console Logging** - No structured logging

---

## Final Notes for AI Assistants

### When Adding Features

1. **Preserve mock data fallbacks** - Critical for development
2. **Update relevant types** in `/types/index.ts`
3. **Follow existing patterns** - Don't introduce new paradigms
4. **Test both real and mock modes** - Ensure graceful degradation
5. **Update this file** if you change architecture

### When Debugging

1. **Check environment variables** first
2. **Look for console errors** in browser and terminal
3. **Verify database connection** - Most common issue
4. **Check API key validity** - Quota limits, expiration
5. **Review recent git commits** - What changed?

### When Refactoring

1. **Add tests first** - Protect against regressions
2. **One change at a time** - Easier to debug
3. **Update documentation** - Keep this file current
4. **Consider backward compatibility** - Existing data
5. **Test Docker build** - Ensure deployment works

---

**Last Updated**: 2026-01-19

**Recent Fixes**: Fixed 5 critical gotchas:
- ✅ Removed unused dependencies (Zustand, OpenAI, react-hook-form, TanStack Query)
- ✅ Updated .env.example to use GOOGLE_API_KEY instead of OPENAI_API_KEY
- ✅ Automated Docker migrations with entrypoint script

This document should be updated whenever significant architectural changes are made to the codebase.
