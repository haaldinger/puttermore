import { getActiveSeason, getStandings, getAllMatches, getTeam, getTeamRoster, getTeamMatches, getPlayerStats, getPlayer, getAllPlayers, getAllLeagues, getLeague, getVenue, getLeagueTeams, getTeamAdvancedStats, getHoleShortName, getAllTeams, getHeadToHead, hasAnySyntheticData, getPlayerSyntheticGameCount, isOverrideGame } from '../data.js'
import { renderBoard } from '../board.js'
import { getSelectedLeague } from './home.js'
import { getLoggedInUser, setLoggedInUser, logout, approveMatch, updateMatch, addPlayer, removePlayer, updatePlayer, assignCaptain, updatePlayerPutter, createMatch, updateMatchTeams, updateMatchWeek, deleteMatch, quickScoreMatch } from '../store.js'
import { getCurrentDate, getTimeState, getWeekNumber } from '../time.js'

// ─── Putter SVG Renderer ───
export function renderPutterSvg(type, color = '#e91e8b') {
  let headPath = '';
  let shaftPath = '<line x1="40" y1="20" x2="60" y2="85" stroke="#ccc" stroke-width="3" stroke-linecap="round"/>';
  let details = '';

  if (type === 'blade') {
    headPath = `<path d="M 52 82 L 85 82 C 88 82, 88 89, 85 89 L 45 89 C 43 89, 43 84, 45 84 L 52 84 Z" fill="${color}" stroke="#fff" stroke-width="1"/>`;
    details = `<line x1="55" y1="84" x2="80" y2="84" stroke="rgba(255,255,255,0.6)" stroke-width="1.5"/>
               <circle cx="50" cy="86" r="2" fill="#fff"/>`;
  } else if (type === 'mallet') {
    headPath = `<path d="M 45 80 L 80 80 C 85 80, 85 92, 80 92 L 45 92 C 40 92, 40 80, 45 80" fill="${color}" stroke="#fff" stroke-dasharray="3,1" stroke-width="1"/>`;
    details = `<path d="M 55 80 Q 65 88, 75 80" fill="none" stroke="#fff" stroke-width="1.5"/>`;
  } else if (type === 'gold') {
    headPath = `<path d="M 50 82 L 85 78 C 88 78, 90 85, 85 88 L 45 92 C 43 92, 42 85, 45 84 Z" fill="url(#goldGrad)" stroke="#ffd700" stroke-width="1"/>`;
    shaftPath = '<line x1="40" y1="20" x2="60" y2="85" stroke="url(#goldGrad)" stroke-width="3.5" stroke-linecap="round"/>';
    details = `<circle cx="65" cy="84" r="3" fill="#fff" filter="drop-shadow(0 0 3px #fff)"/>`;
  } else if (type === 'neon') {
    headPath = `<path d="M 48 82 L 88 82 L 88 90 L 48 90 Z" fill="rgba(233,30,139,0.3)" stroke="${color}" stroke-width="2" style="filter: drop-shadow(0 0 5px ${color})"/>`;
    shaftPath = `<line x1="40" y1="20" x2="60" y2="85" stroke="${color}" stroke-width="3" style="filter: drop-shadow(0 0 4px ${color})"/>`;
    details = `<line x1="50" y1="86" x2="86" y2="86" stroke="#fff" stroke-width="1"/>`;
  } else if (type === 'classic') {
    headPath = `<path d="M 50 82 Q 75 75, 82 82 L 78 90 Q 70 88, 48 88 Z" fill="#8B4513" stroke="#d4af37" stroke-width="1.5"/>`;
    shaftPath = '<line x1="40" y1="20" x2="60" y2="85" stroke="#d2b48c" stroke-width="4" stroke-linecap="round"/>';
    details = `<path d="M 72 80 L 82 82 L 78 90 L 68 86 Z" fill="#d4af37"/>`;
  } else {
    headPath = `<path d="M 48 82 L 82 82 L 80 92 L 46 92 Z" fill="#222" stroke="#444" stroke-width="1.5"/>`;
    shaftPath = '<line x1="40" y1="20" x2="60" y2="85" stroke="#333" stroke-width="3" stroke-linecap="round"/>';
    details = `<line x1="64" y1="82" x2="64" y2="92" stroke="${color}" stroke-width="2"/>`;
  }

  return `
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3))">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe875" />
          <stop offset="50%" stop-color="#f7b733" />
          <stop offset="100%" stop-color="#c18300" />
        </linearGradient>
        <linearGradient id="gripGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#333" />
          <stop offset="100%" stop-color="#111" />
        </linearGradient>
      </defs>
      <!-- Grip -->
      <rect x="36" y="15" width="8" height="20" rx="2" fill="url(#gripGrad)" stroke="rgba(255,255,255,0.1)" stroke-width="0.5" transform="rotate(-15 36 15)"/>
      <!-- Shaft -->
      \${shaftPath}
      <!-- Hosel -->
      <path d="M 58 80 L 62 80 L 60 85 Z" fill="#777"/>
      <!-- Head -->
      \${headPath}
      <!-- Details -->
      \${details}
    </svg>
  `;
}

// ─── League tabs helper ───
function leagueTabsHtml() {
  return getAllLeagues().map(l => {
    const v = getVenue(l.venueId)
    const isActive = l.id === getSelectedLeague()
    return `<button class="league-tab ${isActive ? 'active' : ''}" data-league="${l.id}" style="${isActive ? `background:${v.color}15;border-color:${v.color};color:${v.color}` : ''}">
      <span class="league-tab-name">${v.shortName}</span>
      <span class="league-tab-day">${l.day}s</span>
    </button>`
  }).join('')
}

// ─── Standings Page ───
export function renderStandings() {
  const season = getActiveSeason()
  const leagueId = getSelectedLeague()
  checkLeagueChanged(leagueId)
  const league = getLeague(leagueId)
  const venue = getVenue(league.venueId)
  const standings = getStandings(leagueId)

  // Map rank before sorting
  const displayStandings = standings.map((s, i) => ({ ...s, rank: i + 1 }))

  // Sort displayStandings dynamically
  displayStandings.sort((a, b) => {
    let valA, valB
    if (standingsSortColumn === 'rank') {
      valA = a.rank
      valB = b.rank
    } else if (standingsSortColumn === 'team') {
      valA = a.team.name.toLowerCase()
      valB = b.team.name.toLowerCase()
    } else if (standingsSortColumn === 'points') {
      valA = a.points
      valB = b.points
    } else if (standingsSortColumn === 'record') {
      valA = a.wins
      valB = b.wins
    } else if (standingsSortColumn === 'winPct') {
      valA = a.winPct
      valB = b.winPct
    } else if (standingsSortColumn === 'holeDiff') {
      valA = a.holeDiff
      valB = b.holeDiff
    } else if (standingsSortColumn === 'holesFor') {
      valA = a.holesFor
      valB = b.holesFor
    } else if (standingsSortColumn === 'ballBacks') {
      valA = a.ballBacks
      valB = b.ballBacks
    }

    if (valA < valB) return standingsSortDirection === 'desc' ? 1 : -1
    if (valA > valB) return standingsSortDirection === 'desc' ? -1 : 1
    
    // Tie-breaker
    return a.rank - b.rank
  })

  const rows = displayStandings.map((s) => `
    <tr data-nav="team/${s.team.id}" style="cursor:pointer">
      <td class="mono" style="text-align:center;font-weight:700">${s.rank}</td>
      <td>
        <div style="display: flex; align-items: center; gap: var(--space-2); text-align: left">
          <span class="team-dot" style="background:${s.team.color}; flex-shrink: 0"></span>
          <span style="font-weight: 600; line-height: 1.25; overflow-wrap: break-word">${s.team.name}</span>
        </div>
      </td>
      <td class="mono" style="font-weight:800;color:var(--gold-400);font-size:var(--text-lg)">${s.points}</td>
      <td class="mono">${s.wins}-${s.losses}</td>
      <td class="mono">${(s.winPct * 100).toFixed(0)}%</td>
      <td class="mono">${s.holeDiff > 0 ? '+' : ''}${s.holeDiff}</td>
      <td class="mono">${s.holesFor}</td>
      <td class="mono">${s.ballBacks}</td>
      <td>${s.currentStreak ? `<span class="badge ${s.currentStreak.startsWith('W')?'badge-win':'badge-loss'}">${s.currentStreak}</span>` : ''}</td>
      <td><span class="sparkline">${s.streak.map(r=>`<span class="sparkline-dot ${r==='W'?'win':'loss'}"></span>`).join('')}</span></td>
    </tr>`).join('')

  const sortIndicator = (col) => {
    if (standingsSortColumn === col) {
      return standingsSortDirection === 'desc' ? ' ▼' : ' ▲'
    }
    return ''
  }

  const isSorted = standingsSortColumn !== 'rank' || standingsSortDirection !== 'asc'
  const controlsHtml = `
    <div class="flex items-center justify-between animate-in" style="margin-bottom: var(--space-4); background: rgba(255,255,255,0.02); padding: var(--space-3) var(--space-4); border-radius: var(--radius-xl); border: 1px solid var(--border-card); font-size: var(--text-xs)">
      <div class="text-muted">
        ${isSorted ? `Sorted by <strong style="color: var(--pink-400)">${standingsSortColumn === 'winPct' ? 'Win %' : standingsSortColumn === 'holeDiff' ? 'Cup Differential' : standingsSortColumn === 'ballBacks' ? 'Ball Backs' : standingsSortColumn === 'holesFor' ? 'Holes Sunk' : standingsSortColumn === 'record' ? 'Record' : standingsSortColumn === 'points' ? 'Points' : standingsSortColumn}</strong> (${standingsSortDirection.toUpperCase()})` : 'Showing official standings hierarchy (Points → Win% → Cup Diff)'}
      </div>
      ${isSorted ? `
        <button class="btn btn-ghost btn-sm" id="standings-reset-btn" style="padding: var(--space-1) var(--space-3); font-size: 11px; height: auto; border: 1px dashed rgba(255,255,255,0.15)">✕ Reset Sort</button>
      ` : ''}
    </div>
  `

  return `<div class="page container">
    <div class="page-header animate-in"><h1>Season Standings</h1><p>${season.name} · Best-of-3 Series</p></div>
    <div class="league-tabs animate-in">${leagueTabsHtml()}</div>
    <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
    ${controlsHtml}
    <div class="table-wrapper animate-in delay-1"><table><thead><tr>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="rank">#${sortIndicator('rank')}</th>
      <th style="cursor:pointer; user-select:none" data-standings-sort="team">Team${sortIndicator('team')}</th>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="points">Pts${sortIndicator('points')}</th>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="record">Record${sortIndicator('record')}</th>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="winPct">Win%${sortIndicator('winPct')}</th>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="holeDiff">+/-${sortIndicator('holeDiff')}</th>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="holesFor">Holes${sortIndicator('holesFor')}</th>
      <th style="cursor:pointer; user-select:none; text-align:center" data-standings-sort="ballBacks">🔥 BB${sortIndicator('ballBacks')}</th>
      <th style="text-align:center">Streak</th>
      <th style="text-align:center">Form</th>
    </tr></thead><tbody>${rows}</tbody></table></div>
  </div>`
}

// ─── Schedule Page ───
export function renderSchedule() {
  const season = getActiveSeason()
  const leagueId = getSelectedLeague()
  checkLeagueChanged(leagueId)
  const league = getLeague(leagueId)
  const venue = getVenue(league.venueId)
  
  const allMatches = getAllMatches().filter(m => m.leagueId === leagueId).sort((a, b) => a.weekNumber - b.weekNumber)
  
  // Filter matches by selected team
  const filteredMatches = allMatches.filter(m => {
    if (!scheduleTeamFilter) return true
    return m.homeTeamId === scheduleTeamFilter || m.awayTeamId === scheduleTeamFilter
  })

  const weeks = {}
  filteredMatches.forEach(m => { if (!weeks[m.weekNumber]) weeks[m.weekNumber] = []; weeks[m.weekNumber].push(m) })

  let weeksHtml = Object.entries(weeks).map(([wk, ms]) => {
    const isWkComplete = ms.every(m => m.status === 'completed')
    const isWkPending = ms.some(m => m.status === 'pending_review') && !isWkComplete
    
    let weekBadge = `<span class="badge badge-pink">Upcoming</span>`
    if (isWkComplete) {
      weekBadge = `<span class="badge badge-win">Complete</span>`
    } else if (isWkPending) {
      weekBadge = `<span class="badge badge-gold">Pending Approval</span>`
    }

    return `
    <section class="home-section animate-in">
      <div class="section-header"><h3>Week ${wk}</h3>${weekBadge}</div>
      <div class="flex flex-col gap-3">${ms.map(m => {
        const ht = getTeam(m.homeTeamId), at = getTeam(m.awayTeamId)
        const isCompleted = m.status === 'completed'
        const isPending = m.status === 'pending_review'
        const showScore = isCompleted || isPending
        const canClick = isCompleted || isPending
        const isHomeWinner = showScore && m.winnerId === m.homeTeamId
        const isAwayWinner = showScore && m.winnerId === m.awayTeamId
        const hasOT = showScore && m.games && m.games.some(g => g.overtime)
        const seriesLabel = showScore && m.seriesScore ? `${m.seriesScore.home}–${m.seriesScore.away}` : 'vs'

        return `<div class="card match-card" ${canClick ? `data-nav="match/${m.id}" style="cursor:pointer"` : ''}>
          <div class="match-meta" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-2)">
            <span>${m.date ? new Date(m.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) : 'TBD'}${hasOT?' · ⚡OT':''}</span>
            <span style="display:flex;gap:6px;align-items:center">
              ${isPending ? `<span class="badge badge-gold" style="font-size:9px">⏳ PENDING</span>` : ''}
              ${isCompleted ? `<span class="badge" style="font-size:9px;background:rgba(255,255,255,0.05);color:var(--text-secondary)">Best of 3</span>` : ''}
            </span>
          </div>
          <div class="match-teams">
            <div class="match-team${isHomeWinner ? ' winner' : ''}"><span class="team-dot" style="background:${ht.color}"></span>${ht.name}${isHomeWinner ? ' 👑' : ''}</div>
            <div class="match-score">${showScore
              ? `<span class="${isCompleted && isHomeWinner ? 'text-green' : ''}" style="font-size:var(--text-xl);font-weight:800">${m.seriesScore?.home || 0}</span><span class="text-muted">–</span><span class="${isCompleted && isAwayWinner ? 'text-green' : ''}" style="font-size:var(--text-xl);font-weight:800">${m.seriesScore?.away || 0}</span>`
              : '<span class="text-muted">vs</span>'}</div>
            <div class="match-team away${isAwayWinner ? ' winner' : ''}">${isAwayWinner ? '👑 ' : ''}${at.name}<span class="team-dot" style="background:${at.color}"></span></div>
          </div>
          ${isCompleted ? `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-2);font-size:10px;color:var(--text-muted)">
            <span>Games: ${m.games?.length || 0}</span>
            <span style="display:flex;gap:6px">
              ${isHomeWinner ? `<span style="color:${ht.color};font-weight:700">${ht.name.split(' ')[0]} +${m.homePoints}pts</span>` : ''}
              ${isAwayWinner ? `<span style="color:${at.color};font-weight:700">${at.name.split(' ')[0]} +${m.awayPoints}pts</span>` : ''}
              ${!isHomeWinner && m.homePoints > 0 ? `<span style="color:${ht.color}">${ht.name.split(' ')[0]} +${m.homePoints}pt</span>` : ''}
              ${!isAwayWinner && m.awayPoints > 0 ? `<span style="color:${at.color}">${at.name.split(' ')[0]} +${m.awayPoints}pt</span>` : ''}
            </span>
          </div>` : ''}
        </div>`}).join('')}</div>
    </section>`
  }).join('')

  if (filteredMatches.length === 0) {
    weeksHtml = `
      <div class="card card-glass text-center animate-in" style="padding: var(--space-8); margin-top: var(--space-4)">
        <p class="text-muted">No matches scheduled for the selected team in this league.</p>
      </div>
    `
  }

  const selectedTeam = getLeagueTeams(leagueId).find(t => t.id === scheduleTeamFilter)
  const activeTeamName = selectedTeam ? selectedTeam.name : 'All Teams'

  const dropdownOptionsHtml = getLeagueTeams(leagueId).map(t => `
    <div class="custom-select-option ${scheduleTeamFilter === t.id ? 'active' : ''}" data-value="${t.id}" style="padding: var(--space-2) var(--space-3); font-size: var(--text-xs); color: ${scheduleTeamFilter === t.id ? 'var(--pink-400)' : 'var(--text-primary)'}; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.15s ease; display: flex; align-items: center; justify-content: space-between; font-weight: ${scheduleTeamFilter === t.id ? '700' : '400'}">
      <span>${t.name}</span>
      ${scheduleTeamFilter === t.id ? '<span style="font-weight:800; color:var(--pink-400)">✓</span>' : ''}
    </div>
  `).join('')

  const filtersHtml = `
    <div class="flex flex-wrap items-center justify-between gap-3 animate-in" style="margin-bottom: var(--space-4); background: rgba(255,255,255,0.02); padding: var(--space-3) var(--space-4); border-radius: var(--radius-xl); border: 1px solid var(--border-card); position: relative; z-index: 50; overflow: visible">
      <div class="flex items-center gap-3" style="flex-wrap: wrap; overflow: visible">
        <span style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500">Filter matches by team:</span>
        <div class="custom-select-container" style="position: relative; min-width: 200px">
          <button class="custom-select-trigger" id="schedule-team-select-trigger" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-card); border-radius: var(--radius-md); font-size: var(--text-xs); outline: none; cursor: pointer; text-align: left">
            <span>🎯 ${activeTeamName}</span>
            <span style="font-size: 8px; color: var(--text-secondary); margin-left: 8px">▼</span>
          </button>
          <div class="custom-select-dropdown" id="schedule-team-select-dropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: rgba(18,18,18,0.98); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); box-shadow: 0 12px 40px rgba(0,0,0,0.6); z-index: 999; max-height: 350px; overflow-y: auto; padding: 4px">
            <div class="custom-select-option ${scheduleTeamFilter === '' ? 'active' : ''}" data-value="" style="padding: var(--space-2) var(--space-3); font-size: var(--text-xs); color: ${scheduleTeamFilter === '' ? 'var(--pink-400)' : 'var(--text-primary)'}; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.15s ease; display: flex; align-items: center; justify-content: space-between; font-weight: ${scheduleTeamFilter === '' ? '700' : '400'}">
              <span>🎯 All Teams</span>
              ${scheduleTeamFilter === '' ? '<span style="font-weight:800; color:var(--pink-400)">✓</span>' : ''}
            </div>
            ${dropdownOptionsHtml}
          </div>
        </div>
      </div>
      ${scheduleTeamFilter ? `
        <button class="btn btn-ghost btn-sm" id="schedule-clear-filter-btn" style="padding: var(--space-2) var(--space-4); font-size: var(--text-xs); border: 1px dashed rgba(255,255,255,0.15)">✕ Clear Filter</button>
      ` : ''}
    </div>
  `

  return `<div class="page container">
    <div class="page-header animate-in"><h1>Schedule</h1><p>${season.name}</p></div>
    <div class="league-tabs animate-in">${leagueTabsHtml()}</div>
    <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
    ${filtersHtml}
    ${weeksHtml}
  </div>`
}

