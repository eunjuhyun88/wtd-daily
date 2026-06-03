export type StudioTab = 'discover' | 'prompt';
export type ScanStatus = 'idle' | 'parsing' | 'scanning' | 'done' | 'error';

export interface AutoresearchSignal {
  symbol: string;
  pattern: string;
  timeframe: string;
  sharpe: number | null;
  hit_rate: number | null;
  n_trades: number | null;
  expectancy: number | null;
  max_dd: number | null;
  run_bucket: string;
}

export interface TargetedPatternRow {
  symbol: string;
  pattern: string;
  sharpe: number | null;
  hit_rate: number | null;
  n_trades: number | null;
  expectancy_pct: number | null;
}

export interface TargetedScanResult {
  top_patterns: TargetedPatternRow[];
  symbols_scanned: number;
  elapsed_s: number;
  cache_hit: boolean;
}

let _tab = $state<StudioTab>('discover');
let _scanStatus = $state<ScanStatus>('idle');
let _promptText = $state('');
let _feedSignals = $state<AutoresearchSignal[]>([]);
let _feedLoading = $state(false);
let _parsedDraft = $state<Record<string, unknown> | null>(null);
let _scanResult = $state<TargetedScanResult | null>(null);
let _errorMsg = $state('');

export const studioStore = {
  get tab(): StudioTab { return _tab; },
  get scanStatus(): ScanStatus { return _scanStatus; },
  get promptText(): string { return _promptText; },
  get feedSignals(): AutoresearchSignal[] { return _feedSignals; },
  get feedLoading(): boolean { return _feedLoading; },
  get parsedDraft(): Record<string, unknown> | null { return _parsedDraft; },
  get scanResult(): TargetedScanResult | null { return _scanResult; },
  get errorMsg(): string { return _errorMsg; },
  setTab(t: StudioTab) { _tab = t; },
  setPromptText(v: string) { _promptText = v; },
  setScanStatus(s: ScanStatus) { _scanStatus = s; },
  setFeedSignals(sigs: AutoresearchSignal[]) { _feedSignals = sigs; },
  setFeedLoading(v: boolean) { _feedLoading = v; },
  setParsedDraft(d: Record<string, unknown> | null) { _parsedDraft = d; },
  setScanResult(r: TargetedScanResult | null) { _scanResult = r; },
  setErrorMsg(m: string) { _errorMsg = m; },
  resetScan() {
    _scanStatus = 'idle';
    _parsedDraft = null;
    _scanResult = null;
    _errorMsg = '';
  },
};
