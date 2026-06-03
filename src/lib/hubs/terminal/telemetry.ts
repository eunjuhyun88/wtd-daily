/**
 * telemetry.ts — GTM event wrapper for terminal hub
 *
 * Fires window.gtag events with zod-validated payloads.
 * - dev: console.debug (gtag absent)
 * - prod: window.gtag('event', ...)
 * - SSR / no-gtag: no-op, no error thrown
 * - 0 PII: user_id, email, IP 절대 미포함
 */

import { z } from 'zod';
import type { WorkMode } from './workMode.store';

// ── Schemas ────────────────────────────────────────────────────────────────

export const WorkmodeSwitchSchema = z.object({
  // W-0481: aligned with PRODUCT-DESIGN-FINAL (was TRADE/TRAIN/FLYWHEEL)
  from: z.enum(['ANALYZE', 'TRAIN', 'REVIEW']),
  to: z.enum(['ANALYZE', 'TRAIN', 'REVIEW']),
  timestamp: z.number().int().positive(),
});
export type WorkmodeSwitchPayload = z.infer<typeof WorkmodeSwitchSchema>;

export const TrainSessionCompleteSchema = z.object({
  session_id: z.string().min(1),
  correct: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  duration_ms: z.number().int().nonnegative(),
});
export type TrainSessionCompletePayload = z.infer<typeof TrainSessionCompleteSchema>;

export const RightpanelTabSwitchSchema = z.object({
  from_tab: z.string().min(1),
  to_tab: z.string().min(1),
});
export type RightpanelTabSwitchPayload = z.infer<typeof RightpanelTabSwitchSchema>;

// ── Core fire helper ───────────────────────────────────────────────────────

function fireGtag(eventName: string, params: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  // Paranoia: strip any PII keys that should never appear
  const safe = { ...params };
  for (const key of ['user_id', 'email', 'ip', 'user_email', 'userId']) {
    delete safe[key];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (typeof win.gtag === 'function') {
    win.gtag('event', eventName, safe);
  } else {
    // dev fallback
    console.debug('[telemetry]', eventName, safe);
  }
}

// ── Public event functions ─────────────────────────────────────────────────

export function trackWorkmodeSwitch(from: WorkMode, to: WorkMode): void {
  const payload: WorkmodeSwitchPayload = {
    from,
    to,
    timestamp: Date.now(),
  };
  const parsed = WorkmodeSwitchSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('[telemetry] workmode_switch validation failed', parsed.error.issues);
    return;
  }
  fireGtag('workmode_switch', parsed.data as unknown as Record<string, unknown>);
}

export function trackTrainSessionComplete(
  sessionId: string,
  answers: string[],
  totalQuestions: number,
  durationMs: number,
): void {
  const correct = answers.filter(a => a !== 'SKIP').length;
  const payload: TrainSessionCompletePayload = {
    session_id: sessionId,
    correct,
    total: totalQuestions,
    duration_ms: durationMs,
  };
  const parsed = TrainSessionCompleteSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('[telemetry] train_session_complete validation failed', parsed.error.issues);
    return;
  }
  fireGtag('train_session_complete', parsed.data as unknown as Record<string, unknown>);
}

export function trackRightpanelTabSwitch(fromTab: string, toTab: string): void {
  if (fromTab === toTab) return;
  const payload: RightpanelTabSwitchPayload = { from_tab: fromTab, to_tab: toTab };
  const parsed = RightpanelTabSwitchSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('[telemetry] rightpanel_tab_switch validation failed', parsed.error.issues);
    return;
  }
  fireGtag('rightpanel_tab_switch', parsed.data as unknown as Record<string, unknown>);
}

// ── wave6.* telemetry ──────────────────────────────────────────────────────

export const AiAskSchema = z.object({
  intent: z.enum(['scan', 'why', 'judge', 'recall', 'inbox', 'unknown']),
  source: z.enum(['slash', 'nl']),
  input_len: z.number().int().nonnegative(),
});
export type AiAskPayload = z.infer<typeof AiAskSchema>;

