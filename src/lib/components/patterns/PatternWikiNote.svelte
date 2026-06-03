<script lang="ts">
  import { onMount } from 'svelte';

  const { slug }: { slug: string } = $props();

  let content = $state('');
  let initialContent = $state('');
  let updatedAt = $state<string | null>(null);
  let saving = $state(false);
  let isAuthed = $state(true);
  let statusMsg = $state('');

  const isDirty = $derived(content !== initialContent);

  onMount(async () => {
    try {
      const res = await fetch(`/api/wiki/user/patterns/${encodeURIComponent(slug)}`);
      if (res.status === 401) { isAuthed = false; return; }
      if (!res.ok) return;
      const data = await res.json() as { content?: string | null; updated_at?: string | null };
      content = data.content ?? '';
      initialContent = content;
      updatedAt = data.updated_at ?? null;
    } catch {
      // network error — show section, let user try
    }
  });

  $effect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });

  async function save() {
    saving = true;
    statusMsg = '';
    try {
      const res = await fetch(`/api/wiki/user/patterns/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json() as { updated_at?: string };
        initialContent = content;
        updatedAt = data.updated_at ?? null;
        statusMsg = '노트 저장됨';
      } else {
        statusMsg = '저장 실패, 다시 시도하세요';
      }
    } catch {
      statusMsg = '저장 실패, 다시 시도하세요';
    } finally {
      saving = false;
      setTimeout(() => { statusMsg = ''; }, 3000);
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
</script>

{#if isAuthed}
<section id="wiki-notes" class="wiki-notes-section">
  <h4 class="notes-heading">내 노트</h4>
  <textarea
    bind:value={content}
    placeholder="메모를 입력하세요..."
    maxlength={10000}
    rows={5}
    class="notes-textarea"
  ></textarea>
  <div class="notes-actions">
    <button onclick={save} disabled={!isDirty || saving} class="notes-btn primary">
      {saving ? '저장 중...' : '저장'}
    </button>
    {#if isDirty && initialContent}
      <button onclick={() => { content = initialContent; }} class="notes-btn secondary">편집 취소</button>
    {/if}
    {#if statusMsg}
      <span class="notes-status">{statusMsg}</span>
    {:else if updatedAt}
      <span class="notes-ts">마지막 수정: {formatDate(updatedAt)}</span>
    {/if}
  </div>
</section>
{/if}

<style>
  .wiki-notes-section {
    margin-top: 24px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.02);
  }

  .notes-heading {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    color: rgba(250, 247, 235, 0.4);
    margin: 0 0 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: normal;
  }

  .notes-textarea {
    width: 100%;
    min-height: 120px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    color: rgba(250, 247, 235, 0.85);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    padding: 10px;
    resize: vertical;
    box-sizing: border-box;
    line-height: 1.6;
  }

  .notes-textarea:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.25);
  }

  .notes-textarea::placeholder {
    color: rgba(250, 247, 235, 0.2);
  }

  .notes-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .notes-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.72rem;
    padding: 5px 14px;
    border-radius: 4px;
    cursor: pointer;
  }

  .notes-btn.primary {
    background: rgba(74, 222, 128, 0.15);
    color: #4ade80;
    border: 1px solid rgba(74, 222, 128, 0.3);
  }

  .notes-btn.primary:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .notes-btn.secondary {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(250, 247, 235, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .notes-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: #4ade80;
  }

  .notes-ts {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.7rem;
    color: rgba(250, 247, 235, 0.3);
  }
</style>
