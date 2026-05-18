import { getAllMatches, getTeam, getTeamRoster, getPlayer, getLeague, getVenue, getAllLeagues } from '../data.js'
import { renderSingleBoard } from '../board.js'
import { HOLES, OT_HOLES } from '../seed.js'
import { saveMatch } from '../store.js'
import { getSelectedLeague, setSelectedLeague } from './home.js'

let scorerState = null
let viewMode = 'side'

function getScorerTickerData() {
  const s = scorerState
  if (!s) {
    return {
      text: "Waiting for game to start... ⚡ Keep your putters warm and your pints filled!",
      badgeText: "🎙️ OCHO SCORER DESK",
      badgeColor: "var(--gold-400)"
    }
  }
  
  if (s.gameOver) {
    return {
      text: `🏆 MATCH COMPLETE: ${s.winner.toUpperCase()} WINS! ⚡ Cotton: A historic bar putting performance! ⚡ Pepper: That's why they get the gold star!`,
      badgeText: "🏆 GAME OVER",
      badgeColor: "var(--pink-500)"
    }
  }

  // Check state
  const homeLeft = s.homeBoardOpen.size
  const awayLeft = s.awayBoardOpen.size
  const diff = Math.abs(homeLeft - awayLeft)
  
  if (s.phase === 'redemption') {
    const quotes = [
      "🚨 REDEMPTION WATCH: A cleared board has triggered the redemption clause! ⚡ Cotton: Can they run the table?",
      "🚨 REDEMPTION WATCH: Pepper: Sinking these cups under this level of taproom pressure is legendary!",
      "🚨 REDEMPTION WATCH: The board is cleared but they need to run the table now! Talk about a high-stakes rescue mission!",
      "🚨 REDEMPTION WATCH: It's redemption time! Yo momma could bounce it off a bar stool, but can they sink it under pressure?"
    ]
    return {
      text: quotes.join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; "),
      badgeText: "🚨 REDEMPTION",
      badgeColor: "var(--gold-400)"
    }
  }
  
  if (s.phase === 'overtime' || s.overtime) {
    const quotes = [
      "⚡ SUDDEN DEATH OVERTIME: Front 3 cups are reopen! Sudden death putting rules are in effect!",
      "⚡ OVERTIME WATCH: My heart is pounding like a subwoofer in the back of a Dundalk civic!",
      "⚡ OVERTIME WATCH: Front 3 cups are reopen and the pressure is at an absolute, boiling-point maximum!"
    ]
    return {
      text: quotes.join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; "),
      badgeText: "⚡ OVERTIME",
      badgeColor: "var(--cyan-400)"
    }
  }
  
  if (homeLeft === 1 && awayLeft === 1) {
    const quotes = [
      "🎯 1v1 SHOOTOUT: Both teams are down to their final cup! ⚡ Cotton: One ball in, one ball out, and someone goes home a hero!",
      "🎯 1v1 SHOOTOUT: Whoever sinks this next F1 cup secures immortality. Or at least free craft beer!",
      "🎯 1v1 SHOOTOUT: A classic 1v1 shootout! Both teams are down to their final cup, Pepper!"
    ]
    return {
      text: quotes.join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; "),
      badgeText: "🎯 1v1 SHOOTOUT",
      badgeColor: "var(--pink-400)"
    }
  }
  
  // Close game in regulation
  const isClose = (homeLeft <= 3 && awayLeft <= 3) || (diff <= 1 && s.turns.length >= 6)
  if (isClose) {
    const quotes = [
      `🎙️ CLOSE GAME: Tight matchup in progress! Score: ${homeLeft} vs ${awayLeft} cups left! ⚡ Cotton: One slip here and it's all over! ⚡ Pepper: Taproom pressure is boiling!`,
      "🎙️ CLOSE GAME: Both teams are feeling the gravity in the room! Sinking these putts requires surgeon-level precision!",
      "🎙️ CLOSE GAME: I haven't seen a tight bar putting match of this caliber since the national rock-paper-scissors tournament!"
    ]
    return {
      text: quotes.join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; "),
      badgeText: "🎙️ TENSE FINISH",
      badgeColor: "var(--gold-400)"
    }
  }

  // Hot streak
  if (s.turns && s.turns.length > 0 && s.turns[s.turns.length - 1].ballBack) {
    return {
      text: "🔥 ON FIRE: A spectacular double-sink ball back in the last turn! ⚡ Cotton: The momentum has completely shifted! ⚡ Pepper: They are rolling like Mr. Trash Wheel in a high tide!",
      badgeText: "🔥 HOT STREAK",
      badgeColor: "var(--pink-400)"
    }
  }

  // Standard play ticker (shuffled general quotes and Yo Momma jokes!)
  const standardQuotes = [
    "Cotton McKnight: That putt was so wide, Pepper, I think it went into the next county!",
    "Pepper Reddick: I've seen better rolls on a stale Dundalk crab cake, Cotton!",
    "Cotton McKnight: A stunning miss! It looks like they forgot their putting eyes at the bottom of their last pint!",
    "Pepper Reddick: He's aiming for the cup but putting like he's trying to hit a Squeegee Boy on the corner, Cotton!",
    "Cotton McKnight: Bold strategy, Cotton. Let's see if missing by three feet pays off for 'em!",
    "Pepper Reddick: If I had a dollar for every missed putt tonight, Cotton, I could buy the entire Heavy Seas brewery!",
    "Cotton McKnight: Barksdale Putters are looking more like Barksdale Benchwarmers on that turn!",
    "Pepper Reddick: That putting stroke was stiffer than a Dundalk dirtbike's suspension, Cotton!",
    "Cotton McKnight: Oh! A tragic rim-out! That ball spun around the cup like a tourist looking for parking in Fells Point!",
    "Pepper Reddick: You can't get that close and not finish, Cotton! It's against the laws of nature and bar-putting!",
    "Cotton McKnight: Pepper, is it just me, or is the turf moving faster than their reaction times tonight?",
    "Pepper Reddick: That ball had so much spin, Cotton, it practically needed its own zip code!",
    "Cotton McKnight: I haven't seen a choke like that since the great Biloxi lawnmower disaster of '96!",
    "Pepper Reddick: That was a catastrophic mechanical failure of the putting arm, Cotton!",
    "Cotton McKnight: Mr. Trash Wheel is crying tears of absolute sorrow watching that putt drift wide!",
    "Pepper Reddick: That ball is trash, Cotton, but not the kind Mr. Trash Wheel likes to eat!",
    "Cotton McKnight: The angle of departure on that putt was completely fictional, Pepper!",
    "Pepper Reddick: He just invented a whole new branch of mathematics, Cotton: Putting Astrology!",
    "Cotton McKnight: Dundee Strokers are looking like they've got butter on their fingers and bricks in their shoes tonight!",
    "Pepper Reddick: They're playing like they're wearing virtual reality headsets tuned to a different game, Cotton!",
    "Cotton McKnight: That was a textbook under-putt, Pepper. Didn't even reach the grass clippings!",
    "Pepper Reddick: Staggering under-performance! My grandma could have sneezed the ball closer to the cup, Cotton!",
    "Cotton McKnight: He's standing over the ball... the sweat is dripping... and... oh, he's hit the wall! Literally, the brick wall behind the table!",
    "Pepper Reddick: That ball traveled in a completely non-Euclidean path, Cotton! Mind-bendingly bad!",
    "Cotton McKnight: They are playing with the urgency of a snail on a coffee break, Pepper.",
    "Pepper Reddick: I think their putter is actually a decorated broomstick, Cotton! That would explain the friction coefficient!",
    "Pepper Reddick: Yo momma is so slow, Cotton, she makes the Dundalk dirtbike speed limit look like land-speed record velocity!",
    "Cotton McKnight: Yo momma's putts are so crooked, she could bounce a golf ball off a round table and still hit the bartender!",
    "Pepper Reddick: Yo momma is so short, Cotton, she uses the front cup (F1) as a hot tub!",
    "Cotton McKnight: Yo momma is so heavy, when she stepped on the Mobtown turf, she triggered an artificial earthquake in East Baltimore!",
    "Pepper Reddick: Yo momma is so bad at putting, she missed the entire brewery and accidentally registered for a bowling league!",
    "Cotton McKnight: Yo momma's eyesight is so poor, Pepper, she mistook Mr. Trash Wheel for a giant floating putting cup!",
    "Pepper Reddick: Yo momma is so old, she played putting games with George Washington at the historic Fells Point tavern, Cotton!",
    "Cotton McKnight: Yo momma is so lazy, she expects a ball back even when she misses the board entirely!",
    "Pepper Reddick: Yo momma's putting stroke is so shaky, Cotton, she looks like she's holding a paint mixer!",
    "Cotton McKnight: Yo momma is so confusing, she tries to pay the Squeegee Boys with Monopoly money!",
    "Pepper Reddick: Yo momma is so loud, when she sinks a cup, they can hear her screaming all the way in Salisbury, Cotton!",
    "Cotton McKnight: Yo momma is so clumsy, she tripped over the side cushion and spilled three pitchers of craft IPA!"
  ]
  
  // Shuffle standard quotes
  const shuffled = standardQuotes.sort(() => Math.random() - 0.5).slice(0, 12)
  return {
    text: shuffled.map(q => `"${q}"`).join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; "),
    badgeText: "🎙️ LIVE SCORER TICKER",
    badgeColor: "var(--gold-400)"
  }
}

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

  // Render boards — invert bottom board when stacked so cups face each other
  const isStacked = viewMode === 'stacked'
  const homeBoardHtml = renderSingleBoard(s.homeName, s.homeColor, s.homeBoardClaimed, s.awayColor, {
    interactive: !s.gameOver && targetBoardId === 'home',
    active: !s.gameOver && targetBoardId === 'home', overtime: isOT, boardId: 'home'
  })
  const awayBoardHtml = renderSingleBoard(s.awayName, s.awayColor, s.awayBoardClaimed, s.homeColor, {
    interactive: !s.gameOver && targetBoardId === 'away',
    active: !s.gameOver && targetBoardId === 'away', overtime: isOT, boardId: 'away',
    inverted: isStacked
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

    ${(() => {
      const ticker = getScorerTickerData()
      return `<div class="ocho-ticker animate-in delay-1" style="margin: 0 auto var(--space-4) auto; max-width: 680px; display: flex; align-items: center; gap: var(--space-3); background: rgba(251, 191, 36, 0.08); border: 1px dashed rgba(251, 191, 36, 0.3); padding: var(--space-2) var(--space-4); border-radius: var(--radius-xl); font-size: var(--text-xs); color: #fff; box-shadow: 0 4px 16px rgba(251, 191, 36, 0.04)">
        <span class="badge" id="scorer-ticker-badge" style="background: ${ticker.badgeColor}; color: #000; font-weight: 800; font-family: var(--font-display); letter-spacing: 0.05em; padding: 2px 8px; flex-shrink: 0; box-shadow: 0 0 8px rgba(251,191,36,0.3); transition: all 0.3s ease">${ticker.badgeText}</span>
        <marquee id="scorer-ticker-marquee" scrollamount="4.5" style="font-style: italic; color: rgba(255,255,255,0.9); width: 100%">${ticker.text}</marquee>
      </div>`
    })()}

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

    <div class="mt-4 flex items-center justify-center gap-3">
      <button class="btn btn-ghost" id="scorer-reset-btn">← New Game</button>
      <button class="btn btn-secondary btn-sm" id="trash-talk-btn" style="border: 1px dashed var(--gold-400); background: rgba(251,191,36,0.06); color: var(--gold-400)">🌶️ Trash Talk</button>
    </div>
    <div id="ball-back-toast" class="ball-back-toast">🔥 BALL BACK!</div>
    
    <div id="trash-talk-toast" class="trash-talk-toast" style="position: fixed; bottom: 85px; left: 50%; transform: translateX(-50%) translateY(20px); background: rgba(13, 13, 13, 0.98); border: 2px solid var(--gold-400); padding: var(--space-3) var(--space-4); border-radius: var(--radius-xl); font-size: var(--text-sm); line-height: 1.5; color: #fff; width: 90%; max-width: 440px; box-shadow: 0 8px 32px rgba(251,191,36,0.3); backdrop-filter: blur(12px); opacity: 0; visibility: hidden; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 9999">
      <div style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--gold-400); letter-spacing: 0.05em; margin-bottom: var(--space-1); display: flex; align-items: center; gap: 6px">
        🌶️ OCHO TRASH TALK & YO MOMMA DESK
      </div>
      <div id="trash-talk-content" style="font-style: italic; opacity: 0.95"></div>
    </div>
  </div>`
}

function checkCloseGameBanter() {
  const s = scorerState
  if (!s || s.gameOver) return

  const homeLeft = s.homeBoardOpen.size
  const awayLeft = s.awayBoardOpen.size
  const diff = Math.abs(homeLeft - awayLeft)
  
  // A game is close if both have 3 or fewer cups left, or they are within 1 cup past turn 6, or in redemption/overtime
  const isClose = (homeLeft <= 3 && awayLeft <= 3) || (diff <= 1 && s.turns.length >= 6) || s.phase === 'redemption' || s.phase === 'overtime' || s.overtime
  
  if (isClose) {
    // 35% chance to automatically trigger Pepper/Cotton banter alert on turn completion
    if (Math.random() < 0.35) {
      setTimeout(() => {
        triggerTrashTalk()
      }, 1000)
    }
  }
}

function triggerTrashTalk() {
  const s = scorerState
  let selectedQuotes = []
  
  if (s) {
    if (s.phase === 'redemption') {
      selectedQuotes = [
        "Cotton McKnight: Holy putting grass, Pepper, we are in REDEMPTION! The tension is high enough to snap a carbon-fiber shaft!",
        "Pepper Reddick: Absolutely, Cotton! One mistake here and they'll be buying the next round in total silence! This is real taproom drama!",
        "Cotton McKnight: The board is cleared but they need to run the table now! Talk about a high-stakes rescue mission!",
        "Pepper Reddick: It's redemption time! Yo momma could bounce it off a bar stool, but can they sink it under pressure?"
      ]
    } else if (s.phase === 'overtime' || s.overtime) {
      selectedQuotes = [
        "Cotton McKnight: OVERTIME, Pepper! Settle in, folks, because we are in sudden death putting territory!",
        "Pepper Reddick: Sudden death, Cotton! My heart is pounding like a subwoofer in the back of a Dundalk civic!",
        "Cotton McKnight: Front 3 cups are reopen and the pressure is at an absolute, boiling-point maximum!"
      ]
    } else if (s.homeBoardOpen && s.awayBoardOpen && s.homeBoardOpen.size === 1 && s.awayBoardOpen.size === 1) {
      selectedQuotes = [
        "Cotton McKnight: A classic 1v1 shootout! Both teams are down to their final cup, Pepper!",
        "Pepper Reddick: It is a absolute duel to the death! One ball in, one ball out, and someone goes home a hero!",
        "Cotton McKnight: Whoever sinks this next F1 cup secures immortality. Or at least free craft beer!"
      ]
    } else if (s.turns && s.turns.length > 0 && s.turns[s.turns.length - 1].ballBack) {
      selectedQuotes = [
        "Cotton McKnight: They are heating up, Pepper! A spectacular double-sink ball back in their last turn!",
        "Pepper Reddick: They are on a absolute tear! The ball is sticking to that cup like honey on a biscuit!",
        "Cotton McKnight: The momentum has completely shifted! This team is rolling like Mr. Trash Wheel in a high tide!"
      ]
    }
  }
  
  // If no high-stakes match state is detected, fallback to the massive database of classic trash talk and Baltimore Yo Momma jokes!
  if (selectedQuotes.length === 0) {
    selectedQuotes = [
      "Cotton McKnight: That putt was so wide, Pepper, I think it went into the next county!",
      "Pepper Reddick: I've seen better rolls on a stale Dundalk crab cake, Cotton!",
      "Cotton McKnight: A stunning miss! It looks like they forgot their putting eyes at the bottom of their last pint!",
      "Pepper Reddick: He's aiming for the cup but putting like he's trying to hit a Squeegee Boy on the corner, Cotton!",
      "Cotton McKnight: Bold strategy, Cotton. Let's see if missing by three feet pays off for 'em!",
      "Pepper Reddick: If I had a dollar for every missed putt tonight, Cotton, I could buy the entire Heavy Seas brewery!",
      "Cotton McKnight: Barksdale Putters are looking more like Barksdale Benchwarmers on that turn!",
      "Pepper Reddick: That putting stroke was stiffer than a Dundalk dirtbike's suspension, Cotton!",
      "Cotton McKnight: Oh! A tragic rim-out! That ball spun around the cup like a tourist looking for parking in Fells Point!",
      "Pepper Reddick: You can't get that close and not finish, Cotton! It's against the laws of nature and bar-putting!",
      "Cotton McKnight: Pepper, is it just me, or is the turf moving faster than their reaction times tonight?",
      "Pepper Reddick: That ball had so much spin, Cotton, it practically needed its own zip code!",
      "Cotton McKnight: I haven't seen a choke like that since the great Biloxi lawnmower disaster of '96!",
      "Pepper Reddick: That was a catastrophic mechanical failure of the putting arm, Cotton!",
      "Cotton McKnight: Mr. Trash Wheel is crying tears of absolute sorrow watching that putt drift wide!",
      "Pepper Reddick: That ball is trash, Cotton, but not the kind Mr. Trash Wheel likes to eat!",
      "Cotton McKnight: The angle of departure on that putt was completely fictional, Pepper!",
      "Pepper Reddick: He just invented a whole new branch of mathematics, Cotton: Putting Astrology!",
      "Cotton McKnight: Dundee Strokers are looking like they've got butter on their fingers and bricks in their shoes tonight!",
      "Pepper Reddick: They're playing like they're wearing virtual reality headsets tuned to a different game, Cotton!",
      "Cotton McKnight: That was a textbook under-putt, Pepper. Didn't even reach the grass clippings!",
      "Pepper Reddick: Staggering under-performance! My grandma could have sneezed the ball closer to the cup, Cotton!",
      "Cotton McKnight: He's standing over the ball... the sweat is dripping... and... oh, he's hit the wall! Literally, the brick wall behind the table!",
      "Pepper Reddick: That ball traveled in a completely non-Euclidean path, Cotton! Mind-bendingly bad!",
      "Cotton McKnight: They are playing with the urgency of a snail on a coffee break, Pepper.",
      "Pepper Reddick: I think their putter is actually a decorated broomstick, Cotton! That would explain the friction coefficient!",
      "Pepper Reddick: Yo momma is so slow, Cotton, she makes the Dundalk dirtbike speed limit look like land-speed record velocity!",
      "Cotton McKnight: Yo momma's putts are so crooked, she could bounce a golf ball off a round table and still hit the bartender!",
      "Pepper Reddick: Yo momma is so short, Cotton, she uses the front cup (F1) as a hot tub!",
      "Cotton McKnight: Yo momma is so heavy, when she stepped on the Mobtown turf, she triggered an artificial earthquake in East Baltimore!",
      "Pepper Reddick: Yo momma is so bad at putting, she missed the entire brewery and accidentally registered for a bowling league!",
      "Cotton McKnight: Yo momma's eyesight is so poor, Pepper, she mistook Mr. Trash Wheel for a giant floating putting cup!",
      "Pepper Reddick: Yo momma is so old, she played putting games with George Washington at the historic Fells Point tavern, Cotton!",
      "Cotton McKnight: Yo momma is so lazy, she expects a ball back even when she misses the board entirely!",
      "Pepper Reddick: Yo momma's putting stroke is so shaky, Cotton, she looks like she's holding a paint mixer!",
      "Cotton McKnight: Yo momma is so confusing, she tries to pay the Squeegee Boys with Monopoly money!",
      "Pepper Reddick: Yo momma is so loud, when she sinks a cup, they can hear her screaming all the way in Salisbury, Cotton!",
      "Cotton McKnight: Yo momma is so clumsy, she tripped over the side cushion and spilled three pitchers of craft IPA!"
    ]
  }
  
  const randomQuote = selectedQuotes[Math.floor(Math.random() * selectedQuotes.length)]
  
  const contentEl = document.getElementById('trash-talk-content')
  const toastEl = document.getElementById('trash-talk-toast')
  if (contentEl && toastEl) {
    contentEl.innerHTML = `"${randomQuote}"`
    toastEl.style.opacity = '1'
    toastEl.style.visibility = 'visible'
    toastEl.style.transform = 'translateX(-50%) translateY(0)'
    
    // Auto fade-out after 5.5 seconds
    if (window.trashTalkTimeout) clearTimeout(window.trashTalkTimeout)
    window.trashTalkTimeout = setTimeout(() => {
      toastEl.style.opacity = '0'
      toastEl.style.visibility = 'hidden'
      toastEl.style.transform = 'translateX(-50%) translateY(20px)'
    }, 5500)
  }
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
  if (target.id === 'trash-talk-btn') {
    triggerTrashTalk(); return true
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
  checkCloseGameBanter()
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
    checkCloseGameBanter()
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
