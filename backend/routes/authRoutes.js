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
 * @desc    Register new user (temporarily public for admin creation)
 * @access  Public (TEMPORARY - REVERT AFTER ADMIN CREATION)
 */
router.post('/register', registerController);

export default router;
