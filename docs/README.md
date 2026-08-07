# Puttermore — Social Putting League Platform

**Sink 'Em and Drink 'Em** · Baltimore's Premier Social Putting League · Since 2023

---

## 🍺 Active Season Overview: Fall 2026 at Mobtown Brewing Co.

A high-performance, mobile-first single-page web application (SPA) custom-built for **Puttermore's social putting league**. The platform delivers a premium, real-time data console for players, captains, and spectators to track live scores, visualize match replays, analyze statistics, and follow the season.

The application focuses on the active **Mobtown League** hosted at **Mobtown Brewing Company** (4615 Victorious Way, Baltimore, MD) on Wednesday nights from 6:00 PM to 9:00 PM.

*   **Active Season**: **Fall 2026** (September 2nd – October 7th, 2026 · 6 Weeks)
*   **Venue**: Mobtown Brewing Company (Wednesdays 6–9 PM)
*   **Format**: Best-of-3 Series (6 cups/game, 2-player team rotation)
*   **League Structure**: 7 competitive teams playing a clean round-robin schedule (3 matches/week, 1 bye/week)
*   **Scoring Mode**: Admin Administered Scoring Mode (Feature Flag Controlled)

---

## 🔑 Role-Based Access & Admin Quick Sign-In

Puttermore features a fluid, passwordless login model powered by **Supabase Magic Links** with elevated admin quick-access:

*   **Spectators / Guests** — Default access. View live standings, caddy guides, putter galleries, and follow active matches in spectator mode.
*   **League Players** — Authenticated session. Unlocks a personalized home dashboard displaying team records, accuracy stats, next matchups, and personal putter customizers.
*   **Team Captains** — Elevated session. Can start official scoring sessions via the Live Scorer when live scoring is enabled.
*   **League Admins (J-MO Boh 👑 & Shane OldBay 👑)** — Commissioner privileges. 1-click quick login buttons on the login page grant instant access to the gold **👑 Admin Console** to record scores, manage schedules, adjust rosters, and generate social recaps.

> When Supabase credentials are missing (local dev fallback), the app accepts profile card clicks on the login page or 1-click Admin buttons to simulate any player/admin session.

---

## ⚡ Admin Fast Score Input & Recall Console

To streamline match night management for Fall 2026, scoring features a dedicated **Admin Fast Score Console**:

1.  **🔒 Live Scoring Feature Flag Toggle**:
    *   `settings.enableLiveScoring` toggle switch in Admin Settings.
    *   When set to `OFF` (default for Fall 2026), non-admin contestants see an informational **"🏛️ Admin Administered Scoring Mode"** banner on the Scorer tab. Standings, stats, schedules, and replays remain 100% dynamic.

2.  **⚡ 3-Step Match Score Entry**:
    *   **Auto-Detected Match Week**: The app automatically identifies the active week based on calendar date and completion status.
    *   **Step 1: Pick 2 Teams**: Select Home Team and Away Team.
    *   **Step 2: Enter Best-of-3 Scores**: Input game cups sunk or tap 1-click series presets (`⚡ 2–0 Home Sweep`, `⚡ 2–0 Away Sweep`, `⚡ 2–1 Home Win`, `⚡ 2–1 Away Win`).
    *   **Step 3: Complete & Update Standings**: 1-tap save that creates the matchup on the fly if needed, commits series scores, and immediately updates standings, team records, and stats.

3.  **↩️ Recall Submission & Edit Controls**:
    *   **Recall Submission**: 1-click reset on any completed match to set status back to `scheduled`, clear series scores, and recalculate standings.
    *   **Edit Score**: Inline game score adjustment allowing admins to tweak past scores and recalculate standings live.

4.  **📢 1-Click Match Night Social & SMS Recap**:
    *   Automatically generates a clean text summary of Wednesday night's results and Top Standings Podium.
    *   **`📋 Copy Recap for Group Chat & Socials`** button copies formatted text for Instagram, GroupMe, SMS, or Slack.

---

## 🚀 Core Features & Capabilities

### 🏠 Home Dashboard
*   **Personal Player Dashboard** — Renders a personalized glass statistics panel for logged-in players, tracking records, accuracy ratios, next opponent details, and recent team outcomes.
*   **Live Standings Podium** — Clean podium leaderboard showing top teams sorted by points (Win=2pts, Game 3 Loss=1pt, 0-2 Sweep Loss=0pts).
*   **Top Putters Banner** — Highlights elite individuals of the Mobtown league sorted by putting percentage.
*   **Rivalry Radar** — Personalized head-to-head stats panel comparing performance against selected rivals.

---

### 🏌️‍♂️ Player Custom Putters & Public Putter Gallery
*   **Profile Putter Cards** — Custom putter block displaying club name, personal description, and type badge.
*   **22 Photorealistic PGA-Grade Styles** — Vintage Hickory Wood, Sleek Blade, Heavy Mallet, 24k Gold Collector's, Neon Cyberpunk, Matte Black Stealth, etc.
*   **📷 Interactive File Uploader** — Drag-and-drop or file selector using browser `FileReader` stream to upload personal putter pictures.
*   **🔍 Product Photo Lightbox Overlay** — Glassmorphism lightbox with 1.8x hover zoom and ← / → arrow navigation.
*   **🏌️‍♂️ Public Putter Gallery** — Real-time searchable directory mapping all players and custom putters.

---

### 🎬 Mobile-Optimized Ocho Simulator & Replay
*   **Single-Board Dynamic Viewport** — Responsive isolated display of active targeted board on mobile screens (`<768px`).
*   **Scrubber Slider** — Jump instantly to any shot throughout the game.
*   **🎙️ Cotton & Pepper Dialogue** — Customized speech bubbles for sportscasters Cotton McKnight and Pepper Reddick.

---

## 🏆 Game Rules (As Implemented)

1.  **Pyramid Setup** — Each board starts with **6 cups** arranged in a pyramid (3 back, 2 middle, 1 front).
2.  **Turn Rotation** — Teams alternate turns. **2 players putt per turn**. Teams with 3 players automatically cycle pairings (P1+P2 → P1+P3 → P2+P3).
3.  **🔥 Ball Back** — If both teammates sink their putts in the same turn, they get their balls returned and shoot again.
4.  **🏝️ Island Cup Bonus** — Sinking an isolated "island" cup awards a free bonus cup pick.
5.  **🏆 Instant Win** — Both teammates sinking the last cup on the same turn (ball back + clear) wins outright.
6.  **🚨 Redemption Round** — Clearing without a ball back triggers redemption for the defending team.
7.  **Best-of-3 Series** — Matches consist of up to 3 games. **Points**: Win = 2pts, Game 3 Loss = 1pt, 0–2 Sweep Loss = 0pts.

---

## 🛠️ Technology Stack & Architecture

*   **Core**: Vanilla HTML5 & ES6 JavaScript logic.
*   **Styling**: Modern Vanilla CSS with HSL design system, glassmorphism, and hardware-accelerated CSS animations.
*   **Bundler**: [Vite](https://vite.dev/) (`vite@^6.0.0`).
*   **Database / Auth**: [Supabase](https://supabase.com/) (`@supabase/supabase-js@^2.108.2`) with Magic Link email auth.
*   **State Management**: Dual-mode store (`STORE_VERSION: 10`) with `localStorage` reactive state and Supabase sync.
*   **Deployment**: [Netlify](https://netlify.com).
