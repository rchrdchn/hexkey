import { useEffect, useMemo, useRef, useState } from 'react';
import type { CatalogEntry, Category } from '../types';
import { I } from './icons';
import './catalog.css';

const CATS: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'shelving', label: 'Shelving' }, { id: 'dressers', label: 'Dressers' }, { id: 'bedroom', label: 'Bedroom' },
  { id: 'storage', label: 'Storage' }, { id: 'tables', label: 'Tables' }, { id: 'desks', label: 'Desks' }, { id: 'kids', label: 'Kids' },
];
const base = import.meta.env.BASE_URL;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** The picker: search, category chips and a card per piece. Only this list loads up front; a piece's full data loads when it's picked. */
export function Catalog({ entries, pick, onPick, onRequest }: { entries: CatalogEntry[]; pick: string; onPick: (slug: string) => void; onRequest: (name: string) => void }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'all'>(() => (localStorage.getItem('hk-cat') as Category) || 'all');
  const [brand, setBrand] = useState<string>(() => localStorage.getItem('hk-brand') || 'all');
  useEffect(() => localStorage.setItem('hk-cat', cat), [cat]);
  useEffect(() => localStorage.setItem('hk-brand', brand), [brand]);
  // brand chips, biggest first (IKEA leads); a stale saved brand falls back to All
  const brands = useMemo(() => {
    const m = new Map<string, { id: string; label: string; n: number }>();
    entries.forEach((e) => { const id = e.brandId ?? 'ikea'; const b = m.get(id) ?? { id, label: e.brand ?? 'IKEA', n: 0 }; b.n++; m.set(id, b); });
    return [...m.values()].sort((a, b) => (a.id === 'ikea' ? -1 : b.id === 'ikea' ? 1 : b.n - a.n || a.label.localeCompare(b.label)));
  }, [entries]);
  const br = brands.some((b) => b.id === brand) ? brand : 'all';
  const inBrand = useMemo(() => entries.filter((e) => br === 'all' || (e.brandId ?? 'ikea') === br), [entries, br]);
  const counts = useMemo(() => { const m: Record<string, number> = { all: inBrand.length }; inBrand.forEach((e) => (m[e.category] = (m[e.category] ?? 0) + 1)); return m; }, [inBrand]);
  const ct = counts[cat] ? cat : 'all';
  const shown = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return inBrand.filter((e) => (ct === 'all' || words.length > 0 || e.category === ct) && words.every((w) => norm(`${e.name} ${e.title} ${e.brand ?? ''} ${e.category} ${e.tags.join(' ')}`).includes(w)));
  }, [inBrand, q, ct]);
  const rail = useRef<HTMLDivElement>(null);
  // keep the picked card in view (e.g. on first load, or after a search clears)
  useEffect(() => { rail.current?.querySelector<HTMLElement>('.card.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [pick, cat, br]);
  return (
    <div className="catalog">
      <div className="find">
        <label className="search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" /><path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
          <input type="search" placeholder={`Search ${entries.length} pieces`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search furniture" enterKeyHint="search" />
          {q && <button className="clear" aria-label="Clear search" onClick={() => setQ('')}>{I.close}</button>}
        </label>
      </div>
      {brands.length > 1 && (
        <div className="cats brands" role="group" aria-label="Brands">
          {[{ id: 'all', label: 'All brands', n: entries.length }, ...brands].map((b) => (
            <button key={b.id} aria-pressed={br === b.id} className={br === b.id ? 'on' : ''} data-brand={b.id} onClick={() => setBrand(b.id)}>
              {b.label}<i>{b.n}</i>
            </button>
          ))}
        </div>
      )}
      <div className="cats" role="tablist" aria-label="Categories">
        {CATS.filter((c) => counts[c.id]).map((c) => (
          <button key={c.id} role="tab" aria-selected={!q && ct === c.id} className={!q && ct === c.id ? 'on' : ''} onClick={() => { setQ(''); setCat(c.id); }}>
            {c.label}<i>{counts[c.id]}</i>
          </button>
        ))}
      </div>
      <div className="cards rail" ref={rail}>
        {shown.map((e) => (
          <button key={e.slug} className={`card ${e.slug === pick ? 'on' : ''}`} onClick={() => onPick(e.slug)} aria-pressed={e.slug === pick} data-slug={e.slug}>
            <span className="thumb" style={{ background: e.color }}>
              <img src={`${base}thumbs/${e.slug}.webp`} alt="" loading="lazy" decoding="async" width={160} height={120} onError={(ev) => ((ev.target as HTMLImageElement).style.visibility = 'hidden')} />
            </span>
            <b>{e.name}</b>
            <small>{e.brandId && e.brandId !== 'ikea' ? <em className="brand">{e.brand}</em> : null}{e.title}</small>
            <span className="chips">
              <i>{I.clock}{e.minutes}m</i><i>{I.people}{e.people}</i><i>{e.steps} steps</i>
            </span>
            <span className="lvl" aria-label={`Difficulty ${e.level} of 3`}>{[1, 2, 3].map((n) => <u key={n} className={n <= e.level ? 'f' : ''} />)}<span className="pcs">{e.pieces + e.hardware} pcs</span></span>
          </button>
        ))}
        {!shown.length && (
          <div className="empty">
            <p>No “{q}” yet{br !== 'all' ? ` from ${brands.find((b) => b.id === br)?.label}` : ''}.</p>
            <button className="pill alt" onClick={() => onRequest(q)}>{I.bulb}<span>Request it</span></button>
          </div>
        )}
      </div>
    </div>
  );
}
