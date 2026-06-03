<script lang="ts">
  import type { ScanStatus, TargetedScanResult, TargetedPatternRow } from './studioStore.svelte';
  import { studioStore } from './studioStore.svelte';

  interface Props {
    scanStatus: ScanStatus;
    scanResult: TargetedScanResult | null;
  }
  const { scanStatus, scanResult }: Props = $props();

  let saveStatus = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
  let saveFeedback = $state('');

  async function saveDraftAsPattern() {
    const draft = studioStore.parsedDraft;
    if (!draft) return;
    saveStatus = 'saving';
    saveFeedback = '';
    try {
      const phases = (draft.phases as Array<Record<string, unknown>>) ?? [];
      const slug = `user-${Date.now()}`;
      const firstPhaseId = (phases[0]?.phase_id as string) ?? 'PHASE_0';
      const lastPhaseId = (phases[phases.length - 1]?.phase_id as string) ?? firstPhaseId;
      const body = {
        slug,
        name: (draft.pattern_label as string) || (draft.pattern_family as string) || slug,
        description: (draft.source_text as string) || '',
        phases: phases.map((ph, i) => ({
          phase_id: (ph.phase_id as string) ?? `PHASE_${i}`,
          label: (ph.label as string) ?? `Phase ${i}`,
          required_blocks: (ph.required_blocks as string[]) ?? [],
          optional_blocks: (ph.optional_blocks as string[]) ?? [],
          disqualifier_blocks: (ph.disqualifier_blocks as string[]) ?? [],
          min_bars: (ph.min_bars as number) ?? 1,
          max_bars: (ph.max_bars as number) ?? 48,
          timeframe: (ph.timeframe as string) ?? draft.timeframe ?? '1h',
        })),
        entry_phase: firstPhaseId,
        target_phase: lastPhaseId,
        timeframe: (draft.timeframe as string) ?? '1h',
        tags: (draft.symbol_candidates as string[]) ?? [],
      };
      const res = await fetch('/api/engine/patterns/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(String((err as { detail?: string }).detail ?? res.statusText));
      }
      saveStatus = 'saved';
      saveFeedback = `저장됨: ${slug}`;
    } catch (err) {
      saveStatus = 'error';
      saveFeedback = err instanceof Error ? err.message : '저장 실패';
    }
  }
</script>

