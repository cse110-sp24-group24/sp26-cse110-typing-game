const ENEMY_BASE_SCORE = 100;
const BOSS_SCORE_MULTIPLIER = 5;
const STARTING_LIVES = 3;
const BASE_SPEED = 22;

const UPGRADES = [
  { id: "slow_fall",    name: "Slow Fall",      icon: "🌫️", description: "Enemies move 30% slower.",           effect: s => { s.fallSpeedMultiplier *= 0.7; } },
  { id: "extra_life",   name: "Extra Life",     icon: "💚", description: "+1 life immediately.",               effect: s => { s.lives += 1; } },
  { id: "score_boost",  name: "Score Boost",    icon: "⭐", description: "+50% score from everything.",        effect: s => { s.scoreMultiplier *= 1.5; } },
  { id: "time_freeze",  name: "Time Freeze",    icon: "❄️", description: "Enemies freeze 2s each wave start.", effect: s => { s.waveFreezeMs += 2000; } },
  { id: "ghost_sight",  name: "Ghost Sight",    icon: "👁️", description: "Next enemy previewed.",              effect: s => { s.revealNext = true; } },
  { id: "double_pts",   name: "Double Points",  icon: "💰", description: "Boss score ×2.",                     effect: s => { s.bossScoreMultiplier *= 2; } },
  { id: "shield",       name: "Phantom Shield", icon: "🛡️", description: "Blocks 1 life loss per wave.",       effect: s => { s.shieldPerWave = true; } },
  { id: "speed_demon",  name: "Speed Demon",    icon: "⚡", description: "+50 pts for sub-3s kills.",          effect: s => { s.speedBonusActive = true; } },
  { id: "second_wind",  name: "Second Wind",    icon: "💨", description: "+1 life each new wave.",             effect: s => { s.lifePerWave = true; } },
  { id: "calm_aura",    name: "Calm Aura",      icon: "🕊️", description: "Enemies 15% slower.",              effect: s => { s.fallSpeedMultiplier *= 0.85; } }
];

const ENEMY_SHAPES = [
  `<svg viewBox="0 0 48 48" width="40" height="40">
    <circle cx="24" cy="20" r="14" fill="rgba(130,200,255,0.5)" stroke="rgba(160,220,255,0.7)" stroke-width="1.5"/>
    <circle cx="19" cy="18" r="3" fill="rgba(80,150,255,0.9)"/>
    <circle cx="29" cy="18" r="3" fill="rgba(80,150,255,0.9)"/>
    <path d="M16 32 Q20 40 24 32 Q28 40 32 32" fill="none" stroke="rgba(130,200,255,0.4)" stroke-width="2"/>
  </svg>`,
  `<svg viewBox="0 0 48 52" width="40" height="44">
    <ellipse cx="24" cy="20" rx="16" ry="18" fill="rgba(200,180,255,0.4)" stroke="rgba(220,200,255,0.6)" stroke-width="1.5"/>
    <circle cx="17" cy="17" r="5" fill="rgba(40,0,60,0.8)"/>
    <circle cx="31" cy="17" r="5" fill="rgba(40,0,60,0.8)"/>
    <path d="M18 30 L21 27 L24 30 L27 27 L30 30" fill="none" stroke="rgba(40,0,60,0.7)" stroke-width="2"/>
    <path d="M14 38 Q24 48 34 38" fill="rgba(200,180,255,0.2)" stroke="rgba(220,200,255,0.3)" stroke-width="1"/>
  </svg>`,
  `<svg viewBox="0 0 48 56" width="38" height="46">
    <path d="M24 4 C12 4 4 14 4 26 L4 44 L12 38 L20 44 L28 38 L36 44 L44 38 L44 26 C44 14 36 4 24 4z" fill="rgba(100,255,180,0.35)" stroke="rgba(140,255,200,0.6)" stroke-width="1.5"/>
    <circle cx="18" cy="20" r="4" fill="rgba(0,200,100,0.8)"/>
    <circle cx="30" cy="20" r="4" fill="rgba(0,200,100,0.8)"/>
  </svg>`,
  `<svg viewBox="0 0 48 56" width="38" height="46">
    <ellipse cx="24" cy="22" rx="18" ry="20" fill="rgba(255,150,200,0.35)" stroke="rgba(255,180,220,0.6)" stroke-width="1.5"/>
    <ellipse cx="16" cy="18" rx="4" ry="5" fill="rgba(200,50,100,0.7)"/>
    <ellipse cx="32" cy="18" rx="4" ry="5" fill="rgba(200,50,100,0.7)"/>
    <ellipse cx="24" cy="32" rx="6" ry="8" fill="rgba(200,50,100,0.4)"/>
  </svg>`,
  `<svg viewBox="0 0 48 48" width="40" height="40">
    <circle cx="24" cy="24" r="18" fill="rgba(80,60,140,0.5)" stroke="rgba(140,100,220,0.6)" stroke-width="2"/>
    <circle cx="24" cy="24" r="10" fill="rgba(60,40,120,0.6)"/>
    <circle cx="20" cy="20" r="3" fill="rgba(200,150,255,0.9)"/>
    <circle cx="28" cy="20" r="3" fill="rgba(200,150,255,0.9)"/>
    <path d="M18 28 Q24 34 30 28" fill="none" stroke="rgba(200,150,255,0.5)" stroke-width="1.5"/>
  </svg>`,
  `<svg viewBox="0 0 48 56" width="38" height="46">
    <path d="M24 4 Q8 20 12 36 Q16 48 24 52 Q32 48 36 36 Q40 20 24 4z" fill="rgba(255,120,40,0.4)" stroke="rgba(255,160,60,0.6)" stroke-width="1.5"/>
    <circle cx="19" cy="24" r="3.5" fill="rgba(255,220,100,0.9)"/>
    <circle cx="29" cy="24" r="3.5" fill="rgba(255,220,100,0.9)"/>
    <path d="M20 34 Q24 38 28 34" fill="none" stroke="rgba(255,200,80,0.6)" stroke-width="1.5"/>
  </svg>`
];

