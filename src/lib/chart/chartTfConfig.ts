export const TF_BAR_SPACING: Record<string, number> = {
	'1m':  3,
	'3m':  4,
	'5m':  5,
	'15m': 6,
	'30m': 8,
	'1h':  8,
	'2h':  10,
	'4h':  12,
	'6h':  14,
	'12h': 16,
	'1d':  18,
	'1w':  24,
};

export const TF_MIN_BAR_SPACING: Record<string, number> = {
	'1m':  1,
	'3m':  1,
	'5m':  2,
	'15m': 3,
	'30m': 4,
	'1h':  4,
	'2h':  6,
	'4h':  8,
	'6h':  10,
	'12h': 12,
	'1d':  14,
	'1w':  18,
};

/** Clamp user-supplied barSpacing to the valid range for a given TF. */
export function clampBarSpacing(spacing: number, tf: string): number {
	const min = TF_MIN_BAR_SPACING[tf] ?? 1;
	const nominal = TF_BAR_SPACING[tf] ?? 8;
	return Math.min(Math.max(spacing, min), nominal * 4);
}
