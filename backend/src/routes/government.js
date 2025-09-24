const express = require('express');
const { auth } = require('../middleware/auth');
const { roleAuth, permissionAuth } = require('../middleware/roleAuth');
const Report = require('../models/Report');
const User = require('../models/User');

const router = express.Router();

// Government Dashboard Analytics
router.get('/analytics', auth, roleAuth(['gov_officer', 'admin']), async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const verifiedReports = await Report.countDocuments({ status: 'verified' });
    const emergencyReports = await Report.countDocuments({ isEmergency: true });
    
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    res.json({
      stats: {
        totalReports,
        pendingReports,
        verifiedReports,
        emergencyReports
      },
      recentReports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk Report Actions
router.patch('/reports/bulk-verify', auth, permissionAuth('verify_reports'), async (req, res) => {
  try {
    const { reportIds, status } = req.body;
    
    await Report.updateMany(
      { _id: { $in: reportIds } },
      { 
        status,
        verifiedBy: req.user._id,
        verifiedAt: new Date()
      }
    );

    res.json({ message: `${reportIds.length} reports updated successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export Reports Data
router.get('/reports/export', auth, permissionAuth('export_data'), async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const csvData = reports.map(report => ({
      id: report._id,
      title: report.title,
      hazardType: report.hazardType,
      severity: report.severity,
      status: report.status,
      isEmergency: report.isEmergency,
      userName: report.user.name,
      userEmail: report.user.email,
      createdAt: report.createdAt
    }));

    res.json(csvData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Citizens
router.get('/citizens', auth, roleAuth(['gov_officer', 'admin']), async (req, res) => {
  try {
    const User = require('../models/User');
    const citizens = await User.find({ role: 'citizen' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(citizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Suspend User
router.patch('/users/:id/suspend', auth, roleAuth(['gov_officer', 'admin']), async (req, res) => {
  try {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk SMS
router.post('/bulk-sms', auth, roleAuth(['gov_officer', 'admin']), async (req, res) => {
  try {
    const { message } = req.body;
    // In production, integrate with SMS gateway
    console.log('Sending SMS to all citizens:', message);
    res.json({ message: 'SMS sent successfully', recipients: 'all_citizens' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;