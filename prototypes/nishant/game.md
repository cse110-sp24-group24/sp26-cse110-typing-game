
#Prompt
As a CSE110 Student, I find it hard to study for the midterms due to a lot of informaiton provided. Create a typing game where I can study for midterms by answer questions through typing.  Use simple html, css  and JS. Create a book-tok inspired UI UX. Make a lot of tests to ensure the game works properly and there arent any global muted keys.  As u progress by answering correctly you can acquire hints, make different levels for each individual lecture or mixed bank of questions.

Use these links for lecture 1-2:
[01 - SWE Intro - Demystification, Definition, and Defiance](https://houses-pay-526.craft.me/BEtiGoivUaqXO5)
[02 - Individual Devs](https://houses-pay-526.craft.me/fWTsrhQJjFDYl7)

 # What Claude created

📚 Question Bank (40 total)

Lecture 1 (20 Qs) — SWE definitions, SDLC phases, Waterfall vs Agile, Agile Manifesto, technical debt, software entropy, stakeholders, quality attributes, scope creep, and more
Lecture 2 (20 Qs) — IDEs, linters, compilers vs interpreters, Git commands (commit/pull/fetch/merge/branch), .gitignore, pair programming, rubber duck debugging, DRY principle, refactoring, CI, unit tests, code review
Mixed Bank — all 40 shuffled together

💡 Hint System

Earn hints through correct-answer streaks (streak ×2, ×3, then every ×5)
Press the hint button (or Ctrl+H) to reveal a contextual clue — costs 1 hint
Hint count tracked in the header in real time

⌨️ Smart Answer Evaluation

Keyword matching (≥35% of key terms) + word-overlap scoring — so partial-but-correct answers pass
Case-insensitive, punctuation-stripped — just type naturally

🎮 Levels & Flow

Each level randomizes question order on every start
Progress bar, streak badge popups, toast notifications for hint earnings
Results screen with animated score ring, accuracy %, best streak, hints used

🧪 Test Suite (28 tests)

Click the 🧪 Run Tests button in the bottom-right to run all tests — covers data integrity, evaluation logic, state management, hint system, keyboard safety, and UI rendering
Results display in an overlay panel and in the browser console

⌨️ No global muted keys — Enter submits, Shift+Enter adds a newline (normal textarea behavior), Escape skips, Ctrl+H hints. All other typing keys pass through completely untouched.