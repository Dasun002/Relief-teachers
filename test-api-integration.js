#!/usr/bin/env node

/**
 * API Integration Test Script
 * Tests critical API endpoints for the Teacher Attendance and Substitution Management System
 */

import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

const API_BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let testTeacherId = '';
let testSubstitutionId = '';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}Testing: ${testName}${colors.reset}`);
}

function logSuccess(message) {
  log(`  ✅ ${message}`, 'green');
}

function logError(message) {
  log(`  ❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, 'yellow');
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(name, passed, message) {
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
    logSuccess(message);
  } else {
    results.failed++;
    logError(message);
  }
}

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test 1: Authentication - Login
async function testLogin() {
  logTest('Authentication - Login');

  // Test with valid credentials
  const result = await apiRequest('POST', '/auth/login', {
    username: 'admin',
    password: 'admin123'
  });

  if (result.success && result.data.token) {
    authToken = result.data.token;
    recordTest('Login', true, 'Successfully logged in with valid credentials');
    recordTest('JWT Token', true, `Token received: ${authToken.substring(0, 20)}...`);
  } else {
    recordTest('Login', false, 'Failed to login with valid credentials');
    return false;
  }

  // Test with invalid credentials
  const invalidResult = await apiRequest('POST', '/auth/login', {
    username: 'admin',
    password: 'wrongpassword'
  });

  if (!invalidResult.success && invalidResult.status === 401) {
    recordTest('Invalid Login', true, 'Correctly rejected invalid credentials with 401');
  } else {
    recordTest('Invalid Login', false, 'Did not properly reject invalid credentials');
  }

  return true;
}

// Test 2: Teachers - Get All Teachers
async function testGetTeachers() {
  logTest('Teachers - Get All Teachers');

  const result = await apiRequest('GET', '/teachers');

  if (result.success && Array.isArray(result.data)) {
    recordTest('Get Teachers', true, `Retrieved ${result.data.length} teachers`);
    
    if (result.data.length > 0) {
      testTeacherId = result.data[0]._id;
      recordTest('Teacher Data', true, `Sample teacher: ${result.data[0].name}`);
    } else {
      logWarning('No teachers found in database');
      results.warnings++;
    }
  } else {
    recordTest('Get Teachers', false, 'Failed to retrieve teachers');
  }
}

// Test 3: Teachers - Create Teacher
async function testCreateTeacher() {
  logTest('Teachers - Create Teacher');

  const newTeacher = {
    name: 'Test Teacher ' + Date.now(),
    subjects: ['Mathematics', 'Science']
  };

  const result = await apiRequest('POST', '/teachers', newTeacher);

  if (result.success && result.data._id) {
    recordTest('Create Teacher', true, `Created teacher: ${result.data.name}`);
    testTeacherId = result.data._id;
  } else {
    recordTest('Create Teacher', false, 'Failed to create teacher');
  }
}

// Test 4: Timetable - Get Timetable
async function testGetTimetable() {
  logTest('Timetable - Get Timetable');

  // Test without filters
  const result = await apiRequest('GET', '/timetable');

  if (result.success && Array.isArray(result.data)) {
    recordTest('Get Timetable', true, `Retrieved ${result.data.length} timetable entries`);
    
    if (result.data.length === 0) {
      logWarning('No timetable entries found. Import XML file to populate.');
      results.warnings++;
    }
  } else {
    recordTest('Get Timetable', false, 'Failed to retrieve timetable');
  }

  // Test with class filter
  const classResult = await apiRequest('GET', '/timetable?class=6A');
  if (classResult.success) {
    recordTest('Filter by Class', true, `Retrieved ${classResult.data.length} entries for class 6A`);
  } else {
    recordTest('Filter by Class', false, 'Failed to filter by class');
  }
}

