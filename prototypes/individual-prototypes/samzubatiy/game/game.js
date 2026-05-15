/* ============================================================
 * COMPILE OR DIE — typing roguelite
 * ============================================================
 * Loop: each wave picks a study function. Falling enemies are
 * word-chunks from that function — destroy them to "study" the
 * function (it lights up in the builder panel as you type).
 *
 * End of wave: a RECALL CHALLENGE mini-boss spawns. The full
 * function appears, a timer ring counts down, and you must
 * type the function back from memory line-by-line. Beat the
 * timer or take a hit.
 *
 * Hard rule (still): an enemy only dies on full token completion.
 * ============================================================ */

(() => {
  'use strict';

  // ----- elements -----
  const stage   = document.getElementById('stage');
  const canvas  = document.getElementById('game');
  const ctx     = canvas.getContext('2d');
  const typebox = document.getElementById('typebox');
  const flash   = document.getElementById('flash');

  const elLives = document.getElementById('lives');
  const elWave  = document.getElementById('wave');
  const elScore = document.getElementById('score');
  const elCombo = document.getElementById('combo');
  const elPack  = document.getElementById('pack');
  const elComboBar = document.getElementById('combobar');

  const fnBuilder = document.getElementById('fn-builder');
  const fnbName   = fnBuilder.querySelector('.fnb-name .nm');
  const fnbGlyph  = fnBuilder.querySelector('.fnb-name .glyph');
  const fnbProg   = fnBuilder.querySelector('.fnb-progress');
  const fnbBar    = fnBuilder.querySelector('.fnb-bar > div');
  const fnbCode   = fnBuilder.querySelector('.fnb-code');

  const mbRoot     = document.getElementById('miniboss');
  const mbFnName   = mbRoot.querySelector('.mb-fn-name');
  const mbCore     = mbRoot.querySelector('.mb-ring .core');
  const mbRing     = mbRoot.querySelector('.mb-ring');
  const mbRingFill = document.getElementById('mb-ring-fill');
  const mbCode     = mbRoot.querySelector('.mb-code');

  const ovStart   = document.getElementById('overlay-start');
  const ovUpgrade = document.getElementById('overlay-upgrade');
  const ovGameover= document.getElementById('overlay-gameover');
  const packGrid  = document.getElementById('pack-grid');
  const upgradeGrid = document.getElementById('upgrade-grid');
  const upgradeWaveLabel = document.getElementById('upgrade-wave');
  const finalStats = document.getElementById('final-stats');

  // ----- canvas sizing (DPR-aware) -----
  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    const r = stage.getBoundingClientRect();
    W = Math.max(320, r.width);
    H = Math.max(400, r.height);
    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);

  // ----- game state -----
  const G = {
    state: 'menu',     // menu | playing | miniboss | upgrade | gameover
    enabledPacks: ['html'],
    wave: 0,
    score: 0,
    lives: 3,
    shields: 0,
    combo: 0,
    comboBest: 0,
    comboDecay: 0,
    enemies: [],
    particles: [],
    beams: [],
    streams: [],         // chunk-to-builder particle streams
    spawnTimer: 0,
    waveSpawnQueue: [],
    waveActive: false,
    waveKilled: 0,
    typosThisToken: 0,
    timeScale: 1,
    timeScaleUntil: 0,
    shake: 0,            // canvas shake amount
    active: null,

    studyFn: null,       // {pack, name, code, lit[lineIdx]:Set<col>, color}
    miniboss: null,      // recall-phase state

    stats: {
      fallSpeed: 1.00,
      spawnRate: 1.00,
      typoForgiveness: 0,
      splashRadius: 0,
      chainCount: 0,
      shieldsPerWave: 0,
      comboGain: 1,
      categoryBonus: {},
      autoTarget: false,
      letterPowers: [],
      scoreMultiplier: 1.0,
      recallBonus: 1.0,    // multiplier on recall-clear bonus
      recallTimeBonus: 0,  // extra seconds on recall timer
    },
    appliedUpgrades: [],
    recentFns: [],         // study-fn ids (`pid::name`) used recently
  };

  // ====== utility ======
  const rand   = (a, b) => a + Math.random() * (b - a);
  const irand  = (a, b) => Math.floor(rand(a, b));
  const choice = arr => arr[(Math.random() * arr.length) | 0];
  const clamp  = (v, a, b) => Math.max(a, Math.min(b, v));
  const now    = () => performance.now() / 1000;

  function floater(x, y, text, color = '#fff') {
    const el = document.createElement('div');
    el.className = 'floater';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.color = color;
    el.textContent = text;
    stage.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  function flashScreen(cls = '') {
    flash.classList.remove('green', 'cyan');
    if (cls) flash.classList.add(cls);
    flash.classList.add('on');
    setTimeout(() => flash.classList.remove('on'), 90);
  }
  function shake(amount) { G.shake = Math.max(G.shake, amount); }

  // ====== pack picker ======
  function buildPackPicker() {
    packGrid.innerHTML = '';
    Object.entries(window.PACKS).forEach(([id, pack]) => {
      const card = document.createElement('button');
      const on = G.enabledPacks.includes(id);
      card.className = 'pack-card' + (on ? ' on' : '');
      card.style.setProperty('--pack-color', pack.color);
      const fnCount = pack.functions.length;
      card.innerHTML = `
        <div class="check"></div>
        <div class="glyph" style="color:${pack.color}">${pack.glyph}</div>
        <div class="nm">${pack.name}</div>
        <div class="tg">${pack.tagline}</div>
        <div class="meta">${fnCount} functions</div>`;
      card.addEventListener('click', () => {
        const i = G.enabledPacks.indexOf(id);
        if (i >= 0) {
          if (G.enabledPacks.length === 1) return;
          G.enabledPacks.splice(i, 1);
        } else G.enabledPacks.push(id);
        buildPackPicker();
      });
      packGrid.appendChild(card);
    });
  }

  // ====== study function selection + chunk extraction ======
  function pickStudyFunction(waveNum) {
    // Tier scales with wave. Earlier waves prefer easier functions but
    // we always allow ±1 tier so a small pool can't get stuck repeating.
    const wantTier =
      waveNum < 3 ? 1 :
      waveNum < 5 ? 2 :
      (Math.random() < 0.7 ? 3 : 2);

    // Score every fn by tier proximity, then weight by inverse-recency.
    const all = [];
    G.enabledPacks.forEach(pid => {
      const pack = window.PACKS[pid];
      pack.functions.forEach(fn => {
        const dt = Math.abs((fn.tier || 1) - wantTier);
        // weight: same-tier 6, ±1 tier 2, ±2 tier 0.5
        const tierW = dt === 0 ? 6 : dt === 1 ? 2 : 0.5;
        const id = pid + '::' + fn.name;
        const recencyIdx = G.recentFns.indexOf(id);
        // recent picks get severely down-weighted (last pick → ~0)
        const recW = recencyIdx < 0 ? 1 : (recencyIdx + 1) / (G.recentFns.length + 1) * 0.15;
        all.push({ pid, fn, id, w: tierW * recW });
      });
    });
    if (all.length === 0) return null;

    let total = all.reduce((a, c) => a + c.w, 0);
    if (total <= 0) total = all.length, all.forEach(c => c.w = 1);
    let r = Math.random() * total;
    let pick = all[0];
    for (const c of all) { r -= c.w; if (r <= 0) { pick = c; break; } }

    // remember this pick so the next 3 waves prefer something else
    G.recentFns.unshift(pick.id);
    if (G.recentFns.length > 4) G.recentFns.pop();
    const pack = window.PACKS[pick.pid];
    return {
      pack: pick.pid,
      color: pack.color,
      glyph: pack.glyph,
      name: pick.fn.name,
      code: pick.fn.code.slice(),
      // Pre-light lines that contain no alphanumeric chars (`}`, `});`, etc.)
      // since those won't ever be reached by chunk-typing.
      lit: pick.fn.code.map(line => {
        const arr = new Array(line.length).fill(false);
        if (!/[a-zA-Z0-9]/.test(line)) {
          for (let i = 0; i < arr.length; i++) arr[i] = true;
        }
        return arr;
      }),
    };
  }

  // Split a line into typeable chunks. We split on whitespace and then
  // keep only chunks that contain at least 2 alphanumeric characters —
  // pure-punctuation tokens like `[{`, `}],`, `=>` aren't fun to chase
  // and don't teach anything, so they get dropped from the spawn pool.
  // The function-builder visual still illuminates surrounding punctuation
  // when an adjacent word-chunk is typed (see illuminateChunk).
  function lineToChunks(line) {
    const stripped = line.replace(/^\s+/, '');
    if (!stripped) return [];
    const raw = stripped.split(/\s+/).filter(Boolean);
    return raw.filter(chunk => {
      const letters = (chunk.match(/[a-zA-Z0-9]/g) || []).length;
      return letters >= 2;
    });
  }

  function buildWaveQueue(studyFn, count, fallMul, waveNum) {
    const pool = [];
    studyFn.code.forEach((line, li) => {
      lineToChunks(line).forEach(chunk => {
        pool.push({ text: chunk, line: li });
      });
    });
    if (pool.length === 0) {
      pool.push({ text: studyFn.name, line: 0 });
    }
    const shuffled = pool.slice().sort(() => Math.random() - 0.5);

    // Ramp in spawn cadence + fall speed for the first couple of waves
    // so wave 1 feels more like a tutorial than a stress test.
    const delayMin = waveNum === 1 ? 1.10 : waveNum === 2 ? 0.85 : 0.55;
    const delayMax = waveNum === 1 ? 1.65 : waveNum === 2 ? 1.30 : 1.05;
    const speedLo  = waveNum === 1 ? 26 : waveNum === 2 ? 32 : 38;
    const speedHi  = waveNum === 1 ? 40 : waveNum === 2 ? 50 : 62;

    const queue = [];
    let i = 0;
    while (queue.length < count) {
      queue.push({
        text: shuffled[i % shuffled.length].text,
        lineHint: shuffled[i % shuffled.length].line,
        delay: rand(delayMin, delayMax) / G.stats.spawnRate,
        fallSpeed: rand(speedLo, speedHi) * fallMul * G.stats.fallSpeed,
      });
      i++;
    }
    return queue;
  }

  // ====== function builder (study panel) UI ======
  function showFnBuilder(fn) {
    fnbGlyph.textContent = fn.glyph;
    fnbGlyph.style.color = fn.color;
    fnbName.textContent  = fn.name + '()';
    fnbName.style.color  = fn.color;
    fnBuilder.style.color = fn.color;
    fnbProg.textContent = '0%';
    fnbBar.style.width = '0%';
    fnbCode.innerHTML = '';
    fn.code.forEach((line, li) => {
      const lineEl = document.createElement('div');
      for (let ci = 0; ci < line.length; ci++) {
        const span = document.createElement('span');
        // Pre-lit punctuation-only lines render in pack color from the start.
        span.className = 'ch' + (fn.lit[li][ci] ? ' lit' : '');
        span.textContent = line[ci] === ' ' ? ' ' : line[ci];
        span.dataset.li = li;
        span.dataset.ci = ci;
        lineEl.appendChild(span);
      }
      fnbCode.appendChild(lineEl);
    });
    fnBuilder.classList.remove('hidden');
    updateFnProgress();
  }
  function hideFnBuilder() {
    fnBuilder.classList.add('hidden');
  }
  function lightChars(li, ci, len) {
    const lineEl = fnbCode.children[li];
    if (!lineEl) return null;
    let firstCharRect = null;
    for (let k = 0; k < len; k++) {
      const span = lineEl.children[ci + k];
      if (span && !span.classList.contains('lit')) {
        span.classList.remove('lit');
        // restart animation
        void span.offsetWidth;
        span.classList.add('lit');
        if (!firstCharRect) firstCharRect = span.getBoundingClientRect();
      }
    }
    return firstCharRect;
  }

  // After completing a chunk, find the next unlit occurrence of the chunk
  // text in the function and light it up. Returns the screen-space anchor
  // for the streaming-particles effect.
  function illuminateChunk(chunkText) {
    const fn = G.studyFn;
    if (!fn) return null;
    for (let li = 0; li < fn.code.length; li++) {
      const line = fn.code[li];
      let from = 0;
      while (true) {
        const idx = line.indexOf(chunkText, from);
        if (idx < 0) break;
        // check if any char in this region is unlit
        let hasUnlit = false;
        for (let k = 0; k < chunkText.length; k++) {
          if (!fn.lit[li][idx + k]) { hasUnlit = true; break; }
        }
        if (hasUnlit) {
          // Extend the lit range to absorb adjacent punctuation on either
          // side (until we hit whitespace or another word). This way
          // typing `messages` also lights up the surrounding `[{` / `}]`
          // so the builder progress doesn't stall on dropped chunks.
          const isPunct = c => c && /[^a-zA-Z0-9\s]/.test(c);
          let left = idx;
          while (left > 0 && isPunct(line[left - 1])) left--;
          let right = idx + chunkText.length;
          while (right < line.length && isPunct(line[right])) right++;
          for (let k = left; k < right; k++) fn.lit[li][k] = true;
          const anchor = lightChars(li, left, right - left);
          updateFnProgress();
          return anchor;
        }
        from = idx + 1;
      }
    }
    // chunk not found in function (shouldn't happen) — partial credit
    return null;
  }
  function updateFnProgress() {
    const fn = G.studyFn;
    if (!fn) return;

    // Auto-light: once every alphanumeric char on a line is lit, light
    // the remaining punctuation/structural chars too. This way typing
    // `function sum(arr)` also lights the trailing `{` on that line.
    for (let li = 0; li < fn.code.length; li++) {
      const line = fn.code[li];
      let hasAlnum = false, allAlnumLit = true;
      for (let ci = 0; ci < line.length; ci++) {
        if (/[a-zA-Z0-9]/.test(line[ci])) {
          hasAlnum = true;
          if (!fn.lit[li][ci]) { allAlnumLit = false; break; }
        }
      }
      if (hasAlnum && allAlnumLit) {
        for (let ci = 0; ci < line.length; ci++) {
          if (!/\s/.test(line[ci]) && !fn.lit[li][ci]) {
            fn.lit[li][ci] = true;
            const lineEl = fnbCode.children[li];
            if (lineEl && lineEl.children[ci]) {
              lineEl.children[ci].classList.add('lit');
            }
          }
        }
      }
    }

    // Don't count whitespace toward progress — it can't be illuminated
    // and would prevent the bar from ever reaching 100%.
    let total = 0, lit = 0;
    for (let li = 0; li < fn.code.length; li++) {
      const line = fn.code[li];
      for (let ci = 0; ci < line.length; ci++) {
        if (/\s/.test(line[ci])) continue;
        total++;
        if (fn.lit[li][ci]) lit++;
      }
    }
    const pct = total ? Math.round((lit / total) * 100) : 0;
    fnbProg.textContent = pct + '%';
    fnbBar.style.width = pct + '%';
  }

  // ====== chunk-to-builder particle stream ======
  function emitStreamToBuilder(fromX, fromY, color) {
    // Stream destination = top-right corner of screen near builder anchor.
    const r = fnBuilder.getBoundingClientRect();
    const stageR = stage.getBoundingClientRect();
    const tx = r.left - stageR.left + 30;
    const ty = r.top  - stageR.top  + 30;
    G.streams.push({
      x: fromX, y: fromY,
      tx, ty,
      age: 0, life: 0.55,
      color,
    });
  }

  // ====== wave lifecycle ======
  function planWave(n) {
    const isBoss = n > 0 && n % 5 === 0;
    // Gentle ramp-in for the first two waves.
    const fallMul =
      n === 1 ? 0.65 :
      n === 2 ? 0.85 :
      1 + (n - 2) * 0.05;
    const count =
      n === 1 ? 6 :
      n === 2 ? 8 :
      Math.round(8 + n * 2);
    return { isBoss, count, fallMul };
  }

  function startWave() {
    G.wave += 1;
    const plan = planWave(G.wave);
    G.waveActive = true;
    G.waveKilled = 0;
    G.shields += G.stats.shieldsPerWave;
    G.studyFn = pickStudyFunction(G.wave);
    G.waveSpawnQueue = buildWaveQueue(G.studyFn, plan.count, plan.fallMul, G.wave);
    // First spawn gets a little extra grace so the player isn't ambushed.
    G.spawnTimer = G.wave === 1 ? 1.2 : 0.4;

    showFnBuilder(G.studyFn);
    elWave.textContent = `WAVE ${G.wave} • ${G.studyFn.name}()` + (plan.isBoss ? ' • BOSS' : '');
  }

  // ====== enemies ======
  function spawnEnemy(item) {
    // Clamp spawn so the rendered capsule never overlaps the screen edge.
    // Use the actual measured text width — char widths vary by glyph, and
    // long tokens used to spawn half-offscreen.
    ctx.font = '600 16px ui-monospace, monospace';
    const tokenW = ctx.measureText(item.text).width;
    const halfCapsule = tokenW / 2 + 14;          // 9px font padding + 5px breathing room
    const margin = 8;
    let minX = halfCapsule + margin;
    let maxX = W - halfCapsule - margin;
    if (maxX < minX) {
      // token wider than screen — center it (rare but possible on phones)
      minX = maxX = W / 2;
    }
    const x = rand(minX, maxX);
    G.enemies.push({
      kind: 'enemy',
      x, y: -20,
      vy: item.fallSpeed,
      token: item.text,
      pack: G.studyFn ? G.studyFn.pack : 'html',
      color: G.studyFn ? G.studyFn.color : '#fff',
      lineHint: item.lineHint || 0,
      typed: 0,
      dying: false,
      shake: 0,
      birth: now(),
    });
  }

  // ====== input handling ======
  function pickActiveByChar(ch) {
    const candidates = G.enemies.filter(e => !e.dying && e.token[0] === ch);
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.y - a.y);
    return candidates[0];
  }

  function handleChar(ch) {
    if (G.state === 'miniboss') return mbHandleChar(ch);
    if (G.state !== 'playing') return;

    if (G.active && !G.active.dying && G.active.kind === 'enemy') {
      const need = G.active.token[G.active.typed];
      if (need === ch) {
        G.active.typed += 1;
        chargeLetterPowers(ch);
        if (G.active.typed >= G.active.token.length) completeEnemy(G.active);
      } else {
        if (G.stats.typoForgiveness > G.typosThisToken) {
          G.typosThisToken += 1;
          G.active.shake = 0.4;
          floater(G.active.x, G.active.y - 20, 'OOPS', '#ffd866');
        } else {
          breakCombo();
          G.active.shake = 0.6;
          G.active = null;
          G.typosThisToken = 0;
        }
      }
    } else {
      const e = pickActiveByChar(ch);
      if (e) {
        G.active = e;
        e.typed = 1;
        G.typosThisToken = 0;
        chargeLetterPowers(ch);
        if (e.typed >= e.token.length) completeEnemy(e);
      } else {
        breakCombo();
      }
    }
  }

  function completeEnemy(e) {
    e.dying = true;
    G.active = null;
    G.typosThisToken = 0;
    G.combo += G.stats.comboGain;
    G.comboDecay = 4.0;
    G.comboBest = Math.max(G.comboBest, G.combo);
    G.waveKilled += 1;

    const cat = G.stats.categoryBonus[e.pack] || 1;
    const base = e.token.length * 8;
    const comboMul = 1 + Math.min(G.combo, 50) * 0.05;
    const gained = Math.round(base * cat * comboMul * G.stats.scoreMultiplier);
    addScore(gained);

    floater(e.x, e.y, '+' + gained, e.color);
    spawnExplosion(e.x, e.y, e.color);
    beam(e.x, e.y);

    illuminateChunk(e.token);
    emitStreamToBuilder(e.x, e.y, e.color);

    if (G.stats.splashRadius > 0) {
      G.enemies.forEach(o => {
        if (o === e || o.dying) return;
        const dx = o.x - e.x, dy = o.y - e.y;
        if (dx * dx + dy * dy < G.stats.splashRadius ** 2) {
          o.dying = true;
          spawnExplosion(o.x, o.y, '#ff7adb');
          illuminateChunk(o.token);
          addScore(20);
        }
      });
    }
    if (G.stats.chainCount > 0) {
      const others = G.enemies
        .filter(o => o !== e && !o.dying)
        .map(o => ({ o, d: (o.x - e.x) ** 2 + (o.y - e.y) ** 2 }))
        .sort((a, b) => a.d - b.d)
        .slice(0, G.stats.chainCount);
      others.forEach(({ o }) => {
        o.dying = true;
        spawnExplosion(o.x, o.y, '#9be7ff');
        illuminateChunk(o.token);
        beam(o.x, o.y);
        addScore(30);
      });
    }
  }

  function breakCombo() {
    if (G.combo > 0) floater(W / 2, H - 80, 'COMBO BREAK', '#ff6b6b');
    G.combo = 0; G.comboDecay = 0;
  }

  function addScore(n) {
    G.score += n;
    elScore.textContent = G.score.toLocaleString();
  }

  // ====== letter powers ======
  function chargeLetterPowers(ch) {
    G.stats.letterPowers.forEach(lp => {
      if (lp.key === ch.toLowerCase()) {
        lp.charge = Math.min(lp.cap, lp.charge + 1);
        if (lp.charge >= lp.cap) {
          lp.fn();
          lp.charge = 0;
          floater(W / 2, 100, lp.name + '!', '#ffd866');
          flashScreen('cyan');
        }
      }
    });
  }

  // ====== particles + beams ======
  function spawnExplosion(x, y, color, count = 14) {
    for (let i = 0; i < count; i++) {
      G.particles.push({
        x, y,
        vx: rand(-180, 180),
        vy: rand(-220, 60),
        life: rand(0.4, 0.9),
        age: 0,
        color,
        size: rand(2, 4),
      });
    }
  }
  function beam(x, y) { G.beams.push({ x, y, age: 0, life: 0.18 }); }

  // ====== life loss ======
  function loseLife() {
    if (G.shields > 0) {
      G.shields -= 1;
      flashScreen('cyan');
      floater(W / 2, H / 2, 'SHIELD', '#9be7ff');
      shake(8);
      return;
    }
    G.lives -= 1;
    elLives.textContent = '♥'.repeat(Math.max(0, G.lives));
    flashScreen();
    shake(14);
    breakCombo();
    if (G.lives <= 0) gameOver();
  }

  function gameOver() {
    G.state = 'gameover';
    hideFnBuilder();
    mbRoot.classList.remove('on');
    finalStats.innerHTML = `
      <div class="stat-row"><span>Final score</span><span>${G.score.toLocaleString()}</span></div>
      <div class="stat-row"><span>Wave reached</span><span>${G.wave}</span></div>
      <div class="stat-row"><span>Best combo</span><span>${G.comboBest}×</span></div>
      <div class="stat-row"><span>Upgrades collected</span><span>${G.appliedUpgrades.length}</span></div>`;
    ovGameover.classList.remove('hidden');
  }

  // ====== UPGRADES ======
  const UPGRADES = [
    { id: 'splash', name: 'Linker Splash', icon: '💥', rarity: 'common',
      desc: 'Token completion destroys nearby enemies in a 60 px radius. Stacks.',
      apply: () => { G.stats.splashRadius = Math.max(60, G.stats.splashRadius + 35); } },
    { id: 'chain', name: 'Reference Chain', icon: '🔗', rarity: 'rare',
      desc: 'Each completion auto-destroys +1 nearest enemy.',
      apply: () => { G.stats.chainCount += 1; } },
    { id: 'forgive', name: 'Try/Catch', icon: '🛟', rarity: 'common',
      desc: 'Allow +1 typo per token before combo breaks.',
      apply: () => { G.stats.typoForgiveness += 1; } },
    { id: 'slow', name: 'Garbage Collector', icon: '🐢', rarity: 'common',
      desc: 'Enemies fall 15% slower.',
      apply: () => { G.stats.fallSpeed *= 0.85; } },
    { id: 'shield', name: 'Try Block', icon: '🛡️', rarity: 'rare',
      desc: 'Start each wave with +1 shield (blocks one ground hit).',
      apply: () => { G.stats.shieldsPerWave += 1; G.shields += 1; } },
    { id: 'autotarget', name: 'Linter Autocomplete', icon: '🎯', rarity: 'rare',
      desc: 'Lowest enemy is auto-prioritized when typing starts.',
      apply: () => { G.stats.autoTarget = true; } },
    { id: 'combo', name: 'Hot Path JIT', icon: '⚡', rarity: 'rare',
      desc: 'Each kill adds +2 combo instead of +1.',
      apply: () => { G.stats.comboGain += 1; } },
    { id: 'multiplier', name: 'Optimizer Pass', icon: '✨', rarity: 'legendary',
      desc: '+25% score from everything.',
      apply: () => { G.stats.scoreMultiplier *= 1.25; } },
    { id: 'cat-html', name: 'Markup Mastery', icon: '🏷️', rarity: 'common',
      desc: '+50% score on HTML tokens.',
      apply: () => { G.stats.categoryBonus.html = (G.stats.categoryBonus.html || 1) * 1.5; } },
    { id: 'cat-css', name: 'Cascade Mastery', icon: '🎨', rarity: 'common',
      desc: '+50% score on CSS tokens.',
      apply: () => { G.stats.categoryBonus.css = (G.stats.categoryBonus.css || 1) * 1.5; } },
    { id: 'cat-js', name: 'Runtime Mastery', icon: '⚙️', rarity: 'common',
      desc: '+50% score on JavaScript tokens.',
      apply: () => { G.stats.categoryBonus.js = (G.stats.categoryBonus.js || 1) * 1.5; } },
    { id: 'recall-time', name: 'Mental Cache', icon: '🧠', rarity: 'rare',
      desc: '+5 s on every recall-challenge timer.',
      apply: () => { G.stats.recallTimeBonus += 5; } },
    { id: 'recall-bonus', name: 'Eidetic Compiler', icon: '📜', rarity: 'legendary',
      desc: 'Recall clears award 2× score bonus.',
      apply: () => { G.stats.recallBonus *= 2; } },
    { id: 'power-freeze', name: '`f` → Freeze', icon: '❄️', rarity: 'legendary',
      desc: 'Typing the letter f charges Freeze. Full bar = enemies stop for 2 s.',
      apply: () => {
        G.stats.letterPowers.push({
          key: 'f', name: 'FREEZE', charge: 0, cap: 14,
          fn: () => { G.timeScale = 0.05; G.timeScaleUntil = now() + 2; }
        });
      } },
    { id: 'power-zap', name: '`e` → Zap', icon: '⚡', rarity: 'legendary',
      desc: 'Typing the letter e charges Zap. Full bar = kills the 3 lowest enemies.',
      apply: () => {
        G.stats.letterPowers.push({
          key: 'e', name: 'ZAP', charge: 0, cap: 16,
          fn: () => {
            const targets = G.enemies.filter(e => !e.dying)
              .sort((a, b) => b.y - a.y).slice(0, 3);
            targets.forEach(o => {
              o.dying = true;
              spawnExplosion(o.x, o.y, '#ffd866');
              beam(o.x, o.y);
              illuminateChunk(o.token);
              addScore(50);
            });
          }
        });
      } },
  ];

  function offerUpgrades() {
    G.state = 'upgrade';
    upgradeWaveLabel.textContent = `Wave ${G.wave} cleared`;
    upgradeGrid.innerHTML = '';
    const pool = UPGRADES.slice();
    const picks = [];
    while (picks.length < 3 && pool.length > 0) {
      const weights = pool.map(u =>
        u.rarity === 'legendary' ? 1 : u.rarity === 'rare' ? 3 : 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) { idx = i; break; }
      }
      picks.push(pool.splice(idx, 1)[0]);
    }
    picks.forEach(u => {
      const card = document.createElement('button');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <span class="rarity ${u.rarity}">${u.rarity}</span>
        <div class="icon">${u.icon}</div>
        <div class="name">${u.name}</div>
        <div class="desc">${u.desc}</div>`;
      card.addEventListener('click', () => {
        u.apply();
        G.appliedUpgrades.push(u.name);
        ovUpgrade.classList.add('hidden');
        G.state = 'playing';
        startWave();
      });
      upgradeGrid.appendChild(card);
    });
    ovUpgrade.classList.remove('hidden');
  }

  // ====== MINI-BOSS RECALL ======
  // Player must retype the studied function from memory.
  // Whitespace at line starts is auto-skipped. Newlines auto-advance.
  function firstNonSpace(s) { return s.search(/\S/) >= 0 ? s.search(/\S/) : 0; }

  function enterMiniboss() {
    if (!G.studyFn) { offerUpgrades(); return; }
    G.state = 'miniboss';

    const fn = G.studyFn;
    const isBoss = G.wave % 5 === 0;
    const totalChars = fn.code.reduce(
      (sum, line) => sum + (line.length - firstNonSpace(line)), 0);
    const baseTime = clamp(totalChars * 0.55 + 6, 12, 60);
    const time = baseTime * (isBoss ? 0.85 : 1.0) + G.stats.recallTimeBonus;

    G.miniboss = {
      fn, isBoss,
      lineIdx: 0,
      col: firstNonSpace(fn.code[0]),
      timer: time,
      timerMax: time,
      typedChars: 0,
      totalChars,
      errors: 0,
      shakeUntil: 0,
      doneLines: [],
    };

    // Build the DOM. Lines stagger in on a delay (decompile look).
    mbRoot.classList.remove('fail', 'win', 'shake');
    mbRoot.style.color = fn.color;
    mbCore.style.color = fn.color;
    mbRingFill.parentElement.style.color = fn.color;
    mbCore.textContent = fn.glyph;
    mbFnName.textContent = `recall: ${fn.name}()`;

    mbCode.innerHTML = '';
    fn.code.forEach((line, i) => {
      const ml = document.createElement('span');
      ml.className = 'ml' + (i === 0 ? ' cur' : '');
      ml.style.animationDelay = (0.06 * i) + 's';
      ml.dataset.li = i;
      // Render: leading whitespace as plain, rest as span containers
      const lead = line.slice(0, firstNonSpace(line));
      const rest = line.slice(firstNonSpace(line));
      const tSpan = document.createElement('span'); tSpan.className = 'typed';
      const cSpan = document.createElement('span'); cSpan.className = 'cursor';
      const uSpan = document.createElement('span'); uSpan.className = 'untyped';
      uSpan.textContent = rest;
      ml.appendChild(document.createTextNode(lead));
      ml.appendChild(tSpan);
      if (i === 0) ml.appendChild(cSpan);
      ml.appendChild(uSpan);
      mbCode.appendChild(ml);
    });

    mbRingFill.style.strokeDashoffset = '0';
    mbRoot.classList.add('on');
    flashScreen('cyan');
    shake(10);

    // brief hyper-slowdown when recall enters, for drama
    G.timeScale = 0.15;
    G.timeScaleUntil = now() + 0.6;
  }

  function mbRender() {
    const m = G.miniboss;
    if (!m) return;
    // update each line's typed/untyped split
    for (let i = 0; i < m.fn.code.length; i++) {
      const ml = mbCode.children[i];
      if (!ml) continue;
      ml.classList.toggle('cur', i === m.lineIdx && !m.doneLines.includes(i));
      ml.classList.toggle('done', m.doneLines.includes(i));
      if (i === m.lineIdx && !m.doneLines.includes(i)) {
        const line = m.fn.code[i];
        const lead = line.slice(0, firstNonSpace(line));
        const typed = line.slice(firstNonSpace(line), m.col);
        const rest = line.slice(m.col);
        ml.innerHTML = '';
        ml.appendChild(document.createTextNode(lead));
        const t = document.createElement('span'); t.className = 'typed'; t.textContent = typed;
        const c = document.createElement('span'); c.className = 'cursor';
        const u = document.createElement('span'); u.className = 'untyped'; u.textContent = rest;
        ml.appendChild(t); ml.appendChild(c); ml.appendChild(u);
      }
    }
    // ring (691.15 = 2π * 110)
    const frac = clamp(m.timer / m.timerMax, 0, 1);
    mbRingFill.style.strokeDashoffset = String(691.15 * (1 - frac));
    // color shift as time runs out
    if (frac < 0.25) {
      mbRoot.style.color = '#ff3b3b';
      mbCore.style.color = '#ff3b3b';
      mbRoot.classList.add('fail');
    } else {
      mbRoot.style.color = m.fn.color;
      mbCore.style.color = m.fn.color;
      mbRoot.classList.remove('fail');
    }
  }

  function mbHandleChar(ch) {
    const m = G.miniboss;
    if (!m) return;
    if (m.doneLines.length >= m.fn.code.length) return;
    const line = m.fn.code[m.lineIdx];
    const need = line[m.col];
    if (need === ch) {
      m.col += 1;
      m.typedChars += 1;
      chargeLetterPowers(ch);
      if (m.col >= line.length) {
        m.doneLines.push(m.lineIdx);
        m.lineIdx += 1;
        // tiny line-complete pulse
        const ml = mbCode.children[m.lineIdx - 1];
        if (ml) {
          ml.classList.add('done');
          flashScreen('green');
        }
        addScore(40);
        // skip blank-or-leading whitespace on next line
        if (m.lineIdx < m.fn.code.length) {
          m.col = firstNonSpace(m.fn.code[m.lineIdx]);
        } else {
          mbWin();
        }
      }
    } else {
      // typo eats time + shakes
      m.errors += 1;
      m.shakeUntil = now() + 0.3;
      m.timer = Math.max(0, m.timer - 0.6);
      mbRoot.classList.add('shake');
      mbRing.classList.add('shake');
      setTimeout(() => mbRoot.classList.remove('shake'), 300);
      setTimeout(() => mbRing.classList.remove('shake'), 400);
      breakCombo();
      flashScreen();
    }
  }

  function mbWin() {
    const m = G.miniboss;
    if (!m) return;
    const timeLeft = Math.max(0, m.timer);
    const accuracy = m.typedChars / Math.max(1, m.typedChars + m.errors);
    const bonus = Math.round(
      (200 + timeLeft * 30 + accuracy * 200) *
      G.stats.recallBonus * G.stats.scoreMultiplier);
    addScore(bonus);
    floater(W / 2, H / 2, '+' + bonus + ' RECALL', m.fn.color);
    flashScreen('green');
    shake(20);

    // celebratory burst on canvas
    for (let i = 0; i < 80; i++) {
      G.particles.push({
        x: W / 2 + rand(-40, 40),
        y: H / 2 + rand(-30, 30),
        vx: rand(-260, 260), vy: rand(-340, -60),
        life: rand(0.6, 1.2), age: 0,
        color: m.fn.color, size: rand(2, 5),
      });
    }
    mbRoot.classList.add('win');
    setTimeout(() => {
      mbRoot.classList.remove('on', 'win');
      G.miniboss = null;
      hideFnBuilder();
      offerUpgrades();
    }, 700);
  }

  function mbFail() {
    const m = G.miniboss;
    if (!m) return;
    mbRoot.classList.add('fail');
    flashScreen();
    shake(20);
    loseLife();
    setTimeout(() => {
      mbRoot.classList.remove('on', 'fail');
      G.miniboss = null;
      hideFnBuilder();
      // failure still advances to upgrade phase (don't soft-lock)
      if (G.state !== 'gameover') offerUpgrades();
    }, 600);
  }

  // ====== menu canvas demo (live background animation) ======
  // Slow-falling tokens that auto-type themselves. Runs only on the
  // home screen so the menu doesn't feel static.
  const menuDemo = {
    active: false,
    tokens: [],
    spawnTimer: 0,
    samples: [
      'function', 'const', 'return', '<div>', 'flex:', '.btn',
      'await', 'fetch', '.reduce', 'class', 'async', 'true',
      'null', 'sum()', 'filter', '<html>', 'export', 'import',
      'this', 'new', '<form>', '@media', '.card', '/help',
      'opus', 'sonnet', 'curl', 'grep', 'ls -la', 'tail -f',
    ],
    palette: ['#ff7a59', '#7ad3ff', '#ffd866', '#9be7ff', '#ff9a76', '#b9f0a3'],
  };

  function startMenuDemo() {
    menuDemo.active = true;
    menuDemo.tokens = [];
    menuDemo.spawnTimer = 0.2;
  }
  function stopMenuDemo() {
    menuDemo.active = false;
    menuDemo.tokens = [];
  }

  function updateMenu(dt) {
    if (!menuDemo.active) return;
    menuDemo.spawnTimer -= dt;
    if (menuDemo.spawnTimer <= 0 && menuDemo.tokens.length < 14) {
      menuDemo.spawnTimer = rand(0.4, 0.9);
      const text = choice(menuDemo.samples);
      ctx.font = '600 14px ui-monospace, monospace';
      const tw = ctx.measureText(text).width;
      const halfW = tw / 2 + 10;
      const x = rand(halfW + 8, Math.max(halfW + 9, W - halfW - 8));
      menuDemo.tokens.push({
        x, y: -30,
        vy: rand(14, 26),
        text,
        color: choice(menuDemo.palette),
        typed: 0,
        typeAt: now() + rand(0.6, 2.2),
        typeStep: rand(0.06, 0.13),
        deathT: 0,
        dying: false,
      });
    }
    const t = now();
    for (const tok of menuDemo.tokens) {
      tok.y += tok.vy * dt;
      if (tok.dying) {
        tok.deathT += dt;
      } else if (t > tok.typeAt && tok.typed < tok.text.length) {
        tok.typed += 1;
        tok.typeAt = t + tok.typeStep;
        if (tok.typed >= tok.text.length) {
          tok.dying = true;
          tok.deathT = 0;
        }
      }
    }
    menuDemo.tokens = menuDemo.tokens.filter(tok =>
      (!tok.dying || tok.deathT < 0.6) && tok.y < H + 40);
  }

  function renderMenu() {
    if (!menuDemo.active) return;
    ctx.save();
    for (const tok of menuDemo.tokens) {
      const fadeIn = clamp(tok.y / 60, 0, 1);
      let alpha = 0.45 * fadeIn;
      let scale = 1;
      if (tok.dying) {
        const k = clamp(tok.deathT / 0.6, 0, 1);
        alpha = 0.45 * (1 - k);
        scale = 1 + k * 0.6;
      }
      ctx.globalAlpha = alpha;
      ctx.font = '600 14px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const tw = ctx.measureText(tok.text).width;
      const w = (tw + 14) * scale;
      const h = 22 * scale;
      ctx.fillStyle = '#0e1420';
      ctx.strokeStyle = tok.color;
      ctx.lineWidth = 1;
      roundRect(tok.x - w / 2, tok.y - h / 2, w, h, 6);
      ctx.fill();
      ctx.stroke();

      const typed = tok.text.slice(0, tok.typed);
      const rest  = tok.text.slice(tok.typed);
      const startX = tok.x - tw / 2;
      let cursor = startX;
      ctx.textAlign = 'left';
      ctx.fillStyle = tok.color;
      ctx.fillText(typed, cursor, tok.y);
      cursor += ctx.measureText(typed).width;
      ctx.fillStyle = '#7a8696';
      ctx.fillText(rest, cursor, tok.y);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ====== main loop ======
  let lastTick = now();
  function tick() {
    const t = now();
    let dt = Math.min(0.05, t - lastTick);
    lastTick = t;
    if (G.timeScaleUntil && t > G.timeScaleUntil) {
      G.timeScale = 1; G.timeScaleUntil = 0;
    }
    if (G.state === 'menu')      updateMenu(dt);
    if (G.state === 'playing')   update(dt * G.timeScale, dt);
    if (G.state === 'miniboss')  updateMiniboss(dt);
    G.shake *= 0.86;
    updateStreams(dt);
    render();
    requestAnimationFrame(tick);
  }

  function update(dt, rawDt) {
    if (G.combo > 0) {
      G.comboDecay -= rawDt;
      if (G.comboDecay <= 0) {
        G.combo = Math.max(0, G.combo - 1);
        G.comboDecay = 0.6;
      }
    }
    if (G.waveActive && G.waveSpawnQueue.length > 0) {
      G.spawnTimer -= dt;
      while (G.waveSpawnQueue.length > 0 && G.spawnTimer <= 0) {
        const next = G.waveSpawnQueue.shift();
        spawnEnemy(next);
        G.spawnTimer += clamp(next.delay, 0.35, 1.6);
      }
    }
    for (const e of G.enemies) {
      if (e.dying) continue;
      e.y += e.vy * dt;
      e.shake = Math.max(0, (e.shake || 0) - rawDt);
      if (e.y > H - 56) {
        e.dying = true;
        loseLife();
        spawnExplosion(e.x, e.y, '#ff6b6b');
        if (G.active === e) G.active = null;
      }
    }
    for (const p of G.particles) {
      p.age += rawDt;
      p.vy += 280 * rawDt;
      p.x += p.vx * rawDt;
      p.y += p.vy * rawDt;
    }
    for (const b of G.beams) b.age += rawDt;
    G.enemies   = G.enemies.filter(e => !e.dying);
    G.particles = G.particles.filter(p => p.age < p.life);
    G.beams     = G.beams.filter(b => b.age < b.life);

    elCombo.textContent = `×${G.combo}`;
    elComboBar.style.width = clamp(G.combo / 25, 0, 1) * 100 + '%';

    // wave clear → miniboss
    if (G.waveActive && G.waveSpawnQueue.length === 0 && G.enemies.length === 0) {
      G.waveActive = false;
      setTimeout(() => enterMiniboss(), 400);
    }
  }

  function updateMiniboss(dt) {
    const m = G.miniboss;
    if (!m) return;
    m.timer -= dt;
    if (m.timer <= 0 && m.doneLines.length < m.fn.code.length) {
      mbFail();
      return;
    }
    mbRender();
  }

  function updateStreams(dt) {
    for (const s of G.streams) {
      s.age += dt;
      const t = clamp(s.age / s.life, 0, 1);
      // ease-in toward target
      s.cx = s.x + (s.tx - s.x) * t * t;
      s.cy = s.y + (s.ty - s.y) * t * t;
    }
    G.streams = G.streams.filter(s => s.age < s.life);
  }

  // ====== render ======
  function render() {
    ctx.save();
    if (G.shake > 0.5) {
      ctx.translate(rand(-G.shake, G.shake), rand(-G.shake, G.shake));
    }
    ctx.clearRect(-30, -30, W + 60, H + 60);

    // On the menu we render only the demo tokens behind the overlay —
    // skip the player core, ground, HUD bits.
    if (G.state === 'menu') {
      renderMenu();
      ctx.restore();
      return;
    }

    // floor
    const groundY = H - 50;
    const grad = ctx.createLinearGradient(0, groundY - 10, 0, groundY + 10);
    grad.addColorStop(0, '#0a0d13');
    grad.addColorStop(1, '#1a2230');
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, W, H - groundY);
    ctx.strokeStyle = '#2a3a55';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

    // player core
    const px = W / 2, py = H - 28;
    ctx.fillStyle = '#0e1623';
    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#3a5a8a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#9be7ff';
    ctx.font = 'bold 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('>_', px, py + 5);

    if (G.shields > 0) {
      ctx.strokeStyle = `rgba(155,231,255,${0.4 + 0.2 * Math.sin(now() * 6)})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < G.shields; i++) {
        ctx.beginPath();
        ctx.arc(px, py, 24 + i * 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const b of G.beams) {
      const a = 1 - b.age / b.life;
      ctx.strokeStyle = `rgba(155,231,255,${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    for (const e of G.enemies) drawEnemy(e);

    for (const p of G.particles) {
      const a = 1 - p.age / p.life;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // chunk-to-builder streams
    for (const s of G.streams) {
      const t = clamp(s.age / s.life, 0, 1);
      const cx = s.cx ?? s.x;
      const cy = s.cy ?? s.y;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 1 - t;
      ctx.beginPath(); ctx.arc(cx, cy, 4 - t * 3, 0, Math.PI * 2); ctx.fill();
      // trailing line
      ctx.strokeStyle = s.color;
      ctx.globalAlpha = (1 - t) * 0.5;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(cx, cy); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // letter-power bars
    if (G.stats.letterPowers.length) {
      let x = W / 2 - (G.stats.letterPowers.length * 60) / 2;
      G.stats.letterPowers.forEach(lp => {
        ctx.fillStyle = '#10182388';
        ctx.fillRect(x, 36, 56, 18);
        ctx.fillStyle = '#ffd866';
        ctx.fillRect(x, 36, 56 * (lp.charge / lp.cap), 18);
        ctx.strokeStyle = '#2a3a55';
        ctx.strokeRect(x, 36, 56, 18);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(lp.name, x + 28, 50);
        x += 60;
      });
    }

    ctx.restore();
  }

  function drawEnemy(e) {
    const isActive = G.active === e;
    const shakeX = e.shake ? Math.sin(now() * 60) * 4 * e.shake : 0;
    const x = e.x + shakeX, y = e.y;

    ctx.font = '600 16px ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = e.token;
    const tw = ctx.measureText(text).width;
    const w = tw + 18;
    const h = 26;

    // soft glow on active
    if (isActive) {
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 14;
    }
    ctx.fillStyle = isActive ? '#1a2740' : '#0e1420';
    ctx.strokeStyle = isActive ? e.color : '#2a3a55';
    ctx.lineWidth = isActive ? 2 : 1;
    roundRect(x - w / 2, y - h / 2, w, h, 8);
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;

    // typed/untyped split
    const typed = text.slice(0, e.typed);
    const rest  = text.slice(e.typed);
    const startX = x - tw / 2;
    let cursor = startX;
    ctx.textAlign = 'left';
    ctx.fillStyle = e.color;
    ctx.fillText(typed, cursor, y);
    cursor += ctx.measureText(typed).width;
    ctx.fillStyle = '#cfd6e0';
    ctx.fillText(rest, cursor, y);
    ctx.textAlign = 'center';

    if (isActive) {
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.moveTo(x, y - h / 2 - 4);
      ctx.lineTo(x - 5, y - h / 2 - 12);
      ctx.lineTo(x + 5, y - h / 2 - 12);
      ctx.closePath(); ctx.fill();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }

  // ====== input wiring ======
  window.addEventListener('keydown', (ev) => {
    if (G.state === 'playing' || G.state === 'miniboss') {
      // Use ev.key to support all keys including punctuation.
      // Skip modifiers / special keys.
      if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey) {
        handleChar(ev.key);
        ev.preventDefault();
      }
    }
  });

  typebox.addEventListener('input', () => {
    const v = typebox.value;
    if (!v) return;
    for (const ch of v) handleChar(ch);
    typebox.value = '';
  });
  stage.addEventListener('pointerdown', () => {
    if (G.state === 'playing' || G.state === 'miniboss') typebox.focus();
  });

  // ====== state transitions ======
  function startGame() {
    stopMenuDemo();
    G.state = 'playing';
    G.wave = 0;
    G.score = 0;
    G.lives = 3;
    G.shields = 0;
    G.combo = 0;
    G.comboBest = 0;
    G.enemies = [];
    G.particles = [];
    G.beams = [];
    G.streams = [];
    G.appliedUpgrades = [];
    G.studyFn = null;
    G.miniboss = null;
    G.stats = {
      fallSpeed: 1, spawnRate: 1, typoForgiveness: 0,
      splashRadius: 0, chainCount: 0, shieldsPerWave: 0,
      comboGain: 1, categoryBonus: {}, autoTarget: false,
      letterPowers: [], scoreMultiplier: 1,
      recallBonus: 1.0, recallTimeBonus: 0,
    };
    elLives.textContent = '♥♥♥';
    elScore.textContent = '0';
    elCombo.textContent = '×0';
    elPack.textContent = G.enabledPacks.map(p => window.PACKS[p].name).join(' • ');
    ovStart.classList.add('hidden');
    ovGameover.classList.add('hidden');
    ovUpgrade.classList.add('hidden');
    mbRoot.classList.remove('on');
    typebox.focus();
    startWave();
  }

  document.getElementById('btn-start').addEventListener('click', startGame);
  document.getElementById('btn-restart').addEventListener('click', () => {
    G.state = 'menu';
    ovGameover.classList.add('hidden');
    ovStart.classList.remove('hidden');
    startMenuDemo();
  });

  function quitToMenu() {
    if (G.state === 'menu' || G.state === 'gameover') return;
    if (!confirm('Quit this run? Your score will be discarded.')) return;
    // tear down active state
    G.state = 'menu';
    G.enemies = []; G.particles = []; G.beams = []; G.streams = [];
    G.active = null; G.miniboss = null; G.studyFn = null;
    G.waveActive = false; G.waveSpawnQueue = [];
    hideFnBuilder();
    mbRoot.classList.remove('on', 'win', 'fail', 'shake');
    ovUpgrade.classList.add('hidden');
    ovGameover.classList.add('hidden');
    ovStart.classList.remove('hidden');
    startMenuDemo();
  }
  document.getElementById('btn-quit').addEventListener('click', quitToMenu);
  // Escape also quits — but only during play/recall, not when overlays own the screen.
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && (G.state === 'playing' || G.state === 'miniboss')) {
      ev.preventDefault();
      quitToMenu();
    }
  });

  // ====== menu keyboard shortcut ======
  window.addEventListener('keydown', (ev) => {
    if (G.state !== 'menu') return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      startGame();
    }
  });

  // ====== boot ======
  resize();
  buildPackPicker();
  ovStart.classList.remove('hidden');
  startMenuDemo();
  requestAnimationFrame(tick);
})();
