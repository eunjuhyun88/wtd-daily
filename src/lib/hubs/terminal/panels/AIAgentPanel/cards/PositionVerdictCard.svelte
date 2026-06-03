<script lang="ts">
  import type { PositionVerdictCardPayload } from '$lib/agent/directives';

  interface Props {
    payload: PositionVerdictCardPayload;
    onSelectSymbol?: (symbol: string) => void;
  }
  let { payload, onSelectSymbol }: Props = $props();

  const ACTION_COLOR: Record<string, string> = {
    HOLD:         '#7a8a9a',
    PARTIAL_TP:   '#ffb300',
    TIGHT_SL:     '#ff9800',
    ADD_POSITION: '#4caf50',
    CUT_LOSS:     '#f44336',
  };
  const ACTION_LABEL: Record<string, string> = {
    HOLD:         '홀드',
    PARTIAL_TP:   '일부 익절',
    TIGHT_SL:     '손절선 조정',
    ADD_POSITION: '추가 진입',
    CUT_LOSS:     '즉시 손절',
  };

  const dirColor   = $derived(payload.direction === 'short' ? '#f44336' : '#4caf50');
  const actionColor = $derived(ACTION_COLOR[payload.action] ?? '#7a8a9a');
  const pnlPct     = $derived(payload.pnl_pct ?? 0);
  const pnlPos     = $derived(pnlPct >= 0);

  function fmt(n: number | null | undefined): string {
    if (n == null) return '—';
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs < 0.0001) return n.toPrecision(4);
    if (abs < 0.01)   return n.toPrecision(4);
    if (abs < 1)      return n.toFixed(4);
    if (abs < 100)    return n.toFixed(2);
    return n.toFixed(0);
  }

  function pct(n: number | null | undefined, digits = 2): string {
    if (n == null) return '—';
    const sign = n >= 0 ? '+' : '';
    return `${sign}${(n * 100).toFixed(digits)}%`;
  }

  function diffPct(price: number, base: number): string {
    if (!base) return '';
    const d = (price - base) / base;
    const sign = d >= 0 ? '+' : '';
    return `${sign}${(d * 100).toFixed(1)}%`;
  }

  type LevelRow = { key: string; label: string; price: number; isPoc?: boolean; isCurrent?: boolean; isEntry?: boolean };

  const levelRows = $derived((): LevelRow[] => {
    const lm = payload.level_map ?? {};
    const cur = payload.current_price;
    const rows: LevelRow[] = [];
    if (lm.day_high != null)  rows.push({ key: 'day_high', label: '24H 고점', price: lm.day_high });
    if (lm.vah != null)       rows.push({ key: 'vah',      label: 'VAH',      price: lm.vah });
    if (lm.poc != null)       rows.push({ key: 'poc',      label: 'POC ★',    price: lm.poc,  isPoc: true });
    if (cur)                  rows.push({ key: 'current',  label: '▶ 현재',   price: cur,     isCurrent: true });
    if (lm.vwap != null)      rows.push({ key: 'vwap',     label: 'VWAP',     price: lm.vwap });
    if (lm.val != null)       rows.push({ key: 'val',      label: 'VAL',      price: lm.val });
    if (lm.entry != null)     rows.push({ key: 'entry',    label: '진입',     price: lm.entry, isEntry: true });
    if (lm.day_low != null)   rows.push({ key: 'day_low',  label: '24H 저점', price: lm.day_low });
    return rows.sort((a, b) => b.price - a.price);
  });

  const urgencyDots = $derived((): boolean[] => {
    const u = Math.min(5, Math.max(1, payload.urgency ?? 1));
    return Array.from({ length: 5 }, (_, i) => i < u);
  });

  const al = $derived(payload.action_levels ?? {});
  const ss = $derived(payload.supply_snapshot ?? {});
  const hasAl = $derived(Object.keys(al).length > 0);
  const hasSs = $derived(Object.values(ss).some(v => v != null));
  const hasLevels = $derived(levelRows().length > 0);

  function buyBar(ratio: number | null | undefined): { w: number; ok: boolean } {
    if (ratio == null) return { w: 0, ok: false };
    return { w: Math.round(ratio * 100), ok: ratio >= 0.5 };
  }

  function zLabel(z: number | null | undefined): string {
    if (z == null) return '—';
    return `${z >= 0 ? '+' : ''}${z.toFixed(2)}`;
  }
</script>

