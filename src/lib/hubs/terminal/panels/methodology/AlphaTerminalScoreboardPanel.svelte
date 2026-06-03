<script lang="ts">
  import { onMount } from 'svelte';

  let { sym = 'SOLUSDT' }: { sym?: string } = $props();

  interface AlphaSignals {
    S01?: boolean | null;
    S02?: boolean | null;
    S03?: boolean | null;
    S04?: boolean | null;
    S05?: boolean | null;
    S06?: number  | null;
    S07?: boolean | null;
    S08?: boolean | null;
    S09?: boolean | null;
    S10?: boolean | null;
    S11?: boolean | null;
    S12?: boolean | null;
    S13?: boolean | null;
    S14?: boolean | null;
    S15?: boolean | null;
    S16?: boolean | null;
    S17?: boolean | null;
    S18?: boolean | null;
    S19?: number  | null;
    S20?: boolean | null;
    [key: string]: boolean | number | null | undefined;
  }

  interface SingleResult {
    sym: string;
    level?: string;
    rank_score?: number;
    alpha_s?: AlphaSignals;
    data_coverage?: number;
    wyckoff_score?: number;
    wyckoff_phase?: string;
    error?: string;
  }

  const SIGNAL_LABELS: Record<string, string> = {
    S01: 'CHoCH',
    S02: 'Spring',
    S03: 'SOS',
    S04: 'CISD',
    S05: 'SSL Swept',
    S06: 'OI Δ6H',
    S07: 'FR Extreme',
    S08: 'FR Neg 48H',
    S09: 'CVD Bull',
    S10: 'RSI OS',
    S11: 'BB Squeeze',
    S12: 'EQL Swept',
    S13: 'EQH Target',
    S14: 'IFVG Near',
    S15: 'BPR Near',
    S16: 'FVG Near',
    S17: 'OB Near',
    S18: 'Daily Bull',
    S19: 'LS Div',
    S20: 'Wyckoff ≥5',
  };

  const TIER_COLOR: Record<string, string> = {
    FIRE:  '#adca7c',
    ALERT: '#facc15',
    WATCH: '#60a5fa',
  };

  let result   = $state<SingleResult | null>(null);
  let loading  = $state(true);
  let error    = $state<string | null>(null);
  let inputSym = $state(sym);

  async function fetchSingle(s: string) {
    loading = true;
    error   = null;
    result  = null;
    try {
      const res  = await fetch(`/api/terminal/agent/prepump/single?sym=${encodeURIComponent(s.toUpperCase())}`);
      const data = await res.json();
      if (data.error) { error = data.error; return; }
      result = data as SingleResult;
    } catch (e) {
      error = e instanceof Error ? e.message : 'fetch failed';
    } finally {
      loading = false;
    }
  }

  function signalValue(alpha: AlphaSignals, key: string): boolean | number | null {
    const v = alpha[key];
    if (v === undefined) return null;
    return v ?? null;
  }

  function barWidth(key: string, alpha: AlphaSignals): number {
    const v = signalValue(alpha, key);
    if (v === null) return 0;
    if (key === 'S06') return Math.min(100, Math.abs((v as number) * 500));
    if (key === 'S19') return Math.min(100, (v as number) * 200);
    return v ? 100 : 0;
  }

  function barColor(key: string, alpha: AlphaSignals): string {
    const v = signalValue(alpha, key);
    if (v === null) return 'rgba(255,255,255,0.06)';
    if (key === 'S06' || key === 'S19') {
      return (v as number) > 0 ? '#adca7c' : '#cf7f8f';
    }
    return v ? '#adca7c' : 'rgba(255,255,255,0.10)';
  }

  function barLabel(key: string, alpha: AlphaSignals): string {
    const v = signalValue(alpha, key);
    if (v === null) return '—';
    if (key === 'S06') return `${((v as number) * 100).toFixed(1)}%`;
    if (key === 'S19') return (v as number).toFixed(2);
    return v ? 'YES' : 'NO';
  }

  onMount(() => fetchSingle(sym));
</script>

