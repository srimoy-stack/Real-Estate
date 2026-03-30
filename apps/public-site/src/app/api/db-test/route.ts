import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withActive } from '@/lib/listings-utils';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    const listingCount = await prisma.listing.count({ where: withActive() });
    const inactiveCount = await prisma.listing.count({ where: { isActive: false } });

    return NextResponse.json({
      status: 'connected',
      database: 'ok',
      activeCount: listingCount,
      inactiveCount,
      totalCount: listingCount + inactiveCount,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
