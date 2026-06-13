import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// New admin credentials
const NEW_ADMIN_CREDENTIALS = {
  username: 'principal',
  password: 'Principal@2026',
  role: 'admin'
};

async function createNewAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Check existing admins
    console.log('📋 Checking existing admin users...\n');
    const existingAdmins = await User.find({ role: 'admin' });
    
    if (existingAdmins.length > 0) {
      console.log(`Found ${existingAdmins.length} existing admin(s):`);
      existingAdmins.forEach((admin, index) => {
        console.log(`  ${index + 1}. Username: ${admin.username}`);
      });
      console.log('');
    }

    // Check if new username already exists
    const existingUser = await User.findOne({ username: NEW_ADMIN_CREDENTIALS.username });
    
    if (existingUser) {
      console.log(`⚠️  User "${NEW_ADMIN_CREDENTIALS.username}" already exists!`);
      console.log('Please use a different username or delete the existing user first.\n');
      
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
      process.exit(0);
    }

    // Create new admin user
    console.log(`👤 Creating new admin user: ${NEW_ADMIN_CREDENTIALS.username}...`);
    const adminUser = new User(NEW_ADMIN_CREDENTIALS);
    await adminUser.save();

    console.log('\n🎉 New admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 NEW ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('Username: principal');
    console.log('Password: Principal@2026');
    console.log('Role:     admin');
    console.log('═══════════════════════════════════════\n');
    console.log('⚠️  IMPORTANT: Save these credentials securely!');
    console.log('💡 You can login at your frontend URL/login\n');

    // Show all admins
    const allAdmins = await User.find({ role: 'admin' });
    console.log(`📊 Total admin users in database: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`  ${index + 1}. ${admin.username}`);
    });
    console.log('');

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
createNewAdmin();
