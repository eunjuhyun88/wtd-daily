/**
 * wsPool.ts — Reference-counted WebSocket deduplication pool with
 * reconnect, heartbeat, and debounced close.
 *
 * Why: With N chart panes / WatchlistRail / SearchPreview all watching the
 * same `symbol+tf`, we'd otherwise open N separate Binance WebSockets.
 * The pool collapses N subscribers onto ONE underlying connection and
 * fans out messages via callbacks.
 *
 * Features:
 *   - Reference counting: WS stays alive as long as ≥1 subscriber holds.
 *   - Reconnect: if WS closes while subscribers remain, pool reconnects
 *     with exponential backoff (100 → 300 → 1000 → 3000 → 10000 ms).
 *   - Heartbeat: configurable per-acquire. If no message in `heartbeatMs`
 *     (defaults to 45s if any subscriber requests it), close → reconnect.
 *     The active heartbeat is the MAX of all subscribers' requested values
 *     (or undefined if none requested heartbeat).
 *   - Debounced close: when refCount drops to 0, the WS is kept alive
 *     for 5 seconds. If a new subscriber arrives in that window, the
 *     existing connection is reused. Saves reconnect cost on quick page
 *     navigation (back/forward).
 *   - Status broadcast: subscribers can register an onStatus callback
 *     (connecting / connected / disconnected / reconnecting).
 *
 * Usage:
 *   const release = wsPool.acquire(wsUrl, {
 *     onMessage: (evt) => handleMsg(evt),
 *     onStatus: (s) => console.log(s),
 *     heartbeatMs: 45000,
 *   });
 *   // on cleanup:
 *   release();
 */

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

type MsgHandler = (evt: MessageEvent) => void;
type StatusHandler = (status: WsStatus) => void;
type ReleaseHandle = () => void;

export interface AcquireOpts {
  onMessage: MsgHandler;
  onStatus?: StatusHandler;
  /** If provided, pool will close+reconnect when no message arrives in this many ms. */
  heartbeatMs?: number;
}

interface SubscriberRecord {
  onMessage: MsgHandler;
  onStatus?: StatusHandler;
  heartbeatMs?: number;
}

interface PoolEntry {
  url: string;
  ws: WebSocket | null;
  subscribers: Set<SubscriberRecord>;
  status: WsStatus;
  backoffIdx: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  heartbeatTimer: ReturnType<typeof setTimeout> | null;
  closeDebounceTimer: ReturnType<typeof setTimeout> | null;
  /** True while the pool has decided to tear down — guards reconnect loop */
  destroyed: boolean;
}

const BACKOFF_STEPS = [100, 300, 1_000, 3_000, 10_000];
const CLOSE_DEBOUNCE_MS = 5_000;

const _pool = new Map<string, PoolEntry>();

function _broadcastStatus(entry: PoolEntry, status: WsStatus): void {
  entry.status = status;
  for (const sub of entry.subscribers) {
    try { sub.onStatus?.(status); } catch { /* one bad listener must not break others */ }
  }
}

function _activeHeartbeatMs(entry: PoolEntry): number | undefined {
  let max: number | undefined;
  for (const sub of entry.subscribers) {
    if (sub.heartbeatMs !== undefined) {
      if (max === undefined || sub.heartbeatMs > max) max = sub.heartbeatMs;
    }
  }
  return max;
}

function _armHeartbeat(entry: PoolEntry): void {
  _clearHeartbeat(entry);
  const ms = _activeHeartbeatMs(entry);
  if (ms === undefined) return;
  entry.heartbeatTimer = setTimeout(() => {
    // Stale connection — close to trigger reconnect path
    entry.ws?.close();
  }, ms);
}

function _clearHeartbeat(entry: PoolEntry): void {
  if (entry.heartbeatTimer !== null) {
    clearTimeout(entry.heartbeatTimer);
    entry.heartbeatTimer = null;
  }
}

function _clearReconnect(entry: PoolEntry): void {
  if (entry.reconnectTimer !== null) {
    clearTimeout(entry.reconnectTimer);
    entry.reconnectTimer = null;
  }
}

function _scheduleReconnect(entry: PoolEntry): void {
  if (entry.destroyed) return;
  if (entry.subscribers.size === 0) return; // nothing to reconnect for
  _clearReconnect(entry);
  const delay = BACKOFF_STEPS[Math.min(entry.backoffIdx, BACKOFF_STEPS.length - 1)];
  entry.backoffIdx = Math.min(entry.backoffIdx + 1, BACKOFF_STEPS.length - 1);
  _broadcastStatus(entry, 'reconnecting');
  entry.reconnectTimer = setTimeout(() => {
    if (!entry.destroyed && entry.subscribers.size > 0) _openSocket(entry);
  }, delay);
}

