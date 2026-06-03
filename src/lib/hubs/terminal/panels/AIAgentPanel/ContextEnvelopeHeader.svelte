<!--
  W-0528 PR12 — ContextEnvelopeHeader

  A 4-chip strip that mirrors the ai-context envelope so the user (and the
  on-call) can see at a glance:
    1. regime    — dominant regime label from the posterior
    2. entropy   — how uncertain the regime model currently is
    3. PSI       — distribution shift vs the 90d reference window
    4. low_edge  — whether expected_move is < 3× total frictions

  Design rules:
  - Chip colour follows magnitude (good=mint, watch=amber, hot=red) so the
    header reads correctly at a glance even when text shrinks on mobile.
  - The component is a *pure function of envelope* — it does no fetching,
    so the parent panel controls staleness. Anything we cannot read from
    the envelope renders as `—` rather than throwing or hiding the chip.
-->
<script lang="ts">
  interface RegimePosterior {
    bull_trend?: number;
    bear_trend?: number;
    bull_chop?: number;
    bear_chop?: number;
    [k: string]: number | undefined;
  }

  interface ContextEnvelope {
    regime_posterior?: RegimePosterior | null;
    regime_source?: string | null;
    regime_posterior_stub?: boolean;
    entropy?: number | null;
    psi?: number | null;
    distribution_shift?: boolean;
    low_edge?: boolean;
    expected_move_bps?: number | null;
    frictions_total_bps?: number | null;
  }

  interface Props {
    envelope: ContextEnvelope | null | undefined;
  }
  const { envelope }: Props = $props();

  function dominantRegime(p: RegimePosterior | null | undefined): string {
    if (!p) return '—';
    let best: [string, number] | null = null;
    for (const [k, v] of Object.entries(p)) {
      if (typeof v !== 'number') continue;
      if (!best || v > best[1]) best = [k, v];
    }
    return best?.[0] ?? '—';
  }

  // Tone follows magnitude. 'hot' is reserved for "stop and think" (high
  // entropy, shift detected, low-edge); we do not mix it with 'watch'.
  type Tone = 'good' | 'watch' | 'hot' | 'mute';

  function entropyTone(e: number | null | undefined): Tone {
    if (e === null || e === undefined) return 'mute';
    if (e >= 0.85) return 'hot';
    if (e >= 0.6) return 'watch';
    return 'good';
  }

  function psiTone(psi: number | null | undefined, shift: boolean | undefined): Tone {
    if (shift) return 'hot';
    if (psi === null || psi === undefined) return 'mute';
    if (psi > 0.1) return 'watch';
    return 'good';
  }

  function edgeTone(low: boolean | undefined, em: number | null | undefined): Tone {
    if (low) return 'hot';
    if (em === null || em === undefined) return 'mute';
    return 'good';
  }

  const regime = $derived(dominantRegime(envelope?.regime_posterior));
  const regimeStub = $derived(envelope?.regime_posterior_stub === true);
  const entropy = $derived(typeof envelope?.entropy === 'number' ? envelope!.entropy! : null);
  const psi = $derived(typeof envelope?.psi === 'number' ? envelope!.psi! : null);
  const shift = $derived(envelope?.distribution_shift === true);
  const lowEdge = $derived(envelope?.low_edge === true);
  const em = $derived(typeof envelope?.expected_move_bps === 'number' ? envelope!.expected_move_bps! : null);
  const frictions = $derived(typeof envelope?.frictions_total_bps === 'number' ? envelope!.frictions_total_bps! : null);
</script>

<div class="envelope-header" data-testid="context-envelope-header">
  <span class="chip" data-tone={regimeStub ? 'mute' : 'good'} title="Dominant regime label from the posterior">
    <span class="chip-label">regime</span>
    <span class="chip-value">{regime}{regimeStub ? ' · stub' : ''}</span>
  </span>

  <span class="chip" data-tone={entropyTone(entropy)} title="Posterior entropy. ≥ 0.85 → transition_mode threshold.">
    <span class="chip-label">entropy</span>
    <span class="chip-value">{entropy === null ? '—' : entropy.toFixed(2)}</span>
  </span>

  <span class="chip" data-tone={psiTone(psi, shift)} title="Population Stability Index vs 90d reference">
    <span class="chip-label">PSI</span>
    <span class="chip-value">
      {psi === null ? '—' : psi.toFixed(2)}
      {#if shift}<em class="shift-flag">shift</em>{/if}
    </span>
  </span>

  <span class="chip" data-tone={edgeTone(lowEdge, em)} title="expected_move vs frictions × 3">
    <span class="chip-label">edge</span>
    <span class="chip-value">
      {#if em === null}—
      {:else}{em.toFixed(0)}bps
      {/if}
      {#if frictions !== null}<span class="aux">/ {frictions.toFixed(0)}bps</span>{/if}
      {#if lowEdge}<em class="shift-flag">low</em>{/if}
    </span>
  </span>
</div>

<style>
  .envelope-header {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--border-muted, rgba(255, 255, 255, 0.06));
    background: var(--surface-1, rgba(255, 255, 255, 0.02));
  }

  .chip {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    background: var(--chip-bg, rgba(255, 255, 255, 0.04));
    color: var(--chip-fg, var(--text-secondary, #cfd5dd));
    border: 1px solid transparent;
    line-height: 1.4;
  }

  .chip[data-tone='good'] {
    --chip-bg: rgba(80, 200, 140, 0.12);
    --chip-fg: rgb(120, 220, 170);
    border-color: rgba(80, 200, 140, 0.25);
  }
  .chip[data-tone='watch'] {
    --chip-bg: rgba(240, 180, 60, 0.12);
    --chip-fg: rgb(245, 200, 110);
    border-color: rgba(240, 180, 60, 0.25);
  }
  .chip[data-tone='hot'] {
    --chip-bg: rgba(240, 80, 90, 0.14);
    --chip-fg: rgb(245, 130, 140);
    border-color: rgba(240, 80, 90, 0.3);
  }
  .chip[data-tone='mute'] {
    --chip-bg: rgba(255, 255, 255, 0.04);
    --chip-fg: var(--text-tertiary, #8a929c);
  }

  .chip-label {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    opacity: 0.75;
    font-size: 11px;
  }

  .chip-value {
    font-variant-numeric: tabular-nums;
  }

  .aux {
    opacity: 0.6;
    margin-left: 2px;
  }

  .shift-flag {
    margin-left: 4px;
    font-style: normal;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(240, 80, 90, 0.18);
    color: rgb(245, 130, 140);
  }
</style>
