import { getAllMatches, getTeam, getTeamRoster, getPlayer, getLeague, getVenue, getAllLeagues, getAllTeams, getLeagueTeams, getHoleShortName } from '../data.js'
import { renderSingleBoard, isIslandCup, getIslandCups } from '../board.js'
import { HOLES, OT_HOLES } from '../seed.js'
import { saveMatch, getLoggedInUser, createMatch, quickScoreMatch } from '../store.js'
import { getSelectedLeague, setSelectedLeague } from './home.js'

let scorerState = null
let scorerHistory = []
let viewMode = 'side'
let pendingMatchId = null    // Set when captain picks opponent but hasn't chosen scoring mode
let quickScoreState = null   // Set when in quick score entry mode

export function getScorerTickerData() {
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
    const otLabel = s.overtimeCount > 1 ? (s.overtimeCount === 2 ? 'DOUBLE OVERTIME' : s.overtimeCount === 3 ? 'TRIPLE OVERTIME' : `${s.overtimeCount}x OVERTIME`) : 'OVERTIME'
    const quotes = [
      `⚡ SUDDEN DEATH ${otLabel}: Front 3 cups are reopen! Sudden death putting rules are in effect!`,
      `⚡ ${otLabel} WATCH: My heart is pounding like a subwoofer in the back of a Dundalk civic!`,
      `⚡ ${otLabel} WATCH: Front 3 cups are reopen and the pressure is at an absolute, boiling-point maximum!`
    ]
    return {
      text: quotes.join(" &nbsp;&nbsp;&nbsp;&nbsp; ⚡ &nbsp;&nbsp;&nbsp;&nbsp; "),
      badgeText: `⚡ ${otLabel}`,
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
  // ─── Quick Score Entry Mode ───
  if (quickScoreState) {
    return renderQuickScoreEntry()
  }

  // ─── Scoring Mode Choice ───
  if (pendingMatchId) {
    return renderScoringModeChoice()
  }

  if (!scorerState) {
    const leagueId = getSelectedLeague()
    const league = getLeague(leagueId)
    const venue = getVenue(league.venueId)
    const scheduled = getAllMatches().filter(m => m.leagueId === leagueId && m.status === 'scheduled')

    const loggedIn = getLoggedInUser()
    const captainTeam = loggedIn ? getAllTeams().find(t => t.captainPlayerId === loggedIn.id) : null

    let myNextMatch = null
    if (captainTeam) {
      const teamScheduled = getAllMatches().filter(m => 
        m.leagueId === leagueId &&
        m.status === 'scheduled' && 
        (m.homeTeamId === captainTeam.id || m.awayTeamId === captainTeam.id)
      ).sort((a, b) => a.weekNumber - b.weekNumber)
      myNextMatch = teamScheduled[0] || null
    }

    let clearanceBannerHtml = ''
    if (!loggedIn) {
      clearanceBannerHtml = `
        <div class="turn-indicator animate-in" style="background:rgba(239,68,68,0.06); border-color:var(--red-500); color:var(--red-400); font-size:var(--text-xs); margin-bottom:var(--space-4); text-align:center">
          🔒 <strong>SPECTATOR ACCESS ONLY</strong>: Please log in as a Team Captain to start an official scoring session.
        </div>
      `
    } else if (!captainTeam) {
      clearanceBannerHtml = `
        <div class="turn-indicator animate-in" style="background:rgba(239,68,68,0.06); border-color:var(--red-500); color:var(--red-400); font-size:var(--text-xs); margin-bottom:var(--space-4); text-align:center">
          🔒 <strong>RESTRICTED DESK</strong>: Authenticated as ${loggedIn.name}. Only official Team Captains are authorized to start scoring sessions.
        </div>
      `
    } else {
      clearanceBannerHtml = `
        <div class="turn-indicator animate-in" style="background:rgba(34,197,94,0.06); border-color:var(--green-500); color:var(--green-400); font-size:var(--text-xs); margin-bottom:var(--space-4); text-align:center">
          🧢 <strong>CAPTAIN DESK ACTIVE</strong>: Authenticated as ${loggedIn.name} (${captainTeam.name} Captain).
        </div>
      `
    }

    const leagueTabs = getAllLeagues().map(l => {
      const v = getVenue(l.venueId)
      const isActive = l.id === leagueId
      return `<button class="league-tab ${isActive ? 'active' : ''}" data-league="${l.id}" style="${isActive ? `background:${v.color}15;border-color:${v.color};color:${v.color}` : ''}">
        <span class="league-tab-name">${v.shortName}</span>
        <span class="league-tab-day">${l.day}s</span>
      </button>`
    }).join('')

    // Open Play: Captain picks their opponent
    let openPlayHtml = ''
    if (captainTeam) {
      const otherTeams = getLeagueTeams(leagueId).filter(t => t.id !== captainTeam.id)
      openPlayHtml = `
        <section class="animate-in delay-1" style="margin-bottom:var(--space-6)">
          <div class="section-header"><h3>⚡ Open Play</h3><span class="badge badge-win" style="font-size:9px">Pick Opponent</span></div>
          <div class="card" style="padding:var(--space-4);border-color:rgba(34,197,94,0.15);background:rgba(34,197,94,0.02)">
            <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3)">Select your opponent to start scoring immediately. No schedule needed!</p>
            <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);flex-wrap:wrap">
              <div style="display:flex;align-items:center;gap:8px;padding:var(--space-2) var(--space-3);background:rgba(255,255,255,0.03);border-radius:var(--radius-md);border:1px solid rgba(255,255,255,0.06)">
                <span class="team-dot" style="background:${captainTeam.color}"></span>
                <span style="font-weight:700;font-size:var(--text-sm)">${captainTeam.name}</span>
                <span class="text-muted" style="font-size:var(--text-xs)">vs</span>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-2)">
              ${otherTeams.map(t => `
                <button class="match-pick-item" data-open-play-opponent="${t.id}" style="padding:var(--space-3);border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.02);border-radius:var(--radius-lg);cursor:pointer;display:flex;align-items:center;gap:10px;transition:all 0.15s ease">
                  <span class="team-dot" style="background:${t.color};width:12px;height:12px"></span>
                  <span style="font-weight:600;font-size:var(--text-sm);color:var(--text-primary)">${t.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </section>
      `
    } else if (!loggedIn) {
      openPlayHtml = `
        <section class="animate-in delay-1" style="margin-bottom:var(--space-6)">
          <div class="card" style="padding:var(--space-6);text-align:center;border-color:rgba(239,68,68,0.15);background:rgba(239,68,68,0.02)">
            <div style="font-size:var(--text-xl);margin-bottom:var(--space-2)">🔒</div>
            <h4 style="font-weight:800;color:#fff;margin-bottom:var(--space-1)">Log in to Score</h4>
            <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3)">Log in as a Team Captain to start a scoring session.</p>
            <button class="btn btn-primary btn-sm" data-nav="login">Log In →</button>
          </div>
        </section>
      `
    } else {
      openPlayHtml = `
        <section class="animate-in delay-1" style="margin-bottom:var(--space-6)">
          <div class="card" style="padding:var(--space-6);text-align:center;border-color:rgba(239,68,68,0.15);background:rgba(239,68,68,0.02)">
            <div style="font-size:var(--text-xl);margin-bottom:var(--space-2)">🧢</div>
            <h4 style="font-weight:800;color:#fff;margin-bottom:var(--space-1)">Captain Access Required</h4>
            <p style="font-size:var(--text-xs);color:var(--text-secondary)">Only designated Team Captains can start scoring sessions.</p>
          </div>
        </section>
      `
    }

    // Scheduled matches (secondary)
    let scheduledHtml = ''
    if (scheduled.length && captainTeam) {
      const scheduledCards = scheduled.filter(m => 
        m.homeTeamId === captainTeam.id || m.awayTeamId === captainTeam.id
      ).map(m => {
        const h = getTeam(m.homeTeamId), a = getTeam(m.awayTeamId)
        return `<button class="match-pick-item" data-match-id="${m.id}" style="padding:var(--space-2) var(--space-3)">
          <span class="match-pick-teams">
            <span class="team-dot" style="background:${h.color}"></span>
            <span class="match-pick-name">${h.name}</span>
            <span class="match-pick-vs">vs</span>
            <span class="match-pick-name">${a.name}</span>
            <span class="team-dot" style="background:${a.color}"></span>
          </span>
          <span style="font-size:var(--text-xs);color:var(--text-muted)">Wk ${m.weekNumber}</span>
        </button>`
      }).join('')

      if (scheduledCards) {
        scheduledHtml = `
          <section class="animate-in delay-2">
            <div class="section-header"><h3>📅 Your Scheduled Matches</h3></div>
            <div class="match-pick-list" style="margin-top:0">${scheduledCards}</div>
          </section>
        `
      }
    }

    return `<div class="page container">
      <div class="page-header animate-in"><h1>🎯 Live Scorer</h1><p>Pick your opponent and start scoring</p></div>
      <div class="league-tabs animate-in" style="justify-content:center">${leagueTabs}</div>
      <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
      ${openPlayHtml}
      ${scheduledHtml}
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
  let activePutterName = ''
  if (s.pendingIslandBonus) {
    const bonusPutter = getPlayer(s.islandPutterId)
    const bonusName = bonusPutter?.name?.split(' ')[0] || '?'
    activePutterName = bonusName
    putterDisplay = `<div class="turn-indicator animate-in" style="--team-color: #fbbf24">
      <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2); margin-bottom:var(--space-2)">
        <span class="blink-badge"></span>
        <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:#fbbf24; font-weight:800">🏝️ ISLAND BONUS</span>
      </div>
      <h2 style="font-family:var(--font-display); font-weight:900; font-size:var(--text-2xl); color:#fbbf24; margin:0 0 var(--space-1) 0; line-height:1.2">
        TAP A CUP TO CLAIM!
      </h2>
      <div style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary); margin-bottom:var(--space-2)">
        ${bonusName} sank the island <strong style="color:#fbbf24">${getHoleShortName(s.islandHoleMade)}</strong> — pick any open cup as a bonus!
      </div>
    </div>`
  } else if (!s.gameOver) {
    const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)
    const currentPutter = putters[s.currentPutterIdx] || putters[0]
    activePutterName = currentPutter ? currentPutter.name.split(' ')[0] : '?'

    if (isRedemption) {
      const activePutterIdx = s.redemptionPutterIdx % putters.length
      const activeRedemptionPutter = putters[activePutterIdx]
      const putterListHtml = putters.map((p, idx) => {
        const isActive = idx === activePutterIdx
        return `<span class="putter-badge ${isActive ? 'active-putter' : ''}" style="${isActive ? `--team-color:${currentColor}` : 'opacity:0.35'}">
          ${isActive ? '🎯 ' : ''}${p.name}${isActive ? '' : ''}
        </span>`
      }).join(' <span class="text-muted" style="font-size:10px;margin:0 4px">→</span> ')

      const commentaryHtml = s.activeCommentary ? `
        <div class="announcer-commentary-bubble" id="scorer-commentary-trigger">
          <div class="announcer-commentary-header">
            <span>🎙️ cotton & pepper live</span>
            <button class="announcer-reroll-btn" id="scorer-commentary-reroll" title="Get new commentary">🔄</button>
          </div>
          <div class="announcer-commentary-text">"${s.activeCommentary}"</div>
        </div>
      ` : ''

      putterDisplay = `<div class="turn-indicator animate-in" style="--team-color: var(--gold-400)">
        <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2); margin-bottom:var(--space-2)">
          <span class="blink-badge"></span>
          <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold-400); font-weight:800">⚡ REDEMPTION — SHOOT TIL YOU MISS</span>
        </div>
        <h2 style="font-family:var(--font-display); font-weight:900; font-size:var(--text-2xl); color:${currentColor}; text-shadow:0 0 16px ${currentColor}25; margin:0 0 var(--space-1) 0; line-height:1.2">
          ${currentTeamName.toUpperCase()}
        </h2>
        <div style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary); margin-bottom:var(--space-3)">
          putting at <strong style="color:#fff">${targetBoardId === 'home' ? s.homeName : s.awayName}'s cups</strong>
        </div>
        <div style="display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:var(--space-1); margin-top:var(--space-2)">
          ${putterListHtml}
        </div>
        <div style="font-size:11px; color:var(--text-secondary); margin-top:var(--space-2); font-weight:600">
          🎯 Now Putting: <span style="color:${currentColor}; font-weight:800">${activeRedemptionPutter?.name || '?'}</span>
        </div>
        <div style="font-size:var(--text-xs); color:var(--gold-400); margin-top:var(--space-3); font-weight:700">
          ⚠️ Make it = shoot again! Miss = next player. All miss = game over!
        </div>
        ${commentaryHtml}
      </div>`
    } else {
      const isStartOfGame = s.turns.length === 0 && s.currentTurnPutts.length === 0
      let selectorHtml = ''
      if (isStartOfGame) {
        const renderOrderList = (teamId, teamName, teamColor, players) => {
          const listHtml = players.map((p, idx) => {
            const num = idx + 1
            const upBtn = idx > 0 ? `<button class="btn btn-secondary btn-xs scorer-move-player" data-team-id="${teamId}" data-player-id="${p.id}" data-dir="up" style="padding:1px 6px; font-size:9px; border-radius:var(--radius-sm)">↑</button>` : ''
            const downBtn = idx < players.length - 1 ? `<button class="btn btn-secondary btn-xs scorer-move-player" data-team-id="${teamId}" data-player-id="${p.id}" data-dir="down" style="padding:1px 6px; font-size:9px; border-radius:var(--radius-sm)">↓</button>` : ''
            return `
              <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:4px 10px; border-radius:var(--radius-md); gap:var(--space-2)">
                <span style="font-size:var(--text-xs); font-weight:700; color:var(--text-secondary)">${num}. <strong style="color:#fff; margin-left:2px">${p.name.split(' ')[0]}</strong></span>
                <div style="display:flex; gap:3px">${upBtn}${downBtn}</div>
              </div>
            `
          }).join('')

          return `
            <div style="display:flex; flex-direction:column; gap:var(--space-1.5); flex:1; min-width:140px">
              <span style="font-size:10px; color:${teamColor}; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; text-align:center">${teamName} Order</span>
              ${listHtml}
            </div>
          `
        }

        const homeOrderHtml = renderOrderList('home', s.homeName, s.homeColor, s.homePlayers)
        const awayOrderHtml = renderOrderList('away', s.awayName, s.awayColor, s.awayPlayers)

        selectorHtml = `
          <div style="margin-top:var(--space-4); padding-top:var(--space-3); border-top:1px dashed rgba(255,255,255,0.15); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--space-3)">
            <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2)">
              <span style="font-size:var(--text-xs); color:var(--text-secondary); font-weight:600">Which team goes first?</span>
              <button class="btn btn-secondary btn-sm" id="scorer-start-home" style="border-radius:var(--radius-full); font-size:10px; padding:2px 8px; font-weight:800; ${s.currentTeam === 'home' ? `background:${s.homeColor}20; border-color:${s.homeColor}; color:${s.homeColor}` : 'opacity:0.6'}">${s.homeName}</button>
              <button class="btn btn-secondary btn-sm" id="scorer-start-away" style="border-radius:var(--radius-full); font-size:10px; padding:2px 8px; font-weight:800; ${s.currentTeam === 'away' ? `background:${s.awayColor}20; border-color:${s.awayColor}; color:${s.awayColor}` : 'opacity:0.6'}">${s.awayName}</button>
            </div>
            <div style="display:flex; justify-content:center; gap:var(--space-4); width:100%; max-width:400px; flex-wrap:wrap">
              ${homeOrderHtml}
              ${awayOrderHtml}
            </div>
          </div>
        `
      }

      const nextPutter = putters[s.currentPutterIdx]?.name || '?'
      const putterListHtml = putters.map((p, idx) => {
        const isActive = idx === s.currentPutterIdx
        return `<span class="putter-badge ${isActive ? 'active-putter' : ''}" style="${isActive ? `--team-color:${currentColor}` : 'opacity:0.5'}">
          ${isActive ? '🎯 ' : ''}${p.name}
        </span>`
      }).join(' <span class="text-muted" style="font-size:10px;margin:0 4px">and</span> ')

      const commentaryHtml = s.activeCommentary ? `
        <div class="announcer-commentary-bubble" id="scorer-commentary-trigger">
          <div class="announcer-commentary-header">
            <span>🎙️ cotton & pepper live</span>
            <button class="announcer-reroll-btn" id="scorer-commentary-reroll" title="Get new commentary">🔄</button>
          </div>
          <div class="announcer-commentary-text">"${s.activeCommentary}"</div>
        </div>
      ` : ''

      putterDisplay = `<div class="turn-indicator animate-in" style="--team-color:${currentColor}">
        <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2); margin-bottom:var(--space-2)">
          <span class="blink-badge"></span>
          <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); font-weight:800">ACTIVE TURN STATE</span>

        </div>
        <h2 style="font-family:var(--font-display); font-weight:900; font-size:var(--text-2xl); color:${currentColor}; text-shadow:0 0 16px ${currentColor}25; margin:0 0 var(--space-1) 0; line-height:1.2">
          ${currentTeamName.toUpperCase()}
        </h2>
        <div style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary); margin-bottom:var(--space-3)">
          putting at <strong style="color:#fff">${targetBoardId === 'home' ? s.homeName : s.awayName}'s cups</strong>
        </div>
        <div style="display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:var(--space-1); margin-top:var(--space-2)">
          ${putterListHtml}
        </div>
        <div style="font-size:11px; color:var(--text-secondary); margin-top:var(--space-2); font-weight:600">
          Up Next: <span style="color:${currentColor}; font-weight:800">${nextPutter}</span>
        </div>
        ${commentaryHtml}
        ${selectorHtml}
      </div>`
    }
  }

  // Render boards — invert bottom board when stacked so cups face each other
  const isStacked = viewMode === 'stacked'
  // Compute island cups for the active target board
  const targetOpenCups = targetBoardId === 'home' ? s.homeBoardOpen : s.awayBoardOpen
  const activeIslandCups = (!s.gameOver && !s.pendingIslandBonus) ? new Set(getIslandCups(targetOpenCups)) : new Set()

  const homeBoardHtml = renderSingleBoard(s.homeName, s.homeColor, s.homeBoardClaimed, s.awayColor, {
    interactive: !s.gameOver && !s.pendingIslandBonus && targetBoardId === 'home',
    active: !s.gameOver && targetBoardId === 'home', overtime: isOT, boardId: 'home',
    islandCups: targetBoardId === 'home' ? activeIslandCups : new Set(),
    bonusPickMode: s.pendingIslandBonus && targetBoardId === 'home',
  })
  const awayBoardHtml = renderSingleBoard(s.awayName, s.awayColor, s.awayBoardClaimed, s.homeColor, {
    interactive: !s.gameOver && !s.pendingIslandBonus && targetBoardId === 'away',
    active: !s.gameOver && targetBoardId === 'away', overtime: isOT, boardId: 'away',
    inverted: isStacked,
    islandCups: targetBoardId === 'away' ? activeIslandCups : new Set(),
    bonusPickMode: s.pendingIslandBonus && targetBoardId === 'away',
  })

  const viewClass = viewMode === 'focused' ? 'focused' : viewMode === 'stacked' ? 'stacked' : ''

  // Turn log
  const turnLogHtml = s.turns.slice().reverse().slice(0, 12).map(t => {
    const team = getTeam(t.teamId)
    const phaseTag = t.redemption ? '<span class="badge badge-gold" style="font-size:8px">RDM</span> ' : t.overtime ? '<span class="badge badge-cyan" style="font-size:8px">OT</span> ' : ''
    const islandTag = t.putts?.some(p => p.island) ? '<span class="badge" style="font-size:8px;background:rgba(251,191,36,0.15);color:#fbbf24;border:1px solid rgba(251,191,36,0.3)">🏝️ ISL</span> ' : ''
    return `<div class="turn-entry">
      <span class="turn-num">#${t.turnNumber}</span>
      <span class="team-dot" style="background:${team.color}"></span>
      <span style="flex:1">${phaseTag}${islandTag}${t.putts.map(p => {
        const name = getPlayer(p.playerId)?.name?.split(' ')[0] || '?'
        const holeLabel = getHoleShortName(p.hole)
        const bonusLabel = p.bonusCup ? ` <span style="color:#fbbf24;font-size:9px">(+${getHoleShortName(p.bonusCup)})</span>` : ''
        return `${name}: ${p.made ? '✅ ' + holeLabel + bonusLabel : '❌'}`
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
    <div class="animate-in" style="display:flex;align-items:center;justify-content:center;gap:var(--space-3);margin-bottom:var(--space-3)">
      <span class="badge badge-pink" style="font-size:10px;font-weight:800">Game ${s.gameNumber} of 3</span>
      <span style="font-size:11px;color:var(--text-muted);font-weight:700">Series: <span style="color:${s.homeColor}">${s.seriesScore.home}</span> – <span style="color:${s.awayColor}">${s.seriesScore.away}</span></span>
    </div>

    ${(() => {
      const loggedIn = getLoggedInUser()
      const isHomeCaptain = loggedIn && s.homeTeamId && getTeam(s.homeTeamId)?.captainPlayerId === loggedIn.id
      const isAwayCaptain = loggedIn && s.awayTeamId && getTeam(s.awayTeamId)?.captainPlayerId === loggedIn.id
      const isMatchCaptain = isHomeCaptain || isAwayCaptain

      if (!s.gameOver) {
        if (loggedIn && isMatchCaptain) {
          return `<div class="turn-indicator animate-in" style="background:rgba(34,197,94,0.06);border-color:var(--green-500);color:var(--green-400);font-size:var(--text-xs);margin-bottom:var(--space-4)">
            🧢 <strong>CAPTAIN MODE</strong>: Authenticated as ${loggedIn.name} (${isHomeCaptain ? s.homeName : s.awayName} Captain)
          </div>`
        } else if (loggedIn) {
          return `<div class="turn-indicator animate-in" style="background:rgba(251,191,36,0.06);border-color:var(--gold-400);color:var(--gold-400);font-size:var(--text-xs);margin-bottom:var(--space-4)">
            🔒 <strong>SPECTATOR MODE</strong>: You are logged in as ${loggedIn.name}. Captain scoring override active for testing!
          </div>`
        } else {
          return `<div class="turn-indicator animate-in" style="background:rgba(255,255,255,0.03);border-color:var(--border-subtle);color:var(--text-secondary);font-size:var(--text-xs);margin-bottom:var(--space-4)">
            🔒 <strong>SPECTATOR MODE</strong>: Guest View. Choose a Captain Profile to unlock official scoring clearance! (Override active for testing)
          </div>`
        }
      }
      return ''
    })()}

    ${s.gameOver ? (() => {
      const seriesDecided = s.seriesScore.home >= 2 || s.seriesScore.away >= 2
      const seriesWinner = s.seriesScore.home >= 2 ? s.homeName : s.awayName
      const seriesWinnerColor = s.seriesScore.home >= 2 ? s.homeColor : s.awayColor
      return `
      <div class="card-glass animate-in text-center" style="padding:var(--space-8);margin-bottom:var(--space-6)">
        <div style="font-size:var(--text-4xl);margin-bottom:var(--space-3)">${seriesDecided ? '🏆' : '🎮'}</div>
        <h2 style="font-family:var(--font-display);font-weight:900;color:${seriesDecided ? seriesWinnerColor : '#fff'}">
          ${seriesDecided ? `${seriesWinner} Wins the Series!` : `${s.winner} Takes Game ${s.gameNumber}!`}
        </h2>
        <div style="display:flex;justify-content:center;gap:var(--space-6);margin:var(--space-4) 0">
          <div style="text-align:center">
            <div style="font-size:var(--text-3xl);font-weight:900;color:${s.homeColor}">${s.seriesScore.home}</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary)">${s.homeName}</div>
          </div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);align-self:center">SERIES</div>
          <div style="text-align:center">
            <div style="font-size:var(--text-3xl);font-weight:900;color:${s.awayColor}">${s.seriesScore.away}</div>
            <div style="font-size:var(--text-xs);color:var(--text-secondary)">${s.awayName}</div>
          </div>
        </div>
        <p class="text-secondary" style="font-size:var(--text-xs)">
          Game ${s.gameNumber}: ${s.turns.length} turns · ${s.totalBBs} ball backs${s.overtime ? ' · OT' : ''}
        </p>
        ${seriesDecided ? `
          <button class="btn btn-primary" style="margin-top:var(--space-4)" id="scorer-save-btn">Save Series (${s.seriesScore.home}–${s.seriesScore.away})</button>
        ` : `
          <button class="btn btn-primary" style="margin-top:var(--space-4);animation:putter-pulse 2s infinite ease-in-out" id="scorer-next-game-btn">
            Start Game ${s.gameNumber + 1} →
          </button>
        `}
      </div>`
    })() : putterDisplay}

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
      return `<div class="scorer-actions animate-in delay-2" style="display:flex; flex-direction:column; align-items:center; gap:var(--space-2)">
        <div style="font-size:var(--text-xs); font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:var(--text-secondary)">
          🎯 ${activePutterName.toUpperCase()}'S SHOT
        </div>
        <div style="display:flex; gap:var(--space-3); justify-content:center">
          ${noHolesLeft ? `<button class="scorer-action-btn made" id="scorer-made-btn">✅ ${activePutterName} Made It</button>` : ''}
          <button class="scorer-action-btn miss" id="scorer-miss-btn">✕ ${activePutterName} Miss</button>
        </div>
      </div>`
    })() : ''}

    ${s.turns.length ? `<section class="animate-in delay-3" style="margin-top:var(--space-6)">
      <div class="section-header"><h3>Turn Log</h3><span class="badge badge-pink">${s.turns.length} turns</span></div>
      <div class="card turn-log" style="padding:var(--space-3)">${turnLogHtml}</div>
    </section>` : ''}

    <div class="mt-4 flex items-center justify-center gap-3 animate-in delay-3">
      ${!s.gameOver && (s.turns.length > 0 || s.currentTurnPutts.length > 0) ? `
        <button class="btn btn-ghost" id="scorer-undo-btn" style="border-color: rgba(255,255,255,0.15); color: var(--text-secondary)">↩️ Undo Turn</button>
      ` : ''}
      ${!s.gameOver && s.turns.length >= 1 ? `
        <button class="btn btn-ghost" id="scorer-abandon-btn" style="border-color: rgba(239,68,68,0.25); color: var(--red-400); font-size:var(--text-xs)">⚠️ Abandon Shot Tracking</button>
      ` : ''}
      <button class="btn btn-ghost" id="scorer-reset-btn">← New Game</button>
    </div>
  </div>`
}

// ─── Scoring Mode Choice Screen ───
function renderScoringModeChoice() {
  const match = getAllMatches().find(m => m.id === pendingMatchId)
  if (!match) { pendingMatchId = null; return renderScorer() }

  const ht = getTeam(match.homeTeamId), at = getTeam(match.awayTeamId)

  return `<div class="page container">
    <div class="page-header animate-in"><h1>🎯 Live Scorer</h1></div>
    <div class="card-glass animate-in" style="padding:var(--space-6);max-width:520px;margin:0 auto;text-align:center">
      <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-3);margin-bottom:var(--space-4)">
        <div style="text-align:center">
          <span class="team-dot" style="background:${ht.color};width:14px;height:14px"></span>
          <div style="font-weight:800;font-size:var(--text-sm);color:${ht.color};margin-top:4px">${ht.name}</div>
        </div>
        <span style="font-size:var(--text-xs);color:var(--text-muted);font-weight:700">vs</span>
        <div style="text-align:center">
          <span class="team-dot" style="background:${at.color};width:14px;height:14px"></span>
          <div style="font-weight:800;font-size:var(--text-sm);color:${at.color};margin-top:4px">${at.name}</div>
        </div>
      </div>

      <h3 style="font-family:var(--font-display);font-weight:900;color:#fff;margin-bottom:var(--space-2)">How do you want to score?</h3>
      <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-5)">Choose your scoring method for this match</p>

      <div style="display:flex;flex-direction:column;gap:var(--space-3)">
        <button id="scorer-mode-live" class="card" style="padding:var(--space-4);cursor:pointer;border-color:rgba(34,197,94,0.2);background:rgba(34,197,94,0.03);text-align:left;transition:all 0.15s ease">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:var(--text-2xl)">🎯</span>
            <div>
              <div style="font-weight:800;color:#fff;font-size:var(--text-sm)">Live Score — Shot by Shot</div>
              <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px">Track every putt, see ball backs, full stats and replay</div>
            </div>
          </div>
        </button>

        <button id="scorer-mode-quick" class="card" style="padding:var(--space-4);cursor:pointer;border-color:rgba(251,191,36,0.2);background:rgba(251,191,36,0.03);text-align:left;transition:all 0.15s ease">
          <div style="display:flex;align-items:center;gap:var(--space-3)">
            <span style="font-size:var(--text-2xl)">📋</span>
            <div>
              <div style="font-weight:800;color:#fff;font-size:var(--text-sm)">Quick Score — Final Scores Only</div>
              <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px">Just enter who won each game. Stats will be estimated*</div>
            </div>
          </div>
        </button>
      </div>

      <button class="btn btn-ghost" id="scorer-mode-cancel" style="margin-top:var(--space-4);font-size:var(--text-xs)">← Back</button>
    </div>
  </div>`
}

// ─── Quick Score Entry Form ───
function renderQuickScoreEntry() {
  const qs = quickScoreState
  const match = getAllMatches().find(m => m.id === qs.matchId)
  if (!match) { quickScoreState = null; return renderScorer() }

  const ht = getTeam(match.homeTeamId), at = getTeam(match.awayTeamId)
  const seriesHome = qs.games.filter(g => g.winner === 'home').length
  const seriesAway = qs.games.filter(g => g.winner === 'away').length
  const seriesDecided = seriesHome >= 2 || seriesAway >= 2
  const needsMoreGames = !seriesDecided && qs.games.length < 3
  const currentGameNum = qs.games.length + 1

  const completedGamesHtml = qs.games.map((g, idx) => {
    const winnerName = g.winner === 'home' ? ht.name : at.name
    const winnerColor = g.winner === 'home' ? ht.color : at.color
    return `
      <div class="card" style="padding:var(--space-3);border-color:${winnerColor}25;background:${winnerColor}08">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:var(--text-xs);font-weight:800;color:var(--text-secondary)">Game ${idx + 1}</span>
          <span class="badge" style="background:${winnerColor}20;color:${winnerColor};font-size:9px;font-weight:800">${winnerName} Wins</span>
        </div>
        <div style="display:flex;justify-content:center;gap:var(--space-4);margin-top:var(--space-2)">
          <div style="text-align:center"><div style="font-weight:900;font-size:var(--text-lg);color:${ht.color}">${g.homeScore}</div><div style="font-size:10px;color:var(--text-muted)">${ht.name}</div></div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);align-self:center">—</div>
          <div style="text-align:center"><div style="font-weight:900;font-size:var(--text-lg);color:${at.color}">${g.awayScore}</div><div style="font-size:10px;color:var(--text-muted)">${at.name}</div></div>
        </div>
      </div>
    `
  }).join('')

  let entryFormHtml = ''
  if (needsMoreGames) {
    const cupOptions = [0,1,2,3,4,5].map(n =>
      `<button class="btn btn-secondary btn-sm qs-cup-btn ${qs.currentLoserCups === n ? 'active' : ''}" data-qs-cups="${n}" style="min-width:36px;${qs.currentLoserCups === n ? 'background:var(--pink-400);color:#000;border-color:var(--pink-400)' : ''}">${n}</button>`
    ).join('')

    entryFormHtml = `
      <div class="card" style="padding:var(--space-4);border-color:rgba(255,255,255,0.1);margin-top:var(--space-3)">
        <div style="font-size:var(--text-xs);font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);margin-bottom:var(--space-3)">Game ${currentGameNum}</div>

        <div style="margin-bottom:var(--space-3)">
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-2);font-weight:600">Who won this game?</div>
          <div style="display:flex;gap:var(--space-2);justify-content:center">
            <button class="btn btn-sm qs-winner-btn ${qs.currentWinner === 'home' ? '' : 'btn-secondary'}" data-qs-winner="home" style="${qs.currentWinner === 'home' ? `background:${ht.color};color:#fff;border-color:${ht.color}` : ''}">🏠 ${ht.name}</button>
            <button class="btn btn-sm qs-winner-btn ${qs.currentWinner === 'away' ? '' : 'btn-secondary'}" data-qs-winner="away" style="${qs.currentWinner === 'away' ? `background:${at.color};color:#fff;border-color:${at.color}` : ''}">🏁 ${at.name}</button>
          </div>
        </div>

        ${qs.currentWinner ? `
          <div style="margin-bottom:var(--space-3)">
            <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-2);font-weight:600">
              How many cups did <strong style="color:${qs.currentWinner === 'home' ? at.color : ht.color}">${qs.currentWinner === 'home' ? at.name : ht.name}</strong> sink? (loser's score)
            </div>
            <div style="display:flex;gap:var(--space-1);justify-content:center;flex-wrap:wrap">${cupOptions}</div>
          </div>

          ${qs.currentLoserCups !== null ? `
            <div style="display:flex;justify-content:center;gap:var(--space-3);margin-top:var(--space-2);padding:var(--space-2);background:rgba(255,255,255,0.02);border-radius:var(--radius-md)">
              <span style="color:${ht.color};font-weight:800;font-size:var(--text-base)">${qs.currentWinner === 'home' ? 6 : qs.currentLoserCups}</span>
              <span style="color:var(--text-muted);font-size:var(--text-xs);align-self:center">—</span>
              <span style="color:${at.color};font-weight:800;font-size:var(--text-base)">${qs.currentWinner === 'away' ? 6 : qs.currentLoserCups}</span>
            </div>
            <button class="btn btn-primary btn-sm" id="qs-confirm-game" style="margin-top:var(--space-3);width:100%">Confirm Game ${currentGameNum} →</button>
          ` : ''}
        ` : ''}
      </div>
    `
  }

  return `<div class="page container">
    <div class="page-header animate-in"><h1>📋 Quick Score</h1></div>
    <div style="max-width:480px;margin:0 auto">
      <div class="card-glass animate-in" style="padding:var(--space-4);margin-bottom:var(--space-4)">
        <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-4);margin-bottom:var(--space-3)">
          <div style="text-align:center"><span class="team-dot" style="background:${ht.color};width:12px;height:12px"></span><div style="font-weight:800;font-size:var(--text-xs);color:${ht.color};margin-top:2px">${ht.name}</div></div>
          <span style="font-size:var(--text-xs);color:var(--text-muted);font-weight:700">vs</span>
          <div style="text-align:center"><span class="team-dot" style="background:${at.color};width:12px;height:12px"></span><div style="font-weight:800;font-size:var(--text-xs);color:${at.color};margin-top:2px">${at.name}</div></div>
        </div>
        <div style="display:flex;justify-content:center;gap:var(--space-4);margin-bottom:var(--space-2)">
          <div style="text-align:center"><div style="font-size:var(--text-2xl);font-weight:900;color:${ht.color}">${seriesHome}</div><div style="font-size:9px;color:var(--text-muted)">SERIES</div></div>
          <div style="font-size:var(--text-xs);color:var(--text-muted);align-self:center">—</div>
          <div style="text-align:center"><div style="font-size:var(--text-2xl);font-weight:900;color:${at.color}">${seriesAway}</div><div style="font-size:9px;color:var(--text-muted)">SERIES</div></div>
        </div>
      </div>

      <div class="animate-in delay-1" style="display:flex;flex-direction:column;gap:var(--space-2)">
        ${completedGamesHtml}
        ${entryFormHtml}
      </div>

      ${seriesDecided ? `
        <div class="card-glass animate-in delay-2" style="padding:var(--space-5);text-align:center;margin-top:var(--space-4)">
          <div style="font-size:var(--text-3xl);margin-bottom:var(--space-2)">🏆</div>
          <h3 style="font-family:var(--font-display);font-weight:900;color:${seriesHome >= 2 ? ht.color : at.color}">${seriesHome >= 2 ? ht.name : at.name} Wins the Series!</h3>
          <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:var(--space-2) 0 var(--space-4)">Series: ${seriesHome}–${seriesAway} · Stats will be estimated from final scores*</p>
          <button class="btn btn-primary" id="qs-save-series">Save Series (${seriesHome}–${seriesAway}) →</button>
        </div>
      ` : ''}

      <div style="text-align:center;margin-top:var(--space-4)">
        <button class="btn btn-ghost" id="qs-cancel" style="font-size:var(--text-xs)">← Cancel</button>
      </div>
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
        window.dispatchEvent(new CustomEvent('puttermore-time-shifted'))
      }, 1000)
    }
  }
}

