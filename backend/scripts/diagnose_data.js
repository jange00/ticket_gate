const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('--- DB Diagnostic ---');
  
  const userCount = await User.countDocuments();
  const eventCount = await Event.countDocuments();
  const purchaseCount = await Purchase.countDocuments();
  
  console.log(`Summary: Users: ${userCount}, Events: ${eventCount}, Purchases: ${purchaseCount}`);
  
  const organizers = await User.find({ role: 'organizer' }).lean();
  console.log(`Organizers found: ${organizers.length}`);
  for (const org of organizers) {
    const orgEvents = await Event.countDocuments({ organizerId: org._id });
    console.log(`Organizer: ${org.email} (${org._id}) owns ${orgEvents} events`);
  }
  
  const allEvents = await Event.find().lean();
  for (const event of allEvents) {
    const eventPurchases = await Purchase.countDocuments({ eventId: event._id, status: 'paid' });
    console.log(`Event: "${event.title}" (${event._id}) | Organizer: ${event.organizerId} | Paid Purchases: ${eventPurchases} | soldTickets(stat): ${event.soldTickets}`);
  }

  process.exit(0);
};

run();
