# Puttermore — Social League Web App

**Sink 'em. Drink 'em.** A 6-week social putting league in Baltimore, hosted at local breweries.

---

## Brand Intelligence

From [puttermore.com](https://puttermore.com) and @puttermore23 (538 followers, 230 posts):

| Attribute | Detail |
|---|---|
| **Tagline** | "Meet. Compete. Repeat." |
| **Mission** | Facilitate connections through fun competition in Baltimore |
| **Formats** | Local Social Leagues, Corporate Outings, Networking Happy Hours, Fundraisers |
| **Venues** | Mobtown Brewing, Heavy Seas, 1623 Brewing |
| **Sponsors** | Gridiron Golf, Huck's American Craft, Gilbert's Jerky, 369 Financial |
| **Vibe** | Beer pong meets mini putt on artificial turf. Social-first, skill-optional |
| **League Size** | 9 teams, 2-3 players per team, 6-week seasons |

---

## Game Mechanics Deep-Dive

This is critical to get right — it drives the entire data model.

```
┌─────────────────────────────────────────┐
│              THE BOARD                  │
│                                         │
│   ┌───┐  ┌───┐  ┌───┐                 │
│   │ 3 │  │ 3 │  │ 3 │  ← Back Row     │
│   └───┘  └───┘  └───┘    (3 holes)     │
│                                         │
│      ┌───┐     ┌───┐                   │
│      │ 2 │     │ 2 │    ← Middle Row   │
│      └───┘     └───┘      (2 holes)    │
│                                         │
│         ┌───┐                           │
│         │ 1 │            ← Front Row    │
│         └───┘              (1 hole)     │
│                                         │
│   ════════════════════                  │
│         PUTT FROM HERE                  │
└─────────────────────────────────────────┘
```

### Rules Engine
- **Teams**: 2-3 players, alternate turns (2 at a time per turn)
- **Objective**: First team to sink ALL 6 holes wins
- **Puck Blocking**: When a putt is made, a puck fills the hole — it's claimed and closed
- **Ball-Back Rule**: If BOTH teammates make their putts in the same turn → they get the balls back and go again (huge momentum mechanic)
- **Win Condition**: First team to claim all 6 holes

> [!IMPORTANT]
> The ball-back rule is a defining mechanic — it creates comeback potential and hype moments. The app should celebrate these streaks visually.

---

## Architecture: CantonPP as Blueprint

Your CantonPP app is a perfect foundation. Here's the direct mapping:

| CantonPP Feature | Puttermore Equivalent | Adaptation |
|---|---|---|
| React + Vite SPA | Same stack | ✅ Reuse |
| `store.js` localStorage persistence | Same pattern, new `puttermore_store` key | Adapt data model |
| `dataStore.js` query engine | Same pattern, Puttermore-specific stats | New stat calcs |
| ELO rating system | **Putting Rating (PR)** | Adapted for team-based play |
| 6 singles + 3 doubles per match | **6 holes per game** | Different structure entirely |
| Division filter system | **Season filter** (single division, 9 teams) | Simplified |
| Sub pool / availability | **Sub system** for 2-3 player teams | Similar but smaller rosters |
| Admin panel | Same pattern | ✅ Reuse |
| Bottom tabs + Navbar | Same mobile-first nav | Re-themed |

---

## Proposed Feature Set

### 1. 🏠 Home Dashboard
- Hero with season countdown / current week
- Live standings snapshot (top 5)
- "Match of the Week" highlight with board visualization
- Recent results carousel
- Activity feed (scores entered, streaks, milestones)
- Quick links: Register, Schedule, My Dashboard

### 2. 🎯 Live Game Scorer (★ Signature Feature)
> This is where Puttermore leapfrogs CantonPP

**Interactive Board Visualization**:
- SVG/Canvas representation of the 6-hole board
- Tap a hole to mark it as sunk → animates a puck filling the hole
- Color-coded by team (Team A = green, Team B = gold, etc.)
- Real-time score: "Team A: 3/6 holes | Team B: 2/6 holes"
- **Ball-back tracker**: When both teammates sink → flash animation, "🔥 BALL BACK!" toast
- Turn tracker showing which 2 players are putting
- Auto-detects win condition

**Per-Putt Tracking**:
- Which player made which hole
- Which turn/round it happened
- Ball-back streaks recorded
- Total putts attempted vs. made (optional precision stat)

### 3. 📊 Season Standings
- 9-team standings table with W-L record, win%, point differential
- Tiebreaker: H2H → point diff → alphabetical (same as CantonPP)
- Sparkline form indicators per team
- Clinch scenarios in later weeks
- "Magic Number" calculation for playoff positioning

### 4. 👤 Player Profiles & Stats

**Individual Stats**:
| Stat | Description |
|---|---|
| Putting Percentage | Putts made / putts attempted |
| Hole Accuracy | Per-hole make rate (front, middle, back) |
| Ball-Back Rate | How often they contribute to ball-backs |
| Clutch Rating | Makes when team is trailing |
| Best Hole | Which position they dominate |
| Weekly Trend | Win/loss sparkline per week |
| Partner Synergy | Win rate with each teammate |

**Fun Stats / Awards**:
- 🎯 "Sniper" — highest back-row accuracy
- 🔥 "Hot Hand" — longest ball-back streak in a single game
- 🧊 "Ice Cold" — best clutch putting percentage
- 🍺 "Social Butterfly" — most games played across seasons
- 🏆 "MVP" — highest overall PR rating
- 💀 "Closer" — most game-winning putts (final hole sunk)

### 5. 👥 Team Profiles
- Roster (2-3 players with photos)
- Team record, points for/against
- Head-to-head records vs. every other team
- Season history across multiple 6-week seasons
- Team chemistry stat (win rate when full roster present)

### 6. 📅 Schedule & Registration

**Schedule**:
- Week-by-week matchup grid
- Venue and time slot per match
- Results populated as games complete

**Registration**:
- Team registration form (team name, 2-3 players, contact info)
- Individual sign-up for "free agent" pool
- Waitlist management (9 teams max, first-come-first-served)
- Payment status tracking (optional)
- QR code integration linking to `qrco.de/bfgu4k`

### 7. 🛠 Admin Panel
Borrowing directly from CantonPP's admin architecture:
- Team CRUD (create, edit roster, archive)
- Player CRUD (add, edit, deactivate)
- Score entry/correction
- Season management (create new 6-week seasons)
- Sub request management
- Export/import store data

---

## Unique Puttermore Features (Beyond CantonPP)

### 🍺 Drink Tracker (Social Feature)
Since the tagline is literally "Sink 'em. Drink 'em":
- Optional drink counter per player per match
- "Sips per Sink" ratio (just for laughs)
- Leaderboard: "Most Hydrated" 🍻
- Keep it light and fun, not promoting excess

### 📱 Interactive Board Replay
- After a game, replay the sequence of putts as an animation
- Shareable to Instagram stories (export as image/gif)
- Shows the flow of the game: who sunk what, when, ball-backs highlighted

### 🏆 Season Finale & Playoffs
- If the league does a championship format
- Bracket visualization (borrow CantonPP's playoff bracket code)
- Championship history page

### 📸 Gallery / Social Wall
- Photo uploads from game nights
- Instagram feed embed from @puttermore23
- Reaction system (🔥 🎯 🍺 emojis)
- Tag players in photos

### 🎙️ Commentary / Hype Feed
Since Puttermore references "ESPN 8 The Ocho" style commentary:
- Auto-generated play-by-play text based on game data
- "Ball back! Team Chaos sinks both and gets another shot!"
- "Clutch! Mike drains the back-right to close it out!"
- Could be a fun AI-generated narration feature later

---

## Data Model

```javascript
// Core entities
const state = {
  version: 1,
  
  players: [{
    id: 'p1',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: null,
    avatarColor: '#22c55e',
    instagram: '@mikej',
    status: 'active',
    joinedSeason: 's1'
  }],
  
  teams: [{
    id: 't1',
    name: 'Team Chaos',
    color: '#22c55e',
    seasonId: 's1',
    captainPlayerId: 'p1',
    roster: [
      { playerId: 'p1', order: 1 },
      { playerId: 'p2', order: 2 },
      { playerId: 'p3', order: 3 }  // optional 3rd
    ],
    status: 'active'
  }],
  
  seasons: [{
    id: 's1',
    name: 'Summer 2026',
    weeks: 6,
    startDate: '2026-06-08',
    endDate: '2026-07-13',
    venueId: 'v1',
    maxTeams: 9,
    status: 'active'
  }],
  
  matches: [{
    id: 'm1',
    seasonId: 's1',
    weekNumber: 1,
    date: '2026-06-08',
    timeSlot: '7:00 PM',
    venueId: 'v1',
    homeTeamId: 't1',
    awayTeamId: 't2',
    status: 'completed',  // scheduled | in_progress | completed
    winnerId: 't1',
    
    // The game — sequence of turns
    turns: [{
      turnNumber: 1,
      teamId: 't1',
      putters: ['p1', 'p2'],  // which 2 are putting this turn
      putts: [
        { playerId: 'p1', hole: 'front-1', made: true },
        { playerId: 'p2', hole: 'middle-1', made: false }
      ],
      ballBack: false  // both made? → ball back
    }],
    
    // Derived / cached
    holesWon: {
      't1': ['front-1', 'back-1', 'back-2', 'middle-1', 'middle-2', 'back-3'],
      't2': []
    },
    
    finalScore: { home: 6, away: 0 },  // holes won
    totalTurns: 8,
    ballBacks: { 't1': 2, 't2': 0 }
  }],
  
  venues: [{
    id: 'v1',
    name: 'Mobtown Brewing Company',
    address: '3600 O\'Donnell St, Baltimore, MD',
    url: 'https://www.mobtownbrewing.com',
    status: 'active'
  }],
  
  // Sub system (for when a team member can't make it)
  subPool: [],
  subRequests: []
}
```

### Hole Position Schema
```
Board holes are identified as:
  back-1, back-2, back-3     (3 holes, back row)
  middle-1, middle-2          (2 holes, middle row)  
  front-1                     (1 hole, front row)
```

---

## Design System

### Color Palette
Inspired by the Puttermore brand (dark backgrounds, brewery vibes, neon accents):

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0a` | Main background |
| `--bg-card` | `#141414` | Card surfaces |
| `--green-400` | `#22c55e` | Primary accent (turf green) |
| `--green-500` | `#16a34a` | Hover states |
| `--gold-400` | `#fbbf24` | Secondary accent (beer gold) |
| `--gold-500` | `#f59e0b` | Hover states |
| `--orange-400` | `#f97316` | Alerts, ball-back highlights |
| `--text-primary` | `#fafafa` | Main text |
| `--text-muted` | `#737373` | Secondary text |

### Typography
- **Display**: `'Outfit', sans-serif` — bold, modern, sporty
- **Body**: `'Inter', sans-serif` — clean readability

### Visual Theme
- Dark mode default (brewery/bar setting)
- Neon glow effects on interactive elements
- Artificial turf texture as subtle background patterns
- Beer-themed micro-animations (foam bubbles on score submission)

---

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | React + Vite | Same as CantonPP, proven pattern |
| **Routing** | React Router v6 | Same as CantonPP |
| **State** | localStorage + store.js pattern | Same as CantonPP, upgradeable to Supabase |
| **Styling** | Vanilla CSS + CSS Variables | Design system tokens |
| **Hosting** | Netlify / Vercel | Static SPA deployment |

---

## User Review Required

> [!IMPORTANT]
> **Scope Decision**: Should we build this as a full React + Vite app (like CantonPP) or start with a simpler single-page HTML/JS/CSS prototype first? The CantonPP approach is more robust but takes longer to scaffold.

> [!IMPORTANT]
> **Live Scoring Depth**: How detailed should the putt-by-putt tracking be? Options:
> - **Simple**: Just track which team won each hole (quick entry, like CantonPP's click-to-win)
> - **Detailed**: Track every individual putt attempt, ball-backs, turn order (richer stats but more data entry per game)
> - **Hybrid**: Simple mode for quick entry + optional detailed mode for nerds who want full stats

> [!WARNING]
> **Backend**: CantonPP uses localStorage only — fine for a demo/single-device. For a real league where multiple captains enter scores from their phones, you'll eventually need a real backend (Supabase, Firebase, etc.). Should we plan for that from the start or build localStorage-first like CantonPP?

## Open Questions

1. **Seed Data**: Should I create realistic seed data for 9 teams with Baltimore-themed names (like CantonPP has real team/player names)? Or use placeholder data?

2. **Registration Flow**: The QR code goes to an external form. Should the app have its own registration, or just link out to the existing QR code / form?

3. **Multi-Season**: CantonPP supports historical seasons. Should Puttermore track season-over-season stats from Day 1, or start simple with just the current season?

4. **Mobile-First Priority**: CantonPP has bottom tabs for mobile. Given that game scoring will happen at a bar on phones — should we go even more aggressively mobile-first? (Think: big touch targets, swipeable turns, haptic feedback patterns)

5. **Branding Assets**: Do you have the Puttermore logo / brand assets I should incorporate, or should I generate placeholder branding?

---

## Verification Plan

### Automated Tests
- `node -c` syntax validation on all JS files before deployment
- Verify Vite dev server starts clean with `npm run dev`
- Browser testing of all routes and interactive scoring flow

### Manual Verification
- Live game scoring flow on mobile viewport
- Data persistence across page reloads
- Admin CRUD operations
- Responsive layout at 375px, 768px, and 1440px breakpoints
