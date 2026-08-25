require('dotenv').config();
const mongoose = require('mongoose');
const { Admin } = require('../models');

const verifyAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Connected to MongoDB');

    // Find admin user (including password field)
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('📧 Email:', admin.email);
    console.log('👤 Name:', admin.fullName);
    console.log('👑 Role:', admin.role);
    console.log('🔒 Super Admin:', admin.isSuperAdmin);
    console.log('✅ Active:', admin.isActive);
    console.log('🛡️  Permissions:', admin.permissions);

    // Test password comparison
    if (process.env.ADMIN_PASSWORD) {
      const isPasswordValid = await admin.comparePassword(process.env.ADMIN_PASSWORD);
      console.log('🔑 Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');
    } else {
      console.log('⚠️  Admin password not found in environment variables');
    }

    console.log('\n🎉 Admin verification complete!');

  } catch (error) {
    console.error('❌ Error verifying admin:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
};

// Run the verification
verifyAdmin();
