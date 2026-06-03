export interface CachedAiContextEnvelope {
  regime_posterior?: Record<string, number> | null;
  regime_posterior_stub?: boolean;
  regime_source?: string | null;
  entropy?: number | null;
  psi?: number | null;
  distribution_shift?: boolean;
  low_edge?: boolean;
  expected_move_bps?: number | null;
  frictions_total_bps?: number | null;
}

export interface CachedModelOption {
  id: string;
  label: string;
  badge: string;
}

export interface CachedRouteProfileOption {
  id: string;
  label: string;
  badge: string;
  description: string;
  default_model_id: string;
  fallback_model_id: string;
  pipeline_models: Record<string, string>;
}

export interface CachedModelCatalog {
  models: CachedModelOption[];
  route_profiles: CachedRouteProfileOption[];
  default_route_profile_id?: string;
  pipeline_labels?: Record<string, string>;
}

export const terminalPanelCache = {
  aiContext: new Map<string, CachedAiContextEnvelope | null>(),
  aiCatalog: null as CachedModelCatalog | null,
  aiCatalogPromise: null as Promise<CachedModelCatalog | null> | null,
};
