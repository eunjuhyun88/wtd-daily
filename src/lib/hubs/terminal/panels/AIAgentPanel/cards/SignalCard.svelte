<script lang="ts">
  import type { SignalCardPayload } from '$lib/agent/directives';
  interface Props {
    payload: SignalCardPayload;
    onSelectSymbol?: (symbol: string) => void;
  }
  let { payload, onSelectSymbol }: Props = $props();

  const D_MAX: Record<string, number> = { D1: 25, D2: 30, D3: 25, D4: 15, D5: 5 };
  const D_LABELS: Record<string, string> = {
    D1: 'L/S 추세',
    D2: 'CVD',
    D3: 'OI-가격',
    D4: '펀딩비',
    D5: 'VWAP',
  };

  const score100 = $derived(Math.round(payload.score_100 ?? 0));
  const dirColor = $derived(payload.direction === 'short' ? '#f44336' : '#4caf50');
  const scorePct = $derived(Math.round(score100));

  function barPct(dim: string): number {
    const val = payload.sub_scores?.[dim] ?? 0;
    const max = D_MAX[dim] ?? 1;
    return Math.round((val / max) * 100);
  }
</script>

<button class="signal-card" onclick={() => onSelectSymbol?.(payload.symbol)}>
  <div class="sc-header">
    <span class="sc-symbol">{payload.symbol}{payload.timeframe ? ` · ${payload.timeframe}` : ''}</span>
    <span class="sc-score" style="color:{dirColor}">{score100}/100</span>
  </div>

  {#if payload.scenario}
    <div class="sc-scenario">{payload.scenario}</div>
  {/if}

  <div class="sc-dims">
    {#each Object.keys(D_LABELS) as dim}
      {@const pct = barPct(dim)}
      {@const active = pct > 0}
      <div class="sc-dim">
        <span class="sc-dim-label" class:active>{D_LABELS[dim]}</span>
        <div class="sc-dim-bar">
          <div class="sc-dim-fill" style="width:{pct}%;background:{active ? dirColor : '#2a2a3a'}"></div>
        </div>
        <span class="sc-dim-pts" class:active>{payload.sub_scores?.[dim] ?? 0}</span>
      </div>
    {/each}
  </div>

  {#if payload.filter_tags?.length}
    <div class="sc-tags">
      {#each payload.filter_tags as tag}
        <span class="sc-tag">{tag}</span>
      {/each}
    </div>
  {/if}

  {#if payload.key_levels}
    <div class="sc-levels">
      <span>진입 {payload.key_levels.entry_low?.toFixed(2)} ~ {payload.key_levels.entry_high?.toFixed(2)}</span>
      <span class="sc-sl">SL {payload.key_levels.sl?.toFixed(2)}</span>
    </div>
  {/if}
</button>

<style>
.signal-card {
  display: flex; flex-direction: column; gap: 6px;
  background: #0e0e1a; border: 1px solid #2a2a3a; border-radius: 8px;
  padding: 10px 12px; cursor: pointer; text-align: left; width: 100%;
  transition: border-color 0.15s;
}
.signal-card:hover { border-color: #4a6fa5; }
.sc-header { display: flex; justify-content: space-between; align-items: baseline; }
.sc-symbol { font-size: 11px; color: #7a8a9a; font-family: monospace; }
.sc-score { font-size: 16px; font-weight: 700; letter-spacing: 0.04em; }
.sc-scenario { font-size: 11px; color: #8a9ab0; }
.sc-dims { display: flex; flex-direction: column; gap: 3px; }
.sc-dim { display: grid; grid-template-columns: 56px 1fr 24px; gap: 4px; align-items: center; }
.sc-dim-label { font-size: var(--ui-text-xs); color: #4a5a6a; }
.sc-dim-label.active { color: #8a9ab0; }
.sc-dim-bar { height: 6px; background: #1a1a2e; border-radius: 2px; overflow: hidden; }
.sc-dim-fill { height: 100%; border-radius: 2px; opacity: 0.6; transition: width 0.3s; }
.sc-dim-pts { font-size: var(--ui-text-xs); color: #4a5a6a; text-align: right; }
.sc-dim-pts.active { color: #8a9ab0; }
.sc-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.sc-tag { font-size: var(--ui-text-xs); color: #6a7a8a; background: #1a1a2e; border-radius: 3px; padding: 1px 5px; }
.sc-levels { display: flex; justify-content: space-between; font-size: var(--ui-text-xs); color: #6a7a8a; }
.sc-sl { color: #f44336; opacity: 0.8; }
</style>