function triggerTrashTalk(context = 'general', activePlayerId = null) {
  const s = scorerState
  if (!s) return

  let selectedQuotes = []
  
  if (context === 'redemption' || s.phase === 'redemption') {
    selectedQuotes = [
      "Cotton McKnight: Holy putting grass, Pepper, we are in REDEMPTION! The tension is high enough to snap a carbon-fiber shaft!",
      "Pepper Reddick: Absolutely, Cotton! One mistake here and they'll be buying the next round in total silence! This is real taproom drama!",
      "Cotton McKnight: The board is cleared but they need to run the table now! Talk about a high-stakes rescue mission!",
      "Pepper Reddick: It's redemption time! Yo momma could bounce it off a bar stool, but can they sink it under pressure?"
    ]
  } else if (context === 'overtime' || s.phase === 'overtime' || s.overtime) {
    if (s.overtimeCount > 1) {
      const otName = s.overtimeCount === 2 ? 'DOUBLE' : s.overtimeCount === 3 ? 'TRIPLE' : `${s.overtimeCount}x`
      selectedQuotes = [
        `Cotton McKnight: Holy Dundalk dirtbikes, Pepper! We are in ${otName} OVERTIME! My blood pressure is high enough to pop a beer keg!`,
        `Pepper Reddick: ${otName} OVERTIME! I'm sweating faster than a hot Old Bay crab on a July afternoon in Fells Point!`,
        "Cotton McKnight: This is absolute insanity! Neither team wants to die! It's like watching two crabs fighting over a piece of bait at the bottom of the Chesapeake!",
        "Pepper Reddick: These players are ice cold, Cotton! Sinking putts under this level of absolute, championship-tier pressure is legendary!",
        `Cotton McKnight: A historic ${otName} Overtime! The pressure in this room is thick enough to spread on a cracker like cream cheese!`,
        "Pepper Reddick: Settle in, Baltimore! This is pure, unadulterated bar putting history unfolding right before our eyes!"
      ]
    } else {
      selectedQuotes = [
        "Cotton McKnight: OVERTIME, Pepper! Settle in, folks, because we are in sudden death putting territory!",
        "Pepper Reddick: Sudden death, Cotton! My heart is pounding like a subwoofer in the back of a Dundalk civic!",
        "Cotton McKnight: Front 3 cups are reopen and the pressure is at an absolute, boiling-point maximum!"
      ]
    }
  } else if (context === 'shootout' || (s.homeBoardOpen && s.awayBoardOpen && s.homeBoardOpen.size === 1 && s.awayBoardOpen.size === 1)) {
    selectedQuotes = [
      "Cotton McKnight: A classic 1v1 shootout! Both teams are down to their final cup, Pepper!",
      "Pepper Reddick: It is an absolute duel to the death! One ball in, one ball out, and someone goes home a hero!",
      "Cotton McKnight: Whoever sinks this next F1 cup secures immortality. Or at least free craft beer!"
    ]
  } else if (context === 'ballback' || (s.turns && s.turns.length > 0 && s.turns[s.turns.length - 1].ballBack)) {
    selectedQuotes = [
      "Cotton McKnight: They are heating up, Pepper! A spectacular double-sink ball back in their last turn!",
      "Pepper Reddick: They are on an absolute tear! The ball is sticking to that cup like honey on a biscuit!",
      "Cotton McKnight: The momentum has completely shifted! This team is rolling like Mr. Trash Wheel in a high tide!"
    ]
  } else if (context === 'make') {
    selectedQuotes = [
      "Cotton McKnight: A spectacular roll! Clean as a whistle, Pepper!",
      "Pepper Reddick: It is in the back of the cup! The crowd is going wild!",
      "Cotton McKnight: Sunk it! That was a textbook putting stroke right there!",
      "Pepper Reddick: Oh! Nothing but green felt and cup bottom! Magnificent shot!",
      "Cotton McKnight: Absolutely gorgeous arc on that ball. Masterful work!",
      "Pepper Reddick: Talk about visual precision! That ball practically had eyes!",
      "Cotton McKnight: Clean sink! The opponent's board is getting lighter by the second!"
    ]
  } else if (context === 'miss') {
    selectedQuotes = [
      "Cotton McKnight: That putt was so wide, Pepper, I think it went into the next county!",
      "Pepper Reddick: I've seen better rolls on a stale Dundalk crab cake, Cotton!",
      "Cotton McKnight: A stunning miss! It looks like they forgot their putting eyes at the bottom of their last pint!",
      "Pepper Reddick: He's aiming for the cup but putting like he's trying to hit a Squeegee Boy on the corner, Cotton!",
      "Cotton McKnight: Bold strategy, Cotton. Let's see if missing by three feet pays off for 'em!",
      "Pepper Reddick: If I had a dollar for every missed putt tonight, Cotton, I could buy the entire Heavy Seas brewery!",
      "Cotton McKnight: Mr. Trash Wheel is crying tears of absolute sorrow watching that putt drift wide!",
      "Pepper Reddick: That ball is trash, Cotton, but not the kind Mr. Trash Wheel likes to eat!",
      "Cotton McKnight: The angle of departure on that putt was completely fictional, Pepper!",
      "Pepper Reddick: He just invented a whole new branch of mathematics, Cotton: Putting Astrology!",
      "Cotton McKnight: That was a textbook under-putt, Pepper. Didn't even reach the grass clippings!",
      "Pepper Reddick: Staggering under-performance! My grandma could have sneezed the ball closer to the cup, Cotton!",
      "Pepper Reddick: That putting stroke was stiffer than a Dundalk dirtbike's suspension, Cotton!"
    ]
  } else if (context === 'streak_4') {
    selectedQuotes = [
      "Cotton McKnight: Four consecutive makes! This team is absolutely on fire, Pepper!",
      "Pepper Reddick: Unbelievable! They're sweeping the board like a hurricane passing through Fells Point!",
      "Cotton McKnight: That is four cups down! Staggering display of championship concentration!"
    ]
  } else if (context === 'streak_6') {
    selectedQuotes = [
      "Cotton McKnight: SIX IN A ROW! A PERFECT SWEEP! Pepper, I have goosebumps on my goosebumps!",
      "Pepper Reddick: 👑 UNBELIEVABLE! They swept the entire mat in consecutive shots! This is legendary status!",
      "Cotton McKnight: I have never seen a performance like this since the great Dundalk Shootout of '04!"
    ]
  }

  // Fallback to general bickering & Yo Momma jokes
  if (selectedQuotes.length === 0 || context === 'general') {
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
    ]
    if (s.turns && s.turns.length >= 8) {
      selectedQuotes.unshift(
        "Cotton McKnight: Talk about a marathon! This late-game bickering is reaching historic levels of taproom intensity!",
        "Pepper Reddick: Absolutely, Cotton! This game has gone on longer than a Dundalk traffic light on a rainy Tuesday night!",
        "Cotton McKnight: My throat is drier than a mouthful of crab shells, Pepper! We are deep into late-game survival territory here!",
        "Pepper Reddick: Unbelievable marathon match! The players are breathing heavier than a Squeegee Boy on a 95-degree Baltimore afternoon!",
        "Cotton McKnight: High-stakes late game! One bad twitch now and they'll be sweeping turf clippings in absolute disgrace!"
      )
    }
  }

  const randomQuote = selectedQuotes[Math.floor(Math.random() * selectedQuotes.length)]
  s.activeCommentary = randomQuote

  if (activePlayerId) {
    if (!s.banterLog) s.banterLog = []
    const lastBanter = s.banterLog[s.banterLog.length - 1]
    if (!lastBanter || lastBanter.quote !== randomQuote) {
      const pInfo = getPlayer(activePlayerId)
      s.banterLog.push({
        playerId: activePlayerId,
        playerName: pInfo ? pInfo.name : 'Unknown Player',
        teamId: s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId,
        quote: randomQuote,
        context: context,
        timestamp: new Date().toISOString()
      })
    }
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
  if (target.closest('[data-open-play-opponent]') && !scorerState) {
    const opponentId = target.closest('[data-open-play-opponent]').dataset.openPlayOpponent
    if (opponentId) {
      const loggedIn = getLoggedInUser()
      const captainTeam = loggedIn ? getAllTeams().find(t => t.captainPlayerId === loggedIn.id) : null
      if (captainTeam) {
        const leagueId = getSelectedLeague()
        const weekNum = 1 // Default week
        const newMatch = createMatch(leagueId, weekNum, captainTeam.id, opponentId)
        if (newMatch) {
          pendingMatchId = newMatch.id
          return true
        }
      }
    }
  }
  if (target.closest('.match-pick-item') && !target.closest('[data-open-play-opponent]')) {
    const matchId = target.closest('.match-pick-item').dataset.matchId
    if (matchId) { pendingMatchId = matchId; return true }
  }
  // ─── Scoring Mode Choice Handlers ───
  if (target.closest('#scorer-mode-live') && pendingMatchId) {
    startGame(pendingMatchId)
    pendingMatchId = null
    return true
  }
  if (target.closest('#scorer-mode-quick') && pendingMatchId) {
    quickScoreState = {
      matchId: pendingMatchId,
      games: [],
      currentWinner: null,
      currentLoserCups: null,
    }
    pendingMatchId = null
    return true
  }
  if (target.id === 'scorer-mode-cancel') {
    pendingMatchId = null
    return true
  }
  // ─── Quick Score Form Handlers ───
  if (target.closest('.qs-winner-btn') && quickScoreState) {
    quickScoreState.currentWinner = target.closest('.qs-winner-btn').dataset.qsWinner
    quickScoreState.currentLoserCups = null
    return true
  }
  if (target.closest('.qs-cup-btn') && quickScoreState) {
    quickScoreState.currentLoserCups = parseInt(target.closest('.qs-cup-btn').dataset.qsCups)
    return true
  }
  if (target.id === 'qs-confirm-game' && quickScoreState) {
    const qs = quickScoreState
    if (qs.currentWinner && qs.currentLoserCups !== null) {
      const homeScore = qs.currentWinner === 'home' ? 6 : qs.currentLoserCups
      const awayScore = qs.currentWinner === 'away' ? 6 : qs.currentLoserCups
      qs.games.push({ winner: qs.currentWinner, homeScore, awayScore })
      qs.currentWinner = null
      qs.currentLoserCups = null
    }
    return true
  }
  if (target.id === 'qs-save-series' && quickScoreState) {
    const qs = quickScoreState
    const gameScores = qs.games.map(g => ({ home: g.homeScore, away: g.awayScore }))
    quickScoreMatch(qs.matchId, gameScores, 'override')
    showToast(`🏆 Series saved! Stats estimated from final scores.`)
    quickScoreState = null
    return true
  }
  if (target.id === 'qs-cancel') {
    quickScoreState = null
    return true
  }
  // ─── Mid-Game Abandon Handler ───
  if (target.id === 'scorer-abandon-btn' && scorerState) {
    // Switch from live scoring to quick score entry, discarding shot data
    const matchId = scorerState.matchId
    const seriesScore = { ...scorerState.seriesScore }
    const completedGames = [...(scorerState.completedGames || [])]
    const gameNumber = scorerState.gameNumber
    scorerState = null
    quickScoreState = {
      matchId,
      games: completedGames.map(g => {
        const homeWon = g.winnerId === getAllMatches().find(m => m.id === matchId)?.homeTeamId
        return {
          winner: homeWon ? 'home' : 'away',
          homeScore: g.finalScore.home,
          awayScore: g.finalScore.away,
        }
      }),
      currentWinner: null,
      currentLoserCups: null,
    }
    showToast('⚠️ Switched to Quick Score. Enter the final scores.')
    return true
  }
  if (target.closest('#scorer-start-home') && scorerState) {
    const isStartOfGame = scorerState.turns.length === 0 && scorerState.currentTurnPutts.length === 0
    if (isStartOfGame) {
      scorerState.currentTeam = 'home'
      scorerState.currentPutterIdx = 0
      return true
    }
  }
  if (target.closest('#scorer-start-away') && scorerState) {
    const isStartOfGame = scorerState.turns.length === 0 && scorerState.currentTurnPutts.length === 0
    if (isStartOfGame) {
      scorerState.currentTeam = 'away'
      scorerState.currentPutterIdx = 0
      return true
    }
  }
  if (target.closest('.scorer-move-player') && scorerState && scorerState.turns.length === 0 && scorerState.currentTurnPutts.length === 0) {
    const el = target.closest('.scorer-move-player')
    const teamId = el.dataset.teamId
    const playerId = el.dataset.playerId
    const dir = el.dataset.dir
    if (teamId && playerId && dir) {
      const s = scorerState
      const activePlayers = teamId === 'home' ? s.homePlayers : s.awayPlayers
      const idx = activePlayers.findIndex(p => p.id === playerId)
      if (idx !== -1) {
        if (dir === 'up' && idx > 0) {
          const temp = activePlayers[idx]
          activePlayers[idx] = activePlayers[idx - 1]
          activePlayers[idx - 1] = temp
        } else if (dir === 'down' && idx < activePlayers.length - 1) {
          const temp = activePlayers[idx]
          activePlayers[idx] = activePlayers[idx + 1]
          activePlayers[idx + 1] = temp
        }
      }
      return true
    }
  }
  // Island Mode: Bonus cup pick
  const bonusPick = target.closest('[data-bonus-pick]')
  if (bonusPick && scorerState?.pendingIslandBonus) {
    const bonusHoleId = bonusPick.dataset.bonusPick
    if (bonusHoleId) {
      claimIslandBonus(bonusHoleId)
      return true
    }
  }
  if (target.closest('.board-hole')) {
    const el = target.closest('.board-hole')
    const hole = el.dataset.hole, boardId = el.dataset.board
    if (hole && scorerState && !scorerState.gameOver) {
      const expectedBoard = scorerState.currentTeam === 'home' ? 'away' : 'home'
      if (boardId === expectedBoard) {
        const boardOpen = expectedBoard === 'home' ? scorerState.homeBoardOpen : scorerState.awayBoardOpen
        // Ignore clicks on already claimed/sunk cups to prevent duplicate phantom putts
        if (!boardOpen.has(hole)) return true
        recordPutt(hole, true)
        return true
      }
    }
  }
  if (target.id === 'scorer-made-btn' && scorerState && !scorerState.gameOver) {
    recordPutt('cleared', true); return true
  }
  if (target.id === 'scorer-miss-btn' && scorerState && !scorerState.gameOver) {
    recordPutt(null, false); return true
  }
  if (target.id === 'scorer-save-btn' && scorerState) {
    saveSeriesResult(); scorerState = null; return true
  }
  if (target.id === 'scorer-next-game-btn' && scorerState) {
    startNextGame(); return true
  }
  if (target.closest('.announcer-commentary-bubble') || target.id === 'scorer-commentary-reroll') {
    const s = scorerState
    let activePlayerId = null
    if (s) {
      const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)
      const currentPutter = putters[s.currentPutterIdx] || putters[0]
      if (currentPutter) activePlayerId = currentPutter.id
    }
    triggerTrashTalk('general', activePlayerId); return true
  }
  if (target.id === 'scorer-undo-btn') {
    undoScorerTurn()
    return true
  }
  if (target.id === 'scorer-reset-btn') { scorerState = null; pendingMatchId = null; quickScoreState = null; return true }
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
    homePlayers: getTeamRoster(match.homeTeamId),
    awayPlayers: getTeamRoster(match.awayTeamId),
    homeBoardClaimed: [], awayBoardClaimed: [],
    homeBoardOpen: new Set(HOLES), awayBoardOpen: new Set(HOLES),
    currentTeam: 'home',
    currentPutterIdx: 0,
    currentTurnPutts: [],
    turns: [], turnNumber: 0, totalBBs: 0,
    phase: 'normal',
    redemptionPutterIdx: 0,
    firstToClear: null,
    hadRedemption: false,
    gameOver: false, winner: null, overtime: false,
    overtimeCount: 0,
    homeStreak: 0, awayStreak: 0,
    activeCommentary: "",
    // Series tracking
    seriesScore: { home: 0, away: 0 },
    gameNumber: 1,
    completedGames: [],
    // Island mode
    pendingIslandBonus: false,
    islandPutterId: null,
    islandHoleMade: null,
  }

  const initialQuotes = [
    "Cotton McKnight: Welcome to match night live scoring! The turf is freshly vacuumed and the cups are standing tall!",
    "Pepper Reddick: I love the smell of premium green turf in the evening, Cotton! Let's get these balls rolling!",
    "Cotton McKnight: The teams are set, the scorekeepers are prepped, and we are ready for some absolute magic!",
    "Pepper Reddick: My putting fingers are twitching just looking at these boards! Let's see who claims the first cup!"
  ]
  scorerState.activeCommentary = initialQuotes[Math.floor(Math.random() * initialQuotes.length)]

  scorerHistory = []
  pushStateSnapshot()
}

