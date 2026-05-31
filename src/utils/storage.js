/**
 * utils/storage.js — localStorage read/write for user preferences.
 *
 * Owns: persisting and loading language choice, audio settings, and tutorial state.
 * RunState is intentionally excluded — it lives only in memory.
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

const VALID_LANGUAGES = new Set(['javascript', 'python']);

let memoryPreferences = { ...DEFAULTS };

/**
 * Safely reads one value from localStorage.
 * @param {string} key - Storage key.
 * @returns {{ok: boolean, value: string | null}} Read result.
 */
function safeGetItem(key) {
  try {
    return { ok: true, value: localStorage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
}

/**
 * Safely writes one value to localStorage.
 * @param {string} key - Storage key.
 * @param {string} value - Value to store.
 * @returns {boolean} True when write succeeds.
 */
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely removes one value from localStorage.
 * @param {string} key - Storage key.
 * @returns {boolean} True when remove succeeds.
 */
function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses a saved language value.
 * @param {string | null} value - Raw language value.
 * @param {string} fallback - Fallback language.
 * @returns {string} Valid language.
 */
function parseLanguage(value, fallback = DEFAULTS.language) {
  return VALID_LANGUAGES.has(value) ? value : fallback;
}

/**
 * Parses a saved volume value.
 * @param {*} value - Raw volume value.
 * @param {number} fallback - Fallback volume.
 * @returns {number} Valid volume between 0 and 1.
 */
function parseVolume(value, fallback) {
  if (value === null || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

/**
 * Parses a saved boolean value.
 * @param {string | null} value - Raw boolean value.
 * @param {boolean} fallback - Fallback boolean.
 * @returns {boolean} Valid boolean.
 */
function parseBoolean(value, fallback) {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
}

/**
 * Returns stored preferences with safe defaults for missing or invalid values.
 * @returns {{language: string, musicVolume: number, sfxVolume: number, muted: boolean, tutorialSeen: boolean}} User preferences.
 */
export function getPreferences() {
  const language = safeGetItem(KEYS.language);
  const musicVolume = safeGetItem(KEYS.musicVolume);
  const sfxVolume = safeGetItem(KEYS.sfxVolume);
  const muted = safeGetItem(KEYS.muted);
  const tutorialSeen = safeGetItem(KEYS.tutorialSeen);

  const preferences = {
    language: language.ok ? parseLanguage(language.value) : memoryPreferences.language,
    musicVolume: musicVolume.ok
      ? parseVolume(musicVolume.value, DEFAULTS.musicVolume)
      : memoryPreferences.musicVolume,
    sfxVolume: sfxVolume.ok
      ? parseVolume(sfxVolume.value, DEFAULTS.sfxVolume)
      : memoryPreferences.sfxVolume,
    muted: muted.ok ? parseBoolean(muted.value, DEFAULTS.muted) : memoryPreferences.muted,
    tutorialSeen: tutorialSeen.ok
      ? parseBoolean(tutorialSeen.value, DEFAULTS.tutorialSeen)
      : memoryPreferences.tutorialSeen,
  };

  memoryPreferences = preferences;
  return { ...preferences };
}

/**
 * Saves the selected language when it is supported.
 * @param {string} language - Selected language.
 * @returns {void}
 */
export function saveLanguage(language) {
  if (!VALID_LANGUAGES.has(language)) {
    return;
  }

  memoryPreferences = { ...memoryPreferences, language };
  safeSetItem(KEYS.language, language);
}

/**
 * Saves audio preferences with safe defaults for invalid values.
 * @param {object} settings - Audio settings.
 * @param {number} settings.musicVolume - Music volume from 0 to 1.
 * @param {number} settings.sfxVolume - Sound effects volume from 0 to 1.
 * @param {boolean} settings.muted - Whether audio is muted.
 * @returns {void}
 */
export function saveAudioSettings({ musicVolume, sfxVolume, muted }) {
  const nextSettings = {
    musicVolume: parseVolume(musicVolume, DEFAULTS.musicVolume),
    sfxVolume: parseVolume(sfxVolume, DEFAULTS.sfxVolume),
    muted: typeof muted === 'boolean' ? muted : DEFAULTS.muted,
  };

  memoryPreferences = { ...memoryPreferences, ...nextSettings };
  safeSetItem(KEYS.musicVolume, String(nextSettings.musicVolume));
  safeSetItem(KEYS.sfxVolume, String(nextSettings.sfxVolume));
  safeSetItem(KEYS.muted, String(nextSettings.muted));
}

/**
 * Marks the tutorial as seen.
 * @returns {void}
 */
export function markTutorialSeen() {
  memoryPreferences = { ...memoryPreferences, tutorialSeen: true };
  safeSetItem(KEYS.tutorialSeen, 'true');
}

/**
 * Removes all storage values in the phantomtype.v1 namespace.
 * @returns {void}
 */
export function resetToDefaults() {
  memoryPreferences = { ...DEFAULTS };

  let keys = Object.values(KEYS);

  try {
    keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key && key.startsWith(`${NAMESPACE}.`)) {
        keys.push(key);
      }
    }
  } catch {
    keys = Object.values(KEYS);
  }

  keys.forEach((key) => {
    safeRemoveItem(key);
  });
}
