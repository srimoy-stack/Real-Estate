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

// ─── Color Tokens ────────────────────────────────────────────────
export const colors = {
  brand: {
    primary: '#d0021b', // Brand Red — Realtor-aligned
    primaryHover: '#b8011a',
    primaryLight: 'rgba(208, 2, 27, 0.08)',
    primaryShadow: 'rgba(208, 2, 27, 0.20)',
  },
  text: {
    primary: '#111827', // High-contrast primary
    secondary: '#4B5563', // Secondary — never faded
    muted: '#6B7280', // Muted labels
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
    metadata: 'text-[14px] font-medium text-[#4B5563]', // 14px
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
  if (num == null || num === 0) return 'N/A';
  return NUMBER_FORMATTER.format(num);
}

// ─── Freshness badge ─────────────────────────────────────────────
export type FreshnessBadge =
  | { label: 'New'; color: 'green' }
  | { label: 'Today'; color: 'green' }
  | { label: 'Updated'; color: 'blue' }
  | null;

/**
 * Returns a freshness badge descriptor or null (> 7 days old).
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
  const diffH = diffMs / 3_600_000;
  const diffD = diffMs / 86_400_000;

  const isToday = diffH < 24;
  const isNew = diffH < 48;
  const isUpdated = diffD < 7;

  if (isToday) return { label: 'Today', color: 'green' };
  if (isNew) return { label: 'New', color: 'green' };
  if (isUpdated) return { label: 'Updated', color: 'blue' };
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


// ─── Unique Dynamic Fallbacks ────────────────────────────────────

/**
 * Returns a unique, high-quality real estate image URL for a given seed.
 * Uses LoremFlickr with a "lock" to ensure stability per listing while
 * maintaining uniqueness across the platform.
 */
export function getFallbackImage(seed: string | number = '0'): string {
  // Simple string hash to turn MLS number into a stable numeric lock
  const str = String(seed);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const lock = Math.abs(hash);
  
  // Use professional real estate keywords to ensure relevant imagery
  return `https://loremflickr.com/800/600/house,realestate,exterior?lock=${lock}`;
}

// Default export if needed
export const PLACEHOLDER_IMAGE = `https://loremflickr.com/800/600/house,realestate,exterior?lock=1`;
