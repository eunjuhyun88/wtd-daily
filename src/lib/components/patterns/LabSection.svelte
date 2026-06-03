<script lang="ts">
  // Lab column for slug page — 4 lazy collapsibles.
  // First card (Formula) is auto-expanded per CPO spec §7.
  // HC4: 4xx silent → grey "데이터 없음" placeholder, no toast/error UI.
  type Props = { slug: string };
  const { slug }: Props = $props();

  type CardKey = 'formula' | 'cf' | 'validate' | 'fwalk';

  let openSet = $state<Set<CardKey>>(new Set(['formula']));
  // Per-card load state — fetched lazily on first expand.
  let formulaState = $state<{ status: 'idle' | 'loading' | 'ok' | 'empty' | 'err'; data: any }>({ status: 'idle', data: null });
  let cfState = $state<{ status: 'idle' | 'loading' | 'ok' | 'empty' | 'err'; data: any }>({ status: 'idle', data: null });
  let fwalkState = $state<{ status: 'idle' | 'loading' | 'ok' | 'empty' | 'err'; data: any }>({ status: 'idle', data: null });
  let validateState = $state<{ status: 'idle' | 'running' | 'ok' | 'err'; data: any; ts: string | null }>({ status: 'idle', data: null, ts: null });

  function toggle(k: CardKey) {
    const next = new Set(openSet);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    openSet = next;
    if (k === 'formula' && next.has('formula') && formulaState.status === 'idle') void loadFormula();
    if (k === 'cf' && next.has('cf') && cfState.status === 'idle') void loadCf();
    if (k === 'fwalk' && next.has('fwalk') && fwalkState.status === 'idle') void loadFwalk();
  }

  async function loadFormula() {
    formulaState = { status: 'loading', data: null };
    try {
      const res = await fetch(`/api/patterns/${encodeURIComponent(slug)}/formula`);
      if (!res.ok) {
        formulaState = { status: res.status >= 400 && res.status < 500 ? 'empty' : 'err', data: null };
        return;
      }
      const json = await res.json();
      if (!json?.ok || !json?.data) {
        formulaState = { status: 'empty', data: null };
        return;
      }
      formulaState = { status: 'ok', data: json.data };
    } catch {
      formulaState = { status: 'err', data: null };
    }
  }

  async function loadCf() {
    cfState = { status: 'loading', data: null };
    try {
      const url = `/api/lab/counterfactual?pattern=${encodeURIComponent(slug)}&since=30&horizon=24`;
      const res = await fetch(url);
      if (!res.ok) {
        cfState = { status: res.status >= 400 && res.status < 500 ? 'empty' : 'err', data: null };
        return;
      }
      const json = await res.json();
      if (!json?.ok || !json?.data) {
        cfState = { status: 'empty', data: null };
        return;
      }
      cfState = { status: 'ok', data: json.data };
    } catch {
      cfState = { status: 'err', data: null };
    }
  }

  async function loadFwalk() {
    fwalkState = { status: 'loading', data: null };
    try {
      const res = await fetch(`/api/lab/forward-walk`);
      if (!res.ok) {
        fwalkState = { status: res.status >= 400 && res.status < 500 ? 'empty' : 'err', data: null };
        return;
      }
      const json = await res.json();
      const scenarios = Array.isArray(json?.scenarios) ? json.scenarios : [];
      fwalkState = scenarios.length > 0 ? { status: 'ok', data: { scenarios, defaults: json.defaults ?? null } } : { status: 'empty', data: null };
    } catch {
      fwalkState = { status: 'err', data: null };
    }
  }

  async function runValidate() {
    validateState = { status: 'running', data: null, ts: null };
    try {
      const res = await fetch('/api/research/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        validateState = { status: 'err', data: null, ts: new Date().toISOString() };
        return;
      }
      const json = await res.json();
      validateState = { status: 'ok', data: json, ts: new Date().toISOString() };
    } catch {
      validateState = { status: 'err', data: null, ts: new Date().toISOString() };
    }
  }

  function fmtPct(v: number | null | undefined, digits = 2): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return `${(v * 100).toFixed(digits)}%`;
  }
  function fmtNum(v: number | null | undefined, digits = 2): string {
    if (v == null || !Number.isFinite(v)) return '—';
    return v.toFixed(digits);
  }
</script>

