import SubstitutionService from '../services/SubstitutionService.js';
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
 * Allocate substitute teacher
 * POST /api/substitutions
 * Body: { absentTeacherId, substituteTeacherId, class, period, date, subject }
 */
const allocateSubstitute = async (req, res) => {
  try {
    const { absentTeacherId, substituteTeacherId, class: className, period, date, subject } = req.body;

    // Validate required fields
    if (!absentTeacherId || !substituteTeacherId || !className || !period || !date || !subject) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'absentTeacherId, substituteTeacherId, class, period, date, and subject are required',
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

    // Validate period is a number between 1-8
    const periodNum = parseInt(period);
    if (isNaN(periodNum) || periodNum < 1 || periodNum > 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Period must be a number between 1 and 8',
        },
      });
    }

    // Allocate substitute using service
    const substitution = await SubstitutionService.allocateSubstitute({
      absentTeacherId,
      substituteTeacherId,
      class: className,
      period: periodNum,
      date,
      subject,
    });

    res.status(201).json({
      success: true,
      data: { substitution },
    });
  } catch (error) {
    logger.error('Allocate substitute error', { 
      error: error.message,
      stack: error.stack,
      body: req.body
    });

    // Handle specific errors
    if (error.message === 'Teacher not found' || error.message === 'Absent teacher not found' || error.message === 'Substitute teacher not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.message === 'Cannot allocate substitute for teacher who is not marked absent') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    if (error.message === 'Selected teacher is not available during this period') {
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
        message: error.message || 'Failed to allocate substitute',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
    });
  }
};

/**
 * Query substitutions with filters
 * GET /api/substitutions
 * Query params: date, class, period
 */
const querySubstitutions = async (req, res) => {
  try {
    const { date, class: className, period } = req.query;

    let substitutions = [];

    // Validate date format if provided
    if (date && !isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid date format. Expected ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Query based on provided filters
    if (date && className) {
      // Date and class filter
      substitutions = await SubstitutionService.getSubstitutionsByClass(className, date);
    } else if (date) {
      // Date only filter
      substitutions = await SubstitutionService.getSubstitutionsByDate(date);
    } else {
      // No filters provided
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'At least date filter is required',
        },
      });
    }

    // Apply period filter if provided
    if (period) {
      const periodNum = parseInt(period);
      if (isNaN(periodNum) || periodNum < 1 || periodNum > 8) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Period must be a number between 1 and 8',
          },
        });
      }
      substitutions = substitutions.filter((s) => s.period === periodNum);
    }

    res.status(200).json({
      success: true,
      data: {
        substitutions,
        count: substitutions.length,
      },
    });
  } catch (error) {
    logger.error('Query substitutions error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to query substitutions',
      },
    });
  }
};

/**
 * Update substitution
 * PUT /api/substitutions/:id
 * Body: { substituteTeacherId }
 */
const updateSubstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { substituteTeacherId } = req.body;

    // Validate required fields
    if (!substituteTeacherId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'substituteTeacherId is required',
        },
      });
    }

    // Update substitution using service
    const substitution = await SubstitutionService.updateSubstitute(id, substituteTeacherId);

    res.status(200).json({
      success: true,
      data: { substitution },
    });
  } catch (error) {
    logger.error('Update substitution error', { error: error.message });

    // Handle specific errors
    if (error.message === 'Substitution not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    if (error.message === 'Selected teacher is not available during this period') {
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
        message: 'Failed to update substitution',
      },
    });
  }
};

/**
 * Get coverage status for a teacher on a specific date
 * GET /api/substitutions/coverage/:teacherId/:date
 */
const getCoverageStatus = async (req, res) => {
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

    // Get coverage status using service
    const coverageStatus = await SubstitutionService.getCoverageStatus(teacherId, date);

    res.status(200).json({
      success: true,
      data: coverageStatus,
    });
  } catch (error) {
    logger.error('Get coverage status error', { error: error.message });

    // Handle specific errors
    if (error.message === 'Teacher not found') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to get coverage status',
      },
    });
  }
};

export { allocateSubstitute, querySubstitutions, updateSubstitution, getCoverageStatus };
