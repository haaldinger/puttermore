# Puttermore — Social Putting League Platform

**Sink 'Em and Drink 'Em** · Baltimore's Premier Social Putting League · Since 2023

---

## Project Overview

A high-performance, mobile-first single-page web application (SPA) custom-built for **Puttermore's social putting league**. The platform delivers a premium, real-time data console for players, captains, and spectators to track live scores, visualize match replays, analyze statistics, and follow the season.

The application focuses on the active **Mobtown League** hosted at **Mobtown Brewing Co.** on Wednesday nights, featuring **7 competitive teams** and **14 active players** playing a **Best-of-3 series format** with fully independent standings, schedules, custom clubs, and dynamic league-wide analytics.

**Current Active Season**: Summer 2026 (7 weeks, round-robin, 3 matches/week)

---

## 🔑 Role-Based Access (Supabase Magic Link Auth)

Puttermore features a fluid, frictionless passwordless login model powered by **Supabase Magic Links**. Access is determined by authenticated session tier:

*   **Spectators / Guests** — Default access. Can view live standings, caddy guides, putter galleries, and follow active matches in `🔒 SPECTATOR MODE` (scoring forms locked).
*   **League Players** — Authenticated session. Unlocks a personalized home dashboard displaying team records, accuracy stats, next matchups, and personal putter customizers.
*   **Team Captains** — Elevated session. In addition to player features, captains receive a glowing **🧢 CAPTAIN DECK ACTIVE** banner and can start official scoring sessions via the Live Scorer — both scheduled match scoring and ad-hoc **Open Play** games.
*   **League Admins (J-MO Boh & Shane OldBay)** — Commissioner privileges. Accesses the gold **👑 Admin Console** navbar menus to manage scores, rosters, match scheduling, and league-wide analytics.

> When Supabase credentials are missing (local dev fallback), the app accepts profile card clicks on the login page to simulate any player session.

---

## 🚀 Core Features & Capabilities

### 🏠 Home Dashboard
The visual landing page provides a comprehensive snapshot of the season with slick animations:
*   **Personal Player Dashboard** — Renders a personalized glass statistics panel for logged-in players, tracking records, accuracy ratios, next opponent details, and recent team outcomes.
*   **Week-at-a-Glance Results** — Displays results from the most recent completed week, with scores and clickable match cards leading to per-game shot logs.
*   **Live Standings Podium** — Clean podium leaderboard showing the top performing teams sorted by points (Win=2pts, Game 3 Loss=1pt, 0-2 Loss=0pts).
*   **Top Putters Banner** — Highlights elite individuals of the Mobtown league sorted by putting percentage.
*   **Rivalry Radar** — Personalized head-to-head stats panel comparing your performance against selected rivals.

---

### 👑 Commissioner Admin Console
League Admins (**J-MO Boh** & **Shane OldBay**) have access to a full-featured admin console divided into four tabs:

1.  **📋 Game Review (Verify & Publish Queue)**:
    *   Lists all matches recorded by captains (default `'pending_review'` status safeguards standings from unverified submissions).
    *   **Approve & Publish**: Commits the scores, instantly recalculating standings, player stats, and schedules.

2.  **📅 Matches (Schedule Manager)**:
    *   View all scheduled and completed matches organized by week.
    *   **Create New Match**: Add ad-hoc matches between any two league teams for any week.
    *   **Edit Teams / Week**: Adjust matchups and week numbers for scheduled matches.
    *   **Delete Match**: Remove a scheduled match from the schedule.

3.  **👥 Roster Controls (Roster Management Hub)**:
    *   Select any Mobtown team via a dropdown to list its active roster.
    *   **Make Captain**: Shifts the team captain badge, dynamically swapping scoring permissions.
    *   **✏️ Edit Player**: Modify a player's name and avatar color inline.
    *   **❌ Remove Player**: Deletes a player from the team and player database.
    *   **Register New Player**: Form to register a player on a team, auto-seeded with default putter credentials.

4.  **📊 Cup Analytics (League Intelligence Console)**:
    *   **Efficiency Index** displaying average turns to victory across the league.
    *   **Double-Sink Ratio** tracking total ball backs relative to total match turns.
    *   **SVG Cup Success Rates** horizontal bar chart compiling attempts vs sinks per cup position to reveal which cups are easiest/hardest across the entire league.

---

