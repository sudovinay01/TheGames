export const SCENE_KEYS = {
  WELCOME: 'WelcomeScene',
  CLICK_NUMBER: 'ClickNumberScene',
};

export const GAME_CONFIG = {
  WIDTH: 480,
  HEIGHT: 800,
  MAX_NUMBER: 21,
  CIRCLE_COUNT: 3,
  CHANGE_INTERVAL: 700,
  BAR_HEIGHT: 56,
  STORAGE_KEY_CLICKNUMBER_HS: 'click-number-highscore'
};

export function uniqueRandomNumbers(count, max, include = null) {
  const set = new Set();
  if (include !== null) set.add(include);
  while (set.size < count) {
    set.add(Math.floor(Math.random() * (max + 1)));
  }
  const arr = Array.from(set);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function loadHighScore(key) {
  try {
    const v = localStorage.getItem(key);
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  } catch (err) {
    // localStorage may be unavailable in some embed environments
    console.warn('Could not load high score', err);
    return 0;
  }
}

export function saveHighScore(key, score) {
  try {
    localStorage.setItem(key, String(score));
  } catch (err) {
    console.warn('Could not save high score', err);
  }
}
