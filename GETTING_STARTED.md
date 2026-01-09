# Getting Started with Edge Ledger

Welcome! This guide will get you up and running with Edge Ledger in under 5 minutes.

## 🚀 Quick Start (Docker - Recommended)

### Step 1: Start the Application

```bash
# Navigate to the project directory
cd edge-ledger

# Start Docker containers
docker-compose up --build
```

Wait for the build to complete. You'll see output like:
```
app_1  | ready - started server on 0.0.0.0:3000
db_1   | database system is ready to accept connections
```

### Step 2: Initialize the Database

In a new terminal:

```bash
# Run database migrations
docker-compose exec app npx prisma migrate dev --name init
```

###Step 3: Open the App

Visit http://localhost:3000 in your browser!

You're now running with **mock data** (no API keys needed).

---

## 🔑 Adding Real API Keys (Optional)

### 1. Get Your API Keys

**OpenAI (for AI predictions):**
- Visit https://platform.openai.com
- Sign up and create an API key
- Free tier available!

**The Odds API (for real-time odds):**
- Visit https://the-odds-api.com
- Sign up for free account
- Get your API key from dashboard

### 2. Configure Environment

```bash
# Edit .env.local file
nano .env.local  # or use your favorite editor

# Add your keys:
OPENAI_API_KEY=sk-your-key-here
ODDS_API_KEY=your-odds-key-here

# Save and exit
```

### 3. Restart the Application

```bash
docker-compose restart app
```

Now you have **real AI predictions** and **live odds**!

---

## 📱 Using the Application

### Create Your First Bet

1. **Navigate to "New Bet"** from the top menu

2. **Enter Matchup Details:**
   - Select sport (NFL, NBA, MLB, etc.)
   - Enter home team name
   - Enter away team name
   - Select game date/time

3. **Get AI Prediction:**
   - View AI analysis and confidence level
   - Review key factors and reasoning
   - Continue to odds

4. **Select Best Odds:**
   - Compare odds across sportsbooks
   - Choose bet type (Moneyline/Spread/Total)
   - Select your preferred odds

5. **Confirm Bet:**
   - Review recommended bet size
   - Adjust if desired
   - Place the bet!

### View Dashboard

- See current bankroll
- Track performance metrics
- View recent bets
- Monitor win rate and ROI

### Configure Settings

- Set starting bankroll
- Configure min/max bet sizes
- Select your sportsbooks
- Enable Kelly Criterion (optional)

---

## 🛠️ Development Mode

Want to develop locally without Docker?

```bash
# Install dependencies
npm install

# Start PostgreSQL via Docker
docker-compose up db -d

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## 📊 Understanding Mock Data Mode

When API keys are not configured, the app uses **realistic mock data**:

### Mock Predictions
- Randomized confidence levels (65-95%)
- Realistic reasoning and analysis
- Clearly labeled as mock data

### Mock Odds
- Generated odds from 3 sportsbooks
- Realistic American odds format
- Moneyline, spread, and total options

### Full Functionality
- All features work identically
- Create bets, track performance
- Analyze statistics
- Test the application risk-free!

---

## 🎯 Next Steps

### Customize Your Experience

1. **Set Your Bankroll:**
   - Go to Settings
   - Configure starting bankroll
   - Set min/max bet sizes

2. **Select Your Sportsbooks:**
   - Choose which books you use
   - App will show best odds from your books only

3. **Place Some Bets:**
   - Try different sports
   - Test various bet types
   - See how the analytics work

### Explore Features

- **Dashboard Analytics:** Track your performance over time
- **Bet History:** Review past predictions and results
- **Bankroll Tracking:** See your bankroll growth/decline
- **Win Rate Analysis:** Understand what's working

---

## ❓ Common Questions

### Do I need API keys to use the app?

**No!** The app works perfectly with mock data. API keys are only needed for:
- Real AI predictions (vs mock predictions)
- Live odds (vs generated odds)

### How do I stop the application?

```bash
# Stop containers
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### How do I view logs?

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db
```

### How do I reset the database?

```bash
# Stop containers
docker-compose down

# Remove volumes
docker volume rm edge-ledger_postgres_data

# Start fresh
docker-compose up --build
docker-compose exec app npx prisma migrate dev
```

### The app won't start, what should I do?

```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

---

## 📚 Additional Resources

- **Full Documentation:** See `README.md`
- **Build Details:** See `BUILD_LOG.md`
- **Security:** See `SECURITY.md`

---

## 🆘 Getting Help

### Troubleshooting

1. **Port 3000 already in use:**
   ```bash
   # Change port in docker-compose.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Database connection errors:**
   ```bash
   # Check database is running
   docker-compose ps

   # Restart database
   docker-compose restart db
   ```

3. **Permission errors:**
   ```bash
   # On Linux/Mac, fix permissions
   sudo chown -R $USER:$USER .
   ```

### Still Stuck?

- Check existing GitHub issues
- Review error logs: `docker-compose logs`
- Verify `.env.local` configuration

---

## 🎉 You're Ready!

That's it! You're now ready to:
- ✅ Create AI-powered betting predictions
- ✅ Compare odds across sportsbooks
- ✅ Track your bankroll and performance
- ✅ Analyze your betting statistics

**Enjoy using Edge Ledger!** 🎲📊

---

*Questions? Check out the full README.md for detailed information.*
