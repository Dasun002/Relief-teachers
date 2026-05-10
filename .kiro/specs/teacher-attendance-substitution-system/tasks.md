# Implementation Plan: Teacher Attendance and Substitution Management System

## Overview

This implementation plan breaks down the MERN stack web application into discrete, incremental coding tasks. The system will enable administrators at Anuruddha Balika Vidyalaya to track teacher attendance and allocate substitute teachers efficiently.

**Key Implementation Notes:**
- Technology Stack: MongoDB, Express.js, React, Node.js
- Data Source: XML format from aSc Timetables software (not JSON as originally specified)
- XML Parser: xml2js library for Node.js
- Mobile Support: Responsive design for mobile browsers in addition to desktop

## Tasks

- [x] 1. Set up project structure and dependencies
  - Initialize Node.js backend project with Express.js
  - Initialize React frontend project with Create React App or Vite
  - Install backend dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, xml2js
  - Install frontend dependencies: react-router-dom, axios
  - Set up project folder structure (backend: routes, controllers, services, models, middleware; frontend: components, contexts, services, pages)
  - Create .env.example files for both backend and frontend
  - Set up ESLint and Prettier for code formatting
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [x] 2. Set up MongoDB connection and base configuration
  - Create MongoDB connection module using Mongoose
  - Implement connection error handling and retry logic
  - Create environment variable configuration loader
  - Validate required environment variables on startup
  - Set up logging utility (Winston or Pino)
  - _Requirements: 12.1, 12.5, 15.1, 15.2, 15.3, 15.4_

- [x] 3. Implement database models and schemas
  - [x] 3.1 Create User model with schema validation
    - Define User schema with username, password, role, timestamps
    - Add unique index on username
    - Add index on role
    - Implement password hashing pre-save hook using bcrypt
    - _Requirements: 1.3, 2.1, 2.4, 12.4_
  
  - [x] 3.2 Create Teacher model with schema validation
    - Define Teacher schema with name, subjects array, timestamps
    - Add index on name
    - Implement validation for name (2-100 chars) and subjects (non-empty array)
    - _Requirements: 3.1, 12.7_
  
  - [x] 3.3 Create Timetable model with schema validation
    - Define Timetable schema with class, period, day, teacher (ref), subject, startTime, endTime, isCombinedClass, alternateTeachers
    - Add compound indexes: {class, day, period}, {teacher, day, period}, {day, period}
    - Add unique constraint on {class, day, period}
    - Implement validation for class pattern (6A-13C), period (1-8), day (weekday enum), time format
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 12.3, 12.7_
  
  - [x] 3.4 Create Attendance model with schema validation
    - Define Attendance schema with teacher (ref), date, status (enum: present/absent), timestamps
    - Add compound unique index on {teacher, date}
    - Add index on date
    - _Requirements: 4.1, 4.2, 4.3, 4.6, 12.1, 12.6_
  
  - [x] 3.5 Create Substitution model with schema validation
    - Define Substitution schema with absentTeacher (ref), substituteTeacher (ref), class, period, date, subject, timestamps
    - Add compound indexes: {date, period}, {substituteTeacher, date, period}, {absentTeacher, date}
    - Add index on class
    - Implement validation for class pattern, period (1-8), subject (2-50 chars)
    - _Requirements: 7.1, 7.2, 7.5, 12.2, 12.6_

