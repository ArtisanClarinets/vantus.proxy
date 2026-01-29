import { describe, it, expect } from 'vitest';
import nunjucks from 'nunjucks';
import path from 'path';

describe('Nginx Renderer', () => {
    // Path relative to this test file (services/config-renderer/src/renderer.test.ts)
    // to infra/nginx/templates
    // src -> config-renderer -> services -> root
    const templateDir = path.resolve(__dirname, '../../../infra/nginx/templates');

    const env = nunjucks.configure(templateDir, {
        autoescape: false,
        trimBlocks: true,
        lstripBlocks: true
    });

    it('should render basic tenant config', () => {
        const context = {
            domain: 'example.com',
            upstreamName: 'upstream_test_123',
            upstreamTargets: [{ host: '10.0.0.1', port: 8080, weight: 1 }],
            tenantId: 'cust_123',
            edgePolicy: {}
        };
        const res = env.render('tenant.server.conf.njk', context);

        expect(res).toContain('server_name example.com;');
        expect(res).toContain('upstream upstream_test_123');
        expect(res).toContain('server 10.0.0.1:8080 weight=1;');
        expect(res).toContain('proxy_set_header X-Tenant-Id "cust_123";');
    });

    it('should render multiple upstream targets', () => {
        const context = {
            domain: 'example.com',
            upstreamName: 'upstream_lb',
            upstreamTargets: [
                { host: '10.0.0.1', port: 80, weight: 5 },
                { host: '10.0.0.2', port: 80, weight: 1 }
            ],
            tenantId: 'cust_lb',
            edgePolicy: {}
        };
        const res = env.render('tenant.server.conf.njk', context);

        expect(res).toContain('server 10.0.0.1:80 weight=5;');
        expect(res).toContain('server 10.0.0.2:80 weight=1;');
    });

    it('should render custom security headers', () => {
        const context = {
            domain: 'secure.com',
            upstreamName: 'upstream_sec',
            upstreamTargets: [{ host: '127.0.0.1', port: 3000, weight: 1 }],
            tenantId: 'cust_sec',
            edgePolicy: {
                headers: {
                    'X-Frame-Options': 'DENY',
                    'Content-Security-Policy': "default-src 'self'"
                }
            }
        };
        const res = env.render('tenant.server.conf.njk', context);

        expect(res).toContain('add_header X-Frame-Options "DENY" always;');
        expect(res).toContain('add_header Content-Security-Policy "default-src \'self\'" always;');
    });
});
