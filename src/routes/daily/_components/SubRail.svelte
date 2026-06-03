<script lang="ts">
  import { onMount } from 'svelte';

  // Daily is a one-page briefing — the SubRail is in-page anchor jumps, NOT
  // sister routes. Previous version included a 'Patterns' chip linking out to
  // /patterns, which duplicated the global rail's Patterns nav. Removed.
  // Briefing/Calendar chips are kept and now rely on real in-page anchors.
  let {
    active = 'daily'
  }: {
    active?: RailKey;
  } = $props();

  type RailKey = 'daily' | 'briefing' | 'market' | 'macro' | 'crypto' | 'signals' | 'calendar' | 'news';

  type RailItem = {
    id: RailKey;
    label: string;
    href: string;
    targetId: string;
  };

  const items: RailItem[] = [
    { id: 'daily', label: 'Pulse', href: '#daily-top', targetId: 'daily-top' },
    { id: 'briefing', label: 'Brief', href: '#briefing', targetId: 'briefing' },
    { id: 'market', label: 'Board', href: '#market-board', targetId: 'market-board' },
    { id: 'macro', label: 'Macro', href: '#macro', targetId: 'macro' },
    { id: 'crypto', label: 'Crypto', href: '#crypto', targetId: 'crypto' },
    { id: 'signals', label: 'Signals', href: '#signals', targetId: 'signals' },
    { id: 'calendar', label: 'Calendar', href: '#calendar', targetId: 'calendar' },
    { id: 'news', label: 'News', href: '#news', targetId: 'news' }
  ];

  const STICKY_OFFSET = 112;
  let activeKey = $state<RailKey>('daily');

  function getDailyScrollRoot(): HTMLElement | null {
    if (typeof document === 'undefined' || typeof window === 'undefined') return null;
    const root = document.getElementById('main-content');
    if (!(root instanceof HTMLElement)) return null;
    const overflowY = window.getComputedStyle(root).overflowY;
    if (!/(auto|scroll|overlay)/.test(overflowY)) return null;
    if (root.scrollHeight <= root.clientHeight + 4) return null;
    return root;
  }

  function syncFromHash() {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    const match = items.find((item) => item.targetId === hash);
    activeKey = match?.id ?? active;
  }

  function scrollToTarget(item: RailItem, behavior: ScrollBehavior = 'smooth') {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const root = getDailyScrollRoot();
    if (item.targetId === 'daily-top') {
      if (root) root.scrollTo({ top: 0, behavior });
      else window.scrollTo({ top: 0, behavior });
      window.history.replaceState({}, '', `${window.location.pathname}${item.href}`);
      return;
    }
    const target = document.getElementById(item.targetId);
    if (!target) return;
    if (!root) {
      const top = window.scrollY + target.getBoundingClientRect().top - STICKY_OFFSET;
      window.scrollTo({ top: Math.max(0, top), behavior });
    } else {
      const rootRect = root.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const top = root.scrollTop + targetRect.top - rootRect.top - STICKY_OFFSET;
      root.scrollTo({ top: Math.max(0, top), behavior });
    }
    window.history.replaceState({}, '', `${window.location.pathname}${item.href}`);
  }

  function markActive(event: MouseEvent, item: RailItem) {
    event.preventDefault();
    event.stopPropagation();
    activeKey = item.id;
    scrollToTarget(item);
  }

  onMount(() => {
    syncFromHash();
    const root = getDailyScrollRoot();
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!visible?.target?.id) return;
          const match = items.find((item) => item.targetId === visible.target.id);
          if (match) activeKey = match.id;
        },
        { root, rootMargin: '-116px 0px -68% 0px', threshold: [0, 0.2, 0.5] }
      );
      for (const item of items) {
        const target = document.getElementById(item.targetId);
        if (target) observer.observe(target);
      }
    }
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      observer?.disconnect();
      window.removeEventListener('hashchange', syncFromHash);
    };
  });
</script>

<nav class="sub-rail" aria-label="Daily sections">
  <ol>
    {#each items as item (item.id)}
      <li>
        <a
          href={item.href}
          class="rail-chip"
          class:active={item.id === activeKey}
          aria-current={item.id === activeKey ? 'location' : undefined}
          onclick={(event) => markActive(event, item)}
        >
          {item.label}
        </a>
      </li>
    {/each}
  </ol>
</nav>

<style>
  .sub-rail {
    position: sticky;
    top: var(--app-topbar-h, 32px);
    z-index: 38;
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 clamp(12px, 3vw, 24px);
    border-bottom: 1px solid var(--g3, #1c1918);
    background: var(--g0, #0b0a09);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    overscroll-behavior-x: contain;
  }
  .sub-rail::-webkit-scrollbar { display: none; }
  ol {
    display: flex;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .rail-chip {
    display: inline-flex;
    align-items: center;
    min-width: 44px;
    height: 32px;
    justify-content: center;
    padding: 0 12px;
    border-radius: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: var(--g7, #9d9690);
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
    touch-action: manipulation;
  }
  .rail-chip:hover {
    background: var(--g2, #161413);
    color: var(--g9, #eceae8);
  }
  .rail-chip.active {
    background: var(--g3, #1c1918);
    color: var(--g9, #eceae8);
    box-shadow: inset 0 0 0 1px var(--g4, #272320);
  }
</style>
