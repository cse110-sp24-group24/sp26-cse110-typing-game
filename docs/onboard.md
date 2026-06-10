# Onboarding & Build Guide

This document is the detailed companion to the [README](../README.md). If you are taking over Phantom Type, read this once end-to-end before touching code. It covers: how to get the repo running, how the build/CI pipeline works, the rules you must follow to get a PR merged, and a worked example of making your first change.

---

## 1. Prerequisites

| Tool                                    | Version               | Why                                                    |
| --------------------------------------- | --------------------- | ------------------------------------------------------ |
| Node.js                                 | 20.x (CI uses 20)     | Running ESLint, Prettier, Jest. Not needed at runtime. |
| npm                                     | bundled with Node     | Installing dev dependencies.                           |
| A browser                               | Chrome/Firefox/Safari | The game targets desktop browsers + a real keyboard.   |
| Git + a GitHub account with repo access | —                     | Branching and PRs.                                     |

There is **no runtime dependency** and **no build step**. Node is only for the dev toolchain (linting, formatting, tests). The shipped game is the raw HTML/CSS/JS files.

---

## 2. Get It Running Locally

```bash
git clone https://github.com/cse110-sp24-group24/sp26-cse110-typing-game.git
cd sp26-cse110-typing-game
npm install            # installs dev tooling + sets up the Husky pre-commit hook
```

Because the game uses **ES modules**, you cannot open `index.html` from the filesystem (`file://` blocks module loading). Serve it over HTTP:

```bash
npx http-server . -p 8080      # or: python3 -m http.server 8080
```

Open <http://localhost:8080>, click **Play**, choose a language, and you should be in a wave. If the page is blank, open the browser dev console — a module path or CORS error almost always means you opened the file directly instead of via the server.

---

## 3. How the Code Is Wired

- **`index.html`** is the contract. Every screen (`#menu-screen`, `#language-screen`, `#wave-intro-screen`, `#game-screen`, `#wave-stats-screen`, `#upgrade-screen`, `#stats-screen`) and every element an engine/UI module reaches for by `id` lives here. If a module calls `document.getElementById('x')`, `x` exists in this file.
- **`src/main.js`** is the only orchestrator. It creates the `RunState`, shows/hides screens, and registers callbacks. Engine modules never import UI; instead they fire callbacks that `main.js` routes to the right UI module. When you want to understand "what happens when the player finishes a line," start in `main.js` and follow the callback.
- **`src/state.js`** defines `createRunState(language)` — the single mutable object every system reads and writes during a run. Score, lives, wave, upgrades, and stats all live there. Preferences (language, audio) do **not** — those live in `localStorage` via `utils/storage.js`.
- **Layering (enforced by convention, see [ADR-003](architecture/decisions/ADR-003-module-organization.md)):**
  `ui/` → may import `engine/`, `data/`, `utils/`, `state.js`
  `engine/` → may import `data/`, `utils/`, `state.js`, `snippets/` — **never** `ui/` or `audio/`
  `audio/` → may import `utils/` only
  `main.js` → imports everything.

For the full module map, sprint build order, and the `RunState` shape, read [`docs/architecture/README.md`](architecture/README.md).

---

## 4. The Build / CI / CD Pipeline

There is no compile step, but there is an automated quality gate. The pipeline is the team's agreement enforced by machine:

```
local edit
   │  (git commit) ── Husky pre-commit hook runs lint-staged → Prettier auto-formats staged files
   ▼
git push  →  open a Pull Request against main
   │
   ▼
GitHub Actions: lint.yml  →  npm ci → eslint src/ → prettier --check .
   │           (a red check blocks the merge)
   ▼
review + green checks  →  merge to main
   │
   ▼
GitHub Actions: deploy.yml  →  uploads the repo root → GitHub Pages → live in seconds
```

