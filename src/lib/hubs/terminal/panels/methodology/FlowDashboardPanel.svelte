<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface OnchainCtx {
    fear_greed?: number | null;
    kimchi_premium?: number | null;
    sopr_z?: number | null;
    netflow_z?: number | null;
    mvrv?: number | null;
    gex_usd?: number | null;
    bias: number;
    score_mult: number;
    error?: string;
  }

  let ctx        = $state<OnchainCtx | null>(null);
  let loading    = $state(true);
  let error      = $state<string | null>(null);
  let lastUpdate = $state<Date | null>(null);
  let countdown  = $state(90);

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let cdTimer:   ReturnType<typeof setInterval> | null = null;

  const gaugePos = $derived(ctx ? biasGauge(ctx.bias) : 50);

  async function fetchOnchain() {
    loading   = true;
    error     = null;
    countdown = 90;
    try {
      const res  = await fetch('/api/terminal/agent/prepump/onchain');
      const data = await res.json() as OnchainCtx;
      if (data.error) { error = data.error; return; }
      ctx        = data;
      lastUpdate = new Date();
    } catch (e) {
      error = e instanceof Error ? e.message : 'fetch failed';
    } finally {
      loading = false;
    }
  }

  function biasGauge(b: number): number {
    return Math.round((b + 1) * 50);
  }

  function fgColor(fg: number | null | undefined): string {
    if (fg == null) return 'rgba(247,242,234,0.3)';
    if (fg <= 25) return '#cf7f8f';
    if (fg <= 45) return '#facc15';
    if (fg <= 55) return 'rgba(247,242,234,0.7)';
    if (fg <= 75) return '#adca7c';
    return '#22c55e';
  }

  function fmt(n: number | null | undefined, d = 2): string {
    if (n == null) return '—';
    return n.toFixed(d);
  }

  function fmtGex(usd: number | null | undefined): string {
    if (usd == null) return '—';
    if (Math.abs(usd) >= 1e9) return `${(usd / 1e9).toFixed(2)}B`;
    if (Math.abs(usd) >= 1e6) return `${(usd / 1e6).toFixed(1)}M`;
    return fmt(usd);
  }

  function biasLabel(b: number): string {
    if (b >  0) return 'BULL';
    if (b <  0) return 'BEAR';
    return 'NEUTRAL';
  }

  function biasColor(b: number): string {
    if (b >  0) return '#adca7c';
    if (b <  0) return '#cf7f8f';
    return 'rgba(247,242,234,0.45)';
  }

  onMount(() => {
    fetchOnchain();
    pollTimer = setInterval(fetchOnchain, 90_000);
    cdTimer   = setInterval(() => { countdown = Math.max(0, countdown - 1); }, 1_000);
  });
  onDestroy(() => {
    if (pollTimer) clearInterval(pollTimer);
    if (cdTimer)   clearInterval(cdTimer);
  });
</script>

