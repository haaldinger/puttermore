import { getActiveSeason, getStandings, getRecentResults, getUpcomingMatches, getLeaderboard, getTeam, getAllLeagues, getLeague, getVenue, getPlayerStats, getPlayerTeam, getTeamRoster, getPlayer, getAllPlayers, getAllMatches } from '../data.js'
import { getLoggedInUser } from '../store.js'
import { getCurrentDate, getTimeState, getWeekNumber } from '../time.js'

let selectedLeagueId = 'l1' // Mobtown only

export function getSelectedLeague() { return selectedLeagueId }
export function setSelectedLeague(id) { selectedLeagueId = id }

let comparedPlayerIds = []
export function getComparedPlayerIds() { return comparedPlayerIds }
export function setComparedPlayerIds(ids) { comparedPlayerIds = ids }
export function toggleComparedPlayerId(playerId) {
  const idx = comparedPlayerIds.indexOf(playerId)
  if (idx === -1) {
    comparedPlayerIds.push(playerId)
  } else {
    comparedPlayerIds.splice(idx, 1)
  }
}
export function clearComparedPlayerIds() { comparedPlayerIds = [] }

function getDeltaBadge(diff, unit, isPercent = false) {
  let diffStr = ''
  if (isPercent) {
    diffStr = (Math.abs(diff) * 100).toFixed(1) + '%'
  } else {
    diffStr = Math.abs(diff).toString()
  }
  
  if (diff > 0) {
    // Competitor is leading (User is trailing / losing) -> RED
    return `<span class="delta-pill delta-negative">+${diffStr}${unit ? ' ' + unit : ''} vs you</span>`
  } else if (diff < 0) {
    // Competitor is trailing (User is leading / winning) -> GREEN
    return `<span class="delta-pill delta-positive">-${diffStr}${unit ? ' ' + unit : ''} vs you</span>`
  } else {
    // Tied -> NEUTRAL GRAY
    return `<span class="delta-pill delta-neutral">+0${unit ? ' ' + unit : ''} vs you</span>`
  }
}

function getRivalryBadge(userStats, compStats) {
  const cups = ['back-1', 'back-2', 'back-3', 'middle-1', 'middle-2', 'front-1']
  const cupNames = {
    'back-1': 'B1 Left', 'back-2': 'B2 Center', 'back-3': 'B3 Right',
    'middle-1': 'M1 Left', 'middle-2': 'M2 Right', 'front-1': 'F1 Front'
  }
  
  let bestCupDiff = -999
  let bestCup = null
  
  cups.forEach(c => {
    const compMade = compStats.holesMade[c] || 0
    const userMade = userStats.holesMade[c] || 0
    const diff = compMade - userMade
    if (diff > bestCupDiff) {
      bestCupDiff = diff
      bestCup = c
    }
  })
  
  if (bestCupDiff > 0 && bestCup) {
    if (bestCup.startsWith('back')) {
      return `🎯 ${cupNames[bestCup]} Sniper (+${bestCupDiff} sinks)`
    } else if (bestCup.startsWith('middle')) {
      return `⚡ ${cupNames[bestCup]} Assassin (+${bestCupDiff} sinks)`
    } else {
      return `🛡️ ${cupNames[bestCup]} Guard (+${bestCupDiff} sinks)`
    }
  }
  
  if (compStats.puttingPct > userStats.puttingPct) {
    return '📈 Pure Accuracy Master'
  } else {
    return '🥊 Underdog Challenger'
  }
}

