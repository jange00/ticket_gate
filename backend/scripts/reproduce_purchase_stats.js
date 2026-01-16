const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Event = require('../models/Event');
const Purchase = require('../models/Purchase');
const Ticket = require('../models/Ticket');
const TicketType = require('../models/TicketType');
const User = require('../models/User');
// We need to require the controller from the correct relative path
const { generateTicketsForPurchase } = require('../controllers/payment.controller');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();

  try {
    const user = await User.findOne();
    if (!user) {
        console.log('No user found to assign as organizer/buyer.');
        process.exit(1);
    }

    // Create Event
    const event = await Event.create({
      title: 'Stats Verification Event ' + Date.now(),
      description: 'Testing stats sync',
      organizerId: user._id,
      category: 'Technology',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      venue: { name: 'Lab', address: '123 Test St', city: 'Test City' },
      status: 'published',
      totalTickets: 100,
      soldTickets: 0,
      totalRevenue: 0
    });
    console.log(`Event Created: ${event._id} | Sold: ${event.soldTickets} | Rev: ${event.totalRevenue}`);

    // Create TicketType
    const ticketType = await TicketType.create({
      eventId: event._id,
      name: 'VIP',
      price: 500,
      quantityAvailable: 50,
      quantitySold: 0
    });
    console.log(`TicketType Created: ${ticketType._id}`);

    // Create Purchase (Pending)
    const qty = 2;
    const price = 500;
    const total = qty * price;
    
    const purchase = await Purchase.create({
      userId: user._id,
      eventId: event._id,
      tickets: [{
        ticketTypeId: ticketType._id,
        ticketType: ticketType.name,
        quantity: qty,
        price: price,
        subtotal: total
      }],
      subtotal: total,
      totalAmount: total,
      status: 'pending',
      transactionId: `TEST-${Date.now()}`
    });
    console.log(`Purchase Created: ${purchase._id} | Amount: ${purchase.totalAmount}`);

    // Run the function under test
    console.log('Running generateTicketsForPurchase...');
    await generateTicketsForPurchase(purchase._id);

    // Verify Results
    const updatedEvent = await Event.findById(event._id);
    const updatedTicketType = await TicketType.findById(ticketType._id);
    const updatedPurchase = await Purchase.findById(purchase._id);

    console.log('--- Verification ---');
    console.log(`Event SoldTickets: ${updatedEvent.soldTickets} (Expected: ${qty})`);
    console.log(`Event TotalRevenue: ${updatedEvent.totalRevenue} (Expected: ${total})`);
    console.log(`TicketType Sold: ${updatedTicketType.quantitySold} (Expected: ${qty})`);
    console.log(`Purchase Status: ${updatedPurchase.status} (Expected: paid)`);

    if (updatedEvent.soldTickets === qty && updatedEvent.totalRevenue === total) {
        console.log('SUCCESS: Event stats updated correctly.');
    } else {
        console.error('FAILURE: Event stats NOT updated correctly.');
    }

    // Cleanup
    await Ticket.deleteMany({ purchaseId: purchase._id });
    await Purchase.deleteOne({ _id: purchase._id });
    await TicketType.deleteOne({ _id: ticketType._id });
    await Event.deleteOne({ _id: event._id });
    console.log('Cleanup done.');

  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

run();
