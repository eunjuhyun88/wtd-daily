/**
 * useChartRender — shared chart lifecycle utilities.
 *
 * Provides the base chart configuration theme and a ResizeObserver helper
 * that cleans up automatically when the returned dispose() is called.
 * ChartBoard owns the actual render/destroy logic; this module keeps the
 * cross-cutting pieces (theme, resize wiring) testable in isolation.
 */

export const BASE_CHART_THEME = {
  layout: {
    background: { color: 'transparent' },
    textColor: 'rgba(247, 242, 234, 0.52)',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
  },
  grid: {
    vertLines: { color: 'rgba(219, 154, 159, 0.05)' },
    horzLines: { color: 'rgba(219, 154, 159, 0.05)' },
  },
  crosshair: {
    mode: 0,
    vertLine: { color: 'rgba(219, 154, 159, 0.2)', width: 1, style: 2 },
    horzLine: { color: 'rgba(219, 154, 159, 0.2)', width: 1, style: 2 },
  },
  timeScale: {
    borderColor: 'rgba(219, 154, 159, 0.12)',
    timeVisible: true,
    secondsVisible: false,
  },
  rightPriceScale: {
    borderColor: 'rgba(219, 154, 159, 0.12)',
    scaleMargins: { top: 0.08, bottom: 0.2 },
  },
} as const;

export const CANDLE_SERIES_OPTIONS = {
  upColor: '#adca7c',
  downColor: '#cf7f8f',
  borderUpColor: '#adca7c',
  borderDownColor: '#cf7f8f',
  wickUpColor: 'rgba(173, 202, 124, 0.6)',
  wickDownColor: 'rgba(207, 127, 143, 0.6)',
} as const;

export const VOLUME_SERIES_OPTIONS = {
  priceFormat: { type: 'volume' as const },
  priceScaleId: 'volume',
};

export const VOLUME_SCALE_OPTIONS = {
  scaleMargins: { top: 0.82, bottom: 0 },
};

/**
 * Observes `el` for size changes and calls `onResize` on each change.
 * Returns a dispose function that disconnects the observer.
 */
export function observeResize(el: Element, onResize: () => void): () => void {
  const ro = new ResizeObserver(onResize);
  ro.observe(el);
  return () => ro.disconnect();
}
