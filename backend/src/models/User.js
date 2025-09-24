const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'gov_officer'],
    default: 'citizen'
  },
  department: {
    type: String,
    required: function() { return this.role === 'gov_officer' || this.role === 'admin'; }
  },
  employeeId: {
    type: String,
    required: function() { return this.role === 'gov_officer' || this.role === 'admin'; },
    unique: true,
    sparse: true
  },
  permissions: {
    type: [String],
    default: function() {
      switch(this.role) {
        case 'citizen': return ['create_report', 'view_own_reports', 'send_sos'];
        case 'gov_officer': return ['view_all_reports', 'verify_reports', 'create_alerts'];
        case 'admin': return ['view_all_reports', 'verify_reports', 'create_alerts', 'manage_users'];
        default: return [];
      }
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);