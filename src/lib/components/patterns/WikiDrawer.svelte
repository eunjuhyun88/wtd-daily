<script lang="ts">
  import PatternWikiSection from '$lib/components/wiki/PatternWikiSection.svelte';

  type Props = { slug: string; open: boolean; onClose: () => void };
  const { slug, open, onClose }: Props = $props();

  $effect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
</script>

{#if open}
  <div class="drawer-backdrop" role="presentation" onclick={onClose}></div>
{/if}
<div class="wiki-drawer" class:open aria-hidden={!open}>
  <div class="drawer-header">
    <span class="drawer-title mono">Wiki — {slug}</span>
    <button type="button" class="drawer-close" onclick={onClose} aria-label="닫기">✕</button>
  </div>
  <div class="drawer-body">
    {#if open}
      <PatternWikiSection {slug} />
    {/if}
  </div>
</div>

<style>
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 400;
  }
  .wiki-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 360px;
    background: #0d1117;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 401;
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 250ms ease-out;
    overflow: hidden;
  }
  .wiki-drawer.open { transform: translateX(0); }
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    flex-shrink: 0;
  }
  .drawer-title {
    font-size: var(--ui-text-sm, 13px);
    font-family: var(--sc-font-mono, monospace);
    color: rgba(250, 247, 235, 0.7);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .drawer-close {
    background: none;
    border: none;
    color: rgba(250, 247, 235, 0.45);
    cursor: pointer;
    font-size: 14px;
    padding: 4px 8px;
    flex-shrink: 0;
  }
  .drawer-close:hover { color: rgba(250, 247, 235, 0.85); }
  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }
  @media (max-width: 480px) {
    .wiki-drawer { width: 100%; border-left: none; }
  }
</style>
