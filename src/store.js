import { players as seedPlayers, teams as seedTeams, seasons as seedSeasons, matches as seedMatches, venues as seedVenues, leagues as seedLeagues } from './seed.js'
import { supabase } from './supabase.js'

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

function replaceArr(target, source) {
  target.length = 0
  source.forEach(item => target.push(item))
}

export function syncExportedArrays() {
  replaceArr(players, _state.players)
  replaceArr(teams, _state.teams)
  replaceArr(seasons, _state.seasons)
  replaceArr(matches, _state.matches)
  replaceArr(venues, _state.venues)
  replaceArr(leagues, _state.leagues)
}

export async function initializeRemoteStore() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('🔌 Supabase credentials missing. Falling back to local storage.')
    _state = loadState() || getDefaultState()
    syncExportedArrays()
    return true
  }

  try {
    console.log('🔌 Initializing Remote Store from Supabase...')
    
    // Fetch all tables in parallel
    const [
      { data: playersData, error: playersErr },
      { data: teamsData, error: teamsErr },
      { data: seasonsData, error: seasonsErr },
      { data: matchesData, error: matchesErr },
      { data: venuesData, error: venuesErr },
      { data: leaguesData, error: leaguesErr }
    ] = await Promise.all([
      supabase.from('players').select('*'),
      supabase.from('teams').select('*, season_roster(*, players(*))'),
      supabase.from('seasons').select('*'),
      supabase.from('matches').select('*, games(*, turns(*, putts(*)))'),
      supabase.from('venues').select('*'),
      supabase.from('leagues').select('*')
    ])

    if (playersErr || teamsErr || seasonsErr || matchesErr || venuesErr || leaguesErr) {
      throw new Error(
        'Supabase query failed: ' +
        (playersErr?.message || teamsErr?.message || seasonsErr?.message || matchesErr?.message || venuesErr?.message || leaguesErr?.message)
      )
    }

    // Process players
    const mappedPlayers = playersData.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatarColor: p.avatar_color,
      putterName: p.putter_name,
      putterDesc: p.putter_desc,
      putterType: p.putter_type,
      putterImage: p.putter_image_url,
      isAdmin: p.role === 'admin'
    }))

    // Process teams & rosters
    const mappedTeams = teamsData.map(t => {
      const roster = (t.season_roster || []).map((r, i) => ({
        playerId: r.player_id,
        order: r.order || (i + 1)
      }))
      const captain = t.season_roster?.find(r => r.is_captain)
      return {
        id: t.id,
        name: t.name,
        color: t.color,
        leagueId: 'l1', // Default league id
        captainPlayerId: captain?.player_id || null,
        roster
      }
    })

    // Process matches & games
    const mappedMatches = matchesData.map(m => {
      const games = (m.games || []).map(g => {
        const turns = (g.turns || []).map(t => {
          const putts = (t.putts || []).map(p => ({
            playerId: p.player_id,
            hole: p.hole,
            made: p.made,
            ...(p.island !== undefined && { island: p.island }),
            ...(p.bonus_cup !== null && { bonusCup: p.bonus_cup }),
            ...(p.synthetic !== undefined && { synthetic: p.synthetic })
          }))

          return {
            turnNumber: t.turn_number,
            teamId: t.team_id,
            putters: t.putts?.map(p => p.player_id) || [],
            putts,
            ballBack: t.ball_back,
            overtime: t.overtime || false,
            redemption: t.redemption || false,
            ...(t.synthetic !== undefined && { synthetic: t.synthetic })
          }
        }).sort((a, b) => a.turnNumber - b.turnNumber)

        const holesWon = {
          [m.home_team_id]: turns.filter(t => t.teamId === m.away_team_id).flatMap(t => t.putts).filter(p => p.made).map(p => p.hole),
          [m.away_team_id]: turns.filter(t => t.teamId === m.home_team_id).flatMap(t => t.putts).filter(p => p.made).map(p => p.hole)
        }

        return {
          turns,
          scoringMode: g.scoringMode || m.scoring_mode || 'live',
          holesWon,
          finalScore: { home: g.final_score_home, away: g.final_score_away },
          totalTurns: g.total_turns || turns.length,
          ballBacks: {
            [m.home_team_id]: turns.filter(t => t.teamId === m.home_team_id && t.ballBack).length,
            [m.away_team_id]: turns.filter(t => t.teamId === m.away_team_id && t.ballBack).length
          },
          winnerId: g.winner_id,
          overtime: g.overtime
        }
      }).sort((a, b) => a.gameNumber - b.gameNumber)

      return {
        id: m.id,
        leagueId: m.leagueId || 'l1',
        seasonId: m.season_id,
        weekNumber: m.week_number,
        date: m.scheduled_time ? new Date(m.scheduled_time).toISOString().split('T')[0] : '',
        venueId: m.venueId || 'v1',
        homeTeamId: m.home_team_id,
        awayTeamId: m.away_team_id,
        status: m.status,
        games,
        seriesScore: { home: m.series_score_home, away: m.series_score_away },
        winnerId: m.winner_id,
        homePoints: m.home_points || 0,
        awayPoints: m.away_points || 0,
        scoringMode: m.scoring_mode
      }
    })

    // Process seasons, venues, leagues
    const mappedSeasons = seasonsData.map(s => ({
      id: s.id,
      name: s.name,
      weeks: s.weeks || 6,
      startDate: s.start_date,
      endDate: s.end_date,
      status: s.status
    }))

    const mappedVenues = venuesData.map(v => ({
      id: v.id,
      name: v.name,
      address: v.address,
      shortName: v.name.split(' ')[0],
      color: '#e91e8b',
      status: 'active'
    }))

    const mappedLeagues = leaguesData.map(l => ({
      id: l.id,
      name: l.name,
      seasonId: l.season_id,
      venueId: l.venue_id,
      day: 'Wednesday',
      status: 'active'
    }))

    // Update the local store cache
    _state.players = mappedPlayers
    _state.teams = mappedTeams
    _state.seasons = mappedSeasons
    _state.matches = mappedMatches
    _state.venues = mappedVenues
    _state.leagues = mappedLeagues

    syncExportedArrays()
    console.log('🔌 Remote Store initialized successfully!')
    return true
  } catch (e) {
    console.error('🔌 Failed to fetch Remote Store, falling back to local:', e)
    _state = loadState() || getDefaultState()
    syncExportedArrays()
    return false
  }
}

