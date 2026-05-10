import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { validateEnv, config } from './config/env.js';

// Load and validate environment configuration
validateEnv();

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingUser = await User.findOne({ username: 'admin' });
    if (existingUser) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save hook)
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestUser();