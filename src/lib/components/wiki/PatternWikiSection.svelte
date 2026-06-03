<script lang="ts">
  import { onMount } from 'svelte';

  type MarkedModule = typeof import('marked');
  let markedMod = $state<MarkedModule | null>(null);

  let { slug }: { slug: string } = $props();

  const WIKI_ENABLED = import.meta.env.VITE_WIKI_ENABLED !== 'false';

  interface WikiResult {
    slug: string;
    content: string | null;
    exists: boolean;
  }

  let globalWiki = $state<WikiResult | null>(null);
  let userWiki = $state<WikiResult | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  let editing = $state(false);
  let draft = $state('');
  let saving = $state(false);
  let saveError = $state<string | null>(null);

  const globalHtml = $derived(globalWiki?.content ? renderMd(globalWiki.content) : '');
  const userHtml = $derived(userWiki?.content ? renderMd(userWiki.content) : '');

  onMount(() => {
    if (!WIKI_ENABLED) { loading = false; return; }
    let cancelled = false;
    void import('marked').then((m) => {
      if (!cancelled) markedMod = m;
    });
    void fetchWikis();
    return () => {
      cancelled = true;
    };
  });

  async function fetchWikis() {
    loading = true;
    error = null;
    try {
      const [globalRes, userRes] = await Promise.all([
        fetch(`/api/wiki/patterns/${encodeURIComponent(slug)}`),
        fetch(`/api/wiki/user/patterns/${encodeURIComponent(slug)}`),
      ]);
      if (globalRes.ok) globalWiki = await globalRes.json() as WikiResult;
      if (userRes.ok) userWiki = await userRes.json() as WikiResult;
    } catch {
      error = 'wiki 로드 실패';
    } finally {
      loading = false;
    }
  }

  function startEdit() {
    draft = userWiki?.content ?? '';
    saveError = null;
    editing = true;
  }

  function cancelEdit() {
    editing = false;
    saveError = null;
  }

  async function saveEdit() {
    saving = true;
    saveError = null;
    try {
      const res = await fetch(`/api/wiki/user/patterns/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body_md: draft }),
      });
      if (!res.ok) throw new Error(await res.text());
      userWiki = { slug, content: draft || null, exists: Boolean(draft) };
      editing = false;
    } catch {
      saveError = '저장 실패 — 다시 시도해 주세요.';
    } finally {
      saving = false;
    }
  }

  function renderMd(content: string): string {
    if (!markedMod) return '';
    // Audit-004: marked v15 has no built-in sanitizer (deprecated in v5).
    // userWiki content is user-editable and globalWiki is admin-curated; in
    // both paths {@html} would let raw <script>/<img onerror> through. Escape
    // angle brackets in source before parsing — markdown grammar does not use
    // <> (the only loss is `<url>` autolink syntax; bare URLs still work).
    const safe = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return markedMod.marked.parse(safe, { async: false }) as string;
  }
</script>

{#if !WIKI_ENABLED}
  <!-- feature flag off — render nothing -->
{:else}
  <section class="wiki-section">
    <div class="wiki-header">
      <span class="wiki-title">Wiki</span>
    </div>

    {#if loading}
      <div class="wiki-loading">로딩 중…</div>
    {:else if error}
      <!-- silent — page works fine without wiki -->
    {:else}
      <div class="wiki-body">
        <div class="wiki-block">
          <div class="wiki-block-label">패턴 분석</div>
          {#if globalWiki?.content}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html globalHtml}
          {:else}
            <p class="wiki-placeholder">verdict 누적 후 자동 생성됩니다.</p>
          {/if}
        </div>

        <div class="wiki-block">
          <div class="wiki-block-label-row">
            <span class="wiki-block-label">나의 메모</span>
            {#if !editing}
              <button class="wiki-edit-btn" onclick={startEdit}>편집</button>
            {/if}
          </div>

          {#if editing}
            <textarea
              class="wiki-editor"
              bind:value={draft}
              rows={10}
              placeholder="마크다운으로 메모를 작성하세요…"
              disabled={saving}
            ></textarea>
            {#if saveError}
              <p class="wiki-save-error">{saveError}</p>
            {/if}
            <div class="wiki-editor-actions">
              <button class="wiki-save-btn" onclick={saveEdit} disabled={saving}>
                {saving ? '저장 중…' : '저장'}
              </button>
              <button class="wiki-cancel-btn" onclick={cancelEdit} disabled={saving}>취소</button>
            </div>
          {:else if userWiki?.content}
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html userHtml}
          {:else}
            <p class="wiki-placeholder">verdict 누적 후 자동 생성됩니다.</p>
          {/if}
        </div>
      </div>
    {/if}
  </section>
{/if}

<style>
  .wiki-section {
    margin-top: 32px;
    padding: 20px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
  }

  .wiki-header {
    margin-bottom: 16px;
  }

  .wiki-title {
    font-family: var(--sc-font-mono, monospace);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.35);
  }

  .wiki-loading {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.25);
  }

  .wiki-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .wiki-block-label {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    letter-spacing: 0.06em;
    color: rgba(250, 247, 235, 0.45);
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .wiki-placeholder {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.2);
    margin: 0;
    font-style: italic;
  }

  .wiki-block :global(p) {
    font-family: var(--sc-font-body, sans-serif);
    font-size: 0.8rem;
    line-height: 1.6;
    color: rgba(250, 247, 235, 0.7);
    margin: 0 0 8px;
  }

  .wiki-block :global(h1),
  .wiki-block :global(h2),
  .wiki-block :global(h3) {
    font-family: var(--sc-font-body, sans-serif);
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(250, 247, 235, 0.85);
    margin: 12px 0 6px;
  }

  .wiki-block :global(ul),
  .wiki-block :global(ol) {
    font-size: 0.8rem;
    color: rgba(250, 247, 235, 0.7);
    padding-left: 18px;
    margin: 0 0 8px;
  }

  .wiki-block :global(code) {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    background: rgba(255, 255, 255, 0.07);
    padding: 1px 4px;
    border-radius: 3px;
  }

  .wiki-block-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .wiki-block-label-row .wiki-block-label {
    margin-bottom: 0;
  }

  .wiki-edit-btn {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.35);
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
    transition: color 0.12s, background 0.12s;
  }

  .wiki-edit-btn:hover {
    color: rgba(250, 247, 235, 0.7);
    background: rgba(255, 255, 255, 0.06);
  }

  .wiki-editor {
    width: 100%;
    min-height: 160px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(250, 247, 235, 0.85);
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    line-height: 1.6;
    padding: 10px 12px;
    resize: vertical;
    box-sizing: border-box;
    outline: none;
  }

  .wiki-editor:focus {
    border-color: rgba(219, 154, 159, 0.5);
  }

  .wiki-editor:disabled {
    opacity: 0.5;
  }

  .wiki-editor-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .wiki-save-btn,
  .wiki-cancel-btn {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    padding: 5px 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: opacity 0.12s;
  }

  .wiki-save-btn:disabled,
  .wiki-cancel-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .wiki-save-btn {
    background: rgba(219, 154, 159, 0.75);
    color: rgba(6, 6, 7, 0.9);
    font-weight: 600;
  }

  .wiki-save-btn:hover:not(:disabled) {
    background: rgba(219, 154, 159, 0.9);
  }

  .wiki-cancel-btn {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(250, 247, 235, 0.55);
  }

  .wiki-cancel-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(250, 247, 235, 0.8);
  }

  .wiki-save-error {
    font-family: var(--sc-font-mono, monospace);
    font-size: var(--ui-text-xs, 11px);
    color: rgba(219, 100, 100, 0.85);
    margin: 6px 0 0;
  }
</style>
