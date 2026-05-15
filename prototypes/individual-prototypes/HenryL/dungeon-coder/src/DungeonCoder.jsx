import { useState, useEffect, useRef, useCallback } from "react";

const GAME_CSS = `
  @keyframes monFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-12px)}30%{transform:translateX(12px)}45%{transform:translateX(-8px)}60%{transform:translateX(8px)}80%{transform:translateX(-4px)}}
  @keyframes pop{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-72px) scale(1.6);opacity:0}}
  @keyframes die{0%{opacity:1;transform:scale(1) rotate(0deg)}50%{opacity:.7;transform:scale(1.25) rotate(6deg);filter:brightness(2)}100%{opacity:0;transform:scale(.25) rotate(-15deg)}}
  @keyframes spawn{from{opacity:0;transform:scale(.7) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes timerDanger{0%,100%{box-shadow:0 0 8px #ef4444}50%{box-shadow:0 0 2px #ef4444}}
  @keyframes screenFlash{0%{opacity:.22}100%{opacity:0}}
  @keyframes titleGlow{0%,100%{text-shadow:0 0 20px #d4860a88}50%{text-shadow:0 0 40px #d4860aaa,0 0 80px #d4860a44}}
  @keyframes comboAnim{0%{transform:scale(1)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
  .dg-float{animation:monFloat 2.8s ease-in-out infinite}
  .dg-shake{animation:shake .45s ease-out}
  .dg-die{animation:die .7s ease-out forwards}
  .dg-spawn{animation:spawn .4s ease-out}
  .dg-pop{animation:pop 1.3s ease-out forwards;pointer-events:none}
  .dg-blink{animation:blink .75s ease-in-out infinite}
  .dg-title-glow{animation:titleGlow 2.5s ease-in-out infinite}
  .dg-combo-pulse{animation:comboAnim .4s ease-in-out}
  .dg-btn{cursor:pointer;font-family:'Fira Code',Courier,monospace;border-radius:3px;transition:transform .15s,box-shadow .15s}
  .dg-btn:hover{transform:translateY(-2px)}
  .dg-btn:active{transform:translateY(0) scale(.97)}
  .cc{color:#00e676}
  .cw{color:#ff5252;background:rgba(255,50,50,.18);border-radius:2px}
  .cp{color:#2a2a2a}
  .cur::after{content:'▋';animation:blink .8s infinite;color:#00e676;font-size:.85em;vertical-align:-.05em}
  .dg-hp-fill{transition:width .4s ease}
  .dg-mhp-fill{transition:width .35s ease}
  .dg-timer-fill{transition:width .1s linear}
  .hidden-input{position:absolute;inset:0;opacity:0;width:100%;height:100%;font-size:16px;cursor:text;background:transparent;border:none;outline:none}
`;

// ── PROCEDURAL MUSIC ENGINE ────────────────────────────────────────────────
// Uses the Web Audio API to generate dark dungeon ambiance — no files needed.
// Layers: sub drone · bass sequence · haunting bell melody · atmospheric hits · shimmer
const MELODY_NOTES = [110, 130.81, 146.83, 164.81, 196, 220, 261.63]; // A minor pentatonic
const BASS_NOTES   = [55, 49.0, 55, 43.65, 55, 51.91, 55, 46.25];

