// W-0479 cycle deeplink — URL-driven cross-component handoff.
// TerminalHub onMount writes; ChartBoard / PatternsTerminalPanel read & consume.
//
// pendingChartTs: epoch seconds. ChartBoard consumes once chart is ready, then resets to null.
// selectedPatternSlug: slug for Right Rail PAT panel highlight. Persists across panel re-renders.

import { writable } from 'svelte/store';

export const pendingChartTs = writable<number | null>(null);
export const selectedPatternSlug = writable<string | null>(null);
