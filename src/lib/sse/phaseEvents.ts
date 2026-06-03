/**
 * W-0432 PR1 stub — subscribes to /api/engine/events/phase-transitions SSE.
 * Real UI wiring (SignalFeed, Terminal alerts) happens in PR6.
 */

export interface PhaseTransitionEvent {
  type: 'phase_transition' | 'connected' | 'ping';
  transition_id?: string;
  symbol?: string;
  pattern_slug?: string;
  from_phase?: string;
  to_phase?: string;
  pattern_version?: number;
  created_at?: string;
}

type Handler = (event: PhaseTransitionEvent) => void;

/** Subscribe to live phase transition events. Returns an unsubscribe function. */
export function subscribePhaseEvents(handler: Handler): () => void {
  const es = new EventSource('/api/engine/events/phase-transitions');

  es.onmessage = (e: MessageEvent) => {
    try {
      handler(JSON.parse(e.data as string) as PhaseTransitionEvent);
    } catch {
      // malformed SSE payload — ignore
    }
  };

  es.onerror = () => {
    // EventSource reconnects automatically on error
  };

  return () => es.close();
}
