const axios = require('axios');

const NEWS_API = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`;

exports.refreshNews = async (req, res) => {
  try {
    const { data } = await axios.get(NEWS_API);

    const articles = data.articles.map((a, i) => {
      const domain = new URL(a.url).hostname;

      return {
        _id: i + Date.now(),
        text: a.title,
        image: a.urlToImage,
        createdAt: new Date(),
        user: {
          name: a.source.name,
          handle: domain.replace('www.', ''),
          avatar: `https://logo.clearbit.com/${domain}`
        },
        likes: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 100),
        retweets: Math.floor(Math.random() * 200)
      };
    });

    res.json({ items: articles });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
};
