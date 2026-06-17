# Puttermore — Implementation Plan (Archived)

> [!NOTE]
> This document is the **original implementation plan** from the initial design phase of Puttermore. It is preserved for historical reference. For the current architecture and feature state, see:
> - `README.md` — Current feature documentation
> - `BUSINESS.md` — Product & business overview
> - `production_brainstorming.md` — Current architecture notes & future roadmap

---

## Original Design Goals (June 2026)

**Tagline**: "Meet. Compete. Repeat."  
**Mission**: Facilitate connections through fun competition in Baltimore  
**Formats**: Local Social Leagues, Corporate Outings, Networking Happy Hours  
**Venues**: Mobtown Brewing, Heavy Seas, 1623 Brewing  
**Vibe**: Beer pong meets mini putt on artificial turf. Social-first, skill-optional  

---

## ✅ Implemented Features (vs. Original Plan)

| Original Plan | Status | Notes |
|---|---|---|
| React + Vite SPA | ✅ **Vite (Vanilla JS)** | Chose Vanilla ES6 over React for performance |
| localStorage store.js | ✅ **Built + extended** | Dual-mode: Supabase primary, localStorage fallback |
| Live Scorer with SVG boards | ✅ **Built** | Full shot-by-shot + Quick Score modes |
| Ball-Back detection | ✅ **Built** | Fire toast + ticker alert |
| Home Dashboard | ✅ **Built** | Personal stats, standings, results, rivalry radar |
| Season Standings | ✅ **Built** | Points-based: Win=2, Game3Loss=1, 0-2Loss=0 |
| Player Profiles & Stats | ✅ **Built** | Putting %, hole heatmaps, weekly trends |
| Team Profiles | ✅ **Built** | Roster, head-to-head, advanced stats |
| Schedule Page | ✅ **Built** | Week-by-week with results |
| Admin Panel | ✅ **Built** | 4 tabs: Review, Matches, Roster, Analytics |
| Match Replay Simulator | ✅ **Built** | Ocho Simulator with scrubber and speed controls |
| Cotton & Pepper Commentary | ✅ **Built** | Context-aware banter system |
| ESPN8 Broadcast Ticker | ✅ **Built** | Global marquee with context-switching |
| Custom Putter Identity | ✅ **Built** | 22 putter types, lightbox, file uploader |
| Putter Gallery | ✅ **Built** | Searchable public gallery |
| Passwordless Auth | ✅ **Built** | Supabase Magic Link email auth |
| Supabase Backend | ✅ **Built** | Full PostgreSQL schema with match/turn/putt data |
| Best-of-3 Series | ✅ **Built** | Series tracking with per-game breakdowns |
| Island Cup Bonus | ✅ **Built** | Isolated cup detection + free bonus pick |
| Open Play Mode | ✅ **Built** | Captain picks any opponent without schedule |
| Quick Score Mode | ✅ **Built** | Final score entry with synthetic turn generation |
| Rivalry Radar | ✅ **Built** | Multi-rival comparison with stat deltas |
| Drink Tracker | ❌ Not built | Future roadmap item |
| Instagram social wall | ❌ Not built | Future roadmap item |
| Registration/waitlist | ❌ Not built | Handled externally via QR code |
| Season playoff bracket | ❌ Not built | Future roadmap item |
| Supabase RLS enforcement | ⚠️ Partial | Anon key permits all; RLS policies not yet applied |
| Real-time spectating | ⚠️ Partial | Data fetched on load; no live Realtime subscriptions yet |

---

## Original Data Model (Reference)

The original proposed model used a flat `turns[]` array on each match. This evolved to the `Match → Games[] → Turns[] → Putts[]` nested structure to support Best-of-3 series and per-game stats.

```javascript
// Original (simplified, superseded)
matches: [{
  turns: [{
    turnNumber: 1,
    teamId: 't1',
    putts: [{ playerId: 'p1', hole: 'front-1', made: true }],
    ballBack: false
  }]
}]

// Current (nested series format)
matches: [{
  games: [{
    turns: [{
      putts: [{ playerId: 'p1', hole: 'front-1', made: true, island: false }]
    }]
  }]
}]
```

---

## Original Tech Stack Decision

The plan considered React + Vite (same as CantonPP reference app). The final decision was to build in **Vanilla ES6 + Vite** for:
- Zero framework overhead on brewery cellular connections
- No virtual DOM diffing for a rendering pattern that's mostly full re-renders anyway
- Simpler deployment as a pure static SPA
