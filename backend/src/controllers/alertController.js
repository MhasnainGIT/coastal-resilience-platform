const Alert = require('../models/Alert');
const User = require('../models/User');
const Joi = require('joi');

const alertSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
  alertType: Joi.string().valid('warning', 'evacuation', 'all_clear', 'weather_update').required(),
  severity: Joi.string().valid('info', 'minor', 'moderate', 'severe', 'extreme').required(),
  targetArea: Joi.object({
    coordinates: Joi.array().items(Joi.array().items(Joi.array().items(Joi.number()))).required()
  }).required(),
  expiresAt: Joi.date().required(),
  channels: Joi.array().items(Joi.string().valid('app', 'sms', 'email', 'social_media'))
});

exports.createAlert = async (req, res) => {
  try {
    const { error, value } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const alertData = {
      ...value,
      issuedBy: req.user.id,
      targetArea: {
        type: 'Polygon',
        coordinates: value.targetArea.coordinates
      }
    };

    const alert = await Alert.create(alertData);

    // Find users in target area
    const usersInArea = await User.find({
      location: {
        $geoWithin: {
          $geometry: alert.targetArea
        }
      }
    });

    // Update alert with recipients
    alert.recipients = usersInArea.map(user => ({ user: user._id }));
    await alert.save();

    // Emit real-time alert
    req.io.emit('newAlert', {
      alert,
      targetUsers: usersInArea.map(u => u._id)
    });

    const populatedAlert = await Alert.findById(alert._id)
      .populate('issuedBy', 'name email')
      .populate('recipients.user', 'name email');

    res.status(201).json({
      success: true,
      alert: populatedAlert
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive = true } = req.query;

    const query = { isActive: isActive === 'true' };

    // If user is citizen, only show alerts for their location
    if (req.user.role === 'citizen') {
      query.targetArea = {
        $geoIntersects: {
          $geometry: req.user.location
        }
      };
    }

    const alerts = await Alert.find(query)
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Alert.countDocuments(query);

    res.json({
      success: true,
      alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('issuedBy', 'name email')
      .populate('recipients.user', 'name email');

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Mark as read for current user
    if (req.user.role === 'citizen') {
      const recipientIndex = alert.recipients.findIndex(
        r => r.user._id.toString() === req.user.id
      );
      
      if (recipientIndex !== -1 && !alert.recipients[recipientIndex].readAt) {
        alert.recipients[recipientIndex].readAt = new Date();
        await alert.save();
      }
    }

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deactivateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Emit real-time update
    req.io.emit('alertDeactivated', { alertId: alert._id });

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};