function recordPutt(hole, made) {
  const s = scorerState
  if (!s) return
  if (s.otStartSelect) {
    s.otStartSelect = false
  }
  if (s.currentTurnPutts.length === 0) {
    pushStateSnapshot()
  }
  const targetBoardId = s.currentTeam === 'home' ? 'away' : 'home'
  const boardOpen = targetBoardId === 'home' ? s.homeBoardOpen : s.awayBoardOpen
  const boardClaimed = targetBoardId === 'home' ? s.homeBoardClaimed : s.awayBoardClaimed

  if (s.phase === 'redemption') {
    return recordRedemptionPutt(hole, made, boardOpen, boardClaimed, targetBoardId)
  }

  // Normal / OT play
  const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)

  const putter = putters[s.currentPutterIdx]
  const putt = { playerId: putter.id, hole: hole || 'miss', made, board: targetBoardId }
  s.currentTurnPutts.push(putt)

  const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'

  if (made) {
    // Check island BEFORE removing from board (cup is still in openCups at check time)
    const wasIsland = isIslandCup(hole, boardOpen)
    if (hole && boardOpen.has(hole)) {
      boardOpen.delete(hole)
      boardClaimed.push(hole)
    }
    s[streakKey]++
    triggerTrashTalk('make', putter.id)

    // If this was an island and there are still open cups to pick as bonus
    if (wasIsland && boardOpen.size > 0) {
      s.pendingIslandBonus = true
      s.islandPutterId = putter.id
      s.islandHoleMade = hole
      showToast('<div class="toast-title">🏝️ ISLAND MODE!</div><div class="toast-detail">Pick a bonus cup to claim!</div>', 'streak')
      // Don't advance putter — wait for bonus pick
      return
    }
  } else {
    s[streakKey] = 0
    triggerTrashTalk('miss', putter.id)
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
    // Ball back + board cleared = INSTANT WIN
    if (ballBack) {
      s.gameOver = true
      s.winner = s.currentTeam === 'home' ? s.homeName : s.awayName
      if (s.currentTeam === 'home') s.seriesScore.home++; else s.seriesScore.away++
      s.currentTurnPutts = []
      s.currentPutterIdx = 0

      const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'
      const streak = s[streakKey]
      if (streak === 6) {
        showToast(`<div class="toast-title">👑 PERFECT BOARD! 6 IN A ROW!</div><div class="toast-detail">🏆 ${s.winner.toUpperCase()} WINS!</div>`, 'winner')
        triggerTrashTalk('streak_6', putters[putters.length - 1].id)
      } else {
        showToast(`<div class="toast-title">🏆 GAME SET MATCH!</div><div class="toast-detail">${s.winner.toUpperCase()} WINS!</div>`, 'winner')
      }
      return
    }
    // No ball back → redemption for the other team
    s.firstToClear = s.currentTeam
    s.phase = 'redemption'
    s.hadRedemption = true
    s.redemptionPutterIdx = 0
    s.redemptionMissCount = 0
    s.currentTeam = s.currentTeam === 'home' ? 'away' : 'home'
    s.currentTurnPutts = []
    s.currentPutterIdx = 0
    triggerTrashTalk('redemption', putters[putters.length - 1].id)
    return
  }

  s.currentTurnPutts = []
  s.currentPutterIdx = 0
  if (!ballBack) {
    s.currentTeam = s.currentTeam === 'home' ? 'away' : 'home'
  } else {
    const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'
    const streak = s[streakKey]
    if (streak === 4) {
      showToast(`<div class="toast-title">⚡ UNSTOPPABLE! 4 IN A ROW!</div><div class="toast-detail">🔥 BALL BACK!</div>`, "streak")
      triggerTrashTalk('streak_4', putters[putters.length - 1].id)
    } else if (streak === 6) {
      showToast(`<div class="toast-title">👑 PERFECT BOARD! 6 IN A ROW!</div><div class="toast-detail">🔥 BALL BACK!</div>`, "streak")
      triggerTrashTalk('streak_6', putters[putters.length - 1].id)
    } else if (streak > 6 && streak % 2 === 0) {
      showToast(`<div class="toast-title">🔥 BALL BACK!</div><div class="toast-detail">${streak} IN A ROW!</div>`, "streak")
      triggerTrashTalk('streak_2', putters[putters.length - 1].id)
    } else {
      showToast('<div class="toast-title">🔥 BALL BACK!</div>')
      triggerTrashTalk('ballback', putters[putters.length - 1].id)
    }
  }
  checkCloseGameBanter()
}

