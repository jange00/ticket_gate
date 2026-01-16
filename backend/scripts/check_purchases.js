const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Purchase = require('../models/Purchase');
const Event = require('../models/Event');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const events = await Event.find({ organizerId: '695bab1f8ac07c89b7eae277' }).lean();
  const eventIds = events.map(e => e._id);
  
  const purchases = await Purchase.find({ eventId: { $in: eventIds }, status: 'paid' }).lean();
  console.log(`--- Purchases for Oranizer ---`);
  console.log(`Found ${purchases.length} paid purchases`);
  purchases.forEach(p => {
    const qty = p.tickets.reduce((acc, t) => acc + t.quantity, 0);
    console.log(`Purchase: ${p._id} | Event: ${p.eventId} | Qty: ${qty} | Amount: ${p.totalAmount}`);
  });
  
  process.exit(0);
};

run();