<div class="alpha-panel">
  <div class="alpha-header">
    <span class="title">ALPHA SCOREBOARD</span>
    <div class="sym-input">
      <input
        bind:value={inputSym}
        onkeydown={(e) => e.key === 'Enter' && fetchSingle(inputSym)}
        placeholder="SOLUSDT"
        class="sym-field"
      />
      <button class="sym-btn" onclick={() => fetchSingle(inputSym)}>▶</button>
    </div>
    {#if result}
      <span class="tier-badge" style:color={TIER_COLOR[result.level ?? ''] ?? 'var(--term-text-2)'}>
        {result.level ?? '—'}
      </span>
      <span class="score-badge">{result.rank_score != null ? result.rank_score.toFixed(1) : '—'} pts</span>
      <span class="coverage">cov {result.data_coverage != null ? (result.data_coverage * 100).toFixed(0) : '—'}%</span>
    {/if}
  </div>

  {#if loading}
    <div class="state-msg">scanning {sym}…</div>
  {:else if error}
    <div class="state-msg err">{error}</div>
  {:else if result?.alpha_s}
    {@const alpha = result.alpha_s}
    <div class="bars">
      {#each Object.keys(SIGNAL_LABELS) as key}
        {@const w = barWidth(key, alpha)}
        {@const c = barColor(key, alpha)}
        {@const lbl = barLabel(key, alpha)}
        <div class="bar-row">
          <span class="sig-label">{SIGNAL_LABELS[key]}</span>
          <div class="bar-track">
            <div class="bar-fill" style:width="{w}%" style:background={c}></div>
          </div>
          <span class="sig-val" style:color={c.startsWith('rgba') ? 'var(--term-text-2)' : c}>
            {lbl}
          </span>
        </div>
      {/each}
    </div>

    {#if result.wyckoff_phase}
      <div class="wyckoff-row">
        <span class="wy-label">Wyckoff</span>
        <span class="wy-phase">{result.wyckoff_phase}</span>
        <span class="wy-score">score {result.wyckoff_score ?? '—'}</span>
      </div>
    {/if}
  {:else}
    <div class="state-msg">no data</div>
  {/if}
</div>

<style>
  .alpha-panel {
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

  .alpha-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-bottom: 1px solid var(--term-border, rgba(255,255,255,0.07));
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--term-text-0, rgba(247,242,234,0.94));
    flex-shrink: 0;
  }

  .sym-input {
    display: flex;
    gap: 4px;
    flex: 1;
    min-width: 100px;
  }

  .sym-field {
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--term-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    color: var(--term-text-0, rgba(247,242,234,0.92));
    font-family: inherit;
    font-size: 11px;
    padding: 2px 6px;
    width: 90px;
    outline: none;
  }
  .sym-field:focus { border-color: rgba(255,255,255,0.25); }

  .sym-btn {
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--term-border, rgba(255,255,255,0.1));
    border-radius: 3px;
    color: var(--term-text-1, rgba(247,242,234,0.6));
    cursor: pointer;
    font-size: 11px;
    padding: 2px 7px;
    transition: color 0.1s;
  }
  .sym-btn:hover { color: var(--term-text-0, rgba(247,242,234,0.9)); }

  .tier-badge  { font-weight: 700; font-size: 11px; }
  .score-badge { color: var(--term-text-2, rgba(247,242,234,0.5)); font-size: 11px; }
  .coverage    { color: var(--term-text-2, rgba(247,242,234,0.35)); font-size: 11px; }

  .bars {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px;
    scrollbar-width: thin;
    scrollbar-color: var(--term-border, rgba(255,255,255,0.08)) transparent;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 72px 1fr 48px;
    align-items: center;
    gap: 6px;
  }

  .sig-label {
    color: var(--term-text-2, rgba(247,242,234,0.45));
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
  }

  .bar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 2px;
    height: 6px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }

  .sig-val {
    text-align: right;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .wyckoff-row {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 10px;
    border-top: 1px solid var(--term-border, rgba(255,255,255,0.07));
    font-size: 11px;
    flex-shrink: 0;
  }

  .wy-label { color: var(--term-text-2, rgba(247,242,234,0.35)); }
  .wy-phase { color: #f2d193; font-weight: 600; }
  .wy-score { margin-left: auto; color: var(--term-text-2, rgba(247,242,234,0.4)); }

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
