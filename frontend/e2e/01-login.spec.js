import { test, expect } from '@playwright/test';

test.describe('Login Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Teacher Attendance System');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'wronguser');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Wait for error toast
    await expect(page.locator('.toast')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.toast')).toContainText(/Invalid credentials|Login failed/i);
  });

  test('should login successfully with admin credentials', async ({ page }) => {
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify dashboard is loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('.dashboard-card-title:has-text("Teachers")')).toBeVisible();
    await expect(page.locator('.dashboard-card-title:has-text("Attendance")')).toBeVisible();
  });

  test('should persist login after page reload', async ({ page }) => {
    // Login
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Logout
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Teacher Attendance System');
  });
});
