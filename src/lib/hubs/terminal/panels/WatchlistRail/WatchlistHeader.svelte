<script lang="ts">
  interface Props {
    symbolCount: number;
    maxSymbols: number;
    folded: boolean;
    addOpen: boolean;
    addInput: string;
    addError: string;
    onToggleFold: () => void;
    onToggleAdd: () => void;
    onAddConfirm: () => void;
    onAddCancel: () => void;
    onAddKeydown: (e: KeyboardEvent) => void;
  }

  let {
    symbolCount,
    maxSymbols,
    folded,
    addOpen,
    addInput = $bindable(),
    addError,
    onToggleFold,
    onToggleAdd,
    onAddConfirm,
    onAddCancel,
    onAddKeydown,
  }: Props = $props();
</script>

<div class="section-header">
  {#if !folded}
    <span class="section-label">WATCHLIST</span>
    <span class="section-actions">
      <span class="section-count">{symbolCount}/{maxSymbols}</span>
      {#if symbolCount < maxSymbols}
        <button
          class="add-btn"
          onclick={onToggleAdd}
          title="Add symbol"
          aria-label="Add symbol"
        >+</button>
      {/if}
    </span>
  {/if}
  <button
    class="fold-btn"
    onclick={onToggleFold}
    title={folded ? 'Expand watchlist' : 'Collapse watchlist'}
    aria-label={folded ? 'Expand watchlist' : 'Collapse watchlist'}
  >{folded ? '›' : '‹'}</button>
</div>

{#if !folded && addOpen}
  <div class="add-row">
    <!-- svelte-ignore a11y_autofocus -->
    <input
      class="add-input"
      type="text"
      placeholder="SOLUSDT…"
      bind:value={addInput}
      onkeydown={onAddKeydown}
      maxlength={12}
      autofocus
    />
    <button class="add-confirm" onclick={onAddConfirm} title="Confirm">+</button>
    <button class="add-cancel" onclick={onAddCancel} title="Cancel">✕</button>
  </div>
  {#if addError}
    <div class="add-error">{addError}</div>
  {/if}
{/if}

<style>
  .fold-btn {
    width: 17px;
    height: 17px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--term-radius-sm, 5px);
    color: var(--term-text-2, var(--g5));
    cursor: pointer;
    font-size: 11px;
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
    transition: color 0.1s, background 0.1s, border-color 0.1s;
  }
  .fold-btn:hover {
    color: var(--term-text-0, var(--g8));
    background: var(--term-surface-2, var(--g2));
    border-color: var(--term-border, var(--g4));
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--term-section-h, 20px);
    padding: 2px 8px;
    font-size: var(--ui-text-xs);
    color: var(--term-text-2, var(--g5));
    letter-spacing: 0.16em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--term-border, var(--g4));
    background: var(--term-surface-0, var(--g0));
    position: sticky;
    top: 0;
    z-index: 1;
    flex-shrink: 0;
  }

  .section-label { font-weight: 600; line-height: 1; }
  .section-count { font-size: var(--ui-text-xs); color: var(--term-text-2, var(--g6)); line-height: 1; }

  .section-actions {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .add-btn {
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g4));
    color: var(--term-text-1, var(--g6));
    font-size: 11px;
    line-height: 1;
    width: 17px;
    height: 17px;
    border-radius: var(--term-radius-sm, 5px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.1s, border-color 0.1s, background 0.1s;
  }
  .add-btn:hover {
    color: var(--term-text-0, var(--g9));
    border-color: var(--term-border-strong, var(--g6));
    background: var(--term-surface-3, var(--g3));
  }

  .add-row {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--term-surface-1, var(--g1));
    border-bottom: 1px solid var(--term-border, var(--g4));
    flex-shrink: 0;
  }

  .add-input {
    flex: 1;
    height: var(--term-rail-input-h, 30px);
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g4));
    border-radius: var(--term-radius-sm, 5px);
    color: var(--term-text-0, var(--g9));
    font-family: inherit;
    font-size: var(--ui-text-xs);
    padding: 0 9px;
    outline: none;
    text-transform: uppercase;
    min-width: 0;
  }
  .add-input:focus { border-color: var(--brand); }
  .add-input::placeholder { text-transform: none; color: var(--term-text-2, var(--g5)); }

  .add-confirm, .add-cancel {
    width: 18px;
    height: 18px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--term-radius-sm, 5px);
    cursor: pointer;
    font-size: 12px;
    padding: 0;
    line-height: 1;
    flex-shrink: 0;
    transition: color 0.1s, background 0.1s, border-color 0.1s;
  }
  .add-confirm { color: var(--bull); }
  .add-confirm:hover {
    color: #4ade80;
    background: rgba(34, 171, 148, 0.08);
    border-color: rgba(34, 171, 148, 0.18);
  }
  .add-cancel { color: var(--term-text-2, var(--g5)); }
  .add-cancel:hover {
    color: var(--term-text-0, var(--g8));
    background: var(--term-surface-2, var(--g2));
    border-color: var(--term-border, var(--g4));
  }

  .add-error {
    padding: 1px 8px 5px;
    font-size: var(--ui-text-xs);
    color: var(--bear);
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
</style>
