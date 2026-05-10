# Teacher Attendance and Substitution Management System

A MERN stack web application for Anuruddha Balika Vidyalaya (upper school) that enables administrators to track teacher attendance and efficiently allocate substitute teachers.

## 🎉 System Status: FULLY OPERATIONAL

**Version**: 2.0  
**Last Updated**: May 10, 2026  
**Status**: ✅ Production Ready

## ✨ Features

### Core Features
- ✅ User authentication and authorization (JWT)
- ✅ Teacher attendance tracking (full day and period-based)
- ✅ Free teacher identification algorithm
- ✅ Substitute teacher allocation
- ✅ **Change substitute after allocation** (NEW)
- ✅ Timetable management with XML import from aSc Timetables
- ✅ Attendance history viewing
- ✅ Real-time coverage status tracking

### UI/UX Features
- ✅ Professional navigation system with breadcrumbs
- ✅ Modern, pleasant UI theme (soft blue-to-teal gradient)
- ✅ Mobile-responsive design
- ✅ User menu dropdown
- ✅ Visual status indicators
- ✅ Smooth animations and transitions

### Recent Enhancements (May 10, 2026)
- ✅ Global navigation bar with persistent menu
- ✅ Complete UI theme overhaul
- ✅ Flexible subject requirements (any teacher can substitute)
- ✅ Change substitute feature
- ✅ Period-based absence support
- ✅ Comprehensive E2E testing with Playwright

## Technology Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Data Import**: XML parsing with xml2js

## Project Structure

```
.
├── backend/          # Node.js/Express backend
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── frontend/         # React frontend
│   └── src/
│       ├── components/  # React components
│       ├── contexts/    # React contexts
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── utils/       # Utility functions
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Adjust other settings as needed

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend server will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## Environment Variables

### Backend (.env)

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration time
- `CORS_ORIGIN` - Allowed CORS origin

### Frontend (.env)

- `VITE_API_BASE_URL` - Backend API base URL

## Development

### Running the Backend

```bash
cd backend
npm run dev  # Runs with nodemon on port 5000
```

### Running the Frontend

```bash
cd frontend
npm run dev  # Runs with Vite on port 5173
```

### Running Tests

```bash
cd frontend
npx playwright test              # Run all tests
npx playwright test --ui         # Run in UI mode
npx playwright test --headed     # Run with browser visible
```

### Linting and Formatting

Backend:
```bash
cd backend
npm run lint
npm run format
```

## 🎯 Key Workflows

### Mark Teacher Absent
```
Dashboard → Mark Attendance → Select Date → Mark by Period → Select Periods → Submit
```

### Allocate Substitute
```
Dashboard → Allocate Substitute → Select Date → Allocate Substitute → Select Teacher → Confirm
```

### Change Substitute
```
Allocate Substitute → Select Date → Change Substitute → Select New Teacher → Confirm
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/free` - Get free teachers for period

### Attendance
- `POST /api/attendance` - Mark full day absence
- `POST /api/attendance/periods` - Mark period-based absence
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/schedule/:teacherId/:date` - Get schedule with attendance

### Substitutions
- `POST /api/substitutions` - Create substitution
- `GET /api/substitutions` - Get substitutions by date
- `PUT /api/substitutions/:id` - Update substitution (change substitute)
- `GET /api/substitutions/coverage/:teacherId/:date` - Get coverage status

### Timetable
- `GET /api/timetable` - Get timetable entries
- `POST /api/timetable/import` - Import from XML
- `DELETE /api/timetable` - Clear timetable

See [COMPLETE_SYSTEM_SUMMARY.md](COMPLETE_SYSTEM_SUMMARY.md) for detailed API documentation.

## 🚀 Quick Start

### For Users
1. Open http://localhost:5173
2. Login with **admin** / **admin123**
3. See **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** for detailed instructions

### For Developers
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. See **[COMPLETE_SYSTEM_SUMMARY.md](COMPLETE_SYSTEM_SUMMARY.md)** for complete documentation

## 📚 Documentation

**Start Here**:
- **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** - Get started in 5 minutes ⭐
- **[COMPLETE_SYSTEM_SUMMARY.md](COMPLETE_SYSTEM_SUMMARY.md)** - Complete system overview ⭐
- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - All documentation index

**User Guides**:
- [HOW_TO_USE_NEW_NAVIGATION.md](HOW_TO_USE_NEW_NAVIGATION.md) - Navigation system
- [CHANGE_SUBSTITUTE_TESTING_GUIDE.md](CHANGE_SUBSTITUTE_TESTING_GUIDE.md) - Change substitute feature

**Technical Docs**:
- [SESSION_SUMMARY.md](SESSION_SUMMARY.md) - Implementation details
- [THEME_IMPROVEMENTS.md](THEME_IMPROVEMENTS.md) - UI theme system
- [CHANGE_SUBSTITUTE_FEATURE.md](CHANGE_SUBSTITUTE_FEATURE.md) - Feature implementation

**Testing**:
- [E2E_TESTING_GUIDE.md](E2E_TESTING_GUIDE.md) - Playwright testing
- 24+ automated tests with Playwright

See [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) for complete list of 18 documents.

## License

ISC

---

## 📊 Project Statistics

- **Total Files**: 100+ source files
- **Lines of Code**: ~10,000+
- **Documentation**: 18 comprehensive documents
- **Tests**: 24+ automated E2E tests
- **Features**: 8 major features
- **Bug Fixes**: 3 critical fixes applied

## 🎉 Acknowledgments

- Built with React, Express, MongoDB
- UI inspired by modern design principles
- Testing with Playwright
- Developed for Anuruddha Balika Vidyalaya

---

**For complete information, see [COMPLETE_SYSTEM_SUMMARY.md](COMPLETE_SYSTEM_SUMMARY.md)**
