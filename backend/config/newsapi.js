const NewsAPI = require('newsapi');

const newsApi = () => new NewsAPI(process.env.NEWS_API_KEY);

module.exports = { newsApi };
