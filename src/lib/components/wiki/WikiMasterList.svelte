<script lang="ts">
  import WikiStatePill from './WikiStatePill.svelte';

  interface WikiPageItem {
    slug: string;
    preview: string;
    updated_at: string | null;
  }

  interface Props {
    pages: WikiPageItem[];
    selectedSlug: string | null;
    verdictCounts: Record<string, number>;
    onSelect: (slug: string) => void;
  }

  let { pages, selectedSlug, verdictCounts, onSelect }: Props = $props();

  function getState(slug: string, preview: string): 'ready' | 'seeded' | 'empty' {
    const count = verdictCounts[slug] ?? 0;
    if (count >= 5) return 'ready';
    if (count >= 1) return 'seeded';
    // PR1 fallback: preview 있으면 seeded(AI 생성됐지만 verdict < 5)
    if (preview) return 'seeded';
    return 'empty';
  }

  let query = $state('');

  let filtered = $derived(
    query.trim()
      ? pages.filter((p) =>
          p.slug.toLowerCase().includes(query.trim().toLowerCase())
        )
      : pages
  );
</script>

<div class="master-list" role="navigation" aria-label="Wiki 패턴 목록">
  <div class="master-search">
    <input
      class="search-input"
      type="text"
      placeholder="검색…"
      bind:value={query}
      aria-label="패턴 wiki 검색"
    />
  </div>

  <div class="master-items">
    {#each filtered as p (p.slug)}
      <button
        class="master-card"
        class:selected={p.slug === selectedSlug}
        onclick={() => onSelect(p.slug)}
        type="button"
        aria-pressed={p.slug === selectedSlug}
        aria-label="{p.slug} 패턴 wiki 열기"
      >
        <div class="card-header">
          <WikiStatePill state={getState(p.slug, p.preview)} />
          <span class="card-slug">{p.slug}</span>
          {#if p.updated_at}
            <span class="card-date">{p.updated_at.slice(0, 10)}</span>
          {/if}
        </div>
        {#if verdictCounts[p.slug]}
          <span class="card-verdicts">{verdictCounts[p.slug]}v</span>
        {/if}
        {#if p.preview}
          <p class="card-preview">{p.preview}</p>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .master-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .master-search {
    padding: 12px 12px 8px;
    flex-shrink: 0;
  }

  .search-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 5px;
    color: rgba(250, 247, 235, 0.8);
    font-family: var(--sc-font-mono, monospace);
    font-size: 0.75rem;
    padding: 6px 10px;
    outline: none;
  }

  .search-input::placeholder {
    color: rgba(250, 247, 235, 0.2);
  }

  .search-input:focus {
    border-color: rgba(219, 154, 159, 0.4);
  }

  .master-items {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 8px 12px;
  }

  .master-card {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    border-left: 2px solid transparent;
    border-radius: 4px;
    padding: 8px 10px;
    cursor: pointer;
    transition: background 0.1s, border-color 0.1s;
  }

  .master-card:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .master-card.selected {
    border-left-color: rgba(219, 154, 159, 0.8);
    background: rgba(255, 255, 255, 0.04);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .card-slug {
    flex: 1;
    font-family: var(--sc-font-mono, monospace);
    font-size: 0.8rem;
    font-weight: 700;
    color: rgba(250, 247, 235, 0.85);
    letter-spacing: 0.02em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-date {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.25);
    flex-shrink: 0;
  }

  .card-verdicts {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(219, 154, 159, 0.5);
    letter-spacing: 0.03em;
  }

  .card-preview {
    margin: 0;
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.45);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
