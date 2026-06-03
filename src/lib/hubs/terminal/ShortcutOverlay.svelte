<script lang="ts">
  /**
   * ⌘/ shortcut overlay.
   *
   * Renders SHORTCUTS from keyboardShortcuts.ts grouped by section so the
   * overlay never drifts from the actual handler. Open via ⌘/ (handled
   * inside TerminalHub), close via Escape, click outside, or the X button.
   *
   * The overlay is a pure presentational component; it does not own the
   * open state — TerminalHub passes it as a prop.
   */
  import { SHORTCUT_GROUPS, type ShortcutGroup } from './keyboardShortcuts';

  interface Props {
    open: boolean;
    onClose: () => void;
  }
  let { open, onClose }: Props = $props();

  // Friendly section titles. Keep here (not in keyboardShortcuts.ts) so the
  // module stays free of UI strings.
  const TITLES: Record<ShortcutGroup, string> = {
    general: 'General',
    panels: 'Panels',
    tabs: 'Tabs',
    mode: 'Modes',
    tools: 'Chart tools',
    watchlist: 'Watchlist',
  };

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  }
</script>

{#if open}
  <div
    class="overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="shortcut-overlay-title"
    tabindex="-1"
    onclick={onBackdropClick}
    onkeydown={onKey}
    data-testid="terminal-shortcut-overlay"
  >
    <div class="modal">
      <header class="head">
        <h2 id="shortcut-overlay-title">Keyboard shortcuts</h2>
        <button type="button" class="close" onclick={onClose} aria-label="Close shortcut overlay">×</button>
      </header>

      <div class="grid">
        {#each SHORTCUT_GROUPS as section (section.group)}
          <section class="group">
            <h3>{TITLES[section.group]}</h3>
            <dl>
              {#each section.items as s (s.display)}
                <div class="row">
                  <dt><kbd>{s.display}</kbd></dt>
                  <dd>{s.label}</dd>
                </div>
              {/each}
            </dl>
          </section>
        {/each}
      </div>

      <footer class="foot">
        <span class="hint">Press <kbd>Esc</kbd> to close · <kbd>⌘/</kbd> to reopen</span>
      </footer>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 250;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
  }

  .modal {
    width: min(720px, 100%);
    max-height: calc(100dvh - 48px);
    display: flex;
    flex-direction: column;
    background: var(--g1, #14110f);
    border: 1px solid var(--g4, #272320);
    border-radius: 10px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    color: var(--g9, #eceae8);
    font-family: var(--fb);
    overflow: hidden;
  }

  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--g3, #1c1918);
  }
  .head h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--g9, #eceae8);
  }
  .close {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--g4, #272320);
    border-radius: 4px;
    color: var(--g7, #9d9690);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
  }
  .close:hover { background: var(--g3, #1c1918); color: var(--g9, #eceae8); border-color: var(--g5, #3a3530); }

  .grid {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px 12px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px 24px;
  }

  .group h3 {
    margin: 0 0 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--g6, #5a5650);
  }

  dl {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .row {
    display: grid;
    grid-template-columns: 110px 1fr;
    align-items: center;
    gap: 12px;
    padding: 4px 0;
  }
  dt { margin: 0; }
  dd {
    margin: 0;
    font-size: 12px;
    color: var(--g8, #b8b3ad);
  }

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 2px 6px;
    background: var(--g2, #161413);
    border: 1px solid var(--g4, #272320);
    border-bottom-width: 2px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--g8, #b8b3ad);
    white-space: nowrap;
  }

  .foot {
    padding: 10px 18px 12px;
    border-top: 1px solid var(--g3, #1c1918);
    text-align: center;
  }
  .hint {
    font-size: 11px;
    color: var(--g6, #5a5650);
  }
  .hint kbd { font-size: 11px; padding: 1px 5px; }

  @media (max-width: 540px) {
    .grid { grid-template-columns: 1fr; padding: 14px 14px 8px; }
    .row { grid-template-columns: 90px 1fr; }
  }
</style>
