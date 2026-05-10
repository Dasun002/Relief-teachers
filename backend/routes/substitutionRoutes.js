import express from 'express';
import {
  allocateSubstitute,
  querySubstitutions,
  updateSubstitution,
  getCoverageStatus,
} from '../controllers/substitutionController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

/**
 * @route   POST /api/substitutions
 * @desc    Allocate substitute teacher (admin only)
 * @access  Private (Admin)
 * @body    { absentTeacherId, substituteTeacherId, class, period, date, subject }
 */
router.post('/', authenticate, requireAdmin, allocateSubstitute);

/**
 * @route   GET /api/substitutions
 * @desc    Query substitutions with filters (date, class, period)
 * @access  Private
 * @query   date - Date in YYYY-MM-DD format (required)
 * @query   class - Class name (optional)
 * @query   period - Period number 1-8 (optional)
 */
router.get('/', authenticate, querySubstitutions);

/**
 * @route   PUT /api/substitutions/:id
 * @desc    Update substitution (admin only)
 * @access  Private (Admin)
 * @body    { substituteTeacherId }
 */
router.put('/:id', authenticate, requireAdmin, updateSubstitution);

/**
 * @route   GET /api/substitutions/coverage/:teacherId/:date
 * @desc    Get coverage status for a teacher on a specific date
 * @access  Private
 * @param   teacherId - Teacher ID
 * @param   date - Date in YYYY-MM-DD format
 */
router.get('/coverage/:teacherId/:date', authenticate, getCoverageStatus);

export default router;