<div class="flow-panel">
  <div class="flow-header">
    <span class="title">ON-CHAIN FLOW</span>
    <span class="refresh-cd">{countdown}s</span>
    {#if lastUpdate}
      <span class="last-upd">{lastUpdate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
    {/if}
    <button class="refresh-btn" onclick={fetchOnchain} disabled={loading}>↺</button>
  </div>

  {#if loading}
    <div class="state-msg">loading on-chain…</div>
  {:else if error}
    <div class="state-msg err">{error}</div>
  {:else if ctx}
    <div class="flow-body">
      <!-- Bias gauge bar -->
      <div class="gauge-section">
        <div class="gauge-labels">
          <span style:color="#cf7f8f">BEAR</span>
          <span class="bias-lbl" style:color={biasColor(ctx.bias)}>{biasLabel(ctx.bias)}</span>
          <span style:color="#adca7c">BULL</span>
        </div>
        <div class="gauge-track">
          <div class="gauge-fill bear" style:width="{100 - gaugePos}%"></div>
          <div class="gauge-cursor" style:left="{gaugePos}%"></div>
          <div class="gauge-fill bull" style:width="{gaugePos}%"></div>
        </div>
        <div class="mult-row">
          <span class="mult-label">Score multiplier</span>
          <span class="mult-val" style:color={ctx.score_mult >= 1.1 ? '#adca7c' : ctx.score_mult <= 0.9 ? '#cf7f8f' : 'rgba(247,242,234,0.7)'}>
            ×{ctx.score_mult.toFixed(2)}
          </span>
        </div>
      </div>

      <!-- Metric rows -->
      <div class="metrics">
        <div class="metric-row">
          <span class="metric-label">Fear & Greed</span>
          <div class="metric-bar-track">
            {#if ctx.fear_greed != null}
              <div class="metric-bar-fill" style:width="{ctx.fear_greed}%" style:background={fgColor(ctx.fear_greed)}></div>
            {/if}
          </div>
          <span class="metric-val" style:color={fgColor(ctx.fear_greed)}>
            {ctx.fear_greed != null ? Math.round(ctx.fear_greed) : '—'}
          </span>
        </div>

        <div class="metric-row">
          <span class="metric-label">Kimchi Prem</span>
          <div class="metric-bar-track">
            {#if ctx.kimchi_premium != null}
              <div
                class="metric-bar-fill"
                style:width="{Math.min(100, Math.abs(ctx.kimchi_premium) * 20)}%"
                style:background={ctx.kimchi_premium > 2 ? '#adca7c' : ctx.kimchi_premium < -1 ? '#cf7f8f' : '#facc15'}
              ></div>
            {/if}
          </div>
          <span class="metric-val">{fmt(ctx.kimchi_premium)}%</span>
        </div>

        <div class="metric-row">
          <span class="metric-label">SOPR z-score</span>
          <div class="metric-bar-track">
            {#if ctx.sopr_z != null}
              <div
                class="metric-bar-fill"
                style:width="{Math.min(100, Math.abs(ctx.sopr_z) * 25)}%"
                style:background={ctx.sopr_z > 0 ? '#adca7c' : '#cf7f8f'}
                style:margin-left={ctx.sopr_z < 0 ? 'auto' : '0'}
              ></div>
            {/if}
          </div>
          <span class="metric-val">{fmt(ctx.sopr_z)}</span>
        </div>

        <div class="metric-row">
          <span class="metric-label">Netflow z</span>
          <div class="metric-bar-track">
            {#if ctx.netflow_z != null}
              <div
                class="metric-bar-fill"
                style:width="{Math.min(100, Math.abs(ctx.netflow_z) * 25)}%"
                style:background={ctx.netflow_z < 0 ? '#adca7c' : '#cf7f8f'}
              ></div>
            {/if}
          </div>
          <span class="metric-val">{fmt(ctx.netflow_z)}</span>
        </div>

        <div class="metric-row">
          <span class="metric-label">MVRV</span>
          <div class="metric-bar-track">
            {#if ctx.mvrv != null}
              <div
                class="metric-bar-fill"
                style:width="{Math.min(100, (ctx.mvrv / 5) * 100)}%"
                style:background={ctx.mvrv > 3.5 ? '#cf7f8f' : ctx.mvrv < 1 ? '#adca7c' : '#facc15'}
              ></div>
            {/if}
          </div>
          <span class="metric-val">{fmt(ctx.mvrv)}</span>
        </div>

        <div class="metric-row">
          <span class="metric-label">GEX</span>
          <div class="metric-bar-track"></div>
          <span class="metric-val">{fmtGex(ctx.gex_usd)}</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="state-msg">no data</div>
  {/if}
</div>

<style>
  .flow-panel {
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

  .flow-header {
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

  .refresh-cd { color: var(--term-text-2, rgba(247,242,234,0.3)); font-size: 11px; }
  .last-upd   { color: var(--term-text-2, rgba(247,242,234,0.25)); font-size: 11px; }

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

  .flow-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--term-border, rgba(255,255,255,0.08)) transparent;
  }

  /* ── Gauge ── */
  .gauge-section { display: flex; flex-direction: column; gap: 6px; }

  .gauge-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
  }

  .bias-lbl { font-size: 11px; font-weight: 700; }

  .gauge-track {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.05);
    border-radius: 4px;
    height: 10px;
    overflow: visible;
    position: relative;
  }

  .gauge-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.4s ease;
  }

  .gauge-fill.bear { background: linear-gradient(to left, #cf7f8f44, #cf7f8f88); }
  .gauge-fill.bull { background: linear-gradient(to right, #adca7c44, #adca7c88); margin-left: auto; }

  .gauge-cursor {
    position: absolute;
    top: -3px;
    width: 3px;
    height: 16px;
    background: rgba(247,242,234,0.9);
    border-radius: 2px;
    transform: translateX(-50%);
    transition: left 0.4s ease;
    box-shadow: 0 0 6px rgba(247,242,234,0.4);
  }

  .mult-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
  }

  .mult-label { color: var(--term-text-2, rgba(247,242,234,0.4)); }
  .mult-val   { font-weight: 700; font-size: 12px; }

  /* ── Metrics ── */
  .metrics { display: flex; flex-direction: column; gap: 5px; }

  .metric-row {
    display: grid;
    grid-template-columns: 80px 1fr 52px;
    align-items: center;
    gap: 8px;
  }

  .metric-label {
    color: var(--term-text-2, rgba(247,242,234,0.4));
    font-size: 11px;
    text-align: right;
    white-space: nowrap;
  }

  .metric-bar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
    height: 5px;
    overflow: hidden;
    display: flex;
    align-items: stretch;
  }

  .metric-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.35s ease;
    min-width: 2px;
  }

  .metric-val {
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    color: var(--term-text-1, rgba(247,242,234,0.7));
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
</style>
