import { getTeam, getPlayer } from '../data.js'
import { renderSingleBoard } from '../board.js'

let replayMatch = null
let replayShots = []
let currentShotIdx = -1
let isPlaying = false
let playbackInterval = null
let speedMultiplier = 1 // 1x, 2x, 4x

// Shuffler for Cotton & Pepper banter pools
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generates customized sportscaster dialog based on shot state
function getCommentary(shot, player, team) {
  const pName = player ? player.name.split(' ')[0] : 'The putter'
  const tName = team ? team.name : 'Attacking Team'
  const holeName = shot.hole && shot.hole !== 'miss' ? shot.hole.replace('-', ' ') : 'the cup'

  if (shot.ballBack) {
    return {
      cotton: `Cotton McKnight: "Double-sink FIRE BALL BACK! Absolute, high-voltage bar-putting history for the ${tName}!"`,
      pepper: `Pepper Reddick: "Holy smokes, Cotton! Both putters hit their marks! That's more electric than a dirtbike race through the streets of Dundalk!"`
    }
  }

  if (shot.redemption) {
    if (shot.made) {
      return {
        cotton: `Cotton McKnight: "SINK! ${pName} answers the call under absolute, gut-wrenching Redemption Round pressure!"`,
        pepper: `Pepper Reddick: "Cold-blooded, Cotton! That ball went in smoother than a fresh crab cake sliding down a hungry Baltimorian's throat!"`
      }
    } else {
      return {
        cotton: `Cotton McKnight: "MISSED IT! Oh, the agony! The redemption run slips through their fingers like dry sand in Ocean City!"`,
        pepper: `Pepper Reddick: "Catastrophic under-performance, Cotton! Under that amount of pressure, the putter's arm went stiffer than a parking meter in Fells Point!"`
      }
    }
  }

  if (shot.overtime) {
    if (shot.made) {
      return {
        cotton: `Cotton McKnight: "SUDDEN DEATH OT SINK! ${pName} drains a massive putt on ${holeName}! The crowd is tearing up the tavern stools!"`,
        pepper: `Pepper Reddick: "What a clutch stroke, Cotton! I haven't seen nerves of steel like that since the legendary Biloxi lawnmower racing shootout of '96!"`
      }
    } else {
      return {
        cotton: `Cotton McKnight: "OVERTIME MISS! ${pName} sends it wide! The tension here is thicker than Baltimore harbor fog, Pepper!"`,
        pepper: `Pepper Reddick: "He rushed the stroke, Cotton! That ball traveled in a completely non-Euclidean path. Highly disappointing putting physics!"`
      }
    }
  }

  if (shot.made) {
    const cottonSinks = [
      `Cotton McKnight: "DRAINED! ${pName} sinks a beautiful shot right into ${holeName}!"`,
      `Cotton McKnight: "Boom! Clean hit on ${holeName}! The ${tName} are building major table momentum!"`,
      `Cotton McKnight: "SINK! He whistle-putted that ball right into the bottom of ${holeName}, Pepper!"`,
      `Cotton McKnight: "A perfect stroke! The ball tracking on that putt was pure mathematics!"`
    ]
    const pepperSinks = [
      `Pepper Reddick: "Magnificent dominance, Cotton! That cup stood absolutely no chance against such peak social-athletic power!"`,
      `Pepper Reddick: "Bingo! Sunk it like a squeegee boy wiping clean a windshield in downtown Bmore, Cotton!"`,
      `Pepper Reddick: "Outstanding! That ball had so much spin, Cotton, it practically needed its own zip code!"`,
      `Pepper Reddick: "Bold putting strategy, Cotton, and boy did it pay off! That's how we play the game!"`
    ]
    return {
      cotton: getRandomItem(cottonSinks),
      pepper: getRandomItem(pepperSinks)
    }
  } else {
    const cottonMisses = [
      `Cotton McKnight: "CLANG! ${pName} misses the mark entirely! Not even a rim-out!"`,
      `Cotton McKnight: "Oh! A tragic miss! That ball drifted wide like a tourist looking for a parking spot in Fells Point!"`,
      `Cotton McKnight: "Missed it! The putter angle was completely fictional, Pepper!"`,
      `Cotton McKnight: "He's hit the cushion! The speed coefficient was way off on that stroke!"`
    ]
    const pepperMisses = [
      `Pepper Reddick: "My grandma could have sneezed the ball closer to the cup than that, Cotton!"`,
      `Pepper Reddick: "That putting arm experienced a complete mechanical breakdown, Cotton! Absolute disaster!"`,
      `Pepper Reddick: "They are playing with the urgency of a snail on a coffee break tonight, Cotton! Staggering underperformance!"`,
      `Pepper Reddick: "That ball was trash, Cotton, but not the kind Mr. Trash Wheel likes to munch on!"`
    ]
    return {
      cotton: getRandomItem(cottonMisses),
      pepper: getRandomItem(pepperMisses)
    }
  }
}

