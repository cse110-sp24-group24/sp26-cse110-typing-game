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

function safeGetItem(key) {
  try {
    return { ok: true, value: localStorage.getItem(key) };
  } catch {
    return { ok: false, value: null };
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function parseLanguage(value, fallback = DEFAULTS.language) {
  return VALID_LANGUAGES.has(value) ? value : fallback;
}

function parseVolume(value, fallback) {
  if (value === null || value === '') return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

function parseBoolean(value, fallback) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

/**
 * Returns stored preferences with safe defaults for missing or invalid values.
 */
export function getPreferences() {
  const language = safeGetItem(KEYS.language);
  const musicVolume = safeGetItem(KEYS.musicVolume);
  const sfxVolume = safeGetItem(KEYS.sfxVolume);
  const muted = safeGetItem(KEYS.muted);
  const tutorialSeen = safeGetItem(KEYS.tutorialSeen);

  const preferences = {
    language: language.ok
      ? parseLanguage(language.value)
      : memoryPreferences.language,
    musicVolume: musicVolume.ok
      ? parseVolume(musicVolume.value, DEFAULTS.musicVolume)
      : memoryPreferences.musicVolume,
    sfxVolume: sfxVolume.ok
      ? parseVolume(sfxVolume.value, DEFAULTS.sfxVolume)
      : memoryPreferences.sfxVolume,
    muted: muted.ok
      ? parseBoolean(muted.value, DEFAULTS.muted)
      : memoryPreferences.muted,
    tutorialSeen: tutorialSeen.ok
      ? parseBoolean(tutorialSeen.value, DEFAULTS.tutorialSeen)
      : memoryPreferences.tutorialSeen,
  };

  memoryPreferences = preferences;
  return preferences;
}

/**
 * Saves the selected language when it is supported.
 */
export function saveLanguage(language) {
  if (!VALID_LANGUAGES.has(language)) return;

  memoryPreferences = { ...memoryPreferences, language };
  safeSetItem(KEYS.language, language);
}

/**
 * Saves audio preferences with safe defaults for invalid values.
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
 */
export function markTutorialSeen() {
  memoryPreferences = { ...memoryPreferences, tutorialSeen: true };
  safeSetItem(KEYS.tutorialSeen, 'true');
}

/**
 * Removes all storage values in the phantomtype.v1 namespace.
 */
export function resetToDefaults() {
  memoryPreferences = { ...DEFAULTS };

  let keys = Object.values(KEYS);

  try {
    keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      let key = null;
      try {
        key = localStorage.key(index);
      } catch {
        key = null;
      }

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
