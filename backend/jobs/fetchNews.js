const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

// ✅ LOGO MAP (EXPANDED)
const LOGO_MAP = {
  'bbc': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/BBC_News_2022_%28Alt%29.svg',
  'cnn': 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg',
  'reuters': 'https://upload.wikimedia.org/wikipedia/commons/8/86/Reuters_logo.svg',
  'espn': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
  'ndtv': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NDTV_logo.svg',
  'guardian': 'https://upload.wikimedia.org/wikipedia/commons/0/0c/The_Guardian_logo.svg',
  'times': 'https://upload.wikimedia.org/wikipedia/commons/7/77/The_New_York_Times_logo.png'
};

const PAGE_SIZE = 20;
const MAX_POSTS = 60;

function generateComments(count) {
  return Array(Math.min(count, 3)).fill(null).map(() => ({
    user: new mongoose.Types.ObjectId(),
    text: "Interesting update 👀",
    createdAt: new Date()
  }));
}

async function fetchAndStoreNews() {
  try {
    console.log("🔄 Fetching news...");

    let allArticles = [];

    // ✅ FETCH MULTIPLE PAGES
    for (let page = 1; page <= 3; page++) {
      try {
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category: 'general',
            pageSize: PAGE_SIZE,
            page,
            apiKey: process.env.NEWS_API_KEY
          }
        });

        allArticles = allArticles.concat(res.data.articles || []);

      } catch (err) {
        console.log("⚠️ API error:", err.message);
        break;
      }
    }

    if (!allArticles.length) {
      console.log("⚠️ No articles fetched");
      return;
    }

    // ✅ REMOVE DUPLICATES (TITLE + URL)
    const seen = new Set();

    const uniqueArticles = allArticles.filter(a => {
      const key = `${a.title}-${a.url}`;
      if (!a.title || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log("🧠 Unique articles:", uniqueArticles.length);

    // ✅ LIMIT
    const articlesToStore = uniqueArticles.slice(0, MAX_POSTS);

    for (const article of articlesToStore) {

      // ✅ STRONG DUPLICATE CHECK IN DB
      const exists = await Tweet.findOne({ articleUrl: article.url });
      if (exists) continue;

      const sourceName = article.source?.name || "News";

      // ✅ BETTER LOGO MATCH
      const key = Object.keys(LOGO_MAP).find(k =>
        sourceName.toLowerCase().includes(k)
      );

      const logo = key
        ? LOGO_MAP[key]
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(sourceName)}&background=random&color=fff&size=128`;

      const handle = '@' + sourceName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

      const likes = Math.floor(Math.random() * 400 + 20);
      const retweets = Math.floor(likes * 0.3);
      const replies = Math.floor(likes * 0.1);

      await Tweet.create({
        text: article.title,
        images: article.urlToImage ? [{ url: article.urlToImage }] : [],
        isNewsArticle: true,
        newsSource: sourceName,
        newsHandle: handle,
        newsLogo: logo,
        articleUrl: article.url,
        category: 'general',

        likes: Array.from({ length: likes }, () => new mongoose.Types.ObjectId()),
        retweets: Array.from({ length: retweets }, () => new mongoose.Types.ObjectId()),
        replies: generateComments(replies),

        verified: true
      });
    }

    console.log("✅ News stored successfully");

  } catch (error) {
    console.error("❌ News fetch error:", error.message);
  }
}

// ✅ RUN ON START
fetchAndStoreNews();

// ✅ CRON
cron.schedule('*/30 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
