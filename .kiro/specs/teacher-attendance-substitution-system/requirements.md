# Requirements Document

## Introduction

The Teacher Attendance and Substitution Management System is a web-based application for Anuruddha Balika Vidyalaya (upper school) that enables administrators to track teacher attendance and efficiently allocate substitute teachers when regular teachers are absent. The system manages a complex timetable structure covering classes 6A through 13C, with 8 periods per day across multiple subjects and teachers.

The system will be built using the MERN stack (MongoDB, Express.js, React, Node.js) and will streamline the daily administrative workflow of managing teacher absences and ensuring all classes have appropriate coverage.

## Glossary

- **System**: The Teacher Attendance and Substitution Management System
- **Admin**: A user with administrative privileges who can manage attendance and allocate substitutes
- **Teacher**: A faculty member who teaches one or more subjects according to the timetable
- **Timetable**: The complete schedule of classes, periods, teachers, and subjects for the school
- **Period**: A time slot during the school day (8 instructional periods plus special periods)
- **Class**: A student group identified by grade and section (e.g., 6A, 10B, 13C)
- **Substitute_Teacher**: A teacher assigned to cover for an absent teacher during a specific period
- **Free_Teacher**: A teacher who has no scheduled class during a specific period
- **Attendance_Record**: A record indicating whether a teacher was present or absent on a specific date
- **Substitution_Record**: A record of a substitute teacher assignment for a specific period and class
- **School_Day**: A day when classes are scheduled (Monday through Friday)
- **Combined_Class**: A class period where multiple class sections are taught together (e.g., 6A/6B)
- **User**: An authenticated person who can access the System
- **Authentication_Token**: A credential used to verify a User's identity
- **Timetable_Parser**: A component that processes and stores timetable data into the database

## Requirements

### Requirement 1: User Authentication

**User Story:** As an Admin, I want to securely log into the system, so that I can access attendance and substitution management features.

#### Acceptance Criteria

1. WHEN a User submits valid credentials, THE System SHALL create an Authentication_Token and grant access
2. WHEN a User submits invalid credentials, THE System SHALL reject the login attempt and return an error message
3. THE System SHALL store passwords using cryptographic hashing
4. WHEN an Authentication_Token expires, THE System SHALL require the User to re-authenticate
5. THE System SHALL maintain session state for authenticated Users

### Requirement 2: User Role Management

**User Story:** As an Admin, I want the system to enforce role-based access control, so that only authorized users can perform administrative functions.

#### Acceptance Criteria

1. THE System SHALL assign each User exactly one role
2. WHEN a User with Admin role accesses administrative features, THE System SHALL grant access
3. WHEN a User without Admin role attempts to access administrative features, THE System SHALL deny access and return an authorization error
4. THE System SHALL store role assignments in the database
5. THE System SHALL validate User roles on every protected operation

### Requirement 3: Timetable Data Management

**User Story:** As an Admin, I want to store and manage the complete school timetable, so that the system can accurately track teacher schedules.

#### Acceptance Criteria

1. THE System SHALL store timetable data for all classes from 6A through 13C
2. THE System SHALL store period information including start time, end time, and period number for all 8 instructional periods
3. THE System SHALL store special periods including Religious Activities, Register Marking, and Interval
4. THE System SHALL associate each timetable entry with a Class, Period, Teacher, and Subject
5. THE System SHALL support Combined_Class entries where multiple class sections share a period
6. THE System SHALL support multiple teacher options for a single period
7. THE System SHALL store timetable data for all five School_Days (Monday through Friday)
8. WHEN an Admin updates timetable data, THE System SHALL validate that all required fields are present
9. THE System SHALL allow querying timetable data by Class, Teacher, Period, or School_Day

### Requirement 4: Teacher Attendance Recording

**User Story:** As an Admin, I want to mark teacher attendance for each day, so that I can track which teachers are present or absent.

#### Acceptance Criteria