<section class="lab-stack" aria-label="Lab — 가설/연구 카드">

  <!-- ─────────── Card 1: Formula Evidence ─────────────────────────── -->
  <details class="lab-card" open={openSet.has('formula')} ontoggle={(e) => {
    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
    if (isOpen !== openSet.has('formula')) toggle('formula');
  }}>
    <summary class="lab-card-head">
      <span class="lab-card-title">Formula evidence</span>
      <span class="lab-card-hint mono">규칙 + 최근 적중</span>
    </summary>
    <div class="lab-card-body">
      {#if formulaState.status === 'loading'}
        <div class="lab-loading">⌛ Loading…</div>
      {:else if formulaState.status === 'empty' || formulaState.status === 'err'}
        <div class="lab-empty">데이터 없음</div>
      {:else if formulaState.status === 'ok' && formulaState.data}
        {@const f = formulaState.data}
        <dl class="kv">
          <dt>p_win_min</dt><dd class="mono">{fmtNum(f.settings?.p_win_min, 2)}</dd>
          <dt>tp / sl</dt><dd class="mono">{fmtNum(f.settings?.tp_pct, 2)}% / {fmtNum(f.settings?.sl_pct, 2)}%</dd>
          <dt>cooldown</dt><dd class="mono">{fmtNum(f.settings?.cooldown_min, 0)} min</dd>
          <dt>regimes</dt><dd class="mono">{(f.settings?.regime_allow ?? []).join(', ') || '—'}</dd>
        </dl>
        {#if Array.isArray(f.evidence) && f.evidence.length > 0}
          <h4 class="sub">최근 traded ({f.evidence.length})</h4>
          <ul class="ev-list">
            {#each f.evidence.slice(0, 5) as ev}
              <li class="ev-row">
                <span class="mono ev-sym">{ev.symbol}</span>
                <span class="mono ev-dir" class:up={ev.direction === 'long'} class:dn={ev.direction === 'short'}>{ev.direction}</span>
                <span class="mono ev-pnl" class:up={(ev.pnl_24h ?? 0) > 0} class:dn={(ev.pnl_24h ?? 0) < 0}>{fmtNum(ev.pnl_24h, 2)}%</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="lab-empty mono">최근 적중 없음</p>
        {/if}
        {#if Array.isArray(f.suspects) && f.suspects.length > 0}
          <h4 class="sub">Suspect queue ({f.suspects.length})</h4>
          <ul class="ev-list">
            {#each f.suspects as s}
              <li class="ev-row">
                <span class="mono ev-sym">{s.symbol}</span>
                <span class="reason">{s.blocked_reason}</span>
                <span class="mono ev-pnl up">+{fmtNum(s.cf_24h, 2)}%</span>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>
  </details>

  <!-- ─────────── Card 2: Counterfactual ───────────────────────────── -->
  <details class="lab-card" open={openSet.has('cf')} ontoggle={(e) => {
    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
    if (isOpen !== openSet.has('cf')) toggle('cf');
  }}>
    <summary class="lab-card-head">
      <span class="lab-card-title">Counterfactual</span>
      <span class="lab-card-hint mono">막힌 쪽 vs 거래</span>
    </summary>
    <div class="lab-card-body">
      {#if cfState.status === 'idle'}
        <div class="lab-empty mono">펼치면 로드됩니다.</div>
      {:else if cfState.status === 'loading'}
        <div class="lab-loading">⌛ Loading…</div>
      {:else if cfState.status === 'empty' || cfState.status === 'err'}
        <div class="lab-empty">데이터 없음</div>
      {:else if cfState.status === 'ok' && cfState.data}
        {@const cf = cfState.data}
        <dl class="kv">
          <dt>traded n</dt><dd class="mono">{cf.traded?.n ?? 0}</dd>
          <dt>blocked n</dt><dd class="mono">{cf.blocked?.n ?? 0}</dd>
          <dt>median Δ (24h)</dt><dd class="mono" class:up={(cf.delta_median ?? 0) > 0} class:dn={(cf.delta_median ?? 0) < 0}>{fmtNum(cf.delta_median, 4)}</dd>
          <dt>95% CI</dt><dd class="mono">[{fmtNum(cf.ci_95?.[0], 3)}, {fmtNum(cf.ci_95?.[1], 3)}]</dd>
          <dt>p-value</dt><dd class="mono">{cf.welch?.insufficient_data ? '—' : fmtNum(cf.welch?.p, 4)}</dd>
        </dl>
        {#if Array.isArray(cf.by_reason) && cf.by_reason.length > 0}
          <h4 class="sub">Top reasons</h4>
          <ul class="ev-list">
            {#each cf.by_reason.slice(0, 3) as r}
              <li class="ev-row">
                <span class="reason">{r.reason}</span>
                <span class="mono">n={r.n}</span>
                <span class="mono verdict-{r.verdict}">{r.verdict}</span>
              </li>
            {/each}
          </ul>
        {/if}
      {/if}
    </div>
  </details>

  <!-- ─────────── Card 3: Validate (POST trigger) ──────────────────── -->
  <details class="lab-card" open={openSet.has('validate')} ontoggle={(e) => {
    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
    if (isOpen !== openSet.has('validate')) toggle('validate');
  }}>
    <summary class="lab-card-head">
      <span class="lab-card-title">Validate</span>
      <span class="lab-card-hint mono">research/validate</span>
    </summary>
    <div class="lab-card-body">
      <button type="button" class="run-btn" disabled={validateState.status === 'running'} onclick={runValidate}>
        {validateState.status === 'running' ? '⌛ Running…' : '▶ Run validate'}
      </button>
      {#if validateState.status === 'err'}
        <p class="lab-empty">실패 — 잠시 후 재시도</p>
      {:else if validateState.status === 'ok' && validateState.data}
        {@const v = validateState.data}
        <dl class="kv">
          {#if typeof v.score === 'number'}<dt>score</dt><dd class="mono">{fmtNum(v.score, 3)}</dd>{/if}
          {#if typeof v.confidence === 'number'}<dt>confidence</dt><dd class="mono">{fmtPct(v.confidence)}</dd>{/if}
          {#if typeof v.verdict === 'string'}<dt>verdict</dt><dd class="mono">{v.verdict}</dd>{/if}
          {#if validateState.ts}<dt>at</dt><dd class="mono">{validateState.ts.slice(11, 19)}</dd>{/if}
        </dl>
        {#if Object.keys(v).length === 0}
          <p class="lab-empty mono">엔진 응답 비어 있음</p>
        {/if}
      {/if}
    </div>
  </details>

  <!-- ─────────── Card 4: Forward-walk scenarios ───────────────────── -->
  <details class="lab-card" open={openSet.has('fwalk')} ontoggle={(e) => {
    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
    if (isOpen !== openSet.has('fwalk')) toggle('fwalk');
  }}>
    <summary class="lab-card-head">
      <span class="lab-card-title">Forward-walk</span>
      <span class="lab-card-hint mono">{fwalkState.status === 'ok' ? `${fwalkState.data?.scenarios?.length ?? 0}개 시나리오` : '시나리오 카탈로그'}</span>
    </summary>
    <div class="lab-card-body">
      {#if fwalkState.status === 'idle'}
        <div class="lab-empty mono">펼치면 로드됩니다.</div>
      {:else if fwalkState.status === 'loading'}
        <div class="lab-loading">⌛ Loading…</div>
      {:else if fwalkState.status === 'empty' || fwalkState.status === 'err'}
        <div class="lab-empty">시나리오 없음</div>
      {:else if fwalkState.status === 'ok' && fwalkState.data}
        <ul class="ev-list">
          {#each fwalkState.data.scenarios.slice(0, 6) as s}
            <li class="ev-row">
              <span class="mono ev-sym">{s.symbol}</span>
              <span class="reason">{s.label}</span>
              <span class="mono">{s.candleCount} bars</span>
            </li>
          {/each}
        </ul>
        <p class="lab-hint mono">실행은 Research 탭의 Hypothesis Lab에서.</p>
      {/if}
    </div>
  </details>
</section>

<style>
  .lab-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .lab-card {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }
  .lab-card[open] {
    background: rgba(255, 255, 255, 0.035);
  }
  .lab-card-head {
    list-style: none;
    cursor: pointer;
    padding: 10px 12px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    user-select: none;
  }
  .lab-card-head::-webkit-details-marker { display: none; }
  .lab-card-head::before {
    content: '▸';
    margin-right: 8px;
    font-size: 11px;
    color: rgba(250, 247, 235, 0.45);
    transition: transform 120ms ease-out;
  }
  .lab-card[open] .lab-card-head::before { transform: rotate(90deg); }
  .lab-card-title {
    font-size: var(--ui-text-sm, 13px);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.85);
    flex: 1;
  }
  .lab-card-hint {
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.45);
    font-family: var(--sc-font-mono, monospace);
  }
  .lab-card-body {
    padding: 4px 12px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }
  .lab-loading,
  .lab-empty,
  .lab-hint {
    padding: 8px 0;
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.45);
  }
  .lab-empty { color: rgba(250, 247, 235, 0.4); }
  .lab-hint { padding-top: 6px; }
  .mono { font-family: var(--sc-font-mono, monospace); }

  .kv {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px 14px;
    margin: 6px 0 0;
    padding: 0;
  }
  .kv dt {
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.5);
  }
  .kv dd {
    margin: 0;
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.82);
  }

  .sub {
    margin: 12px 0 4px;
    font-size: var(--ui-text-xs, 11px);
    font-weight: 600;
    color: rgba(250, 247, 235, 0.55);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .ev-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .ev-row {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: var(--ui-text-xs, 11px);
    padding: 3px 0;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.04);
  }
  .ev-row:last-child { border-bottom: none; }
  .ev-sym { color: rgba(250, 247, 235, 0.85); min-width: 64px; }
  .ev-dir { text-transform: lowercase; min-width: 44px; }
  .ev-dir.up { color: #6dd6a8; }
  .ev-dir.dn { color: #e07a82; }
  .ev-pnl { margin-left: auto; }
  .ev-pnl.up { color: #6dd6a8; }
  .ev-pnl.dn { color: #e07a82; }
  .reason {
    font-size: var(--ui-text-xs, 11px);
    color: rgba(250, 247, 235, 0.55);
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .verdict-relax { color: #6dd6a8; }
  .verdict-keep { color: rgba(250, 247, 235, 0.55); }
  .verdict-inconclusive { color: rgba(250, 247, 235, 0.4); }

  .up { color: #6dd6a8; }
  .dn { color: #e07a82; }

  .run-btn {
    padding: 6px 14px;
    font-size: var(--ui-text-xs, 11px);
    font-family: var(--sc-font-mono, monospace);
    font-weight: 600;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 4px;
    color: rgba(250, 247, 235, 0.85);
    cursor: pointer;
    margin-bottom: 8px;
  }
  .run-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
  .run-btn:disabled { opacity: 0.5; cursor: wait; }
</style>
