# ADR-007: Syntax Highlighting

## Status

Accepted

## Context

Multiple user stories call for syntax highlighting on the code the player sees — not on the input they type, but on the code assembly panel (Nishant US-02, Ryan US-02, Soohwan US-04). Several stories also mention that highlighting should match what students see in their real IDE, reinforcing pattern recognition.

Syntax highlighting must be applied to:
1. **The code assembly panel** — completed and upcoming function lines shown in a side panel
2. **The active enemy target line** — the line currently displayed above the input field
3. **The boss typing display** — the full function shown during the boss fight

Highlighting must NOT be applied to:
4. **The player's typed input** — the `<input>` element cannot contain HTML; highlighting there is handled by the typo-feedback overlay (ADR-006)

Requirements:
- Supports JavaScript and Python (MVP); must be extensible to additional languages post-MVP
- Must run entirely client-side (no server-side render)
- Must not noticeably lag on every keypress (only applied to static display elements, not the live input)
- Bundle size should be modest for a no-build-tool project

Three options were evaluated:

1. **Prism.js**
2. **Highlight.js**
3. **Custom tokenizer**

## Decision

Use **Prism.js** loaded via CDN, applied only to the static code display elements (assembly panel, target line display, boss view). It is never called in the hot path of the `input` event handler.

## Considered Options

### Option 1: Prism.js (Chosen)

Prism.js is a lightweight syntax highlighter (~7KB core, ~2KB per language grammar). It provides `Prism.highlight(code, grammar, language)` which returns an HTML string with `<span class="token ...">` elements.

**Pros:**
- Very lightweight: ~9KB total for JS + Python grammars (minified + gzipped)
- CDN-available; no build step needed
- `Prism.highlight()` is a synchronous pure function — easy to call when assembling the code panel
- Token class names (`token keyword`, `token string`, etc.) are stable and well-documented; CSS themes are easy to customize for the horror aesthetic
- Used by thousands of projects; unlikely to break or be abandoned

**Cons:**
- CDN dependency: if the CDN is unavailable (offline development), highlighting degrades to plain text. Mitigation: a local copy in `lib/prism.js` is used instead
- Prism uses `innerHTML` to inject highlighted spans; this is safe for code snippets from a trusted static library but requires that `snippets/` data is never sourced from user input

### Option 2: Highlight.js

Highlight.js auto-detects language or accepts an explicit language hint. It is a more "batteries-included" alternative to Prism.

**Pros:**
- Supports more languages out of the box
- Auto-detection can be convenient

**Cons:**
- Larger base bundle (~50KB+ for the language-detecting core)
- Auto-detection adds latency and can misclassify short snippets
- The API (`hljs.highlightElement(el)`) mutates the DOM element in place, which is less composable than Prism's `highlight()` string API
- For a game with only 2 languages and a known static snippet library, auto-detection is unnecessary overhead

### Option 3: Custom Tokenizer

Write a minimal tokenizer for JavaScript and Python that identifies keywords, strings, numbers, and operators.

**Pros:**
- Zero external dependency
- Full control over which tokens are highlighted and how

**Cons:**
- Writing a correct tokenizer for JavaScript and Python is a significant engineering task (regular expressions alone cannot handle string escapes, template literals, multi-line strings, or nested structures correctly)
- Maintenance burden: any language version change (e.g., new JS syntax) requires updating the tokenizer
- Prism.js already solves this problem correctly and is proven — a custom solution would be reinventing a solved wheel

## Decision Outcome

**Option 1 (Prism.js)** was chosen. It is stored locally in `lib/prism.min.js` and `lib/prism-python.min.js` to eliminate the CDN dependency during development.

### Integration Points

Prism is called in exactly three places:

1. **`ui/codePanel.js`** — when appending a completed line to the assembly panel:
   ```js
   import Prism from '../lib/prism.min.js';
   lineEl.innerHTML = Prism.highlight(line, grammar, language);
   ```

2. **`ui/codePanel.js`** — when rendering the static target line display at enemy spawn:
   ```js
   targetDisplay.innerHTML = Prism.highlight(line, grammar, language);
   ```

3. **`engine/bossSystem.js`** — when rendering the full function for the boss:
   ```js
   fullFunctionEl.innerHTML = Prism.highlight(functionText, grammar, language);
   ```

### What Prism Does NOT Touch

- The player's `<input>` element — Prism is never called in the `input` event handler
- The typo-feedback overlay — that uses its own red/green span logic (see ADR-006)

### Custom Theme

Prism's default token CSS is overridden in `styles.css` with a horror-themed palette:
- Keywords: pale blue (`rgba(130, 200, 255, 0.9)`)
- Strings: ghostly green (`rgba(100, 255, 180, 0.9)`)
- Comments: dim gray (dimmed, as comments are excluded from snippets per content guidelines)
- Punctuation: off-white

### Positive Consequences
- The code panel looks like a real terminal from the first day of Sprint 2
- Token colors can be tuned in one CSS block without touching JS
- Prism's grammar files for additional languages (C, Java) can be added post-MVP by dropping a new file in `lib/`

### Negative Consequences
- `innerHTML` assignment is used; all inputs to Prism must come from the trusted snippet library, not user input
- Local copies of Prism files must be kept up-to-date if security issues are discovered in the library
