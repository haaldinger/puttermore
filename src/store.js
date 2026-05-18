/**
 * Store — localStorage-backed persistence for Puttermore
 */
import { players as seedPlayers, teams as seedTeams, seasons as seedSeasons, matches as seedMatches, venues as seedVenues, leagues as seedLeagues } from './seed.js'

const STORE_KEY = 'puttermore_store'
const STORE_VERSION = 2

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
  Object.assign(match, result, { status: 'completed' })
  saveState()
  return match
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
