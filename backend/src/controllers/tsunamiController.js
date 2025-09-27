const TsunamiStation = require('../models/TsunamiStation');

// Get all tsunami monitoring stations
const getStations = async (req, res) => {
  try {
    const stations = await TsunamiStation.find({ isOperational: true })
      .sort({ lastUpdate: -1 });
    
    res.json({
      success: true,
      data: stations,
      count: stations.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tsunami stations',
      error: error.message
    });
  }
};

// Get station by ID
const getStationById = async (req, res) => {
  try {
    const station = await TsunamiStation.findOne({ 
      stationId: req.params.id,
      isOperational: true 
    });
    
    if (!station) {
      return res.status(404).json({
        success: false,
        message: 'Station not found'
      });
    }
    
    res.json({
      success: true,
      data: station
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching station',
      error: error.message
    });
  }
};

// Get active alerts
const getActiveAlerts = async (req, res) => {
  try {
    const warningStations = await TsunamiStation.find({ 
      status: 'warning',
      isOperational: true 
    });
    
    const alerts = warningStations.map(station => ({
      id: station._id,
      stationName: station.name,
      type: 'high_sea_level',
      severity: station.currentSeaLevel > 2.0 ? 'critical' : 'warning',
      message: `Elevated sea levels detected at ${station.name} (${station.currentSeaLevel}m)`,
      timestamp: station.lastUpdate
    }));
    
    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

module.exports = {
  getStations,
  getStationById,
  getActiveAlerts
};