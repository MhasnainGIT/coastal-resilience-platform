const mongoose = require('mongoose');

const tsunamiStationSchema = new mongoose.Schema({
  stationId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['tidegauge', 'tsunami_buoy'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'warning', 'maintenance'],
    default: 'active'
  },
  currentSeaLevel: {
    type: Number,
    required: true
  },
  trend: {
    type: String,
    enum: ['rising', 'falling', 'stable'],
    default: 'stable'
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  isOperational: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TsunamiStation', tsunamiStationSchema);