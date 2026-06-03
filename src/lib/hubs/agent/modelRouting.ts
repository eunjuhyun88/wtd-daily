export interface ModelOption {
  id: string;
  label: string;
  badge: string;
}

export type PipelineId =
  | 'general_chat_v1'
  | 'market_context_v1'
  | 'market_judge_v1'
  | 'research_discovery_v1'
  | 'research_stats_v1'
  | 'historical_analog_v1';

export interface RouteProfileOption {
  id: string;
  label: string;
  badge: string;
  description: string;
  default_model_id: string;
  fallback_model_id: string;
  pipeline_models: Partial<Record<PipelineId, string>>;
}

export interface ModelCatalogResponse {
  models?: ModelOption[];
  route_profiles?: RouteProfileOption[];
  default_route_profile_id?: string;
  pipeline_labels?: Record<string, string>;
}

export const DEFAULT_MODELS: ModelOption[] = [
  { id: 'openai/gpt-oss-120b', label: 'GPT OSS 120B', badge: 'reasoning' },
  { id: 'openai/gpt-oss-20b', label: 'GPT OSS 20B', badge: '' },
  { id: 'nvidia_nim/meta/llama-3.3-70b-instruct', label: 'NVIDIA NIM Llama-3.3 70B', badge: 'smart' },
  { id: 'nvidia_nim/meta/llama-3.1-70b-instruct', label: 'NVIDIA NIM Llama-3.1 70B', badge: '' },
  { id: 'groq/llama-3.3-70b-versatile', label: 'Groq Llama-3.3 70B', badge: 'fast' },
  { id: 'groq/llama-3.1-8b-instant', label: 'Groq Llama-3.1 8B', badge: 'fastest' },
  { id: 'anthropic/claude-sonnet-4-6', label: 'Claude Sonnet 4.6', badge: 'smart' },
  { id: 'anthropic/claude-haiku-3-5', label: 'Claude Haiku 3.5', badge: '' },
  { id: 'gemini/gemini-2.0-flash', label: 'Gemini 2.0 Flash', badge: '' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat', badge: 'cheap' },
  { id: 'cerebras/llama-3.3-70b', label: 'Cerebras Llama-3.3', badge: 'fast' },
  { id: 'ollama/qwen3.5:latest', label: 'Ollama Qwen3.5 (local)', badge: 'local' },
];

export const DEFAULT_PIPELINE_LABELS: Record<PipelineId, string> = {
  general_chat_v1: 'general',
  market_context_v1: 'context',
  market_judge_v1: 'judge',
  research_discovery_v1: 'scan',
  research_stats_v1: 'stats',
  historical_analog_v1: 'analog',
};

export const DEFAULT_ROUTE_PROFILE_ID = 'hybrid_market_ops';

export const DEFAULT_ROUTE_PROFILES: RouteProfileOption[] = [
  {
    id: 'hybrid_market_ops',
    label: 'Hybrid Market Ops',
    badge: 'recommended',
    description: 'GPT OSS drafts the market read, Claude Sonnet handles final judge turns, and Groq stays ready as the cheap fast fallback.',
    default_model_id: 'openai/gpt-oss-120b',
    fallback_model_id: 'groq/llama-3.3-70b-versatile',
    pipeline_models: {
      general_chat_v1: 'openai/gpt-oss-120b',
      market_context_v1: 'openai/gpt-oss-120b',
      market_judge_v1: 'anthropic/claude-sonnet-4-6',
      research_discovery_v1: 'openai/gpt-oss-120b',
      research_stats_v1: 'openai/gpt-oss-120b',
      historical_analog_v1: 'openai/gpt-oss-120b',
    },
  },
  {
    id: 'groq_speed_loop',
    label: 'Groq Speed Loop',
    badge: 'budget',
    description: 'Optimized for repeated watchlist scans and alert loops where speed and cost matter more than premium final-pass judgment.',
    default_model_id: 'groq/llama-3.3-70b-versatile',
    fallback_model_id: 'groq/llama-3.1-8b-instant',
    pipeline_models: {
      general_chat_v1: 'groq/llama-3.3-70b-versatile',
      market_context_v1: 'groq/llama-3.3-70b-versatile',
      market_judge_v1: 'openai/gpt-oss-120b',
      research_discovery_v1: 'groq/llama-3.3-70b-versatile',
      research_stats_v1: 'openai/gpt-oss-120b',
      historical_analog_v1: 'openai/gpt-oss-120b',
    },
  },
  {
    id: 'claude_final_pass',
    label: 'Claude Final Pass',
    badge: 'quality',
    description: 'Use Claude Sonnet across the flow when the desk wants the strongest single-model judgment with less concern for token cost.',
    default_model_id: 'anthropic/claude-sonnet-4-6',
    fallback_model_id: 'anthropic/claude-haiku-3-5',
    pipeline_models: {
      general_chat_v1: 'anthropic/claude-sonnet-4-6',
      market_context_v1: 'anthropic/claude-sonnet-4-6',
      market_judge_v1: 'anthropic/claude-sonnet-4-6',
      research_discovery_v1: 'anthropic/claude-sonnet-4-6',
      research_stats_v1: 'anthropic/claude-sonnet-4-6',
      historical_analog_v1: 'anthropic/claude-sonnet-4-6',
    },
  },
];

const JUDGE_RE = /(판단|방향|direction|judge|bullish|bearish|매수|매도|long|short|어때|어떤가|봐줘|알려줘)/i;
const SIMILAR_RE = /(유사|비슷|similar|같은.?패턴|예전에|과거)/i;
const SCAN_RE = /(찾아줘|뭐\s*있|뭐가|강한\s*거|강세\s*코인|약세\s*코인|셋업|setup|필터|filter|랭킹|ranking|top\s*\d*|스캔|scan|발굴|골라줘)/i;
const ALPHA_RE = /(알파|alpha)/i;
const SCREENER_RE = /(스크리너|screener|전체시장|universe|유니버스)/i;
const LEDGER_RE = /(승률|win.?rate|통계|stat|EV|기대값|expected|성과|performance|이력|history|결과|outcome|정확도|accuracy)/i;
const MARKET_RE = /(RSI|MACD|BB|볼린저|지표|indicator|차트|chart|가격|price|분석|analys|설명|explain|스냅샷|snapshot|trend|트렌드|momentum|모멘텀|premium|프리미엄|market.?ctx|market.?context|시장)/i;

export function guessPipelineId(message: string): PipelineId {
  const wantsJudge = JUDGE_RE.test(message);
  const wantsSimilar = SIMILAR_RE.test(message);
  const wantsAlpha = ALPHA_RE.test(message);
  const wantsScreener = SCREENER_RE.test(message);
  const wantsScan = SCAN_RE.test(message) || wantsAlpha || wantsScreener;
  const wantsLedger = LEDGER_RE.test(message);
  const wantsMarket = MARKET_RE.test(message) || wantsJudge;

  if (wantsSimilar) return 'historical_analog_v1';
  if (wantsScan) return 'research_discovery_v1';
  if (wantsJudge) return 'market_judge_v1';
  if (wantsLedger) return 'research_stats_v1';
  if (wantsMarket) return 'market_context_v1';
  return 'general_chat_v1';
}

export function findRouteProfile(
  routeProfiles: RouteProfileOption[],
  routeProfileId: string,
): RouteProfileOption {
  return routeProfiles.find((profile) => profile.id === routeProfileId) ?? routeProfiles[0] ?? DEFAULT_ROUTE_PROFILES[0];
}

export function findModelOption(
  models: ModelOption[],
  modelId: string,
): ModelOption | null {
  return models.find((model) => model.id === modelId) ?? null;
}

export function resolveModelForProfile(
  routeProfile: RouteProfileOption,
  pipelineId: PipelineId,
  fallbackModelId: string,
): string {
  return routeProfile.pipeline_models[pipelineId]
    ?? routeProfile.default_model_id
    ?? fallbackModelId;
}

export function pipelineLabel(
  pipelineId: string,
  pipelineLabels: Record<string, string>,
): string {
  return pipelineLabels[pipelineId] ?? pipelineId.replace(/_v\d+$/, '').replace(/_/g, ' ');
}

export function routeSummary(
  routeProfile: RouteProfileOption,
  models: ModelOption[],
): string {
  const scan = findModelOption(models, routeProfile.pipeline_models.research_discovery_v1 ?? routeProfile.default_model_id)?.label ?? 'n/a';
  const judge = findModelOption(models, routeProfile.pipeline_models.market_judge_v1 ?? routeProfile.default_model_id)?.label ?? 'n/a';
  const fallback = findModelOption(models, routeProfile.fallback_model_id)?.label ?? 'n/a';
  return `scan ${scan} · judge ${judge} · fallback ${fallback}`;
}
