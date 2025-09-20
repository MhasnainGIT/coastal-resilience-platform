# 🌐 Real Social Media Integration Setup

## Overview
The Coastal Resilience Platform now integrates with **real social media APIs** to fetch live disaster-related content from Twitter, News sources, and Instagram.

## 🔑 Required API Keys

### 1. Twitter API v2 (Essential)
**Get real-time tweets about disasters and coastal emergencies**

#### Setup Steps:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app or use existing one
3. Navigate to "Keys and Tokens"
4. Copy the **Bearer Token**
5. Add to `.env`: `TWITTER_BEARER_TOKEN=your_bearer_token_here`

#### What it fetches:
- Real tweets about cyclones, tsunamis, floods
- Emergency evacuation notices
- Government disaster alerts
- User reports from affected areas

### 2. News API (Essential)
**Get real news articles about coastal disasters**

#### Setup Steps:
1. Go to [NewsAPI.org](https://newsapi.org/)
2. Sign up for free account (500 requests/day)
3. Get your API key from dashboard
4. Add to `.env`: `NEWS_API_KEY=your_news_api_key_here`

#### What it fetches:
- Breaking news about coastal disasters
- Government press releases
- Weather warnings and alerts
- Disaster recovery updates

### 3. RapidAPI Instagram (Optional)
**Get Instagram posts about disasters**

#### Setup Steps:
1. Go to [RapidAPI](https://rapidapi.com/)
2. Subscribe to "Instagram Scraper API"
3. Get your RapidAPI key
4. Add to `.env`: `RAPID_API_KEY=your_rapid_api_key_here`

#### What it fetches:
- Instagram posts with disaster hashtags
- Visual content from affected areas
- Community reports and updates

## 🚀 Quick Setup

### 1. Copy Environment File
```bash
cp backend/.env.example backend/.env
```

### 2. Add Your API Keys
Edit `backend/.env` and add your API keys:
```env
# Essential for real social media data
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid%2BULvsea4JtiGRiSDSJSI%3DEUifiRBkKG5E2XzMDjRfl76ZC9Ub0wnz4XsNiRVBChTYbJcE3F
NEWS_API_KEY=1234567890abcdef1234567890abcdef

# Optional for Instagram integration
RAPID_API_KEY=your_rapid_api_key_here
```

### 3. Install Dependencies
```bash
cd backend
npm install axios
```

### 4. Restart Backend Server
```bash
npm run dev
```

## 📊 Real Data Sources

### Twitter Integration
- **Query**: `cyclone OR tsunami OR flood OR "coastal disaster" OR "storm surge"`
- **Filters**: Recent tweets, English language, no retweets
- **Data**: Author info, engagement metrics, media attachments
- **Rate Limit**: 300 requests per 15 minutes

### News API Integration
- **Query**: `coastal disaster cyclone tsunami flood India`
- **Sources**: Major news outlets, government sources
- **Data**: Headlines, descriptions, images, publication dates
- **Rate Limit**: 500 requests per day (free tier)

### Instagram Integration
- **Hashtags**: `#coastaldisaster #cyclone #tsunami #flood`
- **Data**: Posts, images, captions, user info
- **Rate Limit**: Varies by RapidAPI plan

## 🔧 API Endpoints

### Get Trending Posts
```
GET /api/social-media/coastal-trends?limit=20
```
Returns real trending posts from all platforms

### Get Disaster Posts
```
GET /api/social-media/disaster-posts?verified=true&limit=20
```
Returns verified disaster-related posts

### Get Community Posts
```
GET /api/social-media/crowdsourced?timeRange=24h&limit=20
```
Returns community-generated content

## 🛡️ Fallback System

If API keys are not configured, the system will:
1. Show system notices about API configuration
2. Provide setup instructions
3. Continue working with local data
4. Not break the application

## 📈 Data Processing

### Real-time Features:
- **Live Updates**: Fetches new posts every 30 seconds
- **Sentiment Analysis**: Categorizes posts as urgent/positive/neutral
- **Priority Detection**: Identifies critical/high/medium priority content
- **Hashtag Extraction**: Automatically extracts relevant hashtags
- **Keyword Analysis**: Identifies disaster-related keywords

### Content Filtering:
- **Relevance**: Only disaster and coastal-related content
- **Language**: English content prioritized
- **Engagement**: Minimum engagement thresholds
- **Time Range**: Configurable time windows (1h, 6h, 24h, 7d)

## 🔒 Security & Privacy

- **API Keys**: Stored securely in environment variables
- **Rate Limiting**: Respects API rate limits
- **Data Privacy**: No personal data stored permanently
- **Content Filtering**: Inappropriate content filtered out

## 💰 Cost Considerations

### Free Tiers Available:
- **Twitter API v2**: Free tier with rate limits
- **News API**: 500 requests/day free
- **RapidAPI**: Various free tiers available

### Production Scaling:
- **Twitter**: Paid plans for higher limits
- **News API**: Business plans for unlimited requests
- **Instagram**: Premium RapidAPI subscriptions

## 🚨 Emergency Mode

During major disasters, the system can:
1. **Increase Refresh Rate**: Update every 10 seconds
2. **Expand Search Terms**: Include location-specific keywords
3. **Priority Filtering**: Show only critical/high priority content
4. **Government Sources**: Prioritize official accounts

## 📞 Support

### API Issues:
- **Twitter**: [Twitter Developer Support](https://developer.twitter.com/en/support)
- **News API**: [NewsAPI Support](https://newsapi.org/support)
- **RapidAPI**: [RapidAPI Support](https://rapidapi.com/support)

### Integration Help:
- Check API key configuration in `.env`
- Verify API quotas and limits
- Monitor console logs for API errors
- Test individual endpoints

---

## 🎯 Next Steps

1. **Get API Keys** from the providers above
2. **Configure Environment** variables
3. **Test Integration** with real data
4. **Monitor Performance** and adjust rate limits
5. **Scale Up** with paid plans as needed

**🇮🇳 Ready to serve real-time disaster information to the nation!**