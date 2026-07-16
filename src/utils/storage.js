const STORAGE_KEYS = {
  HISTORY: 'morse_history',
  MISSED: 'morse_missed',
  SETTINGS: 'morse_settings',
  DAILY_STATS: 'morse_daily_stats',
};

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function now() { return Date.now(); }

function pruneOld(items) {
  const cutoff = now() - THIRTY_DAYS;
  return items.filter(i => i.timestamp > cutoff);
}

// --- Settings ---
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
}

// --- Session History ---
export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    const items = raw ? JSON.parse(raw) : [];
    return pruneOld(items);
  } catch { return []; }
}

export function saveSession(session) {
  try {
    let history = loadHistory();
    history.unshift({ ...session, timestamp: now() });
    history = pruneOld(history);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch {}
}

// --- Missed Words ---
export function loadMissed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISSED);
    const items = raw ? JSON.parse(raw) : [];
    return pruneOld(items);
  } catch { return []; }
}

export function saveMissed(word, mode) {
  try {
    let missed = loadMissed();
    const exists = missed.find(m => m.word === word);
    if (!exists) {
      missed.unshift({ word, mode, timestamp: now() });
      missed = pruneOld(missed);
      localStorage.setItem(STORAGE_KEYS.MISSED, JSON.stringify(missed));
    }
  } catch {}
}

export function removeMissed(word) {
  try {
    let missed = loadMissed();
    missed = missed.filter(m => m.word !== word);
    localStorage.setItem(STORAGE_KEYS.MISSED, JSON.stringify(missed));
  } catch {}
}

// --- Daily Stats ---
export function loadDailyStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    const items = raw ? JSON.parse(raw) : [];
    return pruneOld(items);
  } catch { return []; }
}

export function recordAttempt(wpm, accuracy) {
  try {
    let stats = loadDailyStats();
    const today = new Date().toISOString().split('T')[0];
    const existing = stats.find(s => s.date === today);

    if (existing) {
      existing.attempts += 1;
      existing.totalAccuracy += accuracy;
      existing.avgAccuracy = existing.totalAccuracy / existing.attempts;
      existing.maxWpm = Math.max(existing.maxWpm, wpm);
      existing.wpm = wpm;
    } else {
      stats.push({
        date: today,
        timestamp: now(),
        attempts: 1,
        totalAccuracy: accuracy,
        avgAccuracy: accuracy,
        wpm,
        maxWpm: wpm,
      });
    }

    stats = pruneOld(stats);
    localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(stats));
  } catch {}
}

export function getPersonalBests() {
  try {
    const stats = loadDailyStats();
    if (!stats.length) return { wpm: 0, accuracy: 0 };
    return {
      wpm: Math.max(...stats.map(s => s.maxWpm || 0)),
      accuracy: Math.max(...stats.map(s => s.avgAccuracy || 0)),
    };
  } catch { return { wpm: 0, accuracy: 0 }; }
}
