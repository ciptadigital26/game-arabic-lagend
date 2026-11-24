/* ARABIC LEGENDS: RISE OF THE MASTER — enjin permainan (canvas 2D, tanpa pustaka luar) */
(() => {
'use strict';
const LV = window.AL_LEVELS, BOSSES = window.AL_BOSSES, SRC = window.AL_SOURCE;
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const RND = Math.random;
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (RND() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }
function arw(s) { return esc(s).replace(/«?[\u0600-\u06FF]+(?:[\s\u0600-\u06FF\u0640–-]*[\u0600-\u06FF])?»?/g, m => `<bdi class="ari">${m}</bdi>`); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function mix(h1, h2, t) { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const r = Math.round(lerp(a >> 16 & 255, b >> 16 & 255, t)), g = Math.round(lerp(a >> 8 & 255, b >> 8 & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t)); return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1); }

/* ====================== WORLD CONSTANTS ====================== */
const W = 420, ZH = 2000, NZ = 10, SUMMIT = 1300, WH = NZ * ZH + SUMMIT, ARENA_Y = 600;
const zTop = i => WH - (i + 1) * ZH, zBot = i => WH - i * ZH;
const floorY = i => i === 0 ? WH - 30 : zBot(i);
const zoneAt = y => y < SUMMIT + 0.5 ? NZ : clamp(Math.floor((WH - y + 0.5) / ZH), 0, NZ - 1);
const G = 2300, JUMP = 900, WALK = 160, RUN = 245;
const TIERS = ['A', 'B', 'C'], TIER_MS = ['Mudah', 'Sederhana', 'Tinggi'], TIER_F = [1, 1.5, 2];
const AR_KEYS = ['أ', 'ب', 'ج', 'د'];

const TH = [
 { sky: ['#5fb4f0', '#a9dcff', '#ffe3b5'], far: '#6aa38f', far2: '#4c8a72', haze: '#d9f3e6', top: '#79d65a', topHi: '#c4f59a', body: '#7c5b3b', body2: '#4f3923', edge: '#2e2013', part: 'leaf', enemy: '#57c46a', glow: '#fff3c4', day: 1 },
 { sky: ['#e2733e', '#f4a865', '#ffd9a3'], far: '#b0603e', far2: '#874528', haze: '#ffd6a6', top: '#ecc98d', topHi: '#fff1cc', body: '#b98a55', body2: '#7c5934', edge: '#46301a', part: 'dust', enemy: '#e0703a', glow: '#ffd27a', day: 1 },
 { sky: ['#041a22', '#0a3540', '#126058'], far: '#0a2b30', far2: '#0e3d3f', haze: '#2a8f86', top: '#34c9a5', topHi: '#a3ffe6', body: '#3b2f4c', body2: '#211a2e', edge: '#110d18', part: 'firefly', enemy: '#8b6cff', glow: '#7dffe0', day: 0 },
 { sky: ['#160c33', '#3c1d68', '#a54f9c'], far: '#2a1650', far2: '#3c2069', haze: '#c780d8', top: '#b993ff', topHi: '#ecdcff', body: '#4b3a7a', body2: '#2c2150', edge: '#170f2e', part: 'rune', enemy: '#ff7bd5', glow: '#e3b8ff', day: 0 },
 { sky: ['#33435c', '#677c97', '#bac8d9'], far: '#4c5a70', far2: '#37435a', haze: '#dbe3ee', top: '#a3b7cc', topHi: '#e8f1fa', body: '#5f6c82', body2: '#3b4557', edge: '#20262f', part: 'mist', enemy: '#7fc7ff', glow: '#d9f1ff', day: 1 },
 { sky: ['#44195a', '#c4467a', '#ffb56b'], far: '#5c2147', far2: '#3e1736', haze: '#ffc79c', top: '#f3dba3', topHi: '#fff7de', body: '#d9a066', body2: '#9c6a3c', edge: '#5a3a1e', part: 'lantern', enemy: '#ff5d73', glow: '#ffd38a', day: 1 },
 { sky: ['#03172a', '#093253', '#15607d'], far: '#062843', far2: '#0b3a5c', haze: '#3fd0ff', top: '#8ff8ff', topHi: '#ffffff', body: '#3f86b8', body2: '#235a86', edge: '#0f3554', part: 'digit', enemy: '#3fe0cf', glow: '#8ff6ff', day: 0 },
 { sky: ['#86acd3', '#cde0f1', '#f6f9fc'], far: '#9aaec4', far2: '#7d93ab', haze: '#ffffff', top: '#f4f8ff', topHi: '#ffffff', body: '#8c99ad', body2: '#5c6779', edge: '#353d4a', part: 'snow', enemy: '#6f8cff', glow: '#ffffff', day: 1 },
 { sky: ['#1a0705', '#5a160e', '#c43f1b'], far: '#2b0f0b', far2: '#3e1510', haze: '#ff7a3a', top: '#8e7d72', topHi: '#cfbdaf', body: '#4a3a33', body2: '#2c221e', edge: '#140e0c', part: 'ember', enemy: '#ff4a2a', glow: '#ff9a4a', day: 0 },
 { sky: ['#06060e', '#191831', '#3a345f'], far: '#15142a', far2: '#232042', haze: '#8a7cff', top: '#f3c45a', topHi: '#fff1ba', body: '#4b4466', body2: '#2c2843', edge: '#151326', part: 'storm', enemy: '#b18cff', glow: '#ffe7a0', day: 0 },
 { sky: ['#040716', '#0f1a45', '#2b2a6e'], far: '#141a3c', far2: '#1e2552', haze: '#7f6cff', top: '#ffe08a', topHi: '#fffbe6', body: '#c99a3c', body2: '#8a6420', edge: '#4a3410', part: 'star', enemy: '#ff5d73', glow: '#ffe7a0', day: 0 }
];

/* ====================== SAVE ====================== */
const DEMO = !!window.AL_DEMO;
const SAVE_BASE = DEMO ? 'arabic_legends_rise_demo_v1' : 'arabic_legends_rise_v1';
/* ---- Login murid: satu kata laluan untuk semua murid (disimpan sebagai cincangan SHA-256, bukan teks biasa) ---- */
const STUDENT_PW_HASH = 'bee5da0ac068aea0fbfeb2fd4c8f316e35397524c5d9e007a86f0bdd0433d711';
let STUDENT = null; try { STUDENT = sessionStorage.getItem('al_student') || null; } catch (e) { }
const normName = n => String(n).trim().replace(/\s+/g, ' ').toLowerCase();
const saveKey = () => STUDENT ? SAVE_BASE + '::' + normName(STUDENT) : SAVE_BASE;
function sha256(str) {
 const ascii = unescape(encodeURIComponent(str)); const rot = (v, a) => (v >>> a) | (v << (32 - a)); const maxWord = 4294967296;
 let i, j, result = ''; const words = [], bitLen = ascii.length * 8; let hash = [], k = [], pc = 0; const comp = {};
 for (let c = 2; pc < 64; c++) if (!comp[c]) { for (i = 0; i < 313; i += c) comp[i] = c; hash[pc] = (Math.pow(c, .5) * maxWord) | 0; k[pc++] = (Math.pow(c, 1 / 3) * maxWord) | 0; }
 let m = ascii + '\x80'; while (m.length % 64 - 56) m += '\x00';
 for (i = 0; i < m.length; i++) { j = m.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
 words[words.length] = (bitLen / maxWord) | 0; words[words.length] = bitLen;
 for (j = 0; j < words.length;) {
  const w = words.slice(j, j += 16), old = hash; hash = hash.slice(0, 8);
  for (i = 0; i < 64; i++) {
   const w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
   const t1 = hash[7] + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rot(w15, 7) ^ rot(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rot(w2, 17) ^ rot(w2, 19) ^ (w2 >>> 10))) | 0);
   const t2 = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
   hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0;
  }
  for (i = 0; i < 8; i++) hash[i] = (hash[i] + old[i]) | 0;
 }
 for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { const b = (hash[i] >> (j * 8)) & 255; result += (b < 16 ? '0' : '') + b.toString(16); }
 return result;
}
const checkStudentPw = pw => sha256('arabic-legends:' + pw) === STUDENT_PW_HASH;
let S = null;
function freshSave(name) {
 return {
  v: 1, name: name || 'Wira', plv: 1, exp: 0, coins: 0, gems: 0, lives: 3, hp: 100, maxHp: 100, power: 0,
  coinLife: 0, kills: 0, chests: 0, score: 0, cor: 0, wr: 0, playT: 0,
  z: Array.from({ length: NZ }, () => ({ st: [0, 1, 2].map(() => ({ done: false, best: 0, stars: 0 })), cleared: false, score: 0, cor: 0, wr: 0, time: 0, exp: 0, coins: 0 })),
  bosses: [false, false, false], bossStats: [null, null, null], badges: {}, abil: {}, cp: { x: W / 2, y: WH - 30 },
  taken: { c: [], g: [], ch: [] }, finished: false, started: Date.now()
 };
}
function loadSave() {
 try {
  const r = localStorage.getItem(saveKey());
  if (r) { const d = JSON.parse(r); return d && d.v === 1 ? d : null; }
  if (STUDENT) { const old = JSON.parse(localStorage.getItem(SAVE_BASE) || 'null'); if (old && old.v === 1 && normName(old.name) === normName(STUDENT)) return old; } // simpanan lama sebelum login
  return null;
 } catch (e) { return null; }
}
let saveTimer = 0;
function save() { if (!S || Game.state === 'title') return; try { localStorage.setItem(saveKey(), JSON.stringify(S)); } catch (e) { } recordProgress(); }
/* ---- Rekod murid untuk Dashboard Guru: localStorage['gamedata'] ---- */
const GD_KEY = 'gamedata';
function readGD() { try { const d = JSON.parse(localStorage.getItem(GD_KEY) || '[]'); return Array.isArray(d) ? d : []; } catch (e) { return []; } }
function writeGD(list) { try { localStorage.setItem(GD_KEY, JSON.stringify(list)); } catch (e) { } }
function curLevelOf(sv) { if (sv.finished) return 11; const i = sv.z.findIndex(z => !z.cleared); return i < 0 ? 11 : i + 1; }
/* ---- Penyegerakan awan (Cloudflare D1 melalui /api). Jika API tiada, permainan kekal 100% localStorage. ---- */
const CLOUD = { on: false, token: null, timer: null, warned: false };
try { CLOUD.token = sessionStorage.getItem('al_token') || null; } catch (e) { }
CLOUD.ready = (async () => {
 if (!/^https?:$/.test(location.protocol)) return false;
 try { const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 4000); const r = await fetch('/api/health', { cache: 'no-store', signal: ctl.signal }); clearTimeout(tm); if (!r.ok) return false; const d = await r.json(); CLOUD.on = !!(d && d.ok && d.db); } catch (e) { CLOUD.on = false; }
 return CLOUD.on;
})();
function cloudPush(now) {
 if (!CLOUD.on || !CLOUD.token || !S) return;
 clearTimeout(CLOUD.timer);
 const send = () => {
  const body = JSON.stringify({ save: S, record: buildRecord() });
  fetch('/api/progress', { method: 'POST', keepalive: body.length < 60000, headers: { 'content-type': 'application/json', authorization: 'Bearer ' + CLOUD.token }, body })
   .then(r => { if (r.status === 401) { CLOUD.token = null; try { sessionStorage.removeItem('al_token'); } catch (e) { } if (!CLOUD.warned) { CLOUD.warned = true; toast('!', 'Sesi tamat — kemajuan disimpan dalam peranti ini. Log masuk semula untuk segerak ke awan.'); } } })
   .catch(() => { });
 };
 if (now) send(); else CLOUD.timer = setTimeout(send, 1200);
}
function buildRecord() {
 if (!S.pid) S.pid = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
 const tot = S.cor + S.wr;
 return { id: S.pid, nama: S.name, wira: S.gender === 'f' ? 'Perempuan' : 'Lelaki', level: curLevelOf(S), levelSelesai: S.z.filter(z => z.cleared).length,
  markah: S.score, betul: S.cor, salah: S.wr, ketepatan: tot ? Math.round(S.cor / tot * 100) : 0, bintang: S.z.reduce((a, z) => a + z.st.reduce((b, x) => b + x.stars, 0), 0),
  bos: S.bosses.filter(Boolean).length, tamat: !!S.finished, tahapWira: S.plv, masaMain: Math.round(S.playT), demo: DEMO,
  perLevel: S.z.map(z => z.st.map(x => x.best)), kemaskini: Date.now(), mula: S.started };
}
function recordProgress() {
 if (!S) return;
 cloudPush();
 if (!S.pid) S.pid = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
 const list = readGD(), rec = buildRecord();
 const i = list.findIndex(r => r.id === rec.id);
 if (i >= 0) { const old = list[i]; if (old.markah === rec.markah && old.level === rec.level && old.betul === rec.betul && old.salah === rec.salah && old.nama === rec.nama && old.bos === rec.bos) return; list[i] = rec; } else list.push(rec);
 writeGD(list);
}
function wipeSave() { try { localStorage.removeItem(saveKey()); } catch (e) { } }

/* ====================== AUDIO (WebAudio synth, maqam Hijaz) ====================== */
const AU = {
 c: null, on: true, m: null, nb: null, mus: null, step: 0, next: 0,
 init() {
  if (this.c) { if (this.c.state === 'suspended') this.c.resume(); return; }
  try {
   this.c = new (window.AudioContext || window.webkitAudioContext)();
   this.m = this.c.createGain(); this.m.gain.value = this.on ? .5 : 0; this.m.connect(this.c.destination);
   const b = this.c.createBuffer(1, this.c.sampleRate * .5, this.c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = RND() * 2 - 1; this.nb = b;
   this.mus = this.c.createGain(); this.mus.gain.value = .16; this.mus.connect(this.m);
   setInterval(() => this.sched(), 120);
  } catch (e) { this.c = null; }
 },
 setOn(v) { this.on = v; if (this.m) this.m.gain.value = v ? .5 : 0; },
 tone(f, d, type = 'sine', v = .2, slide = 0, delay = 0, dest) {
  if (!this.c || !this.on) return; const t = this.c.currentTime + delay; const o = this.c.createOscillator(), g = this.c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(dest || this.m); o.start(t); o.stop(t + d + .05);
 },
 noise(d, v = .2, f = 1200, delay = 0) {
  if (!this.c || !this.on) return; const t = this.c.currentTime + delay; const s = this.c.createBufferSource(); s.buffer = this.nb;
  const fl = this.c.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = f; const g = this.c.createGain();
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl); fl.connect(g); g.connect(this.m); s.start(t); s.stop(t + d + .05);
 },
 play(n) {
  switch (n) {
   case 'jump': this.tone(330, .14, 'square', .05, 260); break;
   case 'djump': this.tone(520, .16, 'square', .05, 400); break;
   case 'coin': this.tone(1320, .08, 'square', .05); this.tone(1760, .14, 'square', .05, 0, .06); break;
   case 'gem': [1046, 1318, 1568, 2093].forEach((f, i) => this.tone(f, .2, 'triangle', .08, 0, i * .05)); break;
   case 'slash': this.noise(.12, .18, 2600); this.tone(700, .1, 'sawtooth', .04, -400); break;
   case 'hit': this.noise(.1, .3, 900); this.tone(180, .12, 'square', .08, -90); break;
   case 'hurt': this.tone(220, .3, 'sawtooth', .12, -140); this.noise(.15, .2, 500); break;
   case 'ok': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .22, 'triangle', .12, 0, i * .07)); break;
   case 'no': this.tone(196, .35, 'sawtooth', .1, -60); this.tone(185, .35, 'square', .05, -50); break;
   case 'chest': [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, .25, 'triangle', .1, 0, i * .06)); break;
   case 'shield': this.tone(440, .4, 'sine', .12, 440); this.tone(660, .4, 'sine', .08, 330, .05); break;
   case 'power': this.tone(110, .8, 'sawtooth', .12, 880); this.noise(.6, .25, 300); break;
   case 'boss': this.tone(55, 1.2, 'sawtooth', .18, 20); this.noise(1, .2, 200); break;
   case 'bolt': this.noise(.5, .45, 3000); this.tone(90, .5, 'square', .12, -40); break;
   case 'fire': this.noise(.7, .35, 700); break;
   case 'win': [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => this.tone(f, .35, 'triangle', .12, 0, i * .12)); break;
   case 'gate': [294, 370, 440, 587].forEach((f, i) => this.tone(f, .6, 'sine', .12, 0, i * .12)); break;
   case 'step': this.noise(.04, .04, 400); break;
   case 'up': [392, 494, 587, 784].forEach((f, i) => this.tone(f, .3, 'square', .06, 0, i * .08)); break;
  }
 },
 /* ambient melody in maqam Hijaz (D Eb F# G A Bb C D) */
 sched() {
  if (!this.c || !this.on || !Game.playing()) return;
  const sc = [293.7, 311.1, 370, 392, 440, 466.2, 523.3, 587.3];
  const pat = [0, 2, 3, 4, 3, 2, 1, 0, 4, 5, 4, 3, 2, 3, 2, 1];
  while (this.next < this.c.currentTime + .3) {
   if (this.next < this.c.currentTime) this.next = this.c.currentTime + .05;
   const i = this.step++ % 32; const nn = pat[i % 16];
   if (i % 2 === 0) this.tone(sc[nn] / (i % 8 === 0 ? 2 : 1), .5, 'triangle', .35, 0, this.next - this.c.currentTime, this.mus);
   if (i % 16 === 0) this.tone(73.4, 3.6, 'sine', .4, 0, this.next - this.c.currentTime, this.mus);
   this.next += .3;
  }
 }
};

/* ====================== INPUT ====================== */
const K = { left: 0, right: 0, up: 0, down: 0, jump: 0, attack: 0, shield: 0, power: 0 };
const pressed = {};
function press(k) { if (!K[k]) pressed[k] = 1; K[k] = 1; }
function release(k) { K[k] = 0; }
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'jump', KeyJ: 'attack', KeyK: 'shield', KeyL: 'power' };
addEventListener('keydown', e => {
 AU.init();
 if (Quiz.open && Quiz.keydown(e)) return;
 const tgt = e.target; if (tgt && (tgt.tagName === 'INPUT')) return;
 if (e.code === 'Escape' || e.code === 'KeyP') { if (Game.state === 'play' || Game.state === 'shoot') { Screens.pause(); } else if (Game.state === 'pause') { Screens.close(); } return; }
 const k = KEYMAP[e.code]; if (k) { press(k); e.preventDefault(); }
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) release(k); });
addEventListener('blur', () => { for (const k in K) K[k] = 0; });
function setupTouch() {
 document.querySelectorAll('#touch .tb').forEach(b => {
  const k = b.dataset.k;
  const down = e => { e.preventDefault(); AU.init(); try { b.setPointerCapture(e.pointerId); } catch (_) { } press(k); b.classList.add('on'); };
  const up = e => { e.preventDefault(); release(k); b.classList.remove('on'); };
  b.addEventListener('pointerdown', down); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  b.addEventListener('contextmenu', e => e.preventDefault());
 });
}
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

/* ====================== CANVAS / VIEW ====================== */
const cv = $('#game'); let ctx = cv.getContext('2d');
let DPR = 1, scale = 1, viewW = W, viewH = 700, offX = 0, SW = 0, SH = 0;
const bdCache = new Map(), sprCache = new Map();
function resize() {
 SW = innerWidth; SH = innerHeight; DPR = Math.min(devicePixelRatio || 1, 2);
 scale = Math.min(SW / W, SH / 680); viewW = SW / scale; viewH = SH / scale; offX = (viewW - W) / 2;
 cv.width = Math.round(SW * DPR); cv.height = Math.round(SH * DPR);
 bdCache.clear(); sprCache.clear();
}
addEventListener('resize', resize);

/* ====================== WORLD GENERATION ====================== */
let PL, SOL, LAD, COINS, GEMS, CHESTS, ENEM, SPK, JETS, ALT, GATES, ZONES, MID, SIGNS;
function newZone() { return { plats: [], sol: [], lad: [], coins: [], gems: [], chests: [], enem: [], spk: [], jets: [], alt: [], deco: [] }; }
function genWorld() {
 PL = []; SOL = []; LAD = []; COINS = []; GEMS = []; CHESTS = []; ENEM = []; SPK = []; JETS = []; ALT = []; GATES = []; MID = []; SIGNS = [];
 ZONES = Array.from({ length: NZ + 1 }, newZone);
 addSolid({ x: -80, y: WH - 30, w: W + 160, h: 90, kind: 'ground', z: 0 });
 const ids = { c: 0, g: 0, ch: 0 };
 for (let i = 0; i < NZ; i++) genZone(i, ids);
 genSummit(ids);
 for (let i = 0; i <= NZ; i++) genMid(i);
}
function addPlat(p) { p.h = p.h || 16; p.x0 = p.x; p.y0 = p.y; p.dx = 0; p.dy = 0; PL.push(p); ZONES[p.z].plats.push(p); return p; }
function addSolid(s) { SOL.push(s); ZONES[s.z].sol.push(s); return s; }
function overlapsAny(z, x, y, w, pad = 30) { for (const p of ZONES[z].plats) { if (x < p.x + p.w + pad && x + w > p.x - pad && Math.abs(p.y - y) < 60) return true; } return false; }
function genZone(i, ids) {
 const R = rng(7919 + i * 977), Z = ZONES[i];
 const fy = floorY(i), gy = zTop(i), lastY = gy + 36 + 72;
 const top0 = fy - 120, total = top0 - lastY, n = Math.max(8, Math.round(total / 124)), sp = total / n;
 const steps = []; for (let k = 0; k <= n; k++) steps.push({ y: top0 - k * sp, k });
 const alt = [Math.round(n * .24), Math.round(n * .53), Math.round(n * .8)];
 alt.forEach((a, t) => steps[a].altar = t);
 steps[n].final = true;
 // ladders
 let lb = 1 + (i % 3 === 1 ? 1 : 0), tries = 0;
 while (lb > 0 && tries++ < 40) {
  const k = 2 + Math.floor(R() * (n - 5));
  const bad = [k, k + 1, k + 2].some(q => steps[q].altar !== undefined || steps[q].final || steps[q].skip || steps[q].lad || steps[q].ladTop) || (steps[k - 1] && steps[k - 1].lad);
  if (bad) continue;
  steps[k].lad = true; steps[k + 1].skip = true; steps[k + 2].ladTop = true; lb--;
 }
 // x walk
 let x = W / 2 + (R() - .5) * 140, dir = R() < .5 ? -1 : 1, prevx = x;
 for (const s of steps) {
  if (s.skip) continue;
  if (s.k === 0) { s.x = x; continue; }
  if (s.ladTop) { s.x = clamp(prevx + (R() - .5) * 20, 70, W - 70); prevx = s.x; continue; }
  let dx = (70 + R() * 100) * dir;
  if (prevx + dx < 70 || prevx + dx > W - 70) { dir *= -1; dx = -dx; }
  s.x = clamp(prevx + dx, 70, W - 70); if (R() < .4) dir *= -1; prevx = s.x;
 }
 const pick = p => p < R();
 // build platforms
 const plats = [];
 for (const s of steps) {
  if (s.skip) continue;
  let kind = 'norm', w = 98 + R() * 56 - i * 2.2;
  if (s.altar !== undefined) { kind = 'altar'; w = 196; }
  else if (s.final) { kind = 'norm'; w = 150; }
  else if (s.lad || s.ladTop || s.k === 0) { kind = 'norm'; w = 120; }
  else { const r = R(); if (r < .17 + i * .012) kind = 'move'; else if (r < .24 + i * .014 && i >= 3) kind = 'vmove'; else if (r < .36 + i * .01) kind = 'bridge'; }
  if (kind === 'bridge') w = 210 + R() * 30;
  if (kind === 'move' || kind === 'vmove') w = 96;
  const cx = kind === 'altar' ? clamp(s.x, 104, W - 104) : s.x;
  const p = addPlat({ x: clamp(cx - w / 2, 0, W - w), y: Math.round(s.y), w: Math.round(w), kind, z: i });
  if (kind === 'move') p.mv = { ax: 40 + R() * 34, ay: 0, sp: .9 + R() * .6 + i * .04, ph: R() * TAU };
  if (kind === 'vmove') p.mv = { ax: 0, ay: 36 + R() * 18, sp: .9 + R() * .5, ph: R() * TAU };
  if (p.mv && p.mv.ax) { const lo = p.mv.ax, hi = W - p.w - p.mv.ax; p.x0 = p.x = clamp(p.x, lo, hi); }
  p.step = s; s.p = p; plats.push(p);
  if (s.altar !== undefined) { const a = { z: i, tier: s.altar, x: p.x + p.w / 2, y: p.y, plat: p, guardHit: 0, guardHp: 5 }; ALT.push(a); Z.alt.push(a); }
  if (s.lad) { const tgt = steps[s.k + 2]; const lx = (s.x + tgt.x) / 2; const L = { x: lx - 15, w: 30, top: Math.round(tgt.y), bot: Math.round(s.y), z: i }; LAD.push(L); Z.lad.push(L); s.p.ladder = L;
   for (let c = 1; c <= 3; c++) addCoin(ids, i, lx, L.bot - c * (L.bot - L.top) / 4); }
 }
 // decorate platforms
 const norm = plats.filter(p => p.kind === 'norm' && !p.step.final && p.step.k > 1 && !p.step.lad && !p.step.ladTop);
 for (const p of plats) {
  const cx = p.x + p.w / 2;
  if (p.kind === 'norm' && R() < .55) for (let c = -1; c <= 1; c++) addCoin(ids, i, cx + c * 22, p.y - 34 - (c === 0 ? 8 : 0));
  if (p.kind === 'bridge') for (let c = -2; c <= 2; c++) addCoin(ids, i, cx + c * 26, p.y - 30 - Math.cos(c * .7) * 14);
  if (p.kind === 'altar') for (let c = -1; c <= 1; c += 2) addCoin(ids, i, cx + c * 70, p.y - 30);
 }
 for (const p of norm) {
  if (p.w >= 108 && R() < .26 + i * .03) { const e = { type: 'slime', x: p.x + p.w / 2, y: p.y, min: p.x + 12, max: p.x + p.w - 12, dir: R() < .5 ? -1 : 1, sp: 34 + i * 5, hp: 2 + (i / 4 | 0), z: i, plat: p, t: R() * 9 }; e.maxhp = e.hp; ENEM.push(e); Z.enem.push(e); p.hasEnemy = true; }
  else if (i >= 1 && p.w >= 118 && R() < .28) { const left = R() < .5; const s = { x: left ? p.x + 4 : p.x + p.w - 38, y: p.y, w: 34, z: i }; SPK.push(s); Z.spk.push(s); p.hasSpike = true; }
  else if (i >= 7 && R() < .35) { const j = { x: p.x + p.w / 2 - 12, y: p.y, w: 24, h: 150, ph: R() * 2.6, z: i }; JETS.push(j); Z.jets.push(j); p.hasJet = true; }
 }
 const stepsReal = steps.filter(s => !s.skip && s.p);
 const nb = 1 + Math.floor(i / 2) + (i >= 1 ? 1 : 0);
 for (let b = 0; b < nb && i >= 1; b++) { const s = stepsReal[2 + Math.floor(R() * (stepsReal.length - 4))]; const e = { type: 'bat', ax: clamp(W / 2 + (R() - .5) * 240, 40, W - 40), ay: s.y - 80, x: 0, y: 0, hp: 1 + (i / 5 | 0), z: i, t: R() * 9, amp: 60 + R() * 60 }; e.maxhp = e.hp; ENEM.push(e); Z.enem.push(e); }
 if (i >= 6) for (let b = 0; b < Math.floor((i - 4) / 2); b++) { const s = stepsReal[3 + Math.floor(R() * (stepsReal.length - 6))]; const e = { type: 'wraith', ax: clamp(W / 2 + (R() - .5) * 200, 50, W - 50), ay: s.y - 60, x: 0, y: 0, hp: 3, z: i, t: R() * 9 }; e.x = e.ax; e.y = e.ay; e.maxhp = e.hp; ENEM.push(e); Z.enem.push(e); }
 // gem above a moving platform
 const movers = plats.filter(p => p.mv); if (movers.length) { const m = movers[Math.floor(R() * movers.length)]; addGem(ids, i, m.x0 + m.w / 2, m.y - 70); }
 // side ledge with chest
 const cand = plats.filter(p => p.kind === 'norm' && Math.abs(p.x + p.w / 2 - W / 2) < 95 && p.step.k > 2 && !p.step.final);
 if (cand.length) {
  const p = cand[Math.floor(R() * cand.length)]; const right = p.x + p.w / 2 < W / 2; const lx = right ? W - 86 : 6, ly = p.y - 34;
  if (!overlapsAny(i, lx, ly, 80, 6)) { const L = addPlat({ x: lx, y: ly, w: 80, kind: 'ledge', z: i }); addChest(ids, i, L.x + 40, L.y, false); }
 }
 // hidden passage → secret chest + gem
 const hc = plats.filter(p => (p.kind === 'norm' || p.kind === 'bridge') && p.step.k > 3 && p.step.k < n - 2);
 for (let tr = 0; tr < 6 && hc.length; tr++) {
  const p = hc[Math.floor(R() * hc.length)]; const cx = p.x + p.w / 2; const goLeft = cx > W / 2 ? false : true; const sx = goLeft ? -1 : 1;
  const pts = [[cx + sx * 120, p.y - 84], [cx + sx * 175, p.y - 168]].map(([a, b]) => [clamp(a - 36, 0, W - 72), b]);
  const endX = goLeft ? 0 : W - 90, endY = p.y - 250;
  if (pts.some(([a, b]) => overlapsAny(i, a, b, 72, 14)) || overlapsAny(i, endX, endY, 90, 14)) continue;
  pts.forEach(([a, b]) => addPlat({ x: a, y: b, w: 72, kind: 'hidden', z: i }));
  const E = addPlat({ x: endX, y: endY, w: 90, kind: 'hidden', z: i, secret: true });
  addChest(ids, i, E.x + 45, E.y, true); addGem(ids, i, E.x + 45, E.y - 70); break;
 }
 // gate
 const fp = plats[plats.length - 1], hx = clamp(fp.x + fp.w / 2, 90, W - 90);
 const gt = { z: i, x: hx, y: gy, open: false, t: 0 };
 addSolid({ x: -80, y: gy, w: hx - 50 + 80, h: 36, kind: 'gate', z: i });
 addSolid({ x: hx + 50, y: gy, w: W - hx - 50 + 80, h: 36, kind: 'gate', z: i });
 gt.seal = addSolid({ x: hx - 50, y: gy, w: 100, h: 36, kind: 'seal', z: i, gate: gt });
 GATES.push(gt);
 SIGNS.push({ z: i, x: i > 0 ? (GATES[i - 1].x < W / 2 ? W - 70 : 70) : (plats[0].x + plats[0].w / 2 < W / 2 ? W - 80 : 80), y: fy });
}
function genSummit(ids) {
 const z = NZ, fy = SUMMIT;
 const xs = [W / 2 - 100, W / 2 + 95, W / 2 - 85, W / 2 + 100, W / 2 - 10];
 xs.forEach((x, k) => { const p = addPlat({ x: x - 60, y: fy - 120 - k * 118, w: 120, kind: 'norm', z }); for (let c = -1; c <= 1; c++) addCoin(ids, z, x + c * 22, p.y - 34); });
 addPlat({ x: -60, y: ARENA_Y, w: W + 120, kind: 'arena', z, h: 30 });
 SIGNS.push({ z, x: GATES[NZ - 1].x < W / 2 ? W - 70 : 70, y: fy });
}
function addCoin(ids, z, x, y) { const c = { id: ids.c++, x, y, z, t: RND() * 6 }; COINS.push(c); ZONES[z].coins.push(c); }
function addGem(ids, z, x, y) { const g = { id: ids.g++, x, y, z, t: RND() * 6 }; GEMS.push(g); ZONES[z].gems.push(g); }
function addChest(ids, z, x, y, hidden) { const c = { id: ids.ch++, x, y, z, hidden, open: false, t: 0 }; CHESTS.push(c); ZONES[z].chests.push(c); }
function genMid(i) {
 const R = rng(333 + i * 71), top = i === NZ ? -200 : zTop(i), bot = i === NZ ? SUMMIT : zBot(i);
 const n = i === NZ ? 3 : 6;
 for (let k = 0; k < n; k++) MID.push({ z: i, x: (R() - .5) * (W + 700) + W / 2, y: lerp(bot, top, (k + .5) / n) + (R() - .5) * 200, s: .7 + R() * .7, r: R(), f: .42 + R() * .12 });
}
function applyTaken() {
 const tc = new Set(S.taken.c), tg = new Set(S.taken.g), th = new Set(S.taken.ch);
 COINS.forEach(c => c.taken = tc.has(c.id)); GEMS.forEach(g => g.taken = tg.has(g.id)); CHESTS.forEach(c => c.open = th.has(c.id));
 GATES.forEach(g => { if (gateReady(g.z) && !S.z[g.z].cleared && zoneAt(S.cp.y) > g.z) S.z[g.z].cleared = true; g.open = !DEMO && gateReady(g.z) && S.z[g.z].cleared; g.seal.off = g.open; g.t = g.open ? 9 : 0; });
}
function gateReady(z) { return S.z[z].st.every(s => s.done); }

