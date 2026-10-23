/** Affiliate settings live here and only here. Change the tag in one place. */
export const AMAZON_TAG = 'hexkey-20'; // Amazon Associates (Tiny Labs LLC)
export const AMAZON_DISCLOSURE = 'As an Amazon Associate, Hexkey earns from qualifying purchases.';
/** rel for every affiliate link (Google and Amazon both want sponsored links marked). */
export const AFF_REL = 'sponsored noopener nofollow';

/** A plain Amazon search link with our tag. We use search links, not product pages, so nothing goes stale. */
export function amazonSearch(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query).replace(/%20/g, '+')}&tag=${AMAZON_TAG}`;
}
