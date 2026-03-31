const cron = require('node-cron');
const axios = require('axios');
const mongoose = require('mongoose');
const Tweet = require('../models/Tweet');

let isRunning = false;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 60 * 60 * 1000; // 1 hour in milliseconds

// ✅ REAL LOGO URLs (Direct, no Clearbit issues)
const NEWS_LOGOS = {
  'bbc': 'https://www.bbc.co.uk/favicon.ico',
  'cnn': 'https://cdn.cnn.com/cnn/.e/img/3.0/global/misc/cnn-logo.png',
  'reuters': 'https://www.reuters.com/pf/resources/images/reuters/favicon.png',
  'espn': 'https://a.espncdn.com/favicon.ico',
  'ndtv': 'https://drop.ndtv.com/ndtv/images/ndtv_logo.png',
  'nyt': 'https://www.nytimes.com/vi-assets/static-assets/favicon-4bf96cb6a1093748bf5b3c429accb9b4.ico',
  'techcrunch': 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
  'verge': 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395359/favicon-32x32.0.png',
  'guardian': 'https://assets.guim.co.uk/images/favicons/favicon-32x32.ico',
  'washpost': 'https://www.washingtonpost.com/pb/resources/img/twp-favicon.ico',
  'times of india': 'https://timesofindia.indiatimes.com/photo.cms',
  'hindustan times': 'https://www.hindustantimes.com/favicon.ico',
  'indian express': 'https://indianexpress.com/wp-content/themes/indianexpress/images/indian-express-logo-n.svg',
  'zee': 'https://english.cdn.zeenews.com/static/images/zeenews_logo.png',
  'india today': 'https://akm-img-a-in.tosshub.com/sites/all/themes/itg/logo.png'
};