// ─── Match Persistence (Series Format) ───

export async function saveMatch(matchId, result) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null

  Object.assign(match, result, { status: 'pending_review' })
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      // 1. Update the match status, series score, and winner
      const { error: matchErr } = await supabase.from('matches').update({
        status: 'pending_review',
        series_score_home: result.seriesScore.home,
        series_score_away: result.seriesScore.away,
        winner_id: result.winnerId,
        home_points: result.homePoints,
        away_points: result.awayPoints,
        scoring_mode: result.scoringMode
      }).eq('id', matchId)

      if (matchErr) throw matchErr

      // 2. Delete any existing games/turns/putts for this match to overwrite them
      await supabase.from('games').delete().eq('match_id', matchId)

      // 3. Insert the games, turns, and putts
      for (const [idx, g] of result.games.entries()) {
        const { data: gameData, error: gameErr } = await supabase.from('games').insert({
          match_id: matchId,
          game_number: idx + 1,
          winner_id: g.winnerId,
          final_score_home: g.finalScore.home,
          final_score_away: g.finalScore.away,
          overtime: g.overtime
        }).select().single()

        if (gameErr) throw gameErr

        // Insert turns & putts for this game
        for (const t of g.turns) {
          const { data: turnData, error: turnErr } = await supabase.from('turns').insert({
            game_id: gameData.id,
            turn_number: t.turnNumber,
            team_id: t.teamId,
            ball_back: t.ballBack
          }).select().single()

          if (turnErr) throw turnErr

          // Insert putts
          const puttsToInsert = t.putts.map(p => ({
            turn_id: turnData.id,
            player_id: p.playerId,
            hole: p.hole,
            made: p.made,
            island: p.island || false,
            bonus_cup: p.bonusCup || null,
            synthetic: p.synthetic || false
          }))

          if (puttsToInsert.length > 0) {
            const { error: puttsErr } = await supabase.from('putts').insert(puttsToInsert)
            if (puttsErr) throw puttsErr
          }
        }
      }
    } catch (e) {
      console.error('Failed to sync match save to Supabase:', e)
    }
  } else {
    saveState()
  }

  return match
}

