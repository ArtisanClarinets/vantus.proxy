import { Tenant, Domain, UpstreamPool, EdgePolicy } from '@prisma/client';
import { z } from 'zod';

// Zod Schemas for validation
const IpSchema = z.string().ip();
const DomainSchema = z.string().regex(/^[a-z0-9.-]+$/);

type Target = {
    host: string;
    port: number;
    weight?: number;
}

type ExtendedTenant = Tenant & {
    domains: Domain[];
    upstreamPools: UpstreamPool[];
    edgePolicies: EdgePolicy[];
}

/**
 * Generates an Nginx configuration string for a given tenant.
 * 
 * @param {ExtendedTenant} tenant - The tenant object with relations loaded.
 * @returns {string} The generated Nginx configuration.
 * @throws {Error} If security validation fails (e.g. invalid slug, invalid IPs).
 */
export function generateNginxConfig(tenant: ExtendedTenant): string {
  // 1. Security & Validation
  if (!/^[a-z0-9-]+$/.test(tenant.slug)) {
      throw new Error(`Security Error: Invalid tenant slug: ${tenant.slug}`);
  }

  const validDomains = tenant.domains
      .map(d => d.name)
      .filter(name => DomainSchema.safeParse(name).success);
  
  if (validDomains.length === 0) return "# No valid domains";

  const pool = tenant.upstreamPools[0]; // Multi-pool support later
  if (!pool) return "# No upstream pool configured";

  const policy = tenant.edgePolicies[0]; // Default policy
  
  // 2. Access Control Lists (ACLs)
  let allowListBlock = '';
  if (policy && Array.isArray(policy.ipAllowlist) && policy.ipAllowlist.length > 0) {
      const allowList = policy.ipAllowlist as string[];
      const validAllowList = [];
      for (const ip of allowList) {
          if (/^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/.test(ip)) {
             validAllowList.push(ip);
             allowListBlock += `    allow ${ip};\n`;
          } else {
             throw new Error(`Security Error: Invalid IP/CIDR in allowlist: ${ip}`);
          }
      }
      if (validAllowList.length > 0) {
          allowListBlock += `    deny all;\n`;
      }
  }

  // 3. Template Construction
  const upstreamName = `upstream_${tenant.slug}_${pool.name}`;

  // Construct upstream block
  let upstreamBlock = `upstream ${upstreamName} {\n`;
  const targets = pool.targets as unknown as Target[]; // [{host, port, weight}]
  if (Array.isArray(targets)) {
      for (const t of targets) {
          // Validate host/port?
          // Host might be internal docker name, which follows domain rules mostly
          upstreamBlock += `    server ${t.host}:${t.port} weight=${t.weight || 1};\n`;
      }
  }
  upstreamBlock += `}\n`;

  // Construct server block
  let serverBlock = `server {\n    listen 80;\n    server_name ${validDomains.join(' ')};\n\n`;

  // Headers
  const headers = policy?.headers as Record<string, string> | null;
  if (headers && typeof headers === 'object') {
      for (const [key, value] of Object.entries(headers)) {
          // Sanitize header keys/values to prevent injection
          if (/^[a-zA-Z0-9-]+$/.test(key) && /^[a-zA-Z0-9- :;.,]+$/.test(value)) {
               serverBlock += `    add_header ${key} "${value}" always;\n`;
          }
      }
  }

  // Proxy Pass
  serverBlock += `\n    location / {\n`;
  serverBlock += allowListBlock;
  serverBlock += `        proxy_pass http://${upstreamName};\n`;
  serverBlock += `        proxy_set_header Host $host;\n`;
  serverBlock += `        proxy_set_header X-Real-IP $remote_addr;\n`;
  serverBlock += `        proxy_set_header X-Tenant-Id "${tenant.id}";\n`;
  serverBlock += `    }\n`;

  serverBlock += `}\n`;

  return `${upstreamBlock}\n${serverBlock}`;
}
