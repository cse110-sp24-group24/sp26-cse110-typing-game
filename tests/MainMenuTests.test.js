/**
 * tests/MainMenuTests.test.js — Puppeteer/Jest tests for Issue #8.
 *
 * Run with: npm test
 */

import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 3033;

let server;
let browser;
let page;

/**
 * Minimal static file server that decodes percent-encoded URLs so paths
 * containing spaces (e.g. the audio folder) resolve correctly on disk.
 * @returns {Promise<http.Server>}
 */
function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      const filePath = path.join(
        ROOT,
        decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath)
      );

      if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      const mime = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript; charset=utf-8',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
      };
      const ext = path.extname(filePath).toLowerCase();

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': mime[ext] ?? 'application/octet-stream' });
        res.end(data);
      });
    });

    srv.listen(PORT, () => resolve(srv));
  });
}

beforeAll(async () => {
  server = await startServer();
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  page = await browser.newPage();
});

afterAll(async () => {
  await browser.close();
  server.close();
});

// ── Helper: fresh page load ────────────────────────────────────
async function freshPage() {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });
}

// ══════════════════════════════════════════════════════════════════
// Main Menu Screen
// ══════════════════════════════════════════════════════════════════

test('main menu screen is active on page load', async () => {
  await freshPage();
  const isActive = await page.evaluate(() =>
    document.getElementById('menu-screen').classList.contains('active')
  );
  expect(isActive).toBe(true);
});

test('all other screens are inactive on page load', async () => {
  await freshPage();
  const inactiveScreens = await page.evaluate(() => {
    const ids = [
      'language-screen',
      'wave-intro-screen',
      'game-screen',
      'wave-stats-screen',
      'upgrade-screen',
      'stats-screen',
    ];
    return ids.filter((id) => document.getElementById(id).classList.contains('active'));
  });
  expect(inactiveScreens).toHaveLength(0);
});

test('ghost canvas is present in the DOM', async () => {
  await freshPage();
  const canvas = await page.$('#ghost-canvas');
  expect(canvas).not.toBeNull();
});

test('decorative ghost video is silenced and hidden off-screen', async () => {
  await freshPage();
  // The ghost video is appended as a direct child of <body>; the countdown
  // video is nested inside #countdown-overlay, so 'body > video' targets only
  // the ghost video.
  const video = await page.evaluate(() => {
    const v = document.querySelector('body > video');
    return v
      ? {
          muted: v.muted,
          defaultMuted: v.defaultMuted,
          volume: v.volume,
          inBody: document.body.contains(v),
        }
      : null;
  });
  expect(video).not.toBeNull();
  expect(video.muted).toBe(true);
  expect(video.defaultMuted).toBe(true);
  expect(video.volume).toBe(0);
  expect(video.inBody).toBe(true);
});

test('play button is present on the main menu', async () => {
  await freshPage();
  const btn = await page.$('#play-btn');
  expect(btn).not.toBeNull();
});

// ══════════════════════════════════════════════════════════════════
// Audio
// ══════════════════════════════════════════════════════════════════

test('ambient music plays on main menu and keeps playing on language select screen', async () => {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });

  // Wait for audioManager.init() to attach the <audio> element to the DOM
  await page.waitForSelector('audio', { timeout: 5000 });

  // Wait until play() resolves and the audio is no longer paused
  await page.waitForFunction(
    () => {
      const audio = document.querySelector('audio');
      return audio !== null && audio.paused === false;
    },
    { timeout: 5000 }
  );

  // ── Main Menu: verify audio is set up and playing ──────────────
  const mainMenuAudio = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    return {
      autoplay: audio.autoplay,
      exists: audio !== null,
      loops: audio.loop,
      preload: audio.preload,
      src: audio.src,
      paused: audio.paused,
    };
  });

  expect(mainMenuAudio.autoplay).toBe(true);
  expect(mainMenuAudio.exists).toBe(true);
  expect(mainMenuAudio.loops).toBe(true);
  expect(mainMenuAudio.preload).toBe('auto');
  expect(mainMenuAudio.src).toContain('spookymusic');
  expect(mainMenuAudio.paused).toBe(false);

  const decorativeVideo = await page.evaluate(() => {
    const video = document.querySelector('body > video');
    return {
      exists: video !== null,
      defaultMuted: video?.defaultMuted,
      muted: video?.muted,
      src: video?.src,
      volume: video?.volume,
    };
  });

  expect(decorativeVideo.exists).toBe(true);
  expect(decorativeVideo.src).toContain('MainMenuGhostAni');
  expect(decorativeVideo.defaultMuted).toBe(true);
  expect(decorativeVideo.muted).toBe(true);
  expect(decorativeVideo.volume).toBe(0);

  // Switch to language select screen (simulates the Play button navigation
  // without requiring the button to be wired yet)
  await page.evaluate(() => {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('language-screen').classList.add('active');
  });

  // ── Language Select: same audio, still playing ─────────────────
  const langSelectAudio = await page.evaluate(() => {
    const audio = document.querySelector('audio');
    return {
      paused: audio.paused,
      src: audio.src,
    };
  });

  expect(langSelectAudio.paused).toBe(false);
  expect(langSelectAudio.src).toContain('spookymusic');
});

// ══════════════════════════════════════════════════════════════════
// Play Button → Language Selection Screen
// ══════════════════════════════════════════════════════════════════

test('clicking Play navigates to the language selection screen', async () => {
  await freshPage();
  await page.click('#play-btn');
  const isActive = await page.evaluate(() =>
    document.getElementById('language-screen').classList.contains('active')
  );
  expect(isActive).toBe(true);
});