// Flatten nested turns into a linear timeline of individual shots
function flattenShots(match) {
  const list = []
  const allTurns = (match.games || []).flatMap(g => g.turns || [])
  if (!allTurns.length) return list

  allTurns.forEach(turn => {
    turn.putts.forEach((putt, puttIdx) => {
      list.push({
        turnNumber: turn.turnNumber,
        teamId: turn.teamId,
        playerId: putt.playerId,
        hole: putt.hole,
        made: putt.made,
        ballBack: turn.ballBack && puttIdx === turn.putts.length - 1,
        overtime: turn.overtime,
        redemption: turn.redemption,
        puttIdx,
        totalPuttsInTurn: turn.putts.length
      })
    })
  })
  return list
}

// Compute claimed holes up to the current shot index
function getBoardStatesAt(shotIdx) {
  const homeBoardClaimed = []
  const awayBoardClaimed = []

  for (let i = 0; i <= shotIdx; i++) {
    const s = replayShots[i]
    if (s.made && s.hole !== 'miss') {
      if (s.teamId === replayMatch.homeTeamId) {
        // Home team sinks a cup on Away's board
        if (!awayBoardClaimed.includes(s.hole)) {
          awayBoardClaimed.push(s.hole)
        }
      } else {
        // Away team sinks a cup on Home's board
        if (!homeBoardClaimed.includes(s.hole)) {
          homeBoardClaimed.push(s.hole)
        }
      }
    }
  }
  return { homeBoardClaimed, awayBoardClaimed }
}

