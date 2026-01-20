import { prisma } from "database";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { metrics } = body;

        if (!Array.isArray(metrics)) {
            return NextResponse.json({ error: "Invalid metrics format" }, { status: 400 });
        }

        await prisma.metric.createMany({
            data: metrics.map((m: any) => ({
                name: m.name,
                value: m.value,
                tenantId: m.tenantId,
                unit: m.unit,
                labels: m.labels || {},
                timestamp: m.timestamp ? new Date(m.timestamp) : new Date()
            }))
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error("Failed to ingest metrics", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
