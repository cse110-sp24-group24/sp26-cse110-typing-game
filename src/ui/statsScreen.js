/**
 * ui/statsScreen.js — End-of-run stats screen rendering.
 *
 * Owns: populating end-of-run stats from statTracker.getSummary() output
 * and wiring #play-again-btn to return to language selection.
 *
 * Implemented by Issue #20.
 */

import { showScreen } from './screenManager.js';

const SCORE_FORMULA_CAPTION = 'WPM × accuracy × wave multiplier';
const BATS_VIDEO_SRC = 'media/visuals/Bats.mp4';
const BATS_CHROMA_WIDTH = 480;
const BATS_SCALE = 1.08;
const STATUS_LABELS = {
  completed: 'Run Complete',
  death: "You've Been Possessed by Poor Code",
  quit: 'Run Abandoned',
};
const STATUS_MARKUP = {
  death: 'You&apos;ve Been <span class="stats-status-danger">Possessed</span> by Poor Code',
};

let batsRendererStarted = false;

/**
 * Renders the end-of-run stats screen from a statTracker summary object.
 * @param {object} summary - Output of statTracker.getSummary(state).
 * @param {number} summary.totalAccuracy - Run-wide accuracy percentage.
 * @param {number} summary.averageWpm - Average WPM across the run.
 * @param {number} summary.wavesCleared - Number of waves completed.
 * @param {number} summary.finalScore - Final score from RunState.
 * @param {'death' | 'completed' | 'quit' | null} [summary.runEndReason] - How the run ended.
 * @param {Array<object>} [summary.waveData] - Per-wave { wpm, accuracy, ... } entries.
 * @returns {void}
 */
export function show(summary) {
  const statusEl = document.getElementById('stats-status');
  const accuracyEl = document.getElementById('stats-accuracy');
  const wpmEl = document.getElementById('stats-wpm');
  const wavesEl = document.getElementById('stats-waves');
  const scoreEl = document.getElementById('stats-score');
  const formulaEl = document.getElementById('stats-score-formula');
  const breakdownToggleEl = document.getElementById('stats-breakdown-toggle');
  const breakdownEl = document.getElementById('stats-breakdown');
  const playAgainBtn = document.getElementById('play-again-btn');

  const totalAccuracy = summary?.totalAccuracy ?? 0;
  const averageWpm = summary?.averageWpm ?? 0;
  const wavesCleared = summary?.wavesCleared ?? 0;
  const finalScore = summary?.finalScore ?? 0;
  const runEndReason = summary?.runEndReason ?? 'death';
  const waveData = Array.isArray(summary?.waveData) ? summary.waveData : [];

  if (statusEl) {
    statusEl.innerHTML =
      STATUS_MARKUP[runEndReason] ?? STATUS_LABELS[runEndReason] ?? STATUS_LABELS.death;
  }
  if (accuracyEl) {
    accuracyEl.innerHTML = `<span class="stats-accuracy-label">Total Accuracy</span><span class="stats-accuracy-value">${totalAccuracy}%</span>`;
    accuracyEl.setAttribute('aria-label', `Total accuracy ${totalAccuracy} percent`);
  }
  if (wpmEl) {
    wpmEl.textContent = `Avg WPM: ${Math.round(averageWpm)}`;
  }
  if (wavesEl) {
    wavesEl.textContent = `Waves Survived: ${wavesCleared}`;
  }
  if (scoreEl) {
    scoreEl.textContent = `Score: ${finalScore.toLocaleString()}`;
  }
  if (formulaEl) {
    formulaEl.textContent = `(${SCORE_FORMULA_CAPTION})`;
  }

  renderWaveBreakdown(breakdownEl, breakdownToggleEl, waveData);
  startBatsRenderer();

  if (playAgainBtn) {
    playAgainBtn.onclick = () => {
      showScreen('language-screen');
    };
  }
}

/**
 * Builds the per-wave breakdown table and wires the expand/collapse toggle.
 * @param {HTMLElement | null} breakdownEl - Container for breakdown rows.
 * @param {HTMLElement | null} toggleEl - Button that toggles visibility.
 * @param {Array<object>} waveData - Per-wave stats from getSummary().
 * @returns {void}
 */
function renderWaveBreakdown(breakdownEl, toggleEl, waveData) {
  if (!breakdownEl) {
    return;
  }

  breakdownEl.innerHTML = '';
  breakdownEl.classList.add('collapsed');
  breakdownEl.setAttribute('aria-hidden', 'true');

  if (waveData.length === 0) {
    if (toggleEl) {
      toggleEl.classList.add('hidden');
      toggleEl.onclick = null;
    }
    return;
  }

  const header = document.createElement('div');
  header.className = 'stats-breakdown-row stats-breakdown-row--header';
  header.innerHTML = '<span>Wave</span><span>WPM</span><span>Accuracy</span>';
  breakdownEl.appendChild(header);

  waveData.forEach((wave, index) => {
    const row = document.createElement('div');
    row.className = 'stats-breakdown-row';
    const wpm = Math.round(wave.wpm ?? 0);
    const accuracy = wave.accuracy ?? 0;
    row.innerHTML = `<span>Wave ${index + 1}</span><span>${wpm}</span><span>${accuracy}%</span>`;
    breakdownEl.appendChild(row);
  });

  if (!toggleEl) {
    return;
  }

  toggleEl.classList.remove('hidden');
  toggleEl.textContent = 'Show per-wave breakdown';
  toggleEl.setAttribute('aria-expanded', 'false');
  toggleEl.setAttribute('aria-controls', 'stats-breakdown');

  toggleEl.onclick = () => {
    const isCollapsed = breakdownEl.classList.toggle('collapsed');
    breakdownEl.setAttribute('aria-hidden', String(isCollapsed));
    toggleEl.setAttribute('aria-expanded', String(!isCollapsed));
    toggleEl.textContent = isCollapsed ? 'Show per-wave breakdown' : 'Hide per-wave breakdown';
  };
}

