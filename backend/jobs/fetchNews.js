const cron = require('node-cron');
const axios = require('axios');
const Tweet = require('../models/Tweet');
const NewsSource = require('../models/NewsSource');

const NEWS_SOURCES = [
  { id: 'bbc-news', name: 'BBC News', handle: '@bbcnews', logo: 'https://logo.clearbit.com/bbc.com' },
  { id: 'cnn', name: 'CNN', handle: '@cnn', logo: 'https://logo.clearbit.com/cnn.com' },
  { id: 'the-new-york-times', name: 'The New York Times', handle: '@nytimes', logo: 'https://logo.clearbit.com/nytimes.com' },
  { id: 'reuters', name: 'Reuters', handle: '@reuters', logo: 'https://logo.clearbit.com/reuters.com' },
  { id: 'the-verge', name: 'The Verge', handle: '@theverge', logo: 'https://logo.clearbit.com/theverge.com' },
  { id: 'techcrunch', name: 'TechCrunch', handle: '@techcrunch', logo: 'https://logo.clearbit.com/techcrunch.com' },
  { id: 'espn', name: 'ESPN', handle: '@espn', logo: 'https://logo.clearbit.com/espn.com' },
  { id: 'ndtv', name: 'NDTV', handle: '@ndtv', logo: 'https://logo.clearbit.com/ndtv.com' }
];

const CATEGORIES = ['general', 'sports', 'technology', 'business', 'entertainment', 'health', 'science'];

function generateComments(count) {
  const templates = [
    "This is huge news! 🔥",
    "Finally someone is covering this",
    "Thanks for sharing 👍",
    "Wow, didn't see this coming",
    "This changes everything",
    "Great reporting!",
    "Very informative",
    "This is massive 🚨",
    "Important update",
    "Breaking news!"
  ];
  
  return Array(Math.min(count, 5)).fill(null).map((_, i) => ({
    user: `user${Math.floor(Math.random() * 10000)}`,
    text: templates[Math.floor(Math.random() * templates.length)],
    createdAt: new Date(Date.now() - Math.random() * 86400000)
  }));
}

async function fetchAndStoreNews() {
  try {
    console.log('🔄 Fetching news...');
    
    // Create news sources
    for (const source of NEWS_SOURCES) {
      await NewsSource.findOneAndUpdate(
        { handle: source.handle },
        {
          name: source.name,
          handle: source.handle,
          logo: source.logo,
          verified: true,
          description: `Breaking news from ${source.name}`
        },
        { upsert: true }
      );
    }

    // Fetch news
    for (const category of CATEGORIES) {
      const response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {
          country: 'in',
          category: category,
          pageSize: 5,
          apiKey: process.env.NEWS_API_KEY
        }
      });

      for (const article of response.data.articles || []) {
        if (!article.title || article.title === '[Removed]') continue;

        let sourceInfo = NEWS_SOURCES.find(s => 
          article.source.name.toLowerCase().includes(s.name.toLowerCase())
        );

        if (!sourceInfo) {
          const hostname = new URL(article.url).hostname;
          sourceInfo = {
            name: article.source.name,
            handle: '@' + article.source.name.toLowerCase().replace(/\s+/g, ''),
            logo: `https://logo.clearbit.com/${hostname}`
          };
        }

        const likes = Math.floor(Math.random() * 10000) + 500;
        const retweets = Math.floor(likes * 0.3);
        const repliesCount = Math.floor(likes * 0.1);

        const existing = await Tweet.findOne({ articleUrl: article.url });
        if (existing) continue;

        await Tweet.create({
          text: article.title,
          images: article.urlToImage ? [{ url: article.urlToImage }] : [],
          isNewsArticle: true,
          newsSource: sourceInfo.name,
          newsHandle: sourceInfo.handle,
          newsLogo: sourceInfo.logo,
          articleUrl: article.url,
          category: category,
          likes: Array(likes).fill(null).map(() => `fake${Math.random()}`),
          retweets: Array(retweets).fill(null).map(() => `fake${Math.random()}`),
          replies: generateComments(repliesCount),
          verified: true
        });
      }
    }

    console.log('✅ News stored');
  } catch (error) {
    console.error('❌ News fetch error:', error.message);
  }
}

fetchAndStoreNews();
cron.schedule('*/30 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
