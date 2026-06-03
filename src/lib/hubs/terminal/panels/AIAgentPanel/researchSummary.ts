export interface DiscoveryPayload {
	tool: string;
	data: Record<string, unknown>;
}

export interface ResearchSummaryItem {
	symbol: string;
	rank: 1 | 2 | 3;
	setup: string;
	action: string;
	sources: string[];
	score: number;
	reason: string;
}

const TOOL_WEIGHT: Record<string, number> = { scan: 1, alpha_scan: 1.2, screener: 1.4 };
const ACTION_WEIGHT: Record<string, number> = {
	'watch reclaim/confirmation': 3,
	'promote to front watchlist': 3,
	'watch for trigger': 2,
	'watchlist only': 2,
	wait: 1
};

export function buildResearchSummary(payloads: DiscoveryPayload[]): ResearchSummaryItem[] {
	const aggregate = new Map<
		string,
		{
			score: number;
			setups: Set<string>;
			reasons: Set<string>;
			actions: Set<string>;
			sources: Set<string>;
		}
	>();

	for (const payload of payloads) {
		const results = Array.isArray(payload.data.results)
			? (payload.data.results as Array<Record<string, unknown>>)
			: [];
		for (const result of results) {
			const symbol = String(result.symbol ?? result.ticker ?? '').trim();
			if (!symbol) continue;
			const item = aggregate.get(symbol) ?? {
				score: 0,
				setups: new Set<string>(),
				reasons: new Set<string>(),
				actions: new Set<string>(),
				sources: new Set<string>()
			};
			item.score += TOOL_WEIGHT[payload.tool] ?? 1;
			const alpha =
				typeof result.alpha === 'number'
					? result.alpha
					: typeof result.alpha_score === 'number'
						? result.alpha_score
						: null;
			if (typeof alpha === 'number') item.score += alpha / 100;
			const ranking = typeof result.ranking_score === 'number' ? result.ranking_score : null;
			if (typeof ranking === 'number') item.score += ranking;
			const setup = String(result.setup ?? result.pattern_slug ?? result.phase ?? 'setup');
			const reason = String(result.reason ?? result.grade ?? result.verdict ?? 'filter surfaced');
			const action = String(result.action ?? result.direction ?? 'wait');
			item.setups.add(setup);
			item.reasons.add(reason);
			item.actions.add(action);
			item.sources.add(payload.tool);
			item.score += ACTION_WEIGHT[action] ?? 0;
			aggregate.set(symbol, item);
		}
	}

	return [...aggregate.entries()]
		.sort((a, b) => b[1].score - a[1].score || a[0].localeCompare(b[0]))
		.slice(0, 3)
		.map(([symbol, item], idx) => ({
			symbol,
			rank: (idx + 1) as 1 | 2 | 3,
			setup: [...item.setups][0] ?? 'setup',
			action:
				[...item.actions].sort((a, b) => (ACTION_WEIGHT[b] ?? 0) - (ACTION_WEIGHT[a] ?? 0))[0] ??
				'wait',
			sources: [...item.sources],
			score: item.score,
			reason: [...item.reasons].slice(0, 2).join(' / ')
		}));
}
