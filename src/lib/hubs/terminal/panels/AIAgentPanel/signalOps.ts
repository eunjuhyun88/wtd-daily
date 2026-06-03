import { flattenPatternStates, type PatternStateView } from '$lib/contracts/patterns';

export type SignalAction = 'HOLD' | 'PARTIAL_TP' | 'TIGHT_SL' | 'ADD_POSITION' | 'CUT_LOSS' | 'WATCH';
export type SignalScenario = 'LONG' | 'SHORT' | 'NEUTRAL';
export type PositionSide = 'long' | 'short';

export interface SignalOpsCard {
  id: string;
  symbol: string;
  timeframe: string;
  patternSlug: string;
  phase: string;
  scenario: SignalScenario;
  score: number;
  urgency: 'LOW' | 'MID' | 'HIGH';
  confidence: number;
  action: SignalAction;
  alignmentScore: number;
  channel: string;
  tags: string[];
  traceId: string;
  metrics: Array<{ label: string; value: string; hint?: string }>;
  domainScores: Array<{ id: string; label: string; score: number; max: number }>;
  reasons: string[];
  invalidation: string;
  state: PatternStateView | null;
}

export interface PositionDraft {
  side: PositionSide;
  entry: number | null;
  leverage: number;
}

export interface PositionFeedback {
  action: SignalAction;
  urgency: 'LOW' | 'MID' | 'HIGH';
  confidence: number;
  pnlPct: number | null;
  alignmentScore: number;
  lines: string[];
}

export interface SignalOpsServerBundle {
  symbol?: string;
  timeframe?: string;
  fetchedAt?: number;
  generatedAt?: number;
  patternStates?: unknown;
  liveSignals?: unknown;
  derivatives?: {
    pair?: string;
    timeframe?: string;
    oi?: number | null;
    funding?: number | null;
    predFunding?: number | null;
    lsRatio?: number | null;
    updatedAt?: number | null;
  } | null;
  oiHistory?: Array<{ c?: number; v?: number; t?: number }>;
  cvdLatest?: { net?: number | null; cum?: number | null; ts?: number | null; exchanges?: number | null } | null;
  positions?: SignalOpsPosition[];
  trackedSignals?: SignalOpsTrackedSignal[];
  outcomeHistory?: SignalOpsOutcomeRecord[];
  outcomeSummary?: SignalOpsOutcomeSummary | null;
  matchedPosition?: SignalOpsPosition | null;
  matchedTrackedSignal?: SignalOpsTrackedSignal | null;
  auth?: {
    positionsAvailable?: boolean;
    trackedSignalsAvailable?: boolean;
    outcomeHistoryAvailable?: boolean;
  };
  sources?: {
    patternStates?: { ok?: boolean; data?: unknown };
    liveSignals?: { ok?: boolean; data?: unknown };
    derivatives?: { ok?: boolean; data?: { data?: { funding?: number | null; lsRatio?: number | null; oi?: number | null } } };
    oi?: { ok?: boolean; data?: { bars?: Array<{ c?: number; v?: number; t?: number }> } };
    cvd?: { ok?: boolean; data?: { bar?: { net?: number | null; cum?: number | null; exchanges?: number | null } | null } };
    positions?: { ok?: boolean; data?: { positions?: SignalOpsPosition[] } };
    trackedSignals?: { ok?: boolean; data?: { records?: SignalOpsTrackedSignal[] } };
  };
}

export interface SignalOpsPosition {
  id: string;
  asset: string;
  direction: string;
  entryPrice: number;
  currentPrice: number;
  pnlPercent: number;
  meta?: Record<string, unknown>;
}

export interface SignalOpsTrackedSignal {
  id: string;
  pair: string;
  dir: 'LONG' | 'SHORT';
  confidence: number;
  entryPrice: number;
  currentPrice: number;
  pnlPercent: number;
  status: string;
  source?: string;
  note?: string;
  trackedAt?: number;
  expiresAt?: number;
}

export interface SignalOpsOutcomeRecord {
  id: string;
  symbol: string;
  timeframe: string;
  outcome: number;
  createdAt: number;
  snapshot?: Record<string, unknown>;
}

export interface SignalOpsOutcomeSummary {
  total: number;
  wins: number;
  losses: number;
  timeouts: number;
  readyForTraining: boolean;
}