export async function approveMatch(matchId) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null

  match.status = 'completed'
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { error } = await supabase.from('matches')
        .update({ status: 'completed' })
        .eq('id', matchId)
      if (error) throw error
    } catch (e) {
      console.error('Failed to approve match on Supabase:', e)
    }
  } else {
    saveState()
  }

  return match
}

export async function updateMatch(matchId, updates) {
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

  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const matchUpdate = {}
      if (updates.winnerId !== undefined) matchUpdate.winner_id = updates.winnerId
      if (updates.homePoints !== undefined) matchUpdate.home_points = updates.homePoints
      if (updates.awayPoints !== undefined) matchUpdate.away_points = updates.awayPoints
      if (updates.seriesScore) {
        matchUpdate.series_score_home = updates.seriesScore.home
        matchUpdate.series_score_away = updates.seriesScore.away
      }

      if (Object.keys(matchUpdate).length > 0) {
        const { error } = await supabase.from('matches').update(matchUpdate).eq('id', matchId)
        if (error) throw error
      }

      if (updates.games) {
        await supabase.from('games').delete().eq('match_id', matchId)
        for (const [idx, g] of updates.games.entries()) {
          const { data: gameData, error: gameErr } = await supabase.from('games').insert({
            match_id: matchId,
            game_number: idx + 1,
            winner_id: g.winnerId,
            final_score_home: g.finalScore.home,
            final_score_away: g.finalScore.away,
            overtime: g.overtime
          }).select().single()

          if (gameErr) throw gameErr

          for (const t of g.turns) {
            const { data: turnData, error: turnErr } = await supabase.from('turns').insert({
              game_id: gameData.id,
              turn_number: t.turnNumber,
              team_id: t.teamId,
              ball_back: t.ballBack
            }).select().single()

            if (turnErr) throw turnErr

            const puttsToInsert = t.putts.map(p => ({
              turn_id: turnData.id,
              player_id: p.playerId,
              hole: p.hole,
              made: p.made,
              island: p.island || false,
              bonus_cup: p.bonusCup || null,
              synthetic: p.synthetic || false
            }))

            if (puttsToInsert.length > 0) {
              const { error: puttsErr } = await supabase.from('putts').insert(puttsToInsert)
              if (puttsErr) throw puttsErr
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to update match on Supabase:', e)
    }
  } else {
    saveState()
  }

  return match
}

export async function createMatch(leagueId, weekNumber, homeTeamId, awayTeamId) {
  const existingIds = _state.matches
    .filter(m => m.leagueId === leagueId)
    .map(m => {
      const num = parseInt(m.id.replace(`${leagueId}-m`, ''))
      return isNaN(num) ? 0 : num
    })
  const nextId = existingIds.length ? Math.max(...existingIds) + 1 : 0
  const matchIdStr = `${leagueId}-m${nextId}`

  const season = _state.seasons.find(s => s.status === 'active')
  let date = ''
  if (season && season.startDate) {
    const start = new Date(season.startDate + 'T12:00:00')
    const weekDate = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
    date = weekDate.toISOString().split('T')[0]
  }

  const newMatch = {
    id: matchIdStr,
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
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { data, error } = await supabase.from('matches').insert({
        season_id: season?.id || 's1',
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        week_number: weekNumber,
        scheduled_time: date ? `${date}T19:00:00Z` : null,
        status: 'scheduled'
      }).select().single()

      if (error) throw error
      newMatch.id = data.id
      syncExportedArrays()
    } catch (e) {
      console.error('Failed to create match on Supabase:', e)
    }
  } else {
    saveState()
  }

  return newMatch
}

export async function updateMatchTeams(matchId, homeTeamId, awayTeamId) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  if (homeTeamId) match.homeTeamId = homeTeamId
  if (awayTeamId) match.awayTeamId = awayTeamId
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { error } = await supabase.from('matches').update({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId
      }).eq('id', matchId)
      if (error) throw error
    } catch (e) {
      console.error('Failed to update match teams on Supabase:', e)
    }
  } else {
    saveState()
  }
  return match
}

