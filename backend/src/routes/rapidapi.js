const express = require('express');
const router = express.Router();

// Rate limiting with longer delays
const addDelay = () => new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

// RapidAPI News Integration - Only RapidAPI
router.get('/news/disasters', async (req, res) => {
  await addDelay(); // Add 2 second delay
  try {
    const rapidApiKey = process.env.RAPID_API_KEY;
    
    // Use RapidAPI Real-Time News
    const newsResponse = await fetch('https://real-time-news-data.p.rapidapi.com/search?query=tsunami%20cyclone%20flood%20disaster&country=IN&lang=en', {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'real-time-news-data.p.rapidapi.com'
      }
    });

    if (!newsResponse.ok) {
      throw new Error(`News API failed: ${newsResponse.status}`);
    }

    const newsData = await newsResponse.json();
    
    // Transform news data
    const transformedNews = newsData.data?.map(article => ({
      id: article.link || Date.now(),
      platform: 'news',
      author: {
        username: article.source_name || 'NewsSource',
        displayName: article.source_name || 'News Source',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(article.source_name || 'News')}&background=dc2626&color=fff&size=128`,
        verified: true
      },
      content: {
        text: article.title + (article.snippet ? ` - ${article.snippet}` : ''),
        images: article.photo_url ? [article.photo_url] : [
          'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&q=80'
        ],
        videos: [],
        hashtags: ['news', 'disaster', 'alert']
      },
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 200) + 20
      },
      location: {
        name: 'India',
        coordinates: [77.2090, 28.6139]
      },
      timestamp: article.published_datetime || new Date().toISOString(),
      isEmergency: true,
      severity: 'high',
      verified: true,
      url: article.link
    })) || [];

    console.log(`RapidAPI News: Fetched ${transformedNews.length} disaster news articles`);
    res.json({ data: transformedNews });
    
  } catch (error) {
    console.error('RapidAPI News error:', error);
    res.json({ data: [] });
  }
});

// Weather from RapidAPI
router.get('/weather/disasters', async (req, res) => {
  await addDelay(); // Add 2 second delay
  try {
    const rapidApiKey = process.env.RAPID_API_KEY;
    
    // Use RapidAPI Weather
    const weatherResponse = await fetch('https://weatherapi-com.p.rapidapi.com/current.json?q=Mumbai', {
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
      }
    });

    if (!weatherResponse.ok) {
      throw new Error(`Weather API failed: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    
    const weatherPost = {
      id: 'weather_' + Date.now(),
      platform: 'weather',
      author: {
        username: 'WeatherAPI',
        displayName: 'Weather Alert System',
        avatar: 'https://ui-avatars.com/api/?name=Weather&background=0ea5e9&color=fff&size=128',
        verified: true
      },
      content: {
        text: `🌤️ Weather Alert: ${weatherData.current?.condition?.text} in ${weatherData.location?.name}. Temp: ${weatherData.current?.temp_c}°C. Humidity: ${weatherData.current?.humidity}%. Wind: ${weatherData.current?.wind_kph} km/h`,
        images: [
          'https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=800&h=600&fit=crop&q=80'
        ],
        videos: [],
        hashtags: ['weather', 'alert', 'live']
      },
      engagement: {
        likes: Math.floor(Math.random() * 500) + 200,
        shares: Math.floor(Math.random() * 300) + 100,
        comments: Math.floor(Math.random() * 150) + 50
      },
      location: {
        name: weatherData.location?.name || 'Mumbai',
        coordinates: [weatherData.location?.lon || 72.8777, weatherData.location?.lat || 19.0760]
      },
      timestamp: new Date().toISOString(),
      isEmergency: weatherData.current?.temp_c > 35 || weatherData.current?.wind_kph > 50,
      severity: weatherData.current?.temp_c > 40 ? 'critical' : 'medium',
      verified: true
    };

    console.log('RapidAPI Weather: Fetched current weather data');
    res.json({ data: [weatherPost] });
    
  } catch (error) {
    console.error('RapidAPI Weather error:', error);
    res.json({ data: [] });
  }
});

module.exports = router;