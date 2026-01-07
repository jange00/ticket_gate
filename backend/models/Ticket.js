const mongoose = require('mongoose');
const crypto = require('crypto');
const { TICKET_STATUS } = require('../utils/constants');

const ticketSchema = new mongoose.Schema({
  ticketTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketType',
    required: true,
    index: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  purchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase',
    required: true,
    index: true
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  qrCodeHash: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.PENDING
  },
  checkedInAt: {
    type: Date
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
ticketSchema.index({ attendeeId: 1 });
ticketSchema.index({ eventId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ qrCodeHash: 1 });

// Generate QR code hash for quick lookup
ticketSchema.methods.generateQRCodeHash = function() {
  return crypto.createHash('sha256').update(this.qrCode).digest('hex');
};

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
