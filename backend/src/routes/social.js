const express = require('express');
const router = express.Router();

// Twitter API proxy route with enhanced media fetching
router.get('/twitter/search', async (req, res) => {
  try {
    const bearerToken = 'AAAAAAAAAAAAAAAAAAAAAAdu4QEAAAAAFbW9UPNQfx3psQx8Hn6Duqw%2BuhU%3DBIVeEeuBKAnDgE6RBrUpBp6ZMcTVZrezSes93RTG4eykW4SJiA';
    
    // Enhanced query for coastal disasters with images
    const query = 'flood OR tsunami OR cyclone OR "ocean waves" OR "storm surge" OR "heavy rain" OR thunderstorm OR "water damage" OR "coastal flooding" OR drowning OR "tidal waves" OR "sea storm" OR "water emergency" OR "flood rescue" OR "beach storm" OR "river overflow" OR "lake flooding" has:images -is:retweet lang:en';
    
    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=50&tweet.fields=created_at,author_id,public_metrics,geo,attachments,context_annotations,entities&expansions=author_id,attachments.media_keys&user.fields=username,name,profile_image_url,verified,public_metrics,description,location&media.fields=media_key,type,url,preview_image_url,alt_text,width,height,public_metrics`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twitter API Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    
    // Filter and enhance response for coastal disaster content with images
    if (data.data) {
      // Only keep tweets that have media attachments
      data.data = data.data.filter(tweet => 
        tweet.attachments && 
        tweet.attachments.media_keys && 
        tweet.attachments.media_keys.length > 0
      );
    }
    
    // Enhance user profile images to high resolution
    if (data.includes && data.includes.users) {
      data.includes.users = data.includes.users.map(user => ({
        ...user,
        profile_image_url: user.profile_image_url ? user.profile_image_url.replace('_normal', '_400x400') : null
      }));
    }

    // Enhance media URLs for better quality
    if (data.includes && data.includes.media) {
      data.includes.media = data.includes.media.map(media => ({
        ...media,
        url: media.url ? media.url + '?format=jpg&name=large' : media.url
      }));
    }

    console.log(`Twitter API: Fetched ${data.data?.length || 0} tweets with images, ${data.includes?.media?.length || 0} media items`);
    
    res.json(data);
  } catch (error) {
    console.error('Twitter API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch Twitter data' });
  }
});

module.exports = router;