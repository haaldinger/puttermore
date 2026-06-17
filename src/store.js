/**
 * Store — localStorage-backed persistence for Puttermore V2
 * Best-of-3 series format with match management
 */
import { players as seedPlayers, teams as seedTeams, seasons as seedSeasons, matches as seedMatches, venues as seedVenues, leagues as seedLeagues } from './seed.js'

const STORE_KEY = 'puttermore_store'
const STORE_VERSION = 9

let _state = null

function getDefaultState() {
  return {
    version: STORE_VERSION,
    players: JSON.parse(JSON.stringify(seedPlayers)),
    teams: JSON.parse(JSON.stringify(seedTeams)),
    seasons: JSON.parse(JSON.stringify(seedSeasons)),
    matches: JSON.parse(JSON.stringify(seedMatches)),
    venues: JSON.parse(JSON.stringify(seedVenues)),
    leagues: JSON.parse(JSON.stringify(seedLeagues)),
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.version === STORE_VERSION) return parsed
    }
  } catch (e) { console.warn('Store load failed:', e) }
  return null
}

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(_state)) }
  catch (e) { console.warn('Store save failed:', e) }
}

function initStore() {
  if (_state) return
  _state = loadState() || getDefaultState()
  saveState()
}

initStore()

export const players = _state.players
export const teams = _state.teams
export const seasons = _state.seasons
export const matches = _state.matches
export const venues = _state.venues
export const leagues = _state.leagues

// ─── Match Persistence (Series Format) ───

export function saveMatch(matchId, result) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  Object.assign(match, result, { status: 'pending_review' })
  saveState()
  return match
}

export function approveMatch(matchId) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  match.status = 'completed'
  saveState()
  return match
}

export function updateMatch(matchId, updates) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  // Support updating series score, games, winner, points
  if (updates.seriesScore) match.seriesScore = updates.seriesScore
  if (updates.games) match.games = updates.games
  if (updates.winnerId !== undefined) match.winnerId = updates.winnerId
  if (updates.homePoints !== undefined) match.homePoints = updates.homePoints
  if (updates.awayPoints !== undefined) match.awayPoints = updates.awayPoints
  if (updates.overtime !== undefined) match.overtime = updates.overtime
  // Legacy single-game support for admin score adjustment
  if (updates.finalScore) {
    // Update the relevant game's finalScore
    if (match.games && match.games.length > 0) {
      const lastGame = match.games[match.games.length - 1]
      lastGame.finalScore = updates.finalScore
      if (updates.finalScore.home > updates.finalScore.away) {
        lastGame.winnerId = match.homeTeamId
      } else if (updates.finalScore.away > updates.finalScore.home) {
        lastGame.winnerId = match.awayTeamId
      }
    }
  }
  saveState()
  return match
}

// ─── Admin Match Management ───

export function createMatch(leagueId, weekNumber, homeTeamId, awayTeamId) {
  // Generate unique ID
  const existingIds = _state.matches
    .filter(m => m.leagueId === leagueId)
    .map(m => {
      const num = parseInt(m.id.replace(`${leagueId}-m`, ''))
      return isNaN(num) ? 0 : num
    })
  const nextId = existingIds.length ? Math.max(...existingIds) + 1 : 0

  // Find the date for this week
  const season = _state.seasons.find(s => s.status === 'active')
  let date = ''
  if (season && season.startDate) {
    const start = new Date(season.startDate + 'T12:00:00')
    const weekDate = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
    date = weekDate.toISOString().split('T')[0]
  }

  const newMatch = {
    id: `${leagueId}-m${nextId}`,
    leagueId,
    seasonId: season?.id || 's1',
    weekNumber,
    date,
    venueId: 'v1',
    homeTeamId,
    awayTeamId,
    status: 'scheduled',
    games: [],
    seriesScore: { home: 0, away: 0 },
    winnerId: null,
    homePoints: 0,
    awayPoints: 0,
  }

  _state.matches.push(newMatch)
  if (matches !== _state.matches && !matches.some(m => m.id === newMatch.id)) {
    matches.push(newMatch)
  }
  saveState()
  return newMatch
}

export function updateMatchTeams(matchId, homeTeamId, awayTeamId) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  if (homeTeamId) match.homeTeamId = homeTeamId
  if (awayTeamId) match.awayTeamId = awayTeamId
  saveState()
  return match
}

