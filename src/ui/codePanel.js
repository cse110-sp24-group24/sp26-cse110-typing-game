/**
 * ui/codePanel.js — Code assembly panel.
 *
 * Owns: building the function display in #code-panel-lines line by
 * line as enemies are defeated, with Prism.js syntax highlighting.
 *
 * Public API:
 *   init(panelEl)              — attach to the code panel DOM element
 *   reset(snippetName, lines)  — clear panel, show function name in header,
 *                                show placeholder lines for all upcoming lines
 *   revealLine(line, language) — replace the next placeholder with a
 *                                syntax-highlighted line
 *   showFull(lines, language)  — reveal all lines at once (before boss fight)
 *
 * Depends on Prism being loaded globally from lib/prism.min.js.
 *
 * Layer: ui/  — may import from engine/, data/, utils/, state.js
 * Implemented by Issue #9.
 */

/* global Prism */

// ─── Module-private state ────────────────────────────────────────────────────

/** @type {HTMLElement|null} Root panel element */
// eslint-disable-next-line prefer-const
let _panel = null;

/** @type {HTMLElement|null} Header element that shows the function name */
// eslint-disable-next-line prefer-const
let _header = null;

/** @type {HTMLElement|null} Container for all line elements */
// eslint-disable-next-line prefer-const
let _linesContainer = null;

/**
 * Ordered array of placeholder <div> elements.
 * Element at index i corresponds to line i of the current snippet.
 * @type {HTMLElement[]}
 */
let _placeholderEls = [];

/**
 * Index of the next placeholder to be revealed.
 * Incremented by revealLine().
 * @type {number}
 */
let _nextRevealIdx = 0;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Attach the module to a panel DOM element.
 * Must be called before any other function.
 *
 * @param {HTMLElement} panelEl - The DOM element to attach the panel to.
 * @returns {void}
 */
export function init(panelEl) {
  if (!panelEl) {
    console.error('[codePanel] init() called with a falsy panelEl');
    return;
  }
  _panel = panelEl;
  _buildStructure();
}

/**
 * Clear the panel, write the function name into the header, and render
 * placeholder bars for every upcoming line in the snippet.
 *
 * @param {string}   snippetName - The function name to display in the header.
 * @param {string[]} lines       - All source lines of the snippet (order matters).
 * @returns {void}
 */
export function reset(snippetName, lines = []) {
  _assertInit('reset');

  // Update header
  _panel.querySelector('.cp-header__name').textContent = snippetName ? `${snippetName}()` : '';

  // Rebuild lines container
  _linesContainer.innerHTML = '';
  _placeholderEls = [];
  _nextRevealIdx = 0;

  lines.forEach((_, idx) => {
    const el = _makePlaceholder(idx);
    _placeholderEls.push(el);
    _linesContainer.appendChild(el);
  });
}

/**
 * Replace the next placeholder with a syntax-highlighted line.
 * Call once per enemy defeat (in order).
 *
 * @param {string} line     - Exact source line (spaces/tabs preserved).
 * @param {string} language - Prism language key, e.g. "javascript".
 * @returns {void}
 */
