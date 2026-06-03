import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  type IndicatorConfig,
  DEFAULT_INDICATOR_CONFIG,
  loadIndicatorConfig,
  saveIndicatorConfig,
} from '$lib/types/indicatorConfig';

// URL searchParams에서 초기값 읽기
function getInitialTab(): string {
  if (!browser) return 'library';
  return new URLSearchParams(window.location.search).get('tab') ?? 'library';
}

export type PatternsTab = 'discover' | 'backtest' | 'journal' | 'research';

export const selectedSlug = writable<string | null>(null);
export const selectedTf = writable<'1h' | '4h' | '1d'>('1h');
export const rightPanelMode = writable<'status' | 'journal' | 'ai'>('status');
export const comparedSlugs = writable<string[]>([]); // Strategies 탭 multi-select, MAX=5
export const journalSection = writable<'closed' | 'decision' | 'hold' | 'sharpe' | 'analyze'>('closed');
export const researchSection = writable<'pipeline' | 'formula' | 'blocked' | 'forward' | 'buckets' | 'cycle' | 'battle' | 'ensemble' | 'import'>('pipeline');
export const backtestSection = writable<'metrics' | 'trades' | 'counterfactual'>('metrics');

// ── W-0488 v2: 4-tab IA shell additions ────────────────────────────────────
export const currentTab = writable<PatternsTab>('discover');
export const watchList = writable<string[]>([]);
export const aiDrawerOpen = writable<boolean>(false);
export const aiDrawerContext = writable<{ tab: PatternsTab; slug: string | null; toolHint?: string }>({
  tab: 'discover',
  slug: null,
});
export const continuousFinding = writable<{
  enabled: boolean;
  today_count: number;
  today_cap: number;
  month_cost_usd: number;
  month_cap_usd: number;
}>({
  enabled: false,
  today_count: 0,
  today_cap: 100,
  month_cost_usd: 0,
  month_cap_usd: 20,
});

export function toggleWatch(slug: string) {
  watchList.update((list) => (list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]));
}

// ── Indicator config (localStorage persistence) ────────────────────────────
export const indicatorConfig = writable<IndicatorConfig>(
  browser ? loadIndicatorConfig() : DEFAULT_INDICATOR_CONFIG
);

export function updateIndicatorConfig(patch: Partial<Omit<IndicatorConfig, 'version' | 'updated_at'>>) {
  indicatorConfig.update(cfg => {
    const next = { ...cfg, ...patch } as IndicatorConfig;
    saveIndicatorConfig(next);
    return next;
  });
}

export function resetIndicatorConfig() {
  const reset = { ...DEFAULT_INDICATOR_CONFIG, updated_at: new Date().toISOString() };
  indicatorConfig.set(reset);
  saveIndicatorConfig(reset);
}

// Strategies multi-select 헬퍼
export function toggleComparedSlug(slug: string) {
  comparedSlugs.update(slugs => {
    if (slugs.includes(slug)) return slugs.filter(s => s !== slug);
    if (slugs.length >= 5) return slugs; // MAX=5
    return [...slugs, slug];
  });
}

export function setSelectedSlug(slug: string | null) {
  selectedSlug.set(slug);
}

export interface ParamOverride { key: string; value: number | boolean; }
export const paramOverrides = writable<ParamOverride[]>([]);

export function setParamOverride(key: string, value: number | boolean) {
  paramOverrides.update(list => {
    const idx = list.findIndex(o => o.key === key);
    if (idx >= 0) { list[idx] = { key, value }; return [...list]; }
    return [...list, { key, value }];
  });
}

export function clearParamOverrides() {
  paramOverrides.set([]);
}

// suppress unused warning — getInitialTab available for future use
void getInitialTab;