function getRivalryScoutingReport(userStats, comparedPlayerIds) {
  if (comparedPlayerIds.length === 0) return ''
  
  const loggedIn = getLoggedInUser()
  
  // Compile chart datasets with highly distinct, contrasting brand colors for clear readability
  const chartColors = [
    'var(--cyan-400)',  // "You" - Vibrant Electric Cyan
    'var(--pink-400)',  // Rival 1 - Brand Hot Pink
    'var(--gold-400)',  // Rival 2 - Warm Gold
    'var(--green-400)'  // Rival 3 - Mint Green
  ]

  const allComparedPlayers = [
    { 
      name: 'You', 
      avatarColor: loggedIn ? loggedIn.avatarColor : 'var(--pink-400)', 
      chartColor: chartColors[0],
      stats: userStats 
    },
    ...comparedPlayerIds.map((cid, idx) => {
      const p = getPlayer(cid)
      return {
        name: p ? p.name : 'Unknown',
        avatarColor: p ? p.avatarColor : 'var(--text-muted)',
        chartColor: chartColors[idx + 1] || 'var(--text-secondary)',
        stats: getPlayerStats(cid)
      }
    })
  ]
  
  // Find maximum values for relative scaling
  const maxSinks = Math.max(...allComparedPlayers.map(p => p.stats.totalMade), 1)
  const maxBB = Math.max(...allComparedPlayers.map(p => p.stats.ballBackContributions), 1)
  
  // 1. Accuracy bars
  const accuracyBarsHtml = allComparedPlayers.map(p => {
    const pct = (p.stats.puttingPct * 100).toFixed(0)
    return `
      <div style="display: flex; align-items: center; gap: var(--space-2)">
        <span style="font-size: 10px; font-weight: 700; color: var(--text-secondary); width: 75px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap">${p.name}</span>
        <div style="flex: 1; height: 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-full); overflow: hidden; border: 1px solid rgba(255,255,255,0.03)">
          <div style="width: ${p.stats.puttingPct * 100}%; height: 100%; background: ${p.chartColor}; border-radius: var(--radius-full); transition: width 0.5s var(--ease-out)"></div>
        </div>
        <span class="mono" style="font-size: 10px; font-weight: 700; color: #fff; width: 32px; text-align: right">${pct}%</span>
      </div>
    `
  }).join('')

  // 2. Sinks bars
  const sinksBarsHtml = allComparedPlayers.map(p => {
    const val = p.stats.totalMade
    const pct = (val / maxSinks) * 100
    return `
      <div style="display: flex; align-items: center; gap: var(--space-2)">
        <span style="font-size: 10px; font-weight: 700; color: var(--text-secondary); width: 75px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap">${p.name}</span>
        <div style="flex: 1; height: 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-full); overflow: hidden; border: 1px solid rgba(255,255,255,0.03)">
          <div style="width: ${pct}%; height: 100%; background: ${p.chartColor}; border-radius: var(--radius-full); transition: width 0.5s var(--ease-out)"></div>
        </div>
        <span class="mono" style="font-size: 10px; font-weight: 700; color: #fff; width: 32px; text-align: right">${val}</span>
      </div>
    `
  }).join('')

  // 3. Double Sinks (Ball Backs) bars
  const bbBarsHtml = allComparedPlayers.map(p => {
    const val = p.stats.ballBackContributions
    const pct = (val / maxBB) * 100
    return `
      <div style="display: flex; align-items: center; gap: var(--space-2)">
        <span style="font-size: 10px; font-weight: 700; color: var(--text-secondary); width: 75px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap">${p.name}</span>
        <div style="flex: 1; height: 10px; background: rgba(255,255,255,0.02); border-radius: var(--radius-full); overflow: hidden; border: 1px solid rgba(255,255,255,0.03)">
          <div style="width: ${pct}%; height: 100%; background: ${p.chartColor}; border-radius: var(--radius-full); transition: width 0.5s var(--ease-out)"></div>
        </div>
        <span class="mono" style="font-size: 10px; font-weight: 700; color: var(--gold-400); width: 32px; text-align: right">${val}</span>
      </div>
    `
  }).join('')

  // Legend
  const legendHtml = allComparedPlayers.map(p => `
    <span style="font-size: 10px; color: var(--text-secondary); display: inline-flex; align-items: center; gap: 6px">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${p.chartColor}"></span>
      ${p.name}
    </span>
  `).join('')

  let insights = []
  let totalMetrics = 0
  let userLeadingMetrics = 0
  
  comparedPlayerIds.forEach(cid => {
    const comp = getPlayer(cid)
    if (!comp) return
    const compStats = getPlayerStats(cid)
    
    // Deltas
    const accDiff = compStats.puttingPct - userStats.puttingPct
    const madeDiff = compStats.totalMade - userStats.totalMade
    const bbDiff = compStats.ballBackContributions - userStats.ballBackContributions
    
    // Check who is leading in what
    totalMetrics += 3
    if (accDiff < 0) userLeadingMetrics++ // User is leading
    if (madeDiff < 0) userLeadingMetrics++
    if (bbDiff < 0) userLeadingMetrics++
    
    // Generate tailored bullet insights based on performance differences
    if (accDiff > 0.03) {
      insights.push(`🎯 <strong>Accuracy Gap (${comp.name})</strong>: They lead you by +${(accDiff*100).toFixed(0)}% putting accuracy. Focus on aligning the laser lines on the front cups!`)
    } else if (accDiff < -0.03) {
      insights.push(`🎯 <strong>Accuracy Advantage (${comp.name})</strong>: You lead them by +${(Math.abs(accDiff)*100).toFixed(0)}%. Your stroke has been locked-in!`)
    }
    
    if (madeDiff > 1) {
      insights.push(`🕳️ <strong>Volume Deficit (${comp.name})</strong>: They have out-sunk you by +${madeDiff} cups. Target the middle cups for more consistent scores!`)
    } else if (madeDiff < -1) {
      insights.push(`🕳️ <strong>Volume Lead (${comp.name})</strong>: You are ahead by +${Math.abs(madeDiff)} sinks. Keep applying maximum board pressure!`)
    }
    
    if (bbDiff > 1) {
      insights.push(`🔥 <strong>Double Sink Trail (${comp.name})</strong>: They lead you by +${bbDiff} BB turn extensions. Play the side cushions for more ball-backs!`)
    } else if (bbDiff < -1) {
      insights.push(`🔥 <strong>Double Sink Dominance (${comp.name})</strong>: You have a +${Math.abs(bbDiff)} BB lead! Outstanding risk-reward execution!`)
    }
  })
  
  // Tiebreaker or neck-and-neck check
  if (insights.length === 0) {
    insights.push(`⚖️ <strong>Neck-and-Neck Battle</strong>: Key metrics are extremely tight! Your next match outcome will break this stalemate.`)
  }
  
  // ESPN8 broadcast commentary
  let cottonQuote = ''
  let pepperQuote = ''
  const leadPct = totalMetrics > 0 ? (userLeadingMetrics / totalMetrics * 100) : 0
  
  if (comparedPlayerIds.length === 1) {
    const compName = getPlayer(comparedPlayerIds[0]).name
    if (leadPct > 60) {
      cottonQuote = `Cotton McKnight: "Pepper, this is an absolute, unadulterated putting clinic. J-MO Boh has established supreme mechanical control, while ${compName} is left picking up turf debris!"`
      pepperQuote = `Pepper Reddick: "Right you are, Cotton! J-MO Boh's putter has more zip than a turbocharged lawnmower in Biloxi! Supreme tavern athlete excellence!"`
    } else if (leadPct < 40) {
      cottonQuote = `Cotton McKnight: "J-MO Boh is in a real tactical bind here, Pepper. ${compName} is leading in the crucial volume and accuracy metrics."`
      pepperQuote = `Pepper Reddick: "Oof! That's a tough pint of IPA to choke down, Cotton! J-MO Boh needs to steady their stance and aim for the back corner pocket!"`
    } else {
      cottonQuote = `Cotton McKnight: "We are looking at an absolute, teeth-grinding stalemate, Pepper! Sinks, accuracy, and double-sinks are dead even!"`
      pepperQuote = `Pepper Reddick: "I haven't felt a chill of this magnitude since the Dundalk rock-paper-scissors finals, Cotton! Sinking the next B2 cup wins it all!"`
    }
  } else {
    if (leadPct >= 50) {
      cottonQuote = `Cotton McKnight: "J-MO Boh is defending their turf against a multi-player bracket onslaught, Pepper! And incredibly, they hold the cumulative edge!"`
      pepperQuote = `Pepper Reddick: "They are sweeping away this competition like Mr. Trash Wheel gobbles up inner harbor garbage, Cotton! A truly staggering display of social sports dominance!"`
    } else {
      cottonQuote = `Cotton McKnight: "A multi-front assault on J-MO Boh's stats tonight, Pepper. It is looking like a high-altitude putting climb!"`
      pepperQuote = `Pepper Reddick: "They're in a Dundalk street fight, Cotton! Every single one of these rivals is carrying a customized shaft ready to hijack the table!"`
    }
  }
  
  const bulletItemsHtml = insights.slice(0, 3).map(ins => `
    <div style="font-size: var(--text-xs); color: var(--text-primary); margin-bottom: var(--space-2); display: flex; align-items: flex-start; gap: var(--space-2)">
      <span style="color: var(--pink-400); font-weight: bold; flex-shrink: 0">•</span>
      <div>${ins}</div>
    </div>
  `).join('')
  
  return `
    <!-- Charts Section -->
    <div class="card card-glass animate-in" style="background: rgba(18, 18, 18, 0.45); border-color: rgba(255, 255, 255, 0.05); padding: var(--space-4); margin-top: var(--space-5)">
      <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--pink-400); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: var(--space-4)">
        📊 RIVALRY METRICS CHART
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr; lg-grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4)" class="grid-3">
        <!-- Accuracy -->
        <div style="background: rgba(0,0,0,0.15); padding: var(--space-3); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.02)">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em">Accuracy</div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2)">
            ${accuracyBarsHtml}
          </div>
        </div>
        
        <!-- Sinks -->
        <div style="background: rgba(0,0,0,0.15); padding: var(--space-3); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.02)">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em">Total Sinks</div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2)">
            ${sinksBarsHtml}
          </div>
        </div>
        
        <!-- Double Sinks -->
        <div style="background: rgba(0,0,0,0.15); padding: var(--space-3); border-radius: var(--radius-lg); border: 1px solid rgba(255,255,255,0.02)">
          <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em">Double Sinks (BB)</div>
          <div style="display: flex; flex-direction: column; gap: var(--space-2)">
            ${bbBarsHtml}
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div style="display: flex; justify-content: center; gap: var(--space-4); margin-top: var(--space-4); flex-wrap: wrap; border-top: 1px dashed rgba(255,255,255,0.06); padding-top: var(--space-3)">
        ${legendHtml}
      </div>
    </div>

    <!-- Insights & Analysis Section -->
    <div class="card card-glass animate-in" style="background: linear-gradient(135deg, rgba(233,30,139,0.02), rgba(251,191,36,0.02)); border: 1px dashed rgba(233,30,139,0.3); padding: var(--space-4); margin-top: var(--space-4)">
      <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--gold-400); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: var(--space-3); display: flex; align-items: center; gap: 8px">
        <span>📡</span> DYNAMIC SCUTING REPORT & ANALYSIS
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr; md-grid-template-columns: 1fr 1fr; gap: var(--space-4)" class="grid-2">
        <!-- Insights Column -->
        <div>
          <h4 style="font-family: var(--font-display); font-weight: 800; font-size: 10px; color: #fff; margin-bottom: var(--space-2); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em">💡 Competitive Insights</h4>
          ${bulletItemsHtml}
        </div>
        
        <!-- Cotton & Pepper Column -->
        <div style="background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.04); padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg)">
          <div style="font-family: var(--font-display); font-weight: 800; font-size: 10px; color: var(--pink-400); letter-spacing: 0.05em; margin-bottom: var(--space-2); text-transform: uppercase">🎙️ ESPN8 Broadcast Analysis</div>
          <p style="font-style: italic; color: rgba(255,255,255,0.95); line-height: 1.5; font-size: var(--text-xs); margin: 0">
            <strong>${cottonQuote.split(': "')[0]}:</strong> "${cottonQuote.split(': "')[1]}<br/><br/>
            <strong>${pepperQuote.split(': "')[0]}:</strong> "${pepperQuote.split(': "')[1]}
          </p>
        </div>
      </div>
    </div>
  `
}

