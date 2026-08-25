require('dotenv').config();
const mongoose = require('mongoose');
const { Admin } = require('../models');

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email:', process.env.ADMIN_EMAIL);
      console.log('✅ Admin setup complete');
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      isSuperAdmin: true,
      permissions: [
        'manage-users',
        'manage-employees', 
        'manage-services',
        'manage-assignments',
        'view-analytics',
        'manage-notifications',
        'manage-files',
        'system-settings'
      ],
      isActive: true
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Password:', process.env.ADMIN_PASSWORD);
    console.log('👑 Role: Super Admin');
    console.log('✅ Admin setup complete');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
};

// Run the setup
setupAdmin();
