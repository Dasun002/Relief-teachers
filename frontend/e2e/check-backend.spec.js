import { test, expect } from '@playwright/test';

test('Check backend authentication endpoint details', async ({ request }) => {
  console.log('🔍 Sending login request...');
  
  const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
    data: {
      username: 'admin',
      password: 'Admin@2026'
    },
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  console.log('\n📊 RESPONSE DETAILS:');
  console.log('Status:', response.status());
  console.log('Status Text:', response.statusText());
  
  const body = await response.text();
  console.log('Body:', body);
  
  let jsonBody;
  try {
    jsonBody = JSON.parse(body);
    console.log('\n📋 PARSED ERROR:');
    console.log('Success:', jsonBody.success);
    console.log('Error Code:', jsonBody.error?.code);
    console.log('Error Message:', jsonBody.error?.message);
  } catch (e) {
    console.log('Could not parse as JSON');
  }
  
  console.log('\n🔍 DIAGNOSIS:');
  if (response.status() === 401) {
    console.log('❌ Authentication failed');
    console.log('   This means ONE of these:');
    console.log('   1. User "admin" does not exist in MongoDB');
    console.log('   2. Password hash does not match "Admin@2026"');
    console.log('   3. User exists but role/status issue');
  }
  
  // Don't fail the test, just report
  console.log('\n✅ Test complete - check output above');
});

test('Try with different usernames', async ({ request }) => {
  console.log('\n🔍 Testing different usernames...\n');
  
  const usernames = ['admin', 'aadmin', 'Admin', 'administrator', 'root'];
  
  for (const username of usernames) {
    console.log(`Trying username: "${username}"`);
    
    const response = await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
      data: {
        username: username,
        password: 'Admin@2026'
      }
    });
    
    if (response.status() === 200) {
      console.log(`  ✅ SUCCESS! Working username is: "${username}"`);
      const body = await response.json();
      console.log(`  Token received: ${body.token?.substring(0, 20)}...`);
      break;
    } else {
      console.log(`  ❌ Failed (${response.status()})`);
    }
  }
});

test('Check backend logs hint', async ({ request }) => {
  console.log('\n💡 WHAT TO DO NEXT:\n');
  console.log('1. Go to Render dashboard');
  console.log('2. Click "Logs" tab');
  console.log('3. Look for lines that say:');
  console.log('   - "Login attempt for user: admin"');
  console.log('   - "User not found"');
  console.log('   - "Password comparison failed"');
  console.log('   - Or any authentication error');
  console.log('\nThis will tell us EXACTLY what the backend sees!');
  
  // Make a request to trigger logs
  await request.post('https://teacher-attendance-api-v2.onrender.com/api/auth/login', {
    data: {
      username: 'admin',
      password: 'Admin@2026'
    }
  });
  
  console.log('\n✅ Request sent - check Render logs NOW!');
});
