/**
 * Interactive Putting Board — SVG component
 * 6-hole pyramid: 3 back, 2 middle, 1 front
 * Now supports DUAL boards (each team has their own 6 cups)
 */

const HOLE_POSITIONS = {
  'back-1':   { cx: 60,  cy: 50 },
  'back-2':   { cx: 120, cy: 50 },
  'back-3':   { cx: 180, cy: 50 },
  'middle-1': { cx: 90,  cy: 110 },
  'middle-2': { cx: 150, cy: 110 },
  'front-1':  { cx: 120, cy: 170 },
}

const HOLE_RADIUS = 22
const PUCK_RADIUS = 18

/**
 * Render a SINGLE team's board (their cups)
 * claimedHoles = holes the OPPONENT has sunk on this board
 * attackerColor = color of the team who sunk the cups
 * interactive = can tap to claim holes (when opponent is putting)
 */
export function renderSingleBoard(teamName, teamColor, claimedHoles = [], attackerColor = '#fff', opts = {}) {
  const { interactive = false, active = false, overtime = false, boardId = 'board', inverted = false } = opts
  const claimed = new Set(claimedHoles)

  // When inverted, flip Y so F1 is at top and back row at bottom (like facing the other board)
  const flipY = (y) => inverted ? 220 - y : y

  let holesHtml = ''
  Object.entries(HOLE_POSITIONS).forEach(([holeId, pos]) => {
    const isClaimed = claimed.has(holeId)
    const cy = flipY(pos.cy)

    holesHtml += `<circle cx="${pos.cx}" cy="${cy}" r="${HOLE_RADIUS}" fill="#1a1a1a" stroke="${isClaimed ? attackerColor + '66' : '#333'}" stroke-width="2"/>`

    if (isClaimed) {
      holesHtml += `<circle class="board-puck" cx="${pos.cx}" cy="${cy}" r="${PUCK_RADIUS}" fill="${attackerColor}" opacity="0.85"/>`
      holesHtml += `<text x="${pos.cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="10" font-weight="700" font-family="Outfit" pointer-events="none">✓</text>`
    } else if (interactive) {
      holesHtml += `<circle class="board-hole" cx="${pos.cx}" cy="${cy}" r="${HOLE_RADIUS}" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-dasharray="4 3" data-hole="${holeId}" data-board="${boardId}" style="cursor:pointer" pointer-events="all"/>`
    } else {
      holesHtml += `<circle cx="${pos.cx}" cy="${cy}" r="${PUCK_RADIUS}" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="4 3"/>`
    }
 
    if (!isClaimed) {
      const row = holeId.startsWith('back') ? 'B' : holeId.startsWith('mid') ? 'M' : 'F'
      const num = holeId.split('-')[1]
      holesHtml += `<text x="${pos.cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.2)" font-size="9" font-weight="600" font-family="Inter" pointer-events="none">${row}${num}</text>`
    }
  })

  const otLabel = overtime ? `<text x="120" y="${flipY(215)}" text-anchor="middle" fill="#fbbf24" font-size="10" font-weight="700" font-family="Outfit">⚡ OT</text>` : ''

  const borderColor = active ? teamColor : 'rgba(255,255,255,0.08)'
  const glowFilter = active ? `filter: drop-shadow(0 0 12px ${teamColor}33);` : 'opacity: 0.7;'
  const score = claimedHoles.length

  const header = `<div class="dual-board-header">
      <span class="team-dot" style="background:${teamColor}"></span>
      <span class="dual-board-label">${teamName}</span>
      <span class="dual-board-score">${6 - score} left</span>
    </div>`

  const svg = `<svg class="board-svg" viewBox="0 0 240 230" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="220" height="210" rx="14" fill="#0d1f0d" stroke="${borderColor}" stroke-width="${active ? 2 : 1}"/>
      ${holesHtml}
      ${otLabel}
    </svg>`

  // When inverted, put the header BELOW the board so it's adjacent to the other board's header
  return `<div class="dual-board ${active ? 'active' : ''}" style="${glowFilter}" data-board-id="${boardId}">
    ${inverted ? svg + header : header + svg}
  </div>`
}

/**
 * Render DUAL boards side-by-side (or stacked on mobile)
 * For display purposes (home page, match results)
 */
export function renderBoard(holesWon = {}, homeTeamId, awayTeamId, homeColor, awayColor) {
  // holesWon[homeTeamId] = holes home team sunk on away's board
  // holesWon[awayTeamId] = holes away team sunk on home's board
  const homeBoardClaimed = holesWon[awayTeamId] || [] // away sunk these on home's board
  const awayBoardClaimed = holesWon[homeTeamId] || [] // home sunk these on away's board

  const homeTeam = homeTeamId // We just need the IDs for the static view
  const awayTeam = awayTeamId

  const homeBoard = renderSingleBoard('Home', homeColor, homeBoardClaimed, awayColor, { boardId: 'home' })
  const awayBoard = renderSingleBoard('Away', awayColor, awayBoardClaimed, homeColor, { boardId: 'away' })

  return `<div class="dual-boards">${homeBoard}${awayBoard}</div>`
}

export function getHolePositions() { return HOLE_POSITIONS }
