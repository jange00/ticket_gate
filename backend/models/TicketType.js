const mongoose = require('mongoose');

const ticketTypeSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Ticket type name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Quantity available is required'],
    min: [0, 'Quantity cannot be negative']
  },
  quantitySold: {
    type: Number,
    default: 0,
    min: 0
  },
  maxPerPurchase: {
    type: Number,
    default: 4,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
ticketTypeSchema.index({ eventId: 1 });

// Virtual for available quantity
ticketTypeSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantityAvailable - this.quantitySold);
});

const TicketType = mongoose.model('TicketType', ticketTypeSchema);

module.exports = TicketType;