const ENEMY_COLORS = ["#7ad3ff","#c0a3f0","#b9f0a3","#ffb3d1","#9b6bff","#ff9a76"];

const MENU_SAMPLES = [
  'function','const','return','let','if','for','while','class',
  'async','await','import','export','=>','.map()','.filter()',
  'null','this','new','def ','self','yield','pass','lambda',
  '{}','[]','true','false','typeof','try','catch'
];
const MENU_PALETTE = ['#ff7a59','#7ad3ff','#ffd866','#9be7ff','#ff9a76','#b9f0a3','#c0a3f0'];

class Game {
  constructor() {
    this.screen = "menu";
    this.language = null;
    this.wave = 0;
    this.snippet = null;
    this.pendingLineIndices = [];
    this.pendingEnemyIdx = 0;
    this.completedLineIndices = new Set();
    this.lives = STARTING_LIVES;
    this.score = 0;
    this.displayedScore = 0;
    this.upgrades = [];
    this.fallSpeedMultiplier = 1;
    this.scoreMultiplier = 1;
    this.bossScoreMultiplier = 1;
    this.waveFreezeMs = 0;
    this.revealNext = false;
    this.shieldPerWave = false;
    this.speedBonusActive = false;
    this.lifePerWave = false;
    this.shieldActive = false;
    this.paused = false;
    this.inputLocked = false;
    this.enemies = [];
    this.activeEnemy = null;
    this.typedChars = 0;
    this.correctChars = 0;
    this.totalCharsThisWave = 0;
    this.correctCharsThisWave = 0;
    this.mistakesThisWave = [];
    this.prevInputLength = 0;
    this.waveStartTime = 0;
    this.usedSnippetIndices = [];
    this.totalWavesSurvived = 0;
    this.runStartTime = 0;
    this.isBoss = false;
    this.bossLines = [];
    this.bossCurrentLine = 0;
    this.bossTimer = 0;
    this.bossTimerMax = 0;
    this.prevBossInputLength = 0;
    this.bossEl = null;
    this.particles = [];
    this.beams = [];
    this.streams = [];
    this.shakeAmount = 0;
    this.combo = 0;
    this.comboDecay = 0;
    this.canvas = null;
    this.ctx = null;
    this.canvasW = 0;
    this.canvasH = 0;
    this.animFrame = null;
    this.lastTime = 0;
    this.menuTokens = [];
    this.menuTimer = 0;

    this.initDOM();
    this.initCanvas();
    this.bindEvents();
    this.showScreen("menu");
    this.startMenuDemo();
    this.startLoop();
  }

  initDOM() {
    this.screens = {
      menu: document.getElementById("menu-screen"),
      language: document.getElementById("language-screen"),
      waveIntro: document.getElementById("wave-intro-screen"),
      game: document.getElementById("game-screen"),
      bossIntro: document.getElementById("boss-intro-screen"),
      waveFeedback: document.getElementById("wave-feedback-screen"),
      upgrade: document.getElementById("upgrade-screen"),
      stats: document.getElementById("stats-screen"),
      pause: document.getElementById("pause-overlay")
    };
    this.inputField    = document.getElementById("typing-input");
    this.codePanelHdr  = document.getElementById("code-panel-header");
    this.arena         = document.getElementById("arena");
    this.rayLayer      = document.getElementById("ray-layer");
    this.player        = document.getElementById("player");
    this.livesDisplay  = document.getElementById("lives-display");
    this.scoreDisplay  = document.getElementById("score-display");
    this.waveDisplay   = document.getElementById("wave-display");
    this.langLabel     = document.getElementById("language-label");
    this.upgradesHud   = document.getElementById("upgrades-hud");
    this.flashOverlay  = document.getElementById("flash-overlay");
    this.comboDisplay  = document.getElementById("combo-display");
    this.comboValue    = document.getElementById("combo-value");
    this.comboBar      = document.getElementById("combo-bar");
  }