function recordRedemptionPutt(hole, made, boardOpen, boardClaimed, targetBoardId) {
  const s = scorerState
  if (!s) return
  pushStateSnapshot()

  const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)
  const putter = putters[s.redemptionPutterIdx % putters.length]

  const putt = { playerId: putter.id, hole: hole || 'miss', made, board: targetBoardId }
  const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'

  if (made) {
    // Check island BEFORE removing from board
    const wasIsland = isIslandCup(hole, boardOpen)
    if (hole && boardOpen.has(hole)) {
      boardOpen.delete(hole)
      boardClaimed.push(hole)
    }
    s[streakKey]++
    triggerTrashTalk('make', putter.id)

    // If island and open cups remain, pause for bonus pick
    if (wasIsland && boardOpen.size > 0) {
      s.pendingIslandBonus = true
      s.islandPutterId = putter.id
      s.islandHoleMade = hole
      showToast('<div class="toast-title">🏝️ ISLAND MODE!</div><div class="toast-detail">Pick a bonus cup to claim!</div>', 'streak')
      return
    }
  } else {
    // Missed
    s[streakKey] = 0
    triggerTrashTalk('miss', putter.id)
  }

  // Each redemption putt is its own turn (shoot-til-you-miss, one at a time)
  s.turnNumber++
  s.turns.push({
    turnNumber: s.turnNumber,
    teamId: s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId,
    putters: [putter.id],
    putts: [putt],
    ballBack: false, overtime: s.overtime, redemption: true,
  })

  const targetCount = 6
  const boardCleared = boardClaimed.length >= targetCount

  if (made) {
    // Made it! Check if board is cleared
    if (boardCleared) {
      // Redemption team cleared the board → original clearer still wins (no OT)
      s.gameOver = true
      s.winner = s.firstToClear === 'home' ? s.homeName : s.awayName
      if (s.firstToClear === 'home') s.seriesScore.home++
      else s.seriesScore.away++
      s.currentTurnPutts = []
      s.currentPutterIdx = 0
      showToast(`<div class="toast-title">🏆 GAME OVER</div><div class="toast-detail">${s.winner.toUpperCase()} cleared first and wins!</div>`, 'winner')
      return
    }

    // Board not cleared — SAME putter shoots again (shoot til you miss!)
    s.currentTurnPutts = []

    const streak = s[streakKey]
    if (streak >= 4 && streak % 2 === 0) {
      showToast(`<div class="toast-title">⚡ ${streak} IN A ROW!</div><div class="toast-detail">🔥 ${putter.name.split(' ')[0]} keeps shooting!</div>`, 'streak')
      if (streak === 4) triggerTrashTalk('streak_4', putter.id)
      else if (streak === 6) triggerTrashTalk('streak_6', putter.id)
    } else {
      showToast(`<div class="toast-title">✅ MADE!</div><div class="toast-detail">${putter.name.split(' ')[0]} shoots again!</div>`)
    }
    checkCloseGameBanter()
  } else {
    // Missed! Advance to next putter
    if (!s.redemptionMissCount) s.redemptionMissCount = 0
    s.redemptionMissCount++

    if (s.redemptionMissCount >= putters.length) {
      // All putters have missed → Redemption over, original clearer wins
      s.gameOver = true
      s.winner = s.firstToClear === 'home' ? s.homeName : s.awayName
      if (s.firstToClear === 'home') s.seriesScore.home++; else s.seriesScore.away++
      s.currentTurnPutts = []
      s.currentPutterIdx = 0
      showToast(`<div class="toast-title">🏆 GAME SET MATCH!</div><div class="toast-detail">${s.winner.toUpperCase()} WINS!</div>`, 'winner')
    } else {
      // Next putter takes over
      s.redemptionPutterIdx++
      s.currentPutterIdx = s.redemptionPutterIdx % putters.length
      s.currentTurnPutts = []
      const nextPutter = putters[s.currentPutterIdx]
      showToast(`<div class="toast-title">❌ MISS!</div><div class="toast-detail">${nextPutter.name.split(' ')[0]} takes over!</div>`)
    }
  }
}

