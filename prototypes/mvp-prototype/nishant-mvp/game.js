/* ═══════════════════════════════════════════
   CODECRYPT — game.js
   Full game engine: chapters, typing, upgrades,
   site builder, boss fights, stats tracking
═══════════════════════════════════════════ */

'use strict';

/* ──────────────── CURRICULUM DATA ──────────────── */

const CHAPTERS = [
  {
    id: 0,
    title: 'Chapter I · HTML',
    icon: '🏚️',
    name: 'The Skeleton',
    lang: 'HTML',
    completeMsg: "You've laid the skeleton of the web. The bones are set — now they need a soul.",
    color: '#e05252',
    levels: [
      {
        id: 0,
        isBoss: false,
        enemy: 'Tag Wraith',
        enemyQuip: '<!-- you cannot open what you cannot close -->',
        context: '📖 HTML uses tags to structure content. Every opening <tag> must have a closing </tag>.',
        lines: [
          '<!DOCTYPE html>',
          '<html lang="en">',
          '  <head>',
          '    <meta charset="UTF-8" />',
          '    <title>My Portfolio</title>',
          '  </head>',
        ],
        hint: 'These are the opening boilerplate lines of any HTML document.'
      },
      {
        id: 1,
        isBoss: false,
        enemy: 'Div Demon',
        enemyQuip: '<div>everything is a div now</div>',
        context: '📖 The <body> holds all visible content. <header> and <nav> define the top section of your site.',
        lines: [
          '  <body>',
          '    <header>',
          '      <h1>Welcome to My Portfolio</h1>',
          '      <nav>',
          '        <a href="#about">About</a>',
          '        <a href="#projects">Projects</a>',
          '        <a href="#contact">Contact</a>',
          '      </nav>',
          '    </header>',
        ],
        hint: 'header + nav creates your site\'s navigation bar.'
      },
      {
        id: 2,
        isBoss: false,
        enemy: 'Semantic Specter',
        enemyQuip: '⚠ A <div> is not a <section>. Do not mistake the shape for the meaning.',
        context: '📖 <main> holds the primary content. <section> groups related content with a clear purpose.',
        lines: [
          '    <main>',
          '      <section id="about">',
          '        <h2>About Me</h2>',
          '        <p>I am a web developer learning to code.</p>',
          '      </section>',
          '      <section id="projects">',
          '        <h2>Projects</h2>',
          '        <p>Coming soon...</p>',
          '      </section>',
        ],
        hint: 'Use semantic tags like <section> to give meaning to your structure.'
      },
      {
        id: 3,
        isBoss: false,
        enemy: 'Form Phantom',
        enemyQuip: 'Without action, a form is just a ghost of itself.',
        context: '📖 <form> captures user input. <input> fields collect text; <button> submits the form.',
        lines: [
          '      <section id="contact">',
          '        <h2>Contact Me</h2>',
          '        <form>',
          '          <input type="text" placeholder="Your name" />',
          '          <input type="email" placeholder="Your email" />',
          '          <button type="submit">Send Message</button>',
          '        </form>',
          '      </section>',
        ],
        hint: 'Forms let visitors reach out to you directly.'
      },
      {
        id: 4,
        isBoss: true,
        enemy: '💀 BOSS: The Closing Horror',
        enemyQuip: 'You forgot to close me once. You will not do it again.',
        context: '🔥 BOSS ROUND — Type the complete HTML closing structure from memory!',
        lines: [
          '    </main>',
          '    <footer>',
          '      <p>© 2024 My Portfolio. All rights reserved.</p>',
          '    </footer>',
          '  </body>',
          '</html>',
        ],
        hint: 'Every opened tag must be closed. Prove you remember the structure.'
      },
    ]
  },
  {
    id: 1,
    title: 'Chapter II · CSS',
    icon: '🕯️',
    name: 'The Séance',
    lang: 'CSS',
    completeMsg: "Style radiates from the bones. The haunting is now beautiful.",
    color: '#7f5af0',
    levels: [
      {
        id: 0,
        isBoss: false,
        enemy: 'Cascade Crawler',
        enemyQuip: '* { everything: matters; }',
        context: '📖 CSS selectors target HTML elements. The * selector targets everything; element names target specific tags.',
        lines: [
          '* {',
          '  margin: 0;',
          '  padding: 0;',
          '  box-sizing: border-box;',
          '}',
          'body {',
          '  font-family: Arial, sans-serif;',
          '  background-color: #f5f5f5;',
          '  color: #333;',
          '}',
        ],
        hint: 'Reset styles first, then define your base body styles.'
      },
      {
        id: 1,
        isBoss: false,
        enemy: 'Flexbox Fiend',
        enemyQuip: 'align-items: center; justify-content: center — the eternal struggle.',
        context: '📖 Flexbox is a layout model. display: flex on a parent lets you align its children horizontally or vertically.',
        lines: [
          'header {',
          '  background-color: #1a1a2e;',
          '  color: white;',
          '  padding: 1rem 2rem;',
          '  display: flex;',
          '  justify-content: space-between;',
          '  align-items: center;',
          '}',
          'nav a {',
          '  color: white;',
          '  text-decoration: none;',
          '  margin-left: 1.5rem;',
          '}',
        ],
        hint: 'display: flex + justify-content: space-between spreads items across a row.'
      },
      {
        id: 2,
        isBoss: false,
        enemy: 'Specificity Spirit',
        enemyQuip: 'ID beats class beats element. Order is everything.',
        context: '📖 CSS classes (.) style groups of elements. IDs (#) style one specific element. Both use property: value pairs.',
        lines: [
          'main {',
          '  max-width: 900px;',
          '  margin: 0 auto;',
          '  padding: 2rem;',
          '}',
          'section {',
          '  background: white;',
          '  border-radius: 8px;',
          '  padding: 2rem;',
          '  margin-bottom: 2rem;',
          '  box-shadow: 0 2px 8px rgba(0,0,0,0.1);',
          '}',
          'h2 {',
          '  color: #1a1a2e;',
          '  margin-bottom: 1rem;',
          '}',
        ],
        hint: 'margin: 0 auto centers a block element horizontally when max-width is set.'
      },
      {
        id: 3,
        isBoss: false,
        enemy: 'Transition Trickster',
        enemyQuip: 'Without transition, change is instant. But ghosts fade in…',
        context: '📖 CSS transitions animate property changes over time. Use :hover pseudo-class to change styles on mouse-over.',
        lines: [
          'form {',
          '  display: flex;',
          '  flex-direction: column;',
          '  gap: 1rem;',
          '}',
          'input {',
          '  padding: 0.75rem;',
          '  border: 2px solid #ccc;',
          '  border-radius: 6px;',
          '  font-size: 1rem;',
          '  transition: border-color 0.3s;',
          '}',
          'input:focus {',
          '  border-color: #7f5af0;',
          '  outline: none;',
          '}',
        ],
        hint: 'transition makes property changes smooth instead of instant.'
      },
      {
        id: 4,
        isBoss: true,
        enemy: '💀 BOSS: The Button Banshee',
        enemyQuip: 'Style me. All of me. Button, hover, footer, all.',
        context: '🔥 BOSS — Type the final CSS rules: button styles, hover effects, and footer.',
        lines: [
          'button {',
          '  background-color: #7f5af0;',
          '  color: white;',
          '  padding: 0.75rem 2rem;',
          '  border: none;',
          '  border-radius: 6px;',
          '  cursor: pointer;',
          '  font-size: 1rem;',
          '  transition: background-color 0.3s;',
          '}',
          'button:hover {',
          '  background-color: #6944d6;',
          '}',
          'footer {',
          '  text-align: center;',
          '  padding: 1.5rem;',
          '  color: #888;',
          '  font-size: 0.85rem;',
          '}',
        ],
        hint: 'Nail the button styles and hover state — the final boss of CSS!'
      },
    ]
  },
  {
    id: 2,
    title: 'Chapter III · JavaScript',
    icon: '⚡',
    name: 'The Awakening',
    lang: 'JavaScript',
    completeMsg: "The site breathes. It thinks. It responds. You have conjured life from code.",
    color: '#e0c352',
    levels: [
      {
        id: 0,
        isBoss: false,
        enemy: 'Variable Vampire',
        enemyQuip: 'let me in. const you stop me? var is dead.',
        context: '📖 Variables store data. Use const for values that won\'t change, let for values that might.',
        lines: [
          'const navLinks = document.querySelectorAll("nav a");',
          'const sections = document.querySelectorAll("section");',
          'const contactForm = document.querySelector("form");',
          'const nameInput = document.querySelector("input[type=text]");',
          'const emailInput = document.querySelector("input[type=email]");',
        ],
        hint: 'querySelectorAll returns all matching elements; querySelector returns the first.'
      },
      {
        id: 1,
        isBoss: false,
        enemy: 'Event Ectoplasm',
        enemyQuip: 'addEventListener waits in the dark… for you.',
        context: '📖 addEventListener attaches functions to events (like "click"). Arrow functions (=>) are a concise way to write them.',
        lines: [
          'navLinks.forEach(link => {',
          '  link.addEventListener("click", function(e) {',
          '    e.preventDefault();',
          '    const target = document.querySelector(link.getAttribute("href"));',
          '    if (target) {',
          '      target.scrollIntoView({ behavior: "smooth" });',
          '    }',
          '  });',
          '});',
        ],
        hint: 'e.preventDefault() stops the browser\'s default link behaviour so you can control what happens.'
      },
      {
        id: 2,
        isBoss: false,
        enemy: 'Scroll Specter',
        enemyQuip: 'IntersectionObserver watches you. Always watching.',
        context: '📖 IntersectionObserver fires a callback when elements enter/leave the viewport. Perfect for scroll animations.',
        lines: [
          'const observer = new IntersectionObserver((entries) => {',
          '  entries.forEach(entry => {',
          '    if (entry.isIntersecting) {',
          '      entry.target.style.opacity = "1";',
          '      entry.target.style.transform = "translateY(0)";',
          '    }',
          '  });',
          '}, { threshold: 0.1 });',
          'sections.forEach(section => {',
          '  section.style.opacity = "0";',
          '  section.style.transform = "translateY(30px)";',
          '  section.style.transition = "opacity 0.6s, transform 0.6s";',
          '  observer.observe(section);',
          '});',
        ],
        hint: 'threshold: 0.1 means the callback fires when 10% of the element is visible.'
      },
      {
        id: 3,
        isBoss: false,
        enemy: 'Validation Wraith',
        enemyQuip: 'Empty fields… are empty souls. Validate everything.',
        context: '📖 Form validation checks user input before submission. The .trim() method removes whitespace.',
        lines: [
          'function validateForm() {',
          '  const name = nameInput.value.trim();',
          '  const email = emailInput.value.trim();',
          '  if (!name || !email) {',
          '    alert("Please fill in all fields.");',
          '    return false;',
          '  }',
          '  if (!email.includes("@")) {',
          '    alert("Please enter a valid email address.");',
          '    return false;',
          '  }',
          '  return true;',
          '}',
        ],
        hint: '.trim() prevents users from submitting just spaces.'
      },
      {
        id: 4,
        isBoss: true,
        enemy: '💀 BOSS: The Final Script',
        enemyQuip: 'Submit to me. Or submit the form. Your choice.',
        context: '🔥 BOSS — Wire the form submit event. This is the final piece of your living website!',
        lines: [
          'contactForm.addEventListener("submit", function(e) {',
          '  e.preventDefault();',
          '  if (validateForm()) {',
          '    const name = nameInput.value.trim();',
          '    contactForm.innerHTML = `',
          '      <p>Thanks, ${name}! Message received. 👻</p>',
          '    `;',
          '  }',
          '});',
          'console.log("Portfolio site is alive! 🌐");',
        ],
        hint: 'Template literals (backtick strings) let you embed variables with ${variable}.'
      },
    ]
  }
];

