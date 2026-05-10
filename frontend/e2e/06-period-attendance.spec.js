import { test, expect } from '@playwright/test';

/**
 * Period-Based Attendance E2E Tests
 * 
 * Tests the complete workflow of:
 * 1. Marking teachers absent for specific periods
 * 2. Loading available substitute teachers
 * 3. Allocating substitutes per period
 * 4. Saving period-based attendance
 */

// Test data - use a weekday date
const TEST_DATE = '2026-05-12'; // Monday
const WEEKEND_DATE = '2026-05-09'; // Saturday

test.describe('Period-Based Attendance System', () => {
  
  // Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to home (will redirect to login if not authenticated)
    await page.goto('/');
    
    // Fill in credentials using correct selectors
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to attendance page
    await page.click('.dashboard-card:has-text("Attendance")');
    await page.waitForURL('**/attendance', { timeout: 10000 });
  });

  test('should display period-based attendance tab', async ({ page }) => {
    // Check that the period-based attendance tab exists
    const periodTab = page.locator('button:has-text("Period-Based Attendance")');
    await expect(periodTab).toBeVisible();
    
    // Check that it's active by default
    await expect(periodTab).toHaveClass(/active/);
  });

  test('should show teacher selection after selecting date', async ({ page }) => {
    // Period-based attendance tab should be active by default
    
    // Set date to a weekday
    await page.fill('input[type="date"]', TEST_DATE);
    
    // Wait for teachers to load
    await page.waitForTimeout(2000);
    
    // Check that teacher selection is visible
    const teacherSelection = page.locator('text=Select Teacher:');
    await expect(teacherSelection).toBeVisible();
    
    // Check that teacher cards are displayed
    const teacherCards = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ });
    const count = await teacherCards.count();
    expect(count).toBeGreaterThan(0);
    
    console.log(`✅ Found ${count} teachers`);
  });

  test('should load teacher schedule when teacher is selected', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    
    // Wait for schedule to load
    await page.waitForTimeout(3000);
    
    // Check that teacher name is displayed in header (any h4)
    const teacherHeader = page.locator('h4');
    await expect(teacherHeader).toBeVisible();
    
    // Check that quick action buttons are visible
    await expect(page.locator('button:has-text("Mark All Periods Absent")')).toBeVisible();
    await expect(page.locator('button:has-text("Mark All Periods Present")')).toBeVisible();
    
    // Check for schedule or "no classes" message
    const hasSchedule = await page.locator('input[type="checkbox"]').count() > 0;
    const hasNoClassesMsg = await page.locator('text=No classes scheduled').isVisible().catch(() => false);
    
    expect(hasSchedule || hasNoClassesMsg).toBeTruthy();
    
    console.log(`✅ Teacher schedule loaded, Has schedule: ${hasSchedule}`);
  });

  test('should mark specific period as absent and show substitute dropdown', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Check if teacher has scheduled periods
    const periodCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await periodCheckboxes.count();
    
    if (checkboxCount > 0) {
      // Check the first period checkbox
      const firstCheckbox = periodCheckboxes.first();
      await firstCheckbox.check();
      
      // Wait for substitute dropdown to load
      await page.waitForTimeout(3000);
      
      // Check that ABSENT badge appears
      await expect(page.locator('text=ABSENT').first()).toBeVisible();
      
      // Check for substitute selection or "no teachers available" message
      const hasDropdown = await page.locator('select').first().isVisible().catch(() => false);
      const hasNoTeachersMessage = await page.locator('text=No teachers available').isVisible().catch(() => false);
      
      expect(hasDropdown || hasNoTeachersMessage).toBeTruthy();
      
      if (hasDropdown) {
        const options = await page.locator('select option').count();
        console.log(`✅ Substitute dropdown loaded with ${options} options`);
      } else {
        console.log('⚠️ No teachers available for this period');
      }
    } else {
      console.log('⚠️ Teacher has no scheduled periods - test skipped');
      test.skip();
    }
  });

  test('should mark all periods absent with quick action button', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Check if teacher has scheduled periods
    const periodCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await periodCheckboxes.count();
    
    if (checkboxCount > 0) {
      // Click "Mark All Periods Absent" button
      await page.click('button:has-text("Mark All Periods Absent")');
      
      // Wait for all substitute dropdowns to load
      await page.waitForTimeout(4000);
      
      // Check that all checkboxes are checked
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = periodCheckboxes.nth(i);
        await expect(checkbox).toBeChecked();
      }
      
      // Check that all periods show ABSENT badge
      const absentBadges = page.locator('text=ABSENT');
      const badgeCount = await absentBadges.count();
      expect(badgeCount).toBe(checkboxCount);
      
      console.log(`✅ All ${checkboxCount} periods marked as absent`);
    } else {
      console.log('⚠️ Teacher has no scheduled periods - test skipped');
      test.skip();
    }
  });

  test('should mark all periods present with quick action button', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Check if teacher has scheduled periods
    const periodCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await periodCheckboxes.count();
    
    if (checkboxCount > 0) {
      // First mark all absent
      await page.click('button:has-text("Mark All Periods Absent")');
      await page.waitForTimeout(3000);
      
      // Then mark all present
      await page.click('button:has-text("Mark All Periods Present")');
      await page.waitForTimeout(1000);
      
      // Check that all checkboxes are unchecked
      for (let i = 0; i < checkboxCount; i++) {
        const checkbox = periodCheckboxes.nth(i);
        await expect(checkbox).not.toBeChecked();
      }
      
      // Check that all periods show PRESENT badge
      const presentBadges = page.locator('text=PRESENT');
      const badgeCount = await presentBadges.count();
      expect(badgeCount).toBe(checkboxCount);
      
      console.log(`✅ All ${checkboxCount} periods marked as present`);
    } else {
      console.log('⚠️ Teacher has no scheduled periods - test skipped');
      test.skip();
    }
  });

  test('should save period-based attendance successfully', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Check if teacher has scheduled periods
    const periodCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await periodCheckboxes.count();
    
    if (checkboxCount > 0) {
      // Mark first period as absent
      await periodCheckboxes.first().check();
      await page.waitForTimeout(2000);
    }
    
    // Click save attendance button
    await page.click('button:has-text("Save Attendance")');
    
    // Wait for save to complete
    await page.waitForTimeout(3000);
    
    // Check for success toast
    const successToast = page.locator('.toast-success, .toast-info');
    await expect(successToast).toBeVisible({ timeout: 5000 });
    
    // Check that form has reset (back to teacher selection)
    await expect(page.locator('text=Select Teacher:')).toBeVisible();
    
    console.log('✅ Attendance saved successfully');
  });

  test('should show summary of absent periods', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Check if teacher has scheduled periods
    const periodCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await periodCheckboxes.count();
    
    if (checkboxCount >= 2) {
      // Mark first two periods as absent
      await periodCheckboxes.nth(0).check();
      await periodCheckboxes.nth(1).check();
      await page.waitForTimeout(1000);
      
      // Check that summary is displayed
      const summary = page.locator('text=/Summary:.*Absent for \\d+ period/');
      await expect(summary).toBeVisible();
      
      // Check that it shows correct count
      const summaryText = await summary.textContent();
      expect(summaryText).toContain('Absent for 2 period');
      
      console.log('✅ Summary displayed correctly:', summaryText);
    } else {
      console.log('⚠️ Teacher has less than 2 periods - test skipped');
      test.skip();
    }
  });

  test('should allow switching between teachers', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Verify first teacher schedule is displayed
    await expect(page.locator('h4')).toBeVisible();
    
    // Click back button
    await page.click('button:has-text("Back to Teacher List")');
    await page.waitForTimeout(1000);
    
    // Verify we're back at teacher selection
    await expect(page.locator('text=Select Teacher:')).toBeVisible();
    
    // Click on second teacher
    const secondTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).nth(1);
    await secondTeacher.click();
    await page.waitForTimeout(3000);
    
    // Verify second teacher schedule is displayed
    await expect(page.locator('h4')).toBeVisible();
    
    console.log('✅ Successfully switched between teachers');
  });

  test('should display correct period information', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Click on first teacher
    const firstTeacher = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ }).first();
    await firstTeacher.click();
    await page.waitForTimeout(3000);
    
    // Check if teacher has scheduled periods
    const periodElements = page.locator('text=/Period \\d+/');
    const periodCount = await periodElements.count();
    
    if (periodCount > 0) {
      // Check first period details
      const firstPeriod = periodElements.first();
      const periodText = await firstPeriod.textContent();
      
      // Should contain period number and time
      expect(periodText).toMatch(/Period \d+ \(\d{2}:\d{2} - \d{2}:\d{2}\)/);
      
      // Check for class and subject information
      const classInfo = page.locator('text=/Class:.*\\|.*Subject:/').first();
      await expect(classInfo).toBeVisible();
      
      console.log('✅ Period information displayed correctly:', periodText);
    } else {
      console.log('⚠️ Teacher has no scheduled periods');
    }
  });

});