// ─── Island Mode: Claim Bonus Cup ───
export function claimIslandBonus(bonusHoleId) {
  const s = scorerState
  if (!s || !s.pendingIslandBonus) return

  const targetBoardId = s.currentTeam === 'home' ? 'away' : 'home'
  const boardOpen = targetBoardId === 'home' ? s.homeBoardOpen : s.awayBoardOpen
  const boardClaimed = targetBoardId === 'home' ? s.homeBoardClaimed : s.awayBoardClaimed

  // Claim the bonus cup
  if (boardOpen.has(bonusHoleId)) {
    boardOpen.delete(bonusHoleId)
    boardClaimed.push(bonusHoleId)
  }

  // Tag the most recent putt with island + bonus info
  const lastPutt = s.currentTurnPutts[s.currentTurnPutts.length - 1]
  if (lastPutt) {
    lastPutt.island = true
    lastPutt.bonusCup = bonusHoleId
  }

  // Clear island state
  const islandHole = s.islandHoleMade
  s.pendingIslandBonus = false
  s.islandPutterId = null
  s.islandHoleMade = null

  const bonusLabel = getHoleShortName(bonusHoleId)
  const islandLabel = getHoleShortName(islandHole)
  showToast(`<div class="toast-title">🏝️ 2-FOR-1!</div><div class="toast-detail">${islandLabel} + ${bonusLabel} claimed!</div>`, 'streak')

  // Check if board is now cleared after the bonus
  const targetCount = 6
  const boardCleared = boardClaimed.length >= targetCount

  if (s.phase === 'redemption') {
    // In redemption: log the turn, then check board/continue
    s.turnNumber++
    const putterId = lastPutt?.playerId
    s.turns.push({
      turnNumber: s.turnNumber,
      teamId: s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId,
      putters: [putterId],
      putts: [lastPutt],
      ballBack: false, overtime: s.overtime, redemption: true,
    })
    s.currentTurnPutts = []

    if (boardCleared) {
      s.gameOver = true
      s.winner = s.firstToClear === 'home' ? s.homeName : s.awayName
      if (s.firstToClear === 'home') s.seriesScore.home++; else s.seriesScore.away++
      s.currentPutterIdx = 0
      showToast(`<div class="toast-title">🏆 GAME OVER</div><div class="toast-detail">${s.winner.toUpperCase()} cleared first and wins!</div>`, 'winner')
    }
    // Otherwise same putter keeps shooting (shoot til you miss continues)
  } else {
    // Regulation: advance putter, then check if turn is done
    s.currentPutterIdx++
    const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)

    if (s.currentPutterIdx >= putters.length) {
      finishTurn(putters, boardClaimed, targetBoardId)
    }
  }
}

