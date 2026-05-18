import { getAllMatches, getTeam, getTeamRoster, getPlayer, getLeague, getVenue, getAllLeagues } from '../data.js'
import { renderSingleBoard } from '../board.js'
import { HOLES, OT_HOLES } from '../seed.js'
import { saveMatch } from '../store.js'
import { getSelectedLeague, setSelectedLeague } from './home.js'

let scorerState = null
let viewMode = 'side'

export function initScorer() {
  scorerState = null
  // Clear any stale toast
  const toast = document.getElementById('ball-back-toast')
  if (toast) toast.classList.remove('show')
}

export function renderScorer() {
  if (!scorerState) {
    const leagueId = getSelectedLeague()
    const league = getLeague(leagueId)
    const venue = getVenue(league.venueId)
    const scheduled = getAllMatches().filter(m => m.leagueId === leagueId && m.status === 'scheduled')

    // Group by week
    const weeks = {}
    scheduled.forEach(m => {
      if (!weeks[m.weekNumber]) weeks[m.weekNumber] = []
      weeks[m.weekNumber].push(m)
    })

    const leagueTabs = getAllLeagues().map(l => {
      const v = getVenue(l.venueId)
      const isActive = l.id === leagueId
      return `<button class="league-tab ${isActive ? 'active' : ''}" data-league="${l.id}" style="${isActive ? `background:${v.color}15;border-color:${v.color};color:${v.color}` : ''}">
        <span class="league-tab-name">${v.shortName}</span>
        <span class="league-tab-day">${l.day}s</span>
      </button>`
    }).join('')

    const matchListHtml = Object.entries(weeks).sort((a,b) => a[0]-b[0]).map(([wk, matches]) => `
      <div class="match-pick-week">
        <div class="match-pick-week-label">Week ${wk} · ${matches[0]?.date || ''}</div>
        ${matches.map(m => {
          const h = getTeam(m.homeTeamId), a = getTeam(m.awayTeamId)
          return `<button class="match-pick-item" data-match-id="${m.id}">
            <span class="match-pick-teams">
              <span class="team-dot" style="background:${h.color}"></span>
              <span class="match-pick-name">${h.name}</span>
              <span class="match-pick-vs">vs</span>
              <span class="match-pick-name">${a.name}</span>
              <span class="team-dot" style="background:${a.color}"></span>
            </span>
            <span class="match-pick-time">${m.timeSlot}</span>
          </button>`
        }).join('')}
      </div>`).join('')

    const noMatches = !scheduled.length ? '<div class="text-center text-muted" style="padding:var(--space-8)">No scheduled matches for this league</div>' : ''

    return `<div class="page container">
      <div class="page-header animate-in"><h1>🎯 Live Scorer</h1><p>Select a match to start scoring</p></div>
      <div class="league-tabs animate-in" style="justify-content:center">${leagueTabs}</div>
      <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
      <div class="match-pick-list animate-in delay-1">${matchListHtml}${noMatches}</div>
    </div>`
  }

  const s = scorerState
  const homeScore = s.awayBoardClaimed.length
  const awayScore = s.homeBoardClaimed.length

  // Determine current state display
  const isRedemption = s.phase === 'redemption'
  const isOT = s.phase === 'overtime'
  const currentTeamName = s.currentTeam === 'home' ? s.homeName : s.awayName
  const currentColor = s.currentTeam === 'home' ? s.homeColor : s.awayColor
  const targetBoardId = s.currentTeam === 'home' ? 'away' : 'home'

  // Current putters
  let putterDisplay = ''
  if (!s.gameOver) {
    if (isRedemption) {
      const putters = s.currentTeam === 'home' ? s.homePlayers : s.awayPlayers
      putterDisplay = `<div class="turn-indicator animate-in" style="border-color:${currentColor};background:rgba(251,191,36,0.08)">
        <div style="font-size:var(--text-xs);color:var(--gold-400);font-weight:700;letter-spacing:0.1em;margin-bottom:2px">⚡ REDEMPTION ROUND</div>
        <span style="color:${currentColor}">${currentTeamName}</span> — putting at <strong>${targetBoardId === 'home' ? s.homeName : s.awayName}'s cups</strong>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${putters.map(p => p.name).join(' & ')} · Selecting: <strong>${putters[s.currentPutterIdx]?.name}</strong> (${s.currentPutterIdx + 1}/${putters.length})</div>
        <div style="font-size:var(--text-xs);color:var(--gold-400);margin-top:4px">Both make it = 🔥 Ball Back = Win!</div>
      </div>`
    } else {
      const putters = s.currentTeam === 'home' ? s.homePlayers : s.awayPlayers
      putterDisplay = `<div class="turn-indicator animate-in" style="border-color:${currentColor}">
        ${isOT ? '<div style="font-size:var(--text-xs);color:var(--gold-400);font-weight:700;letter-spacing:0.1em;margin-bottom:2px">⚡ OVERTIME</div>' : ''}
        <span style="color:${currentColor}">${currentTeamName}'s Turn</span> — putting at <strong>${targetBoardId === 'home' ? s.homeName : s.awayName}'s cups</strong>
        <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${putters.map(p => p.name).join(' & ')} · Selecting: <strong>${putters[s.currentPutterIdx]?.name}</strong> (${s.currentPutterIdx + 1}/${putters.length})</div>
      </div>`
    }
  }

  // Render boards — invert top board when stacked so cups face each other
  const isStacked = viewMode === 'stacked'
  const homeBoardHtml = renderSingleBoard(s.homeName, s.homeColor, s.homeBoardClaimed, s.awayColor, {
    interactive: !s.gameOver && targetBoardId === 'home',
    active: !s.gameOver && targetBoardId === 'home', overtime: isOT, boardId: 'home',
    inverted: isStacked
  })
  const awayBoardHtml = renderSingleBoard(s.awayName, s.awayColor, s.awayBoardClaimed, s.homeColor, {
    interactive: !s.gameOver && targetBoardId === 'away',
    active: !s.gameOver && targetBoardId === 'away', overtime: isOT, boardId: 'away'
  })

  const viewClass = viewMode === 'focused' ? 'focused' : viewMode === 'stacked' ? 'stacked' : ''

  // Turn log
  const turnLogHtml = s.turns.slice().reverse().slice(0, 12).map(t => {
    const team = getTeam(t.teamId)
    const phaseTag = t.redemption ? '<span class="badge badge-gold" style="font-size:8px">RDM</span> ' : t.overtime ? '<span class="badge badge-cyan" style="font-size:8px">OT</span> ' : ''
    return `<div class="turn-entry">
      <span class="turn-num">#${t.turnNumber}</span>
      <span class="team-dot" style="background:${team.color}"></span>
      <span style="flex:1">${phaseTag}${t.putts.map(p => {
        const name = getPlayer(p.playerId)?.name?.split(' ')[0] || '?'
        return `${name}: ${p.made ? '✅' + (p.hole !== 'miss' ? ' ' + p.hole : '') : '❌'}`
      }).join(' · ')}</span>
      ${t.ballBack ? '<span class="badge badge-gold" style="font-size:9px">🔥BB</span>' : ''}
    </div>`
  }).join('')

  return `<div class="page container">
    <div class="page-header animate-in"><h1>🎯 Live Scorer</h1></div>
    <div class="scorer-header animate-in">
      <div class="scorer-team"><div class="scorer-team-name" style="color:${s.homeColor}">${s.homeName}</div><div class="scorer-team-score ${homeScore > awayScore ? 'text-green' : ''}">${homeScore}</div></div>
      <div class="scorer-vs">—</div>
      <div class="scorer-team"><div class="scorer-team-name" style="color:${s.awayColor}">${s.awayName}</div><div class="scorer-team-score ${awayScore > homeScore ? 'text-green' : ''}">${awayScore}</div></div>
    </div>

    ${s.gameOver ? `
      <div class="card-glass animate-in text-center" style="padding:var(--space-8);margin-bottom:var(--space-6)">
        <div style="font-size:var(--text-4xl);margin-bottom:var(--space-3)">🏆</div>
        <h2 style="font-family:var(--font-display);font-weight:900">${s.winner} Wins!</h2>
        <p class="text-secondary" style="margin-top:var(--space-2)">${s.turns.length} turns · ${s.totalBBs} ball backs${s.overtime ? ' · Went to OT' : ''}${s.hadRedemption ? ' · Redemption attempted' : ''}</p>
        <button class="btn btn-primary" style="margin-top:var(--space-4)" id="scorer-save-btn">Save & Finish</button>
      </div>` : putterDisplay}

    <div class="view-toggle animate-in">
      <button class="view-toggle-btn ${viewMode === 'side' ? 'active' : ''}" data-view="side">Side by Side</button>
      <button class="view-toggle-btn ${viewMode === 'focused' ? 'active' : ''}" data-view="focused">Focused</button>
      <button class="view-toggle-btn ${viewMode === 'stacked' ? 'active' : ''}" data-view="stacked">Stacked</button>
    </div>

    <div class="dual-boards ${viewClass} animate-in delay-1">${homeBoardHtml}${awayBoardHtml}</div>

    ${!s.gameOver ? (() => {
      const tgt = s.currentTeam === 'home' ? 'away' : 'home'
      const tgtOpen = tgt === 'home' ? s.homeBoardOpen : s.awayBoardOpen
      const noHolesLeft = tgtOpen.size === 0
      return `<div class="scorer-actions animate-in delay-2">
        ${noHolesLeft ? '<button class="scorer-action-btn made" id="scorer-made-btn">✅ Made It</button>' : ''}
        <button class="scorer-action-btn miss" id="scorer-miss-btn">✕ Miss</button>
      </div>`
    })() : ''}

    ${s.turns.length ? `<section class="animate-in delay-3" style="margin-top:var(--space-6)">
      <div class="section-header"><h3>Turn Log</h3><span class="badge badge-pink">${s.turns.length} turns</span></div>
      <div class="card turn-log" style="padding:var(--space-3)">${turnLogHtml}</div>
    </section>` : ''}

    <div class="mt-4"><button class="btn btn-ghost" id="scorer-reset-btn">← New Game</button></div>
    <div id="ball-back-toast" class="ball-back-toast">🔥 BALL BACK!</div>
  </div>`
}

