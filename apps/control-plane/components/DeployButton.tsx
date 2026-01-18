'use client';

import { deployTenantConfig } from '@/app/app/nginx/actions';
import { useState } from 'react';
import { Upload } from 'lucide-react';

export function DeployButton({ tenantId }: { tenantId: string }) {
    const [loading, setLoading] = useState(false);

    const handleDeploy = async () => {
        if (!confirm('Are you sure you want to deploy this configuration to the Edge?')) return;
        setLoading(true);
        try {
            await deployTenantConfig(tenantId);
            alert('Deployment successful!');
        } catch (e) {
            alert('Deployment failed: ' + (e as any).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDeploy}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <Upload className="w-4 h-4" />
            {loading ? 'Deploying...' : 'Deploy to Edge'}
        </button>
    );
}
