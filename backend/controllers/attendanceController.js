import AttendanceService from '../services/AttendanceService.js';
import logger from '../utils/logger.js';

/**
 * Validate date format (ISO 8601: YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
const isValidDateFormat = (dateString) => {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso8601Regex.test(dateString)) {
    return false;
  }

  // Check if date is valid
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate date is a weekday (Monday-Friday)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if weekday
 */
const isWeekday = (dateString) => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday = 1, Friday = 5
};

/**
 * Mark teacher attendance
 * POST /api/attendance
 * Body: { teacherId, date, status }
 */
const markAttendance = async (req, res) => {
  try {
    const { teacherId, date, status } = req.body;

    // Validate required fields
    if (!teacherId || !date || !status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'teacherId, date, and status are required',
        },
      });
    }

    // Validate date format
    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Validate date is a weekday
    if (!isWeekday(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Attendance can only be recorded for weekdays (Monday-Friday)',
        },
      });
    }

    // Validate status
    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status must be either "present" or "absent"',
        },
      });
    }

    // Mark attendance using service
    const attendance = await AttendanceService.markAttendance(teacherId, date, status);

    res.status(200).json({
      success: true,
      data: { attendance },
    });
  } catch (error) {
    logger.error('Mark attendance error', { error: error.message });

    // Handle specific errors
    if (error.message === 'Teacher not found') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Teacher not found',
        },
      });
    }

    if (error.message.includes('weekday')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to mark attendance',
      },
    });
  }
};

/**
 * Mark period-based attendance
 * POST /api/attendance/periods
 * Body: { teacherId, date, absentPeriods }
 */
const markPeriodAttendance = async (req, res) => {
  try {
    const { teacherId, date, absentPeriods } = req.body;

    // Validate required fields
    if (!teacherId || !date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'teacherId and date are required',
        },
      });
    }

    // Validate date format
    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Validate date is a weekday
    if (!isWeekday(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Attendance can only be recorded for weekdays (Monday-Friday)',
        },
      });
    }

    // Validate absentPeriods is an array
    if (absentPeriods && !Array.isArray(absentPeriods)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'absentPeriods must be an array of period numbers',
        },
      });
    }

    // Mark period attendance using service
    const attendance = await AttendanceService.markPeriodAttendance(
      teacherId,
      date,
      absentPeriods || []
    );

    res.status(200).json({
      success: true,
      data: { attendance },
    });
  } catch (error) {
    logger.error('Mark period attendance error', { error: error.message });

    // Handle specific errors
    if (error.message === 'Teacher not found') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Teacher not found',
        },
      });
    }

    if (error.message.includes('weekday')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    if (error.message.includes('period')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to mark period attendance',
      },
    });
  }
};

/**
 * Get teacher schedule with attendance status
 * GET /api/attendance/schedule/:teacherId/:date
 */
const getScheduleWithAttendance = async (req, res) => {
  try {
    const { teacherId, date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Get schedule with attendance
    const scheduleData = await AttendanceService.getScheduleWithAttendance(teacherId, date);

    res.status(200).json({
      success: true,
      data: scheduleData,
    });
  } catch (error) {
    logger.error('Get schedule with attendance error', { error: error.message });

    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Teacher not found',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve schedule with attendance',
      },
    });
  }
};

/**
 * Query attendance with filters
 * GET /api/attendance
 * Query params: date, startDate, endDate, teacherId
 */
const queryAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate, teacherId } = req.query;

    let records = [];

    // Validate date formats if provided
    if (date && !isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    if (startDate && !isValidDateFormat(startDate)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid startDate format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    if (endDate && !isValidDateFormat(endDate)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid endDate format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Query based on provided filters
    if (date) {
      // Single date query
      records = await AttendanceService.getAttendanceByDate(date);
    } else if (teacherId && startDate && endDate) {
      // Teacher with date range
      records = await AttendanceService.getAttendanceByTeacher(teacherId, startDate, endDate);
    } else if (teacherId) {
      // Teacher without date range - return error
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'When querying by teacherId, both startDate and endDate are required',
        },
      });
    } else {
      // No filters provided
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least one filter is required: date, or teacherId with startDate and endDate',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        attendance: records,
        count: records.length,
      },
    });
  } catch (error) {
    logger.error('Query attendance error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to query attendance',
      },
    });
  }
};

/**
 * Get all attendance for a specific date
 * GET /api/attendance/date/:date
 */
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.params;

    // Validate date format
    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Get attendance records
    const records = await AttendanceService.getAttendanceByDate(date);

    res.status(200).json({
      success: true,
      data: {
        date,
        attendance: records,
        count: records.length,
      },
    });
  } catch (error) {
    logger.error('Get attendance by date error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve attendance',
      },
    });
  }
};

export { markAttendance, markPeriodAttendance, getScheduleWithAttendance, queryAttendance, getAttendanceByDate };