const LONG_HINTS = ['long', 'squeeze', 'bottom', 'absorption', 'breakout', 'golden', 'accumulation', 'bounce'];
const SHORT_HINTS = ['short', 'dump', 'distribution', 'reversal-short', 'bear', 'collapse'];

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function ageMinutes(value: string | null): number | null {
  if (!value) return null;
  const ms = Date.now() - new Date(value).getTime();
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 60_000)) : null;
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function normalizePhaseLabel(phaseId: string, phaseLabel?: string | null): string {
  const trimmed = phaseLabel?.trim() ?? '';
  const looksNoisy =
    !trimmed ||
    trimmed.length > 42 ||
    /<[^>]+>/.test(trimmed) ||
    /https?:\/\//i.test(trimmed) ||
    /html|reference|debug|sample/i.test(trimmed);

  if (!looksNoisy) return trimmed;
  return titleCase(phaseId);
}

function scenarioFrom(slug: string, phase: string): SignalScenario {
  const text = `${slug} ${phase}`.toLowerCase();
  if (SHORT_HINTS.some((token) => text.includes(token))) return 'SHORT';
  if (LONG_HINTS.some((token) => text.includes(token))) return 'LONG';
  return phase.toUpperCase().includes('BREAKOUT') ? 'LONG' : 'NEUTRAL';
}

function channelFor(slug: string): string {
  const text = slug.toLowerCase();
  if (text.includes('funding')) return '음펀비-필터';
  if (text.includes('vol') || text.includes('compression')) return '변동성-필터';
  if (text.includes('oi')) return 'oi-변동성-alert';
  if (text.includes('whale') || text.includes('block')) return 'whale-alert';
  if (text.includes('cvd')) return 'cvd-고액-핑크';
  if (text.includes('squeeze')) return '롱숏-스퀴즈-가능성';
  return '패턴-운영';
}

function patternStatesPayload(bundle: SignalOpsServerBundle, fallback: unknown): unknown {
  return bundle.patternStates ?? bundle.sources?.patternStates?.data ?? fallback;
}

function liveSignalsPayload(bundle: SignalOpsServerBundle): Array<{ symbol?: string }> {
  const topLevel = bundle.liveSignals as { signals?: Array<{ symbol?: string }> } | undefined;
  if (Array.isArray(topLevel?.signals)) return topLevel.signals;
  const nested = bundle.sources?.liveSignals?.data as { signals?: Array<{ symbol?: string }> } | undefined;
  return Array.isArray(nested?.signals) ? nested.signals : [];
}

function derivativesPayload(bundle: SignalOpsServerBundle): NonNullable<SignalOpsServerBundle['derivatives']> | null {
  if (bundle.derivatives) return bundle.derivatives;
  return bundle.sources?.derivatives?.data?.data ?? null;
}

function oiBars(bundle: SignalOpsServerBundle): Array<{ c?: number; v?: number; t?: number }> {
  return bundle.oiHistory ?? bundle.sources?.oi?.data?.bars ?? [];
}

function cvdBar(bundle: SignalOpsServerBundle): NonNullable<SignalOpsServerBundle['cvdLatest']> | null {
  return bundle.cvdLatest ?? bundle.sources?.cvd?.data?.bar ?? null;
}

function bundlePositions(bundle: SignalOpsServerBundle): SignalOpsPosition[] {
  return bundle.positions ?? bundle.sources?.positions?.data?.positions ?? [];
}

function bundleTrackedSignals(bundle: SignalOpsServerBundle): SignalOpsTrackedSignal[] {
  return bundle.trackedSignals ?? bundle.sources?.trackedSignals?.data?.records ?? [];
}

export function bundleOutcomeHistory(bundle: SignalOpsServerBundle, symbol?: string): SignalOpsOutcomeRecord[] {
  const rows = bundle.outcomeHistory ?? [];
  if (!symbol) return rows;
  const normalized = symbol.toUpperCase();
  return rows.filter((row) => row.symbol.toUpperCase() === normalized);
}

export function bundleOutcomeSummary(bundle: SignalOpsServerBundle): SignalOpsOutcomeSummary | null {
  return bundle.outcomeSummary ?? null;
}

