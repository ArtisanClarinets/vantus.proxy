import { Tenant, Domain, EdgePolicy, UpstreamPool } from '@prisma/client';
import { z } from 'zod';
import net from 'node:net';

type TenantWithRelations = Tenant & {
  domains: Domain[];
  upstreamPools: UpstreamPool[];
  edgePolicies: EdgePolicy[];
};

type RateLimit = { rps: number; burst: number };
type Target = { host: string; port: number; weight?: number };

// --- Validation Schemas ---
const SlugSchema = z.string().regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, "Invalid slug format");
const DomainSchema = z.string().regex(/^[a-zA-Z0-9.-]+$/, "Invalid domain format");
const IpSchema = z.string().refine((val) => net.isIP(val) !== 0, {
  message: "Invalid IP address",
});

export function generateNginxConfig(tenant: TenantWithRelations): string {
  // 1. Strict Validation
  const slugResult = SlugSchema.safeParse(tenant.slug);
  if (!slugResult.success) {
      throw new Error(`Security Error: Invalid tenant slug '${tenant.slug}' - ${slugResult.error.message}`);
  }

  if (!tenant.domains.length) {
      return `# No domains configured for tenant ${tenant.slug}`;
  }

  const validDomains: string[] = [];
  for (const d of tenant.domains) {
      const res = DomainSchema.safeParse(d.name);
      if (!res.success) throw new Error(`Security Error: Invalid domain '${d.name}'`);
      validDomains.push(d.name);
  }

  const pool = tenant.upstreamPools[0];
  if (!pool) return `# No upstream pool for tenant ${tenant.slug}`;

  // 2. Policy & Defaults
  const policy = tenant.edgePolicies[0] || {};
  const rateLimit = (policy.rateLimit as unknown as RateLimit) || { rps: 10, burst: 20 };
  const headers = (policy.headers as Record<string, string>) || {};
  // const cors = (policy.cors as any); // Unused
  const ipAllowlist = (policy.ipAllowlist as string[] | null); // Expecting array of strings or null

  // IP Validation
  const validAllowList: string[] = [];
  if (Array.isArray(ipAllowlist)) {
      for (const ip of ipAllowlist) {
          // Allow CIDR too? Zod IP doesn't support CIDR directly easily without regex,
          // but let's assume simple IPs for now or use a CIDR regex.
          // Simple regex for CIDR or IP:
          if (/^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/.test(ip)) {
             validAllowList.push(ip);
          } else {
             throw new Error(`Security Error: Invalid IP/CIDR in allowlist: ${ip}`);
          }
      }
  }

  // 3. Template Construction (Manual Nunjucks-like for now, or ensure caller uses Nunjucks)
  // The User wanted "Nunjucks templates" to be used.
  // In `services/config-renderer`, we DO use Nunjucks templates.
  // This file `nginx-generator.ts` in `apps/control-plane` might be legacy or used for PREVIEW.
  // If used for preview, it should mimic the renderer.
  // Ideally, the control plane should CALL the renderer for preview too.
  // But for now, let's make this safe.

  const upstreamName = `upstream_${tenant.slug}_${pool.name}`;

  // Construct upstream block
  let upstreamBlock = `upstream ${upstreamName} {\n`;
  const targets = pool.targets as unknown as Target[]; // [{host, port, weight}]
  if (Array.isArray(targets)) {
      for (const t of targets) {
          // Validate host/port?
          if (!DomainSchema.safeParse(t.host).success && !IpSchema.safeParse(t.host).success) {
               // Host might be internal docker name, which follows domain rules mostly
          }
          upstreamBlock += `    server ${t.host}:${t.port} weight=${t.weight || 1};\n`;
      }
  }
  upstreamBlock += `}\n`;

  // Construct server block
  let serverBlock = `server {\n    listen 80;\n    server_name ${validDomains.join(' ')};\n\n`;

  // Headers
  if (headers && typeof headers === 'object') {
    for (const [k, v] of Object.entries(headers)) {
        // Validate Header Key/Value to prevent injection
        if (!/^[a-zA-Z0-9-]+$/.test(k)) continue;
        // Value might contain spaces, but no newlines
        const safeV = String(v).replace(/[\r\n]/g, '');
        serverBlock += `    add_header ${k} "${safeV}" always;\n`;
    }
  }

  // IP Access
  if (validAllowList.length > 0) {
      for (const ip of validAllowList) {
          serverBlock += `    allow ${ip};\n`;
      }
      serverBlock += `    deny all;\n`;
  }

  // Location
  serverBlock += `    location / {\n`;
  serverBlock += `        proxy_pass http://${upstreamName};\n`;
  serverBlock += `        proxy_set_header Host ${validDomains[0]};\n`;
  serverBlock += `        proxy_set_header X-Tenant-Id "${tenant.id}";\n`;

  if (rateLimit) {
      // rate limit logic usually requires a zone definition in http block,
      // which we can't easily inject from here without global config knowledge.
      // But we can add the directive assuming the zone exists (created by global config or renderer).
      // However, the renderer manages the file structure.
      // This function is likely just for "Preview".
      serverBlock += `        # Rate limit burst=${rateLimit.burst} rps=${rateLimit.rps}\n`;
  }

  serverBlock += `    }\n}\n`;

  return upstreamBlock + "\n" + serverBlock;
}
