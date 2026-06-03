<script lang="ts" module>
  /**
   * HubSecondaryNav — single source for every hub's tab strip.
   *
   * Until this commit, five hub layouts (settings/research/account/mmlab/lab)
   * each defined their own `<nav class="hub-tabs">` plus ~40 lines of CSS
   * with two trivially divergent variants:
   *
   *   • route-anchor flavor (research/settings/lab) — pink accent, `<a href>`
   *   • query-button flavor (account/mmlab)         — blue accent, `<button>`
   *
   * All five also re-implemented the same sticky offset, mobile horizontal
   * scroll, padding, border, hover/active states. Drift was already starting
   * (mmlab had `font-family: var(--sc-font-mono)` only on its tabs, etc.).
   *
   * One component owns the markup + styles, the layout file just hands over
   * its `tabs` (or `groups`) and an `accent`. Per-hub copy stays in each
   * layout — only the chrome consolidates here.
   */

  export type RouteTab = {
    kind?: 'route';
    href: string;
    label: string;
  };
  export type QueryTab = {
    kind: 'query';
    /** Value written to `queryParam` when this tab is selected. */
    value: string;
    label: string;
  };
  export type Tab = RouteTab | QueryTab;

  export type TabGroup = {
    /** Optional label printed before the first tab in this group. */
    name?: string;
    tabs: Tab[];
  };

  export type AccentToken = 'pink' | 'blue';
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  interface Props {
    /** Flat tab list — used when the hub has no logical sub-grouping. */
    tabs?: Tab[];
    /** Pre-grouped tabs (Lab — Workflow / Reference / Audit). */
    groups?: TabGroup[];
    /** Query-tab variant base route, e.g. `/account` or `/mmlab`. */
    queryBase?: string;
    /** Query-string key the tab writes to (`tab`, `mode`, …). */
    queryParam?: string;
    /** Caller-resolved current value for the query variant. */
    activeQueryValue?: string;
    /** Border-bottom accent for the active tab. */
    accent?: AccentToken;
    /** Required for a11y so screen readers can distinguish hub bars. */
    ariaLabel: string;
  }

  const {
    tabs,
    groups,
    queryBase = '/',
    queryParam = 'tab',
    activeQueryValue = '',
    accent = 'pink',
    ariaLabel,
  }: Props = $props();

  const path = $derived($page.url.pathname);

  function isRouteActive(href: string): boolean {
    if (path === href) return true;
    // Treat `/lab` as exact-match only so it doesn't claim active state on
    // every `/lab/...` subroute — but anything else uses prefix match.
    if (href === '/lab' || href === '/settings') return false;
    return path.startsWith(href + '/');
  }
  function isQueryActive(value: string): boolean {
    return activeQueryValue === value;
  }
  function isActive(tab: Tab): boolean {
    return tab.kind === 'query' ? isQueryActive(tab.value) : isRouteActive(tab.href);
  }
  function navigateQuery(value: string) {
    goto(`${queryBase}?${queryParam}=${value}`);
  }
  function tabKey(tab: Tab): string {
    return tab.kind === 'query' ? `q:${tab.value}` : `r:${tab.href}`;
  }

  // Single rendering path: collapse the flat case into a one-group shape
  // so the markup loop has exactly one structure to deal with.
  const sections = $derived<TabGroup[]>(groups ?? [{ tabs: tabs ?? [] }]);
</script>

<nav class="hub-secondary-nav hub-secondary-nav--{accent}" aria-label={ariaLabel}>
  {#each sections as group, gi (group.name ?? gi)}
    {#if gi > 0}<span class="group-sep" aria-hidden="true"></span>{/if}

    {#if group.name}
      <div class="hub-group" role="group" aria-label={group.name}>
        <span class="group-label">{group.name}</span>
        {#each group.tabs as tab (tabKey(tab))}
          {#if tab.kind === 'query'}
            <button
              type="button"
              class="hub-tab"
              class:active={isActive(tab)}
              onclick={() => navigateQuery(tab.value)}
            >{tab.label}</button>
          {:else}
            <a
              href={tab.href}
              class="hub-tab"
              class:active={isActive(tab)}
              aria-current={isActive(tab) ? 'page' : undefined}
            >{tab.label}</a>
          {/if}
        {/each}
      </div>
    {:else}
      {#each group.tabs as tab (tabKey(tab))}
        {#if tab.kind === 'query'}
          <button
            type="button"
            class="hub-tab"
            class:active={isActive(tab)}
            onclick={() => navigateQuery(tab.value)}
          >{tab.label}</button>
        {:else}
          <a
            href={tab.href}
            class="hub-tab"
            class:active={isActive(tab)}
            aria-current={isActive(tab) ? 'page' : undefined}
          >{tab.label}</a>
        {/if}
      {/each}
    {/if}
  {/each}
</nav>

<style>
  .hub-secondary-nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    row-gap: 2px;
    gap: 2px;
    padding: 0 20px;
    border-bottom: 1px solid rgba(249, 216, 194, 0.07);
    background: rgba(6, 6, 7, 0.6);
    position: sticky;
    top: var(--app-topbar-h, 32px);
    z-index: 10;
  }

  .hub-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .group-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(250, 247, 235, 0.28);
    padding: 10px 10px 10px 0;
    user-select: none;
  }

  .group-sep {
    display: inline-block;
    width: 1px;
    height: 14px;
    margin: 0 12px;
    background: rgba(249, 216, 194, 0.1);
  }

  .hub-tab {
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(250, 247, 235, 0.38);
    text-decoration: none;
    border: none;
    background: none;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
    cursor: pointer;
  }

  .hub-tab:hover {
    color: rgba(250, 247, 235, 0.65);
  }

  .hub-tab.active {
    color: rgba(250, 247, 235, 0.92);
  }

  /* Accent variants — preserves the prior visual distinction between the
     pink-trim hubs (research/settings/lab) and the blue-trim mode hubs
     (account/mmlab). Pick one with `accent` prop; future hubs default to
     pink unless they explicitly need to read as a "mode switch". */
  .hub-secondary-nav--pink .hub-tab.active {
    border-bottom-color: rgba(219, 154, 159, 0.8);
  }
  .hub-secondary-nav--blue .hub-tab.active {
    border-bottom-color: #60a5fa;
    color: #fff;
  }
  /* Mode-style tabs (blue accent) get the uppercase / letter-spacing
     treatment they shipped with — purely a hold-over from the previous
     account/mmlab styling so this isn't a visual regression. */
  .hub-secondary-nav--blue .hub-tab {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-family: var(--sc-font-mono, monospace);
    padding: 10px 16px;
  }

  @media (max-width: 1024px) {
    .group-sep {
      margin: 0 6px;
    }
    .hub-tab {
      padding: 10px 10px;
    }
    .hub-secondary-nav--blue .hub-tab {
      padding: 10px 12px;
    }
  }

  @media (max-width: 768px) {
    .hub-secondary-nav {
      padding: 0 12px;
      overflow-x: auto;
      scrollbar-width: none;
      flex-wrap: nowrap;
    }
    .hub-secondary-nav::-webkit-scrollbar {
      display: none;
    }
    .hub-tab {
      padding: 10px 10px;
      font-size: 11px;
    }
    .group-label {
      font-size: 11px;
      padding: 10px 6px 10px 0;
    }
    .group-sep {
      margin: 0 4px;
      height: 12px;
    }
  }
</style>
