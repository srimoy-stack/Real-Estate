import { NextRequest, NextResponse } from 'next/server';
import { submitDDFLead } from '../../../../lib/ddf-compliance';
import { prisma } from '../../../../lib/prisma';

/**
 * API Route to bridge locally submitted leads to the CREA DDF Lead API.
 * 
 * CREA DDF Compliance Requirement: 
 *   Any "Email REALTOR" inquiry on an external website MUST be forwarded to the 
 *   CREA DDF Lead API so the listing agent receives it.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { mlsNumber, name, email, phone, message } = body;

        if (!mlsNumber || !name || !email || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Fetch the listing from DB to get the ddfMemberKey (ListAgentKey)
        const listing = await prisma.listing.findFirst({
            where: {
                OR: [
                    { listingKey: mlsNumber },
                    { listingId: mlsNumber }
                ]
            },
            select: {
                listingKey: true,
                rawData: true
            }
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found for DDF submission' }, { status: 404 });
        }

        const raw = (listing.rawData as any) || {};
        const memberKey = raw.ListAgentKey || raw.MemberKey;

        if (!memberKey) {
            console.error('[DDF Lead API] Could not find ListAgentKey for listing:', mlsNumber);
            return NextResponse.json({ error: 'Listing has no associated agent key' }, { status: 400 });
        }

        // 2. Submit to CREA DDF
        const result = await submitDDFLead({
            ListingKey: listing.listingKey,
            MemberKey: memberKey,
            SenderName: name,
            SenderEmailAddress: email,
            SenderPhoneNumber: phone,
            Message: message,
            PreferredMethodContact: 'email'
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[DDF Lead API Proxy] Error:', error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
