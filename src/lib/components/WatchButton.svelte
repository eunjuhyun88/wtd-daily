<script lang="ts">
  interface Props {
    captureId: string;
    isWatching?: boolean;
    size?: 'sm' | 'md';
    onToggle?: (watching: boolean) => void;
  }

  let { captureId, isWatching = $bindable(false), size = 'md', onToggle }: Props = $props();

  let loading = $state(false);
  let err = $state('');

  async function toggle() {
    if (loading) return;
    loading = true;
    err = '';
    try {
      const res = await fetch(`/api/captures/${captureId}/watch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        isWatching = !isWatching;
        onToggle?.(isWatching);
      } else {
        err = 'Failed';
      }
    } catch {
      err = 'Network error';
    } finally {
      loading = false;
    }
  }
</script>

<button
  class="watch-btn"
  class:watching={isWatching}
  class:sm={size === 'sm'}
  class:loading
  onclick={toggle}
  disabled={loading}
  aria-label={isWatching ? 'Unwatch capture' : 'Watch capture'}
  title={err || (isWatching ? 'Watching' : 'Watch')}
>
  {#if loading}
    <span class="spinner" aria-hidden="true"></span>
  {:else if isWatching}
    ★
  {:else}
    ☆
  {/if}
</button>

<style>
  .watch-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.35);
    cursor: pointer;
    font-size: var(--ui-text-xs);
    padding: 4px 8px;
    transition: color 0.15s, border-color 0.15s;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .watch-btn.sm {
    padding: 2px 6px;
    font-size: 11px;
  }
  .watch-btn:hover:not(:disabled) {
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.4);
  }
  .watch-btn.watching {
    color: #facc15;
    border-color: rgba(250, 204, 21, 0.35);
  }
  .watch-btn:disabled {
    cursor: default;
    opacity: 0.5;
  }
  .spinner {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-top-color: rgba(255, 255, 255, 0.6);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
