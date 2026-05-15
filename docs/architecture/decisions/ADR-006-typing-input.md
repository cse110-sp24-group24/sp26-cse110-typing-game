# ADR-006: Typing Input System

## Status

Accepted

## Context

The typing input system is the most latency-sensitive part of the game. Every keypress must:

1. Update the visual feedback on the target line (correct characters in green, incorrect in red) within one paint cycle — no frame wait
2. Compare the player's current input against the active target string
3. Fire an "enemy defeated" event the instant the full line is typed correctly
4. Prevent the player from pasting (educational integrity)
5. Prevent the input from ever losing focus mid-wave

Secondary requirements from user stories:
- On incorrect character: do NOT clear the field; player corrects in place (Nishant US-01, Sam US-03)
- On correct submission: field clears instantly, focus stays (Sam US-03)
- Field must be auto-focused at wave start without requiring a click (Sam US-03)

Three input approaches were evaluated:

1. **`<input type="text">` element**
2. **`contenteditable` div**
3. **Canvas key event capture** (listen to `keydown` on `window`, build own buffer)

## Decision

Use a single **`<input type="text">`** element with `autocomplete="off"`, `autocorrect="off"`, `autocapitalize="off"`, and `spellcheck="false"`. Paste is blocked via the `paste` event. The element is auto-focused with `.focus()` at the start of each wave and on enemy defeat.

## Considered Options

### Option 1: `<input type="text">` (Chosen)

One persistent `<input>` element exists in the DOM throughout the game screen. Its `value` is cleared and `.focus()` called each time a new enemy becomes active. Typo feedback is rendered in a separate, read-only overlay positioned above the input (or directly beside the target line).

**Pros:**
- Native browser focus management: mobile virtual keyboard behavior is well-defined, `:focus` CSS state is reliable, autofill can be disabled trivially
- `input` event fires synchronously on every character change, including autocorrect behavior (which we suppress)
- Blocking paste is a one-liner: `input.addEventListener('paste', e => e.preventDefault())`
- The `value` property provides the current input string with no parsing required
- Mobile browser support is mature and predictable

**Cons:**
- The visual feedback for correct/incorrect characters must be rendered in a *separate* element (a span overlay), not inside the input itself, since `<input>` doesn't support mixed character styling. This requires keeping the overlay synchronized with the input value.
- Browser autofill dropdowns can appear on certain browsers despite `autocomplete="off"`; requires `autocomplete="new-password"` as a workaround

### Option 2: `contenteditable` Div

A `<div contenteditable="true">` accepts typed input and can have mixed inline styling (green/red spans per character).

**Pros:**
- Mixed character styling is native — no separate overlay element needed
- The visual "caret" position is part of the element, making it look more like a real code editor

**Cons:**
- `contenteditable` has notoriously inconsistent behavior across browsers for programmatic value manipulation (`textContent = ''` does not always work as expected)
- Paste behavior is much harder to fully suppress — pasted rich text, HTML, or formatted content can bypass simple `paste` event prevention
- Mobile browser support for `contenteditable` is fragmented, especially for autocorrect/autocapitalize suppression
- Reading "what the player has typed so far" requires walking the DOM children, not just reading a `.value` property
- Focus behavior on `contenteditable` is less predictable than on native form elements

### Option 3: Canvas Key Capture

Listen to `keydown` on `window`, maintain a JavaScript string buffer, and render the buffer character-by-character onto a canvas or custom element.

**Pros:**
- Full control: no browser auto-behaviors to suppress
- Works even if the game renders on `<canvas>`

**Cons:**
- Dead keys, IME (input method editor) support, and composed characters (accents, international keyboards) require reimplementing browser-native input handling — a large and bug-prone surface
- Mobile support is essentially impossible (no hardware keyboard guarantee)
- The game targets student laptops with standard keyboards, but the input handling complexity is not worth the control gained

## Decision Outcome

**Option 1 (`<input type="text">`)** was chosen. The typing feedback overlay is a separate `<div class="target-line-display">` rendered alongside the input, which `typingEngine.js` updates on every `input` event.

### Feedback Rendering

On every `input` event, `typingEngine.js`:
1. Reads `input.value` (the current player buffer)
2. Compares it character-by-character against the active target string
3. Rebuilds the `target-line-display` HTML:
   - Characters matched so far: `<span class="correct">c</span>`
   - First mismatched character: `<span class="incorrect">x</span>`
   - Remaining untyped characters: unstyled
4. If `input.value === targetLine`: fires `onEnemyDefeated`, clears `input.value`, calls `.focus()`

### Auto-Focus Protocol

```js
// Called at wave start and on each enemy defeat
function activateEnemy(enemy) {
  currentTarget = enemy.line;
  input.value = '';
  input.focus();
}
```

`input.focus()` is called inside a `setTimeout(fn, 0)` when triggered from within an event handler (e.g., after upgrade selection) to yield to the browser's event loop before claiming focus.

### Input Attributes

```html
<input
  id="typing-input"
  type="text"
  autocomplete="new-password"
  autocorrect="off"
  autocapitalize="off"
  spellcheck="false"
  aria-label="Type the code shown above"
/>
```

### Positive Consequences
- Reliable cross-browser focus, autocorrect suppression, and paste blocking with minimal code
- `typingEngine.js` is a pure function over `(inputValue, targetString) → feedbackHTML` — easy to unit test
- The input element is always in the DOM; no creation/destruction overhead per enemy

### Negative Consequences
- The feedback overlay must be kept visually aligned with the input element via CSS; layout shifts must be tested across browser zoom levels
- Autofill suppression requires `autocomplete="new-password"` (a known hack) that may stop working in future browser versions
