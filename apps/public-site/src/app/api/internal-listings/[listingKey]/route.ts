import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { withActive } from '../../../../lib/listings-utils';
import {
    enrichListingWithCompliance,
    fireDDFAnalyticsPing,
    extractClientIP,
} from '../../../../lib/ddf-compliance';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { listingKey: string } }
) {
    const { listingKey } = params;

    if (!listingKey) {
        return NextResponse.json({ error: 'ListingKey is required' }, { status: 400 });
    }

    try {
        // ── 1. Fetch from Local DB ──────────────────────────────────────────
        const listing = await prisma.listing.findFirst({
            where: withActive({
                OR: [
                    { listingKey: listingKey },
                    { listingId: listingKey }
                ]
            })
        });

        if (listing) {
            // Map to Legacy Format for Frontend Compatibility
            const raw = (listing.rawData || {}) as any;
            const mapped = {
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
                moreInformationLink: listing.moreInformationLink || raw.ListingURL || null,
                primaryPhotoUrl: listing.primaryPhotoUrl || listing.primaryPhoto || null,
                Media: listing.mediaJson || raw.Media || (() => {
                    const photoUrl = listing.primaryPhotoUrl || listing.primaryPhoto || null;
                    if (photoUrl) return [{ MediaURL: photoUrl, MediaCategory: 'Property Photo', PreferredPhotoYN: true, Order: 0 }];
                    return [];
                })()
            };

            // ── DDF Compliance: Enrich response ─────────────────────────────
            const compliantListing = enrichListingWithCompliance(mapped);

            // ── DDF Compliance: Analytics ping (fire-and-forget) ─────────────
            const clientIP = extractClientIP(request.headers);
            fireDDFAnalyticsPing({
                listingId: listing.listingId || listing.listingKey,
                ip: clientIP,
            });

            return NextResponse.json(compliantListing);
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
