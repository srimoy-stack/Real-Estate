import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // We use dynamic property access to avoid type errors if the client 
        // hasn't fully picked up the new model during build/dev sync
        const db: any = prisma;
        const inquiryModel = db.inquiry || db['Inquiry'] || db['inquiry'];

        if (!inquiryModel) {
            console.error('Inquiry model not found in Prisma client');
            return NextResponse.json(
                { error: 'Database model not ready' },
                { status: 500 }
            );
        }

        const inquiry = await inquiryModel.create({
            data: {
                name,
                email,
                phone: phone || null,
                message,
                status: 'pending'
            }
        });

        return NextResponse.json({ 
            success: true, 
            data: inquiry 
        }, { status: 201 });
    } catch (error: any) {
        console.error('API Error [INQUIRY]:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
