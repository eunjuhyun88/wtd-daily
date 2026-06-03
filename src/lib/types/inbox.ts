// Alert Inbox types — W-0478
// Single source for AlertRow shared between /api/cogochi/alerts proxy and FE inbox.

export interface AlertRow {
  id: string;
  symbol: string;
  timeframe: string;
  blocks_triggered: string[];
  p_win: number | null;
  created_at: string;
  preview: {
    price?: number;
    rsi14?: number;
    funding_rate?: number;
    regime?: string;
    cvd_state?: string;
  };
}

export interface AlertsResponse {
  alerts: AlertRow[];
  total: number;
  scanned_at: string;
}
