/**
 * Puttermore — Seed Data
 * 3 Leagues × 9 Teams × 2 Players = 54 players
 * Each league locked to a brewery for the 6-week season
 */

export const venues = [
  { id: 'v1', name: 'Mobtown Brewing Co.', shortName: 'Mobtown', address: '3600 O\'Donnell St, Baltimore, MD 21224', color: '#e91e8b', status: 'active' },
  { id: 'v2', name: 'Heavy Seas Beer', shortName: 'Heavy Seas', address: '4615 Hollins Ferry Rd, Halethorpe, MD 21227', color: '#22d3ee', status: 'active' },
  { id: 'v3', name: '1623 Brewing', shortName: '1623', address: 'Baltimore, MD', color: '#fbbf24', status: 'active' },
]

export const seasons = [
  { id: 's1', name: 'Summer 2026', weeks: 6, startDate: '2026-06-08', endDate: '2026-07-13', maxTeamsPerLeague: 9, status: 'active' }
]

export const leagues = [
  { id: 'l1', name: 'Mobtown League', seasonId: 's1', venueId: 'v1', day: 'Tuesday', status: 'active' },
  { id: 'l2', name: 'Heavy Seas League', seasonId: 's1', venueId: 'v2', day: 'Wednesday', status: 'active' },
  { id: 'l3', name: '1623 League', seasonId: 's1', venueId: 'v3', day: 'Thursday', status: 'active' },
]

// ─── Players (54 total: 18 per league) ───
export const players = [
  // Mobtown League
  { id: 'p1', name: 'Marcus Cole', avatarColor: '#e91e8b' },
  { id: 'p2', name: 'Darren Fitz', avatarColor: '#f472b6' },
  { id: 'p3', name: 'Tasha Mobley', avatarColor: '#fbbf24' },
  { id: 'p4', name: 'Chris Vaughn', avatarColor: '#f59e0b' },
  { id: 'p5', name: 'Brianna Osei', avatarColor: '#22c55e' },
  { id: 'p6', name: 'Jordan Lake', avatarColor: '#16a34a' },
  { id: 'p7', name: 'DeShawn Price', avatarColor: '#22d3ee' },
  { id: 'p8', name: 'Kayla Simms', avatarColor: '#06b6d4' },
  { id: 'p9', name: 'Ray Gutierrez', avatarColor: '#a78bfa' },
  { id: 'p10', name: 'Nadia Brooks', avatarColor: '#8b5cf6' },
  { id: 'p11', name: 'Tyler Mack', avatarColor: '#ef4444' },
  { id: 'p12', name: 'Imani Clarke', avatarColor: '#dc2626' },
  { id: 'p13', name: 'Jake Hartman', avatarColor: '#f97316' },
  { id: 'p14', name: 'Lena Ortiz', avatarColor: '#ea580c' },
  { id: 'p15', name: 'Andre Baptiste', avatarColor: '#ec4899' },
  { id: 'p16', name: 'Maya Jefferson', avatarColor: '#d946ef' },
  { id: 'p17', name: 'Omar Haddad', avatarColor: '#14b8a6' },
  { id: 'p18', name: 'Sierra Walsh', avatarColor: '#0d9488' },
  // Heavy Seas League
  { id: 'p19', name: 'Caleb Simmons', avatarColor: '#3b82f6' },
  { id: 'p20', name: 'Destiny Howard', avatarColor: '#2563eb' },
  { id: 'p21', name: 'Rico Tavares', avatarColor: '#f43f5e' },
  { id: 'p22', name: 'Jada Nwosu', avatarColor: '#e11d48' },
  { id: 'p23', name: 'Patrick Doyle', avatarColor: '#84cc16' },
  { id: 'p24', name: 'Aaliyah Franklin', avatarColor: '#65a30d' },
  { id: 'p25', name: 'Marco Diaz', avatarColor: '#f59e0b' },
  { id: 'p26', name: 'Keisha Brown', avatarColor: '#d97706' },
  { id: 'p27', name: 'Sean Murphy', avatarColor: '#8b5cf6' },
  { id: 'p28', name: 'Zoe Atkins', avatarColor: '#7c3aed' },
  { id: 'p29', name: 'Darius Payne', avatarColor: '#06b6d4' },
  { id: 'p30', name: 'Layla Chen', avatarColor: '#0891b2' },
  { id: 'p31', name: 'James Korso', avatarColor: '#f97316' },
  { id: 'p32', name: 'Mia Rosetti', avatarColor: '#ea580c' },
  { id: 'p33', name: 'Terrance Hill', avatarColor: '#10b981' },
  { id: 'p34', name: 'Priya Desai', avatarColor: '#059669' },
  { id: 'p35', name: 'Chris Barton', avatarColor: '#ec4899' },
  { id: 'p36', name: 'Samira Yates', avatarColor: '#db2777' },
  // 1623 League
  { id: 'p37', name: 'Jamal Whitaker', avatarColor: '#eab308' },
  { id: 'p38', name: 'Hailey Dunn', avatarColor: '#ca8a04' },
  { id: 'p39', name: 'Victor Perez', avatarColor: '#ef4444' },
  { id: 'p40', name: 'Dana Okonkwo', avatarColor: '#dc2626' },
  { id: 'p41', name: 'Ryan Gallagher', avatarColor: '#22c55e' },
  { id: 'p42', name: 'Jasmine Fields', avatarColor: '#16a34a' },
  { id: 'p43', name: 'Noah Castillo', avatarColor: '#3b82f6' },
  { id: 'p44', name: 'Ava Thornton', avatarColor: '#2563eb' },
  { id: 'p45', name: 'Devon Marshall', avatarColor: '#a855f7' },
  { id: 'p46', name: 'Kira Nakamura', avatarColor: '#9333ea' },
  { id: 'p47', name: 'Elijah Pham', avatarColor: '#f97316' },
  { id: 'p48', name: 'Grace Kim', avatarColor: '#ea580c' },
  { id: 'p49', name: 'Dante Russell', avatarColor: '#14b8a6' },
  { id: 'p50', name: 'Leah Brennan', avatarColor: '#0d9488' },
  { id: 'p51', name: 'Miles Cooper', avatarColor: '#e91e8b' },
  { id: 'p52', name: 'Nia Robinson', avatarColor: '#be185d' },
  { id: 'p53', name: 'Tristan Wolfe', avatarColor: '#06b6d4' },
  { id: 'p54', name: 'Chloe Martinez', avatarColor: '#0891b2' },
]

