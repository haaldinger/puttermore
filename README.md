# Puttermore — League Platform Overview

**Sink 'Em and Drink 'Em** · Baltimore's Social Putting League · Since 2023

---

## What We Built

A mobile-first web application designed for Puttermore's 6-week social putting league. The platform gives players, captains, and organizers a single destination to track scores in real time, view standings, explore player stats, and follow the season — all from their phone at the bar.

The app runs 3 simultaneous leagues across 3 Baltimore breweries, each with 9 teams, their own schedule, and independent standings.

---

## Major Features & Recent Releases

### 🏠 Home Dashboard
The landing page gives everyone the full picture at a glance:
- **League selector tabs** — switch between Mobtown, Heavy Seas, and 1623 with one tap
- **Venue branding** — each league shows its brewery name, color, and game night
- **Season hero** with the Puttermore logo
- **Last week's results** — all matches from the most recent completed week with scores and winners; tap any match to see the full detail
- **Live standings** snapshot showing the top 5 teams
- **Top putters** leaderboard ranked by accuracy
- **Upcoming matches** for the next week

### 🎯 Live Game Scorer (Upgraded!)
The signature feature — a real-time scoring tool built for the Puttermore format, recently overhauled for mobile responsiveness and bar-room usability:
- **League-scoped match picker** — styled card-based UI grouped by week, with team color dots (replaces native dropdown)
- **Dual interactive boards** — each team's 6 cups are shown separately, just like the real game (beer pong style)
- **Tap to sink** — tap any open cup on the opponent's board to claim it.
- **Bulletproof Tap Targets [NEW]** — Added `pointer-events="none"` to the letters inside the cups and expanded the interactive circle bounds to a full `HOLE_RADIUS` of `22` (a **22% increase** in clickable area). Touch actions are immediately captured on mobile screens, and center-cup taps never get swallowed by labels!
- **✅ Made It / ✕ Miss buttons [NEW]** — Includes a prominent quick-miss button and a contextual "Made It" button when the last cup is sunk, ensuring clean turn submissions for player statistics.
- **Ball-back detection** — when both teammates make their putts, the app celebrates with a 🔥 Ball Back toast and gives them another turn
- **Redemption round** — when a team clears all 6 cups (without ball back), the other team gets paired turns to match it; ball back during redemption = outright win
- **Overtime Visual Refinements [NEW]** — Sudden death starts with the back 3 cups (`B1`, `B2`, `B3`) **visually pre-filled** with opponent pucks. This clearly scopes play to the front 3 cups (`F1`, `M1`, `M2`), scores the game accurately, and standardizes the victory check to always be `6` total claimed cups on the board.
- **Turn-by-turn log** — every putt is recorded with player name, hole, result, and phase tags (RDM / OT)
- **3 view modes**:
  - **Side by Side** — both boards visible at once. *Optimized to stay side-by-side on mobile screens using compact responsive scaling!*
  - **Focused** — only the active board shown (clean mobile experience)
  - **Stacked** — boards stacked vertically and **the top board is inverted (flipped Y)** so single cups face each other, mimicking a real putting table setup.
- **Save to standings** — completed games are saved and immediately reflected in standings and stats

### 🔥 Live Game Notifications [NEW]
Dynamic bar-room arcade toasts to celebrate putting achievements:
- **Made-Putt Streaks:** Tracks consecutive made putts per team across turns. Lands custom blazing fire-gradient notifications:
  - **3 in a row:** `🔥 ON FIRE! 3 IN A ROW!`
  - **4 in a row:** `⚡ UNSTOPPABLE! 4 IN A ROW!` (Double Ball-Back!)
  - **5 in a row:** `🚨 IMPOSSIBLE! 5 IN A ROW!`
  - **6 in a row:** `👑 PERFECT BOARD! 6 IN A ROW!`
- **🏆 Winner Celebration Toast:** Instantly triggers a large, glowing green `🏆 [Team Name] WINS!` toast for 3.5 seconds when the match ends (Instant Win, Redemption, or Overtime), while cleanly suppressing stale ball-back alerts.

### 📊 Advanced Team Analytics [NEW]
The Team Profile page has been transformed into a comprehensive data console:
- **Combined Team Accuracy:** Aggregates total attempted and made putts across all roster players.
- **Hole-by-Hole Heatmap Chart:** A custom branded progress chart showing the team's accuracy percentage at each individual cup position (F1 to B3) using the team's official hex color.
- **Weekly Trend Chart:** A week-by-week bar chart showing the team's putting accuracy and match outcome (`W`/`L`) to track team form.
- **OT Record:** Tracks their exact win-loss record in overtime matches.

### 👥 Teams Standings
League-scoped standings table for all 9 teams featuring:
- Win-loss record and win percentage
- Hole differential (+/-)
- Total holes won
- Ball-back count (🔥 BB)
- Current streak and sparkline form indicators
- League selector tabs to switch between breweries

### 📅 Schedule
Week-by-week view of the full 6-week season per league:
- Completed matches show final scores with winner highlighted — tap any to see the **match detail page**
- Upcoming matches show time slots and matchups
- Overtime games tagged with ⚡

