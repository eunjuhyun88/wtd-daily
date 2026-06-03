<script lang="ts">
  import type { IChartApi, ISeriesApi, SeriesType } from 'lightweight-charts';

  interface Zone {
    entry?:  number;
    stop?:   number;
    target?: number;
  }

  interface Props {
    zone?: Zone;
    chart: IChartApi | null;
    series: ISeriesApi<SeriesType> | null;
    containerEl: HTMLElement | undefined;
  }

  let { zone, chart, series, containerEl }: Props = $props();

  // Version counter — bumped by range changes to force $derived recompute
  let vpv = $state(0);
  let svgW = $state(0);
  let svgH = $state(0);

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) { svgW = r.width; svgH = r.height; }
    });
    ro.observe(containerEl);
    svgW = containerEl.offsetWidth;
    svgH = containerEl.offsetHeight;
    return () => ro.disconnect();
  });

  $effect(() => {
    if (!chart) return;
    const bump = () => { vpv++; };
    chart.timeScale().subscribeVisibleLogicalRangeChange(bump);
    return () => chart?.timeScale().unsubscribeVisibleLogicalRangeChange(bump);
  });

  function toY(price: number): number | null {
    if (!series) return null;
    const y = series.priceToCoordinate(price);
    return y == null || y < -5000 ? null : y;
  }

  const entryY  = $derived.by(() => { void vpv; return zone?.entry  != null ? toY(zone.entry)  : null; });
  const stopY   = $derived.by(() => { void vpv; return zone?.stop   != null ? toY(zone.stop)   : null; });
  const targetY = $derived.by(() => { void vpv; return zone?.target != null ? toY(zone.target) : null; });

  const visible = $derived(
    zone != null &&
    entryY != null && stopY != null &&
    svgW > 0 && svgH > 0
  );

  const TAG_W = 68;
  const TAG_H = 16;
  const TAG_X = $derived(svgW - TAG_W - 4);

  // SL zone rect — computed here so {#if} is not needed in template
  const slTop = $derived(stopY != null && entryY != null ? Math.min(stopY, entryY) : 0);
  const slH   = $derived(stopY != null && entryY != null ? Math.abs(entryY - stopY) : 0);

  // TP zone rect
  const tpTop = $derived(targetY != null && entryY != null ? Math.min(targetY, entryY) : 0);
  const tpH   = $derived(targetY != null && entryY != null ? Math.abs(entryY - targetY) : 0);
</script>

{#if visible}
  <svg class="agent-overlay" width={svgW} height={svgH} aria-hidden="true">

    <!-- TP zone: entry → target (green) -->
    {#if targetY != null}
      <rect x="0" y={tpTop} width={svgW} height={tpH} fill="rgba(76,175,80,0.10)" />
      <line x1="0" y1={targetY} x2={svgW} y2={targetY}
        stroke="rgba(76,175,80,0.55)" stroke-width="1" stroke-dasharray="4 4" />
    {/if}

    <!-- SL zone: stop → entry (red) -->
    <rect x="0" y={slTop} width={svgW} height={slH} fill="rgba(244,67,54,0.10)" />

    <!-- Stop line -->
    <line x1="0" y1={stopY} x2={svgW} y2={stopY}
      stroke="rgba(244,67,54,0.55)" stroke-width="1" stroke-dasharray="4 4" />

    <!-- Entry line (salmon, more prominent) -->
    <line x1="0" y1={entryY} x2={svgW} y2={entryY}
      stroke="#fa8072" stroke-width="1.5" stroke-dasharray="6 4" />

    <!-- Price tags -->
    {#if targetY != null && zone?.target}
      <g transform="translate({TAG_X},{targetY - TAG_H - 2})">
        <rect x="0" y="0" width={TAG_W} height={TAG_H} rx="2" fill="rgba(76,175,80,0.82)" />
        <text x="4" y="12" fill="white" font-size="10" font-family="'JetBrains Mono',monospace" letter-spacing="0.06em">TARGET</text>
      </g>
    {/if}

    {#if zone?.entry}
      <g transform="translate({TAG_X},{entryY! - TAG_H - 2})">
        <rect x="0" y="0" width={TAG_W} height={TAG_H} rx="2" fill="rgba(250,128,114,0.85)" />
        <text x="4" y="12" fill="white" font-size="10" font-family="'JetBrains Mono',monospace" letter-spacing="0.06em">ENTRY</text>
      </g>
    {/if}

    {#if zone?.stop}
      <g transform="translate({TAG_X},{stopY! + 4})">
        <rect x="0" y="0" width={TAG_W} height={TAG_H} rx="2" fill="rgba(244,67,54,0.82)" />
        <text x="4" y="12" fill="white" font-size="10" font-family="'JetBrains Mono',monospace" letter-spacing="0.06em">STOP</text>
      </g>
    {/if}

  </svg>
{/if}

<style>
.agent-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 2;
}
</style>
