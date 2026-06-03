<script lang="ts">
  // W-0523 PR1: Signal Inbox + edit→PATCH + delete confirm + save feedback
  import { onMount } from 'svelte';
  import { screenerMarkers } from '$lib/stores/screenerMarkers';
  import { traderProfile } from '$lib/stores/traderProfile';

  let {
    symbol = 'BTCUSDT',
    timeframe = '4h',
  }: { symbol?: string; timeframe?: string } = $props();

  // W-0541 PR3-C: prefill banner from selection deploy
  let prefillBanner = $state<{ from: string; gate: string } | null>(null);

  // ── view state ─────────────────────────────────────────────────────────────
  type View = 'builder' | 'my-screeners' | 'inbox';
  // Persona default: quant → builder (screener DSL), others → my-screeners
  const defaultView: View = $traderProfile.trader_style === 'quant' ? 'builder' : 'my-screeners';
  let view = $state<View>(defaultView);

  // ── builder state ───────────────────────────────────────────────────────────
  let promptText = $state('');
  let dsl = $state('');
  let conditions = $state<Array<{ feature: string; operator: string; value: number }>>([]);
  let showDsl = $state(false);
  let scanning = $state(false);
  let saving = $state(false);
  let scanError = $state('');
  let hits = $state<Array<{ timestamp: number; price: number; bar_iso: string }>>([]);
  let hitStats = $state<{ hitCount: number; winRate: number | null; avgReturn: number | null } | null>(null);
  let scannedSymbol = $state('');
  let screenerName = $state('');
  let saveSuccess = $state(false);
  let editingId = $state<string | null>(null);

  // ── my-screeners state ──────────────────────────────────────────────────────
  let myScreeners = $state<Array<{ id: string; name: string; dsl: string; is_active: boolean; created_at: string }>>([]);
  let screenerLoading = $state(false);

  // ── signal inbox state ──────────────────────────────────────────────────────
  type SignalItem = {
    id: string;
    screener_id: string;
    symbol: string;
    triggered_at: string;
    trigger_price: number | null;
    is_reviewed: boolean;
    review_verdict: string | null;
  };
  let inboxSignals = $state<SignalItem[]>([]);
  let inboxLoading = $state(false);
  let inboxCount = $state(0);
  let reviewingId = $state<string | null>(null);

  const QUICK_PRESETS = [
    'RSI 30 아래이고 볼륨 스파이크',
    'ADX 25 이상이고 MACD 양전환',
    'RSI 70 위이고 거래량 둔화',
  ];

  // ── DSL parse ───────────────────────────────────────────────────────────────
  function parseDslLocal(raw: string): Array<{ feature: string; operator: string; value: number }> {
    const parts = raw.split(/\s+AND\s+/i);
    return parts.flatMap((part) => {
      const m = part.trim().match(/^([\w_]+)\s*(<=|>=|!=|<|>|==|=)\s*([\d.]+)$/);
      if (!m) return [];
      return [{ feature: m[1], operator: m[2] === '=' ? '==' : m[2], value: parseFloat(m[3]) }];
    });
  }

  // ── AI convert: natural language → DSL ─────────────────────────────────────
  async function convertPrompt() {
    if (!promptText.trim()) return;
    const p = promptText.toLowerCase();
    const parts: string[] = [];
    const rsiM = p.match(/rsi\s*(?:below|under|<)?\s*(\d+)/);
    if (rsiM) parts.push(`rsi14 < ${rsiM[1]}`);
    const volM = p.match(/volume?\s*(?:spike|zscore|high)?\s*(?:above|over|>)?\s*([\d.]+)/);
    if (volM) parts.push(`vol_zscore > ${volM[1]}`);
    const adxM = p.match(/adx\s*(?:above|over|>)?\s*(\d+)/);
    if (adxM) parts.push(`adx > ${adxM[1]}`);
    const macdM = p.match(/macd\s*(?:positive|above|>|cross)/);
    if (macdM) parts.push('macd_hist > 0');
    const generated = parts.length ? parts.join(' AND ') : promptText.trim();
    dsl = generated;
    conditions = parseDslLocal(generated);
    scanError = '';
    hits = [];
    hitStats = null;
  }

  function onDslInput(e: Event) {
    dsl = (e.target as HTMLTextAreaElement).value;
    conditions = parseDslLocal(dsl);
    hits = [];
    hitStats = null;
    screenerMarkers.clear(scannedSymbol || symbol, timeframe);
  }

  // ── scan historical ─────────────────────────────────────────────────────────
  async function runScan() {
    if (!dsl.trim() || !conditions.length) {
      scanError = '조건을 먼저 입력하세요';
      return;
    }
    scanning = true;
    scanError = '';
    hits = [];
    hitStats = null;
    scannedSymbol = symbol;
    try {
      const res = await fetch('/api/engine/user-screener/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ dsl, symbol, timeframe, lookback_days: 90 }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        scanError = (d as { detail?: string }).detail ?? `스캔 실패 (${res.status})`;
        return;
      }
      const data = await res.json() as { hits: typeof hits; hit_count: number };
      hits = data.hits ?? [];
      screenerMarkers.set(symbol, timeframe, hits.map((h) => ({ timestamp: h.timestamp, price: h.price, barIso: h.bar_iso })));
      hitStats = { hitCount: hits.length, winRate: null, avgReturn: null };
    } catch {
      scanError = '네트워크 오류';
    } finally {
      scanning = false;
    }
  }

  // ── save/update screener ────────────────────────────────────────────────────
  async function saveScreener() {
    if (!dsl.trim() || !screenerName.trim()) return;
    saving = true;
    saveSuccess = false;
    try {
      const url = editingId ? `/api/screener/my?id=${editingId}` : '/api/screener/my';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: screenerName, dsl, conditions, timeframes: [timeframe] }),
      });
      if (res.ok) {
        saveSuccess = true;
        editingId = null;
        setTimeout(() => { saveSuccess = false; }, 5000);
        await loadMyScreeners();
      }
    } finally {
      saving = false;
    }
  }

  // ── my screeners ────────────────────────────────────────────────────────────
  async function loadMyScreeners() {
    screenerLoading = true;
    try {
      const res = await fetch('/api/screener/my');
      if (res.ok) {
        const d = await res.json() as { screeners: typeof myScreeners };
        myScreeners = d.screeners ?? [];
      }
    } finally {
      screenerLoading = false;
    }
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/screener/my?id=${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    });
    await loadMyScreeners();
  }

  async function deleteScreener(id: string, name: string) {
    if (!confirm(`"${name}" 스크리너를 삭제할까요?`)) return;
    await fetch(`/api/screener/my?id=${id}`, { method: 'DELETE' });
    await loadMyScreeners();
  }

  function switchView(v: View) {
    view = v;
    if (v === 'my-screeners' && !myScreeners.length) loadMyScreeners();
    if (v === 'inbox') loadInbox();
  }

  function loadDslFromScreener(sc: { id: string; name: string; dsl: string }) {
    editingId = sc.id;
    screenerName = sc.name;
    dsl = sc.dsl;
    conditions = parseDslLocal(sc.dsl);
    hits = [];
    hitStats = null;
    view = 'builder';
  }

  function cancelEdit() {
    editingId = null;
    screenerName = '';
    dsl = '';
    conditions = [];
    hits = [];
    hitStats = null;
  }

  // ── signal inbox ─────────────────────────────────────────────────────────────
  async function loadInbox() {
    inboxLoading = true;
    try {
      const res = await fetch('/api/screener/signals?limit=50');
      if (res.ok) {
        const d = await res.json() as { signals: SignalItem[]; count: number };
        inboxSignals = d.signals ?? [];
        inboxCount = d.count ?? 0;
      }
    } finally {
      inboxLoading = false;
    }
  }

  async function reviewSignal(id: string, verdict: 'accept' | 'reject' | 'watch') {
    reviewingId = id;
    try {
      await fetch(`/api/screener/signals?id=${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ verdict }),
      });
      inboxSignals = inboxSignals.map(s =>
        s.id === id ? { ...s, is_reviewed: true, review_verdict: verdict } : s
      );
      inboxCount = Math.max(0, inboxCount - 1);
    } finally {
      reviewingId = null;
    }
  }

  // ── format helpers ──────────────────────────────────────────────────────────
  function fmtTs(ts: number): string {
    return new Date(ts * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  function fmtPrice(p: number): string {
    return p >= 1000 ? p.toLocaleString('en-US', { maximumFractionDigits: 0 }) : p.toFixed(4);
  }

  function applyPreset(text: string) {
    promptText = text;
    void convertPrompt();
  }

  function fmtSignalTime(iso: string): string {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}시간 전`;
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  // W-0523: inbox auto-switch on mount (async, no cleanup)
  onMount(async () => {
    try {
      const res = await fetch('/api/screener/signals?unreviewed=true&limit=1');
      const d = await res.json() as { count: number };
      inboxCount = d.count ?? 0;
      if (inboxCount > 0) {
        view = 'inbox';
        loadInbox();
      }
    } catch { /* non-critical */ }
  });

  // W-0541 PR3-C: listen for terminal selection → deploy screener handoff
  onMount(() => {
    function onDeploy(e: Event) {
      const ce = e as CustomEvent<{ symbol: string; timeframe: string; dsl: string; gateVerdict: string }>;
      if (!ce.detail) return;
      const draft = ce.detail.dsl?.trim() ?? '';
      if (draft) {
        dsl = draft;
        conditions = parseDslLocal(draft);
        view = 'builder';
        hits = [];
        hitStats = null;
        scanError = '';
        prefillBanner = { from: `${ce.detail.symbol} · ${ce.detail.timeframe}`, gate: ce.detail.gateVerdict };
      }
    }
    window.addEventListener('terminal:deploy-screener-from-selection', onDeploy as EventListener);
    return () => window.removeEventListener('terminal:deploy-screener-from-selection', onDeploy as EventListener);
  });
</script>

<div class="signal-panel">
  <div class="panel-top">
    <div class="panel-head">
      <div class="head-copy">
        <div class="head-title">Signal Desk</div>
        <div class="head-meta">{symbol} · {timeframe} · {hits.length > 0 ? `${hits.length} hits` : conditions.length > 0 ? 'ready to scan' : 'build a trigger'}</div>
      </div>
    </div>

    <!-- view toggle -->
    <div class="view-bar">
      <button class="vbtn" class:active={view === 'builder'} onclick={() => switchView('builder')}>
        {editingId ? '편집 중' : '새 조건'}
      </button>
      <button class="vbtn" class:active={view === 'my-screeners'} onclick={() => switchView('my-screeners')}>내 스크리너</button>
      <button class="vbtn" class:active={view === 'inbox'} onclick={() => switchView('inbox')}>
        HITS{#if inboxCount > 0}<span class="inbox-badge">{inboxCount > 99 ? '99+' : inboxCount}</span>{/if}
      </button>
    </div>
  </div>

  <!-- W-0541 PR3-C: prefill banner -->
  {#if prefillBanner && view === 'builder'}
    <div class="prefill-banner" class:gate-warn={prefillBanner.gate === 'exploratory_only'} class:gate-ok={prefillBanner.gate === 'deployable'}>
      <span class="prefill-tag">From selection</span>
      <strong>{prefillBanner.from}</strong>
      <span class="prefill-gate">· gate: {prefillBanner.gate.replace(/_/g, ' ')}</span>
      <button type="button" class="prefill-clear" onclick={() => (prefillBanner = null)} aria-label="Dismiss prefill banner">×</button>
    </div>
  {/if}

  {#if view === 'builder'}
    <!-- edit mode banner -->
    {#if editingId}
      <div class="edit-banner">
        편집 중 — 저장 시 기존 스크리너 업데이트
        <button class="cancel-edit" onclick={cancelEdit}>취소</button>
      </div>
    {/if}

    <div class="builder-scroll">
    <div class="section">
      <div class="section-kicker">PRESETS</div>
      <div class="section-title">Run a known setup fast.</div>
      <div class="preset-row preset-row--stacked">
        {#each QUICK_PRESETS as preset}
          <button class="preset-chip preset-chip--wide" onclick={() => applyPreset(preset)}>{preset}</button>
        {/each}
      </div>
    </div>

    <!-- prompt input -->
    <div class="section">
      <div class="section-kicker">QUERY</div>
      <div class="section-title">Describe the trigger in plain language.</div>
      <div class="prompt-row">
        <input
          class="prompt-input"
          bind:value={promptText}
          placeholder='"RSI 30 아래이고 볼륨 스파이크"'
          onkeydown={(e) => e.key === 'Enter' && convertPrompt()}
        />
      </div>
      <button class="convert-btn" onclick={convertPrompt} disabled={!promptText.trim()}>변환</button>
    </div>

    <!-- DSL / condition blocks -->
    <div class="section">
      <div class="section-kicker">RULES</div>
      <div class="section-title">Review the trigger before scanning.</div>
      <div class="label-row">
        <span class="label">조건</span>
        <button class="text-btn" onclick={() => (showDsl = !showDsl)}>{showDsl ? '블록 보기' : 'DSL 보기'}</button>
      </div>
      {#if showDsl}
        <textarea
          class="dsl-input"
          value={dsl}
          oninput={onDslInput}
          placeholder="rsi14 < 30 AND vol_zscore > 2"
          rows={3}
        ></textarea>
      {:else}
        {#if conditions.length}
          <div class="condition-blocks">
            {#each conditions as cond, i}
              {#if i > 0}<span class="and-sep">AND</span>{/if}
              <div class="cond-block">
                <span class="feat">{cond.feature}</span>
                <span class="op">{cond.operator}</span>
                <span class="val">{cond.value}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="empty-conditions">조건 없음 — 자연어 입력 후 변환하거나 DSL 직접 입력</div>
        {/if}
      {/if}
    </div>

    <!-- scan button -->
    <div class="section">
      <div class="section-kicker">RUN</div>
      <div class="section-title">Apply the trigger to recent history.</div>
      <button
        class="scan-btn"
        onclick={runScan}
        disabled={scanning || !conditions.length}
      >
        {#if scanning}스캔 중...{:else}▶ {symbol} {timeframe} 적용{/if}
      </button>
      {#if scanError}<div class="error">{scanError}</div>{/if}
    </div>

    <!-- hit list -->
    {#if hits.length > 0}
      <div class="section hits-section">
        <div class="hits-header">
          <span class="label">히트 {hits.length}회</span>
          {#if hitStats?.winRate != null}<span class="stat">승률 {(hitStats.winRate * 100).toFixed(0)}%</span>{/if}
          {#if hitStats?.avgReturn != null}<span class="stat">avg +{hitStats.avgReturn.toFixed(1)}%</span>{/if}
        </div>
        <div class="hit-list">
          {#each [...hits].reverse().slice(0, 20) as hit}
            <div class="hit-row">
              <span class="hit-date">{fmtTs(hit.timestamp)}</span>
              <span class="hit-price">${fmtPrice(hit.price)}</span>
              <span class="hit-arrow">▲</span>
            </div>
          {/each}
          {#if hits.length > 20}
            <div class="hit-more">+{hits.length - 20}개 더</div>
          {/if}
        </div>

        <!-- save -->
        <div class="save-row">
          <input
            class="name-input"
            bind:value={screenerName}
            placeholder={editingId ? '스크리너 이름...' : '스크리너 이름...'}
          />
          <button
            class="save-btn"
            onclick={saveScreener}
            disabled={saving || !screenerName.trim()}
          >
            {#if saveSuccess}
              ✓ 스캔 중
            {:else if saving}
              저장 중...
            {:else if editingId}
              업데이트
            {:else}
              저장
            {/if}
          </button>
        </div>
        {#if saveSuccess}
          <div class="scan-status">15분마다 자동 스캔 중 · 히트 발생 시 HITS 탭에 표시</div>
        {/if}
      </div>
    {:else if !scanning && conditions.length > 0}
      <div class="section">
        <div class="empty-hits">스캔하면 히트 목록이 여기 표시됩니다</div>
      </div>
    {/if}
    </div>

  {:else if view === 'my-screeners'}
    <!-- my screeners view -->
    {#if screenerLoading}
      <div class="loading">로딩 중...</div>
    {:else if myScreeners.length === 0}
      <div class="empty-screeners">
        <div class="empty-icon">○</div>
        <div>저장된 스크리너 없음</div>
        <button class="text-btn mt" onclick={() => switchView('builder')}>+ 새 조건 만들기</button>
      </div>
    {:else}
      <div class="screener-list">
        {#each myScreeners as sc}
          <div class="screener-row">
            <div class="sc-info">
              <div class="sc-name">{sc.name}</div>
              <div class="sc-dsl">{sc.dsl}</div>
            </div>
            <div class="sc-actions">
              <button
                class="toggle-btn"
                class:active={sc.is_active}
                onclick={() => toggleActive(sc.id, sc.is_active)}
                title={sc.is_active ? '비활성화' : '활성화'}
              >
                {sc.is_active ? '●' : '○'}
              </button>
              <button class="icon-btn small" onclick={() => loadDslFromScreener(sc)} title="편집">편집</button>
              <button class="icon-btn small del" onclick={() => deleteScreener(sc.id, sc.name)} title="삭제">✕</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}

  {:else}
    <!-- inbox view -->
    {#if inboxLoading}
      <div class="loading">로딩 중...</div>
    {:else if inboxSignals.length === 0}
      <div class="empty-screeners">
        <div class="empty-icon">◎</div>
        <div>미검토 시그널 없음</div>
        <div class="empty-sub">15분마다 스캔 · 히트 발생 시 여기 표시</div>
      </div>
    {:else}
      <div class="inbox-list">
        {#each inboxSignals as sig}
          <div class="inbox-row" class:reviewed={sig.is_reviewed}>
            <div class="inbox-meta">
              <span class="inbox-symbol">{sig.symbol}</span>
              <span class="inbox-time">{fmtSignalTime(sig.triggered_at)}</span>
              {#if sig.trigger_price}
                <span class="inbox-price">${fmtPrice(sig.trigger_price)}</span>
              {/if}
            </div>
            {#if sig.is_reviewed}
              <div class="inbox-verdict verdict-{sig.review_verdict}">
                {sig.review_verdict === 'accept' ? '✓ 진입' : sig.review_verdict === 'reject' ? '✕ 패스' : '○ 관찰'}
              </div>
            {:else}
              <div class="inbox-actions">
                <button
                  class="verdict-btn accept"
                  onclick={() => reviewSignal(sig.id, 'accept')}
                  disabled={reviewingId === sig.id}
                >진입</button>
                <button
                  class="verdict-btn watch"
                  onclick={() => reviewSignal(sig.id, 'watch')}
                  disabled={reviewingId === sig.id}
                >관찰</button>
                <button
                  class="verdict-btn reject"
                  onclick={() => reviewSignal(sig.id, 'reject')}
                  disabled={reviewingId === sig.id}
                >패스</button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .signal-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.018), rgba(255,255,255,0)),
      var(--term-surface-1, var(--g0));
    font-size: 11px;
    color: var(--g9);
  }

  .panel-top {
    display: flex;
    flex-direction: column;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.022), rgba(255,255,255,0.006)),
      var(--term-surface-0, var(--g0));
    border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g3)) 78%, transparent);
    flex-shrink: 0;
  }

  .panel-head {
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 0 10px;
  }

  .head-copy {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .head-title {
    font-size: 11px;
    color: var(--term-text-0, var(--g8));
    letter-spacing: 0.06em;
  }

  .head-meta {
    font-size: 11px;
    color: var(--term-text-2, var(--g5));
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .builder-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 6px;
  }

  .view-bar {
    display: flex;
    border-bottom: 1px solid var(--term-border, var(--g3));
    padding: 0 10px;
    flex-shrink: 0;
  }

  /* W-0541 PR3-C: prefill banner from selection deploy */
  .prefill-banner {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    margin: 6px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.04);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.78);
  }
  .prefill-banner.gate-ok {
    border-color: color-mix(in srgb, var(--pos) 36%, transparent);
    background: color-mix(in srgb, var(--pos) 8%, transparent);
    color: var(--pos);
  }
  .prefill-banner.gate-warn {
    border-color: color-mix(in srgb, var(--amb) 36%, transparent);
    background: color-mix(in srgb, var(--amb) 8%, transparent);
    color: var(--amb);
  }
  .prefill-tag {
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: var(--ui-text-xs, 11px);
    opacity: 0.72;
  }
  .prefill-gate { opacity: 0.72; }
  .prefill-clear {
    margin-left: auto;
    background: transparent;
    border: none;
    color: inherit;
    font-size: 14px;
    cursor: pointer;
    padding: 0 4px;
    opacity: 0.6;
  }
  .prefill-clear:hover { opacity: 1; }
  .vbtn {
    flex: 1;
    padding: 5px 0;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.07em;
    color: var(--g5);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.1s, border-color 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .vbtn.active { color: var(--brand); border-bottom-color: var(--brand); }
  .vbtn:hover:not(.active) { color: var(--g7); }

  .inbox-badge {
    background: var(--brand);
    color: #000;
    font-size: var(--ui-text-xs, 11px);
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 8px;
    line-height: 1.4;
  }

  .edit-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 14px;
    background: rgba(219, 154, 159, 0.1);
    border-bottom: 1px solid rgba(219, 154, 159, 0.2);
    font-size: var(--ui-text-xs, 11px);
    color: var(--brand);
    flex-shrink: 0;
  }
  .cancel-edit {
    background: transparent;
    border: 1px solid rgba(219, 154, 159, 0.3);
    border-radius: 3px;
    padding: 2px 6px;
    font-size: var(--ui-text-xs, 11px);
    color: var(--brand);
    cursor: pointer;
  }

  .section {
    padding: 7px 9px;
    border: 1px solid color-mix(in srgb, var(--term-border, var(--g2)) 68%, transparent);
    border-radius: var(--term-radius-sm, 6px);
    background: rgba(255,255,255,0.018);
    flex-shrink: 0;
    margin-bottom: 5px;
  }
  .hits-section { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

  .section-kicker {
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--term-text-2, var(--g5));
    letter-spacing: 0.14em;
    margin-bottom: 3px;
    text-transform: uppercase;
  }

  .section-title {
    font-size: 11px;
    font-family: var(--fb);
    color: var(--term-text-1, var(--g7));
    font-weight: 500;
    line-height: 1.3;
    margin-bottom: 6px;
  }

  .label {
    font-size: var(--ui-text-xs, 11px);
    font-family: 'JetBrains Mono', monospace;
    color: var(--g4);
    letter-spacing: 0.08em;
    margin-bottom: 6px;
  }
  .label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .prompt-row {
    display: flex;
    gap: 6px;
  }
  .preset-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .preset-row--stacked { display: grid; }
  .prompt-input {
    flex: 1;
    background: var(--term-surface-2, var(--g1));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    padding: 6px 9px;
    font-size: 11px;
    color: var(--g9);
    outline: none;
    font-family: inherit;
  }
  .prompt-input:focus { border-color: var(--brand); }

  .icon-btn {
    background: var(--term-surface-2, var(--g2));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    padding: 4px 8px;
    font-size: 12px;
    color: var(--g7);
    cursor: pointer;
    transition: background 0.1s;
  }
  .icon-btn:hover { background: var(--g3); }
  .icon-btn.small { padding: 2px 6px; font-size: var(--ui-text-xs, 11px); }
  .icon-btn.del { color: var(--market-down); }

  .preset-chip {
    background: var(--term-surface-2, var(--g1));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    padding: 7px 9px;
    color: var(--term-text-1, var(--g7));
    font-size: 11px;
    text-align: left;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer;
    transition: border-color 0.1s, background 0.1s, color 0.1s;
  }
  .preset-chip--wide { width: 100%; }
  .preset-chip:hover {
    border-color: var(--term-border-strong, var(--g5));
    background: var(--term-surface-2, var(--g2));
    color: var(--term-text-0, var(--g9));
  }

  .convert-btn {
    width: 100%;
    margin-top: 5px;
    background: var(--brand, #5b5bd6);
    border: 1px solid var(--brand, #5b5bd6);
    border-radius: var(--term-radius-sm, 6px);
    color: #fff;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 5px 0;
    cursor: pointer;
    transition: opacity 0.15s;
  }
  .convert-btn:hover:not(:disabled) { opacity: 0.88; }
  .convert-btn:disabled { opacity: 0.35; cursor: default; }

  .text-btn {
    background: transparent;
    border: none;
    font-size: var(--ui-text-xs, 11px);
    color: var(--brand);
    cursor: pointer;
    padding: 0;
    font-family: 'JetBrains Mono', monospace;
  }
  .text-btn.mt { margin-top: 8px; }

  .dsl-input {
    width: 100%;
    background: var(--term-surface-2, var(--g1));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    padding: 6px 8px;
    font-size: 11px;
    color: var(--g9);
    font-family: 'JetBrains Mono', monospace;
    resize: none;
    outline: none;
    box-sizing: border-box;
  }
  .dsl-input:focus { border-color: var(--brand); }

  .condition-blocks {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
  }
  .cond-block {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--term-surface-2, var(--g1));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    padding: 3px 8px;
  }
  .feat { color: #93c5fd; font-family: 'JetBrains Mono', monospace; }
  .op   { color: var(--g5); }
  .val  { color: #fcd34d; font-family: 'JetBrains Mono', monospace; }
  .and-sep {
    font-size: var(--ui-text-xs, 11px);
    color: var(--g4);
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.08em;
  }
  .empty-conditions { color: var(--g4); font-size: var(--ui-text-xs, 11px); text-align: center; padding: 6px 0; }

  .scan-btn {
    width: 100%;
    min-height: 32px;
    padding: 8px 10px;
    background: color-mix(in srgb, var(--brand) 16%, transparent);
    color: var(--brand);
    border: 1px solid color-mix(in srgb, var(--brand) 42%, transparent);
    border-radius: var(--term-radius-md, 8px);
    font-size: 11px;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer;
    transition: opacity 0.1s, background 0.1s;
  }
  .scan-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .scan-btn:hover:not(:disabled) { opacity: 0.95; background: color-mix(in srgb, var(--brand) 22%, transparent); }

  .error { color: var(--market-down); font-size: var(--ui-text-xs, 11px); margin-top: 4px; }

  .hits-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    flex-shrink: 0;
  }
  .stat { font-size: var(--ui-text-xs, 11px); color: var(--market-up); }

  .hit-list {
    flex: 1;
    overflow-y: auto;
    margin: 0 -14px;
    padding: 0 14px;
  }
  .hit-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid color-mix(in srgb, var(--term-border, var(--g2)) 65%, transparent);
  }
  .hit-row:last-child { border-bottom: none; }
  .hit-date { color: var(--g5); min-width: 50px; }
  .hit-price { color: var(--g8); flex: 1; font-family: 'JetBrains Mono', monospace; }
  .hit-arrow { color: #2dd4bf; font-size: var(--ui-text-xs, 11px); }
  .hit-more { color: var(--g4); font-size: var(--ui-text-xs, 11px); text-align: center; padding: 6px 0; }
  .empty-hits { color: var(--g4); font-size: var(--ui-text-xs, 11px); text-align: center; padding: 6px 0; }

  .save-row {
    display: flex;
    gap: 6px;
    margin-top: 10px;
    flex-shrink: 0;
  }
  .name-input {
    flex: 1;
    background: var(--term-surface-2, var(--g1));
    border: 1px solid var(--term-border, var(--g3));
    border-radius: var(--term-radius-sm, 6px);
    padding: 4px 8px;
    font-size: 11px;
    color: var(--g9);
    outline: none;
    font-family: inherit;
    min-width: 0;
  }
  .name-input:focus { border-color: var(--brand); }
  .save-btn {
    background: var(--g2);
    border: 1px solid var(--g3);
    border-radius: 4px;
    padding: 4px 10px;
    font-size: var(--ui-text-xs, 11px);
    color: var(--g7);
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.1s;
  }
  .save-btn:hover:not(:disabled) { background: var(--g3); }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .scan-status {
    margin-top: 6px;
    font-size: var(--ui-text-xs, 11px);
    color: var(--market-up);
    text-align: center;
  }

  .loading { color: var(--g4); text-align: center; padding: 20px; }

  .empty-screeners {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 8px;
    color: var(--g5);
    padding: 24px;
    text-align: center;
  }
  .empty-icon { font-size: 24px; color: var(--g3); }
  .empty-sub { font-size: var(--ui-text-xs, 11px); color: var(--g4); margin-top: 2px; }

  .screener-list {
    flex: 1;
    overflow-y: auto;
  }
  .screener-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--g2);
  }
  .screener-row:hover { background: var(--g1); }
  .sc-info { flex: 1; min-width: 0; }
  .sc-name { color: var(--g8); font-weight: 500; }
  .sc-dsl { color: var(--g4); font-family: 'JetBrains Mono', monospace; font-size: var(--ui-text-xs, 11px); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sc-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .toggle-btn {
    background: transparent;
    border: none;
    font-size: 14px;
    cursor: pointer;
    color: var(--g4);
    padding: 2px;
    line-height: 1;
  }
  .toggle-btn.active { color: var(--market-up); }

  /* inbox */
  .inbox-list {
    flex: 1;
    overflow-y: auto;
  }
  .inbox-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--g2);
  }
  .inbox-row:hover { background: var(--g1); }
  .inbox-row.reviewed { opacity: 0.5; }
  .inbox-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .inbox-symbol { color: var(--g9); font-weight: 600; font-family: 'JetBrains Mono', monospace; }
  .inbox-time { color: var(--g4); font-size: var(--ui-text-xs, 11px); }
  .inbox-price { color: var(--g7); font-family: 'JetBrains Mono', monospace; margin-left: auto; }
  .inbox-actions {
    display: flex;
    gap: 4px;
  }
  .verdict-btn {
    flex: 1;
    padding: 4px 0;
    font-size: var(--ui-text-xs, 11px);
    border-radius: 3px;
    border: 1px solid;
    cursor: pointer;
    transition: opacity 0.1s;
    font-family: 'JetBrains Mono', monospace;
  }
  .verdict-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .verdict-btn.accept { background: rgba(173, 202, 124, 0.1); border-color: rgba(173, 202, 124, 0.3); color: var(--market-up); }
  .verdict-btn.accept:hover:not(:disabled) { background: rgba(173, 202, 124, 0.2); }
  .verdict-btn.watch { background: rgba(251, 191, 36, 0.1); border-color: rgba(251, 191, 36, 0.3); color: #fbbf24; }
  .verdict-btn.watch:hover:not(:disabled) { background: rgba(251, 191, 36, 0.2); }
  .verdict-btn.reject { background: rgba(207, 127, 143, 0.1); border-color: rgba(207, 127, 143, 0.3); color: var(--market-down); }
  .verdict-btn.reject:hover:not(:disabled) { background: rgba(207, 127, 143, 0.2); }

  .inbox-verdict {
    font-size: var(--ui-text-xs, 11px);
    font-family: 'JetBrains Mono', monospace;
  }
  .verdict-accept { color: var(--market-up); }
  .verdict-watch { color: #fbbf24; }
  .verdict-reject { color: var(--market-down); }
</style>
