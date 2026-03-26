import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { buildWhereClause, ListingQuery } from '../../../lib/listings-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    try {
        // ── 1. Parse Query Params ───────────────────────────────────────────

        const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
        const limit = Math.min(parseInt(searchParams.get('limit') || '90', 10), 100);
        const skip = (page - 1) * limit;

        const baseQuery: ListingQuery = {
            city: searchParams.get('city'),
            minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
            maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
            beds: searchParams.get('beds') ? parseInt(searchParams.get('beds')!, 10) : undefined,
            baths: searchParams.get('baths') ? parseInt(searchParams.get('baths')!, 10) : undefined,
            propertyType: searchParams.get('propertyType'),
            q: searchParams.get('searchQuery') || searchParams.get('q'),
            // Parse Geo Params
            latMin: searchParams.get('latMin') ? parseFloat(searchParams.get('latMin')!) : undefined,
            latMax: searchParams.get('latMax') ? parseFloat(searchParams.get('latMax')!) : undefined,
            lngMin: searchParams.get('lngMin') ? parseFloat(searchParams.get('lngMin')!) : undefined,
            lngMax: searchParams.get('lngMax') ? parseFloat(searchParams.get('lngMax')!) : undefined,
        };

        // ── 2. Determine Strategy (Relaxation) ────────────────────────────────
        let where = buildWhereClause(baseQuery);
        let total = await prisma.listing.count({ where });
        let relaxationLevel = 'None';

        // ── 2.5 Progressive Relaxation (Non-ID Only) ───────────────────
        // If results are empty, try removing filters step-by-step
        const isIdSearch = baseQuery.q && (/^[A-Z]\d+$/i.test(baseQuery.q) || /^\d{5,}$/.test(baseQuery.q));

        if (!isIdSearch && total === 0) {
            // Step 1: Remove propertyType
            where = buildWhereClause({ ...baseQuery, propertyType: 'Any' });
            total = await prisma.listing.count({ where });
            if (total > 0) relaxationLevel = 'Step 1: PropertyType Removed';

            if (total === 0) {
                // Step 2: Remove beds/baths
                where = buildWhereClause({ ...baseQuery, propertyType: 'Any', beds: 0, baths: 0 });
                total = await prisma.listing.count({ where });
                if (total > 0) relaxationLevel = 'Step 2: Beds/Baths Removed';
            }

            if (total === 0) {
                // Step 3: Fallback to city-only
                where = buildWhereClause({ city: baseQuery.city });
                total = await prisma.listing.count({ where });
                if (total > 0) relaxationLevel = 'Step 3: City Fallback';
            }

            if (relaxationLevel !== 'None') {
                console.warn(`[API] Relaxation triggered: ${relaxationLevel} for query in ${baseQuery.city}`);
            }
        }

        // ── 3. Execute Final Data Query (Guaranteed Consistent) ──────────────
        // Strategy: If relaxation moved the count below our skip, reset skip to 0 to avoid empty pages.
        let effectiveSkip = skip;
        if (effectiveSkip >= total && total > 0) {
            effectiveSkip = 0;
            console.log(`[API] Skip reset to 0 (Total: ${total}, Requested Skip: ${skip})`);
        }

        const listingsRaw = await prisma.listing.findMany({
            where,
            take: limit,
            skip: effectiveSkip,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                listingKey: true,
                listingId: true,
                listPrice: true,
                standardStatus: true,
                propertySubType: true,
                address: true,
                city: true,
                province: true,
                postalCode: true,
                latitude: true,
                longitude: true,
                bedroomsTotal: true,
                bathroomsTotal: true,
                publicRemarks: true,
                modificationTimestamp: true,
                primaryPhoto: true,
                rawData: true
            }
        });

        const totalCount = await prisma.listing.count(); // Global count for trust-building

        // ── 4. Map to PascalCase (Legacy Format Support) ───────────────────
        const listings = listingsRaw.map((listing: any) => {
            const raw = listing.rawData || {};

            return {
                ...raw,
                ListingKey: listing.listingKey,
                ListingId: listing.listingId,
                ListPrice: listing.listPrice,
                StandardStatus: listing.standardStatus,
                PropertySubType: listing.propertySubType,
                UnparsedAddress: listing.address,
                City: listing.city,
                StateOrProvince: listing.province,
                PostalCode: listing.postalCode,
                Latitude: listing.latitude,
                Longitude: listing.longitude,
                BedroomsTotal: listing.bedroomsTotal,
                BathroomsTotalInteger: listing.bathroomsTotal,
                PublicRemarks: listing.publicRemarks,
                ModificationTimestamp: listing.modificationTimestamp?.toISOString(),
                ListingDate: (listing.listingDate || raw.ListingDate)?.toString(),
                Media: raw.Media || (listing.primaryPhoto ? [
                    {
                        MediaURL: listing.primaryPhoto,
                        MediaCategory: 'Property Photo',
                        PreferredPhotoYN: true
                    }
                ] : [])
            };
        });

        const totalPages = Math.ceil(total / limit);

        // ── 5. Standardized Response ───────────────────────────────────────
        return NextResponse.json({
            data: listings,
            total,
            page: effectiveSkip === 0 ? 1 : page,
            limit,
            totalPages,
            // Consistency fields
            totalCount, 
            relaxationLevel,
            // Legacy field (deprecated but kept for UI stability)
            listings: listings
        });

    } catch (err: any) {
        console.error('[Internal Proxy] Error:', err.message);
        return NextResponse.json(
            { error: 'Internal Server Error', message: err.message },
            { status: 500 }
        );
    }
}