export function openReplayModal(match) {
  replayMatch = match
  replayShots = flattenShots(match)
  currentShotIdx = -1
  isPlaying = false
  speedMultiplier = 1
  if (playbackInterval) clearInterval(playbackInterval)

  // Pre-generate and cache commentary for each shot so that:
  // 1. Commentary is stable/deterministic (doesn't change when stepping back/forth)
  // 2. We can render the complete chronological log of what Cotton & Pepper have said
  replayShots.forEach((shot) => {
    const player = getPlayer(shot.playerId)
    const team = getTeam(shot.teamId)
    shot.commentary = getCommentary(shot, player, team)
  })

  // Render the modal backdrop overlay
  const modal = document.createElement('div')
  modal.id = 'replay-modal'
  modal.className = 'replay-overlay'
  modal.innerHTML = `
    <div class="replay-container">
      <!-- Header -->
      <div class="replay-header">
        <div class="replay-title-badge">
          <span class="replay-live-dot"></span>
          <span class="gradient-text" style="font-family:var(--font-display);font-weight:900;letter-spacing:0.05em">OCHO SIMULATOR DESK</span>
        </div>
        <div class="replay-match-info">${getTeam(match.homeTeamId).name} vs ${getTeam(match.awayTeamId).name}</div>
        <button class="replay-close-btn" id="replay-close-x">✕</button>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="replay-dashboard">
        <!-- Left: Broadcast commentary & log -->
        <div class="replay-broadcast-panel">
          <div class="replay-commentary-box" style="flex: 0 0 auto">
            <div style="font-size:var(--text-xs);font-weight:800;color:var(--gold-400);letter-spacing:0.1em;margin-bottom:var(--space-2)">🎙️ LIVE BROADCAST AUDIO</div>
            
            <div class="speech-bubble cotton-speech">
              <div class="speech-avatar" style="background:#fbbf24;color:#000">C</div>
              <div class="speech-text" id="cotton-audio">"Welcome to ESPN8: The Ocho Match Replay! Hit Play or Step Forward to start the simulation desk, folks!"</div>
            </div>

            <div class="speech-bubble pepper-speech">
              <div class="speech-avatar" style="background:#ec4899;color:#fff">P</div>
              <div class="speech-text" id="pepper-audio">"Oh yes, Cotton! Prepare yourselves for some high-velocity social putting action!"</div>
            </div>
          </div>

          <!-- Broadcast History Log Ticker -->
          <div class="replay-history-box" style="display:flex; flex-direction:column; gap:var(--space-2); background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.06); padding:var(--space-3); border-radius:var(--radius-xl); flex:1; max-height:220px; overflow:hidden">
            <div style="font-size:10px; font-weight:800; color:var(--text-secondary); letter-spacing:0.05em; display:flex; justify-content:space-between; align-items:center">
              <span>📻 LIVE TRANSCRIPT HISTORY</span>
              <span class="badge" id="history-count-badge" style="font-size:9px; background:rgba(255,255,255,0.05); color:var(--text-secondary); padding:2px 6px; border-radius:var(--radius-sm)">1 message</span>
            </div>
            <div id="replay-history-log" style="overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:6px; padding-right:4px">
              <!-- Chronological comments will go here -->
            </div>
          </div>

          <div class="replay-stats-display" style="flex: 0 0 auto">
            <div class="replay-score-row">
              <div class="replay-team-score" style="color:${getTeam(match.homeTeamId).color}">
                <div style="font-size:var(--text-xs);color:var(--text-muted)">${getTeam(match.homeTeamId).name}</div>
                <div class="replay-score-digits" id="home-score-display">0</div>
              </div>
              <div style="font-size:var(--text-2xl);color:var(--text-muted);font-weight:900">—</div>
              <div class="replay-team-score" style="color:${getTeam(match.awayTeamId).color}">
                <div style="font-size:var(--text-xs);color:var(--text-muted)">${getTeam(match.awayTeamId).name}</div>
                <div class="replay-score-digits" id="away-score-display">0</div>
              </div>
            </div>
            
            <div class="replay-shot-detail-badge" id="replay-badge-detail">GAME NOT STARTED</div>
          </div>
        </div>

        <!-- Right: Interactive Vector Boards -->
        <div class="replay-boards-container" id="replay-boards-container">
          <div class="replay-board-wrapper" id="home-board-replay-slot"></div>
          <div class="replay-board-wrapper" id="away-board-replay-slot"></div>
        </div>
      </div>

      <!-- Bottom Control Bar -->
      <div class="replay-controls-bar">
        <div class="replay-timeline-wrapper">
          <span class="replay-timeline-label" id="timeline-current-label">Shot 0 / ${replayShots.length}</span>
          <input type="range" id="replay-scrubber" min="-1" max="${replayShots.length - 1}" value="-1" class="replay-scrubber-slider">
        </div>

        <div class="replay-buttons-row">
          <div class="replay-btn-group">
            <button class="replay-btn" id="replay-btn-reset" title="Reset">🔄</button>
            <button class="replay-btn" id="replay-btn-prev" title="Step Back">⬅️</button>
            <button class="replay-btn replay-btn-play" id="replay-btn-play-pause">▶️ Play</button>
            <button class="replay-btn" id="replay-btn-next" title="Step Forward">➡️</button>
          </div>

          <div class="replay-speed-selector">
            <button class="replay-speed-btn active" data-speed="1">1x</button>
            <button class="replay-speed-btn" data-speed="2">2x</button>
            <button class="replay-speed-btn" data-speed="4">4x</button>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  document.body.style.overflow = 'hidden' // lock page scrolling

  // Initial UI draw
  updateReplayUI()

  // Bind Events
  document.getElementById('replay-close-x').addEventListener('click', destroyReplayModal)
  document.getElementById('replay-btn-reset').addEventListener('click', resetReplay)
  document.getElementById('replay-btn-prev').addEventListener('click', stepBack)
  document.getElementById('replay-btn-next').addEventListener('click', stepForward)
  document.getElementById('replay-btn-play-pause').addEventListener('click', togglePlay)
  document.getElementById('replay-scrubber').addEventListener('input', handleScrub)

  // Live Transcript history click navigation!
  const historyLog = document.getElementById('replay-history-log')
  if (historyLog) {
    historyLog.addEventListener('click', (e) => {
      const row = e.target.closest('.history-log-row')
      if (row) {
        pausePlayback()
        currentShotIdx = parseInt(row.dataset.shotIdx)
        updateReplayUI()
      }
    })
  }

  document.querySelectorAll('.replay-speed-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.replay-speed-btn').forEach(b => b.classList.remove('active'))
      e.target.classList.add('active')
      speedMultiplier = parseInt(e.target.dataset.speed)
      if (isPlaying) {
        pausePlayback()
        startPlayback()
      }
    })
  })

  // Keyboard controls
  window.addEventListener('keydown', handleReplayKeyboard)
}

export function destroyReplayModal() {
  if (playbackInterval) clearInterval(playbackInterval)
  window.removeEventListener('keydown', handleReplayKeyboard)
  const modal = document.getElementById('replay-modal')
  if (modal) modal.remove()
  document.body.style.overflow = '' // release scrolling lock
}

function updateReplayUI() {
  const scrubber = document.getElementById('replay-scrubber')
  const timelineLabel = document.getElementById('timeline-current-label')
  if (scrubber) scrubber.value = currentShotIdx
  if (timelineLabel) timelineLabel.innerText = `Shot ${currentShotIdx + 1} / ${replayShots.length}`

  const { homeBoardClaimed, awayBoardClaimed } = getBoardStatesAt(currentShotIdx)
  
  const homeTeam = getTeam(replayMatch.homeTeamId)
  const awayTeam = getTeam(replayMatch.awayTeamId)

  // Current active shot details
  const activeShot = currentShotIdx >= 0 ? replayShots[currentShotIdx] : null
  const activeTeam = activeShot ? activeShot.teamId : null

  const isMobile = window.innerWidth <= 768
  const boardsContainer = document.getElementById('replay-boards-container')
  
  if (boardsContainer) {
    if (isMobile) {
      // Mobile: Render 1 single targeted board
      let targetTeam = awayTeam
      let activePlayerName = 'No active shooter'
      let activePlayerColor = 'var(--text-muted)'
      let activeTeamName = ''
      let claimedCups = awayBoardClaimed
      let boardId = 'away-replay'
      
      if (activeShot) {
        const player = getPlayer(activeShot.playerId)
        const team = getTeam(activeShot.teamId)
        activePlayerName = player ? player.name : 'Unknown'
        activePlayerColor = team ? team.color : '#fff'
        activeTeamName = team ? team.name : ''
        
        if (activeShot.teamId === replayMatch.homeTeamId) {
          // Home team is putting at Away's board
          targetTeam = awayTeam
          claimedCups = awayBoardClaimed
          boardId = 'away-replay'
        } else {
          // Away team is putting at Home's board
          targetTeam = homeTeam
          claimedCups = homeBoardClaimed
          boardId = 'home-replay'
        }
      } else {
        // Default before game starts: Home team shoots at Away's board
        targetTeam = awayTeam
        claimedCups = awayBoardClaimed
        boardId = 'away-replay'
        const firstShot = replayShots[0]
        if (firstShot) {
          const player = getPlayer(firstShot.playerId)
          activePlayerName = player ? player.name : 'Unknown'
        }
        activePlayerColor = homeTeam.color
        activeTeamName = homeTeam.name
      }
      
      const remainingCups = 6 - claimedCups.length
      
      boardsContainer.innerHTML = `
        <div class="mobile-board-wrapper animate-in" style="width: 100%; display: flex; flex-direction: column; gap: var(--space-2)">
          <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); text-align: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.2)">
            <div style="font-size: 10px; font-weight: 800; color: ${targetTeam.color}; text-transform: uppercase; letter-spacing: 0.05em">
              🎯 TARGET: ${targetTeam.name}'s board (${remainingCups} cups left)
            </div>
            <div style="font-size: var(--text-xs); color: #fff; margin-top: 2px">
              🏌️‍♂️ SHOOTER: <span style="color: ${activePlayerColor}; font-weight: 700">${activePlayerName}</span> ${activeTeamName ? `(${activeTeamName})` : ''}
            </div>
          </div>
          <div class="replay-board-wrapper" style="max-width: 250px; margin: 0 auto; width: 100%">
            ${renderSingleBoard(targetTeam.name, targetTeam.color, claimedCups, activePlayerColor, {
              active: true,
              boardId: boardId
            })}
          </div>
        </div>
      `
    } else {
      // Desktop: Render both boards side-by-side
      const homeBoardHtml = renderSingleBoard(homeTeam.name, homeTeam.color, homeBoardClaimed, awayTeam.color, {
        active: activeTeam === 'away', // Away is putting at Home's board
        boardId: 'home-replay'
      })

      const awayBoardHtml = renderSingleBoard(awayTeam.name, awayTeam.color, awayBoardClaimed, homeTeam.color, {
        active: activeTeam === 'home', // Home is putting at Away's board
        boardId: 'away-replay'
      })

      boardsContainer.innerHTML = `
        <div class="replay-board-wrapper" id="home-board-replay-slot">${homeBoardHtml}</div>
        <div class="replay-board-wrapper" id="away-board-replay-slot">${awayBoardHtml}</div>
      `
    }
  }

  // Update running scoreboard
  const homeScoreDisplay = document.getElementById('home-score-display')
  const awayScoreDisplay = document.getElementById('away-score-display')
  if (homeScoreDisplay) homeScoreDisplay.innerText = awayBoardClaimed.length
  if (awayScoreDisplay) awayScoreDisplay.innerText = homeBoardClaimed.length

  // Highlight targeted cup if active
  if (activeShot && activeShot.made && activeShot.hole !== 'miss') {
    const targetedBoard = activeShot.teamId === replayMatch.homeTeamId ? 'away-replay' : 'home-replay'
    const targetCupEl = document.querySelector(`[data-board-id="${targetedBoard}"] [data-hole="${activeShot.hole}"]`)
    if (targetCupEl) {
      targetCupEl.classList.add('flash-hit')
    }
  }

  // Update dynamic commentary
  const badgeDetail = document.getElementById('replay-badge-detail')
  const cottonAudio = document.getElementById('cotton-audio')
  const pepperAudio = document.getElementById('pepper-audio')

  if (activeShot) {
    const player = getPlayer(activeShot.playerId)
    const team = getTeam(activeShot.teamId)
    const pName = player ? player.name : 'Unknown player'
    const tName = team ? team.name : 'Unknown team'

    let phaseLabel = `Turn ${activeShot.turnNumber} · Shot ${activeShot.puttIdx + 1}/${activeShot.totalPuttsInTurn}`
    if (activeShot.redemption) phaseLabel = `⚡ REDEMPTION · ${phaseLabel}`
    if (activeShot.overtime) phaseLabel = `🔥 OVERTIME · ${phaseLabel}`

    if (badgeDetail) {
      badgeDetail.innerHTML = `<span style="color:${team.color}">${pName} (${tName})</span> puts at <strong>${activeShot.hole.replace('-', ' ')}</strong>... ${activeShot.made ? '<span style="color:var(--green-400)">SINK! ✅</span>' : '<span style="color:var(--pink-400)">MISS ❌</span>'}`
    }

    // Speech bubbles (utilizing cached commentaries for consistency)
    const commentary = activeShot.commentary
    if (cottonAudio) cottonAudio.innerText = commentary.cotton
    if (pepperAudio) pepperAudio.innerText = commentary.pepper
  } else {
    if (badgeDetail) badgeDetail.innerText = 'GAME READY · PRESS PLAY'
    if (cottonAudio) cottonAudio.innerText = 'Cotton McKnight: "Welcome to ESPN8: The Ocho Match Replay! Hit Play or Step Forward to start the simulation desk, folks!"'
    if (pepperAudio) pepperAudio.innerText = 'Pepper Reddick: "Oh yes, Cotton! Prepare yourselves for some high-velocity social putting action!"'
  }

  // Update Live Transcript History Log
  const historyLogContainer = document.getElementById('replay-history-log')
  const historyCountBadge = document.getElementById('history-count-badge')
  if (historyLogContainer) {
    let logHtml = ''
    
    // Add Intro Row
    const isIntroActive = currentShotIdx === -1
    logHtml += `
      <div class="history-log-row ${isIntroActive ? 'active-history-row' : ''}" data-shot-idx="-1" style="cursor:pointer; display:flex; gap:8px; padding:6px 8px; border-radius:var(--radius-md); border-left:3px solid var(--gold-400); background:${isIntroActive ? 'rgba(251,191,36,0.06)' : 'rgba(0,0,0,0.15)'}; margin-bottom:4px">
        <div style="font-size:9px; font-weight:900; color:var(--gold-400); background:rgba(251,191,36,0.15); width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0">🎙️</div>
        <div style="font-size:10px; font-style:italic; color:${isIntroActive ? '#fff' : 'var(--text-secondary)'}; line-height:1.3">
          <strong>ESPN8 Intro:</strong> Welcome to the Ocho Match Replay Simulator Desk! Hit Play to start the broadcast.
        </div>
      </div>
    `
    
    // Add all broadcasted commentaries up to the current shot index
    let totalMessages = 0
    for (let i = 0; i <= currentShotIdx; i++) {
      const shot = replayShots[i]
      if (shot && shot.commentary) {
        const isCurrentShot = i === currentShotIdx
        totalMessages += 2
        
        // Cotton's comment
        logHtml += `
          <div class="history-log-row ${isCurrentShot ? 'active-history-row' : ''}" data-shot-idx="${i}" style="cursor:pointer; display:flex; gap:8px; padding:6px 8px; border-radius:var(--radius-md); border-left:3px solid #fbbf24; background:${isCurrentShot ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.02)'}; margin-bottom:2px">
            <div style="font-size:9px; font-weight:900; color:#fbbf24; background:rgba(251,191,36,0.15); width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0">C</div>
            <div style="font-size:10px; font-style:italic; color:${isCurrentShot ? '#fff' : 'var(--text-primary)'}; line-height:1.3; flex:1">
              <strong>Shot ${i+1}:</strong> ${shot.commentary.cotton.replace(/^Cotton McKnight:\s*"/, '').replace(/"$/, '')}
            </div>
          </div>
        `
        
        // Pepper's comment
        logHtml += `
          <div class="history-log-row ${isCurrentShot ? 'active-history-row' : ''}" data-shot-idx="${i}" style="cursor:pointer; display:flex; gap:8px; padding:6px 8px; border-radius:var(--radius-md); border-left:3px solid #ec4899; background:${isCurrentShot ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.02)'}; margin-bottom:4px">
            <div style="font-size:9px; font-weight:900; color:#ec4899; background:rgba(236,72,153,0.15); width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0">P</div>
            <div style="font-size:10px; font-style:italic; color:${isCurrentShot ? '#fff' : 'var(--text-primary)'}; line-height:1.3; flex:1">
              <strong>Shot ${i+1}:</strong> ${shot.commentary.pepper.replace(/^Pepper Reddick:\s*"/, '').replace(/"$/, '')}
            </div>
          </div>
        `
      }
    }
    
    historyLogContainer.innerHTML = logHtml
    if (historyCountBadge) {
      historyCountBadge.innerText = `${totalMessages + 1} broadcast messages`
    }
    
    // Auto-scroll logic: scroll the active item (or the end) into view smoothly
    const activeRow = historyLogContainer.querySelector('.active-history-row')
    if (activeRow) {
      setTimeout(() => {
        activeRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)
    }
  }
}

function handleScrub(e) {
  pausePlayback()
  currentShotIdx = parseInt(e.target.value)
  updateReplayUI()
}

function stepForward() {
  if (currentShotIdx < replayShots.length - 1) {
    currentShotIdx++
    updateReplayUI()
  } else {
    pausePlayback()
  }
}

function stepBack() {
  if (currentShotIdx >= 0) {
    currentShotIdx--
    updateReplayUI()
  }
}

function resetReplay() {
  pausePlayback()
  currentShotIdx = -1
  updateReplayUI()
}

function startPlayback() {
  isPlaying = true
  const playBtn = document.getElementById('replay-btn-play-pause')
  if (playBtn) playBtn.innerText = '⏸️ Pause'
  
  const tickRate = 2200 / speedMultiplier
  playbackInterval = setInterval(() => {
    if (currentShotIdx < replayShots.length - 1) {
      stepForward()
    } else {
      pausePlayback()
    }
  }, tickRate)
}

function pausePlayback() {
  isPlaying = false
  const playBtn = document.getElementById('replay-btn-play-pause')
  if (playBtn) playBtn.innerText = '▶️ Play'
  if (playbackInterval) {
    clearInterval(playbackInterval)
    playbackInterval = null
  }
}

function togglePlay() {
  if (isPlaying) {
    pausePlayback()
  } else {
    if (currentShotIdx === replayShots.length - 1) {
      currentShotIdx = -1 // loop back to beginning
    }
    startPlayback()
  }
}

function handleReplayKeyboard(e) {
  if (e.key === ' ') {
    e.preventDefault()
    togglePlay()
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    stepForward()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    stepBack()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    destroyReplayModal()
  }
}
