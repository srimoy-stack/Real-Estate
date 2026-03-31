/**
 * ═══════════════════════════════════════════════════════════════════
 * NORMALIZED PROPERTY — Universal data shape for the unified card
 * ═══════════════════════════════════════════════════════════════════
 *
 * Both `Listing` (from @repo/types) and `MLSProperty` (from DDF API)
 * are mapped to this interface before rendering.
 * This ensures ONE card component handles ALL data sources.
 *
 * ── DATA SANITIZATION RULES ──
 * - price: null → "Price on Request" (handled by resolvePrice)
 * - propertyType: null → derived from propertySubType OR fallback "Property"
 * - address: null → city + province, or "Location not available"
 * - beds/baths: null → 0 (UI hides when 0, never shows N/A)
 * - image: null → local placeholder
 * - title: propertySubType + " in " + city, fallback: "Property in " + city
 */

import { PLACEHOLDER_IMAGE } from './design-tokens';

export type PropertyCategory = 'residential' | 'commercial' | 'lease';

export interface NormalizedProperty {
  // Identity
  id: string;
  mlsNumber: string;
  href: string;

  // Category — drives conditional rendering
  category: PropertyCategory;

  // Price
  price: number | null;
  leaseAmount?: number | null;
  leaseRatePerSqft?: number | null; // $/sqft for commercial leases

  // Location
  title: string; // Address line 1
  city: string;
  province: string;
  postalCode: string;

  // Residential stats
  bedrooms: number;
  bathrooms: number;
  sqft: number;

  // Commercial / Lease extra fields
  propertySubType: string; // Office, Retail, Industrial, Land, etc.
  zoningDescription?: string | null;
  lotSizeArea?: number | null;
  lotSizeUnits?: string | null;

  // Status
  status: string;
  isFeatured: boolean;

  // Media
  imageUrl: string;
  images: string[];
  imageCount: number;

  // Freshness
  modifiedAt: string | null;
  createdAt: string | null;

  // Compliance
  moreInformationLink?: string | null;
  brokerageName?: string | null;

  /** Marker so we can skip re-normalization */
  _normalized?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Derive category from PropertyType / PropertySubType / TransactionType strings.
 * Supports both DDF API values and internal Listing values.
 *
 * Rules:
 *   "Business", "Industrial", "Office" → Commercial
 *   "Single Family", "Condo" → Residential
 *   "Lease" → Lease
 */
function deriveCategory(data: any): PropertyCategory {
  const type = (
    data.PropertyType ||
    data.propertyType ||
    data.PropertySubType ||
    data.propertySubType ||
    ''
  ).toLowerCase();

  const status = (data.StandardStatus || data.status || '').toLowerCase();
  const lease = data.LeaseAmount || data.leaseAmount || 0;
  const leaseRate = data.leaseRatePerSqft || 0;

  if (
    type.includes('lease') ||
    type.includes('for rent') ||
    status.includes('lease') ||
    lease > 0 ||
    leaseRate > 0
  )
    return 'lease';

  if (
    type.includes('commercial') ||
    type.includes('business') ||
    type.includes('office') ||
    type.includes('retail') ||
    type.includes('industrial') ||
    type.includes('land') ||
    type.includes('multi-family') ||
    type.includes('mixed')
  )
    return 'commercial';

  return 'residential';
}

/**
 * Derive a human-readable property type label when propertyType is null.
 */
function derivePropertyType(data: any): string {
  const subType = data.propertySubType || data.PropertySubType || '';
  if (subType) return subType;

  const type = data.propertyType || data.PropertyType || '';
  if (type) return type;

  // Infer from category
  const cat = deriveCategory(data);
  if (cat === 'commercial') return 'Commercial';
  if (cat === 'lease') return 'Lease';
  return 'Property';
}

/**
 * Build a safe display title:
 *   propertySubType + " in " + city
 *   fallback: "Property in " + city
 *   last resort: "Property"
 */
function buildSafeTitle(address: string, subType: string, city: string): string {
  // If address looks valid (not null, not "null", not empty)
  if (address && !address.toLowerCase().startsWith('null') && address.trim().length > 2) {
    return address;
  }

  const typeLabel = subType || 'Property';
  if (city && city.toLowerCase() !== 'null') {
    return `${typeLabel} in ${city}`;
  }

  return typeLabel;
}


/**
 * Validate an image URL. Returns the URL if valid, or placeholder.
 */
function safeImageUrl(url: any): string {
  if (!url || typeof url !== 'string' || url.length < 10) return PLACEHOLDER_IMAGE;
  if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i.test(url)) return PLACEHOLDER_IMAGE;
  try {
    const u = new URL(url);
    if (u.pathname === '/' || u.pathname === '') return PLACEHOLDER_IMAGE;
  } catch {
    if (!url.startsWith('/')) return PLACEHOLDER_IMAGE;
  }
  return url;
}

/**
 * Normalize a `Listing` (from @repo/types) into NormalizedProperty
 */
