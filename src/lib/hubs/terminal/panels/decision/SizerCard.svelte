<script lang="ts">
  import MetricRow from '$lib/components/ui/MetricRow.svelte';

  interface Props {
    sizerPct: number;
    entry: number;
    stop: number;
    tp1: number;
    tp2: number;
    rr: number;
    symbol: string;
    confidence: number;
    gate?: number;
  }
  const { sizerPct, entry, stop, tp1, tp2, rr, symbol, confidence, gate = 60 }: Props = $props();

  const fmt = (n: number) => n >= 1000
    ? n.toLocaleString('en-US', { maximumFractionDigits: 2 })
    : n.toFixed(4);

  const active = $derived(sizerPct > 0 && confidence >= gate);

  function onLogTrade() {
    window.dispatchEvent(new CustomEvent('cogochi:log-trade', {
      detail: { symbol, entry, stop, tp1, tp2, sizerPct, confidence }
    }));
  }
</script>

<div class="sc-wrap" class:sc-active={active}>
  <div class="sc-header">
    <span class="sc-title">Sizer — Half-Kelly</span>
    <span class="sc-cap">2% cap</span>
  </div>

  <div class="sc-size-row" class:sc-gated={!active}>
    <span class="sc-size-val">{active ? sizerPct.toFixed(2) : '—'}%</span>
    <span class="sc-size-label">of portfolio</span>
  </div>

  <div class="sc-levels">
    <MetricRow label="Entry" value="${fmt(entry)}" />
    <MetricRow label="SL"    value="${fmt(stop)}"  valueClass="neg" />
    <MetricRow label="TP1"   value="${fmt(tp1)}"   valueClass="pos" />
    <MetricRow label="TP2"   value="${fmt(tp2)}"   valueClass="pos" />
    <MetricRow label="R:R"   value="{rr.toFixed(1)}" divider={true} />
  </div>

  {#if !active}
    <p class="sc-gate-note">Confidence below gate — sizer not active</p>
  {/if}

  <button
    class="sc-cta"
    class:sc-cta-dim={!active}
    onclick={onLogTrade}
  >Log Trade →</button>
</div>

<style>
  .sc-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--sc-sp-2);
    padding: var(--sc-sp-2) var(--sc-sp-3);
    border-radius: var(--sc-radius-2);
    background: var(--sc-bg-2);
    border: 1px solid var(--sc-line-soft);
    transition: border-color var(--sc-dur-fast);
  }

  .sc-active { border-color: var(--accent-pos); }

  .sc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sc-title {
    font-size: var(--sc-fs-2xs);
    font-family: var(--sc-font-mono);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--sc-text-2);
  }

  .sc-cap {
    font-size: var(--sc-fs-2xs);
    font-family: var(--sc-font-mono);
    color: var(--sc-text-3);
  }

  .sc-size-row {
    display: flex;
    align-items: baseline;
    gap: var(--sc-sp-1_5);
  }

  .sc-size-val {
    font-size: var(--sc-fs-2xl);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    font-family: var(--sc-font-mono);
    color: var(--sc-text-0);
    transition: color var(--sc-dur-fast);
  }

  .sc-gated .sc-size-val { color: var(--sc-text-3); }

  .sc-size-label {
    font-size: var(--sc-fs-xs);
    font-family: var(--sc-font-mono);
    color: var(--sc-text-2);
  }

  .sc-levels {
    display: flex;
    flex-direction: column;
    gap: var(--sc-sp-0_5);
  }

  .sc-gate-note {
    font-size: var(--sc-fs-2xs);
    font-family: var(--sc-font-mono);
    color: var(--accent-amb);
    text-align: center;
    margin: 0;
  }

  .sc-cta {
    width: 100%;
    padding: var(--sc-sp-1_5) var(--sc-sp-2);
    border-radius: var(--sc-radius-2);
    background: var(--sc-accent);
    color: #000;
    font-size: var(--sc-fs-sm);
    font-family: var(--sc-font-mono);
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: opacity var(--sc-dur-fast);
  }

  .sc-cta:hover { opacity: 0.82; }

  .sc-cta-dim {
    background: var(--sc-bg-1);
    color: var(--sc-text-3);
    cursor: default;
  }
</style>