// ─── Event Handling ───
export function handleScorerEvents(e) {
  const target = e.target

  if (target.closest('.view-toggle-btn')) {
    const view = target.closest('.view-toggle-btn').dataset.view
    if (view) { viewMode = view; return true }
  }
  if (target.closest('.league-tab') && !scorerState) {
    const view = target.closest('.league-tab').dataset.league
    if (view) { setSelectedLeague(view); return true }
  }
  if (target.closest('.match-pick-item')) {
    const matchId = target.closest('.match-pick-item').dataset.matchId
    if (matchId) { startGame(matchId); return true }
  }
  if (target.closest('.board-hole')) {
    const el = target.closest('.board-hole')
    const hole = el.dataset.hole, boardId = el.dataset.board
    if (hole && scorerState && !scorerState.gameOver) {
      const expectedBoard = scorerState.currentTeam === 'home' ? 'away' : 'home'
      if (boardId === expectedBoard) { recordPutt(hole, true); return true }
    }
  }
  if (target.id === 'scorer-made-btn' && scorerState && !scorerState.gameOver) {
    recordPutt('cleared', true); return true
  }
  if (target.id === 'scorer-miss-btn' && scorerState && !scorerState.gameOver) {
    recordPutt(null, false); return true
  }
  if (target.id === 'scorer-save-btn' && scorerState) {
    saveGameResult(); scorerState = null; return true
  }
  if (target.id === 'scorer-reset-btn') { scorerState = null; return true }
  return false
}