export function updateMatchWeek(matchId, weekNumber) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  match.weekNumber = weekNumber
  // Recalculate date
  const season = _state.seasons.find(s => s.status === 'active')
  if (season && season.startDate) {
    const start = new Date(season.startDate + 'T12:00:00')
    const weekDate = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
    match.date = weekDate.toISOString().split('T')[0]
  }
  saveState()
  return match
}

export function deleteMatch(matchId) {
  const idx = _state.matches.findIndex(m => m.id === matchId)
  if (idx === -1) return false
  _state.matches.splice(idx, 1)
  if (matches !== _state.matches) {
    const mIdx = matches.findIndex(m => m.id === matchId)
    if (mIdx !== -1) matches.splice(mIdx, 1)
  }
  saveState()
  return true
}

// ─── Synthetic Turn Generation for Override Scoring ───

function generateSyntheticTurns(homeTeamId, awayTeamId, homeScore, awayScore) {
  // homeScore = cups home team sank on away board, awayScore = cups away team sank on home board
  // Winner always has 6. Loser has 0-5.
  const homeTeam = _state.teams.find(t => t.id === homeTeamId)
  const awayTeam = _state.teams.find(t => t.id === awayTeamId)
  if (!homeTeam || !awayTeam) return []

  const homePlayers = homeTeam.roster.slice(0, 2).map(r => r.playerId)
  const awayPlayers = awayTeam.roster.slice(0, 2).map(r => r.playerId)
  if (homePlayers.length === 0 || awayPlayers.length === 0) return []

  const holes = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1']

  // Build a sequence of makes for each team
  // Winner made all 6 holes, loser made N holes (in order)
  const homeMadeHoles = holes.slice(0, homeScore)
  const awayMadeHoles = holes.slice(0, awayScore)

  // Estimate total putts using ~42% league average
  const puttingAvg = 0.42
  const homeTotalPutts = homeScore > 0 ? Math.max(homeScore, Math.round(homeScore / puttingAvg)) : Math.round(3 / puttingAvg)
  const awayTotalPutts = awayScore > 0 ? Math.max(awayScore, Math.round(awayScore / puttingAvg)) : Math.round(3 / puttingAvg)

  // Build per-team putt sequences (list of {playerId, hole, made})
  function buildPuttSequence(players, madeHoles, totalPutts) {
    const putts = []
    const missCount = totalPutts - madeHoles.length
    let holeIdx = 0, playerToggle = 0

    // Interleave makes and misses to create a realistic-looking sequence
    // Each "turn" = 2 putts (one per player)
    const turnCount = Math.ceil(totalPutts / 2)

    for (let turn = 0; turn < turnCount; turn++) {
      for (let p = 0; p < Math.min(players.length, 2); p++) {
        if (putts.length >= totalPutts) break
        const playerId = players[p]

        // Decide: make or miss?
        const remainingMakes = madeHoles.length - putts.filter(x => x.made).length
        const remainingPutts = totalPutts - putts.length
        const makeProb = remainingPutts > 0 ? remainingMakes / remainingPutts : 0

        // Use a deterministic pattern (alternating) to distribute makes evenly
        const shouldMake = remainingMakes > 0 && (Math.random() < makeProb || remainingPutts <= remainingMakes)

        if (shouldMake && holeIdx < madeHoles.length) {
          putts.push({ playerId, hole: madeHoles[holeIdx], made: true, synthetic: true })
          holeIdx++
        } else {
          putts.push({ playerId, hole: 'miss', made: false, synthetic: true })
        }
      }
    }
    return putts
  }

  const homePutts = buildPuttSequence(homePlayers, homeMadeHoles, homeTotalPutts)
  const awayPutts = buildPuttSequence(awayPlayers, awayMadeHoles, awayTotalPutts)

  // Interleave into turns (home turn, away turn, ...)
  const turns = []
  let turnNum = 0
  const homeTurns = []
  const awayTurns = []

  // Group putts into turns of 2
  for (let i = 0; i < homePutts.length; i += 2) {
    homeTurns.push(homePutts.slice(i, i + 2))
  }
  for (let i = 0; i < awayPutts.length; i += 2) {
    awayTurns.push(awayPutts.slice(i, i + 2))
  }

  const maxTurns = Math.max(homeTurns.length, awayTurns.length)
  for (let i = 0; i < maxTurns; i++) {
    if (i < homeTurns.length) {
      turnNum++
      const turnPutts = homeTurns[i]
      const ballBack = turnPutts.length >= 2 && turnPutts.every(p => p.made)
      turns.push({
        turnNumber: turnNum,
        teamId: homeTeamId,
        putters: turnPutts.map(p => p.playerId),
        putts: turnPutts,
        ballBack,
        overtime: false,
        redemption: false,
        synthetic: true,
      })
    }
    if (i < awayTurns.length) {
      turnNum++
      const turnPutts = awayTurns[i]
      const ballBack = turnPutts.length >= 2 && turnPutts.every(p => p.made)
      turns.push({
        turnNumber: turnNum,
        teamId: awayTeamId,
        putters: turnPutts.map(p => p.playerId),
        putts: turnPutts,
        ballBack,
        overtime: false,
        redemption: false,
        synthetic: true,
      })
    }
  }

  return turns
}

