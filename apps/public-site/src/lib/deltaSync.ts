import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { getMLSAccessToken } from './mls/tokenManager';

const BATCH_SIZE = 100; // DDF Web API maximum is 100 per page
const DDF_URL = 'https://ddfapi.realtor.ca/odata/v1/Property';
const RATE_LIMIT_DELAY = 1000;

interface SyncStats {
    inserted: number;
    updated: number;
    skipped: number;
    deleted: number;
    totalActiveInAPI: number;
    errors: number;
}

/**
 * Production-Safe Delta Sync & Deletion System
 * - Idempotent: safe to call repeatedly
 * - Resilient: single-item failures don't crash the batch
 * - Uses Prisma atomic upsert (no race conditions)
 * - Implements safe soft-deletions via 'isActive' flag
 */
export async function runDeltaSync(isFullSync: boolean = false) {
    const startTime = Date.now();
    const stats: SyncStats = { inserted: 0, updated: 0, skipped: 0, deleted: 0, totalActiveInAPI: 0, errors: 0 };

    console.log(`[Delta Sync] 🔄 Starting ${isFullSync ? 'FULL' : 'DELTA'} sync...`);

    try {
        const token = await getMLSAccessToken();

        // ── 1. Determine Delta Timestamp from last successful sync ───────
        let lastSyncAt: Date | null = null;
        if (!isFullSync) {
            const lastLog = await prisma.syncLog.findFirst({
                where: { status: 'success' },
                orderBy: { startedAt: 'desc' }
            });
            lastSyncAt = lastLog?.completedAt || lastLog?.startedAt || null;
        }

        console.log(`[Delta Sync] Last sync: ${lastSyncAt?.toISOString() || 'NEVER (fetching all)'}`);

        // ── 2. Delta Fetch & Upsert ─────────────────────────────────────
        await processDeltaUpserts(token, lastSyncAt, stats);

        // ── 3. Deletion Handling — only on full sync (safe soft delete) ──
        if (isFullSync) {
            await processSafeDeletions(token, stats);
        }

        const duration = Date.now() - startTime;
        console.log(`[Delta Sync] ✨ Result: +${stats.inserted} | ~${stats.updated} | ⚠${stats.errors} | -${stats.deleted} (inactive) in ${duration}ms`);
        
        return { ...stats, durationMs: duration };
    } catch (err) {
        console.error('[Delta Sync] ❌ Critical Failure:', err);
        throw err;
    }
}

/**
 * Fetch modified listings from DDF API and upsert into DB.
 * Force isActive: true on every find/sync.
 */
