import { getActiveSeason, getStandings, getAllMatches, getTeam, getTeamRoster, getTeamMatches, getPlayerStats, getPlayer, getAllLeagues, getLeague, getVenue, getLeagueTeams, getTeamAdvancedStats } from '../data.js'
import { renderBoard } from '../board.js'
import { getSelectedLeague } from './home.js'

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
  const league = getLeague(leagueId)
  const venue = getVenue(league.venueId)
  const standings = getStandings(leagueId)
  const rows = standings.map((s, i) => `
    <tr data-nav="team/${s.team.id}" style="cursor:pointer">
      <td class="mono">${i + 1}</td>
      <td><span class="team-dot" style="background:${s.team.color}"></span> ${s.team.name}</td>
      <td class="mono">${s.wins}-${s.losses}</td>
      <td class="mono">${(s.winPct * 100).toFixed(0)}%</td>
      <td class="mono">${s.holeDiff > 0 ? '+' : ''}${s.holeDiff}</td>
      <td class="mono">${s.holesFor}</td>
      <td class="mono">${s.ballBacks}</td>
      <td>${s.currentStreak ? `<span class="badge ${s.currentStreak.startsWith('W')?'badge-win':'badge-loss'}">${s.currentStreak}</span>` : ''}</td>
      <td><span class="sparkline">${s.streak.map(r=>`<span class="sparkline-dot ${r==='W'?'win':'loss'}"></span>`).join('')}</span></td>
    </tr>`).join('')

  return `<div class="page container">
    <div class="page-header animate-in"><h1>Season Standings</h1><p>${season.name}</p></div>
    <div class="league-tabs animate-in">${leagueTabsHtml()}</div>
    <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
    <div class="table-wrapper animate-in delay-1"><table><thead><tr>
      <th>#</th><th>Team</th><th>Record</th><th>Win%</th><th>+/-</th><th>Holes</th><th>🔥 BB</th><th>Streak</th><th>Form</th>
    </tr></thead><tbody>${rows}</tbody></table></div>
  </div>`
}