test('clicking Play deactivates the main menu screen', async () => {
  await freshPage();
  await page.click('#play-btn');
  const menuActive = await page.evaluate(() =>
    document.getElementById('menu-screen').classList.contains('active')
  );
  expect(menuActive).toBe(false);
});

// ══════════════════════════════════════════════════════════════════
// Language Selection Screen
// ══════════════════════════════════════════════════════════════════

test('language screen title is "Choose Your Doom"', async () => {
  await freshPage();
  await page.click('#play-btn');
  const title = await page.$eval('.screen-title', (el) => el.textContent.trim());
  expect(title).toBe('Choose Your Doom');
});

test('language screen has exactly three language buttons', async () => {
  await freshPage();
  await page.click('#play-btn');
  const count = await page.$$eval('.btn-language', (btns) => btns.length);
  expect(count).toBe(3);
});

test('language buttons have correct data-language values', async () => {
  await freshPage();
  await page.click('#play-btn');
  const languages = await page.$$eval('.btn-language', (btns) =>
    btns.map((b) => b.dataset.language)
  );
  expect(languages).toEqual(expect.arrayContaining(['javascript', 'html', 'css']));
});

test('language buttons display correct icon labels', async () => {
  await freshPage();
  await page.click('#play-btn');
  const icons = await page.$$eval('.lang-icon', (els) => els.map((el) => el.textContent.trim()));
  expect(icons).toEqual(expect.arrayContaining(['JS', 'HTML', 'CSS']));
});

// ══════════════════════════════════════════════════════════════════
// Language Selection → localStorage
// ══════════════════════════════════════════════════════════════════

test.each([['javascript'], ['html'], ['css']])(
  'clicking the %s button saves that language to localStorage',
  async (lang) => {
    await freshPage();
    await page.click('#play-btn');
    await page.click(`[data-language="${lang}"]`);
    const saved = await page.evaluate(() => {
      const prefs = JSON.parse(localStorage.getItem('phantomtype_prefs') || '{}');
      return prefs.language;
    });
    expect(saved).toBe(lang);
  }
);

// ══════════════════════════════════════════════════════════════════
// Scare Transition Overlays
// ══════════════════════════════════════════════════════════════════

test('countdown, static, and scare overlays exist in the DOM', async () => {
  await freshPage();
  const ids = ['countdown-overlay', 'static-overlay', 'scare-overlay'];
  const present = await page.evaluate(
    (ids) => ids.every((id) => document.getElementById(id) !== null),
    ids
  );
  expect(present).toBe(true);
});

test('countdown, static, and scare overlays are hidden on page load', async () => {
  await freshPage();
  const allHidden = await page.evaluate(() =>
    ['countdown-overlay', 'static-overlay', 'scare-overlay'].every((id) =>
      document.getElementById(id).classList.contains('hidden')
    )
  );
  expect(allHidden).toBe(true);
});

test('countdown overlay contains a video element', async () => {
  await freshPage();
  const hasVideo = await page.evaluate(
    () => document.getElementById('countdown-overlay').querySelector('video') !== null
  );
  expect(hasVideo).toBe(true);
});

test('clicking a language button immediately shows the countdown overlay', async () => {
  await freshPage();
  await page.click('#play-btn');
  await page.click('[data-language="javascript"]');
  const visible = await page.evaluate(
    () => !document.getElementById('countdown-overlay').classList.contains('hidden')
  );
  expect(visible).toBe(true);
});

test('after countdown video ends, static overlay becomes visible', async () => {
  await freshPage();
  await page.click('#play-btn');
  await page.click('[data-language="javascript"]');

  // Simulate the countdown video reaching its end
  await page.evaluate(() => {
    document.getElementById('countdown-video').dispatchEvent(new Event('ended'));
  });

  const staticVisible = await page.evaluate(
    () => !document.getElementById('static-overlay').classList.contains('hidden')
  );
  expect(staticVisible).toBe(true);
});

test('after countdown video ends, countdown overlay is hidden', async () => {
  await freshPage();
  await page.click('#play-btn');
  await page.click('[data-language="javascript"]');

  await page.evaluate(() => {
    document.getElementById('countdown-video').dispatchEvent(new Event('ended'));
  });

  const countdownHidden = await page.evaluate(() =>
    document.getElementById('countdown-overlay').classList.contains('hidden')
  );
  expect(countdownHidden).toBe(true);
});

test('scare image appears after static and transitions to wave-intro-screen', async () => {
  await freshPage();
  await page.click('#play-btn');
  await page.click('[data-language="javascript"]');

  await page.evaluate(() => {
    document.getElementById('countdown-video').dispatchEvent(new Event('ended'));
  });

  // Wait for the 750 ms image delay, then check scare overlay is visible
  await page.waitForFunction(
    () => !document.getElementById('scare-overlay').classList.contains('hidden'),
    { timeout: 3000 }
  );

  // Zombie scare uses a chroma-keyed canvas, not an <img>.
  // Verify #scare-canvas is present and has been sized (width > 0).
  const scareCanvas = await page.$eval('#scare-canvas', (el) => el.width);
  expect(scareCanvas).toBeGreaterThan(0);

  // Simulate the scream audio ending to trigger navigation
  await page.evaluate(() => {
    // Find the scream audio and fire its ended event to skip the 5s fallback
    document.querySelectorAll('audio').forEach((a) => {
      if (a.src && a.src.includes('SCREAM')) a.dispatchEvent(new Event('ended'));
    });
  });

  await page.waitForFunction(
    () => document.getElementById('wave-intro-screen').classList.contains('active'),
    { timeout: 3000 }
  );

  const waveActive = await page.evaluate(() =>
    document.getElementById('wave-intro-screen').classList.contains('active')
  );
  expect(waveActive).toBe(true);
});