<div class="stage-wrap">
  {#if scanStatus === 'idle'}
    <div class="stage-idle">
      <span class="idle-icon">◎</span>
      <span class="idle-text">왼쪽에 아이디어를 입력하면<br />백테스트 결과가 여기에 표시됩니다</span>
    </div>

  {:else if scanStatus === 'parsing' || scanStatus === 'scanning'}
    <div class="stage-loading">
      <div class="skeleton-chart"></div>
      <div class="skeleton-rows">
        <div class="skel-row"></div>
        <div class="skel-row skel-sm"></div>
        <div class="skel-row skel-sm"></div>
      </div>
      <div class="loading-label">
        {scanStatus === 'parsing' ? '패턴 구조 분석 중…' : '심볼 스캔 중…'}
      </div>
    </div>

  {:else if scanStatus === 'done' && scanResult}
    <div class="stage-result">
      <div class="result-header">
        <span class="result-title">스캔 결과</span>
        <span class="result-meta">
          {scanResult.symbols_scanned}개 심볼 · {scanResult.elapsed_s}s
          {#if scanResult.cache_hit}<span class="cache-badge">캐시</span>{/if}
        </span>
      </div>

      {#if scanResult.top_patterns.length === 0}
        <div class="no-results">이 심볼/조건에서 유효한 패턴을 찾지 못했습니다.</div>
      {:else}
        <div class="pattern-list">
          {#each scanResult.top_patterns as row (row.symbol + row.pattern)}
            <div class="pattern-row">
              <div class="pr-left">
                <span class="pr-sym">{row.symbol}</span>
                <span class="pr-name">{row.pattern}</span>
              </div>
              <div class="pr-stats">
                {#if row.sharpe != null}
                  <span class="pr-stat">
                    <span class="ps-lbl">Sharpe</span>
                    <span class="ps-val sharpe-val">{row.sharpe.toFixed(2)}</span>
                  </span>
                {/if}
                {#if row.hit_rate != null}
                  <span class="pr-stat">
                    <span class="ps-lbl">WR</span>
                    <span class="ps-val" class:wr-hi={row.hit_rate >= 0.55}>{(row.hit_rate * 100).toFixed(0)}%</span>
                  </span>
                {/if}
                {#if row.n_trades != null}
                  <span class="pr-stat">
                    <span class="ps-lbl">n</span>
                    <span class="ps-val">{row.n_trades}</span>
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if studioStore.parsedDraft}
        <div class="save-section">
          <button
            class="save-btn"
            class:save-btn-saved={saveStatus === 'saved'}
            class:save-btn-error={saveStatus === 'error'}
            type="button"
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            onclick={saveDraftAsPattern}
          >
            {#if saveStatus === 'saving'}저장 중…
            {:else if saveStatus === 'saved'}저장됨 ✓
            {:else if saveStatus === 'error'}재시도
            {:else}이 패턴 Signal Board에 저장
            {/if}
          </button>
          {#if saveFeedback}
            <span class="save-feedback" class:feedback-err={saveStatus === 'error'}>{saveFeedback}</span>
          {/if}
        </div>
      {/if}
    </div>

  {:else if scanStatus === 'done' && !scanResult}
    <div class="stage-idle">
      <span class="idle-text">결과 없음</span>
    </div>

  {:else if scanStatus === 'error'}
    <div class="stage-error">
      {studioStore.errorMsg || '스캔 중 오류가 발생했습니다. 다시 시도해주세요.'}
    </div>
  {/if}
</div>

<style>
  .stage-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 20px;
    overflow-y: auto;
  }

  .stage-idle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 14px;
    text-align: center;
  }

  .idle-icon {
    font-size: 28px;
    color: rgba(250, 247, 235, 0.1);
  }

  .idle-text {
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.2);
    line-height: 1.7;
  }

  .stage-loading {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .skeleton-chart {
    height: 200px;
    border-radius: 6px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-rows { display: flex; flex-direction: column; gap: 8px; }

  .skel-row {
    height: 36px;
    border-radius: 4px;
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  .skel-sm { height: 28px; opacity: 0.7; }

  .loading-label {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.3);
    text-align: center;
    margin-top: 4px;
  }

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .stage-result {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .result-header {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }

  .result-title {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: rgba(250, 247, 235, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .result-meta {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.2);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cache-badge {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    background: rgba(250, 204, 21, 0.12);
    border: 1px solid rgba(250, 204, 21, 0.25);
    color: #facc15;
    border-radius: 3px;
    padding: 1px 5px;
  }

  .no-results {
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.25);
    padding: 24px 0;
    text-align: center;
  }

  .pattern-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pattern-row {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 5px;
    padding: 12px 14px;
  }

  .pr-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .pr-sym {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: #60a5fa;
    background: rgba(96, 165, 250, 0.1);
    border: 1px solid rgba(96, 165, 250, 0.2);
    border-radius: 3px;
    padding: 2px 6px;
    flex-shrink: 0;
  }

  .pr-name {
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.75);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pr-stats {
    display: flex;
    gap: 14px;
    flex-shrink: 0;
  }

  .pr-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .ps-lbl {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .ps-val {
    font-size: 13px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    color: rgba(250, 247, 235, 0.7);
  }

  .sharpe-val { color: #fbbf24; }
  .wr-hi { color: #4ade80; }

  .save-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }

  .save-btn {
    padding: 11px 0;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    font-weight: 700;
    background: rgba(109, 214, 168, 0.1);
    border: 1px solid rgba(109, 214, 168, 0.3);
    border-radius: 5px;
    color: #6dd6a8;
    cursor: pointer;
    transition: background 0.12s;
    letter-spacing: 0.03em;
  }
  .save-btn:hover:not(:disabled) { background: rgba(109, 214, 168, 0.18); }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .save-btn-saved { border-color: rgba(74, 222, 128, 0.4); color: #4ade80; }
  .save-btn-error { border-color: rgba(248, 113, 113, 0.4); color: #f87171; }

  .save-feedback {
    font-size: 11px;
    font-family: var(--sc-font-mono, monospace);
    color: rgba(74, 222, 128, 0.7);
  }
  .feedback-err { color: rgba(248, 113, 113, 0.7); }

  .stage-error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    font-size: 12px;
    font-family: var(--sc-font-mono, monospace);
    color: #f87171;
    text-align: center;
    padding: 20px;
  }
</style>