### 🏆 Player Profiles
Individual stat pages for every player with:
- **Putting accuracy** — overall percentage
- **Putts made** vs. attempted
- **Ball-back contributions**
- **Hole-by-hole accuracy** — bar chart showing performance by position
- **Weekly performance** — visual chart of accuracy and win/loss per week

### 👤 Players & Cross-League Leaderboards
Individual putting statistics and comparative standings:
- **Brewery Leaderboards** — Venue-scoped ranking of putters at the active brewery.
- **Cross-League Leaderboards [NEW]** — A unified global leaderboard comparing all 54 active players across all 3 brewery leagues simultaneously!
- **Visual Rank Accents [NEW]** — Custom visual trophies (`🥇`, `🥈`, `🥉`) for top 3 podium spots and gold stars (`★`) for the top 10 performers.
- **Dynamic Venue Branding [NEW]** — Custom styled, color-coded badges indicating each player's brewery affiliation (Mobtown, Heavy Seas, 1623).
- **Seamless Toggling [NEW]** — An integrated, highly responsive capsule toggle to instantly swap view scopes between current brewery and all breweries combined.

### 🔍 Match Detail
Tap any completed match from the home page or schedule to see the full breakdown:
- **Scoreboard** with team colors and final score
- **Winner badge** with OT indicator
- **Summary stats** — total turns, ball backs, date/time, regulation vs overtime
- **Dual board visualization** showing where cups were claimed
- **Per-player accuracy** — each player's made/total/pct for that specific game
- **Shot-by-shot log** — complete turn history with ✅/❌, hole positions, ball-back/RDM/OT tags

---

## 3 Leagues · 3 Breweries

| League | Brewery | Night | Teams |
|---|---|---|---|
| **Mobtown League** | Mobtown Brewing Co. | Tuesdays | 9 |
| **Heavy Seas League** | Heavy Seas Beer | Wednesdays | 9 |
| **1623 League** | 1623 Brewing | Thursdays | 9 |

### The 27 Teams

**Mobtown (Tuesdays)**
Natty Bohs · Old Bay Bombers · Crab Cake Closers · Bmore Squeegee Boys · Omar's Whistlers · 12 O'Clock Boys · House of Cups · Hampden Hons · Mr. Trash Wheels

**Heavy Seas (Wednesdays)**
Loose Cannons · Powder Monkeys · Berger Cookie Crew · Dundalk Dirtbikes · Barksdale Putters · Slingin' Joes · Pigtown Putters · Lake Roland Rollers · Waverly Wreckers

**1623 (Thursdays)**
Druid Hill Daggers · Station North Stars · Patterson Park Aces · Highlandtown Heat · The Wire Tappers · Woodberry Wolves · Riverside Ringers · Cross Street Crushers · Brewers Hill Ballers

---

## Game Rules (As Implemented)

1. Each team has **6 cups** arranged in a pyramid (3 back, 2 middle, 1 front)
2. Teams alternate turns — **2 players putt per turn**, each aiming at the opponent's cups
3. **Ball Back** — if both teammates sink their putts, they get the balls back and go again
4. **Instant Win** — if both putters make it on the turn that clears the board (ball back + cleared), the team wins outright — no redemption, no OT
5. **Redemption** — if only one putter sinks the last cup (no ball back), the other team gets redemption: paired turns, same ball-back rules apply
6. During redemption: **ball back + board cleared = redemption team wins**. Board cleared without ball back = Overtime. Both miss = first team wins.
7. **Overtime** — front 3 cups (F1, M1, M2) reopen on both boards (with back 3 cups pre-filled). Same rules apply — first to clear wins, ball back still in play

---

## Design & Mobile Engineering

- **Dark mode** interface built for the bar/brewery setting
- **Hot pink and black** palette pulled directly from the Puttermore logo
- **Mobile-first** layout with bottom tab navigation
- **Active Light-Follow Glassmorphism [NEW]** — Ultra-responsive glass cards with dynamic backdrop-blur filters, hot-pink glowing borders, and an incredibly slick radial-gradient shine that actively tracks and follows the user's cursor at an optimized, lightweight 60fps!
- **Window-Level Scrolling [NEW]** — Moving scrolling containers from nested containers to the body level to ensure buttery smooth, native inertia scrolling on iOS Safari without bottom page cropping!
- **League-aware** — every page scopes to the selected brewery with color-branded tabs
- **Smooth animations** and glassmorphism effects throughout
- **Turf-green** SVG game boards with team-colored pucks

---

## What's Next (Potential Roadmap)

- **Registration flow** — online team sign-up with waitlist management
- **Gallery / Social wall** — photo uploads from game nights
- **Drink tracker** — fun "Sips per Sink" social stat
- **Auto-generated commentary** — ESPN-8 style play-by-play
- **Multi-season history** — carry stats across multiple 6-week seasons
- **Backend integration** — cloud database so multiple captains can enter scores from their own phones
- **Push notifications** — reminders for upcoming matches and score alerts