// ─── Phase-Aware Sportscasters Dialog Pools ───
// ─── Phase-Aware Sportscasters Dialog Pools ───
const phaseCommentaries = {
  WARMUP: [
    {
      cotton: "Captains are clinking glasses and warming up their putters here in Canton, Pepper. The concrete green is open, and warmups are officially underway!",
      pepper: "This is crucial minutes, Cotton! Getting a feel for the concrete roll before the games start is the difference between a clean sweep and ordering consolation sours at 9 PM!"
    },
    {
      cotton: "The atmosphere here is absolute pre-game electric, Pepper. Athletes are dialing in their alignments and sizing up their custom shafts.",
      pepper: "Right you are, Cotton! J-MO Boh's custom putter has so much grip it practically aims itself! Warm-ups are looking crisp!"
    }
  ],
  LIVE_MATCHES: [
    {
      cotton: "We are live from the Mobtown taproom, Pepper! The beer is flowing, the neon signs are buzzing, and these social athletes are putting with pure ice in their veins!",
      pepper: "Unbelievable, Cotton! J-MO Boh just whistled a double-sink ball-back into the middle cup! The crowd is absolutely going bananas! Pass me a cold lager!"
    },
    {
      cotton: "This is high-stakes Social Athletic history in the making, Pepper. The board pressure is immense, and the scorelines are tighter than a crab claw!",
      pepper: "My heart is beating faster than a hamster on a wheel, Cotton! Tapping these steel shafts off the pub floor requires ultimate steel nerves!"
    }
  ],
  POST_GAME_RECAP: [
    {
      cotton: "The dust has settled over the Canton turf, Pepper, and we are looking at some record-breaking efficiency scores in the weekly recap.",
      pepper: "Indeed, Cotton! The Crab Cake Closers absolutely lived up to their name, while the Squeegee Boys are going to be wiping tears off their shafts until next round!"
    },
    {
      cotton: "Reviewing the score sheets, the double-sink ball-backs were the clear deciding factor in yesterday's clashes, Pepper.",
      pepper: "Right you are! Those turn extensions are worth their weight in gold stouts. Ultimate risk-reward execution out there!"
    },
    {
      cotton: "The final putts have sunk, the scores are approved, and the victory stouts are being poured, Pepper. What a staggering night of competition.",
      pepper: "Oh, it was a pure theater, Cotton! Standings have been completely rearranged, J-MO Boh is celebrating at the bar, and the Mr. Trash Wheels roster is drowning their sours. What an after-party!"
    },
    {
      cotton: "We are counting down to Wednesday's opening putts at Mobtown, Pepper. The team rosters are locked, and the rivalries are already simmering like a fresh batch of wort.",
      pepper: "Oh, the tension is delicious, Cotton! Some of these teams are practicing bank shots off the bar stools, while others are resting their wrists. Wednesday night is going to be a complete shootout!"
    }
  ]
}

// ─── Phase-Aware Sportscasters Ticker Quote Pools ───
const phaseTickerQuotes = {
  WARMUP: [
    "Cotton McKnight: Live warmups are active on the Canton brewery turf! Captains are clinking session lagers.",
    "Pepper Reddick: Keep your stroke smooth and simple in warmups, Cotton. Concrete speeds are tricky!",
    "Cotton McKnight: Countdown ticking down to 6:00 PM. Grab your gear and align those laser sights!",
    "Pepper Reddick: Mobtown Light is flowing at the taps. Stay steady out there, athletes!"
  ],
  LIVE_MATCHES: [
    "🔴 LIVE: Match Night is underway! All eyes are on the scoreboard under the neon beer signs!",
    "Cotton McKnight: Average turns per game is hovering at 14! This is absolute, unadulterated SOCIAL ATHLETICS, Pepper!",
    "Pepper Reddick: J-MO Boh whistled a double-sink ball-back into the F1 cup! The crowd is losing their minds!",
    "Cotton McKnight: Squeegee Boys are squeegeeing the cups clean tonight! Not a single hole is safe!",
    "Pepper Reddick: Mr. Trash Wheels is cleaning the board like a garbage vacuum! Beautiful environmental cleanup!"
  ],
  POST_GAME_RECAP: [
    "Cotton McKnight: The scores are verified and committed. Standings show a historic clamber in Canton.",
    "Pepper Reddick: Squeegee Boys are wiping away tears after a tough final turn, Cotton. That bank shot was brutal!",
    "Cotton McKnight: Audit the replay play-by-plays now to see every single ball-back double sink.",
    "Pepper Reddick: Standings climbs are locked. Crab Cake Closers are standard closer-elite!",
    "Cotton McKnight: Roster matchups are set. Polish your shafts, folks, it is go-time!",
    "Pepper Reddick: I hear J-MO Boh has been putting blindfolded to practice, Cotton! Staggering commitment!"
  ]
}

export function getPhaseCommentary(phase) {
  const list = phaseCommentaries[phase] || phaseCommentaries.POST_GAME_RECAP
  // Pinned to simulated date day-of-year, so quotes don't toggle randomly on hover
  const date = getCurrentDate()
  const dayOfYear = Math.floor(date.getTime() / 86400000)
  const idx = dayOfYear % list.length
  return list[idx]
}

