import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { I } from './icons';

/** Community entry points: "Contribute" (guided fit check -> issue form) and "Request" (vote or ask). */
export const REPO = 'https://github.com/rchrdchn/hexkey';
const BLOB = `${REPO}/blob/main`;
export const LINKS = {
  contributing: `${BLOB}/CONTRIBUTING.md`,
  schema: `${BLOB}/schema/piece.schema.json`,
  format: `${BLOB}/README.md#data-format`,
  requests: `${REPO}/issues?q=${encodeURIComponent('is:issue is:open label:furniture-request sort:reactions-+1-desc')}`,
  bug: `${REPO}/issues/new?template=bug-report.yml`,
};
const SHIPPED = ['lack', 'kallax', 'billy'];

export function issueUrl(template: string, title: string, fields: Record<string, string>) {
  const q = new URLSearchParams({ template, title });
  for (const [k, v] of Object.entries(fields)) if (v) q.set(k, v);
  return `${REPO}/issues/new?${q.toString()}`;
}

/** https://www.ikea.com/us/en/p/billy-bookcase-white-00263850/ -> { ok, name: "BILLY", nice: "BILLY bookcase" } */
export function parseIkea(raw: string) {
  const s = raw.trim();
  if (!s) return { state: 'empty' as const };
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); } catch { return { state: 'bad' as const }; }
  const host = u.hostname.toLowerCase();
  if (host !== 'ikea.com' && host !== 'www.ikea.com') return { state: 'bad' as const };
  const m = u.pathname.match(/^\/[a-z]{2}\/[a-z]{2}(?:-[a-z]{2})?\/p\/([a-z0-9-]+?)-(s?\d{8})\/?$/i);
  if (!m) return { state: 'bad' as const };
  const words = m[1].split('-');
  const name = words[0].toUpperCase();
  const clean = `https://www.ikea.com${u.pathname.endsWith('/') ? u.pathname : u.pathname + '/'}`;
  return { state: 'ok' as const, url: clean, name, nice: [name, ...words.slice(1, 3)].join(' '), id: m[2] };
}

/* ---------------- modal shell: focus trap, Esc, backdrop close, body scroll lock, restore focus ---------------- */
export function Modal({ title, sub, onClose, children, kind }: { title: string; sub?: ReactNode; onClose: () => void; children: ReactNode; kind: string }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = box.current!;
    const focusables = () => [...el.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')];
    (el.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus({ preventScroll: true });
    const html = document.documentElement, body = document.body;
    const was = [html.style.overflow, body.style.overflow];
    html.style.overflow = body.style.overflow = 'hidden';
    return () => { [html.style.overflow, body.style.overflow] = was; prev?.focus?.({ preventScroll: true }); };
  }, []);
  const onKey = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // keep the app's arrow/space/enter shortcuts out of the form
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = [...box.current!.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea')].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div className="modal cm-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} onKeyDown={onKey}>
      <div ref={box} className={`cm ${kind}`} role="dialog" aria-modal="true" aria-labelledby={`${kind}-t`}>
        <div className="cm-head">
          <div className="cm-ttl"><h2 id={`${kind}-t`}>{title}</h2>{sub && <p className="cm-sub">{sub}</p>}</div>
          <button className="icon cm-x" aria-label="Close" onClick={onClose}>{I.close}</button>
        </div>
        <div className="cm-body">{children}</div>
      </div>
    </div>
  );
}