export function trackAiAsk(payload: AiAskPayload): void {
  const parsed = AiAskSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] ai_ask invalid', parsed.error.issues); return; }
  // dual-emit: legacy + wave6 namespace
  fireGtag('ai_query', parsed.data as unknown as Record<string, unknown>);
  fireGtag('wave6.ai_ask', parsed.data as unknown as Record<string, unknown>);
}

export const TabSwitchSchema = z.object({
  from: z.string(),
  to: z.string(),
  trigger: z.enum(['manual', 'ai_ask']),
});
export type TabSwitchPayload = z.infer<typeof TabSwitchSchema>;

export function trackTabSwitch(payload: TabSwitchPayload): void {
  const parsed = TabSwitchSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] tab_switch invalid', parsed.error.issues); return; }
  fireGtag('rightpanel_tab_switch', parsed.data as unknown as Record<string, unknown>); // legacy
  fireGtag('wave6.tab_switch', parsed.data as unknown as Record<string, unknown>);
}

// ── decide_drawer_open (W-0403 PR7) ───────────────────────────────────────

export const DecideDrawerOpenSchema = z.object({
  verdict_id: z.string().optional(),
  trigger: z.enum(['jdg_tab_button', 'deeplink']),
});
export type DecideDrawerOpenPayload = z.infer<typeof DecideDrawerOpenSchema>;

export function trackDecideDrawerOpen(payload: DecideDrawerOpenPayload): void {
  const parsed = DecideDrawerOpenSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] decide_drawer_open invalid', parsed.error.issues); return; }
  fireGtag('decide_drawer_open', parsed.data as unknown as Record<string, unknown>);
  fireGtag('wave6.decide_drawer_open', parsed.data as unknown as Record<string, unknown>);
}

// ── panel_fold_toggle (W-0403 PR8) ────────────────────────────────────────

export const PanelFoldToggleSchema = z.object({
  panel: z.enum(['sidebar', 'ai', 'ai_wide', 'reset']),
  action: z.enum(['show', 'hide', 'toggle', 'reset']),
  trigger: z.enum(['keyboard', 'click']),
  key: z.string().optional(),
});
export type PanelFoldTogglePayload = z.infer<typeof PanelFoldToggleSchema>;

export function trackPanelFoldToggle(payload: PanelFoldTogglePayload): void {
  const parsed = PanelFoldToggleSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('[telemetry] panel_fold_toggle validation failed', parsed.error.issues);
    return;
  }
  // dual-emit: legacy + wave6 namespace
  fireGtag('panel_fold_toggle', parsed.data as unknown as Record<string, unknown>);
  fireGtag('wave6.panel_fold_toggle', parsed.data as unknown as Record<string, unknown>);
}

// ── inbox_dot_click (W-0403) ───────────────────────────────────────────────

export const InboxDotClickSchema = z.object({
  unread_count: z.number().int().nonnegative(),
  destination: z.literal('/cogochi?panel=vdt'),
});
export type InboxDotClickPayload = z.infer<typeof InboxDotClickSchema>;

export function trackInboxDotClick(unreadCount: number): void {
  const payload: InboxDotClickPayload = {
    unread_count: unreadCount,
    destination: '/cogochi?panel=vdt',
  };
  const parsed = InboxDotClickSchema.safeParse(payload);
  if (!parsed.success) {
    console.warn('[telemetry] inbox_dot_click validation failed', parsed.error.issues);
    return;
  }
  // dual-emit: legacy + wave6 namespace
  fireGtag('inbox_dot_click', parsed.data as unknown as Record<string, unknown>);
  fireGtag('wave6.inbox_dot_click', parsed.data as unknown as Record<string, unknown>);
}

// ── W-0561: Chart enterprise telemetry ────────────────────────────────────

export const ChartTfSwitchSchema = z.object({
  from_tf: z.string(),
  to_tf: z.string(),
  symbol: z.string(),
  trigger: z.enum(['click', 'keyboard']),
});
export type ChartTfSwitchPayload = z.infer<typeof ChartTfSwitchSchema>;

export function trackChartTfSwitch(payload: ChartTfSwitchPayload): void {
  const parsed = ChartTfSwitchSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] chart_tf_switch invalid', parsed.error.issues); return; }
  fireGtag('chart.tf_switch', parsed.data as unknown as Record<string, unknown>);
}

