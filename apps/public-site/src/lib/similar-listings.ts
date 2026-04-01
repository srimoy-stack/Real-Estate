/**
 * ═══════════════════════════════════════════════════════════════════
 * SIMILAR LISTINGS RECOMMENDATION ENGINE
 * ═══════════════════════════════════════════════════════════════════
 *
 * Multi-factor scoring system for finding truly similar properties.
 *
 * SCORING FACTORS (total ~100 points):
 *   1. Price Proximity      — 30pts  (within ±20% = full score)
 *   2. Location Proximity   — 25pts  (same city = 20, nearby = 10-25)
 *   3. Property Type Match  — 15pts  (exact match)
 *   4. Bedrooms Match       — 10pts  (exact = 10, ±1 = 6, ±2 = 3)
 *   5. Bathrooms Match      — 8pts   (exact = 8, ±1 = 4)
 *   6. Square Footage       — 7pts   (within ±25% = full)
 *   7. Freshness Bonus      — 5pts   (newer listings get a boost)
 *
 * The engine uses a 3-tier expansion strategy:
 *   Level 1: Same city, similar price range (strict)
 *   Level 2: Same province, broader price range
 *   Level 3: Any location, property type match only
 */

import { prisma } from './prisma';
import { withActive } from './listings-utils';
import { isValidImageUrl } from './server-listing-service';

// ─── Types ───────────────────────────────────────────────────────

interface SimilarityInput {
  listingKey: string;
  listPrice: number | null;
  city: string | null;
  province: string | null;
  propertyType: string | null;
  propertySubType: string | null;
  bedroomsTotal: number | null;
  bathroomsTotal: number | null;
  livingArea: number | null;
  latitude: number | null;
  longitude: number | null;
}

interface ScoredListing {
  listing: any;
  score: number;
  factors: {
    price: number;
    location: number;
    propertyType: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    freshness: number;
  };
}

// ─── Scoring Functions ───────────────────────────────────────────

function scorePriceProximity(refPrice: number | null, candidatePrice: number | null): number {
  if (!refPrice || !candidatePrice || refPrice <= 0 || candidatePrice <= 0) return 5;
  
  const ratio = candidatePrice / refPrice;
  // Within ±10% = 30pts, ±20% = 20pts, ±50% = 10pts, beyond = 2pts
  if (ratio >= 0.9 && ratio <= 1.1) return 30;
  if (ratio >= 0.8 && ratio <= 1.2) return 20;
  if (ratio >= 0.7 && ratio <= 1.3) return 15;
  if (ratio >= 0.5 && ratio <= 1.5) return 10;
  if (ratio >= 0.3 && ratio <= 2.0) return 5;
  return 2;
}

function scoreLocationProximity(
  ref: SimilarityInput,
  candidate: any
): number {
  // Exact city match = 20pts
  if (ref.city && candidate.city &&
      ref.city.toLowerCase() === candidate.city.toLowerCase()) {
    return 20;
  }

  // Geo-proximity if coordinates available
  if (ref.latitude && ref.longitude && candidate.latitude && candidate.longitude) {
    const dist = haversineDistance(
      ref.latitude, ref.longitude,
      candidate.latitude, candidate.longitude
    );
    if (dist < 5) return 25;   // Within 5km — excellent
    if (dist < 10) return 20;  // Within 10km — great
    if (dist < 25) return 15;  // Within 25km — good
    if (dist < 50) return 10;  // Within 50km — okay
    return 3;
  }

  // Same province fallback
  if (ref.province && candidate.province &&
      ref.province.toLowerCase() === candidate.province.toLowerCase()) {
    return 10;
  }

  return 0;
}

