import { prisma } from './prisma';
import { withActive, buildWhereClause, buildOrderByClause } from './listings-utils';
import { MLSListing } from '@repo/services';

const NON_IMAGE = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)$/i;
export const isValidImageUrl = (url: string) => {
  if (!url || typeof url !== 'string' || url.length < 10) return false;
  if (NON_IMAGE.test(url)) return false;
  try {
    const u = new URL(url);
    if (u.pathname === '/' || u.pathname === '') return false;
  } catch {
    return false;
  }
  return true;
};

export async function getListingByMlsDirect(mlsNumber: string): Promise<MLSListing | null> {
  try {
    const listing = await prisma.listing.findFirst({
      where: withActive({
        OR: [
          { listingKey: { equals: mlsNumber, mode: 'insensitive' } },
          { listingId: { equals: mlsNumber, mode: 'insensitive' } },
        ],
      }),
    });

    if (!listing) return null;

    const raw = (listing.rawData || {}) as any;

    // Media handling logic (same as API route)
    const images = (() => {
      if (Array.isArray(listing.mediaJson) && (listing.mediaJson as any[]).length > 0) {
        const valid = (listing.mediaJson as any[]).filter(
          (m: any) => m && m.MediaURL && isValidImageUrl(m.MediaURL)
        ).map(m => m.MediaURL);
        if (valid.length > 3) return valid;
      }

      if (Array.isArray(raw.Media) && raw.Media.length > 0) {
        const valid = raw.Media.filter((m: any) => m && m.MediaURL && isValidImageUrl(m.MediaURL))
          .map((m: any) => m.MediaURL);
        if (valid.length > 0) return valid;
      }

      const photoUrl = listing.primaryPhotoUrl || listing.primaryPhoto || null;
      if (photoUrl && isValidImageUrl(photoUrl)) return [photoUrl];

      return [];
    })();


    return {
      mlsNumber: listing.listingKey,
      price: listing.listPrice ?? 0,
      status: listing.standardStatus || 'Active',
      propertyType: listing.propertySubType || listing.propertyType || 'Detached',
      address: listing.address || '',
      city: listing.city || '',
      province: listing.province || '',
      postalCode: listing.postalCode || '',
      bedrooms: listing.bedroomsTotal ?? 0,
      bathrooms: listing.bathroomsTotal ?? 0,
      squareFootage: listing.livingArea || 0,
      yearBuilt: listing.yearBuilt || undefined,
      images,
      isFeatured: !!listing.isFeatured,
      createdAt: listing.modificationTimestamp?.toISOString() || listing.createdAt.toISOString(),
      description: listing.publicRemarks || '',
      location: { 
        lat: listing.latitude || 0, 
        lng: listing.longitude || 0 
      },
      agentName: listing.agentName || raw.ListAgentFullName || '',
      agentPhone: listing.agentPhone || raw.ListAgentDirectPhone || undefined,
      agentEmail: raw.ListAgentEmail || undefined,
      agentPhoto: raw.ListAgentPhoto && isValidImageUrl(raw.ListAgentPhoto) ? raw.ListAgentPhoto : null,
      brokerageName: listing.officeName || raw.ListOfficeName || null,
      moreInformationLink: listing.moreInformationLink || raw.ListingURL || null,
      primaryPhotoUrl: (listing.primaryPhotoUrl || listing.primaryPhoto) && isValidImageUrl(listing.primaryPhotoUrl || listing.primaryPhoto as string) ? (listing.primaryPhotoUrl || listing.primaryPhoto as string) : null,
      features: [],
      amenities: [],
      organizationId: 'org-1',
      updatedAt: listing.modificationTimestamp?.toISOString() || listing.updatedAt.toISOString(),
      ddfListingKey: listing.listingKey,
      ddfMemberKey: raw.ListAgentKey,
      rawData: raw
    } as any;
  } catch (error) {
    console.error('[Server Listing Service] Error fetching listing:', error);
    return null;
  }
}

