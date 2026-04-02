/**
 * ═══════════════════════════════════════════════════════════════════
 * DESIGN SYSTEM TOKENS — Single Source of Truth
 * ═══════════════════════════════════════════════════════════════════
 *
 * ALL UI components MUST reference these tokens.
 * No hardcoded colors, font sizes, or spacing values allowed.
 *
 * Token Naming: category-variant-state
 * Example: color.brand.primary, spacing.card.padding
 */

// ─── Placeholder — LOCAL, instant, zero-latency ──────────────────
export const PLACEHOLDER_IMAGE = '/images/property-placeholder.svg';

// ─── Color Tokens ────────────────────────────────────────────────
export const colors = {
  brand: {
    primary: '#d0021b', // Brand Red — Realtor-aligned
    primaryHover: '#b8011a',
    primaryLight: 'rgba(208, 2, 27, 0.08)',
    primaryShadow: 'rgba(208, 2, 27, 0.20)',
  },
  text: {
    primary: '#111827', // High-contrast primary (WCAG AAA on white)
    secondary: '#4B5563', // Secondary — never faded
    muted: '#6B7280', // Muted labels (WCAG AA on white)
    placeholder: '#9CA3AF',
  },
  status: {
    active: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      label: 'For Sale',
      shadow: 'shadow-emerald-500/25',
    },
    sold: { bg: 'bg-rose-500', text: 'text-white', label: 'Sold', shadow: 'shadow-rose-500/25' },
    pending: {
      bg: 'bg-amber-500',
      text: 'text-white',
      label: 'Pending',
      shadow: 'shadow-amber-500/25',
    },
    offMarket: {
      bg: 'bg-slate-600',
      text: 'text-white',
      label: 'Off Market',
      shadow: 'shadow-slate-500/25',
    },
  },
  neutral: {
    900: '#111827', // Primary text
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280', // Secondary text
    400: '#9CA3AF', // Muted / label text
    300: '#D1D5DB', // Borders
    200: '#E5E7EB', // Light borders
    100: '#F3F4F6', // Background
    50: '#F9FAFB', // Very light bg
  },
  freshness: {
    new: '#16a34a', // < 48h — green
    updated: '#2563eb', // < 7d — blue
    today: '#16a34a', // today — green
  },
} as const;

// ─── Typography Tokens ───────────────────────────────────────────
export const typography = {
  family: "'Inter', system-ui, -apple-system, sans-serif",
  card: {
    price: 'text-[22px] font-extrabold leading-tight tracking-tight text-[#111827]', // 22px bold
    title: 'text-[16px] font-semibold leading-snug text-[#111827]', // 16px semi-bold
    metadata: 'text-[14px] font-medium text-[#4B5563]', // 14px — minimum body
    metadataLabel: 'text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]',
    location: 'text-[13px] font-medium text-[#4B5563]', // 13px
    badge: 'text-[11px] font-bold uppercase tracking-wider',
    mls: 'text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]',
    freshness: 'text-[12px] font-bold uppercase tracking-wide px-2.5 py-1',
  },
} as const;

// ─── Spacing Tokens (4px base) ───────────────────────────────────
export const spacing = {
  card: {
    padding: 'p-4', // 16px
    imageGap: 'gap-2', // 8px
    contentGap: 'mb-3', // 12px
    sectionGap: 'mb-4', // 16px
    badgeInset: '3', // top-3/left-3 = 12px
  },
  grid: {
    gap: 'gap-6', // 24px
    gapLg: 'lg:gap-8', // 32px
  },
} as const;

// ─── Shape Tokens ────────────────────────────────────────────────
export const shapes = {
  card: 'rounded-[14px]', // 14px — clean, modern
  badge: 'rounded-md', // 6px
  image: 'rounded-none', // Image fills card top (card handles rounding)
  button: 'rounded-xl', // 12px
} as const;

// ─── Status Config (Reusable) ────────────────────────────────────
export const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; label: string; shadow: string }
> = {
  ACTIVE: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    label: 'For Sale',
    shadow: 'shadow-emerald-500/25',
  },
  SOLD: { bg: 'bg-rose-600', text: 'text-white', label: 'Sold', shadow: 'shadow-rose-500/25' },
  PENDING: {
    bg: 'bg-amber-500',
    text: 'text-white',
    label: 'Pending',
    shadow: 'shadow-amber-500/25',
  },
  OFF_MARKET: {
    bg: 'bg-slate-600',
    text: 'text-white',
    label: 'Off Market',
    shadow: 'shadow-slate-500/25',
  },
  FOR_RENT: {
    bg: 'bg-blue-600',
    text: 'text-white',
    label: 'For Rent',
    shadow: 'shadow-blue-500/25',
  },
  LEASE: {
    bg: 'bg-blue-600',
    text: 'text-white',
    label: 'For Lease',
    shadow: 'shadow-blue-500/25',
  },
};

export function resolveStatus(status: string | undefined | null) {
  const key = (status || 'ACTIVE').toUpperCase().replace(/[\s-]+/g, '_');
  if (key.includes('RENT') || key.includes('FOR_RENT')) return STATUS_CONFIG.FOR_RENT;
  if (key.includes('LEASE')) return STATUS_CONFIG.LEASE;
  if (key.includes('SALE') || key === 'FOR_SALE') return STATUS_CONFIG.ACTIVE;
  if (key.includes('SOLD')) return STATUS_CONFIG.SOLD;
  if (key.includes('PENDING')) return STATUS_CONFIG.PENDING;
  if (key.includes('OFF') || key.includes('MARKET')) return STATUS_CONFIG.OFF_MARKET;
  return STATUS_CONFIG[key] || STATUS_CONFIG.ACTIVE;
}