const createMusicEngine = () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();
  const allIntervals = [];
  const allTimeouts  = [];

  // Master chain
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.0;
  const masterFilter = ctx.createBiquadFilter();
  masterFilter.type = "lowpass";
  masterFilter.frequency.value = 2200;
  masterFilter.Q.value = 0.8;
  masterGain.connect(masterFilter);
  masterFilter.connect(ctx.destination);

  // Reverb bus via layered delays
  const reverbBus = ctx.createGain();
  reverbBus.gain.value = 0.25;
  reverbBus.connect(ctx.destination);
  [0.12, 0.27, 0.44, 0.7, 1.1].forEach((t, i) => {
    const d = ctx.createDelay(2);
    const g = ctx.createGain();
    d.delayTime.value = t;
    g.gain.value = 0.16 / (i + 1);
    reverbBus.connect(d);
    d.connect(g);
    g.connect(ctx.destination);
  });

  // ── LAYER 1: Dark drone — A1 + harmonics with slow breath LFO
  [
    { freq: 27.5,  type: "sine",     vol: 0.13, detune:  0 },
    { freq: 55,    type: "sine",     vol: 0.16, detune:  0 },
    { freq: 55,    type: "sine",     vol: 0.07, detune: -6 },
    { freq: 82.5,  type: "sine",     vol: 0.08, detune:  0 },
    { freq: 110,   type: "triangle", vol: 0.05, detune:  4 },
    { freq: 164.8, type: "triangle", vol: 0.03, detune:  0 },
  ].forEach(({ freq, type, vol, detune }) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.value = vol;
    // Breathing LFO
    const lfo  = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.07 + Math.random() * 0.08;
    lfoG.gain.value = vol * 0.35;
    lfo.connect(lfoG);
    lfoG.connect(gain.gain);
    lfo.start();
    osc.connect(gain);
    gain.connect(masterGain);
    gain.connect(reverbBus);
    osc.start();
  });

  // ── LAYER 2: Slow bass sequence
  let bassIdx = 0;
  const playBass = () => {
    const freq   = BASS_NOTES[bassIdx % BASS_NOTES.length];
    bassIdx++;
    const osc    = ctx.createOscillator();
    const gain   = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    filter.Q.value = 2;
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.20, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 2.2);
  };
  playBass();
  allIntervals.push(setInterval(playBass, 2200));

  // ── LAYER 3: Haunting bell melody (triangle, long decay)
  const phrases = [
    [0, 2, 1, 4, 0, 3],
    [5, 4, 2, 0, 1, 3],
    [2, 5, 3, 1, 4, 0],
    [0, 1, 3, 5, 2, 4],
    [4, 2, 0, 3, 1, 5],
  ];
  let phraseI = 0, noteI = 0;
  const playMelody = () => {
    const phrase = phrases[phraseI % phrases.length];
    const freq   = MELODY_NOTES[phrase[noteI % phrase.length]];
    noteI++;
    if (noteI >= phrase.length) { noteI = 0; phraseI++; }
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    osc.connect(gain);
    gain.connect(masterGain);
    gain.connect(reverbBus);
    osc.start(now);
    osc.stop(now + 2.6);
  };
  allTimeouts.push(setTimeout(() => {
    playMelody();
    allIntervals.push(setInterval(playMelody, 1750));
  }, 900));

  // ── LAYER 4: Occasional deep atmospheric hit
  const atmFreqs = [82.5, 73.42, 98, 110, 65.41];
  const playAtm = () => {
    const freq = atmFreqs[Math.floor(Math.random() * atmFreqs.length)];
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
    osc.connect(gain);
    gain.connect(reverbBus);
    osc.start(now);
    osc.stop(now + 4.5);
  };
  const scheduleAtm = () => {
    playAtm();
    allTimeouts.push(setTimeout(scheduleAtm, 3500 + Math.random() * 4000));
  };
  allTimeouts.push(setTimeout(scheduleAtm, 2000));

  // ── LAYER 5: High shimmer (distant chains / water drips)
  const shimmerFreqs = [880, 1046.5, 783.99, 987.77];
  const playShimmer = () => {
    const freq = shimmerFreqs[Math.floor(Math.random() * shimmerFreqs.length)];
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.012, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc.connect(gain);
    gain.connect(reverbBus);
    osc.start(now);
    osc.stop(now + 1.4);
  };
  const scheduleShimmer = () => {
    playShimmer();
    allTimeouts.push(setTimeout(scheduleShimmer, 1800 + Math.random() * 3200));
  };
  allTimeouts.push(setTimeout(scheduleShimmer, 3200));

  // Fade in over 3.5s
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.38, ctx.currentTime + 3.5);

  const setVolume = (v) => {
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.4);
  };

  const cleanup = () => {
    allIntervals.forEach(clearInterval);
    allTimeouts.forEach(clearTimeout);
    masterGain.gain.cancelScheduledValues(ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    setTimeout(() => { try { ctx.close(); } catch(e){} }, 600);
  };

  return { setVolume, cleanup, ctx };
};