function Seg<T extends string>({ label, value, set, opts }: { label: string; value: T | ''; set: (v: T) => void; opts: [T, string, string][] }) {
  return (
    <fieldset className="seg">
      <legend>{label}</legend>
      <div>
        {opts.map(([v, ico, txt]) => (
          <label key={v} className={value === v ? 'on' : ''}>
            <input type="radio" name={label} value={v} checked={value === v} onChange={() => set(v)} />
            <span className="ico" aria-hidden>{ico}</span>{txt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function UrlField({ value, set, parsed, id }: { value: string; set: (v: string) => void; parsed: ReturnType<typeof parseIkea>; id: string }) {
  return (
    <label className="fld">
      <span>IKEA product page</span>
      <input id={id} data-autofocus type="url" inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck={false}
        placeholder="ikea.com/us/en/p/…" value={value} onChange={(e) => set(e.target.value)}
        aria-invalid={parsed.state === 'bad'} aria-describedby={`${id}-h`} />
      <small id={`${id}-h`} className={`hint-${parsed.state}`} aria-live="polite">
        {parsed.state === 'bad' ? 'Needs an ikea.com product link (…/p/…)' : parsed.state === 'ok' ? <>✓ {parsed.nice} · {parsed.id}</> : 'Product page only. No PDFs.'}
      </small>
    </label>
  );
}

/* ---------------- Contribute ---------------- */
type Has = 'built' | 'box' | 'no';
type Gives = 'json' | 'measure' | 'review';
type Level = '1' | '2' | '3';
const CATS = ['Shelves & bookcases', 'Tables', 'Storage & dressers', 'Desks', 'Chairs & stools', 'Beds', 'Wardrobes', 'Kitchen', 'Kids', 'Outdoor', 'Other'];
const BIG = new Set(['Wardrobes', 'Kitchen', 'Beds']);

export type Verdict = { k: 'good' | 'maybe' | 'request' | 'have'; why: string[] };
export function fit(a: { name: string; steps: number; has: Has | ''; gives: Gives | ''; cat: string; level: Level | '' }): Verdict {
  if (SHIPPED.includes(a.name.trim().toLowerCase())) return { k: 'have', why: ['Already in Hexkey. Improvements welcome!'] };
  const why: string[] = [];
  if (a.has === 'no' && a.gives !== 'json') return { k: 'request', why: ['You need the piece in hand to measure and test it.'] };
  if (a.gives === 'review' && a.has !== 'built') return { k: 'request', why: ['Reviewing needs a written guide to check.'] };
  let score = 0;
  if (a.has === 'built' || a.has === 'box') score += 2; else why.push('Try it with the real piece');
  if (a.gives === 'json') score += 2; else if (a.gives === 'measure') score += 1; else why.push('Measurements or steps make it shippable');
  if (a.steps <= 25) score += 1; else why.push('Long builds: split into sections');
  if (!BIG.has(a.cat)) score += 1; else why.push(`${a.cat} are big, start with one module`);
  if (a.level === '1' && a.gives === 'json') why.push('First piece? Copy lack/piece.json as a start');
  return score >= 5 ? { k: 'good', why: why.length ? why : ['Perfect starter piece'] } : { k: 'maybe', why };
}

const V = {
  good: { t: 'Great fit', c: 'g', ico: '🛠️' },
  maybe: { t: 'Could work', c: 'm', ico: '🤔' },
  request: { t: 'Better as a request', c: 'r', ico: '💡' },
  have: { t: 'We have this one', c: 'h', ico: '✅' },
};

export function ContributeModal({ onClose, toRequest }: { onClose: () => void; toRequest: (url: string, name: string) => void }) {
  const [url, setUrl] = useState('');
  const p = parseIkea(url);
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (p.state === 'ok' && !touched) setName(p.name); }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  const [cat, setCat] = useState('');
  const [steps, setSteps] = useState(10);
  const [has, setHas] = useState<Has | ''>('');
  const [gives, setGives] = useState<Gives | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [ownWords, setOwnWords] = useState(false);
  const ready = p.state === 'ok' && name.trim() && cat && has && gives && level;
  const v = useMemo(() => (ready ? fit({ name, steps, has, gives, cat, level }) : null), [ready, name, steps, has, gives, cat, level]);
  const lab = { built: 'Built it', box: 'Still in the box', no: "Don't have it" }, glab = { json: 'Step data (piece.json)', measure: 'Measurements', review: 'Review / test only' };
  const llab = { '1': 'New to this', '2': 'Some JSON', '3': 'Comfortable with 3D/code' };
  const href = ready && p.state === 'ok' ? issueUrl('contribute-furniture.yml', `[Contribute] ${name.trim().toUpperCase()} ${cat.toLowerCase()}`, {
    product: name.trim().toUpperCase(),
    url: p.url,
    category: cat,
    steps: String(steps),
    has: lab[has as Has],
    gives: glab[gives as Gives],
    level: llab[level as Level],
    fit: v ? V[v.k].t : '',
  }) : '';
  return (
    <Modal title="Add a piece" kind="contrib" onClose={onClose}>
      <ol className="how" aria-label="How it works">
        <li><span>📏</span>Measure</li><li><span>✍️</span>Write steps</li><li><span>🔍</span>Validate</li><li><span>🚀</span>PR</li>
      </ol>
      <UrlField id="c-url" value={url} set={setUrl} parsed={p} />
      <div className="two">
        <label className="fld">
          <span>Name on the box</span>
          <input value={name} onChange={(e) => { setTouched(true); setName(e.target.value); }} placeholder="HEMNES" autoCapitalize="characters" />
        </label>
        <label className="fld">
          <span>Type</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="" disabled>Pick…</option>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <label className="fld range">
        <span>Steps in the manual <b>≈ {steps}{steps >= 40 ? '+' : ''}</b></span>
        <input type="range" min={3} max={40} value={steps} onChange={(e) => setSteps(+e.target.value)} aria-valuetext={`about ${steps} steps`} />
      </label>
      <Seg label="Got the piece?" value={has} set={setHas} opts={[['built', '🪑', 'Built it'], ['box', '📦', 'In the box'], ['no', '🙅', 'Not yet']]} />
      <Seg label="You can bring" value={gives} set={setGives} opts={[['json', '🧩', 'Steps JSON'], ['measure', '📐', 'Measurements'], ['review', '👀', 'A review']]} />
      <label className="fld">
        <span>Your level</span>
        <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
          <option value="" disabled>Pick…</option>
          <option value="1">🌱 New to this</option><option value="2">🔧 Some JSON</option><option value="3">🚀 3D / code pro</option>
        </select>
      </label>

      <div className={`verdict ${v ? V[v.k].c : 'wait'}`} aria-live="polite">
        {v ? (<><span className="vi" aria-hidden>{V[v.k].ico}</span><div><b>{V[v.k].t}</b>{v.why.map((w) => <small key={w}>{w}</small>)}</div></>)
          : <><span className="vi" aria-hidden>🧭</span><div><b>Fit check</b><small>Fill it in, we'll tell you.</small></div></>}
      </div>

      <label className="own">
        <input type="checkbox" checked={ownWords} onChange={(e) => setOwnWords(e.target.checked)} />
        <span>I'll write steps in my own words and never upload any brand's manuals, PDFs or images.</span>
      </label>

      {v?.k === 'request' && p.state === 'ok'
        ? <button className="cta" onClick={() => toRequest(p.url, name)}>💡 Request it instead {I.next}</button>
        : <a className={`cta ${href && ownWords ? '' : 'off'}`} aria-disabled={!(href && ownWords)} href={href && ownWords ? href : undefined}
            target="_blank" rel="noopener noreferrer" onClick={(e) => { if (!(href && ownWords)) e.preventDefault(); }}>
            {I.gh} Open on GitHub
          </a>}
      <p className="cm-links">
        <a href={LINKS.contributing} target="_blank" rel="noopener noreferrer">Guide</a>
        <a href={LINKS.format} target="_blank" rel="noopener noreferrer">Data format</a>
        <a href={LINKS.schema} target="_blank" rel="noopener noreferrer">Schema</a>
      </p>
    </Modal>
  );
}

/* ---------------- Request ---------------- */
export function RequestModal({ onClose, init }: { onClose: () => void; init?: { url: string; name: string } }) {
  const [url, setUrl] = useState(init?.url ?? '');
  const p = parseIkea(url);
  const [name, setName] = useState(init?.name ?? '');
  const [touched, setTouched] = useState(!!init?.name);
  useEffect(() => { if (p.state === 'ok' && !touched) setName(p.name); }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  const [why, setWhy] = useState('');
  const have = SHIPPED.includes(name.trim().toLowerCase());
  const ok = p.state === 'ok' && name.trim() && !have;
  const href = ok && p.state === 'ok' ? issueUrl('furniture-request.yml', `[Request] ${name.trim().toUpperCase()}`, { product: name.trim().toUpperCase(), url: p.url, why: why.trim() }) : '';
  return (
    <Modal title="Request furniture" kind="req" onClose={onClose}>
      <a className="vote" href={LINKS.requests} target="_blank" rel="noopener noreferrer">
        <span aria-hidden>👍</span><div><b>Already asked?</b><small>Thumbs-up it. Top requests get built first.</small></div>{I.next}
      </a>
      <UrlField id="r-url" value={url} set={setUrl} parsed={p} />
      <label className="fld">
        <span>Name on the box</span>
        <input value={name} onChange={(e) => { setTouched(true); setName(e.target.value); }} placeholder="MALM" autoCapitalize="characters" />
        {have && <small className="hint-ok">Already in Hexkey. Go build it!</small>}
      </label>
      <label className="fld">
        <span>Why this one? <i>(optional)</i></span>
        <textarea rows={2} maxLength={400} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Took me 3 hours, the drawers were a puzzle…" />
      </label>
      <a className={`cta ${href ? '' : 'off'}`} aria-disabled={!href} href={href || undefined} target="_blank" rel="noopener noreferrer"
        onClick={(e) => { if (!href) e.preventDefault(); }}>{I.gh} Request on GitHub</a>
      <p className="cm-links">
        <a href={LINKS.bug} target="_blank" rel="noopener noreferrer">🐞 Feedback / report a bug</a>
      </p>
    </Modal>
  );
}
