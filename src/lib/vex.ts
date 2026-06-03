/**
 * VEX bridge — window.vex 타입 계약 + isVex() + 개발용 mock.
 *
 * 실제 window.vex는 VEX Main 8 Electron의 preload.js가 주입한다.
 * 웹 배포 시 window.vex는 undefined → isVex() === false → VEX 슬롯 숨김.
 */

// ---------------------------------------------------------------------------
// 타입 계약
// ---------------------------------------------------------------------------

export type TrustZone = 'HUMAN' | 'CO-PILOT' | 'AGENT';

export type MissionPhase = 'IDLE' | 'WATCHING' | 'PROPOSED' | 'LIVE' | 'KILLED';

export interface TradeSpec {
  symbol: string;
  side: 'BUY' | 'SELL';
  size: number;
  order_type: 'market' | 'limit';
  price?: number;
  idempotency_key: string;
}

export interface ApprovalRequest {
  approval_id: string;
  spec: TradeSpec;
  signal_g3: number;
  signal_rank: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  estimated_usd: number;
  timeout_ms: number;
}

export interface ApprovalResult {
  approval_id: string;
  action: 'approved' | 'rejected' | 'timeout';
  timestamp: number;
}

export interface WalletState {
  address: string;
  short_addr: string;
  balances: Record<string, number>;
  pnl_usd: number;
}

export interface MissionState {
  phase: MissionPhase;
  trust_zone: TrustZone;
  active_mission_id?: string;
  pending_approval?: ApprovalRequest;
}

export interface VexCommand {
  id: string;
  label: string;
  hint?: string;
  section: 'vex';
  disabled?: boolean;
}

export interface VexBridge {
  // 읽기
  getMissionState: () => Promise<MissionState>;
  getWalletState: () => Promise<WalletState>;
  getCommands: () => VexCommand[];

  // 구독
  onMissionStateChange: (cb: (state: MissionState) => void) => () => void;
  onApprovalRequest: (cb: (req: ApprovalRequest) => void) => () => void;

  // 액션
  approve: (approval_id: string) => Promise<ApprovalResult>;
  reject: (approval_id: string) => Promise<ApprovalResult>;
  setTrustZone: (zone: TrustZone) => Promise<void>;
  kill: () => Promise<void>;
}

declare global {
  interface Window {
    vex?: VexBridge;
  }
}

// ---------------------------------------------------------------------------
// 감지
// ---------------------------------------------------------------------------

export const isVex = (): boolean =>
  typeof window !== 'undefined' && typeof window.vex !== 'undefined';

// ---------------------------------------------------------------------------
// 개발용 mock
// 활성화: localStorage.setItem('vex-dev-mock', '1') 또는 URL ?vex=mock
// 비활성화: localStorage.removeItem('vex-dev-mock')
// ---------------------------------------------------------------------------

function shouldActivateMock(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof localStorage !== 'undefined' && localStorage.getItem('vex-dev-mock') === '1') return true;
  try {
    return new URLSearchParams(window.location.search).get('vex') === 'mock';
  } catch {
    return false;
  }
}

function buildMock(): VexBridge {
  let missionState: MissionState = {
    phase: 'IDLE',
    trust_zone: 'HUMAN',
  };

  const missionListeners = new Set<(s: MissionState) => void>();
  const approvalListeners = new Set<(r: ApprovalRequest) => void>();

  function emitMission(next: Partial<MissionState>) {
    missionState = { ...missionState, ...next };
    missionListeners.forEach(cb => cb(missionState));
  }

  // IDLE → WATCHING → PROPOSED 사이클 시뮬레이션 (4s 주기)
  let cycleTimer: ReturnType<typeof setTimeout> | null = null;
  const MOCK_APPROVAL_ID = 'mock-approval-001';

  function startCycle() {
    cycleTimer = setTimeout(() => {
      emitMission({ phase: 'WATCHING' });
      cycleTimer = setTimeout(() => {
        const req: ApprovalRequest = {
          approval_id: MOCK_APPROVAL_ID,
          spec: {
            symbol: 'BTCUSDT',
            side: 'BUY',
            size: 0.1,
            order_type: 'market',
            idempotency_key: MOCK_APPROVAL_ID,
          },
          signal_g3: 0.82,
          signal_rank: 3,
          risk_level: 'MEDIUM',
          estimated_usd: 6840,
          timeout_ms: 30_000,
        };
        emitMission({ phase: 'PROPOSED', pending_approval: req });
        approvalListeners.forEach(cb => cb(req));

        // 30s 후 타임아웃
        cycleTimer = setTimeout(() => {
          emitMission({ phase: 'IDLE', pending_approval: undefined });
          startCycle();
        }, 30_000);
      }, 2_000);
    }, 4_000);
  }

  startCycle();

  return {
    getMissionState: async () => missionState,

    getWalletState: async () => ({
      address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
      short_addr: '0x1a2b…9a0b',
      balances: { ETH: 0.42, USDT: 12_400 },
      pnl_usd: 420,
    }),

    getCommands: () => [
      { id: 'vex_approve', label: '✓ Approve trade', hint: 'Y', section: 'vex', disabled: missionState.phase !== 'PROPOSED' },
      { id: 'vex_reject',  label: '✕ Reject trade',  hint: 'N', section: 'vex', disabled: missionState.phase !== 'PROPOSED' },
      { id: 'vex_kill',   label: '■ Kill switch',    hint: '',  section: 'vex' },
      { id: 'vex_trust_human',   label: 'Trust → HUMAN',    hint: '', section: 'vex' },
      { id: 'vex_trust_copilot', label: 'Trust → CO-PILOT', hint: '', section: 'vex' },
      { id: 'vex_trust_agent',   label: 'Trust → AGENT',    hint: '', section: 'vex' },
    ],

    onMissionStateChange: (cb) => {
      missionListeners.add(cb);
      return () => missionListeners.delete(cb);
    },

    onApprovalRequest: (cb) => {
      approvalListeners.add(cb);
      return () => approvalListeners.delete(cb);
    },

    approve: async (approval_id) => {
      if (cycleTimer) clearTimeout(cycleTimer);
      const result: ApprovalResult = { approval_id, action: 'approved', timestamp: Date.now() };
      emitMission({ phase: 'LIVE', pending_approval: undefined });
      setTimeout(() => { emitMission({ phase: 'IDLE' }); startCycle(); }, 5_000);
      return result;
    },

    reject: async (approval_id) => {
      if (cycleTimer) clearTimeout(cycleTimer);
      const result: ApprovalResult = { approval_id, action: 'rejected', timestamp: Date.now() };
      emitMission({ phase: 'IDLE', pending_approval: undefined });
      startCycle();
      return result;
    },

    setTrustZone: async (zone) => {
      emitMission({ trust_zone: zone });
    },

    kill: async () => {
      if (cycleTimer) clearTimeout(cycleTimer);
      emitMission({ phase: 'KILLED', pending_approval: undefined });
    },
  };
}

// ---------------------------------------------------------------------------
// 초기화 (모듈 로드 시 1회)
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined' && !window.vex && shouldActivateMock()) {
  window.vex = buildMock();
  console.info('[VEX] dev-mock 활성. window.vex injected.');
}
