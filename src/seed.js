/**
 * Puttermore — Seed Data (V2)
 * Best-of-3 Series Format — 7 Teams — Round-Robin Scheduling
 * Points: Win = 2pts, Game 3 Loss = 1pt, 0-2 Loss = 0pts
 */

export const venues = [
  { id: 'v1', name: 'Mobtown Brewing Co.', shortName: 'Mobtown', address: '3600 O\'Donnell St, Baltimore, MD 21224', color: '#e91e8b', status: 'active', hours: 'Wednesdays 6:00 PM – 9:00 PM' }
]

export const seasons = [
  { id: 's2', name: 'Fall 2026', weeks: 6, startDate: '2026-09-02', endDate: '2026-10-07', maxTeamsPerLeague: 7, status: 'active' },
  { id: 's1', name: 'Summer 2026', weeks: 7, startDate: '2026-05-07', endDate: '2026-06-18', maxTeamsPerLeague: 7, status: 'completed' }
]

export const leagues = [
  { id: 'l1', name: 'Mobtown Fall League', seasonId: 's2', venueId: 'v1', day: 'Wednesday (6–9 PM)', status: 'active' }
]

// ─── Players (15 total) ───
export const players = [
  // Sandbox Test Admin (Session-only testing)
  { id: 'p_sandbox', name: 'Demo Tester (Sandbox Admin)', avatarColor: '#22d3ee', isAdmin: true, isSandbox: true, putterName: 'Sandbox Sizzler', putterDesc: 'Test putter for pre-season trial runs. Changes exist in active browser session only.', putterType: 'neon' },
  // Team 1 — Pocket Putters
  { id: 'p1', name: 'J-MO Boh', avatarColor: '#e91e8b', isAdmin: true, putterName: 'The Boh-Tender', putterDesc: 'Sinks putts like a bartender slides cold stouts on a Saturday night. Perfectly balanced and heavy.', putterType: 'classic' },
  { id: 'p2', name: 'Darren Fitz', avatarColor: '#f472b6', putterName: 'The Fitz-Whipper', putterDesc: 'Ultra-light composite shaft that flexes just right. Designed for speed on concrete bar floors.', putterType: 'blade' },
  // Team 2 — Turf & Suds
  { id: 'p3', name: 'Shane OldBay', avatarColor: '#fbbf24', isAdmin: true, putterName: 'Old Bay Sizzler', putterDesc: 'Seasoned to perfection with spicy red paint. Sinks high-pressure shots from downtown Bmore.', putterType: 'gold' },
  { id: 'p4', name: 'Chris Vaughn', avatarColor: '#f59e0b', putterName: "Vaughn's Velocity", putterDesc: 'Designed with matte black carbon fiber. Zero glare under pub lights for ultimate focus.', putterType: 'stealth' },
  // Team 3 — Green Jackets
  { id: 'p5', name: 'Brianna Osei', avatarColor: '#22c55e', putterName: 'The Green Harpoon', putterDesc: 'An aggressively sharp putter head aligned with lime-green sightlines. Extremely steady.', putterType: 'neon' },
  { id: 'p6', name: 'Jordan Lake', avatarColor: '#16a34a', putterName: 'Lake Placid Mallet', putterDesc: 'Smooth backswing, dampens all brewery vibrations for a clean, pure roll.', putterType: 'carbon' },
  // Team 4 — Sinking Feeling
  { id: 'p7', name: 'DeShawn Price', avatarColor: '#22d3ee', putterName: 'The Price Tag', putterDesc: 'Luxury gold-plated mallet. Hard to ignore, impossible to miss.', putterType: 'copper' },
  { id: 'p8', name: 'Kayla Simms', avatarColor: '#06b6d4', putterName: 'Simms-Slicker', putterDesc: 'A customized translucent polymer head that glows under the brewery blue lights.', putterType: 'crystal' },
  // Team 5 — Velvet Touch
  { id: 'p9', name: 'Ray Gutierrez', avatarColor: '#a78bfa', putterName: 'The Ray-Dar', putterDesc: 'Milled obsidian volcanic glass head with glowing gold kintsugi cracks and a gold-line alignment aid. Steady as a rock.', putterType: 'obsidian' },
  { id: 'p10', name: 'Nadia Brooks', avatarColor: '#8b5cf6', putterName: 'Brooks-Stone', putterDesc: 'Carved from solid marble. Heavy, unforgiving, and completely reliable.', putterType: 'damascus' },
  // Team 6 — Ball Washers
  { id: 'p11', name: 'Tyler Mack', avatarColor: '#ef4444', putterName: 'The Mack-Truck', putterDesc: 'The absolute heaviest putter head allowed by league laws. Rolls straight through anything.', putterType: 'brass' },
  { id: 'p12', name: 'Imani Clarke', avatarColor: '#dc2626', putterName: 'The Clarke-Tech', putterDesc: 'Sleek aerospace platinum blade with ultra-clean bevels. Lightweight but deadly for precision finishes.', putterType: 'platinum' },
  // Team 7 — Ace Holes
  { id: 'p13', name: 'Jake Hartman', avatarColor: '#f97316', putterName: "Hartman's Bamboo", putterDesc: 'Handcrafted natural bamboo wood mallet with polished brass weights on the heel and toe. Eco-friendly precision.', putterType: 'bamboo' },
  { id: 'p14', name: 'Lena Ortiz', avatarColor: '#ea580c', putterName: 'The Ortiz-Orbit', putterDesc: 'Circular perimeter weight rings create high moment-of-inertia. Never twists on off-center hits.', putterType: 'printed' },
]