export const teams = [
  // ─── Mobtown League (l1) ───
  { id: 't1', name: 'Natty Bohs', color: '#e91e8b', leagueId: 'l1', captainPlayerId: 'p1', roster: [{ playerId: 'p1', order: 1 }, { playerId: 'p2', order: 2 }] },
  { id: 't2', name: 'Old Bay Bombers', color: '#fbbf24', leagueId: 'l1', captainPlayerId: 'p3', roster: [{ playerId: 'p3', order: 1 }, { playerId: 'p4', order: 2 }] },
  { id: 't3', name: 'Crab Cake Closers', color: '#ef4444', leagueId: 'l1', captainPlayerId: 'p5', roster: [{ playerId: 'p5', order: 1 }, { playerId: 'p6', order: 2 }] },
  { id: 't4', name: 'Bmore Squeegee Boys', color: '#22d3ee', leagueId: 'l1', captainPlayerId: 'p7', roster: [{ playerId: 'p7', order: 1 }, { playerId: 'p8', order: 2 }] },
  { id: 't5', name: 'Omar\'s Whistlers', color: '#a78bfa', leagueId: 'l1', captainPlayerId: 'p9', roster: [{ playerId: 'p9', order: 1 }, { playerId: 'p10', order: 2 }] },
  { id: 't6', name: '12 O\'Clock Boys', color: '#f97316', leagueId: 'l1', captainPlayerId: 'p11', roster: [{ playerId: 'p11', order: 1 }, { playerId: 'p12', order: 2 }] },
  { id: 't7', name: 'House of Cups', color: '#22c55e', leagueId: 'l1', captainPlayerId: 'p13', roster: [{ playerId: 'p13', order: 1 }, { playerId: 'p14', order: 2 }] },
  { id: 't8', name: 'Hampden Hons', color: '#ec4899', leagueId: 'l1', captainPlayerId: 'p15', roster: [{ playerId: 'p15', order: 1 }, { playerId: 'p16', order: 2 }] },
  { id: 't9', name: 'Mr. Trash Wheels', color: '#14b8a6', leagueId: 'l1', captainPlayerId: 'p17', roster: [{ playerId: 'p17', order: 1 }, { playerId: 'p18', order: 2 }] },
  // ─── Heavy Seas League (l2) ───
  { id: 't10', name: 'Loose Cannons', color: '#3b82f6', leagueId: 'l2', captainPlayerId: 'p19', roster: [{ playerId: 'p19', order: 1 }, { playerId: 'p20', order: 2 }] },
  { id: 't11', name: 'Powder Monkeys', color: '#f43f5e', leagueId: 'l2', captainPlayerId: 'p21', roster: [{ playerId: 'p21', order: 1 }, { playerId: 'p22', order: 2 }] },
  { id: 't12', name: 'Berger Cookie Crew', color: '#84cc16', leagueId: 'l2', captainPlayerId: 'p23', roster: [{ playerId: 'p23', order: 1 }, { playerId: 'p24', order: 2 }] },
  { id: 't13', name: 'Dundalk Dirtbikes', color: '#f59e0b', leagueId: 'l2', captainPlayerId: 'p25', roster: [{ playerId: 'p25', order: 1 }, { playerId: 'p26', order: 2 }] },
  { id: 't14', name: 'Barksdale Putters', color: '#8b5cf6', leagueId: 'l2', captainPlayerId: 'p27', roster: [{ playerId: 'p27', order: 1 }, { playerId: 'p28', order: 2 }] },
  { id: 't15', name: 'Slingin\' Joes', color: '#06b6d4', leagueId: 'l2', captainPlayerId: 'p29', roster: [{ playerId: 'p29', order: 1 }, { playerId: 'p30', order: 2 }] },
  { id: 't16', name: 'Pigtown Putters', color: '#f97316', leagueId: 'l2', captainPlayerId: 'p31', roster: [{ playerId: 'p31', order: 1 }, { playerId: 'p32', order: 2 }] },
  { id: 't17', name: 'Lake Roland Rollers', color: '#10b981', leagueId: 'l2', captainPlayerId: 'p33', roster: [{ playerId: 'p33', order: 1 }, { playerId: 'p34', order: 2 }] },
  { id: 't18', name: 'Waverly Wreckers', color: '#ec4899', leagueId: 'l2', captainPlayerId: 'p35', roster: [{ playerId: 'p35', order: 1 }, { playerId: 'p36', order: 2 }] },
  // ─── 1623 League (l3) ───
  { id: 't19', name: 'Druid Hill Daggers', color: '#eab308', leagueId: 'l3', captainPlayerId: 'p37', roster: [{ playerId: 'p37', order: 1 }, { playerId: 'p38', order: 2 }] },
  { id: 't20', name: 'Station North Stars', color: '#ef4444', leagueId: 'l3', captainPlayerId: 'p39', roster: [{ playerId: 'p39', order: 1 }, { playerId: 'p40', order: 2 }] },
  { id: 't21', name: 'Patterson Park Aces', color: '#22c55e', leagueId: 'l3', captainPlayerId: 'p41', roster: [{ playerId: 'p41', order: 1 }, { playerId: 'p42', order: 2 }] },
  { id: 't22', name: 'Highlandtown Heat', color: '#3b82f6', leagueId: 'l3', captainPlayerId: 'p43', roster: [{ playerId: 'p43', order: 1 }, { playerId: 'p44', order: 2 }] },
  { id: 't23', name: 'The Wire Tappers', color: '#a855f7', leagueId: 'l3', captainPlayerId: 'p45', roster: [{ playerId: 'p45', order: 1 }, { playerId: 'p46', order: 2 }] },
  { id: 't24', name: 'Woodberry Wolves', color: '#f97316', leagueId: 'l3', captainPlayerId: 'p47', roster: [{ playerId: 'p47', order: 1 }, { playerId: 'p48', order: 2 }] },
  { id: 't25', name: 'Riverside Ringers', color: '#14b8a6', leagueId: 'l3', captainPlayerId: 'p49', roster: [{ playerId: 'p49', order: 1 }, { playerId: 'p50', order: 2 }] },
  { id: 't26', name: 'Cross Street Crushers', color: '#e91e8b', leagueId: 'l3', captainPlayerId: 'p51', roster: [{ playerId: 'p51', order: 1 }, { playerId: 'p52', order: 2 }] },
  { id: 't27', name: 'Brewers Hill Ballers', color: '#06b6d4', leagueId: 'l3', captainPlayerId: 'p53', roster: [{ playerId: 'p53', order: 1 }, { playerId: 'p54', order: 2 }] },
]

