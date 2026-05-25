/**
 * Store — localStorage-backed persistence for Puttermore
 */
import { players as seedPlayers, teams as seedTeams, seasons as seedSeasons, matches as seedMatches, venues as seedVenues, leagues as seedLeagues } from './seed.js'

const STORE_KEY = 'puttermore_store'
const STORE_VERSION = 7

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

export function updateMatch(matchId, finalScore, overtime) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  match.finalScore = finalScore
  match.overtime = overtime
  saveState()
  return match
}

export function addPlayer(teamId, name, color) {
  const team = _state.teams.find(t => t.id === teamId)
  if (!team) return null
  
  // Find a unique ID
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
  
  // Ensure the exported reference is updated as well
  if (players !== _state.players && !players.some(p => p.id === newPlayerId)) {
    players.push(newPlayer)
  }
  
  // Register in team roster
  const nextOrder = team.roster.length ? Math.max(...team.roster.map(r => r.order || 0)) + 1 : 1
  team.roster.push({ playerId: newPlayerId, order: nextOrder })
  
  saveState()
  return newPlayer
}

export function removePlayer(playerId) {
  const idx = _state.players.findIndex(p => p.id === playerId)
  if (idx === -1) return false
  
  _state.players.splice(idx, 1)
  
  // Update exported array reference
  if (players !== _state.players) {
    const pIdx = players.findIndex(p => p.id === playerId)
    if (pIdx !== -1) players.splice(pIdx, 1)
  }
  
  // Clean up rosters
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
  
  // Must be in the roster
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
