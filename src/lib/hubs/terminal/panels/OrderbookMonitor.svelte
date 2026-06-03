<script lang="ts">
  /**
   * OrderbookMonitor — Real-time orderbook depth panel for altcoin futures.
   * Polls /api/terminal/agent/orderbook every 20s.
   * Shows price, BTC, bid/ask walls, TBuy, position P&L, alert feed.
   */
  import { onMount, onDestroy } from 'svelte';

  const STORAGE_KEY = 'ob_monitor_panel';
  const REFRESH_MS = 20_000;
  const FEED_MAX = 15;

  // ── Types ─────────────────────────────────────────────────────────────────

  interface WallLevel {
    price: number;
    usd: number;
  }

  interface Position {
    entry: number;
    leverage: number;
    liq: number;
    target?: number;
    pnl_pct: number;
    pnl_leveraged: number;
    dist_liq_pct: number;
    dist_target_pct?: number;
  }

  interface ObData {
    symbol: string;
    price: number;
    btc_price: number;
    bid_total_usd: number;
    ask_total_usd: number;
    ratio: number;
    tbuy: number;
    vol_1m_usd: number;
    key_asks: WallLevel[];
    key_bids: WallLevel[];
    position?: Position;
    error?: string;
  }

  interface FeedEvent {
    ts: string;
    msg: string;
  }

  // ── Persisted state ───────────────────────────────────────────────────────

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as { symbol: string; entry: string; leverage: string; target: string };
    } catch { /* ignore */ }
    return { symbol: 'LONGXIA', entry: '', leverage: '10', target: '' };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ symbol, entry, leverage, target }));
    } catch { /* ignore */ }
  }

  const saved = loadState();
  let symbol = $state(saved.symbol);
  let entry = $state(saved.entry);
  let leverage = $state(saved.leverage);
  let target = $state(saved.target);

  // ── Runtime state ─────────────────────────────────────────────────────────

  let data = $state<ObData | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let feed = $state<FeedEvent[]>([]);
  let lastFetch = $state(0);
  let now = $state(Date.now());
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let tickId: ReturnType<typeof setInterval> | null = null;

  // Previous values for change detection
  let prevTopAsk = $state<WallLevel | null>(null);
  let prevBtcPrice = $state<number | null>(null);
  let prevTbuy = $state<number | null>(null);
  let prevRatio = $state<number | null>(null);

  const secsUntilRefresh = $derived(
    lastFetch ? Math.max(0, Math.ceil((REFRESH_MS - (now - lastFetch)) / 1000)) : 0
  );

  // ── Formatting helpers ────────────────────────────────────────────────────

  function fmtUsd(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
    return `$${Math.round(v)}`;
  }

  function fmtUsdFull(v: number): string {
    return `$${Math.round(v).toLocaleString()}`;
  }

  function fmtPrice(v: number): string {
    if (v >= 1000) return v.toFixed(0);
    if (v >= 1) return v.toFixed(4);
    if (v >= 0.001) return v.toFixed(6);
    return v.toFixed(8);
  }

  function fmtPct(v: number, digits = 2): string {
    return `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`;
  }

  function nowHHMM(): string {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // ── Alert feed logic ──────────────────────────────────────────────────────

  function pushFeedEvent(msg: string) {
    const event: FeedEvent = { ts: nowHHMM(), msg };
    feed = [event, ...feed].slice(0, FEED_MAX);
  }

  function checkAlerts(d: ObData) {
    // Top ask wall change >= 30% decrease
    const topAsk = d.key_asks[0] ?? null;
    if (prevTopAsk && topAsk && topAsk.price === prevTopAsk.price) {
      const pct = (prevTopAsk.usd - topAsk.usd) / prevTopAsk.usd;
      if (pct >= 0.3) {
        pushFeedEvent(
          `▼ $${fmtPrice(topAsk.price)} 벽 감소 ${fmtUsd(prevTopAsk.usd)}→${fmtUsd(topAsk.usd)}`
        );
      }
    }
    prevTopAsk = topAsk;

    // BTC $80K cross
    const BTC_LEVEL = 80_000;
    if (prevBtcPrice !== null) {
      if (prevBtcPrice < BTC_LEVEL && d.btc_price >= BTC_LEVEL) {
        pushFeedEvent('↑ BTC $80K 돌파');
      } else if (prevBtcPrice >= BTC_LEVEL && d.btc_price < BTC_LEVEL) {
        pushFeedEvent('! BTC $80K 이탈');
      }
    }
    prevBtcPrice = d.btc_price;

    // TBuy threshold events
    if (prevTbuy !== null) {
      if (prevTbuy < 0.85 && d.tbuy >= 0.85) {
        pushFeedEvent(`◆ TBuy ${d.tbuy.toFixed(2)} 강한매수`);
      } else if (prevTbuy > 0.15 && d.tbuy <= 0.15) {
        pushFeedEvent(`▽ TBuy ${d.tbuy.toFixed(2)} 매도폭탄`);
      }
    }
    prevTbuy = d.tbuy;

    // Ratio alert
    if (prevRatio !== null && prevRatio >= 0.8 && d.ratio < 0.8) {
      pushFeedEvent('! 매도 우세');
    }
    prevRatio = d.ratio;
  }

  // ── Fetch ────────────────────────────────────────────────────────────────

  async function fetchOb() {
    if (loading) return;
    loading = true;
    error = null;
    saveState();

    const params = new URLSearchParams({ symbol });
    if (entry) params.set('entry', entry);
    if (leverage && leverage !== '1') params.set('leverage', leverage);
    if (target) params.set('target', target);

    try {
      const res = await fetch(`/api/terminal/agent/orderbook?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as ObData;
      if (json.error) throw new Error(json.error);
      checkAlerts(json);
      data = json;
      lastFetch = Date.now();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : '조회 실패';
    } finally {
      loading = false;
    }
  }

  // ── Derived colors ────────────────────────────────────────────────────────

  const tbuyColor = $derived.by(() => {
    const t = data?.tbuy ?? 0;
    if (t >= 0.7) return '#22AB94';
    if (t <= 0.3) return '#F23645';
    return '#d6a347';
  });

  const ratioColor = $derived.by(() => {
    const r = data?.ratio ?? 0;
    if (r >= 1.5) return '#22AB94';
    if (r < 1.0) return '#F23645';
    return '#d6a347';
  });

  const pnlColor = $derived.by(() => {
    const p = data?.position?.pnl_pct ?? 0;
    return p >= 0 ? '#22AB94' : '#F23645';
  });

  const liqWarning = $derived.by(() => {
    const pos = data?.position;
    if (!pos) return false;
    return pos.dist_liq_pct > -5; // liq is within 5% below current price
  });

  // ── Bar width (max wall = 100%) ───────────────────────────────────────────

  function barPct(usd: number, walls: WallLevel[]): number {
    const maxUsd = Math.max(...walls.map((w) => w.usd), 1);
    return Math.round((usd / maxUsd) * 100);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onMount(() => {
    fetchOb();
    intervalId = setInterval(fetchOb, REFRESH_MS);
    tickId = setInterval(() => { now = Date.now(); }, 1_000);
  });
  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
    if (tickId) clearInterval(tickId);
  });
</script>

<div class="ob-wrap">
  <!-- Header -->
  <div class="ob-header">
    <span class="ob-title">ORDERBOOK</span>
    <span class="ob-header-status">
      {#if loading}
        <span class="ob-spinning">↻</span>
      {:else if lastFetch}
        {secsUntilRefresh}s 후 갱신
      {/if}
    </span>
  </div>

  <!-- Controls -->
  <div class="ob-controls">
    <div class="ob-row">
      <label class="ob-label" for="ob-sym">심볼</label>
      <input
        id="ob-sym"
        class="ob-input ob-input--sym"
        type="text"
        bind:value={symbol}
        placeholder="LONGXIA"
        onblur={fetchOb}
      />
      <label class="ob-label" for="ob-entry">진입</label>
      <input
        id="ob-entry"
        class="ob-input ob-input--price"
        type="number"
        step="any"
        bind:value={entry}
        placeholder="0.0074"
      />
      <label class="ob-label" for="ob-lev">레버</label>
      <input
        id="ob-lev"
        class="ob-input ob-input--lev"
        type="number"
        min="1"
        max="125"
        bind:value={leverage}
        placeholder="10"
      />
    </div>
    <div class="ob-row">
      <label class="ob-label" for="ob-target">목표가</label>
      <input
        id="ob-target"
        class="ob-input ob-input--price"
        type="number"
        step="any"
        bind:value={target}
        placeholder="0.00715"
      />
    </div>
    <button class="ob-go-btn ob-go-btn--primary" onclick={fetchOb} disabled={loading}>
      {loading ? '조회 중...' : '조회'}
    </button>
  </div>

  <!-- Error -->
  {#if error}
    <div class="ob-error">{error}</div>
  {/if}

  {#if data}
    <!-- Price row -->
    <div class="ob-section">
      <div class="ob-price-row">
        <span class="ob-price">${fmtPrice(data.price)}</span>
        <span class="ob-btc">BTC ${Math.round(data.btc_price).toLocaleString()}</span>
        {#if data.btc_price >= 80_000}
          <span class="ob-btc-badge ob-btc-badge--green">▲</span>
        {:else}
          <span class="ob-btc-badge ob-btc-badge--red">▼</span>
        {/if}
      </div>

      <!-- Position P&L -->
      {#if data.position}
        {@const pos = data.position}
        <div class="ob-pnl-row">
          <span class="ob-pnl" style:color={pnlColor}>
            PnL {fmtPct(pos.pnl_pct)} ({fmtPct(pos.pnl_leveraged)} {pos.leverage}x)
          </span>
        </div>
        <div class="ob-liq-row" class:ob-liq-row--warn={liqWarning}>
          <span>청산 ${fmtPrice(pos.liq)}</span>
          <span style:color={liqWarning ? '#F23645' : 'var(--term-text-1, #8a8aaa)'}>{fmtPct(pos.dist_liq_pct)}</span>
          {#if pos.dist_target_pct !== undefined}
            <span class="ob-target-dist">목표까지 {fmtPct(pos.dist_target_pct)}</span>
          {/if}
        </div>
      {/if}
    </div>

    <div class="ob-divider"></div>

    <!-- Bid/Ask totals -->
    <div class="ob-section">
      <div class="ob-balance-row">
        <span class="ob-bid-label">매수 {fmtUsd(data.bid_total_usd)}</span>
        <div class="ob-balance-bar">
          <div class="ob-balance-fill ob-balance-fill--bid" style:width="{Math.round(data.bid_total_usd / (data.bid_total_usd + data.ask_total_usd) * 100)}%"></div>
        </div>
        <span class="ob-ask-label">매도 {fmtUsd(data.ask_total_usd)}</span>
        <span class="ob-ratio" style:color={ratioColor}>{data.ratio.toFixed(2)}x</span>
      </div>
    </div>

    <div class="ob-divider"></div>

    <!-- Key walls -->
    <div class="ob-section">
      <div class="ob-wall-header">핵심 매도벽</div>
      {#each data.key_asks as ask}
        <div class="ob-wall-row">
          <span class="ob-wall-price ob-wall-price--ask">${fmtPrice(ask.price)}</span>
          <div class="ob-wall-bar-wrap">
            <div
              class="ob-wall-bar ob-wall-bar--ask"
              style:width="{barPct(ask.usd, data.key_asks)}%"
            ></div>
          </div>
          <span class="ob-wall-usd">{fmtUsdFull(ask.usd)}</span>
        </div>
      {/each}

      <div class="ob-wall-header ob-wall-header--bid">핵심 매수벽</div>
      {#each data.key_bids as bid}
        <div class="ob-wall-row">
          <span class="ob-wall-price ob-wall-price--bid">${fmtPrice(bid.price)}</span>
          <div class="ob-wall-bar-wrap">
            <div
              class="ob-wall-bar ob-wall-bar--bid"
              style:width="{barPct(bid.usd, data.key_bids)}%"
            ></div>
          </div>
          <span class="ob-wall-usd">{fmtUsdFull(bid.usd)}</span>
        </div>
      {/each}
    </div>

    <div class="ob-divider"></div>

    <!-- TBuy + Vol -->
    <div class="ob-section">
      <div class="ob-tbuy-row">
        <span class="ob-tbuy-label">TBuy</span>
        <div class="ob-tbuy-bar-wrap">
          <div
            class="ob-tbuy-bar"
            style:width="{Math.round(data.tbuy * 100)}%"
            style:background={tbuyColor}
          ></div>
        </div>
        <span class="ob-tbuy-val" style:color={tbuyColor}>{data.tbuy.toFixed(2)}</span>
        <span class="ob-vol">Vol {fmtUsd(data.vol_1m_usd)}</span>
      </div>
    </div>

    <div class="ob-divider"></div>

    <!-- Alert feed -->
    <div class="ob-section ob-section--feed">
      <div class="ob-feed-header">
        <span>알림 피드</span>
        <span class="ob-countdown">{secsUntilRefresh}s 후 갱신</span>
      </div>
      {#if feed.length === 0}
        <div class="ob-feed-empty">이벤트 없음</div>
      {:else}
        {#each feed as evt}
          <div class="ob-feed-row">
            <span class="ob-feed-ts">{evt.ts}</span>
            <span class="ob-feed-msg">{evt.msg}</span>
          </div>
        {/each}
      {/if}
    </div>
  {:else if !loading && !error}
    <div class="ob-empty">데이터 없음 — 조회 버튼을 누르세요</div>
  {:else if loading && !data}
    <div class="ob-empty">로딩 중…</div>
  {/if}
</div>

<style>
  .ob-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--term-text-1, #8a8aaa);
    background: var(--term-surface-0, #0a0a12);
  }

  /* ── Header ── */
  .ob-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--term-border, #1a1a28);
  }
  .ob-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--term-text-0, #e0e0f0);
  }
  .ob-header-status {
    font-size: 11px;
    color: var(--term-text-2, #404060);
  }
  .ob-spinning { display: inline-block; animation: ob-spin 0.7s linear infinite; }
  @keyframes ob-spin { to { transform: rotate(360deg); } }

  /* ── Controls ── */
  .ob-controls {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 5px 10px;
    border-bottom: 1px solid var(--term-border, #1a1a28);
    flex-shrink: 0;
  }
  .ob-row {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .ob-label {
    font-size: 11px;
    color: var(--term-text-2, #404060);
    white-space: nowrap;
    letter-spacing: 0.04em;
  }
  .ob-input {
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    color: var(--term-text-0, #e0e0f0);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 2px 5px;
    min-width: 0;
  }
  .ob-input:focus {
    outline: none;
    border-color: var(--brand, #5b5bd6);
  }
  .ob-input--sym  { width: 78px; }
  .ob-input--price { width: 66px; }
  .ob-input--lev  { width: 38px; }
  .ob-go-btn {
    width: 100%;
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    color: var(--term-text-1, #8a8aaa);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 5px 0;
    margin-top: 2px;
    cursor: pointer;
    transition: border-color 0.1s, color 0.1s, background 0.1s;
  }
  .ob-go-btn--primary {
    background: var(--brand, #5b5bd6);
    border-color: var(--brand, #5b5bd6);
    color: #fff;
  }
  .ob-go-btn--primary:hover:not(:disabled) {
    opacity: 0.88;
  }
  .ob-go-btn:disabled { opacity: 0.35; cursor: default; }

  /* ── Error ── */
  .ob-error {
    padding: 6px 10px;
    color: #F23645;
    font-size: 11px;
  }

  /* ── Sections ── */
  .ob-section {
    padding: 6px 10px;
    flex-shrink: 0;
  }
  .ob-section--feed {
    flex: 1;
    min-height: 0;
  }
  .ob-divider {
    flex-shrink: 0;
    height: 1px;
    background: var(--term-border, #1a1a28);
    margin: 0;
  }

  /* ── Price ── */
  .ob-price-row {
    display: flex;
    align-items: baseline;
    gap: 7px;
    margin-bottom: 3px;
  }
  .ob-price {
    font-size: 15px;
    font-weight: 700;
    color: var(--term-text-0, #e0e0f0);
    letter-spacing: -0.01em;
  }
  .ob-btc {
    font-size: 11px;
    color: var(--term-text-2, #404060);
  }
  .ob-btc-badge { font-size: 11px; }
  .ob-btc-badge--green { color: #22AB94; }
  .ob-btc-badge--red   { color: #F23645; }

  /* ── PnL ── */
  .ob-pnl-row {
    margin-bottom: 2px;
  }
  .ob-pnl {
    font-size: 11px;
    font-weight: 700;
  }
  .ob-liq-row {
    display: flex;
    gap: 8px;
    font-size: 11px;
    color: var(--term-text-2, #404060);
  }
  .ob-liq-row--warn { color: #F23645; }
  .ob-target-dist { color: var(--term-text-1, #8a8aaa); }

  /* ── Bid/Ask balance ── */
  .ob-balance-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ob-bid-label { color: #22AB94; font-size: 11px; white-space: nowrap; }
  .ob-ask-label { color: #F23645; font-size: 11px; white-space: nowrap; }
  .ob-ratio { font-size: 11px; font-weight: 700; margin-left: 2px; }

  .ob-balance-bar {
    flex: 1;
    height: 4px;
    background: rgba(242,54,69,0.25);
    border-radius: 2px;
    overflow: hidden;
    min-width: 0;
  }
  .ob-balance-fill {
    height: 100%;
    border-radius: 2px;
  }
  .ob-balance-fill--bid { background: rgba(34,171,148,0.65); }

  /* ── Walls ── */
  .ob-wall-header {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--term-text-2, #404060);
    margin-bottom: 3px;
    margin-top: 2px;
    text-transform: uppercase;
  }
  .ob-wall-header--bid { margin-top: 5px; }

  .ob-wall-row {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 2px;
  }
  .ob-wall-price {
    width: 60px;
    flex-shrink: 0;
    font-size: 11px;
  }
  .ob-wall-price--ask { color: #F23645; }
  .ob-wall-price--bid { color: #22AB94; }

  .ob-wall-bar-wrap {
    flex: 1;
    height: 6px;
    background: var(--term-surface-1, #111120);
    border-radius: 2px;
    overflow: hidden;
    min-width: 0;
  }
  .ob-wall-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  .ob-wall-bar--ask { background: rgba(242,54,69,0.5); }
  .ob-wall-bar--bid { background: rgba(34,171,148,0.5); }

  .ob-wall-usd {
    width: 58px;
    flex-shrink: 0;
    text-align: right;
    font-size: 11px;
    color: var(--term-text-2, #404060);
  }

  /* ── TBuy ── */
  .ob-tbuy-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .ob-tbuy-label {
    font-size: 11px;
    color: var(--term-text-2, #404060);
    white-space: nowrap;
    letter-spacing: 0.04em;
  }
  .ob-tbuy-bar-wrap {
    flex: 1;
    height: 5px;
    background: var(--term-surface-1, #111120);
    border-radius: 2px;
    overflow: hidden;
    min-width: 0;
  }
  .ob-tbuy-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  .ob-tbuy-val {
    font-size: 11px;
    font-weight: 700;
    width: 30px;
    text-align: right;
    flex-shrink: 0;
  }
  .ob-vol {
    font-size: 11px;
    color: var(--term-text-2, #404060);
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* ── Feed ── */
  .ob-feed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--term-text-2, #404060);
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .ob-countdown {
    color: var(--term-text-2, #404060);
    font-weight: 400;
  }
  .ob-feed-empty {
    font-size: 11px;
    color: var(--term-text-2, #404060);
    text-align: center;
    padding: 8px 0;
  }
  .ob-feed-row {
    display: flex;
    gap: 6px;
    margin-bottom: 3px;
    font-size: 11px;
    line-height: 1.4;
  }
  .ob-feed-ts {
    color: var(--term-text-2, #404060);
    flex-shrink: 0;
    width: 36px;
  }
  .ob-feed-msg { color: var(--term-text-1, #8a8aaa); }

  /* ── Empty / loading ── */
  .ob-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--term-text-2, #404060);
    font-size: 11px;
    padding: 20px;
    text-align: center;
  }
</style>
