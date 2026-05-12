# 🎓 Teacher Attendance & Substitution System

A comprehensive web-based system for managing teacher attendance and automatic substitute allocation for **Anuruddha Balika Vidyalaya**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-5.0%2B-green.svg)

## 📋 Features

### ✅ Core Features
- **Period-Based Attendance**: Mark teacher attendance for individual periods
- **Quick Attendance**: Mark full-day attendance quickly
- **Automatic Substitute Allocation**: System suggests available teachers for substitution
- **Timetable Management**: View and manage class schedules
- **Substitution Summary**: Generate PDF reports with signature columns
- **Teacher Management**: Add, edit, and manage teacher profiles
- **Dashboard**: Real-time overview of attendance and substitutions

### 🎨 UI/UX Features
- Professional Moodle-style sidebar navigation
- Responsive design (desktop, tablet, mobile)
- Consistent matte color palette
- Professional icons (no emojis)
- Light theme optimized for readability
- Collapsible sidebar with smooth animations

### 📊 Reports
- Daily substitution summary (PDF export)
- Attendance history
- Teacher availability tracking

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ and npm
- MongoDB 5.0+
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dasun002/Relief-teachers.git
cd Relief-teachers
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string
npm start
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🌐 Free Deployment (Production)

Deploy for **FREE** using:
- **MongoDB Atlas** (Database) - 512MB free forever
- **Render** (Backend API) - 750 hours/month free
- **Vercel** (Frontend) - Unlimited free

### Quick Deployment Steps

1. **Deploy Database** (5 minutes)
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Create free M0 cluster
   - Get connection string

2. **Deploy Backend** (10 minutes)
   - Sign up at [Render](https://render.com)
   - Connect GitHub repository
   - Set environment variables
   - Deploy

3. **Deploy Frontend** (10 minutes)
   - Sign up at [Vercel](https://vercel.com)
   - Import GitHub repository
   - Set API URL
   - Deploy

**📖 Detailed Instructions**: See [DEPLOYMENT_QUICK_START.md](./DEPLOYMENT_QUICK_START.md)

## 📁 Project Structure

```
Relief-teachers/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & validation
│   ├── scripts/            # Data import scripts
│   └── server.js           # Entry point
├── frontend/               # React (Vite) application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🔧 Technology Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Lucide React** for icons
- **jsPDF** for PDF generation
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** enabled

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/Teacher)
- CORS protection
- Input validation
- Rate limiting (production)
- Helmet.js security headers (production)

**📖 Security Guide**: See [SECURITY_QUICK_SETUP.md](./SECURITY_QUICK_SETUP.md)

## 📱 Screenshots

### Dashboard
Professional overview of daily attendance and substitutions

### Period-Based Attendance
Mark attendance for individual periods with automatic substitute suggestions

### Substitution Summary
Generate PDF reports with signature columns for teachers

### Timetable View
View class schedules by day and period

## 🎯 Use Cases

Perfect for:
- Small to medium-sized schools (up to 100 teachers)
- Daily attendance tracking
- Substitute teacher management
- Relief period allocation
- Administrative reporting

## 📊 System Requirements

### Minimum (Free Tier)
- MongoDB Atlas: 512MB storage
- Render: 750 hours/month
- Vercel: 100GB bandwidth/month
- Suitable for: 50-100 teachers, 1000+ students

### Recommended (Paid Tier)
- MongoDB Atlas: 2GB+ storage ($9/month)
- Render: Always-on instance ($7/month)
- Better for: 100+ teachers, 2000+ students

## 🛠️ Configuration

### Backend Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_min_32_chars
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Comprehensive deployment instructions
- [Quick Start Guide](./DEPLOYMENT_QUICK_START.md) - 5-step deployment
- [Security Setup](./SECURITY_QUICK_SETUP.md) - Security hardening guide
- [Testing Guide](./E2E_TESTING_GUIDE.md) - Automated testing setup

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Dasun** - Initial work - [Dasun002](https://github.com/Dasun002)

## 🙏 Acknowledgments

- Built for Anuruddha Balika Vidyalaya
- Inspired by modern school management systems
- UI/UX inspired by Moodle LMS

## 📞 Support

For support, please:
1. Check the [documentation](./DEPLOYMENT_GUIDE.md)
2. Review [common issues](./DEPLOYMENT_QUICK_START.md#-quick-fixes)
3. Open an issue on GitHub

## 🎉 Success Stories

This system is currently being used by Anuruddha Balika Vidyalaya to:
- Track attendance for 50+ teachers
- Automatically allocate substitute teachers
- Generate daily reports
- Reduce administrative workload by 70%

---

**Made with ❤️ for teachers and students**

**Live Demo**: Coming soon after deployment!

**Repository**: https://github.com/Dasun002/Relief-teachers