const UPGRADES = [
  { id: 'slow',      icon: '🐢', name: 'Time Crawl',      desc: 'Errors no longer drain health for 3 mistakes.' },
  { id: 'ghost',     icon: '👻', name: 'Ghost Mode',       desc: 'Skip one line per level without penalty.' },
  { id: 'shield',    icon: '🛡️', name: 'Spectral Shield',  desc: 'First mistake per line is forgiven.' },
  { id: 'hint',      icon: '🔮', name: 'Crystal Lens',     desc: 'Target line is highlighted in the snippet.' },
  { id: 'heal',      icon: '💊', name: 'Soul Shard',       desc: 'Restore 25% health right now.' },
  { id: 'accurate',  icon: '🎯', name: 'Phantom Aim',      desc: 'Accuracy bonus: each correct line = 2× score.' },
  { id: 'speed',     icon: '⚡', name: 'Lightning Wraith', desc: 'WPM bonus: extra 10 WPM added to final score.' },
  { id: 'shorter',   icon: '✂️', name: 'Trim the Darkness', desc: 'Long lines are split; you type one half at a time.' },
];

/* ──────────────── STATE ──────────────── */

const state = {
  chapter: 0,
  level: 0,
  lineIndex: 0,
  health: 100,
  maxHealth: 100,
  streak: 0,
  totalChars: 0,
  correctChars: 0,
  totalWpm: 0,
  wpmSamples: 0,
  lineStartTime: null,
  sessionStartTime: null,
  upgrades: [],            // active upgrade ids
  skipsLeft: 0,
  ghostSkipsUsed: 0,
  shieldUsed: false,       // per line
  score: 0,
  chapterStats: [],        // per chapter summary
  isBoss: false,
  siteCode: { html: '', css: '', js: '' },  // accumulated built site code
  errorBuffer: 0,          // mistakes since last damage (for 'slow' upgrade)
};

