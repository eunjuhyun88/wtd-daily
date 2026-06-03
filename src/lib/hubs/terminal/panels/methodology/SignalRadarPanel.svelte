<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let { topN = 15, minVolM = 3.0 }: { topN?: number; minVolM?: number } = $props();

  interface ScanResult {
    sym: string;
    level: string;
    rank_score: number;
    reasons: string[];
    wyckoff_score?: number;
    wyckoff_phase?: string;
    oi_trend?: string;
    ls_div?: number;
    fr_pct?: number;
    change_24h?: number;
    volume_usd?: number;
  }

  interface LiveSignal {
    type: string;
    sym: string;
    value?: number;
    price?: number;
    ts: number;
    hot_label?: string;
    signal_count_30m?: number;
  }

  const TIER_COLOR: Record<string, string> = {
    FIRE:  '#adca7c',
    ALERT: '#facc15',
    WATCH: '#60a5fa',
  };
  const TIER_BG: Record<string, string> = {
    FIRE:  'rgba(173,202,124,0.08)',
    ALERT: 'rgba(250,204,21,0.06)',
    WATCH: 'rgba(96,165,250,0.05)',
  };
  const OI_ICONS: Record<string, string> = {
    RISING_FAST: '↑↑', RISING: '↑', FLAT: '→', FALLING: '↓', FALLING_FAST: '↓↓',
  };
  const SIG_COLOR: Record<string, string> = {
    VELOCITY:  '#facc15',
    WHALE:     '#f97316',
    CVD_BREAK: '#adca7c',
    SQUEEZE:   '#c084fc',
  };

  let results    = $state<ScanResult[]>([]);
  let loading    = $state(true);
  let error      = $state<string | null>(null);
  let lastUpdate = $state<Date | null>(null);
  let countdown  = $state(30);
  let filterLevel = $state('ALL');

  // Live SSE feed
  let liveSignals = $state<LiveSignal[]>([]);
  let liveConnected = $state(false);
  let liveError     = $state(false);
  let activeView    = $state<'scan' | 'live'>('scan');
  let es: EventSource | null = null;

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let cdTimer:   ReturnType<typeof setInterval> | null = null;

  const fireList  = $derived(results.filter(r => r.level === 'FIRE'));
  const alertList = $derived(results.filter(r => r.level === 'ALERT'));
  const watchList = $derived(results.filter(r => r.level === 'WATCH'));

  async function fetchScan() {
    loading   = true;
    error     = null;
    countdown = 30;
    try {
      const params = new URLSearchParams({
        top_n:     String(topN),
        min_vol_m: String(minVolM),
        level:     filterLevel,
      });
      const res  = await fetch(`/api/terminal/agent/prepump/scan?${params.toString()}`);
      const data = await res.json();
      if (data.error) { error = data.error; return; }
      results    = Array.isArray(data) ? data : (data.results ?? []);
      lastUpdate = new Date();
    } catch (e) {
      error = e instanceof Error ? e.message : 'fetch failed';
    } finally {
      loading = false;
    }
  }

  function startLive() {
    if (es) { es.close(); es = null; }
    liveSignals   = [];
    liveConnected = false;
    liveError     = false;
    es = new EventSource('/api/terminal/agent/prepump/radar-stream');
    es.onmessage = (e: MessageEvent) => {
      try {
        const sig = JSON.parse(e.data as string) as { type: string } & LiveSignal;
        if (sig.type === 'connected') { liveConnected = true; return; }
        if (sig.type === 'ping') return;
        liveSignals = [sig, ...liveSignals].slice(0, 80);
      } catch { /* ignore */ }
    };
    es.onerror = () => { liveError = true; liveConnected = false; };
  }

  function stopLive() {
    if (es) { es.close(); es = null; }
    liveConnected = false;
  }

  function switchView(v: 'scan' | 'live') {
    activeView = v;
    if (v === 'live' && !es) startLive();
    if (v === 'scan' && es)  stopLive();
  }

  function fmt(n: number | undefined, digits = 1): string {
    if (n == null) return '—';
    return n.toFixed(digits);
  }
  function fmtVol(usd: number | undefined): string {
    if (usd == null) return '—';
    if (usd >= 1e9) return `${(usd / 1e9).toFixed(1)}B`;
    if (usd >= 1e6) return `${(usd / 1e6).toFixed(0)}M`;
    return `${usd.toFixed(0)}`;
  }
  function fmtTime(ts: number): string {
    return new Date(ts * 1000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  onMount(() => {
    fetchScan();
    pollTimer = setInterval(fetchScan, 30_000);
    cdTimer   = setInterval(() => { countdown = Math.max(0, countdown - 1); }, 1_000);
  });
  onDestroy(() => {
    if (pollTimer) clearInterval(pollTimer);
    if (cdTimer)   clearInterval(cdTimer);
    stopLive();
  });
</script>

<div class="radar-panel">
  <div class="radar-header">
    <span class="title">SIGNAL RADAR</span>
    <div class="view-tabs">
      <button class="view-tab" class:active={activeView === 'scan'} onclick={() => switchView('scan')}>SCAN</button>
      <button class="view-tab" class:active={activeView === 'live'} onclick={() => switchView('live')}>
        LIVE {#if liveConnected}<span class="live-dot"></span>{/if}
      </button>
    </div>
    {#if activeView === 'scan'}
      <div class="tier-counts">
        <span class="fire-ct">🔥{fireList.length}</span>
        <span class="alert-ct">⚡{alertList.length}</span>
        <span class="watch-ct">👁{watchList.length}</span>
      </div>
      <span class="refresh-cd">{countdown}s</span>
      {#if lastUpdate}
        <span class="last-upd">{lastUpdate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      {/if}
      <button class="refresh-btn" onclick={fetchScan} disabled={loading}>↺</button>
    {:else}
      <span class="live-count">{liveSignals.length} events</span>
      {#if liveError}<span class="live-err">reconnecting…</span>{/if}
      <button class="refresh-btn" onclick={startLive}>↺</button>
    {/if}
  </div>

  {#if activeView === 'scan'}
    <div class="filter-row">
      {#each ['ALL', 'FIRE', 'ALERT', 'WATCH'] as lvl}
        <button
          class="lvl-btn"
          class:active={filterLevel === lvl}
          onclick={() => { filterLevel = lvl; fetchScan(); }}
        >{lvl}</button>
      {/each}
    </div>

    {#if loading}
      <div class="state-msg">scanning universe…</div>
    {:else if error}
      <div class="state-msg err">{error}</div>
    {:else if results.length === 0}
      <div class="state-msg">no signals at {filterLevel}</div>
    {:else}
      <div class="cards">
        {#each results as r (r.sym)}
          <div class="card" style:border-color={TIER_COLOR[r.level] ?? 'rgba(255,255,255,0.08)'} style:background={TIER_BG[r.level] ?? 'transparent'}>
            <div class="card-top">
              <span class="sym">{r.sym.replace('USDT', '')}</span>
              <span class="tier" style:color={TIER_COLOR[r.level] ?? 'var(--term-text-2)'}>{r.level}</span>
              <span class="score">{fmt(r.rank_score)} pts</span>
            </div>

            <div class="card-meta">
              {#if r.change_24h != null}
                <span class:pos={r.change_24h >= 0} class:neg={r.change_24h < 0}>
                  {r.change_24h >= 0 ? '+' : ''}{fmt(r.change_24h)}%
                </span>
              {/if}
              {#if r.oi_trend}
                <span class="meta-tag">{OI_ICONS[r.oi_trend] ?? '?'} OI</span>
              {/if}
              {#if r.ls_div != null}
                <span class="meta-tag">LS {fmt(r.ls_div, 2)}</span>
              {/if}
              {#if r.fr_pct != null}
                <span class:neg={r.fr_pct < 0} class="meta-tag">FR {fmt(r.fr_pct, 3)}%</span>
              {/if}
              {#if r.volume_usd != null}
                <span class="meta-tag">vol {fmtVol(r.volume_usd)}</span>
              {/if}
            </div>

            {#if r.wyckoff_phase}
              <div class="wy-row">
                <span class="wy-phase">{r.wyckoff_phase}</span>
                <span class="wy-sc">W{r.wyckoff_score}</span>
              </div>
            {/if}

            {#if r.reasons?.length}
              <div class="reasons">
                {#each r.reasons.slice(0, 3) as reason}
                  <span class="reason-chip">{reason}</span>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

  {:else}
    <!-- LIVE SSE feed -->
    {#if !liveConnected && !liveError && liveSignals.length === 0}
      <div class="state-msg">connecting to Binance stream…</div>
    {:else if liveSignals.length === 0}
      <div class="state-msg">waiting for velocity signals…</div>
    {:else}
      <div class="live-feed">
        {#each liveSignals as sig (sig.ts + sig.sym + sig.type)}
          <div class="live-row">
            <span class="live-time">{fmtTime(sig.ts)}</span>
            <span class="live-type" style:color={SIG_COLOR[sig.type] ?? 'var(--term-text-2)'}>{sig.type}</span>
            <span class="live-sym">{sig.sym.replace('USDT', '')}</span>
            {#if sig.hot_label}
              <span class="live-hot">{sig.hot_label}</span>
            {/if}
            {#if sig.value != null}
              <span class="live-val">{sig.value >= 1000 ? `$${(sig.value / 1000).toFixed(0)}K` : sig.value.toFixed(2)}x</span>
            {/if}
            {#if sig.price != null}
              <span class="live-price">${sig.price < 1 ? sig.price.toFixed(5) : sig.price.toFixed(2)}</span>
            {/if}
            {#if sig.signal_count_30m != null}
              <span class="live-cnt">{sig.signal_count_30m}/30m</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .radar-panel {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--term-text-1, rgba(247,242,234,0.78));
    background: var(--term-surface-0, #0a0e14);
  }

  .radar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.07));
    flex-shrink: 0;
  }

  .title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--term-text-0, rgba(247,242,234,0.94));
    flex: 1;
  }

  .tier-counts {
    display: flex;
    gap: 8px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .fire-ct  { color: #adca7c; }
  .alert-ct { color: #facc15; }
  .watch-ct { color: #60a5fa; }

  .refresh-cd  { color: var(--term-text-2, rgba(247,242,234,0.3)); font-size: 11px; }
  .last-upd    { color: var(--term-text-2, rgba(247,242,234,0.25)); font-size: 11px; }

  .refresh-btn {
    background: transparent;
    border: 1px solid var(--term-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    color: var(--term-text-1, rgba(247,242,234,0.5));
    cursor: pointer;
    font-size: 11px;
    padding: 1px 5px;
    transition: color 0.1s;
  }
  .refresh-btn:hover { color: var(--term-text-0, rgba(247,242,234,0.9)); }

  .filter-row {
    display: flex;
    gap: 3px;
    padding: 4px 10px;
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.06));
    flex-shrink: 0;
  }

  .lvl-btn {
    background: transparent;
    border: 1px solid var(--term-border, rgba(255,255,255,0.08));
    border-radius: 3px;
    color: var(--term-text-2, rgba(247,242,234,0.4));
    cursor: pointer;
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 2px 7px;
    transition: all 0.15s;
  }
  .lvl-btn.active {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.18);
    color: var(--term-text-0, rgba(247,242,234,0.92));
  }
  .lvl-btn:hover:not(.active) { color: var(--term-text-1, rgba(247,242,234,0.6)); }

  .cards {
    flex: 1;
    overflow-y: auto;
    padding: 4px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--term-border, rgba(255,255,255,0.08)) transparent;
  }

  .card {
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .card-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sym   { font-weight: 700; font-size: 11px; color: var(--term-text-0, rgba(247,242,234,0.92)); }
  .tier  { font-weight: 700; font-size: 11px; margin-left: auto; letter-spacing: 0.06em; }
  .score { color: var(--term-text-2, rgba(247,242,234,0.4)); font-size: 11px; }

  .card-meta {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    font-size: 11px;
  }
  .meta-tag { color: var(--term-text-2, rgba(247,242,234,0.4)); }
  .pos { color: #4db46a; }
  .neg { color: #e05c6a; }

  .wy-row {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 11px;
  }
  .wy-phase { color: #f2d193; }
  .wy-sc    { color: var(--term-text-2, rgba(247,242,234,0.35)); }

  .reasons {
    display: flex;
    gap: 3px;
    flex-wrap: wrap;
  }
  .reason-chip {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 3px;
    color: var(--term-text-2, rgba(247,242,234,0.4));
    font-size: 11px;
    padding: 1px 4px;
  }

  .state-msg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--term-text-2, rgba(247,242,234,0.3));
    font-size: 11px;
    padding: 24px;
    text-align: center;
  }
  .state-msg.err { color: #e05c6a; }

  /* View tabs */
  .view-tabs {
    display: flex;
    gap: 2px;
  }
  .view-tab {
    background: transparent;
    border: 1px solid var(--term-border, rgba(255,255,255,0.08));
    border-radius: 3px;
    color: var(--term-text-2, rgba(247,242,234,0.4));
    cursor: pointer;
    font-family: inherit;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 2px 7px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s;
  }
  .view-tab.active {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.2);
    color: var(--term-text-0, rgba(247,242,234,0.92));
  }

  /* Live dot indicator */
  .live-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #4db46a;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.35; }
  }

  .live-count { color: var(--term-text-2, rgba(247,242,234,0.3)); font-size: 11px; margin-left: auto; }
  .live-err   { color: #facc15; font-size: 11px; }

  /* Live feed rows */
  .live-feed {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
    padding: 4px 0;
    scrollbar-width: thin;
    scrollbar-color: var(--term-border, rgba(255,255,255,0.08)) transparent;
  }
  .live-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    font-size: 11px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .live-time  { color: var(--term-text-2, rgba(247,242,234,0.25)); min-width: 64px; }
  .live-type  { font-weight: 700; min-width: 70px; letter-spacing: 0.04em; }
  .live-sym   { font-weight: 700; color: var(--term-text-0, rgba(247,242,234,0.9)); min-width: 52px; }
  .live-hot   { font-size: 12px; }
  .live-val   { color: var(--term-text-2, rgba(247,242,234,0.4)); margin-left: auto; }
  .live-price { color: var(--term-text-1, rgba(247,242,234,0.55)); }
  .live-cnt   { color: var(--term-text-2, rgba(247,242,234,0.3)); font-size: 10px; }
</style>
