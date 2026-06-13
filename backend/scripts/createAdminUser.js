import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@2026',
  role: 'admin'
};

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: ADMIN_CREDENTIALS.username });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Username:', ADMIN_CREDENTIALS.username);
      console.log('\n💡 If you want to update the password, delete the existing admin first.');
      
      // Disconnect and exit
      await mongoose.disconnect();
      console.log('\n✅ Disconnected from MongoDB');
      process.exit(0);
    }

    // Create new admin user
    console.log('👤 Creating new admin user...');
    const adminUser = new User(ADMIN_CREDENTIALS);
    await adminUser.save();

    console.log('\n🎉 Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('Username: admin');
    console.log('Password: Admin@2026');
    console.log('Role:     admin');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Save these credentials securely!');
    console.log('💡 You can login at your frontend URL/login\n');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.error('⚠️  Username already exists in database');
    }
    
    // Disconnect and exit with error
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
