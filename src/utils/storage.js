/**
 * utils/storage.js — localStorage read/write for user preferences.
 *
 * Owns: persisting and loading language choice, audio settings, and the
 * tutorial completion flag. RunState is intentionally excluded — it lives
 * only in memory.
 *
 * Implemented by Issue #22.
 */

const NAMESPACE = 'phantomtype.v1';

const KEYS = {
  language: `${NAMESPACE}.language`,
  musicVolume: `${NAMESPACE}.musicVolume`,
  sfxVolume: `${NAMESPACE}.sfxVolume`,
  muted: `${NAMESPACE}.muted`,
  tutorialSeen: `${NAMESPACE}.tutorialSeen`,
};

const DEFAULTS = {
  language: 'javascript',
  musicVolume: 0.575,
  sfxVolume: 0.7,
  muted: false,
  tutorialSeen: false,
};

const VALID_LANGUAGES = new Set(['javascript', 'html', 'css']);

let memoryPreferences = { ...DEFAULTS };

/**
 * Returns saved preferences, falling back to safe defaults or in-memory values
 * when browser storage is unavailable.
 * @returns {{language: string, musicVolume: number, sfxVolume: number, muted: boolean, tutorialSeen: boolean}}
 */
export function getPreferences() {
  const stored = readStoredPreferences();

  if (!stored) {
    return { ...memoryPreferences };
  }

  memoryPreferences = stored;
  return { ...stored };
}

/**
 * Saves the last selected language.
 * @param {string} language - Accepted values are "javascript" or "python".
 * @returns {void}
 */
export function saveLanguage(language) {
  if (!VALID_LANGUAGES.has(language)) {
    return;
  }

  memoryPreferences = {
    ...memoryPreferences,
    language,
  };
  setItem(KEYS.language, language);
}

/**
 * Saves audio preference values.
 * @param {object} settings - Audio settings to persist.
 * @param {number} settings.musicVolume - Music volume from 0 to 1.
 * @param {number} settings.sfxVolume - SFX volume from 0 to 1.
 * @param {boolean} settings.muted - Whether audio is muted.
 * @returns {void}
 */
export function saveAudioSettings({ musicVolume, sfxVolume, muted } = {}) {
  const nextSettings = {
    musicVolume: normalizeVolume(musicVolume, DEFAULTS.musicVolume),
    sfxVolume: normalizeVolume(sfxVolume, DEFAULTS.sfxVolume),
    muted: normalizeBoolean(muted, DEFAULTS.muted),
  };

  memoryPreferences = {
    ...memoryPreferences,
    ...nextSettings,
  };

  setItem(KEYS.musicVolume, String(nextSettings.musicVolume));
  setItem(KEYS.sfxVolume, String(nextSettings.sfxVolume));
  setItem(KEYS.muted, String(nextSettings.muted));
}

/**
 * Marks the tutorial as completed.
 * @returns {void}
 */
export function markTutorialSeen() {
  memoryPreferences = {
    ...memoryPreferences,
    tutorialSeen: true,
  };
  setItem(KEYS.tutorialSeen, 'true');
}

/**
 * Removes all stored preferences for the current storage namespace.
 * @returns {void}
 */
export function resetToDefaults() {
  memoryPreferences = { ...DEFAULTS };
  removeNamespaceKeys();
}

/**
 * Reads all preference keys from localStorage.
 * @returns {object|null} Stored preferences, or null when storage is unavailable.
 */
function readStoredPreferences() {
  const language = getItem(KEYS.language);
  const musicVolume = getItem(KEYS.musicVolume);
  const sfxVolume = getItem(KEYS.sfxVolume);
  const muted = getItem(KEYS.muted);
  const tutorialSeen = getItem(KEYS.tutorialSeen);

  if (!language.ok || !musicVolume.ok || !sfxVolume.ok || !muted.ok || !tutorialSeen.ok) {
    return null;
  }

  return {
    language: normalizeLanguage(language.value),
    musicVolume: normalizeVolume(musicVolume.value, DEFAULTS.musicVolume),
    sfxVolume: normalizeVolume(sfxVolume.value, DEFAULTS.sfxVolume),
    muted: normalizeBoolean(muted.value, DEFAULTS.muted),
    tutorialSeen: normalizeBoolean(tutorialSeen.value, DEFAULTS.tutorialSeen),
  };
}

/**
 * Reads a localStorage item without letting storage errors escape.
 * @param {string} key - Storage key to read.
 * @returns {{ok: boolean, value: string|null}} Read result.
 */
function getItem(key) {
  try {
    return { ok: true, value: localStorage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
}

/**
 * Writes a localStorage item without letting storage errors escape.
 * @param {string} key - Storage key to write.
 * @param {string} value - String value to save.
 * @returns {void}
 */
function setItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable — in-memory preferences are already updated.
  }
}

/**
 * Removes all localStorage keys that belong to this namespace.
 * @returns {void}
 */
function removeNamespaceKeys() {
  const keysToRemove = new Set(Object.values(KEYS));

  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${NAMESPACE}.`)) {
        keysToRemove.add(key);
      }
    }
  } catch {
    return;
  }

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // localStorage unavailable — defaults are already restored in memory.
    }
  });
}

/**
 * Keeps language preference within the accepted Sprint 3 values.
 * @param {string|null} language - Stored language value.
 * @returns {string} Valid language preference.
 */
function normalizeLanguage(language) {
  return VALID_LANGUAGES.has(language) ? language : DEFAULTS.language;
}

/**
 * Converts a stored or provided volume into a safe 0–1 value.
 * @param {number|string|null} volume - Volume value to normalize.
 * @param {number} fallback - Safe fallback when invalid.
 * @returns {number} Normalized volume.
 */
function normalizeVolume(volume, fallback) {
  if (volume === null || volume === '') {
    return fallback;
  }

  const numeric = Number(volume);

  if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
    return fallback;
  }

  return numeric;
}

/**
 * Converts a stored or provided boolean into a safe boolean value.
 * @param {boolean|string|null} value - Boolean value to normalize.
 * @param {boolean} fallback - Safe fallback when invalid.
 * @returns {boolean} Normalized boolean.
 */
function normalizeBoolean(value, fallback) {
  if (value === true || value === 'true') {
    return true;
  }

  if (value === false || value === 'false') {
    return false;
  }

  return fallback;
}
