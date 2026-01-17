import { Tenant, Domain, EdgePolicy, Certificate } from '@prisma/client';

type TenantWithRelations = Tenant & {
  domains: (Domain & { certificate: Certificate | null })[];
  policy: EdgePolicy | null;
};

export function generateNginxConfig(tenant: TenantWithRelations): string {
  const primaryDomain = tenant.domains[0]?.hostname;
  if (!primaryDomain) {
    return `# No domains configured for tenant ${tenant.slug}`;
  }

  const serverNames = tenant.domains.map(d => d.hostname).join(' ');
  const policy = tenant.policy;

  // Defaults
  const rateLimitRps = policy?.rateLimitRps || 10;
  const rateLimitBurst = policy?.rateLimitBurst || 20;

  // Header Policies
  const addHeaders = [];
  if (policy?.enableHsts) {
    addHeaders.push('add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;');
  }
  if (policy?.enableXFrame) {
    addHeaders.push('add_header X-Frame-Options "SAMEORIGIN" always;');
  }
  if (policy?.enableXContent) {
    addHeaders.push('add_header X-Content-Type-Options "nosniff" always;');
  }
  if (policy?.enableCsp) {
    addHeaders.push('add_header Content-Security-Policy "default-src \'self\';" always;');
  }

  // IP Access Control
  let accessControl = '';
  if (policy?.ipAllowList) {
    // Assuming simple comma separated for now
    const ips = policy.ipAllowList.split(',').map(ip => ip.trim());
    accessControl += ips.map(ip => `allow ${ip};`).join('\n  ');
    accessControl += '\n  deny all;';
  } else if (policy?.ipDenyList) {
    const ips = policy.ipDenyList.split(',').map(ip => ip.trim());
    accessControl += ips.map(ip => `deny ${ip};`).join('\n  ');
  }

  const config = `
# Tenant: ${tenant.name} (${tenant.id})
# Slug: ${tenant.slug}
# Generated at: ${new Date().toISOString()}

limit_req_zone $binary_remote_addr zone=tenant_${tenant.slug}_limit:10m rate=${rateLimitRps}r/s;

upstream tenant_${tenant.slug}_upstream {
    # In a real scenario, this would be dynamic or configured per tenant
    # For this control plane, we assume a default upstream or placeholder
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    listen [::]:80;
    server_name ${serverNames};

    # ACME Challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
// Assuming "primaryDomain" is a validated, trusted domain string used elsewhere in the config,
// and that you have validated it previously in your code.
// If not, you should validate it like:
// if (!/^[a-zA-Z0-9.-]+$/.test(primaryDomain)) { throw new Error("Invalid domain"); }

return 301 https://${primaryDomain}$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${serverNames};

    # SSL Certificates (managed by Certbot / internal logic)
    # ssl_certificate /etc/letsencrypt/live/${primaryDomain}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${primaryDomain}/privkey.pem;

    # SSL Hardening
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Inject Tenant ID
    proxy_set_header X-Tenant-Id "${tenant.id}";
    proxy_set_header X-Tenant-Slug "${tenant.slug}";

    # Proxy Headers
// FIX: Use a fixed, validated domain instead of $host to prevent host header injection.
// Replace 'example.com' with your intended primary domain variable or hardcoded value.
// If your system dynamically supports more domains, use a whitelist check before filling this value.
proxy_set_header Host ${primaryDomain};
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Rate Limiting
    limit_req zone=tenant_${tenant.slug}_limit burst=${rateLimitBurst} nodelay;

    # Edge Policies
    ${addHeaders.join('\n    ')}

    # Access Control
    ${accessControl ? accessControl : '# No IP restrictions'}

    location / {
        proxy_pass http://tenant_${tenant.slug}_upstream;
        proxy_read_timeout 60s;
        proxy_connect_timeout 5s;
    }
}
`;

  return config.trim();
}
