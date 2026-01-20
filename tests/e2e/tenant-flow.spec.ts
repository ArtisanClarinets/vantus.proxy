import { test, expect } from '@playwright/test';

test('login and create tenant', async ({ page }) => {
    // Navigate to login
    await page.goto('/auth/login');
    
    // Fill credentials
    await page.fill('input[placeholder="Email"]', 'admin@vantus.systems');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    
    // Should be on dashboard
    await expect(page).toHaveURL(/\/app\/dashboard/);
    
    // Go to tenants list
    await page.goto('/app/tenants');
    
    // Click create button
    await page.click('a:has-text("Create Tenant")');
    
    // Fill tenant form
    const tenantName = 'E2E Tenant ' + Date.now();
    const tenantSlug = 'e2e-tenant-' + Date.now();
    
    await page.fill('input[name="name"]', tenantName);
    await page.fill('input[name="slug"]', tenantSlug);
    await page.click('button:has-text("Create Tenant")');
    
    // Should redirect to overview
    await expect(page).toHaveURL(new RegExp(`/app/tenants/.*`));
    await expect(page.locator('h1')).toContainText('Settings'); // Redirected to overview which might have different header
    // Wait, the action redirected to /app/tenants/${tenant.id}/overview
});