/* ──────────────── DOM REFS ──────────────── */

const $ = id => document.getElementById(id);

const screens = {
  title:      $('screen-title'),
  game:       $('screen-game'),
  chapterEnd: $('screen-chapter-end'),
  final:      $('screen-final'),
};

const el = {
  hudChapter:    $('hud-chapter'),
  hudLevel:      $('hud-level'),
  healthFill:    $('health-fill'),
  statWpm:       $('stat-wpm'),
  statAcc:       $('stat-acc'),
  statStreak:    $('stat-streak'),
  levelPath:     $('level-path'),
  ghostBody:     $('ghost-body'),
  ghostSpeech:   $('ghost-speech'),
  enemyHpFill:   $('enemy-hp-fill'),
  enemyName:     $('enemy-name'),
  snippetDisplay:$('snippet-display'),
  typingInput:   $('typing-input'),
  inputWrap:     document.querySelector('.input-wrap'),
  inputFeedback: $('input-feedback'),
  lessonContext: $('lesson-context'),
  progressLines: $('progress-lines'),
  progressHint:  $('progress-hint'),
  upgradePanel:  $('upgrade-panel'),
  upgradeCards:  $('upgrade-cards'),
  btnSkipUpgrade:$('btn-skip-upgrade'),
  bossIntro:     $('boss-intro'),
  bossIntroText: $('boss-intro-text'),
  btnBossStart:  $('btn-boss-start'),
  // chapter end
  chEndIcon:     $('ch-end-icon'),
  chEndTitle:    $('ch-end-title'),
  chEndMsg:      $('ch-end-msg'),
  sitePreview:   $('site-preview'),
  endStats:      $('end-stats'),
  btnNextChapter:$('btn-next-chapter'),
  btnTitleEnd:   $('btn-title-from-end'),
  // final
  sitePreviewFinal: $('site-preview-final'),
  finalStats:    $('final-stats'),
  btnPlayAgain:  $('btn-play-again'),
  // title
  btnStart:      $('btn-start'),
  btnPreview:    $('btn-preview'),
  chapterCards:  document.querySelectorAll('.chapter-card'),
  lock1:         $('lock-1'),
  lock2:         $('lock-2'),
  // modal
  modalPreview:  $('modal-preview'),
  modalClose:    $('modal-close'),
  modalIframe:   $('modal-iframe'),
  // misc
  dmgFlash:      $('dmg-flash'),
  ghostParticles:$('ghost-particles'),
};

