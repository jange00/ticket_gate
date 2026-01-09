const mongoose = require('mongoose');
const { EVENT_STATUS } = require('../utils/constants');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    // country: {
    //   type: String,
    //   trim: true
    // },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  imageUrl: {
    type: String
  },
  bannerUrl: {
    type: String
  },
  status: {
    type: String,
    enum: Object.values(EVENT_STATUS),
    default: EVENT_STATUS.DRAFT
  },
  publishedAt: {
    type: Date
  },
  totalTickets: {
    type: Number,
    default: 0
  },
  soldTickets: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  settings: {
    allowRefunds: {
      type: Boolean,
      default: true
    },
    refundDeadline: {
      type: Date
    },
    requireCheckIn: {
      type: Boolean,
      default: true
    },
    maxTicketsPerUser: {
      type: Number,
      default: 10
    }
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
eventSchema.index({ organizerId: 1, status: 1 });
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ status: 1, publishedAt: -1 });

// Virtual for available tickets
eventSchema.virtual('availableTickets').get(function() {
  return Math.max(0, this.totalTickets - this.soldTickets);
});

// Virtual for is sold out
eventSchema.virtual('isSoldOut').get(function() {
  return this.soldTickets >= this.totalTickets;
});

// Virtual for is published
eventSchema.virtual('isPublished').get(function() {
  return this.status === EVENT_STATUS.PUBLISHED;
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

