/**
 * Data Store — league-aware query & stats engine (V2)
 * Best-of-3 series format with points-based standings
 */
import { players, teams, seasons, matches, venues, leagues } from './store.js'

export function getPlayer(id) { return players.find(p => p.id === id) }
export function getTeam(id) { return teams.find(t => t.id === id) }
export function getSeason(id) { return seasons.find(s => s.id === id) }
export function getVenue(id) { return venues.find(v => v.id === id) }
export function getLeague(id) { return leagues.find(l => l.id === id) }
export function getAllPlayers() { return players }
export function getAllTeams() { return teams }
export function getAllMatches() { return matches }
export function getAllLeagues() { return leagues }
export function getActiveSeason() { return seasons.find(s => s.status === 'active') || seasons[0] }

export function getLeagueTeams(leagueId) {
  return teams.filter(t => t.leagueId === leagueId)
}

export function getLeagueMatches(leagueId) {
  return matches.filter(m => m.leagueId === leagueId)
}

export function getTeamRoster(teamId) {
  const team = getTeam(teamId)
  if (!team) return []
  return team.roster.sort((a, b) => a.order - b.order).map(r => ({ ...getPlayer(r.playerId), order: r.order }))
}

export function getPlayerTeam(playerId) {
  return teams.find(t => t.roster.some(r => r.playerId === playerId)) || null
}

// ─── Helper: get all turns from a match's games[] ───
function getMatchTurns(match) {
  if (!match.games || !match.games.length) return []
  return match.games.flatMap(g => g.turns || [])
}

// ─── Helper: get total ball backs from a match ───
function getMatchBallBacks(match, teamId) {
  if (!match.games || !match.games.length) return 0
  return match.games.reduce((total, g) => {
    return total + (g.ballBacks?.[teamId] || 0)
  }, 0)
}

// ─── Helper: get total holes (cups) scored from a match ───
function getMatchHolesFor(match, teamId) {
  if (!match.games || !match.games.length) return 0
  return match.games.reduce((total, g) => {
    const isHome = match.homeTeamId === teamId
    return total + (isHome ? (g.finalScore?.home || 0) : (g.finalScore?.away || 0))
  }, 0)
}

function getMatchHolesAgainst(match, teamId) {
  if (!match.games || !match.games.length) return 0
  return match.games.reduce((total, g) => {
    const isHome = match.homeTeamId === teamId
    return total + (isHome ? (g.finalScore?.away || 0) : (g.finalScore?.home || 0))
  }, 0)
}

// ─── Standings (league-scoped, points-based) ───
export function getStandings(leagueId) {
  const leagueTeams = getLeagueTeams(leagueId)
  const leagueMatches = matches.filter(m => m.leagueId === leagueId && m.status === 'completed')
  const stats = {}

  leagueTeams.forEach(t => {
    stats[t.id] = {
      team: t,
      points: 0,
      wins: 0, losses: 0,
      gamesWon: 0, gamesLost: 0,
      holesFor: 0, holesAgainst: 0,
      streak: [],
      ballBacks: 0,
    }
  })

  leagueMatches.forEach(m => {
    const h = stats[m.homeTeamId], a = stats[m.awayTeamId]
    if (!h || !a) return

    // Points
    h.points += (m.homePoints || 0)
    a.points += (m.awayPoints || 0)

    // Series W/L
    if (m.winnerId === m.homeTeamId) {
      h.wins++; h.streak.push('W')
      a.losses++; a.streak.push('L')
    } else if (m.winnerId === m.awayTeamId) {
      a.wins++; a.streak.push('W')
      h.losses++; h.streak.push('L')
    }

    // Games W/L (individual games in the series)
    if (m.seriesScore) {
      h.gamesWon += (m.seriesScore.home || 0)
      h.gamesLost += (m.seriesScore.away || 0)
      a.gamesWon += (m.seriesScore.away || 0)
      a.gamesLost += (m.seriesScore.home || 0)
    }

    // Holes / Ball Backs (aggregated across all games in the series)
    h.holesFor += getMatchHolesFor(m, m.homeTeamId)
    h.holesAgainst += getMatchHolesAgainst(m, m.homeTeamId)
    a.holesFor += getMatchHolesFor(m, m.awayTeamId)
    a.holesAgainst += getMatchHolesAgainst(m, m.awayTeamId)
    h.ballBacks += getMatchBallBacks(m, m.homeTeamId)
    a.ballBacks += getMatchBallBacks(m, m.awayTeamId)
  })

  return Object.values(stats).map(s => ({
    ...s,
    matchesPlayed: s.wins + s.losses,
    winPct: (s.wins + s.losses) > 0 ? s.wins / (s.wins + s.losses) : 0,
    holeDiff: s.holesFor - s.holesAgainst,
    currentStreak: getStreak(s.streak),
  })).sort((a, b) =>
    b.points - a.points ||
    b.winPct - a.winPct ||
    b.holeDiff - a.holeDiff ||
    a.team.name.localeCompare(b.team.name)
  )
}

