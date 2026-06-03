/**
 * Supabase-backed pattern reads for SSR (`+page.server.ts`).
 *
 * W-0543 Phase B.2 — replaces engine `GET /patterns/states`,
 * `/patterns/transitions`, and `/patterns/{slug}/verdict` reads for the
 * pattern pages so they no longer block on a Cloud Run cold start.
 *
 * Why service_role? Tables `pattern_states`, `phase_transitions`, and
 * `pattern_verdicts` all have `service_role`-only RLS (see migration 089
 * and Supabase MCP migrations created by W-0488). The data is benign
 * (pattern aggregates) but the policy decision was made when those tables
 * were also used for write-through caching, so we read them with the admin
 * client from inside `+page.server.ts` only.
 *
 * Output contract:
 *   `fetchPatternStatesNested()` returns the nested `{ patterns: { slug: {
 *      symbol: state } } }` shape that `$lib/contracts.flattenPatternStates`
 *      already consumes, so callers do not need to change adapters.
 *   `fetchPhaseTransitions()` returns the flat `Transition[]` shape
 *      expected by `/patterns/+page.server.ts`.
 *   `fetchPatternVerdict()` returns the shape generated from the engine
 *      OpenAPI (`api__routes__patterns_verdicts__VerdictResponse`).
 */
import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';
import type { EnginePatternStatesResponse } from '$lib/contracts';
import type { PatternVerdict } from '$lib/types/patternVerdict';

// ── Row types (mirror migration 089 + Supabase MCP schemas) ──────────────────

interface PatternStateRow {
  symbol: string;
  pattern_slug: string;
  pattern_version: number | null;
  timeframe: string | null;
  current_phase: string;
  current_phase_idx: number;
  entered_at: string | null;
  bars_in_phase: number | null;
  last_eval_at: string | null;
  last_transition_id: string | null;
  active: boolean;
  invalidated: boolean | null;
  updated_at: string | null;
}

interface PhaseTransitionRow {
  transition_id: string;
  symbol: string;
  pattern_slug: string;
  pattern_version: number | null;
  timeframe: string | null;
  from_phase: string | null;
  to_phase: string;
  from_phase_idx: number | null;
  to_phase_idx: number | null;
  transition_kind: string | null;
  reason: string | null;
  transitioned_at: string | null;
  confidence: number | null;
}

interface PatternVerdictRow {
  pattern_slug: string;
  n_total_all: number | null;
  n_closed_all: number | null;
  n_wins_all: number | null;
  win_rate_all: number | null;
  ci95_lo_all: number | null;
  ci95_hi_all: number | null;
  avg_pnl_pct_all: number | null;
  avg_pnl_ci95_lo_all: number | null;
  avg_pnl_ci95_hi_all: number | null;
  n_total_90d: number | null;
  n_closed_90d: number | null;
  n_wins_90d: number | null;
  win_rate_90d: number | null;
  ci95_lo_90d: number | null;
  ci95_hi_90d: number | null;
  avg_pnl_pct_90d: number | null;
  avg_pnl_ci95_lo_90d: number | null;
  avg_pnl_ci95_hi_90d: number | null;
  confidence: string | null;
  last_computed_position_id: string | null;
  updated_at: string | null;
}

// ── Public readers ───────────────────────────────────────────────────────────

export interface FetchPatternStatesOptions {
  /** Only return rows where `active = true`. Defaults to `true`. */
  activeOnly?: boolean;
  /** Restrict to a single slug — used by `/patterns/[slug]`. */
  slug?: string;
}

/**
 * Returns the same nested-shape payload the engine API returns from
 * `GET /patterns/states`, so existing `flattenPatternStates()` adapters
 * keep working unchanged.
 */
export async function fetchPatternStatesNested(
  opts: FetchPatternStatesOptions = {},
): Promise<EnginePatternStatesResponse> {
  const supabase = getSupabaseAdmin();
  let q = supabase
    .from('pattern_states')
    .select(
      'symbol, pattern_slug, pattern_version, timeframe, current_phase, ' +
      'current_phase_idx, entered_at, bars_in_phase, last_eval_at, ' +
      'last_transition_id, active, invalidated, updated_at',
    );

  if (opts.activeOnly !== false) q = q.eq('active', true);
  if (opts.slug) q = q.eq('pattern_slug', opts.slug);

  const { data, error } = await q;
  if (error || !data) return { patterns: {} };

  return rowsToNestedStates(data as unknown as PatternStateRow[]);
}

export interface Transition {
  transition_id: string;
  symbol: string;
  pattern_slug: string;
  from_phase: string | null;
  to_phase: string;
  transition_kind: string;
  reason: string;
  transitioned_at: string | null;
  confidence: number;
}

export interface FetchTransitionsOptions {
  limit?: number;
  slug?: string;
}

