<script lang="ts">
  import { onMount } from 'svelte';
  import TabBar from './TabBar.svelte';
  import StatusBar from './StatusBar.svelte';
  import WatchlistRail from './panels/WatchlistRail/WatchlistRail.svelte';
  import AlertFeedPanel from './panels/AlertFeedPanel.svelte';
  import AltScanPanel from './panels/AltScanPanel.svelte';
  import OrderbookMonitor from './panels/OrderbookMonitor.svelte';
  import LeftPatternPanel from './panels/LeftPatternPanel.svelte';
  import FloatingPanel from './FloatingPanel.svelte';
  import { floatingPanels } from './floatingPanels.store';
  import ChartToolbar from './L1/ChartToolbar.svelte';
  import Splitter from './Splitter.svelte';
  import TradeMode from './workspace/TradeMode.svelte';
  import WorkspaceStage from './workspace/WorkspaceStage.svelte';
  import BelowFoldSection from './workspace/BelowFoldSection.svelte';
  import { get } from 'svelte/store';
  import { shellStore, activeMode, activeTab, activeTabState, verdictCount, modelDelta, allVerdicts } from './shell.store';
  import { chartFreshness } from '$lib/stores/chartFreshness';
  import { viewportTier } from '$lib/stores/viewportTier';
  import { mobileMode } from '$lib/stores/mobileMode';
  import { surfaceMode } from '$lib/stores/surfaceMode';
  import InternalSurfaceSheet from './InternalSurfaceSheet.svelte';
  import MobileTopBar from './MobileTopBar.svelte';
  import { chartSaveMode, selectedRange } from '$lib/stores/chartSaveMode';
  import { rangeContext } from '$lib/stores/rangeContext';
  import ResearchPanel from './workspace/ResearchPanel.svelte';
  import RangeSelectionPanel from '$lib/shared/chart/overlays/RangeSelectionPanel.svelte';
  import type { JudgeVerdict } from '$lib/shared/chart/overlays/RangeSelectionPanel.svelte';
  import { buildIndicatorSnapshotFromRange } from '$lib/terminal/buildIndicatorSnapshotFromRange';
  import type { RangeSelectionBar } from '$lib/terminal/rangeSelectionCapture';
  // W-0541 PR2-A: selection handoff utilities + PR3-C deploy gate
  import {
    createAlertFromSelection,
    sendSelectionToPatterns,
    sendSelectionToLab,
  } from '$lib/hubs/terminal/handoff/selectionHandoff';
  import type { DeployGateVerdict } from '$lib/shared/chart/overlays/RangeSelectionPanel.svelte';
  import { traderProfile } from '$lib/stores/traderProfile';
  import SymbolPickerSheet from './SymbolPickerSheet.svelte';
  import ModeSheet from './ModeSheet.svelte';
  import IndicatorSettingsSheet from './IndicatorSettingsSheet.svelte';
  import IndicatorCatalogModal from '$lib/components/indicators/IndicatorCatalogModal.svelte';
  import DrawingRail from './panels/DrawingRail.svelte';
  import { TF_KEYS, DRAWING_TOOL_KEYS } from './keyboardShortcuts';
  import CommandPalette from '$lib/shared/panels/CommandPalette.svelte';
  import ShortcutOverlay from './ShortcutOverlay.svelte';
  import TerminalHoldTimeAdapter from './panels/TerminalHoldTimeAdapter.svelte';
  import { track } from '$lib/analytics';
  import { trackPanelFoldToggle } from './telemetry';
  import SaveRangeToast from './workspace/SaveRangeToast.svelte';
  import { startAlertPolling, alertCount } from './inbox/inboxStore';
  import { pendingChartTs, selectedPatternSlug } from './deeplink.store';
  import { replaceState, afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { authStore } from '$lib/stores/authStore';
  import DesktopOnboarding from './DesktopOnboarding.svelte';

  // ── W-0395: HoldTime stats for StatusBar ──────────────────────────────────
  let holdP50 = $state<number | null>(null);
  let holdP90 = $state<number | null>(null);

  // ── W-0589: Below-fold panel toggle ───────────────────────────────────────
  let bfVisible = $state(false);
  const BF_H = 260;

  // ── Right rail tabs (AI / SIGNAL / REVIEW) ───────────────────────────────
  // REVIEW (formerly INBOX) was previously only reachable on mobile via
  // InternalSurfaceSheet. Desktop quietly ignored ?tab=inbox deeplinks
  // (e.g. from Dashboard's VerdictQueue → "/cogochi?tab=inbox"), leaving
  // the user stranded on AI with no way to clear pending verdicts.
  // Now a real first-class right-rail tab. ?tab=inbox still works as alias.
  type RightTab = 'ai' | 'decision' | 'signal' | 'review';
  let rightPanelTab = $state<RightTab>('ai');
  type LeftTab = 'scan' | 'flow' | 'signal';
  let leftTab = $state<LeftTab>('scan');
  type FlowSubTab = 'whale' | 'alt' | 'ob';
  let leftFlowSubTab = $state<FlowSubTab>('whale');
  let signalUnreviewedCount = $state(0);
  let pendingVerdictCount = $state(0);
  let pendingVerdictsUnauthorized = $state(false);
  let AIAgentPanelComp = $state<any>(null);
  let DecisionDeckComp = $state<any>(null);
  let SignalPanelComp = $state<any>(null);
  let VerdictInboxPanelComp = $state<any>(null);
  let SymbolPickerComp = $state<any>(null);
  let rightRailLoaded = $state<{ ai: boolean; decision: boolean; signal: boolean; review: boolean }>({
    ai: false,
    decision: false,
    signal: false,
    review: false,
  });
  let desktopSymbolPickerLoading = $state(false);
  let desktopSymbolPickerPromise: Promise<void> | null = null;

  // lastTabSwitchTs is bumped on any *manual* tab switch. Auto-surface logic
  // below consults this to avoid yanking the panel away from a user who just
  // chose where to look.
  let lastTabSwitchTs = $state(0);
  /** How long a manual tab choice "sticks" before auto-surface can override
   *  it. 30s is long enough that a deliberate user click survives an alert
   *  arriving 5s later, short enough that drag-select 30 minutes after a
   *  manual switch can still bring up AI without feeling stale. */
  const AUTO_SURFACE_GRACE_MS = 30_000;
  function selectRightTab(tab: RightTab, source: 'manual' | 'auto' = 'manual') {
    if (rightPanelTab === tab) return;
    if (source === 'auto' && Date.now() - lastTabSwitchTs < AUTO_SURFACE_GRACE_MS) return;
    rightPanelTab = tab;
    void ensureRightRailComponent(tab);
    if (source === 'manual') {
      lastTabSwitchTs = Date.now();
      if (typeof window !== 'undefined' && routerReady) {
        const url = new URL(window.location.href);
        if (url.searchParams.get('tab') !== tab) {
          url.searchParams.set('tab', tab);
          replaceState(url.toString(), $page.state);
        }
      }
    }
  }

  async function ensureRightRailComponent(tab: RightTab): Promise<void> {
    if (rightRailLoaded[tab]) return;
    if (tab === 'ai') {
      const mod = await import('./panels/AIAgentPanel/AIAgentPanel.svelte');
      AIAgentPanelComp = mod.default;
    } else if (tab === 'decision') {
      const mod = await import('./panels/decision/DecisionDeck.svelte');
      DecisionDeckComp = mod.default;
    } else if (tab === 'signal') {
      const mod = await import('./panels/SignalPanel.svelte');
      SignalPanelComp = mod.default;
    } else if (tab === 'review') {
      const mod = await import('./peek/VerdictInboxPanel.svelte');
      VerdictInboxPanelComp = mod.default;
    }
    rightRailLoaded = { ...rightRailLoaded, [tab]: true };
  }

  async function ensureDesktopSymbolPicker(): Promise<void> {
    if (SymbolPickerComp) return;
    if (!desktopSymbolPickerPromise) {
      desktopSymbolPickerLoading = true;
      desktopSymbolPickerPromise = import('./workspace/SymbolPicker.svelte')
        .then((mod) => {
          SymbolPickerComp = mod.default;
        })
        .finally(() => {
          desktopSymbolPickerLoading = false;
        });
    }
    await desktopSymbolPickerPromise;
  }

  async function refreshSignalCount() {
    try {
      const res = await fetch('/api/screener/signals?unreviewed=true&limit=1');
      const data = await res.json() as { count?: number };
      signalUnreviewedCount = data.count ?? 0;
    } catch { /* non-critical */ }
  }

  async function refreshPendingVerdictCount() {
    if (!$authStore.hydrated || !$authStore.authenticated) return;
    if (pendingVerdictsUnauthorized) return;
    try {
      const res = await fetch('/api/captures/outcomes?status=outcome_ready&limit=100');
      if (!res.ok) {
        if (res.status === 401) pendingVerdictsUnauthorized = true;
        return;
      }
      const data = await res.json() as { items?: unknown[] };
      pendingVerdictCount = (data.items ?? []).length;
    } catch { /* non-critical */ }
  }

  let paletteOpen = $state(false);
  let paletteQ = $state('');
  let shortcutOverlayOpen = $state(false);
  let mobileTF = $state('4h');
  let mobileSymbol = $state('BTCUSDT');
  let initialDecideId = $state<string | null>(null);

  // ── W-0392: Judge-Save flywheel state ─────────────────────────────────────
  let judgeLoading = $state(false);
  let judgeVerdict = $state<JudgeVerdict | null>(null);

  // ── Pattern recall (core loop: drag → recall → verdict → Layer C) ─────────
  interface PatternMatch { slug: string; label: string; similarity: number; outcome: string; }
  let recallResults = $state<PatternMatch[]>([]);
  let recallLoading = $state(false);

  async function handleRecall(): Promise<void> {
    const range = $selectedRange;
    if (!range) return;
    recallLoading = true;
    try {
      const res = await fetch('/api/patterns/recall', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          symbol: desktopSymbol,
          timeframe: $activeTabState.timeframe ?? '4h',
          fromTime: range.from,
          toTime: range.to,
        }),
      });
      if (!res.ok) throw new Error(`recall ${res.status}`);
      const data = (await res.json()) as { patterns: PatternMatch[] };
      recallResults = data.patterns ?? [];
    } catch (e) {
      console.error('[core-loop] recall failed', e);
    } finally {
      recallLoading = false;
    }
  }

  // Auto-recall: fire as soon as both anchors are set (no button click needed).
  $effect(() => {
    const range = $selectedRange;
    if (!range) { recallResults = []; return; }
    handleRecall();
  });

  // ── Auto-surface logic (CPO P0) ──────────────────────────────────────────
  // Right rail tab is one slot but three concerns compete for it (AI for
  // analysis, SIGNAL for screener pings, INBOX for verdicts). Make the
  // panel react to *what just happened* instead of forcing the user to
  // remember which tab to click. All three respect the AUTO_SURFACE_GRACE_MS
  // gate inside selectRightTab(), so a deliberate manual choice in the last
  // 30s wins over any auto-surface attempt.

  // Range mode entered → AI tab. The user just selected a region; the
  // expected follow-up is "analyze it / judge it", which AI owns.
  $effect(() => {
    if ($chartSaveMode.active) selectRightTab('ai', 'auto');
  });

  // Pending verdict count went up → INBOX. Capture-save just produced a
  // new outcome_ready row. We surface the inbox so the user labels it
  // while context is hot.
  // null-seed pattern: first run records baseline only, never auto-surfaces
  // on initial mount (the panel boots into 'ai' by design).
  let _prevPending: number | null = null;
  $effect(() => {
    const cur = pendingVerdictCount;
    if (_prevPending !== null && cur > _prevPending) selectRightTab('review', 'auto');
    _prevPending = cur;
  });

  // New screener alert arrived → SIGNAL. alertCount is the polled inbox
  // alerts list (5s interval, set up in onMount via startAlertPolling).
  let _prevAlerts: number | null = null;
  $effect(() => {
    const cur = $alertCount;
    if (_prevAlerts !== null && cur > _prevAlerts) selectRightTab('signal', 'auto');
    _prevAlerts = cur;
  });

  // Pending count also bumps right after handleSaveWithVerdict /
  // handleSaveOnly, but those clear the chart save mode synchronously which
  // resets the AI auto-surface gate. Refresh the count immediately on save
  // completion so the INBOX auto-surface fires without waiting 60s.
  function bumpPendingCountSoon() {
    // Saves take a few hundred ms to land in /api/captures/outcomes due to
    // the engine round-trip. Two short retries cover the common case
    // without holding a request open.
    setTimeout(refreshPendingVerdictCount, 600);
    setTimeout(refreshPendingVerdictCount, 2000);
  }

  /** Bars sliced to the selected anchor range (anchorA..anchorB). */
  const slicedBars = $derived.by<RangeSelectionBar[]>(() => {
    const range = $selectedRange;
    const payload = $chartSaveMode.payload;
    if (!range || !payload?.klines) return [];
    return payload.klines
      .filter((k: { time: number }) => k.time >= range.from && k.time <= range.to)
      .map((k: { time: number; open: number; high: number; low: number; close: number; volume: number }) => ({
        time: k.time,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume ?? 0,
      }));
  });

  /** Indicator snapshot derived from sliced bars. */
  const rangeSnapshot = $derived(buildIndicatorSnapshotFromRange(slicedBars));

  /** Session-level judge cache key. */
  function judgeCacheKey(from: number, to: number, sym: string, tf: string): string {
    return `judge_cache_${sym}_${tf}_${from}_${to}`;
  }

  async function handleJudge(): Promise<void> {
    const range = $selectedRange;
    if (!range) return;
    const sym = desktopSymbol;
    const tf = $activeTabState.timeframe ?? '4h';
    const snap = rangeSnapshot;
    if (!snap || Object.keys(snap).length < 3) return;

    // Check sessionStorage cache (5 min TTL)
    const cacheKey = judgeCacheKey(range.from, range.to, sym, tf);
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { verdict: v, ts } = JSON.parse(cached) as { verdict: JudgeVerdict; ts: number };
        if (Date.now() - ts < 5 * 60_000) {
          judgeVerdict = v;
          return;
        }
      }
    } catch { /* ignore storage errors */ }

    judgeLoading = true;
    try {
      const res = await fetch('/api/engine/agent/judge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          timeframe: tf,
          indicator_snapshot: snap,
          context: { from_ts: range.from, to_ts: range.to },
        }),
      });
      if (!res.ok) throw new Error(`judge ${res.status}`);
      const verdict = (await res.json()) as JudgeVerdict;
      judgeVerdict = verdict;
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ verdict, ts: Date.now() }));
      } catch { /* ignore */ }
    } catch (e) {
      console.error('[W-0392] judge failed', e);
    } finally {
      judgeLoading = false;
    }
  }

  async function handleSaveWithVerdict(): Promise<void> {
    const range = $selectedRange;
    if (!range) return;
    const sym = desktopSymbol;
    const tf = $activeTabState.timeframe ?? '4h';
    try {
      await fetch('/api/engine/agent/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          timeframe: tf,
          snapshot: rangeSnapshot ?? {},
          decision: judgeVerdict ? { ...judgeVerdict } : undefined,
          trigger_origin: 'agent_judge',
        }),
      });
    } catch (e) {
      console.error('[W-0392] save failed', e);
    }
    judgeVerdict = null;
    recallResults = [];
    chartSaveMode.exitRangeMode();
    bumpPendingCountSoon();
  }

  async function handleSaveOnly(): Promise<void> {
    const range = $selectedRange;
    if (!range) return;
    await chartSaveMode.save({
      symbol: desktopSymbol,
      tf: $activeTabState.timeframe ?? '4h',
      ohlcvBars: slicedBars,
    });
    judgeVerdict = null;
    recallResults = [];
    bumpPendingCountSoon();
  }

  // ── W-0541 PR2-B: handoff handlers (Create Alert / Send to Patterns / Send to Lab) ──
  function selectionPayload() {
    const range = $selectedRange;
    if (!range) return null;
    return {
      symbol: desktopSymbol,
      timeframe: $activeTabState.timeframe ?? '4h',
      fromTime: range.from,
      toTime: range.to,
      snapshot: rangeSnapshot,
    };
  }
  async function handleCreateAlert(): Promise<void> {
    const p = selectionPayload();
    if (p) await createAlertFromSelection(p);
  }
  async function handleSendToPatterns(): Promise<void> {
    const p = selectionPayload();
    if (p) await sendSelectionToPatterns(p);
  }
  async function handleSendToLab(): Promise<void> {
    const p = selectionPayload();
    if (p) await sendSelectionToLab(p);
  }

  // ── W-0541 PR3-C: deploy gate state (fetched from /api/engine/selection/gate) ──
  let deployGate = $state<DeployGateVerdict>('unknown');
  let deployGateReason = $state<string | null>(null);
  let deployGateLoading = $state(false);

  async function fetchDeployGate(): Promise<void> {
    const range = $selectedRange;
    if (!range || !rangeSnapshot) return;
    deployGateLoading = true;
    try {
      const activeIndicators = Object.keys(rangeSnapshot ?? {});
      const res = await fetch('/api/engine/selection/gate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          symbol: desktopSymbol,
          timeframe: $activeTabState.timeframe ?? '4h',
          bar_count: slicedBars.length,
          active_indicator_count: activeIndicators.length,
          has_market_structure: activePanels.length > 0,
          regime_confidence: null,
          independent_events_estimate: recallResults.length || null,
        }),
      });
      if (!res.ok) throw new Error(`gate ${res.status}`);
      const data = (await res.json()) as { verdict: DeployGateVerdict; reason: string };
      deployGate = data.verdict;
      deployGateReason = data.reason;
    } catch (e) {
      console.error('[W-0541] deploy gate fetch failed', e);
      deployGate = 'exploratory_only';
      deployGateReason = 'gate evaluator unreachable — exploratory by default';
    } finally {
      deployGateLoading = false;
    }
  }

  // Re-evaluate gate whenever selection or recall result changes.
  $effect(() => {
    const range = $selectedRange;
    if (!range) {
      deployGate = 'unknown';
      deployGateReason = null;
      return;
    }
    fetchDeployGate();
  });

  /**
   * W-0541 PR3-C: Open SIGNAL panel with a draft DSL prefill derived from the
   * current selection snapshot. The SignalPanel listens to the
   * `terminal:deploy-screener-from-selection` window event and populates its
   * builder accordingly.
   */
  async function handleDeployScreener(): Promise<void> {
    const range = $selectedRange;
    if (!range || deployGate === 'insufficient_evidence') return;

    const snap = rangeSnapshot ?? {};
    const dslParts: string[] = [];
    if (typeof snap.rsi_14 === 'number' && Number.isFinite(snap.rsi_14)) {
      const v = snap.rsi_14;
      if (v < 35) dslParts.push(`rsi14 < ${Math.ceil(v + 5)}`);
      else if (v > 65) dslParts.push(`rsi14 > ${Math.floor(v - 5)}`);
    }
    if (typeof snap.vol_z_20 === 'number' && Number.isFinite(snap.vol_z_20) && snap.vol_z_20 > 1) {
      dslParts.push(`vol_zscore > ${Math.max(1, Math.floor(snap.vol_z_20))}`);
    }
    if (typeof snap.macd_hist === 'number' && Number.isFinite(snap.macd_hist)) {
      dslParts.push(snap.macd_hist >= 0 ? 'macd_hist > 0' : 'macd_hist < 0');
    }
    const draftDsl = dslParts.join(' AND ');

    rightPanelTab = 'signal';
    if (!$shellStore.aiVisible) shellStore.toggleAI();
    if (!$shellStore.aiWide) shellStore.toggleAIWide();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('terminal:deploy-screener-from-selection', {
          detail: {
            symbol: desktopSymbol,
            timeframe: $activeTabState.timeframe ?? '4h',
            dsl: draftDsl,
            snapshot: snap,
            gateVerdict: deployGate,
          },
        }),
      );
    }
    track('selection_handoff', {
      target: 'deploy_screener',
      symbol: desktopSymbol,
      tf: $activeTabState.timeframe ?? '4h',
      gate: deployGate,
    });
  }
  let symbolPickerOpen = $state(false);
  let desktopSymbolPickerOpen = $state(false);
  let desktopSymbolPickerTabId = $state<string | null>(null);
  let modeSheetOpen = $state(false);
  let indicatorSettingsOpen = $state(false);
  let indicatorLibraryOpen = $state(false);
  let activePanels = $state<('fr' | 'oi' | 'cvd' | 'liq')[]>(['fr', 'oi', 'cvd', 'liq']);

  const desktopSymbol = $derived($activeTabState.symbol ?? 'BTCUSDT');
  const aiPaneWidth = $derived(
    $activeTabState.rightPanelExpanded || $shellStore.aiWide
      ? 460
      : Math.max(220, $shellStore.aiWidth),
  );

  // W-0402 PR2: grid layout state for data-attrs → CSS var hooks
  const watchDataAttr = $derived($shellStore.sidebarVisible ? 'open' : 'folded');
  const aiDataAttr = $derived(
    !$shellStore.aiVisible ? 'folded' : $shellStore.aiWide ? 'wide' : 'open'
  );

  // D-10: status-bar mini Verdict / freshness wiring.
  const lastVerdictKind = $derived.by<'LONG' | 'SHORT' | 'WAIT' | null>(() => {
    const entries = Object.values($allVerdicts);
    if (entries.length === 0) return null;
    const last = entries[entries.length - 1];
    if (last === 'agree') return 'LONG';
    if (last === 'disagree') return 'WAIT';
    return null;
  });

  function openDesktopSymbolPicker(tabId?: string) {
    desktopSymbolPickerTabId = tabId ?? $shellStore.activeTabId;
    desktopSymbolPickerOpen = true;
    void ensureDesktopSymbolPicker();
  }

  function appendAIDetail(userText: string, assistantText: string) {
    shellStore.update((s) => ({ ...s, aiVisible: true }));
    shellStore.updateTabState((s) => {
      const chat = s.chat || [];
      const prevUser = chat.at(-2);
      const prevAssistant = chat.at(-1);
      if (
        prevUser?.role === 'user' &&
        prevAssistant?.role === 'assistant' &&
        prevUser.text === userText &&
        prevAssistant.text === assistantText
      ) return s;
      return {
        ...s,
        chat: [...chat, { role: 'user', text: userText }, { role: 'assistant', text: assistantText }],
      };
    });
  }

  // Desktop default: panels visible on first load only (respect user fold thereafter).
  let didInitDesktopLayout = false;
  $effect(() => {
    if ($viewportTier.tier === 'MOBILE') {
      shellStore.update(s => ({ ...s, sidebarVisible: false, aiVisible: false }));
      shellStore.updateTabState(s => ({ ...s, layoutMode: 'C' }));
    } else if (!didInitDesktopLayout) {
      didInitDesktopLayout = true;
      shellStore.update(s =>
        s.sidebarVisible && s.aiVisible ? s : { ...s, sidebarVisible: true, aiVisible: true },
      );
    }
  });

  // W-T7: URL sync — update ?sym=&tf= on active tab change
  let routerReady = $state(false);
  afterNavigate(() => { routerReady = true; });
  $effect(() => {
    if (typeof window === 'undefined') return;
    const sym = $activeTabState.symbol;
    const tf = $activeTabState.timeframe;
    if (!sym) return;
    if (!routerReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set('sym', sym);
    if (tf) url.searchParams.set('tf', tf);
    if (url.toString() === window.location.href) return;
    replaceState(url.toString(), $page.state);
  });

  $effect(() => {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam === 'signal' || tabParam === 'ai') {
      selectRightTab(tabParam, 'manual');
    } else if (tabParam === 'inbox' || tabParam === 'review') {
      selectRightTab('review', 'manual');
    }
  });

  // When range analysis is triggered, open the AI Agent panel to show results inline.
  $effect(() => {
    if ($rangeContext) {
      if (!$shellStore.aiVisible) shellStore.update((s) => ({ ...s, aiVisible: true }));
      selectRightTab('ai', 'manual');
    }
  });

  onMount(() => {
    void ensureRightRailComponent(rightPanelTab);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const workspaceMode = searchParams?.get('m');
    const workspacePanel = searchParams?.get('panel');
    const targetPanel =
      workspacePanel === 'research' || workspacePanel === 'judge' || workspacePanel === 'verdict'
        ? workspacePanel : 'verdict';

    // W-T7: ?sym=&tf= deeplink — apply to active tab on load
    // W-0479: ?symbol= alias (long form used by AlertInbox); pattern + ts deeplink
    const symParam = searchParams?.get('symbol') ?? searchParams?.get('sym');
    const tfParam = searchParams?.get('tf');
    if (symParam) shellStore.setSymbol(symParam.toUpperCase());
    if (tfParam) shellStore.setTimeframe(tfParam);

    const patternParam = searchParams?.get('pattern');
    if (patternParam) {
      selectedPatternSlug.set(patternParam);
    }

    const tsParam = searchParams?.get('ts');
    if (tsParam) {
      const tsNum = Number(tsParam);
      if (Number.isFinite(tsNum) && tsNum > 0) pendingChartTs.set(tsNum);
    }

    // PR7-AC3: ?decide=<verdictId> deeplink — open JDG drawer with that verdict
    const decideParam = searchParams?.get('decide');
    if (decideParam) {
      initialDecideId = decideParam;
      shellStore.setRightPanelTab('judge');
    }

    // ?tab={signal|inbox|review|ai} deeplink — used by Dashboard VerdictQueue
    // (tab=inbox → now review), screener alerts (tab=signal), and external
    // /cogochi links. Treat as user intent (manual) so auto-surface doesn't
    // immediately switch back. 'inbox' kept as backward-compat alias.
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'signal' || tabParam === 'ai') {
      selectRightTab(tabParam, 'manual');
    } else if (tabParam === 'inbox' || tabParam === 'review') {
      selectRightTab('review', 'manual');
    }

    if (workspaceMode === 'detail') {
      if (get(viewportTier).tier === 'MOBILE') {
        mobileMode.setActive('detail');
      } else {
        shellStore.updateTabState((s) => ({ ...s, peekOpen: true, drawerTab: targetPanel }));
      }
    }

    const isInputActive = () => {
      const el = document.activeElement as HTMLElement | null;
      return (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el?.isContentEditable === true
      );
    };

    const onKey = (e: KeyboardEvent) => {
      // Compute lowercase key + input-active flag once. Previous version
      // called e.key.toLowerCase() up to 9 times per keypress and ran
      // isInputActive() up to 8 times — both are pure functions but inputs
      // are non-trivial under heavy typing.
      const mod = e.metaKey || e.ctrlKey;
      const k = e.key;
      const lk = k.toLowerCase();
      const inInput = isInputActive();

      // ── Modifier shortcuts (work regardless of focus) ──
      if (mod) {
        switch (lk) {
          case 'p':
            e.preventDefault();
            paletteOpen = !paletteOpen;
            if (paletteOpen) track('cmdpalette_open', { trigger: 'keyboard_p' });
            return;
          case 'k':
            e.preventDefault();
            paletteOpen = !paletteOpen;
            if (paletteOpen) track('cmdpalette_open', { trigger: 'keyboard' });
            return;
          case 't':
            e.preventDefault();
            shellStore.openTab({ kind: 'trade', title: 'new session' });
            return;
          case 'w': {
            const st = get(shellStore);
            if (st.tabs.length > 1) { e.preventDefault(); shellStore.closeTab(st.activeTabId); }
            return;
          }
          case 'l':
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('cogochi:cmd', { detail: { id: 'focus_ai_search' } }));
            return;
          case 'i':
            e.preventDefault();
            indicatorLibraryOpen = !indicatorLibraryOpen;
            return;
        }
        // ⌘/ — open the shortcut overlay (key, not lk, since '/' is the
        // raw character; we let the same modifier as Cmd-K trigger it).
        if (k === '/') {
          e.preventDefault();
          shortcutOverlayOpen = !shortcutOverlayOpen;
          return;
        }
        switch (k) {
          case '0':
            e.preventDefault();
            shellStore.resetPanels();
            trackPanelFoldToggle({ panel: 'reset', action: 'reset', trigger: 'keyboard', key: '⌘0' });
            return;
          case '\\':
            e.preventDefault();
            shellStore.toggleAIWide();
            trackPanelFoldToggle({ panel: 'ai_wide', action: 'toggle', trigger: 'keyboard', key: '⌘\\' });
            return;
          case '[':
            e.preventDefault();
            shellStore.toggleSidebar();
            trackPanelFoldToggle({ panel: 'sidebar', action: 'toggle', trigger: 'keyboard', key: '⌘[' });
            return;
          case ']':
            e.preventDefault();
            shellStore.toggleAI();
            trackPanelFoldToggle({ panel: 'ai', action: 'toggle', trigger: 'keyboard', key: '⌘]' });
            return;
          case '1':
            e.preventDefault(); shellStore.switchMode('trade'); return;
          case '2':
            e.preventDefault(); shellStore.switchMode('train'); return;
          case '3':
            e.preventDefault(); shellStore.switchMode('flywheel'); return;
        }
      }

      // ── Escape: highest priority, runs even from inside inputs ──
      if (k === 'Escape') {
        if (chartSaveMode.snapshot().active) {
          chartSaveMode.exitRangeMode();
          shellStore.updateTabState(s => ({ ...s, rangeSelection: false }));
        }
        if (get(shellStore).drawingTool !== 'cursor') {
          shellStore.setDrawingTool('cursor');
        }
        if (desktopSymbolPickerOpen) desktopSymbolPickerOpen = false;
        return;
      }

      // ── Bare keys — disabled while typing in inputs ──
      if (inInput) return;

      // Bare [ / ] for fold toggles — preferred over ⌘[/] for one-handed use.
      if (k === '[') {
        e.preventDefault();
        shellStore.toggleSidebar();
        trackPanelFoldToggle({ panel: 'sidebar', action: 'toggle', trigger: 'keyboard', key: '[' });
        return;
      }
      if (k === ']') {
        e.preventDefault();
        shellStore.cycleAI();
        trackPanelFoldToggle({ panel: 'ai', action: 'toggle', trigger: 'keyboard', key: ']' });
        return;
      }

      // Range select (b) — TradingView convention.
      if (lk === 'b') {
        e.preventDefault();
        chartSaveMode.enterRangeMode();
        shellStore.updateTabState(s => ({ ...s, rangeSelection: true }));
        return;
      }

      // Watchlist nav (j/k) — handled before drawing-tool map so 'k'
      // doesn't get swallowed by some future drawing tool addition.
      if (k === 'j') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('watchlist:nav', { detail: { dir: 'down' } }));
        return;
      }
      if (k === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('watchlist:nav', { detail: { dir: 'up' } }));
        return;
      }
      if (k === ' ') {
        e.preventDefault();
        const cur = get(activeTabState).symbol ?? 'BTCUSDT';
        window.dispatchEvent(new CustomEvent('watchlist:add', { detail: { symbol: cur } }));
        return;
      }
      if (k === 'Enter') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('watchlist:select', {}));
        return;
      }

      // Timeframe (1-8) — TF_KEYS hoisted to module scope so we don't
      // rebuild the array on every keypress.
      if (k >= '1' && k <= '8') {
        const tf = TF_KEYS[Number(k) - 1];
        if (tf) {
          e.preventDefault();
          shellStore.setTimeframe(tf);
        }
        return;
      }

      // Drawing tools (t/h/v/e/r/f/l) — frozen module map.
      const tool = DRAWING_TOOL_KEYS[lk];
      if (tool) {
        e.preventDefault();
        shellStore.setDrawingTool(tool);
        return;
      }

      // Focus AI input (/).
      if (k === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('cogochi:cmd', { detail: { id: 'focus_ai_input' } }));
        return;
      }
    };

    const onCmd = (e: CustomEvent) => {
      const c = e.detail;
      if (c.id === 'new_tab') shellStore.openTab({ kind: 'trade', title: 'new session' });
      else if (c.id === 'toggle_side') shellStore.toggleSidebar();
      else if (c.id === 'toggle_ai') shellStore.toggleAI();
      else if (c.id === 'mode_trade') shellStore.switchMode('trade');
      else if (c.id === 'mode_train') shellStore.switchMode('train');
      else if (c.id === 'mode_fly') shellStore.switchMode('flywheel');
      else if (c.id === 'mode_decide') shellStore.setWorkMode('decide');
      else if (c.id === 'new_trade') shellStore.openTab({ kind: 'trade', title: 'new session' });
      else if (c.id === 'open_indicator_settings') { indicatorSettingsOpen = true; }
      else if (c.id === 'open_indicator_library') { indicatorLibraryOpen = true; }
      else if (c.id === 'open_ai_detail') {
        appendAIDetail(c.userText ?? '현재 analyze detail 설명해줘', c.assistantText ?? '');
      }
      else if (c.id === 'analyze_range') {
        const fromIso = new Date((c.fromTime as number) * 1000).toISOString();
        const toIso = new Date((c.toTime as number) * 1000).toISOString();
        appendAIDetail(
          `Analyze ${c.symbol} ${c.timeframe} range ${fromIso} → ${toIso}`,
          ''
        );
      }
      else if (c.id === 'reset') { shellStore.reset(); window.location.reload(); }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('cogochi:cmd', onCmd as EventListener);

    // W-0478: alert inbox polling (5s interval; SSR-guarded inside startAlertPolling)
    const stopAlertPolling = startAlertPolling(5000);

    // Signal & Inbox badge counts. Both are cheap GETs with their own
    // backend caching, so a 60s interval is more than enough — the user
    // doesn't need second-precision pending-verdict counts in the chrome.
    refreshSignalCount();
    refreshPendingVerdictCount();
    const signalCountTimer = setInterval(refreshSignalCount, 60_000);
    const inboxCountTimer = setInterval(refreshPendingVerdictCount, 60_000);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cogochi:cmd', onCmd as EventListener);
      stopAlertPolling();
      clearInterval(signalCountTimer);
      clearInterval(inboxCountTimer);
    };
  });

  $effect(() => {
    void rightPanelTab;
    void ensureRightRailComponent(rightPanelTab);
  });