export function showToast(message, type = '') {
  const existing = document.getElementById('ball-back-toast')
  if (!existing) return

  // Cancel any scheduled animations from previous plays to prevent race conditions or duplicate toasts
  if (window.activeToastTimeout) clearTimeout(window.activeToastTimeout)
  if (window.activeToastHideTimeout) clearTimeout(window.activeToastHideTimeout)

  existing.classList.remove('show', 'winner-toast', 'streak-toast')
  existing.innerHTML = message
  
  if (type === 'winner') {
    existing.classList.add('winner-toast')
  } else if (type === 'streak') {
    existing.classList.add('streak-toast')
  }

  window.activeToastTimeout = setTimeout(() => {
    existing.classList.add('show')
    window.activeToastHideTimeout = setTimeout(() => {
      existing.classList.remove('show')
    }, type === 'winner' ? 5000 : 2500)
  }, 50)
}

function getCurrentPutters(s, teamId) {
  const isHome = teamId === s.homeTeamId
  const players = isHome ? s.homePlayers : s.awayPlayers
  if (players.length <= 2) return players

  const teamTurns = s.turns.filter(t => t.teamId === teamId)
  const transitions = teamTurns.filter(t => !t.ballBack).length
  
  const seq = transitions % 3
  if (seq === 0) return [players[0], players[1]]
  if (seq === 1) return [players[0], players[2]]
  return [players[1], players[2]]
}