- [x] 4. Implement XML parser for aSc Timetables data
  - [x] 4.1 Create XML parsing service using xml2js
    - Install and configure xml2js library
    - Create parseXML function to convert XML to JavaScript object
    - Implement error handling for malformed XML
    - _Requirements: 10.1, 10.2_
  
  - [x] 4.2 Create data transformation functions for aSc Timetables format
    - Parse teachers from XML (id, firstname, lastname, name, short)
    - Parse classes from XML (id, name, short, teacherid, grade)
    - Parse subjects from XML (id, name, short)
    - Parse periods from XML (period, name, starttime, endtime)
    - Parse days from daysdefs (Monday-Friday mapping)
    - Parse lessons from XML (classids, subjectid, teacherids, periodspercard, daysdefid)
    - Transform aSc Timetables lesson format to MongoDB timetable entries
    - Handle combined classes and multiple teacher options
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 10.3_
  
  - [ ]* 4.3 Write unit tests for XML parser
    - Test parsing valid XML structure
    - Test handling malformed XML
    - Test transformation of teachers, classes, subjects, periods
    - Test lesson-to-timetable entry conversion
    - Test combined class handling
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 5. Implement authentication services and middleware
  - [x] 5.1 Create authentication service
    - Implement user registration with password hashing
    - Implement login with credential validation
    - Implement JWT token generation with expiration
    - Implement token verification function
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 5.2 Create authentication middleware
    - Implement JWT token extraction from headers
    - Implement token verification middleware
    - Implement error handling for invalid/expired tokens
    - Attach user object to request on successful auth
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [x] 5.3 Create authorization middleware
    - Implement role-based access control middleware
    - Check user role against required role
    - Return 403 for unauthorized access
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [ ]* 5.4 Write unit tests for authentication services
    - Test password hashing
    - Test valid credential login
    - Test invalid credential rejection
    - Test JWT token generation and verification
    - Test expired token handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 6. Implement core business logic services
  - [x] 6.1 Create TimetableService
    - Implement findByClass(className, day) query method
    - Implement findByTeacher(teacherId, day) query method
    - Implement findByPeriod(period, day) query method
    - Implement bulkImport(entries) method with upsert logic
    - Implement validateEntry(entry) validation method
    - Add error handling for database operations
    - _Requirements: 3.8, 3.9, 10.4, 10.5, 10.6_
  
  - [x] 6.2 Create AttendanceService
    - Implement markAttendance(teacherId, date, status) with upsert logic
    - Implement getAttendanceByDate(date) query method
    - Implement getAttendanceByTeacher(teacherId, startDate, endDate) query method
    - Implement isTeacherAbsent(teacherId, date) check method
    - Add date validation (weekday only)
    - Add error handling for database operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 5.1, 5.2, 5.3, 5.4, 5.5, 14.3_
  
  - [x] 6.3 Create FreeTeacherAlgorithm service
    - Implement findFreeTeachers(period, day, date) algorithm
    - Query all teachers from database
    - Query timetable to find scheduled teachers for period/day
    - Query attendance to find absent teachers for date
    - Query substitutions to find already-assigned substitutes for period/date
    - Return teachers not in any of the above three lists
    - Implement isTeacherFree(teacherId, period, day, date) check method
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 6.4 Create SubstitutionService
    - Implement allocateSubstitute(data) method with validation
    - Validate absent teacher is marked absent for date
    - Validate substitute teacher is free using FreeTeacherAlgorithm
    - Create substitution record in database
    - Implement updateSubstitute(substitutionId, newSubstituteId) method
    - Implement getSubstitutionsByDate(date) query method
    - Implement getSubstitutionsByClass(className, date) query method
    - Implement getCoverageStatus(teacherId, date) method
    - Add error handling with descriptive business rule error messages
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 6.5 Write unit tests for business logic services
    - Test TimetableService query methods with various filters
    - Test AttendanceService upsert behavior for duplicate records
    - Test FreeTeacherAlgorithm excludes scheduled, absent, and assigned teachers
    - Test SubstitutionService validation rejects invalid allocations
    - Test getCoverageStatus correctly identifies uncovered periods
    - _Requirements: 3.9, 4.4, 6.1, 6.2, 6.3, 6.5, 7.3, 7.4, 9.1, 9.2, 9.5_

