# Puttermore — Social Putting League Platform

**Sink 'Em and Drink 'Em** · Baltimore's Premier Social Putting League · Since 2023

---

## Project Overview

A high-performance, mobile-first single-page web application (SPA) custom-built for **Puttermore's 6-week social putting league**. The platform delivers a premium, real-time data console for players, captains, and spectators to track live scores, visualize match replays, analyze statistics, and follow the season.

The application focuses exclusively on the active **Mobtown League** hosted at the **Mobtown Brewing Co.** on Wednesday nights, representing **9 competitive teams** and **22 active players** with fully independent standings, schedules, custom clubs, and dynamic league-wide analytics.

---

## 🔑 Role-Based Access (Passwordless Auth)

Puttermore features a fluid, frictionless passwordless login model. Access is determined purely by selection of an active player card in the profile page:

*   **Spectators / Guests** — Default access. Can view live standings, caddy guides, putter galleries, and follow active matches in `🔒 SPECTATOR MODE` (scoring forms locked).
*   **League Players** — Authenticated session. Unlocks a personalized home dashboard displaying team records, accuracy stats, next matchups, and personal putter customizers.
*   **Team Captains** — Elevated session. In addition to player features, captains receive a glowing pink **🎯 SCORE ACTIVE MATCH** control preloaded with their team's scheduled match.
*   **League Admins (J-MO Boh & Shane OldBay)** — Commissioner privileges. Accesses the gold **👑 Admin Console** top and bottom navbar menus to verify scores, modify rosters, assign captains, or track league statistics.

---

## 🚀 Core Features & Capabilities

### 🏠 Home Dashboard
The visual landing page provides a comprehensive snapshot of the season with slick animations:
*   **Personal Player Dashboard** — Renders a personalized glass statistics panel for logged-in players, tracking records, accuracy ratios, next opponent details, and recent team outcomes.
*   **Week-at-a-Glance Results** — Display results from the most recent completed week, with scores and clickable match cards leading to shot logs.
*   **Live Standings Podium** — Clean podium leaderboard showing the top performing teams in the division.
*   **Top Putters Banner** — Highlights the elite individuals of the Mobtown league sorted by putting percentage.

---

### 👑 Commissioner Admin Console
League Admins (**J-MO Boh** & **Shane OldBay**) have access to a full-featured admin console divided into three tabs:
1.  **📋 Game Review (Verify & Publish Queue)**:
    *   Lists all matches recorded and submitted by captains (which default to a `'pending_review'` status to safeguard standings from unverified submissions).
    *   **Audit Replay**: Opens the Ocho Match Replay simulator modal directly from the card to check play-by-play logs.
    *   **✏️ Adjust Score**: Expands an inline editor to adjust final scores, turns played, or overtime states.
    *   **Approve & Publish**: Commits the scores, recalculating standings, player stats, and schedules instantly.
2.  **👥 Roster Controls (Roster Management Hub)**:
    *   Select any Mobtown team via a dropdown menu to list its active roster.
    *   **Make Captain**: Shifts the team captain badge, dynamically swapping scoring permissions.
    *   **✏️ Edit Player**: Modify a player's name and avatar color inline.
    *   **❌ Remove Player**: Deletes a player from the team and player database.
    *   **Register New Player**: Form to register a player on the team, auto-seeded with default putter credentials.
3.  **📊 Cup Analytics (League Intelligence Console)**:
    *   **Efficiency index** displaying average turns to victory across the league.
    *   **Double-Sink Ratio** tracking total ball backs relative to total match turns.
    *   **SVG Cup Success Rates** horizontal bar chart compiling attempts vs sinks per cup position to show which cups are easiest/hardest.

---

### 🏌️‍♂️ Player Custom Putters & Public Putter Gallery
*   **Profile Putter Cards** — Player profiles feature a custom putter block displaying their club name, descriptions of why they use it, and a stylized type badge.
*   **14 Photorealistic PGA-Grade Styles** — Replaced vector SVGs with gorgeous, ultra-realistic product photos representing bespoke elite golf clubs:
    *   *Sleek Blade 🗡️* · *Heavy Mallet 🔨* · *24k Gold Collector's 🏆* · *Neon Cyberpunk 💫* · *Vintage Hickory Wood 🪵* · *Matte Black Stealth 🕶️* · *Verdigris Copper🏺* · *Formula 1 Carbon 🏎️* · *Glacier Sapphire ❄️* · *Damascus Steel 🌊* · *Steampunk Brass ⚙️* · *3D Printed Titanium 🖨️* · *NASA Space Grade 🚀* · *Iced-Out Diamond 💎* (fully corrected to a single, elegant platinum shaft).
*   **📷 Interactive File Uploader** — Features an inline drag-and-drop or file selector using a local browser `FileReader` stream to read players' actual putter pictures. Saves them instantly as Base64 strings in the state store, syncing custom user photos across all profiles, lightboxes, and the public gallery!
*   **🔍 Product Photo Lightbox Overlay** — Tapping any putter thumbnail launches a beautiful premium overlay with deep drop-shadows and glassmorphism filters, supporting stable, hardware-accelerated **1.8x hover zoom tracking** to let players inspect diamond micro-pave details.
*   **🏌️‍♂️ Public Putter Gallery** — Dedicated directory mapping all 22 players and their custom clubs, equipped with a **real-time query search** that filters putters instantly as you type.

