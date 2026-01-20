import fs from 'fs/promises';
import path from 'path';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:3000';
const CONFIG_RENDERER_SECRET = process.env.CONFIG_RENDERER_SECRET || 'dev-secret';
const NGINX_CONF_DIR = process.env.NGINX_CONF_DIR || '/tmp/vantus-nginx/conf.d';
const POLL_INTERVAL = 30000;

async function syncConfigs() {
    try {
        console.log(`[${new Date().toISOString()}] Syncing configs from ${CONTROL_PLANE_URL}...`);
        
        await fs.mkdir(NGINX_CONF_DIR, { recursive: true });

        const response = await fetch(`${CONTROL_PLANE_URL}/api/system/render-all`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${CONFIG_RENDERER_SECRET}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as { files: { filename: string, content: string }[] };
        const { files } = data;
        
        if (!files || !Array.isArray(files)) {
            console.error("Invalid response from control plane");
            return;
        }

        for (const file of files) {
            const filepath = path.join(NGINX_CONF_DIR, file.filename);
            await fs.writeFile(filepath, file.content);
        }
        
        console.log(`[${new Date().toISOString()}] Successfully synced ${files.length} configuration files.`);
        
        // In a real environment, you would trigger a reload here:
        // exec('nginx -s reload')
    } catch (e: any) {
        console.error(`[${new Date().toISOString()}] Sync failed: ${e.message}`);
    }
}

console.log("Nginx Sidecar Agent starting...");
setInterval(syncConfigs, POLL_INTERVAL);
syncConfigs();
