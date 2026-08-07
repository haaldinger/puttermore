# 🏆 Puttermore — League Admin User Guide & Operating Manual

> **Mobtown Brewing Co. Social Putting League**  
> *Wednesdays 6:00 PM – 9:00 PM EST · Baltimore, MD*  
> *"Sink 'Em and Drink 'Em"*

---

## 📌 Executive Summary
Welcome to **Puttermore**, the digital command center for the Mobtown Brewing Co. social putting league. This guide is written for League Commissioners, Admins, and Desk Staff. It provides step-by-step instructions on how to set up teams, manage player rosters, run Wednesday match nights, record scores on-the-fly, and roll over to future seasons.

---

## 🔑 1. Logging In & Admin Roles

### Accessing the Admin Console
1. Navigate to **[puttermore.netlify.app](https://puttermore.netlify.app)** (or your local installation).
2. Click **🔑 Login** in the top navigation bar (or top-right profile pill).
3. Select your Admin Profile:

| Profile Mode | Account Name | Usage / Purpose |
| :--- | :--- | :--- |
| **👑 Official Commissioner** | `J-MO Boh` / `Shane OldBay` | **Official League Operations.** All changes (teams, scores, standings) are saved live to the database for official league records. |
| **🧪 Pre-Season Sandbox** | `Demo Tester (Sandbox Admin)` | **Safe Training & Testing.** All changes remain in your active browser session memory only. Use this mode to practice scoring without touching official league data. |

---

## 👥 2. Pre-Season Setup (Teams & Rosters)

In Mobtown Fall 2026, games are played in an **ad-hoc format**—meaning you do **not** need to build a rigid pre-scheduled matrix before the season starts. Your main pre-season job is registering the teams and players.

### A. Creating Teams
1. Go to **Admin Console -> 👥 Rosters** tab.
2. Under **✨ Create New Team**, enter:
   - **Team Name** (e.g. *Dundalk Putters*, *Mobtown Misfits*, *Boh Putters*).
   - **Team Color Accent** (hex or color picker).
3. Click **Create Team**.

### B. Registering Players & Captains
1. Under **Team Rosters**, select the team you want to edit from the team list.
2. Click **+ Add Player**:
   - Enter the player's full name.
   - Pick an avatar accent color.
   - Click **Save Player**.
3. **Assign Captain**: Click the **🧢 Captain** badge next to any player's name to designate them as Team Captain.
4. **Remove Player**: Click the **❌ Remove** icon next to a player's row if a player drops out.

---

## ⚡ 3. Wednesday Match Night Operations

On Wednesday match nights (6:00 PM – 9:00 PM at Mobtown), teams walk up to the turf board and challenge each other on-the-fly.

### A. Recording a Match Score (3-Step Quick Console)
When two teams finish playing a Best-of-3 series:

1. Open **Admin Console -> ⚡ Score Console**.
2. **Step 1: Pick 2 Teams**:
   - Select **Home Team (Team 1)** from the dropdown.
   - Select **Away Team (Team 2)** from the dropdown.
3. **Step 2: Enter Best-of-3 Game Scores**:
   - **Game 1**: Enter cups sunk by Team 1 vs Team 2 (e.g., `6` - `4`).
   - **Game 2**: Enter cups sunk by Team 1 vs Team 2 (e.g., `4` - `6`).
   - **Game 3 (If Deciding Game Needed)**: Enter cups sunk (e.g., `6` - `5`). Leave empty if a team won 2-0.
4. **Step 3: Publish**:
   - Click **🏆 Complete & Update Standings**.

#### Automatic Standings Calculation:
- **Series Winner (2-0 or 2-1)**: Earns **2 Points** in Standings.
- **Game 3 Loser (1-2)**: Earns **1 Point** (Loss in OT/Game 3 bonus).
- **Sweep Loser (0-2)**: Earns **0 Points**.

---

### B. Editing or Recalling a Match Score
If an incorrect score was submitted by mistake:
1. Go to **Admin Console -> 📅 Matches** tab.
2. Find the match in the list.
3. Click **✏️ Edit Score** to modify game numbers, or **🗑️ Delete / Recall** to remove the match from standings entirely.

---

### C. Live Scorer Desk (`/#/scorer`)
If an admin or team captain wants to track cup-by-cup shots live on a tablet/phone during a match:
1. Go to **Live Scorer** in the navigation bar.
2. Pick **Team 1 vs Team 2**.
3. Select scoring mode:
   - **⚡ Interactive Turf Board**: Tap holes on the 6-cup pyramid diagram as putts are sunk (automatically calculates Ball Backs, Overtime, and Island Cups).
   - **📋 Quick Score Form**: Enter series total cups at the end.
4. Click **Submit Official Match** when finished.

---

## ⚙️ 4. Season Rollover & Future Seasons

Puttermore natively supports ongoing seasons (e.g., *Fall 2026*, *Winter 2026*, *Spring 2027*).

### Launching a New Season:
1. Go to **Admin Console -> ⚙️ Settings** tab.
2. Scroll to **🏆 Season Management Console**.
3. Under **Launch New Season**:
   - Enter **Season Name** (e.g. *Winter 2026 Mobtown Season*).
   - Enter **Season Duration** (e.g. *6 Weeks*).
   - Enter **Start Date** (e.g. *2026-11-04*).
4. Click **🏆 Launch New Season**.
5. The system automatically creates the new season with 0 matches recorded, sets it as active, and preserves your team database for the new season!

---

## ❓ 5. Frequently Asked Questions (FAQ)

#### Q: What if a team has to forfeit?
**A:** Go to **Admin Console -> ⚡ Score Console**, select the two teams, enter `6-0, 6-0` for the team that showed up, and click Publish.

#### Q: How does the countdown banner on the front page work?
**A:** The banner automatically calculates the remaining Days, Hours, Minutes, and Seconds until the active season's Start Date (e.g. Sept 2, 2026 at 6:00 PM EST). Once the start time arrives, it automatically transitions from `⏳ COUNTDOWN TO OPENING NIGHT` to `🟢 SEASON IN PROGRESS`.

#### Q: How do I test changes without affecting live scores?
**A:** Always log in using **🧪 Demo Tester (Sandbox Admin)** mode. Sandbox mode suppresses database write calls and keeps your test teams and scores strictly in your local browser session memory!

---

*Puttermore v1.0 · Mobtown Brewing Co. Social Putting League Guide*
