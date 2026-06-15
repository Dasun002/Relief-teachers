import { test, expect } from '@playwright/test';

test.describe('Create Fresh Admin User via Backend', () => {
  
  test('Step 1: Wait for Render deployment', async () => {
    console.log('⏳ Waiting for Render to deploy...');
    console.log('This usually takes 2-3 minutes.');
    console.log('Check: https://dashboard.render.com for "Live" status');
    
    // Wait 2 minutes
    await new Promise(resolve => setTimeout(resolve, 120000));
    
    console.log('✅ 2 minutes elapsed - Render should be deployed');
  });

  test('Step 2: Create admin user via /api/auth/register', async ({ request }) => {
    console.log('🔧 Registering new admin user...\n');
    
    const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/register', {
      data: {
        username: 'admin',
        password: 'Admin@2026',
        role: 'admin'
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('📊 Registration Response:');
    console.log('Status:', response.status());
    
    const body = await response.text();
    console.log('Body:', body);
    
    if (response.status() === 201) {
      const jsonBody = JSON.parse(body);
      console.log('\n✅ ADMIN USER CREATED SUCCESSFULLY!');
      console.log('Username:', jsonBody.data?.user?.username);
      console.log('Role:', jsonBody.data?.user?.role);
      console.log('\n🎉 You can now login with:');
      console.log('   Username: admin');
      console.log('   Password: Admin@2026');
      
      expect(response.status()).toBe(201);
    } else if (response.status() === 409) {
      console.log('\n⚠️  User already exists!');
      console.log('This means admin user is already in the database.');
      console.log('Try logging in with: admin / Admin@2026');
    } else {
      console.log('\n❌ Registration failed!');
      console.log('Status:', response.status());
      console.log('Error:', body);
    }
  });

  test('Step 3: Verify login works with new admin', async ({ request }) => {
    console.log('\n🔍 Testing login with newly created admin...\n');
    
    const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
      data: {
        username: 'admin',
        password: 'Admin@2026'
      },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Login Status:', response.status());
    
    if (response.status() === 200) {
      const body = await response.json();
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Token:', body.token?.substring(0, 30) + '...');
      console.log('User:', body.user?.username);
      console.log('Role:', body.user?.role);
      console.log('\n🎉 READY TO USE THE WEBSITE!');
      console.log('Go to: https://extraordinary-croquembouche-c5feb8.netlify.app/login');
      
      expect(response.status()).toBe(200);
      expect(body.token).toBeTruthy();
    } else {
      console.log('❌ Login failed');
      const body = await response.text();
      console.log('Error:', body);
    }
  });

  test('Step 4: Test actual website login', async ({ page }) => {
    console.log('\n🌐 Testing login on actual website...\n');
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
      }
    });
    
    // Go to login page
    await page.goto('https://extraordinary-croquembouche-c5feb8.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    // Fill credentials
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'Admin@2026');
    
    // Click login
    await page.click('button:has-text("Login")');
    
    // Wait for navigation
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (!currentUrl.includes('login')) {
      console.log('✅ LOGIN SUCCESSFUL! Redirected away from login page');
      console.log('✅ SYSTEM IS FULLY OPERATIONAL!');
      
      // Take success screenshot
      await page.screenshot({ path: 'test-results/login-success.png' });
    } else {
      console.log('❌ Still on login page - something went wrong');
      await page.screenshot({ path: 'test-results/login-failed.png' });
    }
  });

});

test.describe('Cleanup - Re-secure Register Endpoint', () => {
  
  test('IMPORTANT: Remember to re-secure the register endpoint!', async () => {
    console.log('\n⚠️  SECURITY REMINDER:');
    console.log('================================================');
    console.log('After admin user is created, you MUST re-secure');
    console.log('the /register endpoint by running:');
    console.log('');
    console.log('📝 Restore the authentication guards in:');
    console.log('   backend/routes/authRoutes.js');
    console.log('');
    console.log('Change this line:');
    console.log('   router.post(\'/register\', registerController);');
    console.log('');
    console.log('Back to:');
    console.log('   router.post(\'/register\', authenticate, requireAdmin, registerController);');
    console.log('');
    console.log('Then commit and push:');
    console.log('   git add backend/routes/authRoutes.js');
    console.log('   git commit -m "Security: re-secure register endpoint"');
    console.log('   git push origin main');
    console.log('================================================');
  });
  
});
