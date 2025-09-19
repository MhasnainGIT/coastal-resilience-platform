const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  alertType: {
    type: String,
    enum: ['warning', 'evacuation', 'all_clear', 'weather_update'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'minor', 'moderate', 'severe', 'extreme'],
    required: true
  },
  targetArea: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deliveredAt: Date,
    readAt: Date
  }],
  channels: [{
    type: String,
    enum: ['app', 'sms', 'email', 'social_media']
  }]
}, {
  timestamps: true
});

alertSchema.index({ targetArea: '2dsphere' });
alertSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('Alert', alertSchema);