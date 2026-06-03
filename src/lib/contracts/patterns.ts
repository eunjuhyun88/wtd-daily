export interface EnginePatternCandidateRecord {
  symbol?: unknown;
  slug?: unknown;
  pattern_slug?: unknown;
  pattern_version?: unknown;
  phase?: unknown;
  phase_label?: unknown;
  timeframe?: unknown;
  transition_id?: unknown;
  candidate_transition_id?: unknown;
  scan_id?: unknown;
  trigger_bar_ts?: unknown;
  entered_at?: unknown;
  last_eval_at?: unknown;
  bars_in_phase?: unknown;
  confidence?: unknown;
  block_scores?: unknown;
  blocks_triggered?: unknown;
  feature_snapshot?: unknown;
  data_quality?: unknown;
  alert_mode?: unknown;
  alert_visible?: unknown;
  alert_reason?: unknown;
  entry_ml_state?: unknown;
  entry_p_win?: unknown;
  entry_threshold_passed?: unknown;
  entry_rollout_state?: unknown;
  entry_model_version?: unknown;
  [key: string]: unknown;
}

export interface EnginePatternCandidatesResponse {
  candidate_records?: unknown;
  candidate_records_by_pattern?: unknown;
  entry_candidates?: unknown;
  raw_entry_candidates?: unknown;
  total_count?: unknown;
  [key: string]: unknown;
}

export interface EnginePatternState {
  phase_id?: unknown;
  phase_idx?: unknown;
  phase_label?: unknown;
  timeframe?: unknown;
  trigger_bar_ts?: unknown;
  entered_at?: unknown;
  bars_in_phase?: unknown;
  max_bars?: unknown;
  progress_pct?: unknown;
  total_phases?: unknown;
  [key: string]: unknown;
}

export interface EnginePatternStatesResponse {
  patterns?: unknown;
  [key: string]: unknown;
}

export interface PatternCandidateView {
  symbol: string;
  patternId: string;
  patternSlug: string;
  patternVersion: number;
  phaseId: string;
  phaseLabel: string;
  timeframe: string;
  triggerBarTs: string | null;
  enteredAt: string | null;
  lastEvalAt: string | null;
  candidateTransitionId: string | null;
  transitionId: string | null;
  scanId: string | null;
  confidence: number | null;
  barsInPhase: number;
  blockScores: Record<string, unknown>;
  blocksTriggered: unknown[];
  featureSnapshot: Record<string, unknown> | null;
  indicatorSnapshot: Record<string, unknown> | null;
  alertVisible: boolean;
  alertReason: string | null;
  engine: EnginePatternCandidateRecord;
}

export interface PatternStateView {
  symbol: string;
  patternId: string;
  patternSlug: string;
  timeframe: string;
  triggerBarTs: string | null;
  phaseId: string;
  phaseIdx: number;
  phaseLabel: string;
  enteredAt: string | null;
  barsInPhase: number;
  maxBars: number;
  progressPct: number;
  totalPhases: number | null;
  engine: EnginePatternState;
}

export interface PatternMatchView {
  key: string;
  symbol: string;
  patternSlug: string;
  phaseId: string;
  phaseLabel: string;
  timeframe: string;
  triggerBarTs: string | null;
  enteredAt: string | null;
  lastEvalAt: string | null;
  candidateTransitionId: string | null;
  confidence: number | null;
  barsInPhase: number;
  progressPct: number | null;
  totalPhases: number | null;
  blockScores: Record<string, unknown>;
  blocksTriggered: string[];
  featureSnapshot: Record<string, unknown> | null;
  indicatorSnapshot: Record<string, unknown> | null;
  source: 'candidate' | 'state';
  engine: Record<string, unknown> | null;
}

export interface PhaseMeta {
  label: string;
  color: string;
}

export interface PatternCapturePayload {
  capture_kind: 'pattern_candidate';
  symbol: string;
  pattern_slug: string;
  pattern_version: number;
  phase: string;
  timeframe: string;
  candidate_transition_id: string | null;
  scan_id: string | null;
  feature_snapshot: Record<string, unknown> | null;
  block_scores: Record<string, unknown>;
}

const PHASE_META_BY_ID: Record<string, PhaseMeta> = {
  FAKE_DUMP: { label: 'FAKE DUMP', color: 'rgba(251,191,36,0.7)' },
  ARCH_ZONE: { label: 'ARCH ZONE', color: 'rgba(99,179,237,0.7)' },
  REAL_DUMP: { label: 'REAL DUMP', color: 'rgba(239,83,80,0.8)' },
  ACCUMULATION: { label: 'ACCUMULATION', color: 'rgba(38,166,154,1)' },
  BREAKOUT: { label: 'BREAKOUT', color: 'rgba(74,222,128,1)' },
};