function computeOiDeltaPct(bundle: SignalOpsServerBundle): number | null {
  const bars = oiBars(bundle);
  if (bars.length < 2) return null;
  const first = Number(bars[0]?.c ?? bars[0]?.v ?? 0);
  const last = Number(bars[bars.length - 1]?.c ?? bars[bars.length - 1]?.v ?? 0);
  if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) return null;
  return ((last - first) / first) * 100;
}

function latestFunding(bundle: SignalOpsServerBundle): number | null {
  const funding = derivativesPayload(bundle)?.funding;
  return typeof funding === 'number' && Number.isFinite(funding) ? funding : null;
}

function latestLsRatio(bundle: SignalOpsServerBundle): number | null {
  const ratio = derivativesPayload(bundle)?.lsRatio;
  return typeof ratio === 'number' && Number.isFinite(ratio) ? ratio : null;
}

function latestCvdNet(bundle: SignalOpsServerBundle): number | null {
  const net = cvdBar(bundle)?.net;
  return typeof net === 'number' && Number.isFinite(net) ? net : null;
}

function latestCvdExchanges(bundle: SignalOpsServerBundle): number | null {
  const exchanges = cvdBar(bundle)?.exchanges;
  return typeof exchanges === 'number' && Number.isFinite(exchanges) ? exchanges : null;
}

function liveSignalMatchCount(bundle: SignalOpsServerBundle, symbol: string): number {
  const rows = liveSignalsPayload(bundle);
  return rows.filter((row) => String(row?.symbol ?? '').toUpperCase() === symbol.toUpperCase()).length;
}

function findMatchedPosition(bundle: SignalOpsServerBundle, symbol: string): SignalOpsPosition | null {
  const positions = bundle.matchedPosition ? [bundle.matchedPosition, ...bundlePositions(bundle)] : bundlePositions(bundle);
  const normalized = symbol.toUpperCase();
  return (
    positions.find((position) => position.asset.replace(/[^A-Z0-9]/gi, '').toUpperCase().includes(normalized)) ??
    null
  );
}

function findMatchedTrackedSignal(bundle: SignalOpsServerBundle, symbol: string): SignalOpsTrackedSignal | null {
  const tracked = bundle.matchedTrackedSignal
    ? [bundle.matchedTrackedSignal, ...bundleTrackedSignals(bundle)]
    : bundleTrackedSignals(bundle);
  const normalized = symbol.toUpperCase();
  return tracked.find((row) => row.pair.replace(/[^A-Z0-9]/gi, '').toUpperCase().includes(normalized)) ?? null;
}

export function inferPositionDraft(bundle: SignalOpsServerBundle, symbol: string): PositionDraft | null {
  const matched = findMatchedPosition(bundle, symbol);
  if (!matched) return null;
  const leverage = typeof matched.meta?.leverage === 'number'
    ? matched.meta.leverage
    : Number(matched.meta?.leverage ?? 1);
  return {
    side: String(matched.direction).toUpperCase() === 'SHORT' ? 'short' : 'long',
    entry: Number.isFinite(matched.entryPrice) ? matched.entryPrice : null,
    leverage: Number.isFinite(leverage) && leverage > 0 ? leverage : 1,
  };
}

export function inferTrackedSignal(bundle: SignalOpsServerBundle, symbol: string): SignalOpsTrackedSignal | null {
  return findMatchedTrackedSignal(bundle, symbol);
}

function scoreAdjustmentForMarket(scenario: SignalScenario, bundle: SignalOpsServerBundle): number {
  let adjustment = 0;
  const funding = latestFunding(bundle);
  const lsRatio = latestLsRatio(bundle);
  const oiDeltaPct = computeOiDeltaPct(bundle);
  const cvdNet = latestCvdNet(bundle);

  if (scenario === 'LONG') {
    if (funding != null && funding < 0) adjustment += 8;
    if (lsRatio != null && lsRatio < 0.95) adjustment += 7;
    if (cvdNet != null && cvdNet > 0) adjustment += 6;
    if (oiDeltaPct != null && oiDeltaPct > 4) adjustment += 4;
  } else if (scenario === 'SHORT') {
    if (funding != null && funding > 0) adjustment += 8;
    if (lsRatio != null && lsRatio > 1.05) adjustment += 7;
    if (cvdNet != null && cvdNet < 0) adjustment += 6;
    if (oiDeltaPct != null && oiDeltaPct > 4) adjustment += 4;
  } else {
    if (Math.abs(funding ?? 0) > 0.0005) adjustment += 4;
    if (Math.abs(oiDeltaPct ?? 0) > 6) adjustment += 3;
  }

  return adjustment;
}

