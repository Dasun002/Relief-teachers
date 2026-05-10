import express from 'express';
import cors from 'cors';
import { validateEnv, config } from './config/env.js';
import { connectDB } from './config/database.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import substitutionRoutes from './routes/substitutionRoutes.js';

// Import error handler middleware
import errorHandler from './middleware/errorHandler.js';

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = config.port;

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.logRequest(req);
  next();
});

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/substitutions', substitutionRoutes);

// Register global error handler (MUST be last middleware)
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Database connection established');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`CORS enabled for: ${config.corsOrigin}`);
    });
  } catch (error) {
    logger.logError(error, { context: 'Server startup' });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