export function getWeeklyMvp(weekNum) {
  const weekMatches = getAllMatches().filter(m => m.weekNumber === weekNum && m.status === 'completed')
  // Fallback to previous week if current week is unplayed
  const matchesToScan = weekMatches.length ? weekMatches : getAllMatches().filter(m => m.weekNumber === (weekNum - 1) && m.status === 'completed')
  
  if (!matchesToScan.length) return null

  const stats = {}
  matchesToScan.forEach(m => {
    m.turns.forEach(t => {
      t.putts.forEach(p => {
        if (!stats[p.playerId]) stats[p.playerId] = { playerId: p.playerId, putts: 0, made: 0 }
        stats[p.playerId].putts++
        if (p.made) stats[p.playerId].made++
      })
    })
  })

  const mvps = Object.values(stats)
    .filter(s => s.putts >= 2)
    .map(s => ({
      player: getPlayer(s.playerId),
      team: getPlayerTeam(s.playerId),
      accuracy: s.made / s.putts,
      made: s.made,
      putts: s.putts
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.made - a.made)

  return mvps.length ? mvps[0] : null
}

export function renderHome() {
  const season = getActiveSeason()
  const allLeagues = getAllLeagues()
  const league = getLeague(selectedLeagueId)
  const venue = getVenue(league.venueId)
  const standings = getStandings(selectedLeagueId).slice(0, 5)
  const recent = getRecentResults(selectedLeagueId, 20)
  const upcoming = getUpcomingMatches(selectedLeagueId, 3)
  const leaders = getLeaderboard(selectedLeagueId).slice(0, 5)

  const timeState = getTimeState()
  const currentWeek = getWeekNumber()

  // Find the latest completed week
  const lastWeek = recent.length ? Math.max(...recent.map(m => m.weekNumber)) : 0
  const lastWeekMatches = recent.filter(m => m.weekNumber === lastWeek)

  const standingsRows = standings.map((s, i) => `
    <tr data-nav="team/${s.team.id}">
      <td class="mono">${i + 1}</td>
      <td>
        <div style="display: flex; align-items: center; gap: var(--space-2); text-align: left">
          <span class="team-dot" style="background:${s.team.color}; flex-shrink: 0"></span>
          <span style="font-weight: 600; line-height: 1.25; overflow-wrap: break-word">${s.team.name}</span>
        </div>
      </td>
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

  // ─── Dynamic Logged-in / Captain / Guest Dashboard ───
  const loggedIn = getLoggedInUser()
  let userDashboardHtml = ''
  if (loggedIn) {
    const stats = getPlayerStats(loggedIn.id)
    const team = getPlayerTeam(loggedIn.id)
    const isCaptain = team && team.captainPlayerId === loggedIn.id
    
    // Find next match for their team
    const nextMatch = upcoming.find(m => m.homeTeamId === team?.id || m.awayTeamId === team?.id)
    let nextMatchHtml = '<span class="text-muted">No upcoming matches scheduled.</span>'
    let captainActionHtml = ''
    
    if (nextMatch && team) {
      const isHome = nextMatch.homeTeamId === team.id
      const oppTeam = isHome ? getTeam(nextMatch.awayTeamId) : getTeam(nextMatch.homeTeamId)
      nextMatchHtml = `<strong>Week ${nextMatch.weekNumber} Matchup:</strong> vs <span style="color:${oppTeam.color};font-weight:700">${oppTeam.name}</span> · ${nextMatch.timeSlot}`
      
      if (isCaptain && timeState.phase === 'LIVE_MATCHES') {
        captainActionHtml = `
          <div style="margin-top: var(--space-4); border-top: 1px dashed rgba(233,30,139,0.15); padding-top: var(--space-4)" class="flex justify-between items-center gap-3">
            <div>
              <div style="font-size: 10px; color: var(--gold-400); font-weight: 800; letter-spacing: 0.05em">🧢 CAPTAIN CONSOLE</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary)">Your team has an active match on the table tonight!</div>
            </div>
            <button class="btn btn-primary btn-sm animate-pulse" data-nav="scorer" style="box-shadow: 0 0 16px var(--pink-500)30">🎯 Score Live Match</button>
          </div>`
      }
    }

    userDashboardHtml = `
      <div class="card card-glass animate-in" style="background: linear-gradient(135deg, rgba(17,17,17,0.7), rgba(25,10,25,0.3)); border-color: var(--pink-400)25; padding: var(--space-5); margin-bottom: var(--space-6)">
        <div class="flex justify-between items-center gap-4" style="margin-bottom: var(--space-4)">
          <div class="flex items-center gap-3">
            <div class="profile-avatar" style="background:${loggedIn.avatarColor}; width: 44px; height: 44px; font-size: var(--text-base); box-shadow: 0 4px 12px ${loggedIn.avatarColor}40; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800">${loggedIn.name.split(' ').map(n=>n[0]).join('')}</div>
            <div>
              <h2 style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-lg)">Welcome back, ${loggedIn.name}!</h2>
              ${team ? `<div style="font-size: var(--text-xs); color: var(--text-secondary); display: flex; align-items: center; gap: 6px">
                <span class="team-dot" style="background:${team.color}"></span>
                ${team.name} ${isCaptain ? '· <span style="color:var(--gold-400);font-weight:700">🧢 Captain</span>' : '· Player'}
              </div>` : ''}
            </div>
          </div>
          <div style="text-align: right">
            <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-lg); color: var(--pink-400)">${(stats.puttingPct*100).toFixed(0)}%</div>
            <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase">accuracy</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-2); background: rgba(0,0,0,0.2); padding: var(--space-3); border-radius: var(--radius-lg); margin-bottom: var(--space-4); text-align: center">
          <div>
            <div style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-base); color: #fff">${stats.gamesPlayed}</div>
            <div style="font-size: 9px; color: var(--text-muted)">GAMES</div>
          </div>
          <div style="border-left: 1px solid var(--border-subtle); border-right: 1px solid var(--border-subtle)">
            <div style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-base); color: var(--gold-400)">${stats.totalMade}</div>
            <div style="font-size: 9px; color: var(--text-muted)">MADE</div>
          </div>
          <div>
            <div style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-base); color: #fff">${stats.ballBackContributions}</div>
            <div style="font-size: 9px; color: var(--text-muted)">🔥 BB</div>
          </div>
        </div>

        <div style="font-size: var(--text-xs); color: var(--text-secondary); background: rgba(255,255,255,0.02); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-card)">
          ${nextMatchHtml}
        </div>

        ${captainActionHtml}
      </div>`
  } else {
    userDashboardHtml = `
      <div class="card card-glass animate-in text-center" style="background: rgba(251, 191, 36, 0.02); border: 1px dashed rgba(251, 191, 36, 0.3); padding: var(--space-5); margin-bottom: var(--space-6)">
        <h3 style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-base); color: var(--gold-400)">🔑 EXPERIENCE DYNAMIC VIEWPORTS</h3>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 460px; margin: var(--space-2) auto 0; line-height: 1.5">
          Authenticate as a registered Mobtown player to experience team-specific stats, captain scoring dashboards, and automated 3-player rotations!
        </p>
        <button class="btn btn-secondary btn-sm" data-nav="login" style="margin-top: var(--space-3); border-color: var(--gold-400)40">Choose Profile</button>
      </div>`
  }

  let rivalryRadarHtml = ''
  if (loggedIn) {
    const userStats = getPlayerStats(loggedIn.id)
    const userTeam = getPlayerTeam(loggedIn.id)
    
    let matrixHtml = ''
    if (comparedPlayerIds.length === 0) {
      rivalryRadarHtml = `
        <div class="card card-glass animate-in" style="padding: var(--space-5); margin-bottom: var(--space-6); border-color: rgba(255,255,255,0.05); background: linear-gradient(180deg, rgba(17,17,17,0.5), rgba(10,10,10,0.3))">
          <div class="flex justify-between items-center gap-3" style="margin-bottom: var(--space-4)">
            <div style="display: flex; align-items: center; gap: 8px">
              <span style="font-size: var(--text-lg)">⚔️</span>
              <div>
                <h3 style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-base); color: #fff; margin-bottom: 2px">RIVALRY RADAR</h3>
                <div style="font-size: var(--text-xs); color: var(--text-muted)">Compare stats side-by-side against division competitors</div>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); flex-wrap: wrap; background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255,255,255,0.05); padding: var(--space-3) var(--space-4); border-radius: var(--radius-xl)">
            <span style="font-size: var(--text-xs); color: var(--text-secondary); font-style: italic">No competitors selected.</span>
            <button class="btn btn-secondary btn-sm" id="manage-rivals-btn" style="border-color: var(--pink-400)40; font-weight: 800">
              ⚖️ Select Rivals & Filters
            </button>
          </div>
        </div>
      `
    } else {
      const initials = loggedIn.name.split(' ').map(n=>n[0]).join('')
      const userBestCupName = userStats.bestHole ? userStats.bestHole.toUpperCase() : '—'
      const userBestCupCount = userStats.bestHole ? userStats.holesMade[userStats.bestHole] || 0 : 0
      
      const compColumnsHtml = comparedPlayerIds.map(cid => {
        const comp = getPlayer(cid)
        if (!comp) return ''
        const compStats = getPlayerStats(cid)
        const compTeam = getPlayerTeam(cid)
        const cInitials = comp.name.split(' ').map(n=>n[0]).join('')
        
        // Calculated Deltas
        const accDiff = compStats.puttingPct - userStats.puttingPct
        const gamesDiff = compStats.gamesPlayed - userStats.gamesPlayed
        const madeDiff = compStats.totalMade - userStats.totalMade
        const bbDiff = compStats.ballBackContributions - userStats.ballBackContributions
        
        const accBadge = getDeltaBadge(accDiff, "", true)
        const gamesBadge = getDeltaBadge(gamesDiff, "games")
        const madeBadge = getDeltaBadge(madeDiff, "sinks")
        const bbBadge = getDeltaBadge(bbDiff, "BB")
          
        const compBestCupName = compStats.bestHole ? compStats.bestHole.toUpperCase() : '—'
        const compBestCupCount = compStats.bestHole ? compStats.holesMade[compStats.bestHole] || 0 : 0
        const rivalryBadge = getRivalryBadge(userStats, compStats)
        
        return `
          <div class="card comparison-grid-card animate-in" style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.05); padding: var(--space-4)">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-4); border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: var(--space-3)">
              <div class="profile-avatar" style="background:${comp.avatarColor}; width: 32px; height: 32px; font-size: var(--text-xs); font-weight:800; display:flex; align-items:center; justify-content:center; color:#fff">${cInitials}</div>
              <div style="flex: 1; min-width:0">
                <div style="font-weight: 700; color: #fff; font-size: var(--text-sm); overflow: hidden; text-overflow: ellipsis; white-space: nowrap">${comp.name}</div>
                ${compTeam ? `<div style="font-size: 10px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px">
                  <span class="team-dot" style="background:${compTeam.color}; width: 6px; height: 6px"></span>
                  ${compTeam.name}
                </div>` : ''}
              </div>
            </div>
            
            <!-- Rivalry Badge -->
            <div style="background: rgba(233,30,139,0.05); border: 1px solid rgba(233,30,139,0.15); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font-size: 10px; font-weight: 700; color: var(--pink-400); text-align: center; margin-bottom: var(--space-4)">
              ${rivalryBadge}
            </div>
            
            <!-- Accuracy -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">ACCURACY</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end">
                <span style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-xl); color: var(--pink-400)">${(compStats.puttingPct*100).toFixed(0)}%</span>
                ${accBadge}
              </div>
            </div>
            
            <!-- Games Played -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">GAMES PLAYED</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end">
                <span style="font-weight: 700; font-size: var(--text-sm); color: #fff">${compStats.gamesPlayed}</span>
                ${gamesBadge}
              </div>
            </div>

            <!-- Sinks Made -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">TOTAL CUP SINKS</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end">
                <span style="font-weight: 700; font-size: var(--text-sm); color: #fff">${compStats.totalMade}</span>
                ${madeBadge}
              </div>
            </div>

            <!-- Double Sinks -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">DOUBLE SINKS</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end">
                <span style="font-weight: 700; font-size: var(--text-sm); color: var(--gold-400)">${compStats.ballBackContributions}</span>
                ${bbBadge}
              </div>
            </div>

            <!-- Best Cup -->
            <div>
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">BEST CUP</div>
              <div style="font-weight: 700; font-size: var(--text-sm); color: #fff">
                ${compBestCupName} <span style="font-weight:normal; color:var(--text-secondary); font-size:var(--text-xs)">(${compBestCupCount} made)</span>
              </div>
            </div>
            
          </div>
        `
      }).join('')
      
      matrixHtml = `
        <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-4)" class="grid-radar-matrix">
          <!-- You Column -->
          <div class="card comparison-grid-card animate-in" style="background: rgba(233,30,139,0.02); border-color: rgba(233,30,139,0.2); padding: var(--space-4)">
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: var(--space-4); border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: var(--space-3)">
              <div class="profile-avatar" style="background:${loggedIn.avatarColor}; width: 32px; height: 32px; font-size: var(--text-xs); font-weight:800; display:flex; align-items:center; justify-content:center; color:#fff">${initials}</div>
              <div style="flex: 1; min-width:0">
                <div style="font-weight: 700; color: #fff; font-size: var(--text-sm)">You</div>
                ${userTeam ? `<div style="font-size: 10px; color: var(--text-secondary); display: flex; align-items: center; gap: 4px">
                  <span class="team-dot" style="background:${userTeam.color}; width: 6px; height: 6px"></span>
                  ${userTeam.name}
                </div>` : ''}
              </div>
            </div>
            
            <!-- Rivalry Badge -->
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font-size: 10px; font-weight: 700; color: var(--text-secondary); text-align: center; margin-bottom: var(--space-4)">
              🏆 Your Baseline
            </div>
            
            <!-- Accuracy -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">ACCURACY</div>
              <div style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-xl); color: var(--pink-400)">${(userStats.puttingPct*100).toFixed(0)}%</div>
            </div>
            
            <!-- Games Played -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">GAMES PLAYED</div>
              <div style="font-weight: 700; font-size: var(--text-sm); color: #fff">${userStats.gamesPlayed}</div>
            </div>

            <!-- Sinks Made -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">TOTAL CUP SINKS</div>
              <div style="font-weight: 700; font-size: var(--text-sm); color: #fff">${userStats.totalMade}</div>
            </div>

            <!-- Double Sinks -->
            <div style="margin-bottom: var(--space-3)">
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">DOUBLE SINKS</div>
              <div style="font-weight: 700; font-size: var(--text-sm); color: var(--gold-400)">${userStats.ballBackContributions}</div>
            </div>

            <!-- Best Cup -->
            <div>
              <div style="font-size: 9px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em">BEST CUP</div>
              <div style="font-weight: 700; font-size: var(--text-sm); color: #fff">
                ${userBestCupName} <span style="font-weight:normal; color:var(--text-secondary); font-size:var(--text-xs)">(${userBestCupCount} made)</span>
              </div>
            </div>
            
          </div>
          
          ${compColumnsHtml}
        </div>
      `
    }
    
    const activeRivalsCount = comparedPlayerIds.length
    let rivalsSummaryHtml = ''
    if (activeRivalsCount === 0) {
      rivalsSummaryHtml = `<span style="font-size: var(--text-xs); color: var(--text-muted); font-style: italic">No competitors selected. Click 'Select Rivals & Filters' to begin!</span>`
    } else {
      rivalsSummaryHtml = comparedPlayerIds.map(cid => {
        const p = getPlayer(cid)
        if (!p) return ''
        return `
          <span class="badge" style="background: rgba(233,30,139,0.08); border: 1px solid rgba(233,30,139,0.25); color: #fff; font-size: 10px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: var(--radius-full)">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${p.avatarColor}; flex-shrink: 0"></span>
            <span>${p.name}</span>
            <span data-remove-rival-id="${p.id}" style="font-weight: 700; opacity: 0.5; cursor: pointer; transition: opacity var(--duration-fast); padding-left: 2px" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">✕</span>
          </span>
        `
      }).join(' ')
    }

    const controllerBarHtml = `
      <div class="rivals-controller-bar">
        <div style="display: flex; align-items: center; gap: var(--space-3); flex: 1; flex-wrap: wrap">
          <span style="font-size: var(--text-xs); font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0">Active Rivals:</span>
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center; flex: 1">
            ${rivalsSummaryHtml}
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" id="manage-rivals-btn" style="border-color: var(--pink-400)40; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 14px; border-radius: var(--radius-lg); transition: all var(--duration-fast)">
          ⚖️ Select Rivals & Filters
        </button>
      </div>
    `
    
    rivalryRadarHtml = `
      <div class="card card-glass animate-in" style="padding: var(--space-5); margin-bottom: var(--space-6); border-color: rgba(233,30,139,0.15); background: linear-gradient(180deg, rgba(17,17,17,0.7), rgba(10,5,15,0.4))">
        <div class="flex justify-between items-center gap-3" style="margin-bottom: var(--space-4)">
          <div style="display: flex; align-items: center; gap: 8px">
            <span style="font-size: var(--text-lg)">⚔️</span>
            <div>
              <h3 style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-base); color: #fff; margin-bottom: 2px">RIVALRY RADAR</h3>
              <div style="font-size: var(--text-xs); color: var(--text-muted)">Compare stats side-by-side against division competitors</div>
            </div>
          </div>
          ${comparedPlayerIds.length > 0 ? `<button class="btn btn-ghost btn-xs" id="clear-comparison-btn" style="color: var(--text-secondary)">Clear all ✕</button>` : ''}
        </div>
        
        <!-- Selection Controller Bar -->
        ${controllerBarHtml}
        
        <!-- Live Matrix -->
        ${matrixHtml}

        <!-- Scouting Report (Charts & Insights) -->
        ${comparedPlayerIds.length > 0 ? getRivalryScoutingReport(userStats, comparedPlayerIds) : ''}
      </div>
    `
  }

  // ─── Phase-Aware Home Page Rendering ───
  let phaseHypeWidgetHtml = ''
  let beerPairingHtml = ''
  
  // 1. BEER PAIRINGS
  const beerSwigs = {
    WARMUP: {
      name: "Mobtown Session Light Lager",
      desc: "Extremely crisp, clean, and low-ABV. Keeps your hand steady and your focus sharp during physical warm-up rounds.",
      badge: "Warmup Swig — $1 Off"
    },
    LIVE_MATCHES: {
      name: "Hop Hazard Double IPA",
      desc: "Intense, juicy tropical aroma with a heavy hop kick. Calms the nerves when sinking the clutch F1 cups in overtime!",
      badge: "Live Arena Swig — $1 Off"
    },
    POST_GAME_RECAP: {
      name: "Mobtown Canton Pale Ale",
      desc: "Crisp, balanced maltiness with a floral hop finish. The perfect thinking drink to draft your weekly match strategy.",
      badge: "Post-Game Recap Swig"
    }
  }
  
  const activeBeer = beerSwigs[timeState.phase] || beerSwigs.POST_GAME_RECAP
  
  beerPairingHtml = `
    <div class="card card-glass animate-in" style="background: linear-gradient(135deg, rgba(251,191,36,0.05), rgba(249,115,22,0.02)); border-color: rgba(251,191,36,0.18); padding: var(--space-4); margin-bottom: var(--space-6); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4)">
      <div style="display: flex; align-items: center; gap: var(--space-3)">
        <span style="font-size: var(--text-2xl)">🍻</span>
        <div>
          <span class="badge" style="background: rgba(251,191,36,0.1); color: var(--gold-400); font-weight: 800; font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 6px; border-radius: var(--radius-sm)">${activeBeer.badge}</span>
          <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-sm); color: #fff; margin-top: var(--space-1)">PAIRING: ${activeBeer.name}</div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; line-height: 1.4">${activeBeer.desc}</div>
        </div>
      </div>
    </div>
  `

  const commentary = getPhaseCommentary(timeState.phase)
  const commentatorsHtml = `
    <div class="card card-glass animate-in" style="background: rgba(0, 0, 0, 0.35); border-color: rgba(233,30,139,0.15); padding: var(--space-4); margin-bottom: var(--space-6)">
      <div style="font-family: var(--font-display); font-weight: 800; font-size: 10px; color: var(--pink-400); letter-spacing: 0.08em; margin-bottom: var(--space-3); text-transform: uppercase; display:flex; align-items:center; gap:6px">
        🎙️ ESPN8 Broadcast Commentary Desk
      </div>
      <p style="font-style: italic; color: rgba(255,255,255,0.95); line-height: 1.5; font-size: var(--text-xs); margin: 0">
        <strong>Cotton McKnight:</strong> "${commentary.cotton}"<br/><br/>
        <strong>Pepper Reddick:</strong> "${commentary.pepper}"
      </p>
    </div>
  `

  if (timeState.phase === 'WARMUP') {
    const leagueDates = ['2026-05-06','2026-05-13','2026-05-20','2026-05-27','2026-06-03','2026-06-10']
    const targetDateStr = leagueDates[currentWeek - 1] || '2026-05-06'
    const targetTimeLive = new Date(`${targetDateStr}T18:30:00-04:00`)
    
    phaseHypeWidgetHtml = `
      <div class="card card-glass text-center animate-in" style="padding: var(--space-6); background: linear-gradient(135deg, rgba(233,30,139,0.05), rgba(0,0,0,0.2)); border-color: var(--pink-400)30; margin-bottom: var(--space-6); box-shadow: 0 0 20px rgba(233,30,139,0.15)">
        <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--pink-400); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: var(--space-1); display:flex; align-items:center; justify-content:center; gap:6px">
          ⛳ WARMUPS LIVE ON THE TURF!
        </div>
        <div style="font-size:var(--text-xs); color:var(--text-secondary); margin-bottom: var(--space-4)">Official matches start in:</div>
        
        <div class="countdown-timer-display" data-countdown-target="${targetTimeLive.toISOString()}" style="display:flex; justify-content:center; gap:var(--space-3); margin-bottom: var(--space-4)">
          <div class="countdown-unit" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3); min-width:48px">
            <div class="countdown-number" id="countdown-mins" style="font-family:var(--font-mono); font-weight:800; font-size:var(--text-lg); color:#fff">00</div>
            <div style="font-size:7px; color:var(--text-muted); font-weight:700; text-transform:uppercase">Mins</div>
          </div>
          <div class="countdown-unit" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3); min-width:48px">
            <div class="countdown-number" id="countdown-secs" style="font-family:var(--font-mono); font-weight:800; font-size:var(--text-lg); color:var(--pink-400)">00</div>
            <div style="font-size:7px; color:var(--text-muted); font-weight:700; text-transform:uppercase">Secs</div>
          </div>
        </div>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); max-width: 460px; margin: 0 auto; line-height: 1.4; font-style: italic">
          "Captain check-ins are active. Polishing steel shafts and dialing in standard alignments off the concrete carpets. Grab a flight and focus!"
        </p>
      </div>
    `
  }
  else if (timeState.phase === 'LIVE_MATCHES') {
    const weekScheduledMatches = getAllMatches().filter(m => m.weekNumber === currentWeek)
    const activeMatchesRows = weekScheduledMatches.map(m => {
      const ht = getTeam(m.homeTeamId)
      const at = getTeam(m.awayTeamId)
      const isCompleted = m.status === 'completed'
      const isPending = m.status === 'pending_review'
      
      let scoreDisplay = '<span style="font-size:var(--text-xs); color:var(--pink-400); font-weight:800" class="blink-badge">🔴 LIVE PLAY</span>'
      if (isCompleted) {
        scoreDisplay = `<span style="font-weight:800; color:#fff">${m.finalScore.home} - ${m.finalScore.away}</span> <span style="font-size:8px; color:var(--text-muted)">(Final)</span>`
      } else if (isPending) {
        scoreDisplay = `<span style="font-weight:800; color:var(--gold-400)">${m.finalScore.home} - ${m.finalScore.away}</span> <span style="font-size:8px; color:var(--gold-400)">(Pending)</span>`
      }
      
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.03); padding:var(--space-2) 0; font-size:var(--text-xs)">
          <div style="display:flex; align-items:center; gap:6px; flex:1">
            <span class="team-dot" style="background:${ht.color}"></span>
            <span style="font-weight:700; color:#fff">${ht.name}</span>
          </div>
          <div style="flex:1; text-align:center">${scoreDisplay}</div>
          <div style="display:flex; align-items:center; gap:6px; flex:1; justify-content:flex-end">
            <span style="font-weight:700; color:#fff">${at.name}</span>
            <span class="team-dot" style="background:${at.color}"></span>
          </div>
        </div>
      `
    }).join('')

    phaseHypeWidgetHtml = `
      <div class="card card-glass animate-in" style="border-color: var(--pink-400); background: linear-gradient(135deg, rgba(233,30,139,0.08), rgba(0,0,0,0.3)); padding: var(--space-5); margin-bottom: var(--space-6); box-shadow: 0 0 24px rgba(233,30,139,0.2)">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-4)">
          <div style="display:flex; align-items:center; gap:8px">
            <span class="blink-badge" style="display:inline-block; background:var(--pink-400); width:10px; height:10px; border-radius:50%; box-shadow: 0 0 8px var(--pink-400)"></span>
            <h3 style="font-family:var(--font-display); font-weight:900; font-size:var(--text-sm); color:#fff; letter-spacing:0.05em; text-transform:uppercase">BEER-PUTT WEDNESDAY LIVE ARENA</h3>
          </div>
          <span class="badge" style="background:rgba(255,255,255,0.05); font-size:9px; color:var(--text-secondary)">WEEK ${currentWeek} MATCHES</span>
        </div>
        
        <!-- Scoring Grid -->
        <div style="display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.05); padding:var(--space-3) var(--space-4); border-radius:var(--radius-lg); margin-bottom:var(--space-4)">
          ${activeMatchesRows}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px">
          <div style="font-size:var(--text-xs); color:var(--text-secondary); max-width:320px; line-height:1.4">
            Captains, launch your <strong>Scorer Console</strong> to record turns and sync board states in real-time.
          </div>
          <button class="btn btn-primary btn-sm animate-pulse" data-nav="scorer" style="box-shadow:0 0 16px var(--pink-500)30">🎯 Open Scorer Console</button>
        </div>
      </div>
    `
  }
  else { // POST_GAME_RECAP (All other times)
    const hasCompletedMatches = getAllMatches().some(m => m.weekNumber === currentWeek && m.status === 'completed')
    const recapWeekNum = hasCompletedMatches ? currentWeek : Math.max(1, currentWeek - 1)
    const recapMvp = getWeeklyMvp(currentWeek)
    
    let recapMvpHtml = ''
    if (recapMvp) {
      recapMvpHtml = `
        <div style="display:flex; align-items:center; gap:var(--space-3); background:rgba(233,30,139,0.03); border:1px solid rgba(233,30,139,0.15); padding:var(--space-3) var(--space-4); border-radius:var(--radius-lg); margin-top:var(--space-4)" class="animate-in">
          <div class="profile-avatar" style="background:${recapMvp.player.avatarColor}; width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800; font-size:var(--text-xs); border:1px solid var(--pink-400)">
            ${recapMvp.player.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div style="flex:1">
            <div style="font-size:8px; color:var(--pink-400); font-weight:800; letter-spacing:0.05em; text-transform:uppercase">🌟 WEEK ${recapWeekNum} OFFICIAL MVP</div>
            <div style="font-weight:700; color:#fff; font-size:var(--text-sm)">${recapMvp.player.name} (${recapMvp.team?.name || ''})</div>
            <div style="font-size:10px; color:var(--text-secondary)">Delivered a putting performance of <span style="font-weight:700; color:var(--pink-400)">${(recapMvp.accuracy*100).toFixed(0)}% accuracy</span> (${recapMvp.made} sunk). Supreme bar athlete excellence!</div>
          </div>
        </div>
      `
    }
    
    const leagueDates = ['2026-05-06','2026-05-13','2026-05-20','2026-05-27','2026-06-03','2026-06-10']
    const targetDateStr = leagueDates[currentWeek - 1] || '2026-05-06'
    const targetTimeLive = new Date(`${targetDateStr}T18:30:00-04:00`)
    
    phaseHypeWidgetHtml = `
      <!-- Next Week Match Countdown Card -->
      <div class="card card-glass text-center animate-in" style="padding: var(--space-5); background: linear-gradient(135deg, rgba(233,30,139,0.03), rgba(0,0,0,0.25)); border-color: rgba(233,30,139,0.15); margin-bottom: var(--space-5); box-shadow: 0 4px 20px rgba(233,30,139,0.08)">
        <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--pink-400); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: var(--space-2)">
          ⛳ WEEK ${currentWeek} MATCH NIGHT COUNTDOWN
        </div>
        <div style="font-size:var(--text-xs); color:var(--text-secondary); margin-bottom: var(--space-4)">Official matches start in:</div>
        
        <div class="countdown-timer-display" data-countdown-target="${targetTimeLive.toISOString()}" style="display:flex; justify-content:center; gap:var(--space-3); margin-bottom: var(--space-1)">
          <div class="countdown-unit" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3); min-width:54px">
            <div class="countdown-number" id="countdown-days" style="font-family:var(--font-mono); font-weight:800; font-size:var(--text-md); color:#fff">00</div>
            <div style="font-size:7px; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-top:2px">Days</div>
          </div>
          <div class="countdown-unit" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3); min-width:54px">
            <div class="countdown-number" id="countdown-hours" style="font-family:var(--font-mono); font-weight:800; font-size:var(--text-md); color:#fff">00</div>
            <div style="font-size:7px; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-top:2px">Hours</div>
          </div>
          <div class="countdown-unit" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3); min-width:54px">
            <div class="countdown-number" id="countdown-mins" style="font-family:var(--font-mono); font-weight:800; font-size:var(--text-md); color:#fff">00</div>
            <div style="font-size:7px; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-top:2px">Mins</div>
          </div>
          <div class="countdown-unit" style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05); border-radius:var(--radius-lg); padding:var(--space-2) var(--space-3); min-width:54px">
            <div class="countdown-number" id="countdown-secs" style="font-family:var(--font-mono); font-weight:800; font-size:var(--text-md); color:var(--pink-400)">00</div>
            <div style="font-size:7px; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-top:2px">Secs</div>
          </div>
        </div>
      </div>

      <!-- Weekly Recap Card -->
      <div class="card card-glass animate-in" style="border-color: rgba(233,30,139,0.12); padding: var(--space-5); margin-bottom: var(--space-6)">
        <div style="font-family:var(--font-display); font-weight:900; font-size:var(--text-xs); color:var(--pink-400); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:var(--space-2)">📋 WEEK ${recapWeekNum} OFFICIAL RECAP</div>
        <div style="font-size:var(--text-xs); color:var(--text-secondary); line-height:1.4">
          All scorecards are officially verified and locked into the division standings. Tap any completed matchup below to audit the full play-by-play turn charts and trace double sinks.
        </div>
        ${recapMvpHtml}
      </div>
    `
  }

  return `
    <section class="hero">
      <div class="hero-bg"><div class="hero-orb hero-orb-1"></div><div class="hero-orb hero-orb-2"></div><div class="hero-orb hero-orb-3"></div></div>
      <div class="container hero-content">
        <div style="display:flex; justify-content:center; align-items:center; gap:var(--space-3); margin-bottom:var(--space-4)" class="animate-in">
          <img src="/images/puttermore.png" alt="Puttermore" style="height: 64px; width: auto; filter: drop-shadow(0 4px 12px rgba(233,30,139,0.3)); margin-bottom: 0">
          <span style="font-size:24px; opacity:0.3; font-weight:300; color:#fff">×</span>
          <img src="/images/mobtown.jpeg" alt="Mobtown Brewing Co." style="height:64px; width:auto; border-radius:50%; border:2px solid rgba(255,255,255,0.08); background:rgba(0,0,0,0.3); margin-bottom:0; box-shadow: 0 0 15px rgba(233,30,139,0.25)">
        </div>
        <div class="animate-in delay-1"><span class="badge badge-pink">${season.name} · Mobtown active</span></div>
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
          <div class="hero-stat"><span class="hero-stat-value">1</span><span class="hero-stat-label">Active League</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-value">9</span><span class="hero-stat-label">Teams</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-value">22</span><span class="hero-stat-label">Players</span></div>
          <div class="hero-stat-divider"></div>
          <div class="hero-stat"><span class="hero-stat-value">6</span><span class="hero-stat-label">Weeks</span></div>
        </div>
      </div>
    </section>
    <div class="container" style="margin-top: var(--space-4)">
      ${beerPairingHtml}
      ${commentatorsHtml}
      ${phaseHypeWidgetHtml}

      ${userDashboardHtml}
      ${rivalryRadarHtml}

      <!-- Premium Guide Callout -->
      <div class="card card-glass animate-in delay-1" style="border: 1px dashed rgba(251, 191, 36, 0.35); background: rgba(251, 191, 36, 0.02); padding: var(--space-3) var(--space-4); margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); cursor: pointer" data-nav="help">
        <div style="display: flex; align-items: center; gap: var(--space-3)">
          <span style="font-size: var(--text-xl)">📖</span>
          <div>
            <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-sm); color: var(--gold-400)">NEW TO THE TABLE? HOW TO PLAY GUIDE</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary)">Master Double-Sinks, Redemption rules, and get pro putting caddy blueprints!</div>
          </div>
        </div>
        <span style="font-weight: bold; color: var(--gold-400); font-size: var(--text-base)">→</span>
      </div>

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
        <div class="roster-list gap-2">${leadersHtml}</div>
      </section>

      ${upcoming.length ? `
      <section class="home-section animate-in delay-4">
        <div class="section-header"><h3>Upcoming Scheduled</h3><button class="btn btn-ghost btn-sm" data-nav="schedule">Full Schedule →</button></div>
        <div class="flex flex-col gap-3">${upcomingHtml}</div>
      </section>` : ''}
    </div>`
}

export function getHomeTickerText() {
  const timeState = getTimeState()
  const quotes = phaseTickerQuotes[timeState.phase] || phaseTickerQuotes.PRE_GAME_HYPE
  const shuffled = [...quotes].sort(() => Math.random() - 0.5)
  return shuffled.map(q => `"${q}"`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; ")
}
