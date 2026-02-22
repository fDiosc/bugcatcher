import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load the landing page', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/BugCatcher/);
        await expect(page.getByRole('heading', { level: 1, name: /YOUR QA WITHOUT A QA TEAM/i })).toBeVisible();
    });

    test('should navigate to dashboard from hero CTA', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Start free', exact: true }).first().click();
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
