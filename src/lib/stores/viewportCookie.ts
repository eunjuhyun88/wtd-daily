/**
 * viewportCookie.ts (W-0474)
 *
 * Bridges viewport detection between server and client to eliminate
 * SSR/hydration mismatches in TerminalHub mobile branch.
 *
 *   - Client writes the current tier into a `vp-tier` cookie on mount and
 *     on resize (debounced).
 *   - Server reads the cookie on the next request and renders the correct
 *     branch in the SSR HTML.
 *   - First visit (no cookie) is resolved server-side via User-Agent sniff.
 */

import type { ViewportTier } from './viewportTier';

export const VIEWPORT_TIER_COOKIE = 'vp-tier';
const COOKIE_MAX_AGE_DAYS = 30;

const VALID_TIERS: ReadonlyArray<ViewportTier> = ['MOBILE', 'TABLET', 'DESKTOP'];

export function tierFromWidth(width: number): ViewportTier {
  if (width < 768) return 'MOBILE';
  if (width < 1280) return 'TABLET';
  return 'DESKTOP';
}

export function parseViewportTierCookie(value: string | undefined | null): ViewportTier | null {
  if (!value) return null;
  return (VALID_TIERS as ReadonlyArray<string>).includes(value) ? (value as ViewportTier) : null;
}

/**
 * Coarse User-Agent sniff used as a fallback when the cookie is absent.
 * Conservative: only flags clearly-mobile UAs as MOBILE; everything else
 * falls through to DESKTOP so the desktop user (the majority of new visits
 * from search) does not see a mobile-flash on first paint.
 */
export function tierFromUserAgent(ua: string | null | undefined): ViewportTier {
  if (!ua) return 'DESKTOP';
  const s = ua.toLowerCase();
  // iPad reports both Macintosh + Mobile/Touch in modern Safari — treat as TABLET
  if (/ipad/.test(s) || (/macintosh/.test(s) && /mobile/.test(s))) return 'TABLET';
  if (/android.*mobile|iphone|ipod|windows phone|blackberry|bb10/.test(s)) return 'MOBILE';
  if (/android(?!.*mobile)/.test(s)) return 'TABLET';
  return 'DESKTOP';
}

const isBrowser = typeof document !== 'undefined';

export function writeViewportCookie(width: number): void {
  if (!isBrowser) return;
  const tier = tierFromWidth(width);
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  // Set Secure on HTTPS so the cookie is never sent over a downgraded HTTP
  // connection. Localhost dev (file://, http://localhost) is excluded.
  const secure = typeof location !== 'undefined' && location.protocol === 'https:'
    ? '; Secure'
    : '';
  document.cookie =
    `${VIEWPORT_TIER_COOKIE}=${tier}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Defense-in-depth: validate a tier string (from any source) before injecting
 * it into HTML. Returns the input only if it is one of the canonical enum
 * values, otherwise returns 'DESKTOP'. Use this at every injection site so a
 * future bug that lets unsanitized user input reach `event.locals.viewportTier`
 * cannot become an HTML-injection sink.
 */
export function safeTier(value: string | null | undefined): ViewportTier {
  return parseViewportTierCookie(value) ?? 'DESKTOP';
}