export async function fetchPhaseTransitions(
  opts: FetchTransitionsOptions = {},
): Promise<Transition[]> {
  const limit = Math.max(1, Math.min(opts.limit ?? 30, 500));
  const supabase = getSupabaseAdmin();
  // Filter BEFORE order/limit — `.eq` is unavailable on the builder after the
  // ordering/limit terminals in the supabase-js fluent API.
  let q = supabase
    .from('phase_transitions')
    .select(
      'transition_id, symbol, pattern_slug, pattern_version, timeframe, ' +
      'from_phase, to_phase, from_phase_idx, to_phase_idx, transition_kind, ' +
      'reason, transitioned_at, confidence',
    );

  if (opts.slug) q = q.eq('pattern_slug', opts.slug);

  const { data, error } = await q
    .order('transitioned_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  return (data as unknown as PhaseTransitionRow[]).map(rowToTransition);
}

export async function fetchPatternVerdict(slug: string): Promise<PatternVerdict | null> {
  if (!slug) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('pattern_verdicts')
    .select(
      'pattern_slug, n_total_all, n_closed_all, n_wins_all, win_rate_all, ' +
      'ci95_lo_all, ci95_hi_all, avg_pnl_pct_all, avg_pnl_ci95_lo_all, ' +
      'avg_pnl_ci95_hi_all, n_total_90d, n_closed_90d, n_wins_90d, ' +
      'win_rate_90d, ci95_lo_90d, ci95_hi_90d, avg_pnl_pct_90d, ' +
      'avg_pnl_ci95_lo_90d, avg_pnl_ci95_hi_90d, confidence, ' +
      'last_computed_position_id, updated_at',
    )
    .eq('pattern_slug', slug)
    .maybeSingle();
  if (error || !data) return null;

  return rowToVerdict(data as unknown as PatternVerdictRow);
}

// ── Mappers ──────────────────────────────────────────────────────────────────

function rowsToNestedStates(rows: PatternStateRow[]): EnginePatternStatesResponse {
  // Mirror the engine's `{ patterns: { slug: { symbol: stateEntry } } }` map.
  const patterns: Record<string, Record<string, Record<string, unknown>>> = {};
  for (const row of rows) {
    if (!patterns[row.pattern_slug]) patterns[row.pattern_slug] = {};
    patterns[row.pattern_slug][row.symbol] = {
      phase_id:           row.current_phase,
      phase_idx:          row.current_phase_idx,
      phase_label:        row.current_phase,
      entered_at:         row.entered_at,
      bars_in_phase:      row.bars_in_phase ?? 0,
      max_bars:           0,
      progress_pct:       0,
      total_phases:       null,
      last_eval_at:       row.last_eval_at,
      pattern_version:    row.pattern_version ?? 1,
      timeframe:          row.timeframe,
      active:             row.active,
      invalidated:        row.invalidated ?? false,
      last_transition_id: row.last_transition_id,
    };
  }
  return { patterns };
}

function rowToTransition(row: PhaseTransitionRow): Transition {
  return {
    transition_id:   row.transition_id,
    symbol:          row.symbol,
    pattern_slug:    row.pattern_slug,
    from_phase:      row.from_phase,
    to_phase:        row.to_phase,
    transition_kind: row.transition_kind ?? '',
    reason:          row.reason ?? '',
    transitioned_at: row.transitioned_at,
    confidence:      typeof row.confidence === 'number' ? row.confidence : 0,
  };
}

function rowToVerdict(row: PatternVerdictRow): PatternVerdict {
  return {
    pattern_slug: row.pattern_slug,
    all: {
      n_total:          row.n_total_all   ?? 0,
      n_closed:         row.n_closed_all  ?? 0,
      n_wins:           row.n_wins_all    ?? 0,
      win_rate:         row.win_rate_all,
      ci95_lo:          row.ci95_lo_all,
      ci95_hi:          row.ci95_hi_all,
      avg_pnl_pct:      row.avg_pnl_pct_all,
      avg_pnl_ci95_lo:  row.avg_pnl_ci95_lo_all,
      avg_pnl_ci95_hi:  row.avg_pnl_ci95_hi_all,
    },
    last_90d: {
      n_total:          row.n_total_90d   ?? 0,
      n_closed:         row.n_closed_90d  ?? 0,
      n_wins:           row.n_wins_90d    ?? 0,
      win_rate:         row.win_rate_90d,
      ci95_lo:          row.ci95_lo_90d,
      ci95_hi:          row.ci95_hi_90d,
      avg_pnl_pct:      row.avg_pnl_pct_90d,
      avg_pnl_ci95_lo:  row.avg_pnl_ci95_lo_90d,
      avg_pnl_ci95_hi:  row.avg_pnl_ci95_hi_90d,
    },
    confidence: row.confidence ?? 'insufficient',
    last_computed_position_id: row.last_computed_position_id,
    updated_at: row.updated_at,
  } satisfies PatternVerdict;
}

/** Exposed for tests only. */
export const __test = {
  rowsToNestedStates,
  rowToTransition,
  rowToVerdict,
};
