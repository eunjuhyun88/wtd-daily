<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    badge?: string | number;
    children: Snippet;
    action?: Snippet;
  }
  const { title, badge, children, action }: Props = $props();
</script>

<div class="shell">
  {#if title}
    <div class="shell-header">
      <span class="shell-title">{title}</span>
      {#if badge != null}
        <span class="shell-badge">{badge}</span>
      {/if}
      {#if action}
        <div class="shell-action">{@render action()}</div>
      {/if}
    </div>
  {/if}
  <div class="shell-body">{@render children()}</div>
</div>

<style>
  .shell {
    display: flex;
    flex-direction: column;
    background: var(--sc-bg-1);
    border: 1px solid var(--sc-line-soft);
    border-radius: var(--sc-radius-3);
    overflow: hidden;
  }

  .shell-header {
    display: flex;
    align-items: center;
    gap: var(--sc-sp-2);
    height: 36px;
    padding: 0 var(--sc-sp-3);
    border-bottom: 1px solid var(--sc-line-soft);
    flex-shrink: 0;
  }

  .shell-title {
    font-family: var(--sc-font-mono);
    font-size: var(--sc-fs-2xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--sc-text-2);
    flex: 1;
  }

  .shell-badge {
    font-size: var(--sc-fs-2xs);
    font-weight: 700;
    padding: 1px 6px;
    border-radius: var(--sc-radius-full);
    background: rgba(var(--lis-rgb-pink), 0.15);
    color: var(--sc-accent);
    font-family: var(--sc-font-mono);
  }

  .shell-action {
    display: flex;
    align-items: center;
  }

  .shell-body {
    display: flex;
    flex-direction: column;
    gap: var(--sc-sp-3);
    padding: var(--sc-sp-3);
    flex: 1;
    overflow-y: auto;
  }
</style>
