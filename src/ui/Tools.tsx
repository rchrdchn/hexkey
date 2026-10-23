import { useMemo, type ReactElement } from 'react';
import type { Piece } from '../types';
import { toolsFor, needsAnchor, type Tool } from '../tools';
import { AFF_REL, AMAZON_DISCLOSURE } from '../config/affiliates';
import './tools.css';

/** Our own line icons (no product images: Associates rules forbid them without the API). */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const ICONS: Record<string, ReactElement> = {
  hex: <path {...P} d="M7 4v11a4 4 0 0 0 4 4h8" />,
  phillips: <g {...P}><rect x="4" y="13" width="7" height="7" rx="2" /><path d="M11 13l8-8M17 4l3 3" /></g>,
  flathead: <g {...P}><rect x="4" y="13" width="7" height="7" rx="2" /><path d="M11 13l7-7M16.5 3.5l4 4" /></g>,
  stubby: <g {...P}><rect x="5" y="10" width="9" height="9" rx="3" /><path d="M14 10l4-4M16.5 4.5l3 3" /></g>,
  mallet: <g {...P}><rect x="3" y="4" width="13" height="6" rx="2" /><path d="M9.5 10v10" /></g>,
  drill: <g {...P}><path d="M4 6h11v6H4zM15 9h6M8 12l-1 8h4l1-8" /></g>,
  tape: <g {...P}><rect x="3" y="6" width="13" height="13" rx="3" /><circle cx="9.5" cy="12.5" r="2.5" /><path d="M16 16h5" /></g>,
  level: <g {...P}><rect x="2" y="8" width="20" height="8" rx="2" /><rect x="9.5" y="10.5" width="5" height="3" rx="1.5" /></g>,
  glue: <g {...P}><path d="M8 9h8v11H8zM10 9V6h4v3M12 6V3" /></g>,
  pads: <g {...P}><circle cx="8" cy="9" r="4" /><circle cx="16" cy="15" r="4" /></g>,
  anchor: <g {...P}><path d="M4 3v18M4 12h6M10 9v6l10-3z" /></g>,
  knife: <g {...P}><path d="M3 15l9-9 6 3-9 9H3zM14 11l3-3" /></g>,
};
const ToolIcon = ({ t }: { t: Tool }) => <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>{ICONS[t.icon] ?? ICONS.hex}</svg>;
const Disclosure = () => <p className="aff-note">{AMAZON_DISCLOSURE}</p>;

/** Parts screen: a closed-by-default card under the Start button, so it never covers the model or the button. */
export function ToolsCard({ piece }: { piece: Piece }) {
  const tools = useMemo(() => toolsFor(piece), [piece]);
  return (
    <details className="tools">
      <summary>
        <span className="t-ico" aria-hidden><svg viewBox="0 0 24 24" width="18" height="18">{ICONS.hex}</svg></span>
        <span className="t-sum"><b>Tools for this build</b><small>{tools.slice(0, 3).map((t) => t.name).join(', ')}{tools.length > 3 ? ` +${tools.length - 3}` : ''}</small></span>
        <span className="t-chev" aria-hidden>›</span>
      </summary>
      <p className="t-lead">A hex key and a Phillips #2 do most of it. The rest makes it easier. Links open Amazon.</p>
      <ul className="t-list">
        {tools.map((t) => (
          <li key={t.id}>
            <a href={t.url} target="_blank" rel={AFF_REL} title={t.note} aria-label={`${t.name} on Amazon (opens a new tab). ${t.note}`}>
              <ToolIcon t={t} /><span>{t.name}</span>
            </a>
          </li>
        ))}
      </ul>
      <Disclosure />
    </details>
  );
}

const PRIORITY = ['anchors', 'drill', 'hex-key', 'phillips', 'mallet', 'pads'];
/** Finish screen: one quiet line. Leads with the wall anchor when the piece can tip. */
export function NeedTools({ piece }: { piece: Piece }) {
  const tools = useMemo(() => toolsFor(piece), [piece]);
  const pick = PRIORITY.map((id) => tools.find((t) => t.id === id)).filter((t): t is Tool => !!t).slice(0, 3);
  return (
    <div className="need-tools">
      <p className="nt-head">
        {needsAnchor(tools) ? <><b>Anchor it to the wall</b> before you fill it.</> : <><b>Need tools?</b> For the next build:</>}
      </p>
      <p className="nt-links">
        {pick.map((t) => (
          <a key={t.id} href={t.url} target="_blank" rel={AFF_REL} aria-label={`${t.name} on Amazon (opens a new tab)`}><ToolIcon t={t} />{t.short} ↗</a>
        ))}
      </p>
      <Disclosure />
    </div>
  );
}

export { AMAZON_DISCLOSURE };