### 🏌️‍♂️ Player Custom Putters & Public Putter Gallery
*   **Profile Putter Cards** — Player profiles feature a custom putter block displaying their club name, personal description, and a stylized type badge.
*   **22 Photorealistic PGA-Grade Styles** — Ultra-realistic product photos representing bespoke elite golf clubs:
    *   *Vintage Hickory Wood 🪵* · *Sleek Blade 🗡️* · *Heavy Mallet 🔨* · *24k Gold Collector's 🏆* · *Neon Cyberpunk 💫* · *Matte Black Stealth 🕶️* · *Verdigris Copper 🏺* · *Formula 1 Carbon 🏎️* · *Glacier Sapphire ❄️* · *Damascus Steel 🌊* · *Steampunk Brass ⚙️* · *3D Printed Titanium 🖨️* · *NASA Space Grade 🚀* · *Iced-Out Diamond 💎* · *CNC Obsidian Glass* · *Brushed Platinum* · *Carved Bamboo* · *Imperial Ruby* · *Imperial Emerald* · *Aerospace Titanium* · *Antique Bronze* · *Baltic Amber*
*   **📷 Interactive File Uploader** — Inline drag-and-drop or file selector using a local browser `FileReader` stream to read players' actual putter pictures. Saves them as Base64 strings in the state store, syncing custom photos across all profiles, lightboxes, and the public gallery.
*   **🔍 Product Photo Lightbox Overlay** — Tapping any putter thumbnail launches a premium overlay with deep drop-shadows and glassmorphism filters, supporting hardware-accelerated **1.8x hover zoom tracking** to let players inspect fine details. Includes **← / →  navigation arrows** to cycle through all players without closing the lightbox.
*   **🏌️‍♂️ Public Putter Gallery** — Dedicated directory mapping all 14 players and their custom clubs, equipped with a **real-time query search** that filters putters instantly as you type.

---

### 📊 Rivalry Radar & Analytics Dashboard
*   **Rivalry Controller Bar & Modal** — Fully redesigned competitive dashboard featuring multi-competitor selector chips and an advanced selection modal with search filters and team-based grouping.
*   **User-Centric Comparison Deltas** — Dynamic badge metrics color-code statistical performance relative to your active player baseline (green pill for leading a rival, red pill for trailing, gray pill for ties).
*   **Actionable Competitor Chips** — Direct-dismissal chips with active click-handlers to remove rivals on the fly directly from the home screen.
*   **Rivalry Scouting Report Charts** — 3 relative-scaling horizontal bar charts comparing player stats (Accuracy, Sinks, and Double-Sink ball backs) wrapped in Cotton & Pepper's broadcast commentary inside a highly responsive `.grid-3` layout.

---

### 🎬 Mobile-Optimized Ocho Simulator
*   **Single-Board Dynamic Layout** — Completely redesigned viewport scaling for screens under `768px` wide. Instead of showing two squished boards, the simulator dynamically isolates and displays **exactly one active targeted board** at a time.
*   **Viewport & State Integration** — Seamlessly swaps board colors, shooter credentials, and cup status in real time as teams trade turns, offering a premium playback experience on mobile and tablet devices.

---

### 🎯 Live Touch Scorer
A real-time tournament scorer optimized for fast-paced bar atmospheres:
*   **Scoring Mode Selection** — Before starting, captains choose between **Live Score (shot-by-shot)** for full putt tracking with rich replay data, or **Quick Score (final scores only)** for fast entry with estimated stats.
*   **Open Play Mode** — Captains can pick any opponent from their league and start a game immediately without a scheduled match — great for scrimmages and off-week practice.
*   **Dual Vector Game Boards** — Displays separate green-turf SVG boards mapping the 6-cup pyramids (beer-pong style) of both teams.
*   **Turn Roster Setup** — At game start, captains can reorder each team's player lineup to match the real rotation.
*   **3-Player Rotation Engine** — Automatically alternates active putter pairings turn-by-turn for teams with 3-player rosters, guaranteeing balanced competitive play.
*   **Interactive Cup Sinking** — Captains tap the **Made It** / **Miss** buttons to log each individual putt, and the board automatically removes the claimed cup.
*   **🏝️ Island Cup Bonus** — When a cup becomes isolated (all surrounding cups are sunk), it becomes a golden "island" cup. Sinking an island awards a **free bonus cup pick** — the putter taps any remaining open cup to claim it instantly.
*   **Automatic Game State Logic**:
    *   **🔥 Ball Backs** — Blazing fire-toast celebration when both teammates make their putts, awarding an extra turn.
    *   **🚨 Redemption Round** — Initiates individual putt turns for the defending team when a board is cleared. Each made putt keeps the redemption alive; a miss ends it.
    *   **⚡ Sudden-Death Overtime** — Middle/back cups pre-filled on both boards; play scopes strictly to the front 3 cups for sudden-death victory.
    *   **Multi-Overtime Support** — Tracks and announces Double Overtime, Triple Overtime, etc. if multiple redemption rounds tie.