/* ──────────────── INIT GHOST PARTICLES ──────────────── */
function spawnGhostParticles() {
  const emojis = ['👻','💀','🕯️','🦇','🕸️','⚡','🔮'];
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'ghost-particle';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top  = Math.random() * 100 + 'vh';
    p.style.animationDuration = (6 + Math.random() * 10) + 's';
    p.style.animationDelay    = (Math.random() * 8) + 's';
    p.style.fontSize = (.8 + Math.random() * 1.4) + 'rem';
    el.ghostParticles.appendChild(p);
  }
}

/* ──────────────── SCREEN SWITCHING ──────────────── */
function showScreen(name) {
  Object.values(screens).forEach(s => { s.style.display = 'none'; s.classList.remove('active'); });
  screens[name].style.display = 'flex';
  screens[name].classList.add('active');
}

/* ──────────────── TITLE SCREEN LOGIC ──────────────── */
function updateTitleLocks() {
  // Initially all locked except chapter 0
  el.lock1.textContent = '🔒';
  el.lock2.textContent = '🔒';
  el.lock1.classList.add('locked');
  el.lock2.classList.add('locked');
}

el.btnStart.addEventListener('click', () => startRun());
el.btnPreview.addEventListener('click', () => openPreviewModal());
el.modalClose.addEventListener('click', () => el.modalPreview.classList.add('hidden'));
el.modalPreview.addEventListener('click', e => { if (e.target === el.modalPreview) el.modalPreview.classList.add('hidden'); });

