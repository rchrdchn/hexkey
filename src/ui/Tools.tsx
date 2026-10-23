import { useMemo, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import type { Piece } from '../types';
import { toolsFor, toolRows, needsAnchor, type Tool, type ToolRow } from '../tools';
import { Modal } from './Community';
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
  wrench: <path {...P} d="M14.5 4.5a4.5 4.5 0 0 0-4.3 5.8L4 16.5 7.5 20l6.2-6.2a4.5 4.5 0 0 0 5.8-4.3l-2.6 2.6-3-.5-.5-3 2.6-2.6c-.5-.3-1-.5-1.5-.5z" />,
};
const ToolIcon = ({ t }: { t: Tool }) => <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>{ICONS[t.icon] ?? ICONS.hex}</svg>;
const Disclosure = () => <p className="aff-note">{AMAZON_DISCLOSURE}</p>;

/** Top bar: a "Tools" pill next to the sound button (parts screen and every build step). Opens the Tools window. */
export function ToolsButton({ piece, onOpen }: { piece: Piece; onOpen?: () => void }) {
  const [open, setOpen] = useState(false);
  const n = useMemo(() => toolsFor(piece).length, [piece]);
  return (
    <>
      <button className="pill tools-btn" aria-haspopup="dialog" aria-expanded={open} aria-label={`Tools for this build (${n})`}
        onClick={() => { onOpen?.(); setOpen(true); }}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>{ICONS.wrench}</svg>
        <span className="tb-l">Tools</span>
        <span className="tb-n" aria-hidden>{n}</span>
      </button>
      {open && createPortal(<ToolsDialog piece={piece} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

/** The Tools window: bottom sheet on phones, centered dialog on desktop (Community's Modal shell). */
function ToolsDialog({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  const rows = useMemo(() => toolRows(piece), [piece]);
  const must = rows.filter((r) => r.must), rest = rows.filter((r) => !r.must);
  const tips = rows.some((r) => r.tool.id === 'anchors') && piece.archetype !== 'wall-shelf';
  const Row = ({ r }: { r: ToolRow }) => (
    <li className={r.tool.id === 'anchors' ? 'td-safe' : undefined}>
      <span className="td-ico"><ToolIcon t={r.tool} /></span>
      <span className="td-txt"><b>{r.tool.name}</b><small>{r.why}</small></span>
      <a className="td-buy" href={r.tool.url} target="_blank" rel={AFF_REL} aria-label={`Find ${r.tool.name} on Amazon (opens a new tab)`}>Find on Amazon <span aria-hidden>↗</span></a>
    </li>
  );
  return (
    <Modal kind="tools-d" title="Tools for this build" sub={piece.name} onClose={onClose}>
      {tips && <p className="td-warn" role="note"><span aria-hidden>⚠</span><span><b>This one can tip over.</b> Anchor it to the wall before you fill it.</span></p>}
      <h3 className="td-h">Must-have</h3>
      <ul className="td-list">{must.map((r) => <Row key={r.tool.id} r={r} />)}</ul>
      {rest.length > 0 && <><h3 className="td-h">Makes it easier</h3><ul className="td-list">{rest.map((r) => <Row key={r.tool.id} r={r} />)}</ul></>}
      <p className="aff-note td-note">{AMAZON_DISCLOSURE}</p>
    </Modal>
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