function _openSocket(entry: PoolEntry): void {
  if (entry.destroyed) return;

  let ws: WebSocket;
  try {
    ws = new WebSocket(entry.url);
  } catch {
    _scheduleReconnect(entry);
    return;
  }

  entry.ws = ws;
  _broadcastStatus(entry, 'connecting');

  ws.onopen = () => {
    entry.backoffIdx = 0;
    _broadcastStatus(entry, 'connected');
    _armHeartbeat(entry);
  };

  ws.onmessage = (evt: MessageEvent) => {
    _armHeartbeat(entry); // reset heartbeat on every message
    for (const sub of entry.subscribers) {
      try { sub.onMessage(evt); } catch { /* isolate per-subscriber failures */ }
    }
  };

  ws.onerror = () => {
    // Let onclose drive the reconnect path
    ws.close();
  };

  ws.onclose = () => {
    _clearHeartbeat(entry);
    if (entry.ws === ws) entry.ws = null;
    if (entry.destroyed) {
      _pool.delete(entry.url);
      return;
    }
    if (entry.subscribers.size === 0) {
      // Last subscriber already gone, nothing to do
      _pool.delete(entry.url);
      return;
    }
    _broadcastStatus(entry, 'disconnected');
    _scheduleReconnect(entry);
  };
}

function acquire(url: string, opts: AcquireOpts): ReleaseHandle {
  let entry = _pool.get(url);

  if (!entry) {
    entry = {
      url,
      ws: null,
      subscribers: new Set(),
      status: 'connecting',
      backoffIdx: 0,
      reconnectTimer: null,
      heartbeatTimer: null,
      closeDebounceTimer: null,
      destroyed: false,
    };
    _pool.set(url, entry);
  }

  // If a debounced close was pending (refCount briefly hit 0), cancel it —
  // the existing socket can be reused.
  if (entry.closeDebounceTimer !== null) {
    clearTimeout(entry.closeDebounceTimer);
    entry.closeDebounceTimer = null;
  }

  const sub: SubscriberRecord = {
    onMessage: opts.onMessage,
    onStatus: opts.onStatus,
    heartbeatMs: opts.heartbeatMs,
  };
  entry.subscribers.add(sub);

  // Notify the new subscriber of current status (so they don't miss the
  // initial 'connecting' / 'connected' transition).
  try { sub.onStatus?.(entry.status); } catch { /* ignore */ }

  // Re-arm heartbeat in case the new subscriber requested a longer one
  // (the active heartbeat is the MAX of all requests).
  if (entry.ws && entry.status === 'connected') _armHeartbeat(entry);

  // Open the socket if we don't have one yet (fresh entry, or post-debounce close).
  if (!entry.ws && entry.reconnectTimer === null) {
    _openSocket(entry);
  }

  const capturedEntry = entry;
  return () => {
    capturedEntry.subscribers.delete(sub);
    if (capturedEntry.subscribers.size === 0) {
      // Debounced close: keep the socket alive for CLOSE_DEBOUNCE_MS so a
      // quick re-acquire (e.g. SPA route bounce) can reuse it.
      if (capturedEntry.closeDebounceTimer !== null) {
        clearTimeout(capturedEntry.closeDebounceTimer);
      }
      capturedEntry.closeDebounceTimer = setTimeout(() => {
        capturedEntry.closeDebounceTimer = null;
        if (capturedEntry.subscribers.size > 0) return; // someone re-acquired
        capturedEntry.destroyed = true;
        _clearReconnect(capturedEntry);
        _clearHeartbeat(capturedEntry);
        const ws = capturedEntry.ws;
        capturedEntry.ws = null;
        if (ws) {
          ws.onclose = null; // suppress reconnect via onclose
          ws.close();
        }
        if (_pool.get(capturedEntry.url) === capturedEntry) _pool.delete(capturedEntry.url);
      }, CLOSE_DEBOUNCE_MS);
    } else {
      // Re-arm heartbeat — remaining subscribers may have a different MAX.
      _armHeartbeat(capturedEntry);
    }
  };
}

/** Snapshot of current pool entries — for debugging / DevTools. */
function snapshot(): Array<{
  url: string;
  subscribers: number;
  readyState: number | null;
  status: WsStatus;
}> {
  return Array.from(_pool.values()).map((entry) => ({
    url: entry.url,
    subscribers: entry.subscribers.size,
    readyState: entry.ws?.readyState ?? null,
    status: entry.status,
  }));
}

export const wsPool = { acquire, snapshot };
