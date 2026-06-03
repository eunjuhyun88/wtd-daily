<script lang="ts">
  interface Props {
    confidence: number; // 0–100
    gate?: number;      // default 60
  }
  const { confidence, gate = 60 }: Props = $props();

  const pct = $derived(Math.min(100, Math.max(0, confidence)));
  const color = $derived(pct >= gate ? 'var(--signal-long, #3ddc84)' : pct > 0 ? 'var(--amb, #f0a500)' : 'var(--fg-muted, #555)');
  const label = $derived(pct >= gate ? 'gate ✓' : pct > 0 ? 'below gate' : 'no signal');
</script>

<div class="cg-wrap">
  <div class="cg-header">
    <span class="cg-title">Confidence</span>
    <span class="cg-pct" style:color>{pct.toFixed(0)}%</span>
  </div>
  <div class="cg-bar-track">
    <div class="cg-bar-fill" style:width="{pct}%" style:background={color}></div>
    <div class="cg-gate-marker" style:left="{gate}%"></div>
  </div>
  <div class="cg-footer">
    <span class="cg-label" style:color>{label}</span>
    <span class="cg-sub">TA 0.6 · ML 0.4</span>
  </div>
</div>

<style>
  .cg-wrap { display: flex; flex-direction: column; gap: 4px; }
  .cg-header { display: flex; justify-content: space-between; align-items: baseline; }
  .cg-title { font-size: 11px; color: var(--fg-muted, #888); text-transform: uppercase; letter-spacing: 0.06em; }
  .cg-pct { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .cg-bar-track { position: relative; height: 6px; background: var(--surface-2, #222); border-radius: 3px; }
  .cg-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease, background 0.3s; }
  .cg-gate-marker {
    position: absolute; top: -2px; bottom: -2px;
    width: 1.5px; background: var(--fg-muted, #666);
    transform: translateX(-50%);
  }
  .cg-footer { display: flex; justify-content: space-between; }
  .cg-label { font-size: 11px; font-weight: 600; }
  .cg-sub { font-size: 11px; color: var(--fg-muted, #666); }
</style>
