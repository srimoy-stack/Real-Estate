import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { withActive } from '../../../../lib/listings-utils';
import {
  enrichListingWithCompliance,
  fireDDFAnalyticsPing,
  extractClientIP,
} from '../../../../lib/ddf-compliance';
import { isValidImageUrl } from '../../../../lib/server-listing-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { listingKey: string } }) {
  const { listingKey } = params;

  if (!listingKey) {
    return NextResponse.json({ error: 'ListingKey is required' }, { status: 400 });
  }

  try {
    // ── 1. Fetch from Local DB ──────────────────────────────────────────
    console.log(`[Internal Listings API] Searching for property with key/id: "${listingKey}"`);

    const listing = await prisma.listing.findFirst({
      where: withActive({
        OR: [
          { listingKey: { equals: listingKey, mode: 'insensitive' } },
          { listingId: { equals: listingKey, mode: 'insensitive' } },
        ],
      }),
    });

    if (listing) {
      console.log(`[Internal Listings API] Found property with key: ${listing.listingKey}`);
      
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
        PropertyType: listing.propertyType,
        PropertySubType: listing.propertySubType,
        UnparsedAddress: listing.address,
        City: listing.city,
        StateOrProvince: listing.province,
        PostalCode: listing.postalCode,
        Latitude: listing.latitude,
        Longitude: listing.longitude,
        BedroomsTotal: listing.bedroomsTotal,
        BathroomsTotalInteger: listing.bathroomsTotal,
        LivingArea: listing.livingArea,
        YearBuilt: listing.yearBuilt,
        PublicRemarks: listing.publicRemarks,
        ModificationTimestamp: listing.modificationTimestamp?.toISOString(),
        ListingDate: listing.listingDate?.toISOString() || null,
        CreatedAt: listing.createdAt?.toISOString() || null,
        // Agent/office details
        ListAgentFullName: listing.agentName || raw.ListAgentFullName || null,
        ListAgentDirectPhone: listing.agentPhone || raw.ListAgentDirectPhone || null,
        ListAgentEmail: raw.ListAgentEmail || null,
        ListAgentPhoto: raw.ListAgentPhoto || null,
        ListOfficeName: listing.officeName || raw.ListOfficeName || null,
        // Compatibility aliases
        agentName: listing.agentName || raw.ListAgentFullName || null,
        agentPhone: listing.agentPhone || raw.ListAgentDirectPhone || null,
        agentEmail: raw.ListAgentEmail || null,
        agentPhoto: raw.ListAgentPhoto && isValidImageUrl(raw.ListAgentPhoto) ? raw.ListAgentPhoto : null,
        officeName: listing.officeName || raw.ListOfficeName || null,
        moreInformationLink: listing.moreInformationLink || raw.ListingURL || null,
        primaryPhotoUrl: (listing.primaryPhotoUrl || listing.primaryPhoto as string) && isValidImageUrl(listing.primaryPhotoUrl || listing.primaryPhoto as string) ? (listing.primaryPhotoUrl || listing.primaryPhoto as string) : null,
        isFeatured: listing.isFeatured,
        Media: (() => {
          if (Array.isArray(listing.mediaJson) && (listing.mediaJson as any[]).length > 0) {
            const valid = (listing.mediaJson as any[]).filter(
              (m: any) => m && m.MediaURL && isValidImageUrl(m.MediaURL)
            );
            if (valid.length > 0) return valid;
          }
          if (Array.isArray(raw.Media) && raw.Media.length > 0) {
            const valid = raw.Media.filter((m: any) => m && m.MediaURL && isValidImageUrl(m.MediaURL));
            if (valid.length > 0) return valid;
          }
          const photoUrl = listing.primaryPhotoUrl || listing.primaryPhoto || null;
          if (photoUrl && isValidImageUrl(photoUrl))
            return [
              {
                MediaURL: photoUrl,
                MediaCategory: 'Property Photo',
                PreferredPhotoYN: true,
                Order: 0,
              },
            ];
          return [];
        })(),
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

    // ── 2. If not found in DB, return 404 ──
    console.warn(`[Internal Listings API] Property NOT FOUND in DB for: "${listingKey}"`);
    return NextResponse.json({ 
      error: 'Property not found in Local Database',
      searchedFor: listingKey,
      suggestion: 'Ensure the property is synced and isActive is true.'
    }, { status: 404 });

  } catch (err: any) {
    console.error('[Internal Detail Proxy] Error:', err.message);
    return NextResponse.json(
      { error: 'Internal Server Error', message: err.message },
      { status: 500 }
    );
  }
}