// ─── Formatters ──────────────────────────────────────────────────
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('en-CA');

export type PriceDisplay =
  | { type: 'price'; text: string } // $2,390,000
  | { type: 'rent'; text: string } // $2,500 / month
  | { type: 'sqft'; text: string } // $18 / sq ft
  | { type: 'request'; text: string }; // Price on Request

/**
 * Resolve the most appropriate price display for a property.
 *
 * - Returns a typed discriminated union so the card can style each case correctly.
 * - NEVER returns empty / null / 0.
 */
export function resolvePrice(
  price: number | null | undefined,
  leaseAmount: number | null | undefined,
  leaseRateSqft: number | null | undefined,
  category: 'residential' | 'commercial' | 'lease'
): PriceDisplay {
  // Lease: prefer $/sqft for commercial, then flat monthly
  if (category === 'lease') {
    if (leaseRateSqft && leaseRateSqft > 0) {
      return { type: 'sqft', text: `${CURRENCY_FORMATTER.format(leaseRateSqft)} / sq ft` };
    }
    if (leaseAmount && leaseAmount > 0) {
      return { type: 'rent', text: `${CURRENCY_FORMATTER.format(leaseAmount)} / month` };
    }
    if (price && price > 0) {
      return { type: 'rent', text: `${CURRENCY_FORMATTER.format(price)} / month` };
    }
    return { type: 'request', text: 'Price on Request' };
  }

  // Standard purchase price
  if (price && price > 0) {
    return { type: 'price', text: CURRENCY_FORMATTER.format(price) };
  }

  // Fallback to lease amount (some listings mix the fields)
  if (leaseAmount && leaseAmount > 0) {
    return { type: 'rent', text: `${CURRENCY_FORMATTER.format(leaseAmount)} / month` };
  }

  return { type: 'request', text: 'Price on Request' };
}

/** Legacy shim — used in older code paths */
export function formatPrice(price: number | null | undefined, leaseAmount?: number | null): string {
  if (price && price > 0) return CURRENCY_FORMATTER.format(price);
  if (leaseAmount && leaseAmount > 0) return `${CURRENCY_FORMATTER.format(leaseAmount)}/mo`;
  return 'Price on Request';
}

export function formatNumber(num: number | null | undefined): string {
  if (num == null || num === 0) return '';
  return NUMBER_FORMATTER.format(num);
}

// ─── Freshness badge ─────────────────────────────────────────────
export type FreshnessBadge =
  | { label: string; color: 'green' | 'blue' | 'gray' }
  | null;

/**
 * Returns a freshness badge based on the listing date (when listed for sale).
 * Shows accurate time since listing, not DDF modification time.
 *
 * - Today / < 24h → "NEW TODAY" (green)
 * - < 3 days → "X DAYS AGO" (green)
 * - < 7 days → "X DAYS AGO" (blue)
 * - < 14 days → "X DAYS AGO" (blue)
 * - < 30 days → "X DAYS AGO" (gray)
 * - > 30 days → null (no badge)
 */
export function getFreshnessBadge(
  modifiedAt: string | Date | undefined | null,
  createdAt: string | Date | undefined | null
): FreshnessBadge {
  const ts = modifiedAt || createdAt;
  if (!ts) return null;

  const now = Date.now();
  const then = new Date(ts).getTime();
  if (isNaN(then)) return null;

  const diffMs = now - then;
  if (diffMs < 0) return { label: 'New today', color: 'green' }; // future dates = just listed

  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  // Brand new
  if (diffH < 24) return { label: 'New today', color: 'green' };

  // Very recent (1-3 days)
  if (diffD <= 3) return { label: `${diffD} ${diffD === 1 ? 'day' : 'days'} ago`, color: 'green' };

  // Recent (4-7 days)
  if (diffD <= 7) return { label: `${diffD} days ago`, color: 'blue' };

  // Moderate (1-2 weeks)
  if (diffD <= 14) {
    const weeks = Math.floor(diffD / 7);
    return { label: `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`, color: 'blue' };
  }

  // Older (2-4 weeks)
  if (diffD <= 30) {
    const weeks = Math.floor(diffD / 7);
    return { label: `${weeks} weeks ago`, color: 'gray' };
  }

  // Months
  if (diffD <= 90) {
    const months = Math.floor(diffD / 30);
    return { label: `${months} ${months === 1 ? 'month' : 'months'} ago`, color: 'gray' };
  }

  return null;
}

/**
 * Relative time string: "Just now", "2 min ago", "3 hours ago", "5 days ago"
 */
export function timeAgo(timestamp: string | Date | undefined | null): string | null {
  if (!timestamp) return null;
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  if (isNaN(then)) return null;

  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return null;
}

export function isRecentListing(
  timestamp: string | Date | undefined | null,
  hoursThreshold = 48
): boolean {
  if (!timestamp) return false;
  const then = new Date(timestamp).getTime();
  if (isNaN(then)) return false;
  return Date.now() - then < hoursThreshold * 60 * 60 * 1000;
}


// ─── Fallback Image — LOCAL placeholder ──────────────────────────

/**
 * Returns the local placeholder image path.
 * No external dependencies, loads instantly.
 */
export function getFallbackImage(_seed?: string | number): string {
  return PLACEHOLDER_IMAGE;
}