const PHASE_META_BY_INDEX: Record<number, PhaseMeta> = {
  0: PHASE_META_BY_ID.FAKE_DUMP,
  1: PHASE_META_BY_ID.ARCH_ZONE,
  2: PHASE_META_BY_ID.REAL_DUMP,
  3: PHASE_META_BY_ID.ACCUMULATION,
  4: PHASE_META_BY_ID.BREAKOUT,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(n) ? n : null;
}

function asInteger(value: unknown, fallback: number): number {
  const n = asNumber(value);
  return n == null ? fallback : Math.trunc(n);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function phaseIdFrom(value: unknown, fallback = 'UNKNOWN'): string {
  const text = asString(value);
  if (text) return text;
  const n = asNumber(value);
  return n == null ? fallback : String(n);
}

function normalizePhaseId(value: string | null | undefined): string {
  return String(value ?? '').trim().toUpperCase();
}

function candidateRecords(payload: EnginePatternCandidatesResponse): EnginePatternCandidateRecord[] {
  if (Array.isArray(payload.candidate_records)) {
    return payload.candidate_records.filter((record) => asRecord(record) !== null) as EnginePatternCandidateRecord[];
  }

  const byPattern = asRecord(payload.candidate_records_by_pattern);
  if (!byPattern) return [];

  return Object.values(byPattern)
    .flatMap((records) => (Array.isArray(records) ? records : []))
    .filter((record) => asRecord(record) !== null) as EnginePatternCandidateRecord[];
}

export function phaseMetaFor(
  phaseId: string | null | undefined,
  phaseLabel?: string | null,
  phaseIdx?: number | null,
): PhaseMeta {
  const normalized = normalizePhaseId(phaseId);
  const meta = PHASE_META_BY_ID[normalized] ?? (phaseIdx != null ? PHASE_META_BY_INDEX[phaseIdx] : undefined);
  return {
    label: phaseLabel || meta?.label || phaseId || 'UNKNOWN',
    color: meta?.color ?? 'rgba(255,255,255,0.4)',
  };
}

export function adaptPatternCandidates(
  payload: EnginePatternCandidatesResponse,
  options: { visibleOnly?: boolean } = {},
): PatternCandidateView[] {
  const visibleOnly = options.visibleOnly ?? true;

  return candidateRecords(payload)
    .map((record) => {
      const patternSlug = asString(record.pattern_slug) ?? asString(record.slug) ?? '';
      const transitionId = asString(record.transition_id);
      const candidateTransitionId = asString(record.candidate_transition_id) ?? transitionId;
      const phaseId = phaseIdFrom(record.phase);
      const phaseLabel = asString(record.phase_label) ?? phaseId;
      const featureSnapshot = asRecord(record.feature_snapshot);
      const indicatorSnapshot = asRecord(record.indicator_snapshot);

      return {
        symbol: asString(record.symbol) ?? '',
        patternId: patternSlug,
        patternSlug,
        patternVersion: asInteger(record.pattern_version, 1),
        phaseId,
        phaseLabel,
        timeframe: asString(record.timeframe) ?? '1h',
        triggerBarTs: asString(record.trigger_bar_ts),
        enteredAt: asString(record.entered_at),
        lastEvalAt: asString(record.last_eval_at),
        candidateTransitionId,
        transitionId,
        scanId: asString(record.scan_id),
        confidence: asNumber(record.confidence),
        barsInPhase: asInteger(record.bars_in_phase, 0),
        blockScores: asRecord(record.block_scores) ?? {},
        blocksTriggered: asArray(record.blocks_triggered),
        featureSnapshot,
        indicatorSnapshot,
        alertVisible: record.alert_visible !== false,
        alertReason: asString(record.alert_reason),
        engine: record,
      } satisfies PatternCandidateView;
    })
    .filter((candidate) => candidate.symbol && candidate.patternSlug)
    .filter((candidate) => !visibleOnly || candidate.alertVisible);
}

export function flattenPatternStates(
  payload: EnginePatternStatesResponse,
  options: { includeInactive?: boolean } = {},
): PatternStateView[] {
  const patterns = asRecord(payload.patterns);
  if (!patterns) return [];

  const includeInactive = options.includeInactive ?? false;
  const rows: PatternStateView[] = [];

  for (const [patternSlug, symbolMap] of Object.entries(patterns)) {
    const symbols = asRecord(symbolMap);
    if (!symbols) continue;

    for (const [symbol, rawState] of Object.entries(symbols)) {
      const state = asRecord(rawState) as EnginePatternState | null;
      if (!state) continue;

      const phaseIdx = asInteger(state.phase_idx, -1);
      if (!includeInactive && phaseIdx < 0) continue;
      const phaseId = phaseIdFrom(state.phase_id);
      rows.push({
        symbol,
        patternId: patternSlug,
        patternSlug,
        timeframe: asString(state.timeframe) ?? '1h',
        triggerBarTs: asString(state.trigger_bar_ts),
        phaseId,
        phaseIdx,
        phaseLabel: asString(state.phase_label) ?? phaseId,
        enteredAt: asString(state.entered_at),
        barsInPhase: asInteger(state.bars_in_phase, 0),
        maxBars: asInteger(state.max_bars, 0),
        progressPct: asNumber(state.progress_pct) ?? 0,
        totalPhases: asNumber(state.total_phases),
        engine: state,
      });
    }
  }

  return rows;
}

export function isBreakoutPhase(state: Pick<PatternStateView, 'phaseId'>): boolean {
  return normalizePhaseId(state.phaseId) === 'BREAKOUT';
}

function phaseRank(phaseId: string): number {
  switch (normalizePhaseId(phaseId)) {
    case 'BREAKOUT': return 5;
    case 'ACCUMULATION': return 4;
    case 'REAL_DUMP': return 3;
    case 'ARCH_ZONE': return 2;
    case 'FAKE_DUMP': return 1;
    default: return 0;
  }
}

function asStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
    .filter((item) => item.length > 0);
}

