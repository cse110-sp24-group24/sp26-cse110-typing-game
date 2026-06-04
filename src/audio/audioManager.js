import { getPreferences, saveAudioSettings } from '../utils/storage.js';

const AUDIO_PATH = 'assets/audio/';
const MENU_MUSIC_SRC = 'media/audio/spookymusic.mp3';
const DEFEAT_POOL_SIZE = 4;
const LIFE_LOSS_CUTOFF_RATIO = 0.5;

let ambientAudio = null;
let bossAmbientAudio = null;
let menuAudio = null;
let currentAmbient = null;

let sfxElements = {};
let defeatPool = [];
let defeatIndex = 0;
const oneShotCutoffTimers = new WeakMap();

let musicVolume = 0.575;
let sfxVolume = 0.7;
let isMuted = false;

/**
 * Creates audio elements and loads saved audio preferences.
 */
export function init() {
  const prefs = getPreferences();

  musicVolume = prefs.musicVolume;
  sfxVolume = prefs.sfxVolume;
  isMuted = prefs.muted;

  ambientAudio = createAudio('ambient-wave.mp3', true, musicVolume);
  bossAmbientAudio = createAudio('ambient-boss.mp3', true, musicVolume);

  // Menu music uses a different path from the in-game assets folder.
  menuAudio = new Audio(MENU_MUSIC_SRC);
  menuAudio.loop = true;
  menuAudio.preload = 'auto';
  menuAudio.volume = isMuted ? 0 : musicVolume;

  sfxElements = {
    error: createAudio('sfx-error.mp3', false, sfxVolume),
    'boss-sting': createAudio('sfx-boss-sting.mp3', false, sfxVolume),
    'life-loss': createAudio('sfx-life-loss.mp3', false, sfxVolume),
  };

  defeatPool = Array.from({ length: DEFEAT_POOL_SIZE }, () =>
    createAudio('sfx-defeat.mp3', false, sfxVolume)
  );
}

/**
 * Plays the main-menu spooky background music (spookymusic.mp3).
 * Separate from the in-game ambient track so the menu has its own atmosphere.
 * If autoplay is blocked, retries on the first user interaction.
 */
export function playMenuMusic() {
  if (!menuAudio || isMuted) {
    return;
  }
  menuAudio.volume = musicVolume;
  menuAudio.play().catch(() => {
    const resume = () => {
      ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
        document.removeEventListener(ev, resume)
      );
      menuAudio.play().catch(() => {});
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach((ev) =>
      document.addEventListener(ev, resume, { once: true })
    );
  });
}

/**
 * Stops and resets the menu music. Call this when gameplay begins.
 */
export function stopMenuMusic() {
  stopAudio(menuAudio);
}

/**
 * Starts the normal wave ambient music.
 */
export function playAmbient() {
  switchAmbient(ambientAudio);
}

/**
 * Stops all ambient music and resets it to the beginning.
 */
export function stopAmbient() {
  stopAudio(ambientAudio);
  stopAudio(bossAmbientAudio);
  currentAmbient = null;
}

/**
 * Pauses the currently playing ambient track.
 */
export function pause() {
  if (currentAmbient) {
    currentAmbient.pause();
  }
}

/**
 * Resumes the currently selected ambient track.
 */
export function resume() {
  if (currentAmbient && !isMuted) {
    currentAmbient.play().catch(() => {});
  }
}

/**
 * Switches from normal ambient music to boss ambient music.
 */
export function playBossAmbient() {
  playSFX('boss-sting');
  switchAmbient(bossAmbientAudio);
}

/**
 * Plays a named sound effect.
 * @param {string} name - 'defeat', 'error', 'boss-sting', or 'life-loss'.
 */
export function playSFX(name) {
  if (isMuted || sfxVolume === 0) {
    return;
  }

  if (name === 'defeat') {
    const sfx = defeatPool[defeatIndex];
    defeatIndex = (defeatIndex + 1) % DEFEAT_POOL_SIZE;
    playOneShot(sfx);
    return;
  }

  if (name === 'life-loss') {
    playOneShot(sfxElements[name], LIFE_LOSS_CUTOFF_RATIO);
    return;
  }

  playOneShot(sfxElements[name]);
}

/**
 * Sets and saves music volume.
 * @param {number} volume - Music volume from 0 to 1.
 */