function scorePropertyTypeMatch(ref: SimilarityInput, candidate: any): number {
  const refType = (ref.propertySubType || ref.propertyType || '').toLowerCase();
  const candType = (candidate.propertySubType || candidate.propertyType || '').toLowerCase();
  
  if (!refType || !candType) return 5;
  if (refType === candType) return 15;
  
  // Partial match: both residential, both commercial, etc.
  const residentialTypes = ['single family', 'detached', 'semi-detached', 'townhouse', 'condo', 'apartment'];
  const commercialTypes = ['commercial', 'industrial', 'retail', 'office', 'business'];
  
  const refIsResidential = residentialTypes.some(t => refType.includes(t));
  const candIsResidential = residentialTypes.some(t => candType.includes(t));
  const refIsCommercial = commercialTypes.some(t => refType.includes(t));
  const candIsCommercial = commercialTypes.some(t => candType.includes(t));
  
  if ((refIsResidential && candIsResidential) || (refIsCommercial && candIsCommercial)) return 10;
  
  return 2;
}

function scoreBedroomsMatch(refBeds: number | null, candBeds: number | null): number {
  if (refBeds == null || candBeds == null) return 3;
  const diff = Math.abs(refBeds - candBeds);
  if (diff === 0) return 10;
  if (diff === 1) return 6;
  if (diff === 2) return 3;
  return 1;
}

function scoreBathroomsMatch(refBaths: number | null, candBaths: number | null): number {
  if (refBaths == null || candBaths == null) return 2;
  const diff = Math.abs(refBaths - candBaths);
  if (diff === 0) return 8;
  if (diff === 1) return 4;
  return 1;
}

function scoreSqftProximity(refSqft: number | null, candSqft: number | null): number {
  if (!refSqft || !candSqft || refSqft <= 0 || candSqft <= 0) return 2;
  
  const ratio = candSqft / refSqft;
  if (ratio >= 0.75 && ratio <= 1.25) return 7;
  if (ratio >= 0.5 && ratio <= 1.5) return 4;
  return 1;
}

function scoreFreshness(modTimestamp: any): number {
  if (!modTimestamp) return 0;
  const now = Date.now();
  const then = new Date(modTimestamp).getTime();
  if (isNaN(then)) return 0;
  
  const daysOld = (now - then) / 86_400_000;
  if (daysOld < 1) return 5;
  if (daysOld < 3) return 4;
  if (daysOld < 7) return 3;
  if (daysOld < 14) return 2;
  if (daysOld < 30) return 1;
  return 0;
}

// ─── Haversine Distance (km) ─────────────────────────────────────

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ─── Main Recommendation Engine ──────────────────────────────────

export async function getSimilarListings(
  referenceListingKey: string,
  limit: number = 8
): Promise<any[]> {
  try {
    // 1. Fetch the reference listing
    const refListing = await prisma.listing.findFirst({
      where: withActive({
        OR: [
          { listingKey: { equals: referenceListingKey, mode: 'insensitive' } },
          { listingId: { equals: referenceListingKey, mode: 'insensitive' } },
        ],
      }),
    });

    if (!refListing) return [];

    const ref: SimilarityInput = {
      listingKey: refListing.listingKey,
      listPrice: refListing.listPrice,
      city: refListing.city,
      province: refListing.province,
      propertyType: refListing.propertyType,
      propertySubType: refListing.propertySubType,
      bedroomsTotal: refListing.bedroomsTotal,
      bathroomsTotal: refListing.bathroomsTotal,
      livingArea: refListing.livingArea,
      latitude: refListing.latitude,
      longitude: refListing.longitude,
    };

    // 2. Fetch candidate pool (3-tier expansion)
    const candidates = await fetchCandidatePool(ref, limit * 5);

    // 3. Score each candidate
    const scored: ScoredListing[] = candidates.map(candidate => {
      const factors = {
        price: scorePriceProximity(ref.listPrice, candidate.listPrice),
        location: scoreLocationProximity(ref, candidate),
        propertyType: scorePropertyTypeMatch(ref, candidate),
        bedrooms: scoreBedroomsMatch(ref.bedroomsTotal, candidate.bedroomsTotal),
        bathrooms: scoreBathroomsMatch(ref.bathroomsTotal, candidate.bathroomsTotal),
        sqft: scoreSqftProximity(ref.livingArea, candidate.livingArea),
        freshness: scoreFreshness(candidate.modificationTimestamp),
      };

      const score = Object.values(factors).reduce((sum, v) => sum + v, 0);

      return { listing: candidate, score, factors };
    });

    // 4. Sort by score descending and take top N
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, limit);

    // 5. Map to API-compatible format
    return topResults.map(({ listing: l, score }) => {
      const images = (() => {
        if (l.primaryPhotoUrl && isValidImageUrl(l.primaryPhotoUrl)) return [l.primaryPhotoUrl];
        if (l.primaryPhoto && isValidImageUrl(l.primaryPhoto as string)) return [l.primaryPhoto as string];
        if (l.mediaJson && Array.isArray(l.mediaJson)) {
          const valid = (l.mediaJson as any[])
            .filter((m: any) => m?.MediaURL && isValidImageUrl(m.MediaURL))
            .map((m: any) => m.MediaURL);
          if (valid.length > 0) return valid;
        }
        return [];
      })();

      return {
        id: l.listingKey,
        mlsNumber: l.listingKey,
        listingKey: l.listingKey,
        price: l.listPrice,
        address: l.address,
        city: l.city,
        province: l.province,
        postalCode: l.postalCode,
        bedrooms: l.bedroomsTotal,
        bathrooms: l.bathroomsTotal,
        squareFootage: l.livingArea,
        images,
        propertyType: l.propertySubType || l.propertyType || 'Residential',
        status: l.standardStatus || 'Active',
        isFeatured: !!l.isFeatured,
        moreInformationLink: l.moreInformationLink || null,
        location: { lat: l.latitude || 0, lng: l.longitude || 0 },
        latitude: l.latitude,
        longitude: l.longitude,
        similarityScore: score,
      };
    });
  } catch (error) {
    console.error('[Similar Listings Engine] Error:', error);
    return [];
  }
}

