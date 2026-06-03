<script lang="ts">
  import { submitTradeOutcome } from '$lib/api/terminalBackend';
  import type { AnalyzeEnvelope } from '$lib/contracts/terminalBackend';

  interface Props {
    data: AnalyzeEnvelope;
    symbol?: string;
    timeframe?: string;
  }
  const { data, symbol = 'BTCUSDT', timeframe = '4h' }: Props = $props();

  const dir    = $derived(data.ensemble?.direction ?? data.snapshot?.regime ?? '—');
  const alpha  = $derived(data.deep?.total_score ?? null);
  const entry  = $derived(data.entryPlan?.entry);
  const stop   = $derived(data.entryPlan?.stop);
  const rr     = $derived(data.entryPlan?.riskReward);
  const regime = $derived(data.snapshot?.regime ?? null);
  const reason = $derived(data.ensemble?.reason ?? null);
  const sym    = $derived(data.symbol ?? '—');
  const tf     = $derived(data.tf ?? '—');

  // Flow summary pills
  const flowPills = $derived([
    data.flowSummary?.oi      ? { label: 'OI',   val: data.flowSummary.oi }      : null,
    data.flowSummary?.cvd     ? { label: 'CVD',  val: data.flowSummary.cvd }     : null,
    data.flowSummary?.funding ? { label: 'FR',   val: data.flowSummary.funding } : null,
  ].filter(Boolean) as { label: string; val: string }[]);

  // Facts state (non-blocking fetch)
  interface ConfluenceSummary { bias: string; score: number; confidencePct: number; }
  interface PerpMetrics { funding_rate: number; oi_change_24h: number; crowding: string; }

  let confluenceData = $state<ConfluenceSummary | null>(null);
  let perpData = $state<PerpMetrics | null>(null);

  $effect(() => {
    const sym = symbol;
    const tf = timeframe;
    confluenceData = null;
    perpData = null;

    void (async () => {
      try {
        const [confRes, perpRes] = await Promise.allSettled([
          fetch(`/api/facts/confluence?symbol=${sym}&timeframe=${tf}`),
          fetch(`/api/facts/perp-context?symbol=${sym}&timeframe=${tf}`),
        ]);
        if (confRes.status === 'fulfilled' && confRes.value.ok) {
          const j = await confRes.value.json() as { summary?: { bias: string; score: number; confidencePct: number } };
          if (j.summary) confluenceData = j.summary;
        }
        if (perpRes.status === 'fulfilled' && perpRes.value.ok) {
          const j = await perpRes.value.json() as { metrics?: { funding_rate: number; oi_change_24h: number }; regime?: { crowding: string } };
          if (j.metrics) {
            perpData = {
              funding_rate: j.metrics.funding_rate,
              oi_change_24h: j.metrics.oi_change_24h,
              crowding: j.regime?.crowding ?? 'neutral',
            };
          }
        }
      } catch { /* silent fallback */ }
    })();
  });

  // Judge state
  type Verdict = 'agree' | 'disagree' | null;
  type Outcome = 'win' | 'loss' | 'flat' | null;
  let verdict = $state<Verdict>(null);
  let outcome = $state<Outcome>(null);
  let saving  = $state(false);
  let saved   = $state(false);

  async function setOutcome(o: Outcome) {
    if (!o || saving) return;
    outcome = o;
    const snap = data.snapshot;
    if (!snap || !data.symbol) return;
    saving = true;
    try {
      await submitTradeOutcome({
        snapshot: { ...snap, user_verdict: verdict },
        outcome: o === 'win' ? 1 : o === 'loss' ? 0 : -1,
        symbol: data.symbol,
        timeframe: data.tf ?? '4h',
      });
      saved = true;
    } catch { /* silent */ }
    finally { saving = false; }
  }

  const isLong  = $derived(dir === 'LONG');
  const isShort = $derived(dir === 'SHORT');
  const fmtNum  = (n?: number) => n != null ? n.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '—';
</script>

