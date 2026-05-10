import { test, expect } from '@playwright/test';

test.describe('Attendance Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to Attendance page using dashboard card
    await page.click('.dashboard-card:has-text("Attendance")');
    await page.waitForURL('**/attendance');
  });

  test('should display attendance page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Teacher Attendance');
    await expect(page.locator('text=Record Attendance')).toBeVisible();
    await expect(page.locator('text=View History')).toBeVisible();
  });

  test('should display date picker', async ({ page }) => {
    await expect(page.locator('input[type="date"]')).toBeVisible();
  });

  test('should load teachers list', async ({ page }) => {
    // Wait for teachers to load
    await page.waitForSelector('text=Present', { timeout: 10000 });
    
    // Should have Present/Absent buttons
    const presentButtons = await page.locator('button:has-text("Present")').count();
    const absentButtons = await page.locator('button:has-text("Absent")').count();
    
    expect(presentButtons).toBeGreaterThan(0);
    expect(absentButtons).toBeGreaterThan(0);
  });

  test('should mark teacher as absent', async ({ page }) => {
    // Wait for teachers to load
    await page.waitForSelector('button:has-text("Absent")', { timeout: 10000 });
    
    // Click first Absent button
    await page.locator('button:has-text("Absent")').first().click();
    
    // Wait a bit for state update
    await page.waitForTimeout(500);
    
    // The button should now be highlighted (check for active state)
    const firstAbsentButton = page.locator('button:has-text("Absent")').first();
    const backgroundColor = await firstAbsentButton.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should have red background (rgb(220, 53, 69) is #dc3545)
    expect(backgroundColor).toContain('220');
  });

  test('CRITICAL: should submit attendance successfully', async ({ page }) => {
    // Wait for teachers to load
    await page.waitForSelector('button:has-text("Submit Attendance")', { timeout: 10000 });
    
    // Mark some teachers as absent
    const absentButtons = page.locator('button:has-text("Absent")');
    const count = await absentButtons.count();
    
    if (count > 0) {
      await absentButtons.first().click();
      await page.waitForTimeout(300);
    }
    
    // Click Submit Attendance button
    await page.click('button:has-text("Submit Attendance")');
    
    // Wait for success toast
    await expect(page.locator('.toast')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.toast')).toContainText(/Attendance recorded/i);
    
    // Toast should be success (green)
    const toast = page.locator('.toast').first();
    const toastClass = await toast.getAttribute('class');
    expect(toastClass).toContain('success');
  });

  test('should display attendance summary', async ({ page }) => {
    // Wait for teachers to load
    await page.waitForSelector('text=Present:', { timeout: 10000 });
    
    // Should show summary
    await expect(page.locator('text=Present:')).toBeVisible();
    await expect(page.locator('text=Absent:')).toBeVisible();
    await expect(page.locator('text=Total:')).toBeVisible();
  });

  test('should switch to history tab', async ({ page }) => {
    await page.click('text=View History');
    
    // Should show history filters
    await expect(page.locator('text=Attendance History')).toBeVisible();
    await expect(page.locator('select')).toBeVisible(); // Teacher dropdown
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
  });

  test('should validate history search', async ({ page }) => {
    await page.click('text=View History');
    
    // Try to search without selecting teacher
    await page.click('button:has-text("Search")');
    
    // Should show error toast
    await expect(page.locator('.toast')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.toast')).toContainText(/Please select a teacher/i);
  });

  test('should set default date range', async ({ page }) => {
    await page.click('text=View History');
    
    // Click "Last 30 Days" button
    await page.click('button:has-text("Last 30 Days")');
    
    // Date inputs should be filled
    const startDate = await page.locator('input[type="date"]').first().inputValue();
    const endDate = await page.locator('input[type="date"]').last().inputValue();
    
    expect(startDate).toBeTruthy();
    expect(endDate).toBeTruthy();
  });
});
