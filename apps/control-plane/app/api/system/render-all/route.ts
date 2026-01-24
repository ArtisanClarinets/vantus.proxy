import { NextResponse } from "next/server";

export async function POST(request: Request) {
    // Secret check (basic)
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CONFIG_RENDERER_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const CONFIG_RENDERER_URL = process.env.CONFIG_RENDERER_URL || 'http://localhost:3001';

        // Call config-renderer service to generate configs
        const response = await fetch(`${CONFIG_RENDERER_URL}/render`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Empty body implies render all tenants
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Config renderer failed with ${response.status}: ${text}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error("Failed to render all configs via service", e);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
