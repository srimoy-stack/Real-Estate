import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { ListingQuery, fetchRankedListings } from '../../../lib/listings-utils';
import { enrichListingsWithCompliance } from '../../../lib/ddf-compliance';
import { buildCacheKey, getCached, setCache } from '../../../lib/redis';

const CACHE_TTL_SECONDS = 60;

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const start = performance.now();
    const { searchParams } = new URL(request.url);

    try {
        // ── 0. Redis Cache Check ───────────────────────────────────────────
        const cacheKey = buildCacheKey(searchParams);
        const cached = await getCached(cacheKey);

        if (cached) {
            const duration = performance.now() - start;
            console.log(`[Listings API] CACHE HIT | Key: ${cacheKey.substring(0, 80)}… | Duration: ${duration.toFixed(2)}ms`);
            return NextResponse.json(cached);
        }

        // ── 1. Parse Initial Params ──────────────────────────────────────────
        let page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
        const limit = Math.min(parseInt(searchParams.get('limit') || '90', 10), 100);

        const baseQuery: ListingQuery = {
            city: searchParams.get('city'),
            minPrice: (searchParams.get('minPrice') && !isNaN(parseFloat(searchParams.get('minPrice')!))) ? parseFloat(searchParams.get('minPrice')!) : undefined,
            maxPrice: (searchParams.get('maxPrice') && !isNaN(parseFloat(searchParams.get('maxPrice')!))) ? parseFloat(searchParams.get('maxPrice')!) : undefined,
            min_price: (searchParams.get('min_price') && !isNaN(parseFloat(searchParams.get('min_price')!))) ? parseFloat(searchParams.get('min_price')!) : undefined,
            max_price: (searchParams.get('max_price') && !isNaN(parseFloat(searchParams.get('max_price')!))) ? parseFloat(searchParams.get('max_price')!) : undefined,
            beds: (searchParams.get('beds') && searchParams.get('beds') !== 'Any') ? parseInt(searchParams.get('beds')!.replace('+', ''), 10) : undefined,
            baths: (searchParams.get('baths') && searchParams.get('baths') !== 'Any') ? parseInt(searchParams.get('baths')!.replace('+', ''), 10) : undefined,
            propertyType: searchParams.get('propertyType'),
            type: searchParams.get('type'),
            q: searchParams.get('q'),
            search: searchParams.get('search') || searchParams.get('searchQuery'),
            latMin: searchParams.get('latMin') ? parseFloat(searchParams.get('latMin')!) : undefined,
            latMax: searchParams.get('latMax') ? parseFloat(searchParams.get('latMax')!) : undefined,
            lngMin: searchParams.get('lngMin') ? parseFloat(searchParams.get('lngMin')!) : undefined,
            lngMax: searchParams.get('lngMax') ? parseFloat(searchParams.get('lngMax')!) : undefined,
            featured: searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined,
            listingType: searchParams.get('listingType') as any,
            minSqft: (searchParams.get('minSqft') && !isNaN(parseFloat(searchParams.get('minSqft')!))) ? parseFloat(searchParams.get('minSqft')!) : undefined,
            maxSqft: (searchParams.get('maxSqft') && !isNaN(parseFloat(searchParams.get('maxSqft')!))) ? parseFloat(searchParams.get('maxSqft')!) : undefined,
            minYearBuilt: (searchParams.get('minYearBuilt') && !isNaN(parseInt(searchParams.get('minYearBuilt')!, 10))) ? parseInt(searchParams.get('minYearBuilt')!, 10) : undefined,
            maxYearBuilt: (searchParams.get('maxYearBuilt') && !isNaN(parseInt(searchParams.get('maxYearBuilt')!, 10))) ? parseInt(searchParams.get('maxYearBuilt')!, 10) : undefined,
            sortBy: searchParams.get('sort_by') || searchParams.get('sortBy'),
            order: (searchParams.get('order') || 'desc') as any,
            keywords: searchParams.get('keywords'),
            agentName: searchParams.get('agentName'),
            agentId: searchParams.get('agentId'),
            useRanking: !!(searchParams.get('q') || searchParams.get('search') || searchParams.get('searchQuery') || searchParams.get('keywords'))
        };

        // ── 2. Execute Search (engine handles expansion + total) ────────────
        const skip = (page - 1) * limit;
        const { listings: listingsRaw, total, relaxationLevel = 'None' } = await fetchRankedListings(
            prisma,
            baseQuery,
            limit,
            skip
        );

        // Recalculate pagination from engine's total (which includes expanded results)
        const totalPages = Math.ceil(total / limit);
        if (page < 1) page = 1;
        if (page > totalPages && totalPages > 0) page = totalPages;

        // ── 3. Freshness + Platform Total ──────────────────────────────────
        const [lastSync, platformTotal] = await Promise.all([
            prisma.syncLog.findFirst({
                where: { status: 'success' },
                orderBy: { startedAt: 'desc' },
                select: { completedAt: true }
            }),
            prisma.listing.count({ where: { isActive: true } })
        ]);

        // ── 4. Mapping ─────────────────────────────────────────────────────
        const mappedListings = listingsRaw.map((listing: any) => {
            const raw = (listing.rawData as any) || {};
            return {
                ...raw,
                listingKey: listing.listingKey,
                ListingKey: listing.listingKey,
                ListingId: listing.listingId,
                ListPrice: listing.listPrice,
                standardStatus: listing.standardStatus,
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
                agentName: listing.agentName || raw.ListAgentFullName,
                agentPhone: listing.agentPhone || raw.ListAgentDirectPhone,
                officeName: listing.officeName || raw.ListOfficeName,
                moreInformationLink: listing.moreInformationLink || raw.ListingURL || null,
                primaryPhotoUrl: listing.primaryPhotoUrl || listing.primaryPhoto || null,
                Media: listing.mediaJson || raw.Media || (() => {
                    const photoUrl = listing.primaryPhotoUrl || listing.primaryPhoto || null;
                    if (photoUrl) return [{ MediaURL: photoUrl, PreferredPhotoYN: true, Order: 0 }];
                    // Try to extract from rawData photo fields
                    const rawPhoto = raw.Photo?.[0]?.HighResPath || raw.Photo?.[0]?.LargePhotoPath || raw.Photo?.[0]?.MedResPath || null;
                    if (rawPhoto) return [{ MediaURL: rawPhoto, PreferredPhotoYN: true, Order: 0 }];
                    return [];
                })()
            };
        });

        // ── DDF Compliance: Enrich all listings with required fields ────────
        const listings = enrichListingsWithCompliance(mappedListings);

        // ── 5. Performance Logging ─────────────────────────────────────────
        const duration = performance.now() - start;
        console.log(`[Listings API] CACHE MISS | Duration: ${duration.toFixed(2)}ms | Page: ${page} | Total: ${total} | Results: ${listings.length} | Expansion: ${relaxationLevel}`);

        // ── 6. Response ────────────────────────────────────────────────────
        const responseBody = {
            total,
            platformTotal,
            page,
            pageSize: limit,
            totalPages,
            lastSyncedAt: lastSync?.completedAt?.toISOString(),
            listings,
            meta: { 
                total, 
                platformTotal,
                page, 
                limit, 
                totalPages, 
                relaxationLevel,
                expanded: relaxationLevel !== 'None',
                durationMs: parseFloat(duration.toFixed(2))
            }
        };

        // ── 7. Cache the response (fire-and-forget, non-blocking) ──────────
        setCache(cacheKey, responseBody, CACHE_TTL_SECONDS);

        return NextResponse.json(responseBody);

    } catch (err: any) {
        console.error('[Internal Proxy] FATAL:', err.message);
        return NextResponse.json(
            { error: 'Internal Server Error', message: err.message },
            { status: 500 }
        );
    }
}
