# Puttermore — League Platform Overview

**Sink 'Em and Drink 'Em** · Baltimore's Social Putting League · Since 2023

---

## What We Built

A mobile-first web application designed for Puttermore's 6-week social putting league. The platform gives players, captains, and organizers a single destination to track scores in real time, view standings, explore player stats, and follow the season — all from their phone at the bar.

The app runs 3 simultaneous leagues across 3 Baltimore breweries, each with 9 teams, their own schedule, and independent standings.

---

## Features

### 🏠 Home Dashboard
The landing page gives everyone the full picture at a glance:
- **League selector tabs** — switch between Mobtown, Heavy Seas, and 1623 with one tap
- **Venue branding** — each league shows its brewery name, color, and game night
- **Season hero** with the Puttermore logo
- **Last week's results** — all matches from the most recent completed week with scores and winners; tap any match to see the full detail
- **Live standings** snapshot showing the top 5 teams
- **Top putters** leaderboard ranked by accuracy
- **Upcoming matches** for the next week

### 🎯 Live Game Scorer
The signature feature — a real-time scoring tool built for the Puttermore format:
- **League-scoped match picker** — styled card-based UI grouped by week, with team color dots (replaces native dropdown)
- **Dual interactive boards** — each team's 6 cups are shown separately, just like the real game (beer pong style)
- **Tap to sink** — tap any open cup on the opponent's board to claim it
- **Ball-back detection** — when both teammates make their putts, the app celebrates with a 🔥 Ball Back toast and gives them another turn
- **✅ Made It button** — when the last cup is sunk and the 2nd putter has no cups to tap, a "Made It" button appears so they can still record a make for ball back
- **Redemption round** — when a team clears all 6 cups (without ball back), the other team gets paired turns to match it; ball back during redemption = outright win
- **Overtime** — if redemption ties it up, the front 3 cups reopen on both boards and play continues
- **Turn-by-turn log** — every putt is recorded with player name, hole, result, and phase tags (RDM / OT)
- **3 view modes**:
  - **Side by Side** — both boards visible at once
  - **Focused** — only the active board shown (clean mobile experience)
  - **Stacked** — boards stacked vertically with the top board inverted so single cups face each other (beer pong table layout)
- **Save to standings** — completed games are saved and immediately reflected in standings and stats

### 📊 Season Standings
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

### 👥 Teams
Team cards ranked by standings with quick stats. League tabs to filter. Tap into any team to see:
- **Full roster** with each player's accuracy percentage
- **Captain badge** for the team captain
- **Match history** — every result and upcoming game
- **Team stats** — record, holes won, ball-back count

### 🏆 Player Profiles
Individual stat pages for every player with:
- **Putting accuracy** — overall percentage
- **Putts made** vs. attempted
- **Ball-back contributions**
- **Hole-by-hole accuracy** — bar chart showing performance by position
- **Weekly performance** — visual chart of accuracy and win/loss per week

### 👤 Players Leaderboard
League-scoped sortable table of all players:
- Accuracy ranking
- Team affiliation
- Putts made / attempted
- Best hole

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
Natty Bohs · Old Bay Bombers · Crab Cake Closers · Harbor Hustlers · Fells Point Putters · Federal Hill Flames · Canton Sinkers · Hampden Hons · Charm City Strokers

**Heavy Seas (Wednesdays)**
Loose Cannons · Powder Monkeys · Berger Cookie Crew · Dundalk Ringers · Locust Point Legends · Mt. Vernon Vipers · Pigtown Putters · Remington Rollers · Waverly Wreckers

**1623 (Thursdays)**
Druid Hill Daggers · Station North Stars · Patterson Park Aces · Highlandtown Heat · Charles Village Champs · Woodberry Wolves · Riverside Ringers · Cross Street Crushers · Brewers Hill Ballers

---

## Game Rules (As Implemented)

1. Each team has **6 cups** arranged in a pyramid (3 back, 2 middle, 1 front)
2. Teams alternate turns — **2 players putt per turn**, each aiming at the opponent's cups
3. **Ball Back** — if both teammates sink their putts, they get the balls back and go again
4. **Instant Win** — if both putters make it on the turn that clears the board (ball back + cleared), the team wins outright — no redemption, no OT
5. **Redemption** — if only one putter sinks the last cup (no ball back), the other team gets redemption: paired turns, same ball-back rules apply
6. During redemption: **ball back + board cleared = redemption team wins**. Board cleared without ball back = Overtime. Both miss = first team wins.
7. **Overtime** — front 3 cups (F1, M1, M2) reopen on both boards. Same rules apply — first to clear wins, ball back still in play

---

## Design

- **Dark mode** interface built for the bar/brewery setting
- **Hot pink and black** palette pulled directly from the Puttermore logo
- **Mobile-first** layout with bottom tab navigation
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
- **Cross-league leaderboard** — compare top putters across all 3 breweries
