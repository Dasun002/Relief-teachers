import express from 'express';
import {
  markAttendance,
  markPeriodAttendance,
  getScheduleWithAttendance,
  queryAttendance,
  getAttendanceByDate,
} from '../controllers/attendanceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

/**
 * @route   POST /api/attendance
 * @desc    Mark teacher attendance (admin only) - whole day
 * @access  Private (Admin)
 * @body    { teacherId, date, status }
 */
router.post('/', authenticate, requireAdmin, markAttendance);

/**
 * @route   POST /api/attendance/periods
 * @desc    Mark period-based attendance (admin only)
 * @access  Private (Admin)
 * @body    { teacherId, date, absentPeriods }
 */
router.post('/periods', authenticate, requireAdmin, markPeriodAttendance);

/**
 * @route   GET /api/attendance/schedule/:teacherId/:date
 * @desc    Get teacher schedule with attendance status
 * @access  Private
 * @param   teacherId - Teacher ID
 * @param   date - Date in YYYY-MM-DD format
 */
router.get('/schedule/:teacherId/:date', authenticate, getScheduleWithAttendance);

/**
 * @route   GET /api/attendance
 * @desc    Query attendance with filters
 * @access  Private
 * @query   date - Single date (YYYY-MM-DD)
 * @query   teacherId - Teacher ID (requires startDate and endDate)
 * @query   startDate - Start date for range query (YYYY-MM-DD)
 * @query   endDate - End date for range query (YYYY-MM-DD)
 */
router.get('/', authenticate, queryAttendance);

/**
 * @route   GET /api/attendance/date/:date
 * @desc    Get all attendance for a specific date
 * @access  Private
 * @param   date - Date in YYYY-MM-DD format
 */
router.get('/date/:date', authenticate, getAttendanceByDate);

export default router;
