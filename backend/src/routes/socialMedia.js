const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const socialMediaIntegration = require('../services/socialMediaIntegration');

// Legacy mock data generator (kept as fallback)
const generateMockSocialMediaPosts = (count = 10) => {
  const platforms = ['twitter', 'facebook', 'instagram'];
  
  const accounts = [
    {
      username: 'CoastalWatch_IN',
      displayName: 'Coastal Watch India',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: true,
      followers: 125000,
      bio: 'Official coastal monitoring & disaster alerts for India 🌊 | Government verified'
    },
    {
      username: 'WeatherAlert_TN',
      displayName: 'Tamil Nadu Weather',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      verified: true,
      followers: 89000,
      bio: 'Real-time weather updates for Tamil Nadu | IMD certified'
    },
    {
      username: 'DisasterUpdate',
      displayName: 'Disaster Management India',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      verified: true,
      followers: 234000,
      bio: 'NDMA official updates | Emergency response coordination'
    },
    {
      username: 'LocalNews_Kerala',
      displayName: 'Kerala News Live',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      verified: false,
      followers: 45000,
      bio: 'Breaking news from Kerala | Coastal updates & alerts'
    },
    {
      username: 'CitizenReporter',
      displayName: 'Ravi Kumar',
      avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      verified: false,
      followers: 1200,
      bio: 'Citizen journalist | Reporting from Chennai coastal areas'
    },
    {
      username: 'FishermanUnion_TN',
      displayName: 'Tamil Nadu Fishermen Union',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      verified: false,
      followers: 15000,
      bio: 'Representing 50,000+ fishermen | Sea condition updates'
    }
  ];
  
  const locations = [
    { lat: 13.0827, lng: 80.2707, name: 'Chennai, Tamil Nadu' },
    { lat: 11.2588, lng: 75.7804, name: 'Kozhikode, Kerala' },
    { lat: 15.2993, lng: 74.1240, name: 'Goa' },
    { lat: 19.0760, lng: 72.8777, name: 'Mumbai, Maharashtra' },
    { lat: 22.5726, lng: 88.3639, name: 'Kolkata, West Bengal' },
    { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram, Kerala' },
    { lat: 12.9716, lng: 77.5946, name: 'Bengaluru, Karnataka' }
  ];
  
  const hazardTypes = ['flood', 'cyclone', 'storm_surge', 'tsunami'];
  const severities = ['low', 'medium', 'high', 'critical'];
  
  const detailedPosts = [
    {
      content: 'URGENT: Cyclone Biparjoy intensifying rapidly! Wind speeds 120-130 kmph expected. All coastal residents must evacuate immediately. Emergency shelters open. 🌪️ #CycloneBiparjoy #EmergencyEvacuation',
      fullDescription: 'Cyclone Biparjoy has intensified into a very severe cyclonic storm and is moving towards the Gujarat coast. The India Meteorological Department has issued the highest level red alert. Wind speeds are expected to reach 120-130 kmph with gusts up to 145 kmph. Storm surge of 3-4 meters is likely along the coast.',
      image: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&h=600&fit=crop',
      type: 'emergency_alert',
      priority: 'critical',
      emergencyInfo: {
        evacuationZones: ['Kutch', 'Devbhumi Dwarka', 'Porbandar', 'Jamnagar'],
        shelters: 'Over 100 emergency shelters activated',
        helpline: '1070 (NDRF), 108 (Emergency)',
        lastUpdated: new Date().toISOString()
      }
    },
    {
      content: 'Flash flood warning for Chennai! Heavy rainfall 115-204mm expected in next 48 hours. Avoid waterlogged areas. Stay indoors when possible. 🌧️⚠️ #ChennaiFloods #WeatherAlert',
      fullDescription: 'The India Meteorological Department has issued a flash flood warning for Chennai and surrounding districts. Very heavy rainfall is expected due to a low-pressure system over the Bay of Bengal. Several areas are already experiencing waterlogging.',
      image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
      type: 'weather_warning',
      priority: 'high',
      weatherData: {
        rainfall: '115-204mm',
        windSpeed: '40-50 kmph',
        visibility: 'Poor (2-4 km)',
        temperature: '24-28°C',
        humidity: '85-95%'
      }
    },
    {
      content: 'Tsunami evacuation drill completed successfully in Odisha! 50,000+ people participated across 15 coastal villages. Community preparedness is our strength! 💪 #TsunamiDrill #DisasterPreparedness',
      fullDescription: 'A comprehensive tsunami evacuation drill was conducted across Puri district with record participation. The drill tested evacuation procedures, assembly points, and emergency communication systems. Average evacuation time was 12 minutes.',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop',
      type: 'community_update',
      priority: 'medium',
      drillStats: {
        participants: '50,000+',
        villages: 15,
        evacuationTime: '12 minutes average',
        successRate: '98%'
      }
    },
    {
      content: 'Storm surge alert at Marina Beach! Waves reaching 4-5 meters height. Coastal roads flooded. Avoid beach areas until further notice. 🌊 #StormSurge #ChennaiAlert',
      fullDescription: 'High storm surge is being observed at Marina Beach and other coastal areas of Chennai. Waves are reaching unprecedented heights of 4-5 meters, causing flooding of coastal roads and low-lying areas.',
      image: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop',
      type: 'immediate_alert',
      priority: 'high',
      waveData: {
        height: '4-5 meters',
        period: '8-10 seconds',
        direction: 'East-Northeast',
        affectedAreas: ['Marina Beach', 'Besant Nagar', 'Thiruvanmiyur']
      }
    },
    {
      content: 'Fishermen safety alert! Rough sea conditions expected for next 72 hours. All fishing activities suspended. Return to harbor immediately. 🚢⚠️ #FishermenSafety #SeaAlert',
      fullDescription: 'The Coast Guard has issued a safety alert for all fishermen. Sea conditions are expected to remain rough with high waves and strong winds. All fishing vessels are advised to return to harbor and avoid venturing into the sea.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      type: 'safety_alert',
      priority: 'high',
      seaConditions: {
        waveHeight: '3-4 meters',
        windSpeed: '45-55 kmph',
        visibility: '2-4 km',
        duration: '72 hours'
      }
    }
  ];
  
  const disasterImages = [
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop', // Flood
    'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=400&h=300&fit=crop', // Storm
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop', // Heavy rain
    'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop', // Coastal waves
    'https://images.unsplash.com/photo-1573160813959-df05c1b2e5d0?w=400&h=300&fit=crop', // Flooding
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop', // Emergency
    'https://images.unsplash.com/photo-1561553873-e8491a564fd0?w=400&h=300&fit=crop', // Coastal area
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // Ocean storm
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const account = accounts[Math.floor(Math.random() * accounts.length)];
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const hasMedia = Math.random() > 0.3; // 70% chance of having media
    
    const postTemplate = detailedPosts[Math.floor(Math.random() * detailedPosts.length)];
    
    return {
      id: `post_${Date.now()}_${i}`,
      platform,
      content: postTemplate.content,
      fullDescription: postTemplate.fullDescription,
      author: account.username,
      authorDetails: {
        displayName: account.displayName,
        avatar: account.avatar,
        verified: account.verified,
        followers: account.followers,
        bio: account.bio,
        location: locations[Math.floor(Math.random() * locations.length)].name,
        joined: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      location: locations[Math.floor(Math.random() * locations.length)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      engagement: {
        likes: Math.floor(Math.random() * (account.followers / 10)) + 10,
        shares: Math.floor(Math.random() * (account.followers / 50)) + 5,
        comments: Math.floor(Math.random() * (account.followers / 100)) + 2,
        views: Math.floor(Math.random() * (account.followers / 5)) + 50
      },
      media: hasMedia ? [{
        type: 'image',
        url: postTemplate.image,
        caption: 'Live situation update from the affected area',
        alt: 'Disaster situation image showing current conditions'
      }] : undefined,
      verified: account.verified,
      type: postTemplate.type,
      priority: postTemplate.priority,
      additionalData: postTemplate.emergencyInfo || postTemplate.weatherData || postTemplate.drillStats || postTemplate.waveData || postTemplate.seaConditions,
      hashtags: postTemplate.content.match(/#\w+/g) || [],
      mlAnalysis: {
        isRelevant: Math.random() > 0.1,
        sentiment: postTemplate.priority === 'critical' ? 'urgent' : ['negative', 'neutral', 'positive'][Math.floor(Math.random() * 3)],
        confidence: Math.random() * 0.3 + 0.7,
        hazardType: Math.random() > 0.3 ? hazardTypes[Math.floor(Math.random() * hazardTypes.length)] : undefined,
        severity: postTemplate.priority === 'critical' ? 'critical' : severities[Math.floor(Math.random() * severities.length)],
        isFake: Math.random() > 0.95,
        keywords: postTemplate.content.toLowerCase().split(' ').filter(word => word.length > 4).slice(0, 5)
      }
    };
  });
};

// Get coastal trending posts from real social media
router.get('/coastal-trends', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get real social media data
    const posts = await socialMediaIntegration.getAllSocialMediaData(parseInt(limit));
    
    // Sort by engagement for trending
    const trendingPosts = posts
      .filter(post => post.mlAnalysis.isRelevant)
      .sort((a, b) => (b.engagement.likes + b.engagement.shares + b.engagement.views) - 
                     (a.engagement.likes + a.engagement.shares + a.engagement.views))
      .slice(0, parseInt(limit));
    
    res.json({ posts: trendingPosts });
  } catch (error) {
    console.error('Error fetching coastal trends:', error);
    res.status(500).json({ message: 'Failed to fetch coastal trends' });
  }
});

// Get disaster-related posts from real social media
router.get('/disaster-posts', async (req, res) => {
  try {
    const { verified, limit = 20 } = req.query;
    
    // Get real Twitter posts about disasters
    const twitterPosts = await socialMediaIntegration.getTwitterPosts(
      'cyclone OR tsunami OR flood OR "coastal disaster" OR "storm surge" OR evacuation OR emergency', 
      parseInt(limit)
    );
    
    // Get real news articles about disasters
    const newsArticles = await socialMediaIntegration.getNewsArticles(
      'coastal disaster cyclone tsunami flood storm surge India emergency evacuation',
      Math.ceil(parseInt(limit) / 2)
    );
    
    let posts = [...twitterPosts, ...newsArticles];
    
    if (verified === 'true') {
      posts = posts.filter(post => post.verified && !post.mlAnalysis.isFake);
    }
    
    posts = posts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, parseInt(limit));
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching disaster posts:', error);
    res.status(500).json({ message: 'Failed to fetch disaster posts' });
  }
});

