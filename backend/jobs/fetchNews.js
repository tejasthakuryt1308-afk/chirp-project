const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

// ================= LOGO MAP =================
const LOGO_MAP = {
  bbc: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/BBC_News_2022_%28Alt%29.svg',
  cnn: 'https://upload.wikimedia.org/wikipedia/commons/6/66/CNN_International_logo.svg',
  reuters: 'https://upload.wikimedia.org/wikipedia/commons/8/86/Reuters_logo.svg',
  espn: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg',
  ndtv: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/NDTV_logo.svg'
};

let isRunning = false; // prevents duplicate execution

// ================= HELPERS =================
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomIds(count) {
  return Array.from({ length: count }, () => new mongoose.Types.ObjectId());
}

function getSourceLogo(sourceName) {
  const key = Object.keys(LOGO_MAP).find(k =>
    sourceName.toLowerCase().includes(k)
  );

  return key
    ? LOGO_MAP[key]
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(sourceName)}&background=random&color=fff&size=128`;
}

// ================= MAIN FETCH =================
async function fetchAndStoreNews() {
  if (isRunning) {
    console.log("⏳ Fetch already running, skipping...");
    return;
  }

  isRunning = true;

  try {
    console.log("🔄 Fetching news...");

    const res = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'in',
        category: 'general',
        pageSize: 50, // increased safely
        apiKey: process.env.NEWS_API_KEY
      }
    });

    let articles = res.data?.articles || [];

    if (!articles.length) {
      console.log("⚠️ API empty → using fallback");

      articles = [
        {
          title: "Fallback News",
          url: "https://example.com",
          urlToImage: "https://picsum.photos/600/400",
          source: { name: "Fallback" }
        }
      ];
    }

    // ================= REMOVE DUPLICATES =================
    const seen = new Set();
    const uniqueArticles = [];

    for (let article of articles) {
      if (!article.url || seen.has(article.url)) continue;
      seen.add(article.url);
      uniqueArticles.push(article);
    }

    console.log("🧠 Unique articles:", uniqueArticles.length);

    // ================= LIMIT (50–80) =================
    const finalArticles = uniqueArticles.slice(0, 70);

    // ================= STORE =================
    for (let article of finalArticles) {
      if (!article.title) continue;

      const exists = await Tweet.findOne({ articleUrl: article.url });
      if (exists) continue;

      const sourceName = article.source?.name || "News";

      const logo = getSourceLogo(sourceName);

      const handle = '@' +
        sourceName
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');

      // keep structure similar to your old logic
      const likes = generateRandomIds(getRandomNumber(10, 300));
      const retweets = generateRandomIds(getRandomNumber(5, 100));
      const replies = Array.from({ length: getRandomNumber(0, 5) }, () => ({
        user: new mongoose.Types.ObjectId(),
        text: "Nice update 👍",
        createdAt: new Date()
      }));

      await Tweet.create({
        text: article.title,
        images: article.urlToImage ? [{ url: article.urlToImage }] : [],
        isNewsArticle: true,
        newsSource: sourceName,
        newsHandle: handle,
        newsLogo: logo,
        articleUrl: article.url,
        category: 'general',

        likes,
        retweets,
        replies,

        verified: true
      });
    }

    console.log("✅ News stored successfully");

  } catch (err) {
    console.error("❌ API error:", err.message);
  } finally {
    isRunning = false;
  }
}

// ================= RUN =================
fetchAndStoreNews();

// Run every 1 hour (SAFE)
cron.schedule('0 * * * *', fetchAndStoreNews);

module.exports = fetchAndStoreNews;
