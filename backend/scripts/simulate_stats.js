const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Refund = require('../models/Refund');

dotenv.config({ path: path.join(__dirname, '../.env') });

function subMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // The organizer user ID found earlier
  const userId = '695bab1f8ac07c89b7eae277'; // oranizer@gmail.com
  const dateRange = '6months';
  
  let dateFilter = {};
  const now = new Date();
  dateFilter = { $gte: subMonths(now, 6) };

  console.log(`--- Simulating Stats for User ${userId} ---`);
  
  const events = await Event.find({ organizerId: userId }).lean();
  console.log(`Events found via find({ organizerId: userId }): ${events.length}`);
  
  const eventIds = events.map(e => e._id);
  console.log(`Event IDs: ${eventIds.join(', ')}`);

  const [
    totalEventsCount,
    publishedEventsCount,
    revenueStats,
    ticketStats
  ] = await Promise.all([
    Event.countDocuments({ organizerId: userId }),
    Event.countDocuments({ organizerId: userId, status: 'published' }),
    Purchase.aggregate([
      { $match: { eventId: { $in: eventIds }, status: 'paid', createdAt: dateFilter } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Purchase.aggregate([
      { $match: { eventId: { $in: eventIds }, status: 'paid', createdAt: dateFilter } },
      { $unwind: '$tickets' },
      { $group: { _id: null, total: { $sum: '$tickets.quantity' } } }
    ])
  ]);

  console.log(`Total Events Count: ${totalEventsCount}`);
  console.log(`Published Events Count: ${publishedEventsCount}`);
  console.log(`Revenue Stats:`, JSON.stringify(revenueStats));
  console.log(`Ticket Stats:`, JSON.stringify(ticketStats));

  // Check if Event.organizerId is an ObjectId in the DB
  const sampleEvent = await Event.findOne({ organizerId: userId });
  if (sampleEvent) {
      console.log(`Sample Event ID: ${sampleEvent._id}`);
      console.log(`organizerId type: ${typeof sampleEvent.organizerId}`);
      console.log(`organizerId value: ${sampleEvent.organizerId}`);
  }

  process.exit(0);
};

run();
