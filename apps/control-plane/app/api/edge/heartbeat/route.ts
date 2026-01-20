import { NextResponse } from 'next/server';
import { prisma } from 'database';

export async function POST(req: Request) {
    const authHeader = req.headers.get('Authorization');
    // Validate token (simplified)
    if (authHeader !== `Bearer ${process.env.EDGE_AGENT_SECRET || 'secret'}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clusterId, hostname, ipAddress, version, status } = await req.json();

    // Upsert Cluster
    let cluster = await prisma.edgeCluster.findFirst({ where: { id: clusterId } }); // Usually by name or external ID
    if (!cluster) {
        // Fallback: Create generic cluster if not exists (or error out in strict mode)
        // For MVP we assume clusterId is the ID.
        // Or we treat it as a name.
        cluster = await prisma.edgeCluster.findFirst({ where: { name: clusterId } });
        if (!cluster) {
             cluster = await prisma.edgeCluster.create({
                 data: { name: clusterId, region: 'global', provider: 'unknown' }
             });
        }
    }

    // Upsert Node
    const node = await prisma.edgeNode.findFirst({
        where: { hostname, clusterId: cluster.id }
    });

    if (node) {
        await prisma.edgeNode.update({
            where: { id: node.id },
            data: {
                status,
                version,
                lastSeenAt: new Date(),
                ipAddress
            }
        });
    } else {
        await prisma.edgeNode.create({
            data: {
                hostname,
                clusterId: cluster.id,
                ipAddress,
                version,
                status,
                lastSeenAt: new Date()
            }
        });
    }

    return NextResponse.json({ status: 'ok' });
}
