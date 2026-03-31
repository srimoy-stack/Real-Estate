import { NextRequest, NextResponse } from 'next/server';
import { shortcodeConfigService } from '@repo/services';
import { prisma } from '../../../../lib/prisma';
import { ListingQuery, getListingsForShortcode } from '../../../../lib/listings-utils';
import { enrichListingsWithCompliance } from '../../../../lib/ddf-compliance';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const { name } = params;
  const { searchParams } = new URL(request.url);

  try {
    // 1. Resolve Config (default to empty filters if not found)
    const config = shortcodeConfigService.getConfigByName('website-agent-1', name);

    // 2. Mapping Function: Standardize filters and remove pollution
    const mapShortcodeToSearchFilters = () => {
      const f = config?.filters || {};
      const q: ListingQuery = {};

      // Helper to only set defined values
      const setIf = (key: keyof ListingQuery, val: any) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'Any') {
          (q as any)[key] = val;
        }
      };

      // Apply Config + Inline Overrides
      setIf('city', searchParams.get('city') || f.city);
      setIf('propertyType', searchParams.get('propertyType') || f.propertyType);
      setIf('standardStatus', searchParams.get('status') || f.status);
      setIf(
        'minPrice',
        searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : f.minPrice
      );
      setIf(
        'maxPrice',
        searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : f.maxPrice
      );
      setIf(
        'beds',
        searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!, 10) : f.bedrooms
      );
      setIf(
        'baths',
        searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!, 10) : f.bathrooms
      );
      setIf(
        'featured',
        searchParams.get('featured') ? searchParams.get('featured') === 'true' : f.featured
      );

      // Sorting & Pagination
      const sort = searchParams.get('sort') || config?.sort || 'latest';
      setIf('sortBy', sort === 'latest' ? 'newest' : sort);
      setIf('order', (sort === 'price_asc' ? 'asc' : 'desc') as any);

      return q;
    };

    const baseQuery = mapShortcodeToSearchFilters();
    const limit = parseInt(searchParams.get('limit') || String(config?.limit || 6), 10);

    // 3. Fetch Listings (Using isolated wrapper to prevent engine expansion)
    const { listings: listingsRaw } = await getListingsForShortcode(prisma, baseQuery, limit);

    // 5. Map and Enrich (Consistency with internal-listings API)
    const mappedListings = listingsRaw.map((listing: any) => {
      const raw = (listing.rawData as any) || {};
      return {
        ...raw,
        listingKey: listing.listingKey,
        ListingKey: listing.listingKey,
        ListPrice: listing.listPrice,
        standardStatus: listing.standardStatus,
        StandardStatus: listing.standardStatus,
        City: listing.city,
        UnparsedAddress: listing.address,
        agentName: listing.agentName || raw.ListAgentFullName,
        officeName: listing.officeName || raw.ListOfficeName,
        primaryPhotoUrl: listing.primaryPhotoUrl || listing.primaryPhoto || null,
        Media: (() => {
          if (Array.isArray(listing.mediaJson) && listing.mediaJson.length > 0) {
            const valid = listing.mediaJson.filter(
              (m: any) => m && m.MediaURL && m.MediaURL.length > 0
            );
            if (valid.length > 0) return valid;
          }
          if (Array.isArray(raw.Media) && raw.Media.length > 0) {
            const valid = raw.Media.filter((m: any) => m && m.MediaURL && m.MediaURL.length > 0);
            if (valid.length > 0) return valid;
          }
          const photoUrl = listing.primaryPhotoUrl || listing.primaryPhoto || null;
          if (photoUrl && photoUrl.length > 0)
            return [{ MediaURL: photoUrl, PreferredPhotoYN: true, Order: 0 }];
          return [];
        })(),
        moreInformationLink: listing.moreInformationLink || raw.ListingURL || null,
      };
    });

    const listings = enrichListingsWithCompliance(mappedListings);

    return NextResponse.json({
      success: true,
      configName: name,
      found: !!config,
      listings,
    });
  } catch (err: any) {
    console.error('[Shortcode API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to resolve shortcode', message: err.message },
      { status: 500 }
    );
  }
}
