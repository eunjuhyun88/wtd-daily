<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ShellWorkMode } from '$lib/hubs/terminal/shell.store';
  import { shellStore } from '$lib/hubs/terminal/shell.store';
  import { walletStore, isWalletConnected } from '$lib/stores/walletStore';
  import { authStore } from '$lib/stores/authStore';
  import { openWalletModal } from '$lib/stores/walletModalStore';
  import LocaleToggle from '$lib/components/LocaleToggle.svelte';

  const TF_CYCLE = ['15m', '1h', '4h', '1d', '1w'];
  const WORK_MODES: Array<{ id: ShellWorkMode; label: string }> = [
    { id: 'observe',  label: 'OBS' },
    { id: 'analyze',  label: 'ANL' },
    { id: 'execute',  label: 'EXE' },
  ];
  const TOOL_MENU_ITEMS = [
    { label: 'MM Lab', href: '/mmlab' },
    { label: 'Settings', href: '/settings' },
    { label: 'Passport', href: '/passport' },
    { label: 'Account', href: '/account' },
  ] as const;

  interface Props {
    symbol: string;
    timeframe: string;
    workMode?: ShellWorkMode;
    /** Latest verdict pill — null hides it. */
    lastVerdictKind?: 'LONG' | 'SHORT' | 'WAIT' | null;
    /** Epoch ms of latest data tick — null hides freshness. */
    lastUpdatedAt?: number | null;
    /** Verdict count (session). */
    verdicts?: number;
    onSymbolTap?: () => void;
    onTFChange?: (tf: string) => void;
    onModeTap?: () => void;
  }

  const {
    symbol, timeframe, workMode = 'observe',
    lastVerdictKind = null, lastUpdatedAt = null, verdicts = 0,
    onSymbolTap, onTFChange, onModeTap,
  }: Props = $props();

  function cycleTF() {
    const idx = TF_CYCLE.indexOf(timeframe);
    const next = TF_CYCLE[(idx + 1) % TF_CYCLE.length];
    onTFChange?.(next);
  }

  // Ticking clock + freshness for the status strip.
  function getTime(): string {
    return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  }
  let currentTime = $state(getTime());
  let nowMs = $state(Date.now());
  $effect(() => {
    const id = setInterval(() => { currentTime = getTime(); nowMs = Date.now(); }, 1000);
    return () => clearInterval(id);
  });

  const freshnessSec = $derived(
    lastUpdatedAt == null ? null : Math.max(0, Math.floor((nowMs - lastUpdatedAt) / 1000)),
  );
  const freshnessClass = $derived(
    freshnessSec == null ? '' :
    freshnessSec < 15 ? 'fresh-good' :
    freshnessSec < 60 ? 'fresh-warn' : 'fresh-stale',
  );

  // Global escape drawer (W-0498 PR5a/PR5a-followup). Drawer = secondary nav
  // (Settings/Passport/Locale/Disconnect) that complements the canonical
  // MobileBottomNav (≤768px): five hubs Daily · Terminal · Patterns · Dashboard · Lab,
  // globally from +layout. Terminal drawer below = secondary destinations.
  // is rendered globally from `+layout.svelte` for viewports ≤768px. The
  // mode-btn ⋯ inside the terminal hub stays unchanged: it switches the
  // *internal* terminal panel (chart/detail/scan/judge via `mobileMode`) and
  // is unrelated to the outer 5-surface nav. PR5c will introduce a Bottom
  // Sheet that supersedes the mode-btn for the 6 internal surfaces.
  const wallet = $derived($walletStore);
  const auth = $derived($authStore);
  const connected = $derived($isWalletConnected);
  const isAuthenticated = $derived(connected || !!(auth.email || auth.nickname));
  const accountLabel = $derived(
    connected ? (wallet.shortAddr || auth.nickname || auth.email || 'Account')
    : (auth.nickname || auth.email || 'Account')
  );
  let menuOpen = $state(false);
  function toggleMenu() { menuOpen = !menuOpen; }
  function closeMenu() { menuOpen = false; }
  function navTo(path: string) { closeMenu(); goto(path); }

  async function handleLogout() {
    closeMenu();
    const { logoutAuth } = await import('$lib/api/auth');
    const { clearAuthenticatedUser } = await import('$lib/stores/authStore');
    const { disconnectWallet } = await import('$lib/stores/walletStore');
    await logoutAuth();
    clearAuthenticatedUser();
    disconnectWallet();
  }

  function handleSignIn() {
    closeMenu();
    openWalletModal();
  }
</script>

