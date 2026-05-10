import { test, expect } from '@playwright/test';

/**
 * Substitution Workflow E2E Tests
 * 
 * Tests the complete substitution workflow including:
 * 1. Marking teacher absent (period-based)
 * 2. Viewing absent teachers list
 * 3. Allocating substitute teacher
 * 4. Changing substitute teacher
 * 5. Verifying coverage status
 */

test.describe('Substitution Workflow', () => {
  let testDate;
  let testDateFormatted;

  test.beforeEach(async ({ page }) => {
    // Set test date to a weekday (Monday)
    testDate = new Date();
    // Find next Monday
    const dayOfWeek = testDate.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    testDate.setDate(testDate.getDate() + daysUntilMonday);
    testDateFormatted = testDate.toISOString().split('T')[0];

    // Login as admin
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Welcome Back!')).toBeVisible();
  });

  test('01 - Should navigate to attendance page', async ({ page }) => {
    // Click on Mark Attendance in navigation
    await page.click('text=Mark Attendance');
    
    // Should be on attendance page
    await expect(page).toHaveURL(/.*attendance/);
    await expect(page.locator('text=Mark Teacher Attendance')).toBeVisible();
  });

  test('02 - Should mark teacher absent for specific periods', async ({ page }) => {
    // Navigate to attendance page
    await page.goto('http://localhost:5173/attendance');
    
    // Select date
    await page.fill('input[type="date"]', testDateFormatted);
    
    // Wait for teacher list to load
    await page.waitForTimeout(1000);
    
    // Find first teacher and click "Mark by Period"
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    
    // Wait for period selection modal
    await expect(page.locator('text=Select Absent Periods')).toBeVisible();
    
    // Select periods 1 and 2
    await page.check('input[type="checkbox"][value="1"]');
    await page.check('input[type="checkbox"][value="2"]');
    
    // Submit
    await page.click('button:has-text("Submit Attendance")');
    
    // Wait for success message
    await expect(page.locator('text=Attendance marked successfully')).toBeVisible({ timeout: 5000 });
  });

  test('03 - Should show absent teacher in substitution page', async ({ page }) => {
    // First mark a teacher absent
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    const teacherName = await firstTeacherCard.locator('h3').textContent();
    
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    // Navigate to substitution page
    await page.click('text=Allocate Substitute');
    await expect(page).toHaveURL(/.*substitution/);
    
    // Select the same date
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Should see the absent teacher
    await expect(page.locator(`text=${teacherName}`)).toBeVisible();
    await expect(page.locator('text=Absent')).toBeVisible();
  });

  test('04 - Should allocate substitute teacher', async ({ page }) => {
    // Mark teacher absent first
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    // Go to substitution page
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Click "Allocate Substitute" button for period 1
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    
    // Should show free teachers list
    await expect(page.locator('text=Select Substitute Teacher')).toBeVisible();
    await expect(page.locator('text=Free Teachers')).toBeVisible();
    
    // Select first free teacher
    await page.locator('button:has-text("Select")').first().click();
    
    // Should show confirmation form
    await expect(page.locator('text=Confirm Substitution Allocation')).toBeVisible();
    await expect(page.locator('text=Any available teacher can substitute')).toBeVisible();
    
    // Confirm allocation
    await page.click('button:has-text("Confirm Allocation")');
    
    // Wait for success message
    await expect(page.locator('text=Successfully allocated')).toBeVisible({ timeout: 5000 });
  });

  test('05 - Should show coverage status after allocation', async ({ page }) => {
    // Mark teacher absent and allocate substitute
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    await page.locator('button:has-text("Select")').first().click();
    await page.click('button:has-text("Confirm Allocation")');
    await page.waitForTimeout(1000);
    
    // Refresh to see updated status
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Should show green coverage badge
    await expect(page.locator('text=✓ Covered by')).toBeVisible();
  });

  test('06 - Should show "Change Substitute" button for covered periods', async ({ page }) => {
    // Mark teacher absent and allocate substitute
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    await page.locator('button:has-text("Select")').first().click();
    await page.click('button:has-text("Confirm Allocation")');
    await page.waitForTimeout(1000);
    
    // Refresh page
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Should see "Change Substitute" button
    await expect(page.locator('button:has-text("Change Substitute")')).toBeVisible();
  });

  test('07 - Should change substitute teacher successfully', async ({ page }) => {
    // Mark teacher absent and allocate substitute
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    const firstSubstituteName = await page.locator('button:has-text("Select")').first().locator('..').locator('h4').textContent();
    await page.locator('button:has-text("Select")').first().click();
    await page.click('button:has-text("Confirm Allocation")');
    await page.waitForTimeout(1000);
    
    // Refresh and click "Change Substitute"
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Change Substitute")');
    
    // Should show free teachers list again
    await expect(page.locator('text=Select Substitute Teacher')).toBeVisible();
    
    // Select a different teacher (second one)
    const secondSubstituteButton = page.locator('button:has-text("Select")').nth(1);
    await secondSubstituteButton.click();
    
    // Should show confirmation form with "Change" header
    await expect(page.locator('text=Change Substitute Teacher')).toBeVisible();
    
    // Confirm change
    await page.click('button:has-text("Confirm Change")');
    
    // Wait for success message
    await expect(page.locator('text=Successfully changed substitute')).toBeVisible({ timeout: 5000 });
  });

  test('08 - Should show updated substitute after change', async ({ page }) => {
    // Complete workflow: mark absent, allocate, change
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Allocate first substitute
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    await page.locator('button:has-text("Select")').first().click();
    await page.click('button:has-text("Confirm Allocation")');
    await page.waitForTimeout(1000);
    
    // Change to second substitute
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("Change Substitute")');
    const newSubstituteName = await page.locator('button:has-text("Select")').nth(1).locator('..').locator('h4').textContent();
    await page.locator('button:has-text("Select")').nth(1).click();
    await page.click('button:has-text("Confirm Change")');
    await page.waitForTimeout(1000);
    
    // Refresh and verify new substitute is shown
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Should show the new substitute's name
    await expect(page.locator(`text=✓ Covered by ${newSubstituteName}`)).toBeVisible();
  });

  test('09 - Should handle multiple period allocations', async ({ page }) => {
    // Mark teacher absent for periods 1 and 2
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.check('input[type="checkbox"][value="2"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    // Go to substitution page
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    // Should see two "Allocate Substitute" buttons (one for each period)
    const allocateButtons = page.locator('button:has-text("Allocate Substitute")');
    await expect(allocateButtons).toHaveCount(2);
    
    // Allocate substitute for period 1
    await allocateButtons.first().click();
    await page.locator('button:has-text("Select")').first().click();
    await page.click('button:has-text("Confirm Allocation")');
    await page.waitForTimeout(1000);
    
    // Refresh and allocate for period 2
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    await page.locator('button:has-text("Select")').first().click();
    await page.click('button:has-text("Confirm Allocation")');
    await page.waitForTimeout(1000);
    
    // Refresh and verify both periods are covered
    await page.reload();
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const coveredBadges = page.locator('text=✓ Covered by');
    await expect(coveredBadges).toHaveCount(2);
  });

  test('10 - Should show informational message about subject flexibility', async ({ page }) => {
    // Mark teacher absent
    await page.goto('http://localhost:5173/attendance');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    const firstTeacherCard = page.locator('.teacher-card').first();
    await firstTeacherCard.locator('text=Mark by Period').click();
    await page.check('input[type="checkbox"][value="1"]');
    await page.click('button:has-text("Submit Attendance")');
    await page.waitForTimeout(1000);
    
    // Go to substitution and start allocation
    await page.goto('http://localhost:5173/substitution');
    await page.fill('input[type="date"]', testDateFormatted);
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Allocate Substitute")').first().click();
    await page.locator('button:has-text("Select")').first().click();
    
    // Should see green informational message
    await expect(page.locator('text=Any available teacher can substitute')).toBeVisible();
    await expect(page.locator('text=Subject expertise is not required')).toBeVisible();
    
    // Message should have green background (not yellow warning)
    const infoBox = page.locator('text=Any available teacher can substitute').locator('..');
    const backgroundColor = await infoBox.evaluate(el => window.getComputedStyle(el).backgroundColor);
    
    // Should be greenish (rgb values with more green than red/blue)
    expect(backgroundColor).toContain('232, 245, 233'); // #e8f5e9
  });

  test('11 - Should navigate using breadcrumbs', async ({ page }) => {
    // Go to substitution page
    await page.goto('http://localhost:5173/substitution');
    
    // Should see breadcrumbs
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Allocate Substitute')).toBeVisible();
    
    // Click Dashboard in breadcrumbs
    await page.locator('nav').locator('text=Dashboard').click();
    
    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('12 - Should use global navigation to switch between pages', async ({ page }) => {
    // Start on dashboard
    await page.goto('http://localhost:5173/dashboard');
    
    // Navigate to attendance using global nav
    await page.locator('nav').locator('text=Mark Attendance').click();
    await expect(page).toHaveURL(/.*attendance/);
    
    // Navigate to substitution using global nav
    await page.locator('nav').locator('text=Allocate Substitute').click();
    await expect(page).toHaveURL(/.*substitution/);
    
    // Navigate back to dashboard using global nav
    await page.locator('nav').locator('text=Dashboard').click();
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
