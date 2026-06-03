/**
 * Selection Action handoff utilities — W-0541 PR2-A.
 *
 * Three thin utilities that convert a chart range selection into the canonical
 * Action Layer described in W-0538 §10:
 *
 *   - createAlert     -> opens an alert composer prefilled from selection
 *   - sendToPatterns  -> deep-links into /patterns with the capture context
 *   - sendToLab       -> deep-links into /lab with the capture context
 *
 * These are pure client helpers — no backend changes. The downstream pages
 * read the prefill from query string + sessionStorage and render the
 * appropriate composer.
 */

import { goto } from '$app/navigation';
import { track } from '$lib/analytics';

export interface SelectionHandoffPayload {
  symbol: string;
  timeframe: string;
  fromTime: number;
  toTime: number;
  /** Optional structured snapshot (RSI, vol_z, etc) computed by buildIndicatorSnapshotFromRange. */
  snapshot?: Record<string, number> | null;
  /** Optional active indicator id list at selection time. */
  activeIndicators?: string[];
}

/**
 * Prefix used for sessionStorage handoff bundles. Pages reading the bundle
 * should clear it after first read so refreshes do not replay the prefill.
 */
const HANDOFF_KEY_PREFIX = 'cogochi:selection-handoff:';

function persistPayload(scope: string, payload: SelectionHandoffPayload): string {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    sessionStorage.setItem(`${HANDOFF_KEY_PREFIX}${scope}:${id}`, JSON.stringify(payload));
  } catch {
    /* sessionStorage unavailable (private mode etc) — fall back to query-only handoff */
  }
  return id;
}

/**
 * Read and remove a handoff bundle. Pages call this on mount.
 */
export function consumeHandoffPayload(
  scope: string,
  id: string,
): SelectionHandoffPayload | null {
  if (typeof sessionStorage === 'undefined') return null;
  const key = `${HANDOFF_KEY_PREFIX}${scope}:${id}`;
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    sessionStorage.removeItem(key);
    return JSON.parse(raw) as SelectionHandoffPayload;
  } catch {
    return null;
  }
}

/**
 * createAlert — Discretionary 1차 CTA.
 *
 * Naive v1: navigate to /scan?compose=alert&symbol=&from=&to=. The /scan
 * route opens an inline alert composer prefilled with the selection range so
 * the user can pick an alert type (price / pattern / breakout) without losing
 * context.
 */
export async function createAlertFromSelection(payload: SelectionHandoffPayload): Promise<void> {
  const id = persistPayload('alert', payload);
  track('selection_handoff', { target: 'alert', symbol: payload.symbol, tf: payload.timeframe });
  const url = new URL('/scan', window.location.origin);
  url.searchParams.set('compose', 'alert');
  url.searchParams.set('symbol', payload.symbol);
  url.searchParams.set('tf', payload.timeframe);
  url.searchParams.set('from', String(payload.fromTime));
  url.searchParams.set('to', String(payload.toTime));
  url.searchParams.set('h', id);
  await goto(url.pathname + url.search);
}

/**
 * sendToPatterns — knowledge action.
 *
 * Opens /patterns with the selection context so the user can compare against
 * the pattern library, save as a custom pattern, or attach the capture to an
 * existing pattern card.
 */
export async function sendSelectionToPatterns(payload: SelectionHandoffPayload): Promise<void> {
  const id = persistPayload('patterns', payload);
  track('selection_handoff', { target: 'patterns', symbol: payload.symbol, tf: payload.timeframe });
  const url = new URL('/patterns', window.location.origin);
  url.searchParams.set('from', 'terminal');
  url.searchParams.set('symbol', payload.symbol);
  url.searchParams.set('tf', payload.timeframe);
  url.searchParams.set('range_from', String(payload.fromTime));
  url.searchParams.set('range_to', String(payload.toTime));
  url.searchParams.set('h', id);
  await goto(url.pathname + url.search);
}

/**
 * sendToLab — knowledge action (paper/backtest handoff).
 *
 * Opens /lab with the selection as a starting context for paper trade or
 * backtest. The Lab page reads the handoff and seeds the paper composer
 * (entry/stop/target placeholders) using the OHLCV summary.
 */
export async function sendSelectionToLab(payload: SelectionHandoffPayload): Promise<void> {
  const id = persistPayload('lab', payload);
  track('selection_handoff', { target: 'lab', symbol: payload.symbol, tf: payload.timeframe });
  const url = new URL('/lab', window.location.origin);
  url.searchParams.set('from', 'terminal');
  url.searchParams.set('symbol', payload.symbol);
  url.searchParams.set('tf', payload.timeframe);
  url.searchParams.set('range_from', String(payload.fromTime));
  url.searchParams.set('range_to', String(payload.toTime));
  url.searchParams.set('h', id);
  await goto(url.pathname + url.search);
}
