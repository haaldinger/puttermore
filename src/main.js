import './style.css'
import { renderHome, setSelectedLeague, getSelectedLeague, getHomeTickerText, toggleComparedPlayerId, clearComparedPlayerIds, setComparedPlayerIds, getComparedPlayerIds } from './pages/home.js'
import { setTimeOverride, getCurrentDate } from './time.js'
import { 
  renderStandings, renderSchedule, renderTeams, renderTeamProfile, renderPlayersPage, 
  renderPlayerProfile, renderMatchDetail, renderHelpPage, getCaddyAdvice, 
  renderLoginPage, renderPutterGallery, renderAdminPage,
  getActiveAdminTab, setActiveAdminTab, getActiveRosterTeamId, setActiveRosterTeamId,
  getEditingMatchId, setEditingMatchId, getEditingPlayerId, setEditingPlayerId,
  handlePlayersEvents
} from './pages/pages.js'
import { renderScorer, handleScorerEvents, initScorer, getScorerTickerData, showToast } from './pages/scorer.js'
import { getPlayer, getPlayerTeam, getAllMatches, getStandings, getTeamRoster, getAllPlayers, getPlayerStats } from './data.js'
import { openReplayModal, destroyReplayModal } from './pages/replay.js'
import { 
  getLoggedInUser, setLoggedInUser, logout,
  updatePlayerPutter, approveMatch, updateMatch, addPlayer, removePlayer, updatePlayer, assignCaptain
} from './store.js'

const specDetails = {
  classic: {
    material: 'Select Aged Hickory & Solid Brass',
    weight: '345g Lightweight Swing',
    grip: 'Vintage Hand-Wrapped Leather',
    alignment: 'Traditional Brass Sight-Bead',
    shaft: 'Natural Grain Lacquered Wood'
  },
  blade: {
    material: 'Precision-Milled 303 Stainless Steel',
    weight: '355g Standard Balanced',
    grip: 'SuperStroke Pistol GT 1.0',
    alignment: 'Laser-Etched Single Cavity Line',
    shaft: 'Chrome Plated Stepless Steel'
  },
  mallet: {
    material: 'High-MOI Aircraft Grade 6061 Aluminum',
    weight: '375g Heavy Stability',
    grip: 'SuperStroke Flatso 2.0 Claw',
    alignment: 'Triple Wing-Back Contrast Lines',
    shaft: 'Double-Bend Matte Black Steel'
  },
  gold: {
    material: 'Milled Carbon Steel with 24k Gold Electroplating',
    weight: '365g Deluxe Balanced',
    grip: 'Gold-Thread Coiled Cord Wrap',
    alignment: 'High-Contrast Engraved Crown Line',
    shaft: 'Polished Brass-Tone Plated Steel'
  },
  neon: {
    material: 'Translucent Cyber-Polymer & CNC Stainless Sole',
    weight: '350g Medium-Weight Flex',
    grip: 'Fluorescent Glow-Silicone Hex-Traction',
    alignment: 'Integrated Neon LED-Contrast Sightline',
    shaft: 'Iridescent Titanium Nitride Coated'
  },
  stealth: {
    material: 'Anodized Matte Black Titanium Core',
    weight: '360g Tactical Weighted',
    grip: 'Deep Rubberized Anti-Vibration Cord',
    alignment: 'Stealth Ghost Line (Dark-on-Dark)',
    shaft: 'Non-Reflective Matte Black Shaft'
  },
  copper: {
    material: 'Hand-Forged Antique Verdigris Copper',
    weight: '362g Vintage Solid-Feel',
    grip: 'Hand-Wrapped Organic Oak Cork',
    alignment: 'Greenish Patina Center Sightline',
    shaft: 'Oil-Rubbed Antique Bronze Steel'
  },
  carbon: {
    material: 'High-Gloss Formula 1 Carbon Fiber Weave',
    weight: '340g Featherweight Speed',
    grip: 'High-Tack Textured White Silicone',
    alignment: 'Glowing Neon-Yellow Aerodynamic Slots',
    shaft: 'Aerospace White Carbon Composite'
  },
  crystal: {
    material: 'CNC Milled Pure Glacier Sapphire Crystal',
    weight: '348g Crystal Balanced',
    grip: 'Hand-Stitched Suede Leather Wrap',
    alignment: 'Prismatic Glacier Blue LED Alignment',
    shaft: 'Satin Brushed Stainless Steel'
  },
  damascus: {
    material: 'Hand-Welded Folded 110-Layer Damascus Steel',
    weight: '358g Premium Weighted',
    grip: 'Exotic Alligator Leather Cord Wrap',
    alignment: 'Acid-Etched Water-Ripple Wave Lines',
    shaft: 'Mirror-Polished Dark Gunmetal Steel'
  },
  brass: {
    material: 'Solid Lead-Free Brass Mallet Head',
    weight: '380g Heavy Industrial Force',
    grip: 'Thick Hand-Stitched Saddle Leather',
    alignment: 'Exposed Copper Rivets & Dual Gear Dial',
    shaft: 'Industrial Solid Drawn Copper Pipe'
  },
  printed: {
    material: 'SLS 3D-Printed High-Strength Titanium',
    weight: '342g Ultra-Stable Lattice',
    grip: 'Electric Orange Textured Compound',
    alignment: 'Generative Voronoi Structural Lines',
    shaft: 'Matte Charcoal Carbon Composite'
  },
  nasa: {
    material: 'Space-Shuttle Grade Thermal Ceramic Tiles',
    weight: '352g Low-Gravity Swing',
    grip: 'Pressurized Astronaut Glove Leather',
    alignment: 'Polished Gold Polyimide Foil Accent',
    shaft: 'NASA Structural Titanium Alloy'
  },
  diamond: {
    material: 'Mirror-Polished Platinum & 1,200 Pavé Diamonds',
    weight: '368g Super-Luxury Balanced',
    grip: 'Diamond-Studded Black Calfskin Cord',
    alignment: 'Iced-Out Brilliant-Cut Sightline Bead',
    shaft: 'Flawless Chrome-Plated Seamless Platinum'
  },
  obsidian: {
    material: 'CNC-Milled Dark Volcanic Obsidian Glass',
    weight: '350g Sharp Balanced',
    grip: 'Stitched Black Leather with Cross-Stitching',
    alignment: 'Glowing Gold Kintsugi Sightlines',
    shaft: 'High-Performance Matte Carbon Fiber'
  },
  platinum: {
    material: 'Solid Brushed Satin Platinum Core',
    weight: '360g Minimalist Weighted',
    grip: 'Premium Cross-Hatched Black Leather',
    alignment: 'Ultra-Clean Beveled Platinum Lines',
    shaft: 'Mirror-Polished Chrome Plated Steel'
  },
  bamboo: {
    material: 'Carved Natural Bamboo & Solid Brass',
    weight: '344g Eco-Sleek Swing',
    grip: 'Handcrafted Mahogany Leather Wrap',
    alignment: 'Polished Brass Heel-Toe Plugs',
    shaft: 'Natural Finished Dark Walnut Wood'
  },
  ruby: {
    material: 'CNC-Milled Pure Translucent Crimson Ruby',
    weight: '356g Radiant Energy Weight',
    grip: 'Premium Stitched Scarlet Calfskin',
    alignment: 'Refractive Ruby Laser Sightline',
    shaft: 'Ultra-Gloss High-Tensile Carbon Fiber'
  },
  emerald: {
    material: 'Hand-Carved Imperial Green Emerald Stone',
    weight: '362g Crown-Balanced',
    grip: 'Deep Green Saddle-Stitched Suede',
    alignment: 'Polished Gold Perimeter Inlays',
    shaft: 'Brushed Satin Mirror-Finish Chrome'
  },
  titanium: {
    material: 'Aerospace-Grade Sandblasted Titanium',
    weight: '346g Low-Frequency Swing',
    grip: 'Hex-Traction Blue Silicone Wrap',
    alignment: 'Rainbow Anodized Heat-Weld Accents',
    shaft: 'Cobalt-Blue Stepless Stainless Steel'
  },
  bronze: {
    material: 'Antique Hand-Weathered Solid Bronze',
    weight: '370g Heavy Traditional Force',
    grip: 'Distressed Brown Full-Grain Leather',
    alignment: 'Turquoise Verdigris Patina Highlights',
    shaft: 'Natural Stained Mountain Hickory Wood'
  },
  amber: {
    material: 'Translucent Fossilized Baltic Orange Amber',
    weight: '342g Warm Resonant Swing',
    grip: 'Hand-Burnished Cognac Leather Cord',
    alignment: 'Suspended Golden Flake Center Bead',
    shaft: 'Matte-Black Ultra-Stiff Carbon Fiber'
  }
}

