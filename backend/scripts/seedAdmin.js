const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');
const { hashPassword } = require('../services/password.service');
const { ROLES } = require('../utils/constants');

async function seedAdmin() {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin._id}`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await hashPassword('Admin@123');

    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@gmail.com',
      phone: '9800000000',
      password: hashedPassword,
      role: ROLES.ADMIN,
      isEmailVerified: true,
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin._id}`);
    console.log(`   Name: ${admin.firstName} ${admin.lastName}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.code === 11000) {
      console.error('   Admin user with this email already exists');
    }
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();










