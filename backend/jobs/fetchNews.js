const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

let isRunning = false;

// ✅ CLEAN LOGO MAP (PNG ONLY → no SVG issues)
const LOGO_MAP = {
  bbc: 'https://logo.clearbit.com/bbc.com',
  cnn: 'https://logo.clearbit.com/cnn.com',
  reuters: 'https://logo.clearbit.com/reuters.com',
  espn: 'https://logo.clearbit.com/espn.com',
  ndtv: 'https://logo.clearbit.com/ndtv.com'
};

// ✅ HELPERS
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIds(count) {
  return Array.from({ length: count }, () => new mongoose.Types.ObjectId());
}

function getLogo(source) {
  const key = Object.keys(LOGO_MAP).find(k =>
    source.toLowerCase().includes(k)
  );

  return key
    ? LOGO_MAP[key]
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(source)}&background=0D8ABC&color=fff`;
}

// ✅ MAIN FUNCTION
async function fetchAndStoreNews() {
  if (isRunning) return;
  isRunning = true;

  try {
    console.log("🔄 Fetching news...");

    const res = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'in',
        pageSize: 40,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    let articles = res.data?.articles || [];

    // ❌ REMOVE BAD ARTICLES
    articles = articles.filter(a =>
      a.title &&
      a.url &&
      a.title !== '[Removed]'
    );

    // ✅ REMOVE DUPLICATES
    const seen = new Set();
    const unique = articles.filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    console.log("🧠 Unique:", unique.length);

    for (let article of unique) {
      const exists = await Tweet.findOne({ articleUrl: article.url });
      if (exists) continue;

      const source = article.source?.name || "News";

      const handle = '@' + source
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

      const logo = getLogo(source);

      const likes = generateIds(random(20, 200));
      const retweets = generateIds(random(5, 80));

      await Tweet.create({
        text: article.title,
        images: article.urlToImage ? [{ url: article.urlToImage }] : [],
        isNewsArticle: true,
        newsSource: source,
        newsHandle: handle,
        newsLogo: logo,
        articleUrl: article.url,
        category: 'general',

        likes,
        retweets,
        replies: [],

        verified: true
      });
    }

    console.log("✅ Stored successfully");

  } catch (err) {
    console.log("⚠️ API error:", err.message);
  } finally {
    isRunning = false;
  }
}

// ✅ RUN ON START
fetchAndStoreNews();

// ✅ EVERY 1 HOUR (NO 429)
cron.schedule('0 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
