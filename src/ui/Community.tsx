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
/** fallback when the catalog list isn't passed in */
const SHIPPED = ['lack', 'kallax', 'billy'];
const isShipped = (name: string, have?: string[]) => (have ?? SHIPPED).includes(name.trim().toLowerCase());

export function issueUrl(template: string, title: string, fields: Record<string, string>) {
  const q = new URLSearchParams({ template, title });
  for (const [k, v] of Object.entries(fields)) if (v) q.set(k, v);
  return `${REPO}/issues/new?${q.toString()}`;
}

/** Official brand sites (data/sources/brands.json), loaded only when a form opens so the home bundle stays small. */
export type BrandSite = { id: string; label: string; host: string };
let brandSites: Promise<BrandSite[]> | null = null;
export function loadBrandSites(): Promise<BrandSite[]> {
  brandSites ??= import('../../data/sources/brands.json').then((m) => (m.default.brands as { id: string; label?: string; name: string; site?: string; status?: string }[])
    .filter((b) => b.site && b.status !== 'skipped')
    .map((b) => ({ id: b.id, label: b.status === 'included' && b.label ? b.label : b.name.replace(/\s*\(.*\)$/, ''), host: bare(new URL(b.site!).hostname) })))
    .catch(() => []);
  return brandSites;
}
function useBrandSites() {
  const [list, setList] = useState<BrandSite[]>([]);
  useEffect(() => { let live = true; loadBrandSites().then((l) => live && setList(l)); return () => { live = false; }; }, []);
  return list;
}
const bare = (h: string) => h.toLowerCase().replace(/^www\./, '');
const FILE = /\.(pdf|jpe?g|png|gif|webp|avif|svg|zip|dwg|stl|obj|glb|gltf|mp4|mov)$/i;
const TRACK = /^(utm_\w+|gclid|fbclid|msclkid|mc_[ce]id|ref|ref_|tag|irclickid|clickid|aff\w*)$/i;
const GENERIC = new Set(['p', 'dp', 'gp', 'product', 'products', 'item', 'items', 'ip', 'shop', 'store', 'en', 'us', 'pdp', 'instructions', 'instruction', 'assembly', 'support', 'manual', 'manuals', 'guide', 'guides', 'help', 'docs', 'documents', 'furniture', 'collections', 'catalog', 'detail', 'details', 'page']);
const titleCase = (w: string) => (w.length <= 2 && w !== w.toUpperCase() ? w : w[0].toUpperCase() + w.slice(1));

export type Parsed =
  | { state: 'empty' }
  | { state: 'bad'; why: string }
  | { state: 'ok'; url: string; host: string; brand?: string; name: string; nice: string; id?: string };

/**
 * Any official brand or retailer product / instructions page over https.
 * https://www.ikea.com/us/en/p/billy-bookcase-white-00263850/ -> { name: "BILLY", nice: "BILLY bookcase", brand: "IKEA®" }
 * https://www.walkeredison.com/products/holmes-bookcase      -> { name: "Holmes Bookcase", brand: "Walker Edison®" }
 */
