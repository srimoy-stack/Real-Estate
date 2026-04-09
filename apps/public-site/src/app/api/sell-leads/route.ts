import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/sell-leads
 * Creates a new sell lead from the /sell page form submission.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, propertyType, city, address } = body;

    // ── Validation ──────────────────────────────────────────────
    const errors: Record<string, string> = {};
    if (!name?.trim()) errors.name = 'Name is required';
    if (!phone?.trim()) errors.phone = 'Phone is required';
    if (!propertyType?.trim()) errors.propertyType = 'Property type is required';
    if (!city?.trim()) errors.city = 'City is required';
    if (!address?.trim()) errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', fields: errors },
        { status: 400 }
      );
    }

    // ── Persist to database ─────────────────────────────────────
    const sellLead = await (prisma as any).sellLead.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        propertyType: propertyType.trim(),
        city: city.trim(),
        address: address.trim(),
      },
    });

    console.log('[SellLead] New lead created:', sellLead.id);

    return NextResponse.json(
      { success: true, id: sellLead.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[SellLead] POST error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sell-leads
 * Fetches all sell leads (for admin dashboard use).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const where: any = {};
    if (status) where.status = status;

    const leads = await (prisma as any).sellLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error('[SellLead] GET error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to fetch sell leads' },
      { status: 500 }
    );
  }
}
