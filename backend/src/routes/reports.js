const express = require('express');
const multer = require('multer');
const { 
  createReport, 
  getReports, 
  getReportById, 
  updateReportStatus 
} = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('video/') || 
        file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Citizen routes
router.post('/', auth, upload.array('media', 5), createReport);
router.get('/my', auth, getReports);

// Public routes (for both citizens and government)
router.get('/', auth, getReports);
router.get('/:id', auth, getReportById);
router.patch('/:id/status', auth, authorize('gov_officer', 'admin'), updateReportStatus);
router.delete('/:id', auth, authorize('gov_officer', 'admin'), async (req, res) => {
  try {
    const Report = require('../models/Report');
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;