// ── GAME DATA ──────────────────────────────────────────────────────────────
const MONSTERS = [
  { id:"sk", name:"Bone Revenant", tier:"COMMON",   hp:60,  t:10, dmg:15, diff:"easy",   col:"#c0ccd8",
    art:`    .~~.    \n   (x . x)  \n    )|||( \n   --+--   \n  / | | \\\n /  |_|  \\` },
  { id:"gb", name:"Cave Goblin",   tier:"COMMON",   hp:90,  t:9,  dmg:21, diff:"easy",   col:"#5ec464",
    art:`   /^_^\\   \n  ( o   o ) \n   \\_ v _/  \n  /|||||||\\\n / ||| ||| \\\n/__|___|___\\` },
  { id:"or", name:"Dungeon Orc",   tier:"UNCOMMON", hp:130, t:8,  dmg:27, diff:"medium", col:"#78c87a",
    art:`  [=(O O)=] \n   | \\_=_/ | \n  =|=======|=\n   |  / \\  | \n  /| /   \\ |\\\n / |/     \\| \\` },
  { id:"wr", name:"Shadow Wraith", tier:"ELITE",    hp:110, t:7,  dmg:34, diff:"medium", col:"#a870d8",
    art:` ~(o . o)~ \n  ~(\\ v /)~ \n~~|~~~~~~~|~~\n ~|       |~ \n~~\\~~~~~~~/ ~\n  ~~~   ~~~` },
  { id:"li", name:"Arcane Lich",   tier:"RARE",     hp:160, t:7,  dmg:41, diff:"hard",   col:"#5898d8",
    art:`  *(x . x)* \n  |||=|=|||  \n   \\|=|=/   \n    |=|=|    \n   /=|=\\   \n  /=|_|=\\` },
  { id:"dr", name:"THE WYRM",      tier:"BOSS",     hp:260, t:6,  dmg:52, diff:"boss",   col:"#ff7722",
    art:` <>=<>=<>= \n//(> 0   0 <)\\\\\n|| (=======) ||\n \\\\>       <//\n   /|=====|\\  \n  / |     | \\ ` },
];

const POOLS = {
  easy:  ["let x = 5;", 'const name = "hero";', "var hp = 100;", "let arr = [];", "x = x + 1;", "let done = false;", "x++;", "const MAX = 99;"],
  medium:["if (hp > 0) { }", "for (let i = 0; i < 5; i++) { }", "arr.push(item);", "console.log(x);", "return x * 2;", "const sum = a + b;", "arr.length === 0;"],
  hard:  ["function add(a, b) { return a + b; }", "const fn = (x) => x * x;", "arr.map(x => x * 2);", "arr.filter(x => x > 0);", "const { name, hp } = hero;", "JSON.stringify(data);"],
  boss:  ["async function attack() { return await deal(); }", "const [first, ...rest] = arr;", "arr.reduce((acc, x) => acc + x, 0);", "class Hero { constructor(n) { this.name = n; } }"],
};
const DMG_MAP  = { easy:20, medium:34, hard:50, boss:68 };
const DIFF_COL = { easy:"#22c55e", medium:"#f59e0b", hard:"#ef4444", boss:"#ff6600" };
const randChallenge = (diff) => { const p = POOLS[diff]; return p[Math.floor(Math.random() * p.length)]; };

