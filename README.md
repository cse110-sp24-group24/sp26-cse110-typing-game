# Phantom Type

> A browser-based, haunted roguelite typing game where players defeat ghost enemies by typing real code line by line. Built by a 10-person team for CSE 110 (SP26) at UC San Diego.

**Live demo:** <https://cse110-sp24-group24.github.io/sp26-cse110-typing-game/>

**Status Video 1:** <https://youtu.be/3QU3BJbv-cA>

---

## What This Is

Players choose a language (**JavaScript, HTML, or CSS**), then face successive waves of ghost enemies. Each enemy carries one line from a code function — typing the line correctly defeats the enemy. Over the course of a wave, the lines assemble into a complete function in a side panel. At the end of each wave, a **boss encounter** asks the player to type that full function in one go.

Between waves, a **randomized roguelite upgrade selection** (slower fall speed, extra lives, score multipliers, etc.) shapes the run. The aesthetic is haunted-horror throughout: ghost SVGs, ambient music, screen-edge flashes on life loss, dissolve animations on enemy defeat.

The full MVP feature set and post-MVP roadmap is in [`MVP.md`](MVP.md).

---

## Repository Map

Everything below is tracked in `main`. The repo is organized so a brand-new contributor can find anything by reading directory names.

```
sp26-cse110-typing-game/
│
├── README.md                       ← You are here
├── MVP.md                          ← What we committed to building (and what we explicitly did not)
│
├── index.html                      ← HTML contract: every screen + overlay div lives here
├── styles.css                      ← All visual styling (variables, screens, animations)
│
├── src/                            ← All game source code (ES modules, no bundler)
│   ├── main.js                       Entry point — wires every module together
│   ├── state.js                      RunState factory (single mutable state object per run)
│   │
│   ├── snippets/                     Code snippet library (the typed content)
│   │   ├── index.js                  Public API: getSnippet(), getSnippetsForLanguage()
│   │   ├── javascript.js             JavaScript snippet pool (≥5 entries)
│   │   ├── html.js                   HTML snippet pool (≥5 entries)
│   │   └── css.js                    CSS snippet pool (≥5 entries)
│   │
│   ├── engine/                       Game logic (no UI imports)
│   │   ├── waveManager.js            Wave lifecycle: snippet selection, spawn loop, clear signal
│   │   ├── enemySystem.js            DOM enemies, CSS fall animation, deadline detection
│   │   ├── bossSystem.js             Boss intro + full-function typing
│   │   ├── typingEngine.js           Input comparison, typo highlighting, WPM/accuracy
│   │   └── upgradeSystem.js          Upgrade pool draw + effect application
│   │
│   ├── ui/                           UI surface (depends on engine, never the reverse)
│   │   ├── screenManager.js          Show/hide one of seven .screen divs
│   │   ├── hudManager.js             Score, lives, wave, active upgrades panel
│   │   ├── codePanel.js              Code assembly display with syntax highlighting
│   │   ├── statsScreen.js            End-of-run summary
│   │   └── waveIntroCard.js          Pre-wave function preview + dismiss
│   │
│   ├── audio/
│   │   └── audioManager.js           Ambient music + SFX pool
│   │
│   ├── data/
│   │   └── upgrades.js               Upgrade definitions (id, name, icon, description, effect)
│   │
│   └── utils/
│       ├── statTracker.js            Per-keystroke + per-wave stat accumulation
│       └── storage.js                localStorage wrapper for user preferences
│
├── tests/                          ← Unit + integration tests (Jest)
│   ├── typingEngine.test.js
│   ├── enemySystem.test.js
│   ├── waveManager.test.js
│   ├── MainMenuTests.test.js
│   └── snippets-test-css-html.js
│
├── media/                          ← Game assets (committed)
│   ├── audio/                        spookymusic.mp3, evil laughs, scream SFX
│   └── visuals/                      Ghost sprites, countdown clips, jump-scare videos
│
├── lib/                            ← Vendored third-party JS (e.g., Prism.js)
├── assets/                         ← Empty placeholders (audio/, images/) — see media/ for real assets
│
├── docs/                           ← All design + architecture documentation
│   ├── code-style.md                 Team coding standard (camelCase, JSDoc, brackets, returns…)
│   └── architecture/
│       ├── README.md                 Architecture overview: module map, dependency rules, sprint build order
│       └── decisions/                Ten ADRs in MADR format (one per major technical decision)
│           ├── ADR-001-tech-stack.md
│           ├── ADR-002-game-architecture.md
│           ├── ADR-003-module-organization.md
│           ├── ADR-004-snippet-library.md
│           ├── ADR-005-enemy-rendering.md
│           ├── ADR-006-typing-input.md
│           ├── ADR-007-syntax-highlighting.md
│           ├── ADR-008-audio.md
│           ├── ADR-009-persistence.md
│           └── ADR-010-run-state.md
│
├── research/                       ← Pre-code design artifacts
│   ├── user-stories/                 100 user stories — 10 per contributor, in `<name>/` folders
│   │   ├── ethan/   henry/   itai/   janoj/   nishant/
│   │   ├── ryan/    sam/     shubhi/ simar/   soohwan/
│   └── misc/
│       └── other-ideas.md
│
├── prototypes/                     ← Pre-MVP exploration (kept for reference, not shipped)
│   ├── individual-prototypes/        One folder per teammate's solo prototype
│   └── mvp-prototype/                The combined prototype we built before settling on this architecture
│
├── admin/
│   └── videos/                       Links to status update videos
│
├── .github/
│   ├── ISSUE_TEMPLATE/               Feature task + bug report templates
│   └── workflows/
│       ├── lint.yml                  CI: runs ESLint + Prettier on every PR
│       └── deploy.yml                CD: auto-deploys to GitHub Pages on push to main
│
├── .husky/                         ← Pre-commit hooks (run linter locally before commit)
├── eslint.config.js                ← ESLint flat config (camelCase, no-var, JSDoc rules, etc.)
├── .prettierrc                     ← Prettier formatting config
└── package.json                    ← Dev dependencies only (no runtime deps — vanilla JS)
```