export function parseProductUrl(raw: string, sites: BrandSite[] = []): Parsed {
  const s = raw.trim();
  if (!s) return { state: 'empty' };
  if (/^http:\/\//i.test(s)) return { state: 'bad', why: 'Use the secure https:// link' };
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^https:\/\//i.test(s)) return { state: 'bad', why: 'Needs a web link (https://…)' };
  if (s.length > 600 || /\s/.test(s)) return { state: 'bad', why: 'That doesn’t look like a web link' };
  let u: URL;
  try { u = new URL(/^https:\/\//i.test(s) ? s : `https://${s}`); } catch { return { state: 'bad', why: 'That doesn’t look like a web link' }; }
  const host = u.hostname.toLowerCase();
  if (u.username || u.password || u.port || !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host) || host.split('.').some((l) => !l || l.startsWith('-') || l.endsWith('-')))
    return { state: 'bad', why: 'Needs a real site address, like brand.com/…' };
  const path = decodeURIComponent(u.pathname).replace(/\/+$/, '');
  if (!path) return { state: 'bad', why: 'Link the product or instructions page, not the home page' };
  if (FILE.test(path)) return { state: 'bad', why: 'Link the web page, not a PDF or image file' };
  const keep = [...u.searchParams].filter(([k]) => !TRACK.test(k));
  const q = keep.length ? `?${new URLSearchParams(keep).toString()}` : '';
  const url = `https://${host}${u.pathname}${q}`;
  const h = bare(host);
  const brand = sites.find((b) => h === b.host || h.endsWith(`.${b.host}`))?.label;
  // IKEA product pages carry the name and article number: …/p/billy-bookcase-white-00263850/
  const ik = /(^|\.)ikea\.com$/.test(h) && u.pathname.match(/\/p\/([a-z0-9-]+?)-(s?\d{8})\/?$/i);
  if (ik) {
    const words = ik[1].split('-'), name = words[0].toUpperCase();
    return { state: 'ok', url, host: h, brand: brand ?? 'IKEA®', name, nice: [name, ...words.slice(1, 3)].join(' '), id: ik[2] };
  }
  // anything else: a best guess at the name from the last readable path segment (people can edit it)
  const code = (w: string) => /^\d{4,}$/.test(w) || (/\d/.test(w) && w.length >= 5);
  const words = path.split('/').filter(Boolean).reverse()
    .map((x) => x.replace(/\.(html?|php|aspx?)$/i, '').split(/[-_+\s]+/).filter((w) => w && !code(w)))
    .find((ws) => ws.some((w) => /[a-z]{3,}/i.test(w) && !GENERIC.has(w.toLowerCase())))?.slice(0, 4) ?? [];
  const name = words.map(titleCase).join(' ');
  return { state: 'ok', url, host: h, brand, name, nice: name || h };
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

function UrlField({ value, set, parsed, id }: { value: string; set: (v: string) => void; parsed: Parsed; id: string }) {
  return (
    <label className="fld">
      <span>Product or instructions page</span>
      <input id={id} data-autofocus type="url" inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck={false}
        placeholder="https://brand.com/products/…" value={value} onChange={(e) => set(e.target.value)}
        aria-invalid={parsed.state === 'bad'} aria-describedby={`${id}-h`} />
      <small id={`${id}-h`} className={`hint-${parsed.state}`} aria-live="polite">
        {parsed.state === 'bad' ? parsed.why
          : parsed.state === 'ok' ? <>✓ {parsed.brand ? `${parsed.brand} · ` : ''}{parsed.host}{parsed.id ? ` · ${parsed.id}` : ''}</>
          : 'Any brand or store’s official page, https only. No PDFs.'}
      </small>
    </label>
  );
}

const NOT_AFFILIATED = 'Hexkey isn’t affiliated with, sponsored or endorsed by any brand or store.';

/* ---------------- Contribute ---------------- */
type Has = 'built' | 'box' | 'no';
type Gives = 'json' | 'measure' | 'review';
type Level = '1' | '2' | '3';
const CATS = ['Shelves & bookcases', 'Tables', 'Storage & dressers', 'Desks', 'Chairs & stools', 'Beds', 'Wardrobes', 'Kitchen', 'Kids', 'Outdoor', 'Other'];
const BIG = new Set(['Wardrobes', 'Kitchen', 'Beds']);

export type Verdict = { k: 'good' | 'maybe' | 'request' | 'have'; why: string[] };
export function fit(a: { name: string; steps: number; has: Has | ''; gives: Gives | ''; cat: string; level: Level | '' }, have?: string[]): Verdict {
  if (isShipped(a.name, have)) return { k: 'have', why: ['Already in Hexkey. Improvements welcome!'] };
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

export function ContributeModal({ onClose, toRequest, have }: { onClose: () => void; toRequest: (url: string, name: string) => void; have?: string[] }) {
  const [url, setUrl] = useState('');
  const sites = useBrandSites();
  const p = parseProductUrl(url, sites);
  const [name, setName] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!touched) setName(p.state === 'ok' ? p.name : ''); }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  const [cat, setCat] = useState('');
  const [steps, setSteps] = useState(10);
  const [has, setHas] = useState<Has | ''>('');
  const [gives, setGives] = useState<Gives | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [ownWords, setOwnWords] = useState(false);
  const ready = p.state === 'ok' && name.trim() && cat && has && gives && level;
  const v = useMemo(() => (ready ? fit({ name, steps, has, gives, cat, level }, have) : null), [ready, name, steps, has, gives, cat, level, have]);
  const lab = { built: 'Built it', box: 'Still in the box', no: "Don't have it" }, glab = { json: 'Step data (piece.json)', measure: 'Measurements', review: 'Review / test only' };
  const llab = { '1': 'New to this', '2': 'Some JSON', '3': 'Comfortable with 3D/code' };
  const href = ready && p.state === 'ok' ? issueUrl('contribute-furniture.yml', `[Contribute] ${p.brand ? `${p.brand.replace(/[®™]/g, '')} ` : ''}${name.trim()} (${cat.toLowerCase()})`, {
    product: name.trim(),
    brand: p.brand?.replace(/[®™]/g, '') ?? p.host,
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
          <input value={name} onChange={(e) => { setTouched(true); setName(e.target.value); }} placeholder="HEMNES, Holmes bookcase…" autoCapitalize="words" />
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
      <p className="cm-note">{NOT_AFFILIATED}</p>

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
export function RequestModal({ onClose, init, have: catalogNames }: { onClose: () => void; init?: { url: string; name: string }; have?: string[] }) {
  const [url, setUrl] = useState(init?.url ?? '');
  const sites = useBrandSites();
  const p = parseProductUrl(url, sites);
  const [name, setName] = useState(init?.name ?? '');
  const [touched, setTouched] = useState(!!init?.name);
  useEffect(() => { if (!touched) setName(p.state === 'ok' ? p.name : ''); }, [url]); // eslint-disable-line react-hooks/exhaustive-deps
  const [why, setWhy] = useState('');
  const have = isShipped(name, catalogNames);
  const ok = p.state === 'ok' && name.trim() && !have;
  const href = ok && p.state === 'ok' ? issueUrl('furniture-request.yml', `[Request] ${p.brand ? `${p.brand.replace(/[®™]/g, '')} ` : ''}${name.trim()}`, { product: name.trim(), brand: p.brand?.replace(/[®™]/g, '') ?? p.host, url: p.url, why: why.trim() }) : '';
  return (
    <Modal title="Request furniture" kind="req" onClose={onClose}>
      <a className="vote" href={LINKS.requests} target="_blank" rel="noopener noreferrer">
        <span aria-hidden>👍</span><div><b>Already asked?</b><small>Thumbs-up it. Top requests get built first.</small></div>{I.next}
      </a>
      <UrlField id="r-url" value={url} set={setUrl} parsed={p} />
      <label className="fld">
        <span>Name on the box</span>
        <input value={name} onChange={(e) => { setTouched(true); setName(e.target.value); }} placeholder="MALM, Rebecca dresser…" autoCapitalize="words" />
        {have && <small className="hint-ok">Already in Hexkey. Go build it!</small>}
      </label>
      <label className="fld">
        <span>Why this one? <i>(optional)</i></span>
        <textarea rows={2} maxLength={400} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Took me 3 hours, the drawers were a puzzle…" />
      </label>
      <a className={`cta ${href ? '' : 'off'}`} aria-disabled={!href} href={href || undefined} target="_blank" rel="noopener noreferrer"
        onClick={(e) => { if (!href) e.preventDefault(); }}>{I.gh} Request on GitHub</a>
      <p className="cm-note">{NOT_AFFILIATED}</p>
      <p className="cm-links">
        <a href={LINKS.bug} target="_blank" rel="noopener noreferrer">🐞 Feedback / report a bug</a>
      </p>
    </Modal>
  );
}
