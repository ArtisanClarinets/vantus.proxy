import fetch from 'node-fetch';
import os from 'os';

const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'http://localhost:3000';
const CLUSTER_ID = process.env.CLUSTER_ID || 'local-cluster';
const AUTH_TOKEN = process.env.EDGE_AGENT_TOKEN || 'secret';

const hostname = os.hostname();
const ipAddress = '127.0.0.1'; // In reality, detect interface IP

async function heartbeat() {
    try {
        const response = await fetch(`${CONTROL_PLANE_URL}/api/edge/heartbeat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify({
                clusterId: CLUSTER_ID,
                hostname,
                ipAddress,
                version: '1.0.0',
                status: 'HEALTHY',
                timestamp: new Date().toISOString()
            })
        });

        if (response.ok) {
            console.log(`[EdgeAgent] Heartbeat sent for ${hostname}`);
        } else {
            console.error(`[EdgeAgent] Heartbeat failed: ${response.status}`);
        }
    } catch (e) {
        console.error(`[EdgeAgent] Connection error:`, e);
    }
}

console.log(`Starting Edge Agent for ${hostname}...`);
setInterval(heartbeat, 30000); // 30s interval
heartbeat();