// Quick score entry — captain or admin enters series results manually
export function quickScoreMatch(matchId, gameScores, scoringMode = 'override') {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null

  const games = []
  const seriesScore = { home: 0, away: 0 }

  for (const gs of gameScores) {
    const winnerId = gs.home > gs.away ? match.homeTeamId : match.awayTeamId
    const syntheticTurns = scoringMode === 'override'
      ? generateSyntheticTurns(match.homeTeamId, match.awayTeamId, gs.home, gs.away)
      : []

    const homeMadeHoles = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1'].slice(0, gs.home)
    const awayMadeHoles = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1'].slice(0, gs.away)

    games.push({
      turns: syntheticTurns,
      scoringMode: scoringMode, // 'live' | 'override'
      holesWon: {
        [match.homeTeamId]: awayMadeHoles, // home team's cups sunk = away board claimed
        [match.awayTeamId]: homeMadeHoles,
      },
      finalScore: { home: gs.home, away: gs.away },
      totalTurns: syntheticTurns.length || 0,
      ballBacks: {
        [match.homeTeamId]: syntheticTurns.filter(t => t.teamId === match.homeTeamId && t.ballBack).length,
        [match.awayTeamId]: syntheticTurns.filter(t => t.teamId === match.awayTeamId && t.ballBack).length,
      },
      winnerId,
      overtime: false,
    })
    if (winnerId === match.homeTeamId) seriesScore.home++
    else seriesScore.away++

    if (seriesScore.home >= 2 || seriesScore.away >= 2) break
  }

  const winnerId = seriesScore.home >= 2 ? match.homeTeamId : match.awayTeamId
  const totalGames = games.length
  let homePoints, awayPoints
  if (winnerId === match.homeTeamId) {
    homePoints = 2
    awayPoints = totalGames === 3 ? 1 : 0
  } else {
    awayPoints = 2
    homePoints = totalGames === 3 ? 1 : 0
  }

  match.games = games
  match.seriesScore = seriesScore
  match.winnerId = winnerId
  match.homePoints = homePoints
  match.awayPoints = awayPoints
  match.status = 'pending_review'
  match.scoringMode = scoringMode

  saveState()
  return match
}

// ─── Player Management ───

export function addPlayer(teamId, name, color) {
  const team = _state.teams.find(t => t.id === teamId)
  if (!team) return null

  const numericIds = _state.players
    .map(p => parseInt(p.id.replace('p', '')))
    .filter(id => !isNaN(id))
  const newNumId = numericIds.length ? Math.max(...numericIds) + 1 : 1
  const newPlayerId = `p${newNumId}`

  const newPlayer = {
    id: newPlayerId,
    name,
    avatarColor: color || '#e91e8b',
    putterName: 'The Baltimore Blade',
    putterDesc: 'A reliable, local steel blade putter selected to dominate the concrete brewery carpets.',
    putterType: 'blade'
  }

  _state.players.push(newPlayer)

  if (players !== _state.players && !players.some(p => p.id === newPlayerId)) {
    players.push(newPlayer)
  }

  const nextOrder = team.roster.length ? Math.max(...team.roster.map(r => r.order || 0)) + 1 : 1
  team.roster.push({ playerId: newPlayerId, order: nextOrder })

  saveState()
  return newPlayer
}