// ✅ Get proper logo with fallback
function getNewsLogo(sourceName) {
  if (!sourceName) return 'https://via.placeholder.com/100/0D8ABC/ffffff?text=News';
  
  const key = Object.keys(NEWS_LOGOS).find(k => 
    sourceName.toLowerCase().includes(k)
  );
  
  if (key) return NEWS_LOGOS[key];
  
  // Fallback to Clearbit
  try {
    const domain = sourceName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/the/g, '') + '.com';
    return `https://logo.clearbit.com/${domain}`;
  } catch {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(sourceName)}&background=1DA1F2&color=fff&size=128`;
  }
}

// ✅ Random engagement numbers
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFakeIds(count) {
  return Array.from({ length: count }, () => `fake_${Math.random().toString(36).substr(2, 9)}`);
}

// ✅ Generate realistic comments
function generateComments(articleTitle) {
  const templates = [
    "This is significant news 📰",
    "Important development",
    "Thanks for sharing this update",
    "Very informative article",
    "This changes the situation",
    "Great reporting 👍",
    "Everyone should read this",
    "Breaking news! 🚨",
    "Well written piece",
    "Interesting perspective",
    "This is concerning",
    "Finally some good news",
    "More updates needed",
    "Comprehensive coverage",
    "Must-read article"
  ];
  
  const count = random(2, 8);
  return Array.from({ length: count }, (_, i) => ({
    user: `user_${random(1000, 9999)}`,
    text: templates[random(0, templates.length - 1)],
    createdAt: new Date(Date.now() - random(0, 3600000)) // Random time in last hour
  }));
}

// ✅ CATEGORIES to fetch diverse content
const CATEGORIES = [
  'general',
  'business', 
  'technology',
  'sports',
  'entertainment',
  'health',
  'science'
];

// ✅ MAIN FETCH FUNCTION
async function fetchAndStoreNews() {
  // Prevent concurrent runs
  if (isRunning) {
    console.log('⏸️ Already fetching news...');
    return;
  }

  // Prevent too frequent calls (avoid 429)
  const timeSinceLastFetch = Date.now() - lastFetchTime;
  if (timeSinceLastFetch < FETCH_COOLDOWN) {
    console.log(`⏳ Cooldown active. Next fetch in ${Math.round((FETCH_COOLDOWN - timeSinceLastFetch) / 60000)} minutes`);
    return;
  }

  isRunning = true;
  lastFetchTime = Date.now();

  try {
    console.log('🔄 Fetching news from API...');

    const allArticles = [];
    
    // ✅ Fetch from MULTIPLE categories to get variety
    for (const category of CATEGORIES) {
      try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params: {
            country: 'in',
            category: category,
            pageSize: 10, // Small number per category to avoid 429
            apiKey: process.env.NEWS_API_KEY
          },
          timeout: 10000 // 10 second timeout
        });

        if (response.data?.articles) {
          allArticles.push(...response.data.articles.map(a => ({...a, category})));
        }

        // Small delay between requests to avoid rate limit
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (err) {
        if (err.response?.status === 429) {
          console.log('⚠️ Rate limit hit, stopping fetch');
          break; // Stop fetching more categories
        }
        console.log(`⚠️ Error fetching ${category}:`, err.message);
      }
    }

    console.log(`📊 Total articles fetched: ${allArticles.length}`);

    // ✅ FILTER & CLEAN articles
    let validArticles = allArticles.filter(article => 
      article.title &&
      article.url &&
      article.title !== '[Removed]' &&
      article.description &&
      article.description !== '[Removed]' &&
      article.urlToImage && // MUST have image
      article.source?.name &&
      article.title.length > 20 // Not too short
    );

    console.log(`✅ Valid articles: ${validArticles.length}`);

    // ✅ REMOVE DUPLICATES by URL
    const seenUrls = new Set();
    validArticles = validArticles.filter(article => {
      if (seenUrls.has(article.url)) return false;
      seenUrls.add(article.url);
      return true;
    });

    console.log(`🎯 Unique articles: ${validArticles.length}`);

    // ✅ STORE in database
    let stored = 0;
    for (const article of validArticles) {
      try {
        // Check if already exists
        const exists = await Tweet.findOne({ articleUrl: article.url });
        if (exists) continue;

        const sourceName = article.source.name;
        const handle = '@' + sourceName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 15); // Max 15 chars

        const logo = getNewsLogo(sourceName);

        // Generate realistic engagement
        const baseLikes = random(100, 5000);
        const likes = generateFakeIds(baseLikes);
        const retweets = generateFakeIds(Math.floor(baseLikes * 0.3));
        const comments = generateComments(article.title);

        await Tweet.create({
          text: article.title,
          images: [{ 
            url: article.urlToImage,
            width: 1200,
            height: 630
          }],
          isNewsArticle: true,
          newsSource: sourceName,
          newsHandle: handle,
          newsLogo: logo,
          articleUrl: article.url,
          category: article.category || 'general',
          likes,
          retweets,
          replies: comments,
          verified: true,
          createdAt: new Date(article.publishedAt || Date.now())
        });

        stored++;

      } catch (err) {
        console.log(`⚠️ Error storing article:`, err.message);
      }
    }

    console.log(`✅ Successfully stored ${stored} new articles`);

  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⚠️ News API rate limit reached. Will retry in 1 hour.');
    } else {
      console.log('❌ Error fetching news:', error.message);
    }
  } finally {
    isRunning = false;
  }
}

// ✅ Delete old news (keep only last 7 days)
async function cleanOldNews() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await Tweet.deleteMany({
      isNewsArticle: true,
      createdAt: { $lt: sevenDaysAgo }
    });
    console.log(`🧹 Cleaned ${result.deletedCount} old news articles`);
  } catch (err) {
    console.log('⚠️ Error cleaning old news:', err.message);
  }
}

// ✅ SCHEDULE JOBS
// Run on server start (but only if cooldown passed)
setTimeout(() => {
  fetchAndStoreNews();
}, 5000); // Wait 5 seconds after server starts

// Run every 2 hours (avoid 429 errors)
cron.schedule('0 */2 * * *', () => {
  console.log('⏰ Scheduled news fetch starting...');
  fetchAndStoreNews();
});

// Clean old news daily at 3 AM
cron.schedule('0 3 * * *', cleanOldNews);

module.exports = fetchAndStoreNews;
