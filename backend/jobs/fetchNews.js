const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

let isRunning = false;

// ✅ 55 MINUTE BUFFERED COOLDOWN
const FETCH_COOLDOWN = 55 * 60 * 1000; 

// ================= LOGOS =================
const NEWS_LOGOS = {
  'bbc': 'https://www.bbc.co.uk/favicon.ico',
  'cnn': 'https://cdn.cnn.com/cnn/.e/img/3.0/global/misc/cnn-logo.png',
  'reuters': 'https://www.reuters.com/pf/resources/images/reuters/favicon.png',
  'espn': 'https://a.espncdn.com/favicon.ico',
  'ndtv': 'https://drop.ndtv.com/ndtv/images/ndtv_logo.png',
  'nyt': 'https://www.nytimes.com/favicon.ico',
  'techcrunch': 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
  'guardian': 'https://assets.guim.co.uk/images/favicons/favicon-32x32.ico',
  'india today': 'https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png'
};

function getNewsLogo(sourceName) {
  if (!sourceName) return 'https://ui-avatars.com/api/?name=News';

  const key = Object.keys(NEWS_LOGOS).find(k =>
    sourceName.toLowerCase().includes(k)
  );

  if (key) return NEWS_LOGOS[key];

  try {
    const domain = sourceName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z]/g, '') + '.com';

    return `https://logo.clearbit.com/${domain}`;
  } catch {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sourceName)}`;
  }
}

// ================= UTIL =================
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFakeIds(count) {
  return Array.from({ length: count }, () =>
    `fake_${Math.random().toString(36).substring(2, 10)}`
  );
}

// ================= COMMENTS =================
const USERNAMES = [
  "Aarav", "Riya", "Kabir", "Ananya",
  "Rahul", "Sneha", "Vikram", "Neha"
];

const COMMENT_TEMPLATES = [
  "Interesting update 👀",
  "This is huge 🔥",
  "Didn't expect this 😳",
  "Important news 📰",
  "Crazy development 😮",
  "Breaking news! 🚨",
  "Very informative",
  "What do you think?"
];

function generateComments() {
  const count = random(2, 5);
  const used = new Set();

  return Array.from({ length: count }, () => {
    let name;
    do {
      name = USERNAMES[random(0, USERNAMES.length - 1)];
    } while (used.has(name));

    used.add(name);

    return {
      user: name,
      avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
      text: COMMENT_TEMPLATES[random(0, COMMENT_TEMPLATES.length - 1)],
      createdAt: new Date(Date.now() - random(0, 3600000))
    };
  });
}

// ================= VALIDATION =================
function isValidImage(url) {
  if (!url || !url.startsWith('http')) return false;

  const bad = ['removed', 'default', 'null'];
  return !bad.some(p => url.toLowerCase().includes(p));
}

function cleanTitle(title) {
  if (!title || title === '[Removed]' || title.length < 15) {
    return null;
  }
  return title.replace(/ - .*$/, '').trim();
}

// ================= MAIN FUNCTION =================
async function fetchAndStoreNews() {

  if (isRunning) {
    console.log('⏸️ Already running');
    return;
  }

  isRunning = true;

  try {
    console.log('🔄 Fetching news...');
    
    const latestNews = await Tweet.findOne({ isNewsArticle: true }).sort({ createdAt: -1 });
    if (latestNews) {
        const timePassed = Date.now() - new Date(latestNews.createdAt).getTime();
        if (timePassed < FETCH_COOLDOWN) {
            console.log('⏳ Cooldown active: Fetched recently enough.');
            isRunning = false;
            return;
        }
    }

    // ✅ SWITCHED TO GNEWS API
    const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
      params: {
        category: 'general',
        country: 'in',
        max: 25,
        apikey: process.env.NEWS_API_KEY // GNews uses 'apikey' all lowercase
      },
      timeout: 10000
    });

    let articles = response.data?.articles || [];

    console.log(`📊 Total fetched: ${articles.length}`);

    // ================= FILTER =================
    let validArticles = articles.filter(a =>
      a.url &&
      a.source?.name &&
      cleanTitle(a.title) &&
      isValidImage(a.image) // GNews returns the image as 'image', not 'urlToImage'
    );

    console.log(`✅ Valid: ${validArticles.length}`);

    // ================= REMOVE DUPLICATES =================
    const seen = new Set();
    validArticles = validArticles.filter(a => {
      const key = a.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`🎯 Unique: ${validArticles.length}`);

    // ================= STORE =================
    let stored = 0;

    for (const article of validArticles) {
      try {
        const exists = await Tweet.findOne({ articleUrl: article.url });
        if (exists) continue;

        const sourceName = article.source.name;

        const handle = '@' + sourceName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 12);

        await Tweet.create({
          text: cleanTitle(article.title),
          images: [{
            url: article.image, // Updated for GNews
            width: 1200,
            height: 630
          }],
          isNewsArticle: true,
          newsSource: sourceName,
          newsHandle: handle,
          newsLogo: getNewsLogo(sourceName),
          articleUrl: article.url,
          likes: generateFakeIds(random(100, 2000)),
          retweets: generateFakeIds(random(50, 500)),
          replies: generateComments(),
          verified: true,
          createdAt: new Date() 
        });

        stored++;

      } catch (err) {
        console.log('⚠️ Store error:', err.message);
      }
    }

    console.log(`✅ Stored: ${stored}`);

  } catch (err) {
    console.log('❌ API ERROR:', err.response?.data || err.message);
  } finally {
    isRunning = false;
  }
}

// ================= CLEAN OLD =================
async function cleanOldNews() {
  try {
    const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const res = await Tweet.deleteMany({
      isNewsArticle: true,
      createdAt: { $lt: date }
    });

    console.log(`🧹 Cleaned: ${res.deletedCount}`);

  } catch (err) {
    console.log('⚠️ Clean error:', err.message);
  }
}

// ================= SAFE START =================

setTimeout(() => {
  console.log("🚀 Initial safe fetch triggered");
  fetchAndStoreNews();
}, 15000);

// ✅ CRON (every 1 hour ONLY)
cron.schedule('0 * * * *', fetchAndStoreNews);

// ✅ CLEAN DAILY
cron.schedule('0 3 * * *', cleanOldNews);

module.exports = fetchAndStoreNews;
