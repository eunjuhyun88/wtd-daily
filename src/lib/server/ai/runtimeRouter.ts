import type { LLMProvider } from '$lib/server/llmConfig';

export type LegacyRuntimeMode = 'HEURISTIC' | 'OLLAMA' | 'API';
export type AiRuntimeMode =
  | 'LOCAL_ONLY'
  | 'LOCAL_FIRST'
  | 'BYOK_ONLY'
  | 'SERVER_ONLY'
  | 'HEURISTIC_ONLY';

export type RuntimeConfig = {
  mode: LegacyRuntimeMode | AiRuntimeMode;
  provider?: string;
  apiKey?: string;
  ollamaModel?: string;
  ollamaEndpoint?: string;
  allowServerFallback?: boolean;
};

export type ResolvedAssistantRuntime =
  | { kind: 'heuristic' }
  | { kind: 'user_api'; provider: string; apiKey: string }
  | { kind: 'local_ollama'; model?: string; endpoint?: string }
  | { kind: 'provider_pool'; provider: LLMProvider };

export function resolveAssistantRuntime(args: {
  runtimeConfig?: RuntimeConfig;
  explicitProvider?: LLMProvider;
  preferredProvider?: LLMProvider | null;
  availableProvider?: LLMProvider | null;
}): ResolvedAssistantRuntime {
  const { runtimeConfig, explicitProvider, preferredProvider, availableProvider } = args;
  const mode = runtimeConfig?.mode;

  if (mode === 'HEURISTIC' || mode === 'HEURISTIC_ONLY') {
    return { kind: 'heuristic' };
  }

  if (mode === 'API' && runtimeConfig?.apiKey && runtimeConfig?.provider) {
    return {
      kind: 'user_api',
      provider: runtimeConfig.provider,
      apiKey: runtimeConfig.apiKey,
    };
  }

  if (mode === 'BYOK_ONLY' && runtimeConfig?.apiKey && runtimeConfig?.provider) {
    return {
      kind: 'user_api',
      provider: runtimeConfig.provider,
      apiKey: runtimeConfig.apiKey,
    };
  }

  if (mode === 'OLLAMA' || mode === 'LOCAL_ONLY') {
    return {
      kind: 'local_ollama',
      model: runtimeConfig?.ollamaModel,
      endpoint: runtimeConfig?.ollamaEndpoint,
    };
  }

  if (mode === 'LOCAL_FIRST') {
    return {
      kind: 'local_ollama',
      model: runtimeConfig?.ollamaModel,
      endpoint: runtimeConfig?.ollamaEndpoint,
    };
  }

  const provider = explicitProvider ?? preferredProvider ?? availableProvider ?? 'ollama';
  return { kind: 'provider_pool', provider };
}
