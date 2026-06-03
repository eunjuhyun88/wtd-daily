<script lang="ts">
  /**
   * VerdictQueue — Dashboard thin shell (W-0480 consolidation).
   *
   * Shows count of resolved captures awaiting verdict and routes the user to
   * Terminal `/cogochi?tab=inbox` for the actual labeling UI. The 5-cat verdict
   * input lives only in `VerdictInboxPanel` (mounted in Terminal Right Rail INBOX).
   *
   * `count` is $bindable so HeroTierCard pendingCount stays in sync.
   */
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  interface Props {
    count?: number;
  }

  let { count = $bindable(0) }: Props = $props();

  let loading = $state(true);
  let error = $state('');

  onMount(loadCount);

  async function loadCount() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/captures/outcomes?status=outcome_ready&limit=100');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      count = (data.items ?? []).length;
    } catch (e) {
      error = `Failed to load count: ${(e as Error).message}`;
    } finally {
      loading = false;
    }
  }

  function processQueue() {
    goto('/cogochi?tab=inbox&from=dash_verdict');
  }
</script>

<section class="verdict-queue surface-card" data-testid="dashboard-verdict-queue">
  <div class="surface-section-head">
    <div>
      <h2>
        Verdict Queue
        {#if !loading && count > 0}
          <span class="vq-badge">{count}</span>
        {/if}
      </h2>
      <p class="surface-caption">
        결과가 결정된 트레이드를 라벨링해서 학습 신호로 돌려보내는 단계입니다.
      </p>
    </div>
    <button class="surface-button-ghost" onclick={loadCount} disabled={loading}>
      {loading ? '…' : 'Refresh'}
    </button>
  </div>

  {#if loading}
    <div class="vq-empty">
      <span class="vq-pulse"></span>
      Loading…
    </div>
  {:else if error}
    <div class="vq-empty vq-error">{error}</div>
  {:else if count === 0}
    <div class="vq-empty vq-empty--zero">
      <div class="vq-empty-title">아직 라벨링할 결과가 없습니다.</div>
      <div class="vq-empty-hint">Terminal에서 저장한 셋업의 결과가 결정되면 여기에 누적됩니다.</div>
      <button class="vq-empty-cta" onclick={() => goto('/cogochi')}>
        Terminal로 이동 →
      </button>
    </div>
  {:else}
    <div class="vq-cta-block">
      <div class="vq-cta-msg">
        <strong class="vq-cta-count">{count}건</strong>이 결과 라벨링을 기다리는 중
      </div>
      <button class="vq-cta-btn" onclick={processQueue}>
        Process verdict queue →
      </button>
    </div>
  {/if}
</section>

<style>
  .verdict-queue {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0 16px;
  }

  .vq-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: rgba(251, 191, 36, 0.18);
    color: #fbbf24;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--sc-font-mono, monospace);
    vertical-align: middle;
    margin-left: 8px;
  }

  .vq-empty {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding: 32px 24px;
    font-family: var(--sc-font-mono, monospace);
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    text-align: center;
  }
  .vq-error { color: #f87171; }

  /* count === 0 — actionable empty state with a Terminal CTA so new
     users learn where verdicts originate instead of waiting on a
     "next cycle" they don't understand. */
  .vq-empty--zero {
    flex-direction: column;
    gap: 8px;
    padding: 28px 24px;
  }
  .vq-empty-title {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,0.62);
  }
  .vq-empty-hint {
    font-size: 11px;
    line-height: 1.5;
    color: rgba(255,255,255,0.35);
    max-width: 36ch;
  }
  .vq-empty-cta {
    margin-top: 6px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.72);
    border-radius: 5px;
    padding: 6px 14px;
    font-family: var(--sc-font-mono, monospace);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .vq-empty-cta:hover {
    background: rgba(251, 191, 36, 0.1);
    border-color: rgba(251, 191, 36, 0.32);
    color: #fbbf24;
  }

  .vq-pulse {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
    animation: vq-pulse 1.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes vq-pulse { 0%,100%{opacity:.2} 50%{opacity:1} }

  .vq-cta-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: rgba(251, 191, 36, 0.04);
    border: 1px solid rgba(251, 191, 36, 0.18);
    border-radius: 8px;
  }
  .vq-cta-msg {
    font-family: var(--sc-font-mono, monospace);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
  }
  .vq-cta-count {
    color: #fbbf24;
    font-weight: 700;
  }
  .vq-cta-btn {
    background: rgba(251, 191, 36, 0.12);
    border: 1px solid rgba(251, 191, 36, 0.4);
    color: #fbbf24;
    border-radius: 5px;
    padding: 8px 18px;
    font-family: var(--sc-font-mono, monospace);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.15s;
  }
  .vq-cta-btn:hover {
    background: rgba(251, 191, 36, 0.22);
  }
</style>
