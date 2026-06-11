# Phantom Type

> A browser-based, haunted roguelite typing game where players defeat ghost enemies by typing real code line by line. Built by a 10-person team for CSE 110 (SP26) at UC San Diego.

**Live demo:** <https://cse110-sp24-group24.github.io/sp26-cse110-typing-game/>

**Status Video 1:** <https://youtu.be/3QU3BJbv-cA>

**Final Private Video:** <https://youtu.be/I35CwKpcQfA>

**Final Public Video:** <https://youtu.be/AqrdHvX9eng>

<!--
  DEMO GIF — record a ~5-second clip of a wave → boss → upgrade loop, export as
  docs/demo.gif, and uncomment the line below so it renders at the top of the README.
  ![Phantom Type gameplay](docs/demo.gif)
-->

---

## What This Is

Players choose a language (**JavaScript, HTML, or CSS**), then face successive waves of ghost enemies. Each enemy carries one line from a code function — typing the line correctly defeats the enemy. Over the course of a wave, the lines assemble into a complete function in a side panel. At the end of each wave, a **boss encounter** asks the player to type that full function in one go against a countdown timer.

Between waves, a **randomized roguelite upgrade selection** (slower fall speed, extra lives, score multipliers, etc.) shapes the run. The aesthetic is haunted-horror throughout: ghost sprites, ambient music, screen-edge flashes on life loss, and dissolve animations on enemy defeat.

The full MVP feature set and post-MVP roadmap is in [`MVP.md`](MVP.md).

---

## Quick Start

The game is plain HTML/CSS/JS with **no build step**. Because it uses ES modules, you must serve it over HTTP — opening `index.html` from the filesystem will fail on module CORS.

```bash
# from the repo root — pick whichever you have
npx http-server . -p 8080      # Node
# or
python3 -m http.server 8080    # Python
```

Then open <http://localhost:8080> and click **Play**. No install, no login, no backend.

For a deeper walkthrough of building, onboarding, and making your first change, see [`docs/onboard.md`](docs/onboard.md).

---

## Repository Map

Everything below is tracked in `main`. The repo is organized so a brand-new contributor can find anything by reading directory names.

