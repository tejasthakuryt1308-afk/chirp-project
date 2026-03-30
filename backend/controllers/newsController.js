const axios = require('axios');

exports.refreshNews = async (req, res) => {
  try {
    const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`);

    const articles = data.articles.map((a, i) => ({
      _id: i.toString(),
      text: a.title,
      images: a.urlToImage ? [a.urlToImage] : [],
      createdAt: new Date(),
      isNewsArticle: true,
      articleUrl: a.url,
    author: {
             name: a.source.name,
             handle: a.source.name.toLowerCase().replace(/\s/g, ''),
             avatar: `https://logo.clearbit.com/${a.url?.split('/')[2] || 'bbc.com'}`
    }
    }));

    res.json(articles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};

exports.getSources = (req, res) => {
  res.json([
    { name: 'BBC News', handle: 'bbc' },
    { name: 'Reuters', handle: 'reuters' }
  ]);
};

exports.getByCategory = async (req, res) => {
  const category = req.params.category;

  try {
    const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`);

    res.json(data.articles);
  } catch (err) {
    res.status(500).json({ message: 'Category fetch failed' });
  }
};

exports.getBySource = async (req, res) => {
  const source = req.params.source;

  try {
    const { data } = await axios.get(`https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${process.env.NEWS_API_KEY}`);

    res.json(data.articles);
  } catch (err) {
    res.status(500).json({ message: 'Source fetch failed' });
  }
};
