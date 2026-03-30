const Tweet = require('../models/Tweet');
const User = require('../models/User');
const { extractHashtags, extractMentions } = require('../utils/text');

const hydrateTweet = async (tweet, currentUserId = null) => {
  const author = await User.findById(tweet.author).select('name handle avatar verified');
  return {
    ...tweet.toObject(),
    author,
    isLiked: currentUserId ? tweet.likes.some(id => id.toString() === currentUserId.toString()) : false,
    isRetweeted: currentUserId ? tweet.retweets.some(id => id.toString() === currentUserId.toString()) : false,
    likesCount: tweet.likes.length,
    retweetsCount: tweet.retweets.length,
    repliesCount: tweet.replies.length
  };
};

exports.getTweets = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, parseInt(req.query.limit || '20', 10));
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.source) filter.newsSource = req.query.source;
    if (req.query.replyTo) filter.replyTo = req.query.replyTo;

    const query = Tweet.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name handle avatar verified')
      .lean();

    const tweets = await query;
    const items = tweets.map(t => ({
      ...t,
      isLiked: req.user ? t.likes.some(id => id.toString() === req.user._id.toString()) : false,
      isRetweeted: req.user ? t.retweets.some(id => id.toString() === req.user._id.toString()) : false,
      likesCount: t.likes.length,
      retweetsCount: t.retweets.length,
      repliesCount: t.replies.length
    }));

    const total = await Tweet.countDocuments(filter);
    res.json({ items, page, limit, total, hasMore: page * limit < total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id).populate('author', 'name handle avatar verified');
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });
    res.json({
      ...tweet.toObject(),
      isLiked: req.user ? tweet.likes.some(id => id.toString() === req.user._id.toString()) : false,
      isRetweeted: req.user ? tweet.retweets.some(id => id.toString() === req.user._id.toString()) : false,
      likesCount: tweet.likes.length,
      retweetsCount: tweet.retweets.length,
      repliesCount: tweet.replies.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTweet = async (req, res) => {
  try {
    const { text = '', images = [], category = 'general', replyTo = null, articleUrl = '', isNewsArticle = false, newsSource = '' } = req.body;
    if (!text.trim() && (!images || !images.length)) {
      return res.status(400).json({ message: 'Tweet cannot be empty' });
    }
    if (text.length > 280) return res.status(400).json({ message: 'Tweet exceeds 280 characters' });

    const tweet = await Tweet.create({
      text,
      author: req.user._id,
      images,
      category,
      replyTo,
      isNewsArticle,
      newsSource,
      articleUrl,
      hashtags: extractHashtags(text),
      mentions: extractMentions(text)
    });

    if (replyTo) {
      await Tweet.findByIdAndUpdate(replyTo, { $push: { replies: tweet._id } });
    }

    const populated = await Tweet.findById(tweet._id).populate('author', 'name handle avatar verified');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    if (!tweet) return res.status(404).json({ message: 'Tweet not found' });
    if (tweet.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await Tweet.deleteOne({ _id: tweet._id });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user._id } }, { new: true });
    res.json({ likesCount: tweet.likes.length, liked: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unlikeTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } }, { new: true });
    res.json({ likesCount: tweet.likes.length, liked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.retweetTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndUpdate(req.params.id, { $addToSet: { retweets: req.user._id } }, { new: true });
    res.json({ retweetsCount: tweet.retweets.length, retweeted: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unretweetTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findByIdAndUpdate(req.params.id, { $pull: { retweets: req.user._id } }, { new: true });
    res.json({ retweetsCount: tweet.retweets.length, retweeted: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyTweet = async (req, res) => {
  try {
    req.body.replyTo = req.params.id;
    const tweet = await Tweet.create({
      text: req.body.text || '',
      images: req.body.images || [],
      author: req.user._id,
      replyTo: req.params.id,
      hashtags: extractHashtags(req.body.text || ''),
      mentions: extractMentions(req.body.text || '')
    });
    await Tweet.findByIdAndUpdate(req.params.id, { $push: { replies: tweet._id } });
    const populated = await Tweet.findById(tweet._id).populate('author', 'name handle avatar verified');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchTweets = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const category = req.query.category;
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const filter = { $or: [{ text: regex }, { hashtags: q.replace('#', '').toLowerCase() }, { mentions: q.replace('@', '').toLowerCase() }] };
    if (category) filter.category = category;

    const tweets = await Tweet.find(filter)
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('author', 'name handle avatar verified');

    res.json(tweets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchTweetsInternal = async (q) => {
  if (!q) return [];

  const tweets = await Tweet.find({
    text: { $regex: q, $options: 'i' }
  }).limit(20);

  return tweets;
};
