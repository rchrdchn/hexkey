import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import confetti from 'canvas-confetti';
import type { Piece, CatalogEntry } from './types';
import { loadCatalog, isSlug, loadPiece, stepHardware, stepParts, howManyText, plural } from './data';
import { Scene, type Mode } from './scene/Scene';
import { voice, Ears, canListen, mediaSession, keepAwake, type Command } from './voice';
import { sfx } from './sfx';
import { partColor } from './palette';
import { IsoPart, HwIcon, Logo, I } from './ui/icons';
import { makeCard, shareCard, fmtTime } from './share';
import { ContributeModal, RequestModal } from './ui/Community';
import { Catalog } from './ui/Catalog';

type Route = { mode: Mode; slug: string; step: number; open?: boolean };
const PICKER = 'pieces'; // #pieces opens the full picker on phones (deep-linkable, closes on browser back)
function parse(): Route {
  const [slug, sub] = location.hash.replace(/^#\/?/, '').split('/');
  if (!slug || slug === PICKER || !isSlug(slug)) return { mode: 'pick', slug: localStorage.getItem('hk-last') || 'lack', step: 0, open: slug === PICKER };
  if (!sub) return { mode: 'parts', slug, step: 0 };
  if (sub === 'done') return { mode: 'done', slug, step: 0 };
  return { mode: 'build', slug, step: Math.max(0, (parseInt(sub, 10) || 1) - 1) };
}
const go = (h: string) => { if (location.hash !== h) location.hash = h; };
const COMMON = {
  parts: "First, let's check the box. Tap each part as you find it.",
  allset: "Everything's here. Let's build.",
};
const gesture = () => { voice.unlock(); sfx.unlock(); };
const PHONE_MQ = '(max-width: 899px)'; // same breakpoint as the desktop layout in CSS
const isPhone = () => typeof matchMedia !== 'undefined' && matchMedia(PHONE_MQ).matches;
let pushedPicker = false; // true when we opened #pieces ourselves, so Close can just go back
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function App() {
  const [route, setRoute] = useState<Route>(parse);
  const [pieces, setPieces] = useState<Record<string, Piece>>({});
  const [err, setErr] = useState('');
  useEffect(() => {
    const on = () => { const r = parse(); if (!r.open) pushedPicker = false; setRoute(r); };
    addEventListener('hashchange', on);
    loadCatalog().then(setEntries).catch((e) => setErr(String(e)));
    return () => removeEventListener('hashchange', on);
  }, []);
  const [entries, setEntries] = useState<CatalogEntry[]>([]);
  const [phone, setPhone] = useState(isPhone);
  useEffect(() => {
    const mq = matchMedia(PHONE_MQ);
    const on = () => setPhone(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  // phones land on the hero + one button; the full picker opens as a sheet
  const showPicker = !phone || !!route.open;
  const openPicker = () => { gesture(); sfx.tick(); pushedPicker = true; location.hash = PICKER; };
  const closePicker = () => {
    gesture();
    if (pushedPicker) { pushedPicker = false; history.back(); }
    else { history.replaceState(null, '', location.pathname + location.search); setRoute(parse()); }
  };
  const [pick, setPick] = useState(route.slug);
  useEffect(() => { if (route.mode !== 'pick') setPick(route.slug); }, [route]);
  const slug = route.mode === 'pick' ? pick : route.slug;
  const piece = pieces[slug];
  // load one piece at a time, only when it's picked or opened
  useEffect(() => {
    if (pieces[slug]) return;
    let live = true;
    loadPiece(slug).then((p) => live && setPieces((m) => ({ ...m, [p.slug]: p }))).catch(() => {
      if (!live) return;
      if (route.mode === 'pick') { if (slug !== 'lack') setPick('lack'); else setErr('piece data unavailable'); } else go('#/');
    });
    return () => { live = false; };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = piece ? Math.min(route.step, piece.steps.length - 1) : 0;

  // ---- voice state ----
  const [muted, setMuted] = useState(voice.muted);
  const [speaking, setSpeaking] = useState(false);
  const [ears, setEars] = useState<'off' | 'listening' | 'error'>('off');
  const [heard, setHeard] = useState<{ word: string; n: number } | null>(null);
  useEffect(() => voice.on(setSpeaking), []);
  useEffect(() => sfx.setMuted(muted), [muted]);

  // ---- parts check-off ----
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [hl, setHl] = useState<string | null>(null);
  useEffect(() => { setChecked(new Set(JSON.parse(localStorage.getItem(`hk-check-${slug}`) || '[]'))); setHl(null); }, [slug]);
  const toggle = (id: string, isPart: boolean) => {
    gesture();
    const n = new Set(checked);
    if (n.has(id)) n.delete(id); else { n.add(id); sfx.tick(); navigator.vibrate?.(8); }
    setChecked(n);
    localStorage.setItem(`hk-check-${slug}`, JSON.stringify([...n]));
    setHl(isPart && !checked.has(id) ? id : null);
    const total = piece ? piece.parts.length + piece.hardware.length : 0;
    if (n.size === total && checked.size !== total) { voice.say('common', 'allset', COMMON.allset); burst(0.5); }
  };

  // ---- navigation ----
  const say = useCallback((p: Piece, i: number) => voice.say(p.slug, `step-${i + 1}`, p.steps[i].say), []);
  const toStep = (i: number) => { if (!piece) return; go(`#/${piece.slug}/${i + 1}`); };
  const next = useCallback(() => {
    if (!piece) return;
    gesture();
    if (route.mode === 'parts') { localStorage.setItem(`hk-start-${piece.slug}`, String(Date.now())); return go(`#/${piece.slug}/1`); }
    if (route.mode !== 'build') return;
    if (step < piece.steps.length - 1) toStep(step + 1);
    else { localStorage.setItem(`hk-end-${piece.slug}`, String(Date.now())); go(`#/${piece.slug}/done`); }
  }, [piece, route.mode, step]); // eslint-disable-line react-hooks/exhaustive-deps
  const back = useCallback(() => {
    if (!piece) return;
    gesture();
    if (route.mode === 'build') { if (step > 0) toStep(step - 1); else go(`#/${piece.slug}`); }
    else if (route.mode === 'done') toStep(piece.steps.length - 1);
    else if (route.mode === 'parts') go('#/');
  }, [piece, route.mode, step]); // eslint-disable-line react-hooks/exhaustive-deps
  const repeat = useCallback(() => { gesture(); if (piece && route.mode === 'build') say(piece, step); }, [piece, route.mode, step, say]);
  const count = useCallback(() => { gesture(); if (piece && route.mode === 'build') voice.say(piece.slug, `count-${step + 1}`, howManyText(piece, step)); }, [piece, route.mode, step]);

  // narrate each step as it appears
  useEffect(() => {
    if (!piece) return;
    if (route.mode === 'build') { const t = setTimeout(() => say(piece, step), 250); return () => clearTimeout(t); }
    if (route.mode === 'done') { burst(1); sfx.ding(); voice.say(piece.slug, 'done', piece.done); }
    if (route.mode === 'parts') voice.say('common', 'parts', COMMON.parts);
    if (route.mode === 'pick') voice.stop();
  }, [piece, route.mode, step, say]);

  // community modals
  const [comm, setComm] = useState<null | 'contrib' | { req: { url: string; name: string } | undefined }>(null);

  // keyboard
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && route.mode === 'pick' && phone && route.open && !comm) { closePicker(); return; }
      if (comm || /^(INPUT|SELECT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight' || (e.key === ' ' && route.mode === 'build') || (e.key === 'Enter' && route.mode !== 'pick')) { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') back();
      else if (e.key.toLowerCase() === 'r') repeat();
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [next, back, repeat, route.mode, route.open, phone, comm]); // eslint-disable-line react-hooks/exhaustive-deps

  // voice commands
  const handlers = useRef({ next, back, repeat, count });
  handlers.current = { next, back, repeat, count };
  const earsRef = useRef<Ears | null>(null);
  const onCommand = (c: Command, said: string) => {
    setHeard({ word: said.trim().split(' ').slice(-3).join(' '), n: Date.now() });
    if (c === 'stop') voice.stop();
    else handlers.current[c]();
  };
  const toggleEars = () => {
    gesture();
    if (ears === 'listening') { earsRef.current?.stop(); earsRef.current = null; return; }
    earsRef.current = new Ears(onCommand, (s) => setEars(s));
    earsRef.current.start();
  };
  useEffect(() => { if (heard) { const t = setTimeout(() => setHeard(null), 1600); return () => clearTimeout(t); } }, [heard]);
  useEffect(() => () => earsRef.current?.stop(), []);

  // headphone buttons + screen awake while building
  useEffect(() => {
    if (!piece || route.mode !== 'build') return;
    return mediaSession(`Step ${step + 1} of ${piece.steps.length}: ${piece.steps[step].caption}`, `${piece.name} ${piece.title}`, {
      next: () => handlers.current.next(), back: () => handlers.current.back(), repeat: () => handlers.current.repeat(), stop: () => voice.stop(),
    });
  }, [piece, route.mode, step]);
  useEffect(() => { if (route.mode === 'build') return keepAwake(); }, [route.mode]);

  // swipe on the sheet
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swipe = {
    onTouchStart: (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; },
    onTouchEnd: (e: React.TouchEvent) => {
      const s = touch.current; touch.current = null;
      if (!s) return;
      const dx = e.changedTouches[0].clientX - s.x, dy = e.changedTouches[0].clientY - s.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : back)();
    },
  };

  // how much of the screen the UI covers, so the 3D frames into the free area
  const [inset, setInset] = useState({ top: 70, bottom: 300, left: 0 });
  useEffect(() => {
    const measure = () => {
      const sh = document.querySelector('.sheet') as HTMLElement | null;
      const hero = document.querySelector('.hero') as HTMLElement | null;
      const top = hero ? hero.getBoundingClientRect().bottom + 8 : 64;
      const desk = innerWidth >= 900;
      const r = sh?.getBoundingClientRect();
      const next = desk ? { top: hero ? 40 : 64, bottom: 0, left: r ? r.right + 10 : 0 } : { top, bottom: r ? innerHeight - r.top + 6 : 0, left: 0 };
      if (desk && hero) next.left = Math.max(next.left, hero.getBoundingClientRect().right * 0.6);
      setInset((o) => (Math.abs(o.top - next.top) + Math.abs(o.bottom - next.bottom) + Math.abs(o.left - next.left) > 12 ? next : o));
    };
    measure();
    const ro = new ResizeObserver(measure);
    const t = setInterval(measure, 500);
    document.querySelectorAll('.sheet, .hero').forEach((el) => ro.observe(el));
    addEventListener('resize', measure);
    return () => { ro.disconnect(); clearInterval(t); removeEventListener('resize', measure); };
  }, [route.mode, slug, showPicker]);

  // share
  const snap = useRef<() => string>(() => '');
  const [card, setCard] = useState<{ url: string; blob: Blob } | null>(null);
  const elapsed = piece ? (() => { const a = +(localStorage.getItem(`hk-start-${piece.slug}`) || 0), b = +(localStorage.getItem(`hk-end-${piece.slug}`) || 0); return a && b > a ? b - a : null; })() : null;
  const openCard = async () => {
    if (!piece) return;
    const blob = await makeCard(snap.current(), piece, elapsed);
    setCard({ url: URL.createObjectURL(blob), blob });
  };

  if (err) return <div className="fatal">Couldn't load the furniture data. {err}</div>;
  const mode = route.mode;
  const s = piece?.steps[step];
  const total = piece ? piece.parts.length + piece.hardware.length : 0;

  return (
    <div className={`app m-${mode}`}>
      <div className="stage">
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: 38, position: [2, 1.4, 2.4], near: 0.02, far: 60 }}
          flat
          gl={{ preserveDrawingBuffer: true, antialias: true }}
        >
          <Suspense fallback={null}>
            {piece && <Scene piece={piece} mode={mode} step={step} highlight={hl} reduced={reduced} inset={inset} onSnap={(f) => (snap.current = f)} />}
          </Suspense>
        </Canvas>
      </div>

      {/* ---------- top bar ---------- */}
      <header className="top">
        {mode === 'pick' ? (
          <div className="brand"><Logo px={34} /><span>hexkey</span></div>
        ) : (
          <button className="icon ghost" aria-label="Close" onClick={() => { gesture(); go('#/'); }}>{I.close}</button>
        )}
        {mode === 'build' && piece && (
          <div className="progress" aria-label={`Step ${step + 1} of ${piece.steps.length}`}>
            {piece.steps.map((_, i) => <button key={i} className={i < step ? 'd' : i === step ? 'c' : ''} onClick={() => { gesture(); toStep(i); }} aria-label={`Step ${i + 1}`} />)}
          </div>
        )}
        {mode !== 'build' && mode !== 'pick' && piece && <div className="ttl">{piece.name}</div>}
        <div className="spacer" />
        {(mode === 'pick' || mode === 'done') && (
          <nav className="community" aria-label="Community">
            <button className="pill" onClick={() => { gesture(); sfx.tick(); setComm('contrib'); }} aria-haspopup="dialog">{I.wrench}<span>Contribute</span></button>
            <button className="pill alt" onClick={() => { gesture(); sfx.tick(); setComm({ req: undefined }); }} aria-haspopup="dialog" aria-label="Request furniture">{I.bulb}<span className="lg">Request furniture</span><span className="sm">Request</span></button>
          </nav>
        )}
        {mode === 'build' && canListen() && (
          <button className={`icon ${ears === 'listening' ? 'live' : ''}`} aria-label="Hands-free voice commands" aria-pressed={ears === 'listening'} onClick={toggleEars}>{I.mic}</button>
        )}
        <button className={`icon ${speaking && !muted ? 'talk' : ''}`} aria-label={muted ? 'Unmute voice' : 'Mute voice'} onClick={() => { gesture(); const m = !muted; setMuted(m); voice.setMuted(m); if (!m && mode === 'build' && piece) say(piece, step); }}>{muted ? I.mute : I.sound}</button>
      </header>
      {heard && <div className="heard" key={heard.n}>“{heard.word}”</div>}
      {ears === 'listening' && mode === 'build' && <div className="hint">Say “next”, “back”, “repeat” or “how many”</div>}

      {/* ---------- pick ---------- */}
      {mode === 'pick' && (
        <>
          <div className="hero">
            <h1>Flat-pack,<br /><em>talked through.</em></h1>
            <p>Pick it. Check the box. Build it with a voice in your ear.</p>
          </div>
          {showPicker ? (
            <>
              {phone && <div className="scrim" onClick={closePicker} aria-hidden />}
              <div className={`sheet pick ${phone ? 'open' : ''}`} key="picker" role={phone ? 'dialog' : undefined} aria-modal={phone || undefined} aria-label={phone ? 'Pick your furniture' : undefined}>
                {phone && (
                  <div className="row pick-head">
                    <h2>Pick your furniture</h2>
                    <button className="icon close" aria-label="Close" onClick={closePicker}>{I.close}</button>
                  </div>
                )}
                <Catalog entries={entries} pick={pick} onRequest={(name) => setComm({ req: { url: '', name } })}
                  onPick={(sl) => { gesture(); setPick(sl); localStorage.setItem('hk-last', sl); voice.prefetch(sl); sfx.tick(); }} />
                {piece && piece.slug === pick
                  ? <button className="cta" onClick={() => { gesture(); localStorage.setItem('hk-last', pick); go(`#/${pick}`); }}>Build {piece.name} {I.next}</button>
                  : <button className="cta" disabled aria-busy>Loading…</button>}
                {piece && <Legal p={piece} />}
              </div>
            </>
          ) : (
            <div className="sheet pick start" key="start">
              <button className="cta start-cta" onClick={openPicker} aria-haspopup="dialog">
                <span className="ico">{I.hammer}</span>
                <span className="lbl"><b>Pick your furniture</b><small>{entries.length ? `See all ${entries.length} pieces` : 'See all pieces'}</small></span>
                {I.next}
              </button>
              <p className="legal">
                Works with furniture from IKEA® and other brands. Not affiliated with or endorsed by any of them. Demo steps: always follow the official instructions in your box.
              </p>
            </div>
          )}
        </>
      )}

      {/* ---------- parts ---------- */}
      {mode === 'parts' && piece && (
        <div className="sheet parts" onDragStart={(e) => e.preventDefault()}>
          <div className="row">
            <h2>What's in the box</h2>
            <Ring n={checked.size} of={total} />
          </div>
          <div className="grid">
            {piece.parts.map((pt, i) => (
              <button key={pt.id} draggable={false} className={`tile ${checked.has(pt.id) ? 'ok' : ''} ${hl === pt.id ? 'hl' : ''}`} onClick={() => toggle(pt.id, true)}>
                <IsoPart size={piece.objects.find((o) => o.part === pt.id)!.size} color={partColor(i, piece.color)} px={54} />
                <span className="x">×{piece.partCount[pt.id]}</span>
                <small>{piece.partCount[pt.id] > 1 ? plural(pt) : pt.label}</small>
                <span className="tick">{I.check}</span>
              </button>
            ))}
            {piece.hardware.map((h) => (
              <button key={h.id} draggable={false} className={`tile hw ${checked.has(h.id) ? 'ok' : ''}`} onClick={() => toggle(h.id, false)}>
                <HwIcon kind={h.kind} px={46} />
                <span className="x">×{piece.hwCount[h.id]}</span>
                <small>{piece.hwCount[h.id] > 1 ? plural(h) : h.label}</small>
                <span className="tick">{I.check}</span>
              </button>
            ))}
          </div>
          <p className="disclaim">Part counts are our best estimate and may differ from your box. Always check the official instructions.</p>
          <button className={`cta ${checked.size === total ? 'pop' : ''}`} onClick={next}>
            {checked.size === total ? 'All here. Build!' : 'Start building'} {I.next}
          </button>
          <Legal p={piece} />
        </div>
      )}

      {/* ---------- build ---------- */}
      {mode === 'build' && piece && s && (
        <div className="sheet build" {...swipe}>
          <div className="row meta">
            <span className="num">{step + 1}<i>/{piece.steps.length}</i></span>
            {s.safety && <span className="safety">{I.warn}{s.safety}</span>}
          </div>
          <h2 key={step} className="cap">{s.caption}</h2>
          <div className="tray" key={`t${step}`}>
            {stepParts(piece, step).map((x) => (
              <button key={x.id} className="chip" onClick={count} aria-label={`${x.n} ${x.def.label}`}>
                <IsoPart size={x.size} color={partColor(piece.parts.findIndex((q) => q.id === x.id), piece.color)} px={34} />
                {x.n > 1 && <b>×{x.n}</b>}
              </button>
            ))}
            {stepHardware(piece, step).map((x) => (
              <button key={x.id} className="chip hw" onClick={count} aria-label={`${x.n} ${x.def.label}`}>
                <HwIcon kind={x.def.kind} px={30} /><b>×{x.n}</b>
              </button>
            ))}
          </div>
          <div className="ctrl">
            <button className="icon big" aria-label="Back" onClick={back}>{I.back}</button>
            <button className="icon big" aria-label="Repeat" onClick={repeat}>{I.repeat}</button>
            <button className="next" aria-label="Next step" onClick={next}>{step === piece.steps.length - 1 ? 'Finish' : 'Next'} {I.next}</button>
          </div>
        </div>
      )}

      {/* ---------- done ---------- */}
      {mode === 'done' && piece && (
        <div className="sheet done">
          <h2 className="built">Built!</h2>
          <p className="stats">
            <b>{piece.name}</b>{elapsed != null && <> in <b>{fmtTime(elapsed)}</b></>} · {piece.steps.length} steps · {piece.objects.length + piece.totalHw} pieces
          </p>
          <div className="ctrl">
            <button className="icon big" aria-label="Back to last step" onClick={back}>{I.back}</button>
            <button className="next alt" onClick={() => { gesture(); openCard(); }}>{I.share} Share card</button>
          </div>
          <button className="link" onClick={() => { gesture(); go('#/'); }}>Build something else</button>
          <Legal p={piece} />
        </div>
      )}

      {comm === 'contrib' && <ContributeModal onClose={() => setComm(null)} toRequest={(url, name) => setComm({ req: { url, name } })} />}
      {comm && comm !== 'contrib' && <RequestModal key={comm.req?.url ?? 'r'} init={comm.req} onClose={() => setComm(null)} />}

      {card && piece && (
        <div className="modal" onClick={() => setCard(null)}>
          <div className="card-preview" onClick={(e) => e.stopPropagation()}>
            <img src={card.url} alt={`Share card: ${piece.name} built`} />
            <div className="ctrl">
              <button className="icon big" aria-label="Close" onClick={() => setCard(null)}>{I.close}</button>
              <button className="next" onClick={() => shareCard(card.blob, piece)}>{I.share} Share</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Ring({ n, of }: { n: number; of: number }) {
  const r = 17, c = 2 * Math.PI * r;
  return (
    <span className={`ringc ${n === of ? 'full' : ''}`} aria-label={`${n} of ${of} checked`}>
      <svg viewBox="0 0 44 44" width="44" height="44"><circle cx="22" cy="22" r={r} className="bg" /><circle cx="22" cy="22" r={r} className="fg" strokeDasharray={c} strokeDashoffset={c * (1 - n / Math.max(1, of))} /></svg>
      <b>{n}/{of}</b>
    </span>
  );
}

function Legal({ p }: { p: Piece }) {
  return (
    <p className="legal">
      Works with {p.worksWith}. {p.disclaimer ?? 'Not affiliated with or endorsed by Inter IKEA Systems B.V.'} Demo steps: always follow the{' '}
      <a href={p.instructionsUrl ?? p.productUrl} target="_blank" rel="noopener noreferrer">official instructions ↗</a>
      {p.instructionsUrl && <>{' · '}<a href={p.productUrl} target="_blank" rel="noopener noreferrer">product page ↗</a></>}
    </p>
  );
}

function burst(power: number) {
  if (reduced) return;
  const colors = ['#ff5a36', '#2bb673', '#8a7cf0', '#ff9fb6', '#1f1b18'];
  confetti({ particleCount: Math.round(120 * power), spread: 80, startVelocity: 45 * Math.max(0.6, power), origin: { y: 0.55 }, colors, disableForReducedMotion: true });
  if (power >= 1) setTimeout(() => { confetti({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors }); confetti({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors }); }, 250);
}