export async function getRelatedListingsDirect(listing: any, limit: number = 4) {
  try {
    const city = listing.city;
    const province = listing.province;
    const currentMls = listing.mlsNumber || listing.listingKey;

    // Level 1: Same City
    let related = await prisma.listing.findMany({
      where: withActive({
        city: { equals: city, mode: 'insensitive' },
        listingKey: { not: currentMls }
      }),
      take: limit,
      orderBy: { modificationTimestamp: 'desc' }
    });

    // Level 2 Fallback: Same Province
    if (related.length === 0 && province) {
      related = await prisma.listing.findMany({
        where: withActive({
          province: { equals: province, mode: 'insensitive' },
          listingKey: { not: currentMls }
        }),
        take: limit,
        orderBy: { modificationTimestamp: 'desc' }
      });
    }

    // Level 3 Fallback: Simply latest listings
    if (related.length === 0) {
      related = await prisma.listing.findMany({
        where: withActive({
          listingKey: { not: currentMls }
        }),
        take: limit,
        orderBy: { modificationTimestamp: 'desc' }
      });
    }

    return related.map((l: any) => ({
      id: l.listingKey,
      mlsNumber: l.listingKey,
      price: l.listPrice,
      address: l.address,
      city: l.city,
      province: l.province,
      bedrooms: l.bedroomsTotal,
      bathrooms: l.bathroomsTotal,
      squareFootage: l.livingArea,
      images: l.primaryPhotoUrl && isValidImageUrl(l.primaryPhotoUrl) ? [l.primaryPhotoUrl] : [],
      propertyType: l.propertySubType || l.propertyType || 'Residential',
      status: l.standardStatus || 'Active',
      moreInformationLink: l.moreInformationLink || null
    }));
  } catch (error) {
    console.error('[Server Listing Service] Error fetching related listings:', error);
    return [];
  }
}

export interface ListingQueryParams {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string[];
  status?: string;
  keyword?: string;
  page?: number;
  limit?: number;
  sort?: string;
  featured?: boolean;
}

export async function searchListingsDirect(params: ListingQueryParams) {
  try {
    const page = params.page || 1;
    const limit = params.limit || 12;
    const skip = (page - 1) * limit;

    const filters: any = {
      ...params,
      beds: params.bedrooms,
      baths: params.bathrooms,
      q: params.keyword,
      sortBy: params.sort === 'latest' ? 'newest' : params.sort,
    };

    const where = buildWhereClause(filters);
    const orderBy = buildOrderByClause(filters);

    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        take: limit,
        skip,
      }),
      prisma.listing.count({ where })
    ]);

    const compatibleListings = listings.map((l: any) => {
      // Robust image resolution for search grid/cards
      const images = (() => {
        if (l.primaryPhotoUrl && isValidImageUrl(l.primaryPhotoUrl)) return [l.primaryPhotoUrl];
        
        // Try to parse mediaJson if it exists
        if (l.mediaJson) {
           try {
             //prisma returns json already if it was json column
             const media = l.mediaJson;
             if (Array.isArray(media)) {
               const valid = media
                 .filter((m: any) => m && m.MediaURL && isValidImageUrl(m.MediaURL))
                 .map((m: any) => m.MediaURL);
               if (valid.length > 0) return valid;
             }
           } catch (e) {
             // Ignore errors
           }
        }
        
        // Final fallback to primaryPhoto field
        if (l.primaryPhoto && isValidImageUrl(l.primaryPhoto)) return [l.primaryPhoto];
        
        return [];
      })();

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
        images: images,
        propertyType: l.propertySubType || l.propertyType,
        status: l.standardStatus || 'Active',
        isFeatured: !!l.isFeatured,
        moreInformationLink: l.moreInformationLink || null,
        location: { lat: l.latitude || 0, lng: l.longitude || 0 }
      };
    });

    return {
      listings: compatibleListings,
      totalCount
    };
  } catch (error) {
    console.error('[Server Listing Service] Error searching listings:', error);
    return { listings: [], totalCount: 0 };
  }
}

export async function getFeaturedListingsDirect(limit: number = 6) {
  return await searchListingsDirect({ featured: true, limit, page: 1 });
}