function actionFor(card: Pick<SignalOpsCard, 'score' | 'scenario' | 'phase' | 'alignmentScore'>): SignalAction {
  if (card.scenario === 'NEUTRAL') return card.score >= 70 ? 'WATCH' : 'HOLD';
  if (card.alignmentScore <= 25 && card.score >= 72) return 'CUT_LOSS';
  if (card.score >= 88) return 'ADD_POSITION';
  if (card.score >= 76) return 'HOLD';
  if (card.score >= 62) return 'TIGHT_SL';
  return card.phase.toUpperCase().includes('BREAKOUT') ? 'PARTIAL_TP' : 'WATCH';
}

function domainScores(score: number, progress: number, phaseIdx: number, slug: string): SignalOpsCard['domainScores'] {
  const text = slug.toLowerCase();
  return [
    { id: 'D1', label: 'L/S 추세', score: clamp(score * 0.18 + phaseIdx * 3, 0, 25), max: 25 },
    { id: 'D2', label: '가격-OI', score: clamp(score * 0.44 + progress * 0.12, 0, 50), max: 50 },
    { id: 'D3', label: '펀딩비', score: clamp(text.includes('funding') ? 20 : score * 0.09, 0, 25), max: 25 },
    { id: 'D4', label: '반전', score: clamp(text.includes('reversal') ? 46 : progress * 0.28, 0, 60), max: 60 },
    { id: 'D5', label: '좀비', score: clamp(text.includes('zombie') ? 35 : Math.max(0, 34 - phaseIdx * 5), 0, 40), max: 40 },
  ];
}

function fromState(state: PatternStateView, bundle: SignalOpsServerBundle): SignalOpsCard {
  const phase = normalizePhaseLabel(state.phaseId, state.phaseLabel);
  const phaseBonus = Math.max(0, state.phaseIdx) * 12;
  const progress = Number.isFinite(state.progressPct) ? state.progressPct : 0;
  const marketBoost = scoreAdjustmentForMarket(scenarioFrom(state.patternSlug, phase), bundle);
  const liveBoost = Math.min(10, liveSignalMatchCount(bundle, state.symbol) * 3);
  const tracked = findMatchedTrackedSignal(bundle, state.symbol);
  const score = clamp(38 + phaseBonus + progress * 0.35 + Math.min(state.barsInPhase, 18) + marketBoost + liveBoost + (tracked ? 4 : 0));
  const scenario = scenarioFrom(state.patternSlug, phase);
  const alignmentScore = scenario === 'NEUTRAL' ? clamp(score * 0.58) : clamp(score * 0.82);
  const funding = latestFunding(bundle);
  const lsRatio = latestLsRatio(bundle);
  const oiDeltaPct = computeOiDeltaPct(bundle);
  const cvdNet = latestCvdNet(bundle);
  const cvdExchanges = latestCvdExchanges(bundle);
  const traceId = [
    state.patternSlug,
    state.symbol,
    state.timeframe,
    state.phaseId,
    state.enteredAt ?? state.triggerBarTs ?? 'live',
  ].join(':');
  const age = ageMinutes(state.enteredAt ?? state.triggerBarTs);
  const cardBase = {
    score,
    scenario,
    phase,
    alignmentScore,
  };

  return {
    id: traceId,
    symbol: state.symbol,
    timeframe: state.timeframe,
    patternSlug: state.patternSlug,
    phase,
    scenario,
    score,
    urgency: score >= 82 ? 'HIGH' : score >= 64 ? 'MID' : 'LOW',
    confidence: clamp(score * 0.88 + progress * 0.12),
    alignmentScore,
    action: actionFor(cardBase),
    channel: channelFor(state.patternSlug),
    tags: ['#패턴발화', `#${channelFor(state.patternSlug)}`, `#${scenario.toLowerCase()}`],
    traceId,
    metrics: [
      { label: 'Phase', value: phase, hint: `${state.phaseIdx + 1}/${state.totalPhases ?? '?'}` },
      { label: 'Progress', value: `${Math.round(progress)}%`, hint: `${state.barsInPhase}/${state.maxBars || '?'}` },
      { label: 'Age', value: age == null ? 'live' : `${age}m`, hint: 'state trace' },
      { label: 'Funding', value: funding == null ? 'n/a' : `${(funding * 100).toFixed(4)}%` },
      { label: 'L/S', value: lsRatio == null ? 'n/a' : lsRatio.toFixed(2) },
      { label: 'OI Δ', value: oiDeltaPct == null ? 'n/a' : `${oiDeltaPct.toFixed(2)}%` },
      { label: 'CVD', value: cvdNet == null ? 'n/a' : `${cvdNet > 0 ? '+' : ''}${Math.round(cvdNet)}`, hint: cvdExchanges == null ? undefined : `${cvdExchanges} venues` },
    ],
    domainScores: domainScores(score, progress, state.phaseIdx, state.patternSlug),
    reasons: [
      `${state.patternSlug}가 ${state.symbol}에서 ${phase} 단계로 추적 중입니다.`,
      `진행률 ${Math.round(progress)}%, bars ${state.barsInPhase}/${state.maxBars || '?'} 기준으로 발화 강도를 산정했습니다.`,
      funding == null && lsRatio == null && oiDeltaPct == null
        ? `파생 데이터가 비어 있어 패턴 state 중심으로 점수를 계산했습니다.`
        : `파생 지표(funding/L-S/OI/CVD)를 함께 반영해 액션 강도를 보정했습니다.`,
      tracked ? `이미 tracking 중인 사용자 시그널이 있어 운영 우선순위를 높였습니다.` : `trace_id로 pattern state에서 alert/outcome까지 이어 붙일 수 있습니다.`,
    ],
    invalidation: `${phase} 단계 이탈 또는 다음 스캔에서 phase_idx 하락 시 무효화`,
    state,
  };
}

