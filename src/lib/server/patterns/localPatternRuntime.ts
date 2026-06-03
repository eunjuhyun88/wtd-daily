import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { PnLStats } from '$lib/types/pnlStats';
import type { PatternStats } from '$lib/types/patternStats';

interface PatternStateRow {
  symbol: string;
  pattern_slug: string;
  pattern_version: number;
  timeframe: string;
  current_phase: string;
  current_phase_idx: number;
  entered_at: number | null;
  bars_in_phase: number;
  last_eval_at: number | null;
  last_transition_id: string | null;
  updated_at: number;
}

interface EntryKeyCache {
  mtimeMs: number;
  counts: Map<string, number>;
}

interface RuntimeRowsCache {
  expiresAt: number;
  rows: PatternStateRow[];
}

interface PatternTransitionRow {
  transition_id: string;
  symbol: string;
  pattern_slug: string;
  pattern_version: number;
  timeframe: string;
  from_phase: string | null;
  to_phase: string;
  from_phase_idx: number | null;
  to_phase_idx: number;
  transition_kind: string;
  reason: string;
  transitioned_at: number;
  trigger_bar_ts: number | null;
  scan_id: string | null;
  confidence: number | null;
  block_scores_json: string;
  blocks_triggered_json: string;
  feature_snapshot_json: string | null;
  data_quality_json: string | null;
}

interface RuntimeTransitionsCache {
  expiresAt: number;
  rows: PatternTransitionRow[];
}

interface LedgerStatsCache {
  expiresAt: number;
  stats: PatternStats[];
}

interface LedgerPnlStatsCacheEntry {
  expiresAt: number;
  stats: PnLStats;
}

interface LedgerAccumulator {
  entries: number;
  closed: number;
  wins: number;
  losses: number;
  pending: number;
  gainSum: number;
  gainCount: number;
  lossSum: number;
  lossCount: number;
  returnSum: number;
  returnCount: number;
  recentClosed: number;
  recentWins: number;
}

const cwd = process.cwd();
const repoRoot = path.basename(cwd) === 'app' ? path.dirname(cwd) : cwd;
const entryKeysPath = path.join(repoRoot, 'engine', 'data', 'pattern_entry_keys.json');
const runtimeDbPath = path.join(repoRoot, 'engine', 'state', 'pattern_runtime.sqlite');
const ledgerRecordsPath = path.join(repoRoot, 'engine', 'ledger_data');

let entryKeyCache: EntryKeyCache | null = null;
let runtimeRowsCache: RuntimeRowsCache | null = null;
let runtimeTransitionsCache: RuntimeTransitionsCache | null = null;
let ledgerStatsCache: LedgerStatsCache | null = null;
const ledgerPnlStatsCache = new Map<string, LedgerPnlStatsCacheEntry>();

function msToIso(value: number | string | null | undefined): string | null {
  const ms = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  try {
    return new Date(ms).toISOString();
  } catch {
    return null;
  }
}

