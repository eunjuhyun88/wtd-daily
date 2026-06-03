<script lang="ts">
  interface Props {
    slug: string;
  }

  const { slug }: Props = $props();

  let cooldownMin = $state(45);
  let pWinMin = $state(0.55);
  let volumeFloor = $state(15000);
  let isDirty = $state(false);
  let loading = $state(true);
  let saving = $state(false);
  let toast = $state<string | null>(null);

  $effect(() => {
    void loadPolicy();
  });

  async function loadPolicy() {
    loading = true;
    try {
      const res = await fetch(`/api/patterns/${slug}/alert-policy`);
      if (res.ok) {
        const data = await res.json();
        cooldownMin = data.cooldown_min ?? 45;
        pWinMin = data.p_win_min ?? 0.55;
        volumeFloor = data.volume_floor ?? 15000;
      }
    } catch {
      // keep defaults
    } finally {
      loading = false;
    }
  }

  function markDirty() {
    isDirty = true;
  }

  async function save() {
    saving = true;
    toast = null;
    try {
      const res = await fetch(`/api/patterns/${slug}/alert-policy`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cooldown_min: cooldownMin, p_win_min: pWinMin, volume_floor: volumeFloor }),
      });
      if (res.ok) {
        isDirty = false;
        showToast('알림 설정 저장됨');
      } else {
        showToast('저장 실패');
      }
    } catch {
      showToast('저장 실패');
    } finally {
      saving = false;
    }
  }

  function showToast(msg: string) {
    toast = msg;
    setTimeout(() => { toast = null; }, 3000);
  }
</script>

<div class="alert-policy">
  <div class="header">
    <span class="star">★</span>
    <span class="title">알림 설정</span>
    {#if toast}
      <span class="toast">{toast}</span>
    {/if}
    <button class="save-btn" disabled={!isDirty || saving || loading} onclick={save}>
      {saving ? '저장 중…' : '저장'}
    </button>
  </div>

  {#if loading}
    <div class="skeleton-rows">
      <div class="skeleton"></div>
      <div class="skeleton"></div>
      <div class="skeleton"></div>
    </div>
  {:else}
    <div class="sliders">
      <div class="slider-row">
        <label class="slider-label" for="cooldown">쿨다운 (분)</label>
        <input
          id="cooldown"
          type="range"
          min="0" max="120" step="5"
          bind:value={cooldownMin}
          oninput={markDirty}
          class="slider"
        />
        <span class="slider-val">{cooldownMin}</span>
      </div>

      <div class="slider-row">
        <label class="slider-label" for="pwin">최소 승률</label>
        <input
          id="pwin"
          type="range"
          min="0.3" max="0.9" step="0.05"
          bind:value={pWinMin}
          oninput={markDirty}
          class="slider"
        />
        <span class="slider-val">{pWinMin.toFixed(2)}</span>
      </div>

      <div class="slider-row">
        <label class="slider-label" for="volume">최소 거래량</label>
        <input
          id="volume"
          type="range"
          min="0" max="100000" step="1000"
          bind:value={volumeFloor}
          oninput={markDirty}
          class="slider"
        />
        <span class="slider-val">{volumeFloor.toLocaleString()}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .alert-policy {
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
    margin-bottom: 20px;
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

  .save-btn {
    padding: 6px 14px;
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
  }

  .save-btn:hover:not(:disabled) {
    background: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.6);
  }

  .save-btn:disabled {
    opacity: 0.35;
    cursor: default;
  }

  .sliders {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slider-label {
    font-size: 11px;
    color: rgba(250, 247, 235, 0.45);
    width: 90px;
    flex-shrink: 0;
  }

  .slider {
    flex: 1;
    accent-color: #4ade80;
    height: 4px;
  }

  .slider-val {
    font-size: 12px;
    font-weight: 600;
    color: rgba(250, 247, 235, 0.85);
    min-width: 56px;
    text-align: right;
  }

  .skeleton-rows {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .skeleton {
    height: 24px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 4px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
</style>
