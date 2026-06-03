import {
  buildDeepLink,
  buildTerminalLink,
  buildLabLink,
  buildDashboardLink,
} from '$lib/utils/deepLinks';

export type AppSurfaceId = 'home' | 'daily' | 'dashboard' | 'terminal' | 'scanner' | 'lab' | 'passport' | 'patterns' | 'scan' | 'agent' | 'market' | 'analyze' | 'mmlab' | 'account' | 'settings';

export interface AppSurface {
  id: AppSurfaceId;
  label: string;
  shortLabel: string;
  mobileIcon: string;
  description: string;
  homeDetail: string;
  href: string;
  activePatterns: string[];
  /** When true, this tab gets accent-color highlighting in nav */
  highlight?: boolean;
}

const SURFACE_MAP: Record<AppSurfaceId, AppSurface> = {
  home: {
    id: 'home',
    label: 'Home',
    shortLabel: 'HOME',
    mobileIcon: '⌂',
    description: 'landing — choose builder or copier path',
    homeDetail: 'start here',
    href: buildDeepLink('/'),
    activePatterns: ['/'],
  },
  daily: {
    id: 'daily',
    label: 'Daily',
    shortLabel: 'DAILY',
    mobileIcon: '◐',
    description: 'daily brief — pulse, headline, levers',
    homeDetail: 'daily brief',
    href: '/daily',
    activePatterns: ['/daily'],
  },
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    shortLabel: 'DASH',
    mobileIcon: '◻',
    description: 'my stuff inbox — saved setups, live watches, next actions',
    homeDetail: 'my inbox',
    href: buildDashboardLink(),
    activePatterns: ['/dashboard'],
  },
  terminal: {
    id: 'terminal',
    label: 'Terminal',
    shortLabel: 'TERM',
    mobileIcon: '~',
    description: 'review + capture — chart, inspect, save setup',
    homeDetail: 'review & capture',
    href: '/cogochi',
    activePatterns: ['/terminal', '/cogochi'],
  },
  scanner: {
    id: 'scanner',
    label: 'Scanner',
    shortLabel: 'SCAN',
    mobileIcon: '⊞',
    description: 'multi-coin scanner — 15-layer analysis, filters, watchlist',
    homeDetail: 'market scanner',
    href: buildTerminalLink(),
    activePatterns: ['/scanner', '/terminal', '/cogochi/scanner'],
  },
  lab: {
    id: 'lab',
    label: 'Lab',
    shortLabel: 'LAB',
    mobileIcon: '⚗',
    description: 'evaluate + inspect + iterate — run and compare setups',
    homeDetail: 'evaluate setups',
    href: buildLabLink(),
    activePatterns: ['/lab', '/research'],
    highlight: true,
  },
  passport: {
    id: 'passport',
    label: 'Passport',
    shortLabel: 'PASS',
    mobileIcon: '◈',
    description: 'your identity — wallet, achievements, strategy passport',
    homeDetail: 'my passport',
    href: buildDeepLink('/passport'),
    activePatterns: ['/passport'],
  },
  patterns: {
    id: 'patterns',
    label: 'Patterns',
    shortLabel: 'PAT',
    mobileIcon: '◎',
    description: 'pattern engine — live phase states, stats, scanner',
    homeDetail: 'pattern engine',
    href: '/patterns',
    activePatterns: ['/patterns'],
  },
  scan: {
    id: 'scan',
    label: 'Scan',
    shortLabel: 'SCAN',
    mobileIcon: '⊡',
    description: 'pre-pump hub — scan, board, positions, research, tape, review',
    homeDetail: 'pre-pump hub',
    href: '/scan',
    activePatterns: ['/scan', '/signals'],
  },
  analyze: {
    id: 'analyze',
    label: 'Analyze',
    shortLabel: 'ANL',
    mobileIcon: '⟁',
    description: 'multi-LLM signal analyzer — paste analysis text, compare models',
    homeDetail: 'AI 신호 분석',
    href: '/lab/analyze',
    activePatterns: ['/lab/analyze', '/analyze'],
  },
  agent: {
    id: 'agent',
    label: 'Agent',
    shortLabel: 'AGT',
    mobileIcon: '~',
    description: 'agent definitions — configure and monitor research agents',
    homeDetail: 'research agents',
    href: '/agent',
    activePatterns: ['/agent'],
  },
  market: {
    id: 'market',
    label: 'Market',
    shortLabel: 'MKT',
    mobileIcon: '▦',
    description: 'market overview — live prices, flows, macro context',
    homeDetail: 'market overview',
    href: '/lab/market',
    activePatterns: ['/lab/market'],
  },
  mmlab: {
    id: 'mmlab',
    label: 'MM Lab',
    shortLabel: 'MLAB',
    mobileIcon: '⚡',
    description: 'market memory lab — propfirm challenge, signals, earnings',
    homeDetail: 'MM Lab',
    href: '/mmlab',
    activePatterns: ['/mmlab', '/propfirm'],
  },
  account: {
    id: 'account',
    label: 'Account',
    shortLabel: 'ACCT',
    mobileIcon: '◉',
    description: 'profile, passport, plan — your account hub',
    homeDetail: 'my account',
    href: '/account',
    activePatterns: ['/account', '/settings', '/upgrade'],
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'SET',
    mobileIcon: '◉',
    description: 'profile, passport, plan — account settings',
    homeDetail: 'settings',
    href: '/settings',
    activePatterns: ['/settings', '/account', '/upgrade'],
  },
};

// Primary IA: Terminal → Dashboard → Daily → Patterns → Lab → Settings
// MM Lab moved to profile popover (already there). Daily + Lab added.
export const DESKTOP_NAV_SURFACES = [
  SURFACE_MAP.terminal,
  SURFACE_MAP.dashboard,
  SURFACE_MAP.daily,
  SURFACE_MAP.patterns,
  SURFACE_MAP.lab,
  SURFACE_MAP.settings,
] as const;

/** Five hubs — matches desktop IA; Home via top logo / hero CTAs. */
export const MOBILE_NAV_SURFACES = [
  SURFACE_MAP.daily,
  SURFACE_MAP.terminal,
  SURFACE_MAP.patterns,
  SURFACE_MAP.dashboard,
  SURFACE_MAP.lab,
] as const;

/** Compact picks for marketing home — same order as primary IA. */
export const HOME_SURFACES = [
  SURFACE_MAP.daily,
  SURFACE_MAP.terminal,
  SURFACE_MAP.patterns,
] as const;

export function getAppSurface(id: AppSurfaceId): AppSurface {
  return SURFACE_MAP[id];
}

export function isAppSurfaceActive(id: AppSurfaceId, pathname: string): boolean {
  const surface = SURFACE_MAP[id];
  return surface.activePatterns.some((pattern) => matchesPattern(pathname, pattern));
}

function matchesPattern(pathname: string, pattern: string): boolean {
  return pathname === pattern || pathname.startsWith(`${pattern}/`);
}
