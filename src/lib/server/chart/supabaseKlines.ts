/**
 * Supabase-backed kline reader for the chart series service.
 *
 * W-0543 Phase B.1 + Z2 — direct SELECT from `kline_1m` + `kline_5m`/
 * `kline_15m`/`kline_1h`/`kline_1d` materialized views (W-0543 Phase A.1).
 * The transitional `raw_binance_usdt_kline_1h` / `raw_kline_1d` fallback
 * is gated behind `CHART_SUPABASE_TRANSITIONAL_FALLBACK` (default
 * `true` — flip to `false` once the `kline_1m` backfill is complete and
 * `kline_1h` / `kline_1d` matviews are densely populated).
 *
 * Returns `KlineBar[]` shaped identically to the Binance-FAPI parser in
 * `chartSeriesService.ts`, so callers can swap data sources transparently.
 *
 * Returns `null` when the timeframe is not stored in Supabase — caller MUST
 * fall back to Binance FAPI for those (`3m`, `30m`, `2h`, `4h`, `6h`, `12h`,
 * `1w` etc.). Returns `[]` (empty array) when the timeframe is supported but
 * Supabase returned zero rows for the symbol/window.
 */
import { env } from '$env/dynamic/private';
import { getSupabaseAnon } from '$lib/server/supabaseAdmin';
import type { KlineBar } from '$lib/server/chart/chartSeriesService';

// ── Timeframe → source table mapping ──────────────────────────────────────
// Materialized views are refreshed by pg_cron at the cadence noted in
// migration 115; raw_* tables are kept as transitional sources gated behind
// `CHART_SUPABASE_TRANSITIONAL_FALLBACK` until backfill is verified.
type SourceTable =
  | 'kline_1m'
  | 'kline_5m'
  | 'kline_15m'
  | 'kline_1h'
  | 'kline_1d'
  | 'raw_binance_usdt_kline_1h'
  | 'raw_kline_1d';

const TF_TABLE_PRIMARY: Record<string, SourceTable> = {
  '1m':  'kline_1m',
  '5m':  'kline_5m',
  '15m': 'kline_15m',
  '1h':  'kline_1h',
  '1d':  'kline_1d',
};

// Transitional fallback: when the matview is empty (e.g. 1m backfill still
// in progress) we fall back to the legacy raw_* table that W-0527/W-0542
// populate. Gated behind `CHART_SUPABASE_TRANSITIONAL_FALLBACK`; setting
// it to `false` retires the fallback and surfaces matview gaps as hard
// empty responses (caller then falls back to Binance FAPI per the
// `KlineBar[] | null` contract).
const TF_TABLE_TRANSITIONAL: Partial<Record<string, SourceTable>> = {
  '1h': 'raw_binance_usdt_kline_1h',
  '1d': 'raw_kline_1d',
};

/**
 * `true` by default. Operators flip to `false` once
 * `tools/check_kline_coverage.py` confirms the matview row counts match
 * raw_* for the rolling 30-day window for every symbol in the universe.
 *
 * Reading via `$env/dynamic/private` so the value is re-evaluated per
 * request — handy when bouncing the flag in Vercel without a redeploy.
 */
function transitionalFallbackEnabled(): boolean {
  const raw = (env.CHART_SUPABASE_TRANSITIONAL_FALLBACK ?? 'true').trim().toLowerCase();
  return raw !== 'false' && raw !== '0' && raw !== 'off' && raw !== 'no';
}

const TF_MS: Record<string, number> = {
  '1m':  60_000,
  '5m':  5  * 60_000,
  '15m': 15 * 60_000,
  '1h':  3_600_000,
  '1d':  86_400_000,
};

interface KlineRow {
  ts: string;                                  // Postgres TIMESTAMPTZ → ISO string
  open:  number;
  high:  number;
  low:   number;
  close: number;
  volume_base: number | null;                  // matviews, kline_1m, raw_*
}

export interface SupabaseKlineFetchOpts {
  symbol: string;
  tf: string;
  limit: number;
  /** Cursor: fetch bars starting at this Unix-ms boundary (inclusive). */
  startTime?: number;
}

/**
 * Read up to `limit` klines from Supabase. Returns `null` when the timeframe
 * has no Supabase backing (caller falls back to Binance FAPI). Returns `[]`
 * when supported but no rows exist for the symbol/window.
 *
 * Output is sorted ASCENDING by time to match the Binance FAPI response
 * shape used downstream by `computeIndicators()`.
 */
export async function fetchKlinesFromSupabase(
  opts: SupabaseKlineFetchOpts,
): Promise<KlineBar[] | null> {
  const tf = opts.tf.trim().toLowerCase();
  const table = TF_TABLE_PRIMARY[tf];
  if (!table) return null;

  const symbol = opts.symbol.trim().toUpperCase();
  const limit = Math.max(1, Math.min(opts.limit, 1000));

  const primary = await readKlineTable(table, symbol, limit, opts.startTime, tf);
  if (primary.length > 0) return primary;

  // Matview may be empty during initial backfill — try the transitional raw_*
  // table for 1h / 1d. (1m / 5m / 15m have no transitional fallback.)
  // Gated behind CHART_SUPABASE_TRANSITIONAL_FALLBACK so production can
  // retire the fallback after the kline_1m backfill is verified.
  if (!transitionalFallbackEnabled()) return primary;
  const transitional = TF_TABLE_TRANSITIONAL[tf];
  if (!transitional) return primary;
  return readKlineTable(transitional, symbol, limit, opts.startTime, tf);
}

async function readKlineTable(
  table: SourceTable,
  symbol: string,
  limit: number,
  startTimeMs: number | undefined,
  tf: string,
): Promise<KlineBar[]> {
  const supabase = getSupabaseAnon();
  let q = supabase
    .from(table)
    .select('ts, open, high, low, close, volume_base')
    .eq('symbol', symbol);

  if (startTimeMs && Number.isFinite(startTimeMs)) {
    // Bound the window: [startTime, startTime + limit * tfMs).
    // Mirrors Binance FAPI's startTime/endTime semantics so cursor fetches
    // return contiguous slices, not the tail of all history.
    const tfMs = TF_MS[tf] ?? 60_000;
    const endTimeMs = startTimeMs + limit * tfMs;
    q = q
      .gte('ts', new Date(startTimeMs).toISOString())
      .lt('ts', new Date(endTimeMs).toISOString())
      .order('ts', { ascending: true })
      .limit(limit);
  } else {
    // Most-recent N bars. Pull DESC then reverse for the ASC output contract.
    q = q.order('ts', { ascending: false }).limit(limit);
  }

  const { data, error } = await q;
  if (error || !data) return [];

  const rows = (data as KlineRow[]).map(rowToBar);
  if (!startTimeMs) rows.reverse();
  return rows;
}

function rowToBar(row: KlineRow): KlineBar {
  // `volume` on the ChartPayload is base-asset volume. Matviews, kline_1m,
  // and the transitional raw_* tables all expose it as `volume_base`.
  return {
    time:  Math.floor(new Date(row.ts).getTime() / 1000),
    open:  Number(row.open),
    high:  Number(row.high),
    low:   Number(row.low),
    close: Number(row.close),
    volume: typeof row.volume_base === 'number' ? row.volume_base : 0,
  };
}

/** Exposed for tests. */
export const __test = {
  TF_TABLE_PRIMARY,
  TF_TABLE_TRANSITIONAL,
  rowToBar,
  transitionalFallbackEnabled,
};
