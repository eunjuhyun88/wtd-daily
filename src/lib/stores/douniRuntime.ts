// ═══════════════════════════════════════════════════════════════
// douniRuntime — local-first AI runtime policy store (localStorage-persisted)
// ═══════════════════════════════════════════════════════════════
//
// Runtime policy:
//   LOCAL_ONLY      — local Ollama only
//   LOCAL_FIRST     — prefer local Ollama; BYOK/server routing handled downstream
//   BYOK_ONLY       — require a user-provided API key
//   SERVER_ONLY     — server-managed provider path
//   HEURISTIC_ONLY  — no LLM, template fallback only

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type AiRuntimeMode =
  | 'LOCAL_ONLY'
  | 'LOCAL_FIRST'
  | 'BYOK_ONLY'
  | 'SERVER_ONLY'
  | 'HEURISTIC_ONLY';

type LegacyRuntimeMode = 'TERMINAL' | 'HEURISTIC' | 'OLLAMA' | 'API';
export type DouniMode = AiRuntimeMode;

export interface DouniRuntimeConfig {
  mode: AiRuntimeMode;
  /** Preferred remote provider for BYOK/server paths. */
  provider: string;
  /** User's own API key (session-scoped only). */
  apiKey: string;
  /** Local Ollama model name. */
  ollamaModel: string;
  /** Local Ollama server endpoint. */
  ollamaEndpoint: string;
  /** Future runtime router toggle; default off for local-first. */
  allowServerFallback: boolean;
}

const STORAGE_KEY = 'douni_runtime';
// API key uses sessionStorage (tab-scoped) to reduce XSS exfiltration window.
// It is intentionally not persisted across sessions — users re-enter on each visit.
const APIKEY_STORAGE = 'douni_api_key';
const LEGACY_MIGRATION_KEY = 'douni_runtime_migrated_v2';

const DEFAULT: DouniRuntimeConfig = {
  mode: 'LOCAL_FIRST',
  provider: 'groq',
  apiKey: '',
  ollamaModel: 'qwen3:1.7b',
  ollamaEndpoint: 'http://localhost:11434',
  allowServerFallback: false,
};

const LEGACY_DEFAULT: Omit<DouniRuntimeConfig, 'apiKey'> = {
  mode: 'HEURISTIC_ONLY',
  provider: 'groq',
  ollamaModel: 'mistral:7b',
  ollamaEndpoint: 'http://localhost:11434',
  allowServerFallback: false,
};

function matchesLegacyDefault(config: Partial<DouniRuntimeConfig>): boolean {
  return (
    config.mode === LEGACY_DEFAULT.mode &&
    (config.provider ?? LEGACY_DEFAULT.provider) === LEGACY_DEFAULT.provider &&
    (config.ollamaModel ?? LEGACY_DEFAULT.ollamaModel) === LEGACY_DEFAULT.ollamaModel &&
    (config.ollamaEndpoint ?? LEGACY_DEFAULT.ollamaEndpoint) === LEGACY_DEFAULT.ollamaEndpoint
  );
}

function mapLegacyMode(mode: LegacyRuntimeMode | AiRuntimeMode | undefined, hasApiKey: boolean): AiRuntimeMode {
  switch (mode) {
    case 'TERMINAL':
    case 'HEURISTIC':
    case 'HEURISTIC_ONLY':
      return 'HEURISTIC_ONLY';
    case 'OLLAMA':
    case 'LOCAL_ONLY':
      return 'LOCAL_ONLY';
    case 'BYOK_ONLY':
    case 'SERVER_ONLY':
    case 'LOCAL_FIRST':
      return mode;
    case 'API':
      return hasApiKey ? 'BYOK_ONLY' : 'LOCAL_FIRST';
    default:
      return DEFAULT.mode;
  }
}

function loadFromStorage(): DouniRuntimeConfig {
  if (!browser) return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const apiKey = sessionStorage.getItem(APIKEY_STORAGE) ?? '';
    if (!raw) return { ...DEFAULT, apiKey };

    const parsed = JSON.parse(raw) as Partial<DouniRuntimeConfig>;
    const shouldUpgradeLegacyDefault =
      localStorage.getItem(LEGACY_MIGRATION_KEY) !== '1' &&
      !apiKey &&
      matchesLegacyDefault(parsed);

    const nextMode = shouldUpgradeLegacyDefault
      ? DEFAULT.mode
      : mapLegacyMode(parsed.mode as LegacyRuntimeMode | AiRuntimeMode | undefined, Boolean(apiKey));

    const next = {
      ...DEFAULT,
      ...parsed,
      apiKey,
      mode: nextMode,
    };

    if (shouldUpgradeLegacyDefault) {
      persistToStorage(next);
    }
    localStorage.setItem(LEGACY_MIGRATION_KEY, '1');

    return next;
  } catch {
    return { ...DEFAULT };
  }
}

function persistToStorage(c: DouniRuntimeConfig): void {
  if (!browser) return;
  const { apiKey, ...rest } = c;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  // API key stored in sessionStorage only — cleared on tab/browser close.
  if (apiKey) {
    sessionStorage.setItem(APIKEY_STORAGE, apiKey);
  } else {
    sessionStorage.removeItem(APIKEY_STORAGE);
  }
}

function createRuntimeStore() {
  const { subscribe, update } = writable<DouniRuntimeConfig>(loadFromStorage());

  function patch(partial: Partial<DouniRuntimeConfig>) {
    update(c => {
      const next = { ...c, ...partial };
      persistToStorage(next);
      return next;
    });
  }

  return {
    subscribe,
    patch,
    setMode: (mode: DouniMode) => patch({ mode }),
  };
}

export const douniRuntimeStore = createRuntimeStore();

/** Non-reactive snapshot — safe inside async functions */
export const getDouniRuntime = () => get(douniRuntimeStore);

export function toLegacyRuntimeConfig(config: DouniRuntimeConfig): {
  mode: 'HEURISTIC' | 'OLLAMA' | 'API';
  provider?: string;
  apiKey?: string;
  ollamaModel?: string;
  ollamaEndpoint?: string;
} {
  switch (config.mode) {
    case 'HEURISTIC_ONLY':
      return { mode: 'HEURISTIC' };
    case 'LOCAL_ONLY':
    case 'LOCAL_FIRST':
      return {
        mode: 'OLLAMA',
        ollamaModel: config.ollamaModel,
        ollamaEndpoint: config.ollamaEndpoint,
      };
    case 'BYOK_ONLY':
    case 'SERVER_ONLY':
    default:
      return {
        mode: 'API',
        provider: config.provider,
        apiKey: config.apiKey,
      };
  }
}