<div class="mobile-top-bar">
  <a class="logo-link" href="/" aria-label="Home">
    <span class="logo">COGOCHI</span>
  </a>
  <span class="sep">│</span>

  <button class="chip symbol-chip" onclick={() => onSymbolTap?.()}>
    {symbol.replace('USDT', '')} <span class="dim">/ USDT</span> ▾
  </button>

  <button class="chip tf-chip" onclick={cycleTF}>
    {timeframe} ▾
  </button>

  <span class="spacer"></span>

  <!-- workMode pills (OBS/ANL/EXE) -->
  <div class="work-mode-group" role="group" aria-label="Work mode">
    {#each WORK_MODES as wm}
      <button
        class="wm-btn"
        class:active={workMode === wm.id}
        onclick={() => shellStore.setWorkMode(wm.id)}
        type="button"
        aria-pressed={workMode === wm.id}
      >{wm.label}</button>
    {/each}
  </div>

  <button
    class="menu-btn"
    onclick={toggleMenu}
    type="button"
    aria-label="Menu"
    aria-expanded={menuOpen}
    title="메뉴"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <line x1="2" y1="4" x2="14" y2="4"/>
      <line x1="2" y1="8" x2="14" y2="8"/>
      <line x1="2" y1="12" x2="14" y2="12"/>
    </svg>
  </button>

  <button class="mode-btn" onclick={() => onModeTap?.()} title="모드 선택">···</button>
</div>

<!-- Status strip — verdict / freshness / time / verdict count. Always visible. -->
<div class="status-strip" aria-label="Market context">
  {#if lastVerdictKind}
    <span
      class="verdict-mini"
      class:vp-long={lastVerdictKind === 'LONG'}
      class:vp-short={lastVerdictKind === 'SHORT'}
      class:vp-wait={lastVerdictKind === 'WAIT'}
    >{lastVerdictKind}</span>
    <span class="strip-sep">·</span>
  {/if}
  <span class="strip-item">v<strong>{verdicts}</strong></span>
  <span class="strip-spacer"></span>
  {#if freshnessSec !== null}
    <span class="strip-item {freshnessClass}" title="Data freshness">{freshnessSec}s</span>
    <span class="strip-sep">·</span>
  {/if}
  <span class="strip-time">{currentTime}</span>
</div>

{#if menuOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="menu-backdrop" onclick={closeMenu}></div>
  <nav class="menu-drawer" aria-label="Terminal tools">
    {#if isAuthenticated}
      <div class="menu-account">
        <span class="menu-dot"></span>
        <span class="menu-account-label">{accountLabel}</span>
      </div>
      <div class="menu-sep"></div>
    {/if}
    {#each TOOL_MENU_ITEMS as item (item.href)}
      <button class="menu-item" onclick={() => navTo(item.href)} type="button">{item.label}</button>
    {/each}
    <div class="menu-sep menu-sep-soft"></div>
    <div class="menu-locale">
      <LocaleToggle />
    </div>
    <div class="menu-sep"></div>
    {#if isAuthenticated}
      <button class="menu-item menu-danger" onclick={handleLogout} type="button">Disconnect</button>
    {:else}
      <button class="menu-item menu-primary" onclick={handleSignIn} type="button">SIGN IN</button>
    {/if}
  </nav>
{/if}

<style>
  .mobile-top-bar {
    height: var(--term-mobile-bar-h, 44px);
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    gap: var(--term-gap-2, 8px);
    padding: 0 var(--term-gap-2, 8px);
    background: var(--term-surface-1, var(--g1));
    border-bottom: 1px solid var(--term-border, var(--g3));
    z-index: 30;
  }

  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }
  .logo-link:active .logo { opacity: 0.7; }

  .logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 600;
    color: var(--brand);
    letter-spacing: 0.14em;
  }

  .sep {
    color: var(--g4);
    font-size: 11px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 1px;
    padding: 0 8px;
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g4));
    border-radius: var(--term-radius-sm, 6px);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;
    color: var(--g9);
    cursor: pointer;
    transition: background 0.12s;
  }

  .chip:active {
    background: var(--term-surface-3, var(--g3));
  }

  .symbol-chip {
    min-width: 82px;
  }

  .tf-chip {
    font-size: 11px;
    min-width: 46px;
    justify-content: center;
  }

  .dim {
    color: var(--g6);
    font-weight: 400;
    font-size: var(--ui-text-xs);
  }

  .spacer {
    flex: 1;
  }

  .menu-btn {
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--g6);
    cursor: pointer;
    transition: color 0.12s, background 0.12s;
    border-radius: var(--term-radius-sm, 6px);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }
  .menu-btn:active {
    color: var(--g9);
    background: rgba(255, 255, 255, 0.06);
  }

  .mode-btn {
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--g5);
    font-size: 13px;
    cursor: pointer;
    letter-spacing: -0.05em;
    transition: color 0.12s;
    flex-shrink: 0;
  }
  .mode-btn:active { color: var(--g8); }

  /* W-T12: workMode group */
  .work-mode-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .wm-btn {
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    font-weight: 600;
    letter-spacing: 0.06em;
    background: transparent;
    color: rgba(250, 247, 235, 0.3);
    border: 0.5px solid transparent;
    border-radius: var(--term-radius-sm, 6px);
    padding: 0 7px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: color 0.12s, background 0.12s, border-color 0.12s;
    -webkit-tap-highlight-color: transparent;
  }

  .wm-btn:active { background: rgba(255, 255, 255, 0.06); }

  .wm-btn.active {
    color: rgba(250, 247, 235, 0.88);
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(var(--brand-rgb, 219, 154, 159), 0.2);
  }

  /* ── Status strip — sits directly below MobileTopBar (24px) ── */
  .status-strip {
    height: 22px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 var(--term-gap-3, 12px);
    background: var(--term-surface-1, var(--g1));
    border-bottom: 1px solid var(--term-border, var(--g3));
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--ui-text-xs);
    color: var(--g6);
    letter-spacing: 0.04em;
  }
  .strip-sep { color: var(--g4); }
  .strip-item { display: inline-flex; align-items: center; gap: 2px; }
  .strip-item strong { color: var(--g8); }
  .strip-spacer { flex: 1; }
  .strip-time { color: var(--g7); font-size: var(--ui-text-xs); }
  .verdict-mini {
    display: inline-block;
    padding: 0 5px;
    font-size: var(--ui-text-xs);
    font-weight: 700;
    letter-spacing: 0.08em;
    border-radius: 999px;
    border: 1px solid var(--term-border, var(--g4));
    background: var(--term-surface-2, var(--g2));
    color: var(--amb, #f5a623);
  }
  .verdict-mini.vp-long  { color: var(--pos); border-color: color-mix(in srgb, var(--pos) 40%, transparent); }
  .verdict-mini.vp-short { color: var(--neg); border-color: color-mix(in srgb, var(--neg) 40%, transparent); }
  .verdict-mini.vp-wait  { color: var(--amb, #d6a347); border-color: color-mix(in srgb, var(--amb, #d6a347) 40%, transparent); }
  .fresh-good { color: var(--pos); }
  .fresh-warn { color: var(--amb, #d6a347); }
  .fresh-stale { color: var(--neg); }

  /* ── Global menu drawer (PR5a) ── */
  .menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 198;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }
  .menu-drawer {
    position: fixed;
    top: 8px;
    right: 8px;
    z-index: 199;
    min-width: 180px;
    max-width: calc(100vw - 16px);
    background: linear-gradient(180deg, rgba(14, 14, 16, 0.98), rgba(8, 8, 10, 0.98));
    border: 1px solid var(--term-border-strong, rgba(249, 216, 194, 0.1));
    border-radius: var(--term-radius-md, 10px);
    box-shadow: var(--term-shadow-float, 0 12px 32px rgba(0,0,0,0.35));
    padding: 6px 0;
    display: flex;
    flex-direction: column;
  }
  .menu-account {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 14px 6px;
    font-family: var(--sc-font-body, sans-serif);
    font-size: var(--ui-text-xs);
    color: rgba(250, 247, 235, 0.6);
  }
  .menu-account-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160px;
  }
  .menu-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(219, 154, 159, 0.9);
    box-shadow: 0 0 6px rgba(219, 154, 159, 0.4);
    flex-shrink: 0;
  }
  .menu-item {
    width: 100%;
    font-family: var(--sc-font-body, sans-serif);
    font-size: 13px;
    font-weight: 600;
    color: rgba(250, 247, 235, 0.78);
    background: none;
    border: none;
    padding: 11px 14px;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s, color 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  .menu-item:active {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(250, 247, 235, 0.96);
  }
  .menu-danger { color: rgba(255, 107, 107, 0.85); }
  .menu-danger:active { background: rgba(255, 89, 89, 0.1); color: #ff6b6b; }
  .menu-primary { color: rgba(219, 154, 159, 0.95); }
  .menu-primary:active { background: rgba(219, 154, 159, 0.1); }
  .menu-sep {
    height: 1px;
    background: rgba(249, 216, 194, 0.07);
    margin: 4px 0;
  }
  .menu-sep-soft {
    background: rgba(249, 216, 194, 0.035);
    margin: 2px 0;
  }
  .menu-locale {
    display: flex;
    justify-content: flex-start;
    padding: 6px 14px;
  }
</style>
