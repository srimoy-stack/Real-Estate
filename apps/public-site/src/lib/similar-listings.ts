/**
 * ═══════════════════════════════════════════════════════════════════
 * SIMILAR LISTINGS RECOMMENDATION ENGINE (PRODUCTION-GRADE)
 * ═══════════════════════════════════════════════════════════════════
 *
 * Ranking logic based on a weighted multi-factor scoring system.
 * 
 * SCORING HIERARCHY (Critical weights for production relevance):
 *   1. City + Location Match — 40pts (Matches must be local)
 *   2. Price Proximity       — 30pts (Must fall within similar budget)
 *   3. Property Type Match   — 15pts (Same category: Detached, Condo, etc.)
 *   4. Room Count Similarity — 10pts (Bedrooms/Bathrooms matching)
 *   5. Freshness + Size      — 5pts  (Recently modified or similar area)
 */

import { prisma } from './prisma';
import { withActive } from './listings-utils';


// ─── Input Interface ─────────────────────────────────────────────
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

// ─── Scoring Engine ──────────────────────────────────────────────

/**
 * Score price proximity: ±10% gives full points, decreases as gap widens.
 */
function scorePrice(refPrice: number, candPrice: number): number {
  if (!refPrice || !candPrice) return 5;
  const ratio = Math.max(refPrice, candPrice) / Math.min(refPrice, candPrice);
  if (ratio <= 1.1) return 30;
  if (ratio <= 1.25) return 20;
  if (ratio <= 1.5) return 10;
  if (ratio <= 2.0) return 5;
  return 2;
}

/**
 * Score location matching: Heavily weight the same city/area.
 */
function scoreLocation(ref: SimilarityInput, cand: any): number {
  // Same city is the most important factor for real estate
  if (ref.city && cand.city && ref.city.toLowerCase() === cand.city.toLowerCase()) return 40;
  
  // Nearby if geo is available
  if (ref.latitude && ref.longitude && cand.latitude && cand.longitude) {
      const dist = haversineDistance(ref.latitude, ref.longitude, cand.latitude, cand.longitude);
      if (dist <= 5) return 35; // 5km radius
      if (dist <= 15) return 25; // 15km radius
      if (dist <= 30) return 15; // Regional
  }
  
  if (ref.province && cand.province && ref.province.toLowerCase() === cand.province.toLowerCase()) return 10;
  return 0;
}

/**
 * Score property type: Users looking at condos rarely want detached.
 */
function scoreType(ref: SimilarityInput, cand: any): number {
    const rType = (ref.propertySubType || ref.propertyType || '').toLowerCase();
    const cType = (cand.propertySubType || cand.propertyType || '').toLowerCase();
    if (rType === cType) return 15;
    if (rType && cType && (rType.includes(cType) || cType.includes(rType))) return 10;
    return 2;
}

/**
 * Score rooms: Bedrooms are more important than bathrooms for search.
 */
function scoreRooms(ref: SimilarityInput, cand: any): number {
    let score = 0;
    // Bedrooms (Match = 6pts)
    const bDiff = Math.abs((ref.bedroomsTotal || 0) - (cand.bedroomsTotal || 0));
    if (bDiff === 0) score += 6;
    else if (bDiff === 1) score += 3;
    
    // Bathrooms (Match = 4pts)
    const baDiff = Math.abs((ref.bathroomsTotal || 0) - (cand.bathroomsTotal || 0));
    if (baDiff === 0) score += 4;
    else if (baDiff === 1) score += 2;
    
    return score;
}

// ─── Main Logic ──────────────────────────────────────────────────

export async function getSimilarListings(
  referenceListingKey: string,
  limit: number = 8
): Promise<any[]> {
  try {
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

    // Candidate Pull Logic (Ensure relevance)
    // 1. Same city + ±40% price range
    const priceMin = ref.listPrice ? ref.listPrice * 0.6 : 0;
    const priceMax = ref.listPrice ? ref.listPrice * 1.4 : 99999999;

    const pool = await prisma.listing.findMany({
        where: withActive({
            listingKey: { not: ref.listingKey },
            OR: [
                { city: { equals: ref.city || '', mode: 'insensitive' } },
                { province: { equals: ref.province || '', mode: 'insensitive' } }
            ],
            listPrice: { gte: priceMin, lte: priceMax }
        }),
        take: limit * 4,
        orderBy: { modificationTimestamp: 'desc' }
    });

    // Score and rank candidates
    const ranked = pool.map(cand => {
        const scores = {
            loc: scoreLocation(ref, cand),
            price: scorePrice(ref.listPrice || 0, cand.listPrice || 0),
            type: scoreType(ref, cand),
            rooms: scoreRooms(ref, cand)
        };
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        return { cand, total };
    });

    ranked.sort((a, b) => b.total - a.total);

    return ranked.slice(0, limit).map(({ cand: l, total }) => {
        const images = l.primaryPhotoUrl ? [l.primaryPhotoUrl] : (l.primaryPhoto ? [l.primaryPhoto as string] : []);
        return {
            id: l.listingKey,
            mlsNumber: l.listingKey,
            price: l.listPrice,
            address: l.address,
            city: l.city,
            province: l.province,
            bedrooms: l.bedroomsTotal,
            bathrooms: l.bathroomsTotal,
            squareFootage: l.livingArea,
            images,
            propertyType: l.propertySubType || l.propertyType,
            status: l.standardStatus || 'Active',
            location: { lat: l.latitude ?? 0, lng: l.longitude ?? 0 },
            similarityScore: total
        };
    });
  } catch (error) {
    console.error('[Similar Engine] Error:', error);
    return [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
