// Tiny synthesized sound effects (no audio files). Respect the global mute.
let ctx: AudioContext | null = null;
let muted = false;
export const sfx = {
  unlock() {
    try {
      ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch { /* no audio */ }
  },
  setMuted(m: boolean) { muted = m; },
  tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.12, slide = 0) {
    if (muted || !ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
  },
  thunk() { sfx.tone(140, 0.16, 'triangle', 0.18, 0.6); },
  click() { sfx.tone(1800, 0.04, 'square', 0.05); setTimeout(() => sfx.tone(1200, 0.05, 'square', 0.05), 60); },
  tick() { sfx.tone(880, 0.07, 'sine', 0.08, 1.5); },
  ding() { [660, 880, 1320].forEach((f, i) => setTimeout(() => sfx.tone(f, 0.5, 'sine', 0.1), i * 110)); },
};