export function normalizeListing(listing: any): NormalizedProperty {
  const subType = derivePropertyType(listing);
  const city = listing.city && listing.city !== 'null' ? listing.city : '';
  const province = listing.province && listing.province !== 'null' ? listing.province : (listing.stateOrProvince || '');
  const rawAddress = listing.title || listing.address || '';

  const title = buildSafeTitle(rawAddress, subType, city);
  const category = deriveCategory(listing);

  // Image: try main image, then first from images array, then placeholder
  const imageUrl = safeImageUrl(
    listing.mainImage || listing.primaryPhotoUrl || listing.images?.[0] || null
  );

  return {
    _normalized: true,
    id: String(listing.id || listing.listingKey || listing.mlsNumber || ''),
    mlsNumber: listing.mlsNumber || listing.listingId || '',
    href: `/listing/${listing.mlsNumber || listing.listingId || listing.listingKey || listing.id}`,

    category,

    price: listing.price && listing.price > 0 ? listing.price : null,
    leaseAmount: listing.leaseAmount && listing.leaseAmount > 0 ? listing.leaseAmount : null,
    leaseRatePerSqft: listing.leaseRatePerSqft || null,

    title,
    city,
    province,
    postalCode: listing.postalCode || '',

    bedrooms: listing.bedrooms != null && listing.bedrooms > 0 ? listing.bedrooms : 0,
    bathrooms: listing.bathrooms != null && listing.bathrooms > 0 ? listing.bathrooms : 0,
    sqft: listing.squareFootage || listing.squareFeet || listing.livingArea || 0,

    propertySubType: subType,
    zoningDescription: listing.zoningDescription || null,
    lotSizeArea: listing.lotSizeArea || null,
    lotSizeUnits: listing.lotSizeUnits || null,

    status: listing.status || 'ACTIVE',
    isFeatured: listing.isFeatured || false,

    imageUrl,
    images: listing.images || [],
    imageCount: listing.images?.length || 0,

    modifiedAt: listing.modificationTimestamp || listing.updatedAt || null,
    createdAt: listing.createdAt || null,

    moreInformationLink: listing.moreInformationLink || null,
    brokerageName: listing.brokerageName || null,
  };
}

/**
 * Normalize an `MLSProperty` (from DDF/CREA API) into NormalizedProperty
 */
export function normalizeMLSProperty(listing: any): NormalizedProperty {
  const imageUrl = safeImageUrl(
    listing.Media?.[0]?.MediaURL || listing.primaryPhotoUrl || listing.primaryPhoto || null
  );

  const subType = listing.PropertySubType || listing.PropertyType || derivePropertyType(listing);
  const city = listing.City && listing.City !== 'null' ? listing.City : '';
  const province = listing.StateOrProvince || '';
  const rawAddress = listing.UnparsedAddress || '';

  const title = buildSafeTitle(rawAddress, subType, city);
  const category = deriveCategory(listing);

  return {
    _normalized: true,
    id: listing.ListingKey || listing.ListingId || '',
    mlsNumber: listing.ListingId || listing.ListingKey || '',
    href: `/listing/${listing.ListingId || listing.ListingKey}`,

    category,

    price: listing.ListPrice && listing.ListPrice > 0 ? listing.ListPrice : null,
    leaseAmount: listing.LeaseAmount && listing.LeaseAmount > 0 ? listing.LeaseAmount : null,
    leaseRatePerSqft: listing.leaseRatePerSqft || null,

    title,
    city,
    province,
    postalCode: listing.PostalCode || '',

    bedrooms:
      listing.BedroomsTotal != null && listing.BedroomsTotal > 0 ? listing.BedroomsTotal : 0,
    bathrooms:
      listing.BathroomsTotalInteger != null && listing.BathroomsTotalInteger > 0
        ? listing.BathroomsTotalInteger
        : 0,
    sqft: listing.LivingArea || 0,

    propertySubType: subType,
    zoningDescription: listing.ZoningDescription || null,
    lotSizeArea: listing.LotSizeArea || null,
    lotSizeUnits: listing.LotSizeUnits || null,

    status: listing.StandardStatus || listing.MlsStatus || 'ACTIVE',
    isFeatured: listing.isFeatured || false,

    imageUrl,
    images: listing.Media?.map((m: any) => m.MediaURL).filter(Boolean) || listing.images || [],
    imageCount: listing.Media?.length || 0,

    modifiedAt: listing.ModificationTimestamp || null,
    createdAt: listing.OriginalEntryTimestamp || null,

    moreInformationLink: listing.moreInformationLink || listing.ListingURL || null,
    brokerageName: listing.officeName || null,
  };
}

/**
 * Auto-detect data shape and normalize
 */
export function autoNormalize(data: any): NormalizedProperty {
  if (data._normalized) return data as NormalizedProperty;
  // MLSProperty has ListingKey; Listing has mlsNumber
  if (data.ListingKey || data.ListPrice !== undefined || data.UnparsedAddress) {
    return normalizeMLSProperty(data);
  }
  return normalizeListing(data);
}
