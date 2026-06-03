import type { IndicatorKey } from '$lib/stores/chartIndicators';

export type CatalogCategory = 'Overlay' | 'Pane' | 'Volume' | 'Trend' | 'Oscillator' | 'Volatility';

export interface CatalogEntry {
  key: IndicatorKey;
  label: string;
  description: string;
  category: CatalogCategory;
  kind: 'overlay' | 'pane';
}

export const INDICATOR_CATALOG: CatalogEntry[] = [
  { key: 'ema',          label: 'EMA',           description: 'Exponential Moving Average',       category: 'Trend',       kind: 'overlay' },
  { key: 'bb',           label: 'Bollinger Bands',description: 'Volatility bands (20, 2σ)',        category: 'Volatility',  kind: 'overlay' },
  { key: 'vwap',         label: 'VWAP',          description: 'Volume Weighted Average Price',     category: 'Overlay',     kind: 'overlay' },
  { key: 'vwma',         label: 'VWMA',          description: 'Volume Weighted Moving Average',    category: 'Trend',       kind: 'overlay' },
  { key: 'atr_bands',    label: 'ATR Bands',     description: 'ATR-based envelope bands',          category: 'Volatility',  kind: 'overlay' },
  { key: 'volumeProfile',label: 'Volume Profile', description: 'Horizontal volume distribution',   category: 'Volume',      kind: 'overlay' },
  { key: 'comparison',   label: 'BTC Comparison',description: 'BTC/USDT price overlay',            category: 'Overlay',     kind: 'overlay' },
  { key: 'volume',       label: 'Volume',         description: 'Bar volume histogram',              category: 'Volume',      kind: 'pane' },
  { key: 'macd',         label: 'MACD',           description: 'Moving Average Convergence Divergence', category: 'Oscillator', kind: 'pane' },
  { key: 'rsi',          label: 'RSI',            description: 'Relative Strength Index (14)',      category: 'Oscillator',  kind: 'pane' },
  { key: 'oi',           label: 'Open Interest',  description: 'Futures open interest',             category: 'Pane',        kind: 'pane' },
  { key: 'cvd',          label: 'CVD',            description: 'Cumulative Volume Delta',            category: 'Volume',      kind: 'pane' },
  { key: 'funding',      label: 'Funding Rate',   description: 'Perpetual funding rate',             category: 'Pane',        kind: 'pane' },
  { key: 'liq',          label: 'Liquidations',   description: 'Long/short liquidation bars',        category: 'Pane',        kind: 'pane' },
  { key: 'obv',          label: 'OBV',            description: 'On-Balance Volume',                  category: 'Volume',      kind: 'pane' },
];

export const CATALOG_CATEGORIES: CatalogCategory[] = ['Overlay', 'Pane', 'Volume', 'Trend', 'Oscillator', 'Volatility'];
