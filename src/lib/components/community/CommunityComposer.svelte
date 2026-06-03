<script lang="ts">
  import { addCommunityPost } from '$lib/stores/communityStore';

  let text = $state('');
  let signal = $state<'long' | 'short' | null>(null);
  let posting = $state(false);

  async function handleSubmit() {
    const trimmed = text.trim();
    if (!trimmed || posting) return;
    posting = true;
    try {
      await addCommunityPost(trimmed, signal);
      text = '';
      signal = null;
    } finally {
      posting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      void handleSubmit();
    }
  }
</script>

<div class="cf-composer">
  <textarea
    class="cf-textarea"
    placeholder="커뮤니티에 글을 남기세요… (Ctrl+Enter 게시)"
    bind:value={text}
    onkeydown={handleKeydown}
    rows="2"
  ></textarea>
  <div class="cf-composer-actions">
    <div class="cf-signal-btns">
      <button
        class="cf-sig-btn"
        class:active={signal === 'long'}
        onclick={() => signal = signal === 'long' ? null : 'long'}
        type="button"
      >LONG</button>
      <button
        class="cf-sig-btn short"
        class:active={signal === 'short'}
        onclick={() => signal = signal === 'short' ? null : 'short'}
        type="button"
      >SHORT</button>
    </div>
    <button
      class="cf-submit"
      onclick={handleSubmit}
      disabled={!text.trim() || posting}
      type="button"
    >{posting ? '게시 중…' : '게시'}</button>
  </div>
</div>

<style>
  .cf-composer {
    padding: 10px 0 12px;
    border-bottom: 1px solid rgba(255,255,255,.07);
  }
  .cf-textarea {
    width: 100%;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 6px;
    color: rgba(250,247,235,.85);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    line-height: 1.5;
    padding: 8px 10px;
    resize: none;
    box-sizing: border-box;
    transition: border-color .12s;
  }
  .cf-textarea:focus {
    outline: none;
    border-color: rgba(74,222,128,.4);
  }
  .cf-textarea::placeholder { color: rgba(255,255,255,.25); }
  .cf-composer-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
  }
  .cf-signal-btns {
    display: flex;
    gap: 4px;
  }
  .cf-sig-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 3px;
    cursor: pointer;
    transition: all .12s;
    background: transparent;
    border: 1px solid rgba(0,255,136,.3);
    color: rgba(0,255,136,.5);
  }
  .cf-sig-btn.active { background: rgba(0,255,136,.15); color: #00ff88; }
  .cf-sig-btn.short { border-color: rgba(255,45,85,.3); color: rgba(255,45,85,.5); }
  .cf-sig-btn.short.active { background: rgba(255,45,85,.15); color: #ff2d55; }
  .cf-sig-btn:hover { opacity: 0.8; }
  .cf-submit {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 14px;
    background: rgba(74,222,128,.15);
    border: 1px solid rgba(74,222,128,.3);
    border-radius: 4px;
    color: #4ade80;
    cursor: pointer;
    transition: all .12s;
  }
  .cf-submit:hover:not(:disabled) {
    background: rgba(74,222,128,.25);
    border-color: rgba(74,222,128,.5);
  }
  .cf-submit:disabled { opacity: 0.35; cursor: default; }
</style>