/* ──────────────── START RUN ──────────────── */
function startRun() {
  state.chapter = 0;
  state.level = 0;
  state.health = 100;
  state.upgrades = [];
  state.score = 0;
  state.chapterStats = [];
  state.siteCode = { html: '', css: '', js: '' };
  state.streak = 0;
  state.totalChars = 0;
  state.correctChars = 0;
  state.totalWpm = 0;
  state.wpmSamples = 0;
  state.sessionStartTime = Date.now();
  showScreen('game');
  loadLevel();
}

/* ──────────────── LEVEL LOADING ──────────────── */
function loadLevel() {
  const ch  = CHAPTERS[state.chapter];
  const lv  = ch.levels[state.level];
  state.lineIndex = 0;
  state.isBoss = lv.isBoss;
  state.shieldUsed = false;
  state.skipsLeft = state.upgrades.includes('ghost') ? 1 : 0;

  // HUD
  el.hudChapter.textContent = ch.title;
  el.hudLevel.textContent   = `Level ${state.level + 1} / ${ch.levels.length}`;
  updateHealthBar();
  buildLevelPath();

  // Enemy
  el.enemyName.textContent = lv.enemy;
  el.ghostSpeech.textContent = lv.enemyQuip;
  el.ghostBody.className = 'ghost-body' + (lv.isBoss ? ' boss-mode' : '');
  el.enemyHpFill.style.width = '100%';

  // Context + hint
  el.lessonContext.textContent = lv.context;
  el.progressHint.textContent  = '💡 ' + lv.hint;

  // Boss intro
  if (lv.isBoss) {
    el.bossIntroText.textContent = lv.context.replace('🔥 BOSS ROUND — ', '').replace('🔥 BOSS — ', '');
    el.bossIntro.classList.remove('hidden');
    el.btnBossStart.onclick = () => {
      el.bossIntro.classList.add('hidden');
      renderSnippet();
      el.typingInput.focus();
    };
  } else {
    el.bossIntro.classList.add('hidden');
    renderSnippet();
    el.typingInput.focus();
  }

  state.lineStartTime = Date.now();
  updateProgressLabel();
  updateActiveUpgradesDisplay();
}

/* ──────────────── LEVEL PATH ──────────────── */
function buildLevelPath() {
  const ch = CHAPTERS[state.chapter];
  el.levelPath.innerHTML = '';
  ch.levels.forEach((lv, i) => {
    if (i > 0) {
      const conn = document.createElement('div');
      conn.className = 'path-connector' + (i <= state.level ? ' done' : '');
      el.levelPath.appendChild(conn);
    }
    const node = document.createElement('div');
    node.className = 'path-node'
      + (lv.isBoss ? ' boss' : '')
      + (i < state.level ? ' done' : '')
      + (i === state.level ? ' active' : '');
    node.textContent = lv.isBoss ? '💀' : (i + 1);
    el.levelPath.appendChild(node);
  });
}

/* ──────────────── SNIPPET RENDERING ──────────────── */
function renderSnippet() {
  const lines = getCurrentLines();
  el.snippetDisplay.innerHTML = '';

  lines.forEach((lineText, i) => {
    const row = document.createElement('div');
    row.className = 'code-line'
      + (i < state.lineIndex ? ' done-line' : '')
      + (i === state.lineIndex ? ' target-line' : '');
    row.id = `line-row-${i}`;

    const num = document.createElement('span');
    num.className = 'line-num';
    num.textContent = i + 1;
    row.appendChild(num);

    const text = document.createElement('span');
    text.className = 'line-text';
    text.id = `line-text-${i}`;

    if (i < state.lineIndex) {
      text.innerHTML = `<span class="char correct">${escHtml(lineText)}</span>`;
    } else if (i === state.lineIndex) {
      text.innerHTML = charSpans(lineText);
    } else {
      // pending lines
      text.innerHTML = lineText.split('').map(c =>
        `<span class="char pending">${escHtml(c)}</span>`).join('');
    }

    row.appendChild(text);
    el.snippetDisplay.appendChild(row);
  });
}

