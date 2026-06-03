<script lang="ts">
  import type { PatternStats } from '$lib/types/patternStats';

  interface Props {
    slug: string;
    stats: PatternStats | null;
  }

  const { slug, stats }: Props = $props();

  type ModelStatus = 'untrained' | 'trainable' | 'trained' | 'promoted';

  interface HistoryEntry {
    version?: string | null;
    auc_roc?: number | null;
    record_type?: string | null;
    recorded_at?: string | null;
  }

  let activeModel = $state<unknown>(null);
  let registryLoaded = $state(false);
  let training = $state(false);
  let toast = $state<string | null>(null);
  let modelHistory = $state<HistoryEntry[]>([]);

  const modelStatus = $derived<ModelStatus>(deriveModelStatus(stats, activeModel, registryLoaded));

  $effect(() => {
    void loadRegistry();
    void loadHistory();
  });

  async function loadRegistry() {
    try {
      const res = await fetch(`/api/patterns/${slug}/model-registry`);
      if (res.ok) {
        const data = await res.json();
        activeModel = data.active_model ?? null;
      }
    } catch {
      // keep null
    } finally {
      registryLoaded = true;
    }
  }

  function deriveModelStatus(s: PatternStats | null, active: unknown, loaded: boolean): ModelStatus {
    if (!loaded) return 'untrained';
    if (active) return 'promoted';
    const ms = s?.ml_shadow;
    if (!ms?.ready_to_train) return 'untrained';
    if (!ms.last_model_version) return 'trainable';
    return 'trained';
  }

  async function startTraining() {
    training = true;
    toast = null;
    try {
      const res = await fetch(`/api/patterns/${slug}/train-model`, {
        method: 'POST',
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) {
        await loadRegistry();
        showToast('학습 완료');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast((err as { error?: string }).error ?? '학습 실패');
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'TimeoutError') {
        showToast('학습 시간 초과 — 재시도');
      } else {
        showToast('학습 실패');
      }
    } finally {
      training = false;
    }
  }

  async function promoteModel() {
    if (!confirm('Layer C 모델을 배포하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/patterns/${slug}/promote-model`, {
        method: 'POST',
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        activeModel = true;
        showToast('배포 완료');
      } else {
        showToast('배포 실패');
      }
    } catch {
      showToast('배포 실패');
    }
  }

  async function loadHistory() {
    try {
      const res = await fetch(`/api/patterns/${slug}/model-history?limit=5`);
      if (res.ok) {
        const data = await res.json();
        modelHistory = (data.history ?? []) as HistoryEntry[];
      }
    } catch { /* optional */ }
  }

  function showToast(msg: string) {
    toast = msg;
    setTimeout(() => { toast = null; }, 3000);
  }

  const statusLabel: Record<ModelStatus, string> = {
    untrained: '학습 불가 (verdict < 50)',
    trainable: '학습 가능',
    trained: '학습됨 — 미배포',
    promoted: '프로덕션 배포됨',
  };

  const verdictCount = $derived(stats?.ml_shadow?.training_usable_count ?? 0);
</script>

<div class="model-card">
  <div class="header">
    <span class="star">★</span>
    <span class="title">Model Management</span>
    {#if toast}
      <span class="toast" class:err={toast.includes('실패') || toast.includes('초과')}>{toast}</span>
    {/if}
  </div>

  <div class="status-row">
    <span class="status-key">상태</span>
    <span class="status-val" class:ok={modelStatus === 'promoted' || modelStatus === 'trainable' || modelStatus === 'trained'}>
      {statusLabel[modelStatus]}
    </span>
    <span class="verdict-badge">verdict {verdictCount}개</span>
  </div>

  <div class="actions">
    {#if modelStatus === 'trainable' || modelStatus === 'trained'}
      <button
        class="action-btn"
        disabled={modelStatus !== 'trainable' || training}
        onclick={startTraining}
      >
        {#if training}
          <span class="spinner">◌</span> 학습 중…
        {:else}
          학습 시작 ▷
        {/if}
      </button>
    {/if}

    {#if modelStatus === 'trained'}
      <button class="action-btn secondary" onclick={promoteModel}>
        프로덕션 배포 ↑
      </button>
    {/if}

    {#if modelStatus === 'promoted'}
      <span class="promoted-badge">✓ 배포 완료</span>
    {/if}

    {#if modelStatus === 'untrained'}
      <span class="hint">verdict 50개 이상 필요</span>
    {/if}
  </div>

  {#if modelHistory.length > 0}
    <div class="history">
      <div class="history-header">MODEL HISTORY</div>
      {#each modelHistory.slice(0, 3) as h}
        <div class="history-row">
          <span class="h-ver">{h.version ?? '—'}</span>
          <span class="h-type">{h.record_type ?? ''}</span>
          <span class="h-auc">{h.auc_roc != null ? `AUC ${h.auc_roc.toFixed(3)}` : '—'}</span>
          <span class="h-date">{h.recorded_at ? new Date(h.recorded_at).toLocaleDateString('ko-KR') : '—'}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .model-card {
    font-family: 'JetBrains Mono', monospace;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 20px 24px;
    background: rgba(255, 255, 255, 0.02);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .star { color: #facc15; font-size: 14px; }

  .title {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: rgba(250, 247, 235, 0.85);
    flex: 1;
  }

  .toast {
    font-size: 11px;
    color: #4ade80;
    letter-spacing: 0.04em;
  }

  .toast.err { color: #f87171; }

  .status-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    font-size: 12px;
  }

  .status-key {
    color: rgba(250, 247, 235, 0.35);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 11px;
  }

  .status-val {
    color: rgba(250, 247, 235, 0.55);
    font-weight: 500;
  }

  .status-val.ok { color: #4ade80; }

  .verdict-badge {
    margin-left: auto;
    font-size: 11px;
    color: rgba(250, 247, 235, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    padding: 2px 8px;
  }

  .actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 8px 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    border: 1px solid rgba(74, 222, 128, 0.4);
    border-radius: 4px;
    background: rgba(74, 222, 128, 0.08);
    color: #4ade80;
    cursor: pointer;
    transition: background 120ms ease, border-color 120ms ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.6);
  }

  .action-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .action-btn.secondary {
    border-color: rgba(250, 247, 235, 0.15);
    background: transparent;
    color: rgba(250, 247, 235, 0.55);
  }

  .action-btn.secondary:hover {
    background: rgba(250, 247, 235, 0.05);
    border-color: rgba(250, 247, 235, 0.3);
    color: rgba(250, 247, 235, 0.8);
  }

  .promoted-badge {
    font-size: 11px;
    color: #4ade80;
    font-weight: 600;
  }

  .hint {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.3);
    font-style: italic;
  }

  .spinner {
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .history {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .history-header {
    font-size: 11px;
    letter-spacing: 0.08em;
    color: rgba(250, 247, 235, 0.3);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .history-row {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: rgba(250, 247, 235, 0.45);
    padding: 3px 0;
    font-family: 'JetBrains Mono', monospace;
  }

  .h-ver { flex: 0 0 auto; min-width: 80px; color: rgba(250, 247, 235, 0.65); }
  .h-type { flex: 0 0 auto; min-width: 60px; }
  .h-auc { flex: 0 0 auto; min-width: 70px; color: #4ade80; }
  .h-date { margin-left: auto; }
</style>
