export interface ParamOption {
  value: number | boolean;
  label: string;
}

export interface ParamSuggestion {
  paramKey: string;
  label: string;
  default: number | boolean;
  recommended: number | boolean;
  options: ParamOption[];
  reason?: string;
}

export function buildDefaultSuggestions(winRate: number | null): ParamSuggestion[] {
  const lowWinRate = winRate !== null && winRate < 0.5;

  return [
    {
      paramKey: 'rsiLength',
      label: 'RSI 기간 (민감도)',
      default: 14,
      recommended: lowWinRate ? 10 : 14,
      options: [
        { value: 10, label: '10 — 빠른 반응' },
        { value: 14, label: '14 — 기본값 (표준)' },
        { value: 21, label: '21 — 느린 반응, 노이즈 감소' },
      ],
      reason: lowWinRate ? 'win_rate < 50% → RSI 기간 단축으로 진입 타이밍 개선' : undefined,
    },
    {
      paramKey: 'oversold',
      label: 'RSI 과매도 기준 (%)',
      default: 30,
      recommended: lowWinRate ? 25 : 30,
      options: [
        { value: 25, label: '25 — 극단적 과매도만' },
        { value: 30, label: '30 — 표준 (기본값)' },
        { value: 35, label: '35 — 넓은 진입 조건' },
      ],
      reason: lowWinRate ? 'win_rate < 50% → 더 강한 과매도 신호만 필터링' : undefined,
    },
    {
      paramKey: 'slPct',
      label: 'Stop Loss (%)',
      default: 3,
      recommended: lowWinRate ? 2 : 3,
      options: [
        { value: 1.5, label: '1.5% — 타이트 (손실 최소화)' },
        { value: 2, label: '2% — 보수적' },
        { value: 3, label: '3% — 기본값' },
        { value: 5, label: '5% — 넓은 SL' },
      ],
      reason: lowWinRate ? 'win_rate < 50% → SL 타이트하게 조여 손실 제한' : undefined,
    },
    {
      paramKey: 'tpPct',
      label: 'Take Profit (%)',
      default: 6,
      recommended: lowWinRate ? 4 : 6,
      options: [
        { value: 3, label: '3% — 빠른 익절' },
        { value: 4, label: '4% — 보수적 익절' },
        { value: 6, label: '6% — 기본값' },
        { value: 10, label: '10% — 홀드형' },
      ],
    },
  ];
}
