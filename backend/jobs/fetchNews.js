const cron = require('node-cron');
const Tweet = require('../models/Tweet');
const User = require('../models/User');
const NewsSource = require('../models/NewsSource');
const { newsApi } = require('../config/newsapi');

const sourceSeed = [
  { name: 'The New York Times', handle: 'nytimes', logo: 'https://logo.clearbit.com/nytimes.com', description: 'Breaking news and analysis from The New York Times', category: 'general', website: 'https://nytimes.com' },
  { name: 'BBC News', handle: 'bbc', logo: 'https://logo.clearbit.com/bbc.com', description: 'Breaking news and analysis from BBC News', category: 'general', website: 'https://bbc.com/news' },
  { name: 'NDTV', handle: 'ndtv', logo: 'https://logo.clearbit.com/ndtv.com', description: 'Breaking news and analysis from NDTV', category: 'general', website: 'https://ndtv.com' },
  { name: 'CNN', handle: 'cnn', logo: 'https://logo.clearbit.com/cnn.com', description: 'Breaking news and analysis from CNN', category: 'general', website: 'https://cnn.com' },
  { name: 'Reuters', handle: 'reuters', logo: 'https://logo.clearbit.com/reuters.com', description: 'Breaking news and analysis from Reuters', category: 'general', website: 'https://reuters.com' },
  { name: 'The Guardian', handle: 'theguardian', logo: 'https://logo.clearbit.com/theguardian.com', description: 'Breaking news and analysis from The Guardian', category: 'general', website: 'https://theguardian.com' }
];

const categories = ['general', 'sports', 'entertainment', 'business', 'technology', 'science', 'health'];

async function ensureSources() {
  for (const src of sourceSeed) {
    await NewsSource.updateOne({ handle: src.handle }, { $setOnInsert: src }, { upsert: true });
  }
}

async function ensureNewsUser() {
  let user = await User.findOne({ handle: 'news' });
  if (!user) {
    user = await User.create({
      name: 'News',
      email: 'news@chirp.local',
      password: 'placeholder-not-used',
      handle: 'news',
      verified: true,
      bio: 'Automated news feed'
    });
  }
  return user;
}

async function fetchCategory(category, newsUser) {
  const client = newsApi();
  const response = await client.v2.topHeadlines({
    language: 'en',
    pageSize: 10,
    category
  });
  const articles = response.articles || [];
  for (const article of articles) {
    const sourceName = (article.source && article.source.name) ? article.source.name : 'News';
    const handle = sourceName.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const source = await NewsSource.findOne({ $or: [{ name: sourceName }, { handle }] });
    await Tweet.updateOne(
      { articleUrl: article.url },
      {
        $setOnInsert: {
          text: article.title || '',
          author: newsUser._id,
          images: article.urlToImage ? [{ url: article.urlToImage }] : [],
          category,
          hashtags: [],
          mentions: [],
          isNewsArticle: true,
          newsSource: source ? source.handle : handle,
          articleUrl: article.url
        }
      },
      { upsert: true }
    );
  }
}

const scheduleNewsJob = async () => {
  if (!process.env.NEWS_API_KEY) {
    console.warn('NEWS_API_KEY missing; news refresh job disabled');
    return;
  }
  await ensureSources();
  const newsUser = await ensureNewsUser();
  await Promise.all(categories.map(category => fetchCategory(category, newsUser)));
  cron.schedule('*/30 * * * *', async () => {
    try {
      await ensureSources();
      const nu = await ensureNewsUser();
      await Promise.all(categories.map(category => fetchCategory(category, nu)));
      console.log('News refreshed');
    } catch (error) {
      console.error('News refresh failed:', error.message);
    }
  });
};

module.exports = scheduleNewsJob;
