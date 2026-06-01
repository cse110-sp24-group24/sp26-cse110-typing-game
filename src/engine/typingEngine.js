/**
 * engine/typingEngine.js — Input comparison and real-time typo highlighting.
 *
 * Owns: the #typing-input listener, character-by-character comparison,
 * rendering correct/incorrect spans in #target-line-display, WPM/accuracy
 * calculation, and signaling a successful line completion.
 *
 * Implemented by Issue #5.
 */

let _inputEl = null;

let _feedbackEl = null;

let _onDefeated = () => {};

let _onKeystroke = () => {};

let _target = '';

let _active = false;

/**
 * Wires the engine to the DOM elements it needs and stores the callbacks.
 * Sets required attributes on the input element (autocomplete, autocorrect,
 * autocapitalize, spellcheck) so mobile and desktop browsers do not interfere
 * with typing.
 *
 * Call once at application start, before the first wave.
 *
 * @param {HTMLInputElement} inputEl - The text input the player types into.
 * @param {HTMLElement} feedbackEl - The overlay that shows per-character colours.
 * @param {function(): void} onDefeated - Called when the player completes the target.
 * @param {function(boolean): void} onKeystroke - Called on every input event;
 *   receives `true` if the typed prefix is correct so far, `false` otherwise.
 */
export function init(inputEl, feedbackEl, onDefeated, onKeystroke) {
  _inputEl = inputEl;
  _feedbackEl = feedbackEl;
  _onDefeated = onDefeated ?? (() => {});
  _onKeystroke = onKeystroke ?? (() => {});

  _inputEl.setAttribute('autocomplete', 'new-password');
  _inputEl.setAttribute('autocorrect', 'off');
  _inputEl.setAttribute('autocapitalize', 'off');
  _inputEl.setAttribute('spellcheck', 'false');

  _inputEl.addEventListener('paste', handlePaste);

  activate();
}

/**
 * Sets the current target string the player must type.
 * @param {string} _line - The target string to match.
 */
export function setTarget(_line) {
  // Issue #5
  _target = _line ?? '';

  if (_inputEl) {
    _inputEl.value = '';
    _inputEl.focus();
  }

  renderFeedback('');
}

/**
 * Clears the active target and wipes the feedback overlay.
 */
export function clearTarget() {
  // Issue #5
  _target = '';

  if (_inputEl) {
    _inputEl.value = '';
  }

  if (_feedbackEl) {
    _feedbackEl.innerHTML = '';
  }
}

/**
 * Re-attaches the `input` event listener so the engine processes keystrokes.
 */
export function activate() {
  if (_active || !_inputEl) {
    return;
  }
  _inputEl.addEventListener('input', handleInput);
  _active = true;
}

/**
 * Removes the `input` event listener so keystrokes are ignored.
 */
export function deactivate() {
  if (!_active || !_inputEl) {
    return;
  }
  _inputEl.removeEventListener('input', handleInput);
  _active = false;
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

/**
 * Issue #50 pause-menu: Exposes whether resume should restore typing.
 *
 * Returns whether typing input events are currently processed.
 * @returns {boolean}
 */
export function isActive() {
  return _active;
}

/**
 * Escapes the five characters that are meaningful inside HTML text nodes so
 * that raw target characters never break the feedback markup.
 *
 * @param {string} ch - A single character to escape.
 * @returns {string} HTML-safe representation of `ch`.
 */
function escapeHtml(ch) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return map[ch] ?? ch;
}

/**
 * Rebuilds `_feedbackEl.innerHTML` by walking every character of `_target`
 * and wrapping it in a `<span>` whose class reflects whether the player has
 * typed it correctly, incorrectly, or not yet.
 *
 * @param {string} typed - Current value of the input element.
 */
function renderFeedback(typed) {
  if (!_feedbackEl) {
    return;
  }

  let html = '';
  let errorFound = false;

  for (let i = 0; i < _target.length; i++) {
    const ch = escapeHtml(_target[i]);

    if (i >= typed.length) {
      html += `<span>${ch}</span>`;
    } else if (!errorFound && typed[i] === _target[i]) {
      html += `<span class="correct">${ch}</span>`;
    } else {
      errorFound = true;
      html += `<span class="incorrect">${ch}</span>`;
    }
  }

  _feedbackEl.innerHTML = html;
}

/**
 * Fired on every `input` event from the typing field.
 *
 */
function handleInput() {
  if (!_inputEl || !_target) {
    return;
  }

  const typed = _inputEl.value;

  renderFeedback(typed);

  const isCorrect = typed === _target.slice(0, typed.length);
  _onKeystroke(isCorrect);

  if (typed === _target) {
    _onDefeated();
    _inputEl.value = '';
    renderFeedback('');
    _inputEl.focus();
  }
}

/**
 * Blocks all paste events so the player cannot paste the target string.
 * Satisfies Sam US-03.
 *
 * @param {ClipboardEvent} event - The paste event to cancel.
 */
function handlePaste(event) {
  event.preventDefault();
}