*   **Best-of-3 Series Tracking** — The scorer tracks a full best-of-3 series, automatically moving between games and displaying the series score.
*   **Flexible Board View Modes** — `Side by Side`, `Focused`, and `Stacked` (with stacked board Y-inverted so cups face each other).
*   **Turn Rollbacks** — Built-in `Undo Turn` to step back one full turn in case of input errors.
*   **Abandon to Quick Score** — Mid-game, captains can abandon shot-by-shot tracking and fall back to Quick Score entry.

---

### 🎬 Ocho Simulator Desk (Interactive Match Replay)
An advanced, step-by-step match simulator that reconstructs any completed league game:
*   **Scrubber Slider** to jump instantly to any shot throughout the game.
*   **Interactive Controls**: Play / Pause, Step Forward/Back, Reset, and speed factors (**1x**, **2x**, **4x**).
*   **🎙️ Cotton & Pepper Dialogue** — Customized speech bubbles for sportscasters Cotton McKnight and Pepper Reddick, delivering comedic context-aware play-by-play sportscasting.

---

### 🎙️ ESPN8: The Ocho Live Broadcasting Engine
*   **Global Marquee Ticker** — Continuous rolling ticker sliding across headers, switching contexts in Scorer Mode to show live match states (redemption warnings, overtime alerts, 1v1 shootout calls, ball-back streaks).
*   **Baltimore Cultural Lore & Humor** — Over 40 sportscaster quotes, local Baltimore easter eggs (Mr. Trash Wheel, Fells Point parking, Dundalk crab cakes, Berger Cookies, Old Bay), and golf banter.
*   **Context-Aware Ticker Modes** — Automatically shifts between LIVE OCHO TICKER (home), OCHO SCORER DESK (pre-game), TENSE FINISH, REDEMPTION WATCH, OVERTIME alerts, and GAME OVER banners.

---

## Game Rules (As Implemented)

1.  **Pyramid Setup** — Each board starts with **6 cups** arranged in a pyramid (3 back, 2 middle, 1 front).
2.  **Turn Rotation** — Teams alternate turns. **2 players putt per turn**. Teams with 3 players automatically cycle pairings (P1+P2 → P1+P3 → P2+P3) turn-by-turn.
3.  **🔥 Ball Back** — If both teammates sink their putts in the same turn, they trigger a Ball Back, get their balls returned, and go again.
4.  **🏝️ Island Cup Bonus** — When a cup becomes isolated from all other remaining cups, it's marked as an "island." Sinking an island awards a free bonus cup — the putter claims any open cup of their choice.
5.  **🏆 Instant Win** — If both teammates sink the last cup on the same turn (ball back + board cleared), they win outright. No redemption round.
6.  **🚨 Redemption Round** — If a team clears the opponent's board *without* a ball back, the opponent gets redemption: individual putt-till-you-miss turns. If all remaining players miss, first team wins. If the board is cleared during redemption, **Sudden-Death Overtime** begins.
7.  **⚡ Sudden-Death Overtime** — Middle and back cups pre-filled on both boards. Play scopes strictly to the front 3 cups (`F1`, `M1`, `M2`). The first team to sink any cup wins the game! If overtime also results in a board clear without a ball back, a further overtime round begins.
8.  **Best-of-3 Series** — Matches consist of up to 3 games. First team to win 2 games wins the series. **Points**: Win = 2pts, Lose in Game 3 = 1pt, 0–2 sweep loss = 0pts.

---

## 🛠️ Technology Stack & Architecture

*   **Core**: Vanilla HTML5 structure and dynamic Vanilla ES6 JavaScript logic.
*   **Styling**: Premium, responsive Vanilla CSS featuring CSS Custom Properties, flex/grid layouts, glassmorphic filters, and high-performance keyframe animations.
*   **Bundler**: High-performance [Vite](https://vite.dev/) development server and asset compiler (`vite@^6.0.0`).
*   **Database / Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js@^2.108.2`) — PostgreSQL backend with Supabase Realtime, Magic Link email authentication, and Row Level Security.
*   **State Management**: Dual-mode store — **Remote-first** from Supabase (when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set), with automatic fallback to `localStorage`-backed reactive store (`STORE_VERSION: 9`).
*   **Deployment**: [Netlify](https://netlify.com) (configured via `.netlify/` and `netlify-coding-rules` MCP).
*   **Seeding**: Deterministic seeded random number generator (`seededRng`) produces fully reproducible round-robin schedules, simulated game histories, and per-putt turn data from seed constants.
