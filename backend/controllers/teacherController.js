import Teacher from '../models/Teacher.js';
import logger from '../utils/logger.js';
import FreeTeacherAlgorithm from '../services/FreeTeacherAlgorithm.js';

/**
 * Get all teachers
 * GET /api/teachers
 */
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { teachers, count: teachers.length },
    });
  } catch (error) {
    logger.error('Get all teachers error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve teachers',
      },
    });
  }
};

/**
 * Get teacher by ID
 * GET /api/teachers/:id
 */
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Teacher not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { teacher },
    });
  } catch (error) {
    logger.error('Get teacher by ID error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve teacher',
      },
    });
  }
};

/**
 * Create new teacher
 * POST /api/teachers
 */
const createTeacher = async (req, res) => {
  try {
    const { name, subjects } = req.body;

    // Validate input
    if (!name || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and at least one subject are required',
        },
      });
    }

    // Create teacher
    const teacher = new Teacher({ name, subjects });
    await teacher.save();

    logger.info('Teacher created', { teacherId: teacher._id, name });

    res.status(201).json({
      success: true,
      data: { teacher },
    });
  } catch (error) {
    logger.error('Create teacher error', { error: error.message });

    if (error.name === 'ValidationError') {
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
        message: 'Failed to create teacher',
      },
    });
  }
};

/**
 * Update teacher
 * PUT /api/teachers/:id
 */
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subjects } = req.body;

    const teacher = await Teacher.findByIdAndUpdate(
      id,
      { name, subjects },
      { new: true, runValidators: true }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Teacher not found',
        },
      });
    }

    logger.info('Teacher updated', { teacherId: id });

    res.status(200).json({
      success: true,
      data: { teacher },
    });
  } catch (error) {
    logger.error('Update teacher error', { error: error.message });

    if (error.name === 'ValidationError') {
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
        message: 'Failed to update teacher',
      },
    });
  }
};

/**
 * Delete teacher
 * DELETE /api/teachers/:id
 */
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Teacher not found',
        },
      });
    }

    logger.info('Teacher deleted', { teacherId: id });

    res.status(200).json({
      success: true,
      data: { message: 'Teacher deleted successfully' },
    });
  } catch (error) {
    logger.error('Delete teacher error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to delete teacher',
      },
    });
  }
};

/**
 * Get free teachers for a specific period, day, and date
 * GET /api/teachers/free?period=1&day=Monday&date=2024-01-15
 */
const getFreeTeachers = async (req, res) => {
  try {
    const { period, day, date } = req.query;

    // Validate required query parameters
    if (!period || !day || !date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required query parameters: period, day, and date are required',
        },
      });
    }

    // Validate period (1-8)
    const periodNum = parseInt(period, 10);
    if (isNaN(periodNum) || periodNum < 1 || periodNum > 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Period must be a number between 1 and 8',
        },
      });
    }

    // Validate day (Monday-Friday)
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Day must be one of: Monday, Tuesday, Wednesday, Thursday, Friday',
        },
      });
    }

    // Validate date (ISO 8601 format)
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date must be in valid ISO 8601 format (YYYY-MM-DD)',
        },
      });
    }

    // Call FreeTeacherAlgorithm to find free teachers
    const freeTeachers = await FreeTeacherAlgorithm.findFreeTeachers(
      periodNum,
      day,
      dateObj
    );

    res.status(200).json({
      success: true,
      data: { teachers: freeTeachers, count: freeTeachers.length },
    });
  } catch (error) {
    logger.error('Get free teachers error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve free teachers',
      },
    });
  }
};

export { getAllTeachers, getTeacherById, createTeacher, updateTeacher, deleteTeacher, getFreeTeachers };
