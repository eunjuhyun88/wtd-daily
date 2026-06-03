<script lang="ts">
	type JobStatus = {
		last_ok_ago_s: number | null;
		fail_count: number;
		last_result: string | null;
		lock_held: boolean;
		circuit_open: boolean;
	};

	let {
		jobKey,
		status,
		onTriggered,
	}: {
		jobKey: string;
		status: JobStatus;
		onTriggered?: () => void;
	} = $props();

	const jobState = $derived.by((): 'ok' | 'error' | 'running' | 'circuit' | 'unknown' => {
		if (status.circuit_open) return 'circuit';
		if (status.lock_held) return 'running';
		if (!status.last_result) return 'unknown';
		if (status.last_result.startsWith('ok')) return 'ok';
		if (status.last_result.startsWith('error')) return 'error';
		return 'unknown';
	});

	const elapsedLabel = $derived.by((): string | null => {
		const s = status.last_ok_ago_s;
		if (s == null) return null;
		if (s < 60) return `${s.toFixed(0)}초 전`;
		if (s < 3600) return `${(s / 60).toFixed(0)}분 전`;
		return `${(s / 3600).toFixed(1)}h 전`;
	});

	const durationLabel = $derived.by((): string | null => {
		const m = status.last_result?.match(/^ok:(\d+\.?\d*)/);
		return m ? `${parseFloat(m[1]).toFixed(2)}s` : null;
	});

	let triggering = $state(false);

	async function trigger() {
		const ok = confirm(`${jobKey} 를 지금 실행하시겠습니까?`);
		if (!ok) return;
		triggering = true;
		try {
			const res = await fetch(`/api/jobs/${jobKey}/run`, { method: 'POST' });
			const data = (await res.json()) as {
				status?: string;
				elapsed_s?: number;
				reason?: string;
				error?: string;
			};
			if (data.status === 'ok') {
				alert(`✅ ${jobKey} 완료 (${data.elapsed_s?.toFixed(2) ?? '?'}s)`);
			} else if (data.status === 'skipped') {
				alert(`⏭ 건너뜀: ${data.reason ?? ''}`);
			} else {
				alert(`❌ ${jobKey} 실패: ${data.error ?? res.status}`);
			}
		} catch {
			alert('❌ 요청 실패');
		} finally {
			triggering = false;
			onTriggered?.();
		}
	}
</script>

<div class="job-card state-{jobState}">
	<div class="job-header">
		<span class="job-key">{jobKey}</span>
		<span class="job-icon">
			{#if jobState === 'ok'}✅
			{:else if jobState === 'error'}❌
			{:else if jobState === 'running' || triggering}🔄
			{:else if jobState === 'circuit'}⏸
			{:else}⬜{/if}
		</span>
	</div>
	{#if elapsedLabel}
		<div class="job-meta">마지막 성공: {elapsedLabel}</div>
	{/if}
	{#if durationLabel}
		<div class="job-meta">소요: {durationLabel}</div>
	{/if}
	<button class="trigger-btn" onclick={trigger} disabled={triggering}>▶ 실행</button>
</div>

<style>
	.job-card {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 12px;
		border-radius: 6px;
		border: 1px solid #334155;
		background: #0f172a;
		min-width: 160px;
	}
	.job-card.state-ok {
		border-color: #22c55e;
		background: #0d2a1a;
	}
	.job-card.state-error {
		border-color: #ef4444;
		background: #2a0d0d;
	}
	.job-card.state-running {
		border-color: #3b82f6;
		background: #0d1a2a;
	}
	.job-card.state-circuit {
		border-color: #f59e0b;
		background: #2a1d0d;
	}
	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.job-key {
		font-size: var(--ui-text-xs, 11px);
		font-weight: 600;
		color: #e2e8f0;
	}
	.job-icon {
		font-size: 14px;
	}
	.job-meta {
		font-size: var(--ui-text-xs, 11px);
		color: #94a3b8;
	}
	.trigger-btn {
		margin-top: 4px;
		padding: 2px 8px;
		font-size: var(--ui-text-xs, 11px);
		background: #1e293b;
		border: 1px solid #475569;
		border-radius: 4px;
		color: #e2e8f0;
		cursor: pointer;
	}
	.trigger-btn:hover:not(:disabled) {
		background: #334155;
	}
	.trigger-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
