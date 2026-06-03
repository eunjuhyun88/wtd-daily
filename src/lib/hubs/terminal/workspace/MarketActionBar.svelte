<script lang="ts">
  import { chartFreshness } from '$lib/stores/chartFreshness';

  interface VerdictLevels {
    entry?: number;
    target?: number;
    stop?: number;
  }

  interface Props {
    direction?: 'LONG' | 'SHORT' | 'WAIT' | null;
    reason?: string | null;
    change24hPct?: number | null;
    verdictLevels?: VerdictLevels | null;
    compact?: boolean;
  }

  let {
    direction = null,
    reason = null,
    change24hPct = null,
    verdictLevels = null,
    compact = false,
  }: Props = $props();

  let nowMs = $state(Date.now());
  $effect(() => {
    const id = setInterval(() => { nowMs = Date.now(); }, 1000);
    return () => clearInterval(id);
  });

  const freshnessSec = $derived(
    $chartFreshness == null ? null : Math.max(0, Math.floor((nowMs - $chartFreshness) / 1000)),
  );

  const actionLabel = $derived.by(() => {
    if (direction === 'LONG') return 'Long Bias';
    if (direction === 'SHORT') return 'Short Bias';
    if (direction === 'WAIT') return 'Wait / Observe';
    return 'Neutral';
  });

  const directionClass = $derived.by(() => {
    if (direction === 'LONG') return 'is-long';
    if (direction === 'SHORT') return 'is-short';
    if (direction === 'WAIT') return 'is-wait';
    return 'is-neutral';
  });

  const actionHint = $derived.by(() => {
    const entry = verdictLevels?.entry;
    if (!entry || !direction) return 'No active plan';
    if (direction === 'LONG') return `Above ${fmt(entry)} favors continuation`;
    if (direction === 'SHORT') return `Below ${fmt(entry)} favors weakness`;
    return `Watch reaction around ${fmt(entry)}`;
  });

  const hasPlan = $derived(
    verdictLevels?.entry != null || verdictLevels?.stop != null || verdictLevels?.target != null,
  );
  const hasSignalData = $derived(
    direction != null || reason != null || change24hPct != null || hasPlan,
  );

  function fmt(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return '—';
    if (Math.abs(value) >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    if (Math.abs(value) >= 1) return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
    return value.toPrecision(4);
  }

  function pct(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return '—';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }
</script>

{#if hasSignalData}
  <div class="market-action-bar" class:is-compact={compact}>
    <div class="summary-strip" title={reason ?? actionHint}>
      <span class="summary-label">MARKET STATE</span>
      <span class="state-pill {directionClass}">{actionLabel}</span>
      <span class="summary-hint">{actionHint}</span>
      <span class="summary-spacer"></span>
      {#if change24hPct != null}
        <span class="summary-item">
          <span class="meta-k">24H</span>
          <strong class:pos={change24hPct >= 0} class:neg={change24hPct < 0}>{pct(change24hPct)}</strong>
        </span>
      {/if}
      {#if freshnessSec != null}
        <span class="summary-item">
          <span class="meta-k">LIVE</span>
          <strong class="inline-v">{freshnessSec}s</strong>
        </span>
      {/if}
    </div>
    {#if hasPlan || reason}
      <div class="plan-strip">
        {#if verdictLevels?.entry != null}
          <span class="summary-item"><span class="level-k">ENTRY</span><strong class="inline-v">{fmt(verdictLevels?.entry)}</strong></span>
        {/if}
        {#if verdictLevels?.stop != null}
          <span class="summary-item"><span class="level-k">STOP</span><strong class="inline-v">{fmt(verdictLevels?.stop)}</strong></span>
        {/if}
        {#if verdictLevels?.target != null}
          <span class="summary-item"><span class="level-k">TARGET</span><strong class="inline-v">{fmt(verdictLevels?.target)}</strong></span>
        {/if}
        {#if reason}
          <span class="summary-item summary-item-thesis">
            <span class="level-k">THESIS</span>
            <span class="reason-v">{reason}</span>
          </span>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .market-action-bar {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.08));
    background:
      linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.012)),
      var(--term-surface-0, var(--g0));
  }

  .summary-strip,
  .plan-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    overflow: hidden;
  }

  .summary-strip {
    min-height: 24px;
    padding: 0 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--term-border, rgba(255,255,255,0.08)) 85%, transparent);
  }

  .plan-strip {
    padding: 0 8px;
    min-height: 20px;
  }

  .state-pill {
    display: inline-flex;
    align-items: center;
    min-height: 18px;
    padding: 0 7px;
    border-radius: 999px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    border: 1px solid transparent;
    flex-shrink: 0;
  }

  .state-pill.is-long {
    color: #27c08a;
    background: rgba(39, 192, 138, 0.1);
    border-color: rgba(39, 192, 138, 0.18);
  }

  .state-pill.is-short {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border-color: rgba(255, 107, 107, 0.18);
  }

  .state-pill.is-wait,
  .state-pill.is-neutral {
    color: #f0c36b;
    background: rgba(240, 195, 107, 0.1);
    border-color: rgba(240, 195, 107, 0.18);
  }

  .pos { color: #27c08a; }
  .neg { color: #ff6b6b; }

  .summary-label,
  .level-k,
  .meta-k {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--term-text-2, var(--g5));
    flex-shrink: 0;
  }

  .summary-hint {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--term-text-1, var(--g8));
    font-size: 11px;
  }

  .summary-spacer {
    flex: 1;
    min-width: 8px;
  }

  .summary-item {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
    flex-shrink: 0;
  }

  .summary-item-thesis {
    min-width: 0;
    flex: 1;
  }

  .inline-v {
    color: var(--term-text-0, var(--g9));
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .reason-v {
    color: var(--term-text-1, var(--g8));
    font-size: 11px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .market-action-bar.is-compact {
    gap: 3px;
    padding: 4px 6px;
  }

  .market-action-bar.is-compact .summary-label,
  .market-action-bar.is-compact .level-k,
  .market-action-bar.is-compact .meta-k {
    font-size: 11px;
    letter-spacing: 0.08em;
  }

  .market-action-bar.is-compact .summary-strip,
  .market-action-bar.is-compact .plan-strip {
    gap: 6px;
  }

  .market-action-bar.is-compact .state-pill {
    min-height: 16px;
    padding: 0 4px;
    font-size: 11px;
  }

  .market-action-bar.is-compact .summary-item {
    gap: 3px;
  }

  .market-action-bar.is-compact .inline-v,
  .market-action-bar.is-compact .summary-item strong {
    font-size: 11px;
  }

  .market-action-bar.is-compact .summary-strip {
    min-height: 20px;
    padding: 0 6px;
  }

  .market-action-bar.is-compact .plan-strip {
    padding: 0 6px;
    min-height: 18px;
  }

  .market-action-bar.is-compact .summary-hint {
    font-size: 11px;
  }

  .market-action-bar.is-compact .reason-v {
    font-size: 11px;
    opacity: 0.7;
  }

  .market-action-bar.is-compact .summary-item-thesis {
    flex: 1;
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .summary-strip,
    .plan-strip {
      gap: 5px;
    }

    .market-action-bar.is-compact .summary-item-thesis {
      display: none;
    }
  }
</style>