/**
 * Starts the looping bats overlay, chroma-keying the green background out.
 * @returns {void}
 */
function startBatsRenderer() {
  if (batsRendererStarted) {
    return;
  }

  const canvas = document.getElementById('stats-bats-canvas');
  if (!canvas) {
    return;
  }

  batsRendererStarted = true;

  const ctx = canvas.getContext('2d');
  const chromaCanvas = document.createElement('canvas');
  const chromaCtx = chromaCanvas.getContext('2d', { willReadFrequently: true });
  const video = document.createElement('video');

  silenceDecorativeVideo(video);
  video.src = BATS_VIDEO_SRC;
  video.loop = true;
  video.playsInline = true;
  video.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(video);

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', resizeCanvas);

  video.addEventListener('loadedmetadata', () => {
    chromaCanvas.width = BATS_CHROMA_WIDTH;
    chromaCanvas.height = Math.ceil(BATS_CHROMA_WIDTH / (video.videoWidth / video.videoHeight));
    resizeCanvas();
    video.play().catch(() => {});
    requestAnimationFrame(drawBatsFrame);
  });

  video.addEventListener('error', () => {
    canvas.style.display = 'none';
  });

  /**
   * Draws one chroma-keyed bats frame over the active stats screen.
   * @returns {void}
   */
  function drawBatsFrame() {
    const statsScreen = document.getElementById('stats-screen');
    const isStatsActive = statsScreen?.classList.contains('active');

    if (video.readyState >= 2 && !video.paused && !video.ended) {
      if (isStatsActive) {
        drawKeyedVideoFrame(video, chromaCanvas, chromaCtx, canvas, ctx);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    requestAnimationFrame(drawBatsFrame);
  }
}

/**
 * Draws a video frame to a chroma canvas, removes green pixels, and scales it.
 * @param {HTMLVideoElement} video - Source green-screen video.
 * @param {HTMLCanvasElement} chromaCanvas - Small processing canvas.
 * @param {CanvasRenderingContext2D} chromaCtx - Processing canvas context.
 * @param {HTMLCanvasElement} canvas - Visible output canvas.
 * @param {CanvasRenderingContext2D} ctx - Visible output canvas context.
 * @returns {void}
 */
function drawKeyedVideoFrame(video, chromaCanvas, chromaCtx, canvas, ctx) {
  chromaCtx.clearRect(0, 0, chromaCanvas.width, chromaCanvas.height);
  chromaCtx.drawImage(
    video,
    0,
    0,
    video.videoWidth,
    video.videoHeight,
    0,
    0,
    chromaCanvas.width,
    chromaCanvas.height
  );

  const frame = chromaCtx.getImageData(0, 0, chromaCanvas.width, chromaCanvas.height);
  const px = frame.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];

    if (g > 100 && g - r > 35 && g - b > 35) {
      px[i + 3] = 0;
      continue;
    }

    const dominance = Math.min(g - r, g - b);
    if (g > 80 && dominance > 15) {
      px[i + 3] = Math.floor(px[i + 3] * (1 - (dominance - 15) / 25));
    }
  }
  chromaCtx.putImageData(frame, 0, 0);

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const aspect = chromaCanvas.width / chromaCanvas.height;
  const maxWidth = canvasWidth * BATS_SCALE;
  const maxHeight = canvasHeight * BATS_SCALE;
  let drawWidth;
  let drawHeight;

  if (aspect > maxWidth / maxHeight) {
    drawWidth = maxWidth;
    drawHeight = drawWidth / aspect;
  } else {
    drawHeight = maxHeight;
    drawWidth = drawHeight * aspect;
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.drawImage(
    chromaCanvas,
    (canvasWidth - drawWidth) / 2,
    (canvasHeight - drawHeight) / 2,
    drawWidth,
    drawHeight
  );
}

/**
 * Keeps the bats footage visual-only so menu music remains the only audio.
 * @param {HTMLVideoElement} video - Decorative overlay video.
 * @returns {void}
 */
function silenceDecorativeVideo(video) {
  const enforceSilentVideo = () => {
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.setAttribute('muted', '');
  };

  enforceSilentVideo();
  video.addEventListener('play', enforceSilentVideo);
  video.addEventListener('volumechange', enforceSilentVideo);
}