  initCanvas() {
    this.canvas = document.getElementById("fx-canvas");
    this.ctx    = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvasW = window.innerWidth;
    this.canvasH = window.innerHeight;
    this.canvas.width  = this.canvasW * dpr;
    this.canvas.height = this.canvasH * dpr;
    this.canvas.style.width  = this.canvasW + "px";
    this.canvas.style.height = this.canvasH + "px";
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  bindEvents() {
    document.getElementById("play-btn").addEventListener("click", () => this.showScreen("language"));
    document.getElementById("js-btn").addEventListener("click",  () => this.selectLanguage("javascript"));
    document.getElementById("py-btn").addEventListener("click",  () => this.selectLanguage("python"));
    document.getElementById("play-again-btn").addEventListener("click", () => this.restart());
    document.getElementById("resume-btn").addEventListener("click", () => this.togglePause());
    document.getElementById("quit-btn").addEventListener("click",   () => this.quitRun());

    this.inputField.addEventListener("input", () => this.handleInput());
    this.inputField.addEventListener("paste", e => e.preventDefault());
    this.inputField.addEventListener("drop",  e => e.preventDefault());

    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && (this.screen === "game" || this.paused)) this.togglePause();
      if (this.screen === "waveIntro" && !this.waveIntroOut) this.dismissWaveIntro();
    });
  }

  showScreen(name) {
    Object.values(this.screens).forEach(s => s.classList.remove("active"));
    if (this.screens[name]) this.screens[name].classList.add("active");
    this.screen = name;
  }

  // ── GAME FLOW ──────────────────────────────────────────────────────────────

  selectLanguage(lang) {
    this.language = lang;
    this.langLabel.textContent = lang === "javascript" ? "JavaScript" : "Python";
    this.wave = 0;
    this.lives = STARTING_LIVES;
    this.score = 0;
    this.displayedScore = 0;
    this.upgrades = [];
    this.fallSpeedMultiplier = 1;
    this.scoreMultiplier = 1;
    this.bossScoreMultiplier = 1;
    this.waveFreezeMs = 0;
    this.revealNext = false;
    this.shieldPerWave = false;
    this.speedBonusActive = false;
    this.lifePerWave = false;
    this.usedSnippetIndices = [];
    this.typedChars = 0;
    this.correctChars = 0;
    this.totalWavesSurvived = 0;
    this.combo = 0;
    this.comboDecay = 0;
    this.runStartTime = Date.now();
    this.stopMenuDemo();
    this.updateHUD();
    this.updateUpgradeHud();
    this.startNextWave();
  }

  startNextWave() {
    this.wave++;
    if (this.lifePerWave && this.wave > 1) this.lives++;
    this.shieldActive = this.shieldPerWave;

    const pool = SNIPPETS[this.language];
    if (this.usedSnippetIndices.length >= pool.length) this.usedSnippetIndices = [];
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); }
    while (this.usedSnippetIndices.includes(idx));
    this.usedSnippetIndices.push(idx);
    this.snippet = pool[idx];

    const n = this.snippet.lines.length;
    this.pendingLineIndices = Array.from({length: n}, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pendingLineIndices[i], this.pendingLineIndices[j]] =
      [this.pendingLineIndices[j], this.pendingLineIndices[i]];
    }
    this.pendingEnemyIdx    = 0;
    this.completedLineIndices = new Set();
    this.enemies            = [];
    this.isBoss             = false;
    this.totalCharsThisWave = 0;
    this.correctCharsThisWave = 0;
    this.mistakesThisWave   = [];
    this.waveStartTime      = Date.now();
    this.activeEnemy        = null;

    this.showWaveIntro();
  }

  showWaveIntro() {
    document.getElementById("wave-intro-number").textContent = `Wave ${this.wave}`;
    document.getElementById("wave-intro-function").textContent = this.snippet.name;
    document.getElementById("wave-intro-desc").textContent    = this.snippet.description;
    this.showScreen("waveIntro");
    this.waveIntroOut = false;
    this.waveIntroTimer = setTimeout(() => this.dismissWaveIntro(), 3000);
  }

  dismissWaveIntro() {
    if (this.screen !== "waveIntro") return;
    this.waveIntroOut = true;
    clearTimeout(this.waveIntroTimer);
    this.beginWave();
  }

  beginWave() {
    this.showScreen("game");
    this.arena.querySelectorAll(".enemy").forEach(e => e.remove());
    this.rayLayer.innerHTML = "";
    this.renderCodePanel();
    this.updateHUD();

    const delay = this.waveFreezeMs > 0 ? this.waveFreezeMs : 0;
    this.inputLocked = delay > 0;
    setTimeout(() => {
      this.inputLocked = false;
      this.spawnEnemy();
      this.inputField.focus();
    }, delay);
  }

  // ── ENEMY ──────────────────────────────────────────────────────────────────

  renderCodePanel() {
    this.codePanelHdr.textContent = this.snippet.name;
    const container = document.getElementById("code-lines");
    container.innerHTML = "";
    this.snippet.lines.forEach((line, i) => {
      const el = document.createElement("div");
      el.className = "code-line";
      if (this.completedLineIndices.has(i)) {
        el.classList.add("completed");
        el.textContent = line;
      } else if (this.revealNext && this.pendingEnemyIdx < this.pendingLineIndices.length
                 && this.pendingLineIndices[this.pendingEnemyIdx] === i) {
        el.classList.add("revealed");
        el.textContent = line;
      } else {
        el.classList.add("placeholder");
        el.textContent = "█".repeat(Math.min(line.trimStart().length, 28));
      }
      container.appendChild(el);
    });
  }

  getSpawnPos(idx) {
    const w = this.arena.clientWidth, h = this.arena.clientHeight;
    const cx = w / 2, cy = h / 2;
    const sides = ["top","right","bottom","left"];
    const side  = sides[idx % 4];
    const j     = (Math.random() - 0.5) * 0.5;
    switch (side) {
      case "top":    return { x: cx + j * w * 0.4, y: 35 };
      case "right":  return { x: w - 35, y: cy + j * h * 0.35 };
      case "bottom": return { x: cx + j * w * 0.4, y: h - 35 };
      case "left":   return { x: 35, y: cy + j * h * 0.35 };
    }
  }

  spawnEnemy() {
    if (this.pendingEnemyIdx >= this.pendingLineIndices.length) {
      this.startBossIntro();
      return;
    }
    const lineIdx  = this.pendingLineIndices[this.pendingEnemyIdx++];
    const line     = this.snippet.lines[lineIdx];
    const target   = line.trimStart();
    const pos      = this.getSpawnPos(lineIdx);
    const shapeIdx = (lineIdx + this.wave) % ENEMY_SHAPES.length;

    const el = document.createElement("div");
    el.className  = "enemy";
    el.style.left = pos.x + "px";
    el.style.top  = pos.y + "px";

    const sprite = document.createElement("div");
    sprite.className = "enemy-sprite";
    sprite.innerHTML = ENEMY_SHAPES[shapeIdx];
    el.appendChild(sprite);

    const bubble = document.createElement("div");
    bubble.className = "enemy-text-bubble";
    const textEl = document.createElement("span");
    textEl.className  = "enemy-text";
    textEl.textContent = target;
    bubble.appendChild(textEl);
    el.appendChild(bubble);

    this.arena.appendChild(el);

    const enemy = {
      lineIndex: lineIdx, line, target,
      x: pos.x, y: pos.y,
      element: el,
      spawnTime: Date.now(),
      defeated: false,
      color: ENEMY_COLORS[shapeIdx]
    };
    this.enemies.push(enemy);
    this.activeEnemy = enemy;
    el.classList.add("active-target");
    this.inputField.value = "";
    this.prevInputLength = 0;
    this.inputField.focus();
  }

  // ── INPUT ──────────────────────────────────────────────────────────────────

  handleInput() {
    if (this.inputLocked || this.paused) { this.inputField.value = ""; return; }
    if (this.isBoss) { this.handleBossInput(); return; }
    if (!this.activeEnemy || this.activeEnemy.defeated) return;

    const typed  = this.inputField.value;
    const target = this.activeEnemy.target;
    const prev   = this.prevInputLength;
    this.prevInputLength = typed.length;

    for (let i = prev; i < typed.length; i++) {
      this.totalCharsThisWave++;
      this.typedChars++;
      if (i < target.length && typed[i] === target[i]) {
        this.correctCharsThisWave++;
        this.correctChars++;
      } else if (i < target.length) {
        this.mistakesThisWave.push({ typed: typed[i], expected: target[i] });
      }
    }

    if (typed.length > prev) {
      const last = typed.length - 1;
      if (last < target.length && typed[last] !== target[last]) {
        this.doEnemyShake(this.activeEnemy.element);
        this.breakCombo();
      }
    }

    const textEl = this.activeEnemy.element.querySelector(".enemy-text");
    let html = "", allGood = true;
    for (let i = 0; i < typed.length; i++) {
      if (i < target.length && typed[i] === target[i]) {
        html += `<span class="correct">${this.esc(typed[i])}</span>`;
      } else {
        html += `<span class="incorrect">${this.esc(typed[i])}</span>`;
        allGood = false;
      }
    }
    if (typed.length < target.length) {
      html += `<span class="remaining">${this.esc(target.slice(typed.length))}</span>`;
    }
    textEl.innerHTML = html;

    if (typed.length === target.length && allGood) this.defeatEnemy(this.activeEnemy);
  }

  handleBossInput() {
    const typed  = this.inputField.value;
    const target = this.bossLines[this.bossCurrentLine].trimStart();
    const prev   = this.prevBossInputLength;
    this.prevBossInputLength = typed.length;

    for (let i = prev; i < typed.length; i++) {
      this.totalCharsThisWave++;
      this.typedChars++;
      if (i < target.length && typed[i] === target[i]) {
        this.correctCharsThisWave++;
        this.correctChars++;
      } else if (i < target.length) {
        this.mistakesThisWave.push({ typed: typed[i], expected: target[i] });
      }
    }

    if (typed.length > prev) {
      const last = typed.length - 1;
      if (last < target.length && typed[last] !== target[last]) {
        if (this.bossEl) this.doEnemyShake(this.bossEl);
        this.breakCombo();
        this.bossTimer = Math.max(0, this.bossTimer - 0.8);
        this.flashScreen("red");
      }
    }

    const textEl = document.getElementById("boss-text-current");
    if (!textEl) return;
    let html = "", allGood = true;
    for (let i = 0; i < typed.length; i++) {
      if (i < target.length && typed[i] === target[i]) {
        html += `<span class="correct">${this.esc(typed[i])}</span>`;
      } else {
        html += `<span class="incorrect">${this.esc(typed[i])}</span>`;
        allGood = false;
      }
    }
    if (typed.length < target.length) {
      html += `<span class="remaining">${this.esc(target.slice(typed.length))}</span>`;
    }
    textEl.innerHTML = html;

    if (typed.length === target.length && allGood) this.completeBossLine();
  }

  // ── DEFEAT ─────────────────────────────────────────────────────────────────

  defeatEnemy(enemy) {
    enemy.defeated = true;
    this.activeEnemy = null;

    const elapsed = (Date.now() - enemy.spawnTime) / 1000;
    let pts = Math.round(ENEMY_BASE_SCORE * this.scoreMultiplier);
    if (this.speedBonusActive && elapsed < 3) pts += Math.round(50 * this.scoreMultiplier);

    this.addCombo();
    this.addScore(pts);
    this.completedLineIndices.add(enemy.lineIndex);
    this.renderCodePanel();

    const rect = enemy.element.getBoundingClientRect();
    const ex   = rect.left + rect.width  / 2;
    const ey   = rect.top  + rect.height / 2;

    this.fireRay(enemy);
    this.spawnBurst(ex, ey, enemy.color);
    this.addBeam(ex, ey);
    this.floater(ex, ey - 20, "+" + pts, "#ffd700");
    this.emitStream(ex, ey, enemy.color);
    this.playSound("defeat");

    if (this.combo > 0 && this.combo % 5 === 0) {
      this.floater(ex, ey - 55, `×${this.combo} COMBO!`, "#ff9a76");
      this.flashScreen("cyan");
      this.shake(6);
    }

    setTimeout(() => {
      enemy.element.classList.add("dissolving");
      setTimeout(() => { if (enemy.element.parentNode) enemy.element.remove(); }, 500);
    }, 180);

    setTimeout(() => {
      this.inputField.value = "";
      this.prevInputLength  = 0;
      this.spawnEnemy();
    }, 520);
  }

  enemyReachedPlayer(enemy) {
    if (enemy.defeated) return;
    enemy.defeated = true;

    if (this.shieldActive) {
      this.shieldActive = false;
      this.flashScreen("cyan");
      this.shake(8);
      this.floater(this.canvasW / 2, this.canvasH / 2, "SHIELD!", "#9be7ff");
    } else {
      this.lives--;
      this.updateHUD();
      this.playSound("lifeLoss");
      this.shake(18);
      this.flashScreen("red");
      this.breakCombo();
      const rect = enemy.element.getBoundingClientRect();
      this.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, "#ff4444", 20);
    }

    setTimeout(() => { if (enemy.element.parentNode) enemy.element.remove(); }, 400);

    if (this.lives <= 0) { this.endRun(); return; }

    this.completedLineIndices.add(enemy.lineIndex);
    this.activeEnemy  = null;
    this.renderCodePanel();
    this.inputField.value = "";
    this.prevInputLength  = 0;

    setTimeout(() => this.spawnEnemy(), 350);
  }

  // ── RAY ────────────────────────────────────────────────────────────────────

  fireRay(enemy) {
    const arenaR  = this.arena.getBoundingClientRect();
    const playerR = this.player.getBoundingClientRect();
    const enemyR  = enemy.element.getBoundingClientRect();

    const px = playerR.left + playerR.width  / 2 - arenaR.left;
    const py = playerR.top  + playerR.height / 2 - arenaR.top;
    const ex = enemyR.left  + enemyR.width   / 2 - arenaR.left;
    const ey = enemyR.top   + enemyR.height  / 2 - arenaR.top;

    const ns = "http://www.w3.org/2000/svg";
    const mkLine = (cls) => {
      const l = document.createElementNS(ns, "line");
      l.setAttribute("x1", px); l.setAttribute("y1", py);
      l.setAttribute("x2", ex); l.setAttribute("y2", ey);
      l.setAttribute("class", cls);
      this.rayLayer.appendChild(l);
      return l;
    };
    const ray  = mkLine("ghost-ray");
    const glow = mkLine("ghost-ray-glow");

    this.player.classList.add("player-firing");
    setTimeout(() => this.player.classList.remove("player-firing"), 400);
    setTimeout(() => { ray.remove(); glow.remove(); }, 520);
  }

  // ── BOSS ───────────────────────────────────────────────────────────────────

  startBossIntro() {
    this.inputLocked = true;
    this.showScreen("bossIntro");

    const bossIntroWave = document.getElementById("boss-intro-wave");
    bossIntroWave.textContent = `Wave ${this.wave} Boss`;

    const bossGhost = document.getElementById("boss-ghost");
    bossGhost.classList.remove("boss-enter");
    void bossGhost.offsetWidth;
    bossGhost.classList.add("boss-enter");

    this.playSound("bossEntry");
    this.flashScreen("red");
    this.shake(12);

    // canvas bursts on intro
    for (let k = 0; k < 3; k++) {
      setTimeout(() => {
        const x = 100 + Math.random() * (this.canvasW - 200);
        const y = 80  + Math.random() * 200;
        this.spawnBurst(x, y, "#ff4444", 22);
        this.shake(6);
      }, k * 500);
    }

    setTimeout(() => this.beginBoss(), 2800);
  }

  beginBoss() {
    this.isBoss      = true;
    this.bossLines   = [...this.snippet.lines];
    this.bossCurrentLine     = 0;
    this.prevBossInputLength = 0;
    const totalChars = this.bossLines.reduce((s, l) => s + l.trimStart().length, 0);
    this.bossTimerMax = Math.max(30, totalChars * 0.55 + 8);
    this.bossTimer    = this.bossTimerMax;
    this.inputLocked  = false;
    this.showScreen("game");
    this.arena.querySelectorAll(".enemy").forEach(e => e.remove());
    this.rayLayer.innerHTML = "";
    this.renderBossUI();
    this.inputField.value = "";
    this.prevBossInputLength = 0;
    this.inputField.focus();
    this.flashScreen("cyan");
    this.shake(10);
  }

  renderBossUI() {
    const el = document.createElement("div");
    el.className = "enemy boss-in-arena";
    el.id = "boss-container";

    el.innerHTML = `
      <div class="boss-ghost-sprite">
        <svg viewBox="0 0 96 120" width="72" height="90">
          <path d="M48 4C26 4 8 24 8 46v54l12-10 12 10 8-10 8 10 8-10 8 10 12-10 12 10V46C88 24 70 4 48 4z"
                fill="rgba(255,100,100,0.5)" stroke="rgba(255,150,150,0.8)" stroke-width="2"/>
          <circle cx="34" cy="40" r="6" fill="rgba(255,50,50,0.9)"/>
          <circle cx="62" cy="40" r="6" fill="rgba(255,50,50,0.9)"/>
          <ellipse cx="48" cy="58" rx="10" ry="6" fill="rgba(255,50,50,0.4)"/>
        </svg>
      </div>
      <div class="boss-label">BOSS</div>
      <div class="boss-health-dots" id="boss-health-dots"></div>
      <div class="boss-text-bubble">
        <div class="boss-line-counter" id="boss-line-counter">Line 1 / ${this.bossLines.length}</div>
        <span class="boss-text" id="boss-text-current">${this.bossLines[0].trimStart()}</span>
      </div>`;

    this.arena.appendChild(el);
    this.bossEl = el;
    this.updateBossHealthDots();
  }

  updateBossHealthDots() {
    const container = document.getElementById("boss-health-dots");
    if (!container) return;
    container.innerHTML = "";
    this.bossLines.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.className = "boss-dot " + (i < this.bossCurrentLine ? "done" : i === this.bossCurrentLine ? "active" : "");
      container.appendChild(dot);
    });
  }

  completeBossLine() {
    this.bossCurrentLine++;
    this.inputField.value = "";
    this.prevBossInputLength = 0;

    const px = this.canvasW / 2;
    const py = this.canvasH * 0.35;
    this.spawnBurst(px, py, "#ff6666", 18);
    this.shake(8);
    this.flashScreen("green");
    this.addCombo();

    if (this.bossCurrentLine >= this.bossLines.length) {
      this.defeatBoss();
      return;
    }
    const counter = document.getElementById("boss-line-counter");
    const textEl  = document.getElementById("boss-text-current");
    if (counter) counter.textContent = `Line ${this.bossCurrentLine + 1} / ${this.bossLines.length}`;
    if (textEl)  textEl.textContent  = this.bossLines[this.bossCurrentLine].trimStart();
    this.updateBossHealthDots();
    this.floater(px, py - 40, "LINE CLEARED!", "#b9f0a3");
  }

  defeatBoss() {
    const pts = Math.round(
      ENEMY_BASE_SCORE * BOSS_SCORE_MULTIPLIER * this.scoreMultiplier * this.bossScoreMultiplier
    );
    this.addScore(pts);
    this.isBoss = false;
    this.totalWavesSurvived++;
    this.playSound("bossDefeat");

    const px = this.canvasW / 2, py = this.canvasH * 0.35;
    for (let k = 0; k < 4; k++) {
      setTimeout(() => {
        this.spawnBurst(px + (Math.random() - 0.5) * 120, py + (Math.random() - 0.5) * 80, "#ff6666", 20);
        this.shake(10);
        this.flashScreen("green");
      }, k * 150);
    }
    this.floater(px, py - 60, `+${pts} BOSS SLAIN!`, "#ffd700");

    if (this.bossEl) {
      this.bossEl.classList.add("dissolving");
      setTimeout(() => { if (this.bossEl && this.bossEl.parentNode) this.bossEl.remove(); this.bossEl = null; }, 600);
    }

    this.completedLineIndices = new Set(this.snippet.lines.map((_, i) => i));
    this.renderCodePanel();

    setTimeout(() => this.showWaveFeedback(), 900);
  }

  bossTimerExpired() {
    if (!this.isBoss) return;
    this.lives--;
    this.updateHUD();
    this.playSound("lifeLoss");
    this.shake(20);
    this.flashScreen("red");
    this.breakCombo();
    this.floater(this.canvasW / 2, this.canvasH / 2, "TIME'S ALMOST UP!", "#ff4444");

    if (this.lives <= 0) { this.endRun(); return; }
    this.bossTimer = this.bossTimerMax * 0.55;
  }

  // ── WAVE END ───────────────────────────────────────────────────────────────

  showWaveFeedback() {
    const elapsed  = (Date.now() - this.waveStartTime) / 1000;
    const mins     = elapsed / 60;
    const allChars = this.snippet.lines.join("").length;
    const wpm      = mins > 0 ? Math.round((allChars / 5) / mins) : 0;
    const acc      = this.totalCharsThisWave > 0
      ? Math.min(100, Math.round((this.correctCharsThisWave / this.totalCharsThisWave) * 100))
      : 100;

    document.getElementById("feedback-wpm").textContent      = wpm;
    document.getElementById("feedback-accuracy").textContent = `${acc}%`;

    const mistakeEl = document.getElementById("feedback-mistakes");
    mistakeEl.innerHTML = "";
    if (this.mistakesThisWave.length === 0) {
      mistakeEl.innerHTML = '<div class="no-mistakes">Perfect wave! No mistakes.</div>';
    } else {
      const counts = {};
      this.mistakesThisWave.forEach(m => {
        const k = `${m.expected} → ${m.typed}`;
        counts[k] = (counts[k] || 0) + 1;
      });
      Object.entries(counts).slice(0, 8).forEach(([k, c]) => {
        const d = document.createElement("div");
        d.className = "mistake-item";
        d.innerHTML = `<span class="mistake-chars">${this.esc(k)}</span> <span class="mistake-count">×${c}</span>`;
        mistakeEl.appendChild(d);
      });
    }

    this.showScreen("waveFeedback");
    this.feedbackTimer = setTimeout(() => this.showUpgrades(), 4000);
    document.getElementById("feedback-continue-btn").onclick = () => {
      clearTimeout(this.feedbackTimer);
      this.showUpgrades();
    };
  }

  showUpgrades() {
    const available = UPGRADES.filter(u =>
      !this.upgrades.find(o => o.id === u.id) || u.id === "extra_life" || u.id === "calm_aura"
    );
    const chosen = available.sort(() => Math.random() - 0.5).slice(0, 3);
    const container = document.getElementById("upgrade-cards");
    container.innerHTML = "";
    chosen.forEach(upg => {
      const card = document.createElement("div");
      card.className = "upgrade-card";
      card.innerHTML = `
        <div class="upgrade-icon">${upg.icon}</div>
        <div class="upgrade-name">${upg.name}</div>
        <div class="upgrade-desc">${upg.description}</div>`;
      card.addEventListener("click", () => this.pickUpgrade(upg));
      container.appendChild(card);
    });
    this.showScreen("upgrade");
  }

  pickUpgrade(upg) {
    this.upgrades.push({ id: upg.id, name: upg.name, icon: upg.icon });
    upg.effect(this);
    this.updateUpgradeHud();
    this.startNextWave();
  }

  updateUpgradeHud() {
    this.upgradesHud.innerHTML = "";
    if (this.upgrades.length === 0) { this.upgradesHud.style.display = "none"; return; }
    this.upgradesHud.style.display = "flex";
    this.upgrades.forEach(u => {
      const el = document.createElement("div");
      el.className = "upgrade-hud-item";
      el.innerHTML = `<span class="upgrade-hud-icon">${u.icon}</span><span class="upgrade-hud-name">${u.name}</span>`;
      this.upgradesHud.appendChild(el);
    });
  }

  // ── HUD ────────────────────────────────────────────────────────────────────

  addScore(pts) {
    this.score += pts;
    this.animScore();
  }

  animScore() {
    const target = this.score, start = this.displayedScore, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / 300, 1);
      this.displayedScore = Math.round(start + (target - start) * p);
      this.scoreDisplay.textContent = this.displayedScore.toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  updateHUD() {
    this.livesDisplay.innerHTML = "";
    for (let i = 0; i < this.lives; i++) {
      const h = document.createElement("span");
      h.className  = "life-heart";
      h.textContent = "🖤";
      this.livesDisplay.appendChild(h);
    }
    this.scoreDisplay.textContent = this.displayedScore.toLocaleString();
    this.waveDisplay.textContent  = `Wave ${this.wave}`;
  }

  // ── COMBO ──────────────────────────────────────────────────────────────────

  addCombo() {
    this.combo++;
    this.comboDecay = 3.5;
    if (this.comboDisplay) {
      this.comboDisplay.style.display = "flex";
      this.comboValue.textContent = `×${this.combo}`;
      const pct = Math.min(this.combo / 20, 1) * 100;
      this.comboBar.style.width = pct + "%";
    }
  }

  breakCombo() {
    if (this.combo > 4) {
      this.floater(this.canvasW / 2, this.canvasH - 90, "COMBO BREAK", "#ff6b6b");
    }
    this.combo = 0;
    this.comboDecay = 0;
    if (this.comboBar) this.comboBar.style.width = "0%";
  }

  // ── FX ─────────────────────────────────────────────────────────────────────

  flashScreen(cls = "") {
    if (!this.flashOverlay) return;
    this.flashOverlay.className = "flash-overlay " + cls + " on";
    setTimeout(() => this.flashOverlay.classList.remove("on"), 90);
  }

  shake(amount) {
    this.shakeAmount = Math.max(this.shakeAmount, amount);
  }

  doEnemyShake(el) {
    el.classList.remove("shake-enemy");
    void el.offsetWidth;
    el.classList.add("shake-enemy");
    setTimeout(() => el.classList.remove("shake-enemy"), 320);
  }

  spawnBurst(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 360,
        vy: (Math.random() - 0.5) * 360 - 60,
        life: 0.35 + Math.random() * 0.55,
        age: 0,
        color,
        size: 1.5 + Math.random() * 3
      });
    }
  }

  addBeam(x, y) {
    this.beams.push({ x, y, age: 0, life: 0.22 });
  }

  floater(x, y, text, color = "#fff") {
    const el = document.createElement("div");
    el.className  = "floater";
    el.style.left  = x + "px";
    el.style.top   = y + "px";
    el.style.color = color;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  emitStream(fromX, fromY, color) {
    const codePanel = document.getElementById("code-lines");
    if (!codePanel) return;
    const r  = codePanel.getBoundingClientRect();
    this.streams.push({
      x: fromX, y: fromY,
      tx: r.left + 40, ty: r.top + 30,
      cx: fromX, cy: fromY,
      age: 0, life: 0.6, color
    });
  }

  // ── MENU DEMO ──────────────────────────────────────────────────────────────

  startMenuDemo() {
    this.menuTokens = [];
    this.menuTimer  = 0.3;
  }

  stopMenuDemo() {
    this.menuTokens = [];
  }

  updateMenuDemo(dt) {
    this.menuTimer -= dt;
    if (this.menuTimer <= 0 && this.menuTokens.length < 16) {
      this.menuTimer = 0.4 + Math.random() * 0.7;
      const text  = MENU_SAMPLES[Math.floor(Math.random() * MENU_SAMPLES.length)];
      const color = MENU_PALETTE[Math.floor(Math.random() * MENU_PALETTE.length)];
      this.menuTokens.push({
        x: 60 + Math.random() * (this.canvasW - 120),
        y: -30,
        vy: 14 + Math.random() * 22,
        text, color,
        typed: 0,
        typeAt: performance.now() / 1000 + 0.5 + Math.random() * 1.8,
        typeStep: 0.07 + Math.random() * 0.1,
        dying: false, deathAge: 0
      });
    }
    const now = performance.now() / 1000;
    for (const t of this.menuTokens) {
      t.y += t.vy * dt;
      if (t.dying) {
        t.deathAge += dt;
      } else if (now > t.typeAt && t.typed < t.text.length) {
        t.typed++;
        t.typeAt = now + t.typeStep;
        if (t.typed >= t.text.length) { t.dying = true; t.deathAge = 0; }
      }
    }
    this.menuTokens = this.menuTokens.filter(t =>
      (!t.dying || t.deathAge < 0.6) && t.y < this.canvasH + 50
    );
  }

  // ── GAME LOOP ──────────────────────────────────────────────────────────────

  startLoop() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  update(dt) {
    this.shakeAmount *= 0.84;

    if (this.screen === "menu") {
      this.updateMenuDemo(dt);
      return;
    }
    if (this.screen !== "game" || this.paused) return;

    if (this.combo > 0) {
      this.comboDecay -= dt;
      if (this.comboDecay <= 0) {
        this.combo = Math.max(0, this.combo - 1);
        this.comboDecay = 0.55;
        if (this.comboBar) this.comboBar.style.width = Math.min(this.combo / 20, 1) * 100 + "%";
        if (this.comboValue) this.comboValue.textContent = `×${this.combo}`;
        if (this.combo === 0 && this.comboDisplay) this.comboDisplay.style.display = "none";
      }
    }

    if (!this.isBoss) this.updateEnemies(dt);

    if (this.isBoss) {
      this.bossTimer -= dt;
      if (this.bossTimer <= 0) this.bossTimerExpired();
    }

    for (const p of this.particles) {
      p.age += dt;
      p.vy  += 260 * dt;
      p.x   += p.vx * dt;
      p.y   += p.vy * dt;
    }
    this.particles = this.particles.filter(p => p.age < p.life);

    for (const b of this.beams) b.age += dt;
    this.beams = this.beams.filter(b => b.age < b.life);

    for (const s of this.streams) {
      s.age += dt;
      const t = Math.min(s.age / s.life, 1);
      s.cx = s.x + (s.tx - s.x) * t * t;
      s.cy = s.y + (s.ty - s.y) * t * t;
    }
    this.streams = this.streams.filter(s => s.age < s.life);
  }

  updateEnemies(dt) {
    const arenaR = this.arena.getBoundingClientRect();
    const cx     = arenaR.left + arenaR.width  / 2;
    const cy     = arenaR.top  + arenaR.height / 2;
    const kill   = 44;

    this.enemies.forEach(e => {
      if (e.defeated) return;
      const dx   = cx - (arenaR.left + e.x);
      const dy   = cy - (arenaR.top  + e.y);
      const dist = Math.hypot(dx, dy);
      if (dist < 1) return;
      const spd = BASE_SPEED * this.fallSpeedMultiplier * dt;
      e.x += (dx / dist) * spd;
      e.y += (dy / dist) * spd;
      e.element.style.left = e.x + "px";
      e.element.style.top  = e.y + "px";
      if (dist < kill) this.enemyReachedPlayer(e);
    });
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasW, this.canvasH);

    if (this.screen === "menu") {
      this.renderMenuDemo();
      return;
    }

    ctx.save();
    if (this.shakeAmount > 0.5) {
      ctx.translate(
        (Math.random() - 0.5) * this.shakeAmount * 2,
        (Math.random() - 0.5) * this.shakeAmount * 2
      );
    }

    const pr = this.player ? this.player.getBoundingClientRect() : null;
    if (pr) {
      const px = pr.left + pr.width  / 2;
      const py = pr.top  + pr.height / 2;

      for (const b of this.beams) {
        const a = 1 - b.age / b.life;
        ctx.strokeStyle = `rgba(155,231,255,${a * 0.9})`;
        ctx.lineWidth   = 2 + a * 3;
        ctx.shadowColor = "rgba(155,231,255,0.6)";
        ctx.shadowBlur  = 8 * a;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    for (const p of this.particles) {
      const a = 1 - p.age / p.life;
      ctx.fillStyle    = p.color;
      ctx.globalAlpha  = a;
      ctx.shadowColor  = p.color;
      ctx.shadowBlur   = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;

    for (const s of this.streams) {
      const t = Math.min(s.age / s.life, 1);
      ctx.fillStyle   = s.color;
      ctx.globalAlpha = (1 - t) * 0.9;
      ctx.shadowColor = s.color;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(s.cx, s.cy, Math.max(0.5, 4 - t * 3.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = (1 - t) * 0.4;
      ctx.lineWidth   = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.cx, s.cy);
      ctx.stroke();
    }
    ctx.shadowBlur  = 0;
    ctx.globalAlpha = 1;

    if (this.isBoss) this.renderBossRing();

    ctx.restore();
  }

  renderBossRing() {
    if (!this.bossEl) return;
    const rect = this.bossEl.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height * 0.28;
    const r    = 54;
    const frac = Math.max(0, this.bossTimer / this.bossTimerMax);
    const hue  = frac * 120; // green → red

    const ctx  = this.ctx;
    ctx.save();

    // Track (background ring)
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth   = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Fill
    ctx.strokeStyle = `hsla(${hue},100%,55%,0.85)`;
    ctx.lineWidth   = 5;
    ctx.shadowColor = `hsla(${hue},100%,55%,0.6)`;
    ctx.shadowBlur  = 10;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Time label
    const secs = Math.ceil(this.bossTimer);
    ctx.fillStyle   = frac < 0.25 ? "#ff4444" : "#ddd";
    ctx.globalAlpha = 0.9;
    ctx.font        = `bold 16px monospace`;
    ctx.textAlign   = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(secs + "s", cx, cy + r + 16);
    ctx.globalAlpha = 1;

    ctx.restore();
  }

  renderMenuDemo() {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = "600 14px ui-monospace, monospace";

    for (const t of this.menuTokens) {
      const fadeIn = Math.min(t.y / 60, 1);
      let alpha = 0.42 * fadeIn;
      let scale = 1;
      if (t.dying) {
        const k = Math.min(t.deathAge / 0.6, 1);
        alpha = 0.42 * (1 - k);
        scale = 1 + k * 0.7;
      }
      if (alpha < 0.02) continue;

      const tw = ctx.measureText(t.text).width;
      const w  = (tw + 16) * scale;
      const h  = 22 * scale;

      ctx.globalAlpha  = alpha;
      ctx.fillStyle    = "#0e1420";
      ctx.strokeStyle  = t.color;
      ctx.lineWidth    = 1;
      this.roundRect(ctx, t.x - w / 2, t.y - h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign    = "left";
      ctx.textBaseline = "middle";
      const typed = t.text.slice(0, t.typed);
      const rest  = t.text.slice(t.typed);
      let cur     = t.x - tw / 2;
      ctx.fillStyle = t.color;
      ctx.fillText(typed, cur, t.y);
      cur += ctx.measureText(typed).width;
      ctx.fillStyle = "#5a6478";
      ctx.fillText(rest, cur, t.y);
    }
    ctx.globalAlpha  = 1;
    ctx.restore();
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  // ── PAUSE / END ────────────────────────────────────────────────────────────

  togglePause() {
    if (this.screen !== "game" && !this.paused) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.screens.pause.classList.add("active");
      this.inputField.blur();
    } else {
      this.screens.pause.classList.remove("active");
      if (this.screen === "game") this.inputField.focus();
    }
  }

  quitRun() {
    this.paused = false;
    this.screens.pause.classList.remove("active");
    this.endRun();
  }

  endRun() {
    const acc    = this.typedChars > 0
      ? Math.min(100, Math.round((this.correctChars / this.typedChars) * 100))
      : 100;
    const runSec = (Date.now() - this.runStartTime) / 1000;
    const wpm    = runSec > 0 ? Math.round((this.typedChars / 5) / (runSec / 60)) : 0;

    document.getElementById("stats-accuracy").textContent = `${acc}%`;
    document.getElementById("stats-wpm").textContent      = wpm;
    document.getElementById("stats-waves").textContent    = this.totalWavesSurvived;
    document.getElementById("stats-score").textContent    = this.score.toLocaleString();
    document.getElementById("stats-formula").textContent  =
      `Score = (enemies ×${ENEMY_BASE_SCORE} + bosses ×${ENEMY_BASE_SCORE * BOSS_SCORE_MULTIPLIER}) × upgrades`;

    this.showScreen("stats");
  }

  restart() {
    this.arena.querySelectorAll(".enemy").forEach(e => e.remove());
    this.rayLayer.innerHTML = "";
    this.particles = [];
    this.beams     = [];
    this.streams   = [];
    this.showScreen("menu");
    this.startMenuDemo();
  }

  // ── AUDIO ──────────────────────────────────────────────────────────────────

  playSound(type) {
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      const t = ctx.currentTime;
      switch (type) {
        case "defeat":
          osc.type = "sine";
          osc.frequency.setValueAtTime(900, t);
          osc.frequency.exponentialRampToValueAtTime(220, t + 0.28);
          gain.gain.setValueAtTime(0.13, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          osc.start(); osc.stop(t + 0.28);
          break;
        case "lifeLoss":
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(280, t);
          osc.frequency.exponentialRampToValueAtTime(70, t + 0.5);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.start(); osc.stop(t + 0.5);
          break;
        case "bossEntry":
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(110, t);
          osc.frequency.exponentialRampToValueAtTime(55, t + 1.4);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
          osc.start(); osc.stop(t + 1.4);
          break;
        case "bossDefeat":
          osc.type = "square";
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.exponentialRampToValueAtTime(720, t + 0.18);
          osc.frequency.exponentialRampToValueAtTime(1000, t + 0.4);
          gain.gain.setValueAtTime(0.14, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.start(); osc.stop(t + 0.5);
          break;
      }
    } catch (_) {}
  }

  // ── UTILS ──────────────────────────────────────────────────────────────────

  esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
}

window.addEventListener("DOMContentLoaded", () => { window.game = new Game(); });