async function processDeltaUpserts(token: string, lastSyncAt: Date | null, stats: SyncStats) {
    let skip = 0;
    
    while (true) {
        let filter = "StandardStatus eq 'Active'";
        if (lastSyncAt) {
            filter += ` and ModificationTimestamp gt ${lastSyncAt.toISOString()}`;
        }

        const queryParams = new URLSearchParams({
            '$top': BATCH_SIZE.toString(),
            '$skip': skip.toString(),
            '$filter': filter,
            '$expand': 'Media',
            '$orderby': 'ModificationTimestamp asc'
        });

        const response = await fetch(`${DDF_URL}?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`DDF API Error: ${response.status}`);
        
        const data = await response.json();
        const items = data.value || [];
        
        if (items.length === 0) break;

        for (const item of items) {
            try {
                await upsertListing(item, stats);
            } catch (err) {
                stats.errors++;
                console.error(`[Delta Sync] Item Fail [${item.ListingKey}]:`, err);
            }
        }

        skip += items.length;
        if (items.length < BATCH_SIZE) break;

        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY));
    }
}

async function upsertListing(item: any, stats: SyncStats) {
    const key = item.ListingKey;
    if (!key) return;

    const modTime = item.ModificationTimestamp ? new Date(item.ModificationTimestamp) : new Date();

    // ── Media Optimization: check if photos actually changed ───────────
    const existingListing = await prisma.listing.findUnique({
        where: { listingKey: key },
        select: { id: true, primaryPhoto: true, photosChangeTimestamp: true, mediaJson: true, modificationTimestamp: true }
    });

    const ddfPhotosTime = item.PhotosChangeTimestamp ? new Date(item.PhotosChangeTimestamp) : null;
    let photoUrl = existingListing?.primaryPhoto || null;
    let mediaJson = existingListing?.mediaJson || null;

    if (existingListing) {
        // Skip update if BOTH timestamps match exactly to save DB bandwidth
        const modTimeMatches = existingListing.modificationTimestamp && modTime.getTime() === existingListing.modificationTimestamp.getTime();
        const photosTimeMatches = (!ddfPhotosTime && !existingListing.photosChangeTimestamp) || 
                                (ddfPhotosTime && existingListing.photosChangeTimestamp && ddfPhotosTime.getTime() === existingListing.photosChangeTimestamp.getTime());

        if (modTimeMatches && photosTimeMatches) {
            stats.skipped++;
            return;
        }

        // Only update media details if PhotosChangeTimestamp has changed
        if (!photosTimeMatches) {
            const processedMedia = processMedia(item.Media || []);
            photoUrl = processedMedia.primary;
            mediaJson = processedMedia.array;
        }
    } else {
        // New listing — process all media
        const processedMedia = processMedia(item.Media || []);
        photoUrl = processedMedia.primary;
        mediaJson = processedMedia.array;
    }

    // ── Safe number parsers ─────────────────────────────────────────────
    const safeFloat = (v: any): number | null => {
        if (v === null || v === undefined) return null;
        const n = parseFloat(String(v));
        return Number.isFinite(n) ? n : null;
    };
    const safeInt = (v: any): number | null => {
        if (v === null || v === undefined) return null;
        const n = parseInt(String(v), 10);
        return Number.isFinite(n) ? n : null;
    };

    const listingData = {
        listingId: item.ListingId || null,
        listPrice: safeFloat(item.ListPrice),
        standardStatus: item.StandardStatus || null,
        propertyType: item.PropertyType || null,
        propertySubType: item.PropertySubType || null,
        bedroomsTotal: safeInt(item.BedroomsTotal),
        bathroomsTotal: safeInt(item.BathroomsTotalInteger),
        address: item.UnparsedAddress || null,
        city: item.City || null,
        province: item.StateOrProvince || null,
        postalCode: item.PostalCode || null,
        latitude: safeFloat(item.Latitude),
        longitude: safeFloat(item.Longitude),
        livingArea: safeFloat(item.LivingArea || item.BuildingAreaTotal),
        yearBuilt: safeInt(item.YearBuilt),
        publicRemarks: item.PublicRemarks || null,
        agentName: item.ListAgentFullName || null,
        agentPhone: item.ListAgentDirectPhone || null,
        officeName: item.ListOfficeName || null,
        moreInformationLink: item.ListingURL || null,
        primaryPhoto: photoUrl,
        primaryPhotoUrl: photoUrl,
        photosChangeTimestamp: ddfPhotosTime,
        mediaJson: mediaJson || Prisma.DbNull,
        modificationTimestamp: modTime,
        listingDate: item.ListingDate
            ? new Date(item.ListingDate)
            : (item.OriginalEntryTimestamp ? new Date(item.OriginalEntryTimestamp) : null),
        rawData: (() => {
            // Store full DDF payload (required for advanced filters, agent details, Lead API)
            // Strip Media array to avoid duplication — already stored in mediaJson column
            const { Media, ...rawWithoutMedia } = item;
            return rawWithoutMedia;
        })(),
        isActive: true // REACTIVATE if was soft-deleted
    };

    await prisma.listing.upsert({
        where: { listingKey: key },
        update: listingData,
        create: { listingKey: key, ...listingData }
    });

    if (existingListing) stats.updated++; else stats.inserted++;
}

/**
 * DETECT REMOVAL (SAFE SOFT DELETE)
 * - Fetch ALL active listing keys from API
 * - Mark missing listings in DB as isActive: false
 * - NEVER hard delete during sync
 */
async function processSafeDeletions(token: string, stats: SyncStats) {
    console.log('[Deletion Sync] 🗑️ Detection started (SAFE MODE)...');
    
    const activeKeysInAPI = new Set<string>();
    let skip = 0;
    const PAGE_SIZE_KEYS = 1000;

    while (true) {
        const queryParams = new URLSearchParams({
            '$top': PAGE_SIZE_KEYS.toString(),
            '$skip': skip.toString(),
            '$select': 'ListingKey',
            '$filter': "StandardStatus eq 'Active'"
        });

        const response = await fetch(`${DDF_URL}?${queryParams.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });

        if (!response.ok) {
            console.error(`[Deletion Sync] API check failed. Skipping deletions as safety guard.`);
            return;
        }

        const data = await response.json();
        const items = data.value || [];
        if (items.length === 0) break;

        items.forEach((i: any) => activeKeysInAPI.add(i.ListingKey));
        skip += items.length;
        if (items.length < PAGE_SIZE_KEYS) break;
        
        await new Promise(r => setTimeout(r, 200));
    }

    stats.totalActiveInAPI = activeKeysInAPI.size;
    
    // Safety Guard: if API returns 0 listings, skip update (prevent wipe)
    if (activeKeysInAPI.size === 0) {
        console.warn('[Deletion Sync] API returned ZERO active listings. Detection aborted for safety.');
        return;
    }

    // Mark removed listings (isActive = false)
    const dbListings = await prisma.listing.findMany({ 
        where: { isActive: true },
        select: { listingKey: true } 
    });
    
    const keysToDeactivate = dbListings
        .map(l => l.listingKey)
        .filter(key => !activeKeysInAPI.has(key));

    if (keysToDeactivate.length > 0) {
        console.log(`[Deletion Sync] Soft-deleting ${keysToDeactivate.length} removed listings...`);
        const { count } = await prisma.listing.updateMany({
            where: { listingKey: { in: keysToDeactivate } },
            data: { isActive: false }
        });
        stats.deleted = count;
    } else {
        console.log('[Deletion Sync] No stale listings found.');
    }
}