function charSpans(line) {
  return line.split('').map((c, i) => {
    const cls = i === 0 ? 'char current' : 'char pending';
    return `<span class="char ${cls}" data-pos="${i}">${escHtml(c)}</span>`;
  }).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getCurrentLines() {
  return CHAPTERS[state.chapter].levels[state.level].lines;
}

/* ──────────────── TYPING ENGINE ──────────────── */
el.typingInput.addEventListener('input', handleInput);
el.typingInput.addEventListener('keydown', e => {
  if (e.key === 'Tab') { e.preventDefault(); el.typingInput.value += '  '; handleInput(); }
});

function handleInput() {
  const typed  = el.typingInput.value;
  const target = getCurrentLines()[state.lineIndex];
  updateCharDisplay(typed, target);

  // WPM live update
  if (typed.length === 1 && state.lineStartTime) {
    // reset on new line start
  }
  const elapsed = (Date.now() - state.lineStartTime) / 60000;
  if (elapsed > 0) {
    const wpm = Math.round((typed.length / 5) / elapsed);
    el.statWpm.textContent = Math.min(wpm, 300);
  }

  // Check completion
  if (typed === target) {
    lineComplete(target);
  }
}

function updateCharDisplay(typed, target) {
  const spans = document.querySelectorAll(`#line-text-${state.lineIndex} .char`);
  let hasError = false;
  spans.forEach((sp, i) => {
    sp.className = 'char';
    if (i < typed.length) {
      if (typed[i] === target[i]) sp.classList.add('correct');
      else { sp.classList.add('wrong'); hasError = true; }
    } else if (i === typed.length) {
      sp.classList.add('current');
    } else {
      sp.classList.add('pending');
    }
  });
  el.inputWrap.classList.toggle('error', hasError);
}

function lineComplete(line) {
  // Measure WPM for this line
  const elapsed = (Date.now() - state.lineStartTime) / 60000;
  const wpm = Math.round((line.length / 5) / Math.max(elapsed, 0.0001));
  state.totalWpm += wpm;
  state.wpmSamples++;
  state.totalChars += line.length;
  state.correctChars += line.length;

  // streak + score
  state.streak++;
  el.statStreak.textContent = state.streak;
  const mult = state.upgrades.includes('accurate') ? 2 : 1;
  state.score += line.length * mult + (state.streak > 3 ? 10 : 0);

  // Update accuracy
  updateAccuracy();

  // Reset input
  el.typingInput.value = '';
  el.inputWrap.classList.remove('error');
  el.inputFeedback.className = 'input-feedback good';
  el.inputFeedback.textContent = pickPraise();
  setTimeout(() => { el.inputFeedback.textContent = ''; el.inputFeedback.className = 'input-feedback'; }, 1200);

  // Mark line done in UI
  const row = $(`line-row-${state.lineIndex}`);
  if (row) row.className = 'code-line done-line';

  // Enemy HP drain
  const lines = getCurrentLines();
  const hpPct = 1 - (state.lineIndex + 1) / lines.length;
  el.enemyHpFill.style.width = (hpPct * 100) + '%';

  state.lineIndex++;
  state.lineStartTime = Date.now();
  updateProgressLabel();

  if (state.lineIndex >= lines.length) {
    levelComplete();
  } else {
    // activate next line
    const nextRow = $(`line-row-${state.lineIndex}`);
    if (nextRow) nextRow.className = 'code-line target-line';
    const nextText = $(`line-text-${state.lineIndex}`);
    if (nextText) nextText.innerHTML = charSpans(lines[state.lineIndex]);
    el.snippetDisplay.scrollTop = el.snippetDisplay.scrollHeight;
  }
}

const PRAISE = ['✓ Perfect!','✓ Nailed it!','✓ Syntax clean!','✓ One with the code!','✓ Ghost approved!'];
function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

el.typingInput.addEventListener('keydown', e => {
  if (e.key !== 'Backspace') return;
  // count errors for health
  const typed  = el.typingInput.value;
  const target = getCurrentLines()[state.lineIndex];
  if (typed.length > 0 && typed[typed.length - 1] !== target[typed.length - 1]) {
    onTypingError();
  }
});

// Also catch wrong chars typed (not backspace)
let lastVal = '';
el.typingInput.addEventListener('input', () => {
  const typed  = el.typingInput.value;
  const target = getCurrentLines()[state.lineIndex];
  if (typed.length > lastVal.length) {
    const pos = typed.length - 1;
    if (pos < target.length && typed[pos] !== target[pos]) {
      onTypingError();
    }
  }
  lastVal = typed;
}, { capture: true });

function onTypingError() {
  // shield upgrade: forgive first mistake per line
  if (state.upgrades.includes('shield') && !state.shieldUsed) {
    state.shieldUsed = true;
    return;
  }
  // slow upgrade: buffer 3 mistakes before damage
  if (state.upgrades.includes('slow')) {
    state.errorBuffer++;
    if (state.errorBuffer < 3) return;
    state.errorBuffer = 0;
  }
  state.streak = 0;
  el.statStreak.textContent = '0';
  takeDamage(8);
}

function takeDamage(amt) {
  state.health = Math.max(0, state.health - amt);
  updateHealthBar();
  // flash
  el.dmgFlash.classList.remove('active');
  void el.dmgFlash.offsetWidth;
  el.dmgFlash.classList.add('active');

  if (state.health <= 0) gameOver();
}

function updateHealthBar() {
  const pct = state.health / state.maxHealth;
  el.healthFill.style.width = (pct * 100) + '%';
  el.healthFill.classList.toggle('low', pct < .3);
}

function updateAccuracy() {
  const acc = state.totalChars > 0
    ? Math.round((state.correctChars / state.totalChars) * 100)
    : 100;
  el.statAcc.textContent = acc;
}

function updateProgressLabel() {
  const lines = getCurrentLines();
  el.progressLines.textContent = `Line ${state.lineIndex} / ${lines.length}`;
}

/* ──────────────── LEVEL COMPLETE ──────────────── */
function levelComplete() {
  // Accumulate site code
  accumulateSiteCode();

  el.enemyHpFill.style.width = '0%';
  el.ghostBody.classList.add('hurt');
  setTimeout(() => el.ghostBody.classList.remove('hurt'), 600);

  const ch = CHAPTERS[state.chapter];
  const isLastLevel = state.level === ch.levels.length - 1;

  if (isLastLevel) {
    // chapter complete
    setTimeout(() => showChapterEnd(), 700);
  } else {
    // show upgrade panel between levels
    setTimeout(() => {
      if (!state.isBoss) showUpgradePanel();
      else {
        state.level++;
        loadLevel();
      }
    }, 600);
    if (!state.isBoss) {
      // next level
    } else {
      state.level++;
    }
  }
}

/* ──────────────── SITE CODE ACCUMULATION ──────────────── */
function accumulateSiteCode() {
  const lv = CHAPTERS[state.chapter].levels[state.level];
  const code = lv.lines.join('\n') + '\n';
  if (state.chapter === 0) state.siteCode.html += code;
  else if (state.chapter === 1) state.siteCode.css += code;
  else if (state.chapter === 2) state.siteCode.js += code;
}

function buildSiteHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>My Portfolio</title>
<style>
${state.siteCode.css}
</style>
</head>
<body>
${state.siteCode.html}
<script>
${state.siteCode.js}
<\/script>
</body>
</html>`;
}

function injectPreview(iframe) {
  const html = buildSiteHTML();
  iframe.srcdoc = html;
}

/* ──────────────── UPGRADE PANEL ──────────────── */
function showUpgradePanel() {
  // pick 3 random upgrades not already active
  const pool = UPGRADES.filter(u => !state.upgrades.includes(u.id));
  const picks = shuffle(pool).slice(0, 3);

  el.upgradeCards.innerHTML = '';
  picks.forEach(upg => {
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.innerHTML = `
      <div class="upgrade-card-icon">${upg.icon}</div>
      <div class="upgrade-card-name">${upg.name}</div>
      <div class="upgrade-card-desc">${upg.desc}</div>
    `;
    card.addEventListener('click', () => {
      applyUpgrade(upg);
      closeUpgradePanel();
    });
    el.upgradeCards.appendChild(card);
  });

  el.upgradePanel.classList.remove('hidden');
}

function applyUpgrade(upg) {
  state.upgrades.push(upg.id);
  if (upg.id === 'heal') state.health = Math.min(state.maxHealth, state.health + 25);
}

function closeUpgradePanel() {
  el.upgradePanel.classList.add('hidden');
  state.level++;
  loadLevel();
}

el.btnSkipUpgrade.addEventListener('click', closeUpgradePanel);

/* ──────────────── ACTIVE UPGRADES DISPLAY ──────────────── */
function updateActiveUpgradesDisplay() {
  let pip = document.querySelector('.active-upgrades');
  if (!pip) { pip = document.createElement('div'); pip.className = 'active-upgrades'; document.body.appendChild(pip); }
  pip.innerHTML = '';
  state.upgrades.filter(id => id !== 'heal').forEach(id => {
    const u = UPGRADES.find(x => x.id === id);
    if (!u) return;
    const dot = document.createElement('div');
    dot.className = 'upgrade-pip';
    dot.textContent = u.icon;
    dot.title = u.name + ': ' + u.desc;
    pip.appendChild(dot);
  });
}

/* ──────────────── CHAPTER END ──────────────── */
function showChapterEnd() {
  const ch = CHAPTERS[state.chapter];
  el.chEndIcon.textContent  = ch.icon;
  el.chEndTitle.textContent = `${ch.name} — Complete!`;
  el.chEndMsg.textContent   = ch.completeMsg;

  // stat pills
  const avgWpm = state.wpmSamples ? Math.round(state.totalWpm / state.wpmSamples) : 0;
  const acc = state.totalChars ? Math.round((state.correctChars / state.totalChars) * 100) : 100;
  el.endStats.innerHTML = `
    <div class="stat-pill"><strong>${avgWpm}</strong> avg WPM</div>
    <div class="stat-pill"><strong>${acc}%</strong> Accuracy</div>
    <div class="stat-pill"><strong>${state.score}</strong> Score</div>
    <div class="stat-pill"><strong>${state.upgrades.length}</strong> Upgrades</div>
  `;

  // site preview
  injectPreview(el.sitePreview);

  // save chapter stats
  state.chapterStats.push({ avgWpm, acc, score: state.score });

  const isLastChapter = state.chapter === CHAPTERS.length - 1;
  el.btnNextChapter.textContent = isLastChapter ? '🌐 SEE YOUR SITE →' : 'NEXT CHAPTER →';
  el.btnNextChapter.onclick = () => {
    if (isLastChapter) showFinalScreen();
    else {
      state.chapter++;
      state.level = 0;
      state.health = Math.min(state.maxHealth, state.health + 30); // heal between chapters
      showScreen('game');
      loadLevel();
    }
  };

  showScreen('chapterEnd');
}

el.btnTitleEnd.addEventListener('click', () => showScreen('title'));

/* ──────────────── FINAL SCREEN ──────────────── */
function showFinalScreen() {
  // inject complete site
  injectPreview(el.sitePreviewFinal);

  // stats
  const totalWpm = state.wpmSamples ? Math.round(state.totalWpm / state.wpmSamples) : 0;
  const totalAcc = state.totalChars ? Math.round((state.correctChars / state.totalChars) * 100) : 100;
  const timeMin  = Math.round((Date.now() - state.sessionStartTime) / 60000);
  el.finalStats.innerHTML = `
    <div class="stat-pill"><strong>${totalWpm}</strong> avg WPM</div>
    <div class="stat-pill"><strong>${totalAcc}%</strong> Accuracy</div>
    <div class="stat-pill"><strong>${state.score}</strong> Score</div>
    <div class="stat-pill"><strong>${timeMin}</strong> minutes</div>
    <div class="stat-pill"><strong>${state.upgrades.length}</strong> Powers used</div>
  `;

  spawnFireworks();
  showScreen('final');
}

el.btnPlayAgain.addEventListener('click', () => { showScreen('title'); resetGame(); });

function resetGame() {
  // just reset state; startRun will handle the rest
}

/* ──────────────── GAME OVER ──────────────── */
function gameOver() {
  el.inputFeedback.className = 'input-feedback bad';
  el.inputFeedback.textContent = '💀 Your soul has left the building. Try again!';
  el.typingInput.disabled = true;
  setTimeout(() => {
    el.typingInput.disabled = false;
    showScreen('title');
  }, 2500);
}

/* ──────────────── PREVIEW MODAL ──────────────── */
function openPreviewModal() {
  injectPreview(el.modalIframe);
  el.modalPreview.classList.remove('hidden');
}

/* ──────────────── FIREWORKS ──────────────── */
function spawnFireworks() {
  const container = $('final-fireworks');
  const colors = ['#7f5af0','#cb6ce6','#52e09e','#e0c352','#e05252','#b8c0ff'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const fw = document.createElement('div');
      fw.className = 'firework';
      fw.style.left = Math.random() * 100 + '%';
      fw.style.top  = Math.random() * 60 + '%';
      fw.style.background = colors[Math.floor(Math.random() * colors.length)];
      fw.style.setProperty('--tx', (Math.random() * 200 - 100) + 'px');
      fw.style.setProperty('--ty', (Math.random() * 200 - 100) + 'px');
      container.appendChild(fw);
      setTimeout(() => fw.remove(), 1600);
    }, i * 80);
  }
}

/* ──────────────── UTILS ──────────────── */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ──────────────── KEYBOARD SHORTCUT: skip line (ghost upgrade) ──────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && screens.game.classList.contains('active')) {
    if (state.upgrades.includes('ghost') && state.skipsLeft > 0) {
      state.skipsLeft--;
      el.inputFeedback.className = 'input-feedback good';
      el.inputFeedback.textContent = '👻 Ghost Skip used!';
      el.typingInput.value = getCurrentLines()[state.lineIndex];
      handleInput();
    }
  }
});

/* ──────────────── BOOT ──────────────── */
spawnGhostParticles();
updateTitleLocks();
showScreen('title');
