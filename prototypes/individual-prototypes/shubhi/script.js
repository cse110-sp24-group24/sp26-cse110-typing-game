const snippets = [
  '<div>', '</div>', '<button>', 'display: flex;', 'margin: 0 auto;',
  'const score = 0;', 'let lives = 3;', 'npm test', 'git commit -m "feat: ..."',
  'function jump() {}', 'if (hp <= 0) {}', 'document.querySelector()'
];

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const comboEl = document.getElementById('combo');
const playfield = document.getElementById('playfield');
const input = document.getElementById('typing-input');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('start-btn');

const game = {
  running: false,
  score: 0,
  lives: 3,
  combo: 0,
  active: [],
  spawnTimer: null,
  loopTimer: null
};

function randomSnippet() {
  return snippets[Math.floor(Math.random() * snippets.length)];
}

function spawnSnippet() {
  const text = randomSnippet();
  const el = document.createElement('div');
  el.className = 'snippet';
  el.textContent = text;

  const maxX = Math.max(20, playfield.clientWidth - 220);
  const x = Math.floor(Math.random() * maxX);

  const item = { text, x, y: -10, speed: 0.8 + Math.random() * 1.3, el };
  el.style.left = `${x}px`;
  el.style.top = `${item.y}px`;
  playfield.appendChild(el);
  game.active.push(item);
}

function updateHUD() {
  scoreEl.textContent = String(game.score);
  livesEl.textContent = String(game.lives);
  comboEl.textContent = String(game.combo);
}

function setStatus(msg, tone = '') {
  statusEl.textContent = msg;
  statusEl.className = `status ${tone}`.trim();
}

function gameOver() {
  game.running = false;
  clearInterval(game.spawnTimer);
  clearInterval(game.loopTimer);
  setStatus(`Game over! Final score: ${game.score}. Press Start to retry.`, 'bad');
  startBtn.textContent = 'Restart Game';
}

function tick() {
  const floor = playfield.clientHeight - 18;
  game.active = game.active.filter((item) => {
    item.y += item.speed;
    item.el.style.top = `${item.y}px`;
    if (item.y > floor) {
      item.el.remove();
      game.lives -= 1;
      game.combo = 0;
      setStatus('Miss! A snippet hit the bottom.', 'bad');
      if (game.lives <= 0) gameOver();
      updateHUD();
      return false;
    }
    return true;
  });
}

function startGame() {
  game.running = true;
  game.score = 0;
  game.lives = 3;
  game.combo = 0;
  game.active.forEach((item) => item.el.remove());
  game.active = [];
  updateHUD();
  setStatus('Game started! Type snippets exactly as shown.', 'good');
  input.value = '';
  input.focus();
  startBtn.textContent = 'Running...';

  clearInterval(game.spawnTimer);
  clearInterval(game.loopTimer);
  spawnSnippet();
  game.spawnTimer = setInterval(spawnSnippet, 1500);
  game.loopTimer = setInterval(tick, 16);
}

function tryMatch(text) {
  const idx = game.active.findIndex((item) => item.text === text.trim());
  if (idx === -1) {
    game.combo = 0;
    setStatus('No match. Keep trying!', 'bad');
    updateHUD();
    return;
  }

  const [hit] = game.active.splice(idx, 1);
  hit.el.remove();
  game.combo += 1;
  game.score += 10 + game.combo * 2;
  setStatus(`Nice! +${10 + game.combo * 2} points`, 'good');
  updateHUD();
}

startBtn.addEventListener('click', startGame);
document.getElementById('input-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!game.running) return;
  tryMatch(input.value);
  input.value = '';
});