# Edge Ledger - Sports Betting Analytics Platform

AI-powered sports betting analytics and prediction platform with real-time odds aggregation and bankroll management.

## Features

- **AI Predictions**: Gemini powered match outcome predictions with confidence levels
- **Odds Aggregation**: Real-time odds from multiple sportsbooks via The Odds API
- **Smart Bet Sizing**: Automatic bet size calculation based on confidence and bankroll
- **Bankroll Tracking**: Real-time bankroll management and performance analytics
- **Comprehensive Dashboard**: Visualize performance, win rates, and profitability
- **Mock Data Mode**: Full functionality without API keys for development

## Quick Start with Docker

### Prerequisites

- Docker & Docker Compose installed
- (Optional) API keys for OpenAI and The Odds API

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd edge-ledger
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local` and add your API keys** (optional):
   - `OPENAI_API_KEY`: Get from https://platform.openai.com/api-keys
   - `ODDS_API_KEY`: Get from https://the-odds-api.com

   > **Note:** The application works with mock data if API keys are not configured!

4. **Start the application**
   ```bash
   docker-compose up --build
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec app npx prisma migrate dev
   ```

6. **Access the app**
   Open http://localhost:3000 in your browser

## Development Mode (without Docker)

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up db -d
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Access the app**
   Open http://localhost:3000

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Docker
npm run docker:build     # Build Docker images
npm run docker:up        # Start containers in background
npm run docker:down      # Stop containers
npm run docker:logs      # View application logs

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
```

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Relational database

### External APIs
- **OpenAI API** (GPT-4) - AI-powered predictions
- **The Odds API** - Real-time sports odds

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/edge_ledger"

# API Keys (optional - app uses mock data if not provided)
OPENAI_API_KEY="sk-..."
ODDS_API_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

## Mock Data Mode

The application automatically detects missing API keys and uses mock data:

- **Mock Predictions**: Simulated AI predictions with realistic confidence levels
- **Mock Odds**: Generated odds from DraftKings, FanDuel, and BetMGM
- **Full Functionality**: All features work identically with mock data

This allows you to:
- Develop and test without API costs
- Demo the application without real API keys
- Transition to real APIs by simply adding keys to `.env.local`

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User** - Bankroll settings and preferences
- **Bet** - Bet details, predictions, and results
- **Sportsbook** - Available sportsbooks
- **BankrollSnapshot** - Historical bankroll tracking

See `prisma/schema.prisma` for complete schema.

## Security Features

✅ **Environment Variables**: All secrets stored securely, never committed
✅ **Input Validation**: Zod schemas for all user inputs
✅ **Docker Security**: Non-root user, isolated network
✅ **Type Safety**: Full TypeScript coverage
✅ **API Security**: Error handling without exposing internals

See `SECURITY.md` for detailed security documentation.

## Project Structure

```
edge-ledger/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── new-bet/           # New bet workflow
│   ├── bets/              # Bet history
│   ├── settings/          # User settings
│   └── page.tsx           # Dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dashboard/        # Dashboard components
│   ├── bets/             # Bet-related components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── prisma.ts        # Prisma client
│   ├── openai.ts        # OpenAI integration
│   ├── odds-api.ts      # Odds API integration
│   ├── bet-sizing.ts    # Bet sizing logic
│   ├── analytics.ts     # Analytics calculations
│   ├── validation.ts    # Input validation
│   ├── env.ts           # Environment validation
│   └── mock-data.ts     # Mock data generation
├── prisma/              # Database schema and migrations
├── types/               # TypeScript type definitions
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Multi-container setup
└── .env.local           # Environment variables (gitignored)
```

## Deployment

### Docker Deployment

```bash
# Build and start containers
docker-compose up --build -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

### Cloud Deployment

The application is ready for deployment to:
- **Vercel** (frontend + API routes)
- **Railway** / **Render** (full stack with PostgreSQL)
- **AWS** / **GCP** / **Azure** (containerized deployment)

Configure environment variables in your deployment platform.

## Troubleshooting

### Docker Issues

**Container won't start:**
```bash
docker-compose down
docker-compose up --build
```

**Database connection errors:**
```bash
# Check if database is running
docker-compose ps

# View database logs
docker-compose logs db
```

### Development Issues

**Prisma errors:**
```bash
# Regenerate Prisma client
npm run prisma:generate

# Reset database
npx prisma migrate reset
```

**Port already in use:**
```bash
# Change port in .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3001
# Or kill process using port 3000
```

## Getting API Keys

### OpenAI API
1. Visit https://platform.openai.com
2. Create an account
3. Generate an API key at https://platform.openai.com/api-keys
4. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

### The Odds API
1. Visit https://the-odds-api.com
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env.local`: `ODDS_API_KEY=...`

> **Note:** Free tiers are available for both APIs!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing documentation in `/docs`
- Review `BUILD_LOG.md` for development notes

## Roadmap

- [ ] Multi-user support with authentication
- [ ] Parlay/multi-bet support
- [ ] Live odds tracking with notifications
- [ ] Machine learning model training
- [ ] Mobile app (React Native)
- [ ] Social features and leaderboards

---

Built with ❤️ using Next.js, TypeScript, and AI