/* ====================== ENTITIES ====================== */
const P = { x: W / 2, y: WH - 30, vx: 0, vy: 0, hw: 12, h: 52, face: 1, gnd: null, onG: false, coyote: 0, jbuf: 0, dbl: true, climb: false, atkT: 0, atkCd: 0, inv: 0, hurtT: 0, shieldT: 0, shieldCd: 0, runT: 0, t: 0, st: 'idle', dead: 0, win: 0, auto: null, landT: 0 };
let FX = [], PROJ = [], TXT = [];
const cam = { ox: null, y: WH - 700, shake: 0, sx: 0, sy: 0, flash: 0, flashC: '#fff', bolt: 0 };
let T = 0;

function spark(x, y, n, col, sp = 160, life = .6, size = 3, g = 300, type = 'spark') { for (let i = 0; i < n; i++) { const a = RND() * TAU, v = sp * (.3 + RND() * .7); FX.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - sp * .3, life, max: life, size: size * (.5 + RND()), col, g, type }); } if (FX.length > 700) FX.splice(0, FX.length - 700); }
function ftext(x, y, s, col = '#fff', size = 18) { TXT.push({ x, y, s, col, size, life: 1.2, max: 1.2 }); }
function shake(v) { cam.shake = Math.max(cam.shake, v); }
function flash(c, v = .6) { cam.flash = v; cam.flashC = c; }

/* ====================== GAME STATE ====================== */
const Game = {
 state: 'title', boss: null, ending: null, zoneShown: -1, lastZone: -1, slow: 0,
 playing() { return this.state === 'play' || this.state === 'quiz' || this.state === 'boss' || this.state === 'shoot'; },
};

function heroDmg() { return 1 + Math.floor(S.plv / 4); }
function addExp(v, z) {
 v = Math.round(v); S.exp += v; if (z !== undefined && z < NZ) S.z[z].exp += v;
 let need = expNeed(S.plv);
 while (S.exp >= need) { S.exp -= need; S.plv++; S.maxHp += 10; S.hp = S.maxHp; need = expNeed(S.plv); toast('ل', `Naik tahap! Wira kini Lv ${S.plv} (HP +10)`); AU.play('up'); spark(P.x, P.y - 30, 30, '#ffe08a', 220, 1); }
}
const expNeed = l => 60 + l * 40;
function addCoins(v, z) {
 S.coins += v; if (z !== undefined && z < NZ) S.z[z].coins += v; S.coinLife += v;
 while (S.coinLife >= 150) { S.coinLife -= 150; if (S.lives < 5) { S.lives++; toast('♥', 'Nyawa tambahan! (+1 setiap 150 coin)'); } }
}
function addPower(v) { const was = S.power >= 100; S.power = clamp(S.power + v, 0, 100); if (!was && S.power >= 100) toast('ق', 'Grammar Power penuh! Tekan L / butang POWER'); }
function damage(v, srcx) {
 if (P.inv > 0 || P.dead || P.win) return false;
 if (P.shieldT > 0) { spark(P.x, P.y - 26, 14, '#3fe0cf', 180, .5); AU.play('shield'); P.inv = .4; return false; }
 S.hp -= v; P.inv = 1.1; P.hurtT = .35; AU.play('hurt'); shake(8); flash('#ff3b5c', .25);
 ftext(P.x, P.y - 60, '-' + v, '#ff8095', 20);
 if (srcx !== undefined) { P.vx = (P.x < srcx ? -1 : 1) * 260; P.vy = -420; }
 if (S.hp <= 0) loseLife();
 return true;
}
function loseLife() {
 S.hp = 0; S.lives--; P.dead = 1.2; spark(P.x, P.y - 26, 40, '#ff5d73', 260, 1);
 if (S.lives <= 0) { setTimeout(() => Game.state === 'shoot' ? Boss.fail() : Screens.gameOver(), 900); }
}
function respawn() {
 P.dead = 0; S.hp = S.maxHp; if (Game.state === 'shoot') { P.x = W * .18; P.y = ARENA_Y; } else { P.x = S.cp.x; P.y = S.cp.y; } P.vx = P.vy = 0; P.inv = 2; P.climb = false;
 spark(P.x, P.y - 26, 30, '#3fe0cf', 200, .8);
}
function setCheckpoint(x, y, label) {
 if (Math.abs(S.cp.x - x) < 2 && Math.abs(S.cp.y - y) < 2) return;
 S.cp = { x, y }; S.hp = S.maxHp; toast('✓', label || 'Checkpoint diaktifkan · HP dipulihkan'); save();
}
const BADGES = [
 ['first', 'Langkah Pertama', 'Jawab soalan pertama dengan betul', 'ب'],
 ['combo5', 'Combo Master', 'Combo 5 jawapan betul', '٥'],
 ['combo10', 'Tak Terhenti', 'Combo 10 jawapan betul', '١٠'],
 ['perfect', 'Sempurna!', 'Peringkat 5/5 tanpa salah', '★'],
 ['topic', 'Penguasa Topik', '15/15 dalam satu level', 'م'],
 ['chest5', 'Pemburu Harta', 'Buka 5 peti harta', 'ك'],
 ['secret', 'Penjelajah Rahsia', 'Temui laluan tersembunyi', 'س'],
 ['gems10', 'Pengumpul Permata', 'Kumpul 10 permata', 'ج'],
 ['slayer', 'Pahlawan Ilmu', 'Tewaskan 20 musuh', 'ح'],
 ['half', 'Separuh Pendakian', 'Selesaikan Level 5', '½'],
 ['king', 'Penumbang Raja', 'Kalahkan The Grammar King', 'ن'],
 ['dragon', 'Penjinak Naga', 'Kalahkan The Sarf Dragon', 'ص'],
 ['emperor', 'Arabic Legend', 'Kalahkan The Arabic Emperor', 'ع']
];
function badge(id) { if (S.badges[id]) return; S.badges[id] = Date.now(); const b = BADGES.find(b => b[0] === id); toast(b[3], `Lencana: ${b[1]}`); AU.play('gem'); save(); }
const ABIL = [
 ['double', 'Lompatan Berganda', 'Lompat sekali lagi di udara', 2],
 ['wave', 'Gelombang Pedang', 'Arabic Sword melepaskan gelombang cahaya', 4],
 ['aegis', 'Perisai Agung', 'Knowledge Shield lebih lama, cooldown lebih pendek', 6],
 ['magnet', 'Magnet Ilmu', 'Coin dan permata tertarik kepada wira', 8]
];

