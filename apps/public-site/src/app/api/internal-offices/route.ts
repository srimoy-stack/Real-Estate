import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withActive } from '../../../lib/listings-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch unique offices from the latest listings stored in the DB
        // This ensures the site shows real brokerages active in the market
        const listings = await prisma.listing.findMany({
            where: withActive(),
            take: 500,
            orderBy: { createdAt: 'desc' },
            select: {
                officeName: true,
                isActive: true,
                rawData: true,
            }
        });

        const offices = [];
        const seen = new Set();

        // ── Aggregation Layer Defense ───────────────────────────────────────
        for (const l of listings.filter(item => item.isActive !== false)) {
            const name = l.officeName || (l.rawData as any)?.ListOfficeName;
            if (!name || seen.has(name)) continue;
            seen.add(name);
            
            const raw = (l.rawData as any) || {};

            offices.push({
                id: Buffer.from(name).toString('base64').substring(0, 12),
                name: name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                email: raw.ListOfficeEmail || `info@${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}.ca`,
                phone: raw.ListOfficePhone || '(416) 555-0199',
                address: raw.ListOfficeAddress || 'Toronto, ON',
                logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=fff&bold=true&size=512`,
                website: '#',
                agentsCount: Math.floor(Math.random() * 50) + 10, // Simulated for directory depth
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            if (offices.length >= 24) break;
        }

        // ── LIVE FEED FALLBACK ───────────────────────────────────────────────
        if (offices.length === 0) {
            console.log('[Offices API] DB empty, attempting live DDF fetch...');
            try {
                const CLIENT_ID = process.env.DDF_CLIENT_ID || process.env.MLS_CLIENT_ID;
                const CLIENT_SECRET = process.env.DDF_CLIENT_SECRET || process.env.MLS_CLIENT_SECRET;
                
                if (CLIENT_ID && CLIENT_SECRET) {
                    const tokenRes = await fetch('https://identity.crea.ca/connect/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            grant_type: 'client_credentials',
                            client_id: CLIENT_ID,
                            client_secret: CLIENT_SECRET,
                            scope: 'DDFApi_Read',
                        })
                    });
                    if (tokenRes.ok) {
                        const { access_token } = await tokenRes.json();
                        const ddfRes = await fetch('https://ddfapi.realtor.ca/odata/v1/Office?$top=20', {
                            headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
                        });
                        if (ddfRes.ok) {
                            const ddfData = await ddfRes.json();
                            for (const o of (ddfData.value || [])) {
                                const oName = o.OfficeName;
                                if (!oName || seen.has(oName)) continue;
                                seen.add(oName);
                                offices.push({
                                    id: Buffer.from(oName).toString('base64').substring(0, 12),
                                    name: oName,
                                    slug: oName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    email: o.OfficeEmail || `info@${oName.toLowerCase().replace(/[^a-z0-9]+/g, '')}.ca`,
                                    phone: o.OfficePhone || '(416) 555-0199',
                                    address: o.OfficeAddress || 'Toronto, ON',
                                    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(oName)}&background=0f172a&color=fff&bold=true&size=512`,
                                    website: '#',
                                    agentsCount: 0,
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                });
                            }
                        }
                    }
                }
            } catch (liveErr: any) {
                console.error('[Offices API] Live fallback failed:', liveErr.message);
            }
        }

        return NextResponse.json(offices);
    } catch (error: any) {
        console.error('[Offices API] FATAL Error:', error.message);
        return NextResponse.json({ error: 'Failed to fetch real office data' }, { status: 500 });
    }
}
