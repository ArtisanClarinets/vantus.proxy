import { prisma } from "database";
import { generateNginxConfig } from "@/lib/nginx-generator";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    // Secret check (basic)
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CONFIG_RENDERER_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tenants = await prisma.tenant.findMany({
            include: { domains: true, upstreamPools: true, edgePolicies: true }
        });

        const files = tenants.flatMap(tenant => {
            const config = generateNginxConfig(tenant);
            return tenant.domains.map(domain => ({
                filename: `${tenant.slug}_${domain.name}.conf`,
                content: config
            }));
        });

        return NextResponse.json({ files });
    } catch (e) {
        console.error("Failed to render all configs", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
