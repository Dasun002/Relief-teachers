import express from 'express';
import multer from 'multer';
import { getTimetable, importTimetable } from '../controllers/timetableController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

// Configure multer for memory storage (file will be in req.file.buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only XML files
    if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml' || file.originalname.endsWith('.xml')) {
      cb(null, true);
    } else {
      cb(new Error('Only XML files are allowed'), false);
    }
  },
});

/**
 * @route   GET /api/timetable
 * @desc    Get timetable with optional filters (class, teacher, day, period)
 * @access  Private
 * @query   class - Class name (e.g., "6A")
 * @query   teacher - Teacher ID
 * @query   day - Day of week (Monday-Friday)
 * @query   period - Period number (1-8)
 */
router.get('/', authenticate, getTimetable);

/**
 * @route   DELETE /api/timetable
 * @desc    Delete all timetable entries (admin only)
 * @access  Private (Admin only)
 */
router.delete('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const TimetableService = (await import('../services/TimetableService.js')).default;
    const result = await TimetableService.deleteAll();
    
    res.status(200).json({
      success: true,
      data: {
        message: 'All timetable entries deleted successfully',
        deletedCount: result.deletedCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Failed to delete timetable entries',
      },
    });
  }
});

/**
 * @route   POST /api/timetable/import
 * @desc    Bulk import timetable from XML file
 * @access  Private (Admin only)
 * @body    file - XML file (multipart/form-data)
 */
router.post('/import', authenticate, requireAdmin, upload.single('file'), importTimetable);

export default router;