// ─── Game Logic ───
function startGame(matchId) {
  const match = getAllMatches().find(m => m.id === matchId)
  if (!match) return
  const ht = getTeam(match.homeTeamId), at = getTeam(match.awayTeamId)

  scorerState = {
    matchId,
    homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId,
    homeName: ht.name, awayName: at.name,
    homeColor: ht.color, awayColor: at.color,
    homePlayers: getTeamRoster(match.homeTeamId).slice(0, 2),
    awayPlayers: getTeamRoster(match.awayTeamId).slice(0, 2),
    homeBoardClaimed: [], awayBoardClaimed: [],
    homeBoardOpen: new Set(HOLES), awayBoardOpen: new Set(HOLES),
    currentTeam: 'home',
    currentPutterIdx: 0,
    currentTurnPutts: [],
    turns: [], turnNumber: 0, totalBBs: 0,
    phase: 'normal', // 'normal' | 'redemption' | 'overtime'
    redemptionPutterIdx: 0,
    firstToClear: null, // team that cleared first
    hadRedemption: false,
    gameOver: false, winner: null, overtime: false,
    homeStreak: 0, awayStreak: 0, // Streak tracking
  }
}

function recordPutt(hole, made) {
  const s = scorerState
  const targetBoardId = s.currentTeam === 'home' ? 'away' : 'home'
  const boardOpen = targetBoardId === 'home' ? s.homeBoardOpen : s.awayBoardOpen
  const boardClaimed = targetBoardId === 'home' ? s.homeBoardClaimed : s.awayBoardClaimed

  if (s.phase === 'redemption') {
    return recordRedemptionPutt(hole, made, boardOpen, boardClaimed, targetBoardId)
  }

  // Normal / OT play
  const putters = s.currentTeam === 'home' ? s.homePlayers : s.awayPlayers
  const putter = putters[s.currentPutterIdx]
  const putt = { playerId: putter.id, hole: hole || 'miss', made, board: targetBoardId }
  s.currentTurnPutts.push(putt)

  const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'

  if (made && hole && boardOpen.has(hole)) {
    boardOpen.delete(hole)
    boardClaimed.push(hole)
    s[streakKey]++
    // Trigger streak toasts!
    if (s[streakKey] === 3) showToast("🔥 ON FIRE! 3 IN A ROW!", "streak")
    else if (s[streakKey] === 4) showToast("⚡ UNSTOPPABLE! 4 IN A ROW!", "streak")
    else if (s[streakKey] === 5) showToast("🚨 IMPOSSIBLE! 5 IN A ROW!", "streak")
    else if (s[streakKey] === 6) showToast("👑 PERFECT BOARD! 6 IN A ROW!", "streak")
  } else {
    if (!made) s[streakKey] = 0
  }

  s.currentPutterIdx++

  if (s.currentPutterIdx >= putters.length) {
    finishTurn(putters, boardClaimed, targetBoardId)
  }
}

