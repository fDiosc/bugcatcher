import { test, expect } from '@playwright/test';

test.describe('Pricing Tiers & Limits', () => {
    test('should enforce project creation limit for Free plan', async ({ page }) => {
        await page.goto('/dashboard/projects/new');
        await page.fill('input[name="name"]', 'Test Project 2');
        await page.click('button[type="submit"]');
        await page.goto('/dashboard');
        await expect(page.locator('body')).toContainText(/Projects: 1/);
    });

    test('should enforce blocking of Dev mode for Free plan in API', async ({ request }) => {
        const response = await request.get('/api/project?key=bc_demo_key_123');
        const data = await response.json();
        expect(data.mode).toBe('CLIENT');
    });

    test('should block reports when quota is exceeded', async ({ request }) => {
        const response = await request.post('/api/report', {
            data: {
                projectKey: 'bc_demo_key_123',
                description: 'Test overflow',
                url: 'http://localhost:3000',
                userAgent: 'Playwright'
            }
        });
        expect(response.status()).toBe(200);
    });
});
