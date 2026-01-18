"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeployButton({ tenantId }: { tenantId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDeploy = async () => {
        if (!confirm("Are you sure you want to deploy configuration for this tenant?")) return;
        setLoading(true);
        try {
            // 1. Render Config
            const renderRes = await fetch(`${process.env.NEXT_PUBLIC_CONFIG_RENDERER_URL || 'http://localhost:3001'}/render`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId }) // Filter by tenant if supported, else renders all (current simple implementation renders all)
            });

            if (!renderRes.ok) throw new Error("Render failed");
            const { files, hash } = await renderRes.json();

            // 2. Deploy
            const deployRes = await fetch(`${process.env.NEXT_PUBLIC_CONFIG_RENDERER_URL || 'http://localhost:3001'}/deploy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ files, hash })
            });

            if (!deployRes.ok) throw new Error("Deploy failed");
            alert("Deployment successful!");
            router.refresh();
        } catch (e) {
            console.error(e);
            alert("Deployment failed: " + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDeploy}
            disabled={loading}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
        >
            {loading ? "Deploying..." : "Deploy Config"}
        </button>
    );
}
