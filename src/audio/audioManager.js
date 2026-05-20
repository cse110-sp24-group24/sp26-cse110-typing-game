/**
 * audio/audioManager.js — Audio element pool and playback control.
 *
 * Owns: preloading audio files into an <audio> pool, play/pause,
 * per-channel volume, and mute-all. API shaped for post-MVP Howler.js swap.
 *
 * Ambient music: implemented (Issue #8).
 * Full SFX pool: Issue #15.
 */

const AMBIENT_SRC = 'media/Music%3ASound%20Effects/spookymusic.mp3';
const AUTOPLAY_RESUME_EVENTS = ['pointerdown', 'keydown', 'touchstart'];

/** @type {HTMLAudioElement|null} */
let ambientAudio = null;
let musicVolume = 0.5;
let sfxVolume = 0.7;
let muted = false;

/**
 * Initialises the audio system. Must be called once before any other function.
 * Attaches the ambient <audio> element to the DOM for inspectability.
 * @param {object} prefs - User preference object.
 * @param {number} prefs.musicVolume - Music volume 0–1.
 * @param {number} prefs.sfxVolume - SFX volume 0–1.
 * @param {boolean} prefs.muted - Whether all audio starts muted.
 */
export function init(prefs) {
  musicVolume = prefs.musicVolume ?? 0.5;
  sfxVolume = prefs.sfxVolume ?? 0.7;
  muted = prefs.muted ?? false;

  ambientAudio = new Audio(AMBIENT_SRC);
  ambientAudio.autoplay = true;
  ambientAudio.loop = true;
  ambientAudio.preload = 'auto';
  ambientAudio.volume = muted ? 0 : musicVolume;
  ambientAudio.setAttribute('autoplay', '');

  // Attached to DOM so tests and devtools can inspect the element.
  document.body.appendChild(ambientAudio);
}

/**
 * Starts looping the ambient background music.
 * If autoplay is blocked, retries on the player's first interaction.
 */
export function playAmbient() {
  if (!ambientAudio) {
    return;
  }

  ambientAudio.play().catch(() => {
    const resumeOnGesture = () => {
      AUTOPLAY_RESUME_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, resumeOnGesture);
      });
      ambientAudio.play().catch(() => {});
    };

    AUTOPLAY_RESUME_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, resumeOnGesture, { once: true });
    });
  });
}

/**
 * Pauses and resets the ambient music to the beginning.
 */
export function stopAmbient() {
  if (!ambientAudio) {
    return;
  }
  ambientAudio.pause();
  ambientAudio.currentTime = 0;
}

/**
 * Plays a named one-shot sound effect.
 * @param {string} _name - Effect name: 'defeat' | 'error' | 'boss-sting'.
 */
export function playSfx(_name) {
  if (muted || sfxVolume === 0) {
    return;
  }

  // Issue #15
}

/**
 * Sets the music channel volume.
 * @param {number} vol - Volume level 0 (silent) to 1 (full).
 */
export function setMusicVolume(vol) {
  musicVolume = vol;
  if (ambientAudio && !muted) {
    ambientAudio.volume = vol;
  }
}

/**
 * Sets the SFX channel volume.
 * @param {number} vol - Volume level 0 (silent) to 1 (full).
 */
export function setSfxVolume(vol) {
  sfxVolume = vol;
}

/**
 * Mutes or unmutes all audio channels.
 * @param {boolean} isMuted - True to silence everything, false to restore.
 */
export function setMuted(isMuted) {
  muted = isMuted;
  if (ambientAudio) {
    ambientAudio.volume = isMuted ? 0 : musicVolume;
  }
}