export function revealLine(line, language) {
  _assertInit('revealLine');

  const idx = _nextRevealIdx;
  if (idx >= _placeholderEls.length) {
    console.warn('[codePanel] revealLine() called but no more placeholders remain');
    return;
  }

  const placeholder = _placeholderEls[idx];
  const revealed = _makeRevealedLine(line, language, idx);

  _linesContainer.replaceChild(revealed, placeholder);
  _nextRevealIdx++;

  // Auto-scroll to keep the just-revealed line visible.
  // Guard required: jsdom does not implement scrollIntoView.
  if (typeof revealed.scrollIntoView === 'function') {
    revealed.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

/**
 * Reveal all lines at once — used immediately before the boss fight
 * so the player can read the complete function.
 *
 * Any lines already revealed are left untouched.
 * Remaining placeholders are replaced sequentially with a brief
 * staggered animation delay so the reveal feels deliberate.
 *
 * @param {string[]} lines    - All source lines of the snippet.
 * @param {string}   language - Prism language key.
 * @returns {void}
 */
export function showFull(lines, language) {
  _assertInit('showFull');

  const startIdx = _nextRevealIdx;

  for (let idx = startIdx; idx < _placeholderEls.length; idx++) {
    const placeholder = _placeholderEls[idx];
    const revealed = _makeRevealedLine(lines[idx] ?? '', language, idx);

    // Stagger the reveal animation so lines cascade in
    const delay = (idx - startIdx) * 40; // ms between lines
    revealed.style.animationDelay = `${delay}ms`;
    revealed.style.opacity = '0'; // start hidden until animation fires

    _linesContainer.replaceChild(revealed, placeholder);
  }

  _nextRevealIdx = _placeholderEls.length;

  // Scroll to bottom after the cascade finishes
  setTimeout(
    () => {
      _linesContainer.scrollTop = _linesContainer.scrollHeight;
    },
    (_placeholderEls.length - startIdx) * 40 + 100
  );
}

// ─── Legacy / compatibility exports (match original stub signatures) ──────────

/**
 * @deprecated Use reset(snippetName, lines) instead.
 * Kept for compatibility with the original stub signature.
 *
 * @param {object} _state - Legacy RunState parameter, unused.
 * @returns {void}
 */
export function initLegacy(_state) {
  // no-op: init() now takes a DOM element, not RunState.
  // Wire up via init(document.getElementById('code-panel')) in main.js.
  console.warn('[codePanel] initLegacy() is a no-op. Call init(panelEl) instead.');
}

/**
 * @deprecated Use reset(snippetName, lines) instead.
 *
 * @param {string} functionSignature - The function signature to display in the header.
 * @returns {void}
 */
export function setHeader(functionSignature) {
  _assertInit('setHeader');
  _panel.querySelector('.cp-header__name').textContent = functionSignature ?? '';
}

/**
 * @deprecated Use revealLine(line, language) instead.
 * Adds a pre-highlighted line string directly.
 *
 * @param {string} highlightedLineHTML - Pre-highlighted HTML string to insert as a line.
 * @returns {void}
 */
export function addLine(highlightedLineHTML) {
  _assertInit('addLine');
  const idx = _nextRevealIdx;
  const row = document.createElement('div');
  row.className = 'cp-line cp-line--revealed';

  const lineNo = document.createElement('span');
  lineNo.className = 'cp-line__no';
  lineNo.textContent = String(idx + 1);

  const code = document.createElement('code');
  code.className = 'cp-line__code';
  code.style.whiteSpace = 'pre';
  code.innerHTML = highlightedLineHTML;

  row.appendChild(lineNo);
  row.appendChild(code);
  _linesContainer.appendChild(row);
  _nextRevealIdx++;
}

/**
 * @deprecated Use reset(snippetName, lines) instead, which clears and rebuilds.
 *
 * @returns {void}
 */
export function clearPanel() {
  _assertInit('clearPanel');
  _linesContainer.innerHTML = '';
  _placeholderEls = [];
  _nextRevealIdx = 0;
}

// ─── Private helpers ─────────────────────────────────────────────────────────

/**
 * Build (or rebuild) the internal sub-structure inside _panel.
 * Called once during init so we own the header and lines container.
 *
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
function _buildStructure() {
  _panel.innerHTML = '';
  _panel.classList.add('cp-panel');

  // Header bar
  _header = document.createElement('div');
  _header.className = 'cp-header';

  const headerLabel = document.createElement('span');
  headerLabel.className = 'cp-header__label';
  headerLabel.textContent = 'function';

  const headerName = document.createElement('span');
  headerName.className = 'cp-header__name';

  _header.appendChild(headerLabel);
  _header.appendChild(headerName);
  _panel.appendChild(_header);

  // Lines container
  _linesContainer = document.createElement('div');
  _linesContainer.className = 'cp-lines';
  _panel.appendChild(_linesContainer);

  _injectStyles();
}

/**
 * Create a single placeholder line element.
 * Rendered as a dimmed, redacted bar so the player can see how many
 * lines remain without reading the content.
 *
 * @param {number} lineIdx - Zero-based position (used for staggered width).
 * @returns {HTMLElement}
 */
function _makePlaceholder(lineIdx) {
  const row = document.createElement('div');
  row.className = 'cp-line cp-line--placeholder';
  row.dataset.lineIdx = String(lineIdx);

  const lineNo = document.createElement('span');
  lineNo.className = 'cp-line__no';
  lineNo.textContent = String(lineIdx + 1);

  const bar = document.createElement('span');
  bar.className = 'cp-line__bar';
  // Vary bar width slightly per line for a natural look (60–92%)
  const widthPct = 60 + ((lineIdx * 13) % 33);
  bar.style.width = `${widthPct}%`;

  row.appendChild(lineNo);
  row.appendChild(bar);
  return row;
}

/**
 * Create a revealed line element with syntax-highlighted content.
 *
 * @param {string} rawLine  - Exact source line (spaces/tabs preserved).
 * @param {string} language - Prism language key.
 * @param {number} lineIdx  - Zero-based position.
 * @returns {HTMLElement}
 */
function _makeRevealedLine(rawLine, language, lineIdx) {
  const row = document.createElement('div');
  row.className = 'cp-line cp-line--revealed';

  const lineNo = document.createElement('span');
  lineNo.className = 'cp-line__no';
  lineNo.textContent = String(lineIdx + 1);

  const code = document.createElement('code');
  code.className = `cp-line__code language-${language}`;
  // white-space: pre preserves indentation exactly
  code.style.whiteSpace = 'pre';

  // Prism highlighting — falls back to plain text if Prism unavailable
  if (typeof Prism !== 'undefined' && Prism.languages[language]) {
    code.innerHTML = Prism.highlight(rawLine, Prism.languages[language], language);
  } else {
    code.textContent = rawLine;
  }

  row.appendChild(lineNo);
  row.appendChild(code);
  return row;
}

/**
 * Injects the panel's scoped CSS into <head> once.
 * Idempotent — safe to call multiple times.
 *
 * @returns {void}
 */
function _injectStyles() {
  if (document.getElementById('cp-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'cp-styles';
  style.textContent = `
/* ── Code Panel ─────────────────────────────────────────── */
.cp-panel {
  --cp-bg:           #0d1117;
  --cp-border:       #21262d;
  --cp-header-bg:    #161b22;
  --cp-accent:       #58a6ff;
  --cp-accent2:      #7ee787;
  --cp-muted:        #484f58;
  --cp-text:         #e6edf3;
  --cp-lineno:       #3d444d;
  --cp-placeholder:  #1c2128;
  --cp-bar:          #2d333b;
  --cp-bar-shimmer:  #373e47;
  --cp-font-mono:    "JetBrains Mono", "Fira Code", "Cascadia Code",
                     "Source Code Pro", ui-monospace, monospace;
  --cp-font-ui:      "IBM Plex Sans", system-ui, sans-serif;
  --cp-radius:       6px;

  background: var(--cp-bg);
  border: 1px solid var(--cp-border);
  border-radius: var(--cp-radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: var(--cp-font-mono);
  font-size: 13px;
  line-height: 1.6;
}

/* ── Header ─────────────────────────────────────────────── */
.cp-header {
  background: var(--cp-header-bg);
  border-bottom: 1px solid var(--cp-border);
  padding: 8px 14px;
  display: flex;
  align-items: baseline;
  gap: 7px;
  user-select: none;
}

.cp-header__label {
  font-family: var(--cp-font-mono);
  font-size: 11px;
  color: var(--cp-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.cp-header__name {
  font-family: var(--cp-font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--cp-accent2);
  letter-spacing: 0.01em;
}

/* ── Lines container ─────────────────────────────────────── */
.cp-lines {
  padding: 10px 0;
  overflow-y: auto;
  flex: 1;
  scrollbar-width: thin;
  scrollbar-color: var(--cp-bar) transparent;
}

.cp-lines::-webkit-scrollbar { width: 4px; }
.cp-lines::-webkit-scrollbar-thumb { background: var(--cp-bar); border-radius: 4px; }

/* ── Common line layout ──────────────────────────────────── */
.cp-line {
  display: flex;
  align-items: center;
  padding: 0 14px;
  min-height: 22px;
}

.cp-line__no {
  font-family: var(--cp-font-mono);
  font-size: 11px;
  color: var(--cp-lineno);
  min-width: 28px;
  text-align: right;
  padding-right: 16px;
  user-select: none;
  flex-shrink: 0;
}

/* ── Placeholder (redacted bar) ──────────────────────────── */
.cp-line--placeholder {
  animation: cp-pulse 2.4s ease-in-out infinite;
}

.cp-line--placeholder:nth-child(3n+1) { animation-delay: 0s; }
.cp-line--placeholder:nth-child(3n+2) { animation-delay: 0.4s; }
.cp-line--placeholder:nth-child(3n)   { animation-delay: 0.8s; }

@keyframes cp-pulse {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 0.85; }
}

.cp-line__bar {
  display: inline-block;
  height: 10px;
  border-radius: 3px;
  background: linear-gradient(
    90deg,
    var(--cp-bar) 0%,
    var(--cp-bar-shimmer) 50%,
    var(--cp-bar) 100%
  );
  background-size: 200% 100%;
  animation: cp-shimmer 2.4s linear infinite;
  pointer-events: none;
}

@keyframes cp-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Revealed line ───────────────────────────────────────── */
.cp-line--revealed {
  animation: cp-reveal 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes cp-reveal {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.cp-line__code {
  font-family: var(--cp-font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--cp-text);
  white-space: pre;
  tab-size: 2;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
}

/* ── Prism token overrides (dark theme) ──────────────────── */
.cp-line__code .token.keyword         { color: #ff7b72; font-style: normal; }
.cp-line__code .token.string,
.cp-line__code .token.template-string { color: #a5d6ff; }
.cp-line__code .token.number          { color: #79c0ff; }
.cp-line__code .token.operator        { color: #ff7b72; }
.cp-line__code .token.function        { color: #d2a8ff; }
.cp-line__code .token.comment,
.cp-line__code .token.block-comment   { color: #8b949e; font-style: italic; }
.cp-line__code .token.boolean,
.cp-line__code .token.null,
.cp-line__code .token.undefined       { color: #79c0ff; }
.cp-line__code .token.property,
.cp-line__code .token.attr-name       { color: #7ee787; }
.cp-line__code .token.punctuation     { color: #c9d1d9; }
.cp-line__code .token.class-name      { color: #ffa657; }
.cp-line__code .token.parameter       { color: #e6edf3; }
`;
  document.head.appendChild(style);
}

/**
 * Throws a descriptive error if init() has not been called yet.
 *
 * @param {string} fnName - Name of the calling function, used in the error message.
 * @returns {void}
 */
function _assertInit(fnName) {
  if (!_panel || !_linesContainer) {
    throw new Error(`[codePanel] ${fnName}() called before init(). Call init(panelEl) first.`);
  }
}
