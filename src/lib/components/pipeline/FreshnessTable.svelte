<script lang="ts">
	type FreshnessRow = {
		kind: string;
		symbol: string;
		timeframe: string;
		rows: number;
		gap_count: number;
		gap_pct: number;
		age_hours: number;
		first_ts: string;
		last_ts: string;
	};

	let { rows }: { rows: FreshnessRow[] } = $props();
	let showAll = $state(false);
	const MAX_ROWS = 20;

	const sorted = $derived([...rows].sort((a, b) => b.age_hours - a.age_hours));
	const displayed = $derived(showAll ? sorted : sorted.slice(0, MAX_ROWS));

	function ageColor(h: number): string {
		if (h < 2) return '#22c55e';
		if (h < 6) return '#f59e0b';
		return '#ef4444';
	}
</script>

<div class="freshness-wrap">
	<table class="freshness-table">
		<thead>
			<tr>
				<th>심볼</th>
				<th>TF</th>
				<th>행수</th>
				<th>갭</th>
				<th>경과</th>
			</tr>
		</thead>
		<tbody>
			{#each displayed as row (`${row.symbol}-${row.timeframe}-${row.kind}`)}
				<tr class={row.gap_pct > 5 ? 'gap-warn' : row.gap_pct > 0 ? 'gap-minor' : ''}>
					<td>{row.symbol}</td>
					<td><span class="tf-badge">{row.timeframe}</span></td>
					<td>{row.rows.toLocaleString()}</td>
					<td style={row.gap_count > 0 ? 'color:#ef4444' : 'color:#64748b'}>
						{row.gap_count > 0 ? row.gap_count : '—'}
					</td>
					<td style="color:{ageColor(row.age_hours)}">
						{row.age_hours < 1
							? `${(row.age_hours * 60).toFixed(0)}m↑`
							: `${row.age_hours.toFixed(1)}h↑`}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	{#if sorted.length > MAX_ROWS && !showAll}
		<button class="show-more" onclick={() => (showAll = true)}>
			더 보기 ({sorted.length - MAX_ROWS}개)
		</button>
	{/if}
</div>

<style>
	.freshness-wrap {
		overflow-x: auto;
	}
	.freshness-table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--ui-text-xs, 11px);
	}
	th,
	td {
		padding: 4px 8px;
		text-align: left;
		border-bottom: 1px solid #1e293b;
		color: #cbd5e1;
	}
	th {
		color: #94a3b8;
		font-weight: 600;
	}
	tr.gap-warn {
		background: #2a1a0d;
	}
	tr.gap-minor {
		background: #1e1a0a;
	}
	.tf-badge {
		background: #1e293b;
		padding: 1px 6px;
		border-radius: 3px;
		font-size: var(--ui-text-xs, 11px);
	}
	.show-more {
		margin-top: 8px;
		padding: 4px 12px;
		font-size: var(--ui-text-xs, 11px);
		background: #1e293b;
		border: 1px solid #334155;
		border-radius: 4px;
		color: #94a3b8;
		cursor: pointer;
	}
</style>