export const ChartTypeChangeSchema = z.object({
  from_type: z.enum(['candle', 'line', 'heikin', 'bar', 'area']),
  to_type: z.enum(['candle', 'line', 'heikin', 'bar', 'area']),
  symbol: z.string(),
});
export type ChartTypeChangePayload = z.infer<typeof ChartTypeChangeSchema>;

export function trackChartTypeChange(payload: ChartTypeChangePayload): void {
  const parsed = ChartTypeChangeSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] chart_type_change invalid', parsed.error.issues); return; }
  fireGtag('chart.type_change', parsed.data as unknown as Record<string, unknown>);
}

export const ChartIndicatorToggledSchema = z.object({
  indicator_key: z.string(),
  action: z.enum(['on', 'off']),
  source: z.enum(['quick_rail', 'catalog', 'toolbar']),
});
export type ChartIndicatorToggledPayload = z.infer<typeof ChartIndicatorToggledSchema>;

export function trackChartIndicatorToggled(payload: ChartIndicatorToggledPayload): void {
  const parsed = ChartIndicatorToggledSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] chart_indicator_toggled invalid', parsed.error.issues); return; }
  fireGtag('chart.indicator_toggled', parsed.data as unknown as Record<string, unknown>);
}

export const ChartFirstPaintSchema = z.object({
  symbol: z.string(),
  tf: z.string(),
  duration_ms: z.number().int().nonnegative(),
  kline_count: z.number().int().nonnegative(),
});
export type ChartFirstPaintPayload = z.infer<typeof ChartFirstPaintSchema>;

export function trackChartFirstPaint(payload: ChartFirstPaintPayload): void {
  const parsed = ChartFirstPaintSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] chart_first_paint invalid', parsed.error.issues); return; }
  fireGtag('chart.first_paint', parsed.data as unknown as Record<string, unknown>);
}

export const ChartCatalogOpenSchema = z.object({
  trigger: z.enum(['plus_button', 'keyboard']),
  indicator_count_before: z.number().int().nonnegative(),
});
export type ChartCatalogOpenPayload = z.infer<typeof ChartCatalogOpenSchema>;

export function trackChartCatalogOpen(payload: ChartCatalogOpenPayload): void {
  const parsed = ChartCatalogOpenSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] chart_catalog_open invalid', parsed.error.issues); return; }
  fireGtag('chart.catalog_open', parsed.data as unknown as Record<string, unknown>);
}

export const WatchlistSymbolClickSchema = z.object({
  symbol: z.string(),
  from_symbol: z.string().optional(),
  position_in_list: z.number().int().nonnegative().optional(),
});
export type WatchlistSymbolClickPayload = z.infer<typeof WatchlistSymbolClickSchema>;

export function trackWatchlistSymbolClick(payload: WatchlistSymbolClickPayload): void {
  const parsed = WatchlistSymbolClickSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] watchlist_symbol_click invalid', parsed.error.issues); return; }
  fireGtag('chart.watchlist_symbol_click', parsed.data as unknown as Record<string, unknown>);
}

export const WatchlistSearchSchema = z.object({
  query: z.string().max(20),
  results_count: z.number().int().nonnegative(),
});
export type WatchlistSearchPayload = z.infer<typeof WatchlistSearchSchema>;

export function trackWatchlistSearch(payload: WatchlistSearchPayload): void {
  const parsed = WatchlistSearchSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] watchlist_search invalid', parsed.error.issues); return; }
  fireGtag('chart.watchlist_search', parsed.data as unknown as Record<string, unknown>);
}

export const ChartFitContentSchema = z.object({
  trigger: z.enum(['button', 'keyboard']),
  tf: z.string(),
});
export type ChartFitContentPayload = z.infer<typeof ChartFitContentSchema>;

export function trackChartFitContent(payload: ChartFitContentPayload): void {
  const parsed = ChartFitContentSchema.safeParse(payload);
  if (!parsed.success) { console.warn('[telemetry] chart_fit_content invalid', parsed.error.issues); return; }
  fireGtag('chart.fit_content', parsed.data as unknown as Record<string, unknown>);
}