export function removePlayer(playerId) {
  const idx = _state.players.findIndex(p => p.id === playerId)
  if (idx === -1) return false

  _state.players.splice(idx, 1)

  if (players !== _state.players) {
    const pIdx = players.findIndex(p => p.id === playerId)
    if (pIdx !== -1) players.splice(pIdx, 1)
  }

  _state.teams.forEach(t => {
    t.roster = t.roster.filter(r => r.playerId !== playerId)
    if (t.captainPlayerId === playerId) {
      t.captainPlayerId = t.roster.length ? t.roster[0].playerId : null
    }
  })

  saveState()
  return true
}

export function updatePlayer(playerId, name, color) {
  const player = _state.players.find(p => p.id === playerId)
  if (!player) return null
  if (name) player.name = name
  if (color) player.avatarColor = color
  saveState()
  return player
}

export function updatePlayerPutter(playerId, putterName, putterDesc, putterType, putterImage) {
  const player = _state.players.find(p => p.id === playerId)
  if (!player) return null
  player.putterName = putterName || player.putterName || 'The Bmore Blade'
  player.putterDesc = putterDesc || player.putterDesc || 'Sinks putts like a dream.'
  player.putterType = putterType || player.putterType || 'blade'
  if (putterImage !== undefined) {
    player.putterImage = putterImage
  }
  saveState()
  return player
}

export function assignCaptain(teamId, playerId) {
  const team = _state.teams.find(t => t.id === teamId)
  if (!team) return false

  const inRoster = team.roster.some(r => r.playerId === playerId)
  if (!inRoster) return false

  team.captainPlayerId = playerId
  saveState()
  return true
}

export function resetStore() {
  _state = getDefaultState()
  replaceArr(players, _state.players)
  replaceArr(teams, _state.teams)
  replaceArr(seasons, _state.seasons)
  replaceArr(matches, _state.matches)
  replaceArr(venues, _state.venues)
  replaceArr(leagues, _state.leagues)
  saveState()
}

function replaceArr(target, source) {
  target.length = 0
  source.forEach(item => target.push(item))
}

const LOGIN_KEY = 'puttermore_logged_in_player_id'

export function getLoggedInUser() {
  const playerId = localStorage.getItem(LOGIN_KEY)
  if (!playerId) return null
  return _state.players.find(p => p.id === playerId) || null
}

export function setLoggedInUser(playerId) {
  if (playerId) {
    localStorage.setItem(LOGIN_KEY, playerId)
  } else {
    localStorage.removeItem(LOGIN_KEY)
  }
}

export function logout() {
  localStorage.removeItem(LOGIN_KEY)
}

// ─── Demo Night Reset ───
export function resetAllStats() {
  _state.matches.forEach(m => {
    m.status = 'scheduled'
    m.games = []
    m.seriesScore = { home: 0, away: 0 }
    m.winnerId = null
    m.homePoints = 0
    m.awayPoints = 0
    m.banterLog = undefined
    m.submittedByPlayerName = undefined
  })
  matches.length = 0
  _state.matches.forEach(m => matches.push(m))
  saveState()
}

// ─── Session Snapshots (mobile-friendly) ───
const SNAPSHOT_PREFIX = 'puttermore_snap_'

export function saveSnapshot(label) {
  const now = new Date()
  const stamp = `${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
  const name = label || `Demo ${stamp}`
  const key = SNAPSHOT_PREFIX + Date.now()
  const snap = { name, timestamp: now.toISOString(), state: JSON.parse(JSON.stringify(_state)) }
  localStorage.setItem(key, JSON.stringify(snap))
  return name
}

export function listSnapshots() {
  const snaps = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(SNAPSHOT_PREFIX)) {
      try {
        const snap = JSON.parse(localStorage.getItem(key))
        snaps.push({ key, name: snap.name, timestamp: snap.timestamp })
      } catch (e) { /* skip corrupt */ }
    }
  }
  return snaps.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export function loadSnapshot(key) {
  try {
    const snap = JSON.parse(localStorage.getItem(key))
    if (!snap?.state?.matches) return false
    Object.assign(_state, snap.state)
    matches.length = 0
    _state.matches.forEach(m => matches.push(m))
    players.length = 0
    _state.players.forEach(p => players.push(p))
    teams.length = 0
    _state.teams.forEach(t => teams.push(t))
    saveState()
    return true
  } catch (e) { return false }
}

export function deleteSnapshot(key) {
  localStorage.removeItem(key)
}