function finishTurn(putters, boardClaimed, targetBoardId) {
  const s = scorerState
  s.turnNumber++
  const ballBack = s.currentTurnPutts.length >= 2 && s.currentTurnPutts.every(p => p.made)

  s.turns.push({
    turnNumber: s.turnNumber,
    teamId: s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId,
    putters: putters.map(p => p.id),
    putts: [...s.currentTurnPutts],
    ballBack, overtime: s.phase === 'overtime', redemption: false,
  })

  if (ballBack) { s.totalBBs++ }

  // Check if all cups cleared on opponent's board
  const targetCount = 6
  if (boardClaimed.length >= targetCount) {
    // Ball back + board cleared OR Overtime cleared = INSTANT WIN
    if (ballBack || s.phase === 'overtime') {
      s.gameOver = true
      s.winner = s.currentTeam === 'home' ? s.homeName : s.awayName
      s.currentTurnPutts = []
      s.currentPutterIdx = 0
      showToast(`🏆 ${s.winner} WINS!`, 'winner')
      return
    }
    // No ball back → redemption for the other team
    s.firstToClear = s.currentTeam
    s.phase = 'redemption'
    s.hadRedemption = true
    s.currentTeam = s.currentTeam === 'home' ? 'away' : 'home'
    s.redemptionPutterIdx = 0
    s.currentTurnPutts = []
    s.currentPutterIdx = 0
    return
  }

  s.currentTurnPutts = []
  s.currentPutterIdx = 0
  if (!ballBack) {
    s.currentTeam = s.currentTeam === 'home' ? 'away' : 'home'
  } else {
    showToast('🔥 BALL BACK!')
  }
}

