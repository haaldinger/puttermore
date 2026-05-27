/**
 * Puttermore — Time-Aware Engine (V2)
 * Pinned to Baltimore Eastern Time (America/New_York)
 * Time phases are used for UI theming only — scoring is NOT time-gated.
 */

/**
 * Gets the current system date
 * @returns {Date}
 */
export function getCurrentDate() {
  return new Date();
}

/**
 * Converts a standard date object into Baltimore Local Time (Eastern Time)
 * @param {Date} date
 * @returns {Date}
 */
export function getEasternTime(date) {
  const estString = date.toLocaleString("en-US", { timeZone: "America/New_York" });
  return new Date(estString);
}

/**
 * Decides the current timeline phase based on Baltimore calendar days & hours.
 * Used for UI theming and announcer flavor — NOT for gating scorer access.
 * @returns {{ phase: string, label: string }}
 */
export function getTimeState() {
  const now = getEasternTime(getCurrentDate());
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (day === 3) { // Wednesday Match Night
    const minutes = hour * 60 + minute;

    // 5:30 PM (1050 mins) to 6:30 PM (1110 mins)
    if (minutes >= 1050 && minutes < 1110) {
      return { phase: 'WARMUP', label: 'Pre-Game Warmup' };
    }
    // 6:30 PM onwards (to midnight)
    if (minutes >= 1110) {
      return { phase: 'LIVE_MATCHES', label: 'Match Night Live' };
    }
  }

  // All other times (Thursday through Tuesday, and Wednesday morning/afternoon)
  return { phase: 'POST_GAME_RECAP', label: 'Post-Game Recap' };
}

/**
 * Calculates the active match week index based on simulated calendar dates
 * @returns {number}
 */
export function getWeekNumber() {
  const date = getEasternTime(getCurrentDate());
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Compare as flat ISO string comparison
  const yyyymmdd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  if (yyyymmdd <= '2026-05-07') return 1;
  if (yyyymmdd <= '2026-05-14') return 2;
  if (yyyymmdd <= '2026-05-21') return 3;
  if (yyyymmdd <= '2026-05-28') return 4;
  if (yyyymmdd <= '2026-06-04') return 5;
  if (yyyymmdd <= '2026-06-11') return 6;
  return 7;
}
