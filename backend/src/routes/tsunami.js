const express = require('express');
const { getStations, getStationById, getActiveAlerts } = require('../controllers/tsunamiController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/tsunami/stations
// @desc    Get all tsunami monitoring stations
// @access  Private
router.get('/stations', getStations);

// @route   GET /api/tsunami/stations/:id
// @desc    Get specific station data
// @access  Private
router.get('/stations/:id', getStationById);

// @route   GET /api/tsunami/alerts
// @desc    Get active tsunami alerts
// @access  Private
router.get('/alerts', getActiveAlerts);

module.exports = router;