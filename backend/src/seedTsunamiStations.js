require('dotenv').config();
const mongoose = require('mongoose');
const TsunamiStation = require('./models/TsunamiStation');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const tsunamiStations = [
  {
    stationId: 'CHN001',
    name: 'Chennai Port',
    type: 'tidegauge',
    location: {
      coordinates: [80.3, 13.1]
    },
    status: 'active',
    currentSeaLevel: 1.2,
    trend: 'stable'
  },
  {
    stationId: 'VIZ001',
    name: 'Visakhapatnam',
    type: 'tidegauge',
    location: {
      coordinates: [83.3, 17.7]
    },
    status: 'active',
    currentSeaLevel: 0.8,
    trend: 'rising'
  },
  {
    stationId: 'BOB001',
    name: 'Bay of Bengal Buoy',
    type: 'tsunami_buoy',
    location: {
      coordinates: [85.0, 15.0]
    },
    status: 'warning',
    currentSeaLevel: 2.1,
    trend: 'rising'
  },
  {
    stationId: 'KOC001',
    name: 'Kochi Port',
    type: 'tidegauge',
    location: {
      coordinates: [76.2, 9.9]
    },
    status: 'active',
    currentSeaLevel: 1.0,
    trend: 'falling'
  },
  {
    stationId: 'MUM001',
    name: 'Mumbai Port',
    type: 'tidegauge',
    location: {
      coordinates: [72.8, 19.0]
    },
    status: 'active',
    currentSeaLevel: 1.5,
    trend: 'stable'
  },
  {
    stationId: 'GOA001',
    name: 'Goa Coastal Station',
    type: 'tidegauge',
    location: {
      coordinates: [73.8, 15.3]
    },
    status: 'active',
    currentSeaLevel: 1.1,
    trend: 'stable'
  },
  {
    stationId: 'AS001',
    name: 'Arabian Sea Buoy',
    type: 'tsunami_buoy',
    location: {
      coordinates: [70.0, 12.0]
    },
    status: 'active',
    currentSeaLevel: 0.9,
    trend: 'falling'
  }
];

const seedTsunamiStations = async () => {
  try {
    await connectDB();
    
    // Clear existing stations
    await TsunamiStation.deleteMany({});
    console.log('Cleared existing tsunami stations');
    
    // Insert new stations
    await TsunamiStation.insertMany(tsunamiStations);
    console.log('Tsunami stations seeded successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tsunami stations:', error);
    process.exit(1);
  }
};

seedTsunamiStations();