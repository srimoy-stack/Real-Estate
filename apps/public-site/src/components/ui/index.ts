/**
 * UI Design System — Public API
 *
 * Import everything from here:
 *   import { UnifiedPropertyCard, formatPrice } from '@/components/ui';
 */

// The ONE card
export { UnifiedPropertyCard } from './UnifiedPropertyCard';
export type { default as UnifiedPropertyCardDefault } from './UnifiedPropertyCard';

// Data normalization
export { autoNormalize, normalizeListing, normalizeMLSProperty } from './normalize-property';
export type { NormalizedProperty } from './normalize-property';

// Design tokens
export {
    colors,
    typography,
    spacing,
    shapes,
    STATUS_CONFIG,
    resolveStatus,
    formatPrice,
    formatNumber,
    timeAgo,
    isRecentListing,
    PLACEHOLDER_IMAGE,
} from './design-tokens';
