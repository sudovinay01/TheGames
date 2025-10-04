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
// Probability (0..1) that the target number will be included among the circles on any given change
export const TARGET_APPEAR_PROB = 0.33;

export function uniqueRandomNumbers(count, max, include = null, exclude = []) {
  // exclude: array of numbers to avoid (unless equal to `include`)
  const excludedSet = new Set(Array.isArray(exclude) ? exclude : []);
  const set = new Set();

  // If include is provided, always ensure it's present
  if (include !== null) set.add(include);

  // Quick safety: if there are too many excluded values, fall back to ignoring exclusions
  const possibleValues = max + 1;
  const effectiveExcludeCount = Array.from(excludedSet).filter(n => n !== include).length;
  if (possibleValues - effectiveExcludeCount < count) {
    // Can't satisfy exclusion; clear exclusions to guarantee a result
    excludedSet.clear();
  }

  while (set.size < count) {
    const candidate = Math.floor(Math.random() * (max + 1));
    if (candidate === include) {
      set.add(candidate);
      continue;
    }
    if (excludedSet.has(candidate)) continue;
    set.add(candidate);
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
