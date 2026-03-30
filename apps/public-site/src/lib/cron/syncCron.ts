import { syncListings } from '../syncListings';
import { runDeltaSync } from '../deltaSync';
import { prisma } from '../prisma';
import { withActive } from '../listings-utils';
import { flushListingsCache } from '../redis';

const COOLDOWN_MS = 1 * 60 * 1000; // 1-minute cooldown for delta sync

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
  trigger: 'cron' | 'manual' | 'external',
  type: 'delta' | 'full' = 'delta'
): Promise<{ success: boolean; message: string; durationMs?: number; listingsSynced?: number; details?: any }> {
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
  console.log(`[SYNC] Starting ${type.toUpperCase()} MLS sync (trigger=${trigger}) at ${new Date().toISOString()}`);

  try {
    let result: any;
    if (type === 'full') {
        // Fallback to legacy full sync if requested
        await syncListings();
    } else {
        // Modern Delta Sync (Senior Engineer Implementation)
        result = await runDeltaSync(false);
    }

    const durationMs = Date.now() - startTime;
    const activeCount = await prisma.listing.count({ where: withActive() });
    const inactiveCount = await prisma.listing.count({ where: { isActive: false } });
    const totalListings = activeCount + inactiveCount;

    console.log(`[Sync Engine] Finished. Active: ${activeCount}, Inactive: ${inactiveCount}, Total: ${totalListings}`);

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: 'success',
        completedAt: new Date(),
        durationMs,
        listingsSynced: totalListings,
      },
    });

    // ── Invalidate listing cache so fresh data is served immediately ────
    await flushListingsCache();

    console.log(`[SYNC] Completed in ${durationMs}ms — ${totalListings} listings in DB`);
    return { 
        success: true, 
        message: 'Sync completed successfully.', 
        durationMs, 
        listingsSynced: totalListings,
        details: result
    };
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

// ─── Production: Called by API route (external scheduler or manual) ───

export async function runSyncFromAPI(trigger: 'manual' | 'external' = 'external') {
  return executeSyncWithLogging(trigger);
}
