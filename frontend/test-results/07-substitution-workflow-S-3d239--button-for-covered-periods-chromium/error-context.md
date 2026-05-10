# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-substitution-workflow.spec.js >> Substitution Workflow >> 06 - Should show "Change Substitute" button for covered periods
- Location: e2e/07-substitution-workflow.spec.js:170:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.teacher-card').first().locator('text=Mark by Period')

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
  - navigation "Breadcrumb" [ref=e31]:
    - list [ref=e32]:
      - listitem [ref=e33]:
        - link "Home" [ref=e34] [cursor=pointer]:
          - /url: /dashboard
        - generic [ref=e35]: ›
      - listitem [ref=e36]:
        - generic [ref=e37]: Attendance
  - main [ref=e38]:
    - generic [ref=e39]:
      - generic [ref=e40]:
        - heading "Teacher Attendance" [level=1] [ref=e41]
        - paragraph [ref=e42]: Record attendance by period or full day, and view attendance history
      - generic [ref=e43]:
        - button "📅 Period-Based Attendance" [ref=e44] [cursor=pointer]
        - button "⚡ Quick Attendance" [ref=e45] [cursor=pointer]
        - button "📊 View History" [ref=e46] [cursor=pointer]
      - generic [ref=e47]:
        - generic [ref=e48]:
          - heading "Select Date" [level=3] [ref=e49]
          - generic [ref=e51]:
            - generic [ref=e52]: Attendance Date *
            - textbox "Attendance Date *" [active] [ref=e53]: 2026-05-11
            - generic [ref=e54]: "Selected: Monday, 5/11/2026"
        - generic [ref=e55]:
          - generic [ref=e56]:
            - heading "Period-Based Attendance" [level=3] [ref=e57]
            - paragraph [ref=e58]: Select a teacher to mark attendance for specific periods
          - generic [ref=e60]:
            - heading "Select Teacher:" [level=4] [ref=e61]
            - generic [ref=e62]:
              - button "Miss Jayathissa Jeewani General" [ref=e63] [cursor=pointer]:
                - generic [ref=e64]: Miss Jayathissa Jeewani
                - generic [ref=e65]: General
              - button "Miss Kumari Shalika General" [ref=e66] [cursor=pointer]:
                - generic [ref=e67]: Miss Kumari Shalika
                - generic [ref=e68]: General
              - button "Miss Nimali General" [ref=e69] [cursor=pointer]:
                - generic [ref=e70]: Miss Nimali
                - generic [ref=e71]: General
              - button "Miss Ranaweera Ishani General" [ref=e72] [cursor=pointer]:
                - generic [ref=e73]: Miss Ranaweera Ishani
                - generic [ref=e74]: General
              - button "Miss Udakanda Sasini General" [ref=e75] [cursor=pointer]:
                - generic [ref=e76]: Miss Udakanda Sasini
                - generic [ref=e77]: General
              - button "Mr Aruna General" [ref=e78] [cursor=pointer]:
                - generic [ref=e79]: Mr Aruna
                - generic [ref=e80]: General
              - button "Mr D.H Sanjeewa General" [ref=e81] [cursor=pointer]:
                - generic [ref=e82]: Mr D.H Sanjeewa
                - generic [ref=e83]: General
              - button "Mr Heenatigala Dimuthu General" [ref=e84] [cursor=pointer]:
                - generic [ref=e85]: Mr Heenatigala Dimuthu
                - generic [ref=e86]: General
              - button "Mr Piris Sumith General" [ref=e87] [cursor=pointer]:
                - generic [ref=e88]: Mr Piris Sumith
                - generic [ref=e89]: General
              - button "Mrs Chandima General" [ref=e90] [cursor=pointer]:
                - generic [ref=e91]: Mrs Chandima
                - generic [ref=e92]: General
              - button "Mrs Dahanayaka Shirani General" [ref=e93] [cursor=pointer]:
                - generic [ref=e94]: Mrs Dahanayaka Shirani
                - generic [ref=e95]: General
              - button "Mrs Gunathilaka Prabashini General" [ref=e96] [cursor=pointer]:
                - generic [ref=e97]: Mrs Gunathilaka Prabashini
                - generic [ref=e98]: General
              - button "Mrs H.D.K Anuradha General" [ref=e99] [cursor=pointer]:
                - generic [ref=e100]: Mrs H.D.K Anuradha
                - generic [ref=e101]: General
              - button "Mrs Harischandra Chamila General" [ref=e102] [cursor=pointer]:
                - generic [ref=e103]: Mrs Harischandra Chamila
                - generic [ref=e104]: General
              - button "Mrs Jeewani Kumari General" [ref=e105] [cursor=pointer]:
                - generic [ref=e106]: Mrs Jeewani Kumari
                - generic [ref=e107]: General
              - button "Mrs K.T Hasinidhara General" [ref=e108] [cursor=pointer]:
                - generic [ref=e109]: Mrs K.T Hasinidhara
                - generic [ref=e110]: General
              - button "Mrs Karunarathna Rivika General" [ref=e111] [cursor=pointer]:
                - generic [ref=e112]: Mrs Karunarathna Rivika
                - generic [ref=e113]: General
              - button "Mrs Kolostika Ruwani General" [ref=e114] [cursor=pointer]:
                - generic [ref=e115]: Mrs Kolostika Ruwani
                - generic [ref=e116]: General
              - button "Mrs Kumari Priyangika General" [ref=e117] [cursor=pointer]:
                - generic [ref=e118]: Mrs Kumari Priyangika
                - generic [ref=e119]: General
              - button "Mrs M.B.S Kaniya General" [ref=e120] [cursor=pointer]:
                - generic [ref=e121]: Mrs M.B.S Kaniya
                - generic [ref=e122]: General
              - button "Mrs Perera Hansi General" [ref=e123] [cursor=pointer]:
                - generic [ref=e124]: Mrs Perera Hansi
                - generic [ref=e125]: General
              - button "Mrs Perera Pradeepa General" [ref=e126] [cursor=pointer]:
                - generic [ref=e127]: Mrs Perera Pradeepa
                - generic [ref=e128]: General
              - button "Mrs Perera Srima General" [ref=e129] [cursor=pointer]:
                - generic [ref=e130]: Mrs Perera Srima
                - generic [ref=e131]: General
              - button "Mrs Rupasena Shenali General" [ref=e132] [cursor=pointer]:
                - generic [ref=e133]: Mrs Rupasena Shenali
                - generic [ref=e134]: General
              - button "Mrs V.G Theekshana General" [ref=e135] [cursor=pointer]:
                - generic [ref=e136]: Mrs V.G Theekshana
                - generic [ref=e137]: General
              - button "Pinto Gayathri General" [ref=e138] [cursor=pointer]:
                - generic [ref=e139]: Pinto Gayathri
                - generic [ref=e140]: General
              - button "Rev.Dammaransi General" [ref=e141] [cursor=pointer]:
                - generic [ref=e142]: Rev.Dammaransi
                - generic [ref=e143]: General
              - button "Rev.Therapuththabaya General" [ref=e144] [cursor=pointer]:
                - generic [ref=e145]: Rev.Therapuththabaya
                - generic [ref=e146]: General
  - contentinfo [ref=e147]:
    - generic [ref=e148]:
      - paragraph [ref=e149]: © 2026 Anuruddha Balika Vidyalaya - Teacher Attendance System
      - paragraph [ref=e150]:
        - link "Help" [ref=e151] [cursor=pointer]:
          - /url: "#"
        - text: •
        - link "Privacy" [ref=e152] [cursor=pointer]:
          - /url: "#"
        - text: •
        - link "Terms" [ref=e153] [cursor=pointer]:
          - /url: "#"
