<script lang="ts">
  /**
   * RangeSelectionPanel.svelte — W-0392
   *
   * Chart bottom-dock panel that appears when a range (anchorA..anchorB)
   * is selected. Shows OHLCV summary, indicator snapshot, pattern matches,
   * and Judge / Save controls.
   *
   * Props follow the W-0392 spec. All layout uses CSS design tokens.
   */

  import type { RangeSelectionBar } from '$lib/terminal/rangeSelectionCapture';

  /** Local alias for JudgeResponse shape from engine-openapi. */
  export interface JudgeVerdict {
    verdict: string;
    entry: number | null;
    stop: number | null;
    target: number | null;
    p_win: number | null;
    rr: number | null;
    rationale: string;
    text: string;
  }

  interface PatternMatch { slug: string; label: string; similarity: number; outcome: string; }

  // W-0541 PR3-C: deploy gate verdict (filled by PR3 — for now defaults to exploratory_only)
  export type DeployGateVerdict = 'deployable' | 'exploratory_only' | 'insufficient_evidence' | 'unknown';

  interface Props {
    symbol: string;
    tf: string;
    bars: RangeSelectionBar[];
    snapshot: Record<string, number> | null;
    onJudge: () => void;
    onSaveOnly: () => void;
    onSave?: () => void;
    onRecall?: () => void;
    /** W-0541 PR2-B handoff actions */
    onCreateAlert?: () => void;
    onSendToPatterns?: () => void;
    onSendToLab?: () => void;
    onDeployScreener?: () => void;
    /** W-0541 PR3-C deploy gate */
    deployGate?: DeployGateVerdict;
    deployGateReason?: string | null;
    loading: boolean;
    recallLoading?: boolean;
    recallResults?: PatternMatch[];
    verdict: JudgeVerdict | null;
    /**
     * W-0541 PR4 — persona-aware accent.
     * Determines which Operational action gets `primary` styling.
     * Defaults to `discretionary` (Alert primary) per W-0531 default policy.
     */
    persona?: 'quant' | 'chart_analyst' | 'discretionary' | 'hybrid';
  }

  let {
    symbol,
    tf,
    bars,
    snapshot,
    onJudge,
    onSaveOnly,
    onSave,
    onRecall,
    onCreateAlert,
    onSendToPatterns,
    onSendToLab,
    onDeployScreener,
    deployGate = 'unknown',
    deployGateReason = null,
    loading,
    recallLoading = false,
    recallResults = [],
    verdict,
    persona = 'discretionary',
  }: Props = $props();

  // ── OHLCV summary ─────────────────────────────────────────────────────────
  const summary = $derived.by(() => {
    if (bars.length === 0) return null;
    const first = bars[0];
    const last = bars[bars.length - 1];
    const high = Math.max(...bars.map((b) => b.high));
    const low = Math.min(...bars.map((b) => b.low));
    const vol = bars.reduce((s, b) => s + (b.volume ?? 0), 0);
    const pct = first.open !== 0 ? ((last.close - first.open) / first.open) * 100 : null;
    return { open: first.open, high, low, close: last.close, vol, pct };
  });

  // ── Date labels ───────────────────────────────────────────────────────────
  const dateLabel = $derived.by(() => {
    if (bars.length === 0) return '';
    const fmt = (ts: number) => {
      const d = new Date(ts * 1000);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    return `${fmt(bars[0].time)} ~ ${fmt(bars[bars.length - 1].time)}`;
  });

  // ── Button states ─────────────────────────────────────────────────────────
  const tooShort = $derived(bars.length < 3);
  const judgeDisabled = $derived(tooShort || snapshot === null || loading);

  // W-0541 PR3-C: deploy enablement based on gate verdict
  const deployDisabled = $derived(
    tooShort || snapshot === null || deployGate === 'insufficient_evidence' || !onDeployScreener,
  );

  // W-0541 PR4: persona-aware primary CTA accent
  const alertIsPrimary = $derived(persona === 'discretionary' || persona === 'hybrid');
  const deployIsPrimary = $derived(persona === 'quant');
  const recallIsPrimary = $derived(persona === 'chart_analyst');

  function gateLabel(g: DeployGateVerdict): string {
    if (g === 'deployable') return 'Deployable';
    if (g === 'exploratory_only') return 'Exploratory only';
    if (g === 'insufficient_evidence') return 'Insufficient evidence';
    return 'Gate pending';
  }
  function gateClass(g: DeployGateVerdict): string {
    if (g === 'deployable') return 'gate-ok';
    if (g === 'exploratory_only') return 'gate-warn';
    if (g === 'insufficient_evidence') return 'gate-bad';
    return 'gate-pending';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function fmt2(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toFixed(2);
  }

  function fmtPct(v: number | null | undefined): string {
    if (v == null) return '—';
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  }

  function fmtPrice(v: number | null | undefined): string {
    if (v == null) return '—';
    return v.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }

  function fmtLargeVol(v: number): string {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K';
    return v.toFixed(0);
  }

  function verdictColorClass(v: JudgeVerdict): string {
    const dir = v.verdict.toUpperCase();
    if (dir === 'LONG') return 'pos';
    if (dir === 'SHORT') return 'neg';
    return 'amb';
  }
</script>

<div class="rsp-panel" role="region" aria-label="Range selection panel">
  <!-- Row 1: header -->
  <div class="rsp-header">
    <span class="rsp-title">{symbol} · {tf} · {bars.length}봉</span>
    <span class="rsp-date">{dateLabel}</span>
  </div>

  {#if tooShort}
    <div class="rsp-warn">구간 너무 짧음 — 최소 3봉 선택</div>
  {:else if summary}
    <!-- Row 2: OHLCV summary -->
    <div class="rsp-ohlcv">
      <span>O:<strong>{fmtPrice(summary.open)}</strong></span>
      <span>H:<strong>{fmtPrice(summary.high)}</strong></span>
      <span>L:<strong>{fmtPrice(summary.low)}</strong></span>
      <span>C:<strong>{fmtPrice(summary.close)}</strong></span>
      {#if summary.pct !== null}
        <span class="rsp-pct" class:pos={summary.pct >= 0} class:neg={summary.pct < 0}>
          {fmtPct(summary.pct)}
        </span>
      {/if}
      <span class="rsp-vol">Vol:{fmtLargeVol(summary.vol)}</span>
    </div>

    <!-- Row 3: indicator snapshot -->
    {#if snapshot}
      <div class="rsp-indicators">
        {#if snapshot.rsi_14 != null}
          <span>RSI:<strong>{fmt2(snapshot.rsi_14)}</strong></span>
        {/if}
        {#if snapshot.vol_z_20 != null}
          <span>vol_z:<strong>{fmt2(snapshot.vol_z_20)}</strong></span>
        {/if}
        {#if snapshot.atr_pct_14 != null}
          <span>ATR%:<strong>{fmt2(snapshot.atr_pct_14)}</strong></span>
        {/if}
        {#if snapshot.macd_hist != null}
          <span>MACD:<strong>{fmt2(snapshot.macd_hist)}</strong></span>
        {/if}
        {#if snapshot.bb_width != null}
          <span>BB_w:<strong>{fmt2(snapshot.bb_width)}</strong></span>
        {/if}
      </div>
    {:else}
      <div class="rsp-warn">지표 부족 — 구간을 더 넓게 선택하세요</div>
    {/if}
  {/if}

  <!-- Verdict display (appears after judge) -->
  {#if verdict}
    <div class="rsp-verdict">
      <span class="rsp-verdict-dir {verdictColorClass(verdict)}">{verdict.verdict.toUpperCase()}</span>
      {#if verdict.entry != null}
        <span>Entry:<strong>{fmtPrice(verdict.entry)}</strong></span>
      {/if}
      {#if verdict.stop != null}
        <span>Stop:<strong>{fmtPrice(verdict.stop)}</strong></span>
      {/if}
      {#if verdict.target != null}
        <span>Target:<strong>{fmtPrice(verdict.target)}</strong></span>
      {/if}
      {#if verdict.rr != null}
        <span>RR:<strong>{fmt2(verdict.rr)}</strong></span>
      {/if}
      {#if verdict.rationale}
        <p class="rsp-rationale">"{verdict.rationale}"</p>
      {/if}
    </div>
  {/if}

  <!-- Recall results (core loop: similar past patterns) -->
  {#if recallResults.length > 0}
    <div class="rsp-recall">
      {#each recallResults.slice(0, 4) as r}
        <span class="rsp-recall-item" class:rsp-win={r.outcome === 'win'} class:rsp-loss={r.outcome === 'loss'}>
          <span class="rsp-recall-sim">{Math.round(r.similarity * 100)}%</span>
          <span class="rsp-recall-label">{r.label}</span>
        </span>
      {/each}
    </div>
  {/if}

  <!-- W-0541 PR3-C: Deploy gate verdict header -->
  {#if !tooShort && deployGate !== 'unknown'}
    <div class="rsp-gate {gateClass(deployGate)}">
      <span class="rsp-gate-dot" aria-hidden="true"></span>
      <span class="rsp-gate-label">Deployability:</span>
      <strong class="rsp-gate-state">{gateLabel(deployGate)}</strong>
      {#if deployGateReason}<span class="rsp-gate-reason">— {deployGateReason}</span>{/if}
    </div>
  {/if}

  <!-- W-0541 PR2-B: Actions split into 3 family rows (Interpretation / Knowledge / Operational) -->

  <!-- Family A — Interpretation actions (always available) -->
  <div class="rsp-family">
    <span class="rsp-family-tag">Interpret</span>
    <button
      class="rsp-btn rsp-btn--judge"
      onclick={onJudge}
      disabled={judgeDisabled}
      aria-busy={loading}
    >
      {#if loading}
        <span class="rsp-spinner" aria-hidden="true"></span>
        판정 중…
      {:else}
        Judge
      {/if}
    </button>
    {#if onRecall}
      <button
        class="rsp-btn rsp-btn--recall"
        class:rsp-primary={recallIsPrimary}
        onclick={onRecall}
        disabled={recallLoading || tooShort}
      >
        {#if recallLoading}
          <span class="rsp-spinner" aria-hidden="true"></span>
          찾는 중…
        {:else}
          Recall similar
        {/if}
      </button>
    {/if}
  </div>

  <!-- Family B — Knowledge actions (save / route to deeper surface) -->
  <div class="rsp-family">
    <span class="rsp-family-tag">Save</span>
    <button class="rsp-btn rsp-btn--save" onclick={onSaveOnly}>
      Save to journal
    </button>
    {#if verdict}
      <button class="rsp-btn rsp-btn--save-verdict" onclick={onSave}>
        Save with verdict
      </button>
    {/if}
    {#if onSendToPatterns}
      <button class="rsp-btn rsp-btn--patterns" onclick={onSendToPatterns} disabled={tooShort}>
        Send to Patterns →
      </button>
    {/if}
    {#if onSendToLab}
      <button class="rsp-btn rsp-btn--lab" onclick={onSendToLab} disabled={tooShort}>
        Send to Lab →
      </button>
    {/if}
  </div>

  <!-- Family C — Operational actions (gated, persona-accented) -->
  {#if onCreateAlert || onDeployScreener}
    <div class="rsp-family">
      <span class="rsp-family-tag">Act</span>
      {#if onCreateAlert}
        <button
          class="rsp-btn rsp-btn--alert"
          class:rsp-primary={alertIsPrimary}
          onclick={onCreateAlert}
          disabled={tooShort}
        >
          Create alert
        </button>
      {/if}
      {#if onDeployScreener}
        <button
          class="rsp-btn rsp-btn--deploy"
          class:rsp-primary={deployIsPrimary}
          onclick={onDeployScreener}
          disabled={deployDisabled}
          title={deployDisabled && deployGate === 'insufficient_evidence'
            ? 'Selection lacks statistical evidence to deploy'
            : 'Deploy as continuous screener'}
        >
          Deploy screener
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .rsp-panel {
    display: flex;
    flex-direction: column;
    gap: var(--sp-1, 4px);
    padding: var(--sp-2, 6px) var(--sp-3, 8px);
    background: var(--surface-1, #1a1d27);
    border-top: 1px solid var(--border-1, rgba(255,255,255,0.08));
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs);
    color: var(--text-1, rgba(177,181,189,0.9));
  }

  .rsp-header {
    display: flex;
    align-items: center;
    gap: var(--sp-2, 6px);
  }

  .rsp-title {
    font-weight: 600;
    color: var(--text-0, #fff);
    font-size: var(--ui-text-xs);
  }

  .rsp-date {
    color: var(--text-2, rgba(177,181,189,0.55));
    font-size: var(--ui-text-xs);
  }

  .rsp-ohlcv,
  .rsp-indicators {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-2, 6px) var(--sp-3, 12px);
    font-size: var(--ui-text-xs);
  }

  .rsp-ohlcv strong,
  .rsp-indicators strong {
    color: var(--text-0, #fff);
  }

  .rsp-pct.pos { color: var(--pos); }
  .rsp-pct.neg { color: var(--neg); }

  .rsp-vol {
    color: var(--text-2, rgba(177,181,189,0.55));
  }

  .rsp-warn {
    color: var(--amb);
    font-size: var(--ui-text-xs);
    font-style: italic;
  }

  .rsp-verdict {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-2, 6px) var(--sp-3, 12px);
    padding: var(--sp-1, 4px) 0;
    border-top: 1px solid var(--border-1, rgba(255,255,255,0.06));
    font-size: var(--ui-text-xs);
  }

  .rsp-verdict strong { color: var(--text-0, #fff); }

  .rsp-verdict-dir {
    font-weight: 700;
    font-size: var(--ui-text-xs);
    letter-spacing: 0.05em;
  }
  .rsp-verdict-dir.pos { color: var(--pos); }
  .rsp-verdict-dir.neg { color: var(--neg); }
  .rsp-verdict-dir.amb { color: var(--amb); }

  .rsp-rationale {
    width: 100%;
    margin: 0;
    color: var(--text-2, rgba(177,181,189,0.6));
    font-style: italic;
    font-size: var(--ui-text-xs);
  }

  /* W-0541 PR2-B: 3-family action rows replace single .rsp-actions row */
  .rsp-family {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--sp-2, 6px);
    padding-top: var(--sp-1, 4px);
    border-top: 1px dashed rgba(255, 255, 255, 0.06);
  }
  .rsp-family:first-of-type { border-top: 1px solid rgba(255, 255, 255, 0.08); }
  .rsp-family-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(145, 180, 255, 0.55);
    min-width: 56px;
    flex-shrink: 0;
  }

  /* W-0541 PR3-C: deploy gate verdict header */
  .rsp-gate {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs, 11px);
    align-self: flex-start;
    border: 1px solid transparent;
  }
  .rsp-gate-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .rsp-gate-label {
    color: rgba(255, 255, 255, 0.55);
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.12em;
  }
  .rsp-gate-state { font-weight: 700; letter-spacing: 0.04em; }
  .rsp-gate-reason {
    color: rgba(255, 255, 255, 0.5);
    font-size: var(--ui-text-xs, 11px);
  }
  .rsp-gate.gate-ok {
    color: var(--pos);
    border-color: color-mix(in srgb, var(--pos) 28%, transparent);
    background: color-mix(in srgb, var(--pos) 8%, transparent);
  }
  .rsp-gate.gate-warn {
    color: var(--amb);
    border-color: color-mix(in srgb, var(--amb) 28%, transparent);
    background: color-mix(in srgb, var(--amb) 8%, transparent);
  }
  .rsp-gate.gate-bad {
    color: var(--neg);
    border-color: color-mix(in srgb, var(--neg) 28%, transparent);
    background: color-mix(in srgb, var(--neg) 8%, transparent);
  }
  .rsp-gate.gate-pending {
    color: rgba(255, 255, 255, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .rsp-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-1, 4px);
    padding: var(--sp-1, 3px) var(--sp-3, 10px);
    border: 1px solid var(--border-1, rgba(255,255,255,0.12));
    border-radius: var(--radius-sm, 4px);
    background: var(--surface-2, rgba(255,255,255,0.04));
    color: var(--text-1, rgba(177,181,189,0.9));
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs);
    cursor: pointer;
    transition: background 0.12s;
  }

  .rsp-btn:hover:not(:disabled) {
    background: var(--surface-3, rgba(255,255,255,0.08));
  }

  .rsp-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .rsp-btn--judge {
    border-color: var(--amb);
    color: var(--amb);
  }

  .rsp-btn--save-verdict {
    border-color: var(--pos);
    color: var(--pos);
  }

  .rsp-btn--recall {
    border-color: #3B82F6;
    color: #3B82F6;
  }

  /* W-0541 PR2-B: handoff and operational button styles */
  .rsp-btn--patterns,
  .rsp-btn--lab {
    border-color: rgba(155, 175, 220, 0.32);
    color: rgba(190, 210, 250, 0.92);
  }
  .rsp-btn--alert {
    border-color: color-mix(in srgb, var(--amb) 40%, transparent);
    color: var(--amb);
  }
  .rsp-btn--deploy {
    border-color: color-mix(in srgb, var(--pos) 40%, transparent);
    color: var(--pos);
  }
  /* W-0541 PR4: persona primary accent (filled style) */
  .rsp-btn.rsp-primary {
    background: color-mix(in srgb, currentColor 16%, transparent);
    border-color: color-mix(in srgb, currentColor 70%, transparent);
    font-weight: 700;
  }
  .rsp-btn.rsp-primary:hover:not(:disabled) {
    background: color-mix(in srgb, currentColor 24%, transparent);
  }

  .rsp-recall {
    display: flex;
    flex-wrap: wrap;
    gap: var(--sp-1, 4px) var(--sp-2, 8px);
    padding: var(--sp-1, 4px) 0;
    border-top: 1px solid var(--border-1, rgba(255,255,255,0.06));
  }

  .rsp-recall-item {
    display: inline-flex;
    align-items: center;
    gap: var(--sp-1, 3px);
    font-size: var(--ui-text-xs);
    color: var(--text-2, rgba(177,181,189,0.6));
  }

  .rsp-recall-sim {
    font-weight: 600;
    color: #3B82F6;
  }

  .rsp-recall-item.rsp-win .rsp-recall-label { color: var(--pos); }
  .rsp-recall-item.rsp-loss .rsp-recall-label { color: var(--neg); }

  .rsp-spinner {
    display: inline-block;
    width: var(--sp-2, 8px);
    height: var(--sp-2, 8px);
    border: 1px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: rsp-spin 0.6s linear infinite;
  }

  @keyframes rsp-spin {
    to { transform: rotate(360deg); }
  }

  /* Mobile: full-width bottom sheet style */
  @media (max-width: 768px) {
    .rsp-panel {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      border-radius: var(--radius-md, 8px) var(--radius-md, 8px) 0 0;
      box-shadow: 0 -4px var(--sp-3, 12px) rgba(0,0,0,0.4);
    }
  }
</style>
