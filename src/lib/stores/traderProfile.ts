/**
 * traderProfile store — W-0541 PR4 foundation (created during PR2 wiring).
 *
 * Persona model from W-0531 + chart_analyst extension from W-0541 §1.
 * Stored in localStorage so persona persists across sessions on the same device.
 * Settings page (W-0541 PR4) will provide UI to switch.
 *
 * Default = 'discretionary' per W-0531 §4.2 (safest for new users — does not
 * over-expose quant features prematurely).
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type TraderStyle = 'quant' | 'chart_analyst' | 'discretionary' | 'hybrid';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type AiDepth = 'l0' | 'l1' | 'l2' | 'l3';
export type DefaultSurface = 'daily' | 'terminal' | 'signals';

export interface TraderProfile {
  trader_style: TraderStyle;
  experience_level: ExperienceLevel;
  default_surface: DefaultSurface;
  ai_depth_default: AiDepth;
}

const STORAGE_KEY = 'cogochi:traderProfile:v1';

export const DEFAULT_PROFILE: TraderProfile = {
  trader_style: 'discretionary',
  experience_level: 'beginner',
  default_surface: 'daily',
  ai_depth_default: 'l0',
};

function load(): TraderProfile {
  if (!browser) return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<TraderProfile>;
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function persist(p: TraderProfile): void {
  if (!browser) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

function createTraderProfileStore() {
  const { subscribe, set, update } = writable<TraderProfile>(load());

  return {
    subscribe,
    setStyle(style: TraderStyle): void {
      update((p) => {
        const next = { ...p, trader_style: style };
        persist(next);
        return next;
      });
    },
    setAiDepth(depth: AiDepth): void {
      update((p) => {
        const next = { ...p, ai_depth_default: depth };
        persist(next);
        return next;
      });
    },
    set(profile: TraderProfile): void {
      persist(profile);
      set(profile);
    },
    reset(): void {
      persist(DEFAULT_PROFILE);
      set(DEFAULT_PROFILE);
    },
  };
}

export const traderProfile = createTraderProfileStore();
