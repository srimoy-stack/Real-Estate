import cron from 'node-cron';
import { syncListings } from '../syncListings';
import { prisma } from '../prisma';

let cronInitialized = false;

const COOLDOWN_MS = 10 * 60 * 1000; // 10-minute cooldown between syncs

/**
 * Check if a sync is currently running or was completed recently (within cooldown).
 * Uses the DB as source of truth — works across serverless cold starts.
 */
async function canRunSync(): Promise<{ allowed: boolean; reason?: string }> {
  const recentLog = await prisma.syncLog.findFirst({
    where: {
      startedAt: { gte: new Date(Date.now() - COOLDOWN_MS) },
    },
    orderBy: { startedAt: 'desc' },
  });

  if (!recentLog) return { allowed: true };

  if (recentLog.status === 'running') {
    return { allowed: false, reason: 'Sync is already running.' };
  }

  const elapsedMs = Date.now() - recentLog.startedAt.getTime();
  const remainingSec = Math.ceil((COOLDOWN_MS - elapsedMs) / 1000);
  return {
    allowed: false,
    reason: `Sync completed recently. Try again in ${remainingSec}s.`,
  };
}

/**
 * Core sync executor. Handles logging to DB, timing, and error capture.
 */
async function executeSyncWithLogging(
  trigger: 'cron' | 'manual' | 'external'
): Promise<{ success: boolean; message: string; durationMs?: number; listingsSynced?: number }> {
  const guard = await canRunSync();
  if (!guard.allowed) {
    console.log(`[SYNC] Blocked (${trigger}): ${guard.reason}`);
    return { success: false, message: guard.reason! };
  }

  // Create a running log entry
  const log = await prisma.syncLog.create({
    data: { trigger, status: 'running' },
  });

  const startTime = Date.now();
  console.log(`[SYNC] Starting MLS sync (trigger=${trigger}) at ${new Date().toISOString()}`);

  try {
    await syncListings();

    const durationMs = Date.now() - startTime;

    // Count total listings as a rough "synced" metric
    const totalListings = await prisma.listing.count();

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: 'success',
        completedAt: new Date(),
        durationMs,
        listingsSynced: totalListings,
      },
    });

    console.log(`[SYNC] Completed (trigger=${trigger}) in ${durationMs}ms — ${totalListings} listings in DB`);
    return { success: true, message: 'Sync completed successfully.', durationMs, listingsSynced: totalListings };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        durationMs,
        errorMessage,
      },
    });

    console.error(`[SYNC] Failed (trigger=${trigger}) after ${durationMs}ms:`, errorMessage);
    return { success: false, message: `Sync failed: ${errorMessage}`, durationMs };
  }
}

// ─── Local/Dev: In-process cron (only works with persistent server) ───

export function startSyncCron() {
  if (cronInitialized) {
    console.log('[CRON] Already initialized, skipping duplicate setup.');
    return;
  }

  cronInitialized = true;

  cron.schedule('0 10 * * *', () => {
    executeSyncWithLogging('cron');
  });

  console.log('[CRON] MLS sync cron scheduled — runs daily at 10:00 AM');
}

// ─── Production: Called by API route (external scheduler or manual) ───

export async function runSyncFromAPI(trigger: 'manual' | 'external' = 'external') {
  return executeSyncWithLogging(trigger);
}