// ─── Teams Page ───
export function renderTeams() {
  const season = getActiveSeason()
  const leagueId = getSelectedLeague()
  const league = getLeague(leagueId)
  const venue = getVenue(league.venueId)
  const standings = getStandings(leagueId)

  const cardsHtml = standings.map((s, i) => `
    <div class="card animate-in" data-nav="team/${s.team.id}" style="cursor:pointer;padding:var(--space-5);animation-delay:${i*60}ms">
      <div class="flex items-center gap-3" style="margin-bottom:var(--space-3)">
        <div style="width:40px;height:40px;border-radius:50%;background:${s.team.color};display:flex;align-items:center;justify-content:center;font-weight:800;font-family:var(--font-display);color:#fff;font-size:var(--text-sm)">${i+1}</div>
        <div><div style="font-weight:700;font-family:var(--font-display)">${s.team.name}</div>
        <div style="font-size:var(--text-xs);color:var(--text-muted)">${s.wins}W-${s.losses}L · ${(s.winPct*100).toFixed(0)}%</div></div>
      </div>
      <div class="flex gap-3" style="font-size:var(--text-xs);color:var(--text-secondary)">
        <span>Holes: ${s.holesFor}</span><span>Diff: ${s.holeDiff>0?'+':''}${s.holeDiff}</span><span>🔥 ${s.ballBacks} BB</span>
      </div>
      <div style="margin-top:var(--space-2)"><span class="sparkline">${s.streak.map(r=>`<span class="sparkline-dot ${r==='W'?'win':'loss'}"></span>`).join('')}</span></div>
    </div>`).join('')

  return `<div class="page container">
    <div class="page-header animate-in"><h1>Teams</h1><p>${league.name} · ${venue.name}</p></div>
    <div class="league-tabs animate-in">${leagueTabsHtml()}</div>
    <div class="grid-2">${cardsHtml}</div>
  </div>`
}

// ─── Team Profile ───
export function renderTeamProfile(teamId) {
  const team = getTeam(teamId)
  if (!team) return '<div class="page container"><h1>Team not found</h1></div>'
  const roster = getTeamRoster(teamId)
  const teamMatches = getTeamMatches(teamId)
  const season = getActiveSeason()
  const standings = getStandings(team.leagueId)
  const teamStanding = standings.find(s => s.team.id === teamId)
  const advanced = getTeamAdvancedStats(teamId)
  const h2h = getHeadToHead(teamId, team.leagueId)

  const rosterHtml = roster.map(p => {
    const stats = getPlayerStats(p.id)
    return `<div class="roster-item" data-nav="player/${p.id}">
      <div class="roster-avatar" style="background:${p.avatarColor}">${p.name.split(' ').map(n=>n[0]).join('')}</div>
      <div style="flex:1"><div class="roster-name">${p.name}</div><div class="roster-role">${team.captainPlayerId===p.id?'🧢 Captain':''} · ${stats.gamesPlayed} games</div></div>
      <div style="text-align:right"><div style="font-weight:700;color:var(--pink-400)">${(stats.puttingPct*100).toFixed(0)}%</div><div style="font-size:var(--text-xs);color:var(--text-muted)">accuracy</div></div>
    </div>`}).join('')

  const matchesHtml = teamMatches.map(m => {
    const opp = m.homeTeamId === teamId ? m.awayTeam : m.homeTeam
    const isHome = m.homeTeamId === teamId
    const seriesFor = m.seriesScore ? (isHome ? m.seriesScore.home : m.seriesScore.away) : 0
    const seriesAgainst = m.seriesScore ? (isHome ? m.seriesScore.away : m.seriesScore.home) : 0
    const won = m.winnerId === teamId
    const pts = isHome ? (m.homePoints || 0) : (m.awayPoints || 0)
    return `<div class="card match-card" ${m.status === 'completed' ? `data-nav="match/${m.id}" style="cursor:pointer"` : ''}>
      <div class="match-meta" style="display:flex;justify-content:space-between;align-items:center">
        <span>Week ${m.weekNumber} · ${m.status === 'completed' ? (won ? '✅ Win' : '❌ Loss') : 'Scheduled'}</span>
        ${m.status === 'completed' ? `<span class="mono" style="font-weight:800;color:var(--gold-400)">+${pts}pts</span>` : ''}
      </div>
      <div class="flex items-center justify-between" style="margin-top:var(--space-1)">
        <span><span class="team-dot" style="background:${opp.color}"></span> vs ${opp.name}</span>
        ${m.status === 'completed' ? `<span class="mono" style="font-weight:700">${seriesFor} – ${seriesAgainst}</span>` : `<span class="text-muted">Bo3</span>`}
      </div>
    </div>`}).join('')

  // Head-to-head records
  const h2hHtml = h2h.length ? h2h.map(record => `
    <div class="flex items-center justify-between" style="padding:var(--space-2) var(--space-3);border-radius:var(--radius-md);background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04)">
      <div class="flex items-center gap-2">
        <span class="team-dot" style="background:${record.opponent.color}"></span>
        <span style="font-weight:600;font-size:var(--text-sm)">${record.opponent.name}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="mono" style="font-weight:700;font-size:var(--text-sm);color:${record.wins > record.losses ? 'var(--green-400)' : record.wins < record.losses ? 'var(--red-400)' : 'var(--text-secondary)'}">${record.wins}W – ${record.losses}L</span>
        ${record.matches === 0 ? '<span class="text-muted" style="font-size:10px">Not yet played</span>' : ''}
      </div>
    </div>
  `).join('') : '<div class="text-muted text-sm">No matches played yet</div>'

  const holeBreakdown = advanced && advanced.holeStats ? advanced.holeStats.map(hs => {
    const pct = (hs.pct * 100).toFixed(0)
    const nameMap = {
      'back-1': 'B1 (Back L)', 'back-2': 'B2 (Back C)', 'back-3': 'B3 (Back R)',
      'middle-1': 'M1 (Mid L)', 'middle-2': 'M2 (Mid R)', 'front-1': 'F1 (Front)'
    }
    const label = nameMap[hs.hole] || hs.hole
    return `<div class="flex items-center gap-3" style="font-size:var(--text-sm);padding:var(--space-1) 0">
      <span style="width:100px;font-weight:600;color:var(--text-secondary)">${label}</span>
      <div style="flex:1;height:8px;background:var(--bg-surface);border-radius:4px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${team.color};border-radius:4px;transition:width 0.5s var(--ease-out)"></div>
      </div>
      <span class="mono" style="width:36px;text-align:right;font-weight:700;color:${team.color}">${pct}%</span>
      <span class="text-xs text-muted" style="width:50px;text-align:right">${hs.made}/${hs.attempted}</span>
    </div>`
  }).join('') : ''

  const weeklyHtml = advanced && advanced.weeklyBreakdown ? advanced.weeklyBreakdown.map(w => `
    <div style="text-align:center">
      <div style="height:60px;display:flex;align-items:flex-end;justify-content:center">
        <div style="width:24px;height:${w.putts>0?Math.round(w.made/w.putts*60):4}px;background:${team.color};border-radius:4px 4px 0 0;transition:height 0.5s var(--ease-out)"></div>
      </div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">Wk ${w.week}</div>
      <div style="font-size:10px;color:var(--text-secondary)">${w.made}/${w.putts}</div>
      <span class="badge ${w.won?'badge-win':'badge-loss'}" style="font-size:9px;margin-top:2px">${w.won?'W':'L'}</span>
    </div>`).join('') : ''

  return `<div class="page container">
    <div class="profile-header animate-in">
      <div class="profile-avatar" style="background:${team.color}">${team.name.split(' ').map(n=>n[0]).join('')}</div>
      <div><div class="profile-name">${team.name}</div><div class="profile-meta">${season.name}</div></div>
    </div>
    ${teamStanding && advanced ? `<div class="stats-grid animate-in delay-1">
      <div class="stat-card"><div class="stat-value" style="color:var(--gold-400);font-size:var(--text-3xl)">${advanced.totalPoints}</div><div class="stat-label">Points</div></div>
      <div class="stat-card"><div class="stat-value">${teamStanding.wins}<span class="text-muted">-</span>${teamStanding.losses}</div><div class="stat-label">Series Record</div></div>
      <div class="stat-card">
        <div class="stat-value text-green">${(advanced.puttingPct*100).toFixed(0)}%</div>
        <div class="stat-label">Accuracy <span class="text-muted text-xs font-normal">(${advanced.totalMade}/${advanced.totalPutts})</span></div>
      </div>
      <div class="stat-card"><div class="stat-value text-gold">${advanced.totalBallBacks}</div><div class="stat-label">🔥 Ball Backs</div></div>
    </div>` : ''}

    <section class="animate-in delay-1" style="margin-top:var(--space-6)">
      <div class="section-header"><h3>⚔️ Head-to-Head</h3></div>
      <div class="card" style="padding:var(--space-3);display:flex;flex-direction:column;gap:var(--space-2)">
        ${h2hHtml}
      </div>
    </section>

    <div class="grid-2" style="margin-top:var(--space-6);align-items:start">
      <section class="animate-in delay-2">
        <div class="section-header"><h3>Hole Accuracy</h3></div>
        <div class="card" style="padding:var(--space-4)">
          ${holeBreakdown || '<div class="text-muted text-sm">No putting data yet</div>'}
        </div>
      </section>

      ${advanced && advanced.weeklyBreakdown.length ? `<section class="animate-in delay-3">
        <div class="section-header"><h3>Weekly Trend</h3></div>
        <div class="card" style="padding:var(--space-4)">
          <div style="display:flex;gap:var(--space-4);justify-content:center;overflow-x:auto">${weeklyHtml}</div>
        </div>
      </section>` : ''}
    </div>

    <section class="animate-in delay-2 mb-6" style="margin-top:var(--space-6)">
      <div class="section-header"><h3>Roster</h3></div>
      <div class="card" style="padding:var(--space-2)">${rosterHtml}</div>
    </section>
    <section class="animate-in delay-3">
      <div class="section-header"><h3>Match History</h3></div>
      <div class="flex flex-col gap-3">${matchesHtml}</div>
    </section>
    <div class="mt-4"><button class="btn btn-ghost" data-nav="teams">← All Teams</button></div>
  </div>`
}

let playerSearchQuery = ''
let playerTeamFilter = ''
let playerSortColumn = 'accuracy'
let playerSortDirection = 'desc'

// Standings & Schedule state
let standingsSortColumn = 'rank'
let standingsSortDirection = 'asc'
let scheduleTeamFilter = ''
let lastLeagueId = ''

function checkLeagueChanged(leagueId) {
  if (lastLeagueId && lastLeagueId !== leagueId) {
    playerTeamFilter = ''
    scheduleTeamFilter = ''
    standingsSortColumn = 'rank'
    standingsSortDirection = 'asc'
  }
  lastLeagueId = leagueId
}


