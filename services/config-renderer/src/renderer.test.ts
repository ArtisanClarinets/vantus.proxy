import { describe, it, expect } from 'vitest';
import nunjucks from 'nunjucks';

describe('Nginx Renderer', () => {
    it('should render tenant config', () => {
        const env = nunjucks.configure({ autoescape: false });
        const template = `server { server_name {{ domain }}; }`;
        const res = env.renderString(template, { domain: 'example.com' });
        expect(res).toContain('server_name example.com;');
    });
});