- [x] 7. Checkpoint - Ensure backend services are working
  - Run all unit tests and verify they pass
  - Test database connection and model operations manually
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement API routes and controllers
  - [x] 8.1 Create authentication routes and controller
    - POST /api/auth/login - authenticate user and return JWT
    - POST /api/auth/register - create new user (admin only)
    - Implement request validation for login and register
    - Implement error responses (400, 401, 403, 409)
    - _Requirements: 1.1, 1.2, 2.2, 2.3, 11.2, 11.3_
  
  - [x] 8.2 Create teacher routes and controller
    - GET /api/teachers - retrieve all teachers
    - POST /api/teachers - create new teacher (admin only)
    - Implement authentication middleware on all routes
    - Implement authorization middleware on POST route
    - Implement error responses (400, 403, 500)
    - _Requirements: 2.2, 2.3, 11.1, 11.2, 11.3_
  
  - [x] 8.3 Create timetable routes and controller
    - GET /api/timetable - query timetable with filters (class, teacher, day, period)
    - POST /api/timetable/import - bulk import timetable from XML
    - Implement XML file upload handling (multer middleware)
    - Call XML parser service to parse uploaded file
    - Call TimetableService.bulkImport with parsed data
    - Return import summary (imported count, updated count, errors)
    - Implement error responses (400, 403, 500)
    - _Requirements: 3.8, 3.9, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.1, 11.2, 11.3_
  
  - [x] 8.4 Create attendance routes and controller
    - POST /api/attendance - mark teacher attendance (admin only)
    - GET /api/attendance - query attendance with filters (date, startDate, endDate, teacherId)
    - GET /api/attendance/date/:date - get all attendance for specific date
    - Implement date validation and parsing
    - Implement error responses (400, 403, 500)
    - _Requirements: 4.1, 4.2, 4.4, 4.7, 5.1, 5.2, 5.3, 5.5, 11.1, 11.2, 11.3, 14.1, 14.3_
  
  - [x] 8.5 Create substitution routes and controller
    - POST /api/substitutions - allocate substitute teacher (admin only)
    - GET /api/substitutions - query substitutions with filters (date, class, period)
    - PUT /api/substitutions/:id - update substitution (admin only)
    - GET /api/substitutions/coverage/:teacherId/:date - get coverage status
    - Implement validation and error responses (400, 403, 404, 500)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 11.1, 11.2, 11.3, 11.4_
  
  - [x] 8.6 Create free teacher routes and controller
    - GET /api/teachers/free - get available substitute teachers for period
    - Require query parameters: period, day, date
    - Call FreeTeacherAlgorithm.findFreeTeachers
    - Implement error responses (400, 500)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 11.1, 11.2_

- [x] 9. Implement global error handling middleware
  - Create custom error classes (BusinessError, DatabaseError, ValidationError)
  - Implement global error handler middleware
  - Map error types to HTTP status codes
  - Sanitize error messages for production (hide stack traces, database details)
  - Implement structured error logging with context
  - Return standardized error response format
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 10. Set up Express server with middleware
  - Create Express app instance
  - Configure CORS middleware
  - Configure JSON body parser
  - Configure file upload middleware (multer) for XML import
  - Mount authentication routes
  - Mount teacher routes
  - Mount timetable routes
  - Mount attendance routes
  - Mount substitution routes
  - Mount free teacher routes
  - Mount global error handler (last middleware)
  - Start server on configured port
  - _Requirements: 15.3_

- [ ]* 11. Write integration tests for API endpoints
  - Set up MongoDB Memory Server for isolated testing
  - Test authentication endpoints (login, register)
  - Test teacher endpoints (GET, POST)
  - Test timetable endpoints (GET, POST with XML file)
  - Test attendance endpoints (POST, GET with filters)
  - Test substitution endpoints (POST, GET, PUT, coverage)
  - Test free teacher endpoint with various scenarios
  - Test error responses (401, 403, 400, 404, 500)
  - _Requirements: All API-related requirements_

