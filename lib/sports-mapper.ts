export interface SportConfig {
  key: string
  name: string
  espnSport: string
  espnLeague: string
  oddsApiKey: string
  icon: string
}

export const SUPPORTED_SPORTS: SportConfig[] = [
  {
    key: 'nfl',
    name: 'NFL',
    espnSport: 'football',
    espnLeague: 'nfl',
    oddsApiKey: 'americanfootball_nfl',
    icon: '🏈'
  },
  {
    key: 'nba',
    name: 'NBA',
    espnSport: 'basketball',
    espnLeague: 'nba',
    oddsApiKey: 'basketball_nba',
    icon: '🏀'
  },
  {
    key: 'mlb',
    name: 'MLB',
    espnSport: 'baseball',
    espnLeague: 'mlb',
    oddsApiKey: 'baseball_mlb',
    icon: '⚾'
  },
  {
    key: 'ncaaf',
    name: 'NCAAF',
    espnSport: 'football',
    espnLeague: 'college-football',
    oddsApiKey: 'americanfootball_ncaaf',
    icon: '🏈'
  },
  {
    key: 'ncaab',
    name: 'NCAAB',
    espnSport: 'basketball',
    espnLeague: 'mens-college-basketball',
    oddsApiKey: 'basketball_ncaab',
    icon: '🏀'
  }
]

export function getSportConfig(key: string): SportConfig | undefined {
  return SUPPORTED_SPORTS.find(s => s.key === key)
}

export function getEspnEndpoint(sportKey: string, date?: string): string {
  const sport = getSportConfig(sportKey)
  if (!sport) return ''
  
  let url = `https://site.api.espn.com/apis/site/v2/sports/${sport.espnSport}/${sport.espnLeague}/scoreboard`
  if (date) {
    url += `?dates=${date}`
  }
  return url
}

const TEAM_NAME_ALIASES: Record<string, string[]> = {
  'Arizona Cardinals': ['Cardinals', 'ARI'],
  'Atlanta Falcons': ['Falcons', 'ATL'],
  'Baltimore Ravens': ['Ravens', 'BAL'],
  'Buffalo Bills': ['Bills', 'BUF'],
  'Carolina Panthers': ['Panthers', 'CAR'],
  'Chicago Bears': ['Bears', 'CHI'],
  'Cincinnati Bengals': ['Bengals', 'CIN'],
  'Cleveland Browns': ['Browns', 'CLE'],
  'Dallas Cowboys': ['Cowboys', 'DAL'],
  'Denver Broncos': ['Broncos', 'DEN'],
  'Detroit Lions': ['Lions', 'DET'],
  'Green Bay Packers': ['Packers', 'GB'],
  'Houston Texans': ['Texans', 'HOU'],
  'Indianapolis Colts': ['Colts', 'IND'],
  'Jacksonville Jaguars': ['Jaguars', 'JAX'],
  'Kansas City Chiefs': ['Chiefs', 'KC'],
  'Las Vegas Raiders': ['Raiders', 'LV', 'LAV'],
  'Los Angeles Chargers': ['Chargers', 'LAC'],
  'Los Angeles Rams': ['Rams', 'LAR'],
  'Miami Dolphins': ['Dolphins', 'MIA'],
  'Minnesota Vikings': ['Vikings', 'MIN'],
  'New England Patriots': ['Patriots', 'NE'],
  'New Orleans Saints': ['Saints', 'NO'],
  'New York Giants': ['Giants', 'NYG'],
  'New York Jets': ['Jets', 'NYJ'],
  'Philadelphia Eagles': ['Eagles', 'PHI'],
  'Pittsburgh Steelers': ['Steelers', 'PIT'],
  'San Francisco 49ers': ['49ers', 'SF'],
  'Seattle Seahawks': ['Seahawks', 'SEA'],
  'Tampa Bay Buccaneers': ['Buccaneers', 'TB'],
  'Tennessee Titans': ['Titans', 'TEN'],
  'Washington Commanders': ['Commanders', 'WAS', 'WSH'],
  'Atlanta Hawks': ['Hawks'],
  'Boston Celtics': ['Celtics', 'BOS'],
  'Brooklyn Nets': ['Nets', 'BKN'],
  'Charlotte Hornets': ['Hornets', 'CHA'],
  'Chicago Bulls': ['Bulls'],
  'Cleveland Cavaliers': ['Cavaliers', 'Cavs', 'CLE'],
  'Dallas Mavericks': ['Mavericks', 'Mavs', 'DAL'],
  'Denver Nuggets': ['Nuggets', 'DEN'],
  'Detroit Pistons': ['Pistons', 'DET'],
  'Golden State Warriors': ['Warriors', 'GSW', 'GS'],
  'Houston Rockets': ['Rockets', 'HOU'],
  'Indiana Pacers': ['Pacers', 'IND'],
  'LA Clippers': ['Clippers', 'LAC'],
  'Los Angeles Lakers': ['Lakers', 'LAL'],
  'Memphis Grizzlies': ['Grizzlies', 'MEM'],
  'Miami Heat': ['Heat', 'MIA'],
  'Milwaukee Bucks': ['Bucks', 'MIL'],
  'Minnesota Timberwolves': ['Timberwolves', 'Wolves', 'MIN'],
  'New Orleans Pelicans': ['Pelicans', 'NOP'],
  'New York Knicks': ['Knicks', 'NYK'],
  'Oklahoma City Thunder': ['Thunder', 'OKC'],
  'Orlando Magic': ['Magic', 'ORL'],
  'Philadelphia 76ers': ['76ers', 'Sixers', 'PHI'],
  'Phoenix Suns': ['Suns', 'PHX'],
  'Portland Trail Blazers': ['Trail Blazers', 'Blazers', 'POR'],
  'Sacramento Kings': ['Kings', 'SAC'],
  'San Antonio Spurs': ['Spurs', 'SAS'],
  'Toronto Raptors': ['Raptors', 'TOR'],
  'Utah Jazz': ['Jazz', 'UTA'],
  'Washington Wizards': ['Wizards', 'WAS'],
}