export const teams = [
  { id: 't1', name: 'Pocket Putters',   color: '#e91e8b', leagueId: 'l1', captainPlayerId: 'p1',  roster: [{ playerId: 'p1', order: 1 }, { playerId: 'p2', order: 2 }] },
  { id: 't2', name: 'Turf & Suds',      color: '#fbbf24', leagueId: 'l1', captainPlayerId: 'p3',  roster: [{ playerId: 'p3', order: 1 }, { playerId: 'p4', order: 2 }] },
  { id: 't3', name: 'Green Jackets',    color: '#22c55e', leagueId: 'l1', captainPlayerId: 'p5',  roster: [{ playerId: 'p5', order: 1 }, { playerId: 'p6', order: 2 }] },
  { id: 't4', name: 'Sinking Feeling',  color: '#22d3ee', leagueId: 'l1', captainPlayerId: 'p7',  roster: [{ playerId: 'p7', order: 1 }, { playerId: 'p8', order: 2 }] },
  { id: 't5', name: 'Velvet Touch',     color: '#a78bfa', leagueId: 'l1', captainPlayerId: 'p9',  roster: [{ playerId: 'p9', order: 1 }, { playerId: 'p10', order: 2 }] },
  { id: 't6', name: 'Ball Washers',     color: '#ef4444', leagueId: 'l1', captainPlayerId: 'p11', roster: [{ playerId: 'p11', order: 1 }, { playerId: 'p12', order: 2 }] },
  { id: 't7', name: 'Ace Holes',        color: '#f97316', leagueId: 'l1', captainPlayerId: 'p13', roster: [{ playerId: 'p13', order: 1 }, { playerId: 'p14', order: 2 }] },
]

// ─── Board Holes ───
export const HOLES = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1']
export const OT_HOLES = ['front-1', 'middle-1', 'middle-2']

// ─── Single-Game Simulator ───
function simulateGame(homeTeamId, awayTeamId, rng) {
  const homeTeam = teams.find(t => t.id === homeTeamId)
  const awayTeam = teams.find(t => t.id === awayTeamId)
  const homePlayers = homeTeam.roster.map(r => r.playerId)
  const awayPlayers = awayTeam.roster.map(r => r.playerId)

  let homeBoardClaimed = []
  let awayBoardClaimed = []
  let homeBoardOpen = new Set(HOLES)
  let awayBoardOpen = new Set(HOLES)
  const turns = []
  let turnNum = 0
  let currentTeam = 'home'
  let overtime = false

  while (true) {
    const isHome = currentTeam === 'home'
    const roster = isHome ? homePlayers : awayPlayers
    const targetOpen = isHome ? awayBoardOpen : homeBoardOpen
    const targetClaimed = isHome ? awayBoardClaimed : homeBoardClaimed

    if (targetOpen.size === 0) break

    turnNum++

    let putters
    if (roster.length <= 2) {
      putters = roster.slice(0, 2)
    } else {
      const completedTeamTurns = turns.filter(t => t.teamId === (isHome ? homeTeamId : awayTeamId)).length
      const seq = completedTeamTurns % 3
      if (seq === 0) putters = [roster[0], roster[1]]
      else if (seq === 1) putters = [roster[0], roster[2]]
      else putters = [roster[1], roster[2]]
    }

    const available = [...targetOpen]

    const putts = putters.map((pid, i) => {
      const targetHole = available[i % available.length]
      const made = rng() < 0.42
      return { playerId: pid, hole: targetHole, made }
    })

    const ballBack = putts.length >= 2 && putts.every(p => p.made)

    putts.forEach(p => {
      if (p.made && targetOpen.has(p.hole)) {
        targetOpen.delete(p.hole)
        targetClaimed.push(p.hole)
      }
    })

    turns.push({ turnNumber: turnNum, teamId: isHome ? homeTeamId : awayTeamId, putters, putts, ballBack, overtime })

    const targetCount = overtime ? 3 : 6
    if (targetClaimed.length >= targetCount) break

    if (!ballBack) currentTeam = currentTeam === 'home' ? 'away' : 'home'
    if (turnNum > 80) break
  }

  const homeScore = awayBoardClaimed.length
  const awayScore = homeBoardClaimed.length
  const winnerId = homeScore > awayScore ? homeTeamId : (awayScore > homeScore ? awayTeamId : homeTeamId)

  return {
    turns,
    holesWon: { [homeTeamId]: [...awayBoardClaimed], [awayTeamId]: [...homeBoardClaimed] },
    finalScore: { home: homeScore, away: awayScore },
    totalTurns: turnNum,
    ballBacks: {
      [homeTeamId]: turns.filter(t => t.teamId === homeTeamId && t.ballBack).length,
      [awayTeamId]: turns.filter(t => t.teamId === awayTeamId && t.ballBack).length,
    },
    winnerId, overtime
  }
}

