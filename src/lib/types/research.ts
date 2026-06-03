/**
 * Research domain type re-exports (W-0414 PR8B).
 *
 * Centralizes engine-openapi type aliases so .svelte components
 * don't import the engine-* path directly (design invariant:
 * "Svelte must not import Python engine").
 */
import type { components } from '$lib/contracts/generated/engine-openapi';

export type BucketListItem = components['schemas']['BucketListItem'];
export type BucketAttributionResponse = components['schemas']['BucketAttributionResponse'];
export type BucketStateOut = components['schemas']['BucketStateOut'];
export type ModeStatusOut = components['schemas']['ModeStatusOut'];
export type PoolingChainOut = components['schemas']['PoolingChainOut'];
export type PoolingNodeOut = components['schemas']['PoolingNodeOut'];
export type RecentTradeOut = components['schemas']['RecentTradeOut'];
