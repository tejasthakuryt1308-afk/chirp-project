const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

// ✅ SAFE LOGO MAP
const LOGO_MAP = {
  'bbc news': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/BBC_News_2022_%28Alt%29.svg',
  'cnn': 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg',
  'reuters': 'https://upload.wikimedia.org/wikipedia/commons/8/86/Reuters_logo.svg',
  'espn': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
  'ndtv': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NDTV_logo.svg'
};

// ✅ KEEP LOW FOR SAFETY
const CATEGORIES = ['general'];

function generateComments(count) {
  const templates = [
    "This is huge news! 🔥",
    "Finally someone is covering this",
    "Thanks for sharing 👍",
    "Wow, didn't see this coming",
    "This changes everything"
  ];

  return Array(Math.min(count, 3)).fill(null).map(() => ({
    user: new mongoose.Types.ObjectId(),
    text: templates[Math.floor(Math.random() * templates.length)],
    createdAt: new Date()
  }));
}

async function fetchAndStoreNews() {
  try {
    console.log('🔄 Fetching news...');

    for (const category of CATEGORIES) {

      await new Promise(res => setTimeout(res, 1000)); // ✅ delay

      let response;

      try {
        response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category,
            pageSize: 5,
            apiKey: process.env.NEWS_API_KEY
          }
        });
      } catch (err) {
        console.log('⚠️ Using fallback news (API blocked)');

        // ✅ FALLBACK DATA
        response = {
          data: {
            articles: [
              {
                title: "Breaking: Market sees major shift in 2026",
                url: "https://example.com/news1",
                urlToImage: "https://picsum.photos/600/400?1",
                source: { name: "Reuters" }
              },
              {
                title: "Tech industry prepares for next big revolution",
                url: "https://example.com/news2",
                urlToImage: "https://picsum.photos/600/400?2",
                source: { name: "BBC News" }
              },
              {
                title: "Sports world reacts to unexpected results",
                url: "https://example.com/news3",
                urlToImage: "https://picsum.photos/600/400?3",
                source: { name: "ESPN" }
              }
            ]
          }
        };
      }

      for (const article of response.data.articles || []) {
        if (!article.title) continue;

        const existing = await Tweet.findOne({ articleUrl: article.url });
        if (existing) continue;

        const cleanName = article.source?.name || "News";

        // ✅ MATCH LOGO
        const matchedKey = Object.keys(LOGO_MAP).find(key =>
          cleanName.toLowerCase().includes(key)
        );

        const logo = matchedKey ? LOGO_MAP[matchedKey] : null;

        const handle =
          '@' +
          cleanName
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');

        const likesCount = Math.floor(Math.random() * 100) + 10;
        const retweetsCount = Math.floor(likesCount * 0.3);
        const repliesCount = Math.floor(likesCount * 0.1);

        await Tweet.create({
          text: article.title,
          images: article.urlToImage ? [{ url: article.urlToImage }] : [],
          isNewsArticle: true,
          newsSource: cleanName,
          newsHandle: handle,
          newsLogo: logo,
          articleUrl: article.url,
          category,
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

// ✅ FORCE RUN ON DEPLOY (so feed never empty)
fetchAndStoreNews();

// ✅ CRON EVERY 30 MIN
cron.schedule('*/30 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
