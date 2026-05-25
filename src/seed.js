/**
 * Puttermore — Seed Data
 * Slimmed down to exclusively focus on the Mobtown League (9 teams)
 * Roster sizes vary (some have 2 players, some have 3) to test the automated rotation engine.
 */

export const venues = [
  { id: 'v1', name: 'Mobtown Brewing Co.', shortName: 'Mobtown', address: '3600 O\'Donnell St, Baltimore, MD 21224', color: '#e91e8b', status: 'active' }
]

export const seasons = [
  { id: 's1', name: 'Summer 2026', weeks: 6, startDate: '2026-06-08', endDate: '2026-07-13', maxTeamsPerLeague: 9, status: 'active' }
]

export const leagues = [
  { id: 'l1', name: 'Mobtown League', seasonId: 's1', venueId: 'v1', day: 'Wednesday', status: 'active' }
]

// ─── Players (22 total: Mobtown only) ───
export const players = [
  { id: 'p1', name: 'J-MO Boh', avatarColor: '#e91e8b', isAdmin: true, putterName: 'The Boh-Tender', putterDesc: 'Sinks putts like a bartender slides cold stouts on a Saturday night. Perfectly balanced and heavy.', putterType: 'classic' },
  { id: 'p2', name: 'Darren Fitz', avatarColor: '#f472b6', putterName: 'The Fitz-Whipper', putterDesc: 'Ultra-light composite shaft that flexes just right. Designed for speed on concrete bar floors.', putterType: 'blade' },
  { id: 'p3', name: 'Shane OldBay', avatarColor: '#fbbf24', isAdmin: true, putterName: 'Old Bay Sizzler', putterDesc: 'Seasoned to perfection with spicy red paint. Sinks high-pressure shots from downtown Bmore.', putterType: 'gold' },
  { id: 'p4', name: 'Chris Vaughn', avatarColor: '#f59e0b', putterName: "Vaughn's Velocity", putterDesc: 'Designed with matte black carbon fiber. Zero glare under pub lights for ultimate focus.', putterType: 'stealth' },
  { id: 'p5', name: 'Brianna Osei', avatarColor: '#22c55e', putterName: 'The Green Harpoon', putterDesc: 'An aggressively sharp putter head aligned with lime-green sightlines. Extremely steady.', putterType: 'neon' },
  { id: 'p6', name: 'Jordan Lake', avatarColor: '#16a34a', putterName: 'Lake Placid Mallet', putterDesc: 'Smooth backswing, dampens all brewery vibrations for a clean, pure roll.', putterType: 'carbon' },
  { id: 'p7', name: 'DeShawn Price', avatarColor: '#22d3ee', putterName: 'The Price Tag', putterDesc: 'Luxury gold-plated mallet. Hard to ignore, impossible to miss.', putterType: 'copper' },
  { id: 'p8', name: 'Kayla Simms', avatarColor: '#06b6d4', putterName: 'Simms-Slicker', putterDesc: 'A customized translucent polymer head that glows under the brewery blue lights.', putterType: 'crystal' },
  { id: 'p9', name: 'Ray Gutierrez', avatarColor: '#a78bfa', putterName: 'The Ray-Dar', putterDesc: 'Milled obsidian volcanic glass head with glowing gold kintsugi cracks and a gold-line alignment aid. Steady as a rock.', putterType: 'obsidian' },
  { id: 'p10', name: 'Nadia Brooks', avatarColor: '#8b5cf6', putterName: 'Brooks-Stone', putterDesc: 'Carved from solid marble. Heavy, unforgiving, and completely reliable.', putterType: 'damascus' },
  { id: 'p11', name: 'Tyler Mack', avatarColor: '#ef4444', putterName: 'The Mack-Truck', putterDesc: 'The absolute heaviest putter head allowed by league laws. Rolls straight through anything.', putterType: 'brass' },
  { id: 'p12', name: 'Imani Clarke', avatarColor: '#dc2626', putterName: 'The Clarke-Tech', putterDesc: 'Sleek aerospace platinum blade with ultra-clean bevels. Lightweight but deadly for precision finishes.', putterType: 'platinum' },
  { id: 'p13', name: 'Jake Hartman', avatarColor: '#f97316', putterName: "Hartman's Bamboo", putterDesc: 'Handcrafted natural bamboo wood mallet with polished brass weights on the heel and toe. Eco-friendly precision.', putterType: 'bamboo' },
  { id: 'p14', name: 'Lena Ortiz', avatarColor: '#ea580c', putterName: 'The Ortiz-Orbit', putterDesc: 'Circular perimeter weight rings create high moment-of-inertia. Never twists on off-center hits.', putterType: 'printed' },
  { id: 'p15', name: 'Andre Baptiste', avatarColor: '#ec4899', putterName: 'Bmore Bazooka', putterDesc: 'Milled from a single block of glowing red ruby gemstone. Loud, proud, and refracting pure power.', putterType: 'ruby' },
  { id: 'p16', name: 'Maya Jefferson', avatarColor: '#d946ef', putterName: 'The Emerald Declaration', putterDesc: 'Carved from deep green imperial emerald stone with gold lining. Sinks the clutch putts when they matter most.', putterType: 'emerald' },
  { id: 'p17', name: 'Omar Haddad', avatarColor: '#14b8a6', putterName: 'The Titanium Whistler', putterDesc: 'Sandblasted titanium mallet with heat-treated rainbow weld marks. High tech performance.', putterType: 'titanium' },
  { id: 'p18', name: 'Sierra Walsh', avatarColor: '#0d9488', putterName: 'The Bronze Wall', putterDesc: 'Antique weathered bronze with turquoise verdigris patina highlights. Blocks out tavern noise.', putterType: 'bronze' },
  
  // 3-Player Team Additions
  { id: 'p19', name: 'Nick Miller', avatarColor: '#f59e0b', putterName: 'The Blinding Diamond', putterDesc: 'Milled from solid platinum and pavé-set with 1,200 brilliant-cut diamonds. An absolute showstopper!', putterType: 'diamond' },
  { id: 'p20', name: 'Jessica Day', avatarColor: '#22c55e', putterName: 'The Amber Glow', putterDesc: 'Carved from fossilized orange amber that glows warmly under the pub lights. Blind-sinks with joy.', putterType: 'amber' },
  { id: 'p21', name: 'Winston Bishop', avatarColor: '#3b82f6', putterName: 'The Ferguson', putterDesc: 'Named after a beloved cat. Smooth, soft touch, but occasionally unpredictable.', putterType: 'mallet' },
  { id: 'p22', name: 'Cece Parekh', avatarColor: '#f43f5e', putterName: 'The Runway', putterDesc: 'Impeccably balanced carbon steel with gold pinstripes. A stunner on the turf.', putterType: 'nasa' }
]

