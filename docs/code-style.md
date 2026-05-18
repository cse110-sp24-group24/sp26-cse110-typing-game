# Code Style Guide

This document is the single source of truth for how we write code on this project. ESLint and Prettier enforce most of these rules automatically — the CI pipeline will block PRs that violate them. This guide explains the *why* behind each rule so teammates can write compliant code from the start, not just fix errors after the fact.

---

## 1. Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Variables | `camelCase` | `fallSpeed`, `currentWave` |
| Functions | `camelCase` | `spawnEnemy()`, `updateScore()` |
| Constants (module-level, fixed value) | `SCREAMING_SNAKE_CASE` | `MAX_LIVES`, `BASE_FALL_SPEED` |
| Classes | `PascalCase` | `RunState`, `AudioPool` |
| Files | `camelCase` | `enemySystem.js`, `waveManager.js` |
| CSS classes / IDs | `kebab-case` | `#play-area`, `.enemy-code` |

**Never use single-letter variable names** outside of short loop counters (`i`, `j`) or mathematical formulas. Names must be descriptive: `enemy` not `e`, `snippet` not `s`.

---

## 2. Variable Declarations

- **Always use `const` by default.** Only use `let` when the variable must be reassigned.
- **Never use `var`.** It has function scope, not block scope, which causes bugs. ESLint will error on this.

```js
// Good
const playArea = document.getElementById('play-area');
let livesRemaining = state.lives;

// Bad
var score = 0;
let name = 'Phantom'; // name never changes — use const
```

---

## 3. JSDoc Comments

Every **exported function** must have a JSDoc comment. Internal helper functions should have one if their purpose isn't immediately obvious from the name.

**Required tags:**
- `@param` for each parameter (with type and description)
- `@returns` if the function returns a value

```js
// Good
/**
 * Spawns a new enemy in the play area and begins its fall animation.
 * @param {object} state - The current RunState object.
 * @param {object} snippet - The snippet object to display on the enemy.
 * @returns {HTMLElement} The newly created enemy DOM element.
 */
export function spawnEnemy(state, snippet) { ... }

// Bad — no JSDoc on an exported function
export function spawnEnemy(state, snippet) { ... }

// Bad — JSDoc present but incomplete
/**
 * Spawns an enemy.
 */
export function spawnEnemy(state, snippet) { ... }
```

**Inline comments** (`//`) should explain *why*, not *what*. If the code says what it does, the comment should explain the reason.

```js
// Good
// Clamp to at least 1s so the enemy is always visible long enough to read
const duration = Math.max(fallDuration, 1000);

// Bad — just restates the code
const duration = Math.max(fallDuration, 1000); // set duration to max of fallDuration and 1000
```

---

## 4. Bracket and Brace Formatting

**Always use curly braces** for `if`, `else`, `for`, `while` — even for single-line bodies. This prevents bugs when a second line is added.

```js
// Good
if (state.lives <= 0) {
  endRun(state);
}

// Bad
if (state.lives <= 0) endRun(state);
```

**Opening braces go on the same line** (K&R style), never on their own line.

```js
// Good
function spawnEnemy(state, snippet) {
  ...
}

// ❌ Bad
function spawnEnemy(state, snippet)
{
  ...
}
```

**Object literals** use spaces inside braces for readability:

```js
// Good
const prefs = { language: 'javascript', muted: false };

// Bad
const prefs = {language: 'javascript', muted: false};
```

---

## 5. Return Statements

**Be consistent within each function** — either always return a value, or never return a value. Don't mix early bare `return` with `return value` in the same function (ESLint `consistent-return` rule).

```js
// Good — always returns a value
function getSnippet(language) {
  const pool = LIBRARIES[language];
  if (!pool) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Bad — mixes return; and return value;
function getSnippet(language) {
  const pool = LIBRARIES[language];
  if (!pool) return;           // bare return
  return pool[Math.floor(Math.random() * pool.length)]; // return value
}
```

---

## 6. ES Modules

- **Always use ES module syntax** (`import` / `export`). Never use `require()` or CommonJS.
- **Named exports only** — avoid default exports. Named exports make it obvious what a module provides and enable tree-shaking post-MVP.
- **Import order:** external libraries first, then internal modules, alphabetically within each group.

```js
// Good
import { createRunState }     from './state.js';
import { showScreen }         from './ui/screenManager.js';
import { init as initTyping } from './engine/typingEngine.js';

// Bad
import typingEngine from './engine/typingEngine.js'; // default import
const { createRunState } = require('./state.js');    // CommonJS
```

---

## 7. Equality

**Always use `===` and `!==`** (strict equality). Never use `==` or `!=`.

```js
// Good
if (state.lives === 0) { ... }

// Bad
if (state.lives == 0) { ... }
```

---

## 8. Indentation and Formatting

These are enforced automatically by Prettier — you don't need to memorize them, just run `npm run format` before committing.

| Rule | Value |
|------|-------|
| Indentation | 2 spaces (no tabs) |
| Semicolons | Required |
| Quotes | Single quotes (`'`) |
| Trailing commas | ES5 style (objects, arrays — not function parameters) |
| Max line length | 100 characters |
| Arrow function parens | Always (`(x) => x`, not `x => x`) |

---

## 9. File and Module Structure

Each file should follow this order:
1. JSDoc file-level comment (module purpose, issue number)
2. `import` statements
3. Module-level constants (`const MAX_LIVES = 3;`)
4. Exported functions (public API)
5. Internal helper functions (private, not exported)

---

## 10. What the CI Will Catch

Every PR runs ESLint and Prettier automatically. The PR cannot be merged if either check fails. You can run them locally before pushing:

```bash
npm run lint          # check JS for errors
npm run lint:fix      # auto-fix what ESLint can
npm run format:check  # check formatting
npm run format        # auto-fix formatting (run this before every commit)
```