---

### 📊 Rivalry Radar & Analytics Dashboard
*   **Rivalry Controller Bar & Modal** — Fully redesigned competitive dashboard featuring multi-competitor selector chips and an advanced selection modal with search filters and team-based grouping.
*   **User-Centric Comparison Deltas** — Dynamic badge metrics color-code statistical performance relative to your active player baseline (green pill for leading a rival, red pill for losing to a rival, and gray pill for neutral ties).
*   **Actionable Competitor Chips** — Direct-dismissal chips with active click-handlers to remove rivals on the fly directly from the home screen.
*   **Rivalry Scouting Report Charts** — 3 relative-scaling horizontal bar charts comparing player stats (Accuracy, Sinks, and Double-Sink ball backs) wrapped in Cotton & Pepper's broadcast commentary inside a highly responsive `.grid-3` layout.

---

### 🎬 Mobile-Optimized Ocho Simulator
*   **Single-Board Dynamic Layout** — Completely redesigned viewport scaling for screens under `768px` wide. Instead of showing two squished, microscopic boards, the simulator dynamically isolates and displays **exactly one active targeted board** at a time.
*   **Viewport & State Integration** — Seamlessly swaps board colors, shooter credentials, and cup status in real time as teams trade turns, offering a premium and easy-to-follow playback experience on standard mobile and tablet devices.

---

### 🎯 Live Touch Scorer
A real-time tournament scorer optimized for fast-paced bar atmospheres:
*   **Dual Vector Game Boards** — Displays separate green-turf SVG boards mapping the 6-cup pyramids (beer-pong style) of both teams.
*   **3-Player Rotation Engine** — Automatically alternates active putter pairings turn-by-turn for teams with 3-player rosters, guaranteeing balanced competitive play.
*   **Interactive Cup Sinking** — Captains simply tap an active cup on the opponent's board to claim it.
*   **Automatic Game State Logic**:
    *   **🔥 Ball Backs** — Blazing fire-toast celebration when both teammates make their putts, awarding an extra turn.
    *   **🚨 Redemption Round** — Initiates paired turns for the defending team when a board is cleared.
    *   **⚡ Sudden-Death Overtime** — Middle/back cups pre-filled on both boards; play scopes strictly to the front 3 cups for sudden-death victory.
*   **Flexible Board View Modes** (`Side by Side`, `Focused`, `Stacked` with stacked board Y-inverted).
*   **Turn Rollbacks** — Built-in `Undo Turn` to step back database states in case of typing errors.

---

### 🎬 Ocho Simulator Desk (Interactive Match Replay)
An advanced, step-by-step match simulator that reconstructs any completed league game:
*   **Scrubber Slider** to jump instantly to any shot throughout the game.
*   **Interactive Controls**: Play / Pause, Step Forward/Back, Reset, and speed factors (**1x**, **2x**, **4x**).
*   **🎙️ Cotton & Pepper Dialogue** — Customized speech bubbles for sportscasters Cotton McKnight and Pepper Reddick, delivering comedic context-aware play-by-play sportscasting.

---

### 🎙️ ESPN8: The Ocho Live Broadcasting Engine
*   **Global Marquee Ticker** continuous rolling ticker sliding across headers, switching contexts in Scorer Mode to show live match states.
*   **Baltimore Cultural Lore & Humor** — Over 40 sportscaster quotes, local Baltimore easter eggs (Mr. Trash Wheel, Fells Point parking, Dundalk crab cakes, Berger Cookies, Old Bay), and golf banter.

---

## Game Rules (As Implemented)

1.  **Pyramid Setup** — Each board starts with **6 cups** arranged in a pyramid (3 back, 2 middle, 1 front).
2.  **Turn Rotation** — Teams alternate turns. **2 players putt per turn**. Teams with 3 players automatically cycle pairings turn-by-turn.
3.  **🔥 Ball Back** — If both teammates sink their putts in the same turn, they trigger a Ball Back, get their balls returned, and go again.
4.  **🏆 Instant Win** — If both teammates sink the last cup on the same turn (ball back + board cleared), they win outright. No redemption round, no overtime.
5.  **🚨 Redemption Round** — If a team clears the opponent's board *without* a ball back (only one putt made), the opponent gets redemption: paired turns, same ball-back rules apply.
6.  **Redemption Results**:
    *   *Failure* (both players miss in a turn) = First team wins.
    *   *Ball Back + Board Cleared* = Redemption team wins outright.
    *   *Board Cleared (No Ball Back)* = **Sudden-Death Overtime**.
7.  **⚡ Sudden-Death Overtime** — Middle and back cups pre-filled on both boards. Play scopes strictly to the front 3 cups (`F1`, `M1`, `M2`). The first team to sink any cup wins the match!

---

## 🛠️ Technology Stack & Architecture

*   **Core**: Vanilla HTML5 structure and dynamic Vanilla ES6 JavaScript logic.
*   **Styling**: Premium, responsive Vanilla CSS styling featuring CSS Custom Properties, flex/grid layouts, glassmorphic filters, and high-performance keyframe animations.
*   **Bundler**: Built on high-performance [Vite](https://vite.dev/) development server and asset compiler.
*   **State Management**: `localStorage`-backed reactive store with versioned schemas (`STORE_VERSION: 4`).
