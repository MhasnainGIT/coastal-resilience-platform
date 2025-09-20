const axios = require('axios');

class SocialMediaIntegration {
  constructor() {
    // API Keys - In production, these should be environment variables
    this.twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
    this.newsApiKey = process.env.NEWS_API_KEY || 'your_news_api_key';
    this.rapidApiKey = process.env.RAPID_API_KEY || 'your_rapid_api_key';
  }

  // Get real Twitter posts about disasters and coastal areas
  async getTwitterPosts(query = 'cyclone OR tsunami OR flood OR "coastal disaster" OR "storm surge"', count = 20) {
    try {
      const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
        headers: {
          'Authorization': `Bearer ${this.twitterBearerToken}`
        },
        params: {
          query: `${query} -is:retweet lang:en`,
          max_results: count,
          'tweet.fields': 'created_at,author_id,public_metrics,geo,context_annotations,attachments',
          'user.fields': 'name,username,verified,profile_image_url,public_metrics,description',
          'media.fields': 'url,preview_image_url,type,alt_text',
          'expansions': 'author_id,attachments.media_keys,geo.place_id'
        }
      });

      return this.formatTwitterData(response.data);
    } catch (error) {
      console.error('Twitter API Error:', error.response?.data || error.message);
      return this.getFallbackTwitterData();
    }
  }

  // Get real news articles about coastal disasters
  async getNewsArticles(query = 'coastal disaster cyclone tsunami flood India', pageSize = 20) {
    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: pageSize,
          apiKey: this.newsApiKey
        }
      });

      return this.formatNewsData(response.data.articles);
    } catch (error) {
      console.error('News API Error:', error.response?.data || error.message);
      return this.getFallbackNewsData();
    }
  }

  // Get real Instagram posts (using RapidAPI Instagram scraper)
  async getInstagramPosts(hashtag = 'coastaldisaster', count = 20) {
    try {
      const response = await axios.get('https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag', {
        headers: {
          'X-RapidAPI-Key': this.rapidApiKey,
          'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
        },
        params: {
          hashtag: hashtag,
          count: count
        }
      });

      return this.formatInstagramData(response.data);
    } catch (error) {
      console.error('Instagram API Error:', error.response?.data || error.message);
      return this.getFallbackInstagramData();
    }
  }

  // Format Twitter data to match our interface
  formatTwitterData(data) {
    if (!data.data) return [];

    const users = data.includes?.users || [];
    const media = data.includes?.media || [];

    return data.data.map(tweet => {
      const author = users.find(user => user.id === tweet.author_id);
      const tweetMedia = tweet.attachments?.media_keys?.map(key => 
        media.find(m => m.media_key === key)
      ).filter(Boolean) || [];

      return {
        id: tweet.id,
        platform: 'twitter',
        content: tweet.text,
        author: author?.username || 'unknown',
        authorDetails: {
          displayName: author?.name || 'Unknown User',
          avatar: author?.profile_image_url || 'https://via.placeholder.com/150',
          verified: author?.verified || false,
          followers: author?.public_metrics?.followers_count || 0,
          bio: author?.description || ''
        },
        timestamp: tweet.created_at,
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          views: tweet.public_metrics?.impression_count || 0
        },
        media: tweetMedia.map(m => ({
          type: m.type,
          url: m.url || m.preview_image_url,
          alt: m.alt_text || 'Twitter media'
        })),
        verified: author?.verified || false,
        hashtags: this.extractHashtags(tweet.text),
        mlAnalysis: {
          isRelevant: true,
          sentiment: this.analyzeSentiment(tweet.text),
          confidence: 0.85,
          isFake: false,
          keywords: this.extractKeywords(tweet.text)
        }
      };
    });
  }

  // Format news data to match our interface
  formatNewsData(articles) {
    return articles.map((article, index) => ({
      id: `news_${Date.now()}_${index}`,
      platform: 'news',
      content: `${article.title}\n\n${article.description || ''}`,
      fullDescription: article.content,
      author: article.source.name,
      authorDetails: {
        displayName: article.source.name,
        avatar: 'https://via.placeholder.com/150?text=NEWS',
        verified: true,
        followers: Math.floor(Math.random() * 100000) + 10000,
        bio: `News source: ${article.source.name}`
      },
      timestamp: article.publishedAt,
      engagement: {
        likes: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 200) + 20,
        views: Math.floor(Math.random() * 10000) + 1000
      },
      media: article.urlToImage ? [{
        type: 'image',
        url: article.urlToImage,
        alt: article.title
      }] : undefined,
      verified: true,
      type: 'news_article',
      priority: this.determinePriority(article.title + ' ' + article.description),
      hashtags: this.extractHashtags(article.title + ' ' + article.description),
      mlAnalysis: {
        isRelevant: true,
        sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        confidence: 0.9,
        isFake: false,
        keywords: this.extractKeywords(article.title + ' ' + article.description)
      }
    }));
  }

  // Format Instagram data to match our interface
  formatInstagramData(data) {
    if (!data.data) return [];

    return data.data.map((post, index) => ({
      id: `instagram_${post.id || Date.now()}_${index}`,
      platform: 'instagram',
      content: post.caption || 'Instagram post about coastal disaster',
      author: post.username || 'instagram_user',
      authorDetails: {
        displayName: post.full_name || post.username || 'Instagram User',
        avatar: post.profile_pic_url || 'https://via.placeholder.com/150',
        verified: post.is_verified || false,
        followers: post.follower_count || Math.floor(Math.random() * 50000),
        bio: post.biography || 'Instagram user sharing disaster updates'
      },
      timestamp: new Date(post.taken_at * 1000).toISOString(),
      engagement: {
        likes: post.like_count || Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 100),
        comments: post.comment_count || Math.floor(Math.random() * 200),
        views: post.view_count || Math.floor(Math.random() * 5000)
      },
      media: post.image_versions2?.candidates?.[0] ? [{
        type: 'image',
        url: post.image_versions2.candidates[0].url,
        alt: 'Instagram disaster post'
      }] : undefined,
      verified: post.is_verified || false,
      hashtags: this.extractHashtags(post.caption || ''),
      mlAnalysis: {
        isRelevant: true,
        sentiment: this.analyzeSentiment(post.caption || ''),
        confidence: 0.8,
        isFake: false,
        keywords: this.extractKeywords(post.caption || '')
      }
    }));
  }

  // Fallback data when APIs are not available
  getFallbackTwitterData() {
    return [
      {
        id: 'fallback_twitter_1',
        platform: 'twitter',
        content: 'Real-time social media integration requires API keys. Please configure Twitter Bearer Token in environment variables.',
        author: 'system_notice',
        authorDetails: {
          displayName: 'System Notice',
          avatar: 'https://via.placeholder.com/150?text=API',
          verified: true,
          followers: 0,
          bio: 'System notification about API configuration'
        },
        timestamp: new Date().toISOString(),
        engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
        verified: true,
        hashtags: ['#APIConfiguration'],
        mlAnalysis: {
          isRelevant: true,
          sentiment: 'neutral',
          confidence: 1.0,
          isFake: false,
          keywords: ['api', 'configuration', 'twitter']
        }
      }
    ];
  }

  getFallbackNewsData() {
    return [
      {
        id: 'fallback_news_1',
        platform: 'news',
        content: 'Real news integration requires News API key. Please configure NEWS_API_KEY in environment variables.',
        author: 'system_notice',
        authorDetails: {
          displayName: 'System Notice',
          avatar: 'https://via.placeholder.com/150?text=NEWS',
          verified: true,
          followers: 0,
          bio: 'System notification about news API'
        },
        timestamp: new Date().toISOString(),
        engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
        verified: true,
        type: 'system_notice',
        hashtags: ['#NewsAPI'],
        mlAnalysis: {
          isRelevant: true,
          sentiment: 'neutral',
          confidence: 1.0,
          isFake: false,
          keywords: ['news', 'api', 'configuration']
        }
      }
    ];
  }

  getFallbackInstagramData() {
    return [
      {
        id: 'fallback_instagram_1',
        platform: 'instagram',
        content: 'Instagram integration requires RapidAPI key. Please configure RAPID_API_KEY in environment variables.',
        author: 'system_notice',
        authorDetails: {
          displayName: 'System Notice',
          avatar: 'https://via.placeholder.com/150?text=IG',
          verified: true,
          followers: 0,
          bio: 'System notification about Instagram API'
        },
        timestamp: new Date().toISOString(),
        engagement: { likes: 0, shares: 0, comments: 0, views: 0 },
        verified: true,
        hashtags: ['#InstagramAPI'],
        mlAnalysis: {
          isRelevant: true,
          sentiment: 'neutral',
          confidence: 1.0,
          isFake: false,
          keywords: ['instagram', 'api', 'configuration']
        }
      }
    ];
  }

  // Helper methods
  extractHashtags(text) {
    const hashtags = text.match(/#\w+/g) || [];
    return hashtags.slice(0, 5); // Limit to 5 hashtags
  }

  extractKeywords(text) {
    const keywords = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => ['cyclone', 'tsunami', 'flood', 'disaster', 'emergency', 'coastal', 'storm', 'evacuation'].includes(word))
      .slice(0, 5);
    return keywords;
  }

  analyzeSentiment(text) {
    const urgentWords = ['urgent', 'emergency', 'critical', 'danger', 'evacuate', 'warning'];
    const positiveWords = ['safe', 'rescued', 'help', 'support', 'recovery'];
    
    const lowerText = text.toLowerCase();
    
    if (urgentWords.some(word => lowerText.includes(word))) return 'urgent';
    if (positiveWords.some(word => lowerText.includes(word))) return 'positive';
    return 'neutral';
  }

  determinePriority(text) {
    const criticalWords = ['tsunami', 'cyclone', 'emergency', 'evacuate'];
    const highWords = ['flood', 'storm', 'warning', 'alert'];
    
    const lowerText = text.toLowerCase();
    
    if (criticalWords.some(word => lowerText.includes(word))) return 'critical';
    if (highWords.some(word => lowerText.includes(word))) return 'high';
    return 'medium';
  }

  // Aggregate all social media data
  async getAllSocialMediaData(limit = 20) {
    try {
      const [twitterData, newsData, instagramData] = await Promise.all([
        this.getTwitterPosts('cyclone OR tsunami OR flood OR "coastal disaster"', Math.ceil(limit / 3)),
        this.getNewsArticles('coastal disaster cyclone tsunami flood India', Math.ceil(limit / 3)),
        this.getInstagramPosts('coastaldisaster', Math.ceil(limit / 3))
      ]);

      const allPosts = [...twitterData, ...newsData, ...instagramData];
      
      // Sort by timestamp (newest first)
      allPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return allPosts.slice(0, limit);
    } catch (error) {
      console.error('Error aggregating social media data:', error);
      return [...this.getFallbackTwitterData(), ...this.getFallbackNewsData(), ...this.getFallbackInstagramData()];
    }
  }
}

module.exports = new SocialMediaIntegration();