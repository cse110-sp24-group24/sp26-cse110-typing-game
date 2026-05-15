/**
 * utils/storage.js — localStorage read/write for user preferences.
 *
 * Owns: persisting and loading language choice and audio settings.
 * RunState is intentionally excluded — it lives only in memory.
 *
 * Implemented by Issue #22.
 */

const KEY = 'phantomtype_prefs';

const DEFAULTS = {
  language:    'javascript',
  musicVolume: 0.5,
  sfxVolume:   0.7,
  muted:       false,
};

export function getPreferences() {
  try {
    const stored = localStorage.getItem(KEY);
    return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // localStorage unavailable — silently ignore
  }
}
