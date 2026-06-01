/**
 * utils/storage.js — localStorage read/write for user preferences.
 *
 * Owns all browser storage access for Phantom Type preferences. If
 * localStorage is unavailable, values fall back to memory for this session.
 */

const PREFIX = 'phantomtype.v1.';
const VALID_LANGUAGES = new Set(['javascript', 'python']);

const DEFAULTS = {
  language: 'javascript',
  musicVolume: 0.575,
  sfxVolume: 0.7,
  muted: false,
  tutorialSeen: false,
};

let memory = { ...DEFAULTS };

/**
 * Loads saved user preferences with safe defaults for missing or invalid values.
 * @returns {{language: string, musicVolume: number, sfxVolume: number, muted: boolean, tutorialSeen: boolean}} User preferences.
 */
export function getPreferences() {
  const preferences = {
    language: normalizeLanguage(read('language')),
    musicVolume: normalizeVolume(read('musicVolume'), DEFAULTS.musicVolume),
    sfxVolume: normalizeVolume(read('sfxVolume'), DEFAULTS.sfxVolume),
    muted: normalizeBoolean(read('muted'), DEFAULTS.muted),
    tutorialSeen: normalizeBoolean(read('tutorialSeen'), DEFAULTS.tutorialSeen),
  };

  memory = { ...preferences };
  return preferences;
}

/**
 * Saves the selected programming language.
 * @param {string} language - Selected language. Only 'javascript' and 'python' are accepted.
 * @returns {void}
 */
export function saveLanguage(language) {
  if (!VALID_LANGUAGES.has(language)) {
    return;
  }

  write('language', language);
}

/**
 * Saves audio settings.
 * @param {{musicVolume: number, sfxVolume: number, muted: boolean}} settings - Audio preference values.
 * @returns {void}
 */
export function saveAudioSettings({ musicVolume, sfxVolume, muted }) {
  write('musicVolume', String(normalizeVolume(musicVolume, DEFAULTS.musicVolume)));
  write('sfxVolume', String(normalizeVolume(sfxVolume, DEFAULTS.sfxVolume)));
  write('muted', String(normalizeBoolean(muted, DEFAULTS.muted)));
}

/**
 * Marks the first-run tutorial as seen.
 * @returns {void}
 */
export function markTutorialSeen() {
  write('tutorialSeen', 'true');
}

/**
 * Removes all Phantom Type v1 preference keys.
 * @returns {void}
 */
export function resetToDefaults() {
  memory = { ...DEFAULTS };

  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // localStorage unavailable — memory has already been reset.
  }
}

/**
 * Reads a preference from localStorage or memory when localStorage fails.
 * @param {string} key - Preference key without namespace.
 * @returns {string|number|boolean|null} Stored value.
 */
function read(key) {
  try {
    return localStorage.getItem(`${PREFIX}${key}`);
  } catch {
    return memory[key];
  }
}

/**
 * Writes a preference to memory and localStorage.
 * @param {string} key - Preference key without namespace.
 * @param {string} value - Value to store.
 * @returns {void}
 */
function write(key, value) {
  memory = { ...memory, [key]: value };

  try {
    localStorage.setItem(`${PREFIX}${key}`, value);
  } catch {
    // localStorage unavailable — memory has already been updated.
  }
}

/**
 * Validates a saved language.
 * @param {string|number|boolean|null} language - Stored language value.
 * @returns {string} Valid language.
 */
function normalizeLanguage(language) {
  return VALID_LANGUAGES.has(language) ? language : DEFAULTS.language;
}

/**
 * Validates a saved volume.
 * @param {string|number|boolean|null} value - Stored volume value.
 * @param {number} fallback - Default volume.
 * @returns {number} Valid volume.
 */
function normalizeVolume(value, fallback) {
  const volume = Number(value);
  return Number.isFinite(volume) && volume >= 0 && volume <= 1 ? volume : fallback;
}

/**
 * Validates a saved boolean.
 * @param {string|number|boolean|null} value - Stored boolean value.
 * @param {boolean} fallback - Default boolean.
 * @returns {boolean} Valid boolean.
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
