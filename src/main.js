/**
 * Puttermore — Main Entry Point
 * Hash-based SPA router + navigation
 */
import './style.css'
import { renderHome, setSelectedLeague } from './pages/home.js'
import { renderStandings, renderSchedule, renderTeams, renderTeamProfile, renderPlayersPage, renderPlayerProfile, renderMatchDetail } from './pages/pages.js'
import { renderScorer, handleScorerEvents, initScorer } from './pages/scorer.js'
import { getPlayer } from './data.js'

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
    <a data-nav="scorer" data-page="scorer">🎯 Scorer</a>
  </div>
</nav>
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

function render() {
  const { page, param } = getRoute()
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
      default: content = renderHome()
    }
  } catch (err) {
    console.error('Render error:', err)
    content = `<div class="page container"><div class="card-glass text-center" style="padding:var(--space-12)">
      <h2>Something went wrong</h2><p class="text-muted" style="margin-top:var(--space-2)">${err.message}</p>
      <button class="btn btn-primary" style="margin-top:var(--space-4)" data-nav="">Go Home</button>
    </div></div>`
  }

  app.innerHTML = NAV_HTML + '<main id="page-content">' + content + '</main>'
  updateActiveNav(page)
  window.scrollTo(0, 0)
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
    app.innerHTML = NAV_HTML + '<main id="page-content">' + content + '</main>'
    updateActiveNav(page)
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