function recordRedemptionPutt(hole, made, boardOpen, boardClaimed, targetBoardId) {
  const s = scorerState
  const putters = s.currentTeam === 'home' ? s.homePlayers : s.awayPlayers
  const putter = putters[s.currentPutterIdx]

  const putt = { playerId: putter.id, hole: hole || 'miss', made, board: targetBoardId }
  s.currentTurnPutts.push(putt)

  const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'

  if (made && hole && boardOpen.has(hole)) {
    boardOpen.delete(hole)
    boardClaimed.push(hole)
    s[streakKey]++
    if (s[streakKey] === 3) showToast("🔥 ON FIRE! 3 IN A ROW!", "streak")
    else if (s[streakKey] === 4) showToast("⚡ UNSTOPPABLE! 4 IN A ROW!", "streak")
    else if (s[streakKey] === 5) showToast("🚨 IMPOSSIBLE! 5 IN A ROW!", "streak")
    else if (s[streakKey] === 6) showToast("👑 PERFECT BOARD! 6 IN A ROW!", "streak")
  } else {
    if (!made) s[streakKey] = 0
  }

  s.currentPutterIdx++

  // Wait for both putters to finish the turn
  if (s.currentPutterIdx >= putters.length) {
    s.turnNumber++
    const ballBack = s.currentTurnPutts.length >= 2 && s.currentTurnPutts.every(p => p.made)
    const anyMade = s.currentTurnPutts.some(p => p.made)

    s.turns.push({
      turnNumber: s.turnNumber,
      teamId: s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId,
      putters: putters.map(p => p.id),
      putts: [...s.currentTurnPutts],
      ballBack, overtime: s.overtime, redemption: true,
    })

    if (ballBack) { s.totalBBs++ }

    const targetCount = 6
    const boardCleared = boardClaimed.length >= targetCount

    if (boardCleared && ballBack) {
      // Ball back + cleared = redemption team WINS outright (no OT)
      s.gameOver = true
      s.winner = s.currentTeam === 'home' ? s.homeName : s.awayName
      s.currentTurnPutts = []
      s.currentPutterIdx = 0
      showToast(`🏆 ${s.winner} WINS!`, 'winner')
      return
    }

    if (boardCleared && !ballBack) {
      // Cleared but no ball back → TIE → Overtime
      s.phase = 'overtime'
      s.overtime = true
      s.homeBoardClaimed = ['back-1', 'back-2', 'back-3']
      s.awayBoardClaimed = ['back-1', 'back-2', 'back-3']
      s.homeBoardOpen = new Set(OT_HOLES)
      s.awayBoardOpen = new Set(OT_HOLES)
      s.currentTeam = s.firstToClear === 'home' ? 'away' : 'home'
      s.currentPutterIdx = 0
      s.currentTurnPutts = []
      s.firstToClear = null
      return
    }

    if (!anyMade) {
      // Both missed → redemption over, first team wins
      s.gameOver = true
      s.winner = s.firstToClear === 'home' ? s.homeName : s.awayName
      s.currentTurnPutts = []
      s.currentPutterIdx = 0
      showToast(`🏆 ${s.winner} WINS!`, 'winner')
      return
    }

    // At least one made but board not cleared → keep going
    s.currentTurnPutts = []
    s.currentPutterIdx = 0
    if (ballBack) {
      showToast('🔥 BALL BACK!')
    }
    // Ball back = same team goes again, otherwise they still go (it's redemption)
  }
}

function showToast(message, isWinner = false) {
  // Remove any stale toast classes first
  const existing = document.getElementById('ball-back-toast')
  if (existing) {
    existing.classList.remove('show', 'winner-toast')
    existing.innerHTML = message
    if (isWinner) {
      existing.classList.add('winner-toast')
    }
  }
  setTimeout(() => {
    const t = document.getElementById('ball-back-toast')
    if (t) {
      t.classList.add('show')
      setTimeout(() => t.classList.remove('show'), isWinner ? 3500 : 1800)
    }
  }, 150)
}

function saveGameResult() {
  const s = scorerState
  const homeScore = s.awayBoardClaimed.length
  const awayScore = s.homeBoardClaimed.length
  saveMatch(s.matchId, {
    turns: s.turns,
    holesWon: { [s.homeTeamId]: [...s.awayBoardClaimed], [s.awayTeamId]: [...s.homeBoardClaimed] },
    finalScore: { home: homeScore, away: awayScore },
    totalTurns: s.turnNumber,
    ballBacks: {
      [s.homeTeamId]: s.turns.filter(t => t.teamId === s.homeTeamId && t.ballBack).length,
      [s.awayTeamId]: s.turns.filter(t => t.teamId === s.awayTeamId && t.ballBack).length,
    },
    winnerId: homeScore >= awayScore ? s.homeTeamId : s.awayTeamId,
    overtime: s.overtime,
  })
}
