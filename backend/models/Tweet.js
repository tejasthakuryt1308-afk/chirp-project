const mongoose = require('mongoose');

const TweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 280
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    url: String,
    width: Number,
    height: Number
  }],
  category: {
    type: String,
    enum: ['general', 'sports', 'technology', 'business', 'entertainment', 'health', 'science'],
    default: 'general'
  },
  likes: [{
    type: String // Can be user ID or 'fake-user-xxx' for news
  }],
  retweets: [{
    type: String
  }],
  replies: [{
    user: String,
    text: String,
    createdAt: Date
  }],
  isNewsArticle: {
    type: Boolean,
    default: false
  },
  newsSource: String,
  newsHandle: String,
  newsLogo: String,
  articleUrl: String,
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Tweet', TweetSchema);
