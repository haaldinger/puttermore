import './style.css'
import { renderHome, setSelectedLeague, getHomeTickerText } from './pages/home.js'
import { renderStandings, renderSchedule, renderTeams, renderTeamProfile, renderPlayersPage, renderPlayerProfile, renderMatchDetail, setPlayersViewMode, renderHelpPage, getCaddyAdvice } from './pages/pages.js'
import { renderScorer, handleScorerEvents, initScorer, getScorerTickerData } from './pages/scorer.js'
import { getPlayer, getAllMatches } from './data.js'
import { openReplayModal } from './pages/replay.js'

const app = document.getElementById('app')

const NAV_HTML = `
<nav class="navbar" id="main-nav">
  <div class="navbar-logo" data-nav="" style="cursor:pointer">
    <img src="/images/puttermore.png" alt="Puttermore" onerror="this.style.display='none'">
    <span class="gradient-text">PUTTERMORE</span>
  </div>
  <div class="navbar-links">
    <a data-nav="" data-page="home">Home</a>
    <a data-nav="standings" data-page="standings">Standings</a>
    <a data-nav="schedule" data-page="schedule">Schedule</a>
    <a data-nav="teams" data-page="teams">Teams</a>
    <a data-nav="players" data-page="players">Players</a>
    <a data-nav="help" data-page="help">How to Play</a>
    <a data-nav="scorer" data-page="scorer">🎯 Scorer</a>
  </div>
</nav>
<div id="global-ticker-container"></div>
<div class="bottom-tabs" id="bottom-tabs">
  <button class="tab-btn" data-nav="" data-page="home"><span class="tab-icon">🏠</span>Home</button>
  <button class="tab-btn" data-nav="standings" data-page="standings"><span class="tab-icon">📊</span>Standings</button>
  <button class="tab-btn" data-nav="scorer" data-page="scorer"><span class="tab-icon">🎯</span>Score</button>
  <button class="tab-btn" data-nav="teams" data-page="teams"><span class="tab-icon">👥</span>Teams</button>
  <button class="tab-btn" data-nav="players" data-page="players"><span class="tab-icon">🏆</span>Players</button>
</div>`

function getRoute() {
  const hash = location.hash.replace('#/', '').replace('#', '')
  if (!hash) return { page: 'home', param: null }
  const parts = hash.split('/')
  return { page: parts[0], param: parts[1] || null }
}

let lastRouteKey = ''

function updateGlobalTicker(page) {
  const container = document.getElementById('global-ticker-container')
  if (!container) return
  
  let newHtml = ''
  if (page === 'scorer') {
    const ticker = getScorerTickerData()
    if (ticker) {
      newHtml = `<div class="ocho-ticker-global" style="display: flex; align-items: center; gap: var(--space-3); background: rgba(251, 191, 36, 0.06); border-bottom: 1px dashed rgba(251, 191, 36, 0.2); padding: var(--space-2) var(--space-4); font-size: var(--text-xs); color: #fff; box-shadow: 0 4px 16px rgba(251, 191, 36, 0.02)">
        <span class="badge" id="scorer-ticker-badge" style="background: ${ticker.badgeColor}; color: #000; font-weight: 800; font-family: var(--font-display); letter-spacing: 0.05em; padding: 2px 8px; flex-shrink: 0; box-shadow: 0 0 8px rgba(251,191,36,0.3); transition: all 0.3s ease">${ticker.badgeText}</span>
        <marquee id="scorer-ticker-marquee" scrollamount="4.5" style="font-style: italic; color: rgba(255,255,255,0.9); width: 100%">${ticker.text}</marquee>
      </div>`
    }
  } else {
    const text = getHomeTickerText()
    newHtml = `<div class="ocho-ticker-global" style="display: flex; align-items: center; gap: var(--space-3); background: rgba(251, 191, 36, 0.06); border-bottom: 1px dashed rgba(251, 191, 36, 0.2); padding: var(--space-2) var(--space-4); font-size: var(--text-xs); color: #fff; box-shadow: 0 4px 16px rgba(251, 191, 36, 0.02)">
      <span class="badge" style="background: var(--gold-400); color: #000; font-weight: 800; font-family: var(--font-display); letter-spacing: 0.05em; padding: 2px 8px; flex-shrink: 0; box-shadow: 0 0 8px rgba(251,191,36,0.3)">🎙️ LIVE OCHO TICKER</span>
      <marquee scrollamount="5.5" style="font-style: italic; color: rgba(255,255,255,0.9); width: 100%">${text}</marquee>
    </div>`
  }
  
  if (container.innerHTML !== newHtml) {
    container.innerHTML = newHtml
  }
}

