const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

const LOGO_MAP = {
  bbc: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/BBC_News_2022_%28Alt%29.svg',
  cnn: 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg',
  reuters: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Reuters_logo.svg',
  espn: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
  ndtv: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NDTV_logo.svg'
};

let isFetching = false; // 🚨 prevents multiple parallel calls

const PAGE_SIZE = 30; // safe per request

async function fetchAndStoreNews() {
  if (isFetching) {
    console.log("⏳ Skipping fetch (already running)");
    return;
  }

  isFetching = true;

  try {
    console.log("🔄 Fetching news...");

    const res = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'in',
        category: 'general',
        pageSize: PAGE_SIZE,
        apiKey: process.env.NEWS_API_KEY
      }
    });

    let articles = res.data?.articles || [];

    if (!articles.length) {
      console.log("⚠️ No articles from API, using fallback");

      articles = [
        {
          title: "Fallback News",
          url: "https://example.com",
          urlToImage: "https://picsum.photos/600/400",
          source: { name: "Fallback" }
        }
      ];
    }

    // 🚨 REMOVE DUPLICATES (by URL + title)
    const seen = new Set();

    const uniqueArticles = articles.filter(a => {
      const key = a.url || a.title;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`🧠 Unique articles: ${uniqueArticles.length}`);

    // LIMIT (50–80 tweets max)
    const limitedArticles = uniqueArticles.slice(0, 60);

    for (const article of limitedArticles) {
      if (!article.title) continue;

      const exists = await Tweet.findOne({ articleUrl: article.url });
      if (exists) continue;

      const sourceName = article.source?.name || "News";

      // LOGO LOGIC (FIXED)
      const matchedKey = Object.keys(LOGO_MAP).find(key =>
        sourceName.toLowerCase().includes(key)
      );

      const logo = matchedKey
        ? LOGO_MAP[matchedKey]
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(sourceName)}&background=random&color=fff&size=128`;

      const handle = '@' + sourceName
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

      await Tweet.create({
        text: article.title,
        images: article.urlToImage ? [{ url: article.urlToImage }] : [],
        isNewsArticle: true,
        newsSource: sourceName,
        newsHandle: handle,
        newsLogo: logo,
        articleUrl: article.url,
        category: 'general',

        likes: [],
        retweets: [],
        replies: [],

        verified: true
      });
    }

    console.log("✅ News stored");

  } catch (err) {
    console.error("❌ API error:", err.response?.status || err.message);
  } finally {
    isFetching = false;
  }
}

// 🚨 IMPORTANT: REMOVE THIS IF ON RENDER MULTIPLE INSTANCES
// fetchAndStoreNews();

// ⏰ SAFE CRON (ONCE PER HOUR)
cron.schedule('0 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