```
sp26-cse110-typing-game/
│
├── README.md                       ← You are here
├── MVP.md                          ← What we committed to building (and what we explicitly did not)
│
├── index.html                      ← HTML contract: all 7 screens + overlays live here
├── styles.css                      ← All visual styling (variables, screens, animations)
│
├── src/                            ← All game source code (ES modules, no bundler)
│   ├── main.js                       Entry point — wires every module together, owns screen transitions
│   ├── state.js                      createRunState() — the single mutable state object per run
│   │
│   ├── snippets/                     Code snippet library (the typed content)
│   │   ├── index.js                  Public API: getSnippetsForLanguage(), getRandomSnippet(), getSnippetById()
│   │   ├── javascript.js             JavaScript snippet pool
│   │   ├── html.js                   HTML snippet pool
│   │   └── css.js                    CSS snippet pool
│   │
│   ├── engine/                       Game logic (never imports from ui/ or audio/)
│   │   ├── waveManager.js            Wave lifecycle: snippet pick, one-at-a-time spawn, wave-clear signal
│   │   ├── enemySystem.js            DOM enemies, CSS fall animation, deadline detection, life-loss signal
│   │   ├── bossSystem.js             Boss encounter state + full-function typing target + countdown
│   │   ├── typingEngine.js           Input comparison, typo highlighting, WPM/accuracy
│   │   └── upgradeSystem.js          Upgrade pool draw + effect application to RunState
│   │
│   ├── ui/                           UI surface (depends on engine, never the reverse)
│   │   ├── screenManager.js          Show/hide one of seven .screen divs
│   │   ├── hudManager.js             Score (animated), lives, wave, language badge, active-upgrades panel
│   │   ├── codePanel.js              Code assembly display (Prism-ready, plain-text fallback today)
│   │   ├── statsScreen.js            End-of-run summary
│   │   ├── waveIntroCard.js          Pre-wave function preview + dismiss
│   │   ├── bossView.js               Boss sprite, progress bar, and countdown-timer rendering
│   │   └── upgradeScreen.js          Upgrade-selection cards + pick animation
│   │
│   ├── audio/
│   │   └── audioManager.js           Ambient music + pooled SFX, volume/mute, persisted via storage
│   │
│   ├── data/
│   │   └── upgrades.js               Upgrade definitions (id, name, icon, description, effect fn)
│   │
│   └── utils/
│       ├── statTracker.js            Per-keystroke + per-wave WPM/accuracy accumulation
│       └── storage.js                localStorage wrapper for language + audio prefs (NAMESPACE'd)
│
├── tests/                          ← Jest unit + integration tests (jsdom)
│   ├── typingEngine.test.js  enemySystem.test.js  waveManager.test.js  bossSystem.test.js
│   ├── bossView.test.js  Codepanel.test.js  hud/stat/storage/snippet tests, mainMenu.test.js …
│   └── e2e/
│       └── gameFlow.e2e.test.js     Puppeteer end-to-end run (needs a live server — see below)
│
├── assets/                         ← Production game assets loaded by audioManager (assets/audio/*.mp3)
│   ├── audio/                        ambient-wave, ambient-boss, defeat, life-loss, error, boss-sting
│   └── images/                       cemetery.png
│
├── media/                          ← Additional committed media (menu music, ghost sprites, video stings)
│   ├── audio/                        spookymusic.mp3, evil laughs, SCREAM.mp3
│   └── visuals/                      Bats.mp4, countdown clips, jump-scare video, ghost images
│
├── lib/                            ← Reserved for vendored third-party JS (Prism not yet vendored — see note)
│
├── docs/                           ← All design + architecture documentation
│   ├── onboard.md                    Detailed build/onboarding guide + "make your first change" walkthrough
│   ├── code-style.md                 Team coding standard (camelCase, JSDoc, braces, ===, ES modules…)
│   └── architecture/
│       ├── README.md                 Architecture overview: module map, dependency rules, sprint build order, RunState
│       └── decisions/                Ten ADRs in MADR format (one per major technical decision)
│           └── ADR-001 … ADR-010
│
├── research/                       ← Pre-code design artifacts
│   ├── user-stories/                 100 user stories — 10 per contributor, in <name>/ folders
│   │   ├── ethan/   henry/   itai/   janoj/   nishant/
│   │   └── ryan/    sam/     shubhi/ simar/   soohwan/
│   └── misc/other-ideas.md
│
├── prototypes/                     ← Pre-MVP exploration (kept for reference, not shipped)
│   └── mvp-prototype/                Combined prototype + nishant-mvp/ solo prototype
│
├── admin/                          ← Team-process artifacts (status video links, peer feedback)
│
├── .github/
│   ├── ISSUE_TEMPLATE/               Feature-task + bug-report templates
│   └── workflows/
│       ├── lint.yml                  CI: ESLint + Prettier on every push/PR to main
│       └── deploy.yml                CD: auto-deploy to GitHub Pages on push to main
│
├── .husky/pre-commit               ← Runs lint-staged (Prettier) locally before every commit
├── eslint.config.js                ← ESLint flat config
├── .prettierrc                     ← Prettier config
└── package.json                    ← Dev dependencies only (no runtime deps — vanilla JS)
```

---

## Where to Find…

