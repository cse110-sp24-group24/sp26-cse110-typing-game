(() => {
  "use strict";

  const snippets = {
    linux: [
      "ls -la",
      "cd /lab",
      "chmod +x escape.sh",
      "sudo reboot",
      "rm corrupted.log",
      "cat logs/researcher_07.txt",
      "ps aux | grep sentinel"
    ],
    git: [
      "git status",
      "git commit -m \"survive\"",
      "git checkout main",
      "git reset --hard",
      "git reflog",
      "git branch -D phantom"
    ],
    javascript: [
      "console.log(\"help\")",
      "document.querySelector(\".door\")",
      "function escapeLab() {}",
      "if (panic > 80) run();",
      "const pulse = setInterval(scan, 250);"
    ],
    htmlcss: [
      "<div class=\"warning\">",
      "<button id=\"escape\">Run</button>",
      "color: crimson;",
      "animation: flicker 1s infinite;",
      "<section data-state=\"haunted\"></section>"
    ]
  };

  const enemyWeakness = {
    "Memory Leech": "linux",
    "Branch Warden": "git",
    "Mirror Child": "javascript",
    "Markup Wraith": "htmlcss"
  };

  const creepyLines = [
    "You typed that before.",
    "The folder remembers you.",
    "Do not trust the terminal.",
    "Something is behind the screen.",
    "Researcher 12: I hear keys when nobody is here.",
    "Researcher 09: It copies my commands before I think them.",
    "REDACTED process attached to user session."
  ];

  const state = {
    started: false,
    hardMode: false,
    score: 0,
    best: Number(localStorage.getItem("hauntedBestScore") || 0),
    round: 1,
    corruption: 8,
    panic: 4,
    accuracyHits: 0,
    accuracyTotal: 0,
    target: "",
    targetCategory: "linux",
    timerMax: 9000,
    timerLeft: 9000,
    timerTick: null,
    dangerTick: null,
    panicDelay: 0,
    muted: false,
    aiChain: null,
    lockInput: false
  };

  const dom = {
    app: document.getElementById("app"),
    startScreen: document.getElementById("startScreen"),
    gameScreen: document.getElementById("gameScreen"),
    gameOverScreen: document.getElementById("gameOverScreen"),
    startBtn: document.getElementById("startBtn"),
    hardModeBtn: document.getElementById("hardModeBtn"),
    restartBtn: document.getElementById("restartBtn"),
    retryBtn: document.getElementById("retryBtn"),
    muteBtn: document.getElementById("muteBtn"),
    score: document.getElementById("score"),
    round: document.getElementById("round"),
    bestScore: document.getElementById("bestScore"),
    corruptionFill: document.getElementById("corruptionFill"),
    panicFill: document.getElementById("panicFill"),
    accuracyFill: document.getElementById("accuracyFill"),
    timerFill: document.getElementById("timerFill"),
    corruptionValue: document.getElementById("corruptionValue"),
    panicValue: document.getElementById("panicValue"),
    accuracyValue: document.getElementById("accuracyValue"),
    timerValue: document.getElementById("timerValue"),
    targetText: document.getElementById("targetText"),
    terminalInput: document.getElementById("terminalInput"),
    feedback: document.getElementById("feedback"),
    warningFeed: document.getElementById("warningFeed"),
    popupLayer: document.getElementById("popupLayer"),
    overlayMessage: document.getElementById("overlayMessage"),
    bluescreen: document.getElementById("bluescreen"),
    blackout: document.getElementById("blackout"),
    shadowFigure: document.getElementById("shadowFigure"),
    finalScore: document.getElementById("finalScore"),
    finalRound: document.getElementById("finalRound")
  };

  const audio = {
    ctx: null,
    humOsc: null,
    humGain: null
  };

  function initAudio() {
    if (audio.ctx) return;
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.humOsc = audio.ctx.createOscillator();
    audio.humGain = audio.ctx.createGain();
    audio.humOsc.type = "sawtooth";
    audio.humOsc.frequency.value = 46;
    audio.humGain.gain.value = 0.018;
    audio.humOsc.connect(audio.humGain).connect(audio.ctx.destination);
    audio.humOsc.start();
  }

  function beep(freq, dur, volume, type = "square") {
    if (state.muted || !audio.ctx) return;
    const osc = audio.ctx.createOscillator();
    const gain = audio.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audio.ctx.currentTime);
    gain.gain.setValueAtTime(volume, audio.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.ctx.currentTime + dur);
    osc.connect(gain).connect(audio.ctx.destination);
    osc.start();
    osc.stop(audio.ctx.currentTime + dur);
  }

  function whisper() {
    if (state.muted || !audio.ctx) return;
    const bufferSize = audio.ctx.sampleRate * 0.22;
    const buffer = audio.ctx.createBuffer(1, bufferSize, audio.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = (Math.random() * 2 - 1) * 0.42;
    const noise = audio.ctx.createBufferSource();
    const filter = audio.ctx.createBiquadFilter();
    const gain = audio.ctx.createGain();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 900 + Math.random() * 600;
    gain.gain.value = 0.03;
    noise.connect(filter).connect(gain).connect(audio.ctx.destination);
    noise.start();
  }

  function setPanel(screen) {
    [dom.startScreen, dom.gameScreen, dom.gameOverScreen].forEach((el) => el.classList.remove("active"));
    screen.classList.add("active");
  }

  function pickCategory() {
    const keys = Object.keys(snippets);
    return keys[Math.floor(Math.random() * keys.length)];
  }

  function pickSnippet(category, minLen = 0) {
    const pool = snippets[category].filter((s) => s.length >= minLen);
    const source = pool.length ? pool : snippets[category];
    return source[Math.floor(Math.random() * source.length)];
  }

  function updateHud() {
    const accuracy = state.accuracyTotal === 0 ? 100 : Math.max(1, Math.round((state.accuracyHits / state.accuracyTotal) * 100));
    dom.score.textContent = String(state.score);
    dom.round.textContent = String(state.round);
    dom.bestScore.textContent = String(state.best);
    dom.corruptionFill.style.width = `${state.corruption}%`;
    dom.panicFill.style.width = `${state.panic}%`;
    dom.accuracyFill.style.width = `${accuracy}%`;
    dom.corruptionValue.textContent = `${Math.round(state.corruption)}%`;
    dom.panicValue.textContent = `${Math.round(state.panic)}%`;
    dom.accuracyValue.textContent = `${accuracy}%`;

    dom.app.classList.remove("low-corruption", "medium-corruption", "high-corruption", "critical-corruption");
    if (state.corruption < 30) dom.app.classList.add("low-corruption");
    else if (state.corruption < 60) dom.app.classList.add("medium-corruption");
    else if (state.corruption < 85) dom.app.classList.add("high-corruption");
    else dom.app.classList.add("critical-corruption");
  }

  function renderTarget() {
    const typed = dom.terminalInput.value;
    let html = "";
    for (let i = 0; i < state.target.length; i += 1) {
      const targetChar = state.target[i];
      const typedChar = typed[i];
      if (typedChar == null) html += `<span>${escapeHtml(targetChar)}</span>`;
      else if (typedChar === targetChar) html += `<span style=\"color:#74ff9f\">${escapeHtml(targetChar)}</span>`;
      else html += `<span style=\"color:#ff5e74\">${escapeHtml(targetChar)}</span>`;
    }
    dom.targetText.innerHTML = html;
  }

  function escapeHtml(char) {
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === "\"") return "&quot;";
    if (char === "&") return "&amp;";
    return char;
  }

  function setFeedback(text, danger = false) {
    dom.feedback.textContent = text;
    dom.feedback.style.color = danger ? "#ff97a4" : "#93ffb7";
  }

  function addWarningLine(text) {
    const stamp = new Date().toLocaleTimeString();
    dom.warningFeed.innerHTML = `<div>[${stamp}] ${text}</div>` + dom.warningFeed.innerHTML;
    dom.warningFeed.innerHTML = dom.warningFeed.innerHTML.split("</div>").slice(0, 4).join("</div>");
  }

  function applyPanicDelay() {
    if (state.panic < 70) return 0;
    const delay = Math.min(160, Math.round((state.panic - 68) * 2.2));
    return delay;
  }

  function makePrompt() {
    const difficulty = Math.floor(state.round / 3);
    const minLength = Math.min(22, difficulty * 4);
    state.targetCategory = pickCategory();
    state.target = pickSnippet(state.targetCategory, minLength);

    if (state.aiChain) {
      state.targetCategory = state.aiChain.weakness;
      state.target = pickSnippet(state.targetCategory, minLength + 3);
      dom.overlayMessage.textContent = `AI ENTITY: ${state.aiChain.name} // Weakness: ${state.aiChain.weakness.toUpperCase()}`;
      dom.overlayMessage.classList.remove("hidden");
      setTimeout(() => dom.overlayMessage.classList.add("hidden"), 1100);
    }

    dom.terminalInput.value = "";
    renderTarget();
    setFeedback("Type the sequence exactly.");

    const base = state.hardMode ? 6800 : 8600;
    state.timerMax = Math.max(2800, base - state.round * (state.hardMode ? 180 : 130));
    if (state.aiChain) state.timerMax = Math.max(2200, state.timerMax - 700);
    state.timerLeft = state.timerMax;
    updateTimer();
  }

  function updateTimer() {
    const pct = Math.max(0, Math.round((state.timerLeft / state.timerMax) * 100));
    dom.timerFill.style.width = `${pct}%`;
    dom.timerValue.textContent = `${pct}%`;
  }

  function startTimers() {
    clearInterval(state.timerTick);
    clearInterval(state.dangerTick);

    state.timerTick = setInterval(() => {
      if (!state.started || state.lockInput) return;
      state.timerLeft -= 50;
      if (state.timerLeft <= 0) {
        onTimeout();
      }
      updateTimer();
    }, 50);

    state.dangerTick = setInterval(() => {
      if (!state.started) return;
      const drain = state.corruption < 50 ? 0.5 : state.corruption < 80 ? 0.9 : 1.25;
      state.corruption = Math.min(100, state.corruption + drain);
      state.panic = Math.min(100, state.panic + 0.2);
      maybeTriggerHorror();
      updateHud();
      if (state.corruption >= 100) endGame("The corrupted AI consumed the terminal.");
    }, 1200);
  }

  function onTimeout() {
    increaseCorruption(8);
    increasePanic(9);
    setFeedback("Signal lost. Too slow.", true);
    beep(130, 0.18, 0.11, "triangle");
    addWarningLine("Timeout event detected. Entity is closer.");
    dom.app.classList.add("red-flash");
    setTimeout(() => dom.app.classList.remove("red-flash"), 420);
    nextRound(false);
  }

  function increaseCorruption(value) {
    state.corruption = Math.min(100, state.corruption + value);
  }

  function reduceCorruption(value) {
    state.corruption = Math.max(0, state.corruption - value);
  }

  function increasePanic(value) {
    state.panic = Math.min(100, state.panic + value);
  }

  function reducePanic(value) {
    state.panic = Math.max(0, state.panic - value);
  }

  function nextRound(success) {
    if (!state.started) return;

    if (success) {
      if (state.aiChain) {
        state.aiChain.progress += 1;
        if (state.aiChain.progress >= state.aiChain.total) {
          addWarningLine(`Entity ${state.aiChain.name} contained.`);
          state.score += 120 + state.round * 8;
          reduceCorruption(14);
          state.aiChain = null;
          state.round += 1;
        }
      } else {
        state.round += 1;
      }
    }

    if (!state.aiChain && state.round % 5 === 0) {
      const names = Object.keys(enemyWeakness);
      const name = names[Math.floor(Math.random() * names.length)];
      state.aiChain = {
        name,
        weakness: enemyWeakness[name],
        total: state.hardMode ? 4 : 3,
        progress: 0
      };
      overlayMessage(`AI encounter initiated: ${name}`);
      beep(90, 0.45, 0.1, "sawtooth");
      increaseCorruption(6);
    }

    updateHud();
    if (state.round > 15) dom.hardModeBtn.disabled = false;
    makePrompt();
  }

  function checkInput() {
    if (!state.started || state.lockInput) return;
    const value = dom.terminalInput.value;
    renderTarget();

    let localHits = 0;
    for (let i = 0; i < value.length; i += 1) {
      state.accuracyTotal += 1;
      if (value[i] === state.target[i]) {
        state.accuracyHits += 1;
        localHits += 1;
      }
    }

    if (value.length > state.target.length) {
      increaseCorruption(2);
      increasePanic(3);
      setFeedback("Overflow input detected.", true);
      beep(160, 0.08, 0.08);
      dom.app.classList.add("shake");
      setTimeout(() => dom.app.classList.remove("shake"), 250);
      updateHud();
      return;
    }

    const mismatch = value.split("").some((ch, idx) => ch !== state.target[idx]);
    if (mismatch) {
      increaseCorruption(1.3);
      increasePanic(1.2);
      setFeedback("Mismatch pattern. Correct it.", true);
      beep(220, 0.05, 0.06);
      if (Math.random() < 0.25) addWarningLine(creepyLines[Math.floor(Math.random() * creepyLines.length)]);
    } else {
      reducePanic(0.18 + localHits * 0.01);
    }

    updateHud();

    if (value === state.target) {
      const gain = 28 + Math.round(state.timerLeft / 75) + Math.max(0, 18 - state.round);
      state.score += gain;
      reduceCorruption(7 + Math.min(6, Math.floor(state.round / 3)));
      reducePanic(8);
      setFeedback("Sequence accepted.");
      beep(630, 0.06, 0.06, "sine");
      beep(790, 0.06, 0.05, "sine");
      nextRound(true);
    }
  }

  function maybeTriggerHorror() {
    const c = state.corruption;

    if (c > 25 && Math.random() < 0.07) {
      dom.app.classList.add("flicker");
      setTimeout(() => dom.app.classList.remove("flicker"), 380);
    }

    if (c > 38 && Math.random() < 0.06) {
      addWarningLine(creepyLines[Math.floor(Math.random() * creepyLines.length)]);
      glitchTargetText();
    }

    if (c > 52 && Math.random() < 0.08) {
      spawnSentientPopup();
    }

    if (c > 65 && Math.random() < 0.05) {
      triggerCrashFakeout();
    }

    if (c > 74 && Math.random() < 0.06) {
      blackoutPulse();
    }

    if (c > 82 && Math.random() < 0.07) {
      fakeBlueScreen();
    }

    if (c > 86 && Math.random() < 0.12) {
      whisper();
      showShadowFigure();
    }

    if (c > 92 && Math.random() < 0.11) {
      state.lockInput = true;
      setFeedback("Panic latency event...");
      setTimeout(() => {
        state.lockInput = false;
        setFeedback("Input restored.");
      }, 260 + Math.random() * 350);
    }
  }

  function glitchTargetText() {
    const original = state.target;
    const chars = "#$%?<>/\\{}[]";
    let shown = original;
    for (let i = 0; i < 2; i += 1) {
      setTimeout(() => {
        shown = shown
          .split("")
          .map((ch) => (Math.random() < 0.08 ? chars[Math.floor(Math.random() * chars.length)] : ch))
          .join("");
        dom.targetText.textContent = shown;
      }, i * 70);
    }
    setTimeout(renderTarget, 180);
  }

  function spawnSentientPopup() {
    const text = creepyLines[Math.floor(Math.random() * creepyLines.length)];
    const popup = document.createElement("div");
    popup.className = "sentient-popup";
    popup.textContent = `SYSTEM: ${text}`;
    popup.style.left = `${8 + Math.random() * 70}%`;
    popup.style.top = `${10 + Math.random() * 68}%`;
    dom.popupLayer.appendChild(popup);
    setTimeout(() => popup.remove(), 1600 + Math.random() * 1000);
  }

  function triggerCrashFakeout() {
    overlayMessage("Kernel panic... recovering");
    state.lockInput = true;
    setTimeout(() => {
      state.lockInput = false;
      setFeedback("Recovery complete. Keep typing.");
    }, 500);
  }

  function blackoutPulse() {
    dom.blackout.classList.remove("hidden");
    setTimeout(() => dom.blackout.classList.add("hidden"), 180 + Math.random() * 250);
  }

  function fakeBlueScreen() {
    state.lockInput = true;
    dom.bluescreen.classList.remove("hidden");
    beep(75, 0.48, 0.1, "triangle");
    setTimeout(() => {
      dom.bluescreen.classList.add("hidden");
      state.lockInput = false;
    }, 750);
  }

  function showShadowFigure() {
    dom.shadowFigure.style.opacity = "0.45";
    setTimeout(() => {
      dom.shadowFigure.style.opacity = "0";
    }, 300 + Math.random() * 350);
  }

  function overlayMessage(text) {
    dom.overlayMessage.textContent = text;
    dom.overlayMessage.classList.remove("hidden");
    setTimeout(() => dom.overlayMessage.classList.add("hidden"), 1000);
  }

  function endGame(reason) {
    state.started = false;
    clearInterval(state.timerTick);
    clearInterval(state.dangerTick);

    if (state.score > state.best) {
      state.best = state.score;
      localStorage.setItem("hauntedBestScore", String(state.best));
    }

    dom.finalScore.textContent = String(state.score);
    dom.finalRound.textContent = String(Math.max(1, state.round - 1));
    document.getElementById("gameOverText").textContent = reason;
    setPanel(dom.gameOverScreen);
  }

  function startGame(hard = false) {
    initAudio();
    if (audio.ctx && audio.ctx.state === "suspended") audio.ctx.resume();

    state.started = true;
    state.hardMode = hard;
    state.score = 0;
    state.round = 1;
    state.corruption = hard ? 18 : 8;
    state.panic = hard ? 12 : 4;
    state.accuracyHits = 0;
    state.accuracyTotal = 0;
    state.aiChain = null;
    state.lockInput = false;

    setPanel(dom.gameScreen);
    updateHud();
    makePrompt();
    startTimers();
    dom.terminalInput.focus();
    addWarningLine("Session online. Operator heartbeat detected.");
  }

  function bindEvents() {
    dom.startBtn.addEventListener("click", () => startGame(false));
    dom.hardModeBtn.addEventListener("click", () => {
      if (!dom.hardModeBtn.disabled) startGame(true);
    });
    dom.restartBtn.addEventListener("click", () => startGame(state.hardMode));
    dom.retryBtn.addEventListener("click", () => startGame(false));

    dom.muteBtn.addEventListener("click", () => {
      state.muted = !state.muted;
      dom.muteBtn.textContent = `Mute: ${state.muted ? "On" : "Off"}`;
      if (audio.humGain) audio.humGain.gain.value = state.muted ? 0 : 0.018;
    });

    dom.terminalInput.addEventListener("input", () => {
      if (state.lockInput) return;
      const delay = applyPanicDelay();
      if (delay > 0) {
        clearTimeout(state.panicDelay);
        state.lockInput = true;
        const snapshot = dom.terminalInput.value;
        state.panicDelay = setTimeout(() => {
          state.lockInput = false;
          dom.terminalInput.value = snapshot;
          checkInput();
        }, delay);
      } else {
        checkInput();
      }
      beep(300 + Math.random() * 80, 0.02, 0.015, "square");
    });

    window.addEventListener("keydown", (e) => {
      if (!state.started) return;
      if (e.key === "Escape") {
        increasePanic(4);
        increaseCorruption(4);
        setFeedback("Escape denied.", true);
      }
    });
  }

  function boot() {
    dom.bestScore.textContent = String(state.best);
    if (Number(localStorage.getItem("hauntedHardUnlocked") || 0) === 1) {
      dom.hardModeBtn.disabled = false;
    }

    setInterval(() => {
      if (state.round >= 15) {
        localStorage.setItem("hauntedHardUnlocked", "1");
        dom.hardModeBtn.disabled = false;
      }
    }, 800);

    bindEvents();
    setPanel(dom.startScreen);
  }

  boot();
})();