export function buildSignalOpsCards(payload: unknown, symbol: string, timeframe: string): SignalOpsCard[] {
  const bundle = (payload ?? {}) as SignalOpsServerBundle;
  const patternPayload = patternStatesPayload(bundle, payload);
  const states = flattenPatternStates(patternPayload as Parameters<typeof flattenPatternStates>[0], { includeInactive: false });
  const normalizedSymbol = symbol.toUpperCase();
  const exact = states.filter((state) =>
    state.symbol.toUpperCase() === normalizedSymbol && state.timeframe === timeframe,
  );
  const symbolOnly = states.filter((state) =>
    state.symbol.toUpperCase() === normalizedSymbol && state.timeframe !== timeframe,
  );
  const pool = (exact.length ? exact : symbolOnly)
    .map((state) => fromState(state, bundle))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return pool;
}

export function buildPositionFeedback(card: SignalOpsCard, position: PositionDraft, markPrice: number | null): PositionFeedback {
  const pnlPct = position.entry && markPrice
    ? ((markPrice - position.entry) / position.entry) * 100 * (position.side === 'short' ? -1 : 1) * position.leverage
    : null;
  const aligned =
    (position.side === 'long' && card.scenario === 'LONG') ||
    (position.side === 'short' && card.scenario === 'SHORT') ||
    card.scenario === 'NEUTRAL';
  let action: SignalAction = card.action;

  if (!aligned && card.score >= 70) action = 'CUT_LOSS';
  else if (pnlPct != null && pnlPct <= -8 && card.confidence >= 70) action = aligned ? 'TIGHT_SL' : 'CUT_LOSS';
  else if (pnlPct != null && pnlPct >= 18 && card.score >= 76) action = 'PARTIAL_TP';

  return {
    action,
    urgency: action === 'CUT_LOSS' ? 'HIGH' : card.urgency,
    confidence: action === 'CUT_LOSS' ? Math.max(card.confidence, 78) : card.confidence,
    pnlPct,
    alignmentScore: aligned ? card.alignmentScore : clamp(100 - card.alignmentScore),
    lines: [
      aligned ? '사용자 포지션과 시장 시나리오가 정렬되어 있습니다.' : '사용자 포지션과 현재 시나리오가 반대로 기울었습니다.',
      pnlPct == null ? '평단/현재가 입력 전이라 손익 기반 판단은 보류합니다.' : `레버리지 반영 손익은 약 ${pnlPct.toFixed(2)}%입니다.`,
      `${card.patternSlug} · ${card.phase} · score ${card.score}/100 기준으로 액션을 산정했습니다.`,
    ],
  };
}