| If you want to…                                 | Look at                                                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Understand what we're building                  | [`MVP.md`](MVP.md)                                                                            |
| See the live game                               | <https://cse110-sp24-group24.github.io/sp26-cse110-typing-game/>                              |
| Build / onboard / make a first change           | [`docs/onboard.md`](docs/onboard.md)                                                          |
| Read every team member's feature ideas          | [`research/user-stories/`](research/user-stories/)                                            |
| Understand how the code is organized            | [`docs/architecture/README.md`](docs/architecture/README.md)                                  |
| Learn why we made a specific technical decision | [`docs/architecture/decisions/`](docs/architecture/decisions/) (ten ADRs)                     |
| Check the team's coding standard                | [`docs/code-style.md`](docs/code-style.md)                                                    |
| See current/past work as tickets                | [Issues](https://github.com/cse110-sp24-group24/sp26-cse110-typing-game/issues) tab on GitHub |
| Open a new issue                                | Use the [feature task or bug report templates](.github/ISSUE_TEMPLATE/)                       |
| See test coverage                               | [`tests/`](tests/)                                                                            |
| See pre-MVP exploration                         | [`prototypes/`](prototypes/)                                                                  |

---

## Useful Scripts

| Command                | What it does                                                            |
| ---------------------- | ----------------------------------------------------------------------- |
| `npm run lint`         | Check `src/` for ESLint errors                                          |
| `npm run lint:fix`     | Auto-fix what ESLint can                                                |
| `npm run format`       | Auto-format all files with Prettier                                     |
| `npm run format:check` | Check formatting without changing files (this is what CI runs)          |
| `npm test`             | Run the Jest unit/integration suite (jsdom)                             |
| `npm run test:e2e`     | Run the Puppeteer end-to-end test — **requires the app served locally** |

> **Note on tests:** the unit/integration suite runs headless under jsdom and is the suite CI relies on. The Puppeteer-based tests (`tests/e2e/` and the browser path in `tests/mainMenu.test.js`) launch a real Chromium and a local static server, so they only pass when a server is reachable; expect those to time out in a bare `npm test` on a machine without that setup.

---

## Tech Stack

**Production runtime — zero dependencies, no bundler:**

- Vanilla HTML5, CSS3, and JavaScript (ES2022 modules)
- Prism.js was selected for syntax highlighting ([ADR-007](docs/architecture/decisions/ADR-007-syntax-highlighting.md)); it is **not yet vendored into `lib/`**, so `codePanel.js` currently renders the assembled function as plain text via its built-in fallback. Wiring Prism in is a clean next task.

**Development tooling (dev dependencies only):**

- **ESLint 9** (flat config) — code quality and naming rules
- **Prettier 3** — formatting
- **eslint-plugin-jsdoc** — JSDoc enforcement
- **Husky** + **lint-staged** — pre-commit formatting
- **Jest 30** + **jest-environment-jsdom** — unit and integration tests
- **Puppeteer** — end-to-end browser test
- **GitHub Actions** — CI (lint) and CD (Pages deploy)

The full rationale for each choice is in [ADR-001 (Tech Stack)](docs/architecture/decisions/ADR-001-tech-stack.md).

---

## Architecture at a Glance

The game is a single-page web application with **no backend**. All modules read and write a single shared `RunState` object (created fresh per run by `state.js`) and communicate through direct function calls and callbacks. There is no event bus, no Redux store, and no global variables outside `RunState`.

```
ui/  ──depends on──►  engine/  ──depends on──►  data/  utils/  snippets/
```

Modules in `ui/` never import from `audio/`, and `engine/` never imports `ui/` — engine modules fire callbacks that `main.js` wires to UI. `main.js` is the only file that wires layers together. The full dependency table and rationale lives in [ADR-003 (Module Organization)](docs/architecture/decisions/ADR-003-module-organization.md), and the complete module map, sprint build order, and `RunState` shape are in [`docs/architecture/README.md`](docs/architecture/README.md).

---

## Team

Ten contributors built this project together:

| Ethan · Henry · Itai · Janoj · Nishant · Ryan · Sam · Shubhi · Simar · Soohwan |
| ------------------------------------------------------------------------------ |

Each teammate authored 10 user stories (under [`research/user-stories/<name>/`](research/user-stories/)) and owns one or more modules per the [suggested ownership table in ADR-003](docs/architecture/decisions/ADR-003-module-organization.md#ownership-assignments-suggested).

---

## License

Coursework for CSE 110 at UC San Diego, Spring 2026. Not licensed for commercial use.
