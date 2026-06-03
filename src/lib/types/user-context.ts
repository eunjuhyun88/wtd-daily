export interface UserContext {
  patterns_tab?: string;
  patterns_left_px?: number;
  patterns_right_px?: number;
  patterns_filters?: string[];
  patterns_research_subtab?: string;
}

export const USER_CONTEXT_KEYS = [
  'patterns_tab',
  'patterns_left_px',
  'patterns_right_px',
  'patterns_filters',
  'patterns_research_subtab',
] as const satisfies ReadonlyArray<keyof UserContext>;

export type UserContextKey = (typeof USER_CONTEXT_KEYS)[number];