// ─── Candidate Pool Fetcher (3-Tier Expansion) ───────────────────

async function fetchCandidatePool(ref: SimilarityInput, maxCandidates: number): Promise<any[]> {
  const seen = new Set<string>();
  seen.add(ref.listingKey);
  const all: any[] = [];

  // Helper to avoid duplicates
  const addResults = (results: any[]) => {
    for (const r of results) {
      if (!seen.has(r.listingKey)) {
        seen.add(r.listingKey);
        all.push(r);
      }
    }
  };

  // Level 1: Same city + similar price (±30%)
  if (ref.city) {
    const priceMin = ref.listPrice ? ref.listPrice * 0.7 : undefined;
    const priceMax = ref.listPrice ? ref.listPrice * 1.3 : undefined;

    const level1 = await prisma.listing.findMany({
      where: withActive({
        city: { equals: ref.city, mode: 'insensitive' },
        listingKey: { not: ref.listingKey },
        ...(priceMin && priceMax ? {
          listPrice: { gte: priceMin, lte: priceMax }
        } : {}),
      }),
      take: maxCandidates,
      orderBy: { modificationTimestamp: 'desc' },
    });
    addResults(level1);
  }

  // Level 2: Same city (any price) if we need more
  if (all.length < maxCandidates && ref.city) {
    const level2 = await prisma.listing.findMany({
      where: withActive({
        city: { equals: ref.city, mode: 'insensitive' },
        listingKey: { notIn: Array.from(seen) },
      }),
      take: maxCandidates - all.length,
      orderBy: { modificationTimestamp: 'desc' },
    });
    addResults(level2);
  }

  // Level 3: Same province, similar property type
  if (all.length < maxCandidates && ref.province) {
    const level3Where: any = {
      province: { equals: ref.province, mode: 'insensitive' },
      listingKey: { notIn: Array.from(seen) },
    };

    if (ref.propertySubType) {
      level3Where.propertySubType = { equals: ref.propertySubType, mode: 'insensitive' };
    }

    const level3 = await prisma.listing.findMany({
      where: withActive(level3Where),
      take: maxCandidates - all.length,
      orderBy: { modificationTimestamp: 'desc' },
    });
    addResults(level3);
  }

  // Level 4: Any location (last resort)
  if (all.length < Math.min(maxCandidates, 10)) {
    const level4 = await prisma.listing.findMany({
      where: withActive({
        listingKey: { notIn: Array.from(seen) },
      }),
      take: Math.min(maxCandidates, 10) - all.length,
      orderBy: { modificationTimestamp: 'desc' },
    });
    addResults(level4);
  }

  return all;
}
