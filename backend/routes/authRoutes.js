import express from 'express';
import { loginController, registerController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', loginController);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (admin only)
 * @access  Private (Admin)
 */
router.post('/register', authenticate, requireAdmin, registerController);

export default router;
