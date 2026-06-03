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
  <!-- ── PR1: Sub-rail + sticky Pulse Strip (W-0501) ──────────── -->
  <SubRail active="daily" />
  <PulseStrip
    btc={btcPulse}
    feargreed={fgPulse}
    confluence={confluencePulse}
    kimchi={kimchiPulse}
    macro={macroPulse}
    generatedAt={data.generatedAt}
  />

  <!-- ── Regime Hero ─────────────────────────────────────────────── -->
  <header class="regime-hero" data-tone={regimeChip.tone}>
    <div class="rh-left">
      <div class="rh-badge" data-tone={regimeChip.tone}>{regimeChip.label}</div>
      {#if btcPulse?.price != null}
        <div class="rh-btc">
          <span class="rh-price">BTC ${fmtPrice(btcPulse.price)}</span>
          {#if btcPulse.changePct != null}
            <span class="rh-delta" style:color={pctColor(btcPulse.changePct)}>
              {btcPulse.changePct > 0 ? '+' : ''}{fmtPct(btcPulse.changePct)} 24h
            </span>
          {/if}
        </div>
      {:else}
        <div class="rh-btc"><span class="rh-price">BTC —</span></div>
      {/if}
    </div>
    <div class="rh-stats">
      {#if fgPulse}
        <div class="rhs">
          <span class="rhs-l">F&amp;G</span>
          <span class="rhs-v" style:color={fgColor(fgPulse.value)}>{fgPulse.value}</span>
          <span class="rhs-s">{fgLabel(fgPulse.value)}</span>
        </div>
      {/if}
      {#if flip?.currentRate != null}
        <div class="rhs">
          <span class="rhs-l">Funding</span>
          <span class="rhs-v" style:color={pctColor(flip.currentRate * 100)}>{(flip.currentRate * 100).toFixed(4)}%</span>
          <span class="rhs-s">{fundingDirectionLabel(flip.direction) || 'BTC perp'}</span>
        </div>
      {/if}
      {#if options?.putCallRatioOi != null}
        <div class="rhs">
          <span class="rhs-l">PCR</span>
          <span class="rhs-v">{options.putCallRatioOi.toFixed(2)}</span>
          <span class="rhs-s">{options.putCallRatioOi < 0.7 ? '강세' : options.putCallRatioOi > 1.0 ? '약세' : '중립'}</span>
        </div>
      {/if}
      {#if kimchiPulse?.premium_pct != null}
        <div class="rhs">
          <span class="rhs-l">Kimchi</span>
          <span class="rhs-v" style:color={pctColor(kimchiPulse.premium_pct)}>{fmtPct(kimchiPulse.premium_pct)}</span>
          <span class="rhs-s">KR premium</span>
        </div>
      {/if}
      {#if onchain?.onchainMetrics?.mvrv != null}
        <div class="rhs">
          <span class="rhs-l">MVRV</span>
          <span class="rhs-v">{onchain.onchainMetrics.mvrv.toFixed(2)}</span>
          <span class="rhs-s">{onchain.onchainMetrics.mvrv > 3.5 ? '과열' : onchain.onchainMetrics.mvrv < 1 ? '저평가' : '정상'}</span>
        </div>
      {/if}
      {#if macroPulse?.dxy?.price != null}
        <div class="rhs">
          <span class="rhs-l">DXY</span>
          <span class="rhs-v">{fmtNum(macroPulse.dxy.price, 2)}</span>
          {#if macroPulse.dxy.changePct != null}
            <span class="rhs-s" style:color={pctColor(-macroPulse.dxy.changePct)}>{fmtPct(macroPulse.dxy.changePct)}</span>
          {/if}
        </div>
      {/if}
      {#if btcDominance != null}
        <div class="rhs">
          <span class="rhs-l">BTC.D</span>
          <span class="rhs-v">{btcDominance.toFixed(1)}%</span>
          <span class="rhs-s">dominance</span>
        </div>
      {/if}
      {#if macroPulse?.spx?.price != null}
        <div class="rhs">
          <span class="rhs-l">SPX</span>
          <span class="rhs-v">{fmtNum(macroPulse.spx.price, 0)}</span>
          <span class="rhs-s" style:color={pctColor(macroPulse.spx.changePct)}>{fmtPct(macroPulse.spx.changePct)}</span>
        </div>
      {/if}
    </div>
    <div class="rh-time">
      <span>Updated {new Date(data.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  </header>

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

  <main id="daily-data" class="grid">
    <!-- Card: Crypto indicators -->
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

    <div bind:this={deepTriggerEl} class="io-sentinel" aria-hidden="true"></div>

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
              <div class="metric-v" style:color={pctColor(-options.skew25d)}>{fmtPct(options.skew25d * 100)}</div>
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

    <!-- Card: Calendar (FOMC + Token Unlocks)
         id="calendar" makes SubRail's "Calendar" chip a working in-page jump. -->
    <section id="calendar" class="card card-calendar" aria-label="Calendar">
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
  </main>

  <footer class="ftr">
    <div>Cogochi · Last updated {new Date(data.generatedAt).toLocaleString('en-US')}</div>
    <div>
      <a href="/">Home</a> · <a href="/patterns">Patterns</a> · <a href="/cogochi">Terminal</a>
    </div>
  </footer>

</div>

<style>
  /* ── Regime Hero ───────────────────────────────────────────── */
  .regime-hero {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 20px 24px;
    margin-bottom: 12px;
    border-radius: 12px;
    background: var(--d-bg-2);
    border: 1px solid var(--d-line-strong);
    position: relative;
    overflow: hidden;
  }
  .regime-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 12px;
  }
  .regime-hero[data-tone="pos"]::before {
    background: radial-gradient(ellipse at 0% 50%, rgba(34,197,94,0.08), transparent 60%);
  }
  .regime-hero[data-tone="neg"]::before {
    background: radial-gradient(ellipse at 0% 50%, rgba(239,68,68,0.08), transparent 60%);
  }
  .regime-hero[data-tone="neu"]::before {
    background: radial-gradient(ellipse at 0% 50%, rgba(249,216,194,0.04), transparent 60%);
  }
  .rh-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }
  .rh-badge {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid currentColor;
  }
  .rh-badge[data-tone="pos"] { color: #22c55e; border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.08); }
  .rh-badge[data-tone="neg"] { color: #ef4444; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.08); }
  .rh-badge[data-tone="neu"] { color: var(--d-mute); border-color: var(--d-line); }
  .rh-btc {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .rh-price {
    font-size: 22px;
    font-weight: 700;
    color: var(--d-cream);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    letter-spacing: -0.02em;
  }
  .rh-delta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 12px;
    font-weight: 600;
  }
  .rh-stats {
    display: flex;
    gap: 0;
    flex: 1;
    border-left: 1px solid var(--d-line);
    padding-left: 24px;
    flex-wrap: wrap;
  }
  .rhs {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 0 20px;
    border-right: 1px solid var(--d-line);
  }
  .rhs:last-child { border-right: none; }
  .rhs-l {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--d-mute);
  }
  .rhs-v {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 15px;
    font-weight: 700;
    color: var(--d-cream);
  }
  .rhs-s {
    font-size: 10px;
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .rh-time {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }

  /* ─────────────────────────────────────────────────────────────
     Daily palette: dark base for data legibility,
     home tokens (salmon / apricot / paper) for accents.
     ───────────────────────────────────────────────────────────── */
  .page {
    --d-bg: #0a0807;
    --d-bg-1: #14110f;
    --d-bg-2: #1c1815;
    --d-line: rgba(249, 216, 194, 0.10);
    --d-line-strong: rgba(249, 216, 194, 0.18);
    --d-text: rgba(250, 247, 235, 0.92);
    --d-text-2: rgba(250, 247, 235, 0.74);
    --d-mute: rgba(250, 247, 235, 0.42);
    --d-mute-2: rgba(250, 247, 235, 0.28);
    --d-salmon: #ff7f85;
    --d-apricot: #f9d8c2;
    --d-rose: #ec9393;
    --d-cream: #faf7eb;

    max-width: 1460px;
    margin: 0 auto;
    /* Top padding kept tight (8px) so SubRail + PulseStrip sit flush against
       the slim AppTopBar instead of leaving an empty band. Sides/bottom
       retain the responsive clamp for breathing room on data-dense cards. */
    padding: 6px clamp(16px, 2.8vw, 28px) clamp(16px, 2.8vw, 28px);
    color: var(--d-text);
    background: transparent;
    min-height: 100vh;
    font-family: var(--sc-font-body, 'Inter', system-ui, sans-serif);
    position: relative;
  }
  .page::before {
    content: '';
    position: fixed;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(circle at 88% 10%, rgba(249, 216, 194, 0.04), transparent 22%),
      radial-gradient(circle at 6% 88%, rgba(255, 127, 133, 0.03), transparent 24%),
      #0a0807;
    pointer-events: none;
  }

  /* SubRail in-page anchor targets — leave room for the 32px AppTopBar
     so the jumped-to section doesn't sit underneath the chrome. */
  .anchor-target,
  #market-board,
  #markets,
  #macro,
  #crypto,
  #signals,
  #calendar,
  #news {
    scroll-margin-top: 112px;
  }

  .btn {
    display: inline-flex; align-items: center; padding: 8px 14px;
    font-size: 13px; font-weight: 500; border-radius: 999px;
    border: 1px solid transparent; text-decoration: none;
    transition: opacity 0.15s, background 0.15s, border-color 0.15s, color 0.15s;
    font-family: inherit;
    cursor: pointer;
    background: transparent;
    box-sizing: border-box;
  }
  .btn-ghost { color: var(--d-text); border-color: var(--d-line-strong); }
  .btn-ghost:hover { background: rgba(249, 216, 194, 0.06); border-color: var(--d-apricot); }
  .btn-primary {
    background: var(--d-cream);
    color: var(--d-bg);
    border-color: var(--d-cream);
  }
  .btn-primary:hover { background: var(--d-apricot); border-color: var(--d-apricot); }
  .btn-lg { padding: 12px 22px; font-size: 14px; }

  /* ── L7 sticky exit-intent ──────────────────────────────── */
  .l7-sticky {
    position: fixed;
    left: 64px;
    right: 0;
    bottom: env(safe-area-inset-bottom, 0px);
    z-index: 200;
    padding: 8px;
    background: rgba(8, 8, 10, 0.96);
    border-top: 1px solid rgba(249, 216, 194, 0.12);
    backdrop-filter: blur(8px);
    pointer-events: none;
  }
  .l7-sticky :global(*) { pointer-events: auto; }
  .l7-close {
    position: absolute;
    top: 4px;
    right: 8px;
    background: transparent;
    border: none;
    color: var(--d-mute);
    font-size: 18px;
    cursor: pointer;
    padding: 4px 8px;
  }
  .l7-close:hover { color: var(--d-cream); }

  /* ── Decision workspace ───────────────────────────────────── */
  .daily-workbench {
    display: grid;
    grid-template-columns: minmax(0, 2.35fr) minmax(320px, 0.9fr);
    gap: 10px;
    margin: 10px 0 14px;
    align-items: start;
  }
  .workbench-main,
  .workbench-side {
    min-width: 0;
  }
  .workbench-main {
    display: grid;
    gap: 10px;
  }
  .workbench-side {
    position: sticky;
    top: 104px;
    display: grid;
    gap: 8px;
    overflow: visible;
  }
  :global(.daily-workbench .headline) {
    margin: 0;
  }
  .selection-card {
    display: grid;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--d-line-strong);
    border-radius: 8px;
    background:
      linear-gradient(180deg, rgba(250, 247, 235, 0.04), rgba(250, 247, 235, 0.012)),
      var(--d-bg-1);
  }
  .selection-card h2 {
    margin: 0;
    color: var(--d-cream);
    font-size: 17px;
    line-height: 1.15;
    letter-spacing: 0;
  }
  .selection-card p {
    margin: 0;
    color: var(--d-text-2);
    font-size: 11.5px;
    line-height: 1.48;
  }
  .selection-eyebrow {
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .selection-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .selection-grid span {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding: 7px 8px;
    border: 1px solid var(--d-line);
    border-radius: 6px;
    background: rgba(250, 247, 235, 0.025);
  }
  .selection-grid em {
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-style: normal;
    text-transform: uppercase;
  }
  .selection-grid strong {
    color: var(--d-cream);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .selection-positive { border-color: rgba(95, 201, 122, 0.28); }
  .selection-warning { border-color: rgba(249, 162, 108, 0.28); }

  /* ── Stockhub-style dense board ───────────────────────────── */
  .dense-board {
    position: relative;
    isolation: isolate;
    margin: 0;
    border: 1px solid var(--d-line-strong);
    border-radius: 8px;
    background: linear-gradient(180deg, rgba(250, 247, 235, 0.035), rgba(250, 247, 235, 0.015)), var(--d-bg-1);
    overflow: hidden;
  }
  .board-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px 8px;
    border-bottom: 1px solid var(--d-line);
  }
  .board-head h2 {
    margin: 0;
    font-family: var(--sc-font-display, 'GT Sectra Display', 'Times New Roman', serif);
    font-size: 18px;
    font-weight: 600;
    color: var(--d-cream);
  }
  .board-head p {
    margin: 2px 0 0;
    color: var(--d-mute);
    font-size: 11px;
  }
  .board-status {
    flex: 0 0 auto;
    padding: 3px 8px;
    border: 1px solid rgba(95, 201, 122, 0.28);
    border-radius: 4px;
    color: #5fc97a;
    background: rgba(95, 201, 122, 0.08);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    text-transform: uppercase;
  }
  .board-tabs {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
    border-bottom: 1px solid var(--d-line);
  }
  .board-tabs::-webkit-scrollbar { display: none; }
  .board-tab {
    min-width: 88px;
    height: 34px;
    padding: 0 12px;
    border: 0;
    border-right: 1px solid var(--d-line);
    background: transparent;
    color: var(--d-text-2);
    cursor: pointer;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    text-transform: uppercase;
    touch-action: manipulation;
  }
  .board-tab:hover {
    color: var(--d-cream);
    background: rgba(250, 247, 235, 0.04);
  }
  .board-tab.active {
    color: var(--d-bg);
    background: var(--d-apricot);
  }
  .board-table {
    display: grid;
    grid-template-columns: 1fr;
  }
  .board-row {
    display: grid;
    grid-template-columns: minmax(180px, 1.25fr) minmax(92px, 0.66fr) minmax(82px, 0.48fr) minmax(92px, 0.72fr);
    gap: 10px;
    align-items: center;
    min-height: 40px;
    padding: 7px 12px;
    border-bottom: 1px solid var(--d-line);
    color: var(--d-text);
    text-decoration: none;
    font-variant-numeric: tabular-nums;
  }
  .board-row:last-child { border-bottom: 0; }
  a.board-row:hover {
    background: rgba(249, 216, 194, 0.045);
  }
  .board-row-head {
    min-height: 30px;
    padding-block: 6px;
    color: var(--d-mute);
    background: rgba(250, 247, 235, 0.025);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    text-transform: uppercase;
  }
  .board-label {
    display: grid;
    gap: 2px;
    min-width: 0;
  }
  .board-label strong {
    color: var(--d-cream);
    font-size: 12px;
    font-weight: 650;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .board-label em {
    color: var(--d-mute);
    font-size: 11px;
    font-style: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .board-value,
  .board-delta,
  .board-meta {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    white-space: nowrap;
    text-align: right;
  }
  .board-value {
    color: var(--d-cream);
    font-weight: 650;
  }
  .board-delta.muted,
  .board-meta {
    color: var(--d-mute);
  }

  /* ── Cards grid ─────────────────────────────────────────────── */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: min-content;
    gap: 8px;
    align-items: start;
  }
  .section-label {
    grid-column: 1 / -1;
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin: 2px 0 -2px;
    min-height: 24px;
    border-bottom: 1px solid var(--d-line);
  }
  .section-label span {
    color: var(--d-cream);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .section-label em {
    color: var(--d-mute);
    font-size: 11px;
    font-style: normal;
  }
  .card {
    background: var(--d-bg-1);
    border: 1px solid var(--d-line);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .card:hover {
    border-color: var(--d-line-strong);
    box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  }
  .card-crypto,
  .card-patterns,
  .card-news,
  .card-stocks,
  .card-calendar,
  .card-events,
  .card-options,
  .card-onchain,
  .card-venue-funding,
  .card-whales,
  .card-trending,
  .card-commodities,
  .card-us-stocks,
  .card-kr-stocks {
    grid-column: span 2;
  }
  .card-news {
    grid-column: 1 / -1;
  }
  .io-sentinel {
    grid-column: 1 / -1;
    width: 100%;
    height: 1px;
    margin: -1px 0 0;
  }
  .card-h {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .card-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--d-text);
  }
  .card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .src-chip {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 10px;
    color: var(--d-mute);
    background: rgba(249,216,194,0.06);
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.04em;
  }
  .card-sub {
    font-size: 11px;
    font-weight: 400;
    color: var(--d-mute);
    text-transform: none;
    letter-spacing: 0;
  }
  .card-more {
    font-size: 12px;
    color: var(--d-apricot);
    text-decoration: none;
    letter-spacing: 0.03em;
  }
  .card-more:hover { color: var(--d-cream); }

  /* ── Fear & Greed ───────────────────────────────────────────── */
  .fg-main { display: flex; flex-direction: column; align-items: center; margin: 8px 0 18px; position: relative; }
  .fg-gauge {
    width: 160px;
    height: 90px;
    margin-bottom: -42px;
    margin-top: -10px;
  }
  .fg-value {
    font-size: 56px;
    font-weight: 700;
    line-height: 1;
    font-family: var(--sc-font-display, 'GT Sectra Display', 'Times New Roman', serif);
    letter-spacing: -0.02em;
    z-index: 2;
    position: relative;
  }
  .fg-label {
    font-size: 13px;
    margin-top: 8px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 500;
  }
  .fg-strip { display: flex; gap: 3px; align-items: flex-end; height: 44px; }
  .fg-bar { flex: 1; border-radius: 1px; opacity: 0.78; }

  /* ── Macro/index list rows ─────────────────────────────────── */
  .macro-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .macro-row {
    display: grid;
    grid-template-columns: minmax(64px, 1fr) minmax(54px, auto) 54px minmax(64px, auto);
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid var(--d-line);
    font-variant-numeric: tabular-nums;
  }
  .macro-row:last-child { border-bottom: none; }
  .macro-l {
    font-size: 11px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 500;
  }
  .macro-v {
    font-size: 13px;
    font-weight: 600;
    color: var(--d-cream);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    letter-spacing: -0.01em;
    text-align: right;
  }
  .macro-c {
    font-size: 11px;
    font-weight: 500;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    text-align: right;
    position: relative;
    padding-bottom: 5px;
  }

  /* ── Inline row sparkline ─────────────────────────────────── */
  .row-spark {
    width: 54px;
    height: 18px;
    display: block;
    opacity: 0.85;
  }
  .row-spark svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* ── Visual delta bar (sits beneath % change number) ──────── */
  .delta-bar {
    position: absolute;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 1px;
    opacity: 0.55;
    pointer-events: none;
  }

  /* ── Stocks list ───────────────────────────────────────────── */
  .stock-list { list-style: none; margin: 0; padding: 0; }
  .stock-row {
    display: grid;
    grid-template-columns: 1fr auto 64px 80px;
    gap: 10px;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .card-stocks .stock-row:has(.stock-tic) {
    grid-template-columns: 50px 1fr auto 64px 80px;
  }
  .stock-row:last-child { border-bottom: none; }
  .stock-tic {
    color: var(--d-apricot);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.04em;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .stock-name {
    color: var(--d-text);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .us-name { color: var(--d-text-2); }
  .stock-price {
    color: var(--d-cream);
    font-weight: 500;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    text-align: right;
  }
  .stock-c {
    font-weight: 500;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    text-align: right;
    position: relative;
    padding-bottom: 5px;
  }

  /* ── Metrics grid ──────────────────────────────────────────── */
  .market-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 14px;
  }
  .metric { padding: 4px 0; }
  .metric-l {
    font-size: 10.5px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 500;
  }
  .metric-v {
    font-size: 18px;
    font-weight: 700;
    color: var(--d-cream);
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    letter-spacing: -0.02em;
  }
  .metric-unit {
    font-size: 11px;
    color: var(--d-mute);
    font-weight: 400;
    margin-left: 2px;
  }
  .metric-sub { font-size: 10.5px; color: var(--d-mute); margin-top: 3px; }

  /* ── Patterns ──────────────────────────────────────────────── */
  .pattern-list { list-style: none; margin: 0; padding: 0; }
  .pattern-row {
    display: grid;
    /* Was [rank | name | meta]. Added a 4th col for the "→ chart" deep-link
       so each pattern lands the user inside Terminal with the symbol +
       pattern preselected, removing the symbol-context loss the CPO audit
       flagged in the Daily → Patterns → Terminal handoff. */
    grid-template-columns: 28px 1fr auto auto;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--d-line);
  }
  .pattern-chart {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--d-apricot, #f9d8c2);
    text-decoration: none;
    border: 1px solid color-mix(in srgb, var(--d-apricot, #f9d8c2) 22%, transparent);
    border-radius: 4px;
    padding: 3px 8px;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .pattern-chart:hover {
    background: color-mix(in srgb, var(--d-apricot, #f9d8c2) 8%, transparent);
    border-color: color-mix(in srgb, var(--d-apricot, #f9d8c2) 50%, transparent);
  }
  .pattern-row:last-child { border-bottom: none; }
  .rank {
    font-size: 14px;
    font-weight: 600;
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .pattern-name {
    color: var(--d-cream);
    text-decoration: none;
    font-size: 14px;
    letter-spacing: 0.01em;
  }
  .pattern-name:hover { color: var(--d-apricot); }
  .pattern-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--d-mute);
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .alpha { color: #a8d96b; font-weight: 600; }
  .wr { color: var(--d-text-2); }

  /* ── Trending ─────────────────────────────────────────────── */
  .trend-list { list-style: none; margin: 0; padding: 0; }
  .trend-row {
    display: grid;
    grid-template-columns: 1fr auto auto auto;
    align-items: baseline;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .trend-row:last-child { border-bottom: none; }
  .trend-name { color: var(--d-cream); text-decoration: none; font-weight: 600; font-size: 13px; }
  .trend-name:hover { color: var(--d-apricot); }
  .trend-chain {
    color: var(--d-mute); text-transform: uppercase; font-size: 11px; letter-spacing: 0.06em;
  }
  .trend-vol { color: var(--d-text-2); }

  /* ── Whales ───────────────────────────────────────────────── */
  .whale-list { list-style: none; margin: 0; padding: 0; }
  .whale-row {
    display: grid;
    grid-template-columns: 80px 60px 1fr auto;
    align-items: baseline;
    gap: 10px;
    padding: 8px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .whale-row:last-child { border-bottom: none; }
  .whale-addr { color: var(--d-text-2); }
  .whale-pos {
    font-weight: 700;
    font-size: 11px;
    text-align: center;
    padding: 3px 6px;
    border-radius: 4px;
    background: rgba(250, 247, 235, 0.06);
    letter-spacing: 0.06em;
  }
  .whale-pos[data-pos="long"] { color: #5fc97a; background: rgba(95, 201, 122, 0.12); }
  .whale-pos[data-pos="short"] { color: #ff6b6b; background: rgba(255, 107, 107, 0.12); }
  .whale-size { color: var(--d-text); }
  .whale-pnl { font-weight: 600; }

  /* ── Events ───────────────────────────────────────────────── */
  .event-list { list-style: none; margin: 0; padding: 0; }
  .event-row {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    align-items: baseline;
    gap: 10px;
    padding: 9px 0;
    border-bottom: 1px solid var(--d-line);
    font-size: 12px;
  }
  .event-row:last-child { border-bottom: none; }
  .event-tag {
    font-size: 11px;
    font-weight: 600;
    color: var(--d-cream);
    background: rgba(250, 247, 235, 0.06);
    padding: 3px 7px;
    border-radius: 4px;
    text-align: center;
    letter-spacing: 0.06em;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .event-tag[data-level="warning"] { color: #f9a26c; background: rgba(249, 162, 108, 0.12); }
  .event-tag[data-level="critical"] { color: #ff6b6b; background: rgba(255, 107, 107, 0.12); }
  .event-text { color: var(--d-text); line-height: 1.4; }
  .event-time { color: var(--d-mute); font-size: 11px; white-space: nowrap; font-family: 'JetBrains Mono', ui-monospace, monospace; }

  /* ── Calendar ─────────────────────────────────────────────── */
  .cal-block { margin-bottom: 14px; }
  .cal-block:last-child { margin-bottom: 0; }
  .cal-block-h {
    font-size: 10.5px;
    color: var(--d-mute);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
    font-weight: 600;
  }
  .cal-fomc {
    display: flex;
    gap: 12px;
    align-items: baseline;
    font-size: 14px;
    color: var(--d-cream);
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .cal-fomc-days { color: #f9a26c; font-weight: 600; }
  .empty-sm { color: var(--d-mute); font-size: 11.5px; padding: 4px 0; }

  .fomc-history {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: grid;
    gap: 4px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    color: var(--d-mute);
  }
  .fomc-history li {
    display: grid;
    grid-template-columns: minmax(54px, auto) 1fr auto;
    gap: 8px;
    align-items: center;
  }
  .fomc-history strong {
    color: var(--d-text-2);
    font-size: 11px;
    font-weight: 650;
  }
  .fomc-history em {
    color: var(--d-cream);
    font-size: 11px;
    font-style: normal;
  }

  .earnings-list { list-style: none; margin: 0; padding: 0; }
  .earnings-row {
    display: grid;
    grid-template-columns: 48px 1fr auto auto;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid var(--d-line);
    font-variant-numeric: tabular-nums;
  }
  .earnings-row:last-child { border-bottom: none; }
  .earnings-symbol {
    color: var(--d-apricot);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
  }
  .earnings-title {
    display: grid;
    gap: 2px;
    min-width: 0;
  }
  .earnings-title strong {
    color: var(--d-cream);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .earnings-title em {
    color: var(--d-mute);
    font-size: 11px;
    font-style: normal;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .earnings-when,
  .earnings-move {
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    white-space: nowrap;
  }
  .earnings-when { color: var(--d-mute); }

  .macro-event-list { list-style: none; margin: 0; padding: 0; }
  .macro-event-row {
    display: grid;
    grid-template-columns: 64px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 7px 0;
    border-bottom: 1px solid var(--d-line);
    font-variant-numeric: tabular-nums;
  }
  .macro-event-row:last-child { border-bottom: none; }
  .macro-event-impact {
    justify-self: start;
    padding: 3px 6px;
    border-radius: 4px;
    background: rgba(250, 247, 235, 0.06);
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .macro-event-impact[data-impact="high"] {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.12);
  }
  .macro-event-impact[data-impact="medium"] {
    color: #f9a26c;
    background: rgba(249, 162, 108, 0.12);
  }
  .macro-event-title {
    display: grid;
    min-width: 0;
    gap: 2px;
  }
  .macro-event-title strong {
    color: var(--d-cream);
    font-size: 12px;
    font-weight: 650;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .macro-event-title em {
    color: var(--d-mute);
    font-size: 11px;
    font-style: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .macro-event-when {
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 11px;
    white-space: nowrap;
  }

  .unlock-list { list-style: none; margin: 0; padding: 0; }
  .unlock-row {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: baseline;
    gap: 10px;
    padding: 7px 0;
    font-size: 12px;
    border-bottom: 1px solid var(--d-line);
    font-variant-numeric: tabular-nums;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
  }
  .unlock-row:last-child { border-bottom: none; }
  .unlock-sym { color: var(--d-cream); font-weight: 600; }
  .unlock-val { color: var(--d-text-2); text-align: right; }
  .unlock-when { color: #f9a26c; font-size: 11px; }

  /* ── News ─────────────────────────────────────────────────── */
  .news-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; }
  .news-row {
    padding: 10px 0;
    border-bottom: 1px solid var(--d-line);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 12px;
    align-items: start;
  }
  .news-row:last-child { border-bottom: none; }
  .news-title {
    color: var(--d-text);
    text-decoration: none;
    font-size: 13px;
    line-height: 1.5;
    letter-spacing: 0.005em;
    transition: color 0.12s;
    grid-column: 1 / -1;
  }
  .news-title:hover { color: var(--d-apricot); }
  .news-meta {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: var(--d-mute);
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    flex-wrap: wrap;
    grid-column: 1 / -1;
  }
  .news-time { color: var(--d-mute-2); }
  .news-source { color: var(--d-text-2); }
  .news-imp {
    color: #f9a26c;
    background: rgba(249,162,108,0.1);
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* ── Empty / CTA / Footer ─────────────────────────────────── */
  .empty { color: var(--d-mute); font-size: 13px; text-align: center; padding: 24px 12px; }

  .skel-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px 12px;
  }

  .skel-rows-sm {
    padding: 4px 0;
    gap: 8px;
  }

  .skel-rows .skel-line {
    height: 10px;
  }

  .cta-block {
    margin: 36px 0 28px;
    padding: 36px 24px;
    background:
      radial-gradient(circle at 80% 20%, rgba(249, 216, 194, 0.08), transparent 40%),
      radial-gradient(circle at 20% 80%, rgba(255, 127, 133, 0.06), transparent 40%),
      var(--d-bg-1);
    border: 1px solid var(--d-line-strong);
    border-radius: 14px;
    text-align: center;
  }
  .cta-h {
    font-family: var(--sc-font-display, 'GT Sectra Display', 'Times New Roman', serif);
    font-size: 26px;
    font-weight: 600;
    color: var(--d-cream);
    margin-bottom: 10px;
    letter-spacing: -0.005em;
  }
  .cta-body {
    font-size: 14.5px;
    color: var(--d-text-2);
    line-height: 1.65;
    max-width: 540px;
    margin: 0 auto 22px;
  }
  .cta-actions {
    display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
  }

  .ftr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 18px;
    border-top: 1px solid var(--d-line);
    font-size: 12px;
    color: var(--d-mute);
  }
  .ftr a { color: var(--d-text-2); text-decoration: none; }
  .ftr a:hover { color: var(--d-apricot); }

  /* ── Responsive ───────────────────────────────────────────── */
  @media (max-width: 1120px) {
    .daily-workbench {
      grid-template-columns: 1fr;
    }
    .workbench-side {
      position: static;
      overflow: visible;
      grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
      align-items: start;
    }
  }

  @media (min-width: 1360px) {
    .grid {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  @media (max-width: 900px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .regime-hero { flex-direction: column; align-items: flex-start; }
    .rh-stats { border-left: none; padding-left: 0; border-top: 1px solid var(--d-line); padding-top: 12px; }
  }
  @media (max-width: 600px) {
    .grid { grid-template-columns: 1fr; }
    .card-patterns, .card-news, .card-stocks, .card-calendar, .card-events,
    .card-options, .card-onchain, .card-venue-funding, .card-whales, .card-trending, .card-crypto,
    .card-commodities, .card-us-stocks, .card-kr-stocks {
      grid-column: span 1;
    }
    .card-news { grid-column: 1 / -1; }
    .rh-stats { gap: 12px; }
    .rhs { border-right: none; padding: 0 12px 0 0; }
    .rh-price { font-size: 18px; }
    .section-label {
      align-items: flex-start;
      flex-direction: column;
      gap: 2px;
      padding-bottom: 8px;
    }
    .earnings-row {
      grid-template-columns: 44px 1fr auto;
    }
    .earnings-move {
      display: none;
    }
    .fg-value { font-size: 52px; }
    .market-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 768px) {
    .l7-sticky {
      left: 0;
      bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    }
  }
</style>
