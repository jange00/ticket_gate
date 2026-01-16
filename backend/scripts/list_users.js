const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find().lean();
  console.log('--- User List ---');
  users.forEach(u => console.log(`ID: ${u._id} | Email: ${u.email} | Role: ${u.role}`));
  process.exit(0);
};

run();