1. WHEN an Admin marks a Teacher as present for a date, THE System SHALL create an Attendance_Record with status "present"
2. WHEN an Admin marks a Teacher as absent for a date, THE System SHALL create an Attendance_Record with status "absent"
3. THE System SHALL associate each Attendance_Record with a specific Teacher and date
4. WHEN an Admin attempts to create duplicate Attendance_Records for the same Teacher and date, THE System SHALL update the existing record
5. THE System SHALL display a list of all Teachers for attendance marking
6. THE System SHALL persist Attendance_Records to the database
7. WHEN an Admin views attendance for a date, THE System SHALL display the attendance status for all Teachers

### Requirement 5: Attendance History Viewing

**User Story:** As an Admin, I want to view historical attendance records, so that I can track attendance patterns over time.

#### Acceptance Criteria

1. WHEN an Admin requests attendance history for a date range, THE System SHALL return all Attendance_Records within that range
2. THE System SHALL support filtering attendance history by Teacher
3. THE System SHALL support filtering attendance history by date
4. THE System SHALL display attendance history in chronological order
5. WHEN no Attendance_Records match the filter criteria, THE System SHALL return an empty result set with an appropriate message

### Requirement 6: Free Teacher Identification

**User Story:** As an Admin, I want to see which teachers are free during a specific period, so that I can identify potential substitute teachers.

#### Acceptance Criteria

1. WHEN an Admin queries for Free_Teachers during a specific Period and School_Day, THE System SHALL return all Teachers who have no timetable entry for that Period
2. THE System SHALL exclude Teachers marked absent for the current date from the Free_Teachers list
3. THE System SHALL exclude Teachers already assigned as Substitute_Teachers for the queried Period from the Free_Teachers list
4. THE System SHALL return Free_Teachers with their names and subject specializations
5. WHEN no Free_Teachers are available for a Period, THE System SHALL return an empty list with an appropriate message

### Requirement 7: Substitute Teacher Allocation

**User Story:** As an Admin, I want to allocate a substitute teacher to cover an absent teacher's class, so that students receive instruction during the period.

#### Acceptance Criteria

1. WHEN an Admin selects a Free_Teacher to substitute for an absent Teacher during a specific Period, THE System SHALL create a Substitution_Record
2. THE System SHALL associate each Substitution_Record with the absent Teacher, Substitute_Teacher, Class, Period, and date
3. WHEN an Admin attempts to allocate a Teacher who is not free during the Period, THE System SHALL reject the allocation and return an error message
4. WHEN an Admin attempts to allocate a substitute for a Teacher not marked absent, THE System SHALL reject the allocation and return an error message
5. THE System SHALL persist Substitution_Records to the database
6. THE System SHALL allow an Admin to update an existing Substitution_Record with a different Substitute_Teacher
7. WHEN a Substitution_Record is created, THE System SHALL exclude the Substitute_Teacher from subsequent Free_Teachers queries for that Period and date

### Requirement 8: Substitution Record Viewing

**User Story:** As an Admin, I want to view all substitution assignments for a day, so that I can see the complete coverage plan.

#### Acceptance Criteria

1. WHEN an Admin requests substitution records for a specific date, THE System SHALL return all Substitution_Records for that date
2. THE System SHALL display each Substitution_Record with the absent Teacher name, Substitute_Teacher name, Class, Period, and Subject
3. THE System SHALL organize Substitution_Records by Period for easy reading
4. THE System SHALL support filtering Substitution_Records by Class
5. WHEN no Substitution_Records exist for a date, THE System SHALL return an empty result set with an appropriate message

### Requirement 9: Absent Teacher Period Coverage Tracking

**User Story:** As an Admin, I want to see which periods of an absent teacher still need substitute coverage, so that I can ensure all classes are covered.

#### Acceptance Criteria

1. WHEN an Admin views an absent Teacher's schedule for a date, THE System SHALL display all periods where the Teacher is scheduled to teach
2. FOR EACH period where the absent Teacher is scheduled, THE System SHALL indicate whether a Substitution_Record exists
3. THE System SHALL highlight periods without substitute coverage
4. THE System SHALL display the Class and Subject for each period
5. WHEN all periods have substitute coverage, THE System SHALL indicate that coverage is complete

