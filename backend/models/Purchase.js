const mongoose = require('mongoose');
const { PURCHASE_STATUS } = require('../utils/constants');
const { generateTransactionId } = require('../utils/helpers');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => generateTransactionId()
  },
  tickets: [{
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TicketType',
      required: true
    },
    ticketType: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  serviceCharge: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(PURCHASE_STATUS),
    default: PURCHASE_STATUS.PENDING
  },
  paymentMethod: {
    type: String,
    default: 'esewa'
  },
  esewaTransactionId: {
    type: String
  },
  paypalOrderId: {
    type: String
  },
  paymentId: {
    type: String
  },
  paymentReferenceId: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  esewaResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  paypalResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
purchaseSchema.index({ userId: 1, status: 1 });
purchaseSchema.index({ eventId: 1, status: 1 });
// transactionId is already indexed via unique: true
purchaseSchema.index({ paymentId: 1 });
purchaseSchema.index({ paypalOrderId: 1 });
purchaseSchema.index({ createdAt: -1 });

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