---

## Where to Find…

| If you want to…                                 | Look at                                                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Understand what we're building                  | [`MVP.md`](MVP.md)                                                                            |
| See the live game                               | <https://cse110-sp24-group24.github.io/sp26-cse110-typing-game/>                              |
| Read every team member's feature ideas          | [`research/user-stories/`](research/user-stories/)                                            |
| Understand how the code is organized            | [`docs/architecture/README.md`](docs/architecture/README.md)                                  |
| Learn why we made a specific technical decision | [`docs/architecture/decisions/`](docs/architecture/decisions/) (ten ADRs)                     |
| Check the team's coding standard                | [`docs/code-style.md`](docs/code-style.md)                                                    |
| See current work in progress                    | [Issues](https://github.com/cse110-sp24-group24/sp26-cse110-typing-game/issues) tab on GitHub |
| Open a new issue                                | Use the [feature task or bug report templates](.github/ISSUE_TEMPLATE/)                       |
| See test coverage                               | [`tests/`](tests/)                                                                            |
| See pre-MVP exploration                         | [`prototypes/`](prototypes/)                                                                  |

---

## Getting Started

### Prerequisites

- Node.js 20+ (only required for the dev tooling — the game itself is vanilla JS)

### First-time setup

```bash
git clone https://github.com/cse110-sp24-group24/sp26-cse110-typing-game.git
cd sp26-cse110-typing-game
npm install
```

### Running the game locally

Because the game uses ES modules, you need to serve it over HTTP rather than opening `index.html` directly. The simplest option:

```bash
npx http-server . -p 8080
```

Then open <http://localhost:8080> in your browser.

### Useful scripts

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run lint`         | Check JS for ESLint errors              |
| `npm run lint:fix`     | Auto-fix what ESLint can                |
| `npm run format`       | Auto-format all files with Prettier     |
| `npm run format:check` | Check formatting without changing files |
| `npm test`             | Run the Jest test suite                 |

---

## Development Workflow

1. **Pick an issue** from the [Issues](https://github.com/cse110-sp24-group24/sp26-cse110-typing-game/issues) tab. Each issue is fully briefed — it lists the linked user stories, ADRs, acceptance criteria, dependencies, and definition of done.
2. **Create a branch** from `main` (e.g., `feature/wave-manager`).
3. **Write code and tests.** Follow [`docs/code-style.md`](docs/code-style.md).
4. **Before committing:** run `npm run format` and `npm run lint`. A pre-commit hook (`.husky/pre-commit`) will run the linter automatically.
5. **Open a pull request** against `main`. The **Lint** GitHub Actions workflow runs automatically — a failing check blocks the merge.
6. **Get one human review** (required for any change >300 LoC per class policy).
7. **Merge.** The **Deploy** workflow auto-publishes to GitHub Pages within ~30 seconds.

---

## Tech Stack

**Production runtime — zero dependencies, no bundler:**

- Vanilla HTML5, CSS3, and JavaScript (ES2022 modules)
- Prism.js for syntax highlighting (vendored locally in `lib/`)

**Development tooling (dev dependencies only):**

- **ESLint 9** (flat config) — code quality and naming rules
- **Prettier 3** — formatting
- **eslint-plugin-jsdoc** — JSDoc enforcement
- **Husky** — pre-commit hooks
- **Jest** — unit and integration tests
- **GitHub Actions** — CI (lint) and CD (Pages deploy)

The full rationale for each choice is in [ADR-001 (Tech Stack)](docs/architecture/decisions/ADR-001-tech-stack.md).

---

## Architecture at a Glance

The game is a single-page web application with **no backend**. All modules read and write a single shared `RunState` object (created fresh per run) and communicate through direct function calls. There is no event bus, no Redux store, and no global variables outside `RunState`.

```
ui/  ──depends on──►  engine/  ──depends on──►  data/  utils/  snippets/
```

Modules in `ui/` never import from `audio/`, and `audio/` never imports from `engine/`. `main.js` is the only file that wires layers together. The full dependency table and rationale lives in [ADR-003 (Module Organization)](docs/architecture/decisions/ADR-003-module-organization.md).

For the complete module map, sprint build order, and the `RunState` shape, read [`docs/architecture/README.md`](docs/architecture/README.md).

---

## Team

Ten contributors built this project together:

| Ethan · Henry · Itai · Janoj · Nishant · Ryan · Sam · Shubhi · Simar · Soohwan |
| ------------------------------------------------------------------------------ |

Each teammate authored 10 user stories (visible under [`research/user-stories/<name>/`](research/user-stories/)) and owns one or more modules per the [suggested ownership table in ADR-003](docs/architecture/decisions/ADR-003-module-organization.md#ownership-assignments-suggested).

---

## License

Coursework for CSE 110 at UC San Diego, Spring 2026. Not licensed for commercial use.
