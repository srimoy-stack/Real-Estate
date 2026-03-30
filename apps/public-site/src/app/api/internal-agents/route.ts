import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { withActive } from '../../../lib/listings-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Try local DB first
        let listings = await prisma.listing.findMany({
            where: withActive(),
            take: 300,
            orderBy: { createdAt: 'desc' },
            select: {
                agentName: true,
                agentPhone: true,
                officeName: true,
                isActive: true,
                rawData: true,
            }
        });

        const seen = new Set<string>();
        const agents = [];

        // ── LIVE FEED INTEGRATION: Fetch Members from DDF ───────────────────
        try {
            const CLIENT_ID = process.env.DDF_CLIENT_ID || process.env.MLS_CLIENT_ID;
            const CLIENT_SECRET = process.env.DDF_CLIENT_SECRET || process.env.MLS_CLIENT_SECRET;
            
            if (CLIENT_ID && CLIENT_SECRET) {
                console.log('[Agents API] Fetching live members from DDF...');
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
                    // Query Members (DDF standard) - fetch top 48 for a rich directory
                    const ddfRes = await fetch('https://ddfapi.realtor.ca/odata/v1/Member?$top=48&$orderby=ModificationTimestamp desc', {
                        headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' }
                    });
                    
                    if (ddfRes.ok) {
                        const ddfData = await ddfRes.json();
                        const members = ddfData.value || [];
                        console.log(`[Agents API] Found ${members.length} members from DDF.`);
                        
                        for (const m of members) {
                            const fullName = `${m.MemberFirstName || ''} ${m.MemberLastName || ''}`.trim() || m.FullName;
                            if (!fullName || seen.has(fullName.toLowerCase())) continue;
                            seen.add(fullName.toLowerCase());

                            const photo = m.Media?.[0]?.MediaURL || 
                                          m.MemberPhotoURL ||
                                          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0f172a&color=fff&bold=true&size=512`;

                            agents.push({
                                id: m.MemberKey || Buffer.from(fullName).toString('base64').substring(0, 12),
                                name: fullName,
                                slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                title: m.JobTitle || 'Licensed Real Estate Professional',
                                email: m.MemberEmail || `${m.MemberFirstName?.toLowerCase()}.${m.MemberLastName?.toLowerCase()}@${(m.OfficeName || 'brokerage').toLowerCase().replace(/[^a-z0-9]+/g, '')}.ca`,
                                phone: m.MemberDirectPhone || m.MemberOfficePhone || '(416) 555-0100',
                                profilePhoto: photo,
                                bio: `${fullName} is an expert advisor at ${m.OfficeName || 'Skyline Estates'}, committed to delivering luxury-grade service and strategic market insights.`,
                                organizationId: 'org-1',
                                socialLinks: { linkedin: 'https://linkedin.com', facebook: 'https://facebook.com', instagram: 'https://instagram.com' },
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            });
                        }
                    }
                }
            }
        } catch (liveErr: any) {
            console.error('[Agents API] Live DDF Fetch Error:', liveErr.message);
        }

        // 2. Final population from DB data (Aggregated from local listings)
        for (const l of listings.filter(item => item.isActive !== false)) {
            const name = l.agentName?.trim();
            if (!name || seen.has(name.toLowerCase())) continue;
            seen.add(name.toLowerCase());
            
            const raw = (l.rawData as any) || {};
            agents.push({
                id: Buffer.from(name).toString('base64').substring(0, 12),
                name: name,
                slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                title: 'Real Estate Professional',
                email: raw.ListAgentEmail || `${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@brokerage.ca`,
                phone: l.agentPhone || raw.ListOfficePhone || '(416) 555-0100',
                profilePhoto: raw.ListAgentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=fff&bold=true&size=512`,
                bio: `${name} provides exceptional real estate services. Dedicated to achieving the best results for every client with local market expertise.`,
                organizationId: 'org-1',
                socialLinks: { linkedin: 'https://linkedin.com', facebook: 'https://facebook.com' },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            if (agents.length >= 48) break;
        }

        return NextResponse.json(agents);
    } catch (error: any) {
        console.error('[Agents API] FATAL Error:', error.message);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
