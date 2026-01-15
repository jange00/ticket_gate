const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'susantmahat2@gmail.com'; // Adjust if you have a specific email to check
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log('User found:');
      console.log({
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
      });
    } else {
      console.log('User not found:', email);
      // List some users to see what's available
      const users = await User.find().limit(5);
      console.log('Available users:');
      users.forEach(u => console.log(`- ${u.email} (${u.role}), 2FA: ${u.twoFactorEnabled}`));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();
