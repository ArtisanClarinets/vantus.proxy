import { NextResponse } from 'next/server';
import { prisma } from 'database';

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ status: 'ok', db: 'connected' });
    } catch (e) {
        return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 500 });
    }
}