export const teams = [
  // ─── Mobtown League (l1) ───
  { id: 't1', name: 'Natty Bohs', color: '#e91e8b', leagueId: 'l1', captainPlayerId: 'p1', roster: [{ playerId: 'p1', order: 1 }, { playerId: 'p2', order: 2 }] },
  { id: 't2', name: 'Old Bay Bombers', color: '#fbbf24', leagueId: 'l1', captainPlayerId: 'p3', roster: [{ playerId: 'p3', order: 1 }, { playerId: 'p4', order: 2 }, { playerId: 'p19', order: 3 }] },
  { id: 't3', name: 'Crab Cake Closers', color: '#ef4444', leagueId: 'l1', captainPlayerId: 'p5', roster: [{ playerId: 'p5', order: 1 }, { playerId: 'p6', order: 2 }] },
  { id: 't4', name: 'Bmore Squeegee Boys', color: '#22d3ee', leagueId: 'l1', captainPlayerId: 'p7', roster: [{ playerId: 'p7', order: 1 }, { playerId: 'p8', order: 2 }, { playerId: 'p20', order: 3 }] },
  { id: 't5', name: 'Omar\'s Whistlers', color: '#a78bfa', leagueId: 'l1', captainPlayerId: 'p9', roster: [{ playerId: 'p9', order: 1 }, { playerId: 'p10', order: 2 }] },
  { id: 't6', name: '12 O\'Clock Boys', color: '#f97316', leagueId: 'l1', captainPlayerId: 'p11', roster: [{ playerId: 'p11', order: 1 }, { playerId: 'p12', order: 2 }, { playerId: 'p21', order: 3 }] },
  { id: 't7', name: 'House of Cups', color: '#22c55e', leagueId: 'l1', captainPlayerId: 'p13', roster: [{ playerId: 'p13', order: 1 }, { playerId: 'p14', order: 2 }] },
  { id: 't8', name: 'Hampden Hons', color: '#ec4899', leagueId: 'l1', captainPlayerId: 'p15', roster: [{ playerId: 'p15', order: 1 }, { playerId: 'p16', order: 2 }, { playerId: 'p22', order: 3 }] },
  { id: 't9', name: 'Mr. Trash Wheels', color: '#14b8a6', leagueId: 'l1', captainPlayerId: 'p17', roster: [{ playerId: 'p17', order: 1 }, { playerId: 'p18', order: 2 }] }
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
    
    // Rotate putters if roster length is 3:
    // seq = 0: [P1, P2] | seq = 1: [P1, P3] | seq = 2: [P2, P3]
    let putters;
    if (roster.length <= 2) {
      putters = roster.slice(0, 2);
    } else {
      const completedTeamTurns = turns.filter(t => t.teamId === (isHome ? homeTeamId : awayTeamId)).length;
      const seq = completedTeamTurns % 3;
      if (seq === 0) putters = [roster[0], roster[1]];
      else if (seq === 1) putters = [roster[0], roster[2]];
      else putters = [roster[1], roster[2]];
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

const leagueDates = {
  l1: ['2026-06-10','2026-06-17','2026-06-24','2026-07-01','2026-07-08','2026-07-15'] // Wednesdays
}

// Build matches for Mobtown league ONLY
const mobtownTeams = teams.filter(t => t.leagueId === 'l1')

export const matches = [
  ...buildSchedule('l1', mobtownTeams, 'v1', 42, leagueDates.l1)
]