function getStreak(arr) {
  if (!arr.length) return ''
  const last = arr[arr.length - 1]
  let count = 0
  for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] === last) count++; else break }
  return `${last}${count}`
}

// ─── Head-to-Head Records ───
export function getHeadToHead(teamId, leagueId) {
  const leagueTeams = getLeagueTeams(leagueId).filter(t => t.id !== teamId)
  const compMatches = matches.filter(m =>
    m.leagueId === leagueId &&
    m.status === 'completed' &&
    (m.homeTeamId === teamId || m.awayTeamId === teamId)
  )

  return leagueTeams.map(opp => {
    const h2h = compMatches.filter(m =>
      m.homeTeamId === opp.id || m.awayTeamId === opp.id
    )
    let wins = 0, losses = 0
    h2h.forEach(m => {
      if (m.winnerId === teamId) wins++
      else losses++
    })
    return { opponent: opp, wins, losses, matches: h2h.length }
  }).sort((a, b) => b.wins - a.wins || a.losses - b.losses)
}

// ─── Player Stats (iterates games[]) ───
export function getPlayerStats(playerId) {
  let totalPutts = 0, totalMade = 0, holesMade = {}, ballBackContributions = 0, gamesPlayed = 0
  const weeklyData = {}

  matches.filter(m => m.status === 'completed').forEach(m => {
    if (!m.games || !m.games.length) return

    let playerInMatch = false
    m.games.forEach(game => {
      let playerInGame = false
      ;(game.turns || []).forEach(turn => {
        turn.putts.forEach(putt => {
          if (putt.playerId === playerId) {
            playerInGame = true
            playerInMatch = true
            totalPutts++
            if (putt.made) { totalMade++; holesMade[putt.hole] = (holesMade[putt.hole] || 0) + 1 }
            if (turn.ballBack) ballBackContributions++
          }
        })
      })
      if (playerInGame) gamesPlayed++
    })

    if (playerInMatch) {
      const team = getPlayerTeam(playerId)
      const won = team && m.winnerId === team.id
      if (!weeklyData[m.weekNumber]) weeklyData[m.weekNumber] = { week: m.weekNumber, won: false, putts: 0, made: 0 }
      weeklyData[m.weekNumber].won = won
      m.games.forEach(game => {
        ;(game.turns || []).filter(t => t.putts.some(p => p.playerId === playerId)).forEach(t => {
          t.putts.filter(p => p.playerId === playerId).forEach(p => {
            weeklyData[m.weekNumber].putts++
            if (p.made) weeklyData[m.weekNumber].made++
          })
        })
      })
    }
  })

  return {
    playerId, gamesPlayed, totalPutts, totalMade,
    puttingPct: totalPutts > 0 ? totalMade / totalPutts : 0,
    holesMade, ballBackContributions,
    weeklyBreakdown: Object.values(weeklyData).sort((a, b) => a.week - b.week),
    bestHole: Object.entries(holesMade).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
  }
}

// ─── Leaderboard (league-scoped) ───
export function getLeaderboard(leagueId) {
  const leagueTeams = leagueId ? getLeagueTeams(leagueId) : teams
  const playerIds = new Set()
  leagueTeams.forEach(t => t.roster.forEach(r => playerIds.add(r.playerId)))

  return [...playerIds].map(pid => {
    const p = getPlayer(pid)
    const stats = getPlayerStats(pid)
    const team = getPlayerTeam(pid)
    return { player: p, team, ...stats }
  }).filter(e => e.gamesPlayed > 0).sort((a, b) => b.puttingPct - a.puttingPct)
}

// ─── Recent / Upcoming (league-scoped) ───
export function getRecentResults(leagueId, count = 5) {
  return matches.filter(m => m.leagueId === leagueId && m.status === 'completed')
    .sort((a, b) => b.weekNumber - a.weekNumber).slice(0, count)
    .map(m => ({ ...m, homeTeam: getTeam(m.homeTeamId), awayTeam: getTeam(m.awayTeamId) }))
}

export function getUpcomingMatches(leagueId, count = 5) {
  return matches.filter(m => m.leagueId === leagueId && m.status === 'scheduled')
    .sort((a, b) => a.weekNumber - b.weekNumber).slice(0, count)
    .map(m => ({ ...m, homeTeam: getTeam(m.homeTeamId), awayTeam: getTeam(m.awayTeamId) }))
}