- [x] 12. Checkpoint - Ensure backend API is complete
  - Run all integration tests and verify they pass
  - Test API endpoints manually using Postman or curl
  - Verify error handling works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Implement React frontend - Authentication and routing
  - [x] 13.1 Create authentication context and provider
    - Implement AuthContext with user, token, isAuthenticated state
    - Implement login(username, password) method
    - Implement logout() method
    - Implement checkAuth() method to verify token on mount
    - Store JWT token in localStorage
    - _Requirements: 1.1, 1.4, 1.5_
  
  - [x] 13.2 Create API client service
    - Create axios instance with base URL configuration
    - Implement request interceptor to attach JWT token to headers
    - Implement response interceptor to handle 401 errors (logout)
    - Create API methods for all backend endpoints
    - _Requirements: 1.1, 1.4_
  
  - [x] 13.3 Create routing structure with React Router
    - Set up React Router with BrowserRouter
    - Create LoginPage route
    - Create Dashboard route (protected)
    - Create ProtectedRoute component to check authentication
    - Redirect to login if not authenticated
    - _Requirements: 1.1, 2.2, 2.3_

- [x] 14. Implement React frontend - Login page
  - Create LoginPage component with form
  - Implement username and password input fields
  - Implement form validation (required fields)
  - Call AuthContext.login on form submit
  - Display error messages for invalid credentials
  - Display loading state during authentication
  - Redirect to dashboard on successful login
  - _Requirements: 1.1, 1.2, 13.3, 13.4_

- [x] 15. Implement React frontend - Dashboard layout
  - Create Dashboard component with navigation
  - Create Navigation component with links to all pages
  - Implement logout button
  - Create responsive layout for desktop and mobile
  - Apply consistent styling across all pages
  - _Requirements: 13.5, 13.6_

- [x] 16. Implement React frontend - Teacher management page
  - Create TeacherManagementPage component
  - Create TeacherList component to display all teachers
  - Create TeacherForm component to add new teachers
  - Implement form validation (name, subjects)
  - Call API to fetch teachers on mount
  - Call API to create teacher on form submit
  - Display success/error messages
  - Display loading states
  - _Requirements: 2.2, 2.3, 13.1, 13.2, 13.3, 13.4_

- [x] 17. Implement React frontend - Timetable page
  - [x] 17.1 Create TimetablePage component
    - Create TimetableFilters component (class, teacher, day, period)
    - Create TimetableGrid component to display timetable entries
    - Fetch timetable data based on selected filters
    - Display timetable in organized grid format
    - _Requirements: 3.9, 13.1, 13.2_
  
  - [x] 17.2 Create TimetableImport component
    - Create file upload input for XML files
    - Implement file validation (XML format)
    - Call API to upload and import XML file
    - Display import progress indicator
    - Display import summary (imported, updated, errors)
    - Display error messages for invalid files
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6, 13.2, 13.3, 13.4_

- [x] 18. Implement React frontend - Attendance page
  - [x] 18.1 Create AttendancePage component with date selector
    - Create DatePicker component for date selection
    - Validate selected date is a weekday
    - Display error for weekend dates
    - _Requirements: 4.1, 4.2, 13.1, 14.3, 14.5_
  
  - [x] 18.2 Create AttendanceForm component
    - Create TeacherList component with present/absent toggles
    - Fetch all teachers on mount
    - Fetch existing attendance for selected date
    - Pre-populate form with existing attendance status
    - Implement toggle functionality for each teacher
    - Call API to submit attendance on form submit
    - Display success message on successful submission
    - Display loading state during submission
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.7, 13.1, 13.2, 13.3, 13.4_
  
  - [x] 18.3 Create AttendanceHistory component
    - Create date range selector (startDate, endDate)
    - Create teacher filter dropdown
    - Fetch attendance records based on filters
    - Display attendance records in chronological order
    - Display empty state when no records found
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 13.1, 13.2, 14.5_