function render() {
  const { page, param } = getRoute()
  const currentRouteKey = `${page}-${param || ''}`
  let content = ''

  try {
    switch (page) {
      case 'home': content = renderHome(); break
      case 'standings': content = renderStandings(); break
      case 'schedule': content = renderSchedule(); break
      case 'teams': content = renderTeams(); break
      case 'team': content = renderTeamProfile(param); break
      case 'players': content = renderPlayersPage(); break
      case 'player': content = renderPlayerProfile(param); break
      case 'match': content = renderMatchDetail(param); break
      case 'scorer': content = renderScorer(); break
      case 'help': content = renderHelpPage(); break
      default: content = renderHome()
    }
  } catch (err) {
    console.error('Render error:', err)
    content = `<div class="page container"><div class="card-glass text-center" style="padding:var(--space-12)">
      <h2>Something went wrong</h2><p class="text-muted" style="margin-top:var(--space-2)">${err.message}</p>
      <button class="btn btn-primary" style="margin-top:var(--space-4)" data-nav="">Go Home</button>
    </div></div>`
  }

  // Preserve the navbar, global ticker container, and bottom tabs
  if (!document.getElementById('main-nav')) {
    app.innerHTML = NAV_HTML + '<main id="page-content"></main>'
  }
  
  const pageContentEl = document.getElementById('page-content')
  if (pageContentEl) {
    pageContentEl.innerHTML = content
  }

  updateGlobalTicker(page)
  updateActiveNav(page)

  if (currentRouteKey !== lastRouteKey) {
    window.scrollTo(0, 0)
    lastRouteKey = currentRouteKey
  }
}

function updateActiveNav(page) {
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page)
  })
}

function navigate(path) {
  location.hash = '#/' + path
}

// ─── Event Delegation ───
document.addEventListener('click', (e) => {
  // Replay Simulator button
  const playReplayBtn = e.target.closest('#play-replay-btn')
  if (playReplayBtn && playReplayBtn.dataset.matchId) {
    const match = getAllMatches().find(m => m.id === playReplayBtn.dataset.matchId)
    if (match) {
      openReplayModal(match)
    }
    return
  }

  // League tab switching
  const leagueTab = e.target.closest('.league-tab')
  if (leagueTab && leagueTab.dataset.league) {
    setSelectedLeague(leagueTab.dataset.league)
    const { page } = getRoute()
    // Re-render current page without scroll
    let content = ''
    try {
      switch (page) {
        case 'home': content = renderHome(); break
        case 'standings': content = renderStandings(); break
        case 'schedule': content = renderSchedule(); break
        case 'teams': content = renderTeams(); break
        case 'players': content = renderPlayersPage(); break
        default: content = renderHome()
      }
    } catch (err) { content = renderHome() }
    
    // Non-destructive content update to keep global ticker running!
    const pageContentEl = document.getElementById('page-content')
    if (pageContentEl) {
      pageContentEl.innerHTML = content
    }
    updateGlobalTicker(page)
    updateActiveNav(page)
    return
  }
  
  // Interactive Caddy Desk target cups (Help page)
  const helpCup = e.target.closest('[data-help-hole]')
  if (helpCup) {
    const holeId = helpCup.dataset.helpHole
    document.querySelectorAll('[data-help-hole]').forEach(el => el.classList.remove('active'))
    helpCup.classList.add('active')

    const adviceTextEl = document.getElementById('caddy-advice-text')
    if (adviceTextEl) {
      const advice = getCaddyAdvice(holeId)
      adviceTextEl.innerHTML = `
        <strong>${advice.cotton.split(': "')[0]}:</strong> "${advice.cotton.split(': "')[1]}<br/><br/>
        <strong>${advice.pepper.split(': "')[0]}:</strong> "${advice.pepper.split(': "')[1]}
      `
    }
    return
  }

  // Collapsible FAQ Accordion Toggles (Help page)
  const faqHeader = e.target.closest('.faq-item-header')
  if (faqHeader) {
    const item = faqHeader.closest('.faq-item')
    const isActive = item.classList.contains('active')
    
    // Reset all FAQ items to collapsed
    document.querySelectorAll('.faq-item').forEach(el => {
      el.classList.remove('active')
      el.querySelector('.faq-toggle-icon').innerText = '＋'
    })

    if (!isActive) {
      item.classList.add('active')
      faqHeader.querySelector('.faq-toggle-icon').innerText = '－'
    }
    return
  }
  
  // View mode toggling (Players page)
  const viewModeBtn = e.target.closest('.view-mode-btn')
  if (viewModeBtn && viewModeBtn.dataset.mode) {
    setPlayersViewMode(viewModeBtn.dataset.mode)
    render()
    return
  }

  // Scorer-specific events
  if (handleScorerEvents(e)) {
    render()
    return
  }

  // Navigation via data-nav attribute
  const navEl = e.target.closest('[data-nav]')
  if (navEl && navEl.dataset.nav !== undefined) {
    e.preventDefault()
    navigate(navEl.dataset.nav)
  }
})

// ─── Router ───
window.addEventListener('hashchange', render)
window.addEventListener('DOMContentLoaded', render)

// Initial render
render()

// ─── High-Performance Active Light-Follow Cards ───
document.addEventListener('mousemove', (e) => {
  const card = e.target.closest('.card, .stat-card, .match-pick-item');
  if (card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }
});
