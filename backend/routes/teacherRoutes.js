import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getFreeTeachers,
} from '../controllers/teacherController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

/**
 * @route   GET /api/teachers
 * @desc    Get all teachers
 * @access  Private
 */
router.get('/', authenticate, getAllTeachers);

/**
 * @route   GET /api/teachers/free
 * @desc    Get available substitute teachers for a period
 * @access  Private
 */
router.get('/free', authenticate, getFreeTeachers);

/**
 * @route   GET /api/teachers/:id
 * @desc    Get teacher by ID
 * @access  Private
 */
router.get('/:id', authenticate, getTeacherById);

/**
 * @route   POST /api/teachers
 * @desc    Create new teacher
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireAdmin, createTeacher);

/**
 * @route   PUT /api/teachers/:id
 * @desc    Update teacher
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireAdmin, updateTeacher);

/**
 * @route   DELETE /api/teachers/:id
 * @desc    Delete teacher
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireAdmin, deleteTeacher);

export default router;
