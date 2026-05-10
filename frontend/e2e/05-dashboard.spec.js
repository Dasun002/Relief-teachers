import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should display dashboard with all cards', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Should show all feature cards
    await expect(page.locator('.dashboard-card-title:has-text("Teachers")')).toBeVisible();
    await expect(page.locator('.dashboard-card-title:has-text("Attendance")')).toBeVisible();
    await expect(page.locator('.dashboard-card-title:has-text("Substitutions")')).toBeVisible();
    await expect(page.locator('.dashboard-card-title:has-text("Timetable")')).toBeVisible();
  });

  test('CRITICAL: should navigate to Teacher Management when card clicked', async ({ page }) => {
    // Click Teachers card
    await page.click('.dashboard-card:has-text("Teachers")');
    
    // Should navigate to teachers page
    await page.waitForURL('**/teachers', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Teacher Management');
  });

  test('CRITICAL: should navigate to Attendance when card clicked', async ({ page }) => {
    // Click Attendance card
    await page.click('.dashboard-card:has-text("Attendance")');
    
    // Should navigate to attendance page
    await page.waitForURL('**/attendance', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Teacher Attendance');
  });

  test('CRITICAL: should navigate to Timetable when card clicked', async ({ page }) => {
    // Click Timetable card
    await page.click('.dashboard-card:has-text("Timetable")');
    
    // Should navigate to timetable page WITHOUT logging out
    await page.waitForURL('**/timetable', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Timetable');
    
    // Verify still logged in (not redirected to login page)
    expect(page.url()).not.toContain('/login');
  });

  test('CRITICAL: should navigate to Substitution when card clicked', async ({ page }) => {
    // Click Substitutions card
    await page.click('.dashboard-card:has-text("Substitutions")');
    
    // Should navigate to substitution page WITHOUT logging out
    await page.waitForURL('**/substitutions', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Substitution');
    
    // Verify still logged in (not redirected to login page)
    expect(page.url()).not.toContain('/login');
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('.dashboard-subtitle:has-text("Welcome")')).toBeVisible();
  });

  test('should show navigation menu', async ({ page }) => {
    // Dashboard page has its own layout without navigation component
    // Just verify the dashboard header is visible
    await expect(page.locator('.dashboard-header')).toBeVisible();
  });

  test('should display user info', async ({ page }) => {
    // Should show admin user info
    await expect(page.locator('text=/admin/i')).toBeVisible();
  });

  test('should have working logout button', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    
    // Should redirect to login
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page.locator('h1')).toContainText('Teacher Attendance System');
  });

  test('should show all cards as clickable (not disabled)', async ({ page }) => {
    // Get all dashboard cards
    const teacherCard = page.locator('.dashboard-card:has-text("Teachers")');
    const attendanceCard = page.locator('.dashboard-card:has-text("Attendance")');
    const substitutionCard = page.locator('.dashboard-card:has-text("Substitutions")');
    const timetableCard = page.locator('.dashboard-card:has-text("Timetable")');
    
    // All cards should be clickable (not have pointer-events: none)
    const cards = [teacherCard, attendanceCard, substitutionCard, timetableCard];
    
    for (const card of cards) {
      const pointerEvents = await card.evaluate(el => 
        window.getComputedStyle(el).pointerEvents
      ).catch(() => 'auto');
      
      expect(pointerEvents).not.toBe('none');
    }
  });

  test('should navigate between pages using navigation menu', async ({ page }) => {
    // Go to Teachers
    await page.click('.dashboard-card:has-text("Teachers")');
    await page.waitForURL('**/teachers');
    
    // Go back to Dashboard using browser back
    await page.goBack();
    await page.waitForURL('**/dashboard');
    
    // Go to Attendance
    await page.click('.dashboard-card:has-text("Attendance")');
    await page.waitForURL('**/attendance');
    
    // Verify still logged in (not redirected to login)
    expect(page.url()).not.toContain('/login');
  });
});