export function openPutterLightbox(playerId) {
  let overlay = document.getElementById('putter-lightbox')
  if (!overlay) {
    overlay = document.createElement('div')
    overlay.className = 'lightbox-overlay'
    overlay.id = 'putter-lightbox'
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(6, 6, 6, 0.94); backdrop-filter: blur(24px);
      z-index: 10000; display: flex; align-items: center; justify-content: center;
      padding: var(--space-4); overflow-y: auto;
      animation: fadeIn var(--duration-normal) var(--ease-out);
    `
    document.body.appendChild(overlay)
    document.body.style.overflow = 'hidden'
  }

  // Save active player ID on overlay dataset for transitions
  overlay.dataset.activePlayerId = playerId

  const player = getPlayer(playerId)
  if (!player) return
  const team = getPlayerTeam(playerId)
  const type = player.putterType || 'blade'
  const name = player.putterName || 'The Baltimore Blade'
  const desc = player.putterDesc || 'A reliable steel blade putter selected to dominate the concrete brewery carpets.'
  
  const specs = specDetails[type] || specDetails.blade
  const imageSrc = player.putterImage || `/images/putter_${type}.png`
  
  const content = `
    <!-- Injected Navigation and Responsive Card Styles -->
    <style>
      .lightbox-nav-btn {
        position: absolute; top: 50%; transform: translateY(-50%); 
        width: 50px; height: 50px; border-radius: 50%; 
        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
        backdrop-filter: blur(12px); color: #fff; font-size: var(--text-2xl); 
        font-weight: bold; cursor: pointer; display: flex; align-items: center; 
        justify-content: center; z-index: 101; transition: all var(--duration-fast); 
        box-shadow: 0 8px 32px rgba(0,0,0,0.5); user-select: none;
      }
      .lightbox-nav-btn:hover {
        background: var(--pink-400) !important;
        border-color: var(--pink-400) !important;
        box-shadow: 0 0 20px var(--pink-400) !important;
        transform: translateY(-50%) scale(1.1) !important;
      }
      .lightbox-nav-btn:active {
        transform: translateY(-50%) scale(0.95) !important;
      }
      #close-lightbox-btn:hover {
        background: rgba(255,255,255,0.15) !important;
        transform: scale(1.05) !important;
      }
      @media (max-width: 768px) {
        .lightbox-nav-btn {
          width: 42px !important;
          height: 42px !important;
          font-size: var(--text-xl) !important;
        }
        #prev-lightbox-btn { left: var(--space-2) !important; }
        #next-lightbox-btn { right: var(--space-2) !important; }
        .lightbox-card {
          margin: 0 var(--space-4) !important;
          max-height: 85vh !important;
          overflow-y: auto !important;
        }
      }
    </style>

    <!-- Navigation Buttons -->
    <button id="prev-lightbox-btn" class="lightbox-nav-btn" style="left: var(--space-5)">‹</button>
    <button id="next-lightbox-btn" class="lightbox-nav-btn" style="right: var(--space-5)">›</button>

    <div class="card card-glass lightbox-card animate-in" style="width: 100%; max-width: 720px; background: rgba(18, 18, 18, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-2xl); box-shadow: 0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(233,30,139,0.05); overflow: hidden; display: flex; flex-direction: column; md-flex-direction: row; gap: var(--space-5); padding: var(--space-5); position: relative">
      
      <!-- Close Button -->
      <button id="close-lightbox-btn" style="position: absolute; top: var(--space-3); right: var(--space-3); width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: var(--text-base); font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 100; transition: all var(--duration-fast)">✕</button>
      
      <!-- Putter Photo (Left Column) -->
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.05); border-radius: var(--radius-xl); padding: var(--space-4); min-height: 280px; position: relative">
        <img src="${imageSrc}" alt="${name}" style="max-width: 100%; max-height: 280px; object-fit: contain; filter: drop-shadow(0 12px 36px rgba(0,0,0,0.5))" id="lightbox-putter-img" />
      </div>
      
      <!-- Putter Tech Specs (Right Column) -->
      <div style="flex: 1.2; display: flex; flex-direction: column; text-align: left">
        <div style="font-size: var(--text-xs); color: var(--pink-400); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2px">
          ${team ? `<span class="team-dot" style="background:${team.color}; width: 6px; height: 6px"></span> ${team.name} · ` : ''}${player.name}
        </div>
        <h2 style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-xl); color: #fff; margin-bottom: var(--space-2)">
          ${name}
        </h2>
        <span class="badge badge-pink" style="align-self: flex-start; text-transform: uppercase; font-size: 9px; font-weight: 700; margin-bottom: var(--space-3)">
          Style: ${type}
        </span>
        
        <p style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.6; font-style: italic; background: rgba(0,0,0,0.15); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); border: 1px solid rgba(255,255,255,0.03); margin-bottom: var(--space-4)">
          "${desc}"
        </p>
        
        <h4 style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: #fff; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: var(--space-2); border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 4px">🛠️ Technical Specifications</h4>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-2); font-size: var(--text-xs)">
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.02)">
            <span class="text-secondary" style="font-weight: 600">Material</span>
            <span class="mono" style="color: #fff; font-weight: 700">${specs.material}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.02)">
            <span class="text-secondary" style="font-weight: 600">Weight</span>
            <span class="mono" style="color: var(--pink-400); font-weight: 700">${specs.weight}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.02)">
            <span class="text-secondary" style="font-weight: 600">Shaft</span>
            <span class="mono" style="color: #fff; font-weight: 700">${specs.shaft}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.02)">
            <span class="text-secondary" style="font-weight: 600">Grip type</span>
            <span class="mono" style="color: var(--gold-400); font-weight: 700">${specs.grip}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 4px 0">
            <span class="text-secondary" style="font-weight: 600">Alignment aid</span>
            <span class="mono" style="color: #fff; font-weight: 700">${specs.alignment}</span>
          </div>
        </div>
      </div>
    </div>
  `
  
  overlay.innerHTML = content
}

export function closePutterLightbox() {
  const modal = document.getElementById('putter-lightbox')
  if (modal) {
    modal.style.opacity = '0'
    setTimeout(() => {
      modal.remove()
      document.body.style.overflow = ''
    }, 200)
  }
}

export function openRivalryModal(onApplyCallback) {
  const loggedIn = getLoggedInUser()
  if (!loggedIn) return
  const leagueId = getSelectedLeague()
  const standings = getStandings(leagueId)
  
  const currentRivals = getComparedPlayerIds()
  let tempSelected = new Set(currentRivals)
  
  const overlay = document.createElement('div')
  overlay.className = 'lightbox-overlay'
  overlay.id = 'rivalry-modal'
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(6, 6, 6, 0.94); backdrop-filter: blur(24px);
    z-index: 10000; display: flex; align-items: center; justify-content: center;
    padding: var(--space-4); overflow-y: auto;
    animation: fadeIn var(--duration-normal) var(--ease-out);
  `
  
  function renderModalContent() {
    const teamSectionsHtml = standings.map(s => {
      const team = s.team
      const roster = getTeamRoster(team.id).filter(p => p.id !== loggedIn.id)
      
      if (roster.length === 0) return ''
      
      const playerRowsHtml = roster.map(p => {
        const isSelected = tempSelected.has(p.id)
        const stats = getPlayerStats(p.id)
        const puttingPctText = stats && stats.totalPutts > 0 ? `${(stats.puttingPct * 100).toFixed(0)}%` : '—'
        const initials = p.name.split(' ').map(n=>n[0]).join('')
        
        const controlHtml = `
          <div class="rivalry-custom-checkbox" style="width: 18px; height: 18px; border-radius: var(--radius-sm); border: 2px solid ${isSelected ? 'var(--pink-400)' : 'rgba(255,255,255,0.2)'}; display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast); background: ${isSelected ? 'var(--pink-400)' : 'transparent'}">
            ${isSelected ? `<span style="font-size: 10px; font-weight: 800; color: #000">✓</span>` : ''}
          </div>
        `

        return `
          <div class="rivalry-player-row" data-player-id="${p.id}" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: ${isSelected ? 'rgba(233,30,139,0.06)' : 'rgba(255,255,255,0.02)'}; border: 1px solid ${isSelected ? 'rgba(233,30,139,0.3)' : 'rgba(255,255,255,0.05)'}; border-radius: var(--radius-lg); cursor: pointer; transition: all var(--duration-fast)">
            <div style="display: flex; align-items: center; gap: var(--space-2)">
              <span style="width: 26px; height: 26px; border-radius: 50%; background: ${p.avatarColor}; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: 800; color: #fff; border: 1px solid rgba(255,255,255,0.1)">${initials}</span>
              <div>
                <div style="font-size: var(--text-xs); font-weight: 700; color: #fff">${p.name}</div>
                <div style="font-size: 9px; color: var(--text-muted)">
                  ${team.captainPlayerId === p.id ? '<span style="color:var(--gold-400);font-weight:700">🧢 Captain</span> · ' : ''}Accuracy: <span style="color:var(--pink-300);font-weight:700">${puttingPctText}</span>
                </div>
              </div>
            </div>
            ${controlHtml}
          </div>
        `
      }).join('')

      return `
        <div class="rivalry-team-section" data-team-name="${team.name.toLowerCase()}" style="display: flex; flex-direction: column; gap: var(--space-2)">
          <div style="display: flex; align-items: center; gap: var(--space-2); padding-bottom: 4px; border-bottom: 1px dashed rgba(255,255,255,0.08)">
            <span class="team-dot" style="background: ${team.color}"></span>
            <span style="font-family: var(--font-display); font-weight: 800; font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em">${team.name}</span>
          </div>
          <div style="display: grid; grid-template-columns: 1fr; sm-grid-template-columns: 1fr 1fr; gap: var(--space-2)" class="grid-2">
            ${playerRowsHtml}
          </div>
        </div>
      `
    }).join('')
    
    return `
      <div class="card card-glass animate-in" style="width: 100%; max-width: 640px; background: rgba(18, 18, 18, 0.85); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: var(--radius-2xl); box-shadow: 0 24px 64px rgba(0,0,0,0.8); overflow: hidden; padding: var(--space-5); position: relative; max-height: 85vh; display: flex; flex-direction: column" id="rivalry-modal-card">
        
        <!-- Header -->
        <div style="margin-bottom: var(--space-4); display: flex; justify-content: space-between; align-items: flex-start">
          <div>
            <h3 style="font-family: var(--font-display); font-weight: 900; font-size: var(--text-lg); color: #fff; margin-bottom: 2px">⚖️ Rivalry Radar Filters</h3>
            <p style="font-size: var(--text-xs); color: var(--text-secondary)">Select competitors to compare side-by-side on your rivalry dashboard</p>
          </div>
          <button id="rivalry-modal-close" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: var(--text-xs); font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--duration-fast)">✕</button>
        </div>

        <!-- Search Bar -->
        <div style="display: flex; flex-direction: column; gap: var(--space-3); margin-bottom: var(--space-4)">
          <div style="position: relative">
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: var(--text-xs); opacity: 0.6">🔍</span>
            <input type="text" id="rivalry-search-input" placeholder="Search players or teams..." style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); padding: var(--space-2) var(--space-3) var(--space-2) 32px; border-radius: var(--radius-lg); color: #fff; font-size: var(--text-xs); width: 100%; outline: none; transition: border-color 0.2s" />
          </div>
        </div>

        <!-- Scrollable Player List -->
        <div id="rivalry-players-list-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-4); padding-right: 4px; margin-bottom: var(--space-4)">
          ${teamSectionsHtml}
        </div>

        <!-- Footer Controls -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: var(--space-4)">
          <button class="btn btn-ghost btn-xs" id="rivalry-clear-all" style="color: var(--text-secondary); font-size: var(--text-xs)">Clear Selections</button>
          <div style="display: flex; gap: var(--space-2)">
            <button class="btn btn-secondary btn-sm" id="rivalry-cancel-btn">Cancel</button>
            <button class="btn btn-primary btn-sm" id="rivalry-apply-btn">Apply Filters 🚀</button>
          </div>
        </div>

      </div>
    `
  }

  overlay.innerHTML = renderModalContent()
  document.body.appendChild(overlay)
  document.body.style.overflow = 'hidden'

  // Modal event wiring
  function setupModalListeners() {
    // Close / Cancel
    const closeBtn = overlay.querySelector('#rivalry-modal-close')
    const cancelBtn = overlay.querySelector('#rivalry-cancel-btn')
    const applyBtn = overlay.querySelector('#rivalry-apply-btn')
    const clearBtn = overlay.querySelector('#rivalry-clear-all')
    const searchInput = overlay.querySelector('#rivalry-search-input')

    const dismissModal = () => {
      overlay.style.opacity = '0'
      setTimeout(() => {
        overlay.remove()
        document.body.style.overflow = ''
      }, 200)
    }

    closeBtn.addEventListener('click', dismissModal)
    cancelBtn.addEventListener('click', dismissModal)
    
    // Click outside to close (light dismiss fallback)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        dismissModal()
      }
    })

    // Clear all
    clearBtn.addEventListener('click', () => {
      tempSelected.clear()
      overlay.innerHTML = renderModalContent()
      setupModalListeners()
    })

    // Apply
    applyBtn.addEventListener('click', () => {
      setComparedPlayerIds(Array.from(tempSelected))
      dismissModal()
      if (onApplyCallback) onApplyCallback()
    })

    // Search input
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim()
      overlay.querySelectorAll('.rivalry-player-row').forEach(row => {
        const playerName = row.querySelector('div').innerText.toLowerCase()
        const parentSection = row.closest('.rivalry-team-section')
        const teamName = parentSection.dataset.teamName
        
        if (playerName.includes(query) || teamName.includes(query)) {
          row.style.display = 'flex'
        } else {
          row.style.display = 'none'
        }
      })

      overlay.querySelectorAll('.rivalry-team-section').forEach(section => {
        const visibleRows = Array.from(section.querySelectorAll('.rivalry-player-row')).filter(r => r.style.display !== 'none')
        if (visibleRows.length === 0) {
          section.style.display = 'none'
        } else {
          section.style.display = 'flex'
        }
      })
    })

    // Player row click selection
    overlay.querySelectorAll('.rivalry-player-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const playerId = row.dataset.playerId
        if (tempSelected.has(playerId)) {
          tempSelected.delete(playerId)
        } else {
          tempSelected.add(playerId)
        }
        overlay.innerHTML = renderModalContent()
        setupModalListeners()
      })
    })
  }

  setupModalListeners()
}

