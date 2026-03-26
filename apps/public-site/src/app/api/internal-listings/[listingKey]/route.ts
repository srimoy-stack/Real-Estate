import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: NextRequest,
    { params }: { params: { listingKey: string } }
) {
    const { listingKey } = params;

    if (!listingKey) {
        return NextResponse.json({ error: 'ListingKey is required' }, { status: 400 });
    }

    try {
        // ── 1. Fetch from Local DB ──────────────────────────────────────────
        const listing = await prisma.listing.findFirst({
            where: {
                OR: [
                    { listingKey: listingKey },
                    { listingId: listingKey }
                ]
            }
        });

        if (listing) {
            // Map to Legacy Format for Frontend Compatibility
            const raw = (listing.rawData || {}) as any;
            const mapped = {
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
                Media: raw.Media || (listing.primaryPhoto ? [
                    {
                        MediaURL: listing.primaryPhoto,
                        MediaCategory: 'Property Photo',
                        PreferredPhotoYN: true
                    }
                ] : [])
            };

            return NextResponse.json(mapped);
        }

        // ── 2. If not found in DB, return 404 (don't fall back to Live Proxy here) ──
        return NextResponse.json({ error: 'Property not found in Local Database' }, { status: 404 });

    } catch (err: any) {
        console.error('[Internal Detail Proxy] Error:', err.message);
        return NextResponse.json(
            { error: 'Internal Server Error', message: err.message },
            { status: 500 }
        );
    }
}