// Get crowdsourced data from real social media platforms
router.get('/crowdsourced', async (req, res) => {
  try {
    const { location, timeRange = '24h', minEngagement = 10, limit = 20 } = req.query;
    
    // Get real Instagram posts about coastal disasters
    const instagramPosts = await socialMediaIntegration.getInstagramPosts('coastaldisaster', parseInt(limit));
    
    // Get additional Twitter posts from users (not just verified accounts)
    const twitterPosts = await socialMediaIntegration.getTwitterPosts(
      '(cyclone OR tsunami OR flood OR "coastal area") (help OR rescue OR damage OR "need help")', 
      parseInt(limit)
    );
    
    let posts = [...instagramPosts, ...twitterPosts];
    
    // Filter by engagement
    posts = posts.filter(post => 
      (post.engagement.likes + post.engagement.shares + post.engagement.comments) >= parseInt(minEngagement)
    );
    
    // Filter by time range
    const now = new Date();
    const timeRangeMs = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };
    
    const cutoffTime = new Date(now.getTime() - (timeRangeMs[timeRange] || timeRangeMs['24h']));
    posts = posts.filter(post => new Date(post.timestamp) > cutoffTime);
    
    // Sort by relevance and engagement
    posts = posts
      .sort((a, b) => {
        const scoreA = (a.engagement.likes + a.engagement.shares + a.engagement.views) * a.mlAnalysis.confidence;
        const scoreB = (b.engagement.likes + b.engagement.shares + b.engagement.views) * b.mlAnalysis.confidence;
        return scoreB - scoreA;
      })
      .slice(0, parseInt(limit));
    
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching crowdsourced data:', error);
    res.status(500).json({ message: 'Failed to fetch crowdsourced data' });
  }
});

// Verify a social media post
router.post('/verify/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    // In production, this would call the ML service for verification
    const mlAnalysis = {
      isRelevant: Math.random() > 0.1,
      sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)],
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0 for verification
      hazardType: ['flood', 'cyclone', 'storm_surge'][Math.floor(Math.random() * 3)],
      severity: ['medium', 'high', 'critical'][Math.floor(Math.random() * 3)],
      isFake: Math.random() > 0.9 // 10% chance of being fake
    };
    
    const verified = !mlAnalysis.isFake && mlAnalysis.confidence > 0.8;
    
    res.json({
      verified,
      mlAnalysis
    });
  } catch (error) {
    console.error('Error verifying post:', error);
    res.status(500).json({ message: 'Failed to verify post' });
  }
});

module.exports = router;