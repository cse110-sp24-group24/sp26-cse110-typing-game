# ADR-004: Snippet Library Format and Storage

## Status

Accepted

## Context

The snippet library is the educational core of the game. Every wave, every boss fight, and every educational touch (wave intro card, code panel, concept tags) depends on it. Decisions about its format affect:

- How content contributors add new functions without touching game logic
- How quickly the game loads snippets at runtime
- Whether the game can filter by language, complexity, or concept

The library must support at minimum:
- JavaScript, HTML, and CSS (MVP)
- At least 5 functions per language (MVP), expandable post-MVP
- Per-function: name, lines[], plain-English description, concept tags
- Per-function: complexity indicator for difficulty scaling

Three storage formats were evaluated:

1. **Static JSON files** fetched at runtime
2. **JS module files** imported via ES modules
3. **External API or CMS**

## Decision

Use **ES module files** — one per language (`snippets/javascript.js`, `snippets/html.js`, `snippets/css.js`) — exporting an array of snippet objects. A thin `snippets/index.js` provides the public API (`getSnippetsForLanguage`, `getRandomSnippet`).

## Considered Options

### Option 1: Static JSON Files (Fetched at Runtime)

Snippets live in `.json` files. The game fetches the appropriate file after language selection using `fetch()`.

**Pros:**
- JSON is universally readable by non-JS contributors
- Files can be validated against a schema
- Trivially editable in any text editor

**Cons:**
- Requires a network request, adding latency before the first wave
- `fetch()` fails if the page is opened as `file://` locally (no server), breaking development workflow
- No IDE autocompletion on the snippet objects
- The game must handle loading states and error cases

### Option 2: ES Module Files (Static Import)

Snippets are JS arrays in `.js` files, imported via `import { SNIPPETS } from './snippets/javascript.js'`. They are bundled with the page at load time.

**Pros:**
- Zero network request for snippet data — available instantly
- Works offline and with `file://` during development
- IDE provides autocompletion and inline type hints for the snippet object shape
- Content contributors edit plain JS object literals — no harder than JSON, but with the option to use template literals for multi-line strings

**Cons:**
- Slightly less "data-like" than JSON; contributors must be careful not to add executable logic
- All languages load at startup, even if the player picks only one (acceptable: the data is small, ~10KB total)

### Option 3: External API or CMS

Snippets are stored in a database (Airtable, Supabase, a custom API) and fetched dynamically.

**Pros:**
- Non-technical contributors can edit snippets in a friendly UI
- Snippets can be updated without a code deploy

**Cons:**
- Requires a backend or third-party service account, adding operational complexity
- The game must work offline per the no-backend constraint (ADR-001)
- Authentication, rate limits, and service availability become game availability concerns
- Massively out of scope for an end-of-quarter class project

## Decision Outcome

**Option 2 (ES Module Files)** was chosen. It requires zero infrastructure, works with `file://` during development, and the data volume is small enough that loading all languages at startup is negligible.

### Snippet Object Schema

Each function in the library must conform to this shape:

```js
{
  id: "js-reverse-string",          // unique across all languages
  name: "reverseString",            // function name as it appears in code
  language: "javascript",           // 'javascript' | 'html' | 'css'
  description: "Takes a string and returns it with its characters in reverse order.",
  conceptTags: ["loops", "strings"], // 1–3 tags from a fixed vocabulary
  complexity: 1,                    // 1 (beginner) | 2 (intermediate)
  lines: [                          // ordered array; each element is one enemy
    "function reverseString(str) {",
    "  let reversed = '';",
    "  for (let i = str.length - 1; i >= 0; i--) {",
    "    reversed += str[i];",
    "  }",
    "  return reversed;",
    "}"
  ]
}
```

### Concept Tag Vocabulary (Fixed Set)

To keep tags useful, they must come from a controlled vocabulary. Adding new tags requires updating both the snippet and the tag-display UI.

**MVP tags:** `loops`, `conditionals`, `strings`, `arrays`, `functions`, `recursion`, `objects`

### Public API (`snippets/index.js`)

```js
export function getSnippetsForLanguage(language)   // returns all snippets for a language
export function getRandomSnippet(language, usedIds) // excludes already-used snippets in run
export function getSnippetById(id)                  // direct lookup
```

### Positive Consequences
- Content contributors work entirely within `snippets/javascript.js`, `snippets/html.js`, or `snippets/css.js`; no game logic is exposed to them
- The `snippets/index.js` public API means the rest of the game is insulated from the data format
- Each language ships with at least 5 functions at MVP; adding more requires touching only that language's file
- Adding a new language post-MVP requires creating one new file and a one-line addition to `index.js`

### Negative Consequences
- Snippets are locked at deploy time; fixing a typo in a function requires a code push
- The fixed concept tag vocabulary must be agreed on before Sprint 1 snippet authoring begins
