import { test, expect } from '@playwright/test';

/**
 * DIAGNOSTIC LOGIN TEST
 * This test will find the EXACT issue preventing login
 */

test.describe('Login Diagnosis - Production Environment', () => {
  
  test('Step 1: Can we reach the frontend?', async ({ page }) => {
    console.log('🔍 Testing if frontend is accessible...');
    
    const response = await page.goto('https://extraordinary-croquembouche-c5feb8.netlify.app/login');
    
    expect(response.status()).toBe(200);
    console.log('✅ Frontend is accessible (200 OK)');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/01-frontend-loaded.png' });
  });

  test('Step 2: Can we reach the backend health endpoint?', async ({ request }) => {
    console.log('🔍 Testing if backend is responding...');
    
    const response = await request.get('https://teacher-attendance-api-v2.onrender.com/api/health');
    
    console.log('Backend response status:', response.status());
    const body = await response.json();
    console.log('Backend response:', body);
    
    expect(response.status()).toBe(200);
    expect(body.status).toBe('ok');
    console.log('✅ Backend is responding correctly');
  });

  test('Step 3: What happens when we try to login?', async ({ page }) => {
    console.log('🔍 Testing actual login flow with admin/Admin@2026...');
    
    // Enable console logging from browser
    page.on('console', msg => {
      console.log('🌐 Browser Console:', msg.type(), msg.text());
    });
    
    // Enable network logging
    page.on('request', request => {
      if (request.url().includes('auth/login')) {
        console.log('📤 Login Request:', request.method(), request.url());
        console.log('📤 Request Body:', request.postData());
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('auth/login')) {
        console.log('📥 Login Response Status:', response.status());
        console.log('📥 Response URL:', response.url());
        try {
          const body = await response.json();
          console.log('📥 Response Body:', JSON.stringify(body, null, 2));
        } catch (e) {
          console.log('📥 Response Body (text):', await response.text());
        }
      }
    });
    
    // Go to login page
    await page.goto('https://extraordinary-croquembouche-c5feb8.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot before login
    await page.screenshot({ path: 'test-results/02-before-login.png' });
    
    // Fill username
    console.log('Filling username...');
    await page.fill('input[type="text"]', 'admin');
    
    // Fill password
    console.log('Filling password...');
    await page.fill('input[type="password"]', 'Admin@2026');
    
    // Take screenshot with filled fields
    await page.screenshot({ path: 'test-results/03-fields-filled.png' });
    
    // Click login button
    console.log('Clicking login button...');
    await page.click('button:has-text("Login")');
    
    // Wait a bit for response
    await page.waitForTimeout(3000);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'test-results/04-after-login-click.png' });
    
    // Check current URL
    const currentUrl = page.url();
    console.log('📍 Current URL after login:', currentUrl);
    
    // Check if we're on dashboard (success) or still on login (failure)
    if (currentUrl.includes('dashboard') || currentUrl.includes('/') && !currentUrl.includes('login')) {
      console.log('✅ LOGIN SUCCESSFUL! Redirected to dashboard');
      expect(currentUrl).not.toContain('login');
    } else {
      console.log('❌ LOGIN FAILED! Still on login page');
      
      // Check for error messages
      const errorMessages = await page.locator('text=/error|failed|invalid|wrong/i').allTextContents();
      if (errorMessages.length > 0) {
        console.log('❌ Error messages found:', errorMessages);
      }
      
      // This will fail and show us why
      expect(currentUrl).toContain('dashboard');
    }
  });

  test('Step 4: Test direct API call to login endpoint', async ({ request }) => {
    console.log('🔍 Testing direct API login call...');
    
    const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
      data: {
        username: 'admin',
        password: 'Admin@2026'
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API Login Response Status:', response.status());
    console.log('API Login Response Headers:', response.headers());
    
    const body = await response.text();
    console.log('API Login Response Body:', body);
    
    if (response.status() === 200) {
      const jsonBody = JSON.parse(body);
      console.log('✅ API LOGIN SUCCESSFUL!');
      console.log('Token received:', jsonBody.token ? 'Yes' : 'No');
      console.log('User data:', jsonBody.user);
      expect(jsonBody.token).toBeTruthy();
    } else {
      console.log('❌ API LOGIN FAILED!');
      console.log('Status:', response.status());
      console.log('Error:', body);
      
      // This will fail and show the error
      expect(response.status()).toBe(200);
    }
  });

  test('Step 5: Check CORS headers', async ({ request }) => {
    console.log('🔍 Testing CORS configuration...');
    
    const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
      data: {
        username: 'admin',
        password: 'Admin@2026'
      },
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://extraordinary-croquembouche-c5feb8.netlify.app'
      }
    });
    
    const corsHeader = response.headers()['access-control-allow-origin'];
    console.log('CORS Header (Access-Control-Allow-Origin):', corsHeader);
    
    if (corsHeader === 'https://extraordinary-croquembouche-c5feb8.netlify.app' || corsHeader === '*') {
      console.log('✅ CORS is configured correctly');
    } else {
      console.log('❌ CORS MISCONFIGURED!');
      console.log('Expected:', 'https://extraordinary-croquembouche-c5feb8.netlify.app');
      console.log('Got:', corsHeader);
    }
  });

  test('Step 6: Check MongoDB connection', async ({ request }) => {
    console.log('🔍 Testing if backend can connect to MongoDB...');
    
    // Try to fetch teachers (requires DB connection)
    const response = await request.get('https://teacher-attendance-api-v2.onrender.com/api/teachers', {
      headers: {
        'Origin': 'https://extraordinary-croquembouche-c5feb8.netlify.app'
      }
    });
    
    console.log('Teachers endpoint status:', response.status());
    
    if (response.status() === 401) {
      console.log('✅ Backend is connected to MongoDB (got 401 as expected without auth)');
    } else if (response.status() === 200) {
      console.log('✅ Backend is connected to MongoDB (got data)');
    } else {
      console.log('⚠️  Unexpected status:', response.status());
      const body = await response.text();
      console.log('Response:', body);
    }
  });

});

test.describe('Password Hash Verification', () => {
  
  test('Test with alternative password hashes', async ({ request }) => {
    console.log('🔍 Testing with different password possibilities...');
    
    const passwords = [
      { pwd: 'Admin@2026', desc: 'Primary password' },
      { pwd: 'admin123', desc: 'Alternative 1' },
      { pwd: 'password', desc: 'Alternative 2' },
      { pwd: 'admin', desc: 'Alternative 3' },
    ];
    
    for (const { pwd, desc } of passwords) {
      console.log(`\nTrying: ${desc} (${pwd})`);
      
      const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
        data: {
          username: 'admin',
          password: pwd
        }
      });
      
      console.log(`  Status: ${response.status()}`);
      
      if (response.status() === 200) {
        console.log(`  ✅ SUCCESS! Password is: ${pwd}`);
        const body = await response.json();
        console.log(`  Token: ${body.token.substring(0, 20)}...`);
        break;
      } else {
        console.log(`  ❌ Failed`);
      }
    }
  });
  
});
