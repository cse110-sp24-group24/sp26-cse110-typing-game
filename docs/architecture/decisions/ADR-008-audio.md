# ADR-008: Audio System

## Status

Accepted

## Context

Multiple user stories require audio as a core part of the horror atmosphere and typing feedback loop:
- Ambient background audio looping during waves (Nishant US-07, Soohwan US-09, Henry US-08)
- A distinct audio sting on boss spawn (Sam US-06)
- A ghost defeat sound on correct enemy submission (Sam US-05, Soohwan US-09)
- An error sound on incorrect character (Soohwan US-09)
- Separate volume controls for music and SFX, with a mute toggle (Shubhi US-10)
- Audio settings persisting across sessions (Shubhi US-10)

The audio system must:
- Play and loop background music without gaps
- Trigger short one-shot SFX on game events with low latency
- Support independent volume for music vs. SFX
- Not require a backend or CDN at runtime
- Work on modern desktop browsers (Chrome, Firefox, Safari)

Three options were evaluated:

1. **HTML `<audio>` elements** (declarative, in the DOM)
2. **Web Audio API** (programmatic, low-level)
3. **Howler.js** (third-party audio library)

## Decision

Use **HTML `<audio>` elements managed by `audio/audioManager.js`**. One `<audio>` element is used for the ambient loop; a small pool of `<audio>` elements is used for SFX to allow overlapping playback. Volume is controlled via the `.volume` property. This is sufficient for MVP and can be upgraded to Howler.js post-MVP without changing the `audioManager` public API.

## Considered Options

### Option 1: HTML `<audio>` Elements (Chosen)

Multiple `<audio>` elements are created in JavaScript and managed by `audioManager.js`. The ambient track uses `loop="true"`. SFX uses a pool of 3–5 pre-created elements per sound to allow concurrent playback.

**Pros:**
- Zero dependencies; no third-party library needed
- Works in all target browsers
- `audio.volume = 0` provides instant mute
- `audio.pause()` / `audio.play()` work synchronously for pause implementation
- Looping background music with no gap is handled by the browser's native loop flag
- Simple to implement: 50–80 lines of JS for the full system

**Cons:**
- Autoplay restrictions: browsers block audio until a user gesture has occurred. Since all audio starts after the "Play" button click, this is not an issue for the ambient track; SFX that might fire before user interaction (e.g., during intro sequence) must be checked
- Overlapping SFX (multiple ghost defeats in rapid succession) requires an element pool rather than re-triggering a single element. Pool size must be tuned to avoid "starvation" on fast runs
- The ambient loop may have a brief silence at the loop point in some browsers if the audio file is not prepared with a seamless loop (trimmed to exactly a beat boundary)

### Option 2: Web Audio API

The `AudioContext` API provides sample-level control: precise scheduling, gain nodes, convolution reverb, and gapless looping via `BufferSource.loop = true`.

**Pros:**
- Gapless looping is guaranteed with `BufferSource`
- Multiple sounds can be mixed and controlled with gain nodes
- Reverb, spatialization, and other effects are possible for advanced horror atmosphere

**Cons:**
- Significantly more complex: fetching and decoding audio buffers, managing `AudioContext` suspend/resume, connecting nodes — this is 200–300 lines of careful code for basic functionality
- `AudioContext` must be created inside a user gesture callback (same restriction as `<audio>`), but the API is more verbose about this
- Debugging Web Audio issues is harder than debugging `<audio>` element issues
- The team's audio contributor should be able to add sound effects without understanding buffer scheduling

### Option 3: Howler.js

Howler.js is a popular audio library that wraps Web Audio API with an `<audio>` element fallback.

**Pros:**
- Handles autoplay restrictions, gapless looping, and sprite-based SFX pools automatically
- Simple API: `sound.play()`, `sound.volume(0.5)`, `sound.stop()`
- Good browser coverage

**Cons:**
- Adds a ~30KB dependency (minified) for a project that otherwise has no JS dependencies
- Requires either a CDN or a local copy in `lib/`
- For the audio requirements of this MVP, Howler provides features (audio sprites, rate control, 3D positioning) that will not be used
- The `audioManager.js` public API can be designed to match what Howler would provide, so upgrading post-MVP is a one-file change

## Decision Outcome

**Option 1 (HTML `<audio>` elements)** was chosen for MVP. The `audioManager.js` public API is designed to be Howler-compatible so that a post-MVP upgrade requires changing only `audioManager.js` internals.

### `audioManager.js` Public API

```js
export function init()                         // create audio elements, attach to DOM
export function playAmbient()                  // start looping background track
export function stopAmbient()                  // stop ambient on pause/menu
export function playSFX(name)                  // 'defeat' | 'error' | 'boss' | 'lifeloss'
export function setMusicVolume(0..1)           // persisted to localStorage via storage.js
export function setSFXVolume(0..1)             // persisted to localStorage via storage.js
export function mute()                         // set all volumes to 0
export function unmute()                       // restore saved volumes
export function pause()                        // pause ambient mid-game
export function resume()                       // resume ambient after pause
```

### Sound Assets

All audio files are stored in `assets/audio/` as `.mp3` files (best browser coverage) with `.ogg` fallbacks.

| File | Use | Loop |
|------|-----|------|
| `ambient-wave.mp3` | Background music during waves | Yes |
| `ambient-boss.mp3` | Ambient track during boss fight (more intense) | Yes |
| `sfx-defeat.mp3` | Ghost vanish on correct submission | No |
| `sfx-error.mp3` | Short dissonant chirp on incorrect character | No |
| `sfx-boss-sting.mp3` | Boss spawn introduction sting | No |
| `sfx-life-loss.mp3` | Heartbeat/thud on life deduction | No |

### SFX Pool

For `sfx-defeat` (which can fire several times per second on a fast typist), `audioManager` maintains a pool of 4 `<audio>` elements referencing the same source. `playSFX('defeat')` cycles through the pool using a round-robin index.

### Positive Consequences
- No dependencies; audio system is entirely self-contained
- The `audioManager` API is already shaped for a future Howler.js upgrade
- Volume + mute state is persisted via `storage.js` without duplicating localStorage logic

### Negative Consequences
- The ambient loop may have a 10–50ms gap at the loop point in Firefox without careful audio file preparation
- Rapid defeat sounds may clip if pool size (4) is exceeded — tuning may be needed during playtesting
