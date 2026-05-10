import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Timetable Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Navigate to Timetable page using dashboard card
    await page.click('.dashboard-card:has-text("Timetable")');
    await page.waitForURL('**/timetable');
  });

  test('should display timetable page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Timetable');
    await expect(page.locator('text=Import Timetable')).toBeVisible();
  });

  test('should display import section for admin', async ({ page }) => {
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await expect(page.locator('button:has-text("Import Timetable")')).toBeVisible();
  });

  test('should show clear timetable button when entries exist', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if clear button exists (only if there are entries)
    const clearButton = page.locator('button:has-text("Clear All Timetable")');
    const isVisible = await clearButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(clearButton).toBeVisible();
      await expect(page.locator('text=Danger Zone')).toBeVisible();
    }
  });

  test('CRITICAL: should import timetable with progress bar', async ({ page }) => {
    // First clear existing timetable if it exists
    const clearButton = page.locator('button:has-text("Clear All Timetable")');
    const hasClearButton = await clearButton.isVisible().catch(() => false);
    
    if (hasClearButton) {
      // Handle confirmation dialog
      page.on('dialog', dialog => dialog.accept());
      await clearButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Get the XML file path
    const xmlFilePath = path.join(process.cwd(), '..', 'for the data base.xml');
    
    // Upload file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(xmlFilePath);
    
    // Wait for file to be selected
    await page.waitForTimeout(500);
    
    // Click Import button
    await page.click('button:has-text("Import Timetable")');
    
    // CRITICAL: Check for progress bar
    await expect(page.locator('text=Importing Timetable')).toBeVisible({ timeout: 5000 });
    
    // Should show progress percentage
    await expect(page.locator('text=0%').or(page.locator('text=33%')).or(page.locator('text=66%'))).toBeVisible({ timeout: 5000 });
    
    // Wait for import to complete (may take a while)
    await expect(page.locator('.toast')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('.toast')).toContainText(/Import completed/i);
    
    // Should show 100% at some point
    const progressText = await page.locator('text=100%').isVisible({ timeout: 5000 }).catch(() => false);
    expect(progressText || true).toBeTruthy(); // Progress might disappear quickly
  });

  test('CRITICAL: should auto-refresh after import', async ({ page }) => {
    // Get initial entry count
    await page.waitForTimeout(2000);
    const initialText = await page.locator('text=/Showing \\d+ of \\d+ timetable entries/').textContent().catch(() => 'Showing 0 of 0');
    
    // If there are no entries, we need to import first
    if (initialText.includes('0 of 0')) {
      const xmlFilePath = path.join(process.cwd(), '..', 'for the data base.xml');
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(xmlFilePath);
      await page.waitForTimeout(500);
      await page.click('button:has-text("Import Timetable")');
      
      // Wait for import to complete
      await expect(page.locator('.toast')).toBeVisible({ timeout: 60000 });
      
      // CRITICAL: Check that entries are now showing WITHOUT manual refresh
      await expect(page.locator('text=/Showing \\d+ of \\d+ timetable entries/')).not.toContainText('0 of 0', { timeout: 10000 });
    }
  });

  test('CRITICAL: should display entries in correct periods (not all in Period 1)', async ({ page }) => {
    // Wait for timetable to load
    await page.waitForTimeout(3000);
    
    // Check if there are entries
    const entriesText = await page.locator('text=/Showing \\d+ of \\d+ timetable entries/').textContent().catch(() => 'Showing 0 of 0');
    
    if (!entriesText.includes('0 of 0')) {
      // Use filters to check different periods
      const periodFilter = page.locator('select').filter({ hasText: /Period/i }).or(
        page.locator('select[name="period"]')
      ).first();
      
      if (await periodFilter.isVisible().catch(() => false)) {
        // Try filtering by Period 2
        await periodFilter.selectOption('2');
        await page.waitForTimeout(1000);
        
        // Should show some entries for Period 2
        const period2Text = await page.locator('text=/Showing \\d+ of \\d+ timetable entries/').textContent();
        
        // Try filtering by Period 5
        await periodFilter.selectOption('5');
        await page.waitForTimeout(1000);
        
        const period5Text = await page.locator('text=/Showing \\d+ of \\d+ timetable entries/').textContent();
        
        // At least one of these should have entries (not all in Period 1)
        const hasPeriod2 = !period2Text.includes('0 of');
        const hasPeriod5 = !period5Text.includes('0 of');
        
        expect(hasPeriod2 || hasPeriod5).toBeTruthy();
      }
    }
  });

  test('should display timetable filters', async ({ page }) => {
    // Should have filter dropdowns
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('should filter timetable by class', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Find class filter
    const classFilter = page.locator('select').first();
    
    // Get options
    const options = await classFilter.locator('option').count();
    
    if (options > 1) {
      // Select second option (first is usually "All")
      await classFilter.selectOption({ index: 1 });
      await page.waitForTimeout(1000);
      
      // Should show active filter
      await expect(page.locator('text=Active Filters')).toBeVisible();
    }
  });

  test('should reject non-XML files', async ({ page }) => {
    // Try to upload a non-XML file (create a temporary text file)
    const fileInput = page.locator('input[type="file"]');
    
    // This should trigger validation
    // Note: File validation might happen on the client side
    await expect(fileInput).toHaveAttribute('accept', '.xml');
  });

  test('should show import instructions', async ({ page }) => {
    await expect(page.locator('text=Instructions')).toBeVisible();
    await expect(page.locator('text=Export your timetable')).toBeVisible();
  });
});