### Requirement 10: Timetable Data Import

**User Story:** As an Admin, I want to import timetable data from structured files, so that I can populate the system without manual entry.

#### Acceptance Criteria

1. WHEN an Admin uploads a timetable file in JSON format, THE Timetable_Parser SHALL parse the file and extract timetable entries
2. WHEN the timetable file contains invalid data, THE Timetable_Parser SHALL return descriptive error messages indicating which entries are invalid
3. THE Timetable_Parser SHALL validate that each entry contains Class, Period, School_Day, Teacher, and Subject
4. WHEN timetable parsing succeeds, THE System SHALL store all entries in the database
5. THE System SHALL support bulk import of timetable data for all classes and periods
6. WHEN duplicate timetable entries are detected during import, THE System SHALL update existing entries rather than creating duplicates

### Requirement 11: API Error Handling

**User Story:** As a developer, I want the system to handle errors gracefully, so that users receive meaningful feedback when operations fail.

#### Acceptance Criteria

1. WHEN a database operation fails, THE System SHALL return an error response with status code 500 and a descriptive message
2. WHEN a User submits invalid input data, THE System SHALL return an error response with status code 400 and validation details
3. WHEN a User attempts an unauthorized operation, THE System SHALL return an error response with status code 403
4. WHEN a requested resource does not exist, THE System SHALL return an error response with status code 404
5. THE System SHALL log all errors with timestamp, error type, and context information
6. THE System SHALL not expose sensitive system information in error messages returned to Users

### Requirement 12: Data Persistence and Retrieval

**User Story:** As an Admin, I want all data to be reliably stored and retrieved, so that the system maintains accurate records over time.

#### Acceptance Criteria

1. THE System SHALL persist all Attendance_Records to MongoDB with atomic write operations
2. THE System SHALL persist all Substitution_Records to MongoDB with atomic write operations
3. THE System SHALL persist all Timetable entries to MongoDB with atomic write operations
4. THE System SHALL persist all User accounts to MongoDB with atomic write operations
5. WHEN the System retrieves data from MongoDB, THE System SHALL handle connection failures and return appropriate error messages
6. THE System SHALL maintain referential integrity between Substitution_Records and Teacher records
7. THE System SHALL maintain referential integrity between Timetable entries and Teacher records

### Requirement 13: User Interface Responsiveness

**User Story:** As an Admin, I want the user interface to be responsive and intuitive, so that I can efficiently perform daily tasks.

#### Acceptance Criteria

1. WHEN an Admin performs an action, THE System SHALL provide visual feedback within 100 milliseconds
2. WHEN the System processes a request, THE System SHALL display a loading indicator
3. WHEN an operation completes successfully, THE System SHALL display a success message
4. WHEN an operation fails, THE System SHALL display an error message with actionable information
5. THE System SHALL render the user interface correctly on desktop browsers and  with screen widths from 1024 pixels to 1920 pixels,, also on phone browsers
6. THE System SHALL use consistent styling and layout across all pages

### Requirement 14: Date and Time Handling

**User Story:** As an Admin, I want the system to correctly handle dates and times, so that attendance and substitution records are accurate.

#### Acceptance Criteria

1. THE System SHALL store all dates in ISO 8601 format
2. THE System SHALL store all times in 24-hour format
3. WHEN an Admin selects a date, THE System SHALL validate that the date is a School_Day (Monday through Friday)
4. THE System SHALL use the local timezone for all date and time operations
5. WHEN displaying dates to Users, THE System SHALL format dates in a human-readable format (e.g., "Monday, January 15, 2024")

### Requirement 15: System Configuration Management

**User Story:** As a system administrator, I want to configure system settings through environment variables, so that the system can be deployed in different environments.

#### Acceptance Criteria

1. THE System SHALL read database connection settings from environment variables
2. THE System SHALL read authentication secret keys from environment variables
3. THE System SHALL read server port configuration from environment variables
4. WHEN required environment variables are missing, THE System SHALL fail to start and log descriptive error messages
5. THE System SHALL not store sensitive configuration values in source code