function readEntryKeyCounts(): Map<string, number> {
  try {
    if (!existsSync(entryKeysPath)) return new Map();
    const mtimeMs = statSync(entryKeysPath).mtimeMs;
    if (entryKeyCache && entryKeyCache.mtimeMs === mtimeMs) {
      return new Map(entryKeyCache.counts);
    }

    const body = JSON.parse(readFileSync(entryKeysPath, 'utf8')) as { keys?: unknown };
    const counts = new Map<string, number>();
    if (Array.isArray(body.keys)) {
      for (const raw of body.keys) {
        if (typeof raw !== 'string') continue;
        const slug = raw.split(':', 1)[0];
        if (!slug) continue;
        counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
    }

    entryKeyCache = { mtimeMs, counts };
    return new Map(counts);
  } catch {
    return new Map();
  }
}

function withRuntimeDb<T>(fn: (db: DatabaseSync) => T): T | null {
  if (!existsSync(runtimeDbPath)) return null;
  let db: DatabaseSync | null = null;
  try {
    db = new DatabaseSync(runtimeDbPath, { readOnly: true });
    return fn(db);
  } catch {
    return null;
  } finally {
    db?.close();
  }
}

function readRuntimeRows(): PatternStateRow[] {
  const now = Date.now();
  if (runtimeRowsCache && runtimeRowsCache.expiresAt > now) {
    return runtimeRowsCache.rows;
  }

  const rows = withRuntimeDb((db) => {
    return db.prepare(`
      SELECT
        symbol,
        pattern_slug,
        pattern_version,
        timeframe,
        current_phase,
        current_phase_idx,
        entered_at,
        bars_in_phase,
        last_eval_at,
        last_transition_id,
        updated_at
      FROM pattern_states
      WHERE active = 1
        AND invalidated = 0
        AND current_phase_idx >= 1
      ORDER BY current_phase_idx DESC, updated_at DESC
      LIMIT 5000
    `).all() as unknown as PatternStateRow[];
  }) ?? [];

  runtimeRowsCache = { rows, expiresAt: now + 2_000 };
  return rows;
}

function readLatestTransitions(): PatternTransitionRow[] {
  const now = Date.now();
  if (runtimeTransitionsCache && runtimeTransitionsCache.expiresAt > now) {
    return runtimeTransitionsCache.rows;
  }

  const rows = withRuntimeDb((db) => {
    return db.prepare(`
      WITH ranked AS (
        SELECT
          transition_id,
          symbol,
          pattern_slug,
          pattern_version,
          timeframe,
          from_phase,
          to_phase,
          from_phase_idx,
          to_phase_idx,
          transition_kind,
          reason,
          transitioned_at,
          trigger_bar_ts,
          scan_id,
          confidence,
          block_scores_json,
          blocks_triggered_json,
          feature_snapshot_json,
          data_quality_json,
          ROW_NUMBER() OVER (
            PARTITION BY symbol, pattern_slug, timeframe
            ORDER BY transitioned_at DESC
          ) AS row_num
        FROM phase_transitions
      )
      SELECT
        transition_id,
        symbol,
        pattern_slug,
        pattern_version,
        timeframe,
        from_phase,
        to_phase,
        from_phase_idx,
        to_phase_idx,
        transition_kind,
        reason,
        transitioned_at,
        trigger_bar_ts,
        scan_id,
        confidence,
        block_scores_json,
        blocks_triggered_json,
        feature_snapshot_json,
        data_quality_json
      FROM ranked
      WHERE row_num = 1
    `).all() as unknown as PatternTransitionRow[];
  }) ?? [];

  runtimeTransitionsCache = { rows, expiresAt: now + 2_000 };
  return rows;
}

function readRuntimeSlugs(): Set<string> {
  return new Set(readRuntimeRows().map((row) => row.pattern_slug).filter(Boolean));
}

function createLedgerAccumulator(entries = 0): LedgerAccumulator {
  return {
    entries,
    closed: 0,
    wins: 0,
    losses: 0,
    pending: entries,
    gainSum: 0,
    gainCount: 0,
    lossSum: 0,
    lossCount: 0,
    returnSum: 0,
    returnCount: 0,
    recentClosed: 0,
    recentWins: 0,
  };
}

function asNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

function emptyPnlStats(pattern_slug: string): PnLStats {
  return {
    pattern_slug,
    n: 0,
    mean_pnl_bps: null,
    std_pnl_bps: null,
    sharpe_like: null,
    win_rate: null,
    loss_rate: null,
    indeterminate_rate: null,
    ci_low: null,
    ci_high: null,
    preliminary: true,
    btc_hold_return_pct: null,
    equity_curve: [],
  };
}

function normalizeReturnFraction(value: unknown): number | null {
  const raw = asNumber(value);
  if (raw == null) return null;
  return Math.abs(raw) > 1 ? raw / 100 : raw;
}

function toPnlBps(record: Record<string, unknown>, payload: Record<string, unknown>): number | null {
  const directBps = asNumber(payload.pnl_bps_net ?? record.pnl_bps_net);
  if (directBps != null) return directBps;

  const pctNet = normalizeReturnFraction(payload.pnl_pct_net ?? record.pnl_pct_net);
  if (pctNet != null) return pctNet * 10_000;

  const exitReturn = normalizeReturnFraction(payload.exit_return_pct ?? record.exit_return_pct);
  if (exitReturn != null) return exitReturn * 10_000;

  return null;
}

function ledgerSampleTs(record: Record<string, unknown>, payload: Record<string, unknown>): string | null {
  const value = payload.created_at
    ?? record.created_at
    ?? payload.breakout_at
    ?? record.breakout_at
    ?? payload.invalidated_at
    ?? record.invalidated_at
    ?? payload.accumulation_at
    ?? record.accumulation_at;
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function pnlVerdict(
  record: Record<string, unknown>,
  payload: Record<string, unknown>,
  pnlBps: number,
): 'WIN' | 'LOSS' | 'INDETERMINATE' {
  const explicit = payload.pnl_verdict ?? record.pnl_verdict;
  if (typeof explicit === 'string') {
    const normalized = explicit.trim().toUpperCase();
    if (normalized === 'WIN' || normalized === 'LOSS' || normalized === 'INDETERMINATE') {
      return normalized;
    }
  }

  if (pnlBps > 0) return 'WIN';
  if (pnlBps < 0) return 'LOSS';

  const outcome = String(payload.outcome ?? record.outcome ?? '').trim().toLowerCase();
  if (outcome === 'success') return 'WIN';
  if (outcome === 'failure') return 'LOSS';
  return 'INDETERMINATE';
}

function parseLedgerRecord(body: string): Record<string, unknown> | null {
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    try {
      return JSON.parse(body.replace(/\bNaN\b/g, 'null')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function parseJsonRecord(body: string | null | undefined): Record<string, unknown> | null {
  if (!body) return null;
  const parsed = parseLedgerRecord(body);
  if (!parsed || Array.isArray(parsed)) return null;
  return parsed;
}

function parseJsonArray(body: string | null | undefined): unknown[] {
  if (!body) return [];
  try {
    const parsed = JSON.parse(body.replace(/\bNaN\b/g, 'null')) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readLocalLedgerStats(): PatternStats[] {
  const now = Date.now();
  if (ledgerStatsCache && ledgerStatsCache.expiresAt > now) return ledgerStatsCache.stats;

  const bySlug = new Map<string, LedgerAccumulator>();
  const entryCounts = readEntryKeyCounts();
  for (const [slug, count] of entryCounts) {
    bySlug.set(slug, createLedgerAccumulator(count));
  }

  try {
    if (!existsSync(ledgerRecordsPath)) return [];
    const recentCutoff = now - 30 * 24 * 60 * 60 * 1000;

    for (const dir of readdirSync(ledgerRecordsPath, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const dirPath = path.join(ledgerRecordsPath, dir.name);

      for (const file of readdirSync(dirPath, { withFileTypes: true })) {
        if (!file.isFile() || !file.name.endsWith('.json')) continue;
        try {
          const body = readFileSync(path.join(dirPath, file.name), 'utf8');
          if (!body.includes('"outcome"')) continue;
          const record = parseLedgerRecord(body) as {
            record_type?: unknown;
            pattern_slug?: unknown;
            created_at?: unknown;
            outcome?: unknown;
            accumulation_at?: unknown;
            breakout_at?: unknown;
            invalidated_at?: unknown;
            max_gain_pct?: unknown;
            exit_return_pct?: unknown;
            payload?: Record<string, unknown>;
          } | null;
          if (!record) continue;
          const slug = typeof record.pattern_slug === 'string' && record.pattern_slug ? record.pattern_slug : dir.name;
          const acc = bySlug.get(slug) ?? createLedgerAccumulator();
          bySlug.set(slug, acc);

          const payload = record.payload ?? (record as Record<string, unknown>);
          const outcome = String(payload.outcome ?? '');
          const won = outcome === 'success';
          const closed = outcome === 'success' || outcome === 'failure' || outcome === 'timeout';
          if (!closed) continue;

          acc.closed += 1;
          acc.pending = Math.max(0, acc.pending - 1);
          if (won) acc.wins += 1;
          else acc.losses += 1;

          const createdAt = record.created_at ?? record.accumulation_at ?? record.breakout_at ?? record.invalidated_at;
          const createdMs = typeof createdAt === 'string' ? new Date(createdAt).getTime() : NaN;
          if (Number.isFinite(createdMs) && createdMs >= recentCutoff) {
            acc.recentClosed += 1;
            if (won) acc.recentWins += 1;
          }

          const maxGain = asNumber(payload.max_gain_pct);
          if (won && maxGain != null) {
            acc.gainSum += maxGain;
            acc.gainCount += 1;
          }

          const exitReturn = normalizeReturnFraction(payload.exit_return_pct);
          if (exitReturn != null) {
            acc.returnSum += exitReturn;
            acc.returnCount += 1;
            if (!won) {
              acc.lossSum += exitReturn;
              acc.lossCount += 1;
            }
          }
        } catch {
          // Skip malformed ledger rows; this is a best-effort local fallback.
        }
      }
    }
  } catch {
    return [];
  }

  const stats = [...bySlug.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pattern_slug, acc]) => {
      const total = Math.max(acc.entries, acc.closed + acc.pending);
      return {
        pattern_slug,
        total_instances: total,
        success_count: acc.wins,
        failure_count: acc.losses,
        pending_count: Math.max(0, total - acc.closed),
        hit_rate: acc.closed > 0 ? acc.wins / acc.closed : null,
        avg_gain_pct: acc.gainCount > 0 ? acc.gainSum / acc.gainCount : null,
        avg_loss_pct: acc.lossCount > 0 ? acc.lossSum / acc.lossCount : null,
        expected_value: acc.returnCount > 0 ? acc.returnSum / acc.returnCount : null,
        btc_conditional: null,
        decay_direction: null,
        recent_30d_count: acc.recentClosed,
        recent_30d_success_rate: acc.recentClosed > 0 ? acc.recentWins / acc.recentClosed : null,
        ml_shadow: null,
        model_status: null,
      } satisfies PatternStats;
    });

  ledgerStatsCache = { stats, expiresAt: now + 30_000 };
  return stats;
}

export function readLocalPatternLibrary(): {
  patterns: Array<{ slug: string; name: string | null; timeframe: string | null; n_phases: number | null }>;
  ok: boolean;
  source: string;
} {
  const slugs = new Set<string>([
    ...readEntryKeyCounts().keys(),
    ...readRuntimeSlugs(),
  ]);

  const patterns = [...slugs]
    .sort()
    .map((slug) => ({
      slug,
      name: null,
      timeframe: '1h',
      n_phases: null,
    }));

  return { patterns, ok: patterns.length > 0, source: 'local-runtime' };
}

export function readLocalPatternStates(): {
  patterns: Record<string, Record<string, Record<string, unknown>>>;
  ok: boolean;
  source: string;
} {
  const patterns: Record<string, Record<string, Record<string, unknown>>> = {};

  for (const row of readRuntimeRows()) {
    patterns[row.pattern_slug] ??= {};
    patterns[row.pattern_slug][row.symbol] = {
      phase_id: row.current_phase,
      phase_idx: row.current_phase_idx,
      phase_label: row.current_phase,
      entered_at: msToIso(row.entered_at),
      bars_in_phase: row.bars_in_phase,
      max_bars: 0,
      progress_pct: 0,
      total_phases: null,
      pattern_version: row.pattern_version,
      timeframe: row.timeframe,
      last_eval_at: msToIso(row.last_eval_at),
      last_transition_id: row.last_transition_id,
      updated_at: msToIso(row.updated_at),
    };
  }

  return { patterns, ok: Object.keys(patterns).length > 0, source: 'local-runtime' };
}

export function readLocalPatternCandidates(): {
  candidate_records: Array<Record<string, unknown>>;
  total_count: number;
  ok: boolean;
  source: string;
} {
  const latestTransitions = new Map(
    readLatestTransitions().map((transition) => [
      `${transition.symbol}:${transition.pattern_slug}:${transition.timeframe}`,
      transition,
    ] as const),
  );

  const candidate_records = readRuntimeRows().map((row) => {
    const transition = latestTransitions.get(`${row.symbol}:${row.pattern_slug}:${row.timeframe}`);
    const featureSnapshot = parseJsonRecord(transition?.feature_snapshot_json);

    return {
      symbol: row.symbol,
      pattern_slug: row.pattern_slug,
      pattern_version: row.pattern_version,
      timeframe: row.timeframe,
      phase: row.current_phase,
      phase_label: row.current_phase,
      transition_id: transition?.transition_id ?? row.last_transition_id,
      candidate_transition_id: transition?.transition_id ?? row.last_transition_id,
      scan_id: transition?.scan_id ?? null,
      entered_at: msToIso(row.entered_at),
      last_eval_at: msToIso(row.last_eval_at),
      bars_in_phase: row.bars_in_phase,
      confidence: transition?.confidence ?? null,
      block_scores: parseJsonRecord(transition?.block_scores_json) ?? {},
      blocks_triggered: parseJsonArray(transition?.blocks_triggered_json),
      feature_snapshot: featureSnapshot,
      indicator_snapshot: featureSnapshot,
      data_quality: parseJsonRecord(transition?.data_quality_json),
      alert_mode: 'local-runtime',
      alert_visible: true,
      alert_reason: transition?.reason ?? 'engine unavailable; using local runtime snapshot',
      transition_kind: transition?.transition_kind ?? null,
      transitioned_at: msToIso(transition?.transitioned_at),
      from_phase: transition?.from_phase ?? null,
      to_phase: transition?.to_phase ?? row.current_phase,
    };
  });

  return {
    candidate_records,
    total_count: candidate_records.length,
    ok: candidate_records.length > 0,
    source: 'local-runtime',
  };
}

export function readLocalPatternStats(): PatternStats[] {
  const ledgerStats = readLocalLedgerStats();
  if (ledgerStats.length > 0) return ledgerStats;

  return [...readEntryKeyCounts()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pattern_slug, count]) => ({
      pattern_slug,
      total_instances: count,
      success_count: 0,
      failure_count: 0,
      pending_count: count,
      hit_rate: null,
      avg_gain_pct: null,
      avg_loss_pct: null,
      expected_value: null,
      btc_conditional: null,
      decay_direction: null,
      recent_30d_count: 0,
      recent_30d_success_rate: null,
      ml_shadow: null,
      model_status: null,
    }));
}

export function readLocalPatternPnlStats(patternSlug: string): PnLStats {
  const now = Date.now();
  const cached = ledgerPnlStatsCache.get(patternSlug);
  if (cached && cached.expiresAt > now) return cached.stats;

  const empty = emptyPnlStats(patternSlug);
  const dirPath = path.join(ledgerRecordsPath, patternSlug);
  if (!existsSync(dirPath)) {
    ledgerPnlStatsCache.set(patternSlug, { stats: empty, expiresAt: now + 30_000 });
    return empty;
  }

  const samples: Array<{
    ts: string;
    pnlBps: number;
    verdict: 'WIN' | 'LOSS' | 'INDETERMINATE';
  }> = [];

  try {
    for (const file of readdirSync(dirPath, { withFileTypes: true })) {
      if (!file.isFile() || !file.name.endsWith('.json') || file.name.startsWith('_')) continue;
      const body = readFileSync(path.join(dirPath, file.name), 'utf8');
      const record = parseLedgerRecord(body);
      if (!record || Array.isArray(record)) continue;

      const payload = (record.payload && typeof record.payload === 'object' && !Array.isArray(record.payload))
        ? record.payload as Record<string, unknown>
        : record;
      const pnlBps = toPnlBps(record, payload);
      const ts = ledgerSampleTs(record, payload);
      if (pnlBps == null || !ts) continue;

      samples.push({
        ts,
        pnlBps,
        verdict: pnlVerdict(record, payload, pnlBps),
      });
    }
  } catch {
    ledgerPnlStatsCache.set(patternSlug, { stats: empty, expiresAt: now + 30_000 });
    return empty;
  }

  if (samples.length === 0) {
    ledgerPnlStatsCache.set(patternSlug, { stats: empty, expiresAt: now + 30_000 });
    return empty;
  }

  samples.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());
  const pnlSeries = samples.map((sample) => sample.pnlBps);
  const n = pnlSeries.length;
  const mean = pnlSeries.reduce((sum, value) => sum + value, 0) / n;
  const variance = n > 1
    ? pnlSeries.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (n - 1)
    : 0;
  const std = Math.sqrt(variance);
  const wins = samples.filter((sample) => sample.verdict === 'WIN').length;
  const losses = samples.filter((sample) => sample.verdict === 'LOSS').length;
  const indeterminate = n - wins - losses;

  let cumulative = 0;
  const stats: PnLStats = {
    pattern_slug: patternSlug,
    n,
    mean_pnl_bps: mean,
    std_pnl_bps: std,
    sharpe_like: std > 0 ? mean / std : null,
    win_rate: wins / n,
    loss_rate: losses / n,
    indeterminate_rate: indeterminate / n,
    ci_low: null,
    ci_high: null,
    preliminary: n < 30,
    btc_hold_return_pct: null,
    equity_curve: samples.map((sample) => {
      cumulative += sample.pnlBps;
      return {
        ts: sample.ts,
        cumulative_pnl_bps: cumulative,
      };
    }),
  };

  if (n >= 30) {
    const se = std / Math.sqrt(n);
    stats.ci_low = mean - 1.96 * se;
    stats.ci_high = mean + 1.96 * se;
  }

  ledgerPnlStatsCache.set(patternSlug, { stats, expiresAt: now + 30_000 });
  return stats;
}
