import { getPreferences, savePreferences } from '../utils/storage.js';

const AUDIO_PATH = 'assets/audio/';
const DEFEAT_POOL_SIZE = 4;

let ambientAudio = null;
let bossAmbientAudio = null;
let currentAmbient = null;

let sfxElements = {};
let defeatPool = [];
let defeatIndex = 0;

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

  playOneShot(sfxElements[name]);
}

/**
 * Sets and saves music volume.
 * @param {number} volume - Music volume from 0 to 1.
 */
export function setMusicVolume(volume) {
  musicVolume = clampVolume(volume);

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
 */
function playOneShot(audio) {
  if (!audio) {
    return;
  }

  audio.currentTime = 0;
  audio.volume = isMuted ? 0 : sfxVolume;
  audio.play().catch(() => {});
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
  const prefs = getPreferences();

  savePreferences({
    ...prefs,
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
