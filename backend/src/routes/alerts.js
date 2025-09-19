const express = require('express');
const { 
  createAlert, 
  getAlerts, 
  getAlertById, 
  deactivateAlert 
} = require('../controllers/alertController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('admin', 'gov_officer'), createAlert);
router.get('/', auth, getAlerts);
router.get('/:id', auth, getAlertById);
router.patch('/:id/deactivate', auth, authorize('admin', 'gov_officer'), deactivateAlert);

module.exports = router;