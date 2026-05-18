import { getActiveSeason, getStandings, getRecentResults, getUpcomingMatches, getLeaderboard, getTeam, getAllLeagues, getLeague, getVenue } from '../data.js'

let selectedLeagueId = 'l1' // default to Mobtown

export function getSelectedLeague() { return selectedLeagueId }
export function setSelectedLeague(id) { selectedLeagueId = id }

export function renderHome() {
  const season = getActiveSeason()
  const allLeagues = getAllLeagues()
  const league = getLeague(selectedLeagueId)
  const venue = getVenue(league.venueId)
  const standings = getStandings(selectedLeagueId).slice(0, 5)
  const recent = getRecentResults(selectedLeagueId, 20)
  const upcoming = getUpcomingMatches(selectedLeagueId, 3)
  const leaders = getLeaderboard(selectedLeagueId).slice(0, 5)

  // Find the latest completed week
  const lastWeek = recent.length ? Math.max(...recent.map(m => m.weekNumber)) : 0
  const lastWeekMatches = recent.filter(m => m.weekNumber === lastWeek)

  // League selector tabs
  const leagueTabs = allLeagues.map(l => {
    const v = getVenue(l.venueId)
    const isActive = l.id === selectedLeagueId
    return `<button class="league-tab ${isActive ? 'active' : ''}" data-league="${l.id}" style="${isActive ? `background:${v.color}15;border-color:${v.color};color:${v.color}` : ''}">
      <span class="league-tab-name">${v.shortName}</span>
      <span class="league-tab-day">${l.day}s</span>
    </button>`
  }).join('')

  const standingsRows = standings.map((s, i) => `
    <tr data-nav="team/${s.team.id}">
      <td class="mono">${i + 1}</td>
      <td><span class="team-dot" style="background:${s.team.color}"></span> ${s.team.name}</td>
      <td class="mono">${s.wins}-${s.losses}</td>
      <td class="mono">${(s.winPct * 100).toFixed(0)}%</td>
      <td class="col-hide-mobile">${s.currentStreak ? `<span class="badge ${s.currentStreak.startsWith('W') ? 'badge-win' : 'badge-loss'}">${s.currentStreak}</span>` : ''}</td>
      <td class="col-hide-mobile"><span class="sparkline">${s.streak.slice(-5).map(r => `<span class="sparkline-dot ${r === 'W' ? 'win' : 'loss'}"></span>`).join('')}</span></td>
    </tr>`).join('')

  const upcomingHtml = upcoming.map(m => `
    <div class="card match-card animate-in">
      <div class="match-meta">Week ${m.weekNumber} · ${m.timeSlot}</div>
      <div class="match-teams">
        <div class="match-team"><span class="team-dot" style="background:${m.homeTeam.color}"></span>${m.homeTeam.name}</div>
        <div class="match-score"><span class="text-muted">vs</span></div>
        <div class="match-team away">${m.awayTeam.name}<span class="team-dot" style="background:${m.awayTeam.color}"></span></div>
      </div>
    </div>`).join('')

  const leadersHtml = leaders.map((e, i) => `
    <div class="roster-item animate-in" data-nav="player/${e.player.id}" style="animation-delay:${i*60}ms">
      <span style="font-weight:700;color:var(--text-muted);width:20px">${i + 1}</span>
      <div class="roster-avatar" style="background:${e.player.avatarColor}">${e.player.name.split(' ').map(n=>n[0]).join('')}</div>
      <div style="flex:1"><div class="roster-name">${e.player.name}</div><div class="roster-role">${e.team?.name || ''}</div></div>
      <div style="text-align:right"><div style="font-family:var(--font-display);font-weight:800;color:var(--pink-400)">${(e.puttingPct*100).toFixed(0)}%</div><div style="font-size:var(--text-xs);color:var(--text-muted)">accuracy</div></div>
    </div>`).join('')

  const ochoQuotes = [
    "Cotton McKnight: Bold strategy, Cotton. Let's see if it pays off for 'em.",
    "Pepper Reddick: I haven't seen putts of this magnitude since the '98 lawnmower racing finals in Biloxi!",
    "Cotton McKnight: Average putting accuracy is down 2% tonight. I blame the triple-hopped hazy IPAs, Pepper.",
    "Pepper Reddick: Nothing says peak athletic excellence like a cold local stout and a 20-foot turf putt, Cotton!",
    "Cotton McKnight: Mr. Trash Wheels is cleaning up the cup board like an absolute garbage vacuum tonight!",
    "Pepper Reddick: A double-sink ball back! That's rarer than a sober sailor in Fells Point, Cotton!",
    "Cotton McKnight: Bmore Squeegee Boys are applying massive corner pressure on the board tonight!",
    "Pepper Reddick: Barksdale Putters are running this table like it's the West Side corner, Cotton!",
    "Cotton McKnight: Average turns per game is hovering at 14. This is absolute, unadulterated high-octane bar-sports, Pepper!",
    "Pepper Reddick: If you can dodge a wrench, Cotton, you can sink an F1 cup!",
    "Cotton McKnight: The atmosphere here is absolutely electric, Pepper. Or maybe that's just the neon beer signs humming.",
    "Pepper Reddick: You can feel the gravity in the room, Cotton! Putting on this turf requires the precision of a brain surgeon and the patience of a Dundalk fisherman!",
    "Cotton McKnight: Barksdale Putters just sank a middle cup with the cold-blooded efficiency of Omar Little on a Tuesday morning!",
    "Pepper Reddick: He whistle-putted that one right into the hole, Cotton! A truly staggering display of bar athletic dominance!",
    "Cotton McKnight: Dundalk Dirtbikes are moving through this bracket like they're dodging traffic on I-95, Pepper!",
    "Pepper Reddick: Unbelievable, Cotton! That was a high-speed maneuver that would make the 12 O'Clock Boys proud!",
    "Cotton McKnight: House of Cups is folding their opponents like a deck of cards tonight.",
    "Pepper Reddick: They're playing chess while everyone else is playing checkers, Cotton. Or in this case, drinking lagers!",
    "Cotton McKnight: Mr. Trash Wheel has just gobbled up three consecutive putts! The inner harbor is clean and so is their scorecard, Pepper!",
    "Pepper Reddick: That's some high-quality environmental cleanup, Cotton! No debris left on the board!",
    "Cotton McKnight: Squeegee Boys are squeegeeing the board clean! Not a single cup is safe from their squeegee of destiny!",
    "Pepper Reddick: That'll cost you a dollar, Cotton, but boy is it worth it!",
    "Cotton McKnight: Omar's Whistlers are whistling their way to a division title. A hauntingly beautiful performance, Pepper.",
    "Pepper Reddick: You hear that whistle, Cotton, and you know the cups are about to disappear!",
    "Cotton McKnight: It's all about the angles, Pepper. Trigonometry in a bar setting is a beautiful thing.",
    "Pepper Reddick: I failed high school geometry, Cotton, but I know how to bounce a ball off the side cushion and into a B3 cup!",
    "Cotton McKnight: We are looking at a historic night in Baltimore social sports history, Pepper. I haven't been this excited since the national rock-paper-scissors tournament!",
    "Pepper Reddick: My heart is beating faster than a hamster on a wheel, Cotton! This is pure theater!"
  ]
  
  // Shuffle the quotes so the ticker is different and exciting every single load!
  const shuffledQuotes = ochoQuotes.sort(() => Math.random() - 0.5)
  const tickerTapeText = shuffledQuotes.map(q => `"${q}"`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; ")

  return `
    <section class="hero">
      <div class="hero-bg"><div class="hero-orb hero-orb-1"></div><div class="hero-orb hero-orb-2"></div><div class="hero-orb hero-orb-3"></div></div>
      <div class="container hero-content">
        <img src="/images/puttermore.png" alt="Puttermore" class="hero-logo animate-in">
        <div class="animate-in delay-1"><span class="badge badge-pink">${season.name} · 3 Leagues · 27 Teams</span></div>
        <h1 class="hero-title animate-in delay-2"><span class="gradient-text">PUTTERMORE</span></h1>
        <p class="hero-subtitle animate-in delay-2" style="max-width: 480px; margin: 0 auto; line-height: 1.5">
          <span style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-lg); display: block; color: #fff; margin-bottom: 2px">Sink 'Em and Drink 'Em</span>
          <span style="font-size: var(--text-sm); color: var(--text-muted); display: block">Baltimore's social putting league</span>
        </p>
        <div class="hero-actions animate-in delay-3">
          <button class="btn btn-primary btn-lg" data-nav="scorer">🎯 Live Scorer</button>
          <button class="btn btn-secondary btn-lg" data-nav="standings">View Standings</button>
        </div>
        <div class="hero-stats animate-in delay-4">
          <div class="hero-stat"><span class="hero-stat-value">3</span><span class="hero-stat-label">Leagues</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-value">27</span><span class="hero-stat-label">Teams</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-value">54</span><span class="hero-stat-label">Players</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-value">6</span><span class="hero-stat-label">Weeks</span></div>
        </div>
      </div>
    </section>
    <div class="container" style="margin-top: var(--space-4)">
      <div class="ocho-ticker animate-in delay-3" style="margin: 0 auto var(--space-6) auto; max-width: 720px; display: flex; align-items: center; gap: var(--space-3); background: rgba(251, 191, 36, 0.08); border: 1px dashed rgba(251, 191, 36, 0.3); padding: var(--space-2) var(--space-4); border-radius: var(--radius-xl); font-size: var(--text-xs); color: #fff; box-shadow: 0 4px 16px rgba(251, 191, 36, 0.04)">
        <span class="badge" style="background: var(--gold-400); color: #000; font-weight: 800; font-family: var(--font-display); letter-spacing: 0.05em; padding: 2px 8px; flex-shrink: 0; box-shadow: 0 0 8px rgba(251,191,36,0.3)">🎙️ LIVE OCHO TICKER</span>
        <marquee scrollamount="5.5" style="font-style: italic; color: rgba(255,255,255,0.9); width: 100%">${tickerTapeText}</marquee>
      </div>
      <div class="league-tabs animate-in">${leagueTabs}</div>

      <div class="league-venue-bar animate-in delay-1">
        <span style="font-weight:700;color:${venue.color}">${venue.name}</span>
        <span class="text-muted">· ${league.day}s · ${league.name}</span>
      </div>

      ${lastWeekMatches.length ? `
      <section class="home-section animate-in delay-1">
        <div class="section-header"><h2>📋 Week ${lastWeek} Results</h2><button class="btn btn-ghost btn-sm" data-nav="schedule">Full Schedule →</button></div>
        <div class="flex flex-col gap-3">${lastWeekMatches.map(m => `
          <div class="card match-card" data-nav="match/${m.id}" style="cursor:pointer">
            <div class="match-meta">${m.timeSlot}${m.overtime ? ' · ⚡OT' : ''}</div>
            <div class="match-teams">
              <div class="match-team${m.finalScore.home > m.finalScore.away ? ' winner' : ''}">
                <span class="team-dot" style="background:${m.homeTeam.color}"></span>${m.homeTeam.name}
              </div>
              <div class="match-score">
                <span class="${m.finalScore.home > m.finalScore.away ? 'text-green' : ''}">${m.finalScore.home}</span>
                <span class="text-muted">—</span>
                <span class="${m.finalScore.away > m.finalScore.home ? 'text-green' : ''}">${m.finalScore.away}</span>
              </div>
              <div class="match-team away${m.finalScore.away > m.finalScore.home ? ' winner' : ''}">
                ${m.awayTeam.name}<span class="team-dot" style="background:${m.awayTeam.color}"></span>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </section>` : ''}

      <section class="home-section animate-in delay-2">
        <div class="section-header"><h2>Standings</h2><button class="btn btn-ghost btn-sm" data-nav="standings">View All →</button></div>
        <div class="table-wrapper"><table><thead><tr><th>#</th><th>Team</th><th>Record</th><th>Win%</th><th class="col-hide-mobile">Streak</th><th class="col-hide-mobile">Form</th></tr></thead><tbody>${standingsRows}</tbody></table></div>
      </section>

      <section class="home-section animate-in delay-3">
        <div class="section-header"><h3>🎯 Top Putters</h3><button class="btn btn-ghost btn-sm" data-nav="players">All →</button></div>
        <div class="flex flex-col gap-2">${leadersHtml}</div>
      </section>

      ${upcoming.length ? `
      <section class="home-section animate-in delay-4">
        <div class="section-header"><h3>Upcoming</h3><button class="btn btn-ghost btn-sm" data-nav="schedule">Full Schedule →</button></div>
        <div class="flex flex-col gap-3">${upcomingHtml}</div>
      </section>` : ''}
    </div>`
}