export function renderPlayersPage() {
  const season = getActiveSeason()
  const currentLeagueId = getSelectedLeague()
  const currentLeague = getLeague(currentLeagueId)
  const venue = getVenue(currentLeague.venueId)
  
  const displayPlayers = []
  const standings = getStandings(currentLeagueId)
  
  const playerBanterCounts = {}
  getAllMatches().forEach(m => {
    if (m.status === 'completed' && m.banterLog) {
      m.banterLog.forEach(b => {
        if (!playerBanterCounts[b.playerId]) playerBanterCounts[b.playerId] = 0
        playerBanterCounts[b.playerId]++
      })
    }
  })

  standings.forEach(s => {
    const roster = getTeamRoster(s.team.id)
    roster.forEach(p => {
      const stats = getPlayerStats(p.id)
      const banterInitiated = playerBanterCounts[p.id] || 0
      displayPlayers.push({ player: p, team: s.team, league: currentLeague, banterInitiated, ...stats })
    })
  })
  
  // Find Banter King (computed before filtering to spotlight the league leader!)
  let banterKing = null
  displayPlayers.forEach(e => {
    if (e.banterInitiated > 0 && (!banterKing || e.banterInitiated > banterKing.banterInitiated)) {
      banterKing = e
    }
  })

  // Filter players based on search query and team select dropdown
  let filteredPlayers = displayPlayers.filter(e => {
    const q = playerSearchQuery.toLowerCase().trim()
    const matchesSearch = !q || 
      e.player.name.toLowerCase().includes(q) || 
      e.team.name.toLowerCase().includes(q)
    const matchesTeam = !playerTeamFilter || e.team.id === playerTeamFilter
    return matchesSearch && matchesTeam
  })

  // Sort players dynamically based on selected header column
  filteredPlayers.sort((a, b) => {
    let valA, valB
    if (playerSortColumn === 'accuracy') {
      valA = a.puttingPct
      valB = b.puttingPct
    } else if (playerSortColumn === 'made') {
      valA = a.totalMade
      valB = b.totalMade
    } else if (playerSortColumn === 'games') {
      valA = a.gamesPlayed
      valB = b.gamesPlayed
    } else if (playerSortColumn === 'banter') {
      valA = a.banterInitiated
      valB = b.banterInitiated
    } else if (playerSortColumn === 'player') {
      valA = a.player.name.toLowerCase()
      valB = b.player.name.toLowerCase()
    } else if (playerSortColumn === 'team') {
      valA = a.team.name.toLowerCase()
      valB = b.team.name.toLowerCase()
    }
    
    if (valA < valB) return playerSortDirection === 'desc' ? 1 : -1
    if (valA > valB) return playerSortDirection === 'desc' ? -1 : 1
    return 0
  })

  const banterKingHtml = banterKing ? `
    <div class="card card-glass text-center animate-in" style="margin-bottom: var(--space-6); padding: var(--space-4); border: 2px dashed var(--gold-400); background: linear-gradient(135deg, rgba(251,191,36,0.06), rgba(251,191,36,0.01)); box-shadow: 0 8px 32px rgba(251,191,36,0.08); border-radius: var(--radius-xl)">
      <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2); margin-bottom:var(--space-2)">
        <span class="blink-badge" style="--team-color: var(--gold-400)"></span>
        <span style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-xs); color: var(--gold-400); letter-spacing: 0.1em; text-transform: uppercase">👑 MOBTOWN BANTER LEADER 🌶️</span>
      </div>
      <h3 style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-xl); color: #fff; margin: 0 0 var(--space-1) 0">
        <span style="color: ${banterKing.player.avatarColor}; font-weight: 900">${banterKing.player.name}</span>
        <span style="font-size: var(--text-sm); font-weight: 500; color: var(--text-secondary)">initiated</span> ${banterKing.banterInitiated} comments
      </h3>
      <p style="font-style: italic; color: var(--text-muted); font-size: var(--text-xs); margin: 0; max-width: 500px; margin-left: auto; margin-right: auto">
        "${banterKing.player.name}'s hot shots sparked announcer Cotton McKnight & Pepper Reddick to commentate in live matches!"
      </p>
    </div>
  ` : ''

  const rows = filteredPlayers.map((e, i) => {
    // Top rank trophy visual indicators
    let rankDisplay = e.banterInitiated > 0 && banterKing && e.player.id === banterKing.player.id ? '👑' : i + 1
    if (i === 0) rankDisplay = '🥇'
    else if (i === 1) rankDisplay = '🥈'
    else if (i === 2) rankDisplay = '🥉'
    else if (i < 10) rankDisplay = `<span style="color:var(--gold-400);font-weight:700">★</span> ${i + 1}`
    
    return `
      <tr data-nav="player/${e.player.id}" style="cursor:pointer">
        <td class="mono" style="text-align:center;font-weight:700">${rankDisplay}</td>
        <td><div class="flex items-center gap-2"><div class="roster-avatar" style="background:${e.player.avatarColor};width:28px;height:28px;font-size:10px">${e.player.name.split(' ').map(n=>n[0]).join('')}</div>${e.player.name}</div></td>
        <td>
          <div style="display: flex; align-items: center; gap: var(--space-2); text-align: left">
            <span class="team-dot" style="background:${e.team.color}; flex-shrink: 0"></span>
            <span style="font-weight: 600; line-height: 1.25; overflow-wrap: break-word">${e.team.name}</span>
          </div>
        </td>
        <td class="mono" style="font-weight:700;color:var(--pink-400)">${(e.puttingPct*100).toFixed(0)}%${hasAnySyntheticData(e.player.id) ? '<span style="color:var(--gold-400);font-size:9px">*</span>' : ''}</td>
        <td class="mono">${e.totalMade}/${e.totalPutts}</td>
        <td class="mono col-hide-mobile">${e.gamesPlayed}</td>
        <td class="col-hide-mobile">${e.bestHole||'—'}</td>
        <td class="mono col-hide-mobile" style="font-weight:700;color:var(--gold-400)">${e.banterInitiated} 🌶️</td>
      </tr>`
  }).join('')

  const subHeader = `${currentLeague.name} · Individual putting stats`

  const selectedTeam = getAllTeams().find(t => t.id === playerTeamFilter)
  const activeTeamName = selectedTeam ? selectedTeam.name : 'All Teams'

  const dropdownOptionsHtml = getAllTeams().map(t => `
    <div class="custom-select-option ${playerTeamFilter === t.id ? 'active' : ''}" data-value="${t.id}" style="padding: var(--space-2) var(--space-3); font-size: var(--text-xs); color: ${playerTeamFilter === t.id ? 'var(--pink-400)' : 'var(--text-primary)'}; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.15s ease; display: flex; align-items: center; justify-content: space-between; font-weight: ${playerTeamFilter === t.id ? '700' : '400'}">
      <span>${t.name}</span>
      ${playerTeamFilter === t.id ? '<span style="font-weight:800; color:var(--pink-400)">✓</span>' : ''}
    </div>
  `).join('')

  const sortIndicator = (col) => {
    if (playerSortColumn === col) {
      return playerSortDirection === 'desc' ? ' ▼' : ' ▲'
    }
    return ''
  }

  const filtersHtml = `
    <div class="flex flex-wrap items-center gap-3 animate-in" style="margin-bottom: var(--space-4); background: rgba(255,255,255,0.02); padding: var(--space-4); border-radius: var(--radius-xl); border: 1px solid var(--border-card)">
      <div style="flex: 1; min-width: 200px; position: relative;">
        <input type="text" id="player-search-input" value="${playerSearchQuery}" placeholder="🔍 Search players or teams..." style="width: 100%; padding: var(--space-2) var(--space-3); background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-card); border-radius: var(--radius-md); font-size: var(--text-xs); outline: none; transition: border-color var(--duration-fast)">
      </div>
      <div class="custom-select-container" style="position: relative; min-width: 180px">
        <button class="custom-select-trigger" id="player-team-select-trigger" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-card); border-radius: var(--radius-md); font-size: var(--text-xs); outline: none; cursor: pointer; text-align: left">
          <span>🎯 ${activeTeamName}</span>
          <span style="font-size: 8px; color: var(--text-secondary); margin-left: 8px">▼</span>
        </button>
        <div class="custom-select-dropdown" id="player-team-select-dropdown" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: rgba(18,18,18,0.96); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 150; max-height: 200px; overflow-y: auto; padding: 4px">
          <div class="custom-select-option ${playerTeamFilter === '' ? 'active' : ''}" data-value="" style="padding: var(--space-2) var(--space-3); font-size: var(--text-xs); color: ${playerTeamFilter === '' ? 'var(--pink-400)' : 'var(--text-primary)'}; cursor: pointer; border-radius: var(--radius-sm); transition: all 0.15s ease; display: flex; align-items: center; justify-content: space-between; font-weight: ${playerTeamFilter === '' ? '700' : '400'}">
            <span>🎯 All Teams</span>
            ${playerTeamFilter === '' ? '<span style="font-weight:800; color:var(--pink-400)">✓</span>' : ''}
          </div>
          ${dropdownOptionsHtml}
        </div>
      </div>
      ${(playerSearchQuery || playerTeamFilter || playerSortColumn !== 'accuracy' || playerSortDirection !== 'desc') ? `
        <button class="btn btn-ghost btn-sm" id="player-clear-filters-btn" style="padding: var(--space-2) var(--space-4); font-size: var(--text-xs); height: 100%; border: 1px dashed rgba(255,255,255,0.15)">✕ Reset</button>
      ` : ''}
    </div>
  `

  return `<div class="page container">
    <div class="page-header animate-in" style="display: flex; justify-content: space-between; align-items: center; gap: var(--space-4)">
      <div>
        <h1>Players Leaderboard</h1>
        <p>${subHeader}</p>
      </div>
      <img src="/images/mobtown.jpeg" alt="Mobtown Mascot" style="height: 54px; width: 54px; border-radius: 50%; border: 1px solid var(--border-card); background: rgba(0,0,0,0.2); box-shadow: 0 0 12px rgba(233,30,139,0.15)">
    </div>
    
    <div class="flex flex-col sm-row justify-between items-center gap-3 animate-in" style="margin-bottom: var(--space-4); background: rgba(255,255,255,0.02); padding: var(--space-3); border-radius: var(--radius-xl); border: 1px solid var(--border-card)">
      <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--pink-400); letter-spacing: 0.1em; text-transform: uppercase; padding-left: var(--space-2)">🏆 Mobtown putting hierarchy</div>
      <div class="league-venue-bar" style="margin-bottom: 0; font-size: var(--text-xs)"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted"> · Wednesday Nights</span></div>
    </div>
    
    ${banterKingHtml}
    ${filtersHtml}
    
    <div class="table-wrapper animate-in delay-1">
      <table>
        <thead>
          <tr>
            <th style="text-align:center;width:60px">#</th>
            <th style="cursor:pointer; user-select:none" data-sort="player">Player${sortIndicator('player')}</th>
            <th style="cursor:pointer; user-select:none" data-sort="team">Team${sortIndicator('team')}</th>
            <th style="cursor:pointer; user-select:none" data-sort="accuracy">Accuracy${sortIndicator('accuracy')}</th>
            <th style="cursor:pointer; user-select:none" data-sort="made">Made${sortIndicator('made')}</th>
            <th class="col-hide-mobile" style="cursor:pointer; user-select:none" data-sort="games">Games${sortIndicator('games')}</th>
            <th class="col-hide-mobile">Best Hole</th>
            <th class="col-hide-mobile" style="width:90px; cursor:pointer; user-select:none" data-sort="banter">Banter${sortIndicator('banter')}</th>
          </tr>
        </thead>
        <tbody>
          ${filteredPlayers.length ? rows : `<tr><td colspan="8" class="text-center text-muted" style="padding:var(--space-6)">No players match the current filters</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>`
}

export function handlePlayersEvents(e) {
  // 1. Click Listener
  if (e.type === 'click') {
    // Sort header click on Players page
    const sortHeader = e.target.closest('th[data-sort]')
    if (sortHeader) {
      const col = sortHeader.dataset.sort
      if (playerSortColumn === col) {
        playerSortDirection = playerSortDirection === 'desc' ? 'asc' : 'desc'
      } else {
        playerSortColumn = col
        playerSortDirection = (col === 'player' || col === 'team') ? 'asc' : 'desc'
      }
      refreshPlayersPage()
      return
    }

    // Clear filters click on Players page
    const clearBtn = e.target.closest('#player-clear-filters-btn')
    if (clearBtn) {
      playerSearchQuery = ''
      playerTeamFilter = ''
      playerSortColumn = 'accuracy'
      playerSortDirection = 'desc'
      refreshPlayersPage()
      return
    }

    // Standings Sort header click
    const standingsHeader = e.target.closest('th[data-standings-sort]')
    if (standingsHeader) {
      const col = standingsHeader.dataset.standingsSort
      if (standingsSortColumn === col) {
        standingsSortDirection = standingsSortDirection === 'desc' ? 'asc' : 'desc'
      } else {
        standingsSortColumn = col
        standingsSortDirection = (col === 'rank' || col === 'team') ? 'asc' : 'desc'
      }
      refreshStandingsPage()
      return
    }

    // Standings Reset click
    const standingsResetBtn = e.target.closest('#standings-reset-btn')
    if (standingsResetBtn) {
      standingsSortColumn = 'rank'
      standingsSortDirection = 'asc'
      refreshStandingsPage()
      return
    }

    // Schedule clear filter click
    const scheduleClearBtn = e.target.closest('#schedule-clear-filter-btn')
    if (scheduleClearBtn) {
      scheduleTeamFilter = ''
      refreshSchedulePage()
      return
    }

    // Custom dropdown triggers & option select handlers
    const scheduleTrigger = e.target.closest('#schedule-team-select-trigger')
    if (scheduleTrigger) {
      const dropdown = document.getElementById('schedule-team-select-dropdown')
      if (dropdown) {
        const isOpen = dropdown.style.display === 'block'
        dropdown.style.display = isOpen ? 'none' : 'block'
      }
      // Close other dropdown if open
      const other = document.getElementById('player-team-select-dropdown')
      if (other) other.style.display = 'none'
      return
    }

    const scheduleOption = e.target.closest('#schedule-team-select-dropdown .custom-select-option')
    if (scheduleOption) {
      scheduleTeamFilter = scheduleOption.dataset.value
      refreshSchedulePage()
      return
    }

    const playerTrigger = e.target.closest('#player-team-select-trigger')
    if (playerTrigger) {
      const dropdown = document.getElementById('player-team-select-dropdown')
      if (dropdown) {
        const isOpen = dropdown.style.display === 'block'
        dropdown.style.display = isOpen ? 'none' : 'block'
      }
      // Close other dropdown if open
      const other = document.getElementById('schedule-team-select-dropdown')
      if (other) other.style.display = 'none'
      return
    }

    const playerOption = e.target.closest('#player-team-select-dropdown .custom-select-option')
    if (playerOption) {
      playerTeamFilter = playerOption.dataset.value
      refreshPlayersPage()
      return
    }

    // Click outside dropdowns to close them
    if (!e.target.closest('.custom-select-container')) {
      document.querySelectorAll('.custom-select-dropdown').forEach(d => {
        d.style.display = 'none'
      })
    }
  }

  // 2. Input Listener (Search query)
  if (e.type === 'input' && e.target.id === 'player-search-input') {
    playerSearchQuery = e.target.value
    refreshPlayersPage()
    return
  }
}

function refreshPlayersPage() {
  const searchInput = document.getElementById('player-search-input')
  const hasFocus = document.activeElement === searchInput
  const caretPos = searchInput ? searchInput.selectionStart : 0

  const pageContentEl = document.getElementById('page-content')
  if (pageContentEl) {
    pageContentEl.innerHTML = renderPlayersPage()
  }

  if (hasFocus) {
    const newSearchInput = document.getElementById('player-search-input')
    if (newSearchInput) {
      newSearchInput.focus()
      newSearchInput.setSelectionRange(caretPos, caretPos)
    }
  }
}

function refreshStandingsPage() {
  const pageContentEl = document.getElementById('page-content')
  if (pageContentEl) {
    pageContentEl.innerHTML = renderStandings()
  }
}

function refreshSchedulePage() {
  const pageContentEl = document.getElementById('page-content')
  if (pageContentEl) {
    pageContentEl.innerHTML = renderSchedule()
  }
}

// ─── Player Profile ───
export function renderPlayerProfile(playerId) {
  const player = getPlayer(playerId)
  if (!player) return '<div class="page container"><h1>Player not found</h1></div>'
  const stats = getPlayerStats(playerId)
  const loggedIn = getLoggedInUser()
  const isOwnProfile = loggedIn && loggedIn.id === playerId
  const isAdmin = loggedIn && loggedIn.isAdmin === true

  let playerTeam = null
  getStandings('l1').forEach(s => {
    const r = getTeamRoster(s.team.id)
    if (r.some(p => p.id === playerId)) playerTeam = s.team
  })

  const holeBreakdown = ['back-1','back-2','back-3','middle-1','middle-2','front-1'].map(h => {
    const made = stats.holesMade[h] || 0
    return `<div class="flex items-center gap-3" style="font-size:var(--text-sm);padding:var(--space-1) 0">
      <span style="width:70px;font-weight:600">${h}</span>
      <div style="flex:1;height:8px;background:var(--bg-surface);border-radius:4px;overflow:hidden">
        <div style="width:${Math.min(made*20,100)}%;height:100%;background:var(--pink-400);border-radius:4px;transition:width 0.5s var(--ease-out)"></div>
      </div>
      <span class="mono" style="width:30px;text-align:right">${made}</span>
    </div>`}).join('')

  const weeklyHtml = stats.weeklyBreakdown.map(w => `
    <div style="text-align:center">
      <div style="height:60px;display:flex;align-items:flex-end;justify-content:center">
        <div style="width:24px;height:${w.putts>0?Math.round(w.made/w.putts*60):4}px;background:var(--pink-400);border-radius:4px 4px 0 0;transition:height 0.5s var(--ease-out)"></div>
      </div>
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">Wk ${w.week}</div>
      <div style="font-size:10px;color:var(--text-secondary)">${w.made}/${w.putts}</div>
      <span class="badge ${w.won?'badge-win':'badge-loss'}" style="font-size:9px;margin-top:2px">${w.won?'W':'L'}</span>
    </div>`).join('')

  const putterName = player.putterName || 'The Baltimore Blade'
  const putterDesc = player.putterDesc || 'A reliable steel blade putter selected to dominate the concrete brewery carpets.'
  const putterType = player.putterType || 'blade'

  const putterImageSrc = player.putterImage || `/images/putter_${putterType}.png`

  // Compile player's banter history
  let playerBanterHtml = ''
  const allBanter = []
  
  getAllMatches().forEach(m => {
    if (m.status === 'completed' && m.banterLog) {
      m.banterLog.forEach(b => {
        if (b.playerId === playerId) {
          allBanter.push({
            ...b,
            matchId: m.id,
            weekNumber: m.weekNumber
          })
        }
      })
    }
  })

  // Sort chronologically (newest first)
  allBanter.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  if (allBanter.length > 0) {
    const banterItems = allBanter.map(b => {
      const contextTag = b.context === 'make' ? '🟢 Make' : b.context === 'miss' ? '🔴 Miss' : b.context.startsWith('streak') ? '🔥 Ball Back' : b.context === 'redemption' ? '⚡ Redemption' : b.context === 'overtime' ? '⚡ OT' : '🎙️ Banter'
      return `<div class="turn-entry" style="padding: var(--space-2) var(--space-3)">
        <span class="mono text-muted" style="font-size: 10px; min-width: 60px">Wk ${b.weekNumber} match</span>
        <span class="badge" style="font-size: 8px; background: rgba(255,255,255,0.05); color: #fff; padding: 2px 6px">${contextTag}</span>
        <span style="flex: 1; font-style: italic; color: var(--text-primary); margin-left: var(--space-3)">"${b.quote}"</span>
        <button class="btn btn-ghost btn-sm" data-nav="match/${b.matchId}" style="font-size:9px; padding:2px 8px; border-radius:4px; border: 1px solid rgba(255,255,255,0.05)">View Match</button>
      </div>`
    }).join('')

    playerBanterHtml = `
      <section class="animate-in delay-3" style="margin-top:var(--space-6)">
        <div class="section-header">
          <h3>🎙️ Announcer Banter History</h3>
          <span class="badge badge-gold" style="font-size: 10px">${allBanter.length} comments</span>
        </div>
        <div class="card turn-log" style="padding:var(--space-3); max-height: 250px; overflow-y: auto">
          ${banterItems}
        </div>
      </section>
    `
  } else {
    playerBanterHtml = `
      <section class="animate-in delay-3" style="margin-top:var(--space-6)">
        <div class="section-header"><h3>🎙️ Announcer Banter History</h3></div>
        <div class="card text-center text-muted" style="padding:var(--space-6); font-size:var(--text-sm)">
          No announcer commentary has been recorded for this player yet.
        </div>
      </section>
    `
  }

  return `<div class="page container">
    <div class="profile-header animate-in">
      <div class="profile-avatar" style="background:${player.avatarColor}">${player.name.split(' ').map(n=>n[0]).join('')}</div>
      <div><div class="profile-name">${player.name}</div>
        ${playerTeam?`<div class="profile-meta" data-nav="team/${playerTeam.id}" style="cursor:pointer"><span class="team-dot" style="background:${playerTeam.color}"></span> ${playerTeam.name}</div>`:''}
      </div>
    </div>
    <div class="stats-grid animate-in delay-1">
      <div class="stat-card"><div class="stat-value gradient-text">${(stats.puttingPct*100).toFixed(0)}%${hasAnySyntheticData(playerId) ? '<span style="color:var(--gold-400);font-size:var(--text-sm)">*</span>' : ''}</div><div class="stat-label">Accuracy</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalMade}<span class="text-muted">/${stats.totalPutts}</span></div><div class="stat-label">Putts Made</div></div>
      <div class="stat-card"><div class="stat-value text-gold">${stats.ballBackContributions}</div><div class="stat-label">🔥 Ball Backs</div></div>
      <div class="stat-card"><div class="stat-value" style="color:#fbbf24">${stats.islandsSunk || 0}</div><div class="stat-label">🏝️ Islands</div></div>
      <div class="stat-card"><div class="stat-value">${stats.gamesPlayed}</div><div class="stat-label">Games</div></div>
    </div>
    ${(() => {
      const syntheticCount = getPlayerSyntheticGameCount(playerId)
      return syntheticCount > 0 ? `<div class="animate-in delay-1" style="text-align:center;font-size:10px;color:var(--text-muted);font-style:italic;margin-top:calc(-1 * var(--space-2));margin-bottom:var(--space-2)">* Includes estimated data from ${syntheticCount} quick-scored game${syntheticCount > 1 ? 's' : ''}</div>` : ''
    })()}

    <!-- Putter Details Section -->
    <section class="animate-in delay-2" style="margin-top:var(--space-6)">
      <div class="section-header">
        <h3>🏌️‍♂️ Custom Putter Details</h3>
        ${isOwnProfile || isAdmin ? `<button class="btn btn-secondary btn-sm" id="edit-putter-btn" style="border-color: var(--pink-400)40">🔧 Customize Putter</button>` : ''}
      </div>
      <div class="card card-glass" id="putter-details-card" style="padding: var(--space-5); display: flex; flex-direction: row; gap: var(--space-5); align-items: center; flex-wrap: wrap">
        <div class="putter-preview-trigger" data-lightbox-player="${playerId}" style="cursor: zoom-in; flex-shrink: 0; background: rgba(0,0,0,0.25); border-radius: var(--radius-xl); padding: var(--space-2); display: flex; align-items: center; justify-content: center; width: 140px; height: 140px; border: 1px solid rgba(255,255,255,0.05); margin: 0 auto; transition: all var(--duration-fast)">
          <img src="${putterImageSrc}" alt="${putterName}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(233,30,139,0.2))" />
        </div>
        <div style="flex: 1; text-align: left; min-width: 250px">
          <h4 style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-lg); color: var(--pink-400); margin-bottom: var(--space-2)">
            ${putterName}
          </h4>
          <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; font-style: italic; margin-bottom: var(--space-3)">
            "${putterDesc}"
          </p>
          <span class="badge" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em">
            Style: ${putterType}
          </span>
        </div>
      </div>

      <!-- Customization Form (Hidden by default) -->
      ${isOwnProfile || isAdmin ? `
      <div class="card card-glass animate-in" id="putter-edit-form" style="padding: var(--space-5); display: none; margin-top: var(--space-3); border-color: var(--pink-400)40">
        <h4 style="font-family: var(--font-display); font-weight: 800; color: #fff; margin-bottom: var(--space-4)">🔧 Customize Your Putter</h4>
        <form id="putter-customize-form" style="display: flex; flex-direction: column; gap: var(--space-4)" data-player-id="${playerId}">
          <div class="flex flex-col gap-1">
            <label style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary)">PUTTER NAME</label>
            <input type="text" id="putter-name-input" style="background: var(--bg-input); border: 1px solid var(--border-card); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); color: #fff; font-size: var(--text-sm)" value="${putterName.replace(/"/g, '&quot;')}" required maxLength="40" />
          </div>
          <div class="flex flex-col gap-1">
            <label style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary)">WHY DO YOU USE THIS PUTTER?</label>
            <textarea id="putter-desc-input" style="background: var(--bg-input); border: 1px solid var(--border-card); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); color: #fff; font-size: var(--text-sm); min-height: 80px; resize: vertical" required maxLength="180">${putterDesc.replace(/"/g, '&quot;')}</textarea>
          </div>
          <div class="flex flex-col gap-1">
            <label style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary)">UPLOAD NEW PUTTER PHOTO</label>
            <div style="display: flex; align-items: center; gap: var(--space-3); background: rgba(0,0,0,0.15); padding: var(--space-3); border-radius: var(--radius-md); border: 1px dashed rgba(255,255,255,0.1)">
              <input type="file" id="putter-image-upload" accept="image/*" style="font-size: var(--text-xs); color: var(--text-secondary); width: 100%" />
              <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0">
                <img src="${putterImageSrc}" style="max-width: 100%; max-height: 100%; object-fit: contain" id="putter-upload-preview-img" />
              </div>
            </div>
            <div style="font-size: 9px; color: var(--text-muted); margin-top: 2px">Upload a custom image file (JPG/PNG). Leave empty to use standard style graphics.</div>
          </div>
          <div class="flex flex-col gap-2">
            <label style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary)">PUTTER TYPE (SVG ILLUSTRATION STYLE)</label>
            <input type="hidden" id="putter-type-input" value="${putterType}" />
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: var(--space-2)">
              ${[
                { value: 'blade', label: 'Blade', emoji: '🗡️', desc: 'Sleek Modern' },
                { value: 'mallet', label: 'Mallet', emoji: '🔨', desc: 'Heavy Perimeter' },
                { value: 'gold', label: 'Gold', emoji: '🏆', desc: '24k Collector' },
                { value: 'neon', label: 'Neon', emoji: '💫', desc: 'Cyberpunk' },
                { value: 'classic', label: 'Classic', emoji: '🪵', desc: 'Hickory Wood' },
                { value: 'stealth', label: 'Stealth', emoji: '🕶️', desc: 'Matte Black' },
                { value: 'copper', label: 'Copper', emoji: '🏺', desc: 'Verdigris Antique' },
                { value: 'carbon', label: 'Carbon', emoji: '🏎️', desc: 'F1 Carbon Fiber' },
                { value: 'crystal', label: 'Crystal', emoji: '❄️', desc: 'Glacier Ice' },
                { value: 'damascus', label: 'Damascus', emoji: '🌊', desc: 'Etched Ripples' },
                { value: 'brass', label: 'Brass', emoji: '⚙️', desc: 'Industrial Mallet' },
                { value: 'printed', label: 'Printed', emoji: '🖨️', desc: '3D Titanium Mesh' },
                { value: 'nasa', label: 'NASA', emoji: '🚀', desc: 'Aerospace Ceramic' },
                { value: 'diamond', label: 'Diamond', emoji: '💎', desc: 'Iced-Out Pavé' },
                { value: 'obsidian', label: 'Obsidian', emoji: '🌌', desc: 'Kintsugi Glass' },
                { value: 'platinum', label: 'Platinum', emoji: '🪙', desc: 'Satin Platinum' },
                { value: 'bamboo', label: 'Bamboo', emoji: '🎋', desc: 'Woodland Mallet' },
                { value: 'ruby', label: 'Ruby', emoji: '🩸', desc: 'Crimson Crystal' },
                { value: 'emerald', label: 'Emerald', emoji: '❇️', desc: 'Imperial Gold' },
                { value: 'titanium', label: 'Titanium', emoji: '🦾', desc: 'Rainbow Weld' },
                { value: 'bronze', label: 'Bronze', emoji: '🟫', desc: 'Verdigris Bronze' },
                { value: 'amber', label: 'Amber', emoji: '🍯', desc: 'Fossilized Amber' }
              ].map(opt => `
                <div class="putter-type-card ${putterType === opt.value ? 'active' : ''}" data-value="${opt.value}" style="cursor: pointer; padding: var(--space-3) var(--space-2); background: rgba(0,0,0,0.2); border: 1px solid ${putterType === opt.value ? 'var(--pink-400)' : 'rgba(255,255,255,0.05)'}; border-radius: var(--radius-lg); text-align: center; transition: all var(--duration-fast)">
                  <div style="font-size: var(--text-lg); margin-bottom: 2px">${opt.emoji}</div>
                  <div style="font-weight: 700; font-size: var(--text-xs); color: #fff; margin-bottom: 1px">${opt.label}</div>
                  <div style="font-size: 9px; color: var(--text-muted); line-height: 1.1">${opt.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="flex gap-3 justify-end" style="margin-top: var(--space-2)">
            <button type="button" class="btn btn-secondary btn-sm" id="putter-edit-cancel">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm">Save Putter 🏌️‍♂️</button>
          </div>
        </form>
      </div>
      ` : ''}
    </section>

    <div class="grid-2" style="margin-top:var(--space-6); align-items:start">
      <section class="animate-in delay-2">
        <div class="section-header"><h3>Hole Accuracy</h3></div>
        <div class="card" style="padding:var(--space-4)">${holeBreakdown}</div>
      </section>
      ${stats.weeklyBreakdown.length?`<section class="animate-in delay-3">
        <div class="section-header"><h3>Weekly Performance</h3></div>
        <div class="card" style="padding:var(--space-4)">
          <div style="display:flex;gap:var(--space-4);justify-content:center;overflow-x:auto">${weeklyHtml}</div>
        </div>
      </section>`:''}
    </div>
    ${playerBanterHtml}
    <div class="mt-8"><button class="btn btn-ghost" data-nav="players">← All Players</button></div>
  </div>`
}

// ─── Match Detail Page ───
export function renderMatchDetail(matchId) {
  const match = getAllMatches().find(m => m.id === matchId)
  if (!match) return '<div class="page container"><h1>Match not found</h1></div>'

  const homeTeam = getTeam(match.homeTeamId)
  const awayTeam = getTeam(match.awayTeamId)
  const league = getLeague(match.leagueId)
  const venue = getVenue(league.venueId)
  const isCompleted = match.status === 'completed'
  const games = match.games || []

  // Aggregate player stats across all games in the series
  const playerPutts = {}
  games.forEach(game => {
    ;(game.turns || []).forEach(t => {
      t.putts.forEach(p => {
        if (!playerPutts[p.playerId]) playerPutts[p.playerId] = { made: 0, total: 0, ballBacks: 0, islands: 0 }
        playerPutts[p.playerId].total++
        if (p.made) playerPutts[p.playerId].made++
        if (t.ballBack) playerPutts[p.playerId].ballBacks++
        if (p.island) playerPutts[p.playerId].islands++
      })
    })
  })

  const homeRoster = getTeamRoster(match.homeTeamId)
  const awayRoster = getTeamRoster(match.awayTeamId)

  function playerStatsRow(roster, teamColor) {
    return roster.map(p => {
      const ps = playerPutts[p.id] || { made: 0, total: 0, ballBacks: 0, islands: 0 }
      const pct = ps.total > 0 ? (ps.made / ps.total * 100).toFixed(0) : '—'
      const islandBadge = ps.islands > 0 ? ` <span class="badge" style="font-size: 8px; background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3)">🏝️ ${ps.islands}</span>` : ''
      return `<div class="roster-item">
        <div class="roster-avatar" style="background:${p.avatarColor || teamColor};width:32px;height:32px;font-size:10px">${p.name.split(' ').map(n=>n[0]).join('')}</div>
        <div style="flex:1"><div class="roster-name">${p.name}${islandBadge}</div></div>
        <div style="text-align:right;display:flex;gap:var(--space-4);align-items:center">
          <span class="mono" style="font-size:var(--text-sm)">${ps.made}/${ps.total}</span>
          <span style="font-family:var(--font-display);font-weight:800;color:var(--pink-400);min-width:36px">${pct}%</span>
        </div>
      </div>`
    }).join('')
  }

  // Per-game breakdowns
  const gameBreakdownHtml = games.map((game, gi) => {
    const gHomeScore = game.finalScore?.home || 0
    const gAwayScore = game.finalScore?.away || 0
    const gWinner = game.winnerId === match.homeTeamId ? homeTeam : (game.winnerId === match.awayTeamId ? awayTeam : null)
    const gTotalTurns = game.totalTurns || (game.turns || []).length
    let gBBs = 0
    if (game.ballBacks) gBBs = Object.values(game.ballBacks).reduce((a, b) => a + b, 0)

    const turnLogHtml = (game.turns || []).map(t => {
      const team = getTeam(t.teamId)
      const phaseTag = t.redemption ? '<span class="badge badge-gold" style="font-size:8px">RDM</span> ' : t.overtime ? '<span class="badge badge-cyan" style="font-size:8px">OT</span> ' : ''
      const islandTag = t.putts?.some(p => p.island) ? '<span class="badge" style="font-size:8px;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3)">🏝️ ISL</span> ' : ''
      return `<div class="turn-entry">
        <span class="turn-num">#${t.turnNumber}</span>
        <span class="team-dot" style="background:${team?.color || '#666'}"></span>
        <span style="flex:1">${phaseTag}${islandTag}${t.putts.map(p => {
          const name = getPlayer(p.playerId)?.name?.split(' ')[0] || '?'
          const holeLabel = getHoleShortName(p.hole)
          const bonusLabel = p.bonusCup ? ` <span style="color:#fbbf24;font-size:9px">(+${getHoleShortName(p.bonusCup)})</span>` : ''
          return `${name}: ${p.made ? '✅ ' + holeLabel + bonusLabel : '❌'}`
        }).join(' · ')}</span>
        ${t.ballBack ? '<span class="badge badge-gold" style="font-size:9px">🔥BB</span>' : ''}
      </div>`
    }).join('') || '<div class="text-center text-muted" style="padding:var(--space-4)">No turn data</div>'

    return `
    <section class="animate-in delay-2">
      <div class="section-header">
        <h3>Game ${gi + 1}</h3>
        <span style="display:flex;gap:8px;align-items:center">
          <span class="mono" style="font-weight:800;font-size:var(--text-lg)">${gHomeScore} – ${gAwayScore}</span>
          ${gWinner ? `<span class="badge badge-win" style="font-size:9px">${gWinner.name.split(' ')[0]}${game.overtime ? ' (OT)' : ''}</span>` : ''}
        </span>
      </div>
      <div class="card" style="padding:var(--space-3)">
        <div style="display:flex;gap:var(--space-4);font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-2)">
          <span>${gTotalTurns} turns</span><span>🔥 ${gBBs} BBs</span>${game.overtime ? '<span style="color:var(--gold-400)">⚡ OT</span>' : ''}${game.scoringMode === 'override' ? '<span style="color:var(--gold-400)">📋 Quick Scored</span>' : ''}
        </div>
        <div class="turn-log" style="max-height:250px">${turnLogHtml}</div>
      </div>
    </section>`
  }).join('')

  // Banter log
  let banterLogHtml = ''
  if (isCompleted && match.banterLog && match.banterLog.length > 0) {
    const banterItems = match.banterLog.map(b => {
      const pColor = getPlayer(b.playerId)?.avatarColor || '#fff'
      const contextTag = b.context === 'make' ? '🟢' : b.context === 'miss' ? '🔴' : '🔥'
      const timeStr = b.timestamp ? new Date(b.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : ''
      return `<div class="turn-entry">
        <span class="turn-num mono text-muted" style="min-width:50px;font-size:9px">${timeStr}</span>
        <span style="font-size:10px">${contextTag}</span>
        <span style="color:${pColor};font-weight:700;font-size:var(--text-xs)">${b.playerName.split(' ')[0]}</span>
        <span style="flex:1;font-style:italic;color:var(--text-primary);font-size:var(--text-xs)">"${b.quote}"</span>
      </div>`
    }).join('')
    banterLogHtml = `<section class="animate-in delay-3">
      <div class="section-header"><h3>🎙️ Broadcast History</h3><span class="badge badge-gold">${match.banterLog.length}</span></div>
      <div class="card turn-log" style="padding:var(--space-3);max-height:500px">${banterItems}</div>
    </section>`
  }

  // Aggregate stats
  const totalTurns = games.reduce((acc, g) => acc + (g.totalTurns || (g.turns || []).length), 0)
  let totalBBs = 0
  games.forEach(g => { if (g.ballBacks) totalBBs += Object.values(g.ballBacks).reduce((a, b) => a + b, 0) })
  const winner = match.winnerId ? getTeam(match.winnerId) : null
  const hasOT = games.some(g => g.overtime)

  // Ocho Commentary
  let ochoCommentary = ''
  if (isCompleted && match.seriesScore && winner) {
    const loserName = match.winnerId === match.homeTeamId ? awayTeam.name : homeTeam.name
    const wasGame3 = games.length === 3
    const q1 = wasGame3
      ? `A FULL THREE-GAME series! The ${winner.name} edged past the ${loserName} in a best-of-three that went all the way!`
      : `A dominant 2–0 sweep by the ${winner.name}! The ${loserName} didn't even get a chance to find their rhythm!`
    const q2 = wasGame3
      ? `That's the kind of drama that makes Mobtown putting legendary. Both teams left everything on the turf!`
      : `That's what happens when you come out putting like your next pint depends on it! A masterclass!`

    ochoCommentary = `
      <section class="animate-in delay-2" style="margin-bottom:var(--space-6);max-width:600px;margin-left:auto;margin-right:auto">
        <div class="section-header"><h3>🎙️ ESPN8: The Ocho</h3></div>
        <div class="card" style="border:1px dashed rgba(251,191,36,0.4);background:rgba(251,191,36,0.03);padding:var(--space-4);border-radius:var(--radius-xl)">
          <div style="font-family:var(--font-display);font-weight:800;font-size:var(--text-xs);color:var(--gold-400);letter-spacing:0.1em;margin-bottom:var(--space-3)"><span class="team-dot" style="background:var(--gold-400)"></span> LIVE FROM THE COUCH</div>
          <p style="font-style:italic;color:rgba(255,255,255,0.9);line-height:1.6;font-size:var(--text-sm);margin:0">
            <strong>Cotton:</strong> "${q1}"<br/><br/><strong>Pepper:</strong> "${q2}"
          </p>
        </div>
      </section>`
  }

  const isHomeWinner = match.winnerId === match.homeTeamId
  const isAwayWinner = match.winnerId === match.awayTeamId

  return `<div class="page container">
    <div class="page-header animate-in"><h1>Series Detail</h1><p>Week ${match.weekNumber} · ${league.name} · Best of 3</p></div>

    <div class="scorer-header animate-in delay-1">
      <div class="scorer-team">
        <div class="scorer-team-name" style="color:${homeTeam.color}">${homeTeam.name}</div>
        <div class="scorer-team-score ${isHomeWinner ? 'text-green' : ''}">${match.seriesScore?.home || 0}</div>
      </div>
      <div class="scorer-vs">–</div>
      <div class="scorer-team">
        <div class="scorer-team-name" style="color:${awayTeam.color}">${awayTeam.name}</div>
        <div class="scorer-team-score ${isAwayWinner ? 'text-green' : ''}">${match.seriesScore?.away || 0}</div>
      </div>
    </div>

    ${winner ? `<div class="text-center animate-in delay-1" style="margin-bottom:var(--space-4)">
      <span class="badge badge-win" style="font-size:var(--text-sm);padding:var(--space-1) var(--space-4)">🏆 ${winner.name} Wins Series${hasOT ? ' (OT)' : ''}</span>
      ${match.scoringMode === 'override' ? '<span class="badge badge-gold" style="font-size:var(--text-xs);margin-left:var(--space-2)">📋 Quick Scored*</span>' : ''}
      <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:var(--space-1)">
        +${isHomeWinner ? match.homePoints : match.awayPoints}pts winner · ${(isHomeWinner ? match.awayPoints : match.homePoints) > 0 ? `+${isHomeWinner ? match.awayPoints : match.homePoints}pt loser` : '0pts loser'}
        ${match.scoringMode === 'override' ? '<br><span style="font-style:italic;color:var(--gold-400)">* Stats estimated from final scores</span>' : ''}
      </div>
    </div>` : ''}

    <div class="stats-grid animate-in delay-1" style="margin-bottom:var(--space-6)">
      <div class="stat-card"><div class="stat-value">${games.length}</div><div class="stat-label">Games</div></div>
      <div class="stat-card"><div class="stat-value">${totalTurns}</div><div class="stat-label">Total Turns</div></div>
      <div class="stat-card"><div class="stat-value text-gold">${totalBBs}</div><div class="stat-label">🔥 Ball Backs</div></div>
      <div class="stat-card"><div class="stat-value">${match.date || ''}</div><div class="stat-label">Date</div></div>
    </div>

    ${ochoCommentary}

    <div class="home-grid animate-in delay-2">
      <section class="home-section">
        <div class="section-header"><h3 style="color:${homeTeam.color}">${homeTeam.name}</h3></div>
        <div class="card" style="padding:var(--space-2)">${playerStatsRow(homeRoster, homeTeam.color)}</div>
      </section>
      <section class="home-section">
        <div class="section-header"><h3 style="color:${awayTeam.color}">${awayTeam.name}</h3></div>
        <div class="card" style="padding:var(--space-2)">${playerStatsRow(awayRoster, awayTeam.color)}</div>
      </section>
    </div>

    ${gameBreakdownHtml}
    ${banterLogHtml}

    <div class="mt-4"><button class="btn btn-ghost" data-nav="schedule">← Schedule</button></div>
  </div>`
}


export function getCaddyAdvice(holeId) {
  const data = {
    'back-1': {
      cotton: 'Cotton McKnight: "The left-back corner (B1) is highly technical, Pepper! You need a subtle wrist-hinge to navigate past the tavern stools and curl it in."',
      pepper: 'Pepper Reddick: "Absolutely, Cotton! Sinking B1 makes you feel like an absolute social-putting legend. Miss it and you are definitely buying the next pitcher of IPA!"'
    },
    'back-2': {
      cotton: 'Cotton McKnight: "The dead center of the back row (B2)! Sinking this requires perfect velocity control to avoid clanging off the rear bumper."',
      pepper: 'Pepper Reddick: "That cup is a pure power play, Cotton! A straight line with maximum authority is the way to conquer this central peak!"'
    },
    'back-3': {
      cotton: 'Cotton McKnight: "The right-back corner (B3), right next to the brewery taps. Perfect for right-handed putters who love a sweeping slice!"',
      pepper: 'Pepper Reddick: "A bold corner pocket, Cotton! It is further away from the tee box than a cheap parking spot in Fells Point on a Friday night!"'
    },
    'middle-1': {
      cotton: 'Cotton McKnight: "The left-middle cup (M1). Often overlooked, but crucial for claiming table control early in regulation turns."',
      pepper: 'Pepper Reddick: "It is a stable anchor cup, Cotton! Smooth rhythm and a soft touch is all you need to slide it home!"'
    },
    'middle-2': {
      cotton: 'Cotton McKnight: "The right-middle cup (M2). A solid putting path is needed here to avoid clipping the front-1 pin."',
      pepper: 'Pepper Reddick: "Treat it with respect, Cotton! A gentle tap is always better than a wild slam when attacking the middle row!"'
    },
    'front-1': {
      cotton: 'Cotton McKnight: "The front-1 pin (F1)! The entry point, the absolute gateway cup. If you miss this, Pepper, the entire taproom will let you hear it!"',
      pepper: 'Pepper Reddick: "Oh yes, Cotton! Missing F1 is a certified taproom felony! Take a deep breath, center your focus, and gently guide the ball home!"'
    }
  }
  return data[holeId] || {
    cotton: 'Cotton McKnight: "Click or tap any cup on the board above to get elite putting advice from Cotton McKnight & Pepper Reddick!"',
    pepper: 'Pepper Reddick: "We are standing by, folks! Pick your target!"'
  }
}

export function renderHelpPage() {
  return `<div class="page container">
    <div class="page-header animate-in">
      <h1>How to Play & Help Guide</h1>
      <p>Official Rules, Interactive Putting Tips, and Captain FAQ</p>
    </div>

    <!-- Interactive Caddy Board Row -->
    <div class="home-grid animate-in delay-1" style="margin-bottom: var(--space-8)">
      <!-- Interactive SVG Board -->
      <section class="home-section">
        <div class="section-header"><h3>🎯 Interactive Putting Board</h3></div>
        <div class="card" style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-4); justify-content: center">
          <svg class="board-svg" viewBox="0 0 240 230" xmlns="http://www.w3.org/2000/svg" style="max-width: 280px; width: 100%; height: auto; margin: 0 auto; display: block; filter: drop-shadow(0 0 12px rgba(251,191,36,0.08))">
            <rect x="10" y="10" width="220" height="210" rx="14" fill="#0d1f0d" stroke="var(--gold-400)" stroke-width="2"/>
            
            <!-- Back Row -->
            <circle cx="60" cy="50" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="cursor:pointer; transition: all 0.2s" class="help-cup" data-help-hole="back-1"/>
            <text x="60" y="51" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700" font-family="Inter" pointer-events="none">B1</text>
            
            <circle cx="120" cy="50" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="cursor:pointer; transition: all 0.2s" class="help-cup" data-help-hole="back-2"/>
            <text x="120" y="51" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700" font-family="Inter" pointer-events="none">B2</text>
            
            <circle cx="180" cy="50" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="cursor:pointer; transition: all 0.2s" class="help-cup" data-help-hole="back-3"/>
            <text x="180" y="51" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700" font-family="Inter" pointer-events="none">B3</text>
            
            <!-- Middle Row -->
            <circle cx="90" cy="110" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="cursor:pointer; transition: all 0.2s" class="help-cup" data-help-hole="middle-1"/>
            <text x="90" y="111" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700" font-family="Inter" pointer-events="none">M1</text>
            
            <circle cx="150" cy="110" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="cursor:pointer; transition: all 0.2s" class="help-cup" data-help-hole="middle-2"/>
            <text x="150" y="111" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700" font-family="Inter" pointer-events="none">M2</text>
            
            <!-- Front Row -->
            <circle cx="120" cy="170" r="22" fill="#1a1a1a" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" style="cursor:pointer; transition: all 0.2s" class="help-cup" data-help-hole="front-1"/>
            <text x="120" y="171" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.4)" font-size="9" font-weight="700" font-family="Inter" pointer-events="none">F1</text>
          </svg>
          <div style="font-size: var(--text-xs); color: var(--text-muted); text-align: center; font-style: italic">
            Tap any cup on the vector board to load dynamic caddy tips!
          </div>
        </div>
      </section>

      <!-- Dynamic Banter Output -->
      <section class="home-section" style="display: flex; flex-direction: column">
        <div class="section-header"><h3>🎙️ Ocho Caddy Desk</h3></div>
        <div class="card" style="border: 1px dashed rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.03); padding: var(--space-5); border-radius: var(--radius-xl); flex: 1; display: flex; flex-direction: column; justify-content: center">
          <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--gold-400); letter-spacing: 0.1em; margin-bottom: var(--space-4); display: flex; align-items: center; gap: 8px">
            <span class="team-dot" style="background: var(--gold-400)"></span> LIVE SPECTATOR TIP
          </div>
          <p id="caddy-advice-text" style="font-style: italic; color: rgba(255,255,255,0.9); line-height: 1.6; font-size: var(--text-sm); margin: 0">
            <strong>Cotton McKnight:</strong> "Click or tap any cup on the board to the left, folks! Pepper and I are locked in and ready to deliver championship-level putting blueprints!"<br/><br/>
            <strong>Pepper Reddick:</strong> "That is right, Cotton! Let us see if they have got what it takes to dominate the tavern floor tonight!"
          </p>
        </div>
      </section>
    </div>

    <!-- Official Rules Section -->
    <section class="animate-in delay-2" style="margin-bottom: var(--space-8)">
      <div class="section-header"><h3>🏆 Official Puttermore Rules</h3></div>
      <div class="home-grid">
        <div class="card" style="padding: var(--space-4)">
          <h4 style="color: var(--pink-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">1. Match Setup</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            Two team putting boards are set facing each other 20–30 feet apart (adjusted for brewery space). Each board starts fully open with a pyramid layout of <strong>6 cups</strong>: 3 Back (B1–B3), 2 Middle (M1–M2), and 1 Front (F1). Matches are played as a <strong>Best-of-3 series</strong>. First team to win 2 games wins the match.
          </p>
        </div>
        <div class="card" style="padding: var(--space-4)">
          <h4 style="color: var(--pink-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">2. Team Rotation</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            Teams consist of 2–3 registered players. Teams alternate turns. Each team gets exactly <strong>2 putts per turn</strong>. For 3-player teams, the app auto-cycles pairings (P1+P2 → P1+P3 → P2+P3) so every player stays active.
          </p>
        </div>
        <div class="card" style="padding: var(--space-4)">
          <h4 style="color: var(--pink-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">3. 🔥 Ball Backs</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            If <strong>both putters</strong> of the active team successfully sink their targets in the same turn, they trigger a <strong>Ball Back</strong>! Both balls are returned and the team shoots again — unlocking massive momentum swings and potential winning streaks.
          </p>
        </div>
        <div class="card" style="padding: var(--space-4)">
          <h4 style="color: var(--pink-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">4. 🏝️ Island Cup Bonus</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            When a cup becomes <strong>isolated</strong> — completely surrounded by already-sunk cups — it glows gold as an "island." Sink an island cup and you earn a <strong>free bonus cup</strong>: tap any remaining open cup on the opponent's board to claim it instantly!
          </p>
        </div>
        <div class="card" style="padding: var(--space-4)">
          <h4 style="color: var(--pink-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">5. 🚨 Redemption Round</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            Once a team clears the opponent's board (without a ball back), the losing team gets a <strong>Redemption Round</strong>: each player putts in succession — keep shooting as long as you make it! The first complete miss ends the redemption. If they clear all remaining cups, the game goes to <strong>Sudden-Death Overtime</strong>.
          </p>
        </div>
        <div class="card" style="padding: var(--space-4)">
          <h4 style="color: var(--pink-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">6. ⚡ Sudden-Death Overtime</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            Middle and back cups are reset on both boards. Only the <strong>front 3 cups</strong> (F1, M1, M2) are in play. The first team to sink any cup wins the game! If overtime also ends in a redemption tie, another overtime round begins.
          </p>
        </div>
      </div>
    </section>

    <!-- Scoring Modes -->
    <section class="animate-in delay-2" style="margin-bottom: var(--space-8)">
      <div class="section-header"><h3>🎯 Scoring Modes</h3></div>
      <div class="home-grid">
        <div class="card" style="padding: var(--space-4); border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.02)">
          <h4 style="color: #22c55e; font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">🎯 Live Score — Shot by Shot</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            The full experience. Tap the <strong>Made It</strong> or <strong>Miss</strong> buttons for each individual putt. The board updates in real time, ball backs are detected automatically, island cups glow gold, and every turn is logged. Unlocks full replay in the Ocho Simulator and the richest individual player stats.
          </p>
        </div>
        <div class="card" style="padding: var(--space-4); border-color: rgba(251,191,36,0.2); background: rgba(251,191,36,0.02)">
          <h4 style="color: var(--gold-400); font-family: var(--font-display); font-weight: 800; margin-bottom: var(--space-2)">📋 Quick Score — Final Scores Only</h4>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6">
            Streamlined entry for when shot-by-shot tracking isn't practical. Enter who won each game and how many cups the losing team sank. Stats are <strong>estimated</strong> from the final scores and marked with a gold <strong style="color:var(--gold-400)">*</strong> asterisk. You can also abandon live scoring mid-game and fall back to Quick Score if things get hectic.
          </p>
        </div>
      </div>
    </section>

    <!-- Points System -->
    <section class="animate-in delay-2" style="margin-bottom: var(--space-8)">
      <div class="section-header"><h3>🏅 Series Points System</h3></div>
      <div class="card" style="padding: var(--space-4)">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); text-align: center">
          <div style="padding: var(--space-3); background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.2); border-radius: var(--radius-lg)">
            <div style="font-size: var(--text-2xl); font-weight: 900; color: #22c55e; font-family: var(--font-display)">2</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px">Points</div>
            <div style="font-size: 10px; color: #22c55e; font-weight: 700; margin-top: 4px">Series Win (2–0 or 2–1)</div>
          </div>
          <div style="padding: var(--space-3); background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); border-radius: var(--radius-lg)">
            <div style="font-size: var(--text-2xl); font-weight: 900; color: var(--gold-400); font-family: var(--font-display)">1</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px">Point</div>
            <div style="font-size: 10px; color: var(--gold-400); font-weight: 700; margin-top: 4px">Series Loss in Game 3</div>
          </div>
          <div style="padding: var(--space-3); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: var(--radius-lg)">
            <div style="font-size: var(--text-2xl); font-weight: 900; color: var(--text-muted); font-family: var(--font-display)">0</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px">Points</div>
            <div style="font-size: 10px; color: var(--text-muted); font-weight: 700; margin-top: 4px">0–2 Sweep Loss</div>
          </div>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6; margin-top: var(--space-3); text-align: center">
          Standings are ranked by total points. Tiebreakers: Win% → Cup differential → Team name.
        </p>
      </div>
    </section>

    <!-- Captain FAQ Section -->
    <section class="animate-in delay-3" style="margin-bottom: var(--space-6)">
      <div class="section-header"><h3>💡 Captain's Help Desk (FAQ)</h3></div>
      <div style="display: flex; flex-direction: column; gap: var(--space-3)">
        
        <div class="faq-item card">
          <div class="faq-item-header">
            <span>🎯 How do I start a scoring session as Captain?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              Log in with your registered email (a Magic Link will be sent to your inbox). Once logged in, tap the <strong>🎯 Scorer</strong> tab. You'll see your team's scheduled matches and an <strong>⚡ Open Play</strong> section. Select your opponent, choose your scoring mode (Live or Quick Score), and the board loads instantly. During Live Scoring, tap <strong>Made It</strong> or <strong>Miss</strong> for each player's putt — the boards update automatically!
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>🔄 What if we accidentally submit an incorrect putt?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              Don't panic! The Live Scorer has an <strong>↩️ Undo Turn</strong> button at the bottom of the scoreboard. Tapping it rolls back the game state by exactly one full turn, letting you re-record putts without losing the rest of your match data. Only full turns — not individual putts — can be rolled back.
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>📋 What is Quick Score and when should I use it?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              Quick Score lets captains enter just the <strong>final game scores</strong> (e.g. 6–3, 6–5) without tracking every individual putt. Use it when your team doesn't want shot-by-shot detail, or if you lose track mid-game. Stats are estimated from the final scores and marked with a gold <strong style="color:var(--gold-400)">*</strong> asterisk so everyone knows they're approximated. You can also <strong>abandon live scoring mid-game</strong> and switch to Quick Score using the "⚠️ Abandon Shot Tracking" button.
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>⚡ What is Open Play mode?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              Open Play lets Team Captains start a scoring session against <strong>any opponent</strong> without needing a scheduled match. It's perfect for scrimmages, practice rounds, or off-week sessions. Simply pick your opponent from the grid and choose your scoring mode. If you save the match, a new match record is created (marked as pending review) so Commissioners can approve and include the stats.
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>🏝️ What is an Island Cup and how does the bonus work?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              An Island Cup is a cup that has become <strong>completely isolated</strong> — all cups adjacent to it are already sunk. Island cups glow with a gold shimmer on the board. Sink an island cup, and you earn a <strong>free bonus cup pick</strong>: tap any remaining open cup on the opponent's board to claim it for free. Island bonuses are tracked in player and match stats.
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>🛡️ Do bounce-out putts count as a made sink?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              According to the Puttermore Rulebook, a ball must <strong>come to complete rest inside the target cup</strong> to count as a made sink. Balls that strike the inner cup wall but bounce or roll back out onto the turf are officially marked as a <strong>Miss (❌)</strong>.
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>🔥 How does the Standings tiebreaker work?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              Standings are ranked by <strong>total points</strong> first (Win=2, Game-3-Loss=1, 0-2-Loss=0). If teams are tied on points, Puttermore ranks by <strong>Win Percentage</strong>, then <strong>Cup Differential</strong> (total cups sunk minus total cups allowed), then alphabetically by team name. If they're still tied after all that, the captain who drank the most stout during the season wins.
            </p>
          </div>
        </div>

        <div class="faq-item card">
          <div class="faq-item-header">
            <span>👑 How do Admins approve and publish match results?</span>
            <span class="faq-toggle-icon">＋</span>
          </div>
          <div class="faq-item-body">
            <p>
              After a captain saves a completed match, it moves to <strong>Pending Review</strong> status. League Commissioners (J-MO Boh & Shane OldBay) log into the <strong>👑 Admin Console</strong> and open the <strong>📋 Game Review</strong> tab. They can review the match details and click <strong>Approve & Publish 🚀</strong> to commit the result, instantly updating standings, player stats, and the schedule.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- About Section -->
    <section class="animate-in delay-3" style="margin-bottom: var(--space-6)">
      <div class="section-header"><h3>🍺 About Puttermore</h3></div>
      <div class="card" style="padding: var(--space-5); text-align: center">
        <div id="haa-logo" style="cursor:pointer;display:inline-block;margin-bottom:var(--space-3);user-select:none;transition:transform 0.3s var(--ease-out)" title="Tap me...">
          <span style="font-family:var(--font-display);font-weight:900;font-size:var(--text-3xl);background:linear-gradient(135deg,var(--pink-400),var(--gold-400));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-1px">PUTTERMORE</span>
        </div>
        <p style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.7;max-width:500px;margin:0 auto var(--space-3)">
          The definitive social putting league platform for Mobtown Bar Putting at Mobtown Brewing Co. Real-time live scoring, Best-of-3 series tracking, ESPN8-grade commentary from Cotton McKnight &amp; Pepper Reddick, rivalry analytics, island cup bonuses, and weekly recaps — all from the brewery floor.
        </p>
        <div style="font-size:10px;color:var(--text-muted);border-top:1px dashed rgba(255,255,255,0.06);padding-top:var(--space-3);margin-top:var(--space-3)">
          Crafted with 🍺 &amp; obsessive attention to detail<br>
          <span style="opacity:0.4;font-size:9px">© 2026 HAA · v2.0 · Supabase-powered</span>
        </div>
        <div id="haa-easter-egg" style="display:none;margin-top:var(--space-4);padding:var(--space-4);background:linear-gradient(135deg,rgba(233,30,139,0.08),rgba(251,191,36,0.08));border:1px dashed var(--gold-400);border-radius:var(--radius-xl);animation:fadeIn 0.5s ease">
          <div style="font-family:var(--font-display);font-weight:900;font-size:var(--text-sm);color:var(--gold-400);margin-bottom:var(--space-2)">🏆 ACHIEVEMENT UNLOCKED</div>
          <div style="font-size:var(--text-xs);color:var(--text-primary);line-height:1.6">
            You found the secret! This entire platform — every animation, every Cotton &amp; Pepper quip, every island cup detection algorithm — was built by <strong style="color:var(--pink-400)">Heath Aldinger</strong> (HAA).<br>
            <span style="font-style:italic;color:var(--text-muted)">"If you're reading this, you owe me a stout." — H</span>
          </div>
        </div>
      </div>
    </section>

    <div class="mt-4"><button class="btn btn-ghost" data-nav="">← Go Home</button></div>
  </div>`
}

export function renderLoginPage() {
  const allTeams = getStandings('l1').map(s => s.team)
  const loggedIn = getLoggedInUser()

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  const hasSupabase = !!(supabaseUrl && supabaseAnonKey)

  const loginFormHtml = hasSupabase ? `
    <div class="card card-glass animate-in" style="padding: var(--space-4); border-color: rgba(255,255,255,0.08); margin-bottom: var(--space-6); max-width: 480px; margin-left: auto; margin-right: auto; background: rgba(255,255,255,0.01)">
      <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-sm); color: var(--pink-400); margin-bottom: var(--space-2)">🚀 SECURE LEAGUE SIGN-IN</div>
      <p class="text-secondary" style="font-size: 11px; margin-bottom: var(--space-3); line-height: 1.4">
        Enter your registered email below. We'll send you a passwordless Magic Link to sign in securely.
      </p>
      <div style="display: flex; gap: var(--space-2)">
        <input type="email" id="login-email-input" placeholder="you@example.com" style="flex: 1; background: var(--bg-input); border: 1px solid var(--border-card); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); color: #fff; font-size: var(--text-sm); outline: none" />
        <button class="btn btn-primary btn-sm" id="send-magic-link-btn" style="min-width: 120px">Send Code</button>
      </div>
    </div>
  ` : ''

  const teamCardsHtml = allTeams.map(t => {
    const roster = getTeamRoster(t.id)
    const playersHtml = roster.map(p => {
      const isCaptain = t.captainPlayerId === p.id
      const isCurrent = loggedIn && loggedIn.id === p.id
      return `
        <div class="roster-item animate-in" data-login-as="${p.id}" style="border: 1px solid ${isCurrent ? 'var(--pink-400)' : 'transparent'}; background: ${isCurrent ? 'rgba(233,30,139,0.05)' : 'rgba(255,255,255,0.01)'}; border-radius: var(--radius-lg); padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2); cursor: pointer; transition: all var(--duration-fast)">
          <div class="roster-avatar" style="background:${p.avatarColor || t.color}; width: 32px; height: 32px; font-size: var(--text-xs)">${p.name.split(' ').map(n=>n[0]).join('')}</div>
          <div style="flex:1">
            <div class="roster-name" style="font-weight: ${isCurrent ? '700' : '600'}; color: ${isCurrent ? 'var(--pink-400)' : 'var(--text-primary)'}">${p.name}</div>
            <div class="roster-role" style="font-size: 10px; color: var(--text-muted)">
              ${isCaptain ? '🧢 Captain' : 'Player'} ${isCurrent ? '· (Logged In)' : ''}
            </div>
          </div>
          <div style="font-size: var(--text-xs); color: var(--pink-400); font-weight: bold; opacity: 0; transition: opacity var(--duration-fast)" class="login-arrow-hint">Log In →</div>
        </div>`
    }).join('')

    return `
      <div class="card animate-in" style="padding: var(--space-4); border-color: ${t.color}25; background: rgba(17,17,17,0.45)">
        <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-sm); color: ${t.color}; margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px">
          <span class="team-dot" style="background: ${t.color}"></span>
          ${t.name}
        </div>
        <div style="display: flex; flex-direction: column">${playersHtml}</div>
      </div>`
  }).join('')

  return `
    <div class="page container">
      <div class="page-header animate-in text-center">
        <h1>🔑 Choose Profile</h1>
        <p class="text-secondary" style="max-width: 440px; margin: 0 auto; line-height: 1.5">
          ${hasSupabase 
            ? 'Sign in securely using your email address, or explore other team rosters below.'
            : 'Select any player card to authenticate instantly. Test role-specific dashboards, captain administrative scoring, and 3-player turn rotations!'}
        </p>
      </div>

      ${loggedIn ? `
        <div class="card card-glass animate-in text-center" style="padding: var(--space-4); border-color: var(--pink-400)40; margin-bottom: var(--space-6); background: rgba(233,30,139,0.02)">
          <div style="font-size: var(--text-xs); color: var(--text-muted)">CURRENT SESSION</div>
          <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-base); color: #fff; margin-top: 2px">
            Logged in as <span class="gradient-text">${loggedIn.name}</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="logout-btn" style="margin-top: var(--space-3)">🚪 Logout Session</button>
        </div>` : ''}

      ${loginFormHtml}

      <div class="grid-2 animate-in delay-1">${teamCardsHtml}</div>

      <div class="mt-8 text-center animate-in delay-2">
        <button class="btn btn-ghost" data-nav="">← Cancel & Go Home</button>
      </div>
    </div>`
}

// ─── Module State for Admin Console & Putter Gallery ───
let activeAdminTab = 'review'
let activeRosterTeamId = 't1'
let editingMatchId = null
let editingPlayerId = null

export function getActiveAdminTab() { return activeAdminTab }
export function setActiveAdminTab(tab) { activeAdminTab = tab }

export function getActiveRosterTeamId() { return activeRosterTeamId }
export function setActiveRosterTeamId(teamId) { activeRosterTeamId = teamId }

export function getEditingMatchId() { return editingMatchId }
export function setEditingMatchId(matchId) { editingMatchId = matchId }

export function getEditingPlayerId() { return editingPlayerId }
export function setEditingPlayerId(playerId) { editingPlayerId = playerId }

// ─── Putter Gallery Page ───
export function renderPutterGallery() {
  const allPlayers = getAllPlayers()
  const searchHtml = `
    <div class="animate-in" style="width: 100%; display: flex; justify-content: center; margin-bottom: var(--space-6)">
      <div style="position: relative; width: 100%; max-width: 480px">
        <span style="position: absolute; left: var(--space-3); top: 50%; transform: translateY(-50%); font-size: var(--text-sm); opacity: 0.6">🔍</span>
        <input type="text" id="putter-gallery-search" placeholder="Search by player name, putter name, or team..." style="background: var(--bg-input); border: 1px solid var(--border-card); padding: var(--space-3) var(--space-4) var(--space-3) var(--space-8); border-radius: var(--radius-xl); color: #fff; font-size: var(--text-sm); width: 100%; outline: none; transition: border-color var(--duration-fast)" />
      </div>
    </div>
  `

  const cardsHtml = allPlayers.map(p => {
    let playerTeam = null
    getStandings('l1').forEach(s => {
      const r = getTeamRoster(s.team.id)
      if (r.some(pl => pl.id === p.id)) playerTeam = s.team
    })

    const teamName = playerTeam ? playerTeam.name : 'Independent'
    const teamColor = playerTeam ? playerTeam.color : 'var(--text-muted)'

    const putterName = p.putterName || 'The Baltimore Blade'
    const putterDesc = p.putterDesc || 'A reliable steel blade putter selected to dominate the concrete brewery carpets.'
    const putterType = p.putterType || 'blade'

    const galleryImageSrc = p.putterImage || `/images/putter_${putterType}.png`
    const searchString = `${p.name} ${teamName} ${putterName} ${putterType}`.replace(/"/g, '&quot;')

    return `
      <div class="card putter-gallery-card animate-in" data-search="${searchString}" style="padding: var(--space-4); display: flex; flex-direction: column; align-items: center; text-align: center; border-color: rgba(255,255,255,0.06); background: rgba(17,17,17,0.45)">
        <div class="putter-preview-trigger" data-lightbox-player="${p.id}" style="cursor: zoom-in; flex-shrink: 0; background: rgba(0,0,0,0.2); border-radius: var(--radius-xl); padding: var(--space-2); display: flex; align-items: center; justify-content: center; width: 110px; height: 110px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: var(--space-3); transition: all var(--duration-fast)">
          <img src="${galleryImageSrc}" alt="${putterName}" style="max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 4px 12px rgba(233,30,139,0.25))" />
        </div>
        <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-sm); color: var(--pink-400); margin-bottom: 2px">${putterName}</div>
        <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-3)">Style: ${putterType}</div>
        
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5; font-style: italic; margin-bottom: var(--space-4); flex: 1">
          "${putterDesc}"
        </p>
        
        <div style="width: 100%; border-top: 1px solid rgba(255,255,255,0.05); padding-top: var(--space-3); display: flex; align-items: center; justify-content: space-between; font-size: var(--text-xs)">
          <span data-nav="player/${p.id}" style="font-weight: 700; color: #fff; cursor: pointer; display: flex; align-items: center; gap: 6px">
            <span class="profile-avatar-small" style="background:${p.avatarColor}; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800">${p.name.split(' ').map(n=>n[0]).join('')}</span>
            ${p.name}
          </span>
          <span data-nav="team/${playerTeam?.id}" style="color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 4px">
            <span class="team-dot" style="background: ${teamColor}; width: 6px; height: 6px"></span>
            ${teamName.split(' ')[0]}
          </span>
        </div>
      </div>
    `
  }).join('')

  return `
    <div class="page container">
      <div class="page-header animate-in text-center" style="display: flex; flex-direction: column; align-items: center">
        <img src="/images/mobtown.jpeg" alt="Mobtown Mascot" style="height: 64px; width: 64px; border-radius: 50%; border: 2px solid var(--border-card); background: rgba(0,0,0,0.2); margin-bottom: var(--space-3); box-shadow: 0 0 16px rgba(233,30,139,0.15)">
        <h1>🏌️‍♂️ Putter Gallery</h1>
        <p class="text-secondary" style="max-width: 500px; margin: 0 auto; line-height: 1.5">
          Every Mobtown putter has a story. Browse the custom shafts and custom-weighted heads crafted to conquer Wednesday night tavern concrete!
        </p>
      </div>

      ${searchHtml}

      <div class="grid-3" id="putter-gallery-grid">${cardsHtml}</div>
      <div class="mt-8 text-center"><button class="btn btn-ghost" data-nav="">← Go Home</button></div>
    </div>
  `
}

// ─── Admin Console Page ───
export function renderAdminPage() {
  const loggedIn = getLoggedInUser()
  if (!loggedIn || !loggedIn.isAdmin) {
    return `<div class="page container"><div class="card card-glass text-center" style="padding:var(--space-12)">
      <h2>🔐 Access Denied</h2>
      <p class="text-muted" style="margin-top:var(--space-2)">You must be a League Admin to view the Commissioner Console.</p>
      <button class="btn btn-primary" style="margin-top:var(--space-4)" data-nav="login">Log In as Admin</button>
    </div></div>`
  }

  // Render sub-tabs header
  const tabsHtml = `
    <div class="view-toggle animate-in" style="margin-bottom: var(--space-6)">
      <button class="view-toggle-btn ${activeAdminTab === 'review' ? 'active' : ''}" data-admin-tab="review">📋 Game Review</button>
      <button class="view-toggle-btn ${activeAdminTab === 'matches' ? 'active' : ''}" data-admin-tab="matches">📅 Matches</button>
      <button class="view-toggle-btn ${activeAdminTab === 'roster' ? 'active' : ''}" data-admin-tab="roster">👥 Roster Controls</button>
      <button class="view-toggle-btn ${activeAdminTab === 'analytics' ? 'active' : ''}" data-admin-tab="analytics">📊 Cup Analytics</button>
    </div>
  `

  let tabContent = ''

  // 1. GAME REVIEW TAB
  if (activeAdminTab === 'review') {
    const pendingMatches = getAllMatches().filter(m => m.status === 'pending_review')
    
    if (pendingMatches.length === 0) {
      tabContent = `
        <div class="card card-glass text-center animate-in" style="padding: var(--space-8); background: rgba(251, 191, 36, 0.01); border-color: rgba(251, 191, 36, 0.05)">
          <div style="font-size: var(--text-3xl); margin-bottom: var(--space-3)">🍻</div>
          <h4 style="font-family: var(--font-display); font-weight: 800; color: #fff">All Caught Up!</h4>
          <p class="text-secondary" style="font-size: var(--text-sm)">No pending series require review. Pour a Natty Boh and relax!</p>
        </div>
      `
    } else {
      const reviewCards = pendingMatches.map(m => {
        const ht = getTeam(m.homeTeamId), at = getTeam(m.awayTeamId)
        const isHomeWinner = m.winnerId === m.homeTeamId
        const isAwayWinner = m.winnerId === m.awayTeamId
        const gamesCount = m.games?.length || 0
        
        return `
          <div class="card match-card animate-in" style="padding: var(--space-5); border-color: var(--gold-400)25; background: rgba(251, 191, 36, 0.02)">
            <div class="match-meta" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-3)">
              <span>Week ${m.weekNumber} · Best of 3 · ${gamesCount} game${gamesCount !== 1 ? 's' : ''} played</span>
              <span class="badge badge-gold">⏳ PENDING VERIFICATION</span>
            </div>

            <div class="match-teams" style="margin-bottom: var(--space-4)">
              <div class="match-team${isHomeWinner ? ' winner' : ''}" style="font-weight: 700"><span class="team-dot" style="background:${ht.color}"></span> ${ht.name}${isHomeWinner ? ' 👑' : ''}</div>
              <div class="match-score" style="font-size: var(--text-xl); font-weight: 800; font-family: var(--font-display)">
                <span class="${isHomeWinner ? 'text-green' : ''}">${m.seriesScore?.home || 0}</span><span class="text-muted">–</span><span class="${isAwayWinner ? 'text-green' : ''}">${m.seriesScore?.away || 0}</span>
              </div>
              <div class="match-team away${isAwayWinner ? ' winner' : ''}" style="font-weight: 700">${isAwayWinner ? '👑 ' : ''}${at.name}<span class="team-dot" style="background:${at.color}"></span></div>
            </div>

            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-4)">
              <div style="font-size: 10px; color: var(--gold-400); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em">
                🧢 Submitted by Captain: <span style="color: #fff">${m.submittedByPlayerName || 'Unknown Captain'}</span>
              </div>
            </div>

            <div class="flex gap-2 justify-end" style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: var(--space-3)">
              <button class="btn btn-primary btn-sm" data-approve-match="${m.id}">Approve & Publish 🚀</button>
            </div>
          </div>
        `
      }).join('')

      tabContent = `
        <div class="flex flex-col gap-4 animate-in">
          <div style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-2)">
            The following series have been recorded by their captains and are pending review.
          </div>
          ${reviewCards}
        </div>
      `
    }
  }

  // 1.5 MATCH MANAGEMENT TAB
  else if (activeAdminTab === 'matches') {
    const allTeams = getLeagueTeams('l1')
    const season = getActiveSeason()
    const allMatches = getAllMatches().filter(m => m.leagueId === 'l1')
    const scheduledMatches = allMatches.filter(m => m.status === 'scheduled')
    const completedMatches = allMatches.filter(m => m.status === 'completed')

    // Group scheduled matches by week
    const weekGroups = {}
    scheduledMatches.forEach(m => {
      if (!weekGroups[m.weekNumber]) weekGroups[m.weekNumber] = []
      weekGroups[m.weekNumber].push(m)
    })

    const teamOptions = allTeams.map(t => `<div class="custom-dropdown-option" data-value="${t.id}" style="display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;border-radius:var(--radius-md)"><span class="team-dot" style="background:${t.color}"></span>${t.name}</div>`).join('')

    // Create match form
    const createFormHtml = `
      <div class="card animate-in" style="padding:var(--space-5);margin-bottom:var(--space-6);border-color:rgba(34,197,94,0.15);background:rgba(34,197,94,0.02);overflow:visible;position:relative;z-index:20">
        <h4 style="font-family:var(--font-display);font-weight:800;color:var(--green-400);margin-bottom:var(--space-4)">➕ Create New Match</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:var(--space-3);align-items:end">
          <div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Week #</label>
            <input type="number" id="admin-new-match-week" min="1" max="${season.weeks}" value="${getWeekNumber()}" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:8px 12px;color:#fff;width:100%;font-size:var(--text-sm)" />
          </div>
          <div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Home Team</label>
            <div class="custom-select-container" id="admin-home-team-select" style="position:relative">
              <button class="custom-select-trigger btn btn-secondary btn-sm" data-custom-select="admin-home-team" style="width:100%;text-align:left;display:flex;align-items:center;gap:8px;justify-content:space-between">
                <span id="admin-home-team-label">Select Home</span> <span>▾</span>
              </button>
              <div class="custom-select-dropdown" id="admin-home-team-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:999;background:rgba(18,18,18,0.98);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:4px;margin-top:4px;max-height:250px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.6)">
                ${teamOptions}
              </div>
              <input type="hidden" id="admin-home-team-value" value="" />
            </div>
          </div>
          <div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Away Team</label>
            <div class="custom-select-container" id="admin-away-team-select" style="position:relative">
              <button class="custom-select-trigger btn btn-secondary btn-sm" data-custom-select="admin-away-team" style="width:100%;text-align:left;display:flex;align-items:center;gap:8px;justify-content:space-between">
                <span id="admin-away-team-label">Select Away</span> <span>▾</span>
              </button>
              <div class="custom-select-dropdown" id="admin-away-team-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:999;background:rgba(18,18,18,0.98);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:4px;margin-top:4px;max-height:250px;overflow-y:auto;box-shadow:0 12px 40px rgba(0,0,0,0.6)">
                ${teamOptions}
              </div>
              <input type="hidden" id="admin-away-team-value" value="" />
            </div>
          </div>
          <button class="btn btn-primary btn-sm" id="admin-create-match-btn" style="white-space:nowrap">Create Match</button>
        </div>
      </div>
    `

    // Quick Score Form
    const unplayedOptions = scheduledMatches.map(m => {
      const ht = getTeam(m.homeTeamId), at = getTeam(m.awayTeamId)
      return `<div class="custom-dropdown-option" data-value="${m.id}" style="padding:8px 12px;cursor:pointer;border-radius:var(--radius-md)">Wk${m.weekNumber}: ${ht.name} vs ${at.name}</div>`
    }).join('')

    const quickScoreHtml = `
      <div class="card animate-in" style="padding:var(--space-5);margin-bottom:var(--space-6);border-color:rgba(251,191,36,0.15);background:rgba(251,191,36,0.02);overflow:visible;position:relative;z-index:10">
        <h4 style="font-family:var(--font-display);font-weight:800;color:var(--gold-400);margin-bottom:var(--space-4)">⚡ Quick Score Entry</h4>
        <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3)">Enter results for a match played offline. Input individual game scores (Best of 3).</p>
        <div style="margin-bottom:var(--space-3);position:relative;z-index:100">
          <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Select Match</label>
          <div class="custom-select-container" id="admin-quick-match-select" style="position:relative">
            <button class="custom-select-trigger btn btn-secondary btn-sm" data-custom-select="admin-quick-match" style="width:100%;max-width:400px;text-align:left;display:flex;align-items:center;gap:8px;justify-content:space-between">
              <span id="admin-quick-match-label">Select a match</span> <span>▾</span>
            </button>
            <div class="custom-select-dropdown" id="admin-quick-match-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:999;background:rgba(18,18,18,0.98);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius-md);padding:4px;margin-top:4px;max-height:250px;overflow-y:auto;max-width:400px;box-shadow:0 12px 40px rgba(0,0,0,0.6)">
              ${unplayedOptions || '<div class="text-muted" style="padding:8px 12px;font-size:var(--text-xs)">No scheduled matches</div>'}
            </div>
            <input type="hidden" id="admin-quick-match-value" value="" />
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-3);position:relative;z-index:1">
          <div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Game 1 (Home–Away)</label>
            <div style="display:flex;gap:4px;align-items:center">
              <input type="number" id="admin-qs-g1-home" min="0" max="6" value="0" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:6px 8px;color:#fff;width:50px;text-align:center;font-size:var(--text-sm)" />
              <span class="text-muted">–</span>
              <input type="number" id="admin-qs-g1-away" min="0" max="6" value="0" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:6px 8px;color:#fff;width:50px;text-align:center;font-size:var(--text-sm)" />
            </div>
          </div>
          <div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Game 2 (Home–Away)</label>
            <div style="display:flex;gap:4px;align-items:center">
              <input type="number" id="admin-qs-g2-home" min="0" max="6" value="0" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:6px 8px;color:#fff;width:50px;text-align:center;font-size:var(--text-sm)" />
              <span class="text-muted">–</span>
              <input type="number" id="admin-qs-g2-away" min="0" max="6" value="0" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:6px 8px;color:#fff;width:50px;text-align:center;font-size:var(--text-sm)" />
            </div>
          </div>
          <div>
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px">Game 3 (optional)</label>
            <div style="display:flex;gap:4px;align-items:center">
              <input type="number" id="admin-qs-g3-home" min="0" max="6" value="" placeholder="—" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:6px 8px;color:#fff;width:50px;text-align:center;font-size:var(--text-sm)" />
              <span class="text-muted">–</span>
              <input type="number" id="admin-qs-g3-away" min="0" max="6" value="" placeholder="—" style="background:var(--bg-input);border:1px solid var(--border-card);border-radius:var(--radius-md);padding:6px 8px;color:#fff;width:50px;text-align:center;font-size:var(--text-sm)" />
            </div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="admin-quick-score-btn">Submit Scores</button>
      </div>
    `

    // Scheduled matches list with delete option
    const schedListHtml = Object.entries(weekGroups).sort((a, b) => a[0] - b[0]).map(([wk, ms]) => `
      <div style="margin-bottom:var(--space-4)">
        <div style="font-size:var(--text-xs);color:var(--text-muted);font-weight:700;margin-bottom:var(--space-2)">WEEK ${wk}</div>
        ${ms.map(m => {
          const ht = getTeam(m.homeTeamId), at = getTeam(m.awayTeamId)
          return `<div class="flex items-center justify-between" style="padding:var(--space-2) 0;border-bottom:1px solid rgba(255,255,255,0.03)">
            <span style="font-size:var(--text-sm)"><span class="team-dot" style="background:${ht.color}"></span>${ht.name} vs <span class="team-dot" style="background:${at.color}"></span>${at.name}</span>
            <button class="btn btn-ghost btn-sm" data-admin-delete-match="${m.id}" style="color:var(--red-400);font-size:10px;padding:2px 8px">✕ Delete</button>
          </div>`
        }).join('')}
      </div>
    `).join('')

    tabContent = `
      <div class="animate-in">
        ${createFormHtml}
        ${quickScoreHtml}
        <section>
          <div class="section-header"><h3>📅 Scheduled Matches</h3><span class="badge badge-pink">${scheduledMatches.length}</span></div>
          <div class="card" style="padding:var(--space-4)">
            ${schedListHtml || '<div class="text-muted text-center" style="padding:var(--space-6)">No scheduled matches</div>'}
          </div>
        </section>
        <section style="margin-top:var(--space-6)">
          <div class="section-header"><h3>📊 Session Data</h3></div>
          <div class="card" style="padding:var(--space-4)">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">
              <button class="btn btn-primary btn-sm" id="admin-email-report-btn" style="display:flex;align-items:center;justify-content:center;gap:6px">📧 Email Report</button>
              <button class="btn btn-secondary btn-sm" id="admin-save-snapshot-btn" style="display:flex;align-items:center;justify-content:center;gap:6px">💾 Save Snapshot</button>
            </div>
          </div>
        </section>
        <section style="margin-top:var(--space-4)">
          <div class="card" style="padding:var(--space-5);border-color:rgba(239,68,68,0.2);background:rgba(239,68,68,0.03)">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3)">
              <div>
                <h4 style="font-family:var(--font-display);font-weight:800;color:var(--red-400);margin-bottom:4px">🔄 Reset for Demo Night</h4>
                <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:0">Wipes all match results back to zero. Teams, players, and schedule stay intact.</p>
              </div>
              <button class="btn btn-sm" id="admin-reset-stats-btn" style="background:rgba(239,68,68,0.15);border:1px solid var(--red-400);color:var(--red-400);font-weight:700;white-space:nowrap">Reset All Stats</button>
            </div>
          </div>
        </section>
      </div>
    `
  }

  // 2. ROSTER CONTROLS TAB
  else if (activeAdminTab === 'roster') {
    const activeTeam = getTeam(activeRosterTeamId)
    const roster = getTeamRoster(activeRosterTeamId)

    const rosterItemsHtml = roster.map(p => {
      const isCaptain = activeTeam.captainPlayerId === p.id
      const isEditing = editingPlayerId === p.id

      return `
        <div class="roster-item" style="padding: var(--space-3); border-bottom: 1px solid rgba(255,255,255,0.03)">
          <div class="roster-avatar" style="background:${p.avatarColor}">${p.name.split(' ').map(n=>n[0]).join('')}</div>
          <div style="flex: 1">
            ${isEditing ? `
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap">
                <input type="text" id="edit-player-name-${p.id}" value="${p.name.replace(/"/g, '&quot;')}" style="background: var(--bg-input); border: 1px solid var(--border-card); border-radius: var(--radius-md); padding: 4px var(--space-2); color: #fff; font-size: var(--text-sm)" required />
                <input type="color" id="edit-player-color-${p.id}" value="${p.avatarColor}" style="width: 36px; height: 28px; border: none; padding: 0; background: transparent; cursor: pointer" />
              </div>
            ` : `
              <div class="roster-name" style="font-weight: 700">${p.name}</div>
              <div class="roster-role" style="font-size: 10px; color: var(--text-secondary)">
                ${isCaptain ? '🧢 Captain' : 'Player'} · ${p.putterName || 'The Bmore Blade'}
              </div>
            `}
          </div>

          <div class="flex gap-2">
            ${isEditing ? `
              <button class="btn btn-secondary btn-sm" data-cancel-edit-player="${p.id}">Cancel</button>
              <button class="btn btn-primary btn-sm" data-save-player="${p.id}">Save</button>
            ` : `
              ${!isCaptain ? `<button class="btn btn-secondary btn-sm" data-assign-captain="${p.id}" data-team-id="${activeTeam.id}">🧢 Make Captain</button>` : ''}
              <button class="btn btn-secondary btn-sm" data-edit-player="${p.id}">✏️ Edit</button>
              <button class="btn btn-ghost btn-sm" data-remove-player="${p.id}" style="color: var(--red-400)">❌ Remove</button>
            `}
          </div>
        </div>
      `
    }).join('')

    tabContent = `
      <div class="animate-in" style="display: flex; flex-direction: column; gap: var(--space-5)">
        <div class="card card-glass" style="position: relative; z-index: 10; padding: var(--space-4); overflow: visible">
          <div class="flex flex-col sm-row justify-between items-center gap-3" style="position: relative">
            <span style="font-family: var(--font-display); font-weight: 800; color: #fff">Select Team to Manage:</span>
            
            <div class="custom-select-container" style="position: relative; width: 100%; max-width: 240px">
              <button id="custom-team-select-trigger" class="btn btn-secondary" style="width: 100%; justify-content: space-between; background: var(--bg-input); border: 1px solid var(--border-card); padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); color: #fff; font-size: var(--text-sm); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px">
                <span style="display: flex; align-items: center; gap: 8px">
                  <span class="team-dot" style="background:${activeTeam.color}"></span>
                  ${activeTeam.name}
                </span>
                <span style="font-size: 10px; opacity: 0.7">▼</span>
              </button>
              
              <div id="custom-team-select-options" class="card card-glass dropdown-menu" style="display: none; position: absolute; top: calc(100% + 6px); right: 0; left: 0; z-index: 100; max-height: 250px; overflow-y: auto; padding: 4px; background: rgba(15,15,15,0.98); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-radius: var(--radius-md)">
                ${getStandings('l1').map(s => `
                  <div class="custom-select-option ${s.team.id === activeRosterTeamId ? 'active' : ''}" data-value="${s.team.id}" style="padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: var(--text-sm); font-weight: 600; color: ${s.team.id === activeRosterTeamId ? '#fff' : 'var(--text-secondary)'}; background: ${s.team.id === activeRosterTeamId ? 'rgba(233,30,139,0.15)' : 'transparent'}; transition: all var(--duration-fast)">
                    <span class="team-dot" style="background:${s.team.color}"></span>
                    ${s.team.name}
                  </div>
                `).join('')}
              </div>
            </div>
            
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr; md-grid-template-columns: 3fr 2fr; gap: var(--space-5); align-items: start" class="grid-2">
          <!-- Roster List -->
          <section>
            <div class="section-header"><h3>👥 ${activeTeam.name} Roster</h3></div>
            <div class="card" style="padding: 0 var(--space-2); background: rgba(17,17,17,0.45)">
              ${rosterItemsHtml || '<div class="text-muted" style="padding: var(--space-4)">No players on roster</div>'}
            </div>
          </section>

          <!-- Register Player Form -->
          <section>
            <div class="section-header"><h3>🆕 Register Player</h3></div>
            <div class="card card-glass" style="padding: var(--space-4); border-color: rgba(255,255,255,0.04)">
              <form id="add-player-form" style="display: flex; flex-direction: column; gap: var(--space-4)" data-team-id="${activeTeam.id}">
                <div class="flex flex-col gap-1">
                  <label style="font-size: 10px; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em">FULL NAME</label>
                  <input type="text" id="add-player-name" placeholder="First and Last Name" style="background: var(--bg-input); border: 1px solid var(--border-card); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); color: #fff; font-size: var(--text-sm)" required />
                </div>
                <div class="flex flex-col gap-2">
                  <label style="font-size: 10px; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.05em">AVATAR COLOR SWATCH</label>
                  <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap" id="swatch-container">
                    ${['#e91e8b', '#fbbf24', '#22c55e', '#22d3ee', '#a78bfa', '#ef4444', '#f97316'].map((c, i) => `
                      <button type="button" class="add-player-color-swatch ${i===0?'active':''}" data-color="${c}" style="background:${c}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid ${i===0?'#fff':'transparent'}; cursor: pointer; transition: all var(--duration-fast)"></button>
                    `).join('')}
                    <input type="color" id="add-player-color-picker" style="width: 28px; height: 28px; padding:0; border: none; background: transparent; cursor: pointer" value="#e91e8b" />
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-sm" style="margin-top: var(--space-2); justify-content: center">🚀 Add to Team Roster</button>
              </form>
            </div>
          </section>
        </div>
      </div>
    `
  }

  // 3. LEAGUE ANALYTICS TAB
  else {
    const completedMatches = getAllMatches().filter(m => m.status === 'completed')
    const totalTurnsAll = completedMatches.reduce((acc, m) => {
      return acc + (m.games || []).reduce((ga, g) => ga + (g.totalTurns || (g.turns || []).length), 0)
    }, 0)
    const avgTurnsAll = completedMatches.length ? (totalTurnsAll / completedMatches.length).toFixed(1) : '0'

    let totalBBs = 0
    completedMatches.forEach(m => {
      ;(m.games || []).forEach(g => {
        totalBBs += Object.values(g.ballBacks || {}).reduce((a, b) => a + b, 0)
      })
    })
    const doubleSinkRatio = totalTurnsAll ? (totalBBs / totalTurnsAll * 100).toFixed(1) + '%' : '0.0%'

    // Calculate cup accuracy percentages
    const cups = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1']
    const cupLabels = {
      'back-1': 'B1 (Back Left)',
      'back-2': 'B2 (Back Center)',
      'back-3': 'B3 (Back Right)',
      'middle-1': 'M1 (Middle Left)',
      'middle-2': 'M2 (Middle Right)',
      'front-1': 'F1 (Front Cup)'
    }
    
    const cupAttempts = { 'back-1': 0, 'back-2': 0, 'back-3': 0, 'middle-1': 0, 'middle-2': 0, 'front-1': 0 }
    const cupSinks = { 'back-1': 0, 'back-2': 0, 'back-3': 0, 'middle-1': 0, 'middle-2': 0, 'front-1': 0 }

    completedMatches.forEach(m => {
      ;(m.games || []).forEach(game => {
        ;(game.turns || []).forEach(turn => {
          turn.putts.forEach(putt => {
            if (cupAttempts[putt.hole] !== undefined) {
              cupAttempts[putt.hole]++
              if (putt.made) {
                cupSinks[putt.hole]++
              }
            }
          })
        })
      })
    })

    const chartHtml = cups.map(c => {
      const att = cupAttempts[c] || 0
      const sink = cupSinks[c] || 0
      const pct = att > 0 ? Math.round(sink / att * 100) : 0
      
      return `
        <div style="margin-bottom: var(--space-4)">
          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 4px">
            <span style="font-weight: 700; color: #fff">${cupLabels[c]}</span>
            <span class="mono" style="color: var(--pink-400); font-weight: 800">${pct}% <span style="font-weight:normal; color:var(--text-muted)">(${sink}/${att})</span></span>
          </div>
          <div style="height: 12px; background: rgba(255,255,255,0.03); border-radius: var(--radius-full); overflow: hidden; border: 1px solid rgba(255,255,255,0.05)">
            <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, var(--pink-500), var(--pink-400)); border-radius: var(--radius-full); transition: width 0.8s var(--ease-out)"></div>
          </div>
        </div>
      `
    }).join('')

    tabContent = `
      <div class="animate-in" style="display: flex; flex-direction: column; gap: var(--space-5)">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value gradient-text">${completedMatches.length}</div>
            <div class="stat-label">Verified Matches</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-green">${avgTurnsAll}</div>
            <div class="stat-label">League Turn Efficiency <span style="font-size:10px; color:var(--text-muted); font-weight:normal">(Turns/Game)</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-gold">${totalBBs}</div>
            <div class="stat-label">🔥 Total Double Sinks</div>
          </div>
          <div class="stat-card">
            <div class="stat-value text-blue">${doubleSinkRatio}</div>
            <div class="stat-label">Double-Sink Ratio <span style="font-size:10px; color:var(--text-muted); font-weight:normal">(BBs/Turn)</span></div>
          </div>
        </div>

        <section>
          <div class="section-header"><h3>📊 Target Cup Success Rates</h3></div>
          <div class="card card-glass" style="padding: var(--space-5)">
            <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-5)">
              Aggregated accuracy statistics across all verified Wednesday night match turns. Compiles attempts vs successful sinks per cup position.
            </div>
            ${chartHtml}
          </div>
        </section>
      </div>
    `
  }

  return `
    <div class="page container">
      <div class="page-header animate-in" style="display: flex; justify-content: space-between; align-items: center; gap: var(--space-4)">
        <div>
          <h1>👑 Admin Console</h1>
          <p class="text-secondary">Official Mobtown League Commissioner Dashboard</p>
        </div>
        <img src="/images/mobtown.jpeg" alt="Mobtown Mascot" style="height: 64px; width: 64px; border-radius: 50%; border: 2px solid var(--border-card); background: rgba(0,0,0,0.2); box-shadow: 0 0 16px rgba(233,30,139,0.15)">
      </div>

      ${tabsHtml}
      ${tabContent}
    </div>
  `
}


