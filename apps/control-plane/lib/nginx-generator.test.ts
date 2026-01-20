import { describe, it, expect } from 'vitest';
import { generateNginxConfig } from './nginx-generator';

describe('nginx-generator', () => {
    const mockTenant = {
        id: 'clv123',
        slug: 'test-tenant',
        name: 'Test Tenant',
        createdAt: new Date(),
        updatedAt: new Date(),
        domains: [{ id: 'd1', name: 'example.com', tenantId: 'clv123', createdAt: new Date(), updatedAt: new Date() }],
        upstreamPools: [{ id: 'p1', name: 'main', targets: [{ host: '127.0.0.1', port: 8080 }], tenantId: 'clv123', createdAt: new Date(), updatedAt: new Date() }],
        edgePolicies: [{ id: 'ep1', tenantId: 'clv123', headers: { 'X-Test': 'Value' }, rateLimit: { rps: 10, burst: 20 }, ipAllowlist: ['1.1.1.1'], createdAt: new Date(), updatedAt: new Date(), cors: null }]
    } as any;

    it('should generate a valid server block', () => {
        const config = generateNginxConfig(mockTenant);
        expect(config).toContain('server {');
        expect(config).toContain('server_name example.com');
        expect(config).toContain('proxy_pass http://upstream_test-tenant_main');
    });

    it('should include headers', () => {
        const config = generateNginxConfig(mockTenant);
        expect(config).toContain('add_header X-Test "Value" always');
    });

    it('should handle IP allowlist', () => {
        const config = generateNginxConfig(mockTenant);
        expect(config).toContain('allow 1.1.1.1');
        expect(config).toContain('deny all');
    });

    it('should throw error for invalid slug', () => {
        const invalidTenant = { ...mockTenant, slug: 'invalid_slug' };
        expect(() => generateNginxConfig(invalidTenant)).toThrow('Security Error');
    });
});