<div class="ctx-card">
  <!-- Header -->
  <div class="ctx-hdr">
    <span class="ctx-sym">{sym} · {tf}</span>
    <span class="ctx-dir" class:long={isLong} class:short={isShort}>{dir}</span>
    {#if alpha != null}
      <span class="ctx-alpha">α{Math.round(alpha)}</span>
    {/if}
    {#if regime && regime !== 'BULL'}
      <span class="ctx-regime warn">{regime}</span>
    {/if}
  </div>

  <!-- Entry plan row -->
  {#if entry != null}
    <div class="ctx-levels">
      <span class="lvl">entry <strong>{fmtNum(entry)}</strong></span>
      {#if stop != null}<span class="lvl neg">stop <strong>{fmtNum(stop)}</strong></span>{/if}
      {#if rr != null}<span class="lvl pos">R:R <strong>{rr.toFixed(1)}×</strong></span>{/if}
    </div>
  {/if}

  <!-- Reason -->
  {#if reason}
    <p class="ctx-reason">{reason}</p>
  {/if}

  <!-- Flow pills -->
  {#if flowPills.length > 0}
    <div class="ctx-pills">
      {#each flowPills as p}
        <span class="flow-pill">{p.label} {p.val}</span>
      {/each}
    </div>
  {/if}

  <!-- Confluence score -->
  {#if confluenceData}
    <div class="conf-row">
      <span class="conf-label">CONF</span>
      <span class="conf-score" class:bull={confluenceData.bias === 'bullish'} class:bear={confluenceData.bias === 'bearish'}>
        {confluenceData.bias === 'bullish' ? '▲' : confluenceData.bias === 'bearish' ? '▼' : '—'}
        {confluenceData.score > 0 ? '+' : ''}{confluenceData.score}
      </span>
      <span class="conf-pct">{confluenceData.confidencePct}%</span>
    </div>
  {/if}

  <!-- Perp chips -->
  {#if perpData}
    <div class="perp-row">
      <span class="perp-chip" class:warn={Math.abs(perpData.funding_rate) > 0.0005}>
        FR {perpData.funding_rate >= 0 ? '+' : ''}{(perpData.funding_rate * 100).toFixed(4)}%
      </span>
      <span class="perp-chip" class:pos={perpData.oi_change_24h > 0} class:neg={perpData.oi_change_24h < 0}>
        OI {perpData.oi_change_24h > 0 ? '+' : ''}{(perpData.oi_change_24h * 100).toFixed(1)}%
      </span>
      {#if perpData.crowding !== 'neutral'}
        <span class="perp-chip warn">{perpData.crowding.replace('_', ' ')}</span>
      {/if}
    </div>
  {/if}

  <!-- Judge row -->
  <div class="judge-row">
    <span class="judge-lbl">판단</span>
    <button
      class="jb agree"
      class:active={verdict === 'agree'}
      disabled={saved}
      onclick={() => { verdict = verdict === 'agree' ? null : 'agree'; }}
    >AGREE</button>
    <button
      class="jb disagree"
      class:active={verdict === 'disagree'}
      disabled={saved}
      onclick={() => { verdict = verdict === 'disagree' ? null : 'disagree'; }}
    >DISAGREE</button>

    {#if verdict}
      <span class="judge-sep">·</span>
      {#each [{ k: 'win', l: 'WIN' }, { k: 'loss', l: 'LOSS' }, { k: 'flat', l: 'FLAT' }] as o}
        <button
          class="ob"
          class:active={outcome === o.k}
          class:win={o.k === 'win'}
          class:loss={o.k === 'loss'}
          disabled={saving || saved}
          onclick={() => setOutcome(o.k as Outcome)}
        >{o.l}</button>
      {/each}
    {/if}

    {#if saved}
      <span class="saved-hint">✓ 저장됨</span>
    {/if}
  </div>
</div>

<style>
.ctx-card {
  background: var(--g2);
  border: 1px solid var(--g4);
  border-left: 3px solid var(--brand);
  border-radius: 4px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: 'JetBrains Mono', monospace;
}

.ctx-hdr {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.ctx-sym  { font-size: var(--ui-text-xs); color: var(--g6); letter-spacing: 0.08em; }
.ctx-dir  { font-size: var(--ui-text-xs); font-weight: 700; letter-spacing: 0.12em; color: var(--g7); }
.ctx-dir.long  { color: var(--pos); }
.ctx-dir.short { color: var(--neg); }
.ctx-alpha { font-size: var(--ui-text-xs); color: var(--amb); }
.ctx-regime.warn { font-size: var(--ui-text-xs); color: var(--neg); }

.ctx-levels {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.lvl { font-size: var(--ui-text-xs); color: var(--g6); }
.lvl strong { color: var(--g8); }
.lvl.pos strong { color: var(--pos); }
.lvl.neg strong { color: var(--neg); }

.ctx-reason {
  font-size: var(--ui-text-xs);
  color: var(--g6);
  line-height: 1.5;
  margin: 0;
  font-family: var(--fb);
}

.ctx-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.flow-pill {
  font-size: var(--ui-text-xs);
  padding: 1px 5px;
  background: var(--g3);
  border: 1px solid var(--g4);
  border-radius: 2px;
  color: var(--g6);
}

/* Judge */
.judge-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; margin-top: 2px; }
.judge-lbl { font-size: var(--ui-text-xs); color: var(--g5); letter-spacing: 0.08em; margin-right: 2px; }
.judge-sep { color: var(--g4); }

.jb, .ob {
  padding: 2px 8px;
  font-size: var(--ui-text-xs);
  font-family: 'JetBrains Mono', monospace;
  background: var(--g3);
  border: 1px solid var(--g4);
  border-radius: 2px;
  cursor: pointer;
  color: var(--g6);
  letter-spacing: 0.06em;
  transition: all 0.1s;
}
.jb:disabled, .ob:disabled { cursor: not-allowed; opacity: 0.5; }

.jb.agree:hover,  .jb.agree.active  { background: color-mix(in srgb, var(--pos) 15%, transparent); color: var(--pos); border-color: color-mix(in srgb, var(--pos) 40%, transparent); }
.jb.disagree:hover, .jb.disagree.active { background: color-mix(in srgb, var(--neg) 15%, transparent); color: var(--neg); border-color: color-mix(in srgb, var(--neg) 40%, transparent); }

.ob.win.active  { background: color-mix(in srgb, var(--pos) 15%, transparent); color: var(--pos); border-color: color-mix(in srgb, var(--pos) 40%, transparent); }
.ob.loss.active { background: color-mix(in srgb, var(--neg) 15%, transparent); color: var(--neg); border-color: color-mix(in srgb, var(--neg) 40%, transparent); }
.ob.active:not(.win):not(.loss) { background: var(--g4); color: var(--g7); }

.saved-hint { font-size: var(--ui-text-xs); color: var(--pos); margin-left: 4px; }

.conf-row { display: flex; align-items: center; gap: 5px; }
.conf-label { font-size: var(--ui-text-xs); color: var(--g5); letter-spacing: 0.1em; }
.conf-score { font-size: var(--ui-text-xs); font-weight: 700; color: var(--g7); }
.conf-score.bull { color: var(--pos); }
.conf-score.bear { color: var(--neg); }
.conf-pct { font-size: var(--ui-text-xs); color: var(--g5); }

.perp-row { display: flex; gap: 4px; flex-wrap: wrap; }
.perp-chip {
  font-size: var(--ui-text-xs); padding: 1px 5px;
  background: var(--g3); border: 1px solid var(--g4);
  border-radius: 2px; color: var(--g6);
}
.perp-chip.pos { color: var(--pos); border-color: color-mix(in srgb, var(--pos) 30%, transparent); }
.perp-chip.neg { color: var(--neg); border-color: color-mix(in srgb, var(--neg) 30%, transparent); }
.perp-chip.warn { color: var(--amb); border-color: color-mix(in srgb, var(--amb) 30%, transparent); }
</style>
