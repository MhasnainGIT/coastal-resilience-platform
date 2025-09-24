const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if demo users already exist
    const existingCitizen = await User.findOne({ email: 'citizen@demo.com' });
    const existingOfficer = await User.findOne({ email: 'officer@demo.com' });

    if (!existingCitizen) {
      await User.create({
        name: 'Demo Citizen',
        email: 'citizen@demo.com',
        password: 'password123',
        phone: '+91-9876543210',
        role: 'citizen',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        }
      });
      console.log('✅ Demo citizen user created');
    } else {
      console.log('ℹ️ Demo citizen user already exists');
    }

    if (!existingOfficer) {
      await User.create({
        name: 'Demo Government Officer',
        email: 'officer@demo.com',
        password: 'password123',
        phone: '+91-9876543211',
        role: 'gov_officer',
        department: 'Disaster Management',
        employeeId: 'GOV001',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139] // Delhi coordinates
        }
      });
      console.log('✅ Demo government officer user created');
    } else {
      console.log('ℹ️ Demo government officer user already exists');
    }

    console.log('🎉 Demo users setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
    process.exit(1);
  }
};

seedDemoUsers();