import { describe, expect, it } from 'vitest';

import { buildResearchSummary } from './researchSummary';

describe('buildResearchSummary', () => {
	it('ranks merged discovery payloads into top 3 candidates', () => {
		const items = buildResearchSummary([
			{
				tool: 'screener',
				data: {
					results: [
						{ symbol: 'DOGSUSDT', setup: 'market squeeze', grade: 'A', direction: 'LONG' },
						{ symbol: 'PARTIUSDT', setup: 'range recovery', grade: 'B', direction: 'LONG' }
					]
				}
			},
			{
				tool: 'alpha_scan',
				data: {
					results: [
						{
							symbol: 'DOGSUSDT',
							setup: 'alpha composite',
							reason: 'top alpha score',
							action: 'watch reclaim/confirmation',
							alpha: 92
						},
						{
							symbol: 'USELESSUSDT',
							setup: 'alpha composite',
							reason: 'secondary alpha',
							action: 'wait',
							alpha: 84
						}
					]
				}
			},
			{
				tool: 'scan',
				data: {
					results: [
						{
							symbol: 'DOGSUSDT',
							setup: 'oi reversal · phase_d',
							reason: 'entry candidate',
							action: 'watch reclaim/confirmation',
							ranking_score: 0.9
						},
						{
							symbol: 'PARTIUSDT',
							setup: 'wyckoff spring · phase_c',
							reason: 'watch phase',
							action: 'watchlist only',
							ranking_score: 0.6
						}
					]
				}
			}
		]);

		expect(items).toHaveLength(3);
		expect(items[0]?.symbol).toBe('DOGSUSDT');
		expect(items[0]?.rank).toBe(1);
		expect(items[0]?.sources).toEqual(['screener', 'alpha_scan', 'scan']);
		expect(items[1]?.symbol).toBe('PARTIUSDT');
		expect(items[2]?.symbol).toBe('USELESSUSDT');
	});
});
