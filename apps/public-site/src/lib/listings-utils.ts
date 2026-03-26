import { Prisma } from '@prisma/client';

export interface ListingQuery {
    city?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    beds?: number | null;
    baths?: number | null;
    propertyType?: string | null;
    q?: string | null;
    // Geo Bounds
    latMin?: number | null;
    latMax?: number | null;
    lngMin?: number | null;
    lngMax?: number | null;
}

/**
 * Centralized Filter Builder for Listings
 * Ensures consistent search behavior across APIs & Pages
 */
export function buildWhereClause(query: ListingQuery): Prisma.ListingWhereInput {
    const {
        city,
        minPrice,
        maxPrice,
        beds,
        baths,
        propertyType,
        q,
        latMin,
        latMax,
        lngMin,
        lngMax
    } = query;

    const filters: Prisma.ListingWhereInput[] = [];

    // ── 1. PRIORITY ID SEARCH (ListingKey or ListingId) ──────────────────
    // If 'q' looks like a ListingKey or ListingId, prioritize it above all else
    if (q) {
        // Alphanumeric pattern for Canadian MLS (e.g. E5012345 or numeric keys)
        const looksLikeId = /^[A-Z]\d+$/i.test(q) || /^\d{5,}$/.test(q);

        if (looksLikeId) {
            return {
                OR: [
                    { listingKey: { equals: q, mode: 'insensitive' } },
                    { listingId: { equals: q, mode: 'insensitive' } }
                ]
            };
        }
    }

    // ── 2. GENERAL TEXT SEARCH ──────────────────────────────────────────
    if (q) {
        filters.push({
            OR: [
                { city: { contains: q, mode: 'insensitive' } },
                { address: { contains: q, mode: 'insensitive' } },
                { publicRemarks: { contains: q, mode: 'insensitive' } }
            ]
        });
    }

    // ── 3. LOCATION: GEO BOUNDS (PRIORITY) OR CITY ──────────────────────
    // If we have bounding box coordinates, use them strictly. 
    // This matches Realtor.ca/DDF behavior where the map view defines the results.
    if (latMin != null && latMax != null && lngMin != null && lngMax != null) {
        filters.push({
            latitude: { gte: Number(latMin), lte: Number(latMax) },
            longitude: { gte: Number(lngMin), lte: Number(lngMax) }
        });
    } 
    // Otherwise fallback to city matching if coordinates aren't provided
    else if (city) {
        filters.push({
            OR: [
                { city: { contains: city, mode: 'insensitive' } },
                { address: { contains: city, mode: 'insensitive' } }
            ]
        });
    }

    // ── 4. PRICE ────────────────────────────────────────────────────────
    if (minPrice || maxPrice) {
        filters.push({
            listPrice: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice })
            }
        });
    }

    // ── 5. BEDS & BATHS ─────────────────────────────────────────────────
    if (beds && beds > 0) {
        filters.push({
            bedroomsTotal: { gte: beds }
        });
    }

    if (baths && baths > 0) {
        filters.push({
            bathroomsTotal: { gte: baths }
        });
    }

    // ── 6. PROPERTY TYPE ────────────────────────────────────────────────
    if (propertyType && propertyType !== 'Any') {
        filters.push({
            OR: [
                { propertyType: { contains: propertyType, mode: 'insensitive' } },
                { propertySubType: { contains: propertyType, mode: 'insensitive' } }
            ]
        });
    }

    return filters.length > 0 ? { AND: filters } : {};
}
