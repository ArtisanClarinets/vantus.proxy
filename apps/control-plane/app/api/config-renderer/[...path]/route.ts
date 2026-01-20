import { NextResponse } from 'next/server';

const CONFIG_RENDERER_URL = process.env.CONFIG_RENDERER_URL || 'http://localhost:3001';

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    const pathStr = path.join('/');
    const url = `${CONFIG_RENDERER_URL}/${pathStr}`;

    try {
        const body = await request.json();
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add secret if needed
                // 'Authorization': `Bearer ${process.env.CONFIG_RENDERER_SECRET}` 
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Upstream error: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error("Proxy error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
