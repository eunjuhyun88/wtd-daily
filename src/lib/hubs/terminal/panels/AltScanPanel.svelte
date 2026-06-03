<script lang="ts">
  /**
   * AltScanPanel — Pre-pump 3-signal short squeeze scanner.
   * Polls /api/terminal/agent/altcoin every 30s.
   * Shows price / OI / FR / TBuy, 3-signal status, cascade map, optional AI.
   */
  import { onMount, onDestroy } from 'svelte';

  const SYMBOLS = ['LONGXIA', 'CHIP', 'SKYAI'] as const;
  type Symbol = typeof SYMBOLS[number];

  const STORAGE_KEY = 'alt_scan_panel';

  interface CascadeLevel {
    price: number;
    label: string;
    pct_from_now: number;
  }

  interface Position {
    entry: number;
    leverage: number;
    pnl_pct: number;
    pnl_leveraged: number;
    liq_price: number;
    dist_liq_pct: number;
    dist_target_pct: number;
  }

  interface Signals {
    s1_price_down_oi_up: boolean;
    s2_fr_extreme: boolean;
    s3_short_cover: boolean;
  }

  interface ScanResult {
    symbol: string;
    symbol_fapi: string;
    price: number;
    change_24h: number;
    oi_usd: number;
    oi_trend: 'up' | 'down';
    fr_pct: number;
    tbuy_ratio: number;
    signal_count: number;
    signal_label: string;
    signals: Signals;
    cascade_levels: CascadeLevel[];
    position?: Position;
    analysis?: string;
    error?: string;
  }

  const REFRESH_MS = 30_000;

  // ── Persisted state ───────────────────────────────────────────────────────
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as { symbol: Symbol; entry: string; leverage: string };
    } catch { /* ignore */ }
    return { symbol: 'LONGXIA' as Symbol, entry: '', leverage: '1' };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ symbol, entry, leverage }));
    } catch { /* ignore */ }
  }

  const saved = loadState();
  let symbol = $state<Symbol>(saved.symbol);
  let entry = $state(saved.entry);
  let leverage = $state(saved.leverage);

  let data = $state<ScanResult | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let llmLoading = $state(false);
  let llmText = $state<string | null>(null);
  let lastFetch = $state(0);
  let now = $state(Date.now());
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let tickId: ReturnType<typeof setInterval> | null = null;

  const secsAgo = $derived(lastFetch ? Math.floor((now - lastFetch) / 1000) : null);

  const SIGNAL_COLOR: Record<string, string> = {
    '없음': '#505060',
    '준비': '#6ea3ff',
    '임박': '#d6a347',
    '트리거': '#F23645',
  };
  const signalColor = $derived(SIGNAL_COLOR[data?.signal_label ?? '없음'] ?? '#c0c0d0');

  function fmtUsd(v: number): string {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
    if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v.toFixed(2)}`;
  }

  function fmtPct(v: number, digits = 2): string {
    return `${v >= 0 ? '+' : ''}${v.toFixed(digits)}%`;
  }

  function fmtPrice(v: number): string {
    if (v >= 1) return v.toFixed(4);
    if (v >= 0.001) return v.toFixed(6);
    return v.toFixed(8);
  }

  async function fetchScan() {
    if (loading) return;
    loading = true;
    error = null;
    llmText = null;
    saveState();

    const params = new URLSearchParams({ symbol });
    if (entry) params.set('entry', entry);
    if (leverage && leverage !== '1') params.set('leverage', leverage);

    try {
      const res = await fetch(`/api/terminal/agent/altcoin?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as ScanResult;
      if (json.error) throw new Error(json.error);
      data = json;
      lastFetch = Date.now();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : '조회 실패';
    } finally {
      loading = false;
    }
  }

  async function fetchLLM() {
    if (llmLoading) return;
    llmLoading = true;
    llmText = null;
    saveState();

    const params = new URLSearchParams({ symbol, llm: 'true' });
    if (entry) params.set('entry', entry);
    if (leverage && leverage !== '1') params.set('leverage', leverage);

    try {
      const res = await fetch(`/api/terminal/agent/altcoin?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as ScanResult;
      llmText = json.analysis ?? '분석 없음';
      data = { ...json, analysis: undefined };
      lastFetch = Date.now();
    } catch (e: unknown) {
      llmText = e instanceof Error ? `오류: ${e.message}` : '분석 실패';
    } finally {
      llmLoading = false;
    }
  }

  function onSymbolChange(s: Symbol) {
    symbol = s;
    data = null;
    llmText = null;
    fetchScan();
  }

  onMount(() => {
    fetchScan();
    intervalId = setInterval(fetchScan, REFRESH_MS);
    tickId = setInterval(() => { now = Date.now(); }, 5_000);
  });
  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
    if (tickId) clearInterval(tickId);
  });
</script>

<div class="as-wrap">
  <!-- Header -->
  <div class="as-header">
    <span class="as-title">ALT SCANNER</span>
    <span class="as-refresh-status">
      {#if loading}
        <span class="as-spinner">↻</span>
      {:else if secsAgo !== null}
        {secsAgo}s ago
      {/if}
    </span>
  </div>

  <!-- Symbol selector -->
  <div class="as-controls">
    <div class="as-sym-tabs">
      {#each SYMBOLS as s}
        <button
          class="as-sym-btn"
          class:as-sym-btn--active={symbol === s}
          onclick={() => onSymbolChange(s)}
        >{s}</button>
      {/each}
    </div>
    <div class="as-inputs">
      <input
        class="as-input"
        type="number"
        placeholder="진입가"
        bind:value={entry}
        step="any"
        min="0"
      />
      <select class="as-input as-select" bind:value={leverage}>
        <option value="1">1x</option>
        <option value="3">3x</option>
        <option value="5">5x</option>
        <option value="10">10x</option>
        <option value="20">20x</option>
        <option value="50">50x</option>
      </select>
    </div>
    <button class="as-scan-btn as-scan-btn--primary" onclick={fetchScan} disabled={loading}>
      {loading ? '조회 중...' : '조회'}
    </button>
  </div>

  {#if error}
    <div class="as-error">{error}</div>
  {:else if !data && loading}
    <div class="as-loading">데이터 로딩 중...</div>
  {:else if data}
    <!-- Price row -->
    <div class="as-price-row">
      <span class="as-price">${fmtPrice(data.price)}</span>
      <span class="as-change" class:as-neg={data.change_24h < 0} class:as-pos={data.change_24h >= 0}>
        {fmtPct(data.change_24h)}
      </span>
      <span class="as-label-dim">24h</span>
    </div>

    <!-- Signal status — PRIMARY answer: 터질 타이밍인가? -->
    <div class="as-signal-row">
      <div class="as-signal-dots">
        {#each [data.signals.s1_price_down_oi_up, data.signals.s2_fr_extreme, data.signals.s3_short_cover] as on}
          <span class="as-dot" class:as-dot--on={on}></span>
        {/each}
      </div>
      <span class="as-signal-label" style="color:{signalColor}">
        {data.signal_label} ({data.signal_count}/3)
      </span>
    </div>
    <div class="as-signal-detail">
      <span class:as-sig-on={data.signals.s1_price_down_oi_up} class:as-sig-off={!data.signals.s1_price_down_oi_up}>
        ① 가격↓+OI↑ {data.signals.s1_price_down_oi_up ? '✓' : '✗'}
      </span>
      <span class:as-sig-on={data.signals.s2_fr_extreme} class:as-sig-off={!data.signals.s2_fr_extreme}>
        ② FR극단 {data.signals.s2_fr_extreme ? '✓' : '✗'}
      </span>
      <span class:as-sig-on={data.signals.s3_short_cover} class:as-sig-off={!data.signals.s3_short_cover}>
        ③ 숏커버 {data.signals.s3_short_cover ? '✓' : '✗'}
      </span>
    </div>

    <!-- Metrics row — supporting context -->
    <div class="as-metrics">
      <div class="as-metric">
        <span class="as-metric-label">OI</span>
        <span class="as-metric-val">{fmtUsd(data.oi_usd)}</span>
        <span class="as-metric-arrow" class:as-pos={data.oi_trend === 'up'} class:as-neg={data.oi_trend === 'down'}>
          {data.oi_trend === 'up' ? '↑' : '↓'}
        </span>
      </div>
      <div class="as-metric">
        <span class="as-metric-label">FR</span>
        <span class="as-metric-val" class:as-fr-extreme={Math.abs(data.fr_pct) >= 0.05}>
          {data.fr_pct.toFixed(4)}%
        </span>
      </div>
      <div class="as-metric">
        <span class="as-metric-label">TBuy</span>
        <span class="as-metric-val" class:as-pos={data.tbuy_ratio >= 1.1} class:as-neg={data.tbuy_ratio < 0.9}>
          {data.tbuy_ratio.toFixed(2)}x
        </span>
      </div>
    </div>

    <!-- Position block (when entry set) -->
    {#if data.position}
      {@const pos = data.position}
      {@const safetyPct = Math.min(100, Math.max(0, (pos.dist_liq_pct / 20) * 100))}
      <div class="as-pos-block">
        <div class="as-pos-header">
          <span>포지션</span>
          <span
            class:as-pos-neg={pos.pnl_pct < 0}
            class:as-pos-profit={pos.pnl_pct >= 0}
          >
            {fmtPct(pos.pnl_pct)} ({fmtPct(pos.pnl_leveraged)} {pos.leverage}x)
          </span>
          {#if pos.dist_liq_pct <= 5}
            <span class="as-liq-warn">!</span>
          {/if}
        </div>
        <div class="as-liq-bar-wrap">
          <div class="as-liq-bar-track">
            <div class="as-liq-bar-fill" style="width:{safetyPct}%"></div>
          </div>
          <div class="as-liq-bar-labels">
            <span>청산 ${fmtPrice(pos.liq_price)}</span>
            <span class:as-neg={pos.dist_liq_pct < 5}>청산까지 {fmtPct(pos.dist_liq_pct, 1)}</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Cascade map -->
    {#if data.cascade_levels.length > 0}
      <div class="as-cascade">
        <div class="as-section-title">숏 캐스케이드</div>
        <div class="as-cascade-list">
          <div class="as-cascade-row as-cascade-now">
            <span class="as-casc-label">현재</span>
            <div class="as-casc-bar-track"><div class="as-casc-bar-now"></div></div>
            <span class="as-casc-price">${fmtPrice(data.price)}</span>
          </div>
          {#each data.cascade_levels as lvl}
            {@const barW = Math.min(95, 10 + lvl.pct_from_now * 2.5)}
            <div class="as-cascade-row">
              <span class="as-casc-label">{lvl.label}</span>
              <div class="as-casc-bar-track">
                <div class="as-casc-bar-fill" style="width:{barW}%"></div>
              </div>
              <span class="as-casc-pct">+{lvl.pct_from_now.toFixed(1)}%</span>
              <span class="as-casc-price">${fmtPrice(lvl.price)}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- AI analysis -->
    <div class="as-actions">
      <button class="as-ai-btn" onclick={fetchLLM} disabled={llmLoading}>
        {llmLoading ? '분석 중...' : 'AI 분석'}
      </button>
    </div>
    {#if llmText}
      <div class="as-ai-result">{llmText}</div>
    {/if}
  {/if}

  <div class="as-footer">
    Binance Futures · 30s 자동갱신
  </div>
</div>

<style>
  .as-wrap {
    background: var(--term-surface-0, #0a0a12);
    display: flex;
    flex-direction: column;
    height: 100%;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--term-text-1, #8a8aaa);
    overflow: hidden;
  }
  .as-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--term-border, #1a1a28);
    flex-shrink: 0;
  }
  .as-title {
    font-weight: 700;
    color: var(--term-text-0, #e0e0f0);
    font-size: 11px;
    letter-spacing: 0.08em;
    flex: 1;
  }
  .as-refresh-status { color: var(--term-text-2, #404060); font-size: 11px; }
  .as-spinner { display: inline-block; animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .as-controls {
    padding: 5px 8px;
    border-bottom: 1px solid var(--term-border, #1a1a28);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .as-sym-tabs { display: flex; gap: 3px; }
  .as-sym-btn {
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    color: var(--term-text-2, #404060);
    font-size: 11px;
    font-family: inherit;
    letter-spacing: 0.06em;
    padding: 2px 7px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .as-sym-btn--active {
    border-color: var(--brand, #5b5bd6);
    color: var(--term-text-0, #e0e0f0);
  }
  .as-sym-btn:hover:not(.as-sym-btn--active) { color: var(--term-text-1, #8a8aaa); }
  .as-inputs { display: flex; gap: 3px; align-items: center; }
  .as-input {
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    color: var(--term-text-0, #e0e0f0);
    font-size: 11px;
    font-family: inherit;
    padding: 2px 5px;
    width: 76px;
  }
  .as-input:focus { outline: none; border-color: var(--brand, #5b5bd6); }
  .as-select { width: 48px; }
  .as-scan-btn {
    width: 100%;
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    color: var(--term-text-1, #8a8aaa);
    font-size: 11px;
    font-family: inherit;
    letter-spacing: 0.06em;
    padding: 5px 0;
    cursor: pointer;
    transition: all 0.15s;
  }
  .as-scan-btn--primary {
    background: var(--brand, #5b5bd6);
    border-color: var(--brand, #5b5bd6);
    color: #fff;
    font-weight: 600;
  }
  .as-scan-btn--primary:hover:not(:disabled) {
    opacity: 0.88;
  }
  .as-scan-btn:disabled { opacity: 0.35; cursor: default; }

  .as-error { padding: 14px; color: #F23645; font-size: 11px; text-align: center; }
  .as-loading { padding: 14px; color: var(--term-text-2, #404060); font-size: 11px; text-align: center; }

  .as-price-row {
    padding: 7px 10px 3px;
    display: flex; align-items: baseline; gap: 7px;
    flex-shrink: 0;
  }
  .as-price { font-size: 15px; font-weight: 700; color: var(--term-text-0, #e0e0f0); }
  .as-change { font-size: 11px; font-weight: 600; }
  .as-label-dim { font-size: 11px; color: var(--term-text-2, #404060); }
  .as-pos { color: #22AB94; }
  .as-neg { color: #F23645; }

  .as-metrics {
    padding: 3px 10px 5px;
    display: flex; gap: 12px;
    flex-shrink: 0;
  }
  .as-metric { display: flex; align-items: center; gap: 4px; }
  .as-metric-label { color: var(--term-text-2, #404060); font-size: 11px; letter-spacing: 0.05em; }
  .as-metric-val { color: var(--term-text-1, #8a8aaa); font-size: 11px; }
  .as-metric-arrow { font-size: 11px; }
  .as-fr-extreme { color: #d6a347; }

  .as-signal-row {
    padding: 5px 10px 2px;
    display: flex; align-items: center; gap: 7px;
    flex-shrink: 0;
  }
  .as-signal-dots { display: flex; gap: 4px; }
  .as-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
  }
  .as-dot--on { background: #d6a347; border-color: #d6a347; box-shadow: 0 0 4px #d6a34766; }
  .as-signal-label { font-size: 11px; font-weight: 700; letter-spacing: 0.04em; }

  .as-signal-detail {
    padding: 2px 10px 5px;
    display: flex; gap: 6px; flex-wrap: wrap;
    flex-shrink: 0;
    font-size: 11px;
    letter-spacing: 0.03em;
  }
  .as-sig-on { color: #22AB94; }
  .as-sig-off { color: var(--term-text-2, #404060); }

  .as-pos-block {
    margin: 0 8px 5px;
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    padding: 5px 8px;
    background: var(--term-surface-1, #111120);
    flex-shrink: 0;
  }
  .as-pos-header {
    display: flex; align-items: center; gap: 7px;
    font-size: 11px; margin-bottom: 4px;
  }
  .as-pos-neg { color: #F23645; }
  .as-pos-profit { color: #22AB94; }
  .as-liq-warn {
    color: #F23645;
    font-weight: 700;
    font-size: 11px;
  }
  .as-liq-bar-wrap { display: flex; flex-direction: column; gap: 3px; }
  .as-liq-bar-track {
    height: 3px; border-radius: 2px;
    background: var(--term-border, #1a1a28);
    overflow: hidden;
  }
  .as-liq-bar-fill { height: 100%; background: #22AB94; border-radius: 2px; transition: width 0.3s; }
  .as-liq-bar-labels {
    display: flex; justify-content: space-between;
    font-size: 11px; color: var(--term-text-2, #404060);
  }

  .as-cascade {
    margin: 0 8px 5px;
    flex-shrink: 0;
  }
  .as-section-title {
    font-size: 11px;
    letter-spacing: 0.06em;
    color: var(--term-text-2, #404060);
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  .as-cascade-list { display: flex; flex-direction: column; gap: 2px; }
  .as-cascade-row { display: grid; grid-template-columns: 66px 1fr 44px 68px; align-items: center; gap: 4px; }
  .as-casc-label { font-size: 11px; color: var(--term-text-2, #404060); }
  .as-casc-bar-track {
    height: 3px;
    background: var(--term-surface-1, #111120);
    border-radius: 2px;
    overflow: hidden;
  }
  .as-casc-bar-fill { height: 100%; background: #d6a347; border-radius: 2px; }
  .as-casc-bar-now { height: 100%; width: 8%; background: var(--brand, #5b5bd6); border-radius: 2px; }
  .as-cascade-now .as-casc-label { color: var(--term-text-1, #8a8aaa); }
  .as-casc-pct { font-size: 11px; color: #d6a347; text-align: right; }
  .as-casc-price { font-size: 11px; color: var(--term-text-2, #404060); text-align: right; }

  .as-actions {
    padding: 5px 8px;
    display: flex; gap: 5px;
    flex-shrink: 0;
  }
  .as-ai-btn {
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    color: var(--term-text-1, #8a8aaa);
    font-size: 11px;
    font-family: inherit;
    letter-spacing: 0.05em;
    padding: 3px 9px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .as-ai-btn:hover:not(:disabled) {
    border-color: var(--brand, #5b5bd6);
    color: var(--term-text-0, #e0e0f0);
  }
  .as-ai-btn:disabled { opacity: 0.4; cursor: default; }

  .as-ai-result {
    margin: 0 8px 5px;
    padding: 7px 8px;
    background: var(--term-surface-1, #111120);
    border: 1px solid var(--term-border, #1a1a28);
    border-radius: var(--term-radius-sm, 3px);
    font-size: 11px;
    color: var(--term-text-1, #8a8aaa);
    line-height: 1.5;
    white-space: pre-wrap;
    flex-shrink: 0;
  }

  .as-footer {
    margin-top: auto;
    padding: 4px 10px;
    border-top: 1px solid var(--term-border, #1a1a28);
    font-size: 11px;
    letter-spacing: 0.04em;
    color: var(--term-text-2, #404060);
    flex-shrink: 0;
  }
</style>
