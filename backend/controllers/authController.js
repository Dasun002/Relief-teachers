import { register, login } from '../services/authService.js';
import logger from '../utils/logger.js';

/**
 * Login controller
 * POST /api/auth/login
 */
const loginController = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required',
        },
      });
    }

    // Attempt login
    const result = await login(username, password);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Login controller error', { error: error.message });

    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid credentials',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      },
    });
  }
};

/**
 * Register controller
 * POST /api/auth/register
 */
const registerController = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required',
        },
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters long',
        },
      });
    }

    // Register user
    const user = await register({ username, password, role });

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Register controller error', { error: error.message });

    if (error.message === 'Username already exists') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already exists',
        },
      });
    }

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
        code: 'INTERNAL_ERROR',
        message: 'An error occurred during registration',
      },
    });
  }
};

export { loginController, registerController };
