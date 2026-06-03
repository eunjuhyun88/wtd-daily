<script lang="ts">
  interface Props {
    icon?: string;
    title: string;
    subtitle?: string;
  }
  const { icon = '◈', title, subtitle }: Props = $props();
</script>

<div class="empty" role="status">
  <span class="empty-icon" aria-hidden="true">{icon}</span>
  <span class="empty-title">{title}</span>
  {#if subtitle}
    <span class="empty-sub">{subtitle}</span>
  {/if}
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--sc-sp-1_5);
    padding: var(--sc-sp-8) var(--sc-sp-3);
    text-align: center;
  }

  .empty-icon {
    font-size: 24px;
    opacity: 0.35;
    color: var(--sc-text-2);
    line-height: 1;
  }

  .empty-title {
    font-size: var(--sc-fs-sm);
    font-family: var(--sc-font-mono);
    color: var(--sc-text-2);
  }

  .empty-sub {
    font-size: var(--sc-fs-2xs);
    color: var(--sc-text-3);
    line-height: var(--sc-lh-relaxed);
    max-width: 200px;
  }
</style>
