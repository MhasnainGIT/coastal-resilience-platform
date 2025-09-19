const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  hazardType: {
    type: String,
    enum: ['cyclone', 'tsunami', 'flood', 'storm_surge', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio']
    },
    url: String,
    filename: String
  }],
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'investigating'],
    default: 'pending'
  },
  verificationScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  mlAnalysis: {
    sentiment: String,
    confidence: Number,
    keywords: [String],
    fakeDetection: {
      isFake: Boolean,
      confidence: Number
    }
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reportSchema.index({ location: '2dsphere' });
reportSchema.index({ hazardType: 1, status: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);