```

# Test source

```ts
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
  141 |     // Mark teacher absent and allocate substitute
  142 |     await page.goto('http://localhost:5173/attendance');
  143 |     await page.fill('input[type="date"]', testDateFormatted);
  144 |     await page.waitForTimeout(1000);
  145 |     
  146 |     const firstTeacherCard = page.locator('.teacher-card').first();
  147 |     await firstTeacherCard.locator('text=Mark by Period').click();
  148 |     await page.check('input[type="checkbox"][value="1"]');
  149 |     await page.click('button:has-text("Submit Attendance")');
  150 |     await page.waitForTimeout(1000);
  151 |     
  152 |     await page.goto('http://localhost:5173/substitution');
  153 |     await page.fill('input[type="date"]', testDateFormatted);
  154 |     await page.waitForTimeout(1000);
  155 |     
  156 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  157 |     await page.locator('button:has-text("Select")').first().click();
  158 |     await page.click('button:has-text("Confirm Allocation")');
  159 |     await page.waitForTimeout(1000);
  160 |     
  161 |     // Refresh to see updated status
  162 |     await page.reload();
  163 |     await page.fill('input[type="date"]', testDateFormatted);
  164 |     await page.waitForTimeout(1000);
  165 |     
  166 |     // Should show green coverage badge
  167 |     await expect(page.locator('text=✓ Covered by')).toBeVisible();
  168 |   });
  169 | 
  170 |   test('06 - Should show "Change Substitute" button for covered periods', async ({ page }) => {
  171 |     // Mark teacher absent and allocate substitute
  172 |     await page.goto('http://localhost:5173/attendance');
  173 |     await page.fill('input[type="date"]', testDateFormatted);
  174 |     await page.waitForTimeout(1000);
  175 |     
  176 |     const firstTeacherCard = page.locator('.teacher-card').first();
> 177 |     await firstTeacherCard.locator('text=Mark by Period').click();
      |                                                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  178 |     await page.check('input[type="checkbox"][value="1"]');
  179 |     await page.click('button:has-text("Submit Attendance")');
  180 |     await page.waitForTimeout(1000);
  181 |     
  182 |     await page.goto('http://localhost:5173/substitution');
  183 |     await page.fill('input[type="date"]', testDateFormatted);
  184 |     await page.waitForTimeout(1000);
  185 |     
  186 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  187 |     await page.locator('button:has-text("Select")').first().click();
  188 |     await page.click('button:has-text("Confirm Allocation")');
  189 |     await page.waitForTimeout(1000);
  190 |     
  191 |     // Refresh page
  192 |     await page.reload();
  193 |     await page.fill('input[type="date"]', testDateFormatted);
  194 |     await page.waitForTimeout(1000);
  195 |     
  196 |     // Should see "Change Substitute" button
  197 |     await expect(page.locator('button:has-text("Change Substitute")')).toBeVisible();
  198 |   });
  199 | 
  200 |   test('07 - Should change substitute teacher successfully', async ({ page }) => {
  201 |     // Mark teacher absent and allocate substitute
  202 |     await page.goto('http://localhost:5173/attendance');
  203 |     await page.fill('input[type="date"]', testDateFormatted);
  204 |     await page.waitForTimeout(1000);
  205 |     
  206 |     const firstTeacherCard = page.locator('.teacher-card').first();
  207 |     await firstTeacherCard.locator('text=Mark by Period').click();
  208 |     await page.check('input[type="checkbox"][value="1"]');
  209 |     await page.click('button:has-text("Submit Attendance")');
  210 |     await page.waitForTimeout(1000);
  211 |     
  212 |     await page.goto('http://localhost:5173/substitution');
  213 |     await page.fill('input[type="date"]', testDateFormatted);
  214 |     await page.waitForTimeout(1000);
  215 |     
  216 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  217 |     const firstSubstituteName = await page.locator('button:has-text("Select")').first().locator('..').locator('h4').textContent();
  218 |     await page.locator('button:has-text("Select")').first().click();
  219 |     await page.click('button:has-text("Confirm Allocation")');
  220 |     await page.waitForTimeout(1000);
  221 |     
  222 |     // Refresh and click "Change Substitute"
  223 |     await page.reload();
  224 |     await page.fill('input[type="date"]', testDateFormatted);
  225 |     await page.waitForTimeout(1000);
  226 |     
  227 |     await page.click('button:has-text("Change Substitute")');
  228 |     
  229 |     // Should show free teachers list again
  230 |     await expect(page.locator('text=Select Substitute Teacher')).toBeVisible();
  231 |     
  232 |     // Select a different teacher (second one)
  233 |     const secondSubstituteButton = page.locator('button:has-text("Select")').nth(1);
  234 |     await secondSubstituteButton.click();
  235 |     
  236 |     // Should show confirmation form with "Change" header
  237 |     await expect(page.locator('text=Change Substitute Teacher')).toBeVisible();
  238 |     
  239 |     // Confirm change
  240 |     await page.click('button:has-text("Confirm Change")');
  241 |     
  242 |     // Wait for success message
  243 |     await expect(page.locator('text=Successfully changed substitute')).toBeVisible({ timeout: 5000 });
  244 |   });
  245 | 
  246 |   test('08 - Should show updated substitute after change', async ({ page }) => {
  247 |     // Complete workflow: mark absent, allocate, change
  248 |     await page.goto('http://localhost:5173/attendance');
  249 |     await page.fill('input[type="date"]', testDateFormatted);
  250 |     await page.waitForTimeout(1000);
  251 |     
  252 |     const firstTeacherCard = page.locator('.teacher-card').first();
  253 |     await firstTeacherCard.locator('text=Mark by Period').click();
  254 |     await page.check('input[type="checkbox"][value="1"]');
  255 |     await page.click('button:has-text("Submit Attendance")');
  256 |     await page.waitForTimeout(1000);
  257 |     
  258 |     await page.goto('http://localhost:5173/substitution');
  259 |     await page.fill('input[type="date"]', testDateFormatted);
  260 |     await page.waitForTimeout(1000);
  261 |     
  262 |     // Allocate first substitute
  263 |     await page.locator('button:has-text("Allocate Substitute")').first().click();
  264 |     await page.locator('button:has-text("Select")').first().click();
  265 |     await page.click('button:has-text("Confirm Allocation")');
  266 |     await page.waitForTimeout(1000);
  267 |     
  268 |     // Change to second substitute
  269 |     await page.reload();
  270 |     await page.fill('input[type="date"]', testDateFormatted);
  271 |     await page.waitForTimeout(1000);
  272 |     
  273 |     await page.click('button:has-text("Change Substitute")');
  274 |     const newSubstituteName = await page.locator('button:has-text("Select")').nth(1).locator('..').locator('h4').textContent();
  275 |     await page.locator('button:has-text("Select")').nth(1).click();
  276 |     await page.click('button:has-text("Confirm Change")');
  277 |     await page.waitForTimeout(1000);
```