<script lang="ts">
  import { goto } from '$app/navigation';
  import { rightPanelMode } from '$lib/stores/patternsHub';
  import type { PatternStateView } from '$lib/contracts';
  import type { PatternStats } from '$lib/types/patternStats';

  interface SignalEvent {
    ts: string;
    type: 'entry' | 'exit' | 'alert';
    label: string;
  }

  interface PnlData {
    equity_curve: number[];
    mean_pnl_bps: number | null;
    win_rate: number | null;
    n: number;
  }

  interface Props {
    slug: string;
    states: PatternStateView[];
    stats: PatternStats | null;
    signals: SignalEvent[];
    pnlData: PnlData | null;
  }

  const { slug, states, stats, signals, pnlData }: Props = $props();

  const primaryState = $derived(states[0] ?? null);

  const phaseColor = $derived((() => {
    const p = primaryState?.phaseId?.toLowerCase() ?? '';
    if (p.includes('active') || p.includes('breakout') || p.includes('long') || p.includes('entry')) return '#22c55e';
    if (p.includes('cool') || p.includes('hold') || p.includes('watch')) return '#f59e0b';
    if (p.includes('block') || p.includes('stop') || p.includes('reject')) return '#ef4444';
    return '#94a3b8';
  })());

  const avgPWin = $derived(stats?.ml_shadow?.avg_p_win ?? null);
  const hitRate = $derived(stats?.hit_rate ?? null);
  const recent30d = $derived(stats?.recent_30d_count ?? 0);
  const recent30dWR = $derived(stats?.recent_30d_success_rate ?? null);
  const totalInstances = $derived(stats?.total_instances ?? 0);

  const nextSig = $derived(signals[0] ?? null);

  function fmtPct(v: number | null) {
    if (v == null) return '—';
    return (v * 100).toFixed(0) + '%';
  }

  function fmtBps(v: number | null) {
    if (v == null) return '—';
    const sign = v >= 0 ? '+' : '';
    return `${sign}${v.toFixed(1)} bps`;
  }

  function fmtDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  function goBacktest() {
    void goto(`/patterns?tab=test&slug=${encodeURIComponent(slug)}`);
  }

  function goTuneAI() {
    rightPanelMode.set('ai');
  }
</script>

<div class="hud">

  <!-- Status -->
  <section class="card">
    <div class="card-label">Status</div>
    {#if primaryState}
      <div class="phase" style="color:{phaseColor}">{primaryState.phaseLabel}</div>
      <div class="sub">
        {states.length > 1 ? `${states.length}개 심볼` : primaryState.symbol}
        {#if primaryState.enteredAt}· {fmtDate(primaryState.enteredAt)}{/if}
      </div>
      {#if avgPWin != null}
        <div class="sub">p_win {fmtPct(avgPWin)}</div>
      {/if}
    {:else}
      <div class="empty-state">활성 심볼 없음</div>
    {/if}
  </section>

  <div class="divider"></div>

  <!-- Evidence -->
  <section class="card">
    <div class="card-label">Evidence</div>
    <div class="bullets">
      <div class="bullet">
        <span class="bullet-key">Hit rate</span>
        <span class="bullet-val">{fmtPct(hitRate)}</span>
      </div>
      <div class="bullet">
        <span class="bullet-key">30d 거래</span>
        <span class="bullet-val">{recent30d}건</span>
      </div>
      <div class="bullet">
        <span class="bullet-key">30d WR</span>
        <span class="bullet-val">{fmtPct(recent30dWR)}</span>
      </div>
    </div>
  </section>

  <div class="divider"></div>

  <!-- Risk -->
  <section class="card">
    <div class="card-label">Risk</div>
    <div class="risk-row">
      <div class="risk-item">
        <span class="risk-key">Avg P&L</span>
        <span class="risk-val" class:pos={pnlData?.mean_pnl_bps != null && pnlData.mean_pnl_bps > 0}
          class:neg={pnlData?.mean_pnl_bps != null && pnlData.mean_pnl_bps <= 0}>
          {fmtBps(pnlData?.mean_pnl_bps ?? null)}
        </span>
      </div>
      <div class="risk-item">
        <span class="risk-key">Win rate</span>
        <span class="risk-val">{fmtPct(pnlData?.win_rate ?? null)}</span>
      </div>
    </div>
    <div class="sub">{totalInstances}개 누적 엔트리</div>
  </section>

  <div class="divider"></div>

  <!-- Next Transition -->
  <section class="card">
    <div class="card-label">Next Signal</div>
    {#if nextSig}
      <div class="next-label">{nextSig.label}</div>
      <div class="sub">{nextSig.ts}</div>
    {:else}
      <div class="empty-state">전환 없음</div>
    {/if}
  </section>

  <div class="divider"></div>

  <!-- Actions -->
  <section class="card actions">
    <button class="action-btn" onclick={goBacktest}>→ Backtest</button>
    <button class="action-btn secondary" onclick={goTuneAI}>✦ Tune AI</button>
  </section>

</div>

<style>
  .hud {
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: 'JetBrains Mono', monospace;
  }

  .card {
    padding: 12px 16px;
  }

  .card-label {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.35);
    margin-bottom: 6px;
  }

  .phase {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .sub {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.45);
    margin-top: 3px;
  }

  .empty-state {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.3);
    font-style: italic;
  }

  .bullets {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .bullet {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
  }

  .bullet-key { color: rgba(250, 247, 235, 0.45); }
  .bullet-val { color: rgba(250, 247, 235, 0.85); font-weight: 600; }

  .risk-row {
    display: flex;
    gap: 20px;
    margin-bottom: 4px;
  }

  .risk-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .risk-key {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .risk-val {
    font-size: 13px;
    font-weight: 700;
    color: rgba(250, 247, 235, 0.85);
  }

  .risk-val.pos { color: #4ade80; }
  .risk-val.neg { color: #f87171; }

  .next-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(250, 247, 235, 0.85);
  }

  .divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.06);
    margin: 0 16px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
    padding: 8px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    border: 1px solid rgba(74, 222, 128, 0.4);
    border-radius: 4px;
    background: rgba(74, 222, 128, 0.08);
    color: #4ade80;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease;
    text-align: left;
  }

  .action-btn:hover {
    background: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.6);
  }

  .action-btn.secondary {
    border-color: rgba(250, 247, 235, 0.15);
    background: transparent;
    color: rgba(250, 247, 235, 0.55);
  }

  .action-btn.secondary:hover {
    background: rgba(250, 247, 235, 0.05);
    border-color: rgba(250, 247, 235, 0.3);
    color: rgba(250, 247, 235, 0.8);
  }
</style>
