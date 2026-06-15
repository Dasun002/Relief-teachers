/**
 * Direct MongoDB Admin User Creator
 * This script connects directly to MongoDB and creates an admin user
 * with a properly hashed password using the same bcrypt as the backend
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dasun_db_user:icCSX2AeiFBHiCXs@dasundatabase.xcakikk.mongodb.net/teacher-attendance-system?retryWrites=true&w=majority';

// User schema (simplified)
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  createdAt: Date,
  updatedAt: Date,
  __v: Number
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.substring(0, 50) + '...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('User ID:', existingAdmin._id);
      console.log('Username:', existingAdmin.username);
      console.log('Role:', existingAdmin.role);
      console.log('\n🗑️  Deleting existing admin user...');
      await User.deleteOne({ username: 'admin' });
      console.log('✅ Old admin user deleted\n');
    }
    
    // Hash the password
    console.log('🔐 Hashing password "Admin@2026"...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@2026', salt);
    console.log('✅ Password hashed:', hashedPassword.substring(0, 20) + '...\n');
    
    // Create new admin user
    console.log('👤 Creating new admin user...');
    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!\n');
    
    // Verify the user
    const verifyUser = await User.findOne({ username: 'admin' });
    console.log('🔍 Verification:');
    console.log('ID:', verifyUser._id);
    console.log('Username:', verifyUser.username);
    console.log('Role:', verifyUser.role);
    console.log('Password hash:', verifyUser.password.substring(0, 20) + '...');
    
    // Test password comparison
    console.log('\n🧪 Testing password verification...');
    const isMatch = await bcrypt.compare('Admin@2026', verifyUser.password);
    if (isMatch) {
      console.log('✅ Password verification WORKS!');
    } else {
      console.log('❌ Password verification FAILED!');
    }
    
    console.log('\n🎉 SUCCESS!');
    console.log('═══════════════════════════════════════');
    console.log('You can now login with:');
    console.log('  Username: admin');
    console.log('  Password: Admin@2026');
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();
