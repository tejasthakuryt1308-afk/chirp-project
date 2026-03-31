const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');
const NewsSource = require('../models/NewsSource');

// ✅ REPLACE CLEARBIT WITH STABLE LOGOS
const LOGO_MAP = {
  'bbc news': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/BBC_News_2022_%28Alt%29.svg',
  'cnn': 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg',
  'reuters': 'https://upload.wikimedia.org/wikipedia/commons/8/86/Reuters_logo.svg',
  'the new york times': 'https://upload.wikimedia.org/wikipedia/commons/7/77/The_New_York_Times_logo.png',
  'the verge': 'https://upload.wikimedia.org/wikipedia/commons/3/3b/The_Verge_logo.svg',
  'techcrunch': 'https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg',
  'espn': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
  'ndtv': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NDTV_logo.svg'
};

// ✅ CLEAN NEWS SOURCES (NO CLEARBIT)
const NEWS_SOURCES = [
  { id: 'bbc-news', name: 'BBC News', handle: '@bbcnews' },
  { id: 'cnn', name: 'CNN', handle: '@cnn' },
  { id: 'the-new-york-times', name: 'The New York Times', handle: '@nytimes' },
  { id: 'reuters', name: 'Reuters', handle: '@reuters' },
  { id: 'the-verge', name: 'The Verge', handle: '@theverge' },
  { id: 'techcrunch', name: 'TechCrunch', handle: '@techcrunch' },
  { id: 'espn', name: 'ESPN', handle: '@espn' },
  { id: 'ndtv', name: 'NDTV', handle: '@ndtv' }
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
  
  return Array(Math.min(count, 5)).fill(null).map(() => ({
    user: new mongoose.Types.ObjectId(),
    text: templates[Math.floor(Math.random() * templates.length)],
    createdAt: new Date(Date.now() - Math.random() * 86400000)
  }));
}

async function fetchAndStoreNews() {
  try {
    console.log('🔄 Fetching news...');
    
    // ✅ CREATE NEWS SOURCES WITH LOGOS
    for (const source of NEWS_SOURCES) {
      const key = source.name.toLowerCase();
      const logo = LOGO_MAP[key] || null;

      await NewsSource.findOneAndUpdate(
        { handle: source.handle },
        {
          name: source.name,
          handle: source.handle,
          logo,
          verified: true,
          description: `Breaking news from ${source.name}`
        },
        { upsert: true }
      );
    }

    // ✅ FETCH NEWS
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

        const sourceName = article.source.name.toLowerCase();

        // ✅ MATCH LOGO FROM MAP
        const matchedKey = Object.keys(LOGO_MAP).find(key =>
          sourceName.includes(key)
        );

        const sourceInfo = {
          name: article.source.name,
          handle: '@' + sourceName.replace(/\s+/g, ''),
          logo: matchedKey ? LOGO_MAP[matchedKey] : null
        };

        const likesCount = Math.floor(Math.random() * 250) + 15;
        const retweetsCount = Math.floor(likesCount * 0.3);
        const repliesCount = Math.floor(likesCount * 0.1);

        const existing = await Tweet.findOne({ articleUrl: article.url });
        if (existing) continue;

        await Tweet.create({
          text: article.title,
          images: article.urlToImage ? [{ url: article.urlToImage }] : [],
          isNewsArticle: true,
          newsSource: sourceInfo.name,
          newsHandle: sourceInfo.handle,
          newsLogo: sourceInfo.logo, // ✅ NOW ALWAYS STABLE
          articleUrl: article.url,
          category: category,
          likes: Array.from({ length: likesCount }, () => new mongoose.Types.ObjectId()),
          retweets: Array.from({ length: retweetsCount }, () => new mongoose.Types.ObjectId()),
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
