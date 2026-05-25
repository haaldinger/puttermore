/**
 * Puttermore — Time-Aware Engine
 * Pinned to Baltimore Eastern Time (America/New_York)
 */

const TIME_OVERRIDE_KEY = 'puttermore_time_override';

/**
 * Gets the current system date or simulated override date
 * @returns {Date}
 */
export function getCurrentDate() {
  const override = localStorage.getItem(TIME_OVERRIDE_KEY);
  if (override) return new Date(override);
  return new Date();
}

/**
 * Sets the mock calendar override date
 * @param {string|null} isoString
 */
export function setTimeOverride(isoString) {
  if (isoString) {
    localStorage.setItem(TIME_OVERRIDE_KEY, isoString);
  } else {
    localStorage.removeItem(TIME_OVERRIDE_KEY);
  }
  // Dispatch a global reactive event so active views re-render
  window.dispatchEvent(new Event('puttermore-time-shifted'));
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
 * Decides the current timeline phase based on Baltimore calendar days & hours
 * @returns {{ phase: string, label: string }}
 */
export function getTimeState() {
  const now = getEasternTime(getCurrentDate());
  const day = now.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (day === 3) { // Wednesday Match Night
    const minutes = hour * 60 + minute;
    
    // 5:30 PM (1050 mins) to 6:00 PM (1080 mins)
    if (minutes >= 1050 && minutes < 1080) {
      return { phase: 'WARMUP', label: 'Pre-Game Warmup' };
    }
    // 6:00 PM (1080 mins) to 9:00 PM (1260 mins)
    if (minutes >= 1080 && minutes < 1260) {
      return { phase: 'LIVE_MATCHES', label: 'Match Night Live' };
    }
    // 9:00 PM (1260 mins) to midnight (1439 mins)
    if (minutes >= 1260) {
      return { phase: 'AFTER_PARTY', label: 'The After-Party' };
    }
  }

  if (day === 4 || day === 5) { // Thursday, Friday
    return { phase: 'POST_GAME_RECAP', label: 'Post-Game Recap' };
  }
  
  if (day === 6 || day === 0) { // Saturday, Sunday
    return { phase: 'WEEKEND_CHILL', label: 'Weekend Training' };
  }

  // Monday, Tuesday, Wednesday morning
  return { phase: 'PRE_GAME_HYPE', label: 'Pre-Game Hype' };
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
  
  if (yyyymmdd <= '2026-06-10') return 1;
  if (yyyymmdd <= '2026-06-17') return 2;
  if (yyyymmdd <= '2026-06-24') return 3;
  if (yyyymmdd <= '2026-07-01') return 4;
  if (yyyymmdd <= '2026-07-08') return 5;
  return 6;
}
