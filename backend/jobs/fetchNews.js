const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');
const NewsSource = require('../models/NewsSource');

// ✅ STABLE LOGOS
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

const CATEGORIES = ['general', 'sports', 'technology']; // ✅ reduced calls

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

    for (const category of CATEGORIES) {

      // ✅ RATE LIMIT PROTECTION
      await new Promise(res => setTimeout(res, 1200));

      let response;

      try {
        response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category: category,
            pageSize: 5,
            apiKey: process.env.NEWS_API_KEY
          }
        });
      } catch (err) {
        if (err.response?.status === 429) {
          console.log('⏳ Rate limited, retrying...');
          await new Promise(res => setTimeout(res, 3000));
          continue;
        } else {
          console.error('❌ API error:', err.message);
          continue;
        }
      }

      for (const article of response.data.articles || []) {
        if (!article.title || article.title === '[Removed]') continue;

        // ✅ CLEAN SOURCE NAME
        const sourceNameRaw = article.source?.name || "Unknown";
        const cleanName = sourceNameRaw.trim();

        // ✅ EXTRACT DOMAIN
        let domain = "";
        try {
          domain = new URL(article.url).hostname.replace("www.", "");
        } catch (e) {
          domain = "";
        }

        // ✅ MATCH LOGO
        const matchedKey = Object.keys(LOGO_MAP).find(key =>
          cleanName.toLowerCase().includes(key)
        );

        const logo = matchedKey
          ? LOGO_MAP[matchedKey]
          : domain
          ? `https://logo.clearbit.com/${domain}`
          : null;

        const handle =
          '@' +
          cleanName
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');

        const existing = await Tweet.findOne({ articleUrl: article.url });
        if (existing) continue;

        // ✅ REALISTIC ENGAGEMENT
        const likesCount = Math.floor(Math.random() * 250) + 15;
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

// ✅ PREVENT DOUBLE EXECUTION ON RENDER
if (process.env.NODE_ENV !== 'production') {
  fetchAndStoreNews();
}

// ✅ CRON (EVERY 30 MIN)
cron.schedule('*/30 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
