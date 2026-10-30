// Types for outbound-utm.mjs so the app (src/) can import tagUrl.
export interface UtmOpts { site: string; aliases?: string[] }
export const SKIP_DOMAINS: string[];
export const SKIP_ACTIONS: [string, string][];
export function tagUrl(href: string, opts: UtmOpts): string | null;
export function tagHref(rawHref: string, opts: UtmOpts): string | null;
export function tagHtml(html: string, opts: UtmOpts): { html: string; count: number };
