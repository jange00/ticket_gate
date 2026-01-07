const mongoose = require('mongoose');

const passwordHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 365 * 24 * 60 * 60 // Expire after 1 year
  }
}, {
  timestamps: false
});

// Indexes
passwordHistorySchema.index({ userId: 1, createdAt: -1 });

const PasswordHistory = mongoose.model('PasswordHistory', passwordHistorySchema);

module.exports = PasswordHistory;