- [x] 19. Implement React frontend - Substitution page
  - [x] 19.1 Create SubstitutionPage component with date selector
    - Create DatePicker component for date selection
    - Validate selected date is a weekday
    - Fetch absent teachers for selected date
    - Display message if no absent teachers
    - _Requirements: 7.1, 7.3, 7.4, 13.1, 14.3_
  
  - [x] 19.2 Create AbsentTeacherList component
    - Display list of absent teachers for selected date
    - For each absent teacher, show their scheduled periods
    - Highlight periods without substitute coverage
    - Implement "Allocate Substitute" button for each uncovered period
    - _Requirements: 7.1, 9.1, 9.2, 9.3, 9.4, 9.5, 13.1, 13.2_
  
  - [x] 19.3 Create FreeTeacherList component
    - Fetch free teachers for selected period, day, and date
    - Display list of available teachers with their subjects
    - Implement "Select" button for each teacher
    - Display empty state when no free teachers available
    - Display loading state while fetching
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.1, 13.2_
  
  - [x] 19.4 Create SubstitutionForm component
    - Display absent teacher, class, period, subject information
    - Display selected substitute teacher
    - Implement form submission to allocate substitute
    - Display success message on successful allocation
    - Display error message if allocation fails (teacher not free, teacher not absent)
    - Update AbsentTeacherList to reflect new coverage
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 13.2, 13.3, 13.4_
  
  - [x] 19.5 Create SubstitutionSummary component
    - Fetch all substitutions for selected date
    - Display substitutions organized by period
    - Show absent teacher, substitute teacher, class, subject for each
    - Implement filter by class
    - Display empty state when no substitutions exist
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 13.1, 13.2_

- [x] 20. Implement responsive design for mobile browsers
  - Apply responsive CSS for all components
  - Test layout on screen widths from 320px (mobile) to 1920px (desktop)
  - Implement mobile-friendly navigation (hamburger menu)
  - Ensure touch-friendly button sizes (minimum 44x44px)
  - Test on actual mobile browsers (Chrome Mobile, Safari Mobile)
  - Optimize table displays for small screens (horizontal scroll or stacked layout)
  - _Requirements: 13.5, 13.6_

- [x] 21. Implement date and time formatting utilities
  - Create utility functions for date formatting (ISO 8601 storage, human-readable display)
  - Create utility functions for time formatting (24-hour format)
  - Create utility function for weekday validation
  - Use utilities consistently across frontend and backend
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 22. Implement loading states and user feedback
  - Add loading spinners for all async operations
  - Add success toast notifications for successful operations
  - Add error toast notifications for failed operations
  - Ensure visual feedback within 100ms of user action
  - Implement consistent styling for all feedback messages
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 23. Write end-to-end tests for critical workflows
  - Set up Cypress or Playwright for E2E testing
  - Test user authentication flow (login, logout)
  - Test mark daily attendance workflow
  - Test allocate substitute teacher workflow
  - Test view timetable workflow
  - Test view attendance history workflow
  - Test timetable XML import workflow
  - _Requirements: All user-facing requirements_

- [x] 24. Final checkpoint - Complete system integration
  - Run all unit tests, integration tests, and E2E tests
  - Test complete workflows manually on both desktop and mobile
  - Verify error handling works correctly across all pages
  - Verify responsive design works on multiple screen sizes
  - Test with actual aSc Timetables XML file
  - Verify all environment variables are documented
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 25. Create deployment documentation and scripts
  - Create README.md with setup instructions
  - Document all environment variables required
  - Create database seed script for initial admin user
  - Create deployment guide for production environment
  - Document how to import timetable XML file
  - Create backup and restore procedures for MongoDB
  - _Requirements: 15.1, 15.2, 15.3, 15.4_

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The implementation uses JavaScript/TypeScript for the MERN stack
- XML parsing replaces the originally specified JSON import format to match the actual data source
- Mobile responsiveness is a key requirement and should be tested throughout development
- All date/time handling must follow ISO 8601 and 24-hour format standards
- Authentication and authorization must be implemented before any admin-only features
