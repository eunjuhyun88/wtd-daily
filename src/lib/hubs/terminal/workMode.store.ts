import { writable } from 'svelte/store';
import { trackWorkmodeSwitch } from './telemetry';

// W-0481: SSoT alignment with PRODUCT-DESIGN-FINAL.
// Legacy values 'TRADE'/'FLYWHEEL' from existing localStorage migrate to new
// names on first read; the migrated value is rewritten so subsequent loads are clean.
export type WorkMode = 'ANALYZE' | 'TRAIN' | 'REVIEW';

const STORAGE_KEY = 'cogochi.workMode';

const LEGACY_MAP: Record<string, WorkMode> = {
  TRADE: 'ANALYZE',
  FLYWHEEL: 'REVIEW',
};

function migrateLegacy(raw: string | null): WorkMode {
  if (raw && Object.hasOwn(LEGACY_MAP, raw)) return LEGACY_MAP[raw];
  if (raw === 'ANALYZE' || raw === 'TRAIN' || raw === 'REVIEW') return raw;
  return 'ANALYZE';
}

function loadInitial(): WorkMode {
  if (typeof localStorage === 'undefined') return 'ANALYZE';
  const raw = localStorage.getItem(STORAGE_KEY);
  const migrated = migrateLegacy(raw);
  if (raw !== migrated) localStorage.setItem(STORAGE_KEY, migrated);
  return migrated;
}

function createWorkModeStore() {
  const initial: WorkMode = loadInitial();

  const { subscribe, set, update: _update } = writable<WorkMode>(initial);
  let _current: WorkMode = initial;
  subscribe(v => { _current = v; });

  return {
    subscribe,
    set: (mode: WorkMode) => {
      const prev = _current;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, mode);
      }
      set(mode);
      if (prev !== mode) {
        trackWorkmodeSwitch(prev, mode);
      }
    },
  };
}

export const workMode = createWorkModeStore();
