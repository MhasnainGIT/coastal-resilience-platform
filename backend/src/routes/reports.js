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

router.post('/', auth, upload.array('media', 5), createReport);
router.get('/', auth, getReports);
router.get('/:id', auth, getReportById);
router.patch('/:id/status', auth, authorize('admin', 'gov_officer'), updateReportStatus);

module.exports = router;