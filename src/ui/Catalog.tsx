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
  useEffect(() => localStorage.setItem('hk-cat', cat), [cat]);
  const counts = useMemo(() => { const m: Record<string, number> = { all: entries.length }; entries.forEach((e) => (m[e.category] = (m[e.category] ?? 0) + 1)); return m; }, [entries]);
  const shown = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean);
    return entries.filter((e) => (cat === 'all' || words.length > 0 || e.category === cat) && words.every((w) => norm(`${e.name} ${e.title} ${e.category} ${e.tags.join(' ')}`).includes(w)));
  }, [entries, q, cat]);
  const rail = useRef<HTMLDivElement>(null);
  // keep the picked card in view (e.g. on first load, or after a search clears)
  useEffect(() => { rail.current?.querySelector<HTMLElement>('.card.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }, [pick, cat]);
  return (
    <div className="catalog">
      <div className="find">
        <label className="search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" /><path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
          <input type="search" placeholder={`Search ${entries.length} pieces`} value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search furniture" enterKeyHint="search" />
          {q && <button className="clear" aria-label="Clear search" onClick={() => setQ('')}>{I.close}</button>}
        </label>
      </div>
      <div className="cats" role="tablist" aria-label="Categories">
        {CATS.filter((c) => counts[c.id]).map((c) => (
          <button key={c.id} role="tab" aria-selected={!q && cat === c.id} className={!q && cat === c.id ? 'on' : ''} onClick={() => { setQ(''); setCat(c.id); }}>
            {c.label}<i>{counts[c.id]}</i>
          </button>
        ))}
      </div>
      <div className="cards rail" ref={rail}>
        {shown.map((e) => (
          <button key={e.slug} className={`card ${e.slug === pick ? 'on' : ''}`} onClick={() => onPick(e.slug)} aria-pressed={e.slug === pick}>
            <span className="thumb" style={{ background: e.color }}>
              <img src={`${base}thumbs/${e.slug}.webp`} alt="" loading="lazy" decoding="async" width={160} height={120} onError={(ev) => ((ev.target as HTMLImageElement).style.visibility = 'hidden')} />
              {e.confidence !== 'high' && <em className={`conf ${e.confidence}`} title={e.confidence === 'low' ? 'Rough guide: big picture only' : 'Close match: details may differ'}>{e.confidence === 'low' ? 'Rough' : 'Approx'}</em>}
            </span>
            <b>{e.name}</b>
            <small>{e.title}</small>
            <span className="chips">
              <i>{I.clock}{e.minutes}m</i><i>{I.people}{e.people}</i><i>{e.steps} steps</i>
            </span>
            <span className="lvl" aria-label={`Difficulty ${e.level} of 3`}>{[1, 2, 3].map((n) => <u key={n} className={n <= e.level ? 'f' : ''} />)}<span className="pcs">{e.pieces + e.hardware} pcs</span></span>
          </button>
        ))}
        {!shown.length && (
          <div className="empty">
            <p>No “{q}” yet.</p>
            <button className="pill alt" onClick={() => onRequest(q)}>{I.bulb}<span>Request it</span></button>
          </div>
        )}
      </div>
    </div>
  );
}
