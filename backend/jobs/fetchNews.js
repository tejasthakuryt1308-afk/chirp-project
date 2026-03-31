const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

// ✅ LOGO MAP (SAFE)
const LOGO_MAP = {
  'bbc': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/BBC_News_2022_%28Alt%29.svg',
  'cnn': 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg',
  'reuters': 'https://upload.wikimedia.org/wikipedia/commons/8/86/Reuters_logo.svg',
  'espn': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
  'ndtv': 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NDTV_logo.svg'
};

// ✅ FETCH MORE PER RUN
const PAGE_SIZE = 20; // NewsAPI limit safe range

const CATEGORIES = ['general'];

function getRandomComments(count) {
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

    // ✅ MULTIPLE PAGES (simulate 50+ posts)
    for (let page = 1; page <= 3; page++) {
      try {
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category: 'general',
            pageSize: PAGE_SIZE,
            page: page,
            apiKey: process.env.NEWS_API_KEY
          }
        });

        allArticles = allArticles.concat(res.data.articles || []);
      } catch (err) {
        console.log("⚠️ API failed, using fallback");
        break;
      }
    }

    // ✅ FALLBACK if API fails completely
    if (allArticles.length === 0) {
      allArticles = [
        {
          title: "Fallback News 1",
          url: "https://example.com/1",
          urlToImage: "https://picsum.photos/600/400?1",
          source: { name: "BBC" }
        },
        {
          title: "Fallback News 2",
          url: "https://example.com/2",
          urlToImage: "https://picsum.photos/600/400?2",
          source: { name: "CNN" }
        }
      ];
    }

    // ✅ REMOVE DUPLICATES (BIG FIX)
    const seenUrls = new Set();

    const uniqueArticles = allArticles.filter(article => {
      if (!article.url || seenUrls.has(article.url)) return false;
      seenUrls.add(article.url);
      return true;
    });

    console.log(`🧠 Total unique articles: ${uniqueArticles.length}`);

    // ✅ LIMIT TO 80 POSTS MAX
    const articlesToStore = uniqueArticles.slice(0, 80);

    for (const article of articlesToStore) {
      if (!article.title) continue;

      const exists = await Tweet.findOne({ articleUrl: article.url });
      if (exists) continue;

      const sourceName = article.source?.name || "News";

      // ✅ LOGO MATCH
      const matchedKey = Object.keys(LOGO_MAP).find(key =>
        sourceName.toLowerCase().includes(key)
      );

      const logo = matchedKey
        ? LOGO_MAP[matchedKey]
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(sourceName)}&background=random&color=fff&size=128`;

      const handle = '@' + sourceName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

      const likesCount = Math.floor(Math.random() * 500 + 20);
      const retweetsCount = Math.floor(likesCount * 0.3);
      const commentsCount = Math.floor(likesCount * 0.1);

      await Tweet.create({
        text: article.title,
        images: article.urlToImage ? [{ url: article.urlToImage }] : [],
        isNewsArticle: true,
        newsSource: sourceName,
        newsHandle: handle,
        newsLogo: logo,
        articleUrl: article.url,
        category: 'general',

        likes: Array.from({ length: likesCount }, () => new mongoose.Types.ObjectId()),
        retweets: Array.from({ length: retweetsCount }, () => new mongoose.Types.ObjectId()),
        replies: getRandomComments(commentsCount),

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

// ✅ CRON (30 MIN)
cron.schedule('*/30 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