/**
 * ─── Media Handling Logic ──────────────────────────────────────────────────
 * Extracts primary image and stores lightweight media array.
 * Primary: Media where Order === 0 (otherwise first available).
 */
function processMedia(media: any[]): { primary: string | null; array: any[] } {
    if (!media || media.length === 0) return { primary: null, array: [] };

    const NON_IMAGE_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|zip)$/i;

    const processed = media
        .filter(m => {
            // Determine effective URL (prefer HighRes if available)
            const url = m?.HighResMediaURL || m?.MediaURL || m?.LowResMediaURL;
            if (!url || typeof url !== 'string') return false;
            
            const trimmedUrl = url.trim();
            if (trimmedUrl.length < 10) return false;
            
            // Reject non-image documents/archives
            if (NON_IMAGE_EXTENSIONS.test(trimmedUrl)) return false;
            
            // Validate URL structure
            try {
                const parsed = new URL(trimmedUrl);
                // Reject URLs with no path (likely just a domain)
                if (parsed.pathname === '/' || parsed.pathname === '') return false;
            } catch { 
                return false; 
            }
            
            return true;
        })
        .map(m => {
            // Standardize: pick best resolution and ensure fields exist
            const bestUrl = (m.HighResMediaURL || m.MediaURL || m.LowResMediaURL).trim();
            return {
                MediaURL: bestUrl,
                Order: m.Order || 0,
                MediaModificationTimestamp: m.MediaModificationTimestamp || null
            };
        })
        .sort((a, b) => a.Order - b.Order);

    // Final Primary Check: Ensure we pick Order 0, otherwise first available
    const primaryObj = processed.find(m => m.Order === 0) || processed[0];

    return {
        primary: primaryObj?.MediaURL || null,
        array: processed
    };
}

