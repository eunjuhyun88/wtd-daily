<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface AutoConfig {
    enabled: boolean;
    ollama_model: string;
    ollama_endpoint: string;
    max_positions: number;
    max_size_usd: number;
    default_leverage: number;
  }

  interface SignalEvent {
    id: string;
    symbol: string;
    pattern: string;
    fired_at: string;
    level: string | null;
    rank_score: number | null;
    entry_price: number | null;
    tp_pct: number | null;
    sl_pct: number | null;
    auto_trade_status: 'ENTERED' | 'PASSED' | 'ERROR' | null;
    auto_trade_note: string | null;
    auto_trade_at: string;
    reasons: string[];
    trade_id: string | null;
    trade_status: 'OPEN' | 'CLOSED' | null;
    live_pnl_pct: number | null;
    realized_pnl_pct: number | null;
    agent_confidence: number | null;
    agent_reasoning: string | null;
    close_reason: string | null;
  }

  let config = $state<AutoConfig | null>(null);
  let events = $state<SignalEvent[]>([]);
  let loading = $state(true);
  let toggling = $state(false);
  let expandedId = $state<string | null>(null);

  const entered = $derived(events.filter(e => e.auto_trade_status === 'ENTERED'));
  const openPos = $derived(entered.filter(e => e.trade_status === 'OPEN'));
  const closedEntered = $derived(entered.filter(e => e.trade_status === 'CLOSED'));
  const wins = $derived(closedEntered.filter(e => (e.realized_pnl_pct ?? 0) > 0));
  const winRate = $derived(
    closedEntered.length ? Math.round((wins.length / closedEntered.length) * 100) : null,
  );
  const avgPnl = $derived(
    closedEntered.length
      ? Math.round(
          (closedEntered.reduce((s, e) => s + (e.realized_pnl_pct ?? 0), 0) / closedEntered.length) * 10,
        ) / 10
      : null,
  );

  async function load() {
    loading = true;
    try {
      const [cfgRes, feedRes] = await Promise.all([
        fetch('/api/prepump/auto-config'),
        fetch('/api/prepump/auto-feed?limit=50'),
      ]);
      if (cfgRes.ok) {
        const d = await cfgRes.json();
        config = d.config;
      }
      if (feedRes.ok) {
        const d = await feedRes.json();
        events = d.events ?? [];
      }
    } finally {
      loading = false;
    }
  }

  async function toggle() {
    if (!config || toggling) return;
    toggling = true;
    try {
      const res = await fetch('/api/prepump/auto-config', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...config, enabled: !config.enabled }),
      });
      if (res.ok) {
        const d = await res.json();
        config = d.config;
      }
    } finally {
      toggling = false;
    }
  }

  function formatAge(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const h = Math.floor(ms / 3_600_000);
    if (h < 1) return `${Math.floor(ms / 60_000)}m`;
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  function formatPnl(v: number | null): string {
    if (v === null) return '—';
    return `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;
  }

  function pnlClass(v: number | null): string {
    if (v === null) return 'neutral';
    return v > 0 ? 'pos' : v < 0 ? 'neg' : 'neutral';
  }

  function statusMarker(s: string | null): string {
    if (s === 'ENTERED') return '●';
    if (s === 'ERROR') return '✕';
    return '○';
  }

  function statusClass(s: string | null): string {
    if (s === 'ENTERED') return 'st-entered';
    if (s === 'ERROR') return 'st-error';
    return 'st-passed';
  }

  let timer: ReturnType<typeof setInterval> | null = null;
  onMount(() => {
    void load();
    timer = setInterval(() => void load(), 60_000);
  });
  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<div class="atp">
  {#if loading && !config}
    <div class="atp-loading">로딩 중…</div>
  {:else}
    <!-- KPI strip -->
    <div class="atp-kpi">
      <div class="kpi-item">
        <span class="kpi-label">OPEN</span>
        <span class="kpi-val">{openPos.length}</span>
      </div>
      <div class="kpi-item">
        <span class="kpi-label">WIN</span>
        <span class="kpi-val {winRate !== null && winRate >= 50 ? 'pos' : 'neg'}">
          {winRate !== null ? `${winRate}%` : '—'}
        </span>
      </div>
      <div class="kpi-item">
        <span class="kpi-label">AVG PnL</span>
        <span class="kpi-val {pnlClass(avgPnl)}">
          {avgPnl !== null ? formatPnl(avgPnl) : '—'}
        </span>
      </div>
      <div class="kpi-item">
        <span class="kpi-label">ENTERED</span>
        <span class="kpi-val">{entered.length}</span>
      </div>
    </div>

    <!-- Agent toggle -->
    <div class="atp-agent-row">
      <div class="agent-info">
        <span class="agent-model">{config?.ollama_model ?? 'qwen3.5:latest'}</span>
        <span class="agent-hint">localhost:11434</span>
      </div>
      <button
        class="agent-toggle"
        class:enabled={config?.enabled}
        onclick={toggle}
        disabled={toggling}
        aria-label="Toggle auto trader"
      >
        {config?.enabled ? '⚡ ON' : '— OFF'}
      </button>
    </div>

    <!-- Scan feed -->
    <div class="atp-section-label">
      SCAN FEED
      <span class="feed-count">{events.length}건</span>
    </div>

    {#if events.length === 0 && !loading}
      <div class="atp-empty">스캔 시그널 없음 — 에이전트를 켜면 시작됩니다</div>
    {:else}
      {#each events as e (e.id)}
        {@const activePnl = e.live_pnl_pct ?? e.realized_pnl_pct}
        <button
          class="atp-signal"
          class:expanded={expandedId === e.id}
          onclick={() => {
            expandedId = expandedId === e.id ? null : e.id;
          }}
        >
          <div class="signal-row">
            <span class="sig-marker {statusClass(e.auto_trade_status)}">
              {statusMarker(e.auto_trade_status)}
            </span>
            <span class="sig-sym">{e.symbol.replace('USDT', '')}</span>
            <span class="sig-pat">{e.pattern}</span>
            {#if e.rank_score !== null}
              <span class="sig-rank">rk:{Math.round(e.rank_score * 100)}</span>
            {/if}
            {#if e.auto_trade_status === 'ENTERED' && activePnl !== null}
              <span class="sig-pnl {pnlClass(activePnl)}">{formatPnl(activePnl)}</span>
            {:else}
              <span class="sig-status {statusClass(e.auto_trade_status)}">
                {e.auto_trade_status ?? '?'}
              </span>
            {/if}
            <span class="sig-age">{formatAge(e.auto_trade_at)}</span>
          </div>

          {#if expandedId === e.id}
            <div class="signal-detail">
              {#if e.entry_price !== null}
                <div class="detail-props">
                  ${e.entry_price.toFixed(2)}{e.tp_pct !== null ? ` · tp+${e.tp_pct}%` : ''}{e.sl_pct !== null
                    ? ` · sl-${e.sl_pct}%`
                    : ''}
                </div>
              {/if}
              {#if e.reasons?.length}
                <div class="detail-reasons">{e.reasons.join(' / ')}</div>
              {/if}

              {#if e.auto_trade_status === 'ENTERED' && e.trade_id}
                <div class="detail-trade-header">── 연결 트레이드 ──</div>
                <div class="detail-trade">
                  <span class="trade-badge {e.trade_status === 'OPEN' ? 'pos' : 'neutral'}">
                    {e.trade_status}
                  </span>
                  {#if e.live_pnl_pct !== null}
                    <span class="{pnlClass(e.live_pnl_pct)} trade-pnl">{formatPnl(e.live_pnl_pct)}</span>
                  {:else if e.realized_pnl_pct !== null}
                    <span class="{pnlClass(e.realized_pnl_pct)} trade-pnl">{formatPnl(e.realized_pnl_pct)}</span>
                  {/if}
                  {#if e.agent_confidence !== null}
                    <span class="trade-conf">conf:{Math.round(e.agent_confidence * 100)}%</span>
                  {/if}
                  {#if e.close_reason}
                    <span
                      class="trade-close {e.close_reason === 'TP1'
                        ? 'pos'
                        : e.close_reason === 'SL'
                          ? 'neg'
                          : 'neutral'}"
                    >
                      {e.close_reason}
                    </span>
                  {/if}
                </div>
                {#if e.agent_reasoning}
                  <div class="detail-reasoning">{e.agent_reasoning}</div>
                {/if}
              {:else if e.auto_trade_status === 'PASSED' && e.auto_trade_note}
                <div class="detail-pass-note">{e.auto_trade_note}</div>
              {:else if e.auto_trade_status === 'ERROR' && e.auto_trade_note}
                <div class="detail-error-note">{e.auto_trade_note}</div>
              {/if}
            </div>
          {/if}
        </button>
      {/each}
    {/if}
  {/if}
</div>

<style>
  .atp {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .atp-loading {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
    padding: 6px 8px;
  }

  .atp-kpi {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1px;
    background: var(--g3, #1c1918);
    border-bottom: 1px solid var(--g3, #1c1918);
  }
  .kpi-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    padding: 5px 4px;
    background: var(--g1, #0d0c0b);
  }
  .kpi-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
    letter-spacing: 0.05em;
  }
  .kpi-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--g7, #9d9690);
  }

  .atp-agent-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 8px;
    border-bottom: 1px solid var(--g3, #1c1918);
  }
  .agent-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .agent-model {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g7, #9d9690);
  }
  .agent-hint {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
  }

  .agent-toggle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border: 1px solid var(--g4, #272320);
    border-radius: 2px;
    background: var(--g2, #131110);
    color: var(--g5, #3d3830);
    cursor: pointer;
    transition: all 0.1s;
  }
  .agent-toggle.enabled {
    border-color: var(--amb, #f5a623);
    color: var(--amb, #f5a623);
    background: color-mix(in srgb, var(--amb, #f5a623) 8%, var(--g2, #131110));
  }
  .agent-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .atp-section-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
    letter-spacing: 0.08em;
    padding: 5px 8px 2px;
  }
  .feed-count {
    font-size: 11px;
    color: var(--g4, #272320);
  }

  .atp-signal {
    all: unset;
    display: block;
    width: 100%;
    box-sizing: border-box;
    cursor: pointer;
    border-bottom: 1px solid var(--g2, #131110);
    transition: background 0.07s;
  }
  .atp-signal:hover {
    background: var(--g2, #131110);
  }
  .atp-signal.expanded {
    background: var(--g2, #131110);
  }

  .signal-row {
    display: grid;
    grid-template-columns: 10px 1fr minmax(0, 70px) auto auto auto;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    min-height: 24px;
  }

  .sig-marker {
    font-size: 11px;
    line-height: 1;
    text-align: center;
  }
  .st-entered {
    color: var(--amb, #f5a623);
  }
  .st-passed {
    color: var(--g5, #3d3830);
  }
  .st-error {
    color: var(--bear, #ef4444);
  }

  .sig-sym {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g8, #cec9c4);
    font-weight: 600;
  }
  .sig-pat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .sig-rank {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
  }
  .sig-pnl {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
  }
  .sig-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
  }
  .sig-age {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g4, #272320);
  }

  .signal-detail {
    padding: 4px 8px 6px 22px;
    border-top: 1px solid var(--g2, #131110);
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .detail-props {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g6, #6b6560);
  }
  .detail-reasons {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
  }
  .detail-trade-header {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g4, #272320);
    margin-top: 2px;
  }
  .detail-trade {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .trade-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 0 4px;
    border-radius: 2px;
    border: 1px solid currentColor;
  }
  .trade-pnl {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
  }
  .trade-conf {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
  }
  .trade-close {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 0 3px;
    border: 1px solid currentColor;
    border-radius: 2px;
  }
  .detail-reasoning {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g6, #6b6560);
    line-height: 1.5;
    white-space: pre-wrap;
    margin-top: 2px;
  }
  .detail-pass-note {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
    line-height: 1.5;
    white-space: pre-wrap;
  }
  .detail-error-note {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--bear, #ef4444);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .atp-empty {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g5, #3d3830);
    padding: 8px;
    text-align: center;
  }

  .pos {
    color: var(--bull, #22c55e);
  }
  .neg {
    color: var(--bear, #ef4444);
  }
  .neutral {
    color: var(--g6, #6b6560);
  }
</style>