export function normalizeTeamName(espnName: string): string {
  for (const [fullName, aliases] of Object.entries(TEAM_NAME_ALIASES)) {
    if (fullName.toLowerCase() === espnName.toLowerCase()) {
      return fullName
    }
    for (const alias of aliases) {
      if (alias.toLowerCase() === espnName.toLowerCase()) {
        return fullName
      }
    }
  }
  return espnName
}

export function findTeamMatch(espnTeam: string, oddsTeam: string): boolean {
  const normalizedEspn = normalizeTeamName(espnTeam).toLowerCase()
  const normalizedOdds = normalizeTeamName(oddsTeam).toLowerCase()
  
  if (normalizedEspn === normalizedOdds) return true
  
  const espnWords = normalizedEspn.split(' ')
  const oddsWords = normalizedOdds.split(' ')
  
  for (const word of espnWords) {
    if (word.length > 3 && oddsWords.some(w => w.includes(word) || word.includes(w))) {
      return true
    }
  }
  
  return false
}

export interface NormalizedMatchup {
  id: string
  eventId: string
  sportKey: string
  sportName: string
  sportIcon: string
  homeTeam: {
    name: string
    shortName: string
    logo: string
  }
  awayTeam: {
    name: string
    shortName: string
    logo: string
  }
  startTime: string
  status: string
  venue?: string
}

export function parseEspnScoreboard(data: any, sportKey: string): NormalizedMatchup[] {
  const sport = getSportConfig(sportKey)
  if (!sport || !data.events) return []

  return data.events
    .filter((event: any) => {
      const statusName = event.status?.type?.name || ''
      return statusName !== 'STATUS_FINAL' && statusName !== 'STATUS_POSTPONED' && statusName !== 'STATUS_CANCELED'
    })
    .map((event: any) => {
      const competition = event.competitions?.[0]
      const homeCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'home')
      const awayCompetitor = competition?.competitors?.find((c: any) => c.homeAway === 'away')

      return {
        id: event.id,
        eventId: event.id,
        sportKey: sport.key,
        sportName: sport.name,
        sportIcon: sport.icon,
        homeTeam: {
          name: homeCompetitor?.team?.displayName || homeCompetitor?.team?.name || 'TBD',
          shortName: homeCompetitor?.team?.abbreviation || 'TBD',
          logo: homeCompetitor?.team?.logo || ''
        },
        awayTeam: {
          name: awayCompetitor?.team?.displayName || awayCompetitor?.team?.name || 'TBD',
          shortName: awayCompetitor?.team?.abbreviation || 'TBD',
          logo: awayCompetitor?.team?.logo || ''
        },
        startTime: event.date,
        status: event.status?.type?.name || 'scheduled',
        venue: competition?.venue?.fullName
      }
    })
    .sort((a: NormalizedMatchup, b: NormalizedMatchup) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
}
