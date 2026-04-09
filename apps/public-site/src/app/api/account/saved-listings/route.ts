import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    try {
        const savedListings = await (prisma as any).savedListing.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(savedListings);
    } catch (error) {
        console.error('GET /api/account/saved-listings error:', error);
        return NextResponse.json({ error: 'Failed to fetch saved listings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId, listingId } = await request.json();

        if (!userId || !listingId) {
            return NextResponse.json({ error: 'UserId and ListingId are required' }, { status: 400 });
        }

        const savedListing = await (prisma as any).savedListing.upsert({
            where: {
                userId_listingId: { userId, listingId }
            },
            update: {}, // Do nothing if already exists
            create: { userId, listingId }
        });

        return NextResponse.json(savedListing);
    } catch (error) {
        console.error('POST /api/account/saved-listings error:', error);
        return NextResponse.json({ error: 'Failed to save listing' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');

    if (!userId || !listingId) {
        return NextResponse.json({ error: 'UserId and ListingId are required' }, { status: 400 });
    }

    try {
        await (prisma as any).savedListing.delete({
            where: {
                userId_listingId: { userId, listingId }
            }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/account/saved-listings error:', error);
        return NextResponse.json({ error: 'Failed to remove listing' }, { status: 500 });
    }
}