test.describe('Period-Based Attendance - Edge Cases', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.click('.dashboard-card:has-text("Attendance")');
    await page.waitForURL('**/attendance', { timeout: 10000 });
  });

  test('should handle teacher with no scheduled periods', async ({ page }) => {
    // Set date
    await page.fill('input[type="date"]', TEST_DATE);
    await page.waitForTimeout(2000);
    
    // Try to find a teacher with no schedule
    const teacherCards = page.locator('button').filter({ hasText: /Math|English|Science|History|General/ });
    const teacherCount = await teacherCards.count();
    
    let foundTeacherWithNoSchedule = false;
    
    // Check up to 5 teachers
    for (let i = 0; i < Math.min(teacherCount, 5); i++) {
      await teacherCards.nth(i).click();
      await page.waitForTimeout(3000);
      
      const noScheduleMessage = await page.locator('text=No classes scheduled').isVisible().catch(() => false);
      
      if (noScheduleMessage) {
        console.log('✅ Found teacher with no scheduled periods');
        foundTeacherWithNoSchedule = true;
        
        // Verify that save button is still available
        await expect(page.locator('button:has-text("Save Attendance")')).toBeVisible();
        
        // Try to save (should save as present for all periods)
        await page.click('button:has-text("Save Attendance")');
        await page.waitForTimeout(2000);
        
        // Should show success
        const successToast = page.locator('.toast-success, .toast-info');
        await expect(successToast).toBeVisible({ timeout: 5000 });
        
        break;
      }
      
      // Go back to teacher list
      const backButton = page.locator('button:has-text("Back to Teacher List")');
      const backButtonVisible = await backButton.isVisible().catch(() => false);
      if (backButtonVisible) {
        await backButton.click();
        await page.waitForTimeout(1000);
      }
    }
    
    if (!foundTeacherWithNoSchedule) {
      console.log('⚠️ All checked teachers have schedules - test skipped');
      test.skip();
    }
  });

  test('should prevent saving without selecting date', async ({ page }) => {
    // Don't set a date - should show warning message
    const warningMessage = page.locator('text=Please select a date');
    await expect(warningMessage).toBeVisible();
    
    console.log('✅ Date validation working');
  });

});