- **CI** ([`.github/workflows/lint.yml`](../.github/workflows/lint.yml)) runs ESLint and a Prettier format check on every push and PR to `main`. It does **not** currently run the Jest suite — tests are run locally (and are a good candidate to add to CI; see §7).
- **CD** ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)) deploys the entire repo root to GitHub Pages on every push to `main`. Because the site is static, "build" and "deploy" are just "copy the files."
- **Pre-commit** ([`.husky/pre-commit`](../.husky/pre-commit)) runs `lint-staged`, which Prettier-formats your staged files so you never push unformatted code.

---

## 5. Local Commands You'll Use

| Command                | When                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `npm run lint`         | Before pushing — catch ESLint errors CI will reject.          |
| `npm run lint:fix`     | Let ESLint auto-fix what it can.                              |
| `npm run format`       | Auto-format everything with Prettier (do this before commit). |
| `npm run format:check` | Exactly what CI runs — verify formatting passes.              |
| `npm test`             | Run the Jest unit/integration suite (jsdom).                  |
| `npm run test:e2e`     | Run the Puppeteer end-to-end test (needs a served app).       |

**About the tests:** the unit/integration tests run headless under jsdom and are the reliable suite. The Puppeteer tests (`tests/e2e/gameFlow.e2e.test.js` and the browser path inside `tests/mainMenu.test.js`) launch a real Chromium against a local server — they will time out if that environment isn't available, which is expected, not a regression.

---

## 6. Make Your First Change (worked example)

A safe, end-to-end first task: **add a JavaScript snippet to the typed-content library.**

1. **Branch.** Never commit to `main` directly.
   ```bash
   git checkout main && git pull
   git checkout -b yourname/add-snippet
   ```
2. **Edit the data.** Open [`src/snippets/javascript.js`](../src/snippets/javascript.js) and add a new snippet object following the shape of the existing entries (id, function name, the lines array, tags/description). Keep lines short enough to be typeable under the fall timer.
3. **Verify it's exposed.** The public API in [`src/snippets/index.js`](../src/snippets/index.js) (`getRandomSnippet`, `getSnippetById`, `getSnippetsForLanguage`) reads the pool automatically — no change needed there.
4. **Run the gates locally.**
   ```bash
   npm run format
   npm run lint
   npm test            # the snippet tests in tests/ validate library shape
   ```
5. **See it in the game.** Serve locally (`npx http-server . -p 8080`), start a JavaScript run, and play until your snippet appears.
6. **Commit & PR.**
   ```bash
   git add -A && git commit -m "feat(snippets): add <function name> JS snippet"
   git push -u origin yourname/add-snippet
   ```
   Open a PR against `main`, wait for the green lint check, request a review, and merge. The Pages deploy runs automatically on merge.

Once that loop feels natural, graduate to a logic change (e.g. a new upgrade in [`src/data/upgrades.js`](../src/data/upgrades.js) + its definition picked up by `engine/upgradeSystem.js`) and add a test for it.

---

## 7. Known Rough Edges (worth fixing early)

- **Prism.js is selected but not vendored.** [ADR-007](architecture/decisions/ADR-007-syntax-highlighting.md) chose Prism, but there is no `lib/prism.min.js` and no `<script>` tag in `index.html`, so `codePanel.js` runs its plain-text fallback. Vendoring Prism + adding the script tag would light up real syntax highlighting.
- **CI doesn't run Jest.** `lint.yml` runs ESLint + Prettier only. Adding a `npm test` step (unit suite) to CI would catch logic regressions automatically.
- **`assets/` vs `media/` split.** Both folders hold real, loaded assets (`audioManager` reads `assets/audio/`, but menu music and the stats video live under `media/`). Consolidating to one media root would remove confusion.
- **e2e tests are environment-sensitive.** They need a live server and a headless Chromium; they aren't part of the default green path.

---

## 8. Where to Go Next

- Product scope and roadmap: [`MVP.md`](../MVP.md)
- Why each technical decision was made: [`docs/architecture/decisions/`](architecture/decisions/) (ten ADRs)
- Coding standard (what CI enforces and why): [`docs/code-style.md`](code-style.md)
- The feature backlog and history: the **Issues** and **Pull Requests** tabs on GitHub.
