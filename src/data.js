/**
 * Data Store — league-aware query & stats engine
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

// ─── Standings (league-scoped) ───
export function getStandings(leagueId) {
  const leagueTeams = getLeagueTeams(leagueId)
  const leagueMatches = matches.filter(m => m.leagueId === leagueId && m.status === 'completed')
  const stats = {}

  leagueTeams.forEach(t => {
    stats[t.id] = { team: t, wins: 0, losses: 0, holesFor: 0, holesAgainst: 0, streak: [], ballBacks: 0 }
  })

  leagueMatches.forEach(m => {
    const h = stats[m.homeTeamId], a = stats[m.awayTeamId]
    if (!h || !a) return
    const hs = m.finalScore.home, as = m.finalScore.away
    h.holesFor += hs; h.holesAgainst += as
    a.holesFor += as; a.holesAgainst += hs
    h.ballBacks += (m.ballBacks?.[m.homeTeamId] || 0)
    a.ballBacks += (m.ballBacks?.[m.awayTeamId] || 0)
    if (hs > as) { h.wins++; h.streak.push('W'); a.losses++; a.streak.push('L') }
    else if (as > hs) { a.wins++; a.streak.push('W'); h.losses++; h.streak.push('L') }
    else { h.streak.push('T'); a.streak.push('T') }
  })

  return Object.values(stats).map(s => ({
    ...s,
    gamesPlayed: s.wins + s.losses,
    winPct: (s.wins + s.losses) > 0 ? s.wins / (s.wins + s.losses) : 0,
    holeDiff: s.holesFor - s.holesAgainst,
    currentStreak: getStreak(s.streak),
  })).sort((a, b) => b.winPct - a.winPct || b.holeDiff - a.holeDiff || a.team.name.localeCompare(b.team.name))
}

function getStreak(arr) {
  if (!arr.length) return ''
  const last = arr[arr.length - 1]
  let count = 0
  for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] === last) count++; else break }
  return `${last}${count}`
}

// ─── Player Stats ───
export function getPlayerStats(playerId) {
  let totalPutts = 0, totalMade = 0, holesMade = {}, ballBackContributions = 0, gamesPlayed = 0
  const weeklyData = {}

  matches.filter(m => m.status === 'completed').forEach(m => {
    let playerInGame = false
    m.turns.forEach(turn => {
      turn.putts.forEach(putt => {
        if (putt.playerId === playerId) {
          playerInGame = true
          totalPutts++
          if (putt.made) { totalMade++; holesMade[putt.hole] = (holesMade[putt.hole] || 0) + 1 }
          if (turn.ballBack) ballBackContributions++
        }
      })
    })
    if (playerInGame) {
      gamesPlayed++
      const team = getPlayerTeam(playerId)
      const won = team && m.winnerId === team.id
      if (!weeklyData[m.weekNumber]) weeklyData[m.weekNumber] = { week: m.weekNumber, won: false, putts: 0, made: 0 }
      weeklyData[m.weekNumber].won = won
      m.turns.filter(t => t.putts.some(p => p.playerId === playerId)).forEach(t => {
        t.putts.filter(p => p.playerId === playerId).forEach(p => {
          weeklyData[m.weekNumber].putts++
          if (p.made) weeklyData[m.weekNumber].made++
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
  let otWins = 0
  let otLosses = 0
  let totalTurns = 0
  let totalBallBacks = 0

  const holesMade = { 'back-1': 0, 'back-2': 0, 'back-3': 0, 'middle-1': 0, 'middle-2': 0, 'front-1': 0 }
  const holesAttempted = { 'back-1': 0, 'back-2': 0, 'back-3': 0, 'middle-1': 0, 'middle-2': 0, 'front-1': 0 }

  const weeklyData = {}

  compMatches.forEach(m => {
    totalBallBacks += (m.ballBacks?.[teamId] || 0)
    totalTurns += m.totalTurns || 0

    const isHome = m.homeTeamId === teamId
    const score = isHome ? m.finalScore.home : m.finalScore.away
    const oppScore = isHome ? m.finalScore.away : m.finalScore.home

    if (m.overtime) {
      if (score > oppScore) otWins++
      else otLosses++
    }

    if (!weeklyData[m.weekNumber]) {
      weeklyData[m.weekNumber] = { week: m.weekNumber, putts: 0, made: 0, won: score > oppScore }
    }

    m.turns.forEach(turn => {
      if (turn.teamId === teamId) {
        turn.putts.forEach(putt => {
          totalPutts++
          if (putt.made) {
            totalMade++
            weeklyData[m.weekNumber].made++
            if (holesMade[putt.hole] !== undefined) holesMade[putt.hole]++
          }
          weeklyData[m.weekNumber].putts++
          if (holesAttempted[putt.hole] !== undefined) holesAttempted[putt.hole]++
        })
      }
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

  return {
    totalPutts,
    totalMade,
    puttingPct: totalPutts > 0 ? totalMade / totalPutts : 0,
    otWins,
    otLosses,
    avgTurns: compMatches.length > 0 ? (totalTurns / compMatches.length).toFixed(1) : 0,
    totalBallBacks,
    holeStats,
    weeklyBreakdown: Object.values(weeklyData).sort((a, b) => a.week - b.week)
  }
}
