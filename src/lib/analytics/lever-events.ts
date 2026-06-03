/**
 * lever-events.ts — W-0501 conversion lever schema (L1~L7).
 *
 * Anon visitor_id (cookie hash) and source-only props. PII-zero by contract:
 * email is sent only by the signup endpoint, never via these client events.
 */

import { track } from '$lib/analytics';

export type LeverId = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'l6' | 'l7';

export type LeverEvent =
  | 'lever_l1_terminal_click'
  | 'lever_l2_signup_open'
  | 'lever_l3_pattern_search'
  | 'lever_l4_alert_subscribe'
  | 'lever_l5_whale_unlock'
  | 'lever_l6_portfolio_email'
  | 'lever_l7_brief_email';

const EVENT_BY_ID: Record<LeverId, LeverEvent> = {
  l1: 'lever_l1_terminal_click',
  l2: 'lever_l2_signup_open',
  l3: 'lever_l3_pattern_search',
  l4: 'lever_l4_alert_subscribe',
  l5: 'lever_l5_whale_unlock',
  l6: 'lever_l6_portfolio_email',
  l7: 'lever_l7_brief_email',
};

export function dispatchLever(
  id: LeverId,
  props: { surface?: string; trigger?: string } = {},
): void {
  track(EVENT_BY_ID[id], { lever: id, ...props });
}

export function leverEventName(id: LeverId): LeverEvent {
  return EVENT_BY_ID[id];
}
