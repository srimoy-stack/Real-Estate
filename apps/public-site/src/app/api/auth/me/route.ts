import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/me
 * Validates the JWT from the Authorization header and returns the current user.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header.' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token.' },
        { status: 401 }
      );
    }

    // ── Fetch fresh user data from DB ───────────────────────
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        organizationId: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or deactivated.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('[Auth/Me] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
