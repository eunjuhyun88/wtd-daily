/**
 * SmcOverlayPrimitive.ts
 *
 * LWC v5 ISeriesPrimitive rendering SMC event boxes (FVG / OB) as horizontal
 * price-level bands across the chart pane.
 *
 * Usage:
 *   const prim = new SmcOverlayPrimitive();
 *   series.attachPrimitive(prim);
 *   prim.setEvents([{ event_type: 'FVG', top: 67500, bottom: 67450, invalidated: false }]);
 *   series.detachPrimitive(prim);
 */

import type {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  ISeriesApi,
  SeriesType,
  Time,
} from 'lightweight-charts';
import type { CanvasRenderingTarget2D } from 'fancy-canvas';

export interface SmcEvent {
  event_type: 'FVG' | 'BoS' | 'CHoCH' | 'OB' | string;
  top: number;
  bottom: number;
  invalidated?: boolean;
}

const EVENT_COLORS: Record<string, { fill: string; border: string; label: string }> = {
  FVG: { fill: 'rgba(99,179,237,0.12)', border: 'rgba(99,179,237,0.55)', label: 'FVG' },
  OB:  { fill: 'rgba(246,173,85,0.12)', border: 'rgba(246,173,85,0.55)', label: 'OB' },
  BoS: { fill: 'rgba(104,211,145,0.12)', border: 'rgba(104,211,145,0.55)', label: 'BoS' },
  CHoCH: { fill: 'rgba(252,129,74,0.12)', border: 'rgba(252,129,74,0.55)', label: 'CHoCH' },
};
const DEFAULT_COLOR = { fill: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.45)', label: '?' };

class SmcRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly _events: SmcEvent[],
    private readonly _series: ISeriesApi<SeriesType> | null,
  ) {}

  draw(target: CanvasRenderingTarget2D): void {
    if (!this._series || this._events.length === 0) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const dpr = scope.verticalPixelRatio;
      const hdpr = scope.horizontalPixelRatio;
      const width = scope.bitmapSize.width;

      for (const ev of this._events) {
        const yTop = this._series!.priceToCoordinate(ev.top);
        const yBot = this._series!.priceToCoordinate(ev.bottom);
        if (yTop === null || yBot === null) continue;

        const top    = Math.min(yTop, yBot) * dpr;
        const bottom = Math.max(yTop, yBot) * dpr;
        const height = bottom - top;
        if (height < 1) continue;

        const colors = EVENT_COLORS[ev.event_type] ?? DEFAULT_COLOR;

        ctx.save();
        ctx.fillStyle = colors.fill;
        ctx.fillRect(0, top, width, height);

        ctx.strokeStyle = colors.border;
        ctx.lineWidth = Math.max(1, 0.5 * dpr);
        ctx.strokeRect(0.5, top + 0.5, width - 1, height - 1);

        // Label on right edge
        const label = colors.label;
        ctx.font = `${9 * dpr}px ui-monospace, "JetBrains Mono", monospace`;
        const metrics = ctx.measureText(label);
        const padX = 4 * hdpr;
        const labelW = metrics.width + padX * 2;
        const labelH = 11 * dpr;
        const labelX = width - labelW - 6 * hdpr;
        const labelY = top + (height - labelH) / 2;

        ctx.fillStyle = colors.border;
        ctx.fillRect(labelX, labelY, labelW, labelH);

        ctx.fillStyle = 'rgba(255,255,255,0.90)';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, labelX + padX, labelY + labelH / 2);

        ctx.restore();
      }
    });
  }
}

class SmcPaneView implements IPrimitivePaneView {
  private _events: SmcEvent[] = [];
  private _series: ISeriesApi<SeriesType> | null = null;

  zOrder() { return 'bottom' as const; }

  renderer(): IPrimitivePaneRenderer | null {
    if (this._events.length === 0) return null;
    return new SmcRenderer(this._events, this._series);
  }

  update(events: SmcEvent[], series: ISeriesApi<SeriesType> | null): void {
    this._events = events;
    this._series = series;
  }
}

export class SmcOverlayPrimitive implements ISeriesPrimitive<Time> {
  private _events: SmcEvent[] = [];
  private _series: ISeriesApi<SeriesType> | null = null;
  private _requestUpdate: (() => void) | null = null;
  private _paneView = new SmcPaneView();

  attached(param: SeriesAttachedParameter<Time>): void {
    this._series = param.series as ISeriesApi<SeriesType>;
    this._requestUpdate = param.requestUpdate;
    this._paneView.update(this._events, this._series);
  }

  detached(): void {
    this._series = null;
    this._requestUpdate = null;
  }

  setEvents(events: SmcEvent[]): void {
    this._events = events.filter((e) => !e.invalidated);
    this._paneView.update(this._events, this._series);
    this._requestUpdate?.();
  }

  paneViews(): readonly IPrimitivePaneView[] {
    return [this._paneView];
  }
}