function buildGameResult(s) {
  const homeScore = s.awayBoardClaimed.length
  const awayScore = s.homeBoardClaimed.length
  return {
    gameNumber: s.gameNumber,
    turns: JSON.parse(JSON.stringify(s.turns)),
    holesWon: { [s.homeTeamId]: [...s.awayBoardClaimed], [s.awayTeamId]: [...s.homeBoardClaimed] },
    finalScore: { home: homeScore, away: awayScore },
    totalTurns: s.turnNumber,
    ballBacks: {
      [s.homeTeamId]: s.turns.filter(t => t.teamId === s.homeTeamId && t.ballBack).length,
      [s.awayTeamId]: s.turns.filter(t => t.teamId === s.awayTeamId && t.ballBack).length,
    },
    winnerId: s.winner === s.homeName ? s.homeTeamId : s.awayTeamId,
    overtime: s.overtime,
    scoringMode: 'live',
  }
}

function startNextGame() {
  const s = scorerState
  // Save current game result
  const gameResult = buildGameResult(s)
  s.completedGames.push(gameResult)

  // Update series score (already updated when gameOver was set)
  // Reset board for next game
  s.gameNumber++
  s.homeBoardClaimed = []
  s.awayBoardClaimed = []
  s.homeBoardOpen = new Set(HOLES)
  s.awayBoardOpen = new Set(HOLES)
  s.currentTeam = 'home'
  s.currentPutterIdx = 0
  s.currentTurnPutts = []
  s.turns = []
  s.turnNumber = 0
  s.totalBBs = 0
  s.phase = 'normal'
  s.redemptionPutterIdx = 0
  s.firstToClear = null
  s.hadRedemption = false
  s.gameOver = false
  s.winner = null
  s.overtime = false
  s.overtimeCount = 0
  s.homeStreak = 0
  s.awayStreak = 0
  s.pendingIslandBonus = false
  s.islandPutterId = null
  s.islandHoleMade = null

  const gameQuotes = [
    `Cotton McKnight: Game ${s.gameNumber} is underway! The boards are reset and the tension is THICK!`,
    `Pepper Reddick: Fresh cups, fresh start! This is what putting is ALL about, Cotton!`,
    `Cotton McKnight: Can they keep the momentum or will we see a comeback? Game ${s.gameNumber}, HERE WE GO!`,
    `Pepper Reddick: Both teams resetting their boards — this series is getting SPICY!`
  ]
  s.activeCommentary = gameQuotes[Math.floor(Math.random() * gameQuotes.length)]

  scorerHistory = []
  pushStateSnapshot()
  showToast(`🎮 Game ${s.gameNumber} — FIGHT!`)
}

