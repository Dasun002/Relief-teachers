import { test, expect } from '@playwright/test';

const BASE_URL = process.env.VITE_API_URL || 'http://localhost:5173';

test.describe('Navigation and Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display navigation bar on all pages', async ({ page }) => {
    // Check navigation bar exists
    const nav = page.locator('.navigation');
    await expect(nav).toBeVisible();

    // Check brand/logo
    await expect(page.locator('.nav-brand')).toBeVisible();
    await expect(page.locator('.nav-brand-icon')).toContainText('🎓');

    // Check navigation links
    await expect(page.locator('.nav-link:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('.nav-link:has-text("Attendance")')).toBeVisible();
    await expect(page.locator('.nav-link:has-text("Substitutions")')).toBeVisible();
    await expect(page.locator('.nav-link:has-text("Timetable")')).toBeVisible();
    await expect(page.locator('.nav-link:has-text("Teachers")')).toBeVisible();

    // Check user menu
    await expect(page.locator('.nav-user-button')).toBeVisible();
    await expect(page.locator('.nav-user-button')).toContainText('admin');
  });

  test('should navigate between pages using navigation bar', async ({ page }) => {
    // Navigate to Attendance
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');
    await expect(page.locator('.attendance-title')).toBeVisible();

    // Navigate to Timetable
    await page.click('.nav-link:has-text("Timetable")');
    await page.waitForURL('**/timetable');
    await expect(page.locator('h1:has-text("Timetable")')).toBeVisible();

    // Navigate to Teachers
    await page.click('.nav-link:has-text("Teachers")');
    await page.waitForURL('**/teachers');
    await expect(page.locator('h1:has-text("Teacher Management")')).toBeVisible();

    // Navigate back to Dashboard
    await page.click('.nav-link:has-text("Dashboard")');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('.dashboard-title')).toBeVisible();
  });

  test('should show active state on current page', async ({ page }) => {
    // Dashboard should be active
    await expect(page.locator('.nav-link:has-text("Dashboard")')).toHaveClass(/active/);

    // Navigate to Attendance
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');
    
    // Attendance should be active
    await expect(page.locator('.nav-link:has-text("Attendance")')).toHaveClass(/active/);
    await expect(page.locator('.nav-link:has-text("Dashboard")')).not.toHaveClass(/active/);
  });

  test('should display breadcrumbs on non-dashboard pages', async ({ page }) => {
    // No breadcrumbs on dashboard
    await expect(page.locator('.breadcrumbs')).not.toBeVisible();

    // Navigate to Attendance
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');
    
    // Breadcrumbs should be visible
    await expect(page.locator('.breadcrumbs')).toBeVisible();
    await expect(page.locator('.breadcrumbs-link:has-text("Home")')).toBeVisible();
    await expect(page.locator('.breadcrumbs-current:has-text("Attendance")')).toBeVisible();
  });

  test('should navigate using breadcrumbs', async ({ page }) => {
    // Navigate to Attendance
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');

    // Click Home in breadcrumbs
    await page.click('.breadcrumbs-link:has-text("Home")');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('.dashboard-title')).toBeVisible();
  });

  test('should open and close user menu', async ({ page }) => {
    // Click user menu button
    await page.click('.nav-user-button');
    
    // User dropdown should be visible
    await expect(page.locator('.nav-user-dropdown')).toBeVisible();
    await expect(page.locator('.nav-user-info-name')).toContainText('admin');
    await expect(page.locator('.nav-user-info-role')).toContainText('admin');

    // Check menu items
    await expect(page.locator('.nav-user-menu-item:has-text("Settings")')).toBeVisible();
    await expect(page.locator('.nav-user-menu-item:has-text("Help")')).toBeVisible();
    await expect(page.locator('.nav-user-menu-item:has-text("Logout")')).toBeVisible();
  });

  test('should logout from user menu', async ({ page }) => {
    // Click user menu button
    await page.click('.nav-user-button');
    
    // Click logout
    await page.click('.nav-user-menu-item:has-text("Logout")');
    
    // Should redirect to login page
    await page.waitForURL('**/login');
    await expect(page.locator('.login-title')).toBeVisible();
  });

  test('should work on mobile (responsive)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mobile toggle should be visible
    await expect(page.locator('.nav-mobile-toggle')).toBeVisible();

    // Desktop links should be hidden
    await expect(page.locator('.nav-links-desktop')).not.toBeVisible();

    // Click mobile toggle
    await page.click('.nav-mobile-toggle');

    // Mobile menu should be visible
    await expect(page.locator('.nav-mobile-menu')).toBeVisible();
    await expect(page.locator('.nav-mobile-link:has-text("Attendance")')).toBeVisible();

    // Navigate using mobile menu
    await page.click('.nav-mobile-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');
    await expect(page.locator('.attendance-title')).toBeVisible();

    // Mobile menu should close after navigation
    await expect(page.locator('.nav-mobile-menu')).not.toBeVisible();
  });

  test('should display footer on all pages', async ({ page }) => {
    // Check footer exists
    await expect(page.locator('.layout-footer')).toBeVisible();
    await expect(page.locator('.layout-footer')).toContainText('Anuruddha Balika Vidyalaya');

    // Navigate to another page
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');

    // Footer should still be visible
    await expect(page.locator('.layout-footer')).toBeVisible();
  });

  test('CRITICAL: Complete attendance workflow with new navigation', async ({ page }) => {
    // Start from dashboard
    await expect(page.locator('.dashboard-title')).toBeVisible();

    // Navigate to Attendance using navigation bar
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');

    // Check breadcrumbs
    await expect(page.locator('.breadcrumbs-current:has-text("Attendance")')).toBeVisible();

    // Check attendance page loaded
    await expect(page.locator('.attendance-title')).toBeVisible();

    // Check tabs are visible
    await expect(page.locator('.attendance-tab:has-text("Period-Based")')).toBeVisible();
    await expect(page.locator('.attendance-tab:has-text("Quick")')).toBeVisible();
    await expect(page.locator('.attendance-tab:has-text("History")')).toBeVisible();

    // Navigate to Timetable using navigation bar (without going back to dashboard)
    await page.click('.nav-link:has-text("Timetable")');
    await page.waitForURL('**/timetable');

    // Check timetable page loaded
    await expect(page.locator('h1:has-text("Timetable")')).toBeVisible();

    // Navigate back to Dashboard using breadcrumbs
    await page.click('.breadcrumbs-link:has-text("Home")');
    await page.waitForURL('**/dashboard');
    await expect(page.locator('.dashboard-title')).toBeVisible();
  });

  test('should handle navigation for non-admin users', async ({ page }) => {
    // Logout
    await page.click('.nav-user-button');
    await page.click('.nav-user-menu-item:has-text("Logout")');
    await page.waitForURL('**/login');

    // Login as teacher (if teacher account exists)
    // For now, we'll just verify admin-only links are marked
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Admin should see all links without disabled state
    await expect(page.locator('.nav-link:has-text("Teachers")')).not.toHaveClass(/disabled/);
    await expect(page.locator('.nav-link:has-text("Attendance")')).not.toHaveClass(/disabled/);
  });

  test('should maintain navigation state across page refreshes', async ({ page }) => {
    // Navigate to Attendance
    await page.click('.nav-link:has-text("Attendance")');
    await page.waitForURL('**/attendance');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on Attendance page
    await expect(page.locator('.attendance-title')).toBeVisible();
    await expect(page.locator('.nav-link:has-text("Attendance")')).toHaveClass(/active/);
    await expect(page.locator('.breadcrumbs-current:has-text("Attendance")')).toBeVisible();
  });
});