export async function updateMatchWeek(matchId, weekNumber) {
  const match = _state.matches.find(m => m.id === matchId)
  if (!match) return null
  match.weekNumber = weekNumber
  const season = _state.seasons.find(s => s.status === 'active')
  if (season && season.startDate) {
    const start = new Date(season.startDate + 'T12:00:00')
    const weekDate = new Date(start.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000)
    match.date = weekDate.toISOString().split('T')[0]
  }
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { error } = await supabase.from('matches').update({
        week_number: weekNumber,
        scheduled_time: match.date ? `${match.date}T19:00:00Z` : null
      }).eq('id', matchId)
      if (error) throw error
    } catch (e) {
      console.error('Failed to update match week on Supabase:', e)
    }
  } else {
    saveState()
  }
  return match
}

export async function deleteMatch(matchId) {
  const idx = _state.matches.findIndex(m => m.id === matchId)
  if (idx === -1) return false
  _state.matches.splice(idx, 1)
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { error } = await supabase.from('matches').delete().eq('id', matchId)
      if (error) throw error
    } catch (e) {
      console.error('Failed to delete match on Supabase:', e)
      return false
    }
  } else {
    saveState()
  }

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

export async function addPlayer(teamId, name, color) {
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
  if (team) {
    const nextOrder = team.roster.length ? Math.max(...team.roster.map(r => r.order || 0)) + 1 : 1
    team.roster.push({ playerId: newPlayerId, order: nextOrder })
  }
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const generatedId = crypto.randomUUID()
      const { error: playerErr } = await supabase.from('players').insert({
        id: generatedId,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '')}_${newNumId}@puttermore.com`,
        avatar_color: color || '#e91e8b',
        role: 'player'
      })

      if (playerErr) throw playerErr

      const season = _state.seasons.find(s => s.status === 'active')
      const nextOrder = team ? (team.roster.length ? Math.max(...team.roster.map(r => r.order || 0)) + 1 : 1) : 1
      const { error: rosterErr } = await supabase.from('season_roster').insert({
        season_id: season?.id || 's1',
        team_id: teamId,
        player_id: generatedId,
        order: nextOrder
      })

      if (rosterErr) throw rosterErr

      newPlayer.id = generatedId
      if (team) {
        const rItem = team.roster.find(r => r.playerId === newPlayerId)
        if (rItem) rItem.playerId = generatedId
      }
      syncExportedArrays()
    } catch (e) {
      console.error('Failed to add player on Supabase:', e)
    }
  } else {
    saveState()
  }

  return newPlayer
}

export async function removePlayer(playerId) {
  const idx = _state.players.findIndex(p => p.id === playerId)
  if (idx === -1) return false

  _state.players.splice(idx, 1)
  _state.teams.forEach(t => {
    t.roster = t.roster.filter(r => r.playerId !== playerId)
    if (t.captainPlayerId === playerId) {
      t.captainPlayerId = t.roster.length ? t.roster[0].playerId : null
    }
  })
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { error } = await supabase.from('players').delete().eq('id', playerId)
      if (error) throw error
    } catch (e) {
      console.error('Failed to remove player on Supabase:', e)
      return false
    }
  } else {
    saveState()
  }

  return true
}

export async function updatePlayer(playerId, name, color) {
  const player = _state.players.find(p => p.id === playerId)
  if (!player) return null
  if (name) player.name = name
  if (color) player.avatarColor = color
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { error } = await supabase.from('players').update({
        name: player.name,
        avatar_color: player.avatarColor
      }).eq('id', playerId)
      if (error) throw error
    } catch (e) {
      console.error('Failed to update player on Supabase:', e)
    }
  } else {
    saveState()
  }

  return player
}

export async function updatePlayerPutter(playerId, putterName, putterDesc, putterType, putterImage) {
  const player = _state.players.find(p => p.id === playerId)
  if (!player) return null
  player.putterName = putterName || player.putterName || 'The Bmore Blade'
  player.putterDesc = putterDesc || player.putterDesc || 'Sinks putts like a dream.'
  player.putterType = putterType || player.putterType || 'blade'

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (putterImage !== undefined) {
    player.putterImage = putterImage
  }
  syncExportedArrays()

  if (supabaseUrl && supabaseAnonKey) {
    try {
      let publicUrl = putterImage
      if (putterImage && putterImage.startsWith('data:image')) {
        const response = await fetch(putterImage)
        const blob = await response.blob()
        const filePath = `putters/${playerId}-${Date.now()}.webp`
        
        const { error: uploadErr } = await supabase.storage
          .from('putter-photos')
          .upload(filePath, blob, { contentType: 'image/webp', cacheControl: '3600', upsert: true })

        if (uploadErr) throw uploadErr

        const { data: urlData } = supabase.storage
          .from('putter-photos')
          .getPublicUrl(filePath)
        
        publicUrl = urlData.publicUrl
        player.putterImage = publicUrl
        syncExportedArrays()
      }

      const { error } = await supabase.from('players').update({
        putter_name: player.putterName,
        putter_desc: player.putterDesc,
        putter_type: player.putterType,
        putter_image_url: publicUrl
      }).eq('id', playerId)

      if (error) throw error
    } catch (e) {
      console.error('Failed to update player putter on Supabase:', e)
    }
  } else {
    saveState()
  }

  return player
}

export async function assignCaptain(teamId, playerId) {
  const team = _state.teams.find(t => t.id === teamId)
  if (!team) return false

  const inRoster = team.roster.some(r => r.playerId === playerId)
  if (!inRoster) return false

  team.captainPlayerId = playerId
  syncExportedArrays()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const season = _state.seasons.find(s => s.status === 'active')
      const { error: resetErr } = await supabase.from('season_roster')
        .update({ is_captain: false })
        .eq('team_id', teamId)
        .eq('season_id', season?.id || 's1')

      if (resetErr) throw resetErr

      const { error: setErr } = await supabase.from('season_roster')
        .update({ is_captain: true })
        .eq('team_id', teamId)
        .eq('player_id', playerId)
        .eq('season_id', season?.id || 's1')

      if (setErr) throw setErr
    } catch (e) {
      console.error('Failed to assign captain on Supabase:', e)
      return false
    }
  } else {
    saveState()
  }

  return true
}

export function resetStore() {
  _state = getDefaultState()
  syncExportedArrays()
  saveState()
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

export async function logout() {
  localStorage.removeItem(LOGIN_KEY)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseAnonKey) {
    await supabase.auth.signOut()
  }
}

export async function getSessionUser() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseAnonKey) {
    const { data } = await supabase.auth.getUser()
    if (data?.user) {
      const player = _state.players.find(p => p.id === data.user.id)
      if (player) {
        localStorage.setItem(LOGIN_KEY, player.id)
        return player
      }
    }
  }
  return null
}

export async function loginWithEmail(email) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (supabaseUrl && supabaseAnonKey) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    if (error) throw error
    return true
  }
  return false
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