function saveSeriesResult() {
  const s = scorerState
  // Add the final game
  const finalGame = buildGameResult(s)
  s.completedGames.push(finalGame)

  const loggedIn = getLoggedInUser()
  const seriesWinnerId = s.seriesScore.home >= 2 ? s.homeTeamId : s.awayTeamId

  // Points: 2 for winner, 1 for loser if went to Game 3, else 0
  const wentToGame3 = s.completedGames.length >= 3
  const homeWon = seriesWinnerId === s.homeTeamId
  const homePoints = homeWon ? 2 : (wentToGame3 ? 1 : 0)
  const awayPoints = homeWon ? (wentToGame3 ? 1 : 0) : 2

  saveMatch(s.matchId, {
    games: s.completedGames,
    seriesScore: { ...s.seriesScore },
    winnerId: seriesWinnerId,
    homePoints,
    awayPoints,
    banterLog: s.banterLog || [],
    submittedByPlayerId: loggedIn ? loggedIn.id : null,
    submittedByPlayerName: loggedIn ? loggedIn.name : 'League Scorer',
  })
  showToast(`🏆 Series saved! ${s.seriesScore.home}–${s.seriesScore.away}`)
}

function pushStateSnapshot() {
  if (!scorerState) return
  const snapshot = {
    ...scorerState,
    homeBoardOpen: new Set(scorerState.homeBoardOpen),
    awayBoardOpen: new Set(scorerState.awayBoardOpen),
    turns: JSON.parse(JSON.stringify(scorerState.turns)),
    currentTurnPutts: JSON.parse(JSON.stringify(scorerState.currentTurnPutts)),
    homeBoardClaimed: [...scorerState.homeBoardClaimed],
    awayBoardClaimed: [...scorerState.awayBoardClaimed],
    homePlayers: [...scorerState.homePlayers],
    awayPlayers: [...scorerState.awayPlayers],
  }
  scorerHistory.push(snapshot)
}

export function undoScorerTurn() {
  const s = scorerState
  if (!s) return
  
  // Case 1: In the middle of a turn (shots have been taken, but turn not finished yet)
  if (s.currentTurnPutts.length > 0) {
    s.currentTurnPutts = []
    s.currentPutterIdx = 0
    
    // Restore the open/claimed board states from the last snapshot to clear any claims made in the middle of this turn!
    if (scorerHistory.length > 0) {
      const lastSnapshot = scorerHistory[scorerHistory.length - 1]
      s.homeBoardClaimed = [...lastSnapshot.homeBoardClaimed]
      s.awayBoardClaimed = [...lastSnapshot.awayBoardClaimed]
      s.homeBoardOpen = new Set(lastSnapshot.homeBoardOpen)
      s.awayBoardOpen = new Set(lastSnapshot.awayBoardOpen)
      s.homeStreak = lastSnapshot.homeStreak
      s.awayStreak = lastSnapshot.awayStreak
    }
    
    showToast("↩️ Current turn putts cleared!")
    refreshScorerPage()
    return
  }
  
  // Case 2: At the start of a turn (no shots taken yet), we want to undo the PREVIOUS completed turn!
  if (scorerHistory.length > 1) {
    // Pop the current turn's start-state snapshot
    scorerHistory.pop()
    // Peek the previous completed turn's start-state snapshot
    const prevState = scorerHistory[scorerHistory.length - 1]
    
    // Restore scorerState from prevState
    scorerState = {
      ...prevState,
      homeBoardOpen: new Set(prevState.homeBoardOpen),
      awayBoardOpen: new Set(prevState.awayBoardOpen),
      turns: JSON.parse(JSON.stringify(prevState.turns)),
      currentTurnPutts: JSON.parse(JSON.stringify(prevState.currentTurnPutts)),
      homeBoardClaimed: [...prevState.homeBoardClaimed],
      awayBoardClaimed: [...prevState.awayBoardClaimed],
      homePlayers: [...prevState.homePlayers],
      awayPlayers: [...prevState.awayPlayers],
    }
    
    showToast("↩️ Rolled back previous turn!")
    refreshScorerPage()
  } else {
    showToast("⚠️ Nothing to undo!")
  }
}

function refreshScorerPage() {
  const pageContentEl = document.getElementById('page-content')
  if (pageContentEl) {
    pageContentEl.innerHTML = renderScorer()
  }
}