function isoMs(value: string | null): number {
  if (!value) return 0;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : 0;
}

export function buildPatternMatches(
  patternSlug: string,
  candidates: PatternCandidateView[],
  states: PatternStateView[],
): PatternMatchView[] {
  if (!patternSlug) return [];

  const stateBySymbol = new Map(
    states
      .filter((state) => state.patternSlug === patternSlug)
      .map((state) => [state.symbol, state] as const),
  );
  const candidateBySymbol = new Map(
    candidates
      .filter((candidate) => candidate.patternSlug === patternSlug)
      .map((candidate) => [candidate.symbol, candidate] as const),
  );

  const symbols = new Set<string>([
    ...candidateBySymbol.keys(),
    ...stateBySymbol.keys(),
  ]);

  const matches: PatternMatchView[] = [];

  for (const symbol of symbols) {
    const candidate = candidateBySymbol.get(symbol);
    const state = stateBySymbol.get(symbol);

    if (candidate) {
      matches.push({
        key: `${patternSlug}:${symbol}:${candidate.candidateTransitionId ?? candidate.phaseId}:candidate`,
        symbol,
        patternSlug,
        phaseId: candidate.phaseId,
        phaseLabel: candidate.phaseLabel,
        timeframe: candidate.timeframe,
        triggerBarTs: candidate.triggerBarTs,
        enteredAt: candidate.enteredAt ?? state?.enteredAt ?? null,
        lastEvalAt: candidate.lastEvalAt,
        candidateTransitionId: candidate.candidateTransitionId,
        confidence: candidate.confidence,
        barsInPhase: candidate.barsInPhase,
        progressPct: state?.progressPct ?? null,
        totalPhases: state?.totalPhases ?? null,
        blockScores: candidate.blockScores,
        blocksTriggered: asStringArray(candidate.blocksTriggered),
        featureSnapshot: candidate.featureSnapshot,
        indicatorSnapshot: candidate.indicatorSnapshot,
        source: 'candidate',
        engine: candidate.engine as Record<string, unknown>,
      });
      continue;
    }

    if (!state) continue;
    matches.push({
      key: `${patternSlug}:${symbol}:${state.phaseId}:state`,
      symbol,
      patternSlug,
      phaseId: state.phaseId,
      phaseLabel: state.phaseLabel,
      timeframe: state.timeframe,
      triggerBarTs: state.triggerBarTs,
      enteredAt: state.enteredAt,
      lastEvalAt: asString((state.engine as Record<string, unknown>).last_eval_at),
      candidateTransitionId: null,
      confidence: null,
      barsInPhase: state.barsInPhase,
      progressPct: state.progressPct,
      totalPhases: state.totalPhases,
      blockScores: {},
      blocksTriggered: [],
      featureSnapshot: null,
      indicatorSnapshot: null,
      source: 'state',
      engine: state.engine as Record<string, unknown>,
    });
  }

  return matches.sort((a, b) => {
    const phaseDelta = phaseRank(b.phaseId) - phaseRank(a.phaseId);
    if (phaseDelta !== 0) return phaseDelta;
    const confDelta = (b.confidence ?? -1) - (a.confidence ?? -1);
    if (confDelta !== 0) return confDelta;
    const evalDelta = isoMs(b.lastEvalAt) - isoMs(a.lastEvalAt);
    if (evalDelta !== 0) return evalDelta;
    return isoMs(b.enteredAt) - isoMs(a.enteredAt);
  });
}

export function patternCapturePayload(candidate: PatternCandidateView): PatternCapturePayload {
  return {
    capture_kind: 'pattern_candidate',
    symbol: candidate.symbol,
    pattern_slug: candidate.patternSlug,
    pattern_version: candidate.patternVersion,
    phase: candidate.phaseId,
    timeframe: candidate.timeframe,
    candidate_transition_id: candidate.candidateTransitionId,
    scan_id: candidate.scanId,
    feature_snapshot: candidate.featureSnapshot,
    block_scores: candidate.blockScores,
  };
}