export function getTeamMatches(teamId) {
  return matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId)
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .map(m => ({ ...m, homeTeam: getTeam(m.homeTeamId), awayTeam: getTeam(m.awayTeamId) }))
}

export function getTeamAdvancedStats(teamId) {
  const team = getTeam(teamId)
  if (!team) return null

  const compMatches = matches.filter(m => (m.homeTeamId === teamId || m.awayTeamId === teamId) && m.status === 'completed')

  let totalPutts = 0
  let totalMade = 0
  let otGames = 0
  let totalTurns = 0
  let totalBallBacks = 0
  let totalGamesPlayed = 0

  const holesMade = { 'back-1': 0, 'back-2': 0, 'back-3': 0, 'middle-1': 0, 'middle-2': 0, 'front-1': 0 }
  const holesAttempted = { 'back-1': 0, 'back-2': 0, 'back-3': 0, 'middle-1': 0, 'middle-2': 0, 'front-1': 0 }

  const weeklyData = {}

  compMatches.forEach(m => {
    if (!m.games || !m.games.length) return

    totalBallBacks += getMatchBallBacks(m, teamId)

    m.games.forEach(game => {
      totalGamesPlayed++
      totalTurns += game.totalTurns || 0
      if (game.overtime) otGames++

      ;(game.turns || []).forEach(turn => {
        if (turn.teamId === teamId) {
          turn.putts.forEach(putt => {
            totalPutts++
            if (putt.made) {
              totalMade++
              if (holesMade[putt.hole] !== undefined) holesMade[putt.hole]++
            }
            if (holesAttempted[putt.hole] !== undefined) holesAttempted[putt.hole]++
          })
        }
      })
    })

    const isHome = m.homeTeamId === teamId
    const score = isHome ? (m.seriesScore?.home || 0) : (m.seriesScore?.away || 0)
    const oppScore = isHome ? (m.seriesScore?.away || 0) : (m.seriesScore?.home || 0)
    const won = m.winnerId === teamId

    if (!weeklyData[m.weekNumber]) {
      weeklyData[m.weekNumber] = { week: m.weekNumber, putts: 0, made: 0, won }
    }

    m.games.forEach(game => {
      ;(game.turns || []).forEach(turn => {
        if (turn.teamId === teamId) {
          turn.putts.forEach(putt => {
            weeklyData[m.weekNumber].putts++
            if (putt.made) weeklyData[m.weekNumber].made++
          })
        }
      })
    })
  })

  // Hole stats
  const holeStats = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1'].map(h => {
    const made = holesMade[h] || 0
    const att = holesAttempted[h] || 0
    return {
      hole: h,
      made,
      attempted: att,
      pct: att > 0 ? made / att : 0
    }
  })

  // Points
  let totalPoints = 0
  compMatches.forEach(m => {
    const isHome = m.homeTeamId === teamId
    totalPoints += isHome ? (m.homePoints || 0) : (m.awayPoints || 0)
  })

  return {
    totalPutts,
    totalMade,
    puttingPct: totalPutts > 0 ? totalMade / totalPutts : 0,
    otGames,
    totalGamesPlayed,
    avgTurns: totalGamesPlayed > 0 ? (totalTurns / totalGamesPlayed).toFixed(1) : 0,
    totalBallBacks,
    holeStats,
    totalPoints,
    weeklyBreakdown: Object.values(weeklyData).sort((a, b) => a.week - b.week)
  }
}

export function getHoleShortName(hole) {
  if (!hole || hole === 'miss') return 'Miss'
  if (hole === 'cleared') return 'CLR'
  const map = {
    'back-1': 'B1', 'back-2': 'B2', 'back-3': 'B3',
    'middle-1': 'M1', 'middle-2': 'M2', 'front-1': 'F1'
  }
  return map[hole] || hole
}

// ─── Synthetic / Override Scoring Helpers ───

export function hasAnySyntheticData(playerId) {
  return matches.filter(m => m.status === 'completed').some(m => {
    if (!m.games || !m.games.length) return false
    return m.games.some(game =>
      game.scoringMode === 'override' &&
      (game.turns || []).some(turn =>
        turn.putts.some(p => p.playerId === playerId)
      )
    )
  })
}

export function getPlayerSyntheticGameCount(playerId) {
  let count = 0
  matches.filter(m => m.status === 'completed').forEach(m => {
    if (!m.games || !m.games.length) return
    m.games.forEach(game => {
      if (game.scoringMode === 'override') {
        const playerInGame = (game.turns || []).some(turn =>
          turn.putts.some(p => p.playerId === playerId)
        )
        if (playerInGame) count++
      }
    })
  })
  return count
}

export function isOverrideGame(game) {
  return game && game.scoringMode === 'override'
}
