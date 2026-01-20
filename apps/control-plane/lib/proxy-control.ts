import fs from 'fs/promises';
import path from 'path';

// const execAsync = util.promisify(exec);

// Mock directory for configs
const NGINX_CONF_DIR = process.env.NGINX_CONF_DIR || '/tmp/vantus-nginx/conf.d';

// Redis Simulation (In-Memory for this demo, would be `ioredis` in prod)
// We use a global variable to simulate persistence across server actions in dev mode (mostly)
const globalForRedis = global as unknown as { redisStore: Map<string, string> };
const redisStore = globalForRedis.redisStore || new Map<string, string>();
if (process.env.NODE_ENV !== 'production') globalForRedis.redisStore = redisStore;

export async function validateConfig(configContent: string): Promise<{ valid: boolean; error?: string }> {
  if (configContent.includes('error')) {
     return { valid: false, error: 'Simulated validation error: Config contains "error"' };
  }
  if (!configContent.includes('server {')) {
      return { valid: false, error: 'Missing server block' };
  }
  return { valid: true };
}

export async function deployConfig(slug: string, configContent: string): Promise<void> {
  // Security Check: Slug Validation
  if (!/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Invalid slug for file path");
  }

  // Ensure directory exists
  await fs.mkdir(NGINX_CONF_DIR, { recursive: true });

  const filepath = path.join(NGINX_CONF_DIR, `${slug}.conf`);
  await fs.writeFile(filepath, configContent);

  // Simulate Nginx Reload
  // await execAsync('nginx -s reload');
  console.log(`[Mock] Deployed config for ${slug} to ${filepath}`);

  // Update Redis Cache (Host -> Tenant ID)
  // Extract Hosts from config or pass them in.
  // For now we assume the slug is the key or we map the domain.
  // In a real scenario, we'd map `test-tenant.vantus.systems` -> `tenant_id`
  console.log(`[Mock Redis] SET host:${slug}.vantus.systems -> tenant:${slug}`);
  redisStore.set(`host:${slug}.vantus.systems`, `tenant:${slug}`);
}

export async function getDeploymentHistory() {
    return [];
}
