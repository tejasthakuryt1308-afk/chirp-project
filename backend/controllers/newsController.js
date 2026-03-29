const Tweet = require('../models/Tweet');
const NewsSource = require('../models/NewsSource');
const { newsApi } = require('../config/newsapi');

const categoryMap = {
  general: 'general',
  sports: 'sports',
  entertainment: 'entertainment',
  business: 'business',
  technology: 'technology',
  science: 'science',
  health: 'health',
  world: 'general',
  conflict: 'general'
};

exports.getSources = async (req, res) => {
  const sources = await NewsSource.find().sort({ name: 1 });
  res.json(sources);
};

exports.getByCategory = async (req, res) => {
  const category = (req.params.category || 'general').toLowerCase();
  const tweets = await Tweet.find({ isNewsArticle: true, category }).sort({ createdAt: -1 }).limit(50).populate('author', 'name handle avatar verified');
  res.json(tweets);
};

exports.getBySource = async (req, res) => {
  const source = (req.params.source || '').toLowerCase();
  const tweets = await Tweet.find({ isNewsArticle: true, newsSource: source }).sort({ createdAt: -1 }).limit(50).populate('author', 'name handle avatar verified');
  res.json(tweets);
};

exports.refreshNews = async (req, res) => {
  try {
    if (!process.env.NEWS_API_KEY) return res.status(503).json({ message: 'NEWS_API_KEY missing' });
    const client = newsApi();
    const category = req.query.category || 'general';
    const apiCategory = categoryMap[category] || 'general';
    const response = await client.v2.topHeadlines({
      language: 'en',
      category: apiCategory,
      pageSize: 20
    });

    res.json(response.articles || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
