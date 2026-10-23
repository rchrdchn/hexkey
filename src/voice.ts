// Narration: pre-generated clips (Kokoro af_heart) with speechSynthesis fallback.
// One shared <audio> element: iOS only lets us play audio after a tap, and a reused element stays "unlocked".
type Manifest = Record<string, { file: string; text: string }>;
const base = import.meta.env.BASE_URL;
const manifests = new Map<string, Promise<Manifest>>();
function manifest(slug: string) {
  if (!manifests.has(slug)) manifests.set(slug, fetch(`${base}audio/${slug}/index.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return manifests.get(slug)!;
}

type Listener = (speaking: boolean) => void;
class Voice {
  el: HTMLAudioElement | null = null;
  muted = localStorage.getItem('hk-muted') === '1';
  speaking = false;
  private subs = new Set<Listener>();
  private seq = 0;
  private get audio() {
    if (!this.el) {
      this.el = new Audio();
      this.el.preload = 'auto';
      this.el.setAttribute('playsinline', '');
      this.el.onended = () => this.set(false);
      this.el.onpause = () => this.set(false);
    }
    return this.el;
  }
  on(fn: Listener) { this.subs.add(fn); return () => { this.subs.delete(fn); }; }
  private set(v: boolean) { this.speaking = v; this.subs.forEach((f) => f(v)); }
  prefetch(slug: string) { manifest(slug); }
  setMuted(m: boolean) { this.muted = m; localStorage.setItem('hk-muted', m ? '1' : '0'); if (m) this.stop(); }
  stop() {
    this.seq++;
    if (this.el) this.el.pause();
    try { speechSynthesis.cancel(); } catch { /* */ }
    this.set(false);
  }
  /** Must be called inside a user gesture the first time (iOS). */
  unlock() {
    const a = this.audio;
    if (a.src) return;
    // a 0.1s silent wav keeps the element unlocked for later, non-gesture plays (voice commands, headphone buttons)
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    a.play().catch(() => {});
  }
  async say(slug: string, key: string, text: string) {
    this.stop();
    if (this.muted) return;
    const my = ++this.seq;
    const m = await manifest(slug);
    if (my !== this.seq) return;
    const hit = m[key];
    if (hit && hit.text === text) {
      const a = this.audio;
      a.src = `${base}audio/${slug}/${hit.file}`;
      this.set(true);
      try { await a.play(); return; } catch { /* fall through to TTS */ }
    }
    if (my !== this.seq) return;
    this.tts(text);
  }
  tts(text: string) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 1.02;
    const v = speechSynthesis.getVoices().find((x) => /en-US/.test(x.lang) && /Samantha|Natural|Google US/.test(x.name));
    if (v) u.voice = v;
    u.onend = () => this.set(false);
    u.onerror = () => this.set(false);
    this.set(true);
    speechSynthesis.speak(u);
  }
}
export const voice = new Voice();

// ---------- voice commands (Web Speech API) ----------
export type Command = 'next' | 'back' | 'repeat' | 'count' | 'stop';
const RULES: [RegExp, Command][] = [
  [/\bhow many\b|\bwhat do i need\b/, 'count'],
  [/\b(next|continue|done|got it|ready)\b/, 'next'],
  [/\b(back|previous|go back|undo)\b/, 'back'],
  [/\b(repeat|again|say that again|pardon|what)\b/, 'repeat'],
  [/\b(stop|quiet|shh+|pause|hush)\b/, 'stop'],
];
export const canListen = () => typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export class Ears {
  private rec: any = null;
  private on = false;
  private lastFire = 0;
  private handled = new Set<string>();
  constructor(private cb: (c: Command, heard: string) => void, private state: (s: 'off' | 'listening' | 'error', msg?: string) => void) {}
  start() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { this.state('error', 'Voice commands need Chrome or Safari'); return; }
    this.on = true;
    const r = new SR();
    r.lang = 'en-US'; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onresult = (e: any) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const said = String(e.results[i][0].transcript).toLowerCase();
        const id = `${i}:${said.split(' ').length}`;
        for (const [re, c] of RULES) {
          if (!re.test(said)) continue;
          // ignore our own narration bleeding into the mic, except "stop"
          if (voice.speaking && c !== 'stop') break;
          const now = Date.now();
          const tag = `${i}:${c}`;
          if (this.handled.has(tag) || now - this.lastFire < 900) break;
          this.handled.add(tag); this.lastFire = now;
          this.cb(c, said);
          break;
        }
        void id;
      }
    };
    r.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { this.on = false; this.state('error', 'Microphone blocked'); }
    };
    r.onend = () => { this.handled.clear(); if (this.on) setTimeout(() => { try { r.start(); } catch { /* */ } }, 250); else this.state('off'); };
    try { r.start(); this.rec = r; this.state('listening'); } catch { this.state('error', 'Could not start the mic'); }
  }
  stop() { this.on = false; try { this.rec?.stop(); } catch { /* */ } this.rec = null; this.state('off'); }
}

// ---------- headphone / lock-screen buttons ----------
export function mediaSession(title: string, artist: string, h: { next: () => void; back: () => void; repeat: () => void; stop: () => void }) {
  const ms = (navigator as any).mediaSession;
  if (!ms) return () => {};
  try {
    ms.metadata = new (window as any).MediaMetadata({ title, artist, album: 'Hexkey', artwork: [{ src: `${base}icon-512.png`, sizes: '512x512', type: 'image/png' }] });
    ms.setActionHandler('nexttrack', h.next);
    ms.setActionHandler('previoustrack', h.back);
    ms.setActionHandler('play', h.repeat);
    ms.setActionHandler('pause', h.stop);
    ms.setActionHandler('seekforward', h.next);
    ms.setActionHandler('seekbackward', h.back);
  } catch { /* some actions unsupported */ }
  return () => { ['nexttrack', 'previoustrack', 'play', 'pause', 'seekforward', 'seekbackward'].forEach((a) => { try { ms.setActionHandler(a, null); } catch { /* */ } }); };
}

// ---------- keep the screen on while building ----------
export function keepAwake() {
  let lock: any = null, dead = false;
  const get = async () => { try { if (!dead && document.visibilityState === 'visible') lock = await (navigator as any).wakeLock?.request('screen'); } catch { /* not allowed */ } };
  const vis = () => { if (document.visibilityState === 'visible') get(); };
  get();
  document.addEventListener('visibilitychange', vis);
  return () => { dead = true; document.removeEventListener('visibilitychange', vis); lock?.release?.().catch(() => {}); };
}