</script>

<div
  class="app-shell"
  data-watch={watchDataAttr}
  data-ai={aiDataAttr}
  style="
    --watch-w: {$floatingPanels.watchlist?.mode === 'floating'
      ? '20px'
      : ($shellStore.sidebarVisible ? $shellStore.sidebarWidth + 'px' : '20px')};
    --ai-w: {$floatingPanels.aiagent?.mode === 'floating'
      ? '20px'
      : (!$shellStore.aiVisible ? '20px' : $shellStore.aiWide ? '420px' : Math.max(196, $shellStore.aiWidth) + 'px')};
    --bf-panel-h: {bfVisible ? BF_H + 'px' : '0px'};
  "
>
  <!-- Right rail tab bar + content. Defined at top-level template scope
       (above the MOBILE / DESKTOP branch) so they're reachable both from
       the docked `.ai-col` mount inside the desktop branch *and* from
       the FloatingPanel mounts after `</if>` below. The snippet body is
       only ever rendered from the desktop branch (mobile uses
       InternalSurfaceSheet) but the *declaration* has to live where
       every caller can see it — Svelte/TS scope is lexical. -->
  {#snippet rightRailTabs(floating: boolean)}
    <div class="ai-tab-bar" class:ai-tab-bar--floating={floating}>
      <button
        class="ai-tab"
        class:active={rightPanelTab === 'ai'}
        onclick={() => selectRightTab('ai')}
        onpointerenter={() => void ensureRightRailComponent('ai')}
        onfocus={() => void ensureRightRailComponent('ai')}
        data-testid="terminal-right-tab-ai"
      >AI</button>
      <button
        class="ai-tab"
        class:active={rightPanelTab === 'decision'}
        onclick={() => selectRightTab('decision')}
        onpointerenter={() => void ensureRightRailComponent('decision')}
        onfocus={() => void ensureRightRailComponent('decision')}
        title="Decision Deck — Confidence + Half-Kelly Sizer"
        data-testid="terminal-right-tab-decision"
      >DECIDE</button>
      <button
        class="ai-tab"
        class:active={rightPanelTab === 'signal'}
        onclick={() => selectRightTab('signal')}
        onpointerenter={() => void ensureRightRailComponent('signal')}
        onfocus={() => void ensureRightRailComponent('signal')}
        title="Screener signals — Cmd+\\ to widen"
        data-testid="terminal-right-tab-signal"
      >
        SIGNAL{#if signalUnreviewedCount > 0}<span class="signal-badge">{signalUnreviewedCount > 99 ? '99+' : signalUnreviewedCount}</span>{/if}
      </button>
      <button
        class="ai-tab"
        class:active={rightPanelTab === 'review'}
        onclick={() => selectRightTab('review')}
        onpointerenter={() => void ensureRightRailComponent('review')}
        onfocus={() => void ensureRightRailComponent('review')}
        title="Pending verdicts review"
        data-testid="terminal-right-tab-review"
      >
        REVIEW{#if pendingVerdictCount > 0}<span class="signal-badge">{pendingVerdictCount > 99 ? '99+' : pendingVerdictCount}</span>{/if}
      </button>
    </div>
  {/snippet}

  {#snippet rightRailContent()}
    {#if rightPanelTab === 'decision'}
      {#if DecisionDeckComp}
        <DecisionDeckComp symbol={desktopSymbol} />
      {:else}
        <div class="right-rail-skeleton">Loading decision desk…</div>
      {/if}
    {:else if rightPanelTab === 'signal'}
      {#if SignalPanelComp}
        <SignalPanelComp symbol={desktopSymbol} timeframe={$activeTabState.timeframe ?? '4h'} />
      {:else}
        <div class="right-rail-skeleton">Loading signal tools…</div>
      {/if}
    {:else if rightPanelTab === 'review'}
      {#if VerdictInboxPanelComp}
        <div class="inbox-host">
          <VerdictInboxPanelComp />
        </div>
      {:else}
        <div class="right-rail-skeleton">Loading review…</div>
      {/if}
    {:else}
      {#if $rangeContext}
        <ResearchPanel
          inline
          open={true}
          symbol={$rangeContext.symbol}
          tf={$rangeContext.tf}
          viewport={$rangeContext.viewport}
          onClose={() => rangeContext.set(null)}
          onSaved={(id) => { rangeContext.set(null); void id; }}
        />
      {/if}
      {#if AIAgentPanelComp && !$rangeContext}
        <AIAgentPanelComp
          symbol={desktopSymbol}
          timeframe={$activeTabState.timeframe ?? '4h'}
          onSelectSymbol={(s: string) => shellStore.setSymbol(s)}
          initialDecideId={initialDecideId}
        />
      {:else}
        <div class="right-rail-skeleton">Loading AI desk…</div>
      {/if}
    {/if}
  {/snippet}

  {#if $viewportTier.tier === 'MOBILE'}
    <!-- ── MOBILE ── -->
    <MobileTopBar
      symbol={mobileSymbol}
      timeframe={mobileTF}
      workMode={$shellStore.workMode}
      lastVerdictKind={lastVerdictKind}
      lastUpdatedAt={$chartFreshness}
      verdicts={$verdictCount}
      onTFChange={(tf) => (mobileTF = tf)}
      onSymbolTap={() => (symbolPickerOpen = true)}
      onModeTap={() => (modeSheetOpen = true)}
    />
    <!-- W-0498 PR5c: mobile-canvas padding-bottom reserves space for the
         InternalSurfaceSheet peek strip (50px) which sits above BottomTab. -->
    <div class="mobile-canvas">
      {#if $activeMode === 'trade'}
        <TradeMode
          mode={$activeMode}
          tabState={$activeTabState}
          updateTabState={(updater) => shellStore.updateTabState(updater)}
          symbol={mobileSymbol}
          timeframe={mobileTF}
          workMode={$shellStore.workMode}
          mobileView="chart"
          setMobileView={() => {}}
          setMobileSymbol={(s) => (mobileSymbol = s)}
          mobileChartPct={$shellStore.mobileChartPct}
          onResizeMobileChart={(deltaPct) => shellStore.resizeMobileChart(deltaPct)}
          onResetMobileChart={() => shellStore.resetMobileChart()}
        />
      {/if}
    </div>

    <!-- W-0498 PR5c: InternalSurfaceSheet — peek/expanded bottom sheet -->
    <InternalSurfaceSheet symbol={mobileSymbol} timeframe={mobileTF} />
    {#if symbolPickerOpen}
      <SymbolPickerSheet
        currentSymbol={mobileSymbol}
        onSelect={(s) => { mobileSymbol = s; shellStore.setSymbol(s); }}
        onClose={() => (symbolPickerOpen = false)}
      />
    {/if}
    {#if modeSheetOpen}
      <ModeSheet activeMode={$activeMode} onClose={() => (modeSheetOpen = false)} />
    {/if}

    <!-- Inbox is now in InternalSurfaceSheet INBOX tab (W-0498 PR5d) -->
  {:else}
    <!-- ── DESKTOP / TABLET — W-0402 PR2 CSS Grid layout ── -->
    <!-- CommandBar: UNUSED — W-0375 (60px chrome saved) -->

    <!-- grid-area: watchlist — WatchlistRail column with fold chevron.
         Three states: docked-open, docked-folded, and floating (rail
         mounted in <FloatingPanel/> below, this cell becomes a dock-back
         strip). -->
    <div class="watchlist-col">
      {#if $floatingPanels.watchlist?.mode === 'floating'}
        <!-- FLOATING: the rail lives in a draggable window outside the grid.
             This 20px strip is the lane back home — clicking it docks the
             panel without forcing the user to find the floating window's
             ⤡ button (e.g. if it drifted off-screen on a viewport resize). -->
        <button
          class="col-expand-strip col-expand-strip--watch col-expand-strip--undock"
          onclick={() => floatingPanels.dock('watchlist')}
          title="Dock watchlist back to its column"
          aria-label="Dock watchlist"
          data-testid="watchlist-dock-strip"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
      {:else if $shellStore.sidebarVisible}
        <div class="left-tab-bar">
          <button class="left-tab-btn" class:left-tab-btn--active={leftTab === 'scan'} onclick={() => leftTab = 'scan'}>SCAN</button>
          <button class="left-tab-btn" class:left-tab-btn--active={leftTab === 'flow'} onclick={() => leftTab = 'flow'}>FLOW</button>
          <button class="left-tab-btn" class:left-tab-btn--active={leftTab === 'signal'} onclick={() => leftTab = 'signal'}>SCREEN</button>
        </div>
        {#if leftTab === 'scan'}
          <WatchlistRail
            activeSymbol={desktopSymbol}
            onSelectSymbol={(s) => shellStore.setSymbol(s)}
            onNewTab={(s) => shellStore.openTab({ kind: 'trade', title: s, symbol: s })}
            onFloat={() => floatingPanels.float('watchlist')}
          />
        {:else if leftTab === 'flow'}
          <div class="flow-sub-bar">
            <button class="flow-sub-btn" class:flow-sub-btn--active={leftFlowSubTab === 'whale'} onclick={() => leftFlowSubTab = 'whale'}>WHALE</button>
            <button class="flow-sub-btn" class:flow-sub-btn--active={leftFlowSubTab === 'alt'} onclick={() => leftFlowSubTab = 'alt'}>ALT</button>
            <button class="flow-sub-btn" class:flow-sub-btn--active={leftFlowSubTab === 'ob'} onclick={() => leftFlowSubTab = 'ob'}>OB</button>
          </div>
          {#if leftFlowSubTab === 'whale'}
            <AlertFeedPanel />
          {:else if leftFlowSubTab === 'alt'}
            <AltScanPanel />
          {:else}
            <OrderbookMonitor />
          {/if}
        {:else}
          <LeftPatternPanel
            activeSymbol={desktopSymbol}
            onSelectSymbol={(s) => shellStore.setSymbol(s)}
            onOpenSignal={() => selectRightTab('signal')}
          />
        {/if}
        <!-- Fold chevron (right edge): hover-revealed because the column is
             ~140px wide, so the chevron only needs to appear when the user
             intends to interact with the column edge. -->
        <button
          class="col-fold-btn col-fold-watch"
          onclick={() => { shellStore.toggleSidebar(); trackPanelFoldToggle({ panel: 'sidebar', action: 'hide', trigger: 'click' }); }}
          title="Collapse watchlist ([)"
          aria-label="Collapse watchlist"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5L6.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      {:else}
        <!-- FOLDED: the entire 20px strip becomes one big expand button so the
             user doesn't have to hunt for a tiny hover-revealed chevron in a
             narrow gutter. The chevron is *always* visible while folded so
             discoverability is one glance, not one hover. -->
        <button
          class="col-expand-strip col-expand-strip--watch"
          onclick={() => { shellStore.toggleSidebar(); trackPanelFoldToggle({ panel: 'sidebar', action: 'show', trigger: 'click' }); }}
          title="Expand watchlist ([)"
          aria-label="Expand watchlist"
          data-testid="watchlist-expand-strip"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      {/if}
    </div>

    <!-- grid-area: splch — resize handle between watchlist and draw -->
    <div class="splitter-col" style="grid-area: splch;">
      {#if $shellStore.sidebarVisible && $floatingPanels.watchlist?.mode !== 'floating'}
        <Splitter
          orientation="vertical"
          onDrag={(dx) => shellStore.resizeSidebar(dx)}
          onReset={() => shellStore.resetSidebarWidth()}
          ariaLabel="Resize watchlist panel"
        />
      {/if}
    </div>

    <!-- grid-area: draw — DrawingRail (D-4, desktop only) -->
    <div class="draw-col">
      <DrawingRail />
    </div>

    <!-- grid-area: chart — canvas + tabbar + workspace -->
    <div class="canvas-col" style:position="relative">
      {#if $chartSaveMode.active}
        <div class="range-hint">
          {$chartSaveMode.anchorA == null ? 'Click anchor A on chart' : 'Click anchor B on chart'} — <kbd>Esc</kbd> to cancel
        </div>
      {:else}
        <!-- W-0541 PR1-A: Selection trigger lives on the chart canvas, not the read toolbar. -->
        <button
          type="button"
          class="select-range-chip"
          onclick={() => {
            chartSaveMode.enterRangeMode();
            shellStore.updateTabState((s) => ({ ...s, rangeSelection: true }));
            track('selection_start', { trigger: 'chip' });
          }}
          title="Select chart range (B)"
          aria-label="Start range selection"
        >
          <span class="srx-glyph">◰</span>
          <span class="srx-label">Select range</span>
          <kbd class="srx-key">B</kbd>
        </button>
      {/if}
      <TabBar
        tabs={$shellStore.tabs}
        activeTabId={$shellStore.activeTabId}
        setActiveTabId={(id) => shellStore.setActiveTabId(id)}
        onCloseTab={(id) => shellStore.closeTab(id)}
        onNewTab={() => shellStore.openTab({ kind: 'trade', title: 'new session' })}
        sidebarVisible={$shellStore.sidebarVisible}
        toggleSidebar={() => shellStore.toggleSidebar()}
        workspaceMode={$shellStore.workspaceMode}
        workspacePaneIds={$shellStore.workspacePaneIds}
        workspaceImmersivePaneId={$shellStore.workspaceImmersivePaneId}
        onToggleCompare={(id) => shellStore.toggleTabCompare(id)}
        onExpandPane={(id) => shellStore.expandWorkspacePane(id)}
        onSetWorkspaceMode={(mode) => shellStore.setWorkspaceStageMode(mode)}
        onResetWorkspaceStage={() => shellStore.resetWorkspaceStage()}
        onIndicators={() => (indicatorLibraryOpen = true)}
        onReorderTabs={(fromId, toId) => shellStore.reorderTabs(fromId, toId)}
        {activePanels}
        onActivePanelsChange={(p) => { activePanels = p; }}
      />

      <ChartToolbar
        onIndicators={() => (indicatorLibraryOpen = true)}
        onSettings={() => (indicatorSettingsOpen = true)}
        onSymbolTap={() => openDesktopSymbolPicker()}
      />

      <WorkspaceStage
          tabs={$shellStore.tabs}
          activeTabId={$shellStore.activeTabId}
          workMode={$shellStore.workMode}
          workspaceMode={$shellStore.workspaceMode}
          workspacePaneIds={$shellStore.workspacePaneIds}
          workspaceImmersivePaneId={$shellStore.workspaceImmersivePaneId}
          workspaceColumnSplit={$shellStore.workspaceColumnSplit}
          workspaceLeftSplitY={$shellStore.workspaceLeftSplitY}
          workspaceRightSplitY={$shellStore.workspaceRightSplitY}
          onSymbolPickerOpen={(tabId) => openDesktopSymbolPicker(tabId)}
          {activePanels}
          onActivePanelsChange={(p) => { activePanels = p; }}
        />

      <!-- W-0392: RangeSelectionPanel — judge-save flywheel dock -->
      {#if $chartSaveMode.active && $chartSaveMode.anchorA !== null && $chartSaveMode.anchorB !== null}
        <div class="range-selection-dock">
            <RangeSelectionPanel
              symbol={desktopSymbol}
              tf={$activeTabState.timeframe ?? '4h'}
              bars={slicedBars}
              snapshot={rangeSnapshot}
              onJudge={handleJudge}
              onSaveOnly={handleSaveOnly}
              onSave={handleSaveWithVerdict}
              onRecall={handleRecall}
              onCreateAlert={handleCreateAlert}
              onSendToPatterns={handleSendToPatterns}
              onSendToLab={handleSendToLab}
              onDeployScreener={handleDeployScreener}
              deployGate={deployGate}
              deployGateReason={deployGateReason}
              persona={$traderProfile.trader_style}
              loading={judgeLoading}
              recallLoading={recallLoading}
              recallResults={recallResults}
              verdict={judgeVerdict}
            />
        </div>
      {/if}
    </div>

    <!-- grid-area: splai — resize handle between chart and ai.
         Hidden while the AI rail is floating because there's nothing to
         resize against — the floating window has its own corner handle. -->
    <div class="splitter-col" style="grid-area: splai;">
      {#if $shellStore.aiVisible && !$shellStore.aiWide && $floatingPanels.aiagent?.mode !== 'floating'}
        <Splitter
          orientation="vertical"
          onDrag={(dx) => shellStore.resizeAI(dx)}
          onReset={() => shellStore.resetAIWidth()}
          ariaLabel="Resize AI panel"
        />
      {/if}
    </div>

    <!-- grid-area: ai — AIAgentPanel column with fold/wide/float controls.
         Three states (matches the watchlist column on the left): docked-
         open, docked-folded, and floating (rail moves to <FloatingPanel/>
         and this cell collapses to a 20px dock-back strip). -->
    <div class="ai-col" class:wide={$shellStore.aiWide}>
      {#if $floatingPanels.aiagent?.mode === 'floating'}
        <!-- FLOATING: rail lives in the draggable window below; cell is
             a dock-back strip so a user whose floating window drifted
             off-screen always has a way home. -->
        <button
          class="col-expand-strip col-expand-strip--ai col-expand-strip--undock"
          onclick={() => floatingPanels.dock('aiagent')}
          title="Dock AI panel back to its column"
          aria-label="Dock AI panel"
          data-testid="aiagent-dock-strip"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2v6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        </button>
      {:else if !$shellStore.aiVisible}
        <!-- FOLDED: full-strip expand button — same pattern as the watchlist
             folded strip on the left. The chevron is always visible while
             folded so users don't have to remember the panel is foldable. -->
        <button
          class="col-expand-strip col-expand-strip--ai"
          onclick={() => { shellStore.cycleAI(); trackPanelFoldToggle({ panel: 'ai', action: 'show', trigger: 'click' }); }}
          title="Expand AI panel (])"
          aria-label="Expand AI panel"
          data-testid="ai-expand-strip"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M6.5 2L3.5 5L6.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      {:else}
        <!-- DOCKED-OPEN: existing cycle button + tab bar + pane actions
             + content. The float button (⤢) joins the pane-actions
             cluster between wide and collapse. -->
        <button
          class="col-fold-btn col-fold-ai"
          onclick={() => { shellStore.cycleAI(); trackPanelFoldToggle({ panel: 'ai', action: 'toggle', trigger: 'click' }); }}
          title="Cycle AI panel: open → wide → fold (])"
          aria-label="Cycle AI panel state"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        {@render rightRailTabs(false)}
        <div class="ai-pane-actions">
          <button
            class="ai-action-btn"
            onclick={() => { shellStore.toggleAIWide(); trackPanelFoldToggle({ panel: 'ai_wide', action: 'toggle', trigger: 'click' }); }}
            title={$shellStore.aiWide ? 'Narrow AI panel (⌘\\)' : 'Widen AI panel (⌘\\)'}
            aria-label="Toggle AI panel width"
          >
            {#if $shellStore.aiWide}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M3 3L7 5.5L3 8M8 2v7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {:else}
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M8 3L4 5.5L8 8M3 2v7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {/if}
          </button>
          <button
            class="ai-action-btn"
            onclick={() => floatingPanels.float('aiagent')}
            title="Pop out AI panel as floating window"
            aria-label="Pop out AI panel as floating window"
            data-testid="aiagent-float-toggle"
          >⤢</button>
          <button
            class="ai-action-btn"
            onclick={() => { shellStore.toggleAI(); trackPanelFoldToggle({ panel: 'ai', action: 'hide', trigger: 'click' }); }}
            title="Collapse AI panel (⌘])"
            aria-label="Collapse AI panel"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3.5 2L6.5 5L3.5 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        {@render rightRailContent()}
      {/if}
    </div>

    <!-- grid-area: statusbar -->
    <TerminalHoldTimeAdapter onStats={(p50, p90) => { holdP50 = p50; holdP90 = p90; }} />
    <div class="grid-statusbar">
      <StatusBar
        verdicts={$verdictCount}
        modelDelta={$modelDelta}
        sidebarVisible={$shellStore.sidebarVisible}
        lastVerdictKind={lastVerdictKind}
        lastUpdatedAt={$chartFreshness}
        holdP50={holdP50}
        holdP90={holdP90}
      />
      <button
        class="scroll-more-btn"
        class:active={bfVisible}
        onclick={() => (bfVisible = !bfVisible)}
        title={bfVisible ? 'Hide panels' : 'Show panels'}
      >{bfVisible ? '▲' : '▼'}</button>
    </div>
  {/if}

  <!-- Global overlays -->

  <!-- W-0402 PR11: drag-to-save range toast (z:190, centered top, 5s auto-dismiss) -->
  <SaveRangeToast />

  {#if desktopSymbolPickerOpen}
    {#if SymbolPickerComp}
      <SymbolPickerComp
        activePair={desktopSymbol.endsWith('USDT') ? desktopSymbol.replace('USDT', '/USDT') : desktopSymbol}
        onSelect={(s: string) => {
          shellStore.setSymbol(s.replace('/', ''), desktopSymbolPickerTabId ?? undefined);
          desktopSymbolPickerOpen = false;
        }}
        onClose={() => (desktopSymbolPickerOpen = false)}
      />
    {:else if desktopSymbolPickerLoading}
      <div class="terminal-modal-skeleton">Loading market list…</div>
    {/if}
  {/if}

  {#if indicatorSettingsOpen}
    <IndicatorSettingsSheet onClose={() => (indicatorSettingsOpen = false)} />
  {/if}

  <IndicatorCatalogModal
    open={indicatorLibraryOpen}
    onClose={() => (indicatorLibraryOpen = false)}
  />

  <!-- CommandPalette — ⌘K / ⌘P -->
  {#if paletteOpen}
    <CommandPalette
      q={paletteQ}
      onClose={() => { paletteOpen = false; paletteQ = ''; }}
      onChange={(v) => { paletteQ = v; }}
    />
  {/if}

  <!-- Keyboard shortcut overlay — ⌘/ -->
  <ShortcutOverlay open={shortcutOverlayOpen} onClose={() => (shortcutOverlayOpen = false)} />

  <!-- Floating panels — rendered outside the CSS Grid so they can
       position anywhere in the viewport. Both surfaces share the same
       infrastructure; the AI rail reuses the docked tab-bar/content
       snippets so the floating window stays in sync with the panel
       the user has selected (AI / SIGNAL / INBOX). -->
  {#if $floatingPanels.watchlist?.mode === 'floating'}
    <FloatingPanel
      id="watchlist"
      title="Watchlist"
      onDock={() => floatingPanels.dock('watchlist')}
    >
      <WatchlistRail
        activeSymbol={desktopSymbol}
        onSelectSymbol={(s) => shellStore.setSymbol(s)}
        onNewTab={(s) => shellStore.openTab({ kind: 'trade', title: s, symbol: s })}
      />
    </FloatingPanel>
  {/if}

  {#if $floatingPanels.aiagent?.mode === 'floating'}
    <FloatingPanel
      id="aiagent"
      title="AI Agent"
      onDock={() => floatingPanels.dock('aiagent')}
    >
      {@render rightRailTabs(true)}
      {@render rightRailContent()}
    </FloatingPanel>
  {/if}
  <DesktopOnboarding />

  <!-- W-0589: Below-fold panel — grid-area: bf, shown/hidden via --bf-panel-h -->
  <div class="bf-grid-cell" style="display:{bfVisible ? 'block' : 'none'}">
    <BelowFoldSection symbol={desktopSymbol} onClose={() => (bfVisible = false)} />
  </div>
</div>

<style>
  /* ── W-0402 PR2: CSS Grid 4-column app-shell ─────────────────────────────
     Row 0: topbar     (40px)
     Row 1: news       (auto — NewsFlashBar self-hides when empty)
     Row 2: main row   (1fr — watchlist | draw | chart | ai)
     Row 3: statusbar  (28px)
     Column widths controlled by --watch-w / --ai-w (PR1 tokens).
     data-watch / data-ai attrs trigger token overrides defined in tokens.css.
  ── */
  .app-shell {
    --term-border: rgba(255,255,255,0.08);
    --term-border-strong: rgba(255,255,255,0.14);
    --term-surface-0: var(--g0);
    --term-surface-1: var(--g1);
    --term-surface-2: rgba(255,255,255,0.04);
    --term-surface-3: rgba(255,255,255,0.08);
    --term-text-0: rgba(247,242,234,0.94);
    --term-text-1: rgba(247,242,234,0.78);
    --term-text-2: rgba(247,242,234,0.54);
    --term-radius-sm: 6px;
    --term-radius-md: 10px;
    --term-toolbar-btn-h: 22px;
    --term-tabbar-h: 22px;
    --term-mobile-bar-h: 44px;
    --term-mobile-chip-h: 32px;
    --term-rail-input-h: 30px;
    --term-rail-chip-h: 24px;
    --term-list-row-h: 26px;
    --term-list-row-h-compact: 23px;
    --term-section-h: 21px;
    --term-shadow-float: 0 12px 32px rgba(0, 0, 0, 0.35);
    /* W-0432: Terminal hides AppTopBar (showTopBar=false on /cogochi) and
       AppNavRail is fixed-positioned, so the desktop shell has nothing
       flowing above it. Previous code reserved 44px for an AppTopBar that
       never rendered here, leaving a dead band at the top of every terminal
       session. Reclaim it. Mobile branch overrides margin-top:0 below. */
    margin-top: 0;
    height: 100dvh;
    display: grid;
    grid-template-rows: 1fr var(--bf-panel-h, 0px) 20px;
    grid-template-columns:
      var(--watch-w, 160px)
      4px
      20px
      1fr
      4px
      var(--ai-w, 280px);
    grid-template-areas:
      "watchlist splch   draw   chart  splai   ai"
      "bf        bf      bf     bf     bf      bf"
      "statusbar statusbar statusbar statusbar statusbar statusbar";
    background: var(--g0);
    overflow: hidden;
    flex-shrink: 0;
    font-family: var(--fb);
    font-size: 11px;
    color: var(--g9);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .grid-statusbar {
    grid-area: statusbar;
    display: flex;
    min-height: 0;
    overflow: hidden;
  }
  .grid-statusbar > :global(*) { flex: 1; min-width: 0; }
  .scroll-more-btn {
    flex: 0 0 auto;
    width: 28px;
    background: none;
    border: none;
    border-left: 1px solid rgba(255,255,255,0.06);
    color: rgba(247,242,234,0.35);
    cursor: pointer;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.1s, background 0.1s;
  }
  .scroll-more-btn:hover {
    color: rgba(247,242,234,0.8);
    background: rgba(255,255,255,0.04);
  }
  .scroll-more-btn.active {
    color: rgba(247,242,234,0.9);
    background: rgba(255,255,255,0.06);
    border-top: 1px solid rgba(247,242,234,0.25);
  }

  .bf-grid-cell {
    grid-area: bf;
    overflow: hidden;
    border-top: 1px solid rgba(255,255,255,0.08);
  }

  /* Resize handle columns (splch / splai) */
  .splitter-col {
    display: flex;
    align-items: stretch;
    z-index: 20;
    background: transparent;
  }
  .splitter-col :global(.splitter) {
    height: 100%;
    flex: 1;
  }

  /* WatchlistRail column */
  .watchlist-col {
    grid-area: watchlist;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-width: 0;
    border-right: 1px solid var(--term-border, var(--g3));
  }

  .left-tab-bar {
    display: flex;
    flex-shrink: 0;
    border-bottom: 1px solid var(--term-border, var(--g3));
    background: var(--term-surface-0, var(--g0));
  }
  .left-tab-btn {
    flex: 1;
    padding: 5px 0;
    background: none;
    border: none;
    color: var(--term-text-2, var(--g5));
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: color 0.1s, border-bottom 0.1s;
    border-bottom: 2px solid transparent;
  }
  .left-tab-btn:hover { color: var(--term-text-1, var(--g7)); }
  .left-tab-btn--active { color: var(--brand); border-bottom: 2px solid var(--brand); }

  /* FLOW sub-tab bar (WHALE / ALT / OB) */
  .flow-sub-bar {
    display: flex;
    flex-shrink: 0;
    border-bottom: 1px solid var(--term-border, var(--g3));
    background: var(--term-surface-1, var(--g1));
  }
  .flow-sub-btn {
    flex: 1;
    padding: 4px 0;
    background: none;
    border: none;
    color: var(--term-text-2, var(--g5));
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: color 0.1s, border-bottom 0.1s;
    border-bottom: 2px solid transparent;
  }
  .flow-sub-btn:hover { color: var(--term-text-1, var(--g7)); }
  .flow-sub-btn--active { color: var(--brand); border-bottom: 2px solid var(--brand); }

  /* DrawingRail column */
  .draw-col {
    grid-area: draw;
    display: flex;
    overflow: hidden;
    min-width: 0;
    border-right: 1px solid var(--g3);
  }

  /* Chart / canvas column */
  .canvas-col {
    grid-area: chart;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    contain: layout paint;
  }

  /* AI Agent column */
  .ai-col {
    grid-area: ai;
    overflow: hidden;
    contain: layout paint;
    position: relative;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--term-border, var(--g3));
    background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0));
  }
  .ai-col.wide { box-shadow: -4px 0 12px rgba(0, 0, 0, 0.18); }

  /* Fold column buttons — hover-revealed chevrons at col edges. These are
     only shown when the column is *visible*; the folded case uses the
     much-larger .col-expand-strip below. */
  .col-fold-btn {
    position: absolute;
    top: 8px;
    width: 22px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g4));
    border-radius: var(--term-radius-sm, 6px);
    color: var(--term-text-2, var(--g7));
    cursor: pointer;
    opacity: 0.42;
    transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    z-index: 6;
  }
  .watchlist-col:hover .col-fold-btn,
  .ai-col:hover .col-fold-btn { opacity: 0.92; }
  .col-fold-btn:hover {
    background: var(--term-surface-3, var(--g3));
    color: var(--term-text-0, var(--g9));
    border-color: var(--term-border-strong, rgba(255,255,255,0.14));
  }
  .col-fold-btn:focus-visible {
    opacity: 1;
    outline: 2px solid var(--brand);
    outline-offset: 1px;
  }
  /* Watchlist fold btn: right edge */
  .col-fold-watch { right: 2px; }
  /* AI fold btn: left edge */
  .col-fold-ai { left: 2px; }

  /* ── Folded-column expand strip ─────────────────────────────────────────
     When a side panel is folded the column shrinks to ~20px wide. Reaching
     that gutter with the cursor and finding an 18px chevron used to be a
     pixel-perfect chore. Now the *entire* gutter is one big button so the
     user can click anywhere on the strip to bring the panel back. The
     chevron is always visible (no hover requirement) so foldability is
     discoverable even when the user has never seen the panel expanded. */
  .col-expand-strip {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--g6);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
    z-index: 6;
  }
  .col-expand-strip:hover {
    background: var(--term-surface-2, var(--g2));
    color: var(--term-text-0, var(--g9));
  }
  .col-expand-strip:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: -2px;
  }
  .col-expand-strip--watch { border-right: 1px solid var(--g3); }
  .col-expand-strip--ai    { border-left: 1px solid var(--g3); }

  .ai-tab-bar {
    position: relative;
    z-index: 6;
    display: flex;
    align-items: flex-end;
    gap: 10px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--term-border, var(--g3));
    min-height: 34px;
    padding: 0 70px 0 24px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
  }
  /* Floating window has neither the left cycle-button gutter (28px) nor
     the right pane-actions cluster (56px) — both are replaced by the
     FloatingPanel title bar — so collapse the padding to a flush bar. */
  .ai-tab-bar--floating {
    padding: 0 12px;
  }
  .ai-tab {
    flex: 1 1 0;
    min-width: 0;
    min-height: 33px;
    padding: 9px 6px 7px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.1em;
    color: var(--term-text-2, var(--g5));
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s, opacity 0.1s;
  }
  .ai-tab.active { color: var(--brand); border-bottom-color: var(--brand); }
  .ai-tab:hover:not(.active) { color: var(--g7); }
  .ai-tab:focus-visible {
    outline: 2px solid rgba(255, 196, 81, 0.35);
    outline-offset: -2px;
    border-radius: 4px 4px 0 0;
  }

  /* INBOX panel host — VerdictInboxPanel was authored for the mobile peek
     surface; wrap it in a scroll container so the desktop right rail still
     gets the same scroll affordance the AI/Signal panels have. */
  .inbox-host {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    contain: layout paint;
  }
  .right-rail-skeleton {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: var(--term-text-2, var(--g5));
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0)),
      var(--term-surface-1, var(--g1));
  }
  .terminal-modal-skeleton {
    position: fixed;
    inset: 72px 24px 24px 96px;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 72px;
    color: var(--term-text-2, var(--g5));
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    background: rgba(6, 7, 11, 0.82);
    backdrop-filter: blur(10px);
    z-index: 65;
  }
  .signal-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 196, 81, 0.88);
    color: #0a0a0b;
    font-size: 11px;
    font-weight: 700;
    border-radius: 999px;
    padding: 0 4px;
    min-width: 15px;
    height: 14px;
    margin-left: 4px;
    vertical-align: middle;
    line-height: 1;
    transform: scale(0.88);
    transform-origin: left center;
  }

  /* AI action buttons (wide/close) */
  .ai-pane-actions {
    position: absolute;
    top: 5px;
    right: 6px;
    display: inline-flex;
    gap: 4px;
    z-index: 5;
  }
  .ai-action-btn {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g4));
    border-radius: var(--term-radius-sm, 6px);
    color: var(--term-text-2, var(--g7));
    cursor: pointer;
    opacity: 0.68;
    transition: opacity 0.15s ease, background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }
  .ai-col:hover .ai-action-btn { opacity: 0.96; }
  .ai-action-btn:hover {
    background: var(--term-surface-3, var(--g3));
    color: var(--term-text-0, var(--g9));
    border-color: var(--term-border-strong, rgba(255,255,255,0.14));
  }
  .ai-action-btn:focus-visible {
    outline: 2px solid rgba(255, 196, 81, 0.35);
    outline-offset: 1px;
  }

  /* Range hint overlay at top of chart column */
  .range-hint {
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    background: var(--amb-d);
    border: 1px solid var(--amb);
    color: var(--amb);
    font-size: var(--ui-text-xs);
    padding: 3px 10px;
    border-radius: var(--term-radius-sm, 6px);
    pointer-events: none;
    white-space: nowrap;
    letter-spacing: 0.04em;
  }

  /* W-0541 PR1-A: Selection trigger chip on chart canvas (separate from Reading Toolbar) */
  .select-range-chip {
    position: absolute;
    top: 56px;
    right: 12px;
    z-index: 18;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px 4px 7px;
    background: color-mix(in srgb, var(--brand, #4a9eff) 12%, rgba(8, 12, 20, 0.86));
    border: 1px solid color-mix(in srgb, var(--brand, #4a9eff) 36%, transparent);
    border-radius: 6px;
    color: var(--brand, #4a9eff);
    font-family: var(--fb, 'Space Grotesk', sans-serif);
    font-size: var(--ui-text-xs, 11px);
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.08s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.32);
    backdrop-filter: blur(6px);
  }
  .select-range-chip:hover {
    background: color-mix(in srgb, var(--brand, #4a9eff) 22%, rgba(8, 12, 20, 0.86));
    border-color: color-mix(in srgb, var(--brand, #4a9eff) 60%, transparent);
    transform: translateY(-1px);
  }
  .select-range-chip .srx-glyph {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: 12px;
    line-height: 1;
    opacity: 0.92;
  }
  .select-range-chip .srx-label {
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .select-range-chip .srx-key {
    font-family: var(--fm, 'JetBrains Mono', monospace);
    font-size: var(--ui-text-xs, 11px);
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 3px;
    padding: 0 4px;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }
  @media (max-width: 720px) {
    .select-range-chip .srx-label,
    .select-range-chip .srx-key { display: none; }
    .select-range-chip { padding: 4px 6px; }
  }
  .range-hint kbd {
    font-family: inherit;
    background: var(--g4);
    border: 1px solid var(--g5);
    border-radius: 2px;
    padding: 0 3px;
    font-size: var(--ui-text-xs);
    color: var(--g8);
  }

  /* W-0392: judge-save dock — right-side overlay so it never blocks the chart */
  .range-selection-dock {
    position: absolute;
    top: 36px;
    right: 0;
    width: min(320px, 40%);
    bottom: 0;
    z-index: 21;
    overflow-y: auto;
    background: var(--g0, #0a0e14);
    border-left: 1px solid rgba(255,255,255,0.1);
    box-shadow: -8px 0 24px rgba(0,0,0,0.35);
  }

  /* ── Mobile (≤768px): single-column stack ──────────────────────────────── */
  /* W-0474: !important + grid template reset to prevent SSR/hydration FOUC
   * where desktop columns leak into mobile viewport before JS hydrates. */
  @media (max-width: 768px) {
    .app-shell {
      margin-top: 0; /* AppTopBar hidden on mobile terminal (MobileTopBar used instead) */
      height: 100%; /* outer #main-content reserves bottom padding for global mobile nav */
      display: flex !important;
      flex-direction: column;
      grid-template-columns: none !important;
      grid-template-areas: none !important;
      padding-bottom: 0;
      --watch-w: 0px !important;
      --ai-w: 0px !important;
    }

    /* Hide desktop grid columns on mobile (CSS-only — independent of JS tier) */
    .watchlist-col,
    .draw-col,
    .canvas-col,
    .ai-col,
    .splitter-col {
      display: none !important; /* TODO: drawer overlay pattern for mobile */
    }
  }

  /* Mobile canvas / agent host (used in {#if MOBILE} branch) */
  .mobile-canvas {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    contain: layout paint;
  }


</style>
