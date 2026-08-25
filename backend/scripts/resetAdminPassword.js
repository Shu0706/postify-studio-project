require('dotenv').config();
const mongoose = require('mongoose');
const { Admin } = require('../models');

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Connected to MongoDB');

    // Find admin by email
    const admin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!admin) {
      console.log('❌ Admin user not found with email:', process.env.ADMIN_EMAIL);
      process.exit(1);
    }

    // Update password
    admin.password = process.env.ADMIN_PASSWORD;
    await admin.save();

    console.log('🎉 Admin password reset successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 New Password:', process.env.ADMIN_PASSWORD);
    console.log('✅ Password reset complete');

    // Verify the password
    const isValid = await admin.comparePassword(process.env.ADMIN_PASSWORD);
    console.log('🔐 Password verification:', isValid ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
};

// Run the reset
resetAdminPassword();
