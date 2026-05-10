# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-substitution-workflow.spec.js >> Substitution Workflow >> 12 - Should use global navigation to switch between pages
- Location: e2e/07-substitution-workflow.spec.js:382:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('nav').locator('text=Mark Attendance')

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
  287 | 
  288 |   test('09 - Should handle multiple period allocations', async ({ page }) => {
  289 |     // Mark teacher absent for periods 1 and 2
  290 |     await page.goto('http://localhost:5173/attendance');
  291 |     await page.fill('input[type="date"]', testDateFormatted);
  292 |     await page.waitForTimeout(1000);
  293 |     
  294 |     const firstTeacherCard = page.locator('.teacher-card').first();
  295 |     await firstTeacherCard.locator('text=Mark by Period').click();
  296 |     await page.check('input[type="checkbox"][value="1"]');
  297 |     await page.check('input[type="checkbox"][value="2"]');
  298 |     await page.click('button:has-text("Submit Attendance")');
  299 |     await page.waitForTimeout(1000);
  300 |     
  301 |     // Go to substitution page
  302 |     await page.goto('http://localhost:5173/substitution');
  303 |     await page.fill('input[type="date"]', testDateFormatted);
  304 |     await page.waitForTimeout(1000);
  305 |     
  306 |     // Should see two "Allocate Substitute" buttons (one for each period)
  307 |     const allocateButtons = page.locator('button:has-text("Allocate Substitute")');
  308 |     await expect(allocateButtons).toHaveCount(2);
  309 |     
  310 |     // Allocate substitute for period 1
  311 |     await allocateButtons.first().click();
  312 |     await page.locator('button:has-text("Select")').first().click();
  313 |     await page.click('button:has-text("Confirm Allocation")');
  314 |     await page.waitForTimeout(1000);
  315 |     
  316 |     // Refresh and allocate for period 2
  317 |     await page.reload();
  318 |     await page.fill('input[type="date"]', testDateFormatted);
  319 |     await page.waitForTimeout(1000);
  320 |     
  321 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  322 |     await page.locator('button:has-text("Select")').first().click();
  323 |     await page.click('button:has-text("Confirm Allocation")');
  324 |     await page.waitForTimeout(1000);
  325 |     
  326 |     // Refresh and verify both periods are covered
  327 |     await page.reload();
  328 |     await page.fill('input[type="date"]', testDateFormatted);
  329 |     await page.waitForTimeout(1000);
  330 |     
  331 |     const coveredBadges = page.locator('text=✓ Covered by');
  332 |     await expect(coveredBadges).toHaveCount(2);
  333 |   });
  334 | 
  335 |   test('10 - Should show informational message about subject flexibility', async ({ page }) => {
  336 |     // Mark teacher absent
  337 |     await page.goto('http://localhost:5173/attendance');
  338 |     await page.fill('input[type="date"]', testDateFormatted);
  339 |     await page.waitForTimeout(1000);
  340 |     
  341 |     const firstTeacherCard = page.locator('.teacher-card').first();
  342 |     await firstTeacherCard.locator('text=Mark by Period').click();
  343 |     await page.check('input[type="checkbox"][value="1"]');
  344 |     await page.click('button:has-text("Submit Attendance")');
  345 |     await page.waitForTimeout(1000);
  346 |     
  347 |     // Go to substitution and start allocation
  348 |     await page.goto('http://localhost:5173/substitution');
  349 |     await page.fill('input[type="date"]', testDateFormatted);
  350 |     await page.waitForTimeout(1000);
  351 |     
  352 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  353 |     await page.locator('button:has-text("Select")').first().click();
  354 |     
  355 |     // Should see green informational message
  356 |     await expect(page.locator('text=Any available teacher can substitute')).toBeVisible();
  357 |     await expect(page.locator('text=Subject expertise is not required')).toBeVisible();
  358 |     
  359 |     // Message should have green background (not yellow warning)
  360 |     const infoBox = page.locator('text=Any available teacher can substitute').locator('..');
  361 |     const backgroundColor = await infoBox.evaluate(el => window.getComputedStyle(el).backgroundColor);
  362 |     
  363 |     // Should be greenish (rgb values with more green than red/blue)
  364 |     expect(backgroundColor).toContain('232, 245, 233'); // #e8f5e9
  365 |   });
  366 | 
  367 |   test('11 - Should navigate using breadcrumbs', async ({ page }) => {
  368 |     // Go to substitution page
  369 |     await page.goto('http://localhost:5173/substitution');
  370 |     
  371 |     // Should see breadcrumbs
  372 |     await expect(page.locator('text=Dashboard')).toBeVisible();
  373 |     await expect(page.locator('text=Allocate Substitute')).toBeVisible();
  374 |     
  375 |     // Click Dashboard in breadcrumbs
  376 |     await page.locator('nav').locator('text=Dashboard').click();
  377 |     
  378 |     // Should navigate to dashboard
  379 |     await expect(page).toHaveURL(/.*dashboard/);
  380 |   });
  381 | 
  382 |   test('12 - Should use global navigation to switch between pages', async ({ page }) => {
  383 |     // Start on dashboard
  384 |     await page.goto('http://localhost:5173/dashboard');
  385 |     
  386 |     // Navigate to attendance using global nav
> 387 |     await page.locator('nav').locator('text=Mark Attendance').click();
      |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  388 |     await expect(page).toHaveURL(/.*attendance/);
  389 |     
  390 |     // Navigate to substitution using global nav
  391 |     await page.locator('nav').locator('text=Allocate Substitute').click();
  392 |     await expect(page).toHaveURL(/.*substitution/);
  393 |     
  394 |     // Navigate back to dashboard using global nav
  395 |     await page.locator('nav').locator('text=Dashboard').click();
  396 |     await expect(page).toHaveURL(/.*dashboard/);
  397 |   });
  398 | });
  399 | 
```