const app = document.getElementById('app')

function renderNavbar() {
  const loggedIn = getLoggedInUser()
  let profileHtml = ''
  if (loggedIn) {
    const initials = loggedIn.name.split(' ').map(n=>n[0]).join('')
    const adminCrown = loggedIn.isAdmin ? '👑 ' : ''
    profileHtml = `<button class="btn btn-secondary btn-sm flex items-center gap-2" data-nav="login" style="border-color: var(--pink-400)40; padding: 4px 10px; border-radius: var(--radius-full)">
      <span class="profile-avatar-small" style="background:${loggedIn.avatarColor}; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #fff">${initials}</span>
      <span style="font-size: var(--text-xs); font-weight: 600" class="col-hide-mobile">${adminCrown}${loggedIn.name.split(' ')[0]}</span>
    </button>`
  } else {
    profileHtml = `<button class="btn btn-ghost btn-sm flex items-center gap-1" data-nav="login" style="font-size: var(--text-xs); font-weight: 700; color: var(--gold-400)">
      🔑 <span class="col-hide-mobile">Login</span>
    </button>`
  }

  const adminLink = loggedIn?.isAdmin ? `<a data-nav="admin" data-page="admin" style="color: var(--gold-400); font-weight: 700">👑 Admin</a>` : ''

  return `
  <nav class="navbar" id="main-nav">
    <div class="navbar-logo" data-nav="" style="cursor:pointer">
      <img src="/images/puttermore.png" alt="Puttermore" onerror="this.style.display='none'">
      <span class="gradient-text">PUTTERMORE</span>
    </div>
    <div class="navbar-links" style="display: flex; align-items: center; gap: var(--space-4)">
      <a data-nav="" data-page="home">Home</a>
      <a data-nav="standings" data-page="standings">Standings</a>
      <a data-nav="schedule" data-page="schedule">Schedule</a>
      <a data-nav="teams" data-page="teams">Teams</a>
      <a data-nav="players" data-page="players">Players</a>
      <a data-nav="gallery" data-page="gallery">🏌️‍♂️ Gallery</a>
      ${adminLink}
      <a data-nav="help" data-page="help">How to Play</a>
      <a data-nav="scorer" data-page="scorer">🎯 Scorer</a>
      ${profileHtml}
    </div>
  </nav>
  <div id="global-ticker-container"></div>
  <div class="bottom-tabs" id="bottom-tabs">
    <button class="tab-btn" data-nav="" data-page="home"><span class="tab-icon">🏠</span>Home</button>
    <button class="tab-btn" data-nav="standings" data-page="standings"><span class="tab-icon">📊</span>Standings</button>
    <button class="tab-btn" data-nav="gallery" data-page="gallery"><span class="tab-icon">🏌️‍♂️</span>Gallery</button>
    ${loggedIn?.isAdmin 
      ? `<button class="tab-btn" data-nav="admin" data-page="admin" style="color: var(--gold-400)"><span class="tab-icon">👑</span>Admin</button>`
      : `<button class="tab-btn" data-nav="login" data-page="login"><span class="tab-icon">🔑</span>Profile</button>`
    }
  </div>`
}

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

  // Always destroy replay modal and unlock scrolling on route change/re-render
  destroyReplayModal()
  document.body.style.overflow = ''

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
      case 'login': content = renderLoginPage(); break
      case 'gallery': content = renderPutterGallery(); break
      case 'admin': content = renderAdminPage(); break
      default: content = renderHome()
    }
  } catch (err) {
    console.error('Render error:', err)
    content = `<div class="page container"><div class="card-glass text-center" style="padding:var(--space-12)">
      <h2>Something went wrong</h2><p class="text-muted" style="margin-top:var(--space-2)">${err.message}</p>
      <button class="btn btn-primary" style="margin-top:var(--space-4)" data-nav="">Go Home</button>
    </div></div>`
  }

  // Always update navigation shell to keep logged-in avatar synced
  app.innerHTML = renderNavbar() + '<main id="page-content"></main>'
  
  const pageContentEl = document.getElementById('page-content')
  if (pageContentEl) {
    pageContentEl.innerHTML = content
  }

  updateGlobalTicker(page)
  updateActiveNav(page)

  if (currentRouteKey !== lastRouteKey) {
    window.scrollTo(0, 0)
    document.documentElement.scrollTo(0, 0)
    document.body.scrollTo(0, 0)
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
document.addEventListener('click', (e) => {
  // Lightbox click trigger
  const previewTrigger = e.target.closest('.putter-preview-trigger')
  if (previewTrigger) {
    const playerId = previewTrigger.dataset.lightboxPlayer
    openPutterLightbox(playerId)
    return
  }

  // Lightbox previous navigation button click
  const prevBtn = e.target.closest('#prev-lightbox-btn')
  if (prevBtn) {
    const activeId = document.getElementById('putter-lightbox')?.dataset.activePlayerId
    if (activeId) {
      const allPlayers = getAllPlayers()
      const currIdx = allPlayers.findIndex(p => p.id === activeId)
      if (currIdx !== -1) {
        const prevIdx = (currIdx - 1 + allPlayers.length) % allPlayers.length
        openPutterLightbox(allPlayers[prevIdx].id)
      }
    }
    return
  }

  // Lightbox next navigation button click
  const nextBtn = e.target.closest('#next-lightbox-btn')
  if (nextBtn) {
    const activeId = document.getElementById('putter-lightbox')?.dataset.activePlayerId
    if (activeId) {
      const allPlayers = getAllPlayers()
      const currIdx = allPlayers.findIndex(p => p.id === activeId)
      if (currIdx !== -1) {
        const nextIdx = (currIdx + 1) % allPlayers.length
        openPutterLightbox(allPlayers[nextIdx].id)
      }
    }
    return
  }

  // Lightbox close button click
  const closeLightboxBtn = e.target.closest('#close-lightbox-btn')
  if (closeLightboxBtn) {
    closePutterLightbox()
    return
  }

  // Lightbox backdrop click
  if (e.target.id === 'putter-lightbox') {
    closePutterLightbox()
    return
  }

  // Rivalry Modal Edit Filters click
  const manageRivalsBtn = e.target.closest('#manage-rivals-btn')
  if (manageRivalsBtn) {
    openRivalryModal(render)
    return
  }

  // Remove specific rival chip click
  const removeRivalChip = e.target.closest('[data-remove-rival-id]')
  if (removeRivalChip) {
    const playerId = removeRivalChip.dataset.removeRivalId
    toggleComparedPlayerId(playerId)
    render()
    return
  }

  // Login As profile card click
  const loginAs = e.target.closest('[data-login-as]')
  if (loginAs) {
    const playerId = loginAs.dataset.loginAs
    setLoggedInUser(playerId)
    const player = getPlayer(playerId)
    showToast(`🔑 Logged in as ${player.name}!`)
    navigate('home')
    return
  }

  // Logout button click
  const logoutBtn = e.target.closest('#logout-btn')
  if (logoutBtn) {
    logout()
    showToast('🚪 Logged out successfully!')
    navigate('home')
    return
  }

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

// ─── Custom Putter & Admin Console Event Listeners ───

// 1. Click Listener Delegation
document.addEventListener('click', (e) => {
  // Sandbox quick-select trigger click
  const sandboxTrigger = e.target.closest('.sandbox-trigger')
  if (sandboxTrigger) {
    const mockTime = sandboxTrigger.dataset.timeMock
    setTimeOverride(mockTime)
    showToast('🕰️ Time travel engaged!')
    return
  }

  // Sandbox reset clock click
  const sandboxReset = e.target.closest('#sandbox-reset-clock')
  if (sandboxReset) {
    setTimeOverride(null)
    showToast('🕰️ Clock synced with real-world time!')
    return
  }
  // Putter Customize Edit Mode
  const editBtn = e.target.closest('#edit-putter-btn')
  if (editBtn) {
    document.getElementById('putter-details-card').style.display = 'none'
    document.getElementById('putter-edit-form').style.display = 'block'
    return
  }

  const cancelBtn = e.target.closest('#putter-edit-cancel')
  if (cancelBtn) {
    document.getElementById('putter-details-card').style.display = 'flex'
    document.getElementById('putter-edit-form').style.display = 'none'
    return
  }

  // Swatch Selection inside register new player form
  const swatch = e.target.closest('.add-player-color-swatch')
  if (swatch) {
    const color = swatch.dataset.color
    document.getElementById('add-player-color-picker').value = color
    document.querySelectorAll('.add-player-color-swatch').forEach(s => {
      s.style.borderColor = 'transparent'
    })
    swatch.style.borderColor = '#fff'
    return
  }

  // Admin sub-tab switcher click
  const adminTab = e.target.closest('[data-admin-tab]')
  if (adminTab) {
    setActiveAdminTab(adminTab.dataset.adminTab)
    setEditingMatchId(null)
    setEditingPlayerId(null)
    render()
    return
  }

  // Admin match score edit toggle
  const editScoreBtn = e.target.closest('[data-edit-score-btn]')
  if (editScoreBtn) {
    setEditingMatchId(editScoreBtn.dataset.editScoreBtn)
    render()
    return
  }

  const cancelEditScoreBtn = e.target.closest('[data-cancel-edit-score]')
  if (cancelEditScoreBtn) {
    setEditingMatchId(null)
    render()
    return
  }

  // Admin Save Match Score & Verify & Publish
  const saveScoreBtn = e.target.closest('[data-save-score]')
  if (saveScoreBtn) {
    const matchId = saveScoreBtn.dataset.saveScore
    const homeScore = parseInt(document.getElementById(`edit-home-score-${matchId}`).value)
    const awayScore = parseInt(document.getElementById(`edit-away-score-${matchId}`).value)
    const overtime = document.getElementById(`edit-ot-${matchId}`).checked
    
    updateMatch(matchId, { home: homeScore, away: awayScore }, overtime)
    approveMatch(matchId)
    setEditingMatchId(null)
    showToast('🚀 Match verified and live!')
    render()
    return
  }

  // Admin Quick Match Approval
  const approveMatchBtn = e.target.closest('[data-approve-match]')
  if (approveMatchBtn) {
    const matchId = approveMatchBtn.dataset.approveMatch
    approveMatch(matchId)
    showToast('🚀 Match verified and committed to standings!')
    render()
    return
  }

  // Admin Make Captain
  const assignCapBtn = e.target.closest('[data-assign-captain]')
  if (assignCapBtn) {
    const playerId = assignCapBtn.dataset.assignCaptain
    const teamId = assignCapBtn.dataset.teamId
    assignCaptain(teamId, playerId)
    showToast('🧢 New Captain assigned successfully!')
    render()
    return
  }

  // Admin Player Edit Toggle
  const editPlayerBtn = e.target.closest('[data-edit-player]')
  if (editPlayerBtn) {
    setEditingPlayerId(editPlayerBtn.dataset.editPlayer)
    render()
    return
  }

  const cancelEditPlayerBtn = e.target.closest('[data-cancel-edit-player]')
  if (cancelEditPlayerBtn) {
    setEditingPlayerId(null)
    render()
    return
  }

  // Admin Save Player Metadata
  const savePlayerBtn = e.target.closest('[data-save-player]')
  if (savePlayerBtn) {
    const playerId = savePlayerBtn.dataset.savePlayer
    const name = document.getElementById(`edit-player-name-${playerId}`).value
    const color = document.getElementById(`edit-player-color-${playerId}`).value
    updatePlayer(playerId, name, color)
    setEditingPlayerId(null)
    showToast('👥 Player details updated!')
    render()
    return
  }

  // Admin Remove Player
  const removePlayerBtn = e.target.closest('[data-remove-player]')
  if (removePlayerBtn) {
    const playerId = removePlayerBtn.dataset.removePlayer
    const player = getPlayer(playerId)
    if (confirm(`Are you absolutely sure you want to delete ${player.name} from the league roster?`)) {
      removePlayer(playerId)
      showToast('❌ Player removed from the league.')
      render()
    }
    return
  }

  // Custom Putter Style Grid Card click
  const putterCard = e.target.closest('.putter-type-card')
  if (putterCard) {
    const val = putterCard.dataset.value
    document.getElementById('putter-type-input').value = val
    document.querySelectorAll('.putter-type-card').forEach(card => {
      card.classList.remove('active')
      card.style.borderColor = 'rgba(255,255,255,0.05)'
      card.style.background = 'rgba(0,0,0,0.2)'
    })
    putterCard.classList.add('active')
    putterCard.style.borderColor = 'var(--pink-400)'
    putterCard.style.background = 'rgba(233,30,139,0.1)'
    return
  }

  // Custom Team Dropdown Selector click
  const selectTrigger = e.target.closest('#custom-team-select-trigger')
  if (selectTrigger) {
    const optionsMenu = document.getElementById('custom-team-select-options')
    if (optionsMenu) {
      const isHidden = optionsMenu.style.display === 'none'
      optionsMenu.style.display = isHidden ? 'block' : 'none'
    }
    return
  }

  // Custom Team Dropdown Option click
  const selectOption = e.target.closest('.custom-select-option')
  if (selectOption) {
    const teamId = selectOption.dataset.value
    setActiveRosterTeamId(teamId)
    render()
    return
  }

  // Rivalry Radar competitor toggle click
  const compareToggle = e.target.closest('[data-compare-toggle-player]')
  if (compareToggle) {
    const playerId = compareToggle.dataset.compareTogglePlayer
    toggleComparedPlayerId(playerId)
    render()
    return
  }

  // Rivalry Radar clear all click
  const clearCompare = e.target.closest('#clear-comparison-btn')
  if (clearCompare) {
    clearComparedPlayerIds()
    render()
    return
  }

  // Click outside to close dropdown
  const openMenu = document.getElementById('custom-team-select-options')
  if (openMenu && openMenu.style.display === 'block') {
    if (!e.target.closest('.custom-select-container')) {
      openMenu.style.display = 'none'
    }
  }

  // Players page click handler delegation
  handlePlayersEvents(e)
})

// 2. Submit Listener Delegation
document.addEventListener('submit', (e) => {
  // Putter customizer submission
  if (e.target.id === 'putter-customize-form') {
    e.preventDefault()
    const playerId = e.target.dataset.playerId
    const name = document.getElementById('putter-name-input').value
    const desc = document.getElementById('putter-desc-input').value
    const type = document.getElementById('putter-type-input').value
    const imgData = e.target.dataset.uploadedImage // base64 or undefined
    
    updatePlayerPutter(playerId, name, desc, type, imgData)
    showToast('🏌️‍♂️ Custom putter settings saved!')
    render()
  }

  // Register New Player submission
  if (e.target.id === 'add-player-form') {
    e.preventDefault()
    const teamId = e.target.dataset.teamId
    const name = document.getElementById('add-player-name').value
    const color = document.getElementById('add-player-color-picker').value
    
    addPlayer(teamId, name, color)
    showToast(`👥 ${name} successfully registered to roster!`)
    render()
  }
})

// 4. Change Event Listener (File Uploader reader)
document.addEventListener('change', (e) => {
  if (e.target.id === 'putter-image-upload') {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target.result
        const form = e.target.closest('form')
        if (form) {
          form.dataset.uploadedImage = base64
        }
        const previewImg = document.getElementById('putter-upload-preview-img')
        if (previewImg) {
          previewImg.src = base64
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Players page change handler delegation
  handlePlayersEvents(e)
})

// 3. Input Search Listener (Putter Gallery filter & Sandbox dial)
document.addEventListener('input', (e) => {
  if (e.target.id === 'sandbox-datetime-picker') {
    const val = e.target.value
    if (val) {
      const date = new Date(val)
      setTimeOverride(date.toISOString())
    }
    return
  }

  if (e.target.id === 'putter-gallery-search') {
    const query = e.target.value.toLowerCase().trim()
    document.querySelectorAll('.putter-gallery-card').forEach(card => {
      const searchData = card.dataset.search.toLowerCase()
      if (searchData.includes(query)) {
        card.style.display = 'flex'
      } else {
        card.style.display = 'none'
      }
    })
  }

  // Players page input handler delegation
  handlePlayersEvents(e)
})

// Reactive Time-travel clock shifted event
window.addEventListener('puttermore-time-shifted', render)

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

// ─── Escape & Arrow Keys Overlay Dismiss / Navigation ───
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePutterLightbox()
    const rivalryModal = document.getElementById('rivalry-modal')
    if (rivalryModal) {
      rivalryModal.style.opacity = '0'
      setTimeout(() => {
        rivalryModal.remove()
        document.body.style.overflow = ''
      }, 200)
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const lightbox = document.getElementById('putter-lightbox')
    if (lightbox) {
      const activeId = lightbox.dataset.activePlayerId
      if (activeId) {
        const allPlayers = getAllPlayers()
        const currIdx = allPlayers.findIndex(p => p.id === activeId)
        if (currIdx !== -1) {
          const nextIdx = e.key === 'ArrowRight' 
            ? (currIdx + 1) % allPlayers.length 
            : (currIdx - 1 + allPlayers.length) % allPlayers.length
          openPutterLightbox(allPlayers[nextIdx].id)
        }
      }
    }
  }
})

// ─── Countdown Clock Tick Loop ───
setInterval(() => {
  const displays = document.querySelectorAll('.countdown-timer-display');
  displays.forEach(display => {
    const targetStr = display.dataset.countdownTarget;
    if (!targetStr) return;
    
    const target = new Date(targetStr);
    const now = getCurrentDate(); // Simulated or real
    
    const diff = target.getTime() - now.getTime();
    
    let days = 0, hours = 0, mins = 0, secs = 0;
    if (diff > 0) {
      days = Math.floor(diff / (1000 * 60 * 60 * 24));
      hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      mins = Math.floor((diff / (1000 * 60)) % 60);
      secs = Math.floor((diff / 1000) % 60);
    }
    
    const dEl = display.querySelector('#countdown-days');
    const hEl = display.querySelector('#countdown-hours');
    const mEl = display.querySelector('#countdown-mins');
    const sEl = display.querySelector('#countdown-secs');
    
    if (dEl) dEl.textContent = String(days).padStart(2, '0');
    if (hEl) hEl.textContent = String(hours).padStart(2, '0');
    if (mEl) mEl.textContent = String(mins).padStart(2, '0');
    if (sEl) sEl.textContent = String(secs).padStart(2, '0');
  });
}, 1000);
