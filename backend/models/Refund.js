const mongoose = require('mongoose');
const { REFUND_STATUS } = require('../utils/constants');
const { generateTransactionId } = require('../utils/helpers');

const refundSchema = new mongoose.Schema({
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true
  },
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
  refundId: {
    type: String,
    required: true,
    unique: true,
    default: () => `REF-${generateTransactionId()}`
  },
  originalTransactionId: {
    type: String,
    required: true
  },
  refundAmount: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: Object.values(REFUND_STATUS),
    default: REFUND_STATUS.PENDING
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  paymentReferenceId: {
    type: String
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
refundSchema.index({ userId: 1, status: 1 });
refundSchema.index({ purchaseId: 1 });
refundSchema.index({ status: 1, createdAt: -1 });
// refundId is already indexed via unique: true

const Refund = mongoose.model('Refund', refundSchema);

module.exports = Refund;