// ─── Board Holes ───
export const HOLES = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1']
export const OT_HOLES = ['front-1', 'middle-1', 'middle-2']

// ─── Game Simulator ───
function simulateGame(homeTeamId, awayTeamId, rng) {
  const homeTeam = teams.find(t => t.id === homeTeamId)
  const awayTeam = teams.find(t => t.id === awayTeamId)
  const homePlayers = homeTeam.roster.map(r => r.playerId)
  const awayPlayers = awayTeam.roster.map(r => r.playerId)

  // Each team has their own board that the opponent attacks
  let homeBoardClaimed = [] // cups away team sunk on home's board
  let awayBoardClaimed = [] // cups home team sunk on away's board
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
    const putters = roster.slice(0, 2)
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

    // Check win
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

// ─── Schedule builder per league ───
function buildSchedule(leagueId, leagueTeams, venueId, seedOffset, dates) {
  const tIds = leagueTeams.map(t => t.id)
  const pairings = [
    [[0,1],[2,3],[4,5],[6,7]],
    [[8,0],[1,2],[3,4],[5,6]],
    [[7,8],[0,2],[4,6],[1,5]],
    [[3,7],[8,1],[2,4],[0,6]],
    [[5,3],[7,0],[6,8],[4,1]],
    [[2,5],[3,0],[1,6],[8,4]],
  ]
  const times = ['7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM']

  const results = []
  let idx = 0
  pairings.forEach((weekPairs, weekIdx) => {
    weekPairs.forEach((pair, matchIdx) => {
      const homeId = tIds[pair[0]], awayId = tIds[pair[1]]
      const week = weekIdx + 1
      const isCompleted = week <= 3
      const id = `${leagueId}-m${idx}`
      const rng = seededRng(seedOffset + idx * 17)
      const base = {
        id, leagueId, seasonId: 's1', weekNumber: week,
        date: dates[weekIdx], timeSlot: times[matchIdx],
        venueId, homeTeamId: homeId, awayTeamId: awayId,
        status: isCompleted ? 'completed' : 'scheduled',
      }
      if (isCompleted) {
        const result = simulateGame(homeId, awayId, rng)
        results.push({ ...base, ...result })
      } else {
        results.push({ ...base, turns: [], holesWon: {}, finalScore: { home: 0, away: 0 }, totalTurns: 0, ballBacks: {}, winnerId: null, overtime: false })
      }
      idx++
    })
  })
  return results
}

// Weekday-specific dates for each league (6 weeks)
// Tue June 9 → July 14, Wed June 10 → July 15, Thu June 11 → July 16
const leagueDates = {
  l1: ['2026-06-09','2026-06-16','2026-06-23','2026-06-30','2026-07-07','2026-07-14'], // Tuesdays
  l2: ['2026-06-10','2026-06-17','2026-06-24','2026-07-01','2026-07-08','2026-07-15'], // Wednesdays
  l3: ['2026-06-11','2026-06-18','2026-06-25','2026-07-02','2026-07-09','2026-07-16'], // Thursdays
}

// Build matches for all 3 leagues
const mobtownTeams = teams.filter(t => t.leagueId === 'l1')
const heavySeasTeams = teams.filter(t => t.leagueId === 'l2')
const league1623Teams = teams.filter(t => t.leagueId === 'l3')

export const matches = [
  ...buildSchedule('l1', mobtownTeams, 'v1', 42, leagueDates.l1),
  ...buildSchedule('l2', heavySeasTeams, 'v2', 137, leagueDates.l2),
  ...buildSchedule('l3', league1623Teams, 'v3', 256, leagueDates.l3),
]
