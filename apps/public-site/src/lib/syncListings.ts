import { prisma } from './prisma';
import { getMLSAccessToken } from './mls/tokenManager';

const PREFERRED_PAGE_SIZE = 100;
const DDF_URL = 'https://ddfapi.realtor.ca/odata/v1/Property';

export async function syncListings() {
    console.log('[MLS Sync] 🚀 Initializing sync...');

    let skip = 0;
    let totalSynced = 0;
    let token: string;

    try {
        token = await getMLSAccessToken();
    } catch (err) {
        console.error('[MLS Sync] ❌ Failed to get access token:', err);
        return;
    }

    while (true) {
        try {
            console.log(`[MLS Sync] Fetching listings (skip=${skip}, top=${PREFERRED_PAGE_SIZE})...`);

            const queryParams = new URLSearchParams({
                '$top': PREFERRED_PAGE_SIZE.toString(),
                '$skip': skip.toString(),
                '$count': 'true',
                '$orderby': 'ModificationTimestamp desc'
            });

            const response = await fetch(`${DDF_URL}?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[MLS Sync] ❌ API fail (${response.status}):`, errorText);
                break;
            }

            const data = await response.json();
            const rawListings = data.value || [];

            if (rawListings.length === 0) {
                console.log('[MLS Sync] ✅ No more listings found. Sync complete.');
                break;
            }

            for (const item of rawListings) {
                const photosTime = item.PhotosChangeTimestamp ? new Date(item.PhotosChangeTimestamp) : null;
                const media = processMedia(item.Media || []);

                try {
                    await prisma.listing.upsert({
                        where: { listingKey: item.ListingKey },
                        update: {
                            listingId: item.ListingId,
                            listPrice: item.ListPrice ? parseFloat(item.ListPrice) : null,
                            standardStatus: item.StandardStatus,
                            propertyType: item.PropertyType,
                            propertySubType: item.PropertySubType,
                            bedroomsTotal: item.BedroomsTotal ? parseInt(item.BedroomsTotal, 10) : null,
                            bathroomsTotal: item.BathroomsTotalInteger ? parseInt(item.BathroomsTotalInteger, 10) : null,
                            address: item.UnparsedAddress,
                            city: item.City,
                            province: item.StateOrProvince,
                            postalCode: item.PostalCode,
                            latitude: item.Latitude ? parseFloat(item.Latitude) : null,
                            longitude: item.Longitude ? parseFloat(item.Longitude) : null,
                            publicRemarks: item.PublicRemarks,
                            agentName: item.ListAgentFullName,
                            agentPhone: item.ListAgentDirectPhone,
                            officeName: item.ListOfficeName,
                            moreInformationLink: item.ListingURL || null,
                            primaryPhoto: media.primary,
                            primaryPhotoUrl: media.primary,
                            photosChangeTimestamp: photosTime,
                            mediaJson: media.array,
                            modificationTimestamp: item.ModificationTimestamp ? new Date(item.ModificationTimestamp) : null,
                            listingDate: item.ListingDate ? new Date(item.ListingDate) : (item.OriginalEntryTimestamp ? new Date(item.OriginalEntryTimestamp) : null),
                            rawData: item,
                            isActive: true
                        },
                        create: {
                            listingKey: item.ListingKey,
                            listingId: item.ListingId,
                            listPrice: item.ListPrice ? parseFloat(item.ListPrice) : null,
                            standardStatus: item.StandardStatus,
                            propertyType: item.PropertyType,
                            propertySubType: item.PropertySubType,
                            bedroomsTotal: item.BedroomsTotal ? parseInt(item.BedroomsTotal, 10) : null,
                            bathroomsTotal: item.BathroomsTotalInteger ? parseInt(item.BathroomsTotalInteger, 10) : null,
                            address: item.UnparsedAddress,
                            city: item.City,
                            province: item.StateOrProvince,
                            postalCode: item.PostalCode,
                            latitude: item.Latitude ? parseFloat(item.Latitude) : null,
                            longitude: item.Longitude ? parseFloat(item.Longitude) : null,
                            publicRemarks: item.PublicRemarks,
                            agentName: item.ListAgentFullName,
                            agentPhone: item.ListAgentDirectPhone,
                            officeName: item.ListOfficeName,
                            moreInformationLink: item.ListingURL || null,
                            primaryPhoto: media.primary,
                            primaryPhotoUrl: media.primary,
                            photosChangeTimestamp: photosTime,
                            mediaJson: media.array,
                            modificationTimestamp: item.ModificationTimestamp ? new Date(item.ModificationTimestamp) : null,
                            listingDate: item.ListingDate ? new Date(item.ListingDate) : (item.OriginalEntryTimestamp ? new Date(item.OriginalEntryTimestamp) : null),
                            rawData: item,
                            isActive: true
                        }
                    });
                    totalSynced++;
                } catch (dbErr) {
                    console.error(`[MLS Sync] ⚠️ Skipping key ${item.ListingKey} due to DB error:`, dbErr);
                }
            }

            console.log(`[MLS Sync] Synced ${totalSynced} listings total...`);

            // Check if we've reached the end
            if (rawListings.length < PREFERRED_PAGE_SIZE) {
                console.log('[MLS Sync] ✅ End of data reached. Sync finished.');
                break;
            }

            skip += PREFERRED_PAGE_SIZE;

            // Wait 500ms to avoid DDF rate limits
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (err) {
            console.error('[MLS Sync] ❌ Critical sync error:', err);
            break;
        }
    }

    console.log(`[MLS Sync] ✨ Finished! Total listings managed: ${totalSynced}`);
}

function processMedia(media: any[]): { primary: string | null; array: any[] } {
    if (!media || media.length === 0) return { primary: null, array: [] };
    const processed = media.map(m => ({
        MediaURL: m.MediaURL,
        Order: m.Order || 0,
        MediaModificationTimestamp: m.MediaModificationTimestamp || null
    })).sort((a, b) => a.Order - b.Order);
    const primaryObj = processed.find(m => m.Order === 0) || processed[0];
    return {
        primary: primaryObj?.MediaURL || null,
        array: processed
    };
}

