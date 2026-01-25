import { useStore } from '@/lib/store';
import type { Feature, EntitlementState } from '@shared/types';

/**
 * Hook for checking if a user has access to a specific feature.
 * Returns a tri-state: 'unknown' while loading, 'allowed' or 'denied' once resolved.
 *
 * @param feature - The feature to check ('reports' | 'vin' | 'photos' | 'ai')
 * @returns EntitlementState - 'unknown' | 'allowed' | 'denied'
 *
 * @example
 * ```tsx
 * const reportsAccess = useEntitlement('reports');
 *
 * if (reportsAccess === 'unknown') return <Skeleton />;
 * if (reportsAccess === 'denied') return <Paywall />;
 * return <ReportsFeature />;
 * ```
 */
export function useEntitlement(feature: Feature): EntitlementState {
  const entitlements = useStore((s) => s.entitlements);
  const loading = useStore((s) => s.entitlementsLoading);

  // Still loading or not yet fetched
  if (loading || entitlements === null) {
    return 'unknown';
  }

  // Check the specific feature flag
  if (!entitlements.features[feature]) {
    return 'denied';
  }

  return 'allowed';
}
