# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-substitution-workflow.spec.js >> Substitution Workflow >> 01 - Should navigate to attendance page
- Location: e2e/07-substitution-workflow.spec.js:38:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Mark Attendance')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - link "🎓 Teacher Attendance" [ref=e6] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=e7]: 🎓
        - generic [ref=e8]: Teacher Attendance
      - generic [ref=e9]:
        - button "🏠 Dashboard" [ref=e10] [cursor=pointer]:
          - generic [ref=e11]: 🏠
          - generic [ref=e12]: Dashboard
        - button "📋 Attendance" [ref=e13] [cursor=pointer]:
          - generic [ref=e14]: 📋
          - generic [ref=e15]: Attendance
        - button "🔄 Substitutions" [ref=e16] [cursor=pointer]:
          - generic [ref=e17]: 🔄
          - generic [ref=e18]: Substitutions
        - button "📅 Timetable" [ref=e19] [cursor=pointer]:
          - generic [ref=e20]: 📅
          - generic [ref=e21]: Timetable
        - button "👥 Teachers" [ref=e22] [cursor=pointer]:
          - generic [ref=e23]: 👥
          - generic [ref=e24]: Teachers
      - button "User menu" [ref=e26] [cursor=pointer]:
        - generic [ref=e27]: 👤
        - generic [ref=e28]: admin
        - generic [ref=e29]: (admin)
        - generic [ref=e30]: ▼
  - main [ref=e31]:
    - generic [ref=e32]:
      - generic [ref=e34]:
        - heading "Welcome Back!" [level=1] [ref=e35]
        - paragraph [ref=e36]: Quick access to all features
      - generic [ref=e37]:
        - generic [ref=e38] [cursor=pointer]:
          - heading "Teachers" [level=3] [ref=e39]
          - paragraph [ref=e40]: Manage teacher information
        - generic [ref=e41] [cursor=pointer]:
          - heading "Attendance" [level=3] [ref=e42]
          - paragraph [ref=e43]: Record and view attendance
        - generic [ref=e44] [cursor=pointer]:
          - heading "Substitutions" [level=3] [ref=e45]
          - paragraph [ref=e46]: Manage teacher substitutions
        - generic [ref=e47] [cursor=pointer]:
          - heading "Timetable" [level=3] [ref=e48]
          - paragraph [ref=e49]: View and import timetables
  - contentinfo [ref=e50]:
    - generic [ref=e51]:
      - paragraph [ref=e52]: © 2026 Anuruddha Balika Vidyalaya - Teacher Attendance System
      - paragraph [ref=e53]:
        - link "Help" [ref=e54] [cursor=pointer]:
          - /url: "#"
        - text: •
        - link "Privacy" [ref=e55] [cursor=pointer]:
          - /url: "#"
        - text: •
        - link "Terms" [ref=e56] [cursor=pointer]:
          - /url: "#"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Substitution Workflow E2E Tests
  5   |  * 
  6   |  * Tests the complete substitution workflow including:
  7   |  * 1. Marking teacher absent (period-based)
  8   |  * 2. Viewing absent teachers list
  9   |  * 3. Allocating substitute teacher
  10  |  * 4. Changing substitute teacher
  11  |  * 5. Verifying coverage status
  12  |  */
  13  | 
  14  | test.describe('Substitution Workflow', () => {
  15  |   let testDate;
  16  |   let testDateFormatted;
  17  | 
  18  |   test.beforeEach(async ({ page }) => {
  19  |     // Set test date to a weekday (Monday)
  20  |     testDate = new Date();
  21  |     // Find next Monday
  22  |     const dayOfWeek = testDate.getDay();
  23  |     const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  24  |     testDate.setDate(testDate.getDate() + daysUntilMonday);
  25  |     testDateFormatted = testDate.toISOString().split('T')[0];
  26  | 
  27  |     // Login as admin
  28  |     await page.goto('http://localhost:5173/login');
  29  |     await page.fill('input[type="text"]', 'admin');
  30  |     await page.fill('input[type="password"]', 'admin123');
  31  |     await page.click('button[type="submit"]');
  32  |     
  33  |     // Wait for navigation to dashboard
  34  |     await page.waitForURL('**/dashboard');
  35  |     await expect(page.locator('text=Welcome Back!')).toBeVisible();
  36  |   });
  37  | 
  38  |   test('01 - Should navigate to attendance page', async ({ page }) => {
  39  |     // Click on Mark Attendance in navigation
> 40  |     await page.click('text=Mark Attendance');
      |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  41  |     
  42  |     // Should be on attendance page
  43  |     await expect(page).toHaveURL(/.*attendance/);
  44  |     await expect(page.locator('text=Mark Teacher Attendance')).toBeVisible();
  45  |   });
  46  | 
  47  |   test('02 - Should mark teacher absent for specific periods', async ({ page }) => {
  48  |     // Navigate to attendance page
  49  |     await page.goto('http://localhost:5173/attendance');
  50  |     
  51  |     // Select date
  52  |     await page.fill('input[type="date"]', testDateFormatted);
  53  |     
  54  |     // Wait for teacher list to load
  55  |     await page.waitForTimeout(1000);
  56  |     
  57  |     // Find first teacher and click "Mark by Period"
  58  |     const firstTeacherCard = page.locator('.teacher-card').first();
  59  |     await firstTeacherCard.locator('text=Mark by Period').click();
  60  |     
  61  |     // Wait for period selection modal
  62  |     await expect(page.locator('text=Select Absent Periods')).toBeVisible();
  63  |     
  64  |     // Select periods 1 and 2
  65  |     await page.check('input[type="checkbox"][value="1"]');
  66  |     await page.check('input[type="checkbox"][value="2"]');
  67  |     
  68  |     // Submit
  69  |     await page.click('button:has-text("Submit Attendance")');
  70  |     
  71  |     // Wait for success message
  72  |     await expect(page.locator('text=Attendance marked successfully')).toBeVisible({ timeout: 5000 });
  73  |   });
  74  | 
  75  |   test('03 - Should show absent teacher in substitution page', async ({ page }) => {
  76  |     // First mark a teacher absent
  77  |     await page.goto('http://localhost:5173/attendance');
  78  |     await page.fill('input[type="date"]', testDateFormatted);
  79  |     await page.waitForTimeout(1000);
  80  |     
  81  |     const firstTeacherCard = page.locator('.teacher-card').first();
  82  |     const teacherName = await firstTeacherCard.locator('h3').textContent();
  83  |     
  84  |     await firstTeacherCard.locator('text=Mark by Period').click();
  85  |     await page.check('input[type="checkbox"][value="1"]');
  86  |     await page.click('button:has-text("Submit Attendance")');
  87  |     await page.waitForTimeout(1000);
  88  |     
  89  |     // Navigate to substitution page
  90  |     await page.click('text=Allocate Substitute');
  91  |     await expect(page).toHaveURL(/.*substitution/);
  92  |     
  93  |     // Select the same date
  94  |     await page.fill('input[type="date"]', testDateFormatted);
  95  |     await page.waitForTimeout(1000);
  96  |     
  97  |     // Should see the absent teacher
  98  |     await expect(page.locator(`text=${teacherName}`)).toBeVisible();
  99  |     await expect(page.locator('text=Absent')).toBeVisible();
  100 |   });
  101 | 
  102 |   test('04 - Should allocate substitute teacher', async ({ page }) => {
  103 |     // Mark teacher absent first
  104 |     await page.goto('http://localhost:5173/attendance');
  105 |     await page.fill('input[type="date"]', testDateFormatted);
  106 |     await page.waitForTimeout(1000);
  107 |     
  108 |     const firstTeacherCard = page.locator('.teacher-card').first();
  109 |     await firstTeacherCard.locator('text=Mark by Period').click();
  110 |     await page.check('input[type="checkbox"][value="1"]');
  111 |     await page.click('button:has-text("Submit Attendance")');
  112 |     await page.waitForTimeout(1000);
  113 |     
  114 |     // Go to substitution page
  115 |     await page.goto('http://localhost:5173/substitution');
  116 |     await page.fill('input[type="date"]', testDateFormatted);
  117 |     await page.waitForTimeout(1000);
  118 |     
  119 |     // Click "Allocate Substitute" button for period 1
  120 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  121 |     
  122 |     // Should show free teachers list
  123 |     await expect(page.locator('text=Select Substitute Teacher')).toBeVisible();
  124 |     await expect(page.locator('text=Free Teachers')).toBeVisible();
  125 |     
  126 |     // Select first free teacher
  127 |     await page.locator('button:has-text("Select")').first().click();
  128 |     
  129 |     // Should show confirmation form
  130 |     await expect(page.locator('text=Confirm Substitution Allocation')).toBeVisible();
  131 |     await expect(page.locator('text=Any available teacher can substitute')).toBeVisible();
  132 |     
  133 |     // Confirm allocation
  134 |     await page.click('button:has-text("Confirm Allocation")');
  135 |     
  136 |     // Wait for success message
  137 |     await expect(page.locator('text=Successfully allocated')).toBeVisible({ timeout: 5000 });
  138 |   });
  139 | 
  140 |   test('05 - Should show coverage status after allocation', async ({ page }) => {
```