export function setMusicVolume(volume) {
  musicVolume = clampVolume(volume);

  if (menuAudio) {
    menuAudio.volume = isMuted ? 0 : musicVolume;
  }

  if (ambientAudio) {
    ambientAudio.volume = isMuted ? 0 : musicVolume;
  }

  if (bossAmbientAudio) {
    bossAmbientAudio.volume = isMuted ? 0 : musicVolume;
  }

  saveAudioPreferences();
}

/**
 * Sets and saves SFX volume.
 * @param {number} volume - SFX volume from 0 to 1.
 */
export function setSFXVolume(volume) {
  sfxVolume = clampVolume(volume);

  Object.values(sfxElements).forEach((audio) => {
    audio.volume = isMuted ? 0 : sfxVolume;
  });

  defeatPool.forEach((audio) => {
    audio.volume = isMuted ? 0 : sfxVolume;
  });

  saveAudioPreferences();
}

/**
 * Mutes all audio.
 */
export function mute() {
  isMuted = true;
  applyMuteState();
  saveAudioPreferences();
}

/**
 * Unmutes all audio.
 */
export function unmute() {
  isMuted = false;
  applyMuteState();
  saveAudioPreferences();
}

/**
 * Creates an audio element.
 * @param {string} filename - Audio file name.
 * @param {boolean} loop - Whether the audio should loop.
 * @param {number} volume - Initial volume.
 * @returns {HTMLAudioElement} Created audio element.
 */
function createAudio(filename, loop, volume) {
  const audio = new Audio(`${AUDIO_PATH}${filename}`);
  audio.loop = loop;
  audio.preload = 'auto';
  audio.volume = isMuted ? 0 : volume;
  return audio;
}

/**
 * Switches the active ambient track.
 * @param {HTMLAudioElement} nextAmbient - Ambient track to play.
 */
function switchAmbient(nextAmbient) {
  if (!nextAmbient) {
    return;
  }

  if (currentAmbient && currentAmbient !== nextAmbient) {
    currentAmbient.pause();
    currentAmbient.currentTime = 0;
  }

  currentAmbient = nextAmbient;
  currentAmbient.volume = isMuted ? 0 : musicVolume;

  if (!isMuted) {
    currentAmbient.play().catch(() => {});
  }
}

/**
 * Plays one sound effect from the beginning.
 * @param {HTMLAudioElement} audio - Audio element to play.
 * @param {number} [cutoffRatio] - Optional fraction of duration to play before stopping.
 */
function playOneShot(audio, cutoffRatio) {
  if (!audio) {
    return;
  }

  const existingCutoff = oneShotCutoffTimers.get(audio);
  if (existingCutoff) {
    window.clearTimeout(existingCutoff);
    oneShotCutoffTimers.delete(audio);
  }

  audio.currentTime = 0;
  audio.volume = isMuted ? 0 : sfxVolume;
  audio.play().catch(() => {});

  if (!Number.isFinite(cutoffRatio)) {
    return;
  }

  const stopAtCutoff = () => {
    const timer = window.setTimeout(
      () => {
        audio.pause();
        audio.currentTime = 0;
        oneShotCutoffTimers.delete(audio);
      },
      audio.duration * cutoffRatio * 1000
    );
    oneShotCutoffTimers.set(audio, timer);
  };

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    stopAtCutoff();
    return;
  }

  audio.addEventListener('loadedmetadata', stopAtCutoff, { once: true });
}

/**
 * Stops and resets audio.
 * @param {HTMLAudioElement} audio - Audio element to stop.
 */
function stopAudio(audio) {
  if (!audio) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
}

/**
 * Applies mute state to all audio elements.
 */
function applyMuteState() {
  if (menuAudio) {
    menuAudio.volume = isMuted ? 0 : musicVolume;
  }

  if (ambientAudio) {
    ambientAudio.volume = isMuted ? 0 : musicVolume;
  }

  if (bossAmbientAudio) {
    bossAmbientAudio.volume = isMuted ? 0 : musicVolume;
  }

  Object.values(sfxElements).forEach((audio) => {
    audio.volume = isMuted ? 0 : sfxVolume;
  });

  defeatPool.forEach((audio) => {
    audio.volume = isMuted ? 0 : sfxVolume;
  });
}

/**
 * Saves current audio preferences.
 */
function saveAudioPreferences() {
  saveAudioSettings({
    musicVolume,
    sfxVolume,
    muted: isMuted,
  });
}

/**
 * Keeps volume values between 0 and 1.
 * @param {number} volume - Raw volume value.
 * @returns {number} Clamped volume.
 */
function clampVolume(volume) {
  return Math.min(1, Math.max(0, volume));
}