// ─── Schedule Page ───
export function renderSchedule() {
  const season = getActiveSeason()
  const leagueId = getSelectedLeague()
  const league = getLeague(leagueId)
  const venue = getVenue(league.venueId)
  const allMatches = getAllMatches().filter(m => m.leagueId === leagueId).sort((a, b) => a.weekNumber - b.weekNumber)
  const weeks = {}
  allMatches.forEach(m => { if (!weeks[m.weekNumber]) weeks[m.weekNumber] = []; weeks[m.weekNumber].push(m) })

  const weeksHtml = Object.entries(weeks).map(([wk, ms]) => `
    <section class="home-section animate-in">
      <div class="section-header"><h3>Week ${wk}</h3><span class="badge ${ms[0].status==='completed'?'badge-win':'badge-pink'}">${ms[0].status==='completed'?'Complete':'Upcoming'}</span></div>
      <div class="flex flex-col gap-3">${ms.map(m => {
        const ht = getTeam(m.homeTeamId), at = getTeam(m.awayTeamId)
        return `<div class="card match-card" ${m.status==='completed'?`data-nav="match/${m.id}" style="cursor:pointer"`:''}>
          <div class="match-meta">${m.timeSlot} · ${new Date(m.date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}${m.overtime?' · ⚡OT':''}</div>
          <div class="match-teams">
            <div class="match-team${m.finalScore?.home>m.finalScore?.away?' winner':''}"><span class="team-dot" style="background:${ht.color}"></span>${ht.name}</div>
            <div class="match-score">${m.status==='completed'
              ? `<span class="${m.finalScore.home>m.finalScore.away?'text-green':''}">${m.finalScore.home}</span><span class="text-muted">—</span><span class="${m.finalScore.away>m.finalScore.home?'text-green':''}">${m.finalScore.away}</span>`
              : '<span class="text-muted">vs</span>'}</div>
            <div class="match-team away${m.finalScore?.away>m.finalScore?.home?' winner':''}">${at.name}<span class="team-dot" style="background:${at.color}"></span></div>
          </div>
        </div>`}).join('')}</div>
    </section>`).join('')

  return `<div class="page container">
    <div class="page-header animate-in"><h1>Schedule</h1><p>${season.name}</p></div>
    <div class="league-tabs animate-in">${leagueTabsHtml()}</div>
    <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
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
  const matches = getTeamMatches(teamId)
  const season = getActiveSeason()
  const standings = getStandings(team.leagueId)
  const teamStanding = standings.find(s => s.team.id === teamId)
  const advanced = getTeamAdvancedStats(teamId)

  const rosterHtml = roster.map(p => {
    const stats = getPlayerStats(p.id)
    return `<div class="roster-item" data-nav="player/${p.id}">
      <div class="roster-avatar" style="background:${p.avatarColor}">${p.name.split(' ').map(n=>n[0]).join('')}</div>
      <div style="flex:1"><div class="roster-name">${p.name}</div><div class="roster-role">${team.captainPlayerId===p.id?'🧢 Captain':''} · ${stats.gamesPlayed} games</div></div>
      <div style="text-align:right"><div style="font-weight:700;color:var(--pink-400)">${(stats.puttingPct*100).toFixed(0)}%</div><div style="font-size:var(--text-xs);color:var(--text-muted)">accuracy</div></div>
    </div>`}).join('')

  const matchesHtml = matches.map(m => {
    const opp = m.homeTeamId === teamId ? m.awayTeam : m.homeTeam
    const teamScore = m.homeTeamId === teamId ? m.finalScore.home : m.finalScore.away
    const oppScore = m.homeTeamId === teamId ? m.finalScore.away : m.finalScore.home
    const won = teamScore > oppScore
    return `<div class="card match-card">
      <div class="match-meta">Week ${m.weekNumber} · ${m.status === 'completed' ? (won ? '✅ Win' : '❌ Loss') : 'Scheduled'}${m.overtime?' · ⚡OT':''}</div>
      <div class="flex items-center justify-between">
        <span><span class="team-dot" style="background:${opp.color}"></span> vs ${opp.name}</span>
        ${m.status === 'completed' ? `<span class="mono" style="font-weight:700">${teamScore} — ${oppScore}</span>` : `<span class="text-muted">${m.timeSlot}</span>`}
      </div>
    </div>`}).join('')

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
      <div class="stat-card"><div class="stat-value">${teamStanding.wins}<span class="text-muted">-</span>${teamStanding.losses}</div><div class="stat-label">Record</div></div>
      <div class="stat-card">
        <div class="stat-value text-green">${(advanced.puttingPct*100).toFixed(0)}%</div>
        <div class="stat-label">Accuracy <span class="text-muted text-xs font-normal">(${advanced.totalMade}/${advanced.totalPutts})</span></div>
      </div>
      <div class="stat-card"><div class="stat-value text-gold">${advanced.totalBallBacks}</div><div class="stat-label">🔥 Ball Backs</div></div>
      <div class="stat-card">
        <div class="stat-value text-blue">${advanced.otWins}<span class="text-muted">-</span>${advanced.otLosses}</div>
        <div class="stat-label">OT Record</div>
      </div>
    </div>` : ''}

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
      <div class="section-header"><h3>Matches</h3></div>
      <div class="flex flex-col gap-3">${matchesHtml}</div>
    </section>
    <div class="mt-4"><button class="btn btn-ghost" data-nav="teams">← All Teams</button></div>
  </div>`
}

let playersViewMode = 'league'
export function getPlayersViewMode() { return playersViewMode }
export function setPlayersViewMode(mode) { playersViewMode = mode }

export function renderPlayersPage() {
  const season = getActiveSeason()
  const currentLeagueId = getSelectedLeague()
  const currentLeague = getLeague(currentLeagueId)
  
  const displayPlayers = []
  
  if (playersViewMode === 'league') {
    const standings = getStandings(currentLeagueId)
    standings.forEach(s => {
      const roster = getTeamRoster(s.team.id)
      roster.forEach(p => {
        const stats = getPlayerStats(p.id)
        displayPlayers.push({ player: p, team: s.team, league: currentLeague, ...stats })
      })
    })
  } else {
    getAllLeagues().forEach(l => {
      const standings = getStandings(l.id)
      standings.forEach(s => {
        const roster = getTeamRoster(s.team.id)
        roster.forEach(p => {
          const stats = getPlayerStats(p.id)
          displayPlayers.push({ player: p, team: s.team, league: l, ...stats })
        })
      })
    })
  }
  
  displayPlayers.sort((a, b) => b.puttingPct - a.puttingPct)

  const rows = displayPlayers.map((e, i) => {
    const v = getVenue(e.league.venueId)
    const venueTag = `<span class="badge" style="background:${v.color}15;color:${v.color};border:1px solid ${v.color}25">${v.shortName}</span>`
    
    // Top rank trophy visual indicators
    let rankDisplay = i + 1
    if (playersViewMode === 'cross') {
      if (i === 0) rankDisplay = '🥇'
      else if (i === 1) rankDisplay = '🥈'
      else if (i === 2) rankDisplay = '🥉'
      else if (i < 10) rankDisplay = `<span style="color:var(--gold-400);font-weight:700">★</span> ${i + 1}`
    }
    
    return `
      <tr data-nav="player/${e.player.id}" style="cursor:pointer">
        <td class="mono" style="text-align:center;font-weight:700">${rankDisplay}</td>
        <td><div class="flex items-center gap-2"><div class="roster-avatar" style="background:${e.player.avatarColor};width:28px;height:28px;font-size:10px">${e.player.name.split(' ').map(n=>n[0]).join('')}</div>${e.player.name}</div></td>
        <td><span class="team-dot" style="background:${e.team.color}"></span> ${e.team.name}</td>
        ${playersViewMode === 'cross' ? `<td>${venueTag}</td>` : ''}
        <td class="mono" style="font-weight:700;color:var(--pink-400)">${(e.puttingPct*100).toFixed(0)}%</td>
        <td class="mono">${e.totalMade}/${e.totalPutts}</td>
        <td class="mono col-hide-mobile">${e.gamesPlayed}</td>
        <td class="col-hide-mobile">${e.bestHole||'—'}</td>
      </tr>`
  }).join('')

  const subHeader = playersViewMode === 'league' 
    ? `${currentLeague.name} · Individual putting stats`
    : `All 3 Breweries Combined · 54 Players Leaderboard`

  return `<div class="page container">
    <div class="page-header animate-in">
      <h1>Players</h1>
      <p>${subHeader}</p>
    </div>
    
    <div class="flex flex-col sm-row justify-between items-center gap-3 animate-in" style="margin-bottom: var(--space-4); background: rgba(255,255,255,0.02); padding: var(--space-3); border-radius: var(--radius-xl); border: 1px solid var(--border-card)">
      ${playersViewMode === 'league' 
        ? `<div class="league-tabs" style="margin-bottom: 0">${leagueTabsHtml()}</div>` 
        : `<div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--gold-400); letter-spacing: 0.1em; text-transform: uppercase; padding-left: var(--space-2)">🏆 UNIFIED LEADERBOARD</div>`
      }
      <div class="view-toggle" style="margin-bottom: 0">
        <button class="view-toggle-btn view-mode-btn ${playersViewMode === 'league' ? 'active' : ''}" data-mode="league">Current Brewery</button>
        <button class="view-toggle-btn view-mode-btn ${playersViewMode === 'cross' ? 'active' : ''}" data-mode="cross">🏆 Cross-League</button>
      </div>
    </div>
    
    <div class="table-wrapper animate-in delay-1">
      <table>
        <thead>
          <tr>
            <th style="text-align:center;width:60px">#</th>
            <th>Player</th>
            <th>Team</th>
            ${playersViewMode === 'cross' ? '<th>Brewery</th>' : ''}
            <th>Accuracy</th>
            <th>Made</th>
            <th class="col-hide-mobile">Games</th>
            <th class="col-hide-mobile">Best Hole</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  </div>`
}

// ─── Player Profile ───
export function renderPlayerProfile(playerId) {
  const player = getPlayer(playerId)
  if (!player) return '<div class="page container"><h1>Player not found</h1></div>'
  const stats = getPlayerStats(playerId)
  const team = getAllMatches().length ? null : null // find via roster
  let playerTeam = null
  getStandings('l1').concat(getStandings('l2'), getStandings('l3')).forEach(s => {
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

  return `<div class="page container">
    <div class="profile-header animate-in">
      <div class="profile-avatar" style="background:${player.avatarColor}">${player.name.split(' ').map(n=>n[0]).join('')}</div>
      <div><div class="profile-name">${player.name}</div>
        ${playerTeam?`<div class="profile-meta" data-nav="team/${playerTeam.id}" style="cursor:pointer"><span class="team-dot" style="background:${playerTeam.color}"></span> ${playerTeam.name}</div>`:''}
      </div>
    </div>
    <div class="stats-grid animate-in delay-1">
      <div class="stat-card"><div class="stat-value gradient-text">${(stats.puttingPct*100).toFixed(0)}%</div><div class="stat-label">Accuracy</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalMade}<span class="text-muted">/${stats.totalPutts}</span></div><div class="stat-label">Putts Made</div></div>
      <div class="stat-card"><div class="stat-value text-gold">${stats.ballBackContributions}</div><div class="stat-label">🔥 Ball Backs</div></div>
      <div class="stat-card"><div class="stat-value">${stats.gamesPlayed}</div><div class="stat-label">Games</div></div>
    </div>
    <section class="animate-in delay-2" style="margin-top:var(--space-6)">
      <div class="section-header"><h3>Hole Accuracy</h3></div>
      <div class="card" style="padding:var(--space-4)">${holeBreakdown}</div>
    </section>
    ${stats.weeklyBreakdown.length?`<section class="animate-in delay-3" style="margin-top:var(--space-6)">
      <div class="section-header"><h3>Weekly Performance</h3></div>
      <div class="card" style="padding:var(--space-4)">
        <div style="display:flex;gap:var(--space-4);justify-content:center;overflow-x:auto">${weeklyHtml}</div>
      </div>
    </section>`:''}
    <div class="mt-4"><button class="btn btn-ghost" data-nav="players">← All Players</button></div>
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

  // Dual board visualization
  const boardHtml = isCompleted ? renderBoard(match.holesWon, match.homeTeamId, match.awayTeamId, homeTeam.color, awayTeam.color) : ''

  // Player stats for this match
  const playerPutts = {}
  if (match.turns) {
    match.turns.forEach(t => {
      t.putts.forEach(p => {
        if (!playerPutts[p.playerId]) playerPutts[p.playerId] = { made: 0, total: 0, ballBacks: 0 }
        playerPutts[p.playerId].total++
        if (p.made) playerPutts[p.playerId].made++
        if (t.ballBack) playerPutts[p.playerId].ballBacks++
      })
    })
  }

  const homeRoster = getTeamRoster(match.homeTeamId)
  const awayRoster = getTeamRoster(match.awayTeamId)

  function playerStatsRow(roster, teamColor) {
    return roster.map(p => {
      const ps = playerPutts[p.id] || { made: 0, total: 0, ballBacks: 0 }
      const pct = ps.total > 0 ? (ps.made / ps.total * 100).toFixed(0) : '—'
      return `<div class="roster-item">
        <div class="roster-avatar" style="background:${p.avatarColor || teamColor};width:32px;height:32px;font-size:10px">${p.name.split(' ').map(n=>n[0]).join('')}</div>
        <div style="flex:1"><div class="roster-name">${p.name}</div></div>
        <div style="text-align:right;display:flex;gap:var(--space-4);align-items:center">
          <span class="mono" style="font-size:var(--text-sm)">${ps.made}/${ps.total}</span>
          <span style="font-family:var(--font-display);font-weight:800;color:var(--pink-400);min-width:36px">${pct}%</span>
        </div>
      </div>`
    }).join('')
  }

  // Turn-by-turn log
  const turnLogHtml = match.turns ? match.turns.map(t => {
    const team = getTeam(t.teamId)
    const phaseTag = t.redemption ? '<span class="badge badge-gold" style="font-size:8px">RDM</span> ' : t.overtime ? '<span class="badge badge-cyan" style="font-size:8px">OT</span> ' : ''
    return `<div class="turn-entry">
      <span class="turn-num">#${t.turnNumber}</span>
      <span class="team-dot" style="background:${team?.color || '#666'}"></span>
      <span style="flex:1">${phaseTag}${t.putts.map(p => {
        const name = getPlayer(p.playerId)?.name?.split(' ')[0] || '?'
        return `${name}: ${p.made ? '✅' + (p.hole !== 'miss' ? ' ' + p.hole : '') : '❌'}`
      }).join(' · ')}</span>
      ${t.ballBack ? '<span class="badge badge-gold" style="font-size:9px">🔥BB</span>' : ''}
    </div>`
  }).join('') : '<div class="text-center text-muted" style="padding:var(--space-4)">No turn data available</div>'

  // Summary stats
  const totalTurns = match.totalTurns || match.turns?.length || 0
  const homeBBs = match.ballBacks?.[match.homeTeamId] || 0
  const awayBBs = match.ballBacks?.[match.awayTeamId] || 0
  const winner = match.winnerId ? getTeam(match.winnerId) : null

  // Dynamic ESPN8: The Ocho Commentary generator
  let ochoCommentary = ''
  if (isCompleted) {
    const homeScore = match.finalScore.home
    const awayScore = match.finalScore.away
    const diff = Math.abs(homeScore - awayScore)
    const winnerName = homeScore > awayScore ? homeTeam.name : awayTeam.name
    const loserName = homeScore > awayScore ? awayTeam.name : homeTeam.name
    const totalBBs = homeBBs + awayBBs
    
    let quote1 = ""
    let quote2 = ""
    
    if (match.overtime) {
      quote1 = `Cotton McKnight: "Welcome back to ESPN8: The Ocho, where we are witnessing absolute, seat-cushion-shredding drama! A nail-biting Overtime between the ${homeTeam.name} and ${awayTeam.name}!"`
      quote2 = `Pepper Reddick: "That's right, Cotton! There is more raw friction in this brewery right now than a high-speed lawnmower race in Biloxi! Sinking those cups under this level of taproom pressure is legendary!"`
    } else if (diff >= 4) {
      quote1 = `Cotton McKnight: "Cotton McKnight here, and folks, we just witnessed a certified, grade-A clinic. The ${winnerName} didn't just win; they absolutely steamrolled the ${loserName} like a rogue Mr. Trash Wheel in a storm drain!"`
      quote2 = `Pepper Reddick: "Ouch, Cotton! That was a complete physical and emotional dismantling! You could see the despair in their eyes, or maybe that was just the reflection of their empty pint glass."`
    } else {
      quote1 = `Cotton McKnight: "A thrilling, down-to-the-wire regulation finish, Pepper! The ${winnerName} managed to squeak out a victory over the ${loserName} by the thinnest of margins!"`
      quote2 = `Pepper Reddick: "Unbelievable scenes, Cotton! A single cup was the difference between eternal glory and buying the next round of draft IPAs. Talk about high-stakes bar sports!"`
    }
    
    let bbQuote = ""
    if (totalBBs >= 3) {
      bbQuote = `<div style="margin-top: var(--space-3); border-top: 1px dashed rgba(251,191,36,0.2); padding-top: var(--space-3); color: var(--gold-400)">
        <strong>Cotton:</strong> "Pepper, the ball backs tonight were absolutely flying! A combined ${totalBBs} double-sinks!"<br/>
        <strong>Pepper:</strong> "It was a double-sink explosion, Cotton! Bold strategy, and boy did it pay off! That's rarer than finding a free parking spot in Fells Point on a Friday!"
      </div>`
    }
    
    ochoCommentary = `
      <section class="animate-in delay-2" style="margin-bottom:var(--space-6); max-width: 600px; margin-left: auto; margin-right: auto">
        <div class="section-header"><h3>🎙️ ESPN8: The Ocho Broadcast Desk</h3></div>
        <div class="card" style="border: 1px dashed rgba(251, 191, 36, 0.4); background: rgba(251, 191, 36, 0.03); padding: var(--space-4); border-radius: var(--radius-xl); box-shadow: 0 4px 24px rgba(251, 191, 36, 0.03)">
          <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--gold-400); letter-spacing: 0.1em; margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px">
            <span class="team-dot" style="background: var(--gold-400)"></span> LIVE FROM THE COUCH
          </div>
          <p style="font-style: italic; color: rgba(255,255,255,0.9); line-height: 1.6; font-size: var(--text-sm); margin: 0">
            <strong>${quote1.split(': "')[0]}:</strong> "${quote1.split(': "')[1]}<br/><br/>
            <strong>${quote2.split(': "')[0]}:</strong> "${quote2.split(': "')[1]}
          </p>
          ${bbQuote}
        </div>
      </section>
    `
  }

  return `<div class="page container">
    <div class="page-header animate-in">
      <h1>Match Detail</h1>
      <p>Week ${match.weekNumber} · ${league.name} · ${venue.name}</p>
    </div>

    <div class="scorer-header animate-in delay-1">
      <div class="scorer-team">
        <div class="scorer-team-name" style="color:${homeTeam.color}">${homeTeam.name}</div>
        <div class="scorer-team-score ${match.finalScore.home > match.finalScore.away ? 'text-green' : ''}">${match.finalScore.home}</div>
      </div>
      <div class="scorer-vs">—</div>
      <div class="scorer-team">
        <div class="scorer-team-name" style="color:${awayTeam.color}">${awayTeam.name}</div>
        <div class="scorer-team-score ${match.finalScore.away > match.finalScore.home ? 'text-green' : ''}">${match.finalScore.away}</div>
      </div>
    </div>

    ${winner ? `<div class="text-center animate-in delay-1" style="margin-bottom:var(--space-4)">
      <span class="badge badge-win" style="font-size:var(--text-sm);padding:var(--space-1) var(--space-4)">🏆 ${winner.name} Wins${match.overtime ? ' (OT)' : ''}</span>
    </div>` : ''}

    ${isCompleted && match.turns && match.turns.length > 0 ? `
    <div class="text-center animate-in delay-1" style="margin-bottom:var(--space-4)">
      <button class="btn btn-secondary" id="play-replay-btn" data-match-id="${match.id}" style="border: 1px dashed var(--gold-400); color: var(--gold-400); background: rgba(251,191,36,0.06); font-weight: 800; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 16px rgba(251,191,36,0.06); transition: all 0.2s ease">
        🎬 Play Match Replay
      </button>
    </div>` : ''}

    <div class="stats-grid animate-in delay-1" style="margin-bottom:var(--space-6)">
      <div class="stat-card"><div class="stat-value">${totalTurns}</div><div class="stat-label">Turns</div></div>
      <div class="stat-card"><div class="stat-value text-gold">${homeBBs + awayBBs}</div><div class="stat-label">🔥 Ball Backs</div></div>
      <div class="stat-card"><div class="stat-value">${match.date || ''}</div><div class="stat-label">${match.timeSlot}</div></div>
      <div class="stat-card"><div class="stat-value">${match.overtime ? '⚡' : '—'}</div><div class="stat-label">${match.overtime ? 'Overtime' : 'Regulation'}</div></div>
    </div>

    ${ochoCommentary}

    ${boardHtml ? `<section class="animate-in delay-2" style="margin-bottom:var(--space-6)">
      <div class="section-header"><h3>Board</h3></div>
      <div style="max-width:500px;margin:0 auto">${boardHtml}</div>
    </section>` : ''}

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

    <section class="animate-in delay-3" style="margin-top:var(--space-4)">
      <div class="section-header"><h3>Shot-by-Shot</h3><span class="badge badge-pink">${totalTurns} turns</span></div>
      <div class="card turn-log" style="padding:var(--space-3);max-height:500px">${turnLogHtml}</div>
    </section>

    <div class="mt-4"><button class="btn btn-ghost" data-nav="schedule">← Schedule</button></div>
  </div>`
}
