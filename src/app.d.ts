// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				id: string;
				email: string;
				nickname: string;
				tier: 'guest' | 'registered' | 'connected' | 'verified';
				phase: number;
				wallet_address: string | null;
			} | null;
			/** B1: true when user authenticated but wallet not in beta_allowlist */
			betaPending: boolean;
			/** W-0474: SSR-resolved viewport tier (cookie → UA → DESKTOP) */
			viewportTier: 'MOBILE' | 'TABLET' | 'DESKTOP' | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
