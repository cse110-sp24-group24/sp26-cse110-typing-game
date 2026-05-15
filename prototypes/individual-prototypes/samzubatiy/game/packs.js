/* ============================================================
 * SYNTAX PACKS
 *
 * Each pack is a self-contained set of study functions the
 * game throws at the player. Adding a new pack is the entire
 * extension API:
 *
 *   PACKS.unix = {
 *     name: 'UNIX', color: '#9be7ff', glyph: '$_',
 *     tagline: 'Shell shockers',
 *     functions: [{ name, tier: 1|2|3, code: ['…'] }, …]
 *   };
 *
 * The game discovers packs from window.PACKS at boot, so a pack
 * file is just a <script> tag away. No build step. No imports.
 *
 * Each wave picks one function from the active packs. Falling
 * enemies are word-chunks from that function; the end-of-wave
 * mini-boss makes you type the function back from memory.
 * ============================================================ */
window.PACKS = {

  html: {
    name: 'HTML',
    color: '#ff7a59',
    glyph: '<>',
    tagline: 'Markup malware',
    functions: [
      // ----- tier 1 -----
      { name: 'page', tier: 1, code: [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head><title>hi</title></head>',
        '<body>hello</body>',
        '</html>'
      ]},
      { name: 'list', tier: 1, code: [
        '<ul class="todo">',
        '  <li>buy milk</li>',
        '  <li>walk dog</li>',
        '  <li>ship it</li>',
        '</ul>'
      ]},
      { name: 'image', tier: 1, code: [
        '<figure>',
        '  <img src="cat.png" alt="cat">',
        '  <figcaption>a cat</figcaption>',
        '</figure>'
      ]},
      { name: 'link', tier: 1, code: [
        '<a href="/about" class="btn">',
        '  about us',
        '</a>'
      ]},

      // ----- tier 2 -----
      { name: 'form', tier: 2, code: [
        '<form method="post">',
        '  <label>email</label>',
        '  <input type="email" required>',
        '  <button>submit</button>',
        '</form>'
      ]},
      { name: 'card', tier: 2, code: [
        '<article class="card">',
        '  <img src="hero.png" alt="hero">',
        '  <h2>title</h2>',
        '  <p>body text here.</p>',
        '  <a href="#">read more</a>',
        '</article>'
      ]},
      { name: 'navbar', tier: 2, code: [
        '<nav class="bar">',
        '  <a href="/">home</a>',
        '  <a href="/about">about</a>',
        '  <a href="/login">login</a>',
        '</nav>'
      ]},
      { name: 'table', tier: 2, code: [
        '<table>',
        '  <tr><th>name</th><th>score</th></tr>',
        '  <tr><td>ada</td><td>92</td></tr>',
        '  <tr><td>linus</td><td>88</td></tr>',
        '</table>'
      ]},

      // ----- tier 3 -----
      { name: 'app', tier: 3, code: [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="utf-8">',
        '  <title>app</title>',
        '</head>',
        '<body>',
        '  <main id="root"></main>',
        '  <script src="app.js"></script>',
        '</body>',
        '</html>'
      ]},
      { name: 'dialog', tier: 3, code: [
        '<dialog id="confirm">',
        '  <form method="dialog">',
        '    <p>are you sure?</p>',
        '    <button value="yes">yes</button>',
        '    <button value="no">no</button>',
        '  </form>',
        '</dialog>'
      ]},
    ]
  },

  css: {
    name: 'CSS',
    color: '#7ad3ff',
    glyph: '{}',
    tagline: 'Cascading chaos',
    functions: [
      // ----- tier 1 -----
      { name: 'center', tier: 1, code: [
        '.center {',
        '  display: flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '}'
      ]},
      { name: 'card', tier: 1, code: [
        '.card {',
        '  padding: 16px;',
        '  border-radius: 12px;',
        '  background: #fff;',
        '  box-shadow: 0 4px 12px #0002;',
        '}'
      ]},
      { name: 'reset', tier: 1, code: [
        '* {',
        '  margin: 0;',
        '  padding: 0;',
        '  box-sizing: border-box;',
        '}'
      ]},
      { name: 'text', tier: 1, code: [
        'h1 {',
        '  font-size: 32px;',
        '  font-weight: 800;',
        '  color: #1a1a1a;',
        '}'
      ]},

      // ----- tier 2 -----
      { name: 'hover', tier: 2, code: [
        '.btn {',
        '  transition: 0.2s ease;',
        '  background: #1a73e8;',
        '}',
        '.btn:hover {',
        '  background: #155ab8;',
        '  transform: translateY(-1px);',
        '}'
      ]},
      { name: 'grid', tier: 2, code: [
        '.grid {',
        '  display: grid;',
        '  grid-template-columns: repeat(3, 1fr);',
        '  gap: 12px;',
        '}'
      ]},
      { name: 'navbar', tier: 2, code: [
        '.nav {',
        '  display: flex;',
        '  gap: 16px;',
        '  padding: 12px 24px;',
        '  background: #0e1420;',
        '}'
      ]},

      // ----- tier 3 -----
      { name: 'animate', tier: 3, code: [
        '@keyframes spin {',
        '  from { transform: rotate(0deg); }',
        '  to   { transform: rotate(360deg); }',
        '}',
        '.loader {',
        '  animation: spin 1s linear infinite;',
        '}'
      ]},
      { name: 'media', tier: 3, code: [
        '@media (max-width: 600px) {',
        '  .grid {',
        '    grid-template-columns: 1fr;',
        '    gap: 8px;',
        '  }',
        '}'
      ]},
    ]
  },

  js: {
    name: 'JavaScript',
    color: '#ffd866',
    glyph: '()',
    tagline: 'Runtime rebellion',
    functions: [
      // ----- tier 1 -----
      { name: 'sum', tier: 1, code: [
        'function sum(arr) {',
        '  return arr.reduce((a, b) => a + b, 0);',
        '}'
      ]},
      { name: 'max', tier: 1, code: [
        'function max(arr) {',
        '  return Math.max(...arr);',
        '}'
      ]},
      { name: 'isEven', tier: 1, code: [
        'function isEven(n) {',
        '  return n % 2 === 0;',
        '}'
      ]},
      { name: 'greet', tier: 1, code: [
        'function greet(name) {',
        '  return `hello, ${name}!`;',
        '}'
      ]},
      { name: 'last', tier: 1, code: [
        'function last(arr) {',
        '  return arr[arr.length - 1];',
        '}'
      ]},
      { name: 'clamp', tier: 1, code: [
        'function clamp(v, lo, hi) {',
        '  return Math.min(hi, Math.max(lo, v));',
        '}'
      ]},
      { name: 'unique', tier: 1, code: [
        'function unique(arr) {',
        '  return [...new Set(arr)];',
        '}'
      ]},

      // ----- tier 2 -----
      { name: 'debounce', tier: 2, code: [
        'function debounce(fn, ms) {',
        '  let id;',
        '  return (...args) => {',
        '    clearTimeout(id);',
        '    id = setTimeout(() => fn(...args), ms);',
        '  };',
        '}'
      ]},
      { name: 'throttle', tier: 2, code: [
        'function throttle(fn, ms) {',
        '  let last = 0;',
        '  return (...args) => {',
        '    const now = Date.now();',
        '    if (now - last < ms) return;',
        '    last = now;',
        '    fn(...args);',
        '  };',
        '}'
      ]},
      { name: 'fetchJSON', tier: 2, code: [
        'async function fetchJSON(url) {',
        '  const res = await fetch(url);',
        '  if (!res.ok) throw new Error(res.status);',
        '  return res.json();',
        '}'
      ]},
      { name: 'sleep', tier: 2, code: [
        'function sleep(ms) {',
        '  return new Promise(r => setTimeout(r, ms));',
        '}'
      ]},
      { name: 'groupBy', tier: 2, code: [
        'function groupBy(arr, key) {',
        '  return arr.reduce((acc, x) => {',
        '    (acc[x[key]] ||= []).push(x);',
        '    return acc;',
        '  }, {});',
        '}'
      ]},

      // ----- tier 3 -----
      { name: 'pipeline', tier: 3, code: [
        'const result = users',
        '  .filter(u => u.active)',
        '  .map(u => u.score)',
        '  .reduce((a, b) => a + b, 0);'
      ]},
      { name: 'compile', tier: 3, code: [
        'async function compile(src) {',
        '  const tokens = lex(src);',
        '  const ast = parse(tokens);',
        '  const ir = lower(ast);',
        '  return emit(ir);',
        '}'
      ]},
      { name: 'memoize', tier: 3, code: [
        'function memoize(fn) {',
        '  const cache = new Map();',
        '  return (...args) => {',
        '    const k = JSON.stringify(args);',
        '    if (!cache.has(k)) cache.set(k, fn(...args));',
        '    return cache.get(k);',
        '  };',
        '}'
      ]},
      { name: 'retry', tier: 3, code: [
        'async function retry(fn, n = 3) {',
        '  for (let i = 0; i < n; i++) {',
        '    try { return await fn(); }',
        '    catch (e) { if (i === n - 1) throw e; }',
        '  }',
        '}'
      ]},
    ]
  },

  unix: {
    name: 'UNIX',
    color: '#9be7ff',
    glyph: '$_',
    tagline: 'Shell shockers',
    functions: [
      // ----- tier 1 -----
      { name: 'list', tier: 1, code: [
        'ls -la',
        '  --color=auto',
        '  --group-directories-first'
      ]},
      { name: 'count', tier: 1, code: [
        'wc -l',
        '  *.txt',
        '  | sort -n'
      ]},
      { name: 'find', tier: 1, code: [
        'find . -name "*.js"',
        '  -not -path "*/node_modules/*"',
        '  -print'
      ]},
      { name: 'tail', tier: 1, code: [
        'tail -f app.log',
        '  | grep -i error'
      ]},

      // ----- tier 2 -----
      { name: 'logreport', tier: 2, code: [
        'cat access.log',
        '  | grep ERROR',
        '  | awk \'{print $4}\'',
        '  | sort | uniq -c',
        '  | sort -rn | head'
      ]},
      { name: 'backup', tier: 2, code: [
        'rsync -avz \\',
        '  --exclude .git \\',
        '  ./src/ \\',
        '  user@host:/srv/backup/'
      ]},
      { name: 'killproc', tier: 2, code: [
        'ps aux',
        '  | grep node',
        '  | awk \'{print $2}\'',
        '  | xargs kill -9'
      ]},

      // ----- tier 3 -----
      { name: 'deploy', tier: 3, code: [
        'tar -czf release.tgz dist/',
        'scp release.tgz prod:/tmp/',
        'ssh prod "cd /srv/app \\',
        '  && tar -xzf /tmp/release.tgz \\',
        '  && systemctl restart app"'
      ]},
    ]
  },

  claude: {
    name: 'Claude',
    color: '#ff9a76',
    glyph: 'AI',
    tagline: 'Agentic syntax',
    functions: [
      // ----- tier 1 -----
      { name: 'init', tier: 1, code: [
        'const client = new Anthropic({',
        '  apiKey: process.env.API_KEY',
        '});'
      ]},
      { name: 'send', tier: 1, code: [
        'const res = await client.messages.create({',
        '  model: "claude-opus-4-7",',
        '  max_tokens: 1024,',
        '  messages: [{ role: "user", content: "hi" }]',
        '});'
      ]},
      { name: 'history', tier: 1, code: [
        'const messages = [',
        '  { role: "user", content: "what is 2+2?" },',
        '  { role: "assistant", content: "4" },',
        '  { role: "user", content: "and 3+3?" }',
        '];'
      ]},

      // ----- tier 2 -----
      { name: 'stream', tier: 2, code: [
        'const stream = client.messages.stream({',
        '  model: "claude-sonnet-4-6",',
        '  max_tokens: 2048,',
        '  messages: history',
        '});',
        'for await (const ev of stream) handle(ev);'
      ]},
      { name: 'cache', tier: 2, code: [
        'await client.messages.create({',
        '  model: "claude-opus-4-7",',
        '  system: [{',
        '    type: "text", text: bigDoc,',
        '    cache_control: { type: "ephemeral" }',
        '  }],',
        '  messages: q',
        '});'
      ]},

      // ----- tier 3 -----
      { name: 'tool', tier: 3, code: [
        'await client.messages.create({',
        '  model: "claude-opus-4-7",',
        '  tools: [{ name: "search", input_schema: {} }],',
        '  messages: [{ role: "user", content: query }]',
        '});'
      ]},
    ]
  },

};
