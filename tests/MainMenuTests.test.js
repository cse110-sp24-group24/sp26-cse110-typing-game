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
      const filePath = path.join(ROOT, decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath));

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

test('ambient music plays on main menu and keeps playing on language select screen', async () => {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'domcontentloaded' });

  // Wait for audioManager.init() to attach the <audio> element to the DOM
  await page.waitForSelector('audio', { timeout: 5000 });

  // Wait until play() resolves and the audio is no longer paused
  await page.waitForFunction(() => {
    const audio = document.querySelector('audio');
    return audio !== null && audio.paused === false;
  }, { timeout: 5000 });

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
    const video = document.querySelector('video');
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