// ── COMPONENT ──────────────────────────────────────────────────────────────
export default function DungeonCoder() {
  const [screen,    setScreen]    = useState("title");
  const [midx,      setMidx]      = useState(0);
  const [mhp,       setMhp]       = useState(0);
  const [php,       setPhp]       = useState(100);
  const [tl,        setTl]        = useState(10);
  const [mt,        setMt]        = useState(10);
  const [challenge, setChallenge] = useState("");
  const [typed,     setTyped]     = useState("");
  const [score,     setScore]     = useState(0);
  const [combo,     setCombo]     = useState(0);
  const [maxCombo,  setMaxCombo]  = useState(0);
  const [effects,   setEffects]   = useState([]);
  const [mAnim,     setMAnim]     = useState("");
  const [pShake,    setPShake]    = useState(false);
  const [iShake,    setIShake]    = useState(false);
  const [redFlash,  setRedFlash]  = useState(false);
  const [msg,       setMsg]       = useState("");
  const [dying,     setDying]     = useState(false);
  const [muted,     setMuted]     = useState(false);

  const inputRef = useRef(null);
  const fxId     = useRef(0);
  const sr       = useRef({});
  const musicRef = useRef(null);

  const mon = MONSTERS[Math.min(midx, MONSTERS.length - 1)];
  sr.current = { midx, mhp, php, tl, mt, dying, screen, monName: mon.name, monDmg: mon.dmg };

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GAME_CSS;
    document.head.appendChild(el);
    return () => { try { document.head.removeChild(el); } catch(e){} };
  }, []);

  useEffect(() => {
    const lk = document.createElement("link");
    lk.rel  = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Fira+Code:wght@400;500&display=swap";
    document.head.appendChild(lk);
    return () => { try { document.head.removeChild(lk); } catch(e){} };
  }, []);

  // Cleanup music on unmount
  useEffect(() => () => { musicRef.current?.cleanup(); }, []);

  useEffect(() => {
    if (screen === "playing") inputRef.current?.focus();
  }, [screen, challenge]);

  // Mute / unmute
  useEffect(() => {
    musicRef.current?.setVolume(muted ? 0 : 0.38);
  }, [muted]);

  const spawnFx = useCallback((text, col) => {
    const id = ++fxId.current;
    setEffects(prev => [...prev, { id, text, col }]);
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 1400);
  }, []);

  useEffect(() => {
    if (screen !== "playing") return;
    const tick = setInterval(() => {
      const s = sr.current;
      if (s.dying || s.screen !== "playing") return;
      const next = s.tl - 0.1;
      if (next <= 0) {
        const newPhp = s.php - s.monDmg;
        setPhp(Math.max(0, newPhp));
        if (newPhp <= 0) { setScreen("gameover"); return; }
        setPShake(true); setRedFlash(true);
        spawnFx(`-${s.monDmg} HP`, "#ff3344");
        setMsg(`⚔  ${s.monName} STRIKES YOU! -${s.monDmg} HP`);
        setTimeout(() => setPShake(false), 450);
        setTimeout(() => setRedFlash(false), 350);
        setTyped(""); setTl(s.mt);
      } else {
        setTl(next);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [screen, spawnFx]);

  useEffect(() => {
    if (screen === "playing") { const m = MONSTERS[midx]; setTl(m.t); setMt(m.t); }
  }, [midx]);

  const startGame = () => {
    // AudioContext must be created inside a user gesture (click)
    if (!musicRef.current) {
      musicRef.current = createMusicEngine();
    } else {
      musicRef.current.ctx?.resume?.();
    }
    if (muted) musicRef.current?.setVolume(0);

    const m = MONSTERS[0];
    setMidx(0); setMhp(m.hp); setPhp(100);
    setTl(m.t); setMt(m.t);
    setChallenge(randChallenge(m.diff)); setTyped("");
    setScore(0); setCombo(0); setMaxCombo(0);
    setEffects([]); setMAnim(""); setDying(false);
    setMsg(`A ${m.name} lurches from the darkness!`);
    setScreen("playing");
  };

  const handleTyped = (e) => {
    if (dying) return;
    const val = e.target.value;
    setTyped(val);
    if (val === challenge) {
      const nc    = combo + 1;
      const bonus = Math.floor(nc / 3) * 12;
      const d     = DMG_MAP[mon.diff] + bonus;
      setCombo(nc);
      setMaxCombo(mc => Math.max(mc, nc));
      setScore(s => s + d * 10);
      if (nc >= 5) { spawnFx(`COMBO x${nc}!  -${d}`, "#ffdd44"); setMsg(`🔥 COMBO x${nc}! ${d} damage!`); }
      else         { spawnFx(`-${d}`, "#00e676");                 setMsg(`✓ ${d} damage!`); }
      const nhp = mhp - d;
      if (nhp <= 0) {
        setMhp(0); setDying(true); setMAnim("dg-die");
        const kb = mon.hp * 15;
        setScore(s => s + kb);
        setMsg(`⚡ ${mon.name} DESTROYED!  +${kb} bonus pts`);
        setTimeout(() => {
          setMAnim(""); setDying(false);
          const ni = midx + 1;
          if (ni >= MONSTERS.length) { setScreen("victory"); return; }
          const nm = MONSTERS[ni];
          setMidx(ni); setMhp(nm.hp);
          setTl(nm.t); setMt(nm.t);
          setChallenge(randChallenge(nm.diff)); setTyped("");
          setMsg(`A ${nm.name} emerges from the shadows!`);
          setMAnim("dg-spawn");
          setTimeout(() => setMAnim(""), 400);
        }, 800);
      } else {
        setMhp(nhp); setMAnim("dg-shake");
        setTimeout(() => setMAnim(""), 450);
        setTl(mt); setChallenge(randChallenge(mon.diff)); setTyped("");
      }
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && typed !== challenge && typed.length > 0) {
      setCombo(0); setIShake(true);
      setTimeout(() => setIShake(false), 450);
      setPhp(hp => { const n = hp - 5; if (n <= 0) { setScreen("gameover"); return 0; } return n; });
      spawnFx("-5 HP", "#ff9944");
      setMsg("✗ Syntax error!  -5 HP  —  Combo reset.");
      setTyped("");
    }
  };

  const renderChars = () =>
    challenge.split("").map((ch, i) => {
      const isCursor = i === typed.length;
      const cls = i < typed.length ? (typed[i] === ch ? "cc" : "cw") : "cp";
      return <span key={i} className={`${cls}${isCursor ? " cur" : ""}`}>{ch}</span>;
    });

  const timerPct = Math.max(0, (tl / mt) * 100);
  const timerCol = timerPct > 60 ? "#22c55e" : timerPct > 25 ? "#f59e0b" : "#ef4444";
  const phpPct   = (php / 100) * 100;

  const S = {
    root:  { fontFamily:"'Fira Code',Courier,monospace", background:"#070305", color:"#c8b898", minHeight:"100vh" },
    center:{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:"2rem", gap:"1.5rem" },
    panel: { background:"rgba(10,6,4,.88)", border:"1px solid #1e1208", borderRadius:6 },
    term:  { background:"rgba(0,7,2,.92)", border:"1px solid #0a2d10", borderRadius:6 },
    hud:   { display:"flex", alignItems:"center", gap:".75rem", padding:".6rem .9rem" },
    arena: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"1.25rem 1rem 1rem", position:"relative", minHeight:320 },
  };

  const MuteBtn = () => (
    <button className="dg-btn" onClick={() => setMuted(m => !m)} title={muted ? "Unmute" : "Mute"}
      style={{ position:"fixed", bottom:14, right:14, zIndex:200,
        background:"rgba(10,6,4,.88)", border:"1px solid #2a1a08",
        color: muted ? "#3a2a14" : "#c8860a", fontSize:"1.1rem", padding:"6px 10px", lineHeight:1 }}>
      {muted ? "🔇" : "🔊"}
    </button>
  );

  // ── TITLE ──────────────────────────────────────────────────────────────────
  if (screen === "title") return (
    <div style={S.root}>
      <MuteBtn />
      <div style={S.center}>
        <div style={{color:"#2a1a06",fontSize:".6rem",letterSpacing:".8em"}}>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:".65rem",letterSpacing:".55em",color:"#5a3a0e",marginBottom:".45rem"}}>ENTER THE</div>
          <h1 className="dg-title-glow" style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:"3.6rem",fontWeight:900,letterSpacing:".12em",lineHeight:1.05,background:"linear-gradient(180deg,#f0b030,#d4860a,#6a3800)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:0}}>
            DUNGEON<br/>CODER
          </h1>
          <div style={{fontSize:".62rem",letterSpacing:".5em",color:"#4a3008",marginTop:".4rem"}}>TYPE CODE — SLAY MONSTERS</div>
        </div>
        <pre style={{color:"#1e1008",fontSize:".74rem",lineHeight:1.5,fontFamily:"'Fira Code',Courier,monospace"}}>
{`╔════════════════════╗
║  ☠    ⚔    ♦    ⚡ ║
║                    ║
║   6 MONSTERS LURK  ║
║   IN THE DARKNESS  ║
║   TYPE TO SURVIVE  ║
╚════════════════════╝`}
        </pre>
        <div style={{...S.panel, padding:"1.25rem 1.5rem", maxWidth:400, width:"100%"}}>
          <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:".65rem",letterSpacing:".25em",color:"#c8860a",marginBottom:".75rem"}}>HOW TO PLAY</div>
          <div style={{fontSize:".71rem",color:"#7a6a50",lineHeight:2.1}}>
            <span style={{color:"#d06020"}}>→</span> Type the code <span style={{color:"#00e676"}}>exactly</span> to damage the monster<br/>
            <span style={{color:"#d06020"}}>→</span> Each hit resets the monster's attack timer<br/>
            <span style={{color:"#d06020"}}>→</span> Chain 3+ hits for <span style={{color:"#ffdd44"}}>COMBO</span> bonus damage<br/>
            <span style={{color:"#d06020"}}>→</span> Monsters attack when the timer runs out<br/>
            <span style={{color:"#d06020"}}>→</span> Slay all <span style={{color:"#c8860a"}}>6 monsters</span> to claim glory!
          </div>
        </div>
        <button className="dg-btn" onClick={startGame} style={{background:"linear-gradient(135deg,#6b0f0f,#9b1a1a)",border:"1px solid #ff4433",color:"#fff",padding:".95rem 2.8rem",fontSize:"1rem",fontFamily:"'Cinzel',Georgia,serif",fontWeight:700,letterSpacing:".2em",boxShadow:"0 4px 24px rgba(200,0,0,.25)"}}>
          ⚔  BEGIN QUEST  ⚔
        </button>
        <div style={{color:"#2a1a06",fontSize:".55rem",color:"#3a2a14",letterSpacing:".12em"}}>🔊 Music starts when you begin the quest</div>
        <div style={{color:"#2a1a06",fontSize:".6rem",letterSpacing:".8em"}}>✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦</div>
      </div>
    </div>
  );

  // ── GAME OVER ──────────────────────────────────────────────────────────────
  if (screen === "gameover") return (
    <div style={S.root}>
      <MuteBtn />
      <div style={S.center}>
        <div style={{fontSize:"4.5rem",color:"#2a0808"}}>☠</div>
        <div style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:"2.8rem",fontWeight:900,color:"#cc1a1a",letterSpacing:".15em"}}>SLAIN</div>
        <div style={{color:"#7a5a40",fontSize:".82rem"}}>Defeated by the {mon.name}</div>
        <div style={{...S.panel, padding:"1.5rem", textAlign:"center", minWidth:220}}>
          <div style={{color:"#4a3a18",fontSize:".58rem",letterSpacing:".3em",marginBottom:".5rem"}}>FINAL SCORE</div>
          <div style={{color:"#d4860a",fontSize:"2.2rem",fontWeight:700}}>{score.toLocaleString()}</div>
          <div style={{color:"#3a2a10",fontSize:".72rem",marginTop:".5rem"}}>Max Combo: x{maxCombo}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:".75rem",alignItems:"center"}}>
          <button className="dg-btn" onClick={startGame} style={{background:"linear-gradient(135deg,#6b0f0f,#9b1a1a)",border:"1px solid #ff4433",color:"#fff",padding:".8rem 2.2rem",fontFamily:"'Cinzel',Georgia,serif",letterSpacing:".15em"}}>TRY AGAIN</button>
          <button className="dg-btn" onClick={()=>setScreen("title")} style={{background:"transparent",border:"1px solid #2a1a08",color:"#6a5a40",padding:".5rem 1.6rem",fontSize:".75rem",letterSpacing:".1em"}}>← MENU</button>
        </div>
      </div>
    </div>
  );

  // ── VICTORY ────────────────────────────────────────────────────────────────
  if (screen === "victory") return (
    <div style={S.root}>
      <MuteBtn />
      <div style={S.center}>
        <div style={{color:"#7a5a10",fontSize:".65rem",letterSpacing:".6em"}}>⚡  ALL MONSTERS SLAIN  ⚡</div>
        <h1 className="dg-title-glow" style={{fontFamily:"'Cinzel',Georgia,serif",fontSize:"3rem",fontWeight:900,letterSpacing:".15em",background:"linear-gradient(180deg,#ffe080,#d4860a,#8b5a00)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:0}}>
          CHAMPION
        </h1>
        <pre style={{color:"#2e2008",fontSize:".72rem",lineHeight:1.6}}>
{`  *   ⚡   *   ⚡   *
 / \\ * ⚔ * / \\ * ♦ *
*  ✦  *  ✦  *  ✦  *
 \\ / * ♦ * \\ / * ⚔ *
  *   ⚡   *   ⚡   *`}
        </pre>
        <div style={{...S.panel, padding:"1.5rem", textAlign:"center", minWidth:240}}>
          <div style={{color:"#4a3a18",fontSize:".58rem",letterSpacing:".3em",marginBottom:".5rem"}}>FINAL SCORE</div>
          <div style={{color:"#d4860a",fontSize:"2.4rem",fontWeight:700}}>{score.toLocaleString()}</div>
          <div style={{color:"#3a2a10",fontSize:".72rem",marginTop:".5rem"}}>Max Combo: x{maxCombo}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:".75rem",alignItems:"center"}}>
          <button className="dg-btn" onClick={startGame} style={{background:"linear-gradient(135deg,#2a1a00,#6b4a00)",border:"1px solid #d4860a",color:"#d4860a",padding:".85rem 2.4rem",fontFamily:"'Cinzel',Georgia,serif",letterSpacing:".18em"}}>PLAY AGAIN</button>
          <button className="dg-btn" onClick={()=>setScreen("title")} style={{background:"transparent",border:"1px solid #2a1a08",color:"#6a5a40",padding:".5rem 1.6rem",fontSize:".75rem",letterSpacing:".1em"}}>← MENU</button>
        </div>
      </div>
    </div>
  );

  // ── PLAYING ────────────────────────────────────────────────────────────────
  return (
    <div style={{...S.root, display:"flex", flexDirection:"column", maxWidth:660, margin:"0 auto", padding:".75rem", gap:".6rem"}}
      onClick={() => inputRef.current?.focus()}>
      <MuteBtn />
      {redFlash && <div style={{position:"fixed",inset:0,background:"rgba(255,0,0,.2)",pointerEvents:"none",zIndex:1000,animation:"screenFlash .35s ease-out forwards"}}/>}
      {effects.map(ef => (
        <div key={ef.id} className="dg-pop" style={{position:"fixed",top:"36%",left:"50%",transform:"translateX(-50%)",color:ef.col,fontSize:"1.7rem",fontWeight:800,zIndex:900,textShadow:`0 0 14px ${ef.col}`,whiteSpace:"nowrap"}}>
          {ef.text}
        </div>
      ))}
      {/* HUD */}
      <div className={pShake?"dg-shake":""} style={{...S.panel, ...S.hud}}>
        <div style={{flex:1}}>
          <div style={{fontSize:".54rem",color:"#3a2a14",letterSpacing:".2em",marginBottom:4}}>♥  HERO  —  {Math.max(0,php)}/100</div>
          <div style={{height:9,background:"#140505",borderRadius:5,overflow:"hidden",border:"1px solid #2e1010"}}>
            <div className="dg-hp-fill" style={{width:`${phpPct}%`,height:"100%",background:`linear-gradient(90deg,#8b0000,#dc143c,#ff6b6b)`,boxShadow:"0 0 6px rgba(220,20,60,.45)"}}/>
          </div>
        </div>
        <div style={{textAlign:"center",minWidth:85}}>
          <div style={{fontSize:".54rem",color:"#3a2a14",letterSpacing:".2em"}}>SCORE</div>
          <div style={{color:"#d4860a",fontWeight:700,fontSize:".92rem"}}>{score.toLocaleString()}</div>
        </div>
        <div style={{textAlign:"right",minWidth:62}}>
          <div style={{fontSize:".54rem",color:"#3a2a14",letterSpacing:".2em"}}>WAVE</div>
          <div style={{color:"#c8a060",fontSize:".88rem"}}>{midx+1}/{MONSTERS.length}</div>
        </div>
      </div>
      {/* Arena */}
      <div style={{...S.panel, ...S.arena}}>
        <div style={{position:"absolute",top:10,right:10,fontSize:".54rem",letterSpacing:".18em",color:mon.col,border:`1px solid ${mon.col}40`,padding:"2px 8px",borderRadius:2,opacity:.85}}>{mon.tier}</div>
        {combo >= 3 && (
          <div className="dg-combo-pulse" style={{position:"absolute",top:10,left:10,fontSize:".6rem",color:"#ffdd44",background:"rgba(28,18,0,.88)",border:"1px solid #786010",padding:"2px 10px",borderRadius:2,letterSpacing:".1em"}}>🔥 x{combo}</div>
        )}
        <div style={{fontFamily:"'Cinzel',Georgia,serif",color:mon.col,fontWeight:700,fontSize:"1.18rem",letterSpacing:".08em",marginBottom:".65rem",textShadow:`0 0 18px ${mon.col}55`}}>{mon.name}</div>
        <div style={{width:220,marginBottom:"1rem"}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".58rem",color:"#3a2a14",marginBottom:4}}>
            <span>HP</span><span style={{color:mon.col}}>{mhp} / {mon.hp}</span>
          </div>
          <div style={{height:6,background:"#140505",borderRadius:3,overflow:"hidden",border:`1px solid ${mon.col}30`}}>
            <div className="dg-mhp-fill" style={{width:`${(mhp/mon.hp)*100}%`,height:"100%",background:`linear-gradient(90deg,${mon.col}77,${mon.col})`,boxShadow:`0 0 6px ${mon.col}66`}}/>
          </div>
        </div>
        <pre className={`dg-float ${mAnim}`} style={{color:mon.col,fontSize:"1rem",lineHeight:1.6,textShadow:`0 0 10px ${mon.col}44`,textAlign:"center",marginBottom:".8rem",fontFamily:"'Fira Code',Courier,monospace"}}>
          {mon.art}
        </pre>
        <div style={{fontSize:".67rem",color:"#3e2e1a",fontStyle:"italic",textAlign:"center",minHeight:"1.2em",maxWidth:300}}>{msg}</div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:5,background:"#140505",borderRadius:"0 0 6px 6px",overflow:"hidden"}}>
          <div className="dg-timer-fill" style={{width:`${timerPct}%`,height:"100%",background:timerCol,boxShadow:timerPct<22?`0 0 8px ${timerCol}`:"none"}}/>
        </div>
        <div style={{position:"absolute",bottom:9,right:11,fontSize:".6rem",color:timerCol,letterSpacing:".04em"}}>
          {timerPct < 25 && <span className="dg-blink">⚠ </span>}
          {tl.toFixed(1)}s
        </div>
      </div>
      {/* Typing area */}
      <div className={iShake ? "dg-shake" : ""} style={{...S.term, padding:"1rem", cursor:"text"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".6rem"}}>
          <span style={{fontSize:".54rem",color:"#124818",letterSpacing:".22em"}}>//  TYPE TO ATTACK</span>
          <span style={{fontSize:".54rem",color:DIFF_COL[mon.diff],border:`1px solid ${DIFF_COL[mon.diff]}40`,padding:"2px 7px",borderRadius:2,letterSpacing:".1em"}}>
            {mon.diff.toUpperCase()}  ·  {DMG_MAP[mon.diff] + Math.floor(combo/3)*12} DMG
          </span>
        </div>
        <div style={{position:"relative",fontSize:"1.06rem",minHeight:"1.9em",lineHeight:1.65,padding:".15rem 0"}}>
          <div style={{position:"relative",zIndex:1}}>{renderChars()}</div>
          <input ref={inputRef} value={typed} onChange={handleTyped} onKeyDown={handleKey}
            className="hidden-input" spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:".45rem"}}>
          <span style={{fontSize:".58rem",color:"#0d3a12"}}>
            {typed.length > 0 ? `${typed.length}/${challenge.length} chars` : "click here and start typing..."}
          </span>
          <span style={{fontSize:".58rem",color:"#0d3a12"}}>Enter to submit</span>
        </div>
      </div>
    </div>
  );
}