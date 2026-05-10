import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Register a new user
 * @param {Object} userData - User data (username, password, role)
 * @returns {Promise<Object>} Created user object (without password)
 */
const register = async (userData) => {
  try {
    const { username, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = new User({
      username,
      password,
      role: role || 'user',
    });

    await user.save();

    logger.info('User registered successfully', { username, role: user.role });

    // Return user without password
    return user.toJSON();
  } catch (error) {
    logger.error('User registration failed', { error: error.message });
    throw error;
  }
};

/**
 * Login user and generate JWT token
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {Promise<Object>} User object and JWT token
 */
const login = async (username, password) => {
  try {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user);

    logger.info('User logged in successfully', { username, role: user.role });

    return {
      token,
      user: user.toJSON(),
    };
  } catch (error) {
    logger.error('User login failed', { error: error.message, username });
    throw error;
  }
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  return token;
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User object (without password)
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    logger.error('Failed to get user by ID', { error: error.message, userId });
    throw error;
  }
};

export { register, login, generateToken, verifyToken, getUserById };
