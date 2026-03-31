const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

let isRunning = false;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 60 * 60 * 1000;

// ================= LOGO MAPPING =================
const NEWS_LOGOS = {
  'bbc': 'https://www.bbc.co.uk/favicon.ico',
  'cnn': 'https://cdn.cnn.com/cnn/.e/img/3.0/global/misc/cnn-logo.png',
  'reuters': 'https://www.reuters.com/pf/resources/images/reuters/favicon.png',
  'espn': 'https://a.espncdn.com/favicon.ico',
  'ndtv': 'https://drop.ndtv.com/ndtv/images/ndtv_logo.png',
  'nyt': 'https://www.nytimes.com/favicon.ico',
  'techcrunch': 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
  'verge': 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395359/favicon-32x32.0.png',
  'guardian': 'https://assets.guim.co.uk/images/favicons/favicon-32x32.ico',
  'india today': 'https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png'
};

// ================= SAFE LOGO GETTER =================
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

// ================= UTIL FUNCTIONS =================
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFakeIds(count) {
  return Array.from({ length: count }, () =>
    `fake_${Math.random().toString(36).substring(2, 10)}`
  );
}

// ================= COMMENT SYSTEM FIX =================
const USERNAMES = [
  "Aarav", "Riya", "Kabir", "Ananya", "Rahul",
  "Sneha", "Vikram", "Neha", "Arjun", "Priya"
];

const COMMENT_TEMPLATES = [
  "Interesting update 👀",
  "This is huge 🔥",
  "Didn't expect this 😳",
  "Important news 📰",
  "Thanks for sharing",
  "Crazy development 😮",
  "This needs more attention",
  "Breaking news! 🚨",
  "Very informative",
  "What's your opinion?"
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

// ================= IMAGE VALIDATION =================
function isValidImage(url) {
  if (!url) return false;
  if (!url.startsWith('http')) return false;

  const invalidPatterns = ['removed', 'default', 'null'];

  return !invalidPatterns.some(p => url.toLowerCase().includes(p));
}

// ================= TITLE CLEANER =================
function cleanTitle(title) {
  if (!title || title === '[Removed]' || title.length < 15) {
    return null;
  }

  return title.replace(/ - .*$/, '').trim();
}

// ================= CATEGORIES =================
const CATEGORIES = [
  'general',
  'business',
  'technology',
  'sports',
  'entertainment',
  'health',
  'science'
];

// ================= MAIN FUNCTION =================
async function fetchAndStoreNews() {

  if (isRunning) return console.log('⏸️ Already running');

  const timePassed = Date.now() - lastFetchTime;
  if (timePassed < FETCH_COOLDOWN) {
    return console.log('⏳ Cooldown active');
  }

  isRunning = true;
  lastFetchTime = Date.now();

  try {
    console.log('🔄 Fetching news...');

    let allArticles = [];

    for (const category of CATEGORIES) {
      try {
        const res = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category,
            pageSize: 8,
            apiKey: process.env.NEWS_API_KEY
          }
        });

        if (res.data?.articles) {
          allArticles.push(...res.data.articles.map(a => ({ ...a, category })));
        }

        await new Promise(r => setTimeout(r, 400));

      } catch (err) {
        console.log(`⚠️ ${category} failed`);
      }
    }

    console.log(`📊 Total fetched: ${allArticles.length}`);

    // ================= FILTER =================
    let validArticles = allArticles.filter(a =>
      a.url &&
      a.source?.name &&
      cleanTitle(a.title) &&
      isValidImage(a.urlToImage)
    );

    console.log(`✅ Valid: ${validArticles.length}`);

    // ================= REMOVE DUPLICATES =================
    const seen = new Set();
    validArticles = validArticles.filter(a => {
      const key = a.url + cleanTitle(a.title);
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

        const tweetData = {
          text: cleanTitle(article.title),
          images: [{
            url: article.urlToImage,
            width: 1200,
            height: 630
          }],
          isNewsArticle: true,
          newsSource: sourceName,
          newsHandle: handle,
          newsLogo: getNewsLogo(sourceName),
          articleUrl: article.url,
          category: article.category,
          likes: generateFakeIds(random(100, 2000)),
          retweets: generateFakeIds(random(50, 500)),
          replies: generateComments(),
          verified: true,
          createdAt: new Date(article.publishedAt || Date.now())
        };

        await Tweet.create(tweetData);
        stored++;

      } catch (err) {
        console.log('⚠️ Store error:', err.message);
      }
    }

    console.log(`✅ Stored: ${stored}`);

  } catch (err) {
    console.log('❌ Error:', err.message);
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
    console.log('⚠️ Clean error');
  }
}

// ================= SCHEDULE =================
setTimeout(fetchAndStoreNews, 5000);

cron.schedule('0 */2 * * *', fetchAndStoreNews);
cron.schedule('0 3 * * *', cleanOldNews);

module.exports = fetchAndStoreNews;