<div class="pvc" role="button" tabindex="0"
  onclick={() => onSelectSymbol?.(payload.symbol)}
  onkeydown={(e) => e.key === 'Enter' && onSelectSymbol?.(payload.symbol)}>

  <!-- Header -->
  <div class="pvc-hdr">
    <span class="pvc-symbol">{payload.symbol}</span>
    <span class="pvc-dir" style="color:{dirColor}">{payload.direction.toUpperCase()}</span>
    {#if payload.leverage}
      <span class="pvc-badge">{payload.leverage}x</span>
    {/if}
    {#if payload.timeframe}
      <span class="pvc-tf">{payload.timeframe}</span>
    {/if}
  </div>

  <!-- Price -->
  <div class="pvc-price-row">
    <span class="pvc-dim">진입</span>
    <span class="pvc-price">{fmt(payload.entry_price)}</span>
    <span class="pvc-arrow">→</span>
    <span class="pvc-dim">현재</span>
    <span class="pvc-price">{fmt(payload.current_price)}</span>
  </div>

  <!-- PnL -->
  <div class="pvc-pnl" class:pos={pnlPos} class:neg={!pnlPos}>
    미실현 {pct(pnlPct)}
    {#if payload.leverage && payload.leverage > 1}
      <span class="pvc-pnl-lev">({pct(pnlPct * payload.leverage)} 레버)</span>
    {/if}
  </div>

  <!-- Verdict badge -->
  <div class="pvc-verdict" style="border-color:{actionColor}20;background:{actionColor}0d">
    <span class="pvc-verdict-label" style="color:{actionColor}">{ACTION_LABEL[payload.action] ?? payload.action}</span>
    <div class="pvc-dots">
      {#each urgencyDots() as filled}
        <span class="pvc-dot" style="background:{filled ? actionColor : 'transparent'};border-color:{actionColor}"></span>
      {/each}
    </div>
    <span class="pvc-conf">신뢰도 {Math.round((payload.confidence ?? 0) * 100)}/100</span>
  </div>

  <!-- Action levels -->
  {#if hasAl}
    <div class="pvc-al">
      {#if al.tp_price != null}
        <span class="pvc-al-item">TP <strong>{fmt(al.tp_price)}</strong>{al.tp_pct != null ? ` (${pct(al.tp_pct)})` : ''}</span>
      {/if}
      {#if al.new_sl != null}
        <span class="pvc-al-sep">|</span>
        <span class="pvc-al-item pvc-al-sl">SL → <strong>{fmt(al.new_sl)}</strong></span>
      {/if}
      {#if al.tp2 != null}
        <span class="pvc-al-sep">|</span>
        <span class="pvc-al-item">TP2 <strong>{fmt(al.tp2)}</strong></span>
      {/if}
      {#if al.add_price != null}
        <span class="pvc-al-item">추가 @ <strong>{fmt(al.add_price)}</strong>{al.add_pct != null ? ` (${pct(al.add_pct)})` : ''}</span>
        {#if al.expected_avg != null}
          <span class="pvc-al-sep">|</span>
          <span class="pvc-al-item">평균 → <strong>{fmt(al.expected_avg)}</strong></span>
        {/if}
      {/if}
      {#if al.exit_price != null}
        <span class="pvc-al-item pvc-al-cut">청산 <strong>{fmt(al.exit_price)}</strong>{al.loss_pct != null ? ` (${pct(al.loss_pct)})` : ''}</span>
      {/if}
      {#if payload.action === 'HOLD' && al.sl != null}
        <span class="pvc-al-item pvc-al-sl">SL <strong>{fmt(al.sl)}</strong></span>
        {#if al.tp1 != null}
          <span class="pvc-al-sep">|</span>
          <span class="pvc-al-item">TP1 <strong>{fmt(al.tp1)}</strong></span>
        {/if}
        {#if al.tp2 != null}
          <span class="pvc-al-sep">|</span>
          <span class="pvc-al-item">TP2 <strong>{fmt(al.tp2)}</strong></span>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Level map -->
  {#if hasLevels}
    <div class="pvc-sec-label">가격 레벨</div>
    <div class="pvc-levels">
      {#each levelRows() as row}
        <div class="pvc-level-row"
          class:pvc-poc={row.isPoc}
          class:pvc-cur={row.isCurrent}
          class:pvc-ent={row.isEntry}>
          <span class="pvc-lbl">{row.label}</span>
          <span class="pvc-lp">{fmt(row.price)}</span>
          <span class="pvc-ld"
            class:pos-diff={row.price > payload.current_price}
            class:neg-diff={row.price < payload.current_price}>
            {diffPct(row.price, payload.current_price)}
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Supply snapshot -->
  {#if hasSs}
    <div class="pvc-sec-label">수급 스냅샷</div>
    <div class="pvc-supply">
      {#if ss.buy_ratio_4h != null}
        {@const b = buyBar(ss.buy_ratio_4h)}
        <div class="pvc-srow">
          <span class="pvc-slbl">매수비중 4H</span>
          <div class="pvc-bar-wrap"><div class="pvc-bar" style="width:{b.w}%;background:{b.ok ? '#4caf50' : '#f44336'}"></div></div>
          <span class="pvc-sval" class:ok={b.ok} class:warn={!b.ok}>{(ss.buy_ratio_4h * 100).toFixed(1)}%</span>
          <span class="pvc-sflag">{b.ok ? '✅' : '⚠️'}</span>
        </div>
      {/if}
      {#if ss.buy_ratio_1h != null}
        {@const b = buyBar(ss.buy_ratio_1h)}
        <div class="pvc-srow">
          <span class="pvc-slbl">매수비중 1H</span>
          <div class="pvc-bar-wrap"><div class="pvc-bar" style="width:{b.w}%;background:{b.ok ? '#4caf50' : '#f44336'}"></div></div>
          <span class="pvc-sval" class:ok={b.ok} class:warn={!b.ok}>{(ss.buy_ratio_1h * 100).toFixed(1)}%</span>
          <span class="pvc-sflag">{b.ok ? '✅' : '⚠️'}</span>
        </div>
      {/if}
      {#if ss.cvd_z_4h != null}
        <div class="pvc-srow pvc-srow-t">
          <span class="pvc-slbl">CVD z 4H</span>
          <span class="pvc-stxt" class:pos={ss.cvd_z_4h >= 0} class:neg={ss.cvd_z_4h < 0}>{zLabel(ss.cvd_z_4h)}</span>
          <span class="pvc-sbase">기준 0</span>
        </div>
      {/if}
      {#if ss.cvd_z_1h != null}
        <div class="pvc-srow pvc-srow-t">
          <span class="pvc-slbl">CVD z 1H</span>
          <span class="pvc-stxt" class:pos={ss.cvd_z_1h >= 0} class:neg={ss.cvd_z_1h < 0}>{zLabel(ss.cvd_z_1h)}</span>
          <span class="pvc-sbase">기준 0</span>
        </div>
      {/if}
      {#if ss.ls_ratio != null}
        <div class="pvc-srow pvc-srow-t">
          <span class="pvc-slbl">롱/숏</span>
          <span class="pvc-stxt">{(ss.ls_ratio * 100).toFixed(1)}% 롱</span>
          <span class="pvc-sbase">기준 50%</span>
        </div>
      {/if}
      {#if ss.funding_rate != null}
        {@const fr = ss.funding_rate}
        <div class="pvc-srow pvc-srow-t">
          <span class="pvc-slbl">펀딩비</span>
          <span class="pvc-stxt" class:pos={fr >= 0} class:neg={fr < 0}>{fr >= 0 ? '+' : ''}{(fr * 100).toFixed(3)}%</span>
          <span class="pvc-sbase">기준 0%</span>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Reason -->
  {#if payload.reason}
    <div class="pvc-reason">{payload.reason}</div>
  {/if}
</div>

<style>
.pvc {
  display: flex; flex-direction: column; gap: 6px;
  background: #0b0b18; border: 1px solid #1e2030; border-radius: 8px;
  padding: 12px; cursor: pointer; width: 100%; text-align: left;
  transition: border-color 0.15s;
}
.pvc:hover { border-color: #3a4a6a; }

/* Header */
.pvc-hdr { display: flex; align-items: baseline; gap: 6px; }
.pvc-symbol { font-size: var(--ui-text-sm); font-weight: 700; color: #c8d0e0; font-family: monospace; }
.pvc-dir    { font-size: var(--ui-text-xs); font-weight: 700; letter-spacing: 0.06em; }
.pvc-badge  { font-size: var(--ui-text-xs); color: #6a7a9a; background: #1a1a2e; border-radius: 3px; padding: 1px 4px; }
.pvc-tf     { font-size: var(--ui-text-xs); color: #4a5a6a; margin-left: auto; }

/* Price row */
.pvc-price-row { display: flex; align-items: center; gap: 4px; font-size: var(--ui-text-xs); }
.pvc-dim   { color: #4a5a6a; }
.pvc-price { color: #9aaabf; font-family: monospace; }
.pvc-arrow { color: #3a4a5a; }

/* PnL */
.pvc-pnl { font-size: var(--ui-text-xs); font-weight: 600; }
.pvc-pnl.pos { color: #4caf50; }
.pvc-pnl.neg { color: #f44336; }
.pvc-pnl-lev { font-weight: 400; opacity: 0.7; margin-left: 3px; }

/* Verdict */
.pvc-verdict { display: flex; align-items: center; gap: 8px; border: 1px solid; border-radius: 5px; padding: 5px 8px; }
.pvc-verdict-label { font-size: var(--ui-text-xs); font-weight: 700; letter-spacing: 0.04em; }
.pvc-dots   { display: flex; gap: 3px; }
.pvc-dot    { width: 8px; height: 8px; border-radius: 50%; border: 1px solid; }
.pvc-conf   { font-size: var(--ui-text-xs); color: #5a6a7a; margin-left: auto; }

/* Action levels */
.pvc-al { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; font-size: var(--ui-text-xs); color: #8a9ab0; }
.pvc-al-sep  { color: #3a4a5a; }
.pvc-al-item strong { color: #c0ccdc; }
.pvc-al-sl strong   { color: #ff7043; }
.pvc-al-cut { color: #f44336; }
.pvc-al-cut strong  { color: #f44336; }

/* Section label */
.pvc-sec-label {
  font-size: var(--ui-text-xs); color: #4a5a6a; text-transform: uppercase;
  letter-spacing: 0.06em; border-top: 1px solid #1a1a2e; padding-top: 5px; margin-top: 1px;
}

/* Level map */
.pvc-levels { display: flex; flex-direction: column; gap: 2px; }
.pvc-level-row {
  display: grid; grid-template-columns: 68px 1fr 44px;
  gap: 4px; align-items: center; padding: 1px 3px; border-radius: 3px;
  font-size: var(--ui-text-xs);
}
.pvc-lbl { color: #5a6a7a; }
.pvc-lp  { color: #8a9ab0; font-family: monospace; text-align: right; }
.pvc-ld  { color: #4a5a6a; text-align: right; font-family: monospace; }
.pos-diff { color: #4caf5088; }
.neg-diff { color: #f4433688; }
.pvc-poc .pvc-lbl { color: #ffb300; }
.pvc-poc .pvc-lp  { color: #ffb300; }
.pvc-cur { background: #14142a; }
.pvc-cur .pvc-lbl { color: #c0ccdc; font-weight: 600; }
.pvc-cur .pvc-lp  { color: #c0ccdc; font-weight: 600; }
.pvc-ent .pvc-lbl { color: #7a8abf; }
.pvc-ent .pvc-lp  { color: #7a8abf; }

/* Supply snapshot */
.pvc-supply { display: flex; flex-direction: column; gap: 3px; }
.pvc-srow   { display: grid; grid-template-columns: 72px 1fr 44px 18px; gap: 4px; align-items: center; font-size: var(--ui-text-xs); }
.pvc-srow-t { grid-template-columns: 72px 1fr 54px; }
.pvc-slbl   { color: #5a6a7a; }
.pvc-bar-wrap { height: 5px; background: #1a1a2e; border-radius: 2px; overflow: hidden; }
.pvc-bar    { height: 100%; opacity: 0.7; }
.pvc-sval   { font-family: monospace; text-align: right; }
.pvc-sval.ok   { color: #4caf50; }
.pvc-sval.warn { color: #ff9800; }
.pvc-sflag  { font-size: 11px; text-align: center; }
.pvc-stxt   { font-family: monospace; text-align: right; color: #8a9ab0; }
.pvc-stxt.pos { color: #4caf50; }
.pvc-stxt.neg { color: #f44336; }
.pvc-sbase  { color: #4a5a6a; text-align: right; font-size: var(--ui-text-xs); }

/* Reason */
.pvc-reason {
  font-size: var(--ui-text-xs); color: #6a7a8a; line-height: 1.4;
  border-top: 1px solid #1a1a2e; padding-top: 5px;
}
</style>
