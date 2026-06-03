import type { PageServerLoad } from './$types';

// Public funnel page — aggregates existing public read-only endpoints into a
// single SSR'd briefing. No auth, ISR-friendly. Each section has its own
// timeout + fallback so a single slow source can't block the page.

const DEFAULT_FETCH_TIMEOUT_MS = 2_200;

async function safeJson<T>(
  fetchFn: typeof fetch,
  url: string,
  fallback: T,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<T> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetchFn(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return fallback;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

interface FearGreedResponse {
  current?: { value: number; classification: string; timestampMs?: number } | null;
  history?: Array<{ value: number; timestampMs?: number; classification?: string }>;
}
interface NewsResponse {
  events?: Array<{
    id: string;
    title: string;
    publishedAt: number;
    url: string;
    symbols: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    source: string;
  }>;
}
interface PatternStatsResponse {
  stats?: Array<{
    slug: string;
    name?: string;
    active?: number;
    win_rate?: number | null;
    samples_30d?: number;
    avg_alpha?: number | null;
  }>;
}
interface ThermometerResponse {
  fearGreed?: number;
  btcDominance?: number;
  btcTx?: number;
  mempoolPending?: number;
  fastestFee?: number;
  usdKrw?: number;
}
interface MacroIndicatorsResponse {
  ok?: boolean;
  data?: {
    dxy?: { price?: number; prevClose?: number; trend1m?: number };
    spx?: { price?: number; prevClose?: number; trend1m?: number };
    us10y?: { price?: number; prevClose?: number; trend1m?: number };
  };
}
interface KimchiPremiumResponse {
  ok?: boolean;
  data?: { premium_pct?: number; binance_btc_usdt?: number; usd_krw?: number | null; ts?: number };
  stale?: boolean;
}
interface FundingFlipResponse {
  symbol?: string;
  currentRate?: number;
  previousRate?: number;
  direction?: 'pos_to_neg' | 'neg_to_pos' | string;
  flippedAt?: number;
  persistedHours?: number;
}
interface TrendingResponse {
  ok?: boolean;
  data?: {
    dexHot?: Array<{
      symbol?: string;
      name?: string;
      chainId?: string;
      url?: string;
      priceUsd?: number;
      change24h?: number;
      volume24h?: number;
    }>;
  };
}
interface EventsResponse {
  ok?: boolean;
  data?: {
    records?: Array<{
      id: string;
      tag: string;
      level: string;
      text: string;
      source: string;
      createdAt: number;
    }>;
  };
}

// ── New / re-wired endpoint shapes ───────────────────────────────────────────

interface CoinGeckoGlobalResponse {
  btcDominance?: number;
  totalMarketCap?: number;
  marketCapChange24hPct?: number;
  data?: Record<string, unknown>;
}
interface SparklinesResponse {
  sparklines?: Record<string, { prices: number[]; high?: number; low?: number; volume?: number }>;
}
interface WhalesResponse {
  positions?: Array<{
    address: string;
    addressFull?: string;
    pnl30dPct?: number;
    leverage?: number;
    netPosition?: 'long' | 'short' | string;
    sizeUsd?: number;
    entryPrice?: number;
    liquidationPrice?: number;
    symbol?: string;
  }>;
  cached?: boolean;
  stale?: boolean;
}
interface ConfluenceResponse {
  at?: number;
  symbol?: string;
  score?: number;
  confidence?: number;
  regime?: string;
  contributions?: Array<{ name: string; weight?: number; value?: number; score?: number }>;
  divergence?: number;
  divergenceStreak?: number;
  sameRegimeStreak?: number;
}
interface OptionsSnapshotResponse {
  putCallRatioOi?: number;
  putCallRatioVol?: number;
  skew25d?: number;
  gamma?: { pinDistancePct?: number; maxPainDistancePct?: number };
}
interface OnchainResponse {
  ok?: boolean;
  source?: string;
  data?: {
    exchangeReserve?: number | null;
    onchainMetrics?: {
      mvrv?: number | null;
      nupl?: number | null;
      sopr?: number | null;
      puellMultiple?: number | null;
    };
    whaleData?: Record<string, unknown>;
    minerData?: Record<string, unknown>;
  };
}
interface FomcResponse {
  ok?: boolean;
  data?: {
    nextMeeting?: { date?: string; daysUntil?: number; expectations?: Record<string, number> };
    history?: Array<{ date: string; rate: number; change?: number }>;
  } | unknown;
}
interface MarketNewsResponse {
  ok?: boolean;
  data?: {
    records?: Array<{
      id: string;
      source?: string;
      title?: string;
      summary?: string;
      link?: string;
      publishedAt?: number;
      sentiment?: string;
      importance?: number;
    }>;
    total?: number;
    hasMore?: boolean;
    sources?: string[];
  };
}

interface KrIndicesResponse {
  ok?: boolean;
  data?: {
    kospi?: { price?: number; prevClose?: number; changePct?: number; trend1m?: number; spark?: number[]; updatedAt?: number } | null;
    kosdaq?: { price?: number; prevClose?: number; changePct?: number; trend1m?: number; spark?: number[]; updatedAt?: number } | null;
  };
}
interface KrStocksResponse {
  ok?: boolean;
  data?: {
    stocks?: Array<{
      symbol: string;
      name: string;
      price?: number | null;
      prevClose?: number | null;
      changePct?: number | null;
      volume?: number | null;
      spark?: number[];
      trend1m?: number | null;
    }>;
  };
}
interface UsStocksResponse {
  ok?: boolean;
  data?: {
    stocks?: Array<{
      symbol: string;
      name: string;
      price?: number | null;
      prevClose?: number | null;
      changePct?: number | null;
      volume?: number | null;
      spark?: number[];
      trend1m?: number | null;
    }>;
  };
}
interface CommoditiesResponse {
  ok?: boolean;
  data?: {
    gold?: { price?: number; prevClose?: number; changePct?: number; trend1m?: number; spark?: number[] } | null;
    oil?: { price?: number; prevClose?: number; changePct?: number; trend1m?: number; spark?: number[] } | null;
    silver?: { price?: number; prevClose?: number; changePct?: number; trend1m?: number; spark?: number[] } | null;
    copper?: { price?: number; prevClose?: number; changePct?: number; trend1m?: number; spark?: number[] } | null;
  };
}
interface TokenUnlocksResponse {
  ok?: boolean;
  data?: {
    events?: Array<{
      symbol: string;
      name: string;
      unlockAt: number;
      description: string;
      tokens: number | null;
      valueUsd: number | null;
      pctOfCirculating: number | null;
    }>;
    fetchedAt?: number;
  };
}

const SPARK_SYMBOLS = 'BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT,DOGEUSDT,ADAUSDT,AVAXUSDT,LINKUSDT,TRXUSDT';

export const load: PageServerLoad = async ({ fetch, setHeaders }) => {
  const [
    feargreed,
    macro,
    kimchi,
    sparklines,
    confluence,
    fomc,
    tokenUnlocks,
  ] = await Promise.all([
    safeJson<FearGreedResponse>(fetch, '/api/feargreed?limit=14', {}, 1_500),
    safeJson<MacroIndicatorsResponse>(fetch, '/api/macro/indicators', {}, 1_800),
    safeJson<KimchiPremiumResponse>(fetch, '/api/market/kimchi-premium', {}, 1_500),
    safeJson<SparklinesResponse>(fetch, `/api/market/sparklines?symbols=${SPARK_SYMBOLS}`, { sparklines: {} }, 2_000),
    safeJson<ConfluenceResponse>(fetch, '/api/confluence/current?symbol=BTCUSDT&tf=4h', {}, 2_000),
    safeJson<FomcResponse>(fetch, '/api/macro/fomc', {}, 1_800),
    safeJson<TokenUnlocksResponse>(fetch, '/api/calendar/token-unlocks', {}, 1_800),
  ]);

  // Public CDN cache: 60s fresh, 5min stale-while-revalidate.
  setHeaders({
    'cache-control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
  });

  return {
    feargreed,
    macro,
    kimchi,
    sparklines,
    confluence,
    fomc,
    tokenUnlocks,
    generatedAt: Date.now(),
  };
};