/* ====================== UPDATE ====================== */
function update(dt) {
 T += dt; P.t += dt;
 // moving platforms
 for (const p of PL) if (p.mv) { const nx = p.x0 + Math.sin(T * p.mv.sp + p.mv.ph) * p.mv.ax, ny = p.y0 + Math.sin(T * p.mv.sp + p.mv.ph) * p.mv.ay; p.dx = nx - p.x; p.dy = ny - p.y; p.x = nx; p.y = ny; }
 if (Game.state === 'play') { updatePlayer(dt); updateWorld(dt); S.playT += dt; const z = zoneAt(P.y); if (z < NZ && !S.z[z].cleared) S.z[z].time += dt; }
 else if (Game.state === 'shoot') { updatePlayer(dt); S.playT += dt; }
 else if (Game.state === 'quiz' || Game.state === 'boss') { idlePlayer(dt); }
 else if (Game.state === 'ending') { Ending.update(dt); }
 else if (Game.state === 'title' || Game.state === 'pause' || Game.state === 'result' || Game.state === 'over') { if (Game.state === 'title') { cam.y = lerp(cam.y, WH - viewH, .05); } }
 const sdt = Game.slow > 0 ? dt * .35 : dt; Game.slow = Math.max(0, Game.slow - dt);
 if (Game.boss) Boss.update(sdt);
 dt = sdt;
 // fx
 for (let i = FX.length - 1; i >= 0; i--) { const f = FX[i]; f.life -= dt; if (f.life <= 0) { FX.splice(i, 1); continue; } f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= (1 - dt * 1.5); }
 for (let i = TXT.length - 1; i >= 0; i--) { const t = TXT[i]; t.life -= dt; t.y -= 40 * dt; if (t.life <= 0) TXT.splice(i, 1); }
 for (let i = PROJ.length - 1; i >= 0; i--) { const p = PROJ[i]; p.t += dt; if (p.update(p, dt) === false || p.t > p.dur) PROJ.splice(i, 1); }
 // camera
 let ty;
 if (Game.state === 'shoot') ty = ARENA_Y - viewH * .68;
 else if (Game.boss) ty = ARENA_Y - viewH * (SW >= 900 && SW / SH >= 4 / 3 ? .55 : .36);
 else if (Game.state === 'ending') ty = Ending.camY();
 else if (Game.state === 'quiz') ty = P.y - viewH * .32;
 else ty = P.y - viewH * .6;
 if (Game.state !== 'title') cam.y = lerp(cam.y, ty, clamp(dt * 5, 0, 1));
 cam.y = clamp(cam.y, -640, WH - viewH + 40);
 const wide = SW >= 900 && SW / SH >= 4 / 3, panel = Quiz.open && wide;
 const tox = panel ? Math.min((viewW - W) / 2, ((SW - 540) / 2) / scale - W / 2) : (viewW - W) / 2;
 cam.ox = cam.ox === null ? tox : lerp(cam.ox, tox, clamp(dt * 4, 0, 1));
 cam.shake = Math.max(0, cam.shake - dt * 30); cam.sx = (RND() - .5) * cam.shake; cam.sy = (RND() - .5) * cam.shake;
 cam.flash = Math.max(0, cam.flash - dt * 1.6); cam.bolt = Math.max(0, cam.bolt - dt * 3);
 saveTimer += dt; if (saveTimer > 6 && Game.playing()) { saveTimer = 0; save(); }
}
function idlePlayer(dt) {
 P.atkT = Math.max(0, P.atkT - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.inv = Math.max(0, P.inv - dt); P.shieldT = Math.max(0, P.shieldT - dt);
 if (P.auto !== null && P.auto !== undefined) { const d = P.auto - P.x; if (Math.abs(d) > 3) { P.vx = Math.sign(d) * WALK; P.face = Math.sign(d); P.x += P.vx * dt; P.st = 'walk'; } else { P.vx = 0; P.auto = null; P.face = Game.boss ? 1 : P.face; } }
 else { P.vx = 0; P.st = P.win > 0 ? 'win' : P.hurtT > 0 ? 'hurt' : P.atkT > 0 ? 'attack' : 'idle'; }
 if (P.win > 0) P.win -= dt;
}
function nearby(z) { const a = [ZONES[z]]; if (z > 0) a.push(ZONES[z - 1]); if (z < NZ) a.push(ZONES[z + 1]); return a; }
function updatePlayer(dt) {
 if (P.dead) { P.dead -= dt; if (P.dead <= 0) { if (S.lives > 0) respawn(); else P.dead = 0.001; } return; }
 const zs = nearby(zoneAt(P.y));
 P.inv = Math.max(0, P.inv - dt); P.hurtT = Math.max(0, P.hurtT - dt); P.atkCd = Math.max(0, P.atkCd - dt); P.atkT = Math.max(0, P.atkT - dt);
 P.shieldT = Math.max(0, P.shieldT - dt); P.shieldCd = Math.max(0, P.shieldCd - dt); P.coyote -= dt; P.jbuf -= dt; P.landT = Math.max(0, P.landT - dt);
 if (pressed.jump) P.jbuf = .13;
 const ax = (K.right ? 1 : 0) - (K.left ? 1 : 0);
 if (ax) { P.runT += dt; P.face = ax; } else P.runT = 0;
 const maxSp = P.runT > .35 ? RUN : WALK;
 if (P.hurtT <= 0) P.vx = lerp(P.vx, ax * maxSp, clamp(dt * (P.onG ? 16 : 8), 0, 1));
 // ladders
 let onLad = null; for (const Z of zs) for (const L of Z.lad) if (P.x > L.x - 4 && P.x < L.x + L.w + 4 && P.y > L.top - 2 && P.y - 10 < L.bot) onLad = L;
 if (onLad && (K.up || (K.jump && !P.onG) || (K.jump && P.y > onLad.top + 4 && isTouch)) && P.y > onLad.top + 1) P.climb = true;
 if (onLad && K.down && P.onG && P.y <= onLad.top + 2) { P.climb = true; P.y += 4; }
 if (!onLad) P.climb = false;
 if (P.climb) {
  P.vy = 0; const cs = 210; if (K.up || K.jump) P.y -= cs * dt; if (K.down) P.y += cs * dt;
  P.x = lerp(P.x, onLad.x + onLad.w / 2, clamp(dt * 10, 0, 1)); P.vx *= .5;
  if (P.y <= onLad.top) { P.y = onLad.top; P.climb = false; P.vy = 0; }
  if (P.y >= onLad.bot) { P.y = onLad.bot; P.climb = false; }
  P.onG = false; P.dbl = true;
  if (pressed.jump && !K.up && !isTouch) { P.climb = false; P.vy = -JUMP * .8; }
 } else {
  // jump
  if (P.jbuf > 0 && (P.onG || P.coyote > 0)) { P.vy = -JUMP; P.onG = false; P.coyote = 0; P.jbuf = 0; P.gnd = null; AU.play('jump'); spark(P.x, P.y, 6, '#ffffff', 80, .35, 2, 200, 'dust'); }
  else if (pressed.jump && !P.onG && P.coyote <= 0 && P.dbl && S.abil.double) { P.vy = -JUMP * .86; P.dbl = false; AU.play('djump'); spark(P.x, P.y, 14, '#3fe0cf', 150, .5, 2.5, 0); }
  if (!K.jump && P.vy < -320) P.vy += G * 1.4 * dt;
  P.vy = Math.min(P.vy + G * dt, 1150);
 }
 // carry on moving platform
 if (P.onG && P.gnd && P.gnd.mv) { P.x += P.gnd.dx; P.y = P.gnd.y; }
 // X move & solids
 P.x += P.vx * dt; P.x = clamp(P.x, P.hw, W - P.hw);
 for (const Z of zs) for (const s of Z.sol) { if (s.off) continue; if (overlap(s)) { if (P.vx > 0 || P.x < s.x + s.w / 2) P.x = Math.min(P.x, s.x - P.hw); else P.x = Math.max(P.x, s.x + s.w + P.hw); } }
 // Y move
 const py = P.y; const wasG = P.onG;
 if (!P.climb) P.y += P.vy * dt;
 P.onG = false; let ng = null;
 for (const Z of zs) for (const s of Z.sol) {
  if (s.off) continue;
  if (P.x + P.hw > s.x && P.x - P.hw < s.x + s.w && P.y > s.y && P.y - P.h < s.y + s.h) {
   if (P.vy >= 0 && py <= s.y + 12) { P.y = s.y; P.vy = 0; P.onG = true; ng = s; }
   else if (P.vy < 0) { P.y = s.y + s.h + P.h; P.vy = 30; }
  }
 }
 if (!P.climb && P.vy >= 0) for (const Z of zs) for (const p of Z.plats) {
  if (P.x + P.hw - 3 > p.x && P.x - P.hw + 3 < p.x + p.w) { const prevTop = p.y - p.dy; if (py <= prevTop + 2 && P.y >= p.y) { P.y = p.y; P.vy = 0; P.onG = true; ng = p; } }
 }
 if (P.onG) { if (!wasG) { P.landT = .12; spark(P.x, P.y, 5, '#ffffff', 60, .3, 2, 100, 'dust'); } P.coyote = .1; P.dbl = true; P.gnd = ng; } else if (wasG && P.vy >= 0) { P.gnd = null; }
 // attack
 const shooting = Game.state === 'shoot' && Game.boss && Boss.mode === 'shoot' && !Boss.shards;
 if (shooting) { if ((pressed.attack || K.attack) && P.atkCd <= 0) { P.atkCd = .2; P.atkT = .14; Boss.heroShoot(); } if (pressed.power) Boss.bomb(); }
 else if (pressed.attack && P.atkCd <= 0) { P.atkT = .28; P.atkCd = .36; AU.play('slash'); hitEnemies(); if (S.abil.wave) waveProj(); }
 if (pressed.shield && P.shieldCd <= 0) { const dur = S.abil.aegis ? 4.5 : 3; P.shieldT = dur; P.shieldCd = S.abil.aegis ? 7 : 10; AU.play('shield'); toast('ع', 'Knowledge Shield aktif'); }
 if (pressed.power && Game.state === 'play') { if (S.power >= 100) grammarPower(); else toast('ق', `Grammar Power ${Math.round(S.power)}% — jawab soalan dengan betul untuk mengisinya`); }
 // state for animation
 if (P.win > 0) P.win -= dt;
 P.st = P.win > 0 && P.onG ? 'win' : P.dead ? 'hurt' : P.hurtT > 0 ? 'hurt' : P.atkT > 0 ? 'attack' : P.climb ? 'climb' : !P.onG ? (P.vy < 0 ? 'jump' : 'fall') : Math.abs(P.vx) > 200 ? 'run' : Math.abs(P.vx) > 20 ? 'walk' : 'idle';
for (const k in pressed) if (Game.state === 'shoot') delete pressed[k];
 if ((P.st === 'run' || P.st === 'walk') && Math.floor(P.t * (P.st === 'run' ? 7 : 5)) !== Math.floor((P.t - dt) * (P.st === 'run' ? 7 : 5))) AU.play('step');
}
function overlap(s) { return P.x + P.hw > s.x && P.x - P.hw < s.x + s.w && P.y > s.y + 1 && P.y - P.h < s.y + s.h - 1; }
function hitEnemies() {
 const zs = nearby(zoneAt(P.y)); const hx = P.x + P.face * 34, hy = P.y - 28;
 for (const Z of zs) for (const e of Z.enem) { if (e.dead) continue; const ey = e.type === 'slime' ? e.y - 14 : e.y; if (Math.abs(e.x - hx) < 44 && Math.abs(ey - hy) < 40) hurtEnemy(e, heroDmg(), P.face); }
}
function hurtEnemy(e, d, dir) {
 e.hp -= d; e.hit = .2; e.kb = dir * 160; spark(e.x, e.type === 'slime' ? e.y - 14 : e.y, 10, '#ffffff', 180, .4); AU.play('hit');
 if (e.hp <= 0) {
  e.dead = true; e.respawn = 25; S.kills++; if (S.kills >= 20) badge('slayer');
  spark(e.x, e.type === 'slime' ? e.y - 14 : e.y, 26, TH[e.z].enemy, 220, .8, 3.5);
  addExp(6 + e.z, e.z); addCoins(3, e.z); ftext(e.x, e.y - 30, '+3 coin', '#ffe08a', 15); shake(4);
 }
}
function waveProj() {
 PROJ.push({ x: P.x + P.face * 20, y: P.y - 30, vx: P.face * 420, t: 0, dur: .6, kind: 'wave', dir: P.face,
  update(p, dt) { p.x += p.vx * dt; for (const Z of nearby(zoneAt(p.y))) for (const e of Z.enem) { if (e.dead || p.hitSet?.has(e)) continue; const ey = e.type === 'slime' ? e.y - 14 : e.y; if (Math.abs(e.x - p.x) < 26 && Math.abs(ey - p.y) < 34) { (p.hitSet ||= new Set()).add(e); hurtEnemy(e, 1, p.dir); } } return p.x > -40 && p.x < W + 40; } });
}
function grammarPower() {
 S.power = 0; AU.play('power'); flash('#ffe08a', .7); shake(14); P.inv = 1.2;
 ftext(P.x, P.y - 80, 'قُوَّةُ النَّحْوِ!', '#ffe08a', 26);
 spark(P.x, P.y - 30, 80, '#ffe08a', 420, 1.1, 4, 0);
 for (const Z of nearby(zoneAt(P.y))) {
  for (const e of Z.enem) if (!e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 340) { e.hp = 0; hurtEnemy(e, 99, Math.sign(e.x - P.x) || 1); }
  for (const c of Z.coins) if (!c.taken && Math.hypot(c.x - P.x, c.y - P.y) < 300) c.mag = true;
 }
}
function updateWorld(dt) {
 const z = zoneAt(P.y), zs = nearby(z);
 // enemies
 for (const Z of zs) for (const e of Z.enem) {
  e.t += dt; e.hit = Math.max(0, (e.hit || 0) - dt);
  if (e.dead) { e.respawn -= dt; if (e.respawn <= 0 && Math.abs(e.y - P.y) > viewH) { e.dead = false; e.hp = e.maxhp; } continue; }
  if (e.type === 'slime') {
   if (e.kb) { e.x += e.kb * dt; e.kb *= .85; if (Math.abs(e.kb) < 5) e.kb = 0; }
   e.x += e.dir * e.sp * dt; if (e.x < e.min) { e.x = e.min; e.dir = 1; } if (e.x > e.max) { e.x = e.max; e.dir = -1; } e.y = e.plat.y;
  } else if (e.type === 'bat') {
   e.x = e.ax + Math.sin(e.t * 1.3) * e.amp + (e.kb ? e.kb * .2 : 0); e.y = e.ay + Math.sin(e.t * 2.6) * 22; if (e.kb) e.kb *= .9;
  } else if (e.type === 'wraith') {
   const d = Math.hypot(P.x - e.x, P.y - 30 - e.y);
   if (d < 260) { e.x += (P.x - e.x) / d * 46 * dt; e.y += (P.y - 30 - e.y) / d * 46 * dt; } else { e.x = lerp(e.x, e.ax, dt * .5); e.y = lerp(e.y, e.ay + Math.sin(e.t) * 20, dt * .5); }
   if (e.kb) { e.x += e.kb * dt; e.kb *= .85; }
  }
  // contact
  const ey = e.type === 'slime' ? e.y - 14 : e.y, er = e.type === 'slime' ? 16 : 15;
  if (!P.dead && Math.abs(P.x - e.x) < P.hw + er && P.y > ey - er && P.y - P.h < ey + er) {
   if (e.type === 'slime' && P.vy > 120 && P.y < ey + 2) { hurtEnemy(e, 2, P.face); P.vy = -620; }
   else if (P.shieldT > 0) { e.kb = Math.sign(e.x - P.x) * 300; e.hit = .2; spark(e.x, ey, 8, '#3fe0cf', 160, .4); }
   else damage(10 + e.z, e.x);
  }
 }
 // spikes
 for (const Z of zs) for (const s of Z.spk) if (P.x + P.hw > s.x + 4 && P.x - P.hw < s.x + s.w - 4 && P.y <= s.y + 1 && P.y > s.y - 12) { damage(12 + s.z, s.x + s.w / 2); }
 // jets
 for (const Z of zs) for (const j of Z.jets) { const ph = (T + j.ph) % 2.6; j.on = ph > .9 && ph < 1.8; j.warn = ph > .4 && ph <= .9; if (j.on && P.x + P.hw > j.x && P.x - P.hw < j.x + j.w && P.y > j.y - j.h && P.y - P.h < j.y) damage(14 + j.z, j.x + 12); if (j.on && RND() < .7) FX.push({ x: j.x + 4 + RND() * 16, y: j.y - RND() * 10, vx: (RND() - .5) * 30, vy: -300 - RND() * 200, life: .5, max: .5, size: 5 + RND() * 4, col: RND() < .5 ? '#ffb347' : '#ff5a1f', g: -100, type: 'fire' }); }
 // pickups
 const mag = S.abil.magnet ? 90 : 0;
 for (const Z of zs) {
  for (const c of Z.coins) { if (c.taken) continue; c.t += dt; const dx = P.x - c.x, dy = P.y - 26 - c.y, d = Math.hypot(dx, dy);
   if (c.mag || d < mag) { c.x += dx / (d || 1) * 520 * dt; c.y += dy / (d || 1) * 520 * dt; }
   if (d < 24) { c.taken = true; S.taken.c.push(c.id); addCoins(1, c.z); AU.play('coin'); spark(c.x, c.y, 6, '#ffe08a', 100, .4, 2, 0); } }
  for (const g of Z.gems) { if (g.taken) continue; g.t += dt; const dx = P.x - g.x, dy = P.y - 26 - g.y, d = Math.hypot(dx, dy);
   if (d < mag) { g.x += dx / d * 420 * dt; g.y += dy / d * 420 * dt; }
   if (d < 26) { g.taken = true; S.taken.g.push(g.id); S.gems++; addExp(15, g.z); AU.play('gem'); spark(g.x, g.y, 18, '#3fe0cf', 160, .7, 3, 0); ftext(g.x, g.y - 20, '+1 permata', '#9ff6ee', 15); if (S.gems >= 10) badge('gems10'); } }
  for (const c of Z.chests) { if (c.open) continue; if (Math.abs(P.x - c.x) < 30 && Math.abs(P.y - c.y) < 30) openChest(c); }
 }
 // altars
 for (const a of ZONES[z].alt) {
  const on = P.onG && P.gnd === a.plat;
  if (on) { setCheckpoint(a.x - 30, a.plat.y, `Checkpoint Altar ${TIERS[a.tier]} diaktifkan · HP dipulihkan`); }
  if (on && !S.z[a.z].st[a.tier].done) { if (!a.armed) { a.armed = true; showPrompt(a); } }
  else if (a.armed && (!on)) { a.armed = false; hidePrompt(); }
 }
 // gate opening when standing below and ready
 if (z < NZ && !gateReady(z) && !promptAltar) { const g = GATES[z]; const near = P.y - g.y < 300 && P.y > g.y;
  const miss = ZONES[z].alt.find(a => !S.z[z].st[a.tier].done);
  if (near && miss) { if (gatePrompt !== miss) showGatePrompt(miss); } else if (gatePrompt) hideGatePrompt(); }
 else if (gatePrompt) hideGatePrompt();
 if (z < NZ) { const g = GATES[z]; if (gateReady(z) && !S.z[z].cleared && !Quiz.open) { finishZone(z); return; } if (!g.open && !DEMO && gateReady(z) && S.z[z].cleared) openGate(g); if (g.open) g.t += dt; }
 // zone entry
 if (z !== Game.lastZone) {
  if (z > Game.lastZone && Game.lastZone >= 0) {
   const pg = GATES[z - 1], sx = pg.x < W / 2 ? pg.x + 110 : pg.x - 110;
   if (z < NZ) { banner(`LEVEL ${z + 1}`, LV[z].ar, LV[z].name); setCheckpoint(sx, floorY(z), `Checkpoint Level ${z + 1}`); }
   else { banner('PUNCAK TERAKHIR', 'الْمُلُوكُ الثَّلَاثَةُ', 'The Three Kings'); setCheckpoint(sx, SUMMIT, 'Checkpoint Istana Emas'); }
  }
  Game.lastZone = z;
 }
 // boss trigger
 if (z === NZ && P.onG && P.gnd && P.gnd.kind === 'arena' && !Game.boss && !S.finished) Boss.start();
 for (const k in pressed) delete pressed[k];
}
function openChest(c) {
 c.open = true; S.taken.ch.push(c.id); S.chests++; AU.play('chest'); shake(4);
 const coins = c.hidden ? 30 : 15; addCoins(coins, c.z); addExp(c.hidden ? 40 : 20, c.z); S.hp = Math.min(S.maxHp, S.hp + 25);
 spark(c.x, c.y - 16, 30, '#ffe08a', 240, 1, 3.5); ftext(c.x, c.y - 40, `+${coins} coin · +25 HP`, '#ffe08a', 16);
 if (c.hidden) { badge('secret'); S.gems++; ftext(c.x, c.y - 64, 'Harta rahsia! +1 permata', '#9ff6ee', 15); }
 if (S.chests >= 5) badge('chest5'); save();
}
function openGate(g) {
 g.open = true; g.seal.off = true; g.t = 0; AU.play('gate'); shake(10); flash('#ffe08a', .4);
 for (let i = 0; i < 40; i++) spark(g.x + (RND() - .5) * 120, g.y + 18, 1, '#ffe08a', 260, 1.2, 3, -60);
 toast('↑', 'Portal terbuka! Lompat melalui portal emas ke atas');
}

/* ====================== RENDER: BACKDROPS ====================== */
function ridge(g, w, base, amp, col, seed, jag = 1, step = 40) {
 const R = rng(seed); g.fillStyle = col; g.beginPath(); g.moveTo(0, base + amp * 2);
 let y = base - R() * amp; for (let x = 0; x <= w + step; x += step) { y = clamp(y + (R() - .5) * amp * jag, base - amp, base + amp * .2); g.lineTo(x, y); }
 g.lineTo(w, base + amp * 3); g.lineTo(0, base + amp * 3); g.fill();
}
function cloud(g, x, y, s, col) { g.fillStyle = col; g.beginPath(); [[0, 0, 1], [.9, .15, .8], [-.9, .2, .75], [.4, -.4, .7], [-.35, -.35, .65]].forEach(([a, b, r]) => { g.moveTo(x + a * 40 * s + r * 40 * s, y + b * 40 * s); g.arc(x + a * 40 * s, y + b * 40 * s, r * 40 * s, 0, TAU); }); g.fill(); }
function makeBackdrop(i) {
 const th = TH[i], w = Math.ceil(SW), h = Math.ceil(SH * 1.35); const res = (w * h > 900000) ? 1 : Math.min(DPR, 1.5);
 const c = document.createElement('canvas'); c.width = Math.round(w * res); c.height = Math.round(h * res); const g = c.getContext('2d'); g.scale(res, res);
 const R = rng(55 + i * 19), u = Math.max(w, h * .6) / 900;
 const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, th.sky[0]); sk.addColorStop(.55, th.sky[1]); sk.addColorStop(1, th.sky[2]); g.fillStyle = sk; g.fillRect(0, 0, w, h);
 if (!th.day) { for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(255,255,255,${.2 + R() * .7})`; const s = R() * 1.6 + .3; g.fillRect(R() * w, R() * h * .7, s, s); } }
 // celestial
 const cx = w * (.2 + R() * .6), cy = h * (.14 + R() * .1), cr = (th.day ? 46 : 38) * u;
 const halo = g.createRadialGradient(cx, cy, 0, cx, cy, cr * 5); halo.addColorStop(0, hexA(th.glow, .55)); halo.addColorStop(1, hexA(th.glow, 0)); g.fillStyle = halo; g.fillRect(0, 0, w, h);
 g.fillStyle = th.day ? '#fff8e0' : '#f4f1ff'; g.beginPath(); g.arc(cx, cy, cr, 0, TAU); g.fill();
 if (!th.day) { g.fillStyle = th.sky[0]; g.globalAlpha = .9; g.beginPath(); g.arc(cx + cr * .45, cy - cr * .15, cr * .88, 0, TAU); g.fill(); g.globalAlpha = 1; }
 if (i === 10 || i === 2 || i === 6) { // aurora / light ribbons
  for (let b = 0; b < 3; b++) { const ag = g.createLinearGradient(0, h * .1, 0, h * .45); const col = [th.glow, th.haze, '#7dffe0'][b]; ag.addColorStop(0, hexA(col, 0)); ag.addColorStop(.5, hexA(col, .18)); ag.addColorStop(1, hexA(col, 0)); g.fillStyle = ag; g.beginPath(); g.moveTo(0, h * .2 + b * 30); for (let x = 0; x <= w; x += 30) g.lineTo(x, h * .18 + b * 40 + Math.sin(x * .008 + b * 2) * 50 * u); g.lineTo(w, h * .5); g.lineTo(0, h * .5); g.fill(); }
 }
 if (th.day) for (let k = 0; k < 6; k++) cloud(g, R() * w, h * (.1 + R() * .35), (.6 + R()) * u, `rgba(255,255,255,${.35 + R() * .3})`);
 // far ranges
 ridge(g, w, h * .55, 90 * u, mix(th.far, th.haze, .45), 11 + i, 1.2, 36 * u);
 drawTheme(g, i, w, h, u, R, th);
 ridge(g, w, h * .78, 70 * u, th.far2, 29 + i, 1.1, 30 * u);
 if (i === 7 || i === 10) for (let k = 0; k < 9; k++) cloud(g, R() * w, h * (.82 + R() * .1), (1 + R()) * u, hexA(i === 7 ? '#ffffff' : '#3b3a7a', .8));
 const hz = g.createLinearGradient(0, h * .6, 0, h); hz.addColorStop(0, hexA(th.haze, 0)); hz.addColorStop(1, hexA(th.haze, th.day ? .55 : .3)); g.fillStyle = hz; g.fillRect(0, h * .6, w, h * .4);
 return c;
}
function drawTheme(g, i, w, h, u, R, th) {
 const sil = mix(th.far2, th.haze, .25), dark = th.far2;
 g.save();
 if (i === 0) { // valley: castle ruins on hill + waterfall cliff
  g.fillStyle = mix('#5aa36a', th.haze, .35); g.beginPath(); g.ellipse(w * .7, h * .66, w * .45, 120 * u, 0, Math.PI, 0); g.fill();
  const bx = w * .62, by = h * .56; g.fillStyle = mix('#8b8a7f', th.haze, .35);
  [[0, 0, 40, 120], [60, 30, 120, 90], [190, -10, 34, 130], [230, 40, 80, 80]].forEach(([x, y, ww, hh]) => { g.fillRect(bx + x * u, by + y * u - hh * u * .2, ww * u, hh * u); for (let c = 0; c < ww; c += 12) g.fillRect(bx + (x + c) * u, by + y * u - hh * u * .2 - 8 * u, 7 * u, 8 * u); });
  g.fillStyle = mix('#3c5f4f', th.haze, .3); g.fillRect(0, h * .3, w * .14, h * .5);
  const wf = g.createLinearGradient(w * .1, 0, w * .16, 0); wf.addColorStop(0, 'rgba(255,255,255,.2)'); wf.addColorStop(.5, 'rgba(255,255,255,.75)'); wf.addColorStop(1, 'rgba(255,255,255,.2)'); g.fillStyle = wf; g.fillRect(w * .1, h * .32, w * .07, h * .5);
 } else if (i === 1) { // arena colosseum
  const cx = w * .5, cy = h * .62, rx = w * .42, ry = 150 * u; g.fillStyle = sil; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 1.1);
  g.fillStyle = mix(th.sky[1], th.haze, .3);
  for (let row = 0; row < 3; row++) for (let a = 0; a < 14; a++) { const x = cx - rx + 18 * u + a * (rx * 2 - 36 * u) / 14, y = cy - ry + 20 * u + row * 46 * u; g.beginPath(); g.moveTo(x, y + 34 * u); g.lineTo(x, y + 12 * u); g.arc(x + 10 * u, y + 12 * u, 10 * u, Math.PI, 0); g.lineTo(x + 20 * u, y + 34 * u); g.fill(); }
  for (let k = 0; k < 5; k++) { const x = R() * w, y = h * (.2 + R() * .25), s = (14 + R() * 26) * u; g.fillStyle = sil; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.lineTo(x + s * .4, y + s * 1.3); g.lineTo(x - s * .3, y + s); g.fill(); }
 } else if (i === 2) { // forest
  for (let k = 0; k < 16; k++) { const x = R() * w, tw = (16 + R() * 26) * u, top = h * (.25 + R() * .25); g.fillStyle = mix(dark, th.sky[0], .3 + R() * .3); g.fillRect(x - tw / 2, top, tw, h); g.beginPath(); for (let b = 0; b < 5; b++) { g.moveTo(x, top); g.arc(x + (R() - .5) * 120 * u, top - R() * 40 * u, (40 + R() * 50) * u, 0, TAU); } g.fill(); }
  for (let k = 0; k < 40; k++) { g.fillStyle = hexA(th.glow, .3 + R() * .5); g.beginPath(); g.arc(R() * w, h * (.3 + R() * .6), (1 + R() * 3) * u, 0, TAU); g.fill(); }
 } else if (i === 3) { // seven tier tower
  const cx = w * .5; let y = h * .78, tw = 190 * u; g.fillStyle = sil;
  for (let k = 0; k < 7; k++) { const th2 = 62 * u; g.fillStyle = mix(dark, th.haze, .15 + k * .04); g.fillRect(cx - tw / 2, y - th2, tw, th2); g.fillStyle = hexA(th.glow, .7); for (let wx = -2; wx <= 2; wx++) { g.beginPath(); g.ellipse(cx + wx * tw / 5.5, y - th2 * .5, 4 * u, 9 * u, 0, 0, TAU); g.fill(); } y -= th2; tw *= .86; }
  g.fillStyle = mix(dark, th.haze, .45); g.beginPath(); g.moveTo(cx - tw / 2, y); g.lineTo(cx, y - 90 * u); g.lineTo(cx + tw / 2, y); g.fill();
  g.font = `700 ${22 * u}px "Noto Naskh Arabic",serif`; g.textAlign = 'center'; g.fillStyle = hexA(th.glow, .35);
  ['أَفْعَلَ', 'فَعَّلَ', 'فَاعَلَ', 'اسْتَفْعَلَ', 'تَفَاعَلَ', 'افْتَعَلَ', 'تَفَعَّلَ'].forEach((s, k) => g.fillText(s, w * (.12 + (k % 2) * .76), h * (.28 + k * .07)));
 } else if (i === 4) { // citadel with six doors
  const y = h * .62; g.fillStyle = sil; g.fillRect(w * .05, y - 120 * u, w * .9, 260 * u);
  for (let k = 0; k <= 6; k++) { const x = w * .05 + k * w * .9 / 6; g.fillRect(x - 22 * u, y - 190 * u, 44 * u, 200 * u); for (let c = -22; c < 22; c += 11) g.fillRect(x + c * u, y - 202 * u, 7 * u, 12 * u); }
  for (let k = 0; k < 6; k++) { const x = w * .05 + (k + .5) * w * .9 / 6; g.fillStyle = hexA(th.glow, .55); g.beginPath(); g.moveTo(x - 18 * u, y + 40 * u); g.lineTo(x - 18 * u, y - 30 * u); g.arc(x, y - 30 * u, 18 * u, Math.PI, 0); g.lineTo(x + 18 * u, y + 40 * u); g.fill(); g.fillStyle = dark; g.beginPath(); g.moveTo(x - 13 * u, y + 40 * u); g.lineTo(x - 13 * u, y - 28 * u); g.arc(x, y - 28 * u, 13 * u, Math.PI, 0); g.lineTo(x + 13 * u, y + 40 * u); g.fill(); }
  for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, h * (.55 + k * .08), w, 26 * u); }
 } else if (i === 5) { // domes & minarets
  for (let k = 0; k < 9; k++) { const x = (k + .5) * w / 9 + (R() - .5) * 30, bh = (60 + R() * 110) * u, bw = (50 + R() * 50) * u, base = h * .7; g.fillStyle = mix(dark, th.sky[2], .15 + R() * .2); g.fillRect(x - bw / 2, base - bh, bw, bh + 200);
   if (R() < .55) { g.beginPath(); g.moveTo(x - bw / 2, base - bh); g.quadraticCurveTo(x - bw / 2, base - bh - bw * .9, x, base - bh - bw * 1.05); g.quadraticCurveTo(x + bw / 2, base - bh - bw * .9, x + bw / 2, base - bh); g.fill(); g.fillRect(x - 1.5 * u, base - bh - bw * 1.3, 3 * u, bw * .3); }
   else { const mw = 12 * u, mh = bh + 80 * u; g.fillRect(x - mw / 2, base - mh, mw, mh); g.beginPath(); g.moveTo(x - mw, base - mh); g.lineTo(x, base - mh - 34 * u); g.lineTo(x + mw, base - mh); g.fill(); }
   g.fillStyle = hexA(th.glow, .6); for (let wy = 0; wy < 3; wy++) if (R() < .7) g.fillRect(x - 4 * u, base - bh + 20 * u + wy * 26 * u, 8 * u, 12 * u); }
 } else if (i === 6) { // city of numbers
  for (let k = 0; k < 18; k++) { const x = R() * w, bw = (30 + R() * 60) * u, bh = (80 + R() * 220) * u, base = h * .78; g.fillStyle = mix(dark, th.sky[0], R() * .4); g.fillRect(x, base - bh, bw, bh + 100); g.fillStyle = hexA(th.glow, .5); for (let wy = base - bh + 10 * u; wy < base; wy += 18 * u) for (let wx = x + 6 * u; wx < x + bw - 8 * u; wx += 14 * u) if (R() < .45) g.fillRect(wx, wy, 6 * u, 9 * u); }
  g.textAlign = 'center'; '١٢٣٤٥٦٧٨٩٠'.split('').forEach((d, k) => { g.font = `700 ${(40 + R() * 60) * u}px "Noto Naskh Arabic",serif`; g.fillStyle = hexA(th.glow, .12 + R() * .2); g.fillText(d, R() * w, h * (.15 + R() * .4)); });
 } else if (i === 7) { // temple on peaks
  ridge(g, w, h * .6, 160 * u, mix('#c9d6e6', th.haze, .2), 77, 2, 60 * u);
  g.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 8; k++) { const x = R() * w; g.beginPath(); g.moveTo(x - 40 * u, h * .5); g.lineTo(x, h * .44); g.lineTo(x + 40 * u, h * .5); g.fill(); }
  const tx = w * .5, ty = h * .46; g.fillStyle = mix('#6d7f97', th.haze, .2); g.fillRect(tx - 70 * u, ty - 50 * u, 140 * u, 60 * u); for (let c = -60; c <= 60; c += 24) g.fillRect(tx + c * u - 4 * u, ty - 70 * u, 8 * u, 80 * u);
  g.beginPath(); g.moveTo(tx - 85 * u, ty - 70 * u); g.lineTo(tx, ty - 120 * u); g.lineTo(tx + 85 * u, ty - 70 * u); g.fill(); g.beginPath(); g.arc(tx, ty - 120 * u, 18 * u, Math.PI, 0); g.fill();
 } else if (i === 8) { // ruined burning city
  for (let k = 0; k < 14; k++) { const x = R() * w, bw = (40 + R() * 70) * u, bh = (70 + R() * 180) * u, base = h * .76; g.fillStyle = mix(dark, '#000000', .3); g.beginPath(); g.moveTo(x, base); g.lineTo(x, base - bh); for (let c = 0; c < 4; c++) g.lineTo(x + bw * (c + 1) / 4, base - bh + (R() - .3) * 50 * u); g.lineTo(x + bw, base); g.fill(); g.fillStyle = hexA('#ff7a3a', .55); for (let wy = 0; wy < 4; wy++) if (R() < .5) g.fillRect(x + bw * .3, base - bh * .3 - wy * 22 * u, 8 * u, 10 * u); }
  for (let k = 0; k < 5; k++) { const x = R() * w; const sg = g.createLinearGradient(0, h * .2, 0, h * .7); sg.addColorStop(0, 'rgba(40,20,20,0)'); sg.addColorStop(1, 'rgba(40,20,20,.55)'); g.fillStyle = sg; g.beginPath(); g.moveTo(x - 20 * u, h * .72); g.bezierCurveTo(x - 60 * u, h * .5, x + 60 * u, h * .35, x - 20 * u, h * .15); g.lineTo(x + 70 * u, h * .15); g.bezierCurveTo(x + 120 * u, h * .35, x + 40 * u, h * .5, x + 30 * u, h * .72); g.fill(); }
  const fg = g.createLinearGradient(0, h * .65, 0, h); fg.addColorStop(0, 'rgba(255,90,30,0)'); fg.addColorStop(1, 'rgba(255,90,30,.5)'); g.fillStyle = fg; g.fillRect(0, h * .65, w, h * .35);
 } else if (i === 9) { // final mountain with distant golden palace
  g.fillStyle = mix(dark, '#000000', .2); g.beginPath(); g.moveTo(w * .1, h); g.lineTo(w * .42, h * .3); g.lineTo(w * .5, h * .22); g.lineTo(w * .58, h * .3); g.lineTo(w * .9, h); g.fill();
  g.fillStyle = '#f3c45a'; const px = w * .5, py = h * .22; g.fillRect(px - 22 * u, py - 18 * u, 44 * u, 18 * u); g.beginPath(); g.arc(px, py - 18 * u, 12 * u, Math.PI, 0); g.fill(); g.fillRect(px - 30 * u, py - 30 * u, 5 * u, 30 * u); g.fillRect(px + 25 * u, py - 30 * u, 5 * u, 30 * u);
  const gl = g.createRadialGradient(px, py, 0, px, py, 120 * u); gl.addColorStop(0, 'rgba(255,220,120,.45)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.fillRect(px - 120 * u, py - 120 * u, 240 * u, 240 * u);
  for (let k = 0; k < 10; k++) cloud(g, R() * w, h * (.08 + R() * .25), (1 + R() * 1.4) * u, `rgba(30,28,60,${.6 + R() * .3})`);
 } else if (i === 10) { // summit: palace close & aurora
  for (let k = 0; k < 7; k++) cloud(g, R() * w, h * (.7 + R() * .2), (1.2 + R()) * u, 'rgba(70,60,140,.5)');
 }
 g.restore();
}
function getBackdrop(i) { let b = bdCache.get(i); if (!b) { b = makeBackdrop(i); bdCache.set(i, b); if (bdCache.size > 3) { const k = [...bdCache.keys()].find(k => Math.abs(k - i) > 1); if (k !== undefined) bdCache.delete(k); } } return b; }
function drawBackdrop() {
 const cy = cam.y + viewH / 2; const zf = cy < SUMMIT ? NZ + (SUMMIT - cy) / SUMMIT * .99 : clamp((WH - cy) / ZH, 0, NZ - .001);
 let base = Math.floor(zf), t = zf - base; if (base >= NZ) { base = NZ; t = 0; }
 const bh = SH * 1.35, off = -t * SH * .3;
 ctx.drawImage(getBackdrop(base), 0, off, SW, bh);
 if (t > .82 && base < NZ) { ctx.globalAlpha = (t - .82) / .18; ctx.drawImage(getBackdrop(base + 1), 0, -0 * SH * .3, SW, bh); ctx.globalAlpha = 1; }
 return base;
}

/* ====================== RENDER: WORLD ====================== */
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function platSprite(p) {
 const key = p.z + '|' + p.kind + '|' + Math.round(p.w);
 let c = sprCache.get(key); if (c) return c;
 const th = TH[p.z], w = Math.round(p.w), pad = 6, dh = p.kind === 'bridge' ? 34 : p.kind === 'arena' ? 60 : 46, res = Math.min(DPR * scale, 2.5);
 c = document.createElement('canvas'); c.width = Math.ceil((w + pad * 2) * res); c.height = Math.ceil((dh + pad + 8) * res);
 const g = c.getContext('2d'); g.scale(res, res); g.translate(pad, pad); const R = rng(w * 7 + p.z);
 if (p.kind === 'bridge') {
  g.strokeStyle = '#3a2614'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -2); g.quadraticCurveTo(w / 2, 10, w, -2); g.stroke();
  for (let x = 0; x < w; x += 15) { const gr = g.createLinearGradient(0, 0, 0, 12); gr.addColorStop(0, '#c08a52'); gr.addColorStop(1, '#6e4524'); g.fillStyle = gr; rr(g, x + 1, 0, 13, 11, 2); g.fill(); g.fillStyle = 'rgba(255,240,200,.35)'; g.fillRect(x + 2, 1, 11, 2); }
  g.fillStyle = '#5a3a1e'; g.fillRect(0, -16, 5, 30); g.fillRect(w - 5, -16, 5, 30); g.fillStyle = th.top; g.fillRect(-1, -18, 7, 4); g.fillRect(w - 6, -18, 7, 4);
  g.strokeStyle = '#d9b47a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(2, -14); g.quadraticCurveTo(w / 2, 0, w - 2, -14); g.stroke();
  sprCache.set(key, c); return c;
 }
 const isMove = p.kind === 'move' || p.kind === 'vmove', isAlt = p.kind === 'altar', isArena = p.kind === 'arena';
 const bodyC = isMove ? mix(th.body, '#3fe0cf', .25) : isAlt ? '#e9dcc0' : isArena ? '#c99a3c' : th.body;
 const bodyC2 = isMove ? mix(th.body2, '#173a5c', .3) : isAlt ? '#a8977a' : isArena ? '#7a5618' : th.body2;
 // underside rock taper
 g.beginPath(); g.moveTo(0, 8); const depth = isArena ? 52 : isMove ? 22 : 30 + R() * 10;
 for (let x = 0; x <= w; x += Math.max(10, w / 9)) { const d = depth * Math.sin(Math.PI * x / w) * (.7 + R() * .4) + 8; g.lineTo(x, d); }
 g.lineTo(w, 8); g.closePath(); const ug = g.createLinearGradient(0, 8, 0, depth + 8); ug.addColorStop(0, bodyC2); ug.addColorStop(1, th.edge); g.fillStyle = ug; g.fill();
 // body
 const bg = g.createLinearGradient(0, 0, 0, 16); bg.addColorStop(0, bodyC); bg.addColorStop(1, bodyC2); g.fillStyle = bg; rr(g, 0, 2, w, 14, 5); g.fill();
 // stones
 g.strokeStyle = hexA(th.edge, .5); g.lineWidth = 1; for (let x = 10 + R() * 14; x < w - 6; x += 18 + R() * 16) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x - 2, 15); g.stroke(); }
 // top cap
 const capC = isAlt ? '#ffffff' : isArena ? '#ffe9a8' : isMove ? '#a7fff4' : th.top, capHi = isAlt ? '#fff8e1' : isMove ? '#ffffff' : th.topHi;
 g.fillStyle = capC; rr(g, -2, -1, w + 4, 7, 3.5); g.fill(); g.fillStyle = capHi; g.fillRect(2, -1, w - 4, 1.6);
 if (!isAlt && !isMove && !isArena && (p.z === 0 || p.z === 2)) { g.fillStyle = th.top; for (let x = 3; x < w - 3; x += 6 + R() * 6) { g.beginPath(); g.moveTo(x, 5); g.lineTo(x + 2, 9 + R() * 6); g.lineTo(x + 4, 5); g.fill(); } }
 if (p.z === 7 && !isMove) { g.fillStyle = '#ffffff'; for (let x = 4; x < w - 4; x += 9) { g.beginPath(); g.moveTo(x, 14); g.lineTo(x + 2, 22 + R() * 8); g.lineTo(x + 4, 14); g.fill(); } }
 if (isAlt || isArena) { g.fillStyle = '#d6a440'; g.fillRect(0, 9, w, 2.5); g.fillStyle = '#b07a1c'; for (let x = 8; x < w - 8; x += 16) { g.save(); g.translate(x, 12.5); g.rotate(Math.PI / 4); g.fillRect(-2, -2, 4, 4); g.restore(); } }
 if (isMove) { g.fillStyle = 'rgba(255,255,255,.5)'; g.font = '700 9px "Noto Naskh Arabic",serif'; g.textAlign = 'center'; g.fillText('ـ ـَ ـُ ـِ ـْ', w / 2, 14); }
 sprCache.set(key, c); return c;
}
function inView(y, m = 120) { return y > cam.y - m && y < cam.y + viewH + m; }
function drawMid() {
 for (const m of MID) {
  const f = m.f, yd = cam.y + viewH / 2 + (m.y - cam.y - viewH / 2) * f; if (yd < cam.y - 200 || yd > cam.y + viewH + 200) continue;
  const th = TH[m.z], col = mix(th.far2, th.haze, .35), s = m.s; ctx.save(); ctx.translate(m.x, yd); ctx.globalAlpha = .75;
  switch (m.z) {
   case 0: case 1: case 10: { // floating island
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-60 * s, 0); ctx.lineTo(60 * s, 0); ctx.lineTo(20 * s, 60 * s); ctx.lineTo(-10 * s, 80 * s); ctx.lineTo(-40 * s, 40 * s); ctx.fill();
    ctx.fillStyle = m.z === 0 ? mix('#5fbf5a', th.haze, .4) : m.z === 10 ? '#d9b260' : mix(th.top, th.haze, .4); ctx.fillRect(-62 * s, -6 * s, 124 * s, 8 * s);
    if (m.z === 0) { ctx.fillStyle = mix('#3e8c4a', th.haze, .35); ctx.beginPath(); ctx.arc(-20 * s, -30 * s, 22 * s, 0, TAU); ctx.arc(0, -42 * s, 18 * s, 0, TAU); ctx.fill(); ctx.fillRect(-14 * s, -18 * s, 5 * s, 14 * s); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(40 * s, 0, 6 * s, 90 * s + Math.sin(T * 3) * 2); }
    if (m.z === 1) { ctx.fillStyle = col; ctx.fillRect(-30 * s, -60 * s, 12 * s, 58 * s); ctx.fillRect(10 * s, -48 * s, 12 * s, 46 * s); ctx.fillRect(-34 * s, -66 * s, 60 * s, 8 * s); }
    if (m.z === 10) { ctx.fillStyle = '#e8c06a'; ctx.beginPath(); ctx.arc(0, -10 * s, 24 * s, Math.PI, 0); ctx.fill(); }
    break; }
   case 2: { ctx.fillStyle = col; ctx.fillRect(-6 * s, -80 * s, 12 * s, 90 * s); ctx.fillStyle = hexA(th.glow, .35 + .15 * Math.sin(T * 2 + m.r * 9)); ctx.beginPath(); ctx.ellipse(0, -80 * s, 46 * s, 22 * s, 0, Math.PI, 0); ctx.fill(); break; }
   case 3: case 6: { ctx.font = `700 ${70 * s}px "Noto Naskh Arabic",serif`; ctx.textAlign = 'center'; ctx.fillStyle = hexA(th.glow, .3 + .15 * Math.sin(T * 1.5 + m.r * 7)); ctx.fillText(m.z === 3 ? ['فَعَّلَ', 'أَفْعَلَ', 'تَفَاعَلَ', 'افْتَعَلَ', 'فَاعَلَ', 'تَفَعَّلَ', 'اسْتَفْعَلَ'][Math.floor(m.r * 7)] : '٠١٢٣٤٥٦٧٨٩'[Math.floor(m.r * 10)], 0, Math.sin(T + m.r * 5) * 8); break; }
   case 4: { ctx.fillStyle = col; rr(ctx, -40 * s, -80 * s, 80 * s, 100 * s, 30 * s); ctx.fill(); ctx.fillStyle = hexA(th.glow, .4); rr(ctx, -26 * s, -62 * s, 52 * s, 82 * s, 24 * s); ctx.fill(); break; }
   case 5: { for (let k = 0; k < 3; k++) { const x = (k - 1) * 30 * s, y = Math.sin(T * 1.2 + k + m.r * 6) * 6; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(x, -120 * s); ctx.lineTo(x, y - 20 * s); ctx.stroke(); ctx.fillStyle = hexA('#ffb347', .8); rr(ctx, x - 8 * s, y - 20 * s, 16 * s, 24 * s, 6 * s); ctx.fill(); } break; }
   case 7: { cloud(ctx, 0, 0, s * 1.2, 'rgba(255,255,255,.7)'); break; }
   case 8: { ctx.fillStyle = 'rgba(30,15,12,.6)'; ctx.beginPath(); ctx.arc(0, 0, 50 * s, 0, TAU); ctx.arc(40 * s, -30 * s, 40 * s, 0, TAU); ctx.fill(); break; }
   case 9: { cloud(ctx, 0, 0, s * 1.4, 'rgba(20,18,45,.8)'); ctx.fillStyle = hexA('#b18cff', .5); ctx.beginPath(); ctx.moveTo(0, -30 * s); ctx.lineTo(12 * s, 0); ctx.lineTo(0, 30 * s); ctx.lineTo(-12 * s, 0); ctx.fill(); break; }
  }
  ctx.restore();
 }
}
function drawWalls(z0, z1) {
 for (let z = z0; z <= z1; z++) {
  const th = TH[z], top = z === NZ ? -900 : zTop(z), bot = z === NZ ? SUMMIT : zBot(z);
  const y0 = Math.max(top, cam.y - 50), y1 = Math.min(bot, cam.y + viewH + 50); if (y1 <= y0) continue;
  for (const side of [-1, 1]) {
   const x = side < 0 ? -46 : W; const gr = ctx.createLinearGradient(x, 0, x + 46, 0);
   gr.addColorStop(side < 0 ? 0 : 1, th.edge); gr.addColorStop(side < 0 ? 1 : 0, th.body); ctx.fillStyle = gr; ctx.fillRect(x, y0, 46, y1 - y0);
   ctx.fillStyle = hexA(th.edge, .5); for (let y = Math.floor(y0 / 40) * 40; y < y1; y += 40) { ctx.fillRect(x, y, 46, 2); ctx.fillRect(x + ((y / 40) % 2 ? 14 : 30), y, 2, 40); }
   ctx.fillStyle = th.top; ctx.fillRect(side < 0 ? -4 : W, y0, 4, y1 - y0);
  }
  // torches on walls
  if ([1, 5, 8, 10].includes(z)) for (let y = Math.ceil(y0 / 320) * 320; y < y1; y += 320) for (const side of [-1, 1]) {
   const x = side < 0 ? -10 : W + 10; ctx.fillStyle = '#4a331c'; ctx.fillRect(x - 3, y, 6, 18);
   const fl = 1 + Math.sin(T * 14 + y) * .15; const fg = ctx.createRadialGradient(x, y - 6, 0, x, y - 6, 60); fg.addColorStop(0, 'rgba(255,190,90,.45)'); fg.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = fg; ctx.fillRect(x - 60, y - 66, 120, 120);
   ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(x, y - 6, 5 * fl, 11 * fl, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff2c4'; ctx.beginPath(); ctx.ellipse(x, y - 3, 2.5, 5, 0, 0, TAU); ctx.fill();
  }
 }
}
function drawWorldDeco(z0, z1) {
 // zone 0 waterfall
 if (z0 === 0) { const top = zTop(0) + 300, bot = WH - 30; if (inView(top, viewH) || inView(bot, viewH)) { const y0 = Math.max(top, cam.y - 20), y1 = Math.min(bot, cam.y + viewH + 20); const g = ctx.createLinearGradient(14, 0, 64, 0); g.addColorStop(0, 'rgba(180,230,255,.25)'); g.addColorStop(.5, 'rgba(230,248,255,.6)'); g.addColorStop(1, 'rgba(180,230,255,.25)'); ctx.fillStyle = g; ctx.fillRect(14, y0, 50, y1 - y0); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 9; k++) { const yy = ((T * 260 + k * 97) % (y1 - y0 + 60)) + y0 - 30; ctx.fillRect(18 + (k * 13) % 40, yy, 3, 40); } } }
 // signs
 for (const s of SIGNS) {
  if (s.z < z0 || s.z > z1 || !inView(s.y)) continue;
  const th = TH[s.z]; ctx.save(); ctx.translate(s.x, s.y);
  ctx.fillStyle = th.edge; ctx.fillRect(-4, -46, 8, 46); ctx.fillStyle = mix(th.body, '#000000', .1); rr(ctx, -62, -112, 124, 72, 10); ctx.fill(); ctx.strokeStyle = '#f3c45a'; ctx.lineWidth = 2; rr(ctx, -58, -108, 116, 64, 8); ctx.stroke();
  ctx.fillStyle = '#f3c45a'; ctx.font = '700 12px "Reem Kufi",sans-serif'; ctx.textAlign = 'center'; ctx.fillText(s.z === NZ ? 'FINAL BOSS' : `LEVEL ${s.z + 1}`, 0, -90);
  ctx.fillStyle = '#ffffff'; ctx.font = '700 15px "Noto Naskh Arabic",serif'; ctx.fillText(s.z === NZ ? 'قَصْرُ الْمُلُوكِ' : LV[s.z].topic, 0, -66);
  ctx.fillStyle = '#e8dcc0'; ctx.font = '500 8.5px Rubik,sans-serif'; ctx.fillText(s.z === NZ ? 'The Three Kings' : LV[s.z].name, 0, -50);
  ctx.restore();
 }
 // ladders
 for (const L of LAD) { if (L.z < z0 || L.z > z1 || (!inView(L.top) && !inView(L.bot))) continue; ctx.fillStyle = '#6b4a22'; ctx.fillRect(L.x, L.top, 4, L.bot - L.top); ctx.fillRect(L.x + L.w - 4, L.top, 4, L.bot - L.top); ctx.fillStyle = '#a8743c'; for (let y = L.top + 6; y < L.bot; y += 16) ctx.fillRect(L.x + 2, y, L.w - 4, 4); ctx.fillStyle = '#f3c45a'; ctx.fillRect(L.x - 1, L.top - 3, 6, 4); ctx.fillRect(L.x + L.w - 5, L.top - 3, 6, 4); }
 // palace in summit
 if (z1 >= NZ) drawPalace();
}
function drawPalace() {
 const y = ARENA_Y; if (!inView(y - 300, 400)) return;
 ctx.save();
 const gl = ctx.createRadialGradient(W / 2, y - 280, 0, W / 2, y - 280, 420); gl.addColorStop(0, 'rgba(255,220,130,.35)'); gl.addColorStop(1, 'rgba(255,220,130,0)'); ctx.fillStyle = gl; ctx.fillRect(-300, y - 700, W + 600, 700);
 const gold = ctx.createLinearGradient(0, y - 520, 0, y); gold.addColorStop(0, '#ffe7a0'); gold.addColorStop(1, '#a8741c');
 ctx.fillStyle = 'rgba(80,58,20,.9)'; ctx.fillRect(-20, y - 330, W + 40, 330);
 ctx.fillStyle = gold; for (let k = 0; k < 7; k++) { const x = -10 + k * (W + 20) / 6; ctx.fillRect(x - 9, y - 330, 18, 330); ctx.fillRect(x - 13, y - 340, 26, 12); }
 ctx.fillStyle = 'rgba(20,14,40,.85)'; for (let k = 0; k < 6; k++) { const x = -10 + (k + .5) * (W + 20) / 6; ctx.beginPath(); ctx.moveTo(x - 22, y); ctx.lineTo(x - 22, y - 200); ctx.quadraticCurveTo(x - 22, y - 250, x, y - 268); ctx.quadraticCurveTo(x + 22, y - 250, x + 22, y - 200); ctx.lineTo(x + 22, y); ctx.fill(); }
 ctx.strokeStyle = 'rgba(243,196,90,.35)'; ctx.lineWidth = 1; for (let k = 0; k < 6; k++) { const x = -10 + (k + .5) * (W + 20) / 6; for (let r = 0; r < 6; r++) { ctx.beginPath(); ctx.moveTo(x - 18, y - 40 - r * 30); ctx.lineTo(x, y - 55 - r * 30); ctx.lineTo(x + 18, y - 40 - r * 30); ctx.stroke(); } }
 ctx.fillStyle = gold; ctx.fillRect(-20, y - 352, W + 40, 22);
 ctx.font = '700 15px "Noto Naskh Arabic",serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#5a3a0a'; ctx.fillText('اُطْلُبُوا الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ', W / 2, y - 336);
 // main dome
 ctx.fillStyle = gold; ctx.fillRect(W / 2 - 110, y - 470, 220, 120); ctx.beginPath(); ctx.moveTo(W / 2 - 100, y - 470); ctx.bezierCurveTo(W / 2 - 110, y - 600, W / 2 - 20, y - 620, W / 2, y - 660); ctx.bezierCurveTo(W / 2 + 20, y - 620, W / 2 + 110, y - 600, W / 2 + 100, y - 470); ctx.fill();
 ctx.fillStyle = '#fff6d8'; ctx.fillRect(W / 2 - 2, y - 700, 4, 44); ctx.beginPath(); ctx.arc(W / 2, y - 708, 9, .6, TAU - .6); ctx.arc(W / 2 + 4, y - 710, 7, TAU - .6, .6, true); ctx.fill();
 for (const sx of [-1, 1]) { const mx = W / 2 + sx * 170; ctx.fillStyle = gold; ctx.fillRect(mx - 12, y - 560, 24, 210); ctx.beginPath(); ctx.moveTo(mx - 16, y - 560); ctx.lineTo(mx, y - 610); ctx.lineTo(mx + 16, y - 560); ctx.fill(); ctx.fillRect(mx - 18, y - 480, 36, 8); }
 ctx.fillStyle = 'rgba(20,14,40,.8)'; for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.arc(W / 2 + k * 36, y - 400, 10, Math.PI, 0); ctx.lineTo(W / 2 + k * 36 + 10, y - 370); ctx.lineTo(W / 2 + k * 36 - 10, y - 370); ctx.fill(); }
 ctx.restore();
}
function drawPlatforms(z0, z1) {
 for (let z = z0; z <= z1; z++) for (const p of ZONES[z].plats) {
  if (!inView(p.y, 80)) continue;
  let a = 1; if (p.kind === 'hidden') { const d = Math.hypot(P.x - (p.x + p.w / 2), P.y - p.y); a = clamp(1 - (d - 70) / 130, 0, 1); if (a <= 0) { if (Math.sin(T * 2 + p.x) > .97) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(p.x + p.w / 2 - 1, p.y - 3, 2, 2); } continue; } }
  ctx.globalAlpha = a;
  const sp = platSprite(p.kind === 'hidden' ? { ...p, kind: 'norm' } : p); const res = sp.width / (Math.round(p.w) + 12);
  if (p.mv || p.z === 6) { const gl = ctx.createRadialGradient(p.x + p.w / 2, p.y + 6, 0, p.x + p.w / 2, p.y + 6, p.w * .7); gl.addColorStop(0, 'rgba(63,224,207,.3)'); gl.addColorStop(1, 'rgba(63,224,207,0)'); ctx.fillStyle = gl; ctx.fillRect(p.x - p.w * .2, p.y - 30, p.w * 1.4, 70); }
  ctx.drawImage(sp, p.x - 6, p.y - 6, sp.width / res, sp.height / res);
  if (p.kind === 'hidden') { ctx.fillStyle = `rgba(200,160,255,${.5 * a})`; ctx.fillRect(p.x, p.y - 2, p.w, 2); }
  ctx.globalAlpha = 1;
 }
}
function drawGates(z0, z1) {
 for (let z = Math.max(0, z0 - 1); z <= Math.min(NZ - 1, z1); z++) {
  const g = GATES[z]; if (!inView(g.y, 200)) continue; const th = TH[z];
  // slab
  const sg = ctx.createLinearGradient(0, g.y, 0, g.y + 36); sg.addColorStop(0, mix(th.body, '#f3c45a', .25)); sg.addColorStop(1, th.edge);
  ctx.fillStyle = sg; ctx.fillRect(-60, g.y, g.x - 50 + 60, 36); ctx.fillRect(g.x + 50, g.y, W - g.x - 50 + 60, 36);
  ctx.fillStyle = '#f3c45a'; ctx.fillRect(-60, g.y, g.x - 50 + 60, 4); ctx.fillRect(g.x + 50, g.y, W - g.x - 50 + 60, 4);
  ctx.fillStyle = hexA('#f3c45a', .5); for (let x = 8; x < W; x += 28) { if (Math.abs(x - g.x) < 58) continue; ctx.save(); ctx.translate(x, g.y + 20); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore(); }
  // portal frame
  ctx.strokeStyle = '#f3c45a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(g.x - 54, g.y + 36); ctx.lineTo(g.x - 54, g.y - 30); ctx.quadraticCurveTo(g.x - 54, g.y - 100, g.x, g.y - 120); ctx.quadraticCurveTo(g.x + 54, g.y - 100, g.x + 54, g.y - 30); ctx.lineTo(g.x + 54, g.y + 36); ctx.stroke();
  if (!g.open) {
   const pulse = .5 + .5 * Math.sin(T * 3);
   ctx.fillStyle = `rgba(255,70,110,${.35 + pulse * .25})`; ctx.fillRect(g.x - 50, g.y, 100, 36);
   ctx.strokeStyle = `rgba(255,150,170,${.6 + pulse * .4})`; ctx.lineWidth = 1.5; for (let k = 0; k < 6; k++) { ctx.beginPath(); const yy = g.y + 4 + k * 6; ctx.moveTo(g.x - 48, yy); for (let x = -48; x <= 48; x += 10) ctx.lineTo(g.x + x, yy + Math.sin(T * 6 + x * .2 + k) * 2.5); ctx.stroke(); }
   // lock icon
   ctx.fillStyle = '#ffe08a'; rr(ctx, g.x - 10, g.y + 12, 20, 16, 3); ctx.fill(); ctx.strokeStyle = '#ffe08a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(g.x, g.y + 12, 6, Math.PI, 0); ctx.stroke();
   const done = S.z[z].st.filter(s => s.done).length, need = S.z[z].st.map((s, k) => s.done ? '' : TIERS[k]).join(' '); ctx.font = '700 11px Rubik,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; if (DEMO && done === 3) { ctx.fillText('VERSI DEMO · TAMAT', g.x, g.y + 52); ctx.fillStyle = '#ffe08a'; ctx.fillText('LEVEL 2–10 DIKUNCI', g.x, g.y + 66); } else { ctx.fillText(`PORTAL DIKUNCI · ALTAR ${done}/3`, g.x, g.y + 52); ctx.fillStyle = '#ffe08a'; ctx.fillText(`PERLU ALTAR ${need}`, g.x, g.y + 66); }
  } else {
   const a = clamp(g.t, 0, 1); const bg = ctx.createLinearGradient(0, g.y - 260, 0, g.y + 160); bg.addColorStop(0, 'rgba(255,230,140,0)'); bg.addColorStop(.6, `rgba(255,230,140,${.35 * a})`); bg.addColorStop(1, 'rgba(255,230,140,0)'); ctx.fillStyle = bg; ctx.fillRect(g.x - 60, g.y - 260, 120, 420);
   if (RND() < .5) FX.push({ x: g.x + (RND() - .5) * 110, y: g.y + 80, vx: 0, vy: -140 - RND() * 80, life: 1.4, max: 1.4, size: 2 + RND() * 2, col: '#ffe08a', g: 0, type: 'spark' });
   ctx.font = '700 11px Rubik,sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe08a'; if (P.y > g.y) ctx.fillText('PORTAL TERBUKA ↑', g.x, g.y + 52);
  }
 }
}
function drawAltars(z0, z1) {
 for (let z = z0; z <= Math.min(z1, NZ - 1); z++) for (const a of ZONES[z].alt) {
  if (!inView(a.y)) continue; const done = S.z[a.z].st[a.tier].done, col = ['#7ee081', '#f3c45a', '#ff5d73'][a.tier];
  ctx.save(); ctx.translate(a.x, a.y);
  // flag (checkpoint)
  const act = Math.abs(S.cp.x - (a.x - 30)) < 2 && Math.abs(S.cp.y - a.plat.y) < 2;
  ctx.fillStyle = '#6b4a22'; ctx.fillRect(70, -70, 4, 70); ctx.fillStyle = act || done ? '#3fe0cf' : '#8a8fa8'; ctx.beginPath(); const fy = act || done ? -68 : -30; ctx.moveTo(74, fy); ctx.lineTo(74 + 26 + Math.sin(T * 5) * 3, fy + 8); ctx.lineTo(74, fy + 16); ctx.fill();
  // pedestal
  const pg = ctx.createLinearGradient(0, -46, 0, 0); pg.addColorStop(0, '#f6efe0'); pg.addColorStop(1, '#a8977a'); ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-18, -12); ctx.lineTo(-14, -40); ctx.lineTo(14, -40); ctx.lineTo(18, -12); ctx.lineTo(26, 0); ctx.fill();
  ctx.fillStyle = '#d6a440'; ctx.fillRect(-18, -44, 36, 6); ctx.fillRect(-22, -14, 44, 4);
  ctx.font = '700 16px "Reem Kufi",sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#5a3a0a'; ctx.fillText(TIERS[a.tier], 0, -20);
  // crystal / book
  const fy2 = -70 + Math.sin(T * 2 + a.tier) * 5; const gl = ctx.createRadialGradient(0, fy2, 0, 0, fy2, 60); gl.addColorStop(0, hexA(done ? '#3fe0cf' : col, .55)); gl.addColorStop(1, hexA(col, 0)); ctx.fillStyle = gl; ctx.fillRect(-60, fy2 - 60, 120, 120);
  ctx.fillStyle = done ? '#3fe0cf' : col; ctx.beginPath(); ctx.moveTo(0, fy2 - 20); ctx.lineTo(12, fy2); ctx.lineTo(0, fy2 + 18); ctx.lineTo(-12, fy2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.moveTo(0, fy2 - 20); ctx.lineTo(5, fy2 - 2); ctx.lineTo(0, fy2 + 6); ctx.fill();
  ctx.font = '700 10px Rubik,sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(done ? `✓ ${'★'.repeat(S.z[a.z].st[a.tier].stars)}` : `ALTAR ${TIERS[a.tier]} · ${TIER_MS[a.tier].toUpperCase()}`, 0, -100);
  ctx.restore();
  // guardian during quiz
  if (Quiz.open && Quiz.mode === 'stage' && Quiz.altar === a) drawGuardian(a);
 }
}
function drawGuardian(a) {
 const x = a.x + 40 * (P.x < a.x ? 1 : -1) * 0 + (P.x < a.x ? 60 : -60), y = a.y - 90 + Math.sin(T * 2.2) * 6, col = ['#7ee081', '#f3c45a', '#ff5d73'][a.tier];
 a.gx = x; a.gy = y; const hit = a.guardHit > 0; a.guardHit = Math.max(0, a.guardHit - 1 / 60);
 ctx.save(); ctx.translate(x + (hit ? (RND() - .5) * 8 : 0), y);
 const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, 70); gl.addColorStop(0, hexA(col, .4)); gl.addColorStop(1, hexA(col, 0)); ctx.fillStyle = gl; ctx.fillRect(-70, -70, 140, 140);
 ctx.fillStyle = hit ? '#ffffff' : mix(col, '#20103a', .45); ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(26, -6); ctx.lineTo(16, 30); ctx.lineTo(-16, 30); ctx.lineTo(-26, -6); ctx.fill();
 ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(10, -8); ctx.lineTo(0, 22); ctx.lineTo(-10, -8); ctx.fill();
 for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 36, Math.sin(T * 3 + s) * 6); ctx.rotate(s * .3); ctx.fillStyle = mix(col, '#20103a', .3); ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(8, 0); ctx.lineTo(0, 12); ctx.lineTo(-8, 0); ctx.fill(); ctx.restore(); }
 ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -6, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#20103a'; ctx.beginPath(); ctx.arc(-Math.sign(x - P.x) * 2, -6, 3.5, 0, TAU); ctx.fill();
 // hp pips
 for (let k = 0; k < 5; k++) { ctx.fillStyle = k < a.guardHp ? col : 'rgba(255,255,255,.2)'; ctx.fillRect(-24 + k * 10, -54, 8, 4); }
 ctx.restore();
}
function drawCoins(z0, z1) {
 for (let z = z0; z <= z1; z++) {
  for (const c of ZONES[z].coins) { if (c.taken || !inView(c.y)) continue; const sx = Math.cos(T * 4 + c.t); const y = c.y + Math.sin(T * 3 + c.t) * 2;
   ctx.fillStyle = '#a8741c'; ctx.beginPath(); ctx.ellipse(c.x, y, 7 * Math.abs(sx) + 1, 7, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#f3c45a'; ctx.beginPath(); ctx.ellipse(c.x, y, 5.6 * Math.abs(sx) + .6, 5.6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff3c4'; ctx.fillRect(c.x - 1, y - 4, 2 * Math.abs(sx), 3); }
  for (const g of ZONES[z].gems) { if (g.taken || !inView(g.y)) continue; const y = g.y + Math.sin(T * 2.5 + g.t) * 4; const gl = ctx.createRadialGradient(g.x, y, 0, g.x, y, 26); gl.addColorStop(0, 'rgba(63,224,207,.5)'); gl.addColorStop(1, 'rgba(63,224,207,0)'); ctx.fillStyle = gl; ctx.fillRect(g.x - 26, y - 26, 52, 52);
   ctx.fillStyle = '#127a72'; ctx.beginPath(); ctx.moveTo(g.x, y - 11); ctx.lineTo(g.x + 9, y - 3); ctx.lineTo(g.x, y + 11); ctx.lineTo(g.x - 9, y - 3); ctx.fill(); ctx.fillStyle = '#3fe0cf'; ctx.beginPath(); ctx.moveTo(g.x, y - 11); ctx.lineTo(g.x + 5, y - 3); ctx.lineTo(g.x, y + 7); ctx.lineTo(g.x - 5, y - 3); ctx.fill(); ctx.fillStyle = '#e6fffb'; ctx.fillRect(g.x - 1, y - 8, 2, 4); }
  for (const c of ZONES[z].chests) { if (!inView(c.y)) continue; if (c.hidden && !c.open) { const d = Math.hypot(P.x - c.x, P.y - c.y); if (d > 220) continue; } drawChest(c); }
 }
}
function drawChest(c) {
 ctx.save(); ctx.translate(c.x, c.y); const body = c.hidden ? '#5b2d8a' : '#8a5426', band = c.hidden ? '#d9b8ff' : '#f3c45a';
 if (!c.open) { const gl = ctx.createRadialGradient(0, -12, 0, 0, -12, 40); gl.addColorStop(0, hexA(band, .35)); gl.addColorStop(1, hexA(band, 0)); ctx.fillStyle = gl; ctx.fillRect(-40, -52, 80, 80); }
 ctx.fillStyle = body; rr(ctx, -16, -18, 32, 18, 3); ctx.fill(); ctx.fillStyle = band; ctx.fillRect(-16, -18, 32, 3); ctx.fillRect(-3, -18, 6, 18);
 if (c.open) { ctx.fillStyle = body; ctx.save(); ctx.translate(0, -18); ctx.rotate(-1.1); rr(ctx, -16, -12, 32, 12, 4); ctx.fill(); ctx.restore(); ctx.fillStyle = 'rgba(255,230,140,.5)'; ctx.fillRect(-13, -20, 26, 3); }
 else { ctx.fillStyle = body; rr(ctx, -17, -30, 34, 13, 6); ctx.fill(); ctx.fillStyle = band; ctx.fillRect(-17, -21, 34, 3); ctx.fillRect(-3, -30, 6, 12); ctx.fillStyle = '#fff'; ctx.fillRect(-2, -16, 4, 5); }
 ctx.restore();
}
function drawHazards(z0, z1) {
 for (let z = z0; z <= z1; z++) {
  for (const s of ZONES[z].spk) { if (!inView(s.y)) continue; ctx.fillStyle = '#d7dbe8'; for (let x = 0; x < s.w; x += 8.5) { ctx.beginPath(); ctx.moveTo(s.x + x, s.y + 1); ctx.lineTo(s.x + x + 4.2, s.y - 12); ctx.lineTo(s.x + x + 8.5, s.y + 1); ctx.fill(); } ctx.fillStyle = '#ff5d73'; for (let x = 0; x < s.w; x += 8.5) ctx.fillRect(s.x + x + 3.4, s.y - 12, 1.6, 3); }
  for (const j of ZONES[z].jets) { if (!inView(j.y)) continue; ctx.fillStyle = '#3a2a24'; rr(ctx, j.x - 2, j.y - 6, j.w + 4, 8, 2); ctx.fill(); ctx.fillStyle = j.warn ? `rgba(255,160,60,${.4 + .4 * Math.sin(T * 30)})` : '#5a2a14'; ctx.fillRect(j.x + 4, j.y - 6, j.w - 8, 3);
   if (j.on) { const g = ctx.createLinearGradient(0, j.y - j.h, 0, j.y); g.addColorStop(0, 'rgba(255,90,30,0)'); g.addColorStop(.5, 'rgba(255,140,40,.55)'); g.addColorStop(1, 'rgba(255,230,140,.9)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(j.x, j.y - 4); ctx.quadraticCurveTo(j.x - 8, j.y - j.h * .5, j.x + j.w / 2, j.y - j.h); ctx.quadraticCurveTo(j.x + j.w + 8, j.y - j.h * .5, j.x + j.w, j.y - 4); ctx.fill(); } }
 }
}
function drawEnemies(z0, z1) {
 for (let z = z0; z <= z1; z++) for (const e of ZONES[z].enem) {
  if (e.dead || !inView(e.y)) continue; const col = TH[e.z].enemy, flash = e.hit > 0;
  ctx.save();
  if (e.type === 'slime') {
   const sq = 1 + Math.sin(e.t * 7) * .09; ctx.translate(e.x, e.y); ctx.scale(1 / sq, sq);
   ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 4, 0, 0, TAU); ctx.fill();
   const g = ctx.createRadialGradient(-5, -20, 2, 0, -12, 22); g.addColorStop(0, flash ? '#ffffff' : mix(col, '#ffffff', .4)); g.addColorStop(1, flash ? '#ffd0d0' : mix(col, '#000000', .3)); ctx.fillStyle = g;
   ctx.beginPath(); ctx.moveTo(-18, 0); ctx.bezierCurveTo(-20, -18, -10, -28, 0, -28); ctx.bezierCurveTo(10, -28, 20, -18, 18, 0); ctx.closePath(); ctx.fill();
   ctx.fillStyle = mix(col, '#000000', .45); ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-14, -34); ctx.lineTo(-5, -27); ctx.fill(); ctx.beginPath(); ctx.moveTo(10, -24); ctx.lineTo(14, -34); ctx.lineTo(5, -27); ctx.fill();
   ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-6 + e.dir * 2, -15, 4.5, 5.5, 0, 0, TAU); ctx.ellipse(6 + e.dir * 2, -15, 4.5, 5.5, 0, 0, TAU); ctx.fill();
   ctx.fillStyle = '#1a0a1a'; ctx.beginPath(); ctx.arc(-5 + e.dir * 3.5, -14, 2.2, 0, TAU); ctx.arc(7 + e.dir * 3.5, -14, 2.2, 0, TAU); ctx.fill();
   ctx.strokeStyle = '#1a0a1a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, -22); ctx.lineTo(-3, -19); ctx.moveTo(10, -22); ctx.lineTo(3, -19); ctx.stroke();
  } else if (e.type === 'bat') {
   ctx.translate(e.x, e.y); const fl = Math.sin(e.t * 16);
   ctx.fillStyle = flash ? '#fff' : mix(col, '#000000', .55);
   for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(s * 16, -14 - fl * 10, s * 28, -6 - fl * 12); ctx.lineTo(s * 22, 2); ctx.lineTo(s * 16, -2); ctx.lineTo(s * 10, 4); ctx.closePath(); ctx.fill(); }
   ctx.fillStyle = flash ? '#fff' : mix(col, '#000000', .35); ctx.beginPath(); ctx.ellipse(0, 0, 9, 10, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(-6, -7); ctx.lineTo(-4, -15); ctx.lineTo(-1, -8); ctx.moveTo(6, -7); ctx.lineTo(4, -15); ctx.lineTo(1, -8); ctx.fill();
   ctx.fillStyle = '#ffdf5a'; ctx.beginPath(); ctx.arc(-3.5, -2, 2, 0, TAU); ctx.arc(3.5, -2, 2, 0, TAU); ctx.fill();
  } else {
   ctx.translate(e.x, e.y); ctx.globalAlpha = .9; const g = ctx.createLinearGradient(0, -24, 0, 26); g.addColorStop(0, flash ? '#fff' : mix(col, '#ffffff', .2)); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g;
   ctx.beginPath(); ctx.moveTo(-16, 20); ctx.quadraticCurveTo(-20, -24, 0, -26); ctx.quadraticCurveTo(20, -24, 16, 20); for (let k = 3; k >= -3; k--) ctx.lineTo(k * 5.3, 20 + (k % 2 ? 8 : 0) + Math.sin(e.t * 6 + k) * 3); ctx.fill();
   ctx.fillStyle = '#fff'; ctx.shadowColor = col; ctx.shadowBlur = 8; ctx.beginPath(); ctx.ellipse(-6, -10, 3.5, 5, 0, 0, TAU); ctx.ellipse(6, -10, 3.5, 5, 0, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
  }
  ctx.restore();
  if (e.hp < e.maxhp) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(e.x - 14, (e.type === 'slime' ? e.y - 44 : e.y - 30), 28, 4); ctx.fillStyle = '#ff5d73'; ctx.fillRect(e.x - 14, (e.type === 'slime' ? e.y - 44 : e.y - 30), 28 * e.hp / e.maxhp, 4); }
 }
}

/* ====================== RENDER: HERO ====================== */
function drawHero(x, y, face, st, t, opt = {}) {
 const g = ctx, fem = (opt.gender || (S && S.gender)) === 'f'; g.save(); g.translate(x, y);
 if (P.inv > 0 && !opt.noBlink && Math.floor(P.inv * 16) % 2 === 0 && (Game.state === 'play' || Game.state === 'shoot')) g.globalAlpha = .45;
 // shadow
 g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 15, 4, 0, 0, TAU); g.fill();
 const sc = opt.scale || 1; g.scale(face * sc, sc);
 let bob = 0, la = 0, ra = 0, lean = 0, arm = .5, sw = 2.3, cape = 0, crouch = 0, backArm = -.3;
 const atkP = P.atkT > 0 ? 1 - P.atkT / .28 : -1;
 switch (st) {
  case 'idle': bob = Math.sin(t * 3) * 1.1; arm = .35 + Math.sin(t * 3) * .05; sw = 2.5; break;
  case 'walk': { const c = t * 10; la = Math.sin(c) * .55; ra = -la; bob = -Math.abs(Math.sin(c)) * 2; arm = .3 + Math.sin(c) * .2; backArm = -Math.sin(c) * .5; cape = .5; break; }
  case 'run': { const c = t * 14; la = Math.sin(c) * .9; ra = -la; bob = -Math.abs(Math.sin(c)) * 3; lean = .14; arm = .9; sw = 2.6; backArm = -Math.sin(c) * .9; cape = 1; break; }
  case 'jump': la = -.6; ra = .35; arm = -.6; sw = 1.2; cape = .8; crouch = -2; backArm = -1.2; break;
  case 'fall': la = .3; ra = -.25; arm = -.3; sw = 1.6; cape = -.4; backArm = -1.6; break;
  case 'climb': { const c = t * 9; la = Math.sin(c) * .4; ra = -la; arm = Math.PI - .4 + Math.sin(c) * .3; backArm = Math.PI - .4 - Math.sin(c) * .3; sw = 3; break; }
  case 'hurt': lean = -.25; arm = -.4; backArm = -.8; la = .3; ra = -.3; break;
  case 'win': arm = Math.PI - .15; sw = -.05; bob = Math.sin(t * 4) * 1.5; backArm = .6; break;
 }
 if (atkP >= 0 || st === 'attack') { const p = atkP < 0 ? .5 : atkP; const e = 1 - Math.pow(1 - p, 3); arm = lerp(Math.PI - .3, .9, e); sw = lerp(-.6, 2.4, e); lean = .1; }
 g.translate(0, bob + crouch); g.rotate(lean);
 // cape
 const cw = Math.sin(t * 7) * 2.5, speed = cape * 10;
 const cg = g.createLinearGradient(0, -44, -18, 0); cg.addColorStop(0, fem ? '#9a4fe0' : '#d0284a'); cg.addColorStop(1, fem ? '#3a1670' : '#5e0e22'); g.fillStyle = cg;
 g.beginPath(); g.moveTo(-1, -44); g.lineTo(-8, -42); g.quadraticCurveTo(-14 - speed * .5, -24, -17 - speed + cw, -5 + Math.abs(cape) * -4); g.lineTo(-10 - speed * .6 + cw * .6, -3 - Math.abs(cape) * 3); g.lineTo(-4 - speed * .3 + cw * .3, -6); g.quadraticCurveTo(-2, -24, 2, -42); g.closePath(); g.fill();
 g.fillStyle = '#f3c45a'; g.fillRect(-9, -44, 12, 2);
 // back arm
 limb(g, -3, -40, backArm, 11, 10, '#13786f', '#e8b48a', 5);
 // legs
 leg(g, -3, -22, ra, '#18213f', true); leg(g, 3, -22, la, '#1f2a52', false);
 // torso armor
 const tg = g.createLinearGradient(-8, -44, 8, -22); tg.addColorStop(0, '#2ad1c0'); tg.addColorStop(1, '#0c5c63'); g.fillStyle = tg;
 g.beginPath(); g.moveTo(-8, -43); g.lineTo(9, -43); g.lineTo(8, -23); g.lineTo(-7, -23); g.closePath(); g.fill();
 g.strokeStyle = '#f3c45a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-8, -43); g.lineTo(9, -43); g.moveTo(0.5, -42); g.lineTo(0.5, -26); g.stroke();
 g.fillStyle = '#f3c45a'; g.beginPath(); g.arc(1.5, -35, 4, 0, TAU); g.fill(); g.fillStyle = '#5a3a0a'; g.font = '700 7px "Noto Naskh Arabic",serif'; g.textAlign = 'center'; g.fillText('ض', 1.6, -32.5);
 g.fillStyle = '#a8741c'; g.fillRect(-8, -26, 17, 4); g.fillStyle = '#ffe08a'; g.fillRect(-1, -26, 4, 4);
 // tassets
 g.fillStyle = '#0e6a6e'; g.beginPath(); g.moveTo(-8, -23); g.lineTo(-9, -15); g.lineTo(-2, -17); g.lineTo(-1, -23); g.fill(); g.beginPath(); g.moveTo(2, -23); g.lineTo(3, -17); g.lineTo(9, -15); g.lineTo(8, -23); g.fill();
 if (fem) {
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(-8, -24); g.lineTo(-12, -9); g.quadraticCurveTo(0, -5, 12, -9); g.lineTo(9, -24); g.closePath(); g.fillStyle = '#0e6a6e'; g.fill();
  g.strokeStyle = '#f3c45a'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-12, -9); g.quadraticCurveTo(0, -5, 12, -9); g.stroke();
  g.fillStyle = '#2e1760'; g.beginPath(); g.moveTo(-7, -55); g.quadraticCurveTo(-14 - cape * 3 + cw * .3, -45, -11 - cape * 5 + cw * .5, -34); g.lineTo(-2, -40); g.closePath(); g.fill();
  g.fillStyle = '#4a2a8a'; g.beginPath(); g.ellipse(1.5, -52, 9.6, 10.8, 0, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-8.5, -48); g.quadraticCurveTo(2, -37, 11.5, -46); g.lineTo(10.5, -40); g.quadraticCurveTo(1, -34, -9.5, -41); g.closePath(); g.fill();
  g.fillStyle = '#efc19a'; g.beginPath(); g.ellipse(4, -51, 5.6, 6.7, 0, 0, TAU); g.fill();
  g.strokeStyle = '#f3c45a'; g.lineWidth = 1.6; g.beginPath(); g.arc(3.5, -51, 7.3, -2.4, -.45); g.stroke();
  g.fillStyle = '#3fe0cf'; g.beginPath(); g.arc(4.2, -58.2, 1.7, 0, TAU); g.fill();
  g.fillStyle = '#1a0f0a'; g.fillRect(6, -52.6, 2, 2.4); g.fillRect(5.4, -53.5, 3.2, .8); g.fillStyle = '#c96a6a'; g.fillRect(7.2, -47.6, 2, 1);
 } else {
 // head
  g.fillStyle = '#e8b48a'; g.beginPath(); g.ellipse(2, -51, 7.5, 8.5, 0, 0, TAU); g.fill();
  g.fillStyle = '#2a1a12'; g.beginPath(); g.moveTo(-6, -50); g.quadraticCurveTo(-8, -62, 3, -61); g.quadraticCurveTo(11, -60, 10, -53); g.lineTo(6, -56); g.lineTo(-1, -55); g.lineTo(-4, -48); g.closePath(); g.fill();
  g.fillStyle = '#2a1a12'; g.beginPath(); g.moveTo(-6, -52); g.quadraticCurveTo(-12, -48, -10 - cape * 3 + cw * .3, -42); g.lineTo(-5, -47); g.fill();
  g.fillStyle = '#f3c45a'; g.fillRect(-6, -57, 15, 2.4); g.fillStyle = '#3fe0cf'; g.beginPath(); g.arc(7, -56, 1.8, 0, TAU); g.fill();
  g.fillStyle = '#1a0f0a'; g.fillRect(5.5, -52, 2, 2.6); g.fillStyle = '#c98a64'; g.fillRect(8, -48, 2, 1);
 }
 if (st === 'hurt') { g.strokeStyle = '#1a0f0a'; g.lineWidth = 1; g.beginPath(); g.moveTo(4.5, -53); g.lineTo(8, -51); g.stroke(); }
 // pauldron
 g.fillStyle = '#f3c45a'; g.beginPath(); g.ellipse(5, -42, 6, 4, -.2, Math.PI, TAU); g.fill(); g.fillStyle = '#a8741c'; g.fillRect(-1, -42, 12, 1.5);
 // front arm + sword
 const sx = 4, sy = -40; const hx = sx + Math.sin(arm) * 12, hy = sy + Math.cos(arm) * 12;
 if (atkP >= 0) { g.save(); g.globalCompositeOperation = 'lighter'; const a0 = -Math.PI / 2 + lerp(-.6, 2.4, 0), a1 = -Math.PI / 2 + sw; g.strokeStyle = 'rgba(120,255,240,.55)'; g.lineWidth = 10; g.beginPath(); g.arc(hx, hy, 28, Math.min(a0, a1), Math.max(a0, a1)); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; g.beginPath(); g.arc(hx, hy, 30, Math.min(a0, a1) + .2, Math.max(a0, a1)); g.stroke(); g.restore(); }
 sword(g, hx, hy, sw, opt.glow || (S && S.power >= 100));
 limb(g, sx, sy, arm, 12, 0, '#16938a', '#e8b48a', 5.5);
 g.fillStyle = '#f3c45a'; g.beginPath(); g.arc(sx + Math.sin(arm) * 8, sy + Math.cos(arm) * 8, 2.6, 0, TAU); g.fill();
 g.restore();
 // shield bubble
 if (P.shieldT > 0 || opt.shield) {
  g.save(); g.translate(x, y - 28); const pul = 1 + Math.sin(T * 8) * .04; g.scale(pul, pul);
  const sg = g.createRadialGradient(0, 0, 20, 0, 0, 42); sg.addColorStop(0, 'rgba(63,224,207,0)'); sg.addColorStop(.8, 'rgba(63,224,207,.18)'); sg.addColorStop(1, 'rgba(160,255,245,.6)'); g.fillStyle = sg; g.beginPath(); g.arc(0, 0, 42, 0, TAU); g.fill();
  g.strokeStyle = 'rgba(160,255,245,.8)'; g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 42, 0, TAU); g.stroke();
  g.font = '700 12px "Noto Naskh Arabic",serif'; g.fillStyle = 'rgba(220,255,250,.9)'; g.textAlign = 'center'; const L = ['ع', 'ل', 'م', 'ع', 'ل', 'م'];
  L.forEach((c, k) => { const a = T * 1.5 + k * TAU / L.length; g.fillText(c, Math.cos(a) * 34, Math.sin(a) * 34 + 4); });
  g.restore();
 }
 if (S && S.power >= 100 && Game.state === 'play' && RND() < .35) FX.push({ x: x + (RND() - .5) * 26, y: y - RND() * 50, vx: 0, vy: -60, life: .7, max: .7, size: 2, col: '#ffe08a', g: 0, type: 'spark' });
}
function limb(g, x, y, a, len, len2, col, hand, wid) { const ex = x + Math.sin(a) * len, ey = y + Math.cos(a) * len; g.strokeStyle = col; g.lineWidth = wid; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); g.fillStyle = hand; g.beginPath(); g.arc(ex, ey, wid * .5, 0, TAU); g.fill(); }
function leg(g, x, y, a, col, back) {
 g.save(); g.translate(x, y); g.rotate(-a); g.fillStyle = col; rr(g, -3.2, 0, 6.4, 15, 2.5); g.fill();
 g.translate(0, 13); g.rotate(Math.max(0, a) * .6); g.fillStyle = back ? '#5a3c1a' : '#6b4a22'; rr(g, -3.2, 0, 6.4, 9, 2); g.fill(); g.fillStyle = back ? '#b88a2c' : '#f3c45a'; g.fillRect(-3.4, 0, 6.8, 2); rr(g, -3.6, 7.5, 9.5, 3.5, 1.5); g.fillStyle = back ? '#3a2814' : '#4a3018'; g.fill(); g.restore();
}
function sword(g, x, y, a, glow) {
 g.save(); g.translate(x, y); g.rotate(a); // a: 0 points up
 g.save(); g.globalCompositeOperation = 'lighter'; const bl = g.createLinearGradient(0, 0, 0, -36); bl.addColorStop(0, glow ? 'rgba(255,220,120,.6)' : 'rgba(63,224,207,.45)'); bl.addColorStop(1, 'rgba(63,224,207,0)'); g.fillStyle = bl; g.fillRect(-6, -40, 12, 40); g.restore();
 const bg = g.createLinearGradient(-2, 0, 2, 0); bg.addColorStop(0, '#bff8f2'); bg.addColorStop(.5, '#ffffff'); bg.addColorStop(1, '#6fd8ce'); g.fillStyle = bg;
 g.beginPath(); g.moveTo(-2.4, -4); g.lineTo(-2.4, -30); g.lineTo(0, -36); g.lineTo(2.4, -30); g.lineTo(2.4, -4); g.closePath(); g.fill();
 g.fillStyle = 'rgba(30,140,140,.6)'; g.fillRect(-.4, -30, .8, 25);
 g.fillStyle = '#f3c45a'; rr(g, -7, -5, 14, 3, 1.5); g.fill(); g.fillStyle = '#6b4a22'; g.fillRect(-1.5, -2, 3, 6); g.fillStyle = '#f3c45a'; g.beginPath(); g.arc(0, 5, 2, 0, TAU); g.fill();
 g.restore();
}

/* ====================== RENDER: FX + HUD MINIMAP ====================== */
function drawFX() {
 ctx.save(); ctx.globalCompositeOperation = 'lighter';
 for (const f of FX) { const a = f.life / f.max; if (!inView(f.y, 50)) continue; ctx.globalAlpha = a; ctx.fillStyle = f.col;
  if (f.type === 'dust') { ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = a * .5; ctx.beginPath(); ctx.arc(f.x, f.y, f.size * (2 - a), 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'lighter'; }
  else if (f.type === 'fire') { ctx.beginPath(); ctx.arc(f.x, f.y, f.size * a, 0, TAU); ctx.fill(); }
  else ctx.fillRect(f.x - f.size / 2, f.y - f.size / 2, f.size, f.size); }
 ctx.restore(); ctx.globalAlpha = 1;
 for (const p of PROJ) p.draw ? p.draw(p) : drawProj(p);
 ctx.textAlign = 'center';
 for (const t of TXT) { ctx.globalAlpha = clamp(t.life / t.max * 1.5, 0, 1); ctx.font = `800 ${t.size}px Rubik,"Noto Naskh Arabic",sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.strokeText(t.s, t.x, t.y); ctx.fillStyle = t.col; ctx.fillText(t.s, t.x, t.y); }
 ctx.globalAlpha = 1;
}
function drawProj(p) {
 if (p.kind === 'wave') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(p.x, p.y); ctx.scale(p.dir, 1); ctx.strokeStyle = `rgba(120,255,240,${1 - p.t / p.dur})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-10, 0, 22, -1.1, 1.1); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-8, 0, 20, -.9, .9); ctx.stroke(); ctx.restore(); }
}
function drawAmbient(base) {
 // screen-space ambient particles per theme
 const th = TH[base], n = 26; ctx.save();
 for (let k = 0; k < n; k++) {
  const seed = k * 97.13, sx = ((Math.sin(seed) * 43758.5) % 1 + 1) % 1, sp = .3 + (((Math.sin(seed * 1.7) * 9871.3) % 1 + 1) % 1) * .7;
  let x = sx * SW, y;
  switch (th.part) {
   case 'snow': y = ((T * 40 * sp + seed * 13) % (SH + 40)) - 20; x += Math.sin(T + k) * 20; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x, y, 1.5 + sp * 2, 0, TAU); ctx.fill(); break;
   case 'ember': y = SH - ((T * 70 * sp + seed * 13) % (SH + 40)); x += Math.sin(T * 2 + k) * 14; ctx.fillStyle = `rgba(255,${120 + k * 4},60,${.5 + sp * .4})`; ctx.fillRect(x, y, 2.5, 2.5); break;
   case 'leaf': y = ((T * 30 * sp + seed * 13) % (SH + 40)) - 20; x += Math.sin(T * 1.5 + k) * 30; ctx.save(); ctx.translate(x, y); ctx.rotate(T * 2 + k); ctx.fillStyle = k % 2 ? 'rgba(130,200,90,.7)' : 'rgba(255,200,120,.6)'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.2, 0, 0, TAU); ctx.fill(); ctx.restore(); break;
   case 'firefly': case 'star': y = (((Math.sin(seed * 3.1) * 7123.7) % 1 + 1) % 1) * SH + Math.sin(T * sp + k) * 20; ctx.fillStyle = hexA(th.glow, .35 + .35 * Math.sin(T * 3 + k)); ctx.beginPath(); ctx.arc(x + Math.cos(T * sp + k) * 16, y, 2, 0, TAU); ctx.fill(); break;
   case 'rune': case 'digit': y = SH - ((T * 22 * sp + seed * 13) % (SH + 40)); ctx.font = `700 ${12 + sp * 10}px "Noto Naskh Arabic",serif`; ctx.fillStyle = hexA(th.glow, .25); ctx.fillText(th.part === 'rune' ? ['ف', 'ع', 'ل', 'ا', 'س', 'ت'][k % 6] : '٠١٢٣٤٥٦٧٨٩'[k % 10], x, y); break;
   case 'dust': case 'lantern': y = ((T * 18 * sp + seed * 13) % (SH + 40)) - 20; ctx.fillStyle = hexA(th.glow, .3); ctx.beginPath(); ctx.arc(x + Math.sin(T + k) * 10, y, th.part === 'lantern' ? 3 : 1.6, 0, TAU); ctx.fill(); break;
   case 'mist': if (k < 6) { y = SH * (.2 + k * .14); const mx = ((T * 12 * sp + seed * 40) % (SW + 400)) - 200; ctx.fillStyle = 'rgba(230,240,255,.07)'; ctx.beginPath(); ctx.ellipse(mx, y, 200, 30, 0, 0, TAU); ctx.fill(); } break;
   case 'storm': y = SH - ((T * 50 * sp + seed * 13) % (SH + 40)); ctx.fillStyle = 'rgba(180,160,255,.35)'; ctx.fillRect(x, y, 1.5, 8); break;
  }
 }
 ctx.restore();
 if (base === 9 || base === 8) { if (RND() < .004) cam.bolt = 1; }
 if (cam.bolt > 0) { ctx.fillStyle = `rgba(220,210,255,${cam.bolt * .35})`; ctx.fillRect(0, 0, SW, SH); if (cam.bolt > .7) { ctx.strokeStyle = `rgba(255,255,255,${cam.bolt})`; ctx.lineWidth = 2.5; ctx.beginPath(); let x = SW * (.2 + RND() * .6), y = 0; ctx.moveTo(x, y); while (y < SH * .5) { x += (RND() - .5) * 60; y += 30 + RND() * 30; ctx.lineTo(x, y); } ctx.stroke(); } }
}
const mm = $('#minimap'), mmx = mm.getContext('2d');
function drawMinimap() {
 const w = mm.width, h = mm.height; mmx.clearRect(0, 0, w, h);
 const seg = (h - 40) / (NZ + 1);
 for (let i = 0; i <= NZ; i++) { const y = h - 20 - (i + 1) * seg; const th = TH[i]; const cleared = i < NZ ? S.z[i].cleared : S.finished;
  const gr = mmx.createLinearGradient(0, y, 0, y + seg); gr.addColorStop(0, th.sky[1]); gr.addColorStop(1, th.sky[0]); mmx.globalAlpha = cleared ? 1 : .55; mmx.fillStyle = gr; mmx.fillRect(10, y + 1, w - 20, seg - 2); mmx.globalAlpha = 1;
  if (i < NZ) { S.z[i].st.forEach((s, k) => { mmx.fillStyle = s.done ? '#3fe0cf' : 'rgba(255,255,255,.35)'; mmx.fillRect(w - 16, y + seg * (.8 - k * .27), 5, 5); });
   mmx.fillStyle = GATES[i] && GATES[i].open ? '#ffe08a' : '#ff5d73'; mmx.fillRect(10, y, w - 20, 3); }
  mmx.fillStyle = cleared ? '#2a1a02' : '#ffffff'; mmx.font = '700 15px Rubik,sans-serif'; mmx.textAlign = 'center'; mmx.fillText(i < NZ ? String(i + 1) : '♛', w / 2 - 3, y + seg / 2 + 5);
 }
 const prog = clamp((WH - P.y) / WH, 0, 1); const py = h - 20 - prog * (h - 40);
 mmx.fillStyle = '#f3c45a'; mmx.beginPath(); mmx.moveTo(2, py - 7); mmx.lineTo(14, py); mmx.lineTo(2, py + 7); mmx.fill();
 mmx.strokeStyle = '#ffffff'; mmx.lineWidth = 2; mmx.beginPath(); mmx.moveTo(10, py); mmx.lineTo(w - 10, py); mmx.stroke();
}
let hudCache = {};
function updateHUD() {
 const z = zoneAt(P.y);
 const set = (id, v, prop = 'textContent') => { if (hudCache[id] !== v) { hudCache[id] = v; const el = document.getElementById(id); if (prop === 'w') el.style.width = v; else el[prop] = v; } };
 set('hLvl', String(S.plv)); set('hName', S.name); set('hHp', clamp(S.hp / S.maxHp, 0, 1) * 100 + '%', 'w'); set('hHpT', `${Math.max(0, Math.ceil(S.hp))}/${S.maxHp}`);
 set('hExp', (S.exp / expNeed(S.plv) * 100) + '%', 'w'); set('hPw', S.power + '%', 'w'); set('hCoin', String(S.coins)); set('hGem', String(S.gems)); set('hLife', String(S.lives));
 const full = S.power >= 100; if (hudCache.pwf !== full) { hudCache.pwf = full; $('#hPwBar').classList.toggle('full', full); }
 set('mClimb', clamp((WH - P.y) / WH, 0, 1) * 100 + '%', 'w');
 if (z < NZ) {
  set('mZone', `LV ${z + 1} · ${LV[z].name.replace('The ', '')}`);
  const ready = gateReady(z);
  set('mText', ready ? (DEMO ? 'Demo selesai — Level 2 hingga 10 dikunci dalam versi demo' : 'Portal terbuka — naik ke kawasan seterusnya') : `Misi: ${LV[z].mission}`);
  const pips = S.z[z].st.map((s, k) => `<span class="pip ${s.done ? 'done' : ''}">${TIERS[k]}</span>`).join(''); set('mPips', pips, 'innerHTML');
 } else { set('mZone', 'FINAL · The Three Kings'); set('mText', `Bos ditewaskan: ${S.bosses.filter(Boolean).length}/3`); set('mPips', S.bosses.map((b, k) => `<span class="pip ${b ? 'done' : ''}">${['ن', 'ص', 'ع'][k]}</span>`).join(''), 'innerHTML'); }
 const cdS = P.shieldCd > 0 ? (P.shieldCd / (S.abil.aegis ? 7 : 10) * 100) : 0;
 const el = $('#cdShield'); el.style.setProperty('--p', cdS + '%'); $('#cdPower').style.setProperty('--p', (100 - S.power) + '%');
}

/* ====================== RENDER LOOP ====================== */
function render() {
 ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
 const base = drawBackdrop();
 ctx.setTransform(DPR * scale, 0, 0, DPR * scale, 0, 0);
 ctx.translate((cam.ox === null ? offX : cam.ox) + cam.sx, -cam.y + cam.sy);
 drawMid();
 const z0 = zoneAt(cam.y + viewH + 100), z1 = zoneAt(cam.y - 100);
 drawWalls(Math.min(z0, z1), Math.max(z0, z1));
 drawWorldDeco(Math.min(z0, z1), Math.max(z0, z1));
 drawGates(Math.min(z0, z1), Math.max(z0, z1));
 // ground
 if (inView(WH - 30, 100)) { const g = ctx.createLinearGradient(0, WH - 30, 0, WH + 60); g.addColorStop(0, '#5aa34a'); g.addColorStop(.15, '#6e5236'); g.addColorStop(1, '#2e2013'); ctx.fillStyle = g; ctx.fillRect(-300, WH - 30, W + 600, 120); ctx.fillStyle = '#86dc66'; ctx.fillRect(-300, WH - 32, W + 600, 6); }
 drawPlatforms(Math.min(z0, z1), Math.max(z0, z1));
 drawHazards(Math.min(z0, z1), Math.max(z0, z1));
 drawAltars(Math.min(z0, z1), Math.max(z0, z1));
 drawCoins(Math.min(z0, z1), Math.max(z0, z1));
 drawEnemies(Math.min(z0, z1), Math.max(z0, z1));
 if (Game.boss) Boss.draw();
 if (!(P.dead > 0 && P.dead < 1.1)) drawHero(P.x, P.y, P.face, P.st, P.t);
 if (Game.state === 'ending') Ending.draw();
 drawFX();
 ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
 drawAmbient(base);
 // vignette
 const vg = ctx.createRadialGradient(SW / 2, SH / 2, Math.min(SW, SH) * .35, SW / 2, SH / 2, Math.max(SW, SH) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,10,.45)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, SW, SH);
 if (cam.flash > 0) { ctx.fillStyle = hexA(cam.flashC, cam.flash * .6); ctx.fillRect(0, 0, SW, SH); }
 if (Game.state !== 'title') { drawMinimap(); updateHUD(); } else drawPreviews();
}
function drawPreviews() {
 document.querySelectorAll('canvas[data-fig]').forEach(c => {
  const g2 = c.getContext('2d'), fig = c.dataset.fig, btn = c.closest('button'), sel = !!(btn && btn.classList.contains('on')), main = ctx;
  g2.setTransform(1, 0, 0, 1, 0, 0); g2.clearRect(0, 0, c.width, c.height); g2.setTransform(c.width / 120, 0, 0, c.width / 120, 0, 0);
  const bg = g2.createRadialGradient(60, 78, 4, 60, 78, 66); bg.addColorStop(0, sel ? 'rgba(243,196,90,.4)' : fig === 't' ? 'rgba(126,224,129,.16)' : 'rgba(63,224,207,.14)'); bg.addColorStop(1, 'rgba(0,0,0,0)'); g2.fillStyle = bg; g2.fillRect(0, 0, 120, 130);
  ctx = g2; try { if (fig === 't') drawTeacher(60, 124, T, 1.75); else drawHero(58, 124, 1, sel ? 'walk' : 'idle', T + (fig === 'f' ? .7 : 0), { gender: fig, scale: 1.75, noBlink: true }); } finally { ctx = main; }
 });
}
function drawTeacher(x, y, t, sc) {
 const g = ctx; g.save(); g.translate(x, y); g.scale(sc, sc);
 g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 0, 15, 4, 0, 0, TAU); g.fill();
 g.translate(0, Math.sin(t * 2) * .8);
 // jubah
 const rg = g.createLinearGradient(0, -46, 0, 0); rg.addColorStop(0, '#2a4a8a'); rg.addColorStop(1, '#14244c'); g.fillStyle = rg;
 g.beginPath(); g.moveTo(-9, -44); g.lineTo(9, -44); g.lineTo(13, -1); g.lineTo(-13, -1); g.closePath(); g.fill();
 g.fillStyle = '#f3c45a'; g.fillRect(-1, -43, 2, 42); g.fillRect(-13, -4, 26, 1.8);
 // bisht (outer cloak)
 g.fillStyle = '#6b4320'; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * 9, -44); g.lineTo(sx * 16, -2); g.lineTo(sx * 11, -2); g.lineTo(sx * 6, -38); g.closePath(); g.fill(); }
 g.strokeStyle = '#f3c45a'; g.lineWidth = .8; g.beginPath(); g.moveTo(-9, -44); g.lineTo(-16, -2); g.moveTo(9, -44); g.lineTo(16, -2); g.stroke();
 g.fillStyle = '#2a1a0e'; g.fillRect(-8, -1.5, 6, 2); g.fillRect(2, -1.5, 6, 2);
 // pointer arm
 g.strokeStyle = '#2a4a8a'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(7, -40); g.lineTo(13, -30); g.stroke();
 const pa = -1.1 + Math.sin(t * 1.6) * .15; g.strokeStyle = '#7a5226'; g.lineWidth = 1.8; g.beginPath(); g.moveTo(13, -30); g.lineTo(13 + Math.cos(pa) * 22, -30 + Math.sin(pa) * 22); g.stroke();
 g.fillStyle = '#ffe08a'; g.beginPath(); g.arc(13 + Math.cos(pa) * 22, -30 + Math.sin(pa) * 22, 1.8, 0, TAU); g.fill();
 // head
 g.fillStyle = '#e2ad86'; g.beginPath(); g.ellipse(0, -52, 7, 8, 0, 0, TAU); g.fill();
 g.fillStyle = '#d8d6d0'; g.beginPath(); g.moveTo(-6.5, -51); g.quadraticCurveTo(-6, -40, 0, -39); g.quadraticCurveTo(6, -40, 6.5, -51); g.quadraticCurveTo(3, -46, 0, -46.5); g.quadraticCurveTo(-3, -46, -6.5, -51); g.fill();
 g.strokeStyle = '#1a0f0a'; g.lineWidth = .9; g.beginPath(); g.arc(-2.8, -53, 2.3, 0, TAU); g.moveTo(5.1, -53); g.arc(2.8, -53, 2.3, 0, TAU); g.moveTo(-.5, -53); g.lineTo(.5, -53); g.stroke();
 g.fillStyle = '#1a0f0a'; g.fillRect(-3.4, -53.6, 1.2, 1.2); g.fillRect(2.2, -53.6, 1.2, 1.2);
 g.fillStyle = '#f4f1e8'; g.beginPath(); g.ellipse(0, -58, 7.6, 4.2, 0, Math.PI, 0); g.fill(); g.fillRect(-7.6, -58.5, 15.2, 2.2); g.fillStyle = '#f3c45a'; g.fillRect(-7.6, -57, 15.2, 1);
 // open book with floating letters
 g.strokeStyle = '#2a4a8a'; g.lineWidth = 5; g.beginPath(); g.moveTo(-7, -40); g.lineTo(-9, -29); g.stroke();
 g.fillStyle = '#fff6dc'; g.beginPath(); g.moveTo(-18, -32); g.lineTo(-9, -29); g.lineTo(-9, -21); g.lineTo(-18, -24); g.closePath(); g.fill(); g.beginPath(); g.moveTo(0, -32); g.lineTo(-9, -29); g.lineTo(-9, -21); g.lineTo(0, -24); g.closePath(); g.fill();
 g.strokeStyle = '#a8741c'; g.lineWidth = .8; g.stroke(); g.fillStyle = '#7a1f2e'; g.fillRect(-9.5, -29.5, 1, 9);
 g.font = '700 7px "Noto Naskh Arabic",serif'; g.textAlign = 'center';
 ['ع', 'ل', 'م'].forEach((ch, k) => { const ph = (t * .8 + k / 3) % 1; g.fillStyle = `rgba(255,224,138,${1 - ph})`; g.fillText(ch, -9 + (k - 1) * 6 + Math.sin(t * 2 + k) * 2, -34 - ph * 26); });
 g.restore();
}
let last = 0, acc = 0;
function loop(ts) {
 const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
 if (Game.state !== 'pause') { acc += dt; const st = 1 / 120; let n = 0; while (acc >= st && n < 8) { update(st); acc -= st; n++; if (n === 1) { } } if (n >= 8) acc = 0; }
 for (const k in pressed) delete pressed[k];
 render();
 requestAnimationFrame(loop);
}

/* ====================== UI HELPERS ====================== */
function toast(ic, msg) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `<span class="ic">${esc(ic)}</span><span>${esc(msg)}</span>`; const box = $('#toasts'); box.appendChild(t); while (box.children.length > 2) box.firstChild.remove(); setTimeout(() => t.remove(), 3100); }
function banner(a, b, c) { const el = $('#banner'); el.className = ''; el.innerHTML = `<div class="b1">${esc(a)}</div><div class="b2 ar">${esc(b)}</div><div class="b3">${esc(c)}</div>`; void el.offsetWidth; el.className = 'show'; }
let promptAltar = null;
function showPrompt(a, noAuto) {
 promptAltar = a; const el = $('#prompt'); el.hidden = false; $('#promptBtn').textContent = `Mulakan Cabaran ${TIERS[a.tier]} · ${TIER_MS[a.tier]}`;
 clearTimeout(showPrompt.tm); if (!noAuto) showPrompt.tm = setTimeout(() => { if (promptAltar === a && Game.state === 'play' && a.armed) startStage(a); }, 800);
}
function hidePrompt() { promptAltar = null; gatePrompt = null; $('#prompt').hidden = true; }
let gatePrompt = null;
function showGatePrompt(a) { gatePrompt = a; $('#prompt').hidden = false; $('#promptBtn').textContent = `Altar ${TIERS[a.tier]} belum aktif · Pergi ke Altar ${TIERS[a.tier]}`; }
function hideGatePrompt() { gatePrompt = null; if (!promptAltar) $('#prompt').hidden = true; }
$('#promptBtn').addEventListener('click', () => {
 if (Game.state !== 'play') return;
 if (promptAltar) { startStage(promptAltar); return; }
 if (gatePrompt) { const a = gatePrompt; hideGatePrompt(); spark(P.x, P.y - 26, 24, '#3fe0cf', 200, .6); P.x = a.x; P.y = a.plat.y; P.vx = P.vy = 0; P.inv = 2; P.climb = false; AU.play('gate'); toast(TIERS[a.tier], `Dibawa ke Altar ${TIERS[a.tier]} · ${TIER_MS[a.tier]}`); }
});
function setHUDx() {}
function setHUD(on) { $('#hud').hidden = !on; mm.hidden = !on; $('#touch').hidden = !(on && isTouch); }

/* ====================== QUIZ ====================== */
const Quiz = {
 open: false, mode: 'stage', list: [], idx: 0, cor: 0, wr: 0, combo: 0, answered: false, altar: null, res: [], startT: 0, gained: { score: 0, exp: 0, coins: 0 },
 keydown(e) {
  if (e.target && e.target.tagName === 'INPUT') return false;
  if (this.pending) { if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyY') { e.preventDefault(); this.commitPending(); return true; } if (e.code === 'Escape' || e.code === 'KeyN') { e.preventDefault(); this.cancelPending(); return true; } }
  if (!this.answered) { const n = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code); if (n >= 0) { const b = document.querySelectorAll('#qzBody .opt')[n]; if (b && !b.disabled) b.click(); return true; } }
  if ((e.code === 'Enter' || e.code === 'Space') && !$('#qzNext').hidden) { e.preventDefault(); $('#qzNext').click(); return true; }
  return true;
 },
 show() { $('#quiz').hidden = false; this.open = true; hidePrompt(); },
 hide() { $('#quiz').hidden = true; this.open = false; },
 head(tierTxt, tierCls, title, sub) { const t = $('#qzTier'); t.textContent = tierTxt; t.className = 'qz-tier ' + tierCls; $('#qzTitle').textContent = title; $('#qzSub').textContent = sub; },
 prog() { const n = this.mode === 'boss' ? 0 : this.list.length; $('#qzProg').innerHTML = this.mode === 'boss' ? '' : this.list.map((_, k) => `<i class="${this.res[k] === true ? 'ok' : this.res[k] === false ? 'no' : k === this.idx ? 'cur' : ''}"></i>`).join(''); },
 render(q) {
  this.answered = false; this.pending = null; this.q = q; $('#qzNext').hidden = true;
  const body = $('#qzBody'); let h = '';
  if (this.combo >= 2) h += `<span class="combo">COMBO ×${this.combo} · bonus ×${comboMult(this.combo).toFixed(2)}</span>`;
  const type = q.type || 'mcq';
  if (type === 'mcq') {
   h += `<div class="qtext ar" lang="ar">${esc(q.q)}</div>`;
   const opts = shuffle(q.o.map((t, k) => ({ t, ok: k === 0 }))); this.opts = opts;
   const long = opts.some(o => o.t.length > 24);
   h += `<div class="opts ${long ? 'long' : ''}">` + opts.map((o, k) => `<button class="opt" data-i="${k}"><span class="k">${AR_KEYS[k]}</span><span>${esc(o.t)}</span></button>`).join('') + '</div>';
  } else if (type === 'drag') {
   const parts = q.q.split(/\[\[|\]\]/); const word = parts[1];
   h += `<div class="note">Seret (atau ketik) lawan perkataan yang ditanda ke dalam slot.</div>`;
   h += `<div class="qtext ar" lang="ar">${esc(parts[0])}<mark>${esc(word)}</mark>${esc(parts[2] || '')}</div>`;
   h += `<div class="droprow ar"><span>ضِدُّ «${esc(word)}» ←</span><span class="slot" id="dslot">؟</span></div>`;
   const opts = shuffle(q.o.map((t, k) => ({ t, ok: k === 0 }))); this.opts = opts;
   h += `<div class="chips">` + opts.map((o, k) => `<span class="chip" data-i="${k}">${esc(o.t)}</span>`).join('') + '</div>';
  } else if (type === 'match') {
   h += `<div class="note">Seret setiap perkataan di bawah ke slot lawannya (atau ketik perkataan, kemudian ketik slot).</div>`;
   h += `<div class="qtext ar" lang="ar">${esc(q.q)}</div>`;
   this.pairs = shuffle(q.pairs.map((p, k) => ({ a: p[0], b: p[1], k }))); this.fill = {};
   h += this.pairs.map((p, r) => `<div class="mrow"><div class="w ar">${esc(p.a)}</div><span class="arrow">⟷</span><span class="slot" data-r="${r}">؟</span></div>`).join('');
   this.chipsB = shuffle(q.pairs.map((p, k) => ({ t: p[1], k })));
   h += `<div class="chips">` + this.chipsB.map((c, i) => `<span class="chip" data-i="${i}">${esc(c.t)}</span>`).join('') + '</div>';
  } else if (type === 'order') {
   h += `<div class="note">Bina semula ayat yang betul: ketik perkataan mengikut susunan (kanan ke kiri). Ketik semula untuk buang. Ada perkataan perangkap!</div>`;
   h += `<div class="qtext ar" lang="ar">${esc(q.q)}</div>`;
   this.pool = shuffle(q.w.concat(q.x || []).map((t, i) => ({ t, i }))); this.built = [];
   h += `<div class="build" id="obuild"></div><div class="chips" id="opool">` + this.pool.map((c, i) => `<span class="chip" data-i="${i}">${esc(c.t)}</span>`).join('') + '</div>';
  }
  h += `<div id="qzFb"></div>`;
  body.innerHTML = h; body.scrollTop = 0;
  if (type === 'mcq') body.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => this.answerMcq(+b.dataset.i)));
  if (type === 'drag') this.bindDrag(body.querySelectorAll('.chip'), el => el.id === 'dslot' ? el : null, (i) => this.answerDrag(i));
  if (type === 'match') this.bindDrag(body.querySelectorAll('.chip'), el => el.classList && el.classList.contains('slot') ? el : null, (i, slot) => this.placeMatch(i, slot));
  if (type === 'order') { body.querySelectorAll('#opool .chip').forEach(c => c.addEventListener('click', () => this.addOrder(+c.dataset.i))); }
  this.prog();
 },
 bindDrag(chips, slotOf, onDrop) {
  let sel = null;
  chips.forEach(ch => {
   ch.addEventListener('pointerdown', e => {
    if (this.answered || ch.classList.contains('used')) return; e.preventDefault();
    const sx = e.clientX, sy = e.clientY; let ghost = null, moved = false, hot = null;
    const mv = ev => { const dx = ev.clientX - sx, dy = ev.clientY - sy; if (!moved && Math.hypot(dx, dy) > 6) { moved = true; ghost = ch.cloneNode(true); ghost.classList.add('drag'); document.body.appendChild(ghost); }
     if (ghost) { ghost.style.left = (ev.clientX - ghost.offsetWidth / 2) + 'px'; ghost.style.top = (ev.clientY - ghost.offsetHeight / 2) + 'px'; const el = document.elementFromPoint(ev.clientX, ev.clientY); const s = el && slotOf(el.closest ? (el.closest('.slot') || el) : el); if (hot && hot !== s) hot.classList.remove('hot'); hot = s; if (s) s.classList.add('hot'); } };
    const up = ev => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); if (hot) hot.classList.remove('hot');
     if (ghost) { ghost.remove(); const el = document.elementFromPoint(ev.clientX, ev.clientY); const s = el && slotOf(el.closest ? (el.closest('.slot') || el) : el); if (s) onDrop(+ch.dataset.i, s); }
     else { // tap
      if (ch.closest('.chips') && slotOf(document.getElementById('dslot') || document.createElement('i'))) { onDrop(+ch.dataset.i, document.getElementById('dslot')); return; }
      chips.forEach(c => c.classList.remove('sel')); sel = +ch.dataset.i; ch.classList.add('sel'); this.selChip = sel;
     } };
    addEventListener('pointermove', mv); addEventListener('pointerup', up); addEventListener('pointercancel', up);
   });
  });
  document.querySelectorAll('#qzBody .slot').forEach(s => s.addEventListener('click', () => { if (this.selChip !== undefined && this.selChip !== null && !this.answered) { const i = this.selChip; this.selChip = null; chips.forEach(c => c.classList.remove('sel')); onDrop(i, s); } }));
 },
 confirm(commit, undo, hint) {
  this.pending = { commit, undo };
  const fb = $('#qzFb');
  fb.innerHTML = `<div class="confirm" role="alertdialog" aria-label="Pengesahan jawapan"><div class="cf-q"><b>Anda yakin dengan jawapan ini?</b><span class="ar" lang="ar">هَلْ أَنْتَ مُتَأَكِّدٌ؟</span>${hint ? `<small>${esc(hint)}</small>` : ''}</div><div class="cf-btns"><button class="ghost" id="cfNo">Tukar Jawapan</button><button class="cta" id="cfYes">Ya, Saya Yakin</button></div></div>`;
  $('#cfYes').onclick = () => this.commitPending(); $('#cfNo').onclick = () => this.cancelPending();
  setTimeout(() => { fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); const y = $('#cfYes'); y && y.focus({ preventScroll: true }); }, 40);
 },
 commitPending() { const p = this.pending; if (!p || this.answered) return; this.pending = null; $('#qzFb').innerHTML = ''; AU.play('step'); p.commit(); },
 cancelPending() { const p = this.pending; if (!p) return; this.pending = null; $('#qzFb').innerHTML = ''; p.undo && p.undo(); },
 clearPending() { if (!this.pending) return; this.pending = null; $('#qzFb').innerHTML = ''; },
 answerMcq(i) {
  if (this.answered) return; const btns = document.querySelectorAll('#qzBody .opt');
  btns.forEach((b, k) => b.classList.toggle('pick', k === i));
  this.confirm(() => {
   const o = this.opts[i]; btns.forEach((b, k) => { b.classList.remove('pick'); b.disabled = true; if (this.opts[k].ok) b.classList.add('ok'); }); if (!o.ok) btns[i].classList.add('no');
   this.result(o.ok, this.q.o[0]);
  }, () => btns.forEach(b => b.classList.remove('pick')), 'Anda masih boleh memilih jawapan lain sebelum menekan "Ya".');
 },
 answerDrag(i) {
  if (this.answered) return; const slot = $('#dslot'), chips = document.querySelectorAll('#qzBody .chips .chip');
  chips.forEach(c => c.classList.remove('used', 'sel')); chips[i].classList.add('used'); slot.textContent = this.opts[i].t; slot.classList.add('pickd');
  this.confirm(() => {
   const o = this.opts[i]; slot.classList.remove('pickd'); slot.classList.add(o.ok ? 'ok' : 'no');
   chips.forEach((c, k) => { if (this.opts[k].ok && !o.ok) c.classList.add('sel'); });
   this.result(o.ok, this.q.o[0]);
  }, () => { slot.textContent = '؟'; slot.classList.remove('pickd'); chips[i].classList.remove('used'); });
 },
 placeMatch(i, slot) {
  if (this.answered) return; this.clearPending(); const r = +slot.dataset.r;
  if (this.fill[r] !== undefined) { const prev = document.querySelector(`#qzBody .chips .chip[data-i="${this.fill[r]}"]`); prev && prev.classList.remove('used'); }
  for (const rr2 in this.fill) if (this.fill[rr2] === i) { delete this.fill[rr2]; const s2 = document.querySelector(`#qzBody .slot[data-r="${rr2}"]`); s2.textContent = '؟'; }
  this.fill[r] = i; slot.textContent = this.chipsB[i].t; document.querySelector(`#qzBody .chips .chip[data-i="${i}"]`).classList.add('used');
  if (Object.keys(this.fill).length === this.pairs.length) {
   this.confirm(() => {
    let all = true; this.pairs.forEach((p, rr3) => { const ok = this.chipsB[this.fill[rr3]].k === p.k; all = all && ok; const s = document.querySelector(`#qzBody .slot[data-r="${rr3}"]`); s.classList.add(ok ? 'ok' : 'no'); if (!ok) s.textContent = `${this.chipsB[this.fill[rr3]].t} ✗ ${p.b}`; });
    this.result(all, this.q.pairs.map(p => `${p[0]} ↔ ${p[1]}`).join('   ·   '));
   }, () => { this.fill = {}; document.querySelectorAll('#qzBody .slot').forEach(s => s.textContent = '؟'); document.querySelectorAll('#qzBody .chips .chip').forEach(c => c.classList.remove('used', 'sel')); }, '"Tukar Jawapan" akan mengosongkan semua padanan.');
  }
 },
 addOrder(i) {
  if (this.answered) return; const chip = document.querySelector(`#opool .chip[data-i="${i}"]`); if (chip.classList.contains('used')) return; chip.classList.add('used');
  this.built.push(i); this.drawBuild();
  if (this.built.length === this.q.w.length) {
   this.confirm(() => { const s = this.built.map(k => this.pool[k].t); const ok = s.join(' ') === this.q.w.join(' '); $('#obuild').style.borderColor = ok ? 'var(--leaf)' : 'var(--ruby)'; this.result(ok, this.q.w.join(' ')); },
    () => { this.built.forEach(k => document.querySelector(`#opool .chip[data-i="${k}"]`).classList.remove('used')); this.built = []; this.drawBuild(); }, 'Ketik perkataan dalam ayat untuk membuangnya, atau tekan "Tukar Jawapan" untuk mula semula.');
  }
 },
 drawBuild() { const b = $('#obuild'); b.innerHTML = this.built.map((k, j) => `<span class="chip" data-j="${j}">${esc(this.pool[k].t)}</span>`).join(''); b.querySelectorAll('.chip').forEach(c => c.addEventListener('click', () => { if (this.answered) return; this.clearPending(); const j = +c.dataset.j; const k = this.built[j]; this.built.splice(j, 1); document.querySelector(`#opool .chip[data-i="${k}"]`).classList.remove('used'); this.drawBuild(); })); },
 result(ok, correctText) {
  this.answered = true; const q = this.q; let gain = '';
  if (ok) {
   this.combo++; this.cor++; S.cor++; badge('first'); if (this.combo >= 5) badge('combo5'); if (this.combo >= 10) badge('combo10');
   const tf = this.mode === 'boss' ? 2.5 : TIER_F[this.tier], m = comboMult(this.combo); const sc = Math.round(100 * tf * m), ex = Math.round(10 * tf * m), cn = Math.round(4 * tf);
   S.score += sc; addExp(ex, this.zone); addCoins(cn, this.zone); this.gained.score += sc; this.gained.exp += ex; this.gained.coins += cn; if (this.zone !== undefined && this.zone < NZ) S.z[this.zone].score += sc;
   addPower(this.combo >= 3 ? 30 : 20); gain = `+${sc} markah · +${ex} EXP · +${cn} coin`; AU.play('ok');
  } else { this.combo = 0; this.wr++; S.wr++; AU.play('no'); }
  if (this.mode === 'stage') { this.res[this.idx] = ok; if (ok) S.z[this.zone].cor++; else S.z[this.zone].wr++; this.prog(); StageFX(ok); }
  else Boss.answer(ok);
  const fb = $('#qzFb');
  fb.innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><h4>${ok ? 'Betul! ' + gain : 'Kurang tepat'}</h4>
   <div class="ans ar" lang="ar">${ok ? '' : 'الْجَوَابُ الصَّحِيحُ: '}${esc(correctText)}</div>
   <p>${arw(q.e)}</p><p class="tr">Terjemahan: ${arw(q.t)}</p>
   <div class="meta">Topik: ${arw(q.tp)} · Aras: ${this.mode === 'boss' ? 'Bos (KBAT)' : TIER_MS[this.tier]} · ${esc(SRC)}</div></div>`;
  const nx = $('#qzNext'); nx.hidden = false;
  nx.textContent = this.mode === 'stage' ? (this.idx + 1 >= this.list.length ? 'Lihat Keputusan' : 'Seterusnya') : (Boss.nextLabel());
  setTimeout(() => { fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); nx.focus({ preventScroll: true }); }, 60);
 }
};
const comboMult = c => 1 + Math.min(Math.max(c - 1, 0), 8) * .25;
function StageFX(ok) {
 const a = Quiz.altar;
 if (ok) { P.atkT = .28; P.face = (a.gx || a.x) > P.x ? 1 : -1; AU.play('slash');
  PROJ.push({ x: P.x + P.face * 20, y: P.y - 30, tx: a.gx || a.x, ty: a.gy || a.y - 90, t: 0, dur: .35, update(p) { const k = p.t / p.dur; p.cx = lerp(p.x, p.tx, k); p.cy = lerp(p.y, p.ty, k); if (k >= .95 && !p.done) { p.done = 1; a.guardHit = .25; a.guardHp = Math.max(0, a.guardHp - 1); spark(p.tx, p.ty, 22, '#bff8f2', 220, .6, 3); shake(5); AU.play('hit'); } },
   draw(p) { if (p.cx === undefined) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(p.cx, p.cy); ctx.rotate(Math.atan2(p.ty - p.y, p.tx - p.x)); ctx.strokeStyle = 'rgba(160,255,245,.9)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-8, 0, 20, -1.1, 1.1); ctx.stroke(); ctx.restore(); } });
 } else {
  const sx = a.gx || a.x, sy = a.gy || a.y - 90, col = ['#7ee081', '#f3c45a', '#ff5d73'][a.tier];
  PROJ.push({ x: sx, y: sy, tx: P.x, ty: P.y - 28, t: 0, dur: .4, update(p) { const k = p.t / p.dur; p.cx = lerp(p.x, p.tx, k); p.cy = lerp(p.y, p.ty, k) - Math.sin(k * Math.PI) * 30; if (k >= .95 && !p.done) { p.done = 1; quizDamage(8 + Quiz.zone); } },
   draw(p) { if (p.cx === undefined) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, 16); g.addColorStop(0, '#ffffff'); g.addColorStop(.4, col); g.addColorStop(1, hexA(col, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.cx, p.cy, 16, 0, TAU); ctx.fill(); ctx.restore(); } });
 }
}
function quizDamage(v) {
 if (P.shieldT > 0 || Boss.shieldArmed) { if (Boss.shieldArmed) { Boss.shieldArmed = false; Boss.syncSkills(); } spark(P.x, P.y - 28, 20, '#3fe0cf', 200, .6); ftext(P.x, P.y - 70, 'Disekat!', '#9ff6ee', 18); AU.play('shield'); return; }
 S.hp -= v; P.hurtT = .4; shake(8); flash('#ff3b5c', .25); AU.play('hurt'); ftext(P.x, P.y - 64, '-' + v, '#ff8095', 20);
 if (S.hp <= 0) {
  S.lives--; S.hp = S.maxHp;
  if (S.lives <= 0) { if (Game.boss) { Boss.fail(); return; } S.lives = 3; const pen = Math.floor(S.coins * .2); S.coins -= pen; toast('!', `Semua nyawa habis — nyawa dipulihkan (penalti ${pen} coin)`); }
  else toast('♥', `Nyawa berkurang! Baki ${S.lives}`);
 }
}
function startStage(a) {
 if (Game.state !== 'play') return;
 const lv = LV[a.z]; Quiz.mode = 'stage'; Quiz.altar = a; Quiz.zone = a.z; Quiz.tier = a.tier; Quiz.idx = 0; Quiz.cor = 0; Quiz.wr = 0; Quiz.res = []; Quiz.combo = Quiz.combo || 0; Quiz.gained = { score: 0, exp: 0, coins: 0 };
 Quiz.list = shuffle(lv.tiers[TIERS[a.tier]]); a.guardHp = 5;
 Game.state = 'quiz'; P.vx = 0; P.face = 1; P.auto = clamp(a.x - 40, 20, W - 20);
 $('#bossbar').hidden = true; $('#skShield').hidden = true; $('#skPower').hidden = true; $('#qzRetreat').hidden = false;
 Quiz.head(`${TIERS[a.tier]} · ${TIER_MS[a.tier]}`, TIERS[a.tier], `Level ${lv.id} · ${lv.name}`, `${lv.topic} · ${lv.topicMs}`);
 Quiz.show(); Quiz.render(Quiz.list[0]);
}
function stageSummary() {
 const a = Quiz.altar, st = S.z[a.z].st[a.tier], c = Quiz.cor, pass = c >= 3, stars = c === 5 ? 3 : c === 4 ? 2 : c === 3 ? 1 : 0;
 if (c === 5) { S.score += 250; addCoins(25, a.z); S.z[a.z].score += 250; badge('perfect'); }
 if (pass) { const first = !st.done; st.done = true; st.best = Math.max(st.best, c); st.stars = Math.max(st.stars, stars); if (first) addExp(30 * TIER_F[a.tier], a.z); }
 save();
 $('#qzNext').hidden = true; $('#qzProg').innerHTML = ''; $('#qzRetreat').hidden = true;
 const sb = '★★★'.split('').map((s, k) => `<span class="${k < stars ? '' : 'off'}">★</span>`).join('');
 $('#qzBody').innerHTML = `<div class="summary"><h3 style="margin:0;font:700 13px var(--f-ui);letter-spacing:.12em;color:var(--mist)">PERINGKAT ${TIERS[a.tier]} · ${TIER_MS[a.tier].toUpperCase()}</h3>
  <div class="stars">${sb}</div><div style="font:800 26px var(--f-display);color:${pass ? 'var(--leaf)' : 'var(--ruby)'}">${pass ? (c === 5 ? 'SEMPURNA!' : 'LULUS!') : 'BELUM LULUS'}</div>
  <p class="note">${c}/5 betul · +${Quiz.gained.score}${c === 5 ? ' (+250 bonus sempurna)' : ''} markah · +${Quiz.gained.exp} EXP · +${Quiz.gained.coins} coin</p>
  ${pass ? '' : '<p class="note">Perlu sekurang-kurangnya 3/5 untuk mengaktifkan altar. Baca penerangan, kemudian cuba lagi — pilihan jawapan akan disusun semula.</p>'}</div>`;
 const nx = $('#qzNext'); nx.hidden = false; nx.textContent = pass ? 'Teruskan' : 'Cuba Lagi';
 nx.onclick = () => { nx.onclick = null; if (pass) endStage(true); else { Quiz.hide(); Game.state = 'play'; startStage(a); } };
}
function endStage(pass) {
 const a = Quiz.altar; Quiz.hide(); Game.state = 'play'; $('#qzNext').onclick = null; a.armed = true;
 if (pass) finishZone(a.z);
}
function finishZone(zi) {
 if (!gateReady(zi) || S.z[zi].cleared) return;
 S.z[zi].cleared = true; if (zi === 4) badge('half');
 const ab = ABIL.find(x => x[3] === zi + 1); if (ab && !S.abil[ab[0]]) { S.abil[ab[0]] = true; setTimeout(() => toast('✦', `Kebolehan baharu: ${ab[1]} — ${ab[2]}`), 600); }
 if (S.z[zi].st.every(s => s.best === 5)) badge('topic'); save(); Screens.zoneResult(zi);
}
$('#qzNext').addEventListener('click', () => {
 if ($('#qzNext').onclick) return; // custom handler set
 if (Quiz.mode === 'stage') { Quiz.idx++; if (Quiz.idx >= Quiz.list.length) stageSummary(); else Quiz.render(Quiz.list[Quiz.idx]); }
 else Boss.next();
});
$('#qzRetreat').addEventListener('click', () => {
 if (Quiz.mode === 'boss') return; Quiz.hide(); $('#qzNext').onclick = null; Game.state = 'play'; if (Quiz.altar) { Quiz.altar.armed = true; } toast('←', 'Anda berundur. Kembali ke altar bila-bila masa.');
 clearTimeout(showPrompt.tm); setTimeout(() => { if (Quiz.altar && Game.state === 'play') showPrompt(Quiz.altar, true); }, 100);
});

/* ====================== BOSS ====================== */
const BOSS_HP = [70, 95, 120], OW = 380, OH = 360, OFY = 330;
const HB = { king: [0, -105, 46, 100], dragon: [-10, -115, 80, 62], emperor: [0, -115, 42, 100] };
let oc = null, ocx = null, ocRes = 0;
function bossLayer() { const res = Math.min(DPR * scale, 2); if (!oc || ocRes !== res) { oc = document.createElement('canvas'); oc.width = Math.ceil(OW * res); oc.height = Math.ceil(OH * res); ocx = oc.getContext('2d'); ocRes = res; } ocx.setTransform(res, 0, 0, res, 0, 0); ocx.globalCompositeOperation = 'source-over'; ocx.globalAlpha = 1; ocx.clearRect(0, 0, OW, OH); return ocx; }
const Boss = {
 mode: 'quiz', shards: null, bul: [], shots: [], cracks: [], hp2: 1, max: 1, bombs: 0, beam: 0, mt: 0,
 b: null, idx: 0, phase: 0, hits: 0, hp: 9, queue: [], st: 'idle', t: 0, atkT: 0, hitT: 0, dieT: 0, x: W * .72, y: ARENA_Y, shieldArmed: false, shieldUsed: false, powerArmed: false, intro: 0, stats: null,
 start() {
  if (Game.boss) return; this.idx = S.bosses.findIndex(b => !b); if (this.idx < 0) return; this.b = BOSSES[this.idx]; Game.boss = this; Game.state = 'boss';
  this.mode = 'quiz'; this.shards = null; this.bul = []; this.shots = []; this.x = W * .72; this.y = ARENA_Y; this.mt = 0;
  { const R = rng(99 + this.idx * 7), hb = HB[this.b.key]; this.cracks = Array.from({ length: 14 }, () => { let x = hb[0] + (R() - .5) * hb[2] * 1.5, y = hb[1] + (R() - .5) * hb[3] * 1.5; const pts = [[x, y]]; let a = R() * TAU; for (let q = 0; q < 6; q++) { a += (R() - .5) * 1.4; x += Math.cos(a) * (8 + R() * 10); y += Math.sin(a) * (8 + R() * 10); pts.push([x, y]); } return pts; }); }
  this.phase = 0; this.hits = 0; this.hp = 9; this.t = 0; this.st = 'enter'; this.intro = 2.2; this.dieT = 0; this.atkT = 0; this.hitT = 0; this.shieldArmed = false; this.shieldUsed = false; this.powerArmed = false; this.stats = { cor: 0, wr: 0, t0: S.playT };
  P.auto = W * .24; P.face = 1; hidePrompt(); AU.play('boss'); shake(12);
  banner(`BOSS ${this.idx + 1} / 3`, this.b.ar, this.b.name);
  setTimeout(() => this.beginPhase(), 2300);
 },
 beginPhase() {
  if (!Game.boss) return; this.queue = shuffle(this.b.phases[this.phase]); this.hits = 0; this.shieldUsed = false; this.shieldArmed = false;
  if (this.phase > 0) this.special();
  Quiz.mode = 'boss'; Quiz.zone = NZ; Quiz.tier = 2; Quiz.gained = { score: 0, exp: 0, coins: 0 };
  $('#bossbar').hidden = false; $('#qzRetreat').hidden = true; $('#skShield').hidden = false; $('#skPower').hidden = false;
  Quiz.head(`FASA ${this.phase + 1}`, 'C', this.b.name, this.b.topic); this.bar(); this.syncSkills();
  Quiz.show(); this.ask();
 },
 ask() { if (!this.queue.length) this.queue = shuffle(this.b.phases[this.phase]); Quiz.render(this.queue.shift()); },
 bar() { $('#bName').textContent = this.b.name; $('#bAr').textContent = this.b.ar; $('#bHp').innerHTML = Array.from({ length: 9 }, (_, k) => `<i class="${k < this.hp ? '' : 'gone'}"></i>`).join(''); $('#bPhase').textContent = `Perisai Ilmu · Fasa ${this.phase + 1} / 3 · perlu ${3 - this.hits} jawapan betul lagi`; },
 syncSkills() {
  const sh = $('#skShield'), pw = $('#skPower');
  sh.textContent = this.shieldArmed ? 'Perisai aktif' : this.shieldUsed ? 'Perisai (guna)' : 'Knowledge Shield'; sh.disabled = this.shieldUsed && !this.shieldArmed; sh.classList.toggle('armed', this.shieldArmed);
  pw.textContent = this.powerArmed ? 'Power siap ×2' : `Grammar Power ${Math.round(S.power)}%`; pw.disabled = S.power < 100 && !this.powerArmed; pw.classList.toggle('armed', this.powerArmed);
 },
 answer(ok) {
  if (ok) { this.stats.cor++; const dmg = this.powerArmed ? 2 : 1; if (this.powerArmed) { this.powerArmed = false; S.power = 0; } this.hits = Math.min(3, this.hits + dmg); this.hp = Math.max(0, 9 - this.phase * 3 - this.hits); this.heroAttack(dmg); }
  else { this.stats.wr++; this.attack(); }
  this.bar(); this.syncSkills();
 },
 nextLabel() { return this.hits >= 3 ? (this.phase >= 2 ? 'Pecahkan Perisai — Bertempur!' : 'Fasa Seterusnya') : 'Soalan Seterusnya'; },
 next() {
  if (this.hits >= 3) { if (this.phase >= 2) { this.shootStart(); } else { this.phase++; Quiz.hide(); setTimeout(() => this.beginPhase(), 700); } }
  else this.ask();
 },
 heroAttack(dmg) {
  P.atkT = .28; AU.play('slash'); const big = dmg > 1;
  PROJ.push({ x: P.x + 20, y: P.y - 30, t: 0, dur: .4, update: (p) => { const k = p.t / p.dur; p.cx = lerp(p.x, this.x - 20, k); p.cy = p.y - 30 * Math.sin(k * Math.PI) - 40 * k; if (k > .95 && !p.done) { p.done = 1; this.hitT = .4; shake(big ? 16 : 9); spark(this.x - 10, this.y - 90, big ? 60 : 30, big ? '#ffe08a' : '#bff8f2', 300, .8, 3.5); ftext(this.x, this.y - 170, big ? 'قُوَّةُ النَّحْوِ ×2!' : 'ضَرْبَةٌ!', big ? '#ffe08a' : '#bff8f2', big ? 24 : 20); AU.play('hit'); if (big) { flash('#ffe08a', .5); AU.play('power'); } } },
   draw: (p) => { if (p.cx === undefined) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(p.cx, p.cy); if (big) { const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 40); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#ffe08a'); g.addColorStop(1, 'rgba(255,224,138,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.fill(); } ctx.strokeStyle = 'rgba(160,255,245,.95)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(-10, 0, 30, -1.1, 1.1); ctx.stroke(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(-8, 0, 28, -.9, .9); ctx.stroke(); ctx.restore(); } });
 },
 attack() {
  this.atkT = 1; const k = this.b.key, dmg = 12 + this.idx * 3;
  setTimeout(() => {
   if (!Game.boss) return;
   if (k === 'king') { AU.play('bolt'); cam.bolt = 1; PROJ.push({ t: 0, dur: .45, update() { }, draw: p => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(230,220,255,${1 - p.t / p.dur})`; ctx.lineWidth = 4; ctx.beginPath(); let x = P.x + (RND() - .5) * 40, y = cam.y; ctx.moveTo(x, y); while (y < P.y - 20) { x += (RND() - .5) * 30; y += 26; ctx.lineTo(x, y); } ctx.lineTo(P.x, P.y - 30); ctx.stroke(); ctx.restore(); } }); quizDamage(dmg); }
   else if (k === 'dragon') { AU.play('fire'); for (let n = 0; n < 60; n++) setTimeout(() => FX.push({ x: this.x - 90, y: this.y - 120, vx: -420 - RND() * 160, vy: 80 + RND() * 120 - 60, life: .7, max: .7, size: 8 + RND() * 8, col: RND() < .5 ? '#ff9a3a' : '#ff4a1a', g: 60, type: 'fire' }), n * 8); setTimeout(() => quizDamage(dmg), 380); }
   else { AU.play('power'); for (let n = 0; n < 3; n++) { const st = n * .12; PROJ.push({ x: this.x - 40, y: this.y - 130 - n * 20, tx: P.x, ty: P.y - 30, t: -st, dur: .55, update(p) { const kk = clamp(p.t / (p.dur - st), 0, 1); p.cx = lerp(p.x, p.tx, kk); p.cy = lerp(p.y, p.ty, kk) - Math.sin(kk * Math.PI) * 60; }, draw(p) { if (p.t < 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, 18); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#c48cff'); g.addColorStop(1, 'rgba(196,140,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.cx, p.cy, 18, 0, TAU); ctx.fill(); ctx.restore(); } }); } setTimeout(() => quizDamage(dmg), 520); }
  }, 350);
 },
 special() {
  this.atkT = 1.4; flash(['#c9b8ff', '#ff6a2a', '#ffe08a'][this.idx], .8); shake(18); AU.play('boss');
  banner(`FASA ${this.phase + 1}`, ['غَضَبُ الْمَلِكِ', 'نَارُ التِّنِّينِ', 'سِحْرُ الْإِمْبِرَاطُورِ'][this.idx], 'Serangan khas! Gunakan Knowledge Shield');
  setTimeout(() => { if (Game.boss && this.mode === 'quiz') quizDamage(8 + this.idx * 2); }, 2600);
 },
 update(dt) {
  this.t += dt; this.atkT = Math.max(0, this.atkT - dt); this.hitT = Math.max(0, this.hitT - dt);
  if (this.st === 'enter') { this.intro -= dt; if (this.intro <= 0) this.st = 'fight'; }
  if (this.mode === 'shoot' && (Game.state === 'shoot' || this.shards)) this.shootUpdate(dt);
 },
 defeat() {
  this.doneDie = false; P.win = 3.2; setTimeout(() => AU.play('win'), 900);
  S.bosses[this.idx] = true; const t = S.playT - this.stats.t0; S.bossStats[this.idx] = { cor: this.stats.cor, wr: this.stats.wr, t };
  const sc = 1500 + this.idx * 500; S.score += sc; addExp(150 + this.idx * 50); addCoins(60);
  badge(['king', 'dragon', 'emperor'][this.idx]); ftext(this.x, this.y - 220, `+${sc} markah`, '#ffe08a', 24); save();
 },
 after() {
  const done = this.idx; Game.boss = null; this.b = null; this.mode = 'quiz'; this.shards = null; $('#bossbar').hidden = true; $('#sbar').hidden = true; document.body.classList.remove('shooting');
  if (done < 2) { S.hp = S.maxHp; Game.state = 'play'; toast('♛', `${BOSSES[done].name} hancur! HP dipulihkan.`); Screens.bossResult(done); }
  else { S.finished = true; save(); Ending.start(); }
 },
 fail() {
  const inShoot = this.mode === 'shoot'; Quiz.hide(); $('#sbar').hidden = true; document.body.classList.remove('shooting'); S.lives = 3; S.hp = S.maxHp; Game.state = 'over';
  if (inShoot) { this.bul = []; this.shots = []; save(); Screens.bossFail(true); return; }
  Game.boss = null; this.b = null; save(); Screens.bossFail(false);
 },
 /* ---------- SHOOTING BATTLE ---------- */
 shootStart() {
  this.mode = 'shoot'; this.max = BOSS_HP[this.idx]; this.hp2 = this.max; this.cool = 2.2; this.bul = []; this.shots = []; this.shards = null; this.beam = 0; this.mt = 0; this.st = 'fight';
  this.bombs = Math.max(1, Math.min(5, Math.ceil(this.stats.cor / 3)));
  Quiz.hide(); $('#bossbar').hidden = true; Game.state = 'shoot';
  P.x = W * .18; P.y = ARENA_Y; P.vx = P.vy = 0; P.face = 1; P.inv = 1.5; P.auto = null; P.dead = 0; P.climb = false; P.win = 0; S.hp = Math.max(S.hp, Math.round(S.maxHp * .7));
  AU.play('boss'); shake(16); flash(['#c9b8ff', '#ff6a2a', '#ffe08a'][this.idx], .6);
  banner('PERISAI ILMU HANCUR!', 'هُجُومٌ!', 'Tembak bos sehingga hancur');
  toast('⚔', `Tahan J / SWORD untuk menembak · Space lompat elak · L / POWER = Bom Nahu ×${this.bombs}`);
  $('#sbar').hidden = false; document.body.classList.add('shooting'); this.sbar();
 },
 sbar() {
  const d = 1 - this.hp2 / this.max; $('#sbName').textContent = this.b.name;
  const st = d < .34 ? ['KUAT', 'strong'] : d < .67 ? ['CEDERA', 'hurt'] : d < .9 ? ['LEMAH', 'weak'] : ['NAZAK', 'dying'];
  const e = $('#sbState'); e.textContent = st[0]; e.className = st[1];
  $('#sbHp').style.width = (this.hp2 / this.max * 100) + '%'; $('#sbHp').className = st[1]; $('#sbBomb').textContent = `Bom Nahu ×${this.bombs}`;
 },
 heroShoot() {
  const hb = HB[this.b.key], sx = P.x + P.face * 18, sy = P.y - 32, cx = this.x + hb[0], cy = this.y + hb[1];
  let vx = P.face * 760, vy = 0;
  if (Math.sign(cx - P.x) === P.face) { const dx = cx - sx, dy = cy - sy, dd = Math.hypot(dx, dy) || 1; vx = dx / dd * 760; vy = dy / dd * 760; }
  this.shots.push({ x: sx, y: sy, vx, vy, life: 1.2, dmg: 1 + Math.floor(S.plv / 10) });
  AU.tone(900, .06, 'square', .03, -380);
 },
 bomb() {
  if (this.shards || this.hp2 <= 0) return;
  if (this.bombs <= 0) { toast('ق', 'Bom Nahu sudah habis — teruskan menembak!'); return; }
  this.bombs--; this.beam = .6; AU.play('power'); flash('#ffe08a', .7); shake(18);
  this.bul.forEach(b => { b.dead = true; spark(b.x || this.x, b.y || ARENA_Y - 10, 6, '#ffe08a', 120, .4); });
  const hb = HB[this.b.key]; ftext(P.x, P.y - 80, 'قُوَّةُ النَّحْوِ!', '#ffe08a', 24); this.hit(12, this.x + hb[0], this.y + hb[1]); this.sbar();
 },
 hit(dmg, sx, sy) {
  if (this.shards || this.hp2 <= 0) return;
  const before = this.hp2 / this.max; this.hp2 = Math.max(0, this.hp2 - dmg); this.hitT = .1;
  spark(sx, sy, 8, '#bff8f2', 200, .35, 2.5); ftext(sx + (RND() - .5) * 30, sy - 16, '-' + dmg, '#ffe08a', 15);
  if (T - (this.lastHitS || 0) > .07) { this.lastHitS = T; AU.noise(.06, .15, 1500); }
  const after = this.hp2 / this.max;
  for (const th of [.66, .33, .1]) if (before > th && after <= th) {
   AU.play('boss'); shake(12); spark(this.x, this.y - 130, 30, '#5a5a62', 160, 1.4, 7, -30, 'dust');
   toast('!', th > .5 ? `${this.b.name} cedera! Perisainya retak.` : th > .2 ? `${this.b.name} semakin lemah!` : `${this.b.name} nazak — habiskan!`);
  }
  this.sbar(); if (this.hp2 <= 0) this.shatter();
 },
 fire(d) {
  const k = this.b.key, dmg = Math.round((12 + this.idx * 2) * (1 - d * .35)), r = RND();
  if (k === 'king') {
   if (r < .55) { const n = d < .5 ? 2 : 1; for (let i = 0; i < n; i++) this.bul.push({ type: 'strike', x: clamp(P.x + (i ? (RND() - .5) * 160 : 0), 20, W - 20), t: -i * .25, dmg }); }
   else this.bul.push({ type: 'wave', x: this.x - 30, vx: -320 * (1 - d * .3), t: 0, dmg });
  } else if (k === 'dragon') {
   const mx = this.x - 115, my = this.y - 175;
   if (r < .6) { const n = d < .5 ? 3 : 1; for (let i = 0; i < n; i++) { const Tt = .9 + i * .18, tx = P.x + (i - (n - 1) / 2) * 70, ty = ARENA_Y - 8; this.bul.push({ type: 'fireball', x: mx, y: my, vx: (tx - mx) / Tt, vy: (ty - my - .5 * 700 * Tt * Tt) / Tt, t: 0, dmg }); } }
   else this.bul.push({ type: 'breath', t: 0, dur: .9 * (1 - d * .3), dmg, x: mx, y: my });
  } else {
   const ox = this.x - 30, oy = this.y - 150;
   if (r < .6) { const n = d < .5 ? 5 : 3, base = Math.atan2(P.y - 30 - oy, P.x - ox); for (let i = 0; i < n; i++) { const a = base + (i - (n - 1) / 2) * .22; this.bul.push({ type: 'orb', x: ox, y: oy, vx: Math.cos(a) * 240, vy: Math.sin(a) * 240, t: 0, dmg, r: 11 }); } }
   else { const n = d < .5 ? 2 : 1; for (let i = 0; i < n; i++) this.bul.push({ type: 'homing', x: ox, y: oy - i * 30, vx: -60, vy: -40, t: 0, dmg, r: 14, hp: 2 }); }
  }
  this.atkT = 1;
 },
 shootUpdate(dt) {
  if (this.shards) { this.updShards(dt); return; }
  const d = 1 - this.hp2 / this.max, k = this.b.key, sp = 1 - d * .55;
  this.mt += dt * sp;
  this.x = W * .72 + Math.sin(this.mt * .9) * W * .11;
  this.y = ARENA_Y + (k === 'dragon' ? -40 - Math.sin(this.mt * 1.3) * 40 * sp : k === 'emperor' ? -20 - Math.sin(this.mt * 1.1) * 20 * sp : 0);
  this.cool -= dt; if (this.cool <= 0 && !P.dead) { this.fire(d); this.cool = (1.5 + d * 1.6) * (.8 + RND() * .4); }
  this.beam = Math.max(0, this.beam - dt);
  if (RND() < d * .45) FX.push({ x: this.x + (RND() - .5) * 60, y: this.y - 120 - RND() * 80, vx: (RND() - .5) * 20, vy: -40 - RND() * 30, life: 1.4, max: 1.4, size: 6 + RND() * 6, col: '#4a4a52', g: -10, type: 'dust' });
  if (d > .4 && RND() < d * .12) spark(this.x + (RND() - .5) * 70, this.y - 60 - RND() * 120, 4, '#ff9a3a', 140, .4, 2);
  const hb = HB[k], cx = this.x + hb[0], cy = this.y + hb[1];
  for (const sh of this.shots) {
   sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.life -= dt;
   for (const b of this.bul) if (b.type === 'homing' && !b.dead && Math.hypot(b.x - sh.x, b.y - sh.y) < 18) { sh.life = 0; if (--b.hp <= 0) { b.dead = true; spark(b.x, b.y, 14, '#c48cff', 160, .5); } }
   if (sh.life > 0 && Math.abs(sh.x - cx) < hb[2] && Math.abs(sh.y - cy) < hb[3]) { sh.life = 0; this.hit(sh.dmg, sh.x, sh.y); if (this.shards) return; }
   if (sh.x < -60 || sh.x > W + 60 || sh.y > ARENA_Y + 20 || sh.y < cam.y - 60) sh.life = 0;
  }
  this.shots = this.shots.filter(sh => sh.life > 0);
  if (!P.dead && Math.abs(P.x - cx) < hb[2] * .8 + P.hw && P.y > cy - hb[3] && P.y - P.h < cy + hb[3]) damage(10, cx);
  const hitHero = (x, y, r) => !P.dead && x + r > P.x - P.hw && x - r < P.x + P.hw && y + r > P.y - P.h && y - r < P.y;
  for (const b of this.bul) {
   if (b.dead) continue; b.t += dt;
   if (b.type === 'strike') { if (b.t > .75 && !b.done) { b.done = true; AU.play('bolt'); cam.bolt = .8; shake(6); spark(b.x, ARENA_Y - 4, 16, '#e6dcff', 220, .5); if (Math.abs(P.x - b.x) < 26) damage(b.dmg, b.x); } if (b.t > 1.05) b.dead = true; }
   else if (b.type === 'wave') { b.x += b.vx * dt; if (hitHero(b.x, ARENA_Y - 14, 14)) { damage(b.dmg, b.x + 40); b.dead = true; } if (b.x < -40) b.dead = true; if (RND() < .5) spark(b.x, ARENA_Y - 6, 1, '#c9b8ff', 80, .4, 3); }
   else if (b.type === 'fireball') { b.vy += 700 * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (RND() < .7) FX.push({ x: b.x, y: b.y, vx: 0, vy: -20, life: .35, max: .35, size: 7, col: '#ff8a2a', g: 0, type: 'fire' });
    if (hitHero(b.x, b.y, 12)) { damage(b.dmg, b.x); b.dead = true; }
    else if (b.y >= ARENA_Y - 6) { b.dead = true; spark(b.x, ARENA_Y - 6, 24, '#ff7a2a', 200, .6, 4); AU.noise(.2, .2, 600); if (Math.abs(P.x - b.x) < 34 && P.y > ARENA_Y - 30) damage(b.dmg, b.x); } }
   else if (b.type === 'breath') {
    if (b.t < b.dur) { for (let n = 0; n < 2; n++) FX.push({ x: b.x, y: b.y, vx: -420 - RND() * 120, vy: 260 + RND() * 140, life: .8, max: .8, size: 9 + RND() * 6, col: RND() < .5 ? '#ff9a3a' : '#ff4a1a', g: 0, type: 'fire' }); if (!b.snd) { b.snd = 1; AU.play('fire'); } }
    const front = b.x - b.t * 420; if (b.t > .25 && b.t < b.dur + .4 && P.y > ARENA_Y - 40 && P.x > front && P.x < b.x && !b.hit) { b.hit = true; damage(b.dmg, b.x); }
    if (b.t > b.dur + .6) b.dead = true; }
   else {
    if (b.type === 'homing') { const dx = P.x - b.x, dy = P.y - 30 - b.y, dd = Math.hypot(dx, dy) || 1; b.vx += dx / dd * 260 * dt; b.vy += dy / dd * 260 * dt; const v = Math.hypot(b.vx, b.vy); if (v > 150) { b.vx *= 150 / v; b.vy *= 150 / v; } if (b.t > 5) b.dead = true; }
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (hitHero(b.x, b.y, b.r * .8)) { damage(b.dmg, b.x); b.dead = true; spark(b.x, b.y, 12, '#c48cff', 160, .5); }
    if (b.x < -60 || b.x > W + 60 || b.y > ARENA_Y + 10 || b.y < cam.y - 80) b.dead = true; }
  }
  this.bul = this.bul.filter(b => !b.dead);
 },
 paint(d) {
  const g = bossLayer(), main = ctx, k = this.b.key; ctx = g;
  try {
   g.save(); g.translate(OW / 2, OFY); g.rotate(d * .14); g.translate(-OW / 2, -OFY);
   const tt = this.t * (1 - d * .5), at = this.atkT * (1 - d * .4);
   if (k === 'king') drawKing(OW / 2, OFY, tt, at); else if (k === 'dragon') drawDragon(OW / 2, OFY, tt, at); else drawEmperor(OW / 2, OFY, tt, at);
   g.restore();
   g.globalCompositeOperation = 'source-atop';
   if (d > 0) {
    g.fillStyle = `rgba(30,6,6,${d * .5})`; g.fillRect(0, 0, OW, OH);
    const n = Math.min(this.cracks.length, Math.floor(d * this.cracks.length + .5)); g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < n; i++) { const c = this.cracks[i];
     for (const [w, col] of [[4.5, 'rgba(10,0,0,.9)'], [1.6, `rgba(255,${130 + i * 5},40,${.55 + .45 * Math.sin(this.t * 6 + i)})`]]) { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(OW / 2 + c[0][0], OFY + c[0][1]); for (const pt of c) g.lineTo(OW / 2 + pt[0], OFY + pt[1]); g.stroke(); } }
   }
   if (this.hitT > 0) { g.fillStyle = `rgba(255,255,255,${Math.min(.75, this.hitT * 6)})`; g.fillRect(0, 0, OW, OH); }
   g.globalCompositeOperation = 'source-over';
  } finally { ctx = main; }
  return oc;
 },
 shatter() {
  const L = this.paint(1); const snap = document.createElement('canvas'); snap.width = L.width; snap.height = L.height; const sg = snap.getContext('2d'); sg.drawImage(L, 0, 0); this.snap = snap;
  let data = null; try { data = sg.getImageData(0, 0, snap.width, snap.height).data; } catch (e) { }
  const ox = this.x - OW / 2, oy = this.y + 14 - OFY, cols = 10, rows = 10, cw = OW / cols, ch = OH / rows, R = rng(7 + this.idx), gp = [];
  for (let r = 0; r <= rows; r++) { gp[r] = []; for (let c = 0; c <= cols; c++) gp[r][c] = [c * cw + (c > 0 && c < cols ? (R() - .5) * cw * .7 : 0), r * ch + (r > 0 && r < rows ? (R() - .5) * ch * .7 : 0)]; }
  const alphaAt = (x, y) => { if (!data) return 255; const px = clamp(Math.floor(x / OW * snap.width), 0, snap.width - 1), py = clamp(Math.floor(y / OH * snap.height), 0, snap.height - 1); return data[(py * snap.width + px) * 4 + 3]; };
  const hb = HB[this.b.key], ccx = OW / 2 + hb[0], ccy = OFY + hb[1]; this.shards = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
   const a = gp[r][c], b = gp[r][c + 1], e = gp[r + 1][c + 1], f = gp[r + 1][c];
   for (const tri of [[a, b, e], [a, e, f]]) {
    const mx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, my = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
    if (alphaAt(mx, my) < 30 && !tri.some(q => alphaAt((q[0] + mx) / 2, (q[1] + my) / 2) > 30)) continue;
    const dx = mx - ccx, dy = my - ccy, dd = Math.hypot(dx, dy) || 1, pw = 200 + RND() * 340;
    this.shards.push({ pts: tri.map(q => [q[0] - mx, q[1] - my]), lx: mx, ly: my, x: ox + mx, y: oy + my, vx: dx / dd * pw + (RND() - .5) * 90, vy: dy / dd * pw - 240 - RND() * 220, r: 0, vr: (RND() - .5) * 11, a: 1, glow: 1 });
   }
  }
  this.bul = []; this.shots = []; this.endT = 3.6; Game.slow = 1.1;
  AU.play('boss'); AU.noise(1.4, .5, 260); AU.tone(48, 1.6, 'sawtooth', .25, -18); shake(36); flash('#ffffff', 1);
  const col = ['#c9b8ff', '#ff6a2a', '#ffe08a'][this.idx], ex = ox + ccx, ey = oy + ccy;
  spark(ex, ey, 140, col, 540, 1.5, 4.5, 220); spark(ex, ey, 70, '#ffffff', 400, .9, 3, 100);
  for (let i = 0; i < 34; i++) FX.push({ x: ex + (RND() - .5) * 90, y: ey + (RND() - .5) * 130, vx: (RND() - .5) * 90, vy: -30 - RND() * 50, life: 2.4, max: 2.4, size: 10 + RND() * 12, col: '#3a3a44', g: -15, type: 'dust' });
  ftext(ex, ey - 120, 'هَزِيمَةٌ!', '#ffffff', 30);
  $('#sbar').hidden = true; this.defeat();
 },
 updShards(dt) {
  this.endT -= dt;
  for (const sh of this.shards) {
   sh.vy += 980 * dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.r += sh.vr * dt; sh.glow = Math.max(0, sh.glow - dt * .7);
   if (sh.y > ARENA_Y - 3 && sh.vy > 0) { sh.y = ARENA_Y - 3; sh.vy *= -.32; sh.vx *= .55; sh.vr *= .5; if (Math.abs(sh.vy) < 40) sh.vy = 0; }
   if (this.endT < 1.4) sh.a = Math.max(0, this.endT / 1.4);
  }
  if (this.endT <= 0 && !this.doneDie) { this.doneDie = true; this.shards = null; this.after(); }
 },
 drawShards() {
  const g = ctx;
  for (const sh of this.shards) {
   g.save(); g.globalAlpha = sh.a; g.translate(sh.x, sh.y); g.rotate(sh.r);
   g.beginPath(); g.moveTo(sh.pts[0][0], sh.pts[0][1]); g.lineTo(sh.pts[1][0], sh.pts[1][1]); g.lineTo(sh.pts[2][0], sh.pts[2][1]); g.closePath();
   g.save(); g.clip(); g.drawImage(this.snap, -sh.lx, -sh.ly, OW, OH); g.restore();
   if (sh.glow > 0) { g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,170,60,${sh.glow})`; g.lineWidth = 1.6; g.stroke(); }
   g.restore();
  }
 },
 drawShoot() {
  const g = ctx;
  for (const b of this.bul) {
   if (b.type === 'strike') { if (b.t < 0) continue;
    if (b.t < .75) { g.fillStyle = `rgba(200,180,255,${.1 + .1 * Math.sin(T * 30)})`; g.fillRect(b.x - 26, cam.y, 52, ARENA_Y - cam.y); g.strokeStyle = `rgba(230,220,255,${.5 + .4 * Math.sin(T * 30)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(b.x, ARENA_Y - 2, 26, 7, 0, 0, TAU); g.stroke(); }
    else { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(235,225,255,${clamp(1 - (b.t - .75) / .3, 0, 1)})`; g.lineWidth = 5; g.beginPath(); let y = cam.y - 20; g.moveTo(b.x, y); while (y < ARENA_Y) { y += 30; g.lineTo(b.x + (RND() - .5) * 26, Math.min(y, ARENA_Y)); } g.stroke(); g.restore(); } }
   else if (b.type === 'wave') { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(0, ARENA_Y - 44, 0, ARENA_Y); gr.addColorStop(0, 'rgba(201,184,255,0)'); gr.addColorStop(1, 'rgba(201,184,255,.95)'); g.fillStyle = gr; g.beginPath(); g.moveTo(b.x - 18, ARENA_Y); g.quadraticCurveTo(b.x, ARENA_Y - 46, b.x + 28, ARENA_Y); g.fill(); g.restore(); }
   else if (b.type === 'fireball') { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, 18); gr.addColorStop(0, '#fff6c0'); gr.addColorStop(.4, '#ff8a2a'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, 18, 0, TAU); g.fill(); g.restore(); }
   else if (b.type === 'orb' || b.type === 'homing') { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.6); gr.addColorStop(0, '#ffffff'); gr.addColorStop(.4, b.type === 'homing' ? '#ff7bd5' : '#c48cff'); gr.addColorStop(1, 'rgba(196,140,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(b.x, b.y, b.r * 1.6, 0, TAU); g.fill(); g.restore();
    if (b.type === 'homing') { g.font = '700 13px "Noto Naskh Arabic",serif'; g.textAlign = 'center'; g.fillStyle = '#2a0a2a'; g.fillText('خ', b.x, b.y + 4); } }
  }
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const sh of this.shots) { g.save(); g.translate(sh.x, sh.y); g.rotate(Math.atan2(sh.vy, sh.vx)); const gr = g.createLinearGradient(-24, 0, 6, 0); gr.addColorStop(0, 'rgba(63,224,207,0)'); gr.addColorStop(1, 'rgba(210,255,250,1)'); g.fillStyle = gr; g.beginPath(); g.ellipse(-8, 0, 15, 3.4, 0, 0, TAU); g.fill(); g.restore(); }
  if (this.beam > 0) { const hb = HB[this.b.key], cx = this.x + hb[0], cy = this.y + hb[1], a = this.beam / .6; g.strokeStyle = `rgba(255,230,140,${a})`; g.lineWidth = 26 * a + 4; g.beginPath(); g.moveTo(P.x, P.y - 32); g.lineTo(cx, cy); g.stroke(); g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 6; g.stroke(); }
  g.restore();
 },
 draw() {
  if (!this.b) return;
  if (this.shards) { this.drawShards(); return; }
  const shoot = this.mode === 'shoot', d = shoot ? 1 - this.hp2 / this.max : 0, enter = this.st === 'enter' ? clamp(this.intro / 2.2, 0, 1) : 0;
  let x = this.x, y = this.y - enter * 400 + d * 14;
  if (this.hitT > 0 || d > .7) x += (RND() - .5) * (this.hitT > 0 ? 8 : 5 * d);
  const col = ['#c9b8ff', '#ff6a2a', '#ffe08a'][this.idx], ar = 175 * (1 - d * .6), aa = .38 * (1 - d * .85);
  const ag = ctx.createRadialGradient(x, y - 110, 10, x, y - 110, ar); ag.addColorStop(0, hexA(col, aa)); ag.addColorStop(1, hexA(col, 0)); ctx.fillStyle = ag; ctx.fillRect(x - ar, y - 110 - ar, ar * 2, ar * 2);
  const L = this.paint(d); ctx.drawImage(L, x - OW / 2, y - OFY, OW, OH);
  if (shoot) this.drawShoot();
 }
};
$('#skShield').addEventListener('click', () => { if (Boss.shieldUsed) return; Boss.shieldArmed = true; Boss.shieldUsed = true; P.shieldT = 0; AU.play('shield'); toast('ع', 'Knowledge Shield: serangan seterusnya akan disekat'); Boss.syncSkills(); });
$('#skPower').addEventListener('click', () => { if (S.power < 100 || Boss.powerArmed) return; Boss.powerArmed = true; AU.play('power'); toast('ق', 'Grammar Power siap: jawapan betul seterusnya memberi kerosakan ×2'); Boss.syncSkills(); });
function drawKing(x, y, t, atk) {
 const g = ctx; g.save(); g.translate(x, y); const br = Math.sin(t * 2) * 2; const raise = atk > 0 ? Math.sin(Math.min(1, atk) * Math.PI) : 0;
 g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 0, 60, 10, 0, 0, TAU); g.fill();
 // cape
 const cg = g.createLinearGradient(0, -150, 40, 0); cg.addColorStop(0, '#7a0f24'); cg.addColorStop(1, '#2a0510'); g.fillStyle = cg; g.beginPath(); g.moveTo(-30, -140 + br); g.quadraticCurveTo(60 + Math.sin(t * 2) * 6, -80, 56, -2); g.lineTo(-10, -4); g.lineTo(-40, -2); g.quadraticCurveTo(-46, -80, -30, -140 + br); g.fill();
 // legs
 const gold = g.createLinearGradient(-30, -150, 30, 0); gold.addColorStop(0, '#fff0b8'); gold.addColorStop(.5, '#e2a93a'); gold.addColorStop(1, '#8a5a12');
 g.fillStyle = gold; rr(g, -26, -60, 20, 58, 6); g.fill(); rr(g, 6, -60, 20, 58, 6); g.fill(); g.fillStyle = '#5a3a0a'; g.fillRect(-28, -10, 24, 10); g.fillRect(4, -10, 24, 10);
 // torso
 g.fillStyle = gold; g.beginPath(); g.moveTo(-42, -140 + br); g.lineTo(42, -140 + br); g.lineTo(32, -60); g.lineTo(-32, -60); g.closePath(); g.fill();
 g.strokeStyle = '#8a5a12'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -136 + br); g.lineTo(0, -64); g.moveTo(-30, -110); g.quadraticCurveTo(0, -96, 30, -110); g.stroke();
 g.fillStyle = '#3a0a1a'; g.beginPath(); g.arc(0, -112 + br, 12, 0, TAU); g.fill(); g.fillStyle = '#c9b8ff'; g.font = '700 16px "Noto Naskh Arabic",serif'; g.textAlign = 'center'; g.fillText('ن', 0, -106 + br);
 // pauldrons
 for (const s of [-1, 1]) { g.fillStyle = gold; g.beginPath(); g.ellipse(s * 44, -136 + br, 20, 14, s * .3, 0, TAU); g.fill(); g.fillStyle = '#8a5a12'; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(s * (36 + k * 8), -150 + br); g.lineTo(s * (40 + k * 8), -164 + br); g.lineTo(s * (44 + k * 8), -148 + br); g.fill(); } }
 // head / helmet with crown
 g.fillStyle = gold; g.beginPath(); g.ellipse(0, -164 + br, 20, 24, 0, 0, TAU); g.fill(); g.fillStyle = '#1a0a14'; rr(g, -14, -172 + br, 28, 12, 4); g.fill();
 g.fillStyle = '#e8dcff'; g.shadowColor = '#c9b8ff'; g.shadowBlur = 12; g.fillRect(-10, -168 + br, 7, 3); g.fillRect(3, -168 + br, 7, 3); g.shadowBlur = 0;
 g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(-22, -182 + br); for (let k = 0; k <= 4; k++) { g.lineTo(-22 + k * 11, -206 + br + (k % 2) * 10); g.lineTo(-16.5 + k * 11, -184 + br); } g.lineTo(22, -182 + br); g.fill(); g.fillStyle = '#ff5d73'; g.beginPath(); g.arc(0, -192 + br, 3.5, 0, TAU); g.fill();
 // arm + greatsword
 const ang = lerp(.3, -2.4, raise); g.save(); g.translate(-38, -128 + br); g.rotate(ang);
 g.strokeStyle = '#b07a1c'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 40); g.stroke();
 g.translate(0, 44); g.rotate(Math.PI); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(201,184,255,.35)'; g.fillRect(-10, 6, 20, 130); g.restore();
 const bl = g.createLinearGradient(-6, 0, 6, 0); bl.addColorStop(0, '#d7d0ff'); bl.addColorStop(.5, '#ffffff'); bl.addColorStop(1, '#8f86c9'); g.fillStyle = bl; g.beginPath(); g.moveTo(-7, 10); g.lineTo(-7, 120); g.lineTo(0, 138); g.lineTo(7, 120); g.lineTo(7, 10); g.fill();
 g.fillStyle = '#ffe08a'; rr(g, -22, 2, 44, 8, 3); g.fill(); g.fillStyle = '#5a3a0a'; g.fillRect(-4, -18, 8, 20);
 g.restore();
 // lightning crackle
 if (RND() < .3) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(220,210,255,.8)'; g.lineWidth = 1.5; g.beginPath(); let lx = (RND() - .5) * 120, ly = -200 + RND() * 120; g.moveTo(lx, ly); for (let k = 0; k < 4; k++) { lx += (RND() - .5) * 26; ly += 14; g.lineTo(lx, ly); } g.stroke(); g.restore(); }
 g.restore();
}
function drawDragon(x, y, t, atk) {
 const g = ctx; g.save(); g.translate(x, y - 40 + Math.sin(t * 2.4) * 8); const fl = Math.sin(t * 5); const open = atk > 0 ? Math.sin(Math.min(1, atk) * Math.PI) : 0;
 g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 40 - Math.sin(t * 2.4) * 8, 70, 10, 0, 0, TAU); g.fill();
 // wings
 for (const s of [1, -1]) { g.save(); g.scale(s === 1 ? 1 : .8, 1); g.translate(s === 1 ? 20 : -10, -90); g.rotate(-.2 + fl * .25 * s); const wg = g.createLinearGradient(0, 0, 140, -60); wg.addColorStop(0, '#3a0a0a'); wg.addColorStop(1, '#8a1a12'); g.fillStyle = wg; g.beginPath(); g.moveTo(0, 0); g.lineTo(70, -110); g.lineTo(150, -70); g.quadraticCurveTo(120, -40, 130, -10); g.quadraticCurveTo(95, -20, 92, 10); g.quadraticCurveTo(60, -4, 50, 26); g.closePath(); g.fill(); g.strokeStyle = '#1a0505'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(70, -110); g.lineTo(150, -70); g.moveTo(70, -110); g.lineTo(130, -10); g.moveTo(70, -110); g.lineTo(92, 10); g.moveTo(70, -110); g.lineTo(50, 26); g.stroke(); g.restore(); }
 // tail
 g.strokeStyle = '#1a0a0a'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, -30); g.quadraticCurveTo(110, 0 + Math.sin(t * 2) * 10, 90, -60 + Math.sin(t * 2.2) * 14); g.stroke(); g.fillStyle = '#c41f1a'; g.beginPath(); g.moveTo(90, -64 + Math.sin(t * 2.2) * 14); g.lineTo(108, -78 + Math.sin(t * 2.2) * 14); g.lineTo(96, -50 + Math.sin(t * 2.2) * 14); g.fill();
 // body
 const bg = g.createLinearGradient(0, -120, 0, 0); bg.addColorStop(0, '#2a1010'); bg.addColorStop(1, '#0d0505'); g.fillStyle = bg; g.beginPath(); g.ellipse(10, -60, 58, 44, -.2, 0, TAU); g.fill();
 g.fillStyle = '#d9541a'; g.beginPath(); g.ellipse(-8, -48, 30, 30, -.3, 0, TAU); g.fill(); g.strokeStyle = 'rgba(80,20,5,.6)'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(-8, -48, 30 - k * 6, 30 - k * 6, -.3, .4, 2.6); g.stroke(); }
 g.font = '700 22px "Noto Naskh Arabic",serif'; g.textAlign = 'center'; g.fillStyle = `rgba(255,220,120,${.6 + .4 * Math.sin(t * 4)})`; g.fillText('ص', -8, -40);
 // legs
 g.fillStyle = '#140707'; rr(g, -20, -30, 18, 36, 6); g.fill(); rr(g, 20, -26, 18, 32, 6); g.fill(); g.fillStyle = '#e8d8c0'; for (const lx of [-20, 20]) for (let c = 0; c < 3; c++) { g.beginPath(); g.moveTo(lx + c * 6, 6); g.lineTo(lx + c * 6 + 3, 12); g.lineTo(lx + c * 6 + 6, 6); g.fill(); }
 // neck & head (facing left)
 g.strokeStyle = '#1a0a0a'; g.lineWidth = 26; g.beginPath(); g.moveTo(-20, -90); g.quadraticCurveTo(-50, -150, -80, -130); g.stroke(); g.strokeStyle = '#d9541a'; g.lineWidth = 8; g.beginPath(); g.moveTo(-26, -86); g.quadraticCurveTo(-54, -140, -78, -122); g.stroke();
 g.save(); g.translate(-90, -132); g.rotate(-.1 - open * .1);
 g.fillStyle = '#1e0b0b'; g.beginPath(); g.moveTo(14, -16); g.lineTo(-40, -10); g.lineTo(-48, 0); g.lineTo(-38, 4); g.lineTo(14, 10); g.fill();
 g.save(); g.rotate(open * .45); g.fillStyle = '#160808'; g.beginPath(); g.moveTo(10, 4); g.lineTo(-40, 6); g.lineTo(-30, 16); g.lineTo(10, 14); g.fill(); g.restore();
 if (open > 0) { g.fillStyle = '#ff9a3a'; g.beginPath(); g.moveTo(-42, 2); g.lineTo(-10, 6); g.lineTo(-10, 10); g.fill(); }
 g.fillStyle = '#e8d8c0'; g.beginPath(); g.moveTo(6, -14); g.quadraticCurveTo(20, -34, 36, -36); g.quadraticCurveTo(22, -24, 14, -10); g.fill(); g.beginPath(); g.moveTo(-6, -12); g.quadraticCurveTo(0, -30, 12, -36); g.quadraticCurveTo(4, -22, 2, -10); g.fill();
 g.fillStyle = '#ffd23a'; g.shadowColor = '#ff9a3a'; g.shadowBlur = 14; g.beginPath(); g.ellipse(-14, -7, 6, 3.5, -.2, 0, TAU); g.fill(); g.shadowBlur = 0; g.fillStyle = '#1a0505'; g.fillRect(-15, -10, 2, 6);
 g.restore();
 g.restore();
}
function drawEmperor(x, y, t, atk) {
 const g = ctx; g.save(); g.translate(x, y - 20 + Math.sin(t * 1.8) * 6); const raise = atk > 0 ? Math.sin(Math.min(1, atk) * Math.PI) : 0;
 // magic circle with Arabic alphabet
 g.save(); g.translate(0, -110); g.rotate(t * .3); g.strokeStyle = 'rgba(255,224,138,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 112, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, 92, 0, TAU); g.stroke();
 for (let k = 0; k < 8; k++) { const a = k * TAU / 8; g.beginPath(); g.moveTo(Math.cos(a) * 92, Math.sin(a) * 92); g.lineTo(Math.cos(a + TAU * 3 / 8) * 92, Math.sin(a + TAU * 3 / 8) * 92); g.stroke(); }
 const AB = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'; g.font = '700 13px "Noto Naskh Arabic",serif'; g.fillStyle = 'rgba(255,236,170,.85)'; g.textAlign = 'center';
 for (let k = 0; k < AB.length; k++) { const a = k * TAU / AB.length; g.save(); g.translate(Math.cos(a) * 102, Math.sin(a) * 102); g.rotate(a + Math.PI / 2); g.fillText(AB[k], 0, 4); g.restore(); }
 g.restore();
 g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 20, 50, 8, 0, 0, TAU); g.fill();
 // robe
 const rg = g.createLinearGradient(0, -150, 0, 10); rg.addColorStop(0, '#fff6dc'); rg.addColorStop(1, '#d6b46a'); g.fillStyle = rg; g.beginPath(); g.moveTo(-26, -130); g.lineTo(26, -130); g.lineTo(50, 6); g.quadraticCurveTo(0, 16 + Math.sin(t * 3) * 3, -50, 6); g.closePath(); g.fill();
 g.fillStyle = '#5a1f7a'; g.beginPath(); g.moveTo(-34, -136); g.lineTo(34, -136); g.lineTo(46, -40); g.lineTo(22, -90); g.lineTo(-22, -90); g.lineTo(-46, -40); g.closePath(); g.fill();
 g.strokeStyle = '#e2a93a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -128); g.lineTo(0, 10); g.stroke(); for (let k = 0; k < 5; k++) { g.save(); g.translate(0, -70 + k * 16); g.rotate(Math.PI / 4); g.fillStyle = '#e2a93a'; g.fillRect(-4, -4, 8, 8); g.restore(); }
 // head mask
 g.fillStyle = '#f3c45a'; g.beginPath(); g.ellipse(0, -150, 17, 21, 0, 0, TAU); g.fill(); g.fillStyle = '#5a3a0a'; g.beginPath(); g.moveTo(-11, -154); g.quadraticCurveTo(-6, -158, -2, -153); g.lineTo(-11, -152); g.moveTo(11, -154); g.quadraticCurveTo(6, -158, 2, -153); g.lineTo(11, -152); g.fill();
 g.fillStyle = '#fff'; g.shadowColor = '#ffe08a'; g.shadowBlur = 14; g.fillRect(-9, -155, 6, 2.5); g.fillRect(3, -155, 6, 2.5); g.shadowBlur = 0;
 // crown & halo
 g.save(); g.globalCompositeOperation = 'lighter'; const hg = g.createRadialGradient(0, -180, 0, 0, -180, 50); hg.addColorStop(0, 'rgba(255,240,180,.8)'); hg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = hg; g.fillRect(-50, -230, 100, 100); g.restore();
 g.fillStyle = '#ffe08a'; g.beginPath(); g.moveTo(-18, -166); for (let k = 0; k <= 6; k++) { g.lineTo(-18 + k * 6, -190 - (k % 2 ? 0 : 10) - (k === 3 ? 8 : 0)); g.lineTo(-15 + k * 6, -168); } g.lineTo(18, -166); g.fill(); g.fillStyle = '#3fe0cf'; g.beginPath(); g.arc(0, -178, 3.5, 0, TAU); g.fill();
 // arms & staff
 for (const s of [-1, 1]) { g.strokeStyle = '#5a1f7a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(s * 28, -126); const ex = s * 52, ey = s < 0 ? lerp(-80, -170, raise) : -86; g.lineTo(ex, ey); g.stroke(); if (s < 0) { g.strokeStyle = '#e2a93a'; g.lineWidth = 5; g.beginPath(); g.moveTo(ex, ey + 60); g.lineTo(ex, ey - 60); g.stroke(); const og = g.createRadialGradient(ex, ey - 70, 0, ex, ey - 70, 22); og.addColorStop(0, '#fff'); og.addColorStop(.5, '#c48cff'); og.addColorStop(1, 'rgba(196,140,255,0)'); g.fillStyle = og; g.beginPath(); g.arc(ex, ey - 70, 22, 0, TAU); g.fill(); } else { g.fillStyle = 'rgba(255,224,138,.6)'; g.beginPath(); g.arc(ex, ey, 10 + Math.sin(t * 4) * 2, 0, TAU); g.fill(); } }
 g.restore();
}

/* ====================== ENDING ====================== */
const Ending = {
 t: 0, fw: 0,
 start() { Game.state = 'ending'; this.t = 0; P.win = 99; setHUD(false); hidePrompt(); AU.play('win'); setTimeout(() => Screens.legend(), 3200); },
 camY() { return P.y - viewH * .45; },
 update(dt) { this.t += dt; P.st = 'win'; P.x = lerp(P.x, W / 2, dt * 2); P.y = lerp(P.y, ARENA_Y - 660, dt * 1.2); P.face = 1;
  this.fw -= dt; if (this.fw <= 0) { this.fw = .35 + RND() * .3; const x = RND() * W, y = ARENA_Y - 700 - RND() * 300, c = ['#ffe08a', '#3fe0cf', '#ff5d73', '#c9b8ff', '#7ee081'][Math.floor(RND() * 5)]; spark(x, y, 60, c, 260, 1.4, 3, 120); AU.tone(200 + RND() * 400, .3, 'triangle', .05); } },
 draw() { const g = ctx; g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(P.x, P.y - 30, 0, P.x, P.y - 30, 160); lg.addColorStop(0, 'rgba(255,230,150,.6)'); lg.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = lg; g.fillRect(P.x - 160, P.y - 190, 320, 320); g.restore(); }
};

/* ====================== SCREENS ====================== */
const scr = $('#screen');
const Screens = {
 set(html, clear) { scr.innerHTML = html; scr.hidden = false; scr.classList.toggle('clear', !!clear); scr.scrollTop = 0; },
 close() { scr.hidden = true; scr.innerHTML = ''; if (Game.state === 'pause') Game.state = Game.prev || 'play'; },
 home() {
  Game.state = 'title'; setHUD(false); $('#sbar').hidden = true; this.stopLive();
  this.set(`<div class="card wide" style="gap:18px">
   <div class="logo"><span class="t1">ARABIC LEGENDS</span><span class="t2">Rise of the Master</span>${DEMO ? '<span class="demo-tag">VERSI DEMO · LEVEL 1 SAHAJA</span>' : ''}<span class="t3">أُسْطُورَةُ اللُّغَةِ الْعَرَبِيَّةِ</span></div>
   <p style="text-align:center;color:var(--mist)">Bahasa Arab Tingkatan 5 · Persediaan SPM. Pilih peranan anda.</p>
   <div class="roles">
    <button class="role murid" id="bMurid"><span class="figs"><canvas data-fig="m" width="240" height="260" aria-hidden="true"></canvas><canvas data-fig="f" width="240" height="260" aria-hidden="true"></canvas></span><b>Saya Murid</b><span>Pilih wira dan mula mendaki 10 dunia</span></button>
    <button class="role guru" id="bGuru"><span class="figs"><canvas data-fig="t" width="240" height="260" aria-hidden="true"></canvas></span><b>Saya Guru</b><span>Dashboard: markah, level terkini dan ketepatan murid</span></button>
   </div>
  </div>`);
  $('#bMurid').onclick = () => { AU.init(); AU.play('coin'); this.login(); };
  $('#bGuru').onclick = () => { AU.init(); AU.play('coin'); this.teacher(); };
 },
 liveT: null, liveRaw: null, sortK: 'markah', sortD: -1, q: '',
 stopLive() { clearInterval(this.liveT); this.liveT = null; removeEventListener('storage', this.onStore); },
 onStore(e) { if (!e || e.key === null || e.key === GD_KEY) Screens.renderDash(); },
 teacher() {
  Game.state = 'title'; setHUD(false); this.stopLive(); this.liveRaw = null;
  this.set(`<div class="card wide dash">
   <div class="dash-head"><div><h2 style="text-align:left">Dashboard Guru</h2><span class="live"><i></i><span id="dMode">Langsung · dikemas kini automatik tanpa refresh</span></span></div><button class="ghost" id="bHome">← Skrin Utama</button></div>
   <div class="grid2 tiles" id="dTiles"></div>
   <div class="dash-tools"><input id="dSearch" type="search" placeholder="Cari nama murid" autocomplete="off" value="${esc(this.q)}"><button class="ghost" id="dCopy">Salin jadual (CSV)</button><button class="ghost" id="dClear">Padam semua rekod</button></div>
   <div id="dConfirm"></div>
   <div class="tbl-wrap"><table class="dtable"><thead><tr>
    ${[['nama', 'Nama'], ['wira', 'Wira'], ['level', 'Level terkini'], ['levelSelesai', 'Level selesai'], ['markah', 'Markah'], ['betul', 'Betul / Salah'], ['ketepatan', 'Ketepatan'], ['bintang', 'Bintang'], ['bos', 'Bos'], ['masaMain', 'Masa main'], ['kemaskini', 'Kemaskini']].map(([k, n]) => `<th data-k="${k}" tabindex="0">${n}<span class="sa"></span></th>`).join('')}<th></th></tr></thead><tbody id="dBody"></tbody></table></div>
   <p class="note" id="dSrc">Data dibaca daripada <b>localStorage['gamedata']</b> pada pelayar peranti ini. Rekod murid dikemas kini setiap kali murid menamatkan peringkat atau level, dan semasa bermain. Ketik baris murid untuk melihat skor A/B/C setiap level.</p>
   <textarea id="dCsv" hidden readonly></textarea>
  </div>`);
  $('#bHome').onclick = () => this.home();
  $('#dSearch').oninput = e => { this.q = e.target.value; this.renderDash(true); };
  scr.querySelectorAll('.dtable th[data-k]').forEach(th => { const go = () => { const k = th.dataset.k; if (this.sortK === k) this.sortD *= -1; else { this.sortK = k; this.sortD = (k === 'nama' || k === 'wira') ? 1 : -1; } this.renderDash(true); }; th.onclick = go; th.onkeydown = e => { if (e.key === 'Enter') go(); }; });
  $('#dCopy').onclick = () => { const rows = this.dashRows(); const head = ['Nama', 'Wira', 'Level terkini', 'Level selesai', 'Markah', 'Betul', 'Salah', 'Ketepatan %', 'Bintang', 'Bos', 'Masa main (min)', 'Kemaskini'];
   const csv = [head].concat(rows.map(r => [r.nama, r.wira, lvlName(r.level), r.levelSelesai, r.markah, r.betul, r.salah, r.ketepatan, r.bintang, r.bos, Math.round(r.masaMain / 60), new Date(r.kemaskini).toLocaleString('ms-MY')])).map(a => a.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
   const ta = $('#dCsv'); const done = () => toast('✓', 'Jadual disalin. Tampal ke Excel atau Google Sheets.');
   (navigator.clipboard ? navigator.clipboard.writeText(csv) : Promise.reject()).then(done).catch(() => { ta.hidden = false; ta.value = csv; ta.focus(); ta.select(); toast('!', 'Salinan automatik disekat — teks telah dipilih, tekan Ctrl+C / Salin.'); }); };
  $('#dClear').onclick = () => { $('#dConfirm').innerHTML = `<div class="fb no"><p>Padam <b>semua</b> rekod murid daripada peranti ini? Tindakan ini tidak boleh dibatalkan.</p><div class="row"><button class="ghost" id="dNo">Batal</button><button class="cta" id="dYes">Ya, padam semua</button></div></div>`; $('#dNo').onclick = () => $('#dConfirm').innerHTML = ''; $('#dYes').onclick = () => { writeGD([]); $('#dConfirm').innerHTML = ''; this.renderDash(true); toast('✓', 'Semua rekod dipadam.'); }; };
  addEventListener('storage', this.onStore);
  this.cloudRows = null; this.cloudErr = false;
  CLOUD.ready.then(on => {
   if (!document.getElementById('dBody')) return;
   if (on) {
    $('#dMode').textContent = 'Langsung · disegerakkan dengan pangkalan data Cloudflare D1 setiap 4 saat';
    $('#dSrc').innerHTML = 'Data dibaca daripada <b>pangkalan data Cloudflare D1</b> — semua murid dari semua peranti. Rekod dikemas kini semasa murid bermain dan setiap kali tamat peringkat atau level. Ketik baris murid untuk melihat skor A/B/C setiap level. Untuk memadam rekod, gunakan konsol D1 di papan pemuka Cloudflare.';
    $('#dClear').hidden = true; this.pullCloud(); this.liveT = setInterval(() => this.pullCloud(), 4000);
   } else this.liveT = setInterval(() => this.renderDash(), 1500);
  });
  this.renderDash(true);
 },
 openRow: null,
 dashRows() { return CLOUD.on ? (this.cloudRows || []) : readGD(); },
 async pullCloud() {
  if (!document.getElementById('dBody')) { this.stopLive(); return; }
  try { const r = await fetch('/api/students?edition=all', { cache: 'no-store' }); if (!r.ok) throw 0; const d = await r.json(); this.cloudRows = d.rows || []; this.cloudErr = false; }
  catch (e) { if (!this.cloudErr) { this.cloudErr = true; toast('!', 'Tidak dapat membaca pangkalan data. Mencuba semula…'); } }
  this.renderDash();
 },
 renderDash(force) {
  const body = document.getElementById('dBody'); if (!body) { this.stopLive(); return; }
  let raw = ''; if (CLOUD.on) raw = JSON.stringify(this.cloudRows || []); else { try { raw = localStorage.getItem(GD_KEY) || '[]'; } catch (e) { } }
  if (!force && raw === this.liveRaw) { body.querySelectorAll('[data-ago]').forEach(el => el.textContent = ago(+el.dataset.ago)); return; }
  const fresh = this.liveRaw !== null && raw !== this.liveRaw; this.liveRaw = raw;
  const all = this.dashRows(), n = all.length, avg = k => n ? Math.round(all.reduce((a, r) => a + (r[k] || 0), 0) / n) : 0;
  $('#dTiles').innerHTML = [['Bilangan murid', n], ['Purata markah', avg('markah')], ['Purata ketepatan', avg('ketepatan') + '%'], ['Tamat permainan', all.filter(r => r.tamat).length]].map(([a, b]) => `<div class="kv"><span>${a}</span><b>${b}</b></div>`).join('');
  const q = this.q.trim().toLowerCase(), k = this.sortK, d = this.sortD;
  const rows = all.filter(r => !q || String(r.nama).toLowerCase().includes(q)).sort((a, b) => { const x = a[k], y = b[k]; return (typeof x === 'string' ? x.localeCompare(y) : (x || 0) - (y || 0)) * d; });
  scr.querySelectorAll('.dtable th[data-k]').forEach(th => { th.querySelector('.sa').textContent = th.dataset.k === k ? (d > 0 ? ' ▲' : ' ▼') : ''; th.setAttribute('aria-sort', th.dataset.k === k ? (d > 0 ? 'ascending' : 'descending') : 'none'); });
  if (!rows.length) { body.innerHTML = `<tr><td colspan="12" class="empty">${n ? 'Tiada murid sepadan dengan carian.' : 'Belum ada data murid. Minta murid tekan <b>Saya Murid</b> dan mula bermain di peranti ini — rekod akan muncul di sini secara automatik.'}</td></tr>`; return; }
  const LET = ['A', 'B', 'C'];
  body.innerHTML = rows.map((r, i) => {
   const acc = r.ketepatan, cls = acc >= 80 ? 'good' : acc >= 60 ? 'mid' : 'low', open = this.openRow === r.id;
   const det = open ? `<tr class="det"><td colspan="12"><div class="lvgrid">${(r.perLevel || []).map((st, li) => `<div class="lvc ${li >= (r.levelSelesai || 0) && li + 1 !== r.level ? 'dim' : ''}"><b>L${li + 1}</b>${st.map((v, t) => `<span class="${v >= 3 ? 'p' : v ? 'f' : ''}">${LET[t]} ${v}/5</span>`).join('')}</div>`).join('')}</div></td></tr>` : '';
   return `<tr class="srow" data-id="${esc(r.id)}" tabindex="0"><td class="nm">${esc(r.nama)}${r.demo ? ' <small>demo</small>' : ''}</td><td>${esc(r.wira)}</td><td><span class="lvchip">${esc(lvlName(r.level))}</span></td>
    <td><div class="prog"><i style="width:${(r.levelSelesai || 0) * 10}%"></i></div><small>${r.levelSelesai || 0}/10</small></td><td class="num"><b>${r.markah}</b></td><td class="num">${r.betul} / ${r.salah}</td><td class="num"><span class="acc ${cls}">${acc}%</span></td>
    <td class="num">${r.bintang}/30</td><td class="num">${r.bos}/3</td><td class="num">${fmtT(r.masaMain || 0)}</td><td data-ago="${r.kemaskini}">${ago(r.kemaskini)}</td><td>${CLOUD.on ? '' : `<button class="ghost del" data-del="${esc(r.id)}" aria-label="Padam rekod ${esc(r.nama)}">Padam</button>`}</td></tr>${det}`;
  }).join('');
  body.querySelectorAll('tr.srow').forEach(tr => { const t = () => { this.openRow = this.openRow === tr.dataset.id ? null : tr.dataset.id; this.renderDash(true); }; tr.onclick = e => { if (e.target.closest('.del')) return; t(); }; tr.onkeydown = e => { if (e.key === 'Enter') t(); }; });
  body.querySelectorAll('.del').forEach(bt => bt.onclick = () => { const id = bt.dataset.del, r = all.find(x => x.id === id); $('#dConfirm').innerHTML = `<div class="fb no"><p>Padam rekod <b>${esc(r ? r.nama : '')}</b>?</p><div class="row"><button class="ghost" id="dNo">Batal</button><button class="cta" id="dYes">Padam</button></div></div>`; $('#dNo').onclick = () => $('#dConfirm').innerHTML = ''; $('#dYes').onclick = () => { writeGD(readGD().filter(x => x.id !== id)); $('#dConfirm').innerHTML = ''; this.renderDash(true); }; });
  if (fresh) { const l = scr.querySelector('.live'); if (l) { l.classList.remove('ping'); void l.offsetWidth; l.classList.add('ping'); } }
 },
 fails: 0, lockUntil: 0,
 login() {
  Game.state = 'title'; setHUD(false); $('#sbar').hidden = true; this.stopLive();
  if (STUDENT) { this.title(); return; }
  this.set(`<form class="card login" id="lgForm" autocomplete="on" novalidate>
   <button type="button" class="ghost back" id="bBack">← Skrin Utama</button>
   <div class="logo"><span class="t1 sm">ARABIC LEGENDS</span><span class="t2">Log Masuk Murid</span></div>
   <div class="login-fig"><canvas data-fig="m" width="240" height="260" aria-hidden="true"></canvas><canvas data-fig="f" width="240" height="260" aria-hidden="true"></canvas></div>
   <div class="field"><label for="lgName">Nama murid</label><input id="lgName" name="username" maxlength="18" autocomplete="username" placeholder="Contoh: Aisyah binti Ali" required></div>
   <div class="field"><label for="lgPass">Kata laluan</label><div class="pw"><input id="lgPass" name="password" type="password" maxlength="40" autocomplete="current-password" placeholder="Kata laluan daripada guru" required><button type="button" class="ghost" id="lgEye" aria-label="Tunjuk kata laluan">Tunjuk</button></div></div>
   <div id="lgErr" class="lg-err" role="alert" hidden></div>
   <button type="submit" class="cta" id="lgGo">Log Masuk</button>
   <p class="note" style="text-align:center">Minta kata laluan daripada guru anda. Gunakan nama yang sama setiap kali supaya kemajuan anda disambung.</p>
  </form>`);
  $('#bBack').onclick = () => this.home();
  $('#lgEye').onclick = () => { const i = $('#lgPass'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; $('#lgEye').textContent = show ? 'Sorok' : 'Tunjuk'; $('#lgEye').setAttribute('aria-label', show ? 'Sorok kata laluan' : 'Tunjuk kata laluan'); };
  const err = msg => { const e = $('#lgErr'); e.textContent = msg; e.hidden = false; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); AU.play('no'); };
  $('#lgForm').addEventListener('submit', async ev => {
   ev.preventDefault(); AU.init();
   const name = $('#lgName').value.trim().replace(/\s+/g, ' '), pw = $('#lgPass').value;
   const wait = Math.ceil((this.lockUntil - Date.now()) / 1000);
   if (wait > 0) { err(`Terlalu banyak cubaan. Tunggu ${wait} saat.`); return; }
   if (name.length < 2) { err('Masukkan nama anda (sekurang-kurangnya 2 huruf).'); $('#lgName').focus(); return; }
   if (!pw) { err('Masukkan kata laluan.'); $('#lgPass').focus(); return; }
   const btn = $('#lgGo'); btn.disabled = true; btn.textContent = 'Menyemak…';
   let cloudOk = false, cloudName = name, cloudSave = null;
   try {
    if (await CLOUD.ready) {
     let r;
     try { r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, password: pw, edition: DEMO ? 'demo' : 'full' }) }); }
     catch (e) { err('Tidak dapat menghubungi pelayan. Semak sambungan internet dan cuba lagi.'); return; }
     if (r.status === 401) { this.fails++; if (this.fails >= 5) { this.fails = 0; this.lockUntil = Date.now() + 30000; err('Kata laluan salah 5 kali. Cuba lagi selepas 30 saat.'); } else err(`Kata laluan salah. Semak dengan guru anda. (Cubaan ${this.fails}/5)`); $('#lgPass').select(); return; }
     if (!r.ok) { let m = 'Pelayan sedang bermasalah. Cuba sebentar lagi.'; try { m = (await r.json()).error || m; } catch (e) { } err(m); return; }
     const d = await r.json(); CLOUD.token = d.token; CLOUD.warned = false; try { sessionStorage.setItem('al_token', d.token); } catch (e) { }
     cloudOk = true; cloudName = d.name || name; cloudSave = d.save && d.save.v === 1 ? d.save : null;
    }
   } finally { btn.disabled = false; btn.textContent = 'Log Masuk'; }
   if (cloudOk) {
    this.fails = 0; STUDENT = cloudName; try { sessionStorage.setItem('al_student', cloudName); } catch (e) { }
    const local = loadSave();
    if (cloudSave && (!local || (cloudSave.playT || 0) >= (local.playT || 0))) { try { localStorage.setItem(saveKey(), JSON.stringify(cloudSave)); } catch (e) { } }
    AU.play('ok'); toast('✓', `Selamat datang, ${cloudName}! Kemajuan disegerakkan dengan awan.`); this.title(); return;
   }
   if (!checkStudentPw(pw)) { this.fails++; if (this.fails >= 5) { this.fails = 0; this.lockUntil = Date.now() + 30000; err('Kata laluan salah 5 kali. Cuba lagi selepas 30 saat.'); } else err(`Kata laluan salah. Semak dengan guru anda. (Cubaan ${this.fails}/5)`); $('#lgPass').select(); return; }
   this.fails = 0; STUDENT = name; try { sessionStorage.setItem('al_student', name); } catch (e) { }
   AU.play('ok'); toast('✓', `Selamat datang, ${name}!`); this.title();
  });
  setTimeout(() => { const n = $('#lgName'); n && !isTouch && n.focus(); }, 60);
 },
 logout() { cloudPush(true); STUDENT = null; CLOUD.token = null; try { sessionStorage.removeItem('al_student'); sessionStorage.removeItem('al_token'); } catch (e) { } toast('←', 'Anda telah log keluar.'); this.home(); },
 title() {
  if (!STUDENT) { this.login(); return; }
  Game.state = 'title'; setHUD(false); $('#sbar').hidden = true; this.stopLive(); const sv = loadSave();
  this.set(`<div class="card" style="gap:16px">
   <button class="ghost back" id="bBack">← Skrin Utama</button>
   <div class="logo"><span class="t1">ARABIC LEGENDS</span><span class="t2">Rise of the Master</span>${DEMO ? '<span class="demo-tag">VERSI DEMO · LEVEL 1 SAHAJA</span>' : ''}<span class="t3">أُسْطُورَةُ اللُّغَةِ الْعَرَبِيَّةِ</span></div>
   <p style="text-align:center;color:var(--mist)">Daki 10 dunia menegak, aktifkan 30 altar ilmu, dan tumbangkan Tiga Raja di puncak Istana Emas. Bahasa Arab Tingkatan 5 · Persediaan SPM.</p>
   <div class="field"><label>Pilih wira</label><div class="heroes">
    <button class="hpick" data-g="m" aria-pressed="false"><canvas data-fig="m" width="240" height="260" aria-hidden="true"></canvas><b>Wira Lelaki</b><span>Pahlawan Nahu</span></button>
    <button class="hpick" data-g="f" aria-pressed="false"><canvas data-fig="f" width="240" height="260" aria-hidden="true"></canvas><b>Wira Perempuan</b><span>Srikandi Sarf</span></button>
   </div></div>
   <div class="who"><span>Log masuk sebagai <b>${esc(STUDENT)}</b></span><button class="ghost" id="bLogout">Log Keluar</button></div>
   <div class="row">${sv ? `<button class="cta teal" id="bCont">Sambung · Lv ${sv.plv} · ${sv.z.filter(z => z.cleared).length}/10 level</button>` : ''}<button class="cta" id="bNew">${sv ? 'Pengembaraan Baharu' : 'Mula Pengembaraan'}</button></div>
   <div id="newWarn" hidden class="fb no"><p>Pengembaraan baharu akan memadam kemajuan yang disimpan.</p><div class="row"><button class="ghost" id="bNo">Batal</button><button class="cta" id="bYes">Ya, mula semula</button></div></div>
   <div class="keys"><kbd>A / D · ← →</kbd><span>Bergerak (tahan untuk berlari)</span><kbd>Space</kbd><span>Lompat · tahan di tangga untuk memanjat (W / ↑)</span><kbd>J</kbd><span>Arabic Sword</span><kbd>K</kbd><span>Knowledge Shield</span><kbd>L</kbd><span>Grammar Power (penuh selepas jawapan betul)</span><kbd>1–4 · Enter</kbd><span>Jawab soalan · seterusnya</span></div>
   <p class="note">Telefon & tablet: gunakan butang sentuh. Kemajuan disimpan automatik dalam pelayar ini. Semua soalan ialah soalan latihan original yang diadaptasi daripada format SPM KSSM (tiada dakwaan sumber kertas percubaan negeri).</p>
  </div>`);
  let gen = sv && sv.gender === 'f' ? 'f' : 'm';
  const pick = g => { gen = g; scr.querySelectorAll('.hpick').forEach(b => { const on = b.dataset.g === g; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); };
  scr.querySelectorAll('.hpick').forEach(b => b.onclick = () => { AU.init(); pick(b.dataset.g); AU.play('coin'); }); pick(gen);
  const go = (fresh) => { AU.init(); const nm = STUDENT; if (fresh) { wipeSave(); S = freshSave(nm); } else { S = loadSave() || freshSave(nm); if (normName(S.name) !== normName(nm)) S.name = nm; } S.gender = gen; startGame(); };
  $('#bBack').onclick = () => this.home();
  $('#bNew').onclick = () => { if (sv) { $('#newWarn').hidden = false; } else go(true); };
  if (sv) { $('#bCont').onclick = () => go(false); $('#bNo').onclick = () => $('#newWarn').hidden = true; $('#bYes').onclick = () => go(true); }
  $('#bLogout').onclick = () => this.logout();
 },
 pause(tab = 'map') {
  if (!['play', 'shoot', 'pause'].includes(Game.state)) return; if (Game.state !== 'pause') Game.prev = Game.state; Game.state = 'pause';
  const lvl = LV.map((l, i) => { const z = S.z[i]; const stars = z.st.map(s => '★'.repeat(s.stars) + '☆'.repeat(3 - s.stars)).join(' '); return `<div class="lvitem"><span class="n">${i + 1}</span><span class="nm">${esc(l.name)}<small>${esc(l.topic)}</small></span><span class="st">${DEMO && i > 0 ? 'Dikunci (demo)' : (z.cleared ? '✓ ' : '') + stars}</span></div>`; }).join('');
  const badges = BADGES.map(b => `<div class="badge ${S.badges[b[0]] ? 'on' : ''}"><span class="ic">${esc(b[3])}</span><b>${esc(b[1])}</b><span class="note">${esc(b[2])}</span></div>`).join('');
  const abil = ABIL.map(a => `<div class="lvitem"><span class="n">${S.abil[a[0]] ? '✦' : '·'}</span><span class="nm">${esc(a[1])}<small style="direction:ltr;font-family:var(--f-ui)">${esc(a[2])}</small></span><span class="st">${S.abil[a[0]] ? 'Aktif' : 'Selepas Level ' + a[3]}</span></div>`).join('');
  const body = { map: `<div class="lvlist">${lvl}<div class="lvitem"><span class="n">♛</span><span class="nm">The Three Kings<small>المُلُوكُ الثَّلَاثَةُ</small></span><span class="st">${S.bosses.filter(Boolean).length}/3</span></div></div>`, badges: `<div class="badges">${badges}</div>`, abil: `<div class="lvlist">${abil}</div>`,
   help: `<div class="keys"><kbd>A / D · ← →</kbd><span>Bergerak, tahan untuk berlari</span><kbd>Space</kbd><span>Lompat${S.abil.double ? ' (dua kali di udara)' : ''}</span><kbd>W / ↑</kbd><span>Panjat tangga</span><kbd>J</kbd><span>Arabic Sword — pijak slime juga menewaskannya</span><kbd>K</kbd><span>Knowledge Shield</span><kbd>L</kbd><span>Grammar Power</span><kbd>P / Esc</kbd><span>Menu</span></div><p class="note">Setiap level ada 3 altar (A Mudah, B Sederhana, C Tinggi) × 5 soalan. Lulus 3/5 untuk mengaktifkan altar. Selepas ketiga-tiga altar aktif, portal di puncak level terbuka. Altar juga ialah checkpoint. Laluan rahsia muncul apabila anda menghampirinya.</p>` }[tab];
  this.set(`<div class="card"><h2>Menu Pengembaraan</h2>
   <div class="grid2"><div class="kv"><span>Markah</span><b>${S.score}</b></div><div class="kv"><span>Ketepatan</span><b>${S.cor + S.wr ? Math.round(S.cor / (S.cor + S.wr) * 100) : 0}%</b></div><div class="kv"><span>Masa main</span><b>${fmtT(S.playT)}</b></div><div class="kv"><span>Musuh</span><b>${S.kills}</b></div></div>
   <div class="tabs">${[['map', 'Peta Level'], ['badges', 'Lencana'], ['abil', 'Kebolehan'], ['help', 'Kawalan']].map(([k, n]) => `<button data-t="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}</div>
   ${body}
   <div class="row"><button class="ghost" id="bSnd">Bunyi: ${AU.on ? 'Hidup' : 'Mati'}</button><button class="ghost" id="bCp">Kembali ke checkpoint</button><button class="ghost" id="bQuit">Simpan & ke skrin utama</button></div>
   <button class="cta" id="bRes">Sambung Permainan</button></div>`);
  scr.querySelectorAll('.tabs button').forEach(b => b.onclick = () => this.pause(b.dataset.t));
  if (Game.prev === 'shoot') $('#bCp').hidden = true;
  $('#bRes').onclick = () => this.close();
  $('#bSnd').onclick = () => { AU.init(); AU.setOn(!AU.on); try { localStorage.setItem('al_snd', AU.on ? '1' : '0'); } catch (e) { } $('#bSnd').textContent = `Bunyi: ${AU.on ? 'Hidup' : 'Mati'}`; };
  $('#bCp').onclick = () => { this.close(); P.x = S.cp.x; P.y = S.cp.y; P.vx = P.vy = 0; P.inv = 1.5; };
  $('#bQuit').onclick = () => { save(); scr.hidden = true; this.home(); };
 },
 zoneResult(z) {
  Game.state = 'result'; const d = S.z[z], tot = d.st.reduce((a, s) => a + s.best, 0), acc = d.cor + d.wr ? Math.round(d.cor / (d.cor + d.wr) * 100) : 0;
  const mast = Math.round(tot / 15 * 100), lbl = mast >= 85 ? 'Cemerlang' : mast >= 70 ? 'Kepujian' : mast >= 50 ? 'Memuaskan' : 'Perlu latihan lagi';
  AU.play('win'); const ab = ABIL.find(x => x[3] === z + 1);
  this.set(`<div class="card"><h3 style="text-align:center">Level ${z + 1} selesai</h3><h2>${esc(LV[z].name)}</h2><div class="ar" style="text-align:center;font-size:22px;color:var(--parch)">${esc(LV[z].ar)}</div>
   <div class="grid2 g3"><div class="kv"><span>Markah</span><b>${d.score}</b></div><div class="kv"><span>Betul</span><b style="color:var(--leaf)">${d.cor}</b></div><div class="kv"><span>Salah</span><b style="color:var(--ruby)">${d.wr}</b></div><div class="kv"><span>Masa</span><b>${fmtT(d.time)}</b></div><div class="kv"><span>EXP</span><b>+${d.exp}</b></div><div class="kv"><span>Coin</span><b>+${d.coins}</b></div></div>
   <div><h3>Penguasaan topik · ${esc(LV[z].topicMs)}</h3><div class="mastery"><div class="bar"><i style="width:${mast}%"></i></div><b>${mast}%</b></div><p class="note">${lbl} · skor terbaik ${tot}/15 (A ${d.st[0].best}/5 · B ${d.st[1].best}/5 · C ${d.st[2].best}/5) · ketepatan keseluruhan ${acc}%</p></div>
   ${ab ? `<div class="fb ok"><h4>Kebolehan dibuka: ${esc(ab[1])}</h4><p>${esc(ab[2])}</p></div>` : ''}
   <button class="cta" id="bGo">${DEMO ? 'Tamat Demo' : z < NZ - 1 ? 'Teruskan Pendakian ke Level ' + (z + 2) : 'Naik ke Istana Emas'}</button></div>`, true);
  $('#bGo').onclick = () => { if (DEMO) { this.demoEnd(); return; } scr.hidden = true; Game.state = 'play'; };
 },
 demoEnd() {
  Game.state = 'result'; const d = S.z[0], tot = d.st.reduce((a, s) => a + s.best, 0);
  const locked = LV.slice(1).map(l => `<div class="lvitem"><span class="n">${l.id}</span><span class="nm">${esc(l.name)}<small>${esc(l.topic)}</small></span><span class="st">Dikunci</span></div>`).join('');
  this.set(`<div class="card"><h3 style="text-align:center">Versi Demo</h3><h2>Tahniah, ${esc(S.name)}!</h2>
   <p style="text-align:center">Anda telah menamatkan Level 1 · The Valley of Synonyms dengan skor terbaik <b>${tot}/15</b> dan <b>${S.score}</b> markah.</p>
   <p style="text-align:center;color:var(--mist)">Versi penuh membuka 9 dunia lagi, 135 soalan tambahan dan pertarungan dengan Tiga Raja di Istana Emas.</p>
   <div class="lvlist">${locked}<div class="lvitem"><span class="n">♛</span><span class="nm">The Three Kings<small>الْمُلُوكُ الثَّلَاثَةُ</small></span><span class="st">Dikunci</span></div></div>
   <div class="row"><button class="ghost" id="bAgain">Ulang Level 1 dari Awal</button><button class="cta" id="bStay">Teruskan Meneroka Level 1</button></div></div>`);
  $('#bStay').onclick = () => { scr.hidden = true; Game.state = 'play'; };
  $('#bAgain').onclick = () => { const nm = S.name, gen = S.gender; wipeSave(); S = freshSave(nm); S.gender = gen; startGame(); };
 },
 bossResult(i) {
  Game.state = 'result'; const st = S.bossStats[i];
  this.set(`<div class="card"><h3 style="text-align:center">Bos ${i + 1} / 3 tumbang</h3><h2>${esc(BOSSES[i].name)}</h2><div class="ar" style="text-align:center;font-size:22px">${esc(BOSSES[i].ar)}</div>
   <div class="grid2"><div class="kv"><span>Betul</span><b style="color:var(--leaf)">${st.cor}</b></div><div class="kv"><span>Salah</span><b style="color:var(--ruby)">${st.wr}</b></div><div class="kv"><span>Masa</span><b>${fmtT(st.t)}</b></div><div class="kv"><span>Bonus</span><b>+${1500 + i * 500}</b></div></div>
   <p style="text-align:center">${i === 0 ? 'Bumi bergegar… The Sarf Dragon terbang dari awan api.' : 'Langit terbelah… The Arabic Emperor turun dari singgahsananya.'}</p>
   <button class="cta" id="bGo">Hadapi ${esc(BOSSES[i + 1].name)}</button></div>`, true);
  $('#bGo').onclick = () => { scr.hidden = true; Game.state = 'play'; setTimeout(() => { if (Game.state === 'play' && !Game.boss) Boss.start(); }, 300); };
 },
 bossFail(shoot) {
  this.set(`<div class="card"><h2>Wira tumbang!</h2><p style="text-align:center">${shoot ? 'Bos masih berdiri. Nyawa dipulihkan — elak serangannya dan tembak semula!' : 'Bos terlalu kuat kali ini. Nyawa dipulihkan — baca semula penerangan dan cuba lagi dari fasa 1.'}</p><button class="cta" id="bGo">${shoot ? 'Bertempur Semula' : 'Cabar Semula'}</button></div>`);
  $('#bGo').onclick = () => { scr.hidden = true; if (shoot && Game.boss) { Boss.shootStart(); return; } Game.state = 'play'; P.x = W * .3; P.y = ARENA_Y; setTimeout(() => Boss.start(), 300); };
 },
 gameOver() {
  Game.state = 'over'; const pen = Math.floor(S.coins * .2);
  this.set(`<div class="card"><h2>Kalah!</h2><p style="text-align:center">Semua nyawa telah habis. Bangkit semula di checkpoint terakhir dengan 3 nyawa (penalti ${pen} coin).</p><button class="cta" id="bGo">Bangkit Semula</button></div>`);
  $('#bGo').onclick = () => { S.coins -= pen; S.lives = 3; scr.hidden = true; Game.state = 'play'; respawn(); save(); };
 },
 legend() {
  const acc = S.cor + S.wr ? S.cor / (S.cor + S.wr) * 100 : 0, gr = spmGrade(acc);
  this.set(`<div class="card" style="gap:12px"><div class="legend-title">ARABIC LEGEND MASTER!</div><div class="ar" style="text-align:center;font-size:24px">أَنْتَ أُسْطُورَةُ اللُّغَةِ الْعَرَبِيَّةِ</div>
   <p style="text-align:center">${esc(S.name)} telah menakluk 10 dunia dan menumbangkan Tiga Raja.</p>
   <div class="grade">${gr}</div><p class="note" style="text-align:center">Gred pencapaian berdasarkan skala gred SPM · ketepatan ${acc.toFixed(1)}%</p>
   <div class="grid2 g3"><div class="kv"><span>Markah keseluruhan</span><b>${S.score}</b></div><div class="kv"><span>Betul / Salah</span><b>${S.cor} / ${S.wr}</b></div><div class="kv"><span>Tahap wira</span><b>Lv ${S.plv}</b></div><div class="kv"><span>Masa</span><b>${fmtT(S.playT)}</b></div><div class="kv"><span>Coin · Permata</span><b>${S.coins} · ${S.gems}</b></div><div class="kv"><span>Lencana</span><b>${Object.keys(S.badges).length}/${BADGES.length}</b></div></div>
   <div class="row"><button class="cta" id="bCert">Lihat Sijil Digital</button><button class="ghost" id="bFree">Teroka Dunia</button><button class="ghost" id="bNew2">Main Semula</button></div>
   <div id="certBox"></div></div>`);
  $('#bCert').onclick = () => { const url = makeCert(gr, acc); $('#certBox').innerHTML = `<img class="cert" src="${url}" alt="Sijil digital ${esc(S.name)}"><p class="note">Tekan lama (telefon) atau klik kanan (komputer) pada sijil untuk menyimpannya, atau ambil tangkapan skrin.</p>`; };
  $('#bFree').onclick = () => { scr.hidden = true; Game.state = 'play'; P.win = 0; P.x = W / 2; P.y = ARENA_Y; setHUD(true); };
  $('#bNew2').onclick = () => { scr.hidden = true; this.home(); };
 }
};
function lvlName(l) { return l >= 11 ? 'Istana Emas / Tamat' : `Level ${l}`; }
function ago(ts) { const s = Math.max(0, (Date.now() - ts) / 1000); return s < 10 ? 'baru sahaja' : s < 60 ? `${Math.floor(s)} saat lalu` : s < 3600 ? `${Math.floor(s / 60)} min lalu` : s < 86400 ? `${Math.floor(s / 3600)} jam lalu` : new Date(ts).toLocaleDateString('ms-MY'); }
function fmtT(s) { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60; return h ? `${h}j ${m}m` : `${m}:${String(ss).padStart(2, '0')}`; }
function spmGrade(p) { return p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'A-' : p >= 65 ? 'B+' : p >= 60 ? 'B' : p >= 55 ? 'C+' : p >= 50 ? 'C' : p >= 45 ? 'D' : p >= 40 ? 'E' : 'G'; }
function makeCert(gr, acc) {
 const c = document.createElement('canvas'); c.width = 1600; c.height = 1130; const g = c.getContext('2d');
 const bg = g.createLinearGradient(0, 0, 0, 1130); bg.addColorStop(0, '#fbf3df'); bg.addColorStop(1, '#efe0bc'); g.fillStyle = bg; g.fillRect(0, 0, 1600, 1130);
 g.strokeStyle = '#a8741c'; g.lineWidth = 14; g.strokeRect(40, 40, 1520, 1050); g.lineWidth = 3; g.strokeRect(70, 70, 1460, 990);
 // geometric 8-point stars in corners
 const star = (x, y, r) => { g.save(); g.translate(x, y); g.fillStyle = '#c99a3c'; for (let k = 0; k < 2; k++) { g.rotate(Math.PI / 4); g.fillRect(-r, -r, r * 2, r * 2); } g.fillStyle = '#fbf3df'; g.beginPath(); g.arc(0, 0, r * .55, 0, TAU); g.fill(); g.restore(); };
 [[110, 110], [1490, 110], [110, 1020], [1490, 1020]].forEach(([x, y]) => star(x, y, 30)); for (let x = 200; x < 1420; x += 60) { star(x, 70, 8); star(x, 1060, 8); }
 g.textAlign = 'center'; g.fillStyle = '#7a5214'; g.font = '700 40px "Reem Kufi",sans-serif'; g.fillText('SIJIL PENCAPAIAN', 800, 200);
 g.font = '700 54px "Noto Naskh Arabic",serif'; g.fillStyle = '#5a3a0a'; g.fillText('شَهَادَةُ التَّفَوُّقِ', 800, 280);
 g.font = '500 26px Rubik,sans-serif'; g.fillStyle = '#6b5a3a'; g.fillText('Dengan ini disahkan bahawa', 800, 360);
 g.font = '700 80px "Reem Kufi",sans-serif'; g.fillStyle = '#2a1a02'; g.fillText(S.name, 800, 460);
 g.fillStyle = '#c99a3c'; g.fillRect(450, 485, 700, 3);
 g.font = '500 28px Rubik,sans-serif'; g.fillStyle = '#4a3a20'; g.fillText('telah menamatkan pengembaraan', 800, 545);
 g.font = '700 58px "Reem Kufi",sans-serif'; g.fillStyle = '#a8741c'; g.fillText('ARABIC LEGEND MASTER', 800, 625);
 g.font = '500 26px Rubik,sans-serif'; g.fillStyle = '#4a3a20'; g.fillText('Arabic Legends: Rise of the Master · Bahasa Arab Tingkatan 5 · Persediaan SPM', 800, 680);
 const box = (x, l, v) => { g.fillStyle = 'rgba(168,116,28,.12)'; g.fillRect(x - 150, 730, 300, 140); g.fillStyle = '#6b5a3a'; g.font = '600 22px Rubik,sans-serif'; g.fillText(l, x, 772); g.fillStyle = '#2a1a02'; g.font = '800 52px Rubik,sans-serif'; g.fillText(v, x, 840); };
 box(420, 'GRED', gr); box(800, 'MARKAH', String(S.score)); box(1180, 'KETEPATAN', acc.toFixed(1) + '%');
 g.font = '500 22px Rubik,sans-serif'; g.fillStyle = '#6b5a3a'; g.fillText(`10 level · 30 peringkat · 3 bos ditewaskan · Tarikh: ${new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}`, 800, 940);
 g.font = '700 30px "Noto Naskh Arabic",serif'; g.fillStyle = '#7a5214'; g.fillText('مَنْ جَدَّ وَجَدَ', 800, 1000);
 return c.toDataURL('image/png');
}

/* ====================== START ====================== */
function cpValid(x, y) {
 const z = zoneAt(y), zs = [ZONES[z]]; if (z > 0) zs.push(ZONES[z - 1]);
 for (const Z of zs) {
  for (const q of Z.plats) if (!q.mv && Math.abs(q.y0 - y) < 3 && x >= q.x0 - 4 && x <= q.x0 + q.w + 4) return true;
  for (const q of Z.sol) if (!q.off && q.kind !== 'seal' && Math.abs(q.y - y) < 3 && x >= q.x && x <= q.x + q.w) return true;
 }
 return false;
}
function fixCheckpoint() {
 if (cpValid(S.cp.x, S.cp.y)) return false;
 let hz = S.z.findIndex(z => !z.cleared); if (hz < 0) hz = NZ;
 const z = Math.min(zoneAt(S.cp.y), hz);
 if (z === 0) S.cp = { x: W / 2, y: WH - 30 };
 else { const g = GATES[z - 1]; S.cp = { x: g.x < W / 2 ? g.x + 110 : g.x - 110, y: z === NZ ? SUMMIT : floorY(z) }; }
 return true;
}
function startGame() {
 scr.hidden = true; genWorld(); applyTaken(); const moved = fixCheckpoint();
 S.hp = Math.min(S.hp > 0 ? S.hp : S.maxHp, S.maxHp); if (S.lives <= 0) S.lives = 3;
 P.x = S.cp.x; P.y = S.cp.y; P.vx = P.vy = 0; P.dead = 0; P.win = 0; P.inv = 1.5; P.climb = false; P.auto = null;
 cam.y = P.y - viewH * .6; Game.lastZone = zoneAt(P.y); Game.boss = null; Boss.mode = 'quiz'; Boss.shards = null; $('#sbar').hidden = true; document.body.classList.remove('shooting'); FX = []; PROJ = []; TXT = [];
 Game.state = 'play'; setHUD(true); save();
 const z = zoneAt(P.y); if (z < NZ) banner(`LEVEL ${z + 1}`, LV[z].ar, LV[z].name); else banner('PUNCAK TERAKHIR', 'الْمُلُوكُ الثَّلَاثَةُ', 'The Three Kings');
 if (S.finished) toast('♛', 'Anda sudah menjadi Arabic Legend! Teroka dunia sesuka hati.');
 if (moved) setTimeout(() => toast('✓', 'Kemajuan dipulihkan: wira diletakkan di permulaan level semasa.'), 600);
 if (DEMO && S.z[0].cleared) setTimeout(() => Screens.demoEnd(), 400);
}
$('#btnPause').addEventListener('click', () => Screens.pause());
addEventListener('pagehide', () => { if (S && Game.state !== 'title') cloudPush(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && (Game.state === 'play' || Game.state === 'shoot')) Screens.pause(); if (document.hidden) save(); });
try { AU.on = localStorage.getItem('al_snd') !== '0'; } catch (e) { }
resize(); setupTouch();
genWorld(); S = freshSave('Wira'); applyTaken(); cam.y = WH - viewH;
Screens.home();
(document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => { bdCache.clear(); sprCache.clear(); });
requestAnimationFrame(loop);
window.__AL = { Game, P, get S() { return S; }, Quiz, Boss, get ZONES() { return ZONES; }, get GATES() { return GATES; }, get ALT() { return ALT; }, startStage, Screens, zoneAt, WH, ZH, SUMMIT, ARENA_Y, setPos(x, y) { P.x = x; P.y = y; P.vx = P.vy = 0; } };
})();
