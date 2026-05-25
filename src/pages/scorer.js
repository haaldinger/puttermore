import { getAllMatches, getTeam, getTeamRoster, getPlayer, getLeague, getVenue, getAllLeagues, getAllTeams, getHoleShortName } from '../data.js'
import { renderSingleBoard } from '../board.js'
import { HOLES, OT_HOLES } from '../seed.js'
import { saveMatch, getLoggedInUser } from '../store.js'
import { getSelectedLeague, setSelectedLeague } from './home.js'

let scorerState = null
let scorerHistory = []
let viewMode = 'side'

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
      ).sort((a, b) => a.weekNumber - b.weekNumber || a.timeSlot.localeCompare(b.timeSlot))
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
          
          let isDisabled = false
          let badgeHtml = ''
          let btnStyle = ''
          
          if (captainTeam) {
            if (myNextMatch && m.id === myNextMatch.id) {
              badgeHtml = `<span class="badge badge-win" style="font-size: 8px; margin-left: auto; background: var(--green-500)20; border-color: var(--green-400); color: var(--green-400)">🎯 NEXT GAME</span>`
              btnStyle = `border: 2px solid var(--green-500); box-shadow: 0 0 12px var(--green-500)20; animation: putter-pulse 2s infinite ease-in-out`
            } else {
              isDisabled = true
              badgeHtml = `<span class="badge" style="font-size: 8px; margin-left: auto; background: rgba(255,255,255,0.05); color: var(--text-muted)">🔒 Locked</span>`
              btnStyle = `opacity: 0.45; cursor: not-allowed`
            }
          } else {
            isDisabled = true
            badgeHtml = `<span class="badge" style="font-size: 8px; margin-left: auto; background: rgba(255,255,255,0.05); color: var(--text-muted)">🔒 Locked</span>`
            btnStyle = `opacity: 0.45; cursor: not-allowed`
          }

          return `<button class="match-pick-item" data-match-id="${m.id}" ${isDisabled ? 'disabled style="pointer-events:none"' : ''} style="${btnStyle}">
            <span class="match-pick-teams">
              <span class="team-dot" style="background:${h.color}"></span>
              <span class="match-pick-name">${h.name}</span>
              <span class="match-pick-vs">vs</span>
              <span class="match-pick-name">${a.name}</span>
              <span class="team-dot" style="background:${a.color}"></span>
            </span>
            <span class="match-pick-time" style="display:flex; align-items:center; gap:8px">
              ${badgeHtml}
              <span>${m.timeSlot}</span>
            </span>
          </button>`
        }).join('')}
      </div>`).join('')

    const noMatches = !scheduled.length ? '<div class="text-center text-muted" style="padding:var(--space-8)">No scheduled matches for this league</div>' : ''

    return `<div class="page container">
      <div class="page-header animate-in"><h1>🎯 Live Scorer</h1><p>Select a match to start scoring</p></div>
      <div class="league-tabs animate-in" style="justify-content:center">${leagueTabs}</div>
      <div class="league-venue-bar animate-in delay-1"><span style="font-weight:700;color:${venue.color}">${venue.name}</span><span class="text-muted">· ${league.day}s</span></div>
      ${clearanceBannerHtml}
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
  let activePutterName = ''
  if (!s.gameOver) {
    const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)
    const currentPutter = putters[s.currentPutterIdx] || putters[0]
    activePutterName = currentPutter ? currentPutter.name.split(' ')[0] : '?'

    if (isRedemption) {
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

      putterDisplay = `<div class="turn-indicator animate-in" style="--team-color: var(--gold-400)">
        <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2); margin-bottom:var(--space-2)">
          <span class="blink-badge"></span>
          <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--gold-400); font-weight:800">⚡ REDEMPTION ROUND</span>
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
        <div style="font-size:var(--text-xs); color:var(--gold-400); margin-top:var(--space-3); font-weight:700">
          ⚠️ Goal: Both players make it = 🔥 Ball Back = Redemption Survives!
        </div>
        ${commentaryHtml}
      </div>`
    } else {
      const isStartOfGame = s.turns.length === 0 && s.currentTurnPutts.length === 0
      const isStartOfOT = s.phase === 'overtime' && s.otStartSelect
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
      } else if (isStartOfOT) {
        selectorHtml = `
          <div style="margin-top:var(--space-4); padding-top:var(--space-3); border-top:1px dashed rgba(255,255,255,0.15); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:var(--space-3)">
            <div style="display:flex; align-items:center; justify-content:center; gap:var(--space-2)">
              <span style="font-size:var(--text-xs); color:var(--gold-400); font-weight:700">⚡ OT DECIDER: Which team goes first?</span>
              <button class="btn btn-secondary btn-sm" id="scorer-start-home" style="border-radius:var(--radius-full); font-size:10px; padding:2px 8px; font-weight:800; ${s.currentTeam === 'home' ? `background:${s.homeColor}20; border-color:${s.homeColor}; color:${s.homeColor}` : 'opacity:0.6'}">${s.homeName}</button>
              <button class="btn btn-secondary btn-sm" id="scorer-start-away" style="border-radius:var(--radius-full); font-size:10px; padding:2px 8px; font-weight:800; ${s.currentTeam === 'away' ? `background:${s.awayColor}20; border-color:${s.awayColor}; color:${s.awayColor}` : 'opacity:0.6'}">${s.awayName}</button>
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
          ${isOT ? `<span class="badge badge-gold" style="font-size:9px">⚡ ${s.overtimeCount > 1 ? (s.overtimeCount === 2 ? 'DOUBLE OVERTIME' : s.overtimeCount === 3 ? 'TRIPLE OVERTIME' : `${s.overtimeCount}x OVERTIME`) : 'OVERTIME'}</span>` : ''}
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
        const holeLabel = getHoleShortName(p.hole)
        return `${name}: ${p.made ? '✅ ' + holeLabel : '❌'}`
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
      <button class="btn btn-ghost" id="scorer-reset-btn">← New Game</button>
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
  if (target.closest('.match-pick-item')) {
    const matchId = target.closest('.match-pick-item').dataset.matchId
    if (matchId) { startGame(matchId); return true }
  }
  if (target.closest('#scorer-start-home') && scorerState) {
    const isStartOfGame = scorerState.turns.length === 0 && scorerState.currentTurnPutts.length === 0
    const isStartOfOT = scorerState.phase === 'overtime' && scorerState.otStartSelect
    if (isStartOfGame || isStartOfOT) {
      scorerState.currentTeam = 'home'
      scorerState.currentPutterIdx = 0
      return true
    }
  }
  if (target.closest('#scorer-start-away') && scorerState) {
    const isStartOfGame = scorerState.turns.length === 0 && scorerState.currentTurnPutts.length === 0
    const isStartOfOT = scorerState.phase === 'overtime' && scorerState.otStartSelect
    if (isStartOfGame || isStartOfOT) {
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
    saveGameResult(); scorerState = null; return true
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
    homePlayers: getTeamRoster(match.homeTeamId),
    awayPlayers: getTeamRoster(match.awayTeamId),
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
    overtimeCount: 0,
    homeStreak: 0, awayStreak: 0, // Streak tracking
    activeCommentary: "", // Announcer speech bubble state
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
    if (hole && boardOpen.has(hole)) {
      boardOpen.delete(hole)
      boardClaimed.push(hole)
    }
    s[streakKey]++
    triggerTrashTalk('make', putter.id)
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
    s.currentTeam = s.currentTeam === 'home' ? 'away' : 'home'
    s.redemptionPutterIdx = 0
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
  if (s.currentTurnPutts.length === 0) {
    pushStateSnapshot()
  }
  const putters = getCurrentPutters(s, s.currentTeam === 'home' ? s.homeTeamId : s.awayTeamId)

  const putter = putters[s.currentPutterIdx]

  const putt = { playerId: putter.id, hole: hole || 'miss', made, board: targetBoardId }
  s.currentTurnPutts.push(putt)

  const streakKey = s.currentTeam === 'home' ? 'homeStreak' : 'awayStreak'

  if (made) {
    if (hole && boardOpen.has(hole)) {
      boardOpen.delete(hole)
      boardClaimed.push(hole)
    }
    s[streakKey]++
    triggerTrashTalk('make', putter.id)
  } else {
    s[streakKey] = 0
    triggerTrashTalk('miss', putter.id)
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

    if (boardCleared && !ballBack) {
      // Cleared but no ball back → TIE → Overtime
      s.phase = 'overtime'
      s.overtime = true
      if (!s.overtimeCount) s.overtimeCount = 0
      s.overtimeCount++
      s.homeBoardClaimed = ['back-1', 'back-2', 'back-3']
      s.awayBoardClaimed = ['back-1', 'back-2', 'back-3']
      s.homeBoardOpen = new Set(OT_HOLES)
      s.awayBoardOpen = new Set(OT_HOLES)
      s.currentTeam = s.firstToClear === 'home' ? 'away' : 'home'
      s.currentPutterIdx = 0
      s.currentTurnPutts = []
      s.firstToClear = null
      s.otStartSelect = true
      triggerTrashTalk('overtime', putters[putters.length - 1].id)
      return
    }

    if (!anyMade) {
      // Both missed → redemption over, first team wins
      s.gameOver = true
      s.winner = s.firstToClear === 'home' ? s.homeName : s.awayName
      s.currentTurnPutts = []
      s.currentPutterIdx = 0
      showToast(`<div class="toast-title">🏆 GAME SET MATCH!</div><div class="toast-detail">${s.winner.toUpperCase()} WINS!</div>`, 'winner')
      return
    }

    // At least one made but board not cleared → keep going
    s.currentTurnPutts = []
    s.currentPutterIdx = 0
    if (ballBack) {
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
    // Ball back = same team goes again, otherwise they still go (it's redemption)
    checkCloseGameBanter()
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

function saveGameResult() {
  const s = scorerState
  const homeScore = s.awayBoardClaimed.length
  const awayScore = s.homeBoardClaimed.length
  const loggedIn = getLoggedInUser()
  saveMatch(s.matchId, {
    turns: s.turns,
    holesWon: { [s.homeTeamId]: [...s.awayBoardClaimed], [s.awayTeamId]: [...s.homeBoardClaimed] },
    finalScore: { home: homeScore, away: awayScore },
    totalTurns: s.turnNumber,
    ballBacks: {
      [s.homeTeamId]: s.turns.filter(t => t.teamId === s.homeTeamId && t.ballBack).length,
      [s.awayTeamId]: s.turns.filter(t => t.teamId === s.awayTeamId && t.ballBack).length,
    },
    winnerId: s.winner === s.homeName ? s.homeTeamId : s.awayTeamId,
    overtime: s.overtime,
    banterLog: s.banterLog || [],
    submittedByPlayerId: loggedIn ? loggedIn.id : null,
    submittedByPlayerName: loggedIn ? loggedIn.name : 'League Scorer',
  })
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
