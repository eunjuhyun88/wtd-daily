<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { replaceState } from '$app/navigation';
  import SubRail from './_components/SubRail.svelte';
  import PulseStrip from './_components/PulseStrip.svelte';
  import HeadlineCard from './_components/HeadlineCard.svelte';
  import SignupWall from './_components/SignupWall.svelte';
  import DailyIntro from './_components/DailyIntro.svelte';
  import ThisWeekWatchlist from './_components/ThisWeekWatchlist.svelte';
  import TopCoinBoard from './_components/TopCoinBoard.svelte';
  import { dispatchLever } from '$lib/analytics/lever-events';
  import { openWalletModal } from '$lib/stores/walletModalStore';
  import { authStore } from '$lib/stores/authStore';
  import { isWalletConnected } from '$lib/stores/walletStore';

  const { data } = $props<{ data: PageData }>();
  type SectionStatus = 'idle' | 'loading' | 'ready' | 'error';
  type NewsPayload = {
    events?: Array<{
      id: string;
      title: string;
      publishedAt: number;
      url: string;
      symbols: string[];
      sentiment?: string;
      source: string;
    }>;
  };
  type PatternStatsPayload = {
    stats?: Array<{
      slug: string;
      name?: string;
      active?: number;
      win_rate?: number | null;
      samples_30d?: number;
      avg_alpha?: number | null;
    }>;
  };
  type ThermometerPayload = {
    fearGreed?: number;
    btcDominance?: number;
    btcTx?: number;
    mempoolPending?: number;
    fastestFee?: number;
    usdKrw?: number;
  };
  type FundingFlipPayload = {
    symbol?: string;
    currentRate?: number;
    previousRate?: number;
    direction?: string;
    flippedAt?: number;
    persistedHours?: number;
  };
  type TrendingPayload = {
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
  };
  type EventsPayload = {
    data?: {
      records?: Array<{
        id: string;
        tag: string;
        level: string;
        text: string;
        source?: string;
        createdAt: number;
      }>;
    };
  };
  type MacroCalendarPayload = {
    items?: Array<{
      id: string;
      title: string;
      scheduledAt?: string;
      countdownSeconds?: number;
      impact?: 'high' | 'medium' | 'low' | string;
      affectedAssets?: string[];
      summary?: string;
    }>;
    updatedAt?: string;
  };
  type MarketNewsPayload = {
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
    };
  };
  type KrIndicesPayload = {
    data?: {
      kospi?: { price?: number; changePct?: number; spark?: number[] } | null;
      kosdaq?: { price?: number; changePct?: number; spark?: number[] } | null;
    };
  };
  type StocksPayload = {
    data?: {
      stocks?: Array<{
        symbol: string;
        name: string;
        price?: number | null;
        changePct?: number | null;
        spark?: number[];
      }>;
    };
  };
  type CommoditiesPayload = {
    data?: {
      gold?: { price?: number; changePct?: number; spark?: number[] } | null;
      oil?: { price?: number; changePct?: number; spark?: number[] } | null;
      silver?: { price?: number; changePct?: number; spark?: number[] } | null;
      copper?: { price?: number; changePct?: number; spark?: number[] } | null;
    };
  };
  type OptionsPayload = {
    putCallRatioOi?: number;
    putCallRatioVol?: number;
    skew25d?: number;
    gamma?: { maxPainDistancePct?: number };
  };
  type OnchainPayload = {
    data?: {
      onchainMetrics?: {
        mvrv?: number | null;
        nupl?: number | null;
        sopr?: number | null;
        puellMultiple?: number | null;
      };
    };
  };
  type VenueFundingPayload = {
    ok?: boolean;
    symbol?: string;
    binance?: number | null;
    bybit?: number | null;
    okx?: number | null;
    spread?: number | null;
    avg?: number | null;
  };
  type CoinbasePremiumPayload = {
    ok?: boolean;
    premium?: number | null;
    premium_pct?: number | null;
    norm?: number | null;
    trend?: 'up' | 'down' | 'flat' | null;
    history?: Array<{ date: string; premium: number | null }>;
  };
  type CmeCotPayload = {
    ok?: boolean;
    report_date?: string | null;
    btc_oi?: number | null;
    eth_oi?: number | null;
    btc_oi_chg?: number | null;
    eth_oi_chg?: number | null;
  };
  type WhalesPayload = {
    positions?: Array<{
      address?: string;
      addressFull?: string;
      pnl30dPct?: number;
      leverage?: number;
      netPosition?: 'long' | 'short' | string;
      sizeUsd?: number;
      symbol?: string;
    }>;
  };
  type WatchlistEvent = {
    region: 'US' | 'KR' | 'Global';
    dateLabel: string;
    title: string;
    note: string;
    impact: 'high' | 'medium';
  };
  type WatchlistIssue = {
    region: 'US' | 'KR' | 'Global';
    title: string;
    summary: string;
    tone: 'bullish' | 'cautious' | 'mixed';
  };
  type EarningsWatchItem = {
    symbol: string;
    name: string;
    scheduledAt: string;
    session: 'pre' | 'post' | 'tentative';
    market: 'US' | 'KR';
  };
  type FomcHistoryItem = {
    date: string;
    decision?: string;
    rate?: number;
    change?: number;
    comment?: string;
  };
  type DenseTab = 'overview' | 'macro' | 'crypto' | 'calendar' | 'signals';
  type DenseRow = {
    label: string;
    sub?: string;
    value: string;
    delta?: number | null;
    meta?: string;
    href?: string;
  };
  type DenseTabContext = {
    eyebrow: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
    tone: 'neutral' | 'positive' | 'warning';
  };

  async function fetchJson<T>(url: string, fallback: T, timeoutMs = 2_500): Promise<T> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return fallback;
      const ct = res.headers.get('content-type') ?? '';
      if (!ct.includes('json')) return fallback;
      return (await res.json()) as T;
    } catch {
      return fallback;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  let newsPayload = $state<NewsPayload>({ events: [] });
  let patternStatsPayload = $state<PatternStatsPayload>({ stats: [] });
  let thermometerPayload = $state<ThermometerPayload>({});
  let fundingFlipPayload = $state<FundingFlipPayload>({});
  let trendingPayload = $state<TrendingPayload>({ data: { dexHot: [] } });
  let eventsPayload = $state<EventsPayload>({ data: { records: [] } });
  let macroCalendarPayload = $state<MacroCalendarPayload>({ items: [] });
  let marketNewsPayload = $state<MarketNewsPayload>({ data: { records: [] } });
  let krIndicesPayload = $state<KrIndicesPayload>({});
  let krStocksPayload = $state<StocksPayload>({ data: { stocks: [] } });
  let usStocksPayload = $state<StocksPayload>({ data: { stocks: [] } });
  let commoditiesPayload = $state<CommoditiesPayload>({});
  let optionsPayload = $state<OptionsPayload>({});
  let onchainPayload = $state<OnchainPayload>({});
  let venueFundingPayload = $state<VenueFundingPayload>({});
  let coinbasePremiumPayload = $state<CoinbasePremiumPayload>({});
  let cmeCotPayload = $state<CmeCotPayload>({});
  let whalesPayload = $state<WhalesPayload>({ positions: [] });

  let secondaryStatus = $state<SectionStatus>('idle');
  let eventsStatus = $state<SectionStatus>('idle');
  let deepStatus = $state<SectionStatus>('idle');
  let denseTab = $state<DenseTab>('overview');
  let dailyRootEl = $state<HTMLElement | null>(null);
  let deepTriggerEl = $state<HTMLElement | null>(null);
  let hasObservedDeep = $state(false);

  // ── PR1 shell — Pulse + Sub-rail ───────────────────────────────
  const btcSeries = $derived<{ prices: number[] } | null>(
    (data.sparklines?.sparklines as Record<string, { prices: number[] }> | undefined)?.BTCUSDT ?? null
  );
  const btcPulse = $derived(
    btcSeries && btcSeries.prices?.length
      ? {
          price: btcSeries.prices[btcSeries.prices.length - 1] ?? null,
          changePct:
            btcSeries.prices.length >= 2 && btcSeries.prices[0] !== 0
              ? ((btcSeries.prices[btcSeries.prices.length - 1] - btcSeries.prices[0]) /
                  btcSeries.prices[0]) *
                100
              : null
        }
      : null
  );
  const btcDominance = $derived(
    (thermometerPayload?.btcDominance != null)
      ? thermometerPayload.btcDominance
      : null
  );
  const fgPulse = $derived(
    data.feargreed?.current
      ? { value: data.feargreed.current.value, classification: data.feargreed.current.classification }
      : null
  );
  const confluencePulse = $derived(
    data.confluence ? { score: data.confluence.score, regime: data.confluence.regime } : null
  );
  const kimchiPulse = $derived(
    data.kimchi?.data ? { premium_pct: data.kimchi.data.premium_pct } : null
  );
  const macroPulse = $derived(
    data.macro?.data
      ? {
          dxy: data.macro.data.dxy,
          spx: data.macro.data.spx,
          us10y: data.macro.data.us10y
        }
      : null
  );

  // ── Existing surfaces ──────────────────────────────────────────
  const fg = $derived(data.feargreed?.current ?? null);
  const fgHistory = $derived(data.feargreed?.history ?? []);
  const news = $derived(newsPayload?.events ?? []);
  const stats = $derived(patternStatsPayload?.stats ?? []);
  const thermo = $derived(thermometerPayload ?? null);

  const kimchi = $derived(data.kimchi?.data ?? null);
  const flip = $derived(fundingFlipPayload ?? null);
  const dexHot = $derived(
    (trendingPayload?.data?.dexHot ?? [])
      .filter((t: { volume24h?: number; symbol?: string }) => (t.volume24h ?? 0) > 0 && t.symbol)
      .slice(0, 5)
  );
  const derivEvents = $derived(
    (eventsPayload?.data?.records ?? [])
      .filter((r: { tag?: string }) => r.tag === 'DERIV' || r.tag === 'WHALE' || r.tag === 'LIQUIDATION')
      .slice(0, 6)
  );

  const topPatterns = $derived(
    [...stats]
      .filter((s) => (s.samples_30d ?? 0) >= 5 && (s.avg_alpha ?? 0) > 0)
      .sort((a, b) => (b.avg_alpha ?? 0) - (a.avg_alpha ?? 0))
      .slice(0, 5)
  );

  // ── Re-wired previously unused endpoints ───────────────────────
  const venueFunding = $derived(venueFundingPayload?.ok ? venueFundingPayload : null);
  const coinbasePremium = $derived(coinbasePremiumPayload?.ok ? coinbasePremiumPayload : null);
  const cmeCot = $derived(cmeCotPayload?.ok ? cmeCotPayload : null);
  const sparklines = $derived(data.sparklines?.sparklines ?? {});
  const whales = $derived((whalesPayload?.positions ?? []).slice(0, 8));
  const confluence = $derived(data.confluence ?? null);
  const options = $derived(optionsPayload ?? null);
  const onchain = $derived(onchainPayload?.data ?? null);
  const fomc = $derived(data.fomc ?? null);
  const macroCalendarItems = $derived(macroCalendarPayload?.items ?? []);
  const marketNews = $derived(marketNewsPayload?.data?.records ?? []);

  // ── New stock + commodity + unlock surfaces ────────────────────
  const krIndices = $derived(
    (data as { krIndices?: { data?: { kospi?: unknown; kosdaq?: unknown } } }).krIndices?.data != null
      ? (data as { krIndices?: { data?: { kospi?: { price?: number; changePct?: number; spark?: number[] } | null; kosdaq?: { price?: number; changePct?: number; spark?: number[] } | null } } }).krIndices!.data!
      : krIndicesPayload?.data ?? null
  );
  const krStocks = $derived(krStocksPayload?.data?.stocks ?? []);
  const usStocks = $derived(
    (data as { usStocks?: { data?: { stocks?: Array<{ symbol: string; name: string; price?: number | null; changePct?: number | null; spark?: number[]; trend1m?: number | null }> } } }).usStocks?.data?.stocks?.length
      ? (data as { usStocks?: { data?: { stocks?: Array<{ symbol: string; name: string; price?: number | null; changePct?: number | null; spark?: number[]; trend1m?: number | null }> } } }).usStocks!.data!.stocks!
      : usStocksPayload?.data?.stocks ?? []
  );
  const commodities = $derived(
    (data as { commodities?: { data?: { gold?: unknown; oil?: unknown; silver?: unknown; copper?: unknown } } }).commodities?.data != null
      ? (data as { commodities?: { data?: { gold?: { price?: number; changePct?: number; spark?: number[] } | null; oil?: { price?: number; changePct?: number; spark?: number[] } | null; silver?: { price?: number; changePct?: number; spark?: number[] } | null; copper?: { price?: number; changePct?: number; spark?: number[] } | null } } }).commodities!.data!
      : commoditiesPayload?.data ?? null
  );
  const unlocks = $derived(data.tokenUnlocks?.data?.events ?? []);

  // ── Top-10 coin board ──────────────────────────────────────────
  const COIN_LABELS: Record<string, { label: string; name: string }> = {
    BTCUSDT: { label: 'BTC', name: 'Bitcoin' },
    ETHUSDT: { label: 'ETH', name: 'Ethereum' },
    SOLUSDT: { label: 'SOL', name: 'Solana' },
    BNBUSDT: { label: 'BNB', name: 'BNB' },
    XRPUSDT: { label: 'XRP', name: 'XRP' },
    DOGEUSDT: { label: 'DOGE', name: 'Dogecoin' },
    ADAUSDT: { label: 'ADA', name: 'Cardano' },
    AVAXUSDT: { label: 'AVAX', name: 'Avalanche' },
    LINKUSDT: { label: 'LINK', name: 'Chainlink' },
    TRXUSDT: { label: 'TRX', name: 'Tron' },
  };

  const topCoins = $derived(
    Object.entries(sparklines as Record<string, { prices: number[]; high?: number; low?: number; volume?: number }>)
      .map(([sym, s]) => {
        const meta = COIN_LABELS[sym] ?? { label: sym.replace('USDT', ''), name: sym };
        const prices = s?.prices ?? [];
        const last = prices.length > 0 ? prices[prices.length - 1] : null;
        const first = prices.length > 0 ? prices[0] : null;
        const changePct = last != null && first != null && first !== 0 ? ((last - first) / first) * 100 : null;
        return {
          symbol: sym,
          label: meta.label,
          name: meta.name,
          price: last,
          changePct,
          prices,
          high: s?.high ?? null,
          low: s?.low ?? null,
          volume: s?.volume ?? null,
        };
      })
      .filter((c) => c.price != null)
  );

  // ── Auth gate — Daily is public, but the conversion CTAs only make sense
  //    for unauthenticated visitors. Authenticated users see a clean briefing
  //    instead of "sign up" walls they already passed.
  const auth = $derived($authStore);
  const connected = $derived($isWalletConnected);
  const isAuthenticated = $derived(connected || !!(auth.email || auth.nickname));

  // ── Hero "3 Signals" — answers the 10-second question above the 14-card
  //    grid: what's the regime, what moved most, what's coming up. Each
  //    signal is built from data already on the page, so no new fetches.
  const biggestMover = $derived.by(() => {
    if (topCoins.length === 0) return null;
    const sorted = [...topCoins].filter((c) => c.changePct != null);
    if (sorted.length === 0) return null;
    sorted.sort((a, b) => Math.abs((b.changePct ?? 0)) - Math.abs((a.changePct ?? 0)));
    return sorted[0];
  });

  // Nearest macro / token event — pick whichever (FOMC vs nearest unlock)
  // is closer in time. Both feeds are best-effort; if neither has a future
  // event the chip just shows "—".
  type NearestEvent = { label: string; daysUntil: number; href: string } | null;
  const nearestEvent: NearestEvent = $derived.by(() => {
    let best: NearestEvent = null;
    const fomcDays = (fomc?.data as { nextMeeting?: { daysUntil?: number } } | undefined)
      ?.nextMeeting?.daysUntil;
    if (typeof fomcDays === 'number' && fomcDays >= 0) {
      best = { label: `FOMC D-${fomcDays}`, daysUntil: fomcDays, href: '#calendar' };
    }
    if (unlocks.length > 0) {
      const nowMs = Date.now();
      type UnlockEvent = { symbol: string; unlockAt: number };
      const future = (unlocks as UnlockEvent[])
        .filter((u: UnlockEvent) => u.unlockAt && u.unlockAt > nowMs)
        .sort((a: UnlockEvent, b: UnlockEvent) => a.unlockAt - b.unlockAt)[0];
      if (future) {
        const days = Math.max(0, Math.ceil((future.unlockAt - nowMs) / 86_400_000));
        if (!best || days < best.daysUntil) {
          best = { label: `${future.symbol} unlock D-${days}`, daysUntil: days, href: '#calendar' };
        }
      }
    }
    return best;
  });

  const regimeChip = $derived.by(() => {
    const r = confluence?.regime;
    if (!r) return { label: 'Pending', tone: 'neu' as const };
    if (/risk[_-]?on|bull/i.test(r)) return { label: 'Risk-On', tone: 'pos' as const };
    if (/risk[_-]?off|bear/i.test(r)) return { label: 'Risk-Off', tone: 'neg' as const };
    return { label: r.charAt(0).toUpperCase() + r.slice(1), tone: 'neu' as const };
  });

  const regimeDeck = $derived.by(() => {
    const r = confluence?.regime?.toLowerCase() ?? '';
    const btcStr = btcPulse?.price != null ? `BTC $${fmtPrice(btcPulse.price)}.` : '';
    if (/risk[_-]?on|bull/i.test(r)) return `${btcStr} 위험자산 선호 강세, 매크로 순풍. 크립토 전반 상승 모멘텀 확인 중.`;
    if (/risk[_-]?off|bear/i.test(r)) return `${btcStr} 리스크 오프 환경 지속. 주요 지지선 및 매크로 지표 모니터링 필요.`;
    return `${btcStr} 방향성 확인 대기 중. 크립토·매크로 혼조세, 변동성 주의.`;
  });

  // ── Clock for "X min ago" ──────────────────────────────────────
  let now = $state(Date.now());
  // ── L7 sticky CTA gating (near-footer & idle) — also gated on
  //    !isAuthenticated below; the scroll handler is a no-op for logged-in
  //    users so we don't pay the listener cost for nothing.
  let l7Visible = $state(false);
  onMount(() => {
    const id = setInterval(() => (now = Date.now()), 30_000);
    let disposed = false;
    const syncHashAnchor = (behavior: ScrollBehavior = 'smooth') => {
      const targetId = window.location.hash.slice(1);
      if (targetId) scrollToDailyAnchor(targetId, behavior);
      if (targetId) window.setTimeout(() => scrollToDailyAnchor(targetId, behavior), 700);
    };
    const handleHashChange = () => syncHashAnchor('smooth');
    const handleDailyAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('#daily-top a[href]');
      if (!link || link.target === '_blank') return;

      const url = new URL(link.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;

      event.preventDefault();
      const targetId = url.hash.slice(1);
      scrollToDailyAnchor(targetId);
      window.setTimeout(() => scrollToDailyAnchor(targetId), 700);
      replaceState(`${url.pathname}${url.hash}`, {});
    };
    window.addEventListener('hashchange', handleHashChange);
    const dailyRoot = dailyRootEl ?? document.getElementById('daily-top');
    dailyRoot?.addEventListener('click', handleDailyAnchorClick);
    requestAnimationFrame(() => syncHashAnchor('auto'));

    async function loadSecondaryData() {
      if (secondaryStatus === 'loading' || secondaryStatus === 'ready') return;
      secondaryStatus = 'loading';
      const tasks = [
        fetchJson<NewsPayload>('/api/cogochi/news?limit=12', { events: [] }, 1_400)
          .then((value) => { if (!disposed) newsPayload = value; }),
        fetchJson<PatternStatsPayload>('/api/patterns/stats', { stats: [] }, 1_400)
          .then((value) => { if (!disposed) patternStatsPayload = value; }),
        fetchJson<ThermometerPayload>('/api/cogochi/thermometer', {}, 1_400)
          .then((value) => { if (!disposed) thermometerPayload = value; }),
        fetchJson<FundingFlipPayload>('/api/market/funding-flip', {}, 1_400)
          .then((value) => { if (!disposed) fundingFlipPayload = value; }),
        fetchJson<MacroCalendarPayload>('/api/market/macro-calendar', { items: [] }, 1_400)
          .then((value) => { if (!disposed) macroCalendarPayload = value; }),
        fetchJson<TrendingPayload>('/api/market/trending', { data: { dexHot: [] } }, 1_700)
          .then((value) => { if (!disposed) trendingPayload = value; }),
        fetchJson<MarketNewsPayload>('/api/market/news?token=BTC&sort=importance&limit=10', { data: { records: [] } }, 1_700)
          .then((value) => { if (!disposed) marketNewsPayload = value; }),
        fetchJson<KrIndicesPayload>('/api/macro/kr-indices', {}, 1_700)
          .then((value) => { if (!disposed) krIndicesPayload = value; }),
        fetchJson<StocksPayload>('/api/macro/kr-stocks', { data: { stocks: [] } }, 1_700)
          .then((value) => { if (!disposed) krStocksPayload = value; }),
        fetchJson<StocksPayload>('/api/macro/us-stocks', { data: { stocks: [] } }, 1_700)
          .then((value) => { if (!disposed) usStocksPayload = value; }),
        fetchJson<CommoditiesPayload>('/api/macro/commodities', {}, 1_700)
          .then((value) => { if (!disposed) commoditiesPayload = value; })
      ];
      const results = await Promise.allSettled(tasks);
      if (disposed) return;
      secondaryStatus = results.some((result) => result.status === 'fulfilled') ? 'ready' : 'error';
    }

    async function loadMarketEvents() {
      if (eventsStatus === 'loading' || eventsStatus === 'ready') return;
      eventsStatus = 'loading';
      const nextEvents = await fetchJson<EventsPayload>(
        '/api/market/events?limit=12&fast=1',
        { data: { records: [] } },
        2_000
      );
      if (disposed) return;
      eventsPayload = nextEvents;
      eventsStatus = 'ready';
    }

    async function loadDeepData() {
      if (deepStatus === 'loading' || deepStatus === 'ready') return;
      deepStatus = 'loading';
      const tasks = [
        fetchJson<OptionsPayload>('/api/market/options-snapshot?currency=BTC', {}, 2_200)
          .then((value) => { if (!disposed) optionsPayload = value; }),
        fetchJson<OnchainPayload>('/api/onchain/cryptoquant?token=btc', {}, 2_200)
          .then((value) => { if (!disposed) onchainPayload = value; }),
        fetchJson<VenueFundingPayload>('/api/daily/venue-funding?symbol=BTCUSDT', {}, 3_000)
          .then((value) => { if (!disposed) venueFundingPayload = value; }),
        fetchJson<CoinbasePremiumPayload>('/api/daily/coinbase-premium?days=30', {}, 3_000)
          .then((value) => { if (!disposed) coinbasePremiumPayload = value; }),
        fetchJson<CmeCotPayload>('/api/daily/cme-cot', {}, 3_000)
          .then((value) => { if (!disposed) cmeCotPayload = value; }),
        fetchJson<WhalesPayload>('/api/cogochi/whales', { positions: [] }, 2_200)
          .then((value) => { if (!disposed) whalesPayload = value; })
      ];
      const results = await Promise.allSettled(tasks);
      if (disposed) return;
      deepStatus = results.some((result) => result.status === 'fulfilled') ? 'ready' : 'error';
    }

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const scrollRoot = getDailyScrollRoot();
    function scrollProgress() {
      if (scrollRoot) {
        const total = scrollRoot.scrollHeight;
        const visible = scrollRoot.clientHeight;
        if (total <= visible + 4) return 0;
        return (scrollRoot.scrollTop + visible) / total;
      }
      const scroller = document.scrollingElement ?? document.documentElement;
      const total = scroller.scrollHeight;
      const visible = window.innerHeight;
      if (total <= visible + 4) return 0;
      return (window.scrollY + visible) / total;
    }
    function checkL7() {
      if (isAuthenticated) return;
      const reachedBottom = scrollProgress() >= 0.95;
      if (idleTimer) clearTimeout(idleTimer);
      if (!reachedBottom) {
        l7Visible = false;
        return;
      }
      if (reachedBottom && !l7Visible) {
        idleTimer = setTimeout(() => { l7Visible = true; }, 8_000);
      }
    }

    const secondaryTimer = setTimeout(() => {
      void loadSecondaryData();
    }, 180);

    const eventsTimer = setTimeout(() => {
      void loadMarketEvents();
    }, 900);

    const deepTimer = setTimeout(() => {
      if (!hasObservedDeep) void loadDeepData();
    }, 400);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && deepTriggerEl) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          hasObservedDeep = true;
          void loadDeepData();
          observer?.disconnect();
        }
      }, { root: scrollRoot, rootMargin: '240px 0px' });
      observer.observe(deepTriggerEl);
    }

    (scrollRoot ?? window).addEventListener('scroll', checkL7, { passive: true });
    checkL7();
    return () => {
      disposed = true;
      clearInterval(id);
      clearTimeout(secondaryTimer);
      clearTimeout(eventsTimer);
      clearTimeout(deepTimer);
      if (idleTimer) clearTimeout(idleTimer);
      observer?.disconnect();
      window.removeEventListener('hashchange', handleHashChange);
      dailyRoot?.removeEventListener('click', handleDailyAnchorClick);
      (scrollRoot ?? window).removeEventListener('scroll', checkL7);
    };
  });

  // ── L2: Top-10 coin row hover ≥1.5s ──
  const coinHoverFired = new Set<string>();
  let coinHoverTimer: ReturnType<typeof setTimeout> | null = null;
  function onCoinEnter(symbol: string) {
    if (coinHoverFired.has(symbol)) return;
    if (coinHoverTimer) clearTimeout(coinHoverTimer);
    coinHoverTimer = setTimeout(() => {
      coinHoverFired.add(symbol);
      dispatchLever('l2', { surface: 'top10_coin', trigger: 'hover_1500ms' });
    }, 1500);
  }
  function onCoinLeave() {
    if (coinHoverTimer) {
      clearTimeout(coinHoverTimer);
      coinHoverTimer = null;
    }
  }

  function timeAgo(ts: number): string {
    const diff = Math.max(0, (now - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function timeUntil(ts: number): string {
    const diff = Math.max(0, (ts - now) / 1000);
    if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
    const days = Math.floor(diff / 86400);
    return `D-${days}`;
  }

  function fgColor(v: number | null | undefined): string {
    if (v == null) return 'var(--d-mute)';
    if (v <= 25) return '#ff6b6b';
    if (v <= 45) return '#f9a26c';
    if (v <= 55) return '#e9d36b';
    if (v <= 75) return '#a8d96b';
    return '#5fc97a';
  }

  function fgLabel(v: number | null | undefined): string {
    if (v == null) return 'No data';
    if (v <= 25) return 'Extreme Fear';
    if (v <= 45) return 'Fear';
    if (v <= 55) return 'Neutral';
    if (v <= 75) return 'Greed';
    return 'Extreme Greed';
  }

  function pctColor(v: number | null | undefined): string {
    if (v == null) return 'var(--d-mute)';
    if (v > 0) return '#5fc97a';
    if (v < 0) return '#ff6b6b';
    return 'var(--d-mute)';
  }

  function fmtNum(v: number | null | undefined, digits = 2): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return v.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }

  function fmtPct(v: number | null | undefined): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
  }

  function isUsableMarketQuote(
    quote: { price?: number | null; changePct?: number | null } | null | undefined
  ): boolean {
    if (!quote || quote.price == null || !Number.isFinite(quote.price) || quote.price <= 0) return false;
    return quote.changePct == null || !Number.isFinite(quote.changePct) || Math.abs(quote.changePct) < 80;
  }

  function guardedPrice(
    quote: { price?: number | null; changePct?: number | null } | null | undefined,
    digits = 2
  ): string {
    return isUsableMarketQuote(quote) ? fmtNum(quote?.price, digits) : '—';
  }

  function guardedPct(quote: { price?: number | null; changePct?: number | null } | null | undefined): string {
    return isUsableMarketQuote(quote) ? fmtPct(quote?.changePct) : 'delayed';
  }

  function fundingDirectionLabel(direction: string | null | undefined): string {
    if (!direction) return '';
    if (direction === 'pos_to_neg') return 'Pos→Neg flip';
    if (direction === 'neg_to_pos') return 'Neg→Pos flip';
    return direction.replaceAll('_', ' ');
  }

  function fmtHours(v: number | null | undefined): string | undefined {
    if (v == null || !Number.isFinite(v)) return undefined;
    return `${Math.round(v)}h`;
  }

  function fmtSession(session: EarningsWatchItem['session']): string {
    if (session === 'pre') return 'pre-market';
    if (session === 'post') return 'after close';
    return 'tentative';
  }

  function fmtPrice(v: number | null | undefined): string {
    if (v == null || !Number.isFinite(v)) return '—';
    if (v >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (v >= 1) return v.toFixed(2);
    if (v >= 0.01) return v.toFixed(4);
    return v.toFixed(6);
  }

  function fmtKrwPrice(v: number | null | undefined): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return '₩' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function compactUsd(v: number | null | undefined): string {
    if (v == null || !Number.isFinite(v)) return '—';
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
    return `$${v.toFixed(2)}`;
  }

  function compactNum(v: number | null | undefined): string {
    if (v == null || !Number.isFinite(v)) return '—';
    if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
    return v.toFixed(0);
  }

  // ── Sparkline path (24-point SVG) ──────────────────────────────
  function sparkPath(prices: number[], w = 80, h = 24): string {
    if (!prices || prices.length < 2) return '';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const stepX = w / (prices.length - 1);
    return prices
      .map((p, i) => {
        const x = (i * stepX).toFixed(2);
        const y = (h - ((p - min) / range) * h).toFixed(2);
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ');
  }

  function sparkColor(prices: number[]): string {
    if (!prices || prices.length < 2) return 'var(--d-mute)';
    return prices[prices.length - 1] >= prices[0] ? '#5fc97a' : '#ff6b6b';
  }

  function sparkArea(prices: number[], w = 80, h = 24): string {
    if (!prices || prices.length < 2) return '';
    const path = sparkPath(prices, w, h);
    return `${path} L${w},${h} L0,${h} Z`;
  }

  // Row sparkline (smaller; used inline in stock/commodity/macro tables)
  function rowSparkPath(prices: number[] | undefined | null, w = 64, h = 18): string {
    if (!prices || prices.length < 2) return '';
    return sparkPath(prices, w, h);
  }
  function rowSparkArea(prices: number[] | undefined | null, w = 64, h = 18): string {
    if (!prices || prices.length < 2) return '';
    return sparkArea(prices, w, h);
  }
  function rowSparkColor(prices: number[] | undefined | null): string {
    if (!prices || prices.length < 2) return 'var(--d-mute)';
    return prices[prices.length - 1] >= prices[0] ? '#5fc97a' : '#ff6b6b';
  }

  // Visual delta bar — width proportional to |change %| capped at 5%
  function deltaBarWidth(pct: number | null | undefined): string {
    if (pct == null || !Number.isFinite(pct)) return '0%';
    const cap = 5;
    const w = Math.min(Math.abs(pct), cap) / cap * 100;
    return `${w.toFixed(1)}%`;
  }

  // ── FOMC narrowing ─────────────────────────────────────────────
  const fomcSummary = $derived.by(() => {
    const f = fomc as { data?: unknown; ok?: boolean } | null;
    if (!f?.data) return null;
    const d = f.data as Record<string, unknown>;
    const next = d.nextMeeting as Record<string, unknown> | undefined;
    if (!next) return null;
    const dateStr = typeof next.date === 'string' ? next.date : null;
    const daysUntil = typeof next.daysUntil === 'number' ? next.daysUntil : null;
    return { date: dateStr, daysUntil };
  });

  const fomcHistory = $derived.by<FomcHistoryItem[]>(() => {
    const f = fomc as { data?: unknown } | null;
    const history = (f?.data as { history?: FomcHistoryItem[] } | undefined)?.history;
    return Array.isArray(history) ? history.slice(0, 4) : [];
  });

  const thisWeekMacroEvents = $derived.by<WatchlistEvent[]>(() => {
    const now = Date.now();
    const startsAt = Date.parse('2026-05-11T00:00:00+09:00');
    const endsAt = Date.parse('2026-05-18T00:00:00+09:00');
    if (Number.isNaN(startsAt) || Number.isNaN(endsAt) || now < startsAt || now >= endsAt) {
      return [];
    }

    return [
      {
        region: 'US',
        dateLabel: '5/12 Tue',
        title: 'US April CPI',
        note: 'Inflation print that can reprice rate-cut expectations across crypto and equities.',
        impact: 'high'
      },
      {
        region: 'US',
        dateLabel: '5/13 Wed',
        title: 'US April PPI',
        note: 'Confirms whether producer inflation is cooling after the CPI reaction.',
        impact: 'high'
      },
      {
        region: 'US',
        dateLabel: '5/14 Thu',
        title: 'US Initial Jobless Claims',
        note: 'Fastest labor-market pulse of the week for rate-sensitive assets.',
        impact: 'medium'
      },
      {
        region: 'US',
        dateLabel: '5/15 Fri',
        title: 'Powell Chair Term Ends',
        note: 'Leadership transition risk matters for Fed path messaging and rates sensitivity.',
        impact: 'high'
      }
    ];
  });

  const earningsWatch: EarningsWatchItem[] = [
    { symbol: 'HD', name: 'Home Depot', scheduledAt: '2026-05-19T12:00:00Z', session: 'pre', market: 'US' },
    { symbol: 'NVDA', name: 'NVIDIA', scheduledAt: '2026-05-21T20:00:00Z', session: 'post', market: 'US' },
    { symbol: 'WMT', name: 'Walmart', scheduledAt: '2026-05-21T12:00:00Z', session: 'pre', market: 'US' },
    { symbol: 'CRM', name: 'Salesforce', scheduledAt: '2026-05-28T20:00:00Z', session: 'post', market: 'US' },
    { symbol: 'COST', name: 'Costco', scheduledAt: '2026-05-29T20:00:00Z', session: 'post', market: 'US' },
    { symbol: 'AVGO', name: 'Broadcom', scheduledAt: '2026-06-04T20:00:00Z', session: 'post', market: 'US' }
  ];

  const earningsRows = $derived.by(() => {
    const stockMap = new Map<string, { price?: number | null; changePct?: number | null }>();
    for (const stock of usStocks) stockMap.set(stock.symbol, stock);
    for (const stock of krStocks) stockMap.set(stock.symbol, stock);
    return earningsWatch.map((event) => ({
      ...event,
      quote: stockMap.get(event.symbol)
    }));
  });

  const watchlistIssues = $derived.by<WatchlistIssue[]>(() => {
    const usSummary = [
      macroPulse?.dxy?.price != null ? `DXY ${fmtNum(macroPulse.dxy.price, 2)}` : null,
      macroPulse?.us10y?.price != null ? `US10Y ${fmtNum(macroPulse.us10y.price, 2)}%` : null,
      macroPulse?.spx?.price != null ? `SPX ${fmtNum(macroPulse.spx.price, 0)}` : null
    ]
      .filter(Boolean)
      .join(' · ');

    const krSummary = [
      isUsableMarketQuote(krIndices?.kospi) ? `KOSPI ${fmtPct(krIndices?.kospi?.changePct)}` : null,
      isUsableMarketQuote(krIndices?.kosdaq) ? `KOSDAQ ${fmtPct(krIndices?.kosdaq?.changePct)}` : null,
      kimchi?.premium_pct != null ? `Kimchi ${fmtPct(kimchi.premium_pct)}` : null
    ]
      .filter(Boolean)
      .join(' · ');

    const globalSummary = [
      commodities?.gold?.changePct != null ? `Gold ${fmtPct(commodities.gold.changePct)}` : null,
      commodities?.oil?.changePct != null ? `WTI ${fmtPct(commodities.oil.changePct)}` : null,
      nearestEvent?.label ?? null
    ]
      .filter(Boolean)
      .join(' · ');

    return [
      {
        region: 'US',
        title: 'Inflation week sets the tape',
        summary:
          usSummary ||
          'CPI, PPI, and labor data are the main rate-pricing inputs for BTC, tech, and duration this week.',
        tone: 'cautious'
      },
      {
        region: 'KR',
        title: 'Korean equities need foreign-flow confirmation',
        summary:
          krSummary ||
          'Watch KOSPI, KOSDAQ, large-cap semis, and USD/KRW sensitivity as local risk appetite reacts to the US tape.',
        tone: 'mixed'
      },
      {
        region: 'Global',
        title: 'Cross-asset regime still matters',
        summary:
          globalSummary ||
          'Track gold, oil, and the nearest macro catalyst together to judge whether risk-on flow can hold globally.',
        tone: 'mixed'
      }
    ];
  });

  // (regimeLabel/regimeColor removed — only consumers were the deleted
  //  Confluence banner + the L3/L4/L5/L6 inline walls, now all gone.
  //  HeadlineCard owns its own regime tone derivation.)

  function fmtDate(ts: number | string | null | undefined): string {
    if (!ts) return '—';
    const d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const denseTabs: Array<{ id: DenseTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'macro', label: 'Macro' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'calendar', label: 'Events' },
    { id: 'signals', label: 'Signals' }
  ];

  const overviewRows = $derived.by<DenseRow[]>(() => {
    const rows: DenseRow[] = [
      {
        label: 'BTCUSDT',
        sub: '24h top coin pulse',
        value: btcPulse?.price != null ? `$${fmtPrice(btcPulse.price)}` : '—',
        delta: btcPulse?.changePct ?? null,
        href: '/cogochi?symbol=BTCUSDT'
      },
      {
        label: 'Regime',
        sub: confluence?.confidence != null ? `confidence ${Math.round(confluence.confidence * 100)}%` : 'confluence',
        value: regimeChip.label,
        meta: confluence?.score != null ? `score ${Math.round(confluence.score)}` : 'pending'
      },
      {
        label: 'Fear & Greed',
        sub: fg?.classification ?? fgLabel(fg?.value),
        value: fg?.value != null ? String(fg.value) : '—',
        meta: fgLabel(fg?.value)
      },
      {
        label: 'Kimchi',
        sub: 'KRW premium',
        value: fmtPct(kimchi?.premium_pct),
        delta: kimchi?.premium_pct ?? null
      },
      {
        label: 'Next event',
        sub: nearestEvent?.href === '#calendar' ? 'calendar' : 'macro/unlock',
        value: nearestEvent?.label ?? '—',
        meta: macroCalendarItems[0]?.title ?? 'watchlist'
      }
    ];
    return rows;
  });

  const macroRows = $derived.by<DenseRow[]>(() => {
    const rows: DenseRow[] = [
      { label: 'DXY', sub: 'US dollar index', value: fmtNum(macroPulse?.dxy?.price, 2), delta: macroPulse?.dxy?.changePct ?? null },
      { label: 'SPX', sub: 'S&P 500', value: fmtNum(macroPulse?.spx?.price, 0), delta: macroPulse?.spx?.changePct ?? null },
      {
        label: 'US10Y',
        sub: 'Treasury yield',
        value: macroPulse?.us10y?.price != null ? `${fmtNum(macroPulse.us10y.price, 2)}%` : '—',
        delta: macroPulse?.us10y?.changePct ?? null
      }
    ];
    if (isUsableMarketQuote(krIndices?.kospi)) {
      rows.push({ label: 'KOSPI', sub: 'Korea index', value: guardedPrice(krIndices?.kospi, 2), delta: krIndices?.kospi?.changePct });
    }
    if (isUsableMarketQuote(krIndices?.kosdaq)) {
      rows.push({ label: 'KOSDAQ', sub: 'Korea growth', value: guardedPrice(krIndices?.kosdaq, 2), delta: krIndices?.kosdaq?.changePct });
    }
    for (const item of usStocks.slice(0, 3)) {
      rows.push({ label: item.symbol, sub: item.name, value: `$${fmtPrice(item.price)}`, delta: item.changePct });
    }
    if (commodities?.gold) rows.push({ label: 'Gold', sub: 'COMEX', value: `$${fmtNum(commodities.gold.price, 1)}`, delta: commodities.gold.changePct });
    if (commodities?.oil) rows.push({ label: 'WTI', sub: 'NYMEX', value: `$${fmtNum(commodities.oil.price, 2)}`, delta: commodities.oil.changePct });
    return rows;
  });

  const cryptoRows = $derived.by<DenseRow[]>(() => {
    const rows: DenseRow[] = topCoins.slice(0, 6).map((coin) => ({
      label: coin.label,
      sub: coin.name,
      value: `$${fmtPrice(coin.price)}`,
      delta: coin.changePct,
      href: `/cogochi?symbol=${coin.symbol}`
    }));
    if (flip?.currentRate != null) {
      rows.push({
        label: 'Funding',
        sub: fundingDirectionLabel(flip.direction) || 'BTC perp',
        value: `${(flip.currentRate * 100).toFixed(4)}%`,
        delta: flip.currentRate * 100,
        meta: fmtHours(flip.persistedHours)
      });
    }
    if (options?.putCallRatioOi != null) {
      rows.push({ label: 'Options PCR', sub: 'open interest', value: options.putCallRatioOi.toFixed(2), meta: 'Deribit' });
    }
    if (onchain?.onchainMetrics?.mvrv != null) {
      rows.push({ label: 'MVRV', sub: 'CryptoQuant', value: onchain.onchainMetrics.mvrv.toFixed(2), meta: 'onchain' });
    }
    return rows.length > 0 ? rows : [{ label: 'Crypto', sub: 'top coin board', value: 'Loading', meta: secondaryStatus }];
  });

  const calendarRows = $derived.by<DenseRow[]>(() => {
    const rows: DenseRow[] = [];
    for (const item of macroCalendarItems.slice(0, 3)) {
      rows.push({
        label: item.title,
        sub: item.summary,
        value: fmtDate(item.scheduledAt),
        meta: item.impact ? item.impact.toUpperCase() : undefined
      });
    }
    for (const event of earningsRows.slice(0, 3)) {
      rows.push({
        label: event.symbol,
        sub: `${event.name} earnings`,
        value: fmtDate(event.scheduledAt),
        delta: event.quote?.changePct ?? null,
        meta: fmtSession(event.session)
      });
    }
    if (fomcSummary) {
      rows.push({
        label: 'FOMC',
        sub: 'Fed meeting',
        value: fomcSummary.date ?? 'TBD',
        meta: fomcSummary.daysUntil != null ? `D-${fomcSummary.daysUntil}` : undefined
      });
    }
    for (const unlock of unlocks.slice(0, 3)) {
      rows.push({
        label: `${unlock.symbol} unlock`,
        sub: 'token unlock',
        value: compactUsd(unlock.valueUsd),
        meta: timeUntil(unlock.unlockAt)
      });
    }
    return rows.length > 0 ? rows : [{ label: 'Events', sub: 'macro + earnings + FOMC', value: 'Loading', meta: secondaryStatus }];
  });

  const signalRows = $derived.by<DenseRow[]>(() => {
    const rows: DenseRow[] = [];
    for (const pattern of topPatterns.slice(0, 4)) {
      rows.push({
        label: pattern.name ?? pattern.slug,
        sub: `n=${pattern.samples_30d ?? 0}`,
        value: `α${fmtNum(pattern.avg_alpha, 0)}`,
        delta: pattern.win_rate != null ? pattern.win_rate * 100 : null,
        href: `/patterns/${pattern.slug}?symbol=BTCUSDT`
      });
    }
    for (const event of derivEvents.slice(0, 3)) {
      rows.push({ label: event.tag, sub: event.text, value: timeAgo(event.createdAt), meta: event.level.toUpperCase() });
    }
    for (const token of dexHot.slice(0, 3)) {
      rows.push({ label: token.symbol ?? 'DEX', sub: token.chainId ?? 'trending', value: compactUsd(token.volume24h), delta: token.change24h, href: token.url });
    }
    for (const whale of whales.slice(0, 2)) {
      rows.push({ label: whale.address ?? 'whale', sub: whale.symbol ?? 'position', value: compactUsd(whale.sizeUsd), delta: whale.pnl30dPct, meta: whale.netPosition?.toUpperCase() });
    }
    return rows.length > 0 ? rows : [{ label: 'Signals', sub: eventsStatus === 'loading' ? 'events feed loading' : 'patterns/events', value: 'Loading', meta: eventsStatus }];
  });

  const activeDenseRows = $derived.by<DenseRow[]>(() => {
    if (denseTab === 'macro') return macroRows;
    if (denseTab === 'crypto') return cryptoRows;
    if (denseTab === 'calendar') return calendarRows;
    if (denseTab === 'signals') return signalRows;
    return overviewRows;
  });

  const activeTabContext = $derived.by<DenseTabContext>(() => {
    if (denseTab === 'macro') {
      return {
        eyebrow: 'Selected · Macro',
        title: macroPulse?.us10y?.price != null ? `Rates ${fmtNum(macroPulse.us10y.price, 2)}%` : 'Macro tape',
        body: 'Dollar, rates, US tech, Korea, and commodities are grouped here so risk backdrop is not split across cards.',
        primary: macroPulse?.dxy?.price != null ? `DXY ${fmtNum(macroPulse.dxy.price, 2)}` : 'DXY pending',
        secondary: isUsableMarketQuote(krIndices?.kospi) ? `KOSPI ${fmtPct(krIndices?.kospi?.changePct)}` : 'KR indices delayed',
        tone: 'neutral'
      };
    }
    if (denseTab === 'crypto') {
      return {
        eyebrow: 'Selected · Crypto',
        title: biggestMover ? `${biggestMover.label} leads ${fmtPct(biggestMover.changePct)}` : 'Crypto pulse',
        body: 'Top coins, funding, options, and onchain context stay together before the deeper card grid.',
        primary: btcPulse?.price != null ? `BTC $${fmtPrice(btcPulse.price)}` : 'BTC pending',
        secondary: flip?.currentRate != null ? `Funding ${(flip.currentRate * 100).toFixed(4)}%` : 'Funding pending',
        tone: (btcPulse?.changePct ?? 0) >= 0 ? 'positive' : 'warning'
      };
    }
    if (denseTab === 'calendar') {
      return {
        eyebrow: 'Selected · Events',
        title: nearestEvent?.label ?? 'No urgent catalyst',
        body: 'Macro events, earnings, FOMC path, and token unlocks are treated as one catalyst queue.',
        primary: macroCalendarItems[0]?.title ?? 'Macro calendar pending',
        secondary: earningsRows[0] ? `${earningsRows[0].symbol} ${fmtDate(earningsRows[0].scheduledAt)}` : 'Earnings pending',
        tone: nearestEvent?.daysUntil != null && nearestEvent.daysUntil <= 1 ? 'warning' : 'neutral'
      };
    }
    if (denseTab === 'signals') {
      return {
        eyebrow: 'Selected · Signals',
        title: topPatterns[0]?.name ?? derivEvents[0]?.tag ?? 'Signal feed',
        body: 'Patterns, derivatives events, DEX momentum, and whale flow are grouped as action signals.',
        primary: topPatterns[0] ? `α${fmtNum(topPatterns[0].avg_alpha, 0)}` : `${derivEvents.length} live events`,
        secondary: dexHot[0]?.symbol ? `${dexHot[0].symbol} ${fmtPct(dexHot[0].change24h)}` : 'DEX feed pending',
        tone: topPatterns.length > 0 || derivEvents.length > 0 ? 'positive' : 'neutral'
      };
    }
    return {
      eyebrow: 'Selected · Overview',
      title: regimeChip.label,
      body: 'A compact decision board: regime, BTC, sentiment, premium, and next catalyst before you scan the rest.',
      primary: biggestMover ? `${biggestMover.label} ${fmtPct(biggestMover.changePct)}` : 'Mover pending',
      secondary: nearestEvent?.label ?? 'Next catalyst pending',
      tone: regimeChip.tone === 'pos' ? 'positive' : regimeChip.tone === 'neg' ? 'warning' : 'neutral'
    };
  });

  const boardStatus = $derived.by(() => {
    if (secondaryStatus === 'loading') return 'syncing markets';
    if (eventsStatus === 'loading') return 'events loading';
    if (deepStatus === 'loading') return 'extended loading';
    return 'live';
  });

  const DAILY_STICKY_OFFSET = 112;

  function getDailyScrollRoot(): HTMLElement | null {
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;
    const root = document.getElementById('main-content');
    if (!(root instanceof HTMLElement)) return null;
    const overflowY = window.getComputedStyle(root).overflowY;
    if (!/(auto|scroll|overlay)/.test(overflowY)) return null;
    if (root.scrollHeight <= root.clientHeight + 4) return null;
    return root;
  }

  function scrollToDailyAnchor(targetId: string, behavior: ScrollBehavior = 'smooth') {
    const root = getDailyScrollRoot();
    if (targetId === 'daily-top') {
      if (root) root.scrollTo({ top: 0, behavior });
      else window.scrollTo({ top: 0, behavior });
      return;
    }
    const target = document.getElementById(targetId);
    if (!target) return;
    if (!root) {
      const top = window.scrollY + target.getBoundingClientRect().top - DAILY_STICKY_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior });
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const top = root.scrollTop + targetRect.top - rootRect.top - DAILY_STICKY_OFFSET;
    root.scrollTo({ top: Math.max(0, top), behavior });
  }

</script>

<svelte:head>
  <title>Cogochi Daily — Global Market Briefing · Macro · Crypto · Equities · Onchain</title>
  <meta
    name="description"
    content="Fear & Greed, BTC dominance, top 10 coins, kimchi premium, funding, MAG7, KOSPI/KOSDAQ, top 10 Korean stocks, gold/oil, options PCR, onchain MVRV/SOPR, whale positions, FOMC and token unlock calendar — a daily global market briefing curated by AI."
  />
  <meta property="og:title" content="Cogochi Daily — Global Market Briefing" />
  <meta property="og:description" content="Crypto + Korean equities + US equities + macro + onchain — one-page briefing" />
  <meta property="og:type" content="website" />
</svelte:head>

<div id="daily-top" class="page" bind:this={dailyRootEl}>
  <SubRail active="daily" />
  <PulseStrip
    btc={btcPulse}
    feargreed={fgPulse}
    confluence={confluencePulse}
    kimchi={kimchiPulse}
    macro={macroPulse}
    generatedAt={data.generatedAt}
  />

  <!-- ── Newspaper Masthead ────────────────────────────────────── -->
  <header class="np-mast">
    <div class="np-mast-top">
      <span class="np-vol">Cogochi Daily</span>
      <h1 class="np-title">WTD DAILY</h1>
      <time class="np-date">{new Date(data.generatedAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</time>
    </div>
    <div class="np-mast-rule"></div>
    <p class="np-tagline">Global Markets Intelligence · Crypto · Macro · Korean Equities · Onchain</p>
    <div class="np-mast-rule"></div>
    <div class="np-live-row">
      {#if btcPulse?.price != null}
        <span class="np-live-item">BTC <strong style:color={pctColor(btcPulse.changePct)}>${fmtPrice(btcPulse.price)}</strong></span>
      {/if}
      {#if macroPulse?.spx?.price != null}
        <span class="np-live-item">SPX <strong style:color={pctColor(macroPulse.spx.changePct)}>{fmtNum(macroPulse.spx.price, 0)}</strong></span>
      {/if}
      {#if macroPulse?.dxy?.price != null}
        <span class="np-live-item">DXY <strong style:color={pctColor(-(macroPulse.dxy.changePct ?? 0))}>{fmtNum(macroPulse.dxy.price, 2)}</strong></span>
      {/if}
      {#if commodities?.gold?.price != null}
        <span class="np-live-item">Gold <strong style:color={pctColor(commodities.gold.changePct)}>${fmtNum(commodities.gold.price, 0)}</strong></span>
      {/if}
      {#if fgPulse}
        <span class="np-live-item">F&amp;G <strong style:color={fgColor(fgPulse.value)}>{fgPulse.value} {fgLabel(fgPulse.value)}</strong></span>
      {/if}
      {#if kimchiPulse?.premium_pct != null}
        <span class="np-live-item">Kimchi <strong style:color={pctColor(kimchiPulse.premium_pct)}>{fmtPct(kimchiPulse.premium_pct)}</strong></span>
      {/if}
      <span class="np-live-item np-upd">Updated {new Date(data.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </header>

  <!-- ── Breaking ticker ────────────────────────────────────────── -->
  {#if news.length > 0 || marketNews.length > 0}
  <div class="np-breaking" aria-label="Breaking news ticker">
    <span class="np-break-label">BREAKING</span>
    <div class="np-ticker-mask">
      <div class="np-ticker-inner">
        {#each news.slice(0, 8) as n (n.id + 'a')}
          <a href={n.url} target="_blank" rel="noopener noreferrer" class="np-tick-item">{n.title}</a>
          <span class="np-tick-sep" aria-hidden="true">◆</span>
        {/each}
        {#each marketNews.slice(0, 5) as n (n.id + 'ma')}
          <a href={n.link ?? '#'} target="_blank" rel="noopener noreferrer" class="np-tick-item">{n.title ?? ''}</a>
          <span class="np-tick-sep" aria-hidden="true">◆</span>
        {/each}
        {#each news.slice(0, 8) as n (n.id + 'b')}
          <a href={n.url} target="_blank" rel="noopener noreferrer" class="np-tick-item">{n.title}</a>
          <span class="np-tick-sep" aria-hidden="true">◆</span>
        {/each}
        {#each marketNews.slice(0, 5) as n (n.id + 'mb')}
          <a href={n.link ?? '#'} target="_blank" rel="noopener noreferrer" class="np-tick-item">{n.title ?? ''}</a>
          <span class="np-tick-sep" aria-hidden="true">◆</span>
        {/each}
      </div>
    </div>
  </div>
  {/if}

  <!-- ── 3-Column Editorial ──────────────────────────────────────── -->
  <div class="np-editorial">

    <!-- Col 1: Hero -->
    <div class="np-col np-hero-col">
      <div class="np-col-hed">시장 현황</div>
      <div class="np-hero-pb">
        {#if btcPulse?.price != null}
          <div class="np-hero-price">${fmtPrice(btcPulse.price)}</div>
          <div class="np-hero-meta">
            <span class="np-hero-lbl">Bitcoin</span>
            <span class="np-regime-chip" data-tone={regimeChip.tone}>{regimeChip.label}</span>
            {#if btcPulse.changePct != null}
              <span style:color={pctColor(btcPulse.changePct)} class="np-hero-d">{btcPulse.changePct > 0 ? '+' : ''}{fmtPct(btcPulse.changePct)} 24h</span>
            {/if}
          </div>
        {:else}
          <div class="np-hero-price">—</div>
          <div class="np-hero-meta"><span class="np-hero-lbl">Bitcoin</span></div>
        {/if}
      </div>
      <p class="np-deck">{regimeDeck}</p>
      <div class="np-signals">
        {#if fgPulse}
          <div class="np-sig"><span class="np-sig-l">Fear &amp; Greed</span><span class="np-sig-v" style:color={fgColor(fgPulse.value)}>{fgPulse.value} · {fgLabel(fgPulse.value)}</span></div>
        {/if}
        {#if flip?.currentRate != null}
          <div class="np-sig"><span class="np-sig-l">BTC Funding</span><span class="np-sig-v" style:color={pctColor(flip.currentRate * 100)}>{(flip.currentRate * 100).toFixed(4)}%</span></div>
        {/if}
        {#if options?.putCallRatioOi != null}
          <div class="np-sig"><span class="np-sig-l">PCR (OI)</span><span class="np-sig-v">{options.putCallRatioOi.toFixed(2)} · {options.putCallRatioOi < 0.7 ? '강세' : options.putCallRatioOi > 1.0 ? '약세' : '중립'}</span></div>
        {/if}
        {#if kimchi?.premium_pct != null}
          <div class="np-sig"><span class="np-sig-l">Kimchi</span><span class="np-sig-v" style:color={pctColor(kimchi.premium_pct)}>{fmtPct(kimchi.premium_pct)}</span></div>
        {/if}
        {#if onchain?.onchainMetrics?.mvrv != null}
          <div class="np-sig"><span class="np-sig-l">MVRV</span><span class="np-sig-v">{onchain.onchainMetrics.mvrv.toFixed(2)} · {onchain.onchainMetrics.mvrv > 3.5 ? '과열' : onchain.onchainMetrics.mvrv < 1 ? '저평가' : '정상'}</span></div>
        {/if}
        {#if macroPulse?.dxy?.price != null}
          <div class="np-sig"><span class="np-sig-l">DXY</span><span class="np-sig-v" style:color={pctColor(-(macroPulse.dxy.changePct ?? 0))}>{fmtNum(macroPulse.dxy.price, 2)}</span></div>
        {/if}
        {#if btcDominance != null}
          <div class="np-sig"><span class="np-sig-l">BTC.D</span><span class="np-sig-v">{btcDominance.toFixed(1)}%</span></div>
        {/if}
      </div>
    </div>

    <div class="np-col-rule" aria-hidden="true"></div>

    <!-- Col 2: News + calendar -->
    <div class="np-col np-news-col">
      <div class="np-col-hed">뉴스 &amp; 이벤트</div>
      {#if news.length > 0 || marketNews.length > 0}
        <ul class="np-news-list">
          {#each news.slice(0, 5) as n (n.id)}
            <li class="np-news-item">
              <a href={n.url} target="_blank" rel="noopener noreferrer" class="np-news-title">{n.title}</a>
              <div class="np-news-byline"><span class="np-news-src">{n.source}</span><span class="np-news-time">{timeAgo(n.publishedAt * 1000)}</span></div>
            </li>
          {/each}
          {#each marketNews.slice(0, 4) as n (n.id)}
            <li class="np-news-item">
              <a href={n.link ?? '#'} target="_blank" rel="noopener noreferrer" class="np-news-title">{n.title ?? ''}</a>
              <div class="np-news-byline">{#if n.source}<span class="np-news-src">{n.source}</span>{/if}{#if n.publishedAt}<span class="np-news-time">{timeAgo(n.publishedAt)}</span>{/if}</div>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="np-empty">뉴스 로딩 중…</div>
      {/if}
      <div class="np-col-subhed">이번 주 이벤트</div>
      {#if macroCalendarItems.length > 0}
        <ul class="np-cal-list">
          {#each macroCalendarItems.slice(0, 4) as ev (ev.id)}
            <li class="np-cal-item">
              <span class="np-cal-impact" data-impact={ev.impact ?? 'medium'}>{ev.impact?.toUpperCase() ?? 'EVT'}</span>
              <span class="np-cal-title">{ev.title}</span>
              <span class="np-cal-when">{fmtDate(ev.scheduledAt)}</span>
            </li>
          {/each}
        </ul>
      {:else if fomcSummary}
        <div class="np-cal-item">
          <span class="np-cal-impact" data-impact="high">FOMC</span>
          <span class="np-cal-title">{fomcSummary.date ?? 'TBD'}</span>
          {#if fomcSummary.daysUntil != null}<span class="np-cal-when">D-{fomcSummary.daysUntil}</span>{/if}
        </div>
      {:else}
        <div class="np-empty-sm">이벤트 없음</div>
      {/if}
    </div>

    <div class="np-col-rule" aria-hidden="true"></div>

    <!-- Col 3: Market indicators -->
    <div class="np-col np-ind-col">
      <div class="np-col-hed">마켓 지표</div>
      <table class="np-ind-table">
        <tbody>
          {#if isUsableMarketQuote(krIndices?.kospi)}
            <tr><td class="np-ind-lbl">KOSPI</td><td class="np-ind-spark"><svg viewBox="0 0 40 12" preserveAspectRatio="none"><path d={rowSparkPath(krIndices?.kospi?.spark, 40, 12)} stroke={rowSparkColor(krIndices?.kospi?.spark)} stroke-width="1" fill="none" /></svg></td><td class="np-ind-val">{guardedPrice(krIndices?.kospi, 2)}</td><td class="np-ind-delta" style:color={pctColor(krIndices?.kospi?.changePct)}>{guardedPct(krIndices?.kospi)}</td></tr>
          {/if}
          {#if isUsableMarketQuote(krIndices?.kosdaq)}
            <tr><td class="np-ind-lbl">KOSDAQ</td><td class="np-ind-spark"><svg viewBox="0 0 40 12" preserveAspectRatio="none"><path d={rowSparkPath(krIndices?.kosdaq?.spark, 40, 12)} stroke={rowSparkColor(krIndices?.kosdaq?.spark)} stroke-width="1" fill="none" /></svg></td><td class="np-ind-val">{guardedPrice(krIndices?.kosdaq, 2)}</td><td class="np-ind-delta" style:color={pctColor(krIndices?.kosdaq?.changePct)}>{guardedPct(krIndices?.kosdaq)}</td></tr>
          {/if}
          {#if macroPulse?.spx?.price != null}
            <tr><td class="np-ind-lbl">SPX</td><td class="np-ind-spark"></td><td class="np-ind-val">{fmtNum(macroPulse.spx.price, 0)}</td><td class="np-ind-delta" style:color={pctColor(macroPulse.spx.changePct)}>{fmtPct(macroPulse.spx.changePct)}</td></tr>
          {/if}
          {#if btcPulse?.price != null}
            <tr><td class="np-ind-lbl">BTC</td><td class="np-ind-spark">{#if btcSeries?.prices}<svg viewBox="0 0 40 12" preserveAspectRatio="none"><path d={rowSparkPath(btcSeries.prices, 40, 12)} stroke={rowSparkColor(btcSeries.prices)} stroke-width="1" fill="none" /></svg>{/if}</td><td class="np-ind-val">${fmtPrice(btcPulse.price)}</td><td class="np-ind-delta" style:color={pctColor(btcPulse.changePct)}>{fmtPct(btcPulse.changePct)}</td></tr>
          {/if}
          {#if commodities?.gold?.price != null}
            <tr><td class="np-ind-lbl">Gold</td><td class="np-ind-spark"><svg viewBox="0 0 40 12" preserveAspectRatio="none"><path d={rowSparkPath(commodities.gold.spark, 40, 12)} stroke={rowSparkColor(commodities.gold.spark)} stroke-width="1" fill="none" /></svg></td><td class="np-ind-val">${fmtNum(commodities.gold.price, 0)}</td><td class="np-ind-delta" style:color={pctColor(commodities.gold.changePct)}>{fmtPct(commodities.gold.changePct)}</td></tr>
          {/if}
          {#if commodities?.oil?.price != null}
            <tr><td class="np-ind-lbl">WTI</td><td class="np-ind-spark"><svg viewBox="0 0 40 12" preserveAspectRatio="none"><path d={rowSparkPath(commodities.oil.spark, 40, 12)} stroke={rowSparkColor(commodities.oil.spark)} stroke-width="1" fill="none" /></svg></td><td class="np-ind-val">${fmtNum(commodities.oil.price, 2)}</td><td class="np-ind-delta" style:color={pctColor(commodities.oil.changePct)}>{fmtPct(commodities.oil.changePct)}</td></tr>
          {/if}
          {#if macroPulse?.dxy?.price != null}
            <tr><td class="np-ind-lbl">DXY</td><td class="np-ind-spark"></td><td class="np-ind-val">{fmtNum(macroPulse.dxy.price, 2)}</td><td class="np-ind-delta" style:color={pctColor(-(macroPulse.dxy.changePct ?? 0))}>{fmtPct(macroPulse.dxy.changePct)}</td></tr>
          {/if}
          {#if macroPulse?.us10y?.price != null}
            <tr><td class="np-ind-lbl">US10Y</td><td class="np-ind-spark"></td><td class="np-ind-val">{fmtNum(macroPulse.us10y.price, 2)}%</td><td class="np-ind-delta" style:color={pctColor(macroPulse.us10y.changePct)}>{fmtPct(macroPulse.us10y.changePct)}</td></tr>
          {/if}
        </tbody>
      </table>
      {#if fg}
        <div class="np-fg-mini">
          <svg class="np-fg-arc" viewBox="0 0 80 48" aria-hidden="true">
            <path d="M 8 40 A 32 32 0 0 1 72 40" fill="none" stroke="rgba(201,169,110,0.12)" stroke-width="5" stroke-linecap="round" />
            <path d="M 8 40 A 32 32 0 0 1 72 40" fill="none" stroke={fgColor(fg.value)} stroke-width="5" stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset={(100 - Math.min(100, Math.max(0, fg.value))).toFixed(1)} />
          </svg>
          <div class="np-fg-val" style:color={fgColor(fg.value)}>{fg.value}</div>
          <div class="np-fg-lbl">{fgLabel(fg.value)}</div>
        </div>
      {/if}
    </div>

  </div>

  <!-- ── Top Coin Board ─────────────────────────────────────────── -->
  <div class="np-section-head" id="coins"><span>TOP COINS</span></div>
  <TopCoinBoard
    {topCoins}
    {onCoinEnter}
    {onCoinLeave}
    {fmtPrice}
    {fmtPct}
    {compactUsd}
    {pctColor}
    {sparkColor}
    {sparkPath}
    {sparkArea}
  />

  <div bind:this={deepTriggerEl} class="io-sentinel" aria-hidden="true"></div>

  <main id="daily-data" class="np-data">

    <!-- ── 크립토 시그널 ───────────────────────────────────────── -->
    <div class="np-section-head" id="macro"><span>크립토 시그널</span></div>
    <div class="np-card-grid">

    <section class="card card-crypto" aria-label="Crypto indicators">
      <div class="card-h">
        <span class="card-title">Crypto Indicators</span>
        <span class="card-meta">
          <span class="src-chip">Mempool · Bybit</span>
          <span class="card-sub">Premium · Funding · Network</span>
        </span>
      </div>
      <div class="market-grid">
        {#if kimchi?.premium_pct != null}
          <div class="metric">
            <div class="metric-l">Kimchi Premium</div>
            <div class="metric-v" style:color={pctColor(kimchi.premium_pct)}>{fmtPct(kimchi.premium_pct)}</div>
          </div>
        {/if}
        {#if flip?.currentRate != null}
          <div class="metric">
            <div class="metric-l">BTC Funding</div>
            <div class="metric-v" style:color={pctColor(flip.currentRate * 100)}>{(flip.currentRate * 100).toFixed(4)}%</div>
            {#if flip.direction}
              <div class="metric-sub">
                {fundingDirectionLabel(flip.direction)}
                {#if flip.persistedHours != null && flip.persistedHours > 0}· {fmtHours(flip.persistedHours)}{/if}
              </div>
            {/if}
          </div>
        {/if}
        {#if thermo?.fastestFee != null}
          <div class="metric">
            <div class="metric-l">BTC Fees</div>
            <div class="metric-v">{thermo.fastestFee} <span class="metric-unit">sat/vB</span></div>
          </div>
        {/if}
        {#if thermo?.mempoolPending != null}
          <div class="metric">
            <div class="metric-l">Mempool</div>
            <div class="metric-v">{compactNum(thermo.mempoolPending)}</div>
            <div class="metric-sub">pending tx</div>
          </div>
        {/if}
      </div>
    </section>

    </div><!-- end np-card-grid macro -->

    <!-- ── 거시경제 & 크립토 심층 ──────────────────────────────── -->
    <div class="np-section-head" id="crypto"><span>거시경제 &amp; 크립토</span></div>
    <div class="np-card-grid">

    <!-- Card: Fear & Greed + 14d sparkbar -->
    <section class="card card-feargreed" aria-label="Fear &amp; Greed index">
      <div class="card-h">
        <span class="card-title">Fear &amp; Greed</span>
        <span class="card-meta">
          <span class="src-chip">Alternative.me</span>
          <span class="card-sub">14d</span>
        </span>
      </div>
      {#if fg}
        <div class="fg-main" style:color={fgColor(fg.value)}>
          <svg class="fg-gauge" viewBox="0 0 120 70" aria-hidden="true">
            <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(249,216,194,0.10)" stroke-width="6" stroke-linecap="round" />
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={fgColor(fg.value)}
              stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="157"
              stroke-dashoffset={(157 - (157 * Math.min(100, Math.max(0, fg.value)) / 100)).toFixed(1)}
            />
          </svg>
          <div class="fg-value">{fg.value}</div>
          <div class="fg-label">{fgLabel(fg.value)}</div>
        </div>
        {#if fgHistory.length > 0}
          <div class="fg-strip" aria-hidden="true">
            {#each fgHistory.slice(-14) as h, i (`${h.timestampMs ?? i}-${i}`)}
              <span
                class="fg-bar"
                style:height="{Math.max(8, h.value * 0.4)}px"
                style:background={fgColor(h.value)}
                title="{h.value}"
              ></span>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="empty">No data</div>
      {/if}
    </section>

    <!-- Card: KR Indices (KOSPI/KOSDAQ) -->
    <section class="card card-kr" aria-label="Korean indices">
      <div class="card-h">
        <span class="card-title">Korean Indices</span>
        <span class="card-meta">
          <span class="src-chip">Yahoo</span>
          <span class="card-sub">KOSPI · KOSDAQ</span>
        </span>
      </div>
      {#if isUsableMarketQuote(krIndices?.kospi) || isUsableMarketQuote(krIndices?.kosdaq)}
        <ul class="macro-list">
          {#if isUsableMarketQuote(krIndices?.kospi)}
            <li class="macro-row">
              <span class="macro-l">KOSPI</span>
              <span class="macro-v">{guardedPrice(krIndices?.kospi, 2)}</span>
              <span class="row-spark" aria-hidden="true">
                <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                  <path d={rowSparkArea(krIndices?.kospi?.spark)} fill={rowSparkColor(krIndices?.kospi?.spark)} fill-opacity="0.12" />
                  <path d={rowSparkPath(krIndices?.kospi?.spark)} stroke={rowSparkColor(krIndices?.kospi?.spark)} stroke-width="1.2" fill="none" />
                </svg>
              </span>
              <span class="macro-c" style:color={pctColor(krIndices?.kospi?.changePct)}>
                <span class="delta-bar" style:width={deltaBarWidth(krIndices?.kospi?.changePct)} style:background={pctColor(krIndices?.kospi?.changePct)}></span>
                {guardedPct(krIndices?.kospi)}
              </span>
            </li>
          {/if}
          {#if isUsableMarketQuote(krIndices?.kosdaq)}
            <li class="macro-row">
              <span class="macro-l">KOSDAQ</span>
              <span class="macro-v">{guardedPrice(krIndices?.kosdaq, 2)}</span>
              <span class="row-spark" aria-hidden="true">
                <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                  <path d={rowSparkArea(krIndices?.kosdaq?.spark)} fill={rowSparkColor(krIndices?.kosdaq?.spark)} fill-opacity="0.12" />
                  <path d={rowSparkPath(krIndices?.kosdaq?.spark)} stroke={rowSparkColor(krIndices?.kosdaq?.spark)} stroke-width="1.2" fill="none" />
                </svg>
              </span>
              <span class="macro-c" style:color={pctColor(krIndices?.kosdaq?.changePct)}>
                <span class="delta-bar" style:width={deltaBarWidth(krIndices?.kosdaq?.changePct)} style:background={pctColor(krIndices?.kosdaq?.changePct)}></span>
                {guardedPct(krIndices?.kosdaq)}
              </span>
            </li>
          {/if}
        </ul>
      {:else if secondaryStatus === 'loading'}
        <div class="skel-rows">
          {#each [72, 55, 90] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {:else}
        <div class="empty">No index data</div>
      {/if}
    </section>

    <!-- Card: KR Top Stocks -->
    <section class="card card-kr-stocks" aria-label="Korean stocks">
      <div class="card-h">
        <span class="card-title">Korean Stocks</span>
        <span class="card-meta">
          <span class="src-chip">Yahoo Finance</span>
          <span class="card-sub">Top KR</span>
        </span>
      </div>
      {#if krStocks.length > 0}
        <ul class="macro-list">
          {#each krStocks.slice(0, 8) as s (s.symbol)}
            {#if isUsableMarketQuote(s)}
              <li class="macro-row">
                <span class="macro-l">{s.symbol}</span>
                <span class="macro-v">{guardedPrice(s, 0)}</span>
                <span class="row-spark" aria-hidden="true">
                  <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                    <path d={rowSparkArea(s.spark)} fill={rowSparkColor(s.spark)} fill-opacity="0.12" />
                    <path d={rowSparkPath(s.spark)} stroke={rowSparkColor(s.spark)} stroke-width="1.2" fill="none" />
                  </svg>
                </span>
                <span class="macro-c" style:color={pctColor(s.changePct)}>
                  <span class="delta-bar" style:width={deltaBarWidth(s.changePct)} style:background={pctColor(s.changePct)}></span>
                  {guardedPct(s)}
                </span>
              </li>
            {/if}
          {/each}
        </ul>
      {:else}
        <div class="skel-rows">
          {#each [72, 55, 90, 68, 80, 60, 75, 50] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: Commodities -->
    <section class="card card-commodities" aria-label="Commodities">
      <div class="card-h">
        <span class="card-title">Commodities</span>
        <span class="card-meta">
          <span class="src-chip">COMEX · NYMEX</span>
          <span class="card-sub">Gold · Oil · Silver · Copper</span>
        </span>
      </div>
      {#if commodities && (commodities.gold || commodities.oil || commodities.silver || commodities.copper)}
        <ul class="macro-list">
          {#if commodities.gold}
            <li class="macro-row">
              <span class="macro-l">Gold</span>
              <span class="macro-v">${fmtNum(commodities.gold.price, 1)}</span>
              <span class="row-spark" aria-hidden="true">
                <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                  <path d={rowSparkArea(commodities.gold.spark)} fill={rowSparkColor(commodities.gold.spark)} fill-opacity="0.12" />
                  <path d={rowSparkPath(commodities.gold.spark)} stroke={rowSparkColor(commodities.gold.spark)} stroke-width="1.2" fill="none" />
                </svg>
              </span>
              <span class="macro-c" style:color={pctColor(commodities.gold.changePct)}>
                <span class="delta-bar" style:width={deltaBarWidth(commodities.gold.changePct)} style:background={pctColor(commodities.gold.changePct)}></span>
                {fmtPct(commodities.gold.changePct)}
              </span>
            </li>
          {/if}
          {#if commodities.oil}
            <li class="macro-row">
              <span class="macro-l">WTI Oil</span>
              <span class="macro-v">${fmtNum(commodities.oil.price, 2)}</span>
              <span class="row-spark" aria-hidden="true">
                <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                  <path d={rowSparkArea(commodities.oil.spark)} fill={rowSparkColor(commodities.oil.spark)} fill-opacity="0.12" />
                  <path d={rowSparkPath(commodities.oil.spark)} stroke={rowSparkColor(commodities.oil.spark)} stroke-width="1.2" fill="none" />
                </svg>
              </span>
              <span class="macro-c" style:color={pctColor(commodities.oil.changePct)}>
                <span class="delta-bar" style:width={deltaBarWidth(commodities.oil.changePct)} style:background={pctColor(commodities.oil.changePct)}></span>
                {fmtPct(commodities.oil.changePct)}
              </span>
            </li>
          {/if}
          {#if commodities.silver}
            <li class="macro-row">
              <span class="macro-l">Silver</span>
              <span class="macro-v">${fmtNum(commodities.silver.price, 2)}</span>
              <span class="row-spark" aria-hidden="true">
                <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                  <path d={rowSparkArea(commodities.silver.spark)} fill={rowSparkColor(commodities.silver.spark)} fill-opacity="0.12" />
                  <path d={rowSparkPath(commodities.silver.spark)} stroke={rowSparkColor(commodities.silver.spark)} stroke-width="1.2" fill="none" />
                </svg>
              </span>
              <span class="macro-c" style:color={pctColor(commodities.silver.changePct)}>
                <span class="delta-bar" style:width={deltaBarWidth(commodities.silver.changePct)} style:background={pctColor(commodities.silver.changePct)}></span>
                {fmtPct(commodities.silver.changePct)}
              </span>
            </li>
          {/if}
          {#if commodities.copper}
            <li class="macro-row">
              <span class="macro-l">Copper</span>
              <span class="macro-v">${fmtNum(commodities.copper.price, 3)}</span>
              <span class="row-spark" aria-hidden="true">
                <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                  <path d={rowSparkArea(commodities.copper.spark)} fill={rowSparkColor(commodities.copper.spark)} fill-opacity="0.12" />
                  <path d={rowSparkPath(commodities.copper.spark)} stroke={rowSparkColor(commodities.copper.spark)} stroke-width="1.2" fill="none" />
                </svg>
              </span>
              <span class="macro-c" style:color={pctColor(commodities.copper.changePct)}>
                <span class="delta-bar" style:width={deltaBarWidth(commodities.copper.changePct)} style:background={pctColor(commodities.copper.changePct)}></span>
                {fmtPct(commodities.copper.changePct)}
              </span>
            </li>
          {/if}
        </ul>
      {:else}
        <div class="skel-rows">
          {#each [72, 55, 90, 68] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: US Stocks (MAG7 + SPX) -->
    <section class="card card-us-stocks" aria-label="US equities">
      <div class="card-h">
        <span class="card-title">US Equities</span>
        <span class="card-meta">
          <span class="src-chip">Yahoo Finance</span>
          <span class="card-sub">MAG7 · SPX · NDX</span>
        </span>
      </div>
      {#if usStocks.length > 0 || macroPulse?.spx?.price != null}
        <ul class="macro-list">
          {#if macroPulse?.spx?.price != null}
            <li class="macro-row">
              <span class="macro-l">SPX</span>
              <span class="macro-v">{fmtNum(macroPulse.spx.price, 0)}</span>
              <span class="macro-c" style:color={pctColor(macroPulse.spx.changePct)}>{fmtPct(macroPulse.spx.changePct)}</span>
            </li>
          {/if}
          {#each usStocks.slice(0, 7) as s (s.symbol)}
            {#if isUsableMarketQuote(s)}
              <li class="macro-row">
                <span class="macro-l">{s.symbol}</span>
                <span class="macro-v">${fmtPrice(s.price)}</span>
                <span class="row-spark" aria-hidden="true">
                  <svg viewBox="0 0 64 18" preserveAspectRatio="none">
                    <path d={rowSparkArea(s.spark)} fill={rowSparkColor(s.spark)} fill-opacity="0.12" />
                    <path d={rowSparkPath(s.spark)} stroke={rowSparkColor(s.spark)} stroke-width="1.2" fill="none" />
                  </svg>
                </span>
                <span class="macro-c" style:color={pctColor(s.changePct)}>
                  <span class="delta-bar" style:width={deltaBarWidth(s.changePct)} style:background={pctColor(s.changePct)}></span>
                  {guardedPct(s)}
                </span>
              </li>
            {/if}
          {/each}
        </ul>
      {:else}
        <div class="skel-rows">
          {#each [72, 55, 90, 68, 80, 60, 75, 50] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: BTC Options — always visible, shows skeleton until deep data loads -->
    <section class="card card-options" aria-label="BTC options">
      <div class="card-h">
        <span class="card-title">BTC Options</span>
        <span class="card-meta">
          <span class="src-chip">Deribit</span>
          <span class="card-sub">PCR · Skew · Max Pain</span>
        </span>
      </div>
      {#if options && (options.putCallRatioOi != null || options.putCallRatioVol != null)}
        <div class="market-grid">
          <div class="metric">
            <div class="metric-l">PCR (OI)</div>
            <div class="metric-v">{options.putCallRatioOi != null ? options.putCallRatioOi.toFixed(2) : '—'}</div>
          </div>
          <div class="metric">
            <div class="metric-l">PCR (Vol)</div>
            <div class="metric-v">{options.putCallRatioVol != null ? options.putCallRatioVol.toFixed(2) : '—'}</div>
          </div>
          {#if options.skew25d != null}
            <div class="metric">
              <div class="metric-l">25Δ Skew</div>
              <div class="metric-v" style:color={pctColor(-options.skew25d)}>{fmtPct(options.skew25d)}</div>
            </div>
          {/if}
          {#if options.gamma?.maxPainDistancePct != null}
            <div class="metric">
              <div class="metric-l">Max Pain Δ</div>
              <div class="metric-v" style:color={pctColor(options.gamma.maxPainDistancePct)}>{fmtPct(options.gamma.maxPainDistancePct)}</div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="skel-rows">
          {#each [75, 55, 85, 60] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: Onchain (CryptoQuant) — always visible -->
    <section class="card card-onchain" aria-label="Onchain metrics">
      <div class="card-h">
        <span class="card-title">Onchain BTC</span>
        <span class="card-meta">
          <span class="src-chip">CryptoQuant</span>
          <span class="card-sub">MVRV · NUPL · SOPR</span>
        </span>
      </div>
      {#if onchain?.onchainMetrics}
        <div class="market-grid">
          {#if onchain.onchainMetrics.mvrv != null}
            <div class="metric">
              <div class="metric-l">MVRV</div>
              <div class="metric-v">{onchain.onchainMetrics.mvrv.toFixed(2)}</div>
            </div>
          {/if}
          {#if onchain.onchainMetrics.nupl != null}
            <div class="metric">
              <div class="metric-l">NUPL</div>
              <div class="metric-v">{onchain.onchainMetrics.nupl.toFixed(2)}</div>
            </div>
          {/if}
          {#if onchain.onchainMetrics.sopr != null}
            <div class="metric">
              <div class="metric-l">SOPR</div>
              <div class="metric-v">{onchain.onchainMetrics.sopr.toFixed(3)}</div>
            </div>
          {/if}
          {#if onchain.onchainMetrics.puellMultiple != null}
            <div class="metric">
              <div class="metric-l">Puell</div>
              <div class="metric-v">{onchain.onchainMetrics.puellMultiple.toFixed(2)}</div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="skel-rows">
          {#each [75, 55, 85, 60] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: Multi-exchange venue funding — always visible -->
    <section class="card card-venue-funding" aria-label="Multi-exchange funding rates">
      <div class="card-h">
        <span class="card-title">Venue Funding</span>
        <span class="card-meta">
          <span class="src-chip">Binance · Bybit · OKX</span>
          <span class="card-sub">BTC perp spread comparison</span>
        </span>
      </div>
      {#if venueFunding}
        <div class="market-grid">
          {#if venueFunding.binance != null}
            <div class="metric">
              <div class="metric-l">Binance</div>
              <div class="metric-v" style:color={pctColor(venueFunding.binance * 100)}>{(venueFunding.binance * 100).toFixed(4)}%</div>
              <div class="metric-sub">8h rate</div>
            </div>
          {/if}
          {#if venueFunding.bybit != null}
            <div class="metric">
              <div class="metric-l">Bybit</div>
              <div class="metric-v" style:color={pctColor(venueFunding.bybit * 100)}>{(venueFunding.bybit * 100).toFixed(4)}%</div>
              <div class="metric-sub">8h rate</div>
            </div>
          {/if}
          {#if venueFunding.okx != null}
            <div class="metric">
              <div class="metric-l">OKX</div>
              <div class="metric-v" style:color={pctColor(venueFunding.okx * 100)}>{(venueFunding.okx * 100).toFixed(4)}%</div>
              <div class="metric-sub">8h rate</div>
            </div>
          {/if}
          {#if venueFunding.spread != null}
            <div class="metric">
              <div class="metric-l">Spread</div>
              <div class="metric-v">{(venueFunding.spread * 100).toFixed(4)}%</div>
              <div class="metric-sub">max − min</div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="skel-rows">
          {#each [75, 55, 85, 60] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: Market events (DERIV/WHALE/LIQ) -->
    <section class="card card-events" aria-label="Market events">
      <div class="card-h">
        <span class="card-title">Market Events</span>
        <span class="card-meta">
          <span class="src-chip">Live feed</span>
          <span class="card-sub">DERIV · WHALE · LIQ</span>
        </span>
      </div>
      {#if derivEvents.length > 0}
        <ul class="event-list">
          {#each derivEvents as e (e.id)}
            <li class="event-row">
              <span class="event-tag" data-level={e.level}>{e.tag}</span>
              <span class="event-text">{e.text}</span>
              <span class="event-time">{timeAgo(e.createdAt)}</span>
            </li>
          {/each}
        </ul>
      {:else}
        {#if secondaryStatus === 'loading'}
          <div class="skel-rows">
            {#each [70, 90, 60, 80] as w}
              <span class="skel-line" style:width="{w}%"></span>
            {/each}
          </div>
        {:else}
          <div class="empty">No recent signals</div>
        {/if}
      {/if}
    </section>

    </div><!-- end np-card-grid crypto -->

    <!-- ── 시그널 ─────────────────────────────────────────────── -->
    <div class="np-section-head" id="signals"><span>시그널</span></div>
    <div class="np-card-grid">

    <!-- Card: Alpha patterns -->
    <section class="card card-patterns" aria-label="Top 5 alpha patterns">
      <div class="card-h">
        <span class="card-title">Top 5 Alpha Patterns</span>
        <a href="/patterns" class="card-more">All patterns →</a>
      </div>
      {#if topPatterns.length > 0}
        <ol class="pattern-list">
          {#each topPatterns as p, i (p.slug)}
            <li class="pattern-row">
              <span class="rank">{i + 1}</span>
              <a href="/patterns/{p.slug}?symbol=BTCUSDT" class="pattern-name">
                {p.name ?? p.slug}
              </a>
              <span class="pattern-meta">
                <span class="alpha">α{(p.avg_alpha ?? 0).toFixed(0)}</span>
                {#if p.win_rate != null}
                  <span class="wr">{Math.round((p.win_rate ?? 0) * 100)}%</span>
                {/if}
                <span class="samples">n={p.samples_30d ?? 0}</span>
              </span>
              <a
                href="/cogochi?symbol=BTCUSDT&pattern={p.slug}"
                class="pattern-chart"
                title="Open this pattern in Terminal"
                aria-label="Open {p.name ?? p.slug} chart in Terminal"
              >→ chart</a>
            </li>
          {/each}
        </ol>
      {:else if secondaryStatus === 'loading'}
        <div class="skel-rows">
          {#each [75, 55, 80, 60, 70] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {:else}
        <div class="empty">Not enough samples yet — patterns surface after 30+ days of accumulation.</div>
      {/if}
    </section>

    <!-- Card: Whale positions — always visible -->
    <section class="card card-whales" aria-label="Whale positions">
      <div class="card-h">
        <span class="card-title">Whale Positions</span>
        <span class="card-meta">
          <span class="src-chip">Hyperliquid</span>
          <span class="card-sub">Top traders · 30d PnL</span>
        </span>
      </div>
      {#if whales.length > 0}
        <ul class="whale-list">
          {#each whales as w (w.address ?? w.addressFull)}
            <li class="whale-row">
              <span class="whale-addr">{w.address ?? '0x…'}</span>
              <span class="whale-pos" data-pos={w.netPosition}>{w.netPosition === 'long' ? 'LONG' : w.netPosition === 'short' ? 'SHORT' : (w.netPosition ?? '—')}</span>
              <span class="whale-size">{compactUsd(w.sizeUsd)}</span>
              <span class="whale-pnl" style:color={pctColor(w.pnl30dPct)}>{fmtPct(w.pnl30dPct)}</span>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="skel-rows">
          {#each [75, 55, 85, 60] as w}
            <span class="skel-line" style:width="{w}%"></span>
          {/each}
        </div>
      {/if}
    </section>

    <!-- Card: Trending (DEX hot) -->
    <section class="card card-trending" aria-label="Trending tokens">
      <div class="card-h">
        <span class="card-title">Trending DEX</span>
        <span class="card-meta">
          <span class="src-chip">DexScreener</span>
          <span class="card-sub">24h volume</span>
        </span>
      </div>
      {#if dexHot.length > 0}
        <ul class="trend-list">
          {#each dexHot as t, i (t.url ?? t.symbol ?? i)}
            <li class="trend-row">
              <a href={t.url ?? '#'} target="_blank" rel="noopener noreferrer" class="trend-name">{t.symbol ?? '?'}</a>
              <span class="trend-chain">{t.chainId ?? ''}</span>
              <span class="trend-vol">{compactUsd(t.volume24h)}</span>
              <span class="trend-c" style:color={pctColor(t.change24h)}>{fmtPct(t.change24h)}</span>
            </li>
          {/each}
        </ul>
      {:else}
        {#if secondaryStatus === 'loading'}
          <div class="skel-rows">
            {#each [85, 60, 75, 50, 90] as w}
              <span class="skel-line" style:width="{w}%"></span>
            {/each}
          </div>
        {:else}
          <div class="empty">Trending data is being prepared.</div>
        {/if}
      {/if}
    </section>

    </div><!-- end np-card-grid signals -->

    <!-- ── 캘린더 & 뉴스 ─────────────────────────────────────── -->
    <div class="np-section-head" id="calendar"><span>캘린더 &amp; 뉴스</span></div>
    <div class="np-card-grid">

    <section class="card card-calendar" aria-label="Calendar">
      <div class="card-h">
        <span class="card-title">Calendar</span>
        <span class="card-meta">
          <span class="src-chip">Macro · FOMC</span>
          <span class="card-sub">Events · earnings · unlocks</span>
        </span>
      </div>
      <div class="cal-block">
        <div class="cal-block-h">Macro Events</div>
        {#if macroCalendarItems.length > 0}
          <ul class="macro-event-list">
            {#each macroCalendarItems.slice(0, 4) as event (event.id)}
              <li class="macro-event-row">
                <span class="macro-event-impact" data-impact={event.impact ?? 'medium'}>{event.impact ?? 'event'}</span>
                <span class="macro-event-title">
                  <strong>{event.title}</strong>
                  {#if event.affectedAssets?.length}
                    <em>{event.affectedAssets.slice(0, 4).join(' · ')}</em>
                  {/if}
                </span>
                <span class="macro-event-when">{fmtDate(event.scheduledAt)}</span>
              </li>
            {/each}
          </ul>
        {:else}
          {#if secondaryStatus === 'loading'}
            <div class="skel-rows skel-rows-sm">
              {#each [65, 80, 55] as w}
                <span class="skel-line" style:width="{w}%"></span>
              {/each}
            </div>
          {:else}
            <div class="empty-sm">No macro events</div>
          {/if}
        {/if}
      </div>
      <div class="cal-block">
        <div class="cal-block-h">Earnings Watch</div>
        {#if earningsRows.length > 0}
          <ul class="earnings-list">
            {#each earningsRows.slice(0, 6) as event (event.symbol)}
              <li class="earnings-row">
                <span class="earnings-symbol">{event.symbol}</span>
                <span class="earnings-title">
                  <strong>{event.name}</strong>
                  <em>{event.market} · {fmtSession(event.session)}</em>
                </span>
                <span class="earnings-when">{fmtDate(event.scheduledAt)}</span>
                <span class="earnings-move" style:color={pctColor(event.quote?.changePct)}>
                  {fmtPct(event.quote?.changePct)}
                </span>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="empty-sm">No earnings watch</div>
        {/if}
      </div>
      <div class="cal-block">
        <div class="cal-block-h">FOMC Path</div>
        {#if fomcSummary}
          <div class="cal-fomc">
            <span class="cal-fomc-date">{fomcSummary.date ?? 'TBD'}</span>
            {#if fomcSummary.daysUntil != null}
              <span class="cal-fomc-days">D-{fomcSummary.daysUntil}</span>
            {/if}
          </div>
          {#if fomcHistory.length > 0}
            <ul class="fomc-history">
              {#each fomcHistory.slice(0, 3) as row (row.date)}
                <li>
                  <span>{fmtDate(row.date)}</span>
                  <strong>{row.decision ?? 'Decision'}</strong>
                  <em>{row.rate != null ? `${row.rate.toFixed(2)}%` : '—'}</em>
                </li>
              {/each}
            </ul>
          {/if}
        {:else}
          <div class="empty-sm">No upcoming meeting</div>
        {/if}
      </div>
      <div class="cal-block">
        <div class="cal-block-h">Upcoming Token Unlocks</div>
        {#if unlocks.length > 0}
          <ul class="unlock-list">
            {#each unlocks.slice(0, 6) as u (u.symbol + u.unlockAt)}
              <li class="unlock-row">
                <span class="unlock-sym">{u.symbol}</span>
                <span class="unlock-val">{compactUsd(u.valueUsd)}</span>
                <span class="unlock-when">{timeUntil(u.unlockAt)}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="empty-sm">No upcoming unlocks</div>
        {/if}
      </div>
    </section>

    <!-- Removed L4 inline SignupWall (Calendar → alert subscribe). See L6 note above. -->

    <!-- Card: News -->
    <section id="news" class="card card-news" aria-label="Live news">
      <div class="card-h">
        <span class="card-title">Live News</span>
        <span class="card-meta">
          <span class="src-chip">Cointelegraph · Aggregated</span>
          <span class="card-sub">{news.length + marketNews.length} stories</span>
        </span>
      </div>
      {#if news.length > 0 || marketNews.length > 0}
        <ul class="news-list">
          {#each news.slice(0, 8) as n (n.id)}
            <li class="news-row">
              <a href={n.url} target="_blank" rel="noopener noreferrer" class="news-title">{n.title}</a>
              <div class="news-meta">
                <span class="news-source">{n.source}</span>
                <span class="news-time">{timeAgo(n.publishedAt * 1000)}</span>
                {#if n.symbols.length > 0}
                  <span class="news-sym">{n.symbols.slice(0, 3).join(' · ')}</span>
                {/if}
              </div>
            </li>
          {/each}
          {#each marketNews.slice(0, 6) as n (n.id)}
            <li class="news-row">
              <a href={n.link ?? '#'} target="_blank" rel="noopener noreferrer" class="news-title">{n.title ?? '(untitled)'}</a>
              <div class="news-meta">
                {#if n.source}<span class="news-source">{n.source}</span>{/if}
                {#if n.publishedAt}<span class="news-time">{timeAgo(n.publishedAt)}</span>{/if}
                {#if n.importance != null}<span class="news-imp">Importance {n.importance}</span>{/if}
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        {#if secondaryStatus === 'loading'}
          <div class="skel-rows">
            {#each [90, 70, 85, 60, 75, 50] as w}
              <span class="skel-line" style:width="{w}%"></span>
            {/each}
          </div>
        {:else}
          <div class="empty">News feed unavailable.</div>
        {/if}
      {/if}
    </section>
    </div><!-- end np-card-grid calendar/news -->

  </main>

  <footer class="ftr">
    <div>Cogochi · Last updated {new Date(data.generatedAt).toLocaleString('en-US')}</div>
    <div>
      <a href="/">Home</a> · <a href="/patterns">Patterns</a> · <a href="/cogochi">Terminal</a>
    </div>
  </footer>

</div>

<style>
  /* ── Design tokens ───────────────────────────────────────────── */
  .page {
    --d-gold: #c9a96e;
    --d-gold-dim: rgba(201, 169, 110, 0.15);
    padding: 0 clamp(12px, 3vw, 48px);
    max-width: 1400px;
    margin: 0 auto;
  }

  /* ── Newspaper Masthead ──────────────────────────────────────── */
  .np-mast {
    border-top: 3px solid var(--d-gold);
    padding: 20px 0 12px;
    text-align: center;
  }
  .np-mast-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }
  .np-vol, .np-date {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .np-title {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 900;
    letter-spacing: -0.02em;
    color: var(--d-cream);
    margin: 0;
    line-height: 1;
  }
  .np-tagline {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 6px 0;
  }
  .np-mast-rule { height: 1px; background: var(--d-line); margin: 8px 0; }
  .np-live-row {
    display: flex;
    gap: 0;
    flex-wrap: wrap;
    justify-content: center;
    padding: 6px 0 0;
  }
  .np-live-item {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--d-mute);
    padding: 2px 14px;
    border-right: 1px solid var(--d-line);
  }
  .np-live-item:last-child { border-right: none; }
  .np-live-item strong { color: var(--d-cream); font-weight: 700; }
  .np-upd { font-size: 10px; }

  /* ── Breaking Ticker ─────────────────────────────────────────── */
  .np-breaking {
    display: flex;
    align-items: center;
    border-top: 2px solid var(--d-gold);
    border-bottom: 1px solid var(--d-line);
    background: rgba(201, 169, 110, 0.06);
    overflow: hidden;
    height: 34px;
    margin-bottom: 2px;
  }
  .np-break-label {
    flex-shrink: 0;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.18em;
    color: #080706;
    background: var(--d-gold);
    padding: 0 12px;
    height: 100%;
    display: flex;
    align-items: center;
  }
  .np-ticker-mask { flex: 1; overflow: hidden; height: 100%; }
  .np-ticker-inner {
    display: flex;
    align-items: center;
    white-space: nowrap;
    animation: ticker-scroll 100s linear infinite;
    will-change: transform;
    height: 100%;
  }
  @keyframes ticker-scroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .np-tick-item {
    font-size: 12px;
    color: var(--d-cream);
    text-decoration: none;
    padding: 0 18px;
    opacity: 0.8;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  .np-tick-item:hover { opacity: 1; color: var(--d-gold); }
  .np-tick-sep { color: var(--d-gold); font-size: 7px; flex-shrink: 0; }

  /* ── 3-Column Editorial ──────────────────────────────────────── */
  .np-editorial {
    display: grid;
    grid-template-columns: 2fr 1px 1.7fr 1px 1.3fr;
    border-top: 2px solid var(--d-gold);
    border-bottom: 1px solid var(--d-line);
    margin-bottom: 24px;
  }
  .np-col-rule { background: var(--d-line); width: 1px; }
  .np-col {
    padding: 20px;
    min-height: 400px;
  }
  .np-col-hed {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--d-gold);
    border-bottom: 2px solid var(--d-gold);
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
  .np-col-subhed {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--d-mute);
    border-bottom: 1px solid var(--d-line);
    padding-bottom: 5px;
    margin: 16px 0 10px;
  }

  /* Hero col */
  .np-hero-pb { margin-bottom: 16px; }
  .np-hero-price {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(34px, 3.5vw, 50px);
    font-weight: 700;
    color: var(--d-cream);
    letter-spacing: -0.02em;
    line-height: 1;
    margin-bottom: 8px;
  }
  .np-hero-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .np-hero-lbl {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  .np-regime-chip {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 3px;
    border: 1px solid currentColor;
  }
  .np-regime-chip[data-tone="pos"] { color: #22c55e; background: rgba(34,197,94,0.08); }
  .np-regime-chip[data-tone="neg"] { color: #ef4444; background: rgba(239,68,68,0.08); }
  .np-regime-chip[data-tone="neu"] { color: var(--d-mute); }
  .np-hero-d {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    font-weight: 600;
  }
  .np-deck {
    font-size: 13px;
    line-height: 1.65;
    color: rgba(249,240,220,0.7);
    margin: 0 0 18px;
    border-left: 2px solid var(--d-gold);
    padding-left: 12px;
  }
  .np-signals { display: flex; flex-direction: column; gap: 0; }
  .np-sig {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--d-line);
  }
  .np-sig:last-child { border-bottom: none; }
  .np-sig-l {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    flex-shrink: 0;
  }
  .np-sig-v {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--d-cream);
    text-align: right;
  }

  /* News col */
  .np-news-list { list-style: none; padding: 0; margin: 0; }
  .np-news-item { padding: 9px 0; border-bottom: 1px solid var(--d-line); }
  .np-news-item:last-child { border-bottom: none; }
  .np-news-title {
    display: block;
    font-size: 13px;
    line-height: 1.5;
    color: var(--d-cream);
    text-decoration: none;
    margin-bottom: 4px;
  }
  .np-news-title:hover { color: var(--d-gold); }
  .np-news-byline { display: flex; gap: 8px; }
  .np-news-src {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    color: var(--d-gold);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .np-news-time {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
  }
  .np-cal-list { list-style: none; padding: 0; margin: 0; }
  .np-cal-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .np-cal-item:last-child { border-bottom: none; }
  .np-cal-impact {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .np-cal-impact[data-impact="high"] { background: rgba(239,68,68,0.15); color: #ef4444; }
  .np-cal-impact[data-impact="medium"] { background: var(--d-gold-dim); color: var(--d-gold); }
  .np-cal-impact[data-impact="low"] { background: rgba(95,201,122,0.1); color: #5fc97a; }
  .np-cal-title { flex: 1; color: var(--d-cream); }
  .np-cal-when {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    flex-shrink: 0;
  }

  /* Indicators col */
  .np-ind-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  .np-ind-table tr { border-bottom: 1px solid var(--d-line); }
  .np-ind-table tr:last-child { border-bottom: none; }
  .np-ind-table td {
    padding: 6px 3px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    vertical-align: middle;
  }
  .np-ind-lbl {
    color: var(--d-mute);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding-right: 6px !important;
    white-space: nowrap;
  }
  .np-ind-spark { width: 40px; padding: 0 4px !important; }
  .np-ind-spark svg { display: block; width: 40px; height: 12px; }
  .np-ind-val { color: var(--d-cream); font-weight: 600; text-align: right; padding-right: 4px !important; }
  .np-ind-delta { text-align: right; font-size: 10px; font-weight: 600; }
  .np-fg-mini { display: flex; flex-direction: column; align-items: center; padding: 10px 0; }
  .np-fg-arc { width: 80px; height: 48px; display: block; margin-bottom: 4px; }
  .np-fg-val {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
  }
  .np-fg-lbl {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 4px;
  }
  .np-empty { font-size: 12px; color: var(--d-mute); padding: 10px 0; font-style: italic; }
  .np-empty-sm { font-size: 11px; color: var(--d-mute); padding: 4px 0; font-style: italic; }

  /* ── Section heads ───────────────────────────────────────────── */
  .np-section-head {
    display: flex;
    align-items: center;
    padding: 24px 0 10px;
  }
  .np-section-head::before,
  .np-section-head::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--d-gold);
  }
  .np-section-head span {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--d-gold);
    padding: 0 16px;
  }

  /* ── Card grid ───────────────────────────────────────────────── */
  .np-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    margin-bottom: 8px;
  }
  .np-data { padding-bottom: 32px; }

  /* ── Shared card styles ──────────────────────────────────────── */
  .card {
    background: var(--d-bg-2);
    border: 1px solid var(--d-line);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .card-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .card-title {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--d-cream);
  }
  .card-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .src-chip {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    color: var(--d-gold);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .card-sub { font-size: 9px; color: var(--d-mute); }
  .card-more {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-gold);
    text-decoration: none;
  }
  .card-more:hover { text-decoration: underline; }
  .empty { font-size: 12px; color: var(--d-mute); padding: 8px 0; font-style: italic; }
  .empty-sm { font-size: 11px; color: var(--d-mute); padding: 4px 0; }

  /* ── Skeleton ────────────────────────────────────────────────── */
  .skel-rows { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
  .skel-line {
    height: 10px;
    border-radius: 3px;
    background: linear-gradient(90deg, var(--d-line) 25%, rgba(249,216,194,0.06) 50%, var(--d-line) 75%);
    background-size: 400% 100%;
    animation: skel-shimmer 1.5s infinite linear;
  }
  @keyframes skel-shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  .skel-rows-sm .skel-line { height: 8px; }

  /* ── Macro rows (stocks / indices / commodities) ─────────────── */
  .macro-list { list-style: none; padding: 0; margin: 0; }
  .macro-row {
    display: grid;
    grid-template-columns: 6ch auto 1fr auto;
    align-items: center;
    gap: 8px;
    padding: 7px 0;
    border-bottom: 1px solid var(--d-line);
  }
  .macro-row:last-child { border-bottom: none; }
  .macro-l {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .macro-v {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--d-cream);
    white-space: nowrap;
  }
  .row-spark { width: 64px; height: 18px; }
  .row-spark svg { display: block; width: 64px; height: 18px; }
  .macro-c {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 600;
    text-align: right;
    position: relative;
  }
  .delta-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 2px;
    border-radius: 1px;
    opacity: 0.3;
  }

  /* ── Metric grid (options / funding / onchain) ───────────────── */
  .market-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .metric { display: flex; flex-direction: column; gap: 2px; }
  .metric-l {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--d-mute);
  }
  .metric-v {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 15px;
    font-weight: 700;
    color: var(--d-cream);
  }
  .metric-sub { font-size: 10px; color: var(--d-mute); }
  .metric-unit { font-size: 10px; font-weight: 400; color: var(--d-mute); }

  /* ── Fear & Greed gauge ──────────────────────────────────────── */
  .fg-main { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .fg-gauge { width: 120px; height: 70px; display: block; }
  .fg-value {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
    margin-top: -16px;
  }
  .fg-label {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .fg-strip { display: flex; align-items: flex-end; gap: 3px; padding-top: 8px; }
  .fg-bar { width: 10px; border-radius: 2px 2px 0 0; min-height: 8px; }

  /* ── Whale list ──────────────────────────────────────────────── */
  .whale-list { list-style: none; padding: 0; margin: 0; }
  .whale-row {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    gap: 8px;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--d-line);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
  }
  .whale-row:last-child { border-bottom: none; }
  .whale-addr { color: var(--d-mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .whale-pos[data-pos="long"] { color: #5fc97a; font-weight: 700; }
  .whale-pos[data-pos="short"] { color: #ff6b6b; font-weight: 700; }
  .whale-pos { color: var(--d-mute); }
  .whale-size { color: var(--d-cream); }
  .whale-pnl { font-weight: 600; }

  /* ── DEX trending ────────────────────────────────────────────── */
  .trend-list { list-style: none; padding: 0; margin: 0; }
  .trend-row {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 8px;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .trend-row:last-child { border-bottom: none; }
  .trend-name { color: var(--d-cream); text-decoration: none; font-weight: 600; }
  .trend-name:hover { color: var(--d-gold); }
  .trend-chain { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); text-transform: uppercase; }
  .trend-vol { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--d-cream); }
  .trend-c { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; }

  /* ── Alpha patterns ──────────────────────────────────────────── */
  .pattern-list { list-style: none; padding: 0; margin: 0; }
  .pattern-row {
    display: grid;
    grid-template-columns: 24px 1fr auto auto;
    gap: 8px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .pattern-row:last-child { border-bottom: none; }
  .rank { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--d-gold); font-weight: 700; }
  .pattern-name { color: var(--d-cream); text-decoration: none; }
  .pattern-name:hover { color: var(--d-gold); }
  .pattern-meta { display: flex; gap: 6px; align-items: center; }
  .alpha { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--d-gold); font-weight: 700; }
  .wr { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5fc97a; }
  .samples { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); }
  .pattern-chart { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-gold); text-decoration: none; }
  .pattern-chart:hover { text-decoration: underline; }

  /* ── Market events ───────────────────────────────────────────── */
  .event-list { list-style: none; padding: 0; margin: 0; }
  .event-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: flex-start;
    padding: 7px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .event-row:last-child { border-bottom: none; }
  .event-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 2px;
    background: var(--d-gold-dim);
    color: var(--d-gold);
  }
  .event-tag[data-level="critical"] { background: rgba(239,68,68,0.15); color: #ef4444; }
  .event-tag[data-level="info"] { background: rgba(95,201,122,0.1); color: #5fc97a; }
  .event-text { color: var(--d-cream); line-height: 1.4; }
  .event-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); white-space: nowrap; }

  /* ── Calendar card ───────────────────────────────────────────── */
  .cal-block { margin-bottom: 16px; }
  .cal-block:last-child { margin-bottom: 0; }
  .cal-block-h {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--d-mute);
    border-bottom: 1px solid var(--d-line);
    padding-bottom: 5px;
    margin-bottom: 8px;
  }
  .macro-event-list { list-style: none; padding: 0; margin: 0; }
  .macro-event-row {
    display: grid;
    grid-template-columns: 52px 1fr auto;
    gap: 8px;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .macro-event-row:last-child { border-bottom: none; }
  .macro-event-impact {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    padding: 2px 5px;
    border-radius: 2px;
  }
  .macro-event-impact[data-impact="high"] { background: rgba(239,68,68,0.15); color: #ef4444; }
  .macro-event-impact[data-impact="medium"] { background: var(--d-gold-dim); color: var(--d-gold); }
  .macro-event-impact[data-impact="low"] { background: rgba(95,201,122,0.1); color: #5fc97a; }
  .macro-event-title { color: var(--d-cream); }
  .macro-event-title em { display: block; font-size: 10px; color: var(--d-mute); font-style: normal; }
  .macro-event-when { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); white-space: nowrap; }
  .earnings-list { list-style: none; padding: 0; margin: 0; }
  .earnings-row {
    display: grid;
    grid-template-columns: 44px 1fr auto auto;
    gap: 8px;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .earnings-row:last-child { border-bottom: none; }
  .earnings-symbol { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: var(--d-gold); }
  .earnings-title { color: var(--d-cream); }
  .earnings-title em { display: block; font-size: 10px; color: var(--d-mute); font-style: normal; }
  .earnings-when { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); white-space: nowrap; }
  .earnings-move { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; white-space: nowrap; }
  .cal-fomc { display: flex; gap: 12px; align-items: baseline; margin-bottom: 8px; }
  .cal-fomc-date { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: var(--d-cream); }
  .cal-fomc-days { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--d-gold); }
  .fomc-history { list-style: none; padding: 0; margin: 0; }
  .fomc-history li {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: baseline;
    padding: 4px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
  }
  .fomc-history li:last-child { border-bottom: none; }
  .fomc-history li span { color: var(--d-mute); }
  .fomc-history li strong { color: var(--d-cream); }
  .fomc-history li em { color: var(--d-gold); font-style: normal; }
  .unlock-list { list-style: none; padding: 0; margin: 0; }
  .unlock-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 8px;
    align-items: baseline;
    padding: 5px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
  }
  .unlock-row:last-child { border-bottom: none; }
  .unlock-sym { color: var(--d-gold); font-weight: 700; }
  .unlock-val { color: var(--d-cream); text-align: right; }
  .unlock-when { color: var(--d-mute); }

  /* ── News card ───────────────────────────────────────────────── */
  .news-list { list-style: none; padding: 0; margin: 0; }
  .news-row { padding: 9px 0; border-bottom: 1px solid var(--d-line); }
  .news-row:last-child { border-bottom: none; }
  .news-title {
    display: block;
    font-size: 13px;
    line-height: 1.5;
    color: var(--d-cream);
    text-decoration: none;
    margin-bottom: 4px;
  }
  .news-title:hover { color: var(--d-gold); }
  .news-meta { display: flex; gap: 8px; align-items: center; }
  .news-source { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--d-gold); text-transform: uppercase; letter-spacing: 0.06em; }
  .news-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); }
  .news-sym { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--d-mute); }
  .news-imp { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: var(--d-gold); }

  /* ── Sentinel ────────────────────────────────────────────────── */
  .io-sentinel { height: 1px; pointer-events: none; }

  /* ── Footer ──────────────────────────────────────────────────── */
  .ftr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-top: 1px solid var(--d-line);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    gap: 12px;
    flex-wrap: wrap;
  }
  .ftr a { color: var(--d-gold); text-decoration: none; }
  .ftr a:hover { text-decoration: underline; }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 1100px) {
    .np-editorial { grid-template-columns: 1.8fr 1px 1.4fr 1px 1fr; }
  }
  @media (max-width: 900px) {
    .np-editorial { grid-template-columns: 1fr; }
    .np-col-rule { display: none; }
    .np-col { min-height: auto; border-bottom: 1px solid var(--d-line); }
    .np-col:last-child { border-bottom: none; }
    .np-mast-top { flex-direction: column; align-items: center; gap: 4px; }
  }
  @media (max-width: 600px) {
    .np-card-grid { grid-template-columns: 1fr; }
    .market-grid { grid-template-columns: 1fr 1fr; }
    .macro-row { grid-template-columns: 5ch 1fr auto; }
    .row-spark { display: none; }
    .earnings-row { grid-template-columns: 44px 1fr auto; }
    .earnings-move { display: none; }
  }
</style>
