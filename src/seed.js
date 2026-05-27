/**
 * Puttermore — Seed Data (V2)
 * Best-of-3 Series Format — 7 Teams — Round-Robin Scheduling
 * Points: Win = 2pts, Game 3 Loss = 1pt, 0-2 Loss = 0pts
 */

export const venues = [
  { id: 'v1', name: 'Mobtown Brewing Co.', shortName: 'Mobtown', address: '3600 O\'Donnell St, Baltimore, MD 21224', color: '#e91e8b', status: 'active' }
]

export const seasons = [
  { id: 's1', name: 'Summer 2026', weeks: 7, startDate: '2026-05-07', endDate: '2026-06-18', maxTeamsPerLeague: 7, status: 'active' }
]

export const leagues = [
  { id: 'l1', name: 'Mobtown League', seasonId: 's1', venueId: 'v1', day: 'Wednesday', status: 'active' }
]

// ─── Players (14 total: 2 per team, 7 teams) ───
export const players = [
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

// ─── Round-Robin Schedule for 7 teams (3 matches/week, 1 bye) ───
// Circle method: fix team[0], rotate others. 7 rounds = full round-robin.
function buildRoundRobinSchedule(leagueId, leagueTeams, venueId, dates) {
  const tIds = leagueTeams.map(t => t.id)
  const n = tIds.length // 7

  // For odd number of teams, add a "BYE" placeholder
  const ids = [...tIds]
  if (n % 2 !== 0) ids.push('BYE')
  const total = ids.length // 8

  const rounds = []
  const fixed = ids[0]
  let rotating = ids.slice(1) // 7 entries including BYE

  for (let round = 0; round < total - 1; round++) { // 7 rounds
    const roundPairs = []
    const all = [fixed, ...rotating]
    for (let i = 0; i < total / 2; i++) {
      const home = all[i]
      const away = all[total - 1 - i]
      if (home !== 'BYE' && away !== 'BYE') {
        roundPairs.push([home, away])
      }
    }
    rounds.push(roundPairs)
    // Rotate: last element moves to front
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, rotating.length - 1)]
  }

  const results = []
  let idx = 0

  rounds.forEach((weekPairs, weekIdx) => {
    const week = weekIdx + 1
    // Mark first 3 weeks as completed for demo data
    const isCompleted = week <= 3

    weekPairs.forEach((pair) => {
      const homeId = pair[0]
      const awayId = pair[1]
      const id = `${leagueId}-m${idx}`
      const base = {
        id, leagueId, seasonId: 's1', weekNumber: week,
        date: dates[weekIdx] || '',
        venueId, homeTeamId: homeId, awayTeamId: awayId,
      }

      if (isCompleted) {
        const series = simulateSeries(homeId, awayId, 42 + idx * 17)
        results.push({
          ...base,
          status: 'completed',
          games: series.games,
          seriesScore: series.seriesScore,
          winnerId: series.winnerId,
          homePoints: series.homePoints,
          awayPoints: series.awayPoints,
        })
      } else {
        results.push({
          ...base,
          status: 'scheduled',
          games: [],
          seriesScore: { home: 0, away: 0 },
          winnerId: null,
          homePoints: 0,
          awayPoints: 0,
        })
      }
      idx++
    })
  })

  return results
}

const leagueDates = {
  l1: ['2026-05-07', '2026-05-14', '2026-05-21', '2026-05-28', '2026-06-04', '2026-06-11', '2026-06-18'] // Wednesdays
}

const mobtownTeams = teams.filter(t => t.leagueId === 'l1')

export const matches = [
  ...buildRoundRobinSchedule('l1', mobtownTeams, 'v1', leagueDates.l1)
]