// Test 5: Attendance - Mark Attendance
async function testMarkAttendance() {
  logTest('Attendance - Mark Attendance');

  if (!testTeacherId) {
    logWarning('No teacher ID available, skipping attendance test');
    results.warnings++;
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  
  const attendanceData = {
    teacherId: testTeacherId,
    date: today,
    status: 'absent'
  };

  const result = await apiRequest('POST', '/attendance', attendanceData);

  if (result.success) {
    recordTest('Mark Attendance', true, `Marked teacher as absent for ${today}`);
  } else {
    recordTest('Mark Attendance', false, 'Failed to mark attendance');
  }
}

// Test 6: Attendance - Get Attendance
async function testGetAttendance() {
  logTest('Attendance - Get Attendance');

  const today = new Date().toISOString().split('T')[0];
  
  const result = await apiRequest('GET', `/attendance?date=${today}`);

  if (result.success && Array.isArray(result.data)) {
    recordTest('Get Attendance', true, `Retrieved ${result.data.length} attendance records for today`);
  } else {
    recordTest('Get Attendance', false, 'Failed to retrieve attendance');
  }
}

// Test 7: Free Teachers - Get Free Teachers
async function testGetFreeTeachers() {
  logTest('Free Teachers - Get Free Teachers');

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[today.getDay()];
  const dateStr = today.toISOString().split('T')[0];

  // Only test on weekdays
  if (dayName === 'Saturday' || dayName === 'Sunday') {
    logWarning('Today is weekend, skipping free teachers test');
    results.warnings++;
    return;
  }

  const result = await apiRequest('GET', `/teachers/free?period=1&day=${dayName}&date=${dateStr}`);

  if (result.success && Array.isArray(result.data)) {
    recordTest('Get Free Teachers', true, `Found ${result.data.length} free teachers for period 1`);
  } else {
    recordTest('Get Free Teachers', false, 'Failed to retrieve free teachers');
  }
}

// Test 8: Substitutions - Create Substitution
async function testCreateSubstitution() {
  logTest('Substitutions - Create Substitution');

  if (!testTeacherId) {
    logWarning('No teacher ID available, skipping substitution test');
    results.warnings++;
    return;
  }

  // First, get free teachers
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[today.getDay()];
  const dateStr = today.toISOString().split('T')[0];

  if (dayName === 'Saturday' || dayName === 'Sunday') {
    logWarning('Today is weekend, skipping substitution test');
    results.warnings++;
    return;
  }

  const freeTeachersResult = await apiRequest('GET', `/teachers/free?period=1&day=${dayName}&date=${dateStr}`);

  if (!freeTeachersResult.success || freeTeachersResult.data.length === 0) {
    logWarning('No free teachers available for substitution test');
    results.warnings++;
    return;
  }

  const substituteTeacherId = freeTeachersResult.data[0]._id;

  const substitutionData = {
    absentTeacherId: testTeacherId,
    substituteTeacherId: substituteTeacherId,
    class: '6A',
    period: 1,
    date: dateStr,
    subject: 'Mathematics'
  };

  const result = await apiRequest('POST', '/substitutions', substitutionData);

  if (result.success) {
    testSubstitutionId = result.data._id;
    recordTest('Create Substitution', true, 'Successfully created substitution');
  } else {
    recordTest('Create Substitution', false, `Failed to create substitution: ${result.error?.message || 'Unknown error'}`);
  }
}

// Test 9: Substitutions - Get Substitutions
async function testGetSubstitutions() {
  logTest('Substitutions - Get Substitutions');

  const today = new Date().toISOString().split('T')[0];
  
  const result = await apiRequest('GET', `/substitutions?date=${today}`);

  if (result.success && Array.isArray(result.data)) {
    recordTest('Get Substitutions', true, `Retrieved ${result.data.length} substitutions for today`);
  } else {
    recordTest('Get Substitutions', false, 'Failed to retrieve substitutions');
  }
}

// Test 10: Error Handling - Unauthorized Access
async function testUnauthorizedAccess() {
  logTest('Error Handling - Unauthorized Access');

  const tempToken = authToken;
  authToken = ''; // Remove token

  const result = await apiRequest('POST', '/teachers', {
    name: 'Unauthorized Teacher',
    subjects: ['Test']
  });

  authToken = tempToken; // Restore token

  if (!result.success && result.status === 401) {
    recordTest('Unauthorized Access', true, 'Correctly rejected request without token (401)');
  } else {
    recordTest('Unauthorized Access', false, 'Did not properly reject unauthorized request');
  }
}

// Test 11: Error Handling - Invalid Data
async function testInvalidData() {
  logTest('Error Handling - Invalid Data');

  // Try to create teacher with missing required fields
  const result = await apiRequest('POST', '/teachers', {
    name: '' // Empty name should fail validation
  });

  if (!result.success && result.status === 400) {
    recordTest('Invalid Data', true, 'Correctly rejected invalid data (400)');
  } else {
    recordTest('Invalid Data', false, 'Did not properly reject invalid data');
  }
}

// Print summary
function printSummary() {
  console.log('\n' + '='.repeat(60));
  log('TEST SUMMARY', 'cyan');
  console.log('='.repeat(60));
  
  log(`Total Tests: ${results.passed + results.failed}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Warnings: ${results.warnings}`, 'yellow');
  
  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : 'red');
  
  console.log('='.repeat(60));

  if (results.failed > 0) {
    log('\nFailed Tests:', 'red');
    results.tests.filter(t => !t.passed).forEach(t => {
      log(`  - ${t.name}: ${t.message}`, 'red');
    });
  }

  if (results.warnings > 0) {
    log('\nWarnings:', 'yellow');
    log('  Some tests were skipped due to missing data or weekend dates', 'yellow');
    log('  Import timetable XML and ensure test data exists for complete testing', 'yellow');
  }

  console.log('\n');
}

// Main test runner
async function runTests() {
  log('='.repeat(60), 'cyan');
  log('API INTEGRATION TEST SUITE', 'cyan');
  log('Teacher Attendance and Substitution Management System', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\nTesting API at: ${API_BASE_URL}`, 'blue');
  log(`Start Time: ${new Date().toLocaleString()}\n`, 'blue');

  try {
    // Run tests in sequence
    const loginSuccess = await testLogin();
    
    if (!loginSuccess) {
      logError('Authentication failed. Cannot proceed with other tests.');
      logWarning('Make sure the backend server is running and admin user exists.');
      logWarning('Run: cd backend && node createTestUser.js');
      printSummary();
      process.exit(1);
    }

    await testGetTeachers();
    await testCreateTeacher();
    await testGetTimetable();
    await testMarkAttendance();
    await testGetAttendance();
    await testGetFreeTeachers();
    await testCreateSubstitution();
    await testGetSubstitutions();
    await testUnauthorizedAccess();
    await testInvalidData();

    printSummary();

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);

  } catch (error) {
    logError(`\nUnexpected error during testing: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests();