function seededRng(seed) {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
}

// ─── Best-of-3 Series Simulator ───
function simulateSeries(homeTeamId, awayTeamId, seedOffset) {
  const games = []
  const seriesScore = { home: 0, away: 0 }

  for (let g = 0; g < 3; g++) {
    const rng = seededRng(seedOffset + g * 31)
    const gameResult = simulateGame(homeTeamId, awayTeamId, rng)
    games.push(gameResult)

    if (gameResult.winnerId === homeTeamId) seriesScore.home++
    else seriesScore.away++

    // Series decided at 2 wins
    if (seriesScore.home >= 2 || seriesScore.away >= 2) break
  }

  const seriesWinnerId = seriesScore.home >= 2 ? homeTeamId : awayTeamId
  const totalGames = games.length

  // Points: Win = 2, Lose in Game 3 = 1, Lose 0-2 = 0
  let homePoints, awayPoints
  if (seriesWinnerId === homeTeamId) {
    homePoints = 2
    awayPoints = totalGames === 3 ? 1 : 0
  } else {
    awayPoints = 2
    homePoints = totalGames === 3 ? 1 : 0
  }

  return { games, seriesScore, winnerId: seriesWinnerId, homePoints, awayPoints }
}

// ─── Schedule Builder for Mobtown Fall 2026 (6 Weeks, Multi-Matchup Support) ───
function buildFall2026Schedule(leagueId, leagueTeams, venueId, dates) {
  const tIds = leagueTeams.map(t => t.id)
  
  // 6-week schedule across 7 teams. 
  // Each week has 3-4 matchups scheduled between 6:00 PM and 9:00 PM at Mobtown.
  const rawSchedule = [
    // Week 1: Sept 2, 2026
    { week: 1, home: 't1', away: 't2' },
    { week: 1, home: 't3', away: 't4' },
    { week: 1, home: 't5', away: 't6' },

    // Week 2: Sept 9, 2026
    { week: 2, home: 't2', away: 't3' },
    { week: 2, home: 't4', away: 't5' },
    { week: 2, home: 't6', away: 't7' },

    // Week 3: Sept 16, 2026
    { week: 3, home: 't1', away: 't3' },
    { week: 3, home: 't2', away: 't5' },
    { week: 3, home: 't4', away: 't6' },

    // Week 4: Sept 23, 2026
    { week: 4, home: 't1', away: 't4' },
    { week: 4, home: 't2', away: 't6' },
    { week: 4, home: 't3', away: 't5' },

    // Week 5: Sept 30, 2026
    { week: 5, home: 't1', away: 't5' },
    { week: 5, home: 't2', away: 't7' },
    { week: 5, home: 't3', away: 't6' },

    // Week 6: Oct 7, 2026
    { week: 6, home: 't1', away: 't6' },
    { week: 6, home: 't2', away: 't4' },
    { week: 6, home: 't5', away: 't7' },
  ]

  return rawSchedule.map((m, idx) => {
    const weekIdx = m.week - 1
    const isCompleted = false // Ready for Admin score entry in Fall 2026

    const base = {
      id: `${leagueId}-fall26-m${idx}`,
      leagueId,
      seasonId: 's2',
      weekNumber: m.week,
      date: dates[weekIdx] || '2026-09-02',
      venueId,
      homeTeamId: m.home,
      awayTeamId: m.away,
    }

    if (isCompleted) {
      const series = simulateSeries(m.home, m.away, 100 + idx * 23)
      return {
        ...base,
        status: 'completed',
        games: series.games,
        seriesScore: series.seriesScore,
        winnerId: series.winnerId,
        homePoints: series.homePoints,
        awayPoints: series.awayPoints,
      }
    } else {
      return {
        ...base,
        status: 'scheduled',
        games: [],
        seriesScore: { home: 0, away: 0 },
        winnerId: null,
        homePoints: 0,
        awayPoints: 0,
      }
    }
  })
}

const leagueDates = {
  l1: ['2026-09-02', '2026-09-09', '2026-09-16', '2026-09-23', '2026-09-30', '2026-10-07'] // Wednesdays 6-9 PM
}

const mobtownTeams = teams.filter(t => t.leagueId === 'l1')

export const matches = [
  ...buildFall2026Schedule('l1', mobtownTeams, 'v1', leagueDates.l1)
]
