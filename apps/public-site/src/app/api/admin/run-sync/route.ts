import { NextResponse } from 'next/server';
import { runSyncFromAPI } from '@/lib/cron/syncCron';

const ADMIN_SYNC_SECRET = process.env.ADMIN_SYNC_SECRET;

// Prevent Netlify/Vercel from timing out — allow long-running sync
export const maxDuration = 300; // 5 minutes

/**
 * POST /api/admin/run-sync
 *
 * Trigger MLS listing sync. Protected by Bearer token.
 * Designed to be called by external schedulers (cron-job.org) or manually.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!ADMIN_SYNC_SECRET || token !== ADMIN_SYNC_SECRET) {
    console.log('[SYNC API] Unauthorized attempt blocked');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Determine trigger source from optional query param or header
  const url = new URL(request.url);
  const source = url.searchParams.get('source');
  const trigger = source === 'manual' ? 'manual' as const : 'external' as const;

  console.log(`[SYNC API] ${trigger} trigger received at ${new Date().toISOString()}`);

  const result = await runSyncFromAPI(trigger);

  const status = result.success ? 200 : 409;
  console.log(`[SYNC API] Response: ${status} — ${result.message}`);

  return NextResponse.json({
    success: result.success,
    message: result.message,
    durationMs: result.durationMs ?? null,
    listingsSynced: result.listingsSynced ?? null,
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * GET /api/admin/run-sync
 *
 * Health check — confirms the endpoint is reachable.
 * Also returns the last sync status from the database.
 */
export async function GET() {
  let lastSync = null;

  try {
    const { prisma } = await import('@/lib/prisma');
    const log = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    if (log) {
      lastSync = {
        trigger: log.trigger,
        status: log.status,
        startedAt: log.startedAt.toISOString(),
        completedAt: log.completedAt?.toISOString() ?? null,
        durationMs: log.durationMs,
        listingsSynced: log.listingsSynced,
        errorMessage: log.errorMessage,
      };
    }
  } catch {
    // DB not available — still return health check
  }

  return NextResponse.json({
    status: 'ok',
    endpoint: 'MLS sync trigger',
    usage: 'POST with Authorization: Bearer <ADMIN_SYNC_SECRET>',
    lastSync,
  });
}
