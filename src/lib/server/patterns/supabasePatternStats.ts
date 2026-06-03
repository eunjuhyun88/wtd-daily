import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';
import type { PatternStats } from '$lib/types/patternStats';

interface PatternVerdictStatsRow {
  pattern_slug: string;
  n_total_all: number | null;
  n_closed_all: number | null;
  n_wins_all: number | null;
  win_rate_all: number | null;
  avg_pnl_pct_all: number | null;
  n_total_90d: number | null;
  win_rate_90d: number | null;
  updated_at: string | null;
}

interface SupabaseStatsResult {
  data: unknown[] | null;
  error: unknown;
}

function timeoutResult(ms: number): Promise<SupabaseStatsResult> {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data: null, error: new Error('pattern verdict stats timeout') }), ms);
  });
}

function rowToPatternStats(row: PatternVerdictStatsRow): PatternStats {
  const total = row.n_total_all ?? 0;
  const closed = row.n_closed_all ?? total;
  const wins = row.n_wins_all ?? 0;
  return {
    pattern_slug: row.pattern_slug,
    total_instances: total,
    success_count: wins,
    failure_count: Math.max(0, closed - wins),
    pending_count: Math.max(0, total - closed),
    hit_rate: row.win_rate_all,
    avg_gain_pct: row.avg_pnl_pct_all,
    avg_loss_pct: null,
    expected_value: row.avg_pnl_pct_all,
    btc_conditional: null,
    decay_direction: null,
    recent_30d_count: row.n_total_90d ?? 0,
    recent_30d_success_rate: row.win_rate_90d,
    ml_shadow: null,
    model_status: null,
  };
}

export async function fetchPatternStatsFromVerdicts(limit = 500): Promise<PatternStats[]> {
  try {
    const supabase = getSupabaseAdmin();
    const query = supabase
      .from('pattern_verdicts')
      .select(
        'pattern_slug, n_total_all, n_closed_all, n_wins_all, win_rate_all, ' +
        'avg_pnl_pct_all, n_total_90d, win_rate_90d, updated_at',
      )
      .order('updated_at', { ascending: false })
      .limit(Math.max(1, Math.min(limit, 1000))) as PromiseLike<SupabaseStatsResult>;

    const { data, error } = await Promise.race([query, timeoutResult(1_500)]);

    if (error || !data) return [];
    return (data as unknown as PatternVerdictStatsRow[])
      .filter((row) => typeof row.pattern_slug === 'string' && row.pattern_slug.length > 0)
      .map(rowToPatternStats);
  } catch {
    return [];
  }
}
