import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { wsPool } from './wsPool';

// ─── WebSocket mock ──────────────────────────────────────────────────────────

interface MockWebSocketCtor {
  new (url: string): MockWebSocket;
  readonly instances: MockWebSocket[];
  readonly latest: MockWebSocket | undefined;
  readonly openCount: number;
}

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  readyState: number;
  onopen: (() => void) | null = null;
  onmessage: ((evt: MessageEvent) => void) | null = null;
  onerror: ((evt: Event) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    MockWebSocket.instances.push(this);
  }

  // Test helpers
  simulateOpen(): void {
    this.readyState = 1;
    this.onopen?.();
  }
  simulateMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent);
  }
  close(): void {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.onclose?.();
  }
}

const MockWebSocketCtor = MockWebSocket as unknown as MockWebSocketCtor;
Object.defineProperty(MockWebSocketCtor, 'latest', {
  get(): MockWebSocket | undefined {
    return MockWebSocket.instances[MockWebSocket.instances.length - 1];
  },
});
Object.defineProperty(MockWebSocketCtor, 'openCount', {
  get(): number {
    return MockWebSocket.instances.length;
  },
});

const originalWebSocket = globalThis.WebSocket;

beforeEach(() => {
  MockWebSocket.instances = [];
  // @ts-expect-error — replacing global for the duration of the test
  globalThis.WebSocket = MockWebSocket;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  globalThis.WebSocket = originalWebSocket;
  // Drain pool by closing every entry in snapshot
  for (const _ of wsPool.snapshot()) {
    // No public drain — left for test isolation; subsequent tests use new URLs
  }
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('wsPool', () => {
  it('shares one WebSocket across multiple subscribers on the same URL', () => {
    const url = 'wss://example.test/share';
    const r1 = wsPool.acquire(url, { onMessage: vi.fn() });
    const r2 = wsPool.acquire(url, { onMessage: vi.fn() });

    expect(MockWebSocketCtor.openCount).toBe(1);

    const snap = wsPool.snapshot().find((s) => s.url === url);
    expect(snap?.subscribers).toBe(2);

    r1();
    r2();
    // Close is debounced (5s); flush it to release the underlying socket
    vi.advanceTimersByTime(6_000);
    expect(wsPool.snapshot().find((s) => s.url === url)).toBeUndefined();
  });

  it('fans out messages to every subscriber', () => {
    const url = 'wss://example.test/fanout';
    const a = vi.fn();
    const b = vi.fn();
    const ra = wsPool.acquire(url, { onMessage: a });
    const rb = wsPool.acquire(url, { onMessage: b });

    MockWebSocketCtor.latest!.simulateOpen();
    MockWebSocketCtor.latest!.simulateMessage({ hello: 'world' });

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);

    ra(); rb();
    vi.advanceTimersByTime(6_000);
  });

  it('debounces close: re-acquire within 5s reuses the same socket', () => {
    const url = 'wss://example.test/debounce';
    const r1 = wsPool.acquire(url, { onMessage: vi.fn() });
    expect(MockWebSocketCtor.openCount).toBe(1);

    r1();
    // Within debounce window
    vi.advanceTimersByTime(2_000);

    const r2 = wsPool.acquire(url, { onMessage: vi.fn() });
    // No new socket should have been opened
    expect(MockWebSocketCtor.openCount).toBe(1);
    expect(wsPool.snapshot().find((s) => s.url === url)?.subscribers).toBe(1);

    r2();
    vi.advanceTimersByTime(6_000);
  });

  it('closes the socket when no re-acquire happens before debounce expires', () => {
    const url = 'wss://example.test/close';
    const r1 = wsPool.acquire(url, { onMessage: vi.fn() });
    const sock = MockWebSocketCtor.latest!;
    sock.simulateOpen();

    r1();
    expect(sock.readyState).toBe(1); // still open during debounce
    vi.advanceTimersByTime(6_000);
    expect(sock.readyState).toBe(3); // closed
    expect(wsPool.snapshot().find((s) => s.url === url)).toBeUndefined();
  });

  it('reconnects with backoff if the socket closes while subscribers remain', () => {
    const url = 'wss://example.test/reconnect';
    const status = vi.fn();
    const release = wsPool.acquire(url, { onMessage: vi.fn(), onStatus: status });

    const first = MockWebSocketCtor.latest!;
    first.simulateOpen();

    // Simulate server-side disconnect
    first.close();

    // Should be in 'reconnecting' state
    expect(status).toHaveBeenCalledWith('disconnected');
    expect(status).toHaveBeenCalledWith('reconnecting');

    // Advance past first backoff step (100ms)
    vi.advanceTimersByTime(150);
    expect(MockWebSocketCtor.openCount).toBe(2);

    MockWebSocketCtor.latest!.simulateOpen();
    expect(status).toHaveBeenCalledWith('connected');

    release();
    vi.advanceTimersByTime(6_000);
  });

  it('triggers heartbeat reconnect when no message arrives in heartbeatMs', () => {
    const url = 'wss://example.test/heartbeat';
    const release = wsPool.acquire(url, { onMessage: vi.fn(), heartbeatMs: 1_000 });
    const sock = MockWebSocketCtor.latest!;
    sock.simulateOpen();

    // No messages — heartbeat should fire after 1s
    vi.advanceTimersByTime(1_100);
    expect(sock.readyState).toBe(3); // closed

    // Reconnect should kick in
    vi.advanceTimersByTime(150);
    expect(MockWebSocketCtor.openCount).toBe(2);

    release();
    vi.advanceTimersByTime(6_000);
  });

  it('isolates exceptions in a subscriber so other subscribers keep receiving', () => {
    const url = 'wss://example.test/isolate';
    const bad = vi.fn(() => { throw new Error('boom'); });
    const good = vi.fn();
    const r1 = wsPool.acquire(url, { onMessage: bad });
    const r2 = wsPool.acquire(url, { onMessage: good });

    MockWebSocketCtor.latest!.simulateOpen();
    MockWebSocketCtor.latest!.simulateMessage({ x: 1 });

    expect(bad).toHaveBeenCalledTimes(1);
    expect(good).toHaveBeenCalledTimes(1);

    r1(); r2();
    vi.advanceTimersByTime(6_000);
  });
});
