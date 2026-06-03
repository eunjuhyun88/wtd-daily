/**
 * LiqZonesPrimitive.ts
 *
 * LWC v5 ISeriesPrimitive — Parquet liq_zones 데이터를 차트에
 * 수평 가격 밴드(horizontal box)로 표시. 볼륨 크기에 따라 색상 강도 변화.
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

export interface LiqZone {
  price_low: number;
  price_high: number;
  volume_usd: number;
}

class LiqZonesRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly _zones: LiqZone[],
    private readonly _series: ISeriesApi<SeriesType> | null,
    private readonly _maxVolume: number,
  ) {}

  draw(target: CanvasRenderingTarget2D): void {
    if (!this._series || this._zones.length === 0) return;
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const dpr = scope.verticalPixelRatio;
      const width = scope.bitmapSize.width;

      for (const zone of this._zones) {
        const yTop = this._series!.priceToCoordinate(zone.price_high);
        const yBot = this._series!.priceToCoordinate(zone.price_low);
        if (yTop === null || yBot === null) continue;

        const top = Math.min(yTop, yBot) * dpr;
        const bottom = Math.max(yTop, yBot) * dpr;
        const height = Math.max(1, bottom - top);

        // intensity based on volume (0.05~0.25 opacity)
        const intensity = this._maxVolume > 0 ? Math.min(1, zone.volume_usd / this._maxVolume) : 0.5;
        const alpha = 0.05 + intensity * 0.20;

        ctx.fillStyle = `rgba(239,68,68,${alpha.toFixed(3)})`;
        ctx.fillRect(0, top, width, height);

        // border line at zone center
        ctx.strokeStyle = `rgba(239,68,68,${(alpha * 2.5).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const mid = (top + bottom) / 2;
        ctx.moveTo(0, mid);
        ctx.lineTo(width, mid);
        ctx.stroke();
      }
    });
  }
}

class LiqZonesPaneView implements IPrimitivePaneView {
  constructor(
    private readonly _primitive: LiqZonesPrimitive,
  ) {}
  renderer(): IPrimitivePaneRenderer {
    return new LiqZonesRenderer(
      this._primitive._zones,
      this._primitive._series,
      this._primitive._maxVolume,
    );
  }
  zOrder(): 'bottom' | 'normal' | 'top' { return 'bottom'; }
}

export class LiqZonesPrimitive implements ISeriesPrimitive<Time> {
  _zones: LiqZone[] = [];
  _series: ISeriesApi<SeriesType> | null = null;
  _maxVolume = 0;
  private _paneView = new LiqZonesPaneView(this);
  private _requestUpdate: () => void = () => {};

  attached(param: SeriesAttachedParameter<Time>): void {
    this._series = param.series as unknown as ISeriesApi<SeriesType>;
    this._requestUpdate = param.requestUpdate;
  }
  detached(): void {
    this._series = null;
  }
  paneViews(): IPrimitivePaneView[] { return [this._paneView]; }

  setZones(raw: Array<Record<string, unknown>>): void {
    this._zones = raw
      .map((r): LiqZone | null => {
        const lo = Number(r['price_low'] ?? r['low'] ?? r['bottom'] ?? NaN);
        const hi = Number(r['price_high'] ?? r['high'] ?? r['top'] ?? NaN);
        const vol = Number(r['volume_usd'] ?? r['volume'] ?? r['liq_volume'] ?? 0);
        if (!isFinite(lo) || !isFinite(hi)) return null;
        return { price_low: Math.min(lo, hi), price_high: Math.max(lo, hi), volume_usd: vol };
      })
      .filter((z): z is LiqZone => z !== null);
    this._maxVolume = this._zones.reduce((m, z) => Math.max(m, z.volume_usd), 0);
    this._requestUpdate();
  }
}
