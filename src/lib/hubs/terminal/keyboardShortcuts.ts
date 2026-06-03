/**
 * Single source of truth for Terminal keyboard shortcuts.
 *
 * Keep three things aligned:
 *   1. The actual key dispatch in TerminalHub.svelte's onKey handler.
 *   2. The labels rendered by the ⌘/ shortcut overlay (next commit).
 *   3. The static lookup tables (TF list, drawing tool map) the dispatch
 *      consumes — hoisted here so they are not re-allocated on every key
 *      press.
 *
 * Every entry includes both `display` (what the overlay shows, including
 * the ⌘/⇧/⌥ glyphs in macOS-canonical order) and `label` (a short imperative
 * description). The `group` lets the overlay render shortcuts in cohorts.
 */

import type { DrawingTool } from './shell.store';

/** Display order matches the chart toolbar TF strip; kept stable so muscle
 *  memory ("4 = 30m") survives reshuffles. Ordinal index is 1-based on the
 *  number key (key '1' → tfs[0]). */
export const TF_KEYS: readonly string[] = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'] as const;

/** Drawing tool key bindings. `t/h/v/e/r/f/l` chosen to match TradingView
 *  convention. Lookup is O(1) and the map is allocated once at module
 *  evaluation, not per keystroke (the previous inline literal was rebuilt
 *  ~hundreds of times per second under heavy use). */
export const DRAWING_TOOL_KEYS: Readonly<Record<string, DrawingTool>> = Object.freeze({
  t: 'trendLine',
  h: 'horizontalLine',
  v: 'verticalLine',
  e: 'extendedLine',
  r: 'rectangle',
  f: 'fibRetracement',
  l: 'textLabel',
});

export type ShortcutGroup =
  | 'panels'
  | 'tabs'
  | 'tools'
  | 'mode'
  | 'watchlist'
  | 'general';

export interface ShortcutDef {
  /** Human-rendered key combo for the overlay (⌘P, ⌘\, etc.). */
  display: string;
  /** Short imperative description ("Toggle command palette"). */
  label: string;
  /** Section bucket for the overlay UI. */
  group: ShortcutGroup;
}

export const SHORTCUTS: readonly ShortcutDef[] = [
  // ── Panels ──
  { display: '⌘P / ⌘K', label: 'Command palette', group: 'general' },
  { display: '⌘\\',     label: 'Toggle AI panel wide', group: 'panels' },
  { display: '⌘0',      label: 'Reset panels',         group: 'panels' },
  { display: '[ / ⌘[',  label: 'Toggle watchlist',     group: 'panels' },
  { display: '] / ⌘]',  label: 'Cycle AI panel',       group: 'panels' },

  // ── Tabs / chart ──
  { display: '⌘T',  label: 'New trade tab',  group: 'tabs' },
  { display: '⌘W',  label: 'Close tab',      group: 'tabs' },
  { display: '⌘I',  label: 'Indicator catalog', group: 'general' },

  // ── Mode ──
  { display: '⌘1',  label: 'Trade mode',   group: 'mode' },
  { display: '⌘2',  label: 'Train mode',   group: 'mode' },
  { display: '⌘3',  label: 'Flywheel mode', group: 'mode' },

  // ── Tools ──
  { display: 'b',   label: 'Range select',     group: 'tools' },
  { display: '1-8', label: 'Timeframe (1m…1d)', group: 'tools' },
  { display: 't',   label: 'Trend line',       group: 'tools' },
  { display: 'h',   label: 'Horizontal line',  group: 'tools' },
  { display: 'v',   label: 'Vertical line',    group: 'tools' },
  { display: 'e',   label: 'Extended line',    group: 'tools' },
  { display: 'r',   label: 'Rectangle',        group: 'tools' },
  { display: 'f',   label: 'Fib retracement',  group: 'tools' },
  { display: 'l',   label: 'Text label',       group: 'tools' },
  { display: 'Esc', label: 'Cancel current',   group: 'tools' },

  // ── Watchlist ──
  { display: 'j',     label: 'Watchlist down',     group: 'watchlist' },
  { display: 'k',     label: 'Watchlist up',       group: 'watchlist' },
  { display: 'Enter', label: 'Open watchlist symbol', group: 'watchlist' },
  { display: 'Space', label: 'Add chart symbol to watchlist', group: 'watchlist' },

  // ── AI ──
  { display: '/',  label: 'Focus AI input',  group: 'general' },
  { display: '⌘L', label: 'Focus AI search', group: 'general' },
  { display: '⌘/', label: 'Show this overlay', group: 'general' },
] as const;

/** Pre-grouped view used by the overlay. Computed once at import time. */
export const SHORTCUT_GROUPS: ReadonlyArray<{ group: ShortcutGroup; items: readonly ShortcutDef[] }> =
  (['general', 'panels', 'tabs', 'mode', 'tools', 'watchlist'] as const).map((g) => ({
    group: g,
    items: SHORTCUTS.filter((s) => s.group === g),
  }));
