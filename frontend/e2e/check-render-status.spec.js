import { test } from '@playwright/test';

test('Check if Render deployment is complete', async ({ request }) => {
  console.log('🔍 Checking Render deployment status...\n');
  
  try {
    const response = await request.get('https://teacher-attendance-api-v2.onrender.com/api/health', {
      timeout: 10000
    });
    
    if (response.status() === 200) {
      const body = await response.json();
      console.log('✅ RENDER IS LIVE!');
      console.log('Status:', body.status);
      console.log('Message:', body.message);
      console.log('\n🎯 READY TO CREATE ADMIN USER!');
      console.log('\nRun this command now:');
      console.log('npx playwright test e2e/create-admin.spec.js --reporter=line');
    } else {
      console.log('⚠️  Render responded but with status:', response.status());
      console.log('Wait another minute and try again.');
    }
  } catch (error) {
    console.log('❌ Render is not responding yet');
    console.log('Error:', error.message);
    console.log('\n⏳ Deployment still in progress...');
    console.log('Wait 1-2 more minutes and run this test again:');
    console.log('npx playwright test e2e/check-render-status.spec.js');